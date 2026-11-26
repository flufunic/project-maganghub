<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Export Checksheet Preventif (1 bulan) dengan tampilan form kertas:
 * kolom A No | B Inspection Point | C Standar | D..W ACTION #1-#4 (5 kolom each) | X Kondisi | Y Keterangan
 */
class PreventifChecksheetFormExport
{
    private const AKSI = [
        'periksa' => 'Periksa',
        'bersihkan' => 'Bersihkan',
        'lubrikasi' => 'Lubrikasi',
        'ganti' => 'Ganti',
        'perbaiki' => 'Perbaiki',
    ];

    private const MIN_BARIS_ITEM = 13;

    private const MIN_BARIS_ABN = 4;

    /**
     * @param array{
     *   nama_equipment:string, nomor_dokumen:?string, mesin:string, line:string,
     *   bulan_label:string, tanggal_label:string, pic:string,
     *   actions:array<int,array{tanggal:string,label:string}>,
     *   items:array<int,array{no:mixed,inspection_point:string,standar:?string,aksi:array,kondisi:?string,keterangan:?string}>,
     *   abnormalities:array<int,array{tanggal:string,abnormality:string,countermeasure:?string,status:string,pic:?string}>
     * } $d
     */
    public function __construct(private array $d)
    {
    }

    public function download(string $namaFile)
    {
        return response()->streamDownload(function () {
            (new Xlsx($this->build()))->save('php://output');
        }, $namaFile, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function col(int $i): string
    {
        return Coordinate::stringFromColumnIndex($i);
    }

    private function put(Worksheet $s, string $cell, $value): void
    {
        $s->setCellValueExplicit($cell, (string) $value, DataType::TYPE_STRING);
    }

    private function box(Worksheet $s, string $range): void
    {
        $s->getStyle($range)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
    }

    private function center(Worksheet $s, string $range, bool $wrap = true): void
    {
        $s->getStyle($range)->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText($wrap);
    }

    private function left(Worksheet $s, string $range): void
    {
        $s->getStyle($range)->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_LEFT)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true);
    }

    private function fill(Worksheet $s, string $range, string $rgb): void
    {
        $s->getStyle($range)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($rgb);
    }

    public function build(): Spreadsheet
    {
        $d = $this->d;

        $ss = new Spreadsheet();
        $s = $ss->getActiveSheet();
        $s->setTitle(mb_substr(preg_replace('/[\\\\\/\?\*\[\]:]/', '', $d['nama_equipment']) ?: 'Checksheet', 0, 31));
        $ss->getDefaultStyle()->getFont()->setName('Arial')->setSize(9);

        // ---------- lebar kolom ----------
        $s->getColumnDimension('A')->setWidth(4.5);
        $s->getColumnDimension('B')->setWidth(34);
        $s->getColumnDimension('C')->setWidth(18);

        for ($i = 4; $i <= 23; $i++) {
            $s->getColumnDimension($this->col($i))->setWidth(5.4);
        }

        $s->getColumnDimension('X')->setWidth(11);
        $s->getColumnDimension('Y')->setWidth(30);

        // ---------- KEPALA FORM (baris 1-5) ----------
        $s->mergeCells('A1:B5');

        $s->mergeCells('C1:P3');
        $this->put($s, 'C1', 'CHECK LIST PREVENTIF MAINTENANCE');
        $s->getStyle('C1')->getFont()->setBold(true)->setSize(14);
        $this->center($s, 'C1:P3');

        $s->mergeCells('C4:P5');
        $this->put($s, 'C4', 'NAMA EQUIPMENT: ' . $d['nama_equipment']);
        $s->getStyle('C4')->getFont()->setBold(true)->setSize(10);
        $this->left($s, 'C4:P5');

        $info = [
            1 => ['No. Dokumen', $d['nomor_dokumen'] ?? ''],
            2 => ['Tgl. Terbit', ''],
            3 => ['Tgl. Revisi', ''],
            4 => ['Revisi', ''],
            5 => ['Halaman', '1'],
        ];

        foreach ($info as $r => [$label, $nilai]) {
            $s->mergeCells("Q{$r}:R{$r}");
            $s->mergeCells("S{$r}:U{$r}");
            $this->put($s, "Q{$r}", $label);
            $this->put($s, "S{$r}", $nilai);
        }

        $this->left($s, 'Q1:U5');

        // kotak tanda tangan
        $this->put($s, 'V1', 'Disetujui');
        $this->put($s, 'W1', 'Diperiksa');
        $s->mergeCells('X1:Y1');
        $this->put($s, 'X1', 'Dibuat');
        $s->mergeCells('V2:V5');
        $s->mergeCells('W2:W5');
        $s->mergeCells('X2:Y5');
        $this->center($s, 'V1:Y5');

        $this->box($s, 'A1:Y5');

        // ---------- IDENTITAS (baris 7-11) ----------
        $identitas = [
            7 => ['NAMA MESIN', $d['mesin']],
            8 => ['LINE', $d['line']],
            9 => ['BULAN', $d['bulan_label']],
            10 => ['HARI/TANGGAL', $d['tanggal_label']],
            11 => ['PIC PELAKSANA', $d['pic']],
        ];

        foreach ($identitas as $r => [$label, $nilai]) {
            $this->put($s, "B{$r}", $label);
            $s->getStyle("B{$r}")->getFont()->setBold(true);

            $s->mergeCells("C{$r}:L{$r}");
            $this->put($s, "C{$r}", ': ' . $nilai);
            $s->getStyle("C{$r}:L{$r}")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_DOTTED);
            $this->left($s, "C{$r}:L{$r}");
        }

