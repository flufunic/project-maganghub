<?php

namespace App\Services;

use App\Models\CheckSheet;
use App\Models\CheckSheetItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CheckSheetImportService
{
    /**
     * Alias header yang sudah dinormalisasi (huruf kecil, tanpa spasi/simbol).
     * Tambahkan alias baru di sini kalau ada checksheet dengan nama kolom lain.
     */
    private const ALIASES = [
        'inspection_point' => ['inspectionpoint', 'titikcek', 'titikpemeriksaan', 'item', 'mesin', 'submesin'],
        'condition'        => ['condition', 'kondisi', 'standar', 'standart', 'standard'],
        'method'           => ['method', 'metode', 'methode'],
    ];

    public static function normalize(?string $value): string
    {
        return preg_replace('/[^a-z0-9]/', '', strtolower(trim((string) $value)));
    }

    /** Baca sheet pertama jadi array of rows (semua nilai jadi string, sudah di-trim). */
    
    public function readRows(UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath());

        try {
            $sheet = $spreadsheet->getActiveSheet();

            return $sheet->toArray(
                null,
                true,
                true,
                false
            );
        } finally {
            $spreadsheet->disconnectWorksheets();
        }
    }

    public function detectHeaderRow(array $rows): int
    {
        $bestRow = 1;
        $bestScore = -1;
        $bestFilled = 0;

        $aliases = [
            'inspectionpoint',
            'titikcek',
            'titikpemeriksaan',
            'condition',
            'kondisi',
            'standar',
            'standart',
            'standard',
            'method',
            'metode',
            'methode',
        ];

        // Periksa maksimal 50 baris pertama.
        foreach (array_slice($rows, 0, 50) as $index => $row) {
            $values = array_map(
                fn ($value) => trim((string) ($value ?? '')),
                $row
            );

            $filled = count(array_filter(
                $values,
                fn ($value) => $value !== ''
            ));

            if ($filled === 0) {
                continue;
            }

            $score = 0;

            foreach ($values as $value) {
                $normalized = self::normalize($value);

                if ($normalized !== '' &&
                    in_array($normalized, $aliases, true)) {
                    $score += 10;
                }
            }

            // Jika tidak ada nama kolom yang dikenali,
            // gunakan jumlah sel terisi sebagai petunjuk.
            if ($score === 0) {
                $score = min($filled, 9);
            }

            if (
                $score > $bestScore ||
                ($score === $bestScore && $filled > $bestFilled)
            ) {
                $bestScore = $score;
                $bestFilled = $filled;
                $bestRow = $index + 1;
            }
        }

        return $bestRow;
    }


    /** Tebak mapping: field => [index kolom, ...] (urut dari kiri ke kanan). */
    public function guessMapping(array $headers): array
    {
        $mapping = ['inspection_point' => [], 'condition' => [], 'method' => []];

        foreach ($headers as $i => $header) {
            $n = self::normalize($header);

            foreach (self::ALIASES as $field => $aliases) {
                if ($n !== '' && in_array($n, $aliases, true)) {
                    $mapping[$field][] = $i;
                    break;
                }
            }
        }

        return $mapping;
    }

    /**
     * Ubah rows Excel jadi item [inspection_point, condition, method]
     * + daftar nomor baris Excel yang dilewati.
     */
    public function parse(array $rows, array $mapping, int $headerRow): array
    {
        $pointCols = array_map('intval', $mapping['inspection_point'] ?? []);
        $condCols  = array_map('intval', $mapping['condition'] ?? []);
        $methCols  = array_map('intval', $mapping['method'] ?? []);

        $allCols = array_merge($pointCols, $condCols, $methCols);

        $items   = [];
        $skipped = [];
        $last    = []; // untuk fill-down (merge cell)

        foreach (array_slice($rows, $headerRow) as $n => $row) {
            $excelRow = $headerRow + $n + 1;

            // Baris kosong total -> lewati dan reset fill-down
            $hasData = collect($allCols)->contains(fn ($c) => ($row[$c] ?? '') !== '');
            if (! $hasData) {
                $last = [];
                continue;
            }

            // Inspection point: gabung beberapa kolom + fill-down
            $parts = [];
            foreach ($pointCols as $pos => $col) {
                $val = $row[$col] ?? '';

                if ($val !== '') {
                    $last[$col] = $val;

                    // kolom di kanannya (mis. Sub Mesin) harus mulai baru
                    foreach (array_slice($pointCols, $pos + 1) as $next) {
                        unset($last[$next]);
                    }
                } else {
                    $val = $last[$col] ?? '';
                }

                if ($val !== '') {
                    $parts[] = $val;
                }
            }

            $point = implode(' - ', $parts);

            if ($point === '') {
                $skipped[] = $excelRow;
                continue;
            }

            $items[] = [
                'inspection_point' => $point,
                'condition'        => $this->join($row, $condCols),
                'method'           => $this->join($row, $methCols),
            ];
        }

        return ['items' => $items, 'skipped' => $skipped];
    }

    /** Simpan item untuk tiap shift. Return jumlah baris yang dibuat. */
    public function import(CheckSheet $checkSheet, array $items, array $shifts): int
    {
        $now = now();

        DB::transaction(function () use ($checkSheet, $items, $shifts, $now) {
            foreach ($shifts as $shift) {
                // lanjut dari nomor terakhir di shift tersebut
                $no = (int) CheckSheetItem::where('check_sheet_id', $checkSheet->id)
                    ->where('shift', $shift)
                    ->max('no');

                $batch = [];
                foreach ($items as $item) {
                    $batch[] = [
                        'check_sheet_id'   => $checkSheet->id,
                        'no'               => ++$no,
                        'inspection_point' => $item['inspection_point'],
                        'condition'        => $item['condition'],
                        'method'           => $item['method'],
                        'shift'            => $shift,
                        'created_at'       => $now,
                        'updated_at'       => $now,
                    ];
                }

                foreach (array_chunk($batch, 500) as $chunk) {
                    CheckSheetItem::insert($chunk);
                }
            }
        });

        return count($items) * count($shifts);
    }

    private function join(array $row, array $cols): ?string
    {
        $value = collect($cols)
            ->map(fn ($c) => $row[$c] ?? '')
            ->filter()
            ->implode(' | ');

        return $value !== '' ? $value : null;
    }
}
