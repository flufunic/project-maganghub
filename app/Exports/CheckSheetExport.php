<?php

namespace App\Exports;

use App\Models\CheckSheet;
use App\Models\Line;
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
    protected ?int $lineId;

    // Mode KWH: tiap tanggal = 3 kolom (Act, Sel, Catatan). Mode biasa: 1 kolom (centang).
    protected bool $pakaiActual = false;
    protected int $perTanggal = 1;

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

    // Sel yang perlu diberi warna (diisi saat array() dibuat)
    protected array $redCells = [];     // selisih tidak 0
    protected array $manualCells = [];  // actual dikoreksi manual

    public function __construct($checkSheetId, $bulan, $tahun, $lineId = null)
    {
        $this->checkSheetId = $checkSheetId;
        $this->bulan = (int) $bulan;
        $this->tahun = (int) $tahun;
        $this->lineId = $lineId ? (int) $lineId : null;

        $this->pakaiActual = (bool) CheckSheet::whereKey($checkSheetId)
            ->value('pakai_actual');

        $this->perTanggal = $this->pakaiActual ? 3 : 1;

        $jumlahHari = cal_days_in_month(
            CAL_GREGORIAN,
            $this->bulan,
            $this->tahun
        );

        // A-D = informasi item
        // E dst = tanggal (1 kolom per tanggal, atau 3 kolom di mode KWH)
        $this->lastColumnNumber = 4 + ($jumlahHari * $this->perTanggal);
        $this->lastColumn = $this->columnLetter(
            $this->lastColumnNumber
        );
    }

    /**
     * Nomor kolom untuk tanggal $hari.
     * $sub: 0 = Act (atau centang), 1 = Sel, 2 = Catatan.
     */
    private function dayColumn(int $hari, int $sub = 0): int
    {
        return 4 + (($hari - 1) * $this->perTanggal) + 1 + $sub;
    }

    /**
     * Membuat seluruh isi Excel sebagai array.
     */
    public function array(): array
    {
        $this->redCells = [];
        $this->manualCells = [];

        // Rentang tanggal bulan yang diexport
        $awalBulan = Carbon::create($this->tahun, $this->bulan, 1)->startOfMonth();
        $akhirBulan = $awalBulan->copy()->endOfMonth();

        $checkSheet = CheckSheet::with([
            'divisi',

            'items' => function ($query) {
                $query->orderBy('shift')->orderBy('no')->orderBy('id');
            },

            // centang / nilai HANYA milik line / mesin yang diexport
            'items.checklists' => function ($query) {
                $query
                    ->where('line_id', $this->lineId)
                    ->whereMonth('tanggal', $this->bulan)
                    ->whereYear('tanggal', $this->tahun)
                    ->orderBy('tanggal');
            },

            // abnormality HANYA milik line / mesin yang diexport, bulan & tahun yang dipilih
            'abnormalities' => function ($query) use ($awalBulan, $akhirBulan) {
                $query
                    ->where('line_id', $this->lineId)
                    ->whereBetween('tanggal', [
                        $awalBulan->toDateString(),
                        $akhirBulan->toDateString(),
                    ])
                    ->orderBy('tanggal')
                    ->orderBy('id');
            },

        ])->findOrFail($this->checkSheetId);

        $line = $this->lineId ? Line::find($this->lineId) : null;

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
            . ($line ? '     |     Mesin/Line: ' . $line->nama_line : '')
            . '     |     Bulan: ' . $namaBulan
            . ($this->pakaiActual
                ? '     |     Kuning = Actual dikoreksi manual, Merah = ada selisih'
                : ''),
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

        if ($this->pakaiActual) {
            $rows[] = $this->makeSubHeader($jumlahHari);
        }

        $this->shiftAStartRow = count($rows) + 1;

        foreach ($itemsShiftA as $item) {
            $rows[] = $this->makeItemRow(
                $item,
                $jumlahHari,
                count($rows) + 1
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

        if ($this->pakaiActual) {
            $rows[] = $this->makeSubHeader($jumlahHari);
        }

        $this->shiftBStartRow = count($rows) + 1;

        foreach ($itemsShiftB as $item) {
            $rows[] = $this->makeItemRow(
                $item,
                $jumlahHari,
                count($rows) + 1
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
        | ABNORMALITY (hanya bulan yang diexport)
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
     * Mode KWH: angka tanggal ditaruh di kolom pertama, lalu di-merge 3 kolom.
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

            if ($this->pakaiActual) {
                $row[] = '';
                $row[] = '';
            }
        }

        return $this->makeRow($row);
    }

    /**
     * Baris header kedua (khusus KWH): Act / Sel / Catatan per tanggal.
     */
    private function makeSubHeader(int $jumlahHari): array
    {
        $row = ['', '', '', ''];

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {
            $row[] = 'Act';
            $row[] = 'Sel';
            $row[] = 'Catatan';
        }

        return $this->makeRow($row);
    }

    /**
     * Hitung Actual / Selisih / Catatan tiap tanggal untuk satu item.
     * Aturan sama dengan di halaman web:
     * Actual otomatis hari ini = actual kemarin - selisih kemarin.
     * Actual yang tersimpan (tgl 1 / koreksi manual) menimpa hitungan otomatis.
     */
    private function hitungNilai($item, int $jumlahHari): array
    {
        $hasil = [];
        $prev = null;

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {
            $tanggal = Carbon::create($this->tahun, $this->bulan, $hari);

            $c = $item->checklists->first(
                function ($checklist) use ($tanggal) {
                    return $checklist->tanggal
                        && Carbon::parse($checklist->tanggal)->isSameDay($tanggal);
                }
            );

            $auto = ($prev && $prev['selisih'] !== null)
                ? round($prev['actual'] - $prev['selisih'], 2)
                : null;

            $stored = ($c && $c->actual !== null) ? (float) $c->actual : null;
            $selisih = ($c && $c->selisih !== null) ? (float) $c->selisih : null;

            $actual = $stored ?? $auto;

            $hasil[$hari] = [
                'actual'  => $actual,
                'selisih' => $selisih,
                'catatan' => $c->catatan ?? '',
                'manual'  => $stored !== null
                    && $auto !== null
                    && abs($stored - $auto) > 0.00001,
            ];

            $prev = $actual !== null
                ? ['actual' => $actual, 'selisih' => $selisih]
                : null;
        }

        return $hasil;
    }

    /**
     * Data inspection point.
     */
    private function makeItemRow($item, int $jumlahHari, int $rowNumber): array
    {
        $row = [
            $item->no,
            $item->inspection_point,
            $item->condition ?? '',
            $item->method ?? '',
        ];

        /*
         * MODE KWH: Act / Sel / Catatan
         */
        if ($this->pakaiActual) {
            $nilai = $this->hitungNilai($item, $jumlahHari);

            for ($hari = 1; $hari <= $jumlahHari; $hari++) {
                $n = $nilai[$hari];

                $row[] = $n['actual'] ?? '';
                $row[] = $n['selisih'] ?? '';
                $row[] = $n['catatan'] ?? '';

                if ($n['manual']) {
                    $this->manualCells[] =
                        $this->columnLetter($this->dayColumn($hari, 0)) . $rowNumber;
                }

                if ($n['selisih'] !== null && abs($n['selisih']) > 0.00001) {
                    $this->redCells[] =
                        $this->columnLetter($this->dayColumn($hari, 1)) . $rowNumber;
                }
            }

            return $this->makeRow($row);
        }

        /*
         * MODE BIASA: centang
         */
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

                // jumlah baris header tabel (2 di mode KWH, 1 di mode biasa)
                $headerSpan = $this->pakaiActual ? 2 : 1;

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

                    $rowEnd = $row + $headerSpan - 1;

                    $sheet->getStyle(
                        "A{$row}:{$this->lastColumn}{$rowEnd}"
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

                    if ($this->pakaiActual) {
                        $sheet->getRowDimension($rowEnd)->setRowHeight(20);

                        // No, Inspection Point, Condition, Method: gabung 2 baris header
                        foreach (['A', 'B', 'C', 'D'] as $col) {
                            $sheet->mergeCells("{$col}{$row}:{$col}{$rowEnd}");
                        }
                    }
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

                        $column = $this->columnLetter(
                            $this->dayColumn($hari, 0)
                        );

                        // Tulis angka tanggal langsung ke cell
                        $sheet->setCellValue(
                            "{$column}{$headerRow}",
                            $hari
                        );

                        // Mode KWH: tanggal digabung selebar 3 kolom
                        if ($this->pakaiActual) {
                            $columnAkhir = $this->columnLetter(
                                $this->dayColumn($hari, 2)
                            );

                            $sheet->mergeCells(
                                "{$column}{$headerRow}:{$columnAkhir}{$headerRow}"
                            );
                        }

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
                | WARNA KHUSUS KWH (setelah weekend, supaya tidak tertimpa)
                |--------------------------------------------------------------------------
                */

                foreach ($this->manualCells as $cell) {
                    $sheet->getStyle($cell)->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('FFE699');

                    $sheet->getStyle($cell)->getFont()->setBold(true);
                }

                foreach ($this->redCells as $cell) {
                    $sheet->getStyle($cell)->getFont()
                        ->setBold(true)
                        ->getColor()->setRGB('C00000');
                }

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

                // Kolom tanggal
                for ($hari = 1; $hari <= $jumlahHari; $hari++) {

                    if ($this->pakaiActual) {
                        // Act, Sel, Catatan
                        $lebar = [9, 7, 16];

                        for ($sub = 0; $sub < 3; $sub++) {
                            $letter = $this->columnLetter(
                                $this->dayColumn($hari, $sub)
                            );

                            $sheet->getColumnDimension($letter)
                                ->setVisible(true)
                                ->setWidth($lebar[$sub]);
                        }
                    } else {
                        $letter = $this->columnLetter(
                            $this->dayColumn($hari, 0)
                        );

                        $sheet->getColumnDimension($letter)
                            ->setVisible(true)
                            ->setWidth(4.2);
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | ROW HEIGHT DATA
                |--------------------------------------------------------------------------
                */

                $barisKhusus = [
                    1,
                    2,
                    3,
                    $this->shiftATitleRow,
                    $this->shiftBTitleRow,
                    $this->abnormalityTitleRow,
                    $this->abnormalityHeaderRow,
                ];

                foreach ([
                    $this->shiftAHeaderRow,
                    $this->shiftBHeaderRow,
                ] as $headerRow) {
                    for ($i = 0; $i < $headerSpan; $i++) {
                        $barisKhusus[] = $headerRow + $i;
                    }
                }

                for ($row = 1; $row <= $highestRow; $row++) {

                    if (! in_array($row, $barisKhusus, true)) {
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
         * ✓ dibuat lebih jelas (mode biasa) / angka (mode KWH).
         */
        $sheet->getStyle(
            "E{$startRow}:{$this->lastColumn}{$endRow}"
        )->getFont()->setSize($this->pakaiActual ? 10 : 11);

        /*
         * Mode KWH: kolom Catatan rata kiri dan font kecil
         */
        if ($this->pakaiActual) {
            $jumlahHari = cal_days_in_month(
                CAL_GREGORIAN,
                $this->bulan,
                $this->tahun
            );

            for ($hari = 1; $hari <= $jumlahHari; $hari++) {
                $col = $this->columnLetter($this->dayColumn($hari, 2));

                $sheet->getStyle("{$col}{$startRow}:{$col}{$endRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->getStyle("{$col}{$startRow}:{$col}{$endRow}")
                    ->getFont()
                    ->setSize(9);
            }
        }
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

            // semua kolom milik tanggal ini (1 atau 3 kolom)
            for ($sub = 0; $sub < $this->perTanggal; $sub++) {

                $column = $this->columnLetter(
                    $this->dayColumn($hari, $sub)
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