        // ---------- HEADER TABEL (baris 13-14) ----------
        $h1 = 13;
        $h2 = 14;

        foreach (['A' => 'No', 'B' => 'Inspection Point', 'C' => 'Standar', 'X' => 'Kondisi terakhir', 'Y' => 'Keterangan'] as $c => $t) {
            $s->mergeCells("{$c}{$h1}:{$c}{$h2}");
            $this->put($s, "{$c}{$h1}", $t);
        }

        for ($k = 0; $k < 4; $k++) {
            $c1 = 4 + $k * 5;
            $awal = $this->col($c1);
            $akhir = $this->col($c1 + 4);

            $s->mergeCells("{$awal}{$h1}:{$akhir}{$h1}");

            $judul = 'ACTION #' . ($k + 1);

            if (isset($d['actions'][$k])) {
                $judul .= "\n" . $d['actions'][$k]['label'];
            }

            $this->put($s, "{$awal}{$h1}", $judul);

            $j = 0;

            foreach (self::AKSI as $label) {
                $cell = $this->col($c1 + $j) . $h2;
                $this->put($s, $cell, $label);
                $s->getStyle($cell)->getAlignment()->setTextRotation(90);
                $j++;
            }
        }

        $s->getRowDimension($h1)->setRowHeight(30);
        $s->getRowDimension($h2)->setRowHeight(52);

        $s->getStyle("A{$h1}:Y{$h2}")->getFont()->setBold(true);
        $this->center($s, "A{$h1}:Y{$h2}");
        $this->fill($s, "A{$h1}:Y{$h2}", 'E7E6E6');
        $this->box($s, "A{$h1}:Y{$h2}");

        // ---------- ISI TABEL ----------
        $mulai = $h2 + 1;
        $jumlah = max(count($d['items']), self::MIN_BARIS_ITEM);

        for ($i = 0; $i < $jumlah; $i++) {
            $r = $mulai + $i;
            $item = $d['items'][$i] ?? null;

            $this->put($s, "A{$r}", $item['no'] ?? ($i + 1));
            $s->getRowDimension($r)->setRowHeight(22);

            if (! $item) {
                continue;
            }

            $this->put($s, "B{$r}", $item['inspection_point']);
            $this->put($s, "C{$r}", $item['standar'] ?? '');

            foreach ($d['actions'] as $k => $act) {
                $pilih = $item['aksi'][$act['tanggal']] ?? null;

                if (! $pilih) {
                    continue;
                }

                $j = array_search($pilih, array_keys(self::AKSI), true);

                if ($j !== false) {
                    $this->put($s, $this->col(4 + $k * 5 + $j) . $r, '✓');
                }
            }

            $this->put($s, "X{$r}", $item['kondisi'] ?? '');
            $this->put($s, "Y{$r}", $item['keterangan'] ?? '');
        }

