<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class PreventifMesinExport implements FromArray, WithColumnWidths, WithEvents
{
    protected array $data;
    protected int $jumlahHari;

    public function __construct(
        array $data,
        int $jumlahHari
    ) {
        $this->data = $data;
        $this->jumlahHari = $jumlahHari;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function columnWidths(): array
    {
        $widths = [
            'A' => 15, // Divisi
            'B' => 8,  // No
            'C' => 40, // Item Preventif
            'D' => 15, // Periode
            'E' => 12, // Durasi
            'F' => 15, // Total Durasi
            'G' => 10, // DOT
            'H' => 10, // HOT
            'I' => 10, // Status
        ];

        $firstDateColumn = 10;

        for ($i = 0; $i < $this->jumlahHari; $i++) {
            $column = $this->getExcelColumn(
                $firstDateColumn + $i
            );

            $widths[$column] = 5;
        }

        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                // ==========================================
                // JUDUL
                // ==========================================

                $sheet->mergeCells(
                    "A1:{$highestColumn}1"
                );

                $sheet->getStyle(
                    "A1:{$highestColumn}1"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 14,
                    ],
                    'alignment' => [
                        'horizontal' =>
                            Alignment::HORIZONTAL_CENTER,
                        'vertical' =>
                            Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // ==========================================
                // HEADER
                // ==========================================

                $sheet->getStyle(
                    "A2:{$highestColumn}2"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],
                    'alignment' => [
                        'horizontal' =>
                            Alignment::HORIZONTAL_CENTER,
                        'vertical' =>
                            Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' =>
                                Border::BORDER_THIN,
                        ],
                    ],
                ]);

                // ==========================================
                // BORDER SEMUA DATA
                // ==========================================

                $sheet->getStyle(
                    "A2:{$highestColumn}{$highestRow}"
                )
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(
                        Border::BORDER_THIN
                    );

                // ==========================================
                // ALIGNMENT
                // ==========================================

                $sheet->getStyle(
                    "A3:B{$highestRow}"
                )
                    ->getAlignment()
                    ->setHorizontal(
                        Alignment::HORIZONTAL_CENTER
                    );

                $sheet->getStyle(
                    "D3:{$highestColumn}{$highestRow}"
                )
                    ->getAlignment()
                    ->setHorizontal(
                        Alignment::HORIZONTAL_CENTER
                    );

                $sheet->getStyle(
                    "A2:{$highestColumn}{$highestRow}"
                )
                    ->getAlignment()
                    ->setVertical(
                        Alignment::VERTICAL_CENTER
                    );

                // ==========================================
                // TINGGI BARIS
                // ==========================================

                $sheet->getRowDimension(1)
                    ->setRowHeight(25);

                $sheet->getRowDimension(2)
                    ->setRowHeight(30);

                // ==========================================
                // MERGE DIVISI YANG SAMA
                // ==========================================

                $startRow = 3;

                while ($startRow <= $highestRow) {

                    $divisi = $sheet
                        ->getCell("A{$startRow}")
                        ->getValue();

                    if (
                        $divisi === null
                        || $divisi === ''
                    ) {
                        $startRow++;
                        continue;
                    }

                    $endRow = $startRow + 1;

                    while (
                        $endRow <= $highestRow
                    ) {
                        $nextDivisi = $sheet
                            ->getCell("A{$endRow}")
                            ->getValue();

                        /*
                        |--------------------------------------------------------------------------
                        | Karena setiap item punya 2 baris:
                        | PLAN
                        | ACT
                        |
                        | maka ACT selalu kosong di kolom Divisi.
                        |--------------------------------------------------------------------------
                        */

                        if (
                            $nextDivisi !== null
                            && $nextDivisi !== ''
                            && $nextDivisi !== $divisi
                        ) {
                            break;
                        }

                        $endRow++;
                    }

                    $mergeEnd = $endRow - 1;

                    if ($mergeEnd > $startRow) {

                        $sheet->mergeCells(
                            "A{$startRow}:A{$mergeEnd}"
                        );

                        $sheet->getStyle(
                            "A{$startRow}:A{$mergeEnd}"
                        )
                            ->getAlignment()
                            ->setHorizontal(
                                Alignment::HORIZONTAL_CENTER
                            );

                        $sheet->getStyle(
                            "A{$startRow}:A{$mergeEnd}"
                        )
                            ->getAlignment()
                            ->setVertical(
                                Alignment::VERTICAL_CENTER
                            );
                    }

                    $startRow = $endRow;
                }

                // ==========================================
                // MERGE KOLOM INFORMASI PLAN + ACT
                // ==========================================

                $startDataRow = 3;

                $columnsToMerge = [
                    'B', // No
                    'C', // Item Preventif
                    'D', // Periode
                    'E', // Durasi
                    'F', // Total Durasi
                    'G', // DOT
                    'H', // HOT
                ];

                while ($startDataRow <= $highestRow) {

                    $actRow = $startDataRow + 1;

                    if ($actRow > $highestRow) {
                        break;
                    }

                    foreach ($columnsToMerge as $column) {

                        $sheet->mergeCells(
                            "{$column}{$startDataRow}:{$column}{$actRow}"
                        );

                        $sheet->getStyle(
                            "{$column}{$startDataRow}:{$column}{$actRow}"
                        )
                            ->getAlignment()
                            ->setVertical(
                                Alignment::VERTICAL_CENTER
                            );
                    }

                    $startDataRow += 2;
                }
            },
        ];
    }

    private function getExcelColumn(int $number): string
    {
        $column = '';

        while ($number > 0) {

            $remainder = ($number - 1) % 26;

            $column =
                chr(65 + $remainder)
                . $column;

            $number = intdiv(
                $number - 1,
                26
            );
        }

        return $column;
    }
}