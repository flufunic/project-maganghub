<?php

namespace App\Http\Controllers;

use App\Models\PreventifChecklist;
use App\Models\PreventifMesin;
use App\Models\ScheduleItemKode;
use App\Models\SchedulePreventifPlan;
use App\Models\ScheduleZona;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Menu Schedule Preventif.
 * Hanya MEMBACA preventif_mesins & preventif_checklists (menu lama),
 * dan hanya MENULIS ke tabel schedule_* miliknya sendiri.
 * Jadwal (plan/act) tidak berhubungan dengan zona.
 *
 * Cara hitung per week untuk satu kode yang diinput:
 *   Plan = jumlah tanggal plan item itu di week tsb (sesuai jadwal di menu Preventif Mesin).
 *          Bila item itu tidak punya jadwal di week tsb, Plan = 0.
 *   Act  = jumlah tanggal item itu yang dicentang (checklist ✓) di week tsb.
 */
class SchedulePreventifController extends Controller
{
    /** Week dalam bulan: W1 = tgl 1-7, W2 = 8-14, W3 = 15-21, W4 = 22-akhir bulan. */
    public static function mingguKe(Carbon $tanggal): int
    {
        return min(4, intdiv($tanggal->day - 1, 7) + 1);
    }

    /** Contoh: "2 Minggu", "1 Tahun". */
    private static function frekuensi(PreventifMesin $p): string
    {
        if (empty($p->periode_nilai) || empty($p->periode_satuan)) {
            return '-';
        }

        $nilai = rtrim(rtrim(number_format((float) $p->periode_nilai, 2, '.', ''), '0'), '.');

        return $nilai . ' ' . ucfirst($p->periode_satuan);
    }

    public function index(Request $request): Response
    {
        $tahun = (int) $request->input('tahun', now()->year);

        // item baru dari menu Preventif Mesin otomatis dapat kode
        ScheduleItemKode::sinkron();

        $kodeMap = ScheduleItemKode::pluck('kode', 'preventif_mesin_id');

        // ---------- ITEM (dibaca dari menu Preventif Mesin) ----------
        $items = PreventifMesin::where('is_hidden', false)
            ->get()
            ->filter(fn ($p) => isset($kodeMap[$p->no]))
            ->map(fn ($p) => [
                'no' => $p->no,
                'kode' => $kodeMap[$p->no],
                'divisi' => $p->divisi,
                'no_item' => $p->no_item,
                'item_preventif' => $p->item_preventif,
                'frekuensi' => self::frekuensi($p),
            ])
            ->sortBy(fn ($i) => sprintf('%02d%s', strlen($i['kode']), $i['kode']))
            ->values();

        // ---------- ZONA (tabel sendiri) ----------
        $zonas = ScheduleZona::orderBy('no')->get();

        // ---------- KODE YANG DIINPUT DI TIAP WEEK ----------
        $rows = SchedulePreventifPlan::query()
            ->where('tahun', $tahun)
            ->whereHas('item', fn ($q) => $q->where('is_hidden', false))
            ->get();

        $itemIds = $rows->pluck('preventif_mesin_id')->unique();
        $awalTahun = Carbon::create($tahun, 1, 1)->startOfDay();
        $akhirTahun = Carbon::create($tahun, 12, 31)->endOfDay();

        // ---------- JUMLAH PLAN per item per week (dari jadwal menu Preventif Mesin) ----------
        // key "itemNo-bulan-minggu" => jumlah tanggal plan
        $planCount = [];

        PreventifMesin::whereIn('no', $itemIds)->get()->each(function ($p) use (&$planCount, $awalTahun, $akhirTahun) {
            foreach ($this->tanggalPlanRentang($p, $awalTahun, $akhirTahun) as $tgl) {
                $c = Carbon::parse($tgl);
                $key = "{$p->no}-{$c->month}-" . self::mingguKe($c);
                $planCount[$key] = ($planCount[$key] ?? 0) + 1;
            }
        });

        // ---------- JUMLAH ACT per item per week (checklist dicentang) ----------
        $actCount = [];

        PreventifChecklist::query()
            ->whereIn('preventif_mesin_id', $itemIds)
            ->where('status', true)
            ->whereBetween('tanggal', [$awalTahun->toDateString(), $akhirTahun->toDateString()])
            ->get(['preventif_mesin_id', 'tanggal'])
            ->each(function ($c) use (&$actCount) {
                $tgl = Carbon::parse($c->tanggal);
                $key = "{$c->preventif_mesin_id}-{$tgl->month}-" . self::mingguKe($tgl);
                $actCount[$key] = ($actCount[$key] ?? 0) + 1;
            });

        // ---------- SUSUN: "bulan-minggu" => [{kode, n}], dan TOTAL PER WEEK ----------
        $plan = $act = $totals = [];

        foreach ($rows as $r) {
            $kode = $kodeMap[$r->preventif_mesin_id] ?? null;

            if (! $kode) {
                continue;
            }

            $wk = "{$r->bulan}-{$r->minggu}";
            $key = "{$r->preventif_mesin_id}-{$wk}";

            $nPlan = $planCount[$key] ?? 0;
            $nAct = $actCount[$key] ?? 0;

            $plan[$wk][] = ['kode' => $kode, 'n' => $nPlan];
            $totals[$wk]['plan'] = ($totals[$wk]['plan'] ?? 0) + $nPlan;

            if ($nAct > 0) {
                $act[$wk][] = ['kode' => $kode, 'n' => $nAct];
                $totals[$wk]['act'] = ($totals[$wk]['act'] ?? 0) + $nAct;
            }
        }

        $urut = function (array $grup) {
            foreach ($grup as &$list) {
                usort($list, fn ($a, $b) => [strlen($a['kode']), $a['kode']] <=> [strlen($b['kode']), $b['kode']]);
            }

            return $grup;
        };

        return Inertia::render('SchedulePreventif/Index', [
            'tahun' => $tahun,
            'items' => $items,
            'zonas' => $zonas,
            'plan' => (object) $urut($plan),
            'act' => (object) $urut($act),
            'totals' => (object) $totals,
            'flash' => ['success' => session('success')],
        ]);
    }

