<?php

namespace App\Exports;

use App\Models\CheckSheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * Menggabungkan beberapa sheet dalam satu file Excel:
 * - Sheet 1 "Check Sheet" : tabel checklist harian (Plan / Act / KWH / centang)
 * - Sheet 2 "Monitoring"  : Running Hours + Konsumsi Solar
 *                           (hanya kalau pakai_monitoring aktif)
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
        $checkSheet = CheckSheet::findOrFail($this->checkSheetId);

        $sheets = [
            new CheckSheetExport(
                $this->checkSheetId,
                $this->bulan,
                $this->tahun,
                $this->lineId
            ),
        ];

        if ($checkSheet->pakai_monitoring) {
            $sheets[] = new CheckSheetMonitoringExport(
                (int) $checkSheet->id,
                (int) $this->bulan,
                (int) $this->tahun,
                (bool) $checkSheet->pakai_bbm,
                (bool) $checkSheet->bbm_kali_60
            );
        }

        return $sheets;
    }
}