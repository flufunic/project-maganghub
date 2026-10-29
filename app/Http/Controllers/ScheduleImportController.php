<?php

namespace App\Http\Controllers;

use App\Models\PreventifMesin;
use App\Models\ScheduleBaris;
use App\Models\ScheduleItemKode;
use App\Models\SchedulePreventifPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

/**
 * Impor jadwal PLAN dari Excel ke menu Schedule Preventif.
 *
 * Alur dua langkah:
 *   1. preview() : baca Excel, kirim balik daftar line, kode Excel yang dipakai, dan isi selnya (JSON).
 *   2. import()  : terima isi sel + pemetaan "kode Excel -> kode web" dari layar, lalu simpan.
 *
 * Hanya baris "Plan" yang dibaca. Baris "Aktual" diabaikan (Act dihitung dari checklist).
 * Hanya MENULIS ke schedule_baris dan schedule_preventif_plans.
 */
class ScheduleImportController extends Controller
{
    private const SHEET = 'PREVENTIFE REV';

    private const BARIS_HEADER = 7;      // baris berisi tanggal bulan (Jun-24, dst.)
    private const BARIS_DATA_AWAL = 9;   // baris data pertama
    private const KOLOM_AWAL = 11;       // kolom K = W1 bulan pertama

    // kolom legenda & line di sheet
    private const KOL_KODE = 3;          // C
    private const KOL_PEKERJAAN = 4;     // D
    private const KOL_LINE = 8;          // H
    private const KOL_JENIS = 10;        // J ("Plan" / "Aktual")

    // =====================================================
    // LANGKAH 1: BACA EXCEL
    // =====================================================