    /** Simpan isi satu sel PLAN (satu week). Kosong = hapus. */
    public function simpanCell(Request $request)
    {
        // rapikan dulu: huruf besar, tanpa spasi, tanpa duplikat
        $request->merge([
            'kodes' => collect($request->input('kodes', []))
                ->map(fn ($k) => strtoupper(trim((string) $k)))
                ->filter()->unique()->values()->all(),
        ]);

        $data = $request->validate([
            'tahun' => ['required', 'integer', 'between:2000,2100'],
            'bulan' => ['required', 'integer', 'between:1,12'],
            'minggu' => ['required', 'integer', 'between:1,4'],
            'kodes' => ['nullable', 'array'],
            'kodes.*' => ['string', 'max:10'],
        ]);

        $kodes = $data['kodes'] ?? [];

        // kode harus milik item yang masih tampil di menu Preventif Mesin
        $ids = ScheduleItemKode::whereIn('kode', $kodes)
            ->whereIn('preventif_mesin_id', PreventifMesin::where('is_hidden', false)->pluck('no'))
            ->pluck('preventif_mesin_id', 'kode');

        $tidakAda = collect($kodes)->reject(fn ($k) => isset($ids[$k]));

        if ($tidakAda->isNotEmpty()) {
            throw ValidationException::withMessages([
                'kodes' => 'Kode ' . $tidakAda->implode(', ') . ' tidak ditemukan di daftar item.',
            ]);
        }

        DB::transaction(function () use ($data, $ids) {
            $kunci = [
                'tahun' => $data['tahun'],
                'bulan' => $data['bulan'],
                'minggu' => $data['minggu'],
            ];

            SchedulePreventifPlan::where($kunci)->delete();

            foreach ($ids->values() as $itemId) {
                SchedulePreventifPlan::create($kunci + ['preventif_mesin_id' => $itemId]);
            }
        });

        return back()->with(
            'success',
            empty($kodes) ? 'Isi jadwal dikosongkan.' : 'Jadwal berhasil disimpan.'
        );
    }

    // =====================================================
    // JADWAL PLAN MENU PREVENTIF MESIN (salinan aturan yang sama, hanya dibaca)
    // =====================================================

    /**
     * Semua tanggal plan satu item dalam rentang tertentu.
     * Aturannya sama persis dengan PreventifMesinController::generateTanggalPlan,
     * hanya dibuat untuk rentang (satu tahun sekaligus) supaya lebih cepat.
     */
    private function tanggalPlanRentang(PreventifMesin $p, Carbon $mulai, Carbon $akhir): array
    {
        if (empty($p->tanggal_plan_awal)) {
            return [];
        }

        $tanggalAwal = Carbon::parse($p->tanggal_plan_awal);
        $jumlahDilakukan = max(1, (int) ($p->jumlah_dilakukan ?? 1));
        $hasil = [];

        $tambah = function (Carbon $dari) use (&$hasil, $jumlahDilakukan, $mulai, $akhir) {
            foreach ($this->generateHariKerja($dari, $jumlahDilakukan) as $tgl) {
                if ($tgl->gte($mulai) && $tgl->lte($akhir)) {
                    $hasil[] = $tgl->format('Y-m-d');
                }
            }
        };

        // Tanpa periode: jadwal sekali saja (hari kerja berurutan)
        if (empty($p->periode_nilai) || empty($p->periode_satuan)) {
            $tambah($tanggalAwal);

            return array_values(array_unique($hasil));
        }

        $tanggal = $tanggalAwal->copy();

        while ($tanggal->lte($akhir)) {
            $tambah($tanggal);

            $berikutnya = $this->tambahPeriode($tanggal, $p->periode_nilai, $p->periode_satuan);

            // Pengaman supaya while tidak infinite loop
            if ($berikutnya->lte($tanggal)) {
                break;
            }

            $tanggal = $berikutnya;
        }

        $hasil = array_values(array_unique($hasil));
        sort($hasil);

        return $hasil;
    }

    private function tambahPeriode(Carbon $tanggal, $nilai, ?string $satuan): Carbon
    {
        $nilai = (float) $nilai;

        return match ($satuan) {
            'hari' => $tanggal->copy()->addDays($nilai),
            'minggu' => $tanggal->copy()->addWeeks($nilai),
            'bulan' => $tanggal->copy()->addMonths($nilai),
            'tahun' => $tanggal->copy()->addYears($nilai),
            default => $tanggal->copy(),
        };
    }

    /** N hari kerja (Senin-Jumat) berurutan mulai dari tanggal tertentu. */
    private function generateHariKerja(Carbon $mulai, int $jumlah): array
    {
        $hasil = [];
        $tanggal = $mulai->copy();

        while (count($hasil) < $jumlah) {
            if ($tanggal->isWeekday()) {
                $hasil[] = $tanggal->copy();
            }

            $tanggal->addDay();
        }

        return $hasil;
    }
}
