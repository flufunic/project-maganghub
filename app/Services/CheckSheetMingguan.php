<?php

namespace App\Services;

use App\Models\CheckSheet;
use App\Models\CheckSheetAbnormality;
use App\Models\CheckSheetChecklist;
use App\Models\Line;
use Carbon\Carbon;

/**
 * Menyusun rekap check sheet untuk 1 minggu (Senin - Minggu).
 * Dipakai halaman detail pimpinan. Bisa difilter per divisi.
 */
class CheckSheetMingguan
{
    public const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    // Senin-Jumat = 5 hari kerja
    public const JUMLAH_HARI_KERJA = 5;

    public static function senin(Carbon|string $tanggal): Carbon
    {
        return Carbon::parse($tanggal)->startOfWeek(Carbon::MONDAY)->startOfDay();
    }

    public static function label(Carbon $mulai): string
    {
        $akhir = $mulai->copy()->addDays(6);

        return 'Minggu ' . $mulai->isoWeek
            . ' · ' . $mulai->translatedFormat('d M')
            . ' – ' . $akhir->translatedFormat('d M Y');
    }

    /**
     * Daftar divisi yang punya check sheet: [divisi_id => nama_divisi]
     */
    public static function divisiList(): array
    {
        return CheckSheet::with('divisi')
            ->whereNotNull('divisi_id')
            ->get()
            ->pluck('divisi')
            ->filter()
            ->unique('id')
            ->sortBy('id')
            ->mapWithKeys(fn ($d) => [$d->id => $d->nama_divisi])
            ->all();
    }