        $akhirItem = $mulai + $jumlah - 1;

        $this->center($s, "A{$mulai}:A{$akhirItem}");
        $this->left($s, "B{$mulai}:C{$akhirItem}");
        $this->center($s, "D{$mulai}:X{$akhirItem}");
        $this->left($s, "Y{$mulai}:Y{$akhirItem}");
        $s->getStyle("X{$mulai}:X{$akhirItem}")->getFont()->setBold(true);

        // Inspect By / Approved
        $rIns = $akhirItem + 1;
        $rApp = $akhirItem + 2;

        $this->put($s, "C{$rIns}", 'Inspect By');
        $this->put($s, "C{$rApp}", 'Approved');
        $s->getRowDimension($rIns)->setRowHeight(24);
        $s->getRowDimension($rApp)->setRowHeight(24);
        $this->center($s, "C{$rIns}:C{$rApp}");

        $this->box($s, "A{$mulai}:Y{$rApp}");

        // ---------- TABEL ABNORMALITY + STANDARD PENGECEKAN ----------
        $ah = $rApp + 2;

        $kolom = [
            ['A', 'B', 'Date'],
            ['C', 'K', 'Abnormality'],
            ['L', 'S', 'Countermeasure'],
            ['T', 'U', 'Status'],
            ['V', 'W', 'PIC'],
        ];

        foreach ($kolom as [$a, $b, $t]) {
            $s->mergeCells("{$a}{$ah}:{$b}{$ah}");
            $this->put($s, "{$a}{$ah}", $t);
        }

        $s->getStyle("A{$ah}:W{$ah}")->getFont()->setBold(true);
        $this->center($s, "A{$ah}:W{$ah}");
        $this->fill($s, "A{$ah}:W{$ah}", 'BDD7EE');

        $n = max(count($d['abnormalities']), self::MIN_BARIS_ABN);

        for ($i = 0; $i < $n; $i++) {
            $r = $ah + 1 + $i;
            $abn = $d['abnormalities'][$i] ?? null;

            foreach ($kolom as [$a, $b]) {
                $s->mergeCells("{$a}{$r}:{$b}{$r}");
            }

            $s->getRowDimension($r)->setRowHeight($abn ? 32 : 20);

            if ($abn) {
                $this->put($s, "A{$r}", $abn['tanggal']);
                $this->put($s, "C{$r}", $abn['abnormality']);
                $this->put($s, "L{$r}", $abn['countermeasure'] ?? '');
                $this->put($s, "T{$r}", $abn['status']);
                $this->put($s, "V{$r}", $abn['pic'] ?? '');
            }
        }

        $akhirAbn = $ah + $n;

        $this->left($s, 'A' . ($ah + 1) . ":W{$akhirAbn}");
        $this->center($s, 'A' . ($ah + 1) . ':B' . $akhirAbn);
        $this->center($s, 'T' . ($ah + 1) . ':U' . $akhirAbn);
        $this->box($s, "A{$ah}:W{$akhirAbn}");

        // Standard Pengecekan
        $s->mergeCells("X{$ah}:Y{$ah}");
        $this->put($s, "X{$ah}", 'Standard Pengecekan');
        $this->put($s, 'X' . ($ah + 1), 'NORMAL');
        $this->put($s, 'Y' . ($ah + 1), 'OK');
        $this->put($s, 'X' . ($ah + 2), 'RUSAK');
        $this->put($s, 'Y' . ($ah + 2), 'NG');

        $s->getStyle("X{$ah}")->getFont()->setBold(true);
        $this->fill($s, "X{$ah}:Y{$ah}", 'BDD7EE');
        $this->center($s, "X{$ah}:Y" . ($ah + 2));
        $this->box($s, "X{$ah}:Y" . ($ah + 2));

        // ---------- CETAK ----------
        $s->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
        $s->getPageSetup()->setPrintArea("A1:Y{$akhirAbn}");
        $s->getSheetView()->setZoomScale(90);
        $s->setShowGridlines(false);

        return $ss;
    }
}