<?php

namespace App\Exports;

use App\Models\CheckSheet;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class CheckSheetExport implements FromArray, WithEvents
{
    protected $checkSheetId;
    protected $bulan;
    protected $tahun;

    protected int $lastColumnNumber;
    protected string $lastColumn;

    protected int $shiftATitleRow = 0;
    protected int $shiftAHeaderRow = 0;
    protected int $shiftAStartRow = 0;
    protected int $shiftAEndRow = 0;

    protected int $shiftBTitleRow = 0;
    protected int $shiftBHeaderRow = 0;
    protected int $shiftBStartRow = 0;
    protected int $shiftBEndRow = 0;

    protected int $abnormalityTitleRow = 0;
    protected int $abnormalityHeaderRow = 0;
    protected int $abnormalityStartRow = 0;
    protected int $abnormalityEndRow = 0;

    public function __construct($checkSheetId, $bulan, $tahun)
    {
        $this->checkSheetId = $checkSheetId;
        $this->bulan = (int) $bulan;
        $this->tahun = (int) $tahun;

        $jumlahHari = cal_days_in_month(
            CAL_GREGORIAN,
            $this->bulan,
            $this->tahun
        );

        // A-D = informasi item
        // E dst = tanggal
        $this->lastColumnNumber = 4 + $jumlahHari;
        $this->lastColumn = $this->columnLetter(
            $this->lastColumnNumber
        );
    }

    /**
     * Membuat seluruh isi Excel sebagai array.
     */
    public function array(): array
    {
        $checkSheet = CheckSheet::with([
            'divisi',

            'items.checklists' => function ($query) {
                $query
                    ->whereMonth('tanggal', $this->bulan)
                    ->whereYear('tanggal', $this->tahun)
                    ->orderBy('tanggal');
            },

            'abnormalities' => function ($query) {
                $query->orderBy('tanggal');
            },

        ])->findOrFail($this->checkSheetId);

        $items = collect($checkSheet->items ?? []);

        $itemsShiftA = $items
            ->where('shift', 'A')
            ->values();

        $itemsShiftB = $items
            ->where('shift', 'B')
            ->values();

        $abnormalities = $checkSheet->abnormalities ?? collect();

        $jumlahHari = cal_days_in_month(
            CAL_GREGORIAN,
            $this->bulan,
            $this->tahun
        );

        $namaBulan = Carbon::create(
            $this->tahun,
            $this->bulan,
            1
        )->translatedFormat('F Y');

        $rows = [];

        /*
        |--------------------------------------------------------------------------
        | JUDUL
        |--------------------------------------------------------------------------
        */

        $rows[] = $this->makeRow([
            $checkSheet->nama_checksheet,
        ]);

        $rows[] = $this->makeRow([
            'CHECK SHEET',
        ]);

        /*
        |--------------------------------------------------------------------------
        | INFORMASI DOKUMEN
        |--------------------------------------------------------------------------
        */

        $rows[] = $this->makeRow([
            'Nomor Dokumen: ' . ($checkSheet->nomor_dokumen ?? '')
            . '     |     Divisi: ' . ($checkSheet->divisi->nama_divisi ?? '')
            . '     |     Bulan: ' . $namaBulan,
        ]);

        /*
        |--------------------------------------------------------------------------
        | SHIFT A
        |--------------------------------------------------------------------------
        */

        $this->shiftATitleRow = count($rows) + 1;

        $rows[] = $this->makeRow([
            'SHIFT A',
        ]);

        $this->shiftAHeaderRow = count($rows) + 1;

        $rows[] = $this->makeMainHeader($jumlahHari);

        $this->shiftAStartRow = count($rows) + 1;

        foreach ($itemsShiftA as $item) {
            $rows[] = $this->makeItemRow(
                $item,
                $jumlahHari
            );
        }

        $this->shiftAEndRow = count($rows);

        /*
        |--------------------------------------------------------------------------
        | JARAK
        |--------------------------------------------------------------------------
        */

        $rows[] = $this->emptyRow();

        /*
        |--------------------------------------------------------------------------
        | SHIFT B
        |--------------------------------------------------------------------------
        */

        $this->shiftBTitleRow = count($rows) + 1;

        $rows[] = $this->makeRow([
            'SHIFT B',
        ]);

        $this->shiftBHeaderRow = count($rows) + 1;

        $rows[] = $this->makeMainHeader($jumlahHari);

        $this->shiftBStartRow = count($rows) + 1;

        foreach ($itemsShiftB as $item) {
            $rows[] = $this->makeItemRow(
                $item,
                $jumlahHari
            );
        }

        $this->shiftBEndRow = count($rows);

        /*
        |--------------------------------------------------------------------------
        | JARAK
        |--------------------------------------------------------------------------
        */

        $rows[] = $this->emptyRow();

        /*
        |--------------------------------------------------------------------------
        | ABNORMALITY
        |--------------------------------------------------------------------------
        */

        $this->abnormalityTitleRow = count($rows) + 1;

        $rows[] = $this->makeRow([
            'ABNORMALITY / COUNTERMEASURE',
        ]);

        $this->abnormalityHeaderRow = count($rows) + 1;

        $rows[] = $this->makeAbnormalityHeader();

        $this->abnormalityStartRow = count($rows) + 1;

        foreach ($abnormalities as $index => $abnormality) {
            $rows[] = $this->makeAbnormalityRow(
                $index + 1,
                $abnormality
            );
        }

        $this->abnormalityEndRow = count($rows);

        return $rows;
    }

    /**
     * Header tabel Shift A dan Shift B.
     */
    private function makeMainHeader(int $jumlahHari): array
    {
        $row = [
            'No',
            'Inspection Point',
            'Condition',
            'Method',
        ];

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {
            $row[] = $hari;
        }

        return $this->makeRow($row);
    }

    /**
     * Data inspection point.
     */
    private function makeItemRow($item, int $jumlahHari): array
    {
        $row = [
            $item->no,
            $item->inspection_point,
            $item->condition ?? '',
            $item->method ?? '',
        ];

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {

            $tanggal = Carbon::create(
                $this->tahun,
                $this->bulan,
                $hari
            );

            $checklist = $item->checklists->first(
                function ($checklist) use ($tanggal) {
                    return $checklist->tanggal
                        && Carbon::parse($checklist->tanggal)
                            ->isSameDay($tanggal);
                }
            );

            if ($checklist && (bool) $checklist->status) {
                $row[] = '✓';
            } else {
                $row[] = '';
            }
        }

        return $this->makeRow($row);
    }

    /**
     * Header abnormality.
     */
    private function makeAbnormalityHeader(): array
    {
        return $this->makeRow([
            'No',
            'Tanggal',
            'Abnormality',
            'Countermeasure',
            'Status',
            'PIC',
        ]);
    }

    /**
     * Data abnormality.
     */
    private function makeAbnormalityRow(
        int $no,
        $abnormality
    ): array {
        return $this->makeRow([
            $no,

            $abnormality->tanggal
                ? Carbon::parse($abnormality->tanggal)->format('d/m/Y')
                : '',

            $abnormality->abnormality ?? '',

            $abnormality->countermeasure ?? '',

            $abnormality->status ?? '',

            $abnormality->pic ?? '',
        ]);
    }

    /**
     * Membuat row dengan jumlah kolom yang selalu sama.
     */
    private function makeRow(array $values): array
    {
        $row = array_fill(
            0,
            $this->lastColumnNumber,
            ''
        );

        foreach ($values as $index => $value) {
            if ($index < $this->lastColumnNumber) {
                $row[$index] = $value;
            }
        }

        return $row;
    }

    private function emptyRow(): array
    {
        return array_fill(
            0,
            $this->lastColumnNumber,
            ''
        );
    }

    /*
    |--------------------------------------------------------------------------
    | STYLE EXCEL
    |--------------------------------------------------------------------------
    */

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                $highestRow = $sheet->getHighestRow();

                /*
                |--------------------------------------------------------------------------
                | GRIDLINE
                |--------------------------------------------------------------------------
                */

                $sheet->setShowGridlines(false);

                /*
                |--------------------------------------------------------------------------
                | FONT
                |--------------------------------------------------------------------------
                */

                $sheet->getStyle(
                    "A1:{$this->lastColumn}{$highestRow}"
                )->getFont()->setName('Calibri');

                /*
                |--------------------------------------------------------------------------
                | TITLE
                |--------------------------------------------------------------------------
                */

                $sheet->mergeCells(
                    "A1:{$this->lastColumn}1"
                );

                $sheet->mergeCells(
                    "A2:{$this->lastColumn}2"
                );

                $sheet->getStyle(
                    "A1:{$this->lastColumn}1"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 18,
                    ],

                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle(
                    "A2:{$this->lastColumn}2"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                    ],

                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(32);
                $sheet->getRowDimension(2)->setRowHeight(22);

                /*
                |--------------------------------------------------------------------------
                | DETAIL DOKUMEN
                |--------------------------------------------------------------------------
                */

                $sheet->mergeCells("A3:{$this->lastColumn}3");

                $sheet->getStyle("A3:{$this->lastColumn}3")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                ]);

                $sheet->getRowDimension(3)->setRowHeight(28);

                /*
                |--------------------------------------------------------------------------
                | SHIFT TITLE
                |--------------------------------------------------------------------------
                */

                foreach ([
                    $this->shiftATitleRow,
                    $this->shiftBTitleRow,
                ] as $row) {

                    $sheet->mergeCells(
                        "A{$row}:{$this->lastColumn}{$row}"
                    );

                    $sheet->getStyle(
                        "A{$row}:{$this->lastColumn}{$row}"
                    )->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'size' => 12,
                        ],

                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_LEFT,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],

                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'color' => [
                                'rgb' => 'D9EAF7',
                            ],
                        ],

                        'borders' => [
                            'outline' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => [
                                    'rgb' => '7F7F7F',
                                ],
                            ],
                        ],
                    ]);

                    $sheet->getRowDimension($row)->setRowHeight(24);
                }

                /*
                |--------------------------------------------------------------------------
                | HEADER SHIFT
                |--------------------------------------------------------------------------
                */

                foreach ([
                    $this->shiftAHeaderRow,
                    $this->shiftBHeaderRow,
                ] as $row) {

                    $sheet->getStyle(
                        "A{$row}:{$this->lastColumn}{$row}"
                    )->applyFromArray([
                        'font' => [
                            'bold' => true,
                        ],

                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                            'wrapText' => true,
                        ],

                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'color' => [
                                'rgb' => 'EDEDED',
                            ],
                        ],

                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => [
                                    'rgb' => '808080',
                                ],
                            ],
                        ],
                    ]);

                    $sheet->getRowDimension($row)->setRowHeight(30);
                }

                /*
                |--------------------------------------------------------------------------
                | PAKSA HEADER TANGGAL 1 - AKHIR BULAN
                |--------------------------------------------------------------------------
                */

                $jumlahHari = cal_days_in_month(
                    CAL_GREGORIAN,
                    $this->bulan,
                    $this->tahun
                );

                foreach ([
                    $this->shiftAHeaderRow,
                    $this->shiftBHeaderRow,
                ] as $headerRow) {

                    for ($hari = 1; $hari <= $jumlahHari; $hari++) {

                        $columnNumber = 4 + $hari;

                        $column = $this->columnLetter(
                            $columnNumber
                        );

                        // Tulis angka tanggal langsung ke cell
                        $sheet->setCellValue(
                            "{$column}{$headerRow}",
                            $hari
                        );

                        // Pastikan kolom tidak tersembunyi
                        $sheet->getColumnDimension($column)
                            ->setVisible(true)
                            ->setWidth(4.2);

                        // Pastikan header tanggal terlihat
                        $sheet->getStyle(
                            "{$column}{$headerRow}"
                        )->applyFromArray([
                            'font' => [
                                'bold' => true,
                                'size' => 10,
                            ],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER,
                            ],
                        ]);
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | DATA SHIFT A
                |--------------------------------------------------------------------------
                */

                if ($this->shiftAStartRow <= $this->shiftAEndRow) {

                    $this->styleDataTable(
                        $sheet,
                        $this->shiftAStartRow,
                        $this->shiftAEndRow
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | DATA SHIFT B
                |--------------------------------------------------------------------------
                */

                if ($this->shiftBStartRow <= $this->shiftBEndRow) {

                    $this->styleDataTable(
                        $sheet,
                        $this->shiftBStartRow,
                        $this->shiftBEndRow
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | WEEKEND
                |--------------------------------------------------------------------------
                */

                $this->styleWeekendColumns(
                    $sheet,
                    $this->shiftAHeaderRow,
                    $this->shiftAEndRow
                );

                $this->styleWeekendColumns(
                    $sheet,
                    $this->shiftBHeaderRow,
                    $this->shiftBEndRow
                );

                /*
                |--------------------------------------------------------------------------
                | ABNORMALITY TITLE
                |--------------------------------------------------------------------------
                */

                $sheet->mergeCells(
                    "A{$this->abnormalityTitleRow}:{$this->lastColumn}{$this->abnormalityTitleRow}"
                );

                $sheet->getStyle(
                    "A{$this->abnormalityTitleRow}:{$this->lastColumn}{$this->abnormalityTitleRow}"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 12,
                    ],

                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],

                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'color' => [
                            'rgb' => 'FCE4D6',
                        ],
                    ],

                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => '7F7F7F',
                            ],
                        ],
                    ],
                ]);

                /*
                |--------------------------------------------------------------------------
                | ABNORMALITY HEADER
                |--------------------------------------------------------------------------
                */

                $sheet->getStyle(
                    "A{$this->abnormalityHeaderRow}:F{$this->abnormalityHeaderRow}"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],

                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],

                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'color' => [
                            'rgb' => 'EDEDED',
                        ],
                    ],

                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => '808080',
                            ],
                        ],
                    ],
                ]);

                /*
                |--------------------------------------------------------------------------
                | ABNORMALITY DATA
                |--------------------------------------------------------------------------
                */

                if (
                    $this->abnormalityStartRow <=
                    $this->abnormalityEndRow
                ) {

                    $sheet->getStyle(
                        "A{$this->abnormalityStartRow}:F{$this->abnormalityEndRow}"
                    )->applyFromArray([
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                            'wrapText' => true,
                        ],

                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => [
                                    'rgb' => 'BFBFBF',
                                ],
                            ],
                        ],
                    ]);

                    $sheet->getStyle(
                        "A{$this->abnormalityStartRow}:B{$this->abnormalityEndRow}"
                    )->getAlignment()->setHorizontal(
                        Alignment::HORIZONTAL_CENTER
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | LEBAR KOLOM
                |--------------------------------------------------------------------------
                */
                $sheet->getColumnDimension('A')->setWidth(6);
                $sheet->getColumnDimension('B')->setWidth(32);
                $sheet->getColumnDimension('C')->setWidth(20);
                $sheet->getColumnDimension('D')->setWidth(18);

                // Kolom tanggal dibuat kecil
                for (
                    $column = 5;
                    $column <= $this->lastColumnNumber;
                    $column++
                ) {
                    $letter = $this->columnLetter($column);

                    $sheet->getColumnDimension($letter)
                        ->setVisible(true)
                        ->setWidth(4.2);
                }
                                /*
                |--------------------------------------------------------------------------
                | ROW HEIGHT DATA
                |--------------------------------------------------------------------------
                */

                for ($row = 1; $row <= $highestRow; $row++) {

                    if (
                        $row !== 1 &&
                        $row !== 2 &&
                        $row !== $this->shiftATitleRow &&
                        $row !== $this->shiftAHeaderRow &&
                        $row !== $this->shiftBTitleRow &&
                        $row !== $this->shiftBHeaderRow &&
                        $row !== $this->abnormalityTitleRow &&
                        $row !== $this->abnormalityHeaderRow
                    ) {
                        $sheet->getRowDimension($row)
                            ->setRowHeight(22);
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | PAGE SETUP
                |--------------------------------------------------------------------------
                */

                $sheet->getPageSetup()
                    ->setOrientation(
                        PageSetup::ORIENTATION_LANDSCAPE
                    )
                    ->setPaperSize(
                        PageSetup::PAPERSIZE_A4
                    )
                    ->setFitToWidth(0)
                    ->setFitToHeight(0);

                $sheet->getPageMargins()
                    ->setTop(0.3)
                    ->setBottom(0.3)
                    ->setLeft(0.25)
                    ->setRight(0.25);

                // Zoom agar seluruh tanggal dalam satu bulan lebih mudah terlihat
                $sheet->getSheetView()->setZoomScale(70);

                $sheet->getPageSetup()
                    ->setPrintArea(
                        "A1:{$this->lastColumn}{$highestRow}"
                    );



                /*
                |--------------------------------------------------------------------------
                | FREEZE
                |--------------------------------------------------------------------------
                */

                // $sheet->freezePane('E1');
            },
        ];
    }

    /**
     * Style data table.
     */
    private function styleDataTable(
        $sheet,
        int $startRow,
        int $endRow
    ): void {
        $sheet->getStyle(
            "A{$startRow}:{$this->lastColumn}{$endRow}"
        )->applyFromArray([
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],

            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => [
                        'rgb' => 'BFBFBF',
                    ],
                ],
            ],
        ]);

        /*
         * No
         */
        $sheet->getStyle(
            "A{$startRow}:A{$endRow}"
        )->getAlignment()->setHorizontal(
            Alignment::HORIZONTAL_CENTER
        );

        /*
         * Tanggal
         */
        $sheet->getStyle(
            "E{$startRow}:{$this->lastColumn}{$endRow}"
        )->getAlignment()->setHorizontal(
            Alignment::HORIZONTAL_CENTER
        );

        /*
         * ✓ dibuat lebih jelas.
         */
        $sheet->getStyle(
            "E{$startRow}:{$this->lastColumn}{$endRow}"
        )->getFont()->setSize(11);
    }

    /**
     * Weekend diberi warna abu-abu tipis.
     */
    private function styleWeekendColumns(
        $sheet,
        int $headerRow,
        int $endRow
    ): void {
        if ($endRow < $headerRow) {
            return;
        }

        $jumlahHari = cal_days_in_month(
            CAL_GREGORIAN,
            $this->bulan,
            $this->tahun
        );

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {

            $tanggal = Carbon::create(
                $this->tahun,
                $this->bulan,
                $hari
            );

            if (!$tanggal->isWeekend()) {
                continue;
            }

            $columnNumber = 4 + $hari;

            $column = $this->columnLetter(
                $columnNumber
            );

            $sheet->getStyle(
                "{$column}{$headerRow}:{$column}{$endRow}"
            )->getFill()->setFillType(
                Fill::FILL_SOLID
            );

            $sheet->getStyle(
                "{$column}{$headerRow}:{$column}{$endRow}"
            )->getFill()->getStartColor()->setRGB(
                'F2F2F2'
            );
        }
    }

    /**
     * Convert nomor kolom menjadi huruf Excel.
     */
    private function columnLetter(int $column): string
    {
        $letter = '';

        while ($column > 0) {

            $remainder = ($column - 1) % 26;

            $letter =
                chr(65 + $remainder) . $letter;

            $column =
                intdiv($column - 1, 26);
        }

        return $letter;
    }
}