    /**
     * @param Carbon   $mulai    tanggal di minggu yang dimaksud (otomatis dijadikan Senin)
     * @param int|null $divisiId kalau diisi, hanya divisi itu yang direkap
     */
    public static function rekap(Carbon $mulai, ?int $divisiId = null): array
    {
        $mulai = self::senin($mulai);
        $akhir = $mulai->copy()->addDays(6);

        // 7 tanggal dalam minggu ini
        $hari = [];
        for ($i = 0; $i < 7; $i++) {
            $tgl = $mulai->copy()->addDays($i);

            $hari[] = [
                'tanggal' => $tgl->format('Y-m-d'),
                'nama'    => self::NAMA_HARI[$i],
                'tgl'     => $tgl->day,
            ];
        }

        // Line untuk check sheet divisi (bukan per mesin), contoh Headrest
        $lineDivisi = Line::where('per_mesin', false)
            ->orderBy('id')
            ->get()
            ->groupBy('divisi_id');

        $sheets = CheckSheet::with([
            'divisi',
            'line',
            'items' => fn ($q) => $q->orderBy('shift')->orderBy('no')->orderBy('id'),
        ])
            ->when($divisiId, fn ($q) => $q->where('divisi_id', $divisiId))
            ->orderBy('divisi_id')
            ->orderBy('id')
            ->get();

        // Semua checklist minggu ini, diindeks: item -> "line|tanggal"
        $itemIds = $sheets->pluck('items')->flatten()->pluck('id');

        $map = [];

        CheckSheetChecklist::whereIn('check_sheet_item_id', $itemIds)
            ->whereBetween('tanggal', [$mulai->toDateString(), $akhir->toDateString()])
            ->get()
            ->each(function ($c) use (&$map) {
                $key = ($c->line_id ?? 0) . '|' . $c->tanggal->format('Y-m-d');
                $map[$c->check_sheet_item_id][$key] = $c;
            });

        // Hari yang ditampilkan & dihitung sebagai target:
        // Senin-Jumat selalu ada. Sabtu/Minggu hanya ikut kalau memang ada
        // centang pada hari itu (misalnya ada lembur / shift tambahan).
        $adaCentang = [];

        foreach ($map as $perItem) {
            foreach ($perItem as $key => $c) {
                if ($c->status) {
                    $adaCentang[explode('|', $key)[1]] = true;
                }
            }
        }

        $hari = array_values(array_filter(
            $hari,
            fn ($h, $i) => $i < self::JUMLAH_HARI_KERJA || isset($adaCentang[$h['tanggal']]),
            ARRAY_FILTER_USE_BOTH
        ));

        // ---------- SUSUN PER DIVISI ----------
        $divisis = [];
        $totalTerisi = 0;
        $totalTarget = 0;

        foreach ($sheets as $sheet) {
            $mode = $sheet->pakai_actual
                ? 'actual'
                : ($sheet->pakai_plan_act ? 'plan_act' : 'biasa');

            $lines = $sheet->line_id
                ? collect([$sheet->line])->filter()
                : ($lineDivisi[$sheet->divisi_id] ?? collect());

            if ($lines->isEmpty()) {
                $lines = collect([null]);
            }

            foreach ($lines as $line) {
                $lineId = $line?->id ?? 0;

                $baris = [];
                $terisi = 0;

                foreach ($sheet->items as $item) {
                    $sel = [];

                    foreach ($hari as $h) {
                        $c = $map[$item->id][$lineId . '|' . $h['tanggal']] ?? null;

                        if (! $c) {
                            $sel[] = null;
                            continue;
                        }

                        if ($c->status) {
                            $terisi++;
                        }

                        $sel[] = [
                            'status'  => (bool) $c->status,
                            'plan'    => (bool) $c->plan,
                            'actual'  => $c->actual !== null ? (float) $c->actual : null,
                            'catatan' => $c->catatan,
                        ];
                    }

                    $baris[] = [
                        'id'               => $item->id,
                        'no'               => $item->no,
                        'shift'            => $item->shift,
                        'inspection_point' => $item->inspection_point,
                        'sel'              => $sel,
                    ];
                }

                $target = count($baris) * count($hari);

                $totalTerisi += $terisi;
                $totalTarget += $target;

                $divisiNama = $sheet->divisi?->nama_divisi ?? '-';

                $divisis[$divisiNama]['nama'] = $divisiNama;
                $divisis[$divisiNama]['sheets'][] = [
                    'key'           => $sheet->id . '-' . $lineId,
                    'nama'          => $sheet->nama_checksheet,
                    'nomor_dokumen' => $sheet->nomor_dokumen,
                    'line'          => $line?->nama_line,
                    'mode'          => $mode,
                    'terisi'        => $terisi,
                    'target'        => $target,
                    'persen'        => $target > 0 ? round($terisi / $target * 100, 1) : null,
                    'items'         => $baris,
                ];
            }
        }

        // Ringkasan per divisi
        foreach ($divisis as $nama => $d) {
            $terisi = collect($d['sheets'])->sum('terisi');
            $target = collect($d['sheets'])->sum('target');

            $divisis[$nama]['terisi'] = $terisi;
            $divisis[$nama]['target'] = $target;
            $divisis[$nama]['persen'] = $target > 0 ? round($terisi / $target * 100, 1) : null;
        }

        // ---------- ABNORMALITY MINGGU INI ----------
        $abnormalities = CheckSheetAbnormality::with(['checkSheet.divisi', 'line', 'preventifMesins'])
            ->when($divisiId, fn ($q) => $q->whereHas(
                'checkSheet',
                fn ($c) => $c->where('divisi_id', $divisiId)
            ))
            ->whereBetween('tanggal', [$mulai->toDateString(), $akhir->toDateString()])
            ->orderBy('tanggal')
            ->orderBy('id')
            ->get()
            ->map(function ($a) {
                $status = strtolower(trim((string) $a->status));

                return [
                    'id'             => $a->id,
                    'tanggal_format' => $a->tanggal?->translatedFormat('d F Y'),
                    'divisi'         => $a->checkSheet?->divisi?->nama_divisi,
                    'check_sheet'    => $a->checkSheet?->nama_checksheet,
                    'line'           => $a->line?->nama_line,
                    'abnormality'    => $a->abnormality,
                    'countermeasure' => $a->countermeasure,
                    'status'         => $a->status,
                    'pic'            => $a->pic,
                    'selesai'        => in_array($status, CheckSheetAbnormality::STATUS_SELESAI, true),
                    'preventif'      => $a->preventifMesins
                        ->map(fn ($p) => "{$p->divisi} No. {$p->no_item}: {$p->item_preventif}")
                        ->values()
                        ->all(),
                ];
            })
            ->values();

        return [
            'hari'          => $hari,
            'divisis'       => array_values($divisis),
            'abnormalities' => $abnormalities,
            'ringkasan'     => [
                'terisi'              => $totalTerisi,
                'target'              => $totalTarget,
                'persen'              => $totalTarget > 0 ? round($totalTerisi / $totalTarget * 100, 1) : null,
                'abnormality'         => $abnormalities->count(),
                'abnormality_terbuka' => $abnormalities->where('selesai', false)->count(),
            ],
        ];
    }
}