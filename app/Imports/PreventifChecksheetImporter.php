<?php

namespace App\Imports;

use App\Models\PreventifChecksheet;
use App\Models\PreventifMesin;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Import form "CHECK LIST PREVENTIF MAINTENANCE".
 * 1 sheet = 1 equipment = 1 Checksheet Preventif.
 *
 * Posisi sel dibaca dari LABEL-nya (bukan alamat tetap), jadi tetap jalan
 * kalau baris/kolom bergeser sedikit antar file / antar divisi.
 *
 * Yang diimpor : nama equipment, nomor dokumen, tgl terbit/revisi, revisi,
 *                disetujui/diperiksa/dibuat, daftar Inspection Point + Standar.
 *                Kolom Standar boleh bernama "Standar", "Standard" atau
 *                "Condition" (lihat ALIAS_STANDAR) -> semuanya masuk ke field `standar`.
 * Tidak diimpor: centang W1-W4, kondisi terakhir (OK/NG), keterangan, dan baris
 *                log abnormality di bagian bawah (dilaporkan jumlahnya saja).
 */
class PreventifChecksheetImporter
{
    private const LABEL_DOKUMEN = ['DI SETUJUI', 'DI PERIKSA', 'DI BUAT', 'NO DOKUMEN',
        'TGL TERBIT', 'TGL REVISI', 'REVISI', 'HALAMAN'];

    private const BATAS_TABEL = ['INSPECT BY', 'APPROVED', 'DATE', 'ABNORMALITY'];

    private const LABEL_AKSI = ['PERIKSA', 'BERSIHKAN', 'LUBRIKASI', 'GANTI', 'PERBAIKI'];

    // Nama header yang dianggap kolom "Inspection Point".
    private const ALIAS_INSPECTION = ['INSPECTION POINT', 'INSPECTION POINTS'];

    // Nama header yang dianggap kolom "Standar". Urutan = prioritas:
    // kalau satu sheet punya lebih dari satu, yang paling atas dipakai.
    // Sengaja TIDAK ada 'KONDISI' / 'KONDISI TERAKHIR' karena itu kolom hasil OK/NG.
    private const ALIAS_STANDAR = ['STANDAR', 'STANDARD', 'KONDISI STANDAR', 'CONDITION'];

    public function import(string $path, string $divisi): array
    {
        $spreadsheet = IOFactory::load($path);

        $sheets = [];
        $dibuat = 0;
        $diperbarui = 0;
        $dilewati = 0;
        $itemBaru = 0;

        foreach ($spreadsheet->getAllSheets() as $ws) {
            $hasil = $this->importSheet($ws, $divisi);
            $sheets[] = $hasil;

            match ($hasil['status']) {
                'dibuat' => $dibuat++,
                'diperbarui' => $diperbarui++,
                default => $dilewati++,
            };

            $itemBaru += $hasil['item_baru'];
        }

        $ringkasan = "Import selesai: {$dibuat} checksheet baru, {$diperbarui} diperbarui"
            . ($dilewati ? ", {$dilewati} sheet dilewati" : '')
            . ", {$itemBaru} inspection point baru.";

        return ['ringkasan' => $ringkasan, 'sheets' => $sheets];
    }

    // =====================================================
    // SATU SHEET
    // =====================================================

    private function importSheet(Worksheet $ws, string $divisi): array
    {
        $judulSheet = trim($ws->getTitle());
        $grid = $this->grid($ws);

        $laporan = [
            'sheet' => $judulSheet,
            'status' => 'dilewati',
            'equipment' => null,
            'item_baru' => 0,
            'item_diperbarui' => 0,
            'terhubung' => false,
            'catatan' => [],
        ];

        // ---------- tabel Inspection Point ----------
        $header = $this->cariHeaderTabel($grid);

        if (! $header) {
            $laporan['catatan'][] = 'Tabel "No / Inspection Point" tidak ditemukan.';

            return $laporan;
        }

        [$barisHeader, $kolNo, $kolInsp, $kolStd, $labelStd] = $header;

        if ($kolStd === null) {
            $laporan['catatan'][] = 'Kolom Standar / Condition tidak ditemukan, standar dikosongkan.';
        } elseif ($labelStd !== 'STANDAR') {
            $laporan['catatan'][] = 'Kolom standar dibaca dari header "' . $labelStd . '".';
        }

        $items = [];

        foreach ($this->urutBaris($grid, $barisHeader + 1) as $r) {
            if ($this->barisBerisi($grid[$r], self::BATAS_TABEL)) {
                break;
            }

            $teks = $grid[$r][$kolInsp] ?? null;

            if ($teks === null || trim((string) $teks) === '') {
                continue;
            }

            if (in_array($this->kunci($teks), self::LABEL_AKSI, true)) {
                continue;
            }

            $nomor = $grid[$r][$kolNo] ?? null;

            $items[] = [
                'no' => is_numeric($nomor) ? (int) $nomor : null,
                'inspection_point' => trim((string) $teks),
                'standar' => $kolStd !== null
                    ? (trim((string) ($grid[$r][$kolStd] ?? '')) ?: null)
                    : null,
            ];
        }

        if (empty($items)) {
            $laporan['catatan'][] = 'Tidak ada baris Inspection Point yang terisi.';

            return $laporan;
        }

        // ---------- header dokumen ----------
        $equipment = $this->namaEquipment($grid) ?: $judulSheet;

        $data = [
            'nomor_dokumen' => $this->nilaiLabel($grid, 'NO DOKUMEN'),
            'tanggal_terbit' => $this->tanggal($this->nilaiLabel($grid, 'TGL TERBIT')),
            'tanggal_revisi' => $this->tanggal($this->nilaiLabel($grid, 'TGL REVISI')),
            'revisi' => $this->nilaiLabel($grid, 'REVISI'),
            'disetujui' => $this->namaDibawahLabel($grid, 'DI SETUJUI'),
            'diperiksa' => $this->namaDibawahLabel($grid, 'DI PERIKSA'),
            'dibuat' => $this->namaDibawahLabel($grid, 'DI BUAT'),
        ];

        $laporan['equipment'] = $equipment;

        // ---------- log abnormality di bawah (hanya dihitung) ----------
        $jumlahLog = $this->hitungBarisLog($grid);

        if ($jumlahLog > 0) {
            $laporan['catatan'][] = "{$jumlahLog} baris log abnormality di Excel tidak diimpor "
                . '(abnormality diambil dari Checksheet harian).';
        }

        // ---------- simpan ----------
        DB::transaction(function () use ($divisi, $equipment, $data, $items, &$laporan) {
            $checksheet = PreventifChecksheet::withTrashed()->firstOrNew([
                'divisi' => $divisi,
                'nama_equipment' => $equipment,
            ]);

            $baru = ! $checksheet->exists;

            if ($checksheet->trashed()) {
                $checksheet->restore();
            }

            // hanya timpa field yang ada isinya di Excel
            $checksheet->fill(array_filter($data, fn ($v) => $v !== null && $v !== ''));

            if (! $checksheet->preventif_mesin_id) {
                $checksheet->preventif_mesin_id = $this->cariItemPreventif($divisi, $equipment);
            }

            $checksheet->save();

            $existing = $checksheet->items()->get()
                ->keyBy(fn ($i) => $this->normal($i->inspection_point));

            foreach ($items as $urutan => $row) {
                $key = $this->normal($row['inspection_point']);
                $no = $row['no'] ?? ($urutan + 1);

                if ($existing->has($key)) {
                    $existing[$key]->update([
                        'no' => $no,
                        'standar' => $row['standar'] ?? $existing[$key]->standar,
                    ]);
                    $laporan['item_diperbarui']++;
                } else {
                    $checksheet->items()->create([
                        'no' => $no,
                        'inspection_point' => $row['inspection_point'],
                        'standar' => $row['standar'],
                    ]);
                    $laporan['item_baru']++;
                }
            }

            $checksheet->susunUlangNomorItem();

            $laporan['status'] = $baru ? 'dibuat' : 'diperbarui';
            $laporan['terhubung'] = (bool) $checksheet->preventif_mesin_id;

            if (! $checksheet->preventif_mesin_id) {
                $laporan['catatan'][] = 'Belum terhubung ke item Schedule Preventif — '
                    . 'pilih manual lewat tombol Edit.';
            }
        });

        return $laporan;
    }

    // =====================================================
    // PEMBACA SHEET
    // =====================================================

    /** [baris][indeks kolom] => nilai (hanya sel berisi; sel merge = sel kiri-atas). */
    private function grid(Worksheet $ws): array
    {
        $grid = [];

        foreach ($ws->getRowIterator() as $row) {
            $cells = $row->getCellIterator();
            $cells->setIterateOnlyExistingCells(true);

            foreach ($cells as $cell) {
                $v = $cell->getValue();

                if ($v instanceof RichText) {
                    $v = $v->getPlainText();
                } elseif (is_string($v) && str_starts_with($v, '=')) {
                    try {
                        $v = $cell->getCalculatedValue();
                    } catch (\Throwable $e) {
                        $v = null;
                    }
                }

                if ($v === null || (is_string($v) && trim($v) === '')) {
                    continue;
                }

                if (is_numeric($v) && Date::isDateTime($cell)) {
                    $v = Date::excelToDateTimeObject($v)->format('Y-m-d');
                }

                $grid[$cell->getRow()][Coordinate::columnIndexFromString($cell->getColumn())]
                    = is_string($v) ? trim($v) : $v;
            }
        }

        ksort($grid);

        foreach ($grid as &$cols) {
            ksort($cols);
        }

        return $grid;
    }

    private function urutBaris(array $grid, int $dari): array
    {
        return array_values(array_filter(array_keys($grid), fn ($r) => $r >= $dari));
    }

    /** "No. Dokumen :" -> "NO DOKUMEN" */
    private function kunci(mixed $v): string
    {
        return Str::upper(trim(preg_replace('/[\s:.]+/', ' ', (string) $v)));
    }

    private function normal(?string $v): string
    {
        return Str::upper(preg_replace('/[^A-Za-z0-9]+/', '', (string) $v));
    }

