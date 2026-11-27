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

        // jumlah blok tanggal (minimal 4 supaya bentuk kertas tetap)
        $B = max(4, count($d['actions']));
        $last = 3 + 6 * $B + 1;          // indeks kolom Keterangan
        $cL = $this->col($last);         // huruf kolom terakhir
        $cKet = $cL;

        $ss = new Spreadsheet();
        $s = $ss->getActiveSheet();
        $s->setTitle(mb_substr(preg_replace('/[\\\\\/\?\*\[\]:]/', '', $d['nama_equipment']) ?: 'Checksheet', 0, 31));
        $ss->getDefaultStyle()->getFont()->setName('Arial')->setSize(9);

        // ---------- lebar kolom ----------
        $s->getColumnDimension('A')->setWidth(4.5);
        $s->getColumnDimension('B')->setWidth(34);
        $s->getColumnDimension('C')->setWidth(18);

        for ($i = 4; $i < $last; $i++) {
            // kolom ke-6 di tiap blok = Kondisi
            $s->getColumnDimension($this->col($i))->setWidth(($i - 3) % 6 === 0 ? 7.5 : 5.4);
        }

        $s->getColumnDimension($cKet)->setWidth(30);

        // ---------- KEPALA FORM (baris 1-5) ----------
        $cJudulAkhir = $this->col($last - 9);

        $s->mergeCells('A1:B5');

        $s->mergeCells("C1:{$cJudulAkhir}3");
        $this->put($s, 'C1', 'CHECK LIST PREVENTIF MAINTENANCE');
        $s->getStyle('C1')->getFont()->setBold(true)->setSize(14);
        $this->center($s, "C1:{$cJudulAkhir}3");

        $s->mergeCells("C4:{$cJudulAkhir}5");
        $this->put($s, 'C4', 'NAMA EQUIPMENT: ' . $d['nama_equipment']);
        $s->getStyle('C4')->getFont()->setBold(true)->setSize(10);
        $this->left($s, "C4:{$cJudulAkhir}5");

        $iL1 = $this->col($last - 8);
        $iL2 = $this->col($last - 7);
        $iV1 = $this->col($last - 6);
        $iV2 = $this->col($last - 4);

        $info = [
            1 => ['No. Dokumen', $d['nomor_dokumen'] ?? ''],
            2 => ['Tgl. Terbit', ''],
            3 => ['Tgl. Revisi', ''],
            4 => ['Revisi', ''],
            5 => ['Halaman', '1'],
        ];

        foreach ($info as $r => [$label, $nilai]) {
            $s->mergeCells("{$iL1}{$r}:{$iL2}{$r}");
            $s->mergeCells("{$iV1}{$r}:{$iV2}{$r}");
            $this->put($s, "{$iL1}{$r}", $label);
            $this->put($s, "{$iV1}{$r}", $nilai);
        }

        $this->left($s, "{$iL1}1:{$iV2}5");

        // kotak tanda tangan
        $tD = $this->col($last - 3);
        $tP = $this->col($last - 2);
        $tB1 = $this->col($last - 1);

        $this->put($s, "{$tD}1", 'Disetujui');
        $this->put($s, "{$tP}1", 'Diperiksa');
        $s->mergeCells("{$tB1}1:{$cL}1");
        $this->put($s, "{$tB1}1", 'Dibuat');
        $s->mergeCells("{$tD}2:{$tD}5");
        $s->mergeCells("{$tP}2:{$tP}5");
        $s->mergeCells("{$tB1}2:{$cL}5");
        $this->center($s, "{$tD}1:{$cL}5");

        $this->box($s, "A1:{$cL}5");

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

            $s->mergeCells("C{$r}:P{$r}");
            $this->put($s, "C{$r}", ': ' . $nilai);
            $s->getStyle("C{$r}:P{$r}")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_DOTTED);
            $this->left($s, "C{$r}:P{$r}");
        }

        // ---------- HEADER TABEL (baris 13-14) ----------
        $h1 = 13;
        $h2 = 14;

        foreach (['A' => 'No', 'B' => 'Inspection Point', 'C' => 'Standar', $cKet => 'Keterangan'] as $c => $t) {
            $s->mergeCells("{$c}{$h1}:{$c}{$h2}");
            $this->put($s, "{$c}{$h1}", $t);
        }

        for ($k = 0; $k < $B; $k++) {
            $c1 = 4 + $k * 6;
            $awal = $this->col($c1);
            $akhirBlok = $this->col($c1 + 5);

            $s->mergeCells("{$awal}{$h1}:{$akhirBlok}{$h1}");

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

            // kolom Kondisi milik blok ini
            $cellK = $this->col($c1 + 5) . $h2;
            $this->put($s, $cellK, 'Kondisi');
            $s->getStyle($cellK)->getAlignment()->setTextRotation(90);
        }

        $s->getRowDimension($h1)->setRowHeight(30);
        $s->getRowDimension($h2)->setRowHeight(52);

        $s->getStyle("A{$h1}:{$cL}{$h2}")->getFont()->setBold(true);
        $this->center($s, "A{$h1}:{$cL}{$h2}");
        $this->fill($s, "A{$h1}:{$cL}{$h2}", 'E7E6E6');
        $this->box($s, "A{$h1}:{$cL}{$h2}");

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

            $ketGabung = [];

            foreach ($d['actions'] as $k => $act) {
                $c1 = 4 + $k * 6;
                $tgl = $act['tanggal'];

                $pilih = $item['aksi'][$tgl] ?? null;

                if ($pilih) {
                    $j = array_search($pilih, array_keys(self::AKSI), true);

                    if ($j !== false) {
                        $this->put($s, $this->col($c1 + $j) . $r, '✓');
                    }
                }

                // Kondisi tanggal ini
                $this->put($s, $this->col($c1 + 5) . $r, $item['kondisi'][$tgl] ?? '');

                if (filled($item['keterangan'][$tgl] ?? null)) {
                    $ketGabung[$tgl] = $item['keterangan'][$tgl];
                }
            }

            // Keterangan: kalau lebih dari 1 tanggal, diberi awalan dd/mm
            $teks = [];

            foreach ($ketGabung as $tgl => $isi) {
                $teks[] = count($ketGabung) > 1
                    ? substr($tgl, 8, 2) . '/' . substr($tgl, 5, 2) . ': ' . $isi
                    : $isi;
            }

            $this->put($s, "{$cKet}{$r}", implode("\n", $teks));
        }

        $akhirItem = $mulai + $jumlah - 1;

        $cTengahAkhir = $this->col($last - 1);

        $this->center($s, "A{$mulai}:A{$akhirItem}");
        $this->left($s, "B{$mulai}:C{$akhirItem}");
        $this->center($s, "D{$mulai}:{$cTengahAkhir}{$akhirItem}");
        $this->left($s, "{$cKet}{$mulai}:{$cKet}{$akhirItem}");

        // Kondisi (kolom ke-6 tiap blok) dibuat tebal
        for ($k = 0; $k < $B; $k++) {
            $ck = $this->col(4 + $k * 6 + 5);
            $s->getStyle("{$ck}{$mulai}:{$ck}{$akhirItem}")->getFont()->setBold(true);
        }

        // Inspect By / Approved
        $rIns = $akhirItem + 1;
        $rApp = $akhirItem + 2;

        $this->put($s, "C{$rIns}", 'Inspect By');
        $this->put($s, "C{$rApp}", 'Approved');
        $s->getRowDimension($rIns)->setRowHeight(24);
        $s->getRowDimension($rApp)->setRowHeight(24);
        $this->center($s, "C{$rIns}:C{$rApp}");

        $this->box($s, "A{$mulai}:{$cL}{$rApp}");

        // ---------- TABEL ABNORMALITY + STANDARD PENGECEKAN ----------
        $ah = $rApp + 2;

        $cStdA = $this->col($last - 1);   // Standard Pengecekan: 2 kolom terakhir
        $cPicAkhir = $this->col($last - 2);

        $kolom = [
            ['A', 'B', 'Date'],
            ['C', 'K', 'Abnormality'],
            ['L', 'S', 'Countermeasure'],
            ['T', 'U', 'Status'],
            ['V', $cPicAkhir, 'PIC'],
        ];

        foreach ($kolom as [$a, $b, $t]) {
            $s->mergeCells("{$a}{$ah}:{$b}{$ah}");
            $this->put($s, "{$a}{$ah}", $t);
        }

        $s->getStyle("A{$ah}:{$cPicAkhir}{$ah}")->getFont()->setBold(true);
        $this->center($s, "A{$ah}:{$cPicAkhir}{$ah}");
        $this->fill($s, "A{$ah}:{$cPicAkhir}{$ah}", 'BDD7EE');

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

        $this->left($s, 'A' . ($ah + 1) . ":{$cPicAkhir}{$akhirAbn}");
        $this->center($s, 'A' . ($ah + 1) . ':B' . $akhirAbn);
        $this->center($s, 'T' . ($ah + 1) . ':U' . $akhirAbn);
        $this->box($s, "A{$ah}:{$cPicAkhir}{$akhirAbn}");

        // Standard Pengecekan
        $s->mergeCells("{$cStdA}{$ah}:{$cL}{$ah}");
        $this->put($s, "{$cStdA}{$ah}", 'Standard Pengecekan');
        $this->put($s, $cStdA . ($ah + 1), 'NORMAL');
        $this->put($s, $cL . ($ah + 1), 'OK');
        $this->put($s, $cStdA . ($ah + 2), 'RUSAK');
        $this->put($s, $cL . ($ah + 2), 'NG');

        $s->getStyle("{$cStdA}{$ah}")->getFont()->setBold(true);
        $this->fill($s, "{$cStdA}{$ah}:{$cL}{$ah}", 'BDD7EE');
        $this->center($s, "{$cStdA}{$ah}:{$cL}" . ($ah + 2));
        $this->box($s, "{$cStdA}{$ah}:{$cL}" . ($ah + 2));

        // ---------- CETAK ----------
        $s->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
        $s->getPageSetup()->setPrintArea("A1:{$cL}{$akhirAbn}");
        $s->getSheetView()->setZoomScale(90);
        $s->setShowGridlines(false);

        return $ss;
    }
}