<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * Membungkus export check sheet dalam satu file Excel.
 *
 * Sekarang hanya ada 1 sheet "Check Sheet". Monitoring Running Hours,
 * Konsumsi Solar, Pelumasan, dan Abnormality sudah ada di dalam sheet itu
 * (lihat CheckSheetExport), jadi tidak ada sheet "Monitoring" terpisah lagi.
 */
class CheckSheetWorkbookExport implements Export, WithMultipleSheets
{
    public function __construct(
        protected int $checkSheetId,
        protected int $bulan,
        protected int $tahun,
        protected ?int $lineId = null
    ) {
    }

    public function sheets(): array
    {
        return [
            new CheckSheetExport(
                $this->checkSheetId,
                $this->bulan,
                $this->tahun,
                $this->lineId
            ),
        ];
    }
}