    public function preview(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:20480'],
        ], [
            'file.required' => 'Pilih file Excel dulu.',
            'file.mimes' => 'File harus berformat .xlsx atau .xls.',
        ]);

        return response()->json($this->baca($request->file('file')->getRealPath()));
    }

    private function baca(string $path): array
    {
        $reader = IOFactory::createReaderForFile($path);
        $reader->setReadDataOnly(true);

        if (! in_array(self::SHEET, $reader->listWorksheetNames($path), true)) {
            throw ValidationException::withMessages([
                'file' => 'Sheet "' . self::SHEET . '" tidak ditemukan di file ini.',
            ]);
        }

        $reader->setLoadSheetsOnly([self::SHEET]);
        $ws = $reader->load($path)->getSheetByName(self::SHEET);

        $nilai = function (int $kolom, int $baris) use ($ws) {
            try {
                return $ws->getCell([$kolom, $baris])->getCalculatedValue();
            } catch (\Throwable) {
                return $ws->getCell([$kolom, $baris])->getValue();
            }
        };

        $teks = fn ($v) => trim((string) $v);

        $kolomTerakhir = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($ws->getHighestColumn());
        $barisTerakhir = $ws->getHighestRow();

        // ---------- kolom => [tahun, bulan, minggu] ----------
        $petaKolom = [];

        for ($c = self::KOLOM_AWAL; $c <= $kolomTerakhir; $c++) {
            $h = $nilai($c, self::BARIS_HEADER);

            if ($h === null || $h === '') {
                continue;
            }

            if (is_numeric($h)) {
                $tgl = ExcelDate::excelToDateTimeObject((float) $h);
            } else {
                try {
                    $tgl = new \DateTime((string) $h);
                } catch (\Throwable) {
                    continue;
                }
            }

            for ($w = 1; $w <= 4; $w++) {
                $petaKolom[$c + $w - 1] = [(int) $tgl->format('Y'), (int) $tgl->format('n'), $w];
            }
        }

        if (empty($petaKolom)) {
            throw ValidationException::withMessages([
                'file' => 'Header bulan (baris 7) tidak terbaca. Pastikan format file sama dengan Excel schedule.',
            ]);
        }

        // ---------- legenda kode (kolom C dan D) ----------
        $legenda = [];

        for ($r = self::BARIS_DATA_AWAL; $r <= $barisTerakhir; $r++) {
            $kode = strtoupper($teks($nilai(self::KOL_KODE, $r)));

            if ($kode !== '' && ! isset($legenda[$kode])) {
                $legenda[$kode] = $teks($nilai(self::KOL_PEKERJAAN, $r));
            }
        }

        // ---------- baris Plan per line ----------
        $lines = [];
        $cells = [];
        $hitungKode = [];
        $tahuns = [];

        for ($r = self::BARIS_DATA_AWAL; $r <= $barisTerakhir; $r++) {
            if (strcasecmp($teks($nilai(self::KOL_JENIS, $r)), 'Plan') !== 0) {
                continue;
            }

            $namaLine = $teks($nilai(self::KOL_LINE, $r));

            if ($namaLine === '') {
                continue;
            }

            $idx = array_search($namaLine, $lines, true);

            if ($idx === false) {
                $lines[] = $namaLine;
                $idx = count($lines) - 1;
            }

            foreach ($petaKolom as $c => [$tahun, $bulan, $minggu]) {
                $kode = strtoupper($teks($nilai($c, $r)));

                if ($kode === '') {
                    continue;
                }

                $cells[] = [$idx, $tahun, $bulan, $minggu, $kode];
                $hitungKode[$kode] = ($hitungKode[$kode] ?? 0) + 1;
                $tahuns[$tahun] = true;
            }
        }

        if (empty($cells)) {
            throw ValidationException::withMessages([
                'file' => 'Tidak ada isian Plan yang terbaca dari file ini.',
            ]);
        }

        $kodes = collect($hitungKode)
            ->map(fn ($jumlah, $kode) => [
                'kode' => $kode,
                'pekerjaan' => $legenda[$kode] ?? null,
                'jumlah' => $jumlah,
            ])
            ->sortBy(fn ($k) => sprintf('%02d%s', strlen($k['kode']), $k['kode']))
            ->values();

        $tahuns = array_keys($tahuns);
        sort($tahuns);

        return [
            'lines' => $lines,
            'kodes' => $kodes,
            'tahuns' => $tahuns,
            'cells' => $cells,
        ];
    }

    // =====================================================
    // LANGKAH 2: SIMPAN
    // =====================================================

    public function import(Request $request)
    {
        $data = $request->validate([
            'lines' => ['required', 'array', 'min:1'],
            'lines.*' => ['string', 'max:100'],
            'cells' => ['required', 'array', 'min:1'],
            'cells.*' => ['array', 'size:5'],
            'mapping' => ['nullable', 'array'],
            'mapping.*' => ['nullable', 'array'],
            'mapping.*.*' => ['string', 'max:10'],
            'timpa' => ['nullable', 'boolean'],
        ]);

        $timpa = (bool) ($data['timpa'] ?? false);
        $lines = array_values($data['lines']);

        // kode web -> id item (hanya item yang masih tampil di menu Preventif Mesin)
        $idByKode = ScheduleItemKode::query()
            ->whereIn('preventif_mesin_id', PreventifMesin::where('is_hidden', false)->pluck('no'))
            ->pluck('preventif_mesin_id', 'kode');

        // kode Excel -> daftar id item web
        $petaItem = [];
        $salah = [];

        foreach (($data['mapping'] ?? []) as $kodeExcel => $kodeWeb) {
            foreach ((array) $kodeWeb as $kw) {
                $kw = strtoupper(trim((string) $kw));

                if ($kw === '') {
                    continue;
                }

                if (! isset($idByKode[$kw])) {
                    $salah[$kw] = true;
                    continue;
                }

                $petaItem[strtoupper((string) $kodeExcel)][] = $idByKode[$kw];
            }
        }

        if (! empty($salah)) {
            throw ValidationException::withMessages([
                'mapping' => 'Kode web tidak ditemukan: ' . implode(', ', array_keys($salah)) . '.',
            ]);
        }

        // kelompokkan: "line|tahun|bulan|minggu" => [id item, ...]
        $grup = [];
        $diabaikan = 0;

        foreach ($data['cells'] as $c) {
            [$idx, $tahun, $bulan, $minggu, $kode] = $c;

            $idx = (int) $idx;
            $tahun = (int) $tahun;
            $bulan = (int) $bulan;
            $minggu = (int) $minggu;

            if (! isset($lines[$idx]) || $tahun < 2000 || $tahun > 2100
                || $bulan < 1 || $bulan > 12 || $minggu < 1 || $minggu > 4) {
                continue;
            }

            $ids = $petaItem[strtoupper((string) $kode)] ?? [];

            if (empty($ids)) {
                $diabaikan++;
                continue;
            }

            $kunci = "{$idx}|{$tahun}|{$bulan}|{$minggu}";
            $grup[$kunci] = array_values(array_unique(array_merge($grup[$kunci] ?? [], $ids)));
        }

        if (empty($grup)) {
            throw ValidationException::withMessages([
                'mapping' => 'Belum ada kode Excel yang dipetakan ke kode web.',
            ]);
        }

        $terisi = $dilewati = $barisBaru = 0;

        DB::transaction(function () use ($grup, $lines, $timpa, &$terisi, &$dilewati, &$barisBaru) {
            $cache = [];

            $cariBaris = function (int $tahun, string $nama) use (&$cache, &$barisBaru) {
                $key = $tahun . '|' . mb_strtolower($nama);

                if (isset($cache[$key])) {
                    return $cache[$key];
                }

                $baris = ScheduleBaris::where('tahun', $tahun)->get()
                    ->first(fn ($b) => mb_strtolower(trim((string) $b->nama)) === mb_strtolower($nama));

                // pakai baris kosong bawaan (tanpa nama & tanpa isian) sebelum membuat yang baru
                if (! $baris) {
                    $baris = ScheduleBaris::where('tahun', $tahun)
                        ->where(fn ($q) => $q->whereNull('nama')->orWhere('nama', ''))
                        ->whereDoesntHave('plans')
                        ->orderBy('urutan')
                        ->first();

                    if ($baris) {
                        $baris->update(['nama' => $nama]);
                    }
                }

                if (! $baris) {
                    $baris = ScheduleBaris::create([
                        'tahun' => $tahun,
                        'urutan' => (int) ScheduleBaris::where('tahun', $tahun)->max('urutan') + 1,
                        'nama' => $nama,
                    ]);

                    $barisBaru++;
                }

                return $cache[$key] = $baris;
            };

            foreach ($grup as $kunci => $ids) {
                [$idx, $tahun, $bulan, $minggu] = array_map('intval', explode('|', $kunci));

                $baris = $cariBaris($tahun, $lines[$idx]);

                $kunciSel = [
                    'baris_id' => $baris->id,
                    'bulan' => $bulan,
                    'minggu' => $minggu,
                ];

                if (SchedulePreventifPlan::where($kunciSel)->exists()) {
                    if (! $timpa) {
                        $dilewati++;
                        continue;
                    }

                    SchedulePreventifPlan::where($kunciSel)->delete();
                }

                foreach ($ids as $itemId) {
                    SchedulePreventifPlan::create($kunciSel + [
                        'tahun' => $tahun,
                        'preventif_mesin_id' => $itemId,
                    ]);
                }

                $terisi++;
            }
        });

        $pesan = "Import selesai: {$terisi} sel diisi";

        if ($dilewati > 0) {
            $pesan .= ", {$dilewati} sel dilewati (sudah ada isinya)";
        }

        if ($barisBaru > 0) {
            $pesan .= ", {$barisBaru} baris baru dibuat";
        }

        return back()->with('success', $pesan . '.');
    }
}