    private function barisBerisi(array $cols, array $labels): bool
    {
        foreach ($cols as $v) {
            if (is_string($v) && in_array($this->kunci($v), $labels, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Cari baris header tabel.
     * Kolom Standar dikenali lewat ALIAS_STANDAR ("Standar", "Standard", "Condition", dst).
     *
     * @return array{0:int,1:int,2:int,3:?int,4:?string}|null
     *         [baris, kolNo, kolInspection, kolStandar, labelStandarYangDipakai]
     */
    private function cariHeaderTabel(array $grid): ?array
    {
        foreach ($grid as $r => $cols) {
            $kolNo = $kolInsp = null;
            $kandidatStd = []; // [prioritas => [kolom, label]]

            foreach ($cols as $c => $v) {
                $k = $this->kunci($v);

                if ($k === 'NO') {
                    $kolNo ??= $c;
                } elseif (in_array($k, self::ALIAS_INSPECTION, true)) {
                    $kolInsp = $c;
                } elseif (($p = array_search($k, self::ALIAS_STANDAR, true)) !== false) {
                    $kandidatStd[$p] ??= [$c, $k];
                }
            }

            if ($kolInsp !== null) {
                ksort($kandidatStd);
                [$kolStd, $labelStd] = $kandidatStd ? reset($kandidatStd) : [null, null];

                return [$r, $kolNo ?? 0, $kolInsp, $kolStd, $labelStd];
            }
        }

        return null;
    }

    private function cariLabel(array $grid, string $label): ?array
    {
        foreach ($grid as $r => $cols) {
            foreach ($cols as $c => $v) {
                if ($this->kunci($v) === $label) {
                    return [$r, $c];
                }
            }
        }

        return null;
    }

    /** Nilai di kanan label pada baris yang sama (lewati ":" dan berhenti di label lain). */
    private function nilaiLabel(array $grid, string $label): ?string
    {
        $pos = $this->cariLabel($grid, $label);

        if (! $pos) {
            return null;
        }

        [$r, $kol] = $pos;

        foreach ($grid[$r] as $c => $v) {
            if ($c <= $kol) {
                continue;
            }

            $k = $this->kunci($v);

            if ($k === '') {
                continue;
            }

            if (in_array($k, self::LABEL_DOKUMEN, true)) {
                return null;
            }

            return trim((string) $v);
        }

        return null;
    }

    /** Nama penandatangan: kolom yang sama dengan label "Di setujui", beberapa baris di bawahnya. */
    private function namaDibawahLabel(array $grid, string $label): ?string
    {
        $pos = $this->cariLabel($grid, $label);

        if (! $pos) {
            return null;
        }

        [$r, $kol] = $pos;

        for ($baris = $r + 1; $baris <= $r + 6; $baris++) {
            for ($c = $kol; $c <= $kol + 2; $c++) {
                $v = $grid[$baris][$c] ?? null;

                if ($v !== null && trim((string) $v) !== '') {
                    return trim((string) $v);
                }
            }
        }

        return null;
    }

    private function namaEquipment(array $grid): ?string
    {
        foreach ($grid as $r => $cols) {
            foreach ($cols as $c => $v) {
                if (! str_starts_with($this->kunci($v), 'NAMA EQUIPMENT')) {
                    continue;
                }

                // "NAMA EQUIPMENT: PERGANTIAN GREAS ..." dalam satu sel
                $bagian = explode(':', (string) $v, 2);

                if (isset($bagian[1]) && trim($bagian[1]) !== '') {
                    return trim($bagian[1]);
                }

                // atau nilainya di sel sebelah
                foreach ($cols as $c2 => $v2) {
                    if ($c2 > $c && $this->kunci($v2) !== '') {
                        return trim((string) $v2);
                    }
                }
            }
        }

        return null;
    }

    private function hitungBarisLog(array $grid): int
    {
        $kolDate = $kolAbn = $barisHeader = null;

        foreach ($grid as $r => $cols) {
            $d = $a = null;

            foreach ($cols as $c => $v) {
                $k = $this->kunci($v);

                if ($k === 'DATE') {
                    $d = $c;
                } elseif ($k === 'ABNORMALITY') {
                    $a = $c;
                }
            }

            if ($d !== null && $a !== null) {
                [$barisHeader, $kolDate, $kolAbn] = [$r, $d, $a];
                break;
            }
        }

        if ($barisHeader === null) {
            return 0;
        }

        $jumlah = 0;

        foreach ($this->urutBaris($grid, $barisHeader + 1) as $r) {
            if (isset($grid[$r][$kolDate]) || isset($grid[$r][$kolAbn])) {
                $jumlah++;
            }
        }

        return $jumlah;
    }

    private function tanggal(?string $v): ?string
    {
        if ($v === null || trim($v) === '') {
            return null;
        }

        try {
            return Carbon::parse($v)->toDateString();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** Cocokkan nama equipment dengan 1 item Schedule Preventif di divisi yang sama. */
    private function cariItemPreventif(string $divisi, string $equipment): ?int
    {
        $target = $this->normal($equipment);

        if (strlen($target) < 6) {
            return null;
        }

        $semua = PreventifMesin::where('is_hidden', false)
            ->where('divisi', $divisi)
            ->get(['no', 'item_preventif']);

        $persis = $semua->filter(fn ($p) => $this->normal($p->item_preventif) === $target);

        if ($persis->count() === 1) {
            return (int) $persis->first()->no;
        }

        $mirip = $semua->filter(function ($p) use ($target) {
            $n = $this->normal($p->item_preventif);

            return strlen($n) >= 6 && (str_contains($n, $target) || str_contains($target, $n));
        });

        return $mirip->count() === 1 ? (int) $mirip->first()->no : null;
    }
}