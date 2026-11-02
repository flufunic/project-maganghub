<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class JokenExport
{
    // Palet formal: hitam, abu-abu, putih
    private const BLACK = '000000';
    private const GRAY  = '808080'; // garis sel
    private const MUTED = '595959'; // label kecil
    private const HEAD  = 'F2F2F2'; // latar header tabel & judul section
    private const DASH  = 'A6A6A6'; // tanda "–" untuk data kosong

    // Tiap foto menempati satu "slot" di dalam sel (ditumpuk ke bawah)
    private const SLOT_PX = 76;
    private const SLOT_PT = 57;

    private const PRODUKSI = [['line', 'Line'], ['model', 'Model'], ['pic', 'PIC'], ['no_line', 'No Line']];
    private const PART = [
        ['supplier', 'Supplier'],
        ['part_name', 'Part Name'],
        ['part_number', 'Part Number'],
        ['mfg_location', 'MFG. Location'],
    ];

    /** @var array<int,float> lebar kolom (karakter) per index kolom */
    private array $widths = [];

    public function __construct(private array $joken)
    {
    }

    public function build(): Spreadsheet
    {
        $j     = $this->joken;
        $kolom = array_values($this->arr($j['kolom'] ?? []));
        $rows  = array_values($j['rows'] ?? []);
        $nKol  = count($kolom);

        $tLast   = 4 + $nKol;
        $last    = max($tLast, 8);
        $tCol    = Coordinate::stringFromColumnIndex($tLast);
        $lastCol = Coordinate::stringFromColumnIndex($last);
        $noReg   = (string) ($j['no_registrasi'] ?? '');

        $book  = new Spreadsheet();
        $sheet = $book->getActiveSheet();
        $sheet->setTitle('Joken');
        $sheet->setShowGridlines(false);
        $sheet->getSheetView()->setZoomScale(90);
        $book->getDefaultStyle()->getFont()->setName('Arial')->setSize(10)->getColor()->setARGB('FF' . self::BLACK);
        $book->getProperties()->setCreator('MMS')->setTitle('Joken ' . $noReg);

        // ===== Lebar kolom =====
        $this->widths = [1 => 13, 2 => 36, 3 => 22, 4 => 18];
        foreach ($kolom as $i => $k) {
            $px      = (float) ($k['lebar'] ?? $k['width'] ?? 0);
            $default = ($k['type'] ?? '') === 'image' ? 26 : 22;
            $this->widths[5 + $i] = $px > 0 ? min(40, max(16, $px / 7)) : $default;
        }
        for ($i = 5; $i <= $last; $i++) {
            $this->widths[$i] ??= 16;
        }
        foreach ($this->widths as $i => $w) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setWidth($w);
        }

        // ===== KOP DOKUMEN (baris 1-2) =====
        $leftEnd  = Coordinate::stringFromColumnIndex($last - 2);
        $rightBeg = Coordinate::stringFromColumnIndex($last - 1);

        $sheet->mergeCells('A1:A2');
        $sheet->mergeCells("B1:{$leftEnd}1");
        $sheet->mergeCells("B2:{$leftEnd}2");
        $sheet->mergeCells("{$rightBeg}1:{$lastCol}1");
        $sheet->mergeCells("{$rightBeg}2:{$lastCol}2");

        $sheet->setCellValue('B1', 'DOKUMEN STANDARISASI');
        $this->str($sheet, 'B2', (string) ($j['judul'] ?? ''));
        $sheet->setCellValue("{$rightBeg}1", 'NO. REGISTRASI');
        $this->str($sheet, "{$rightBeg}2", $noReg);

        $this->box($sheet, "A1:{$lastCol}2", self::BLACK);
        $sheet->getStyle("A1:{$lastCol}2")->getBorders()->getOutline()->setBorderStyle(Border::BORDER_MEDIUM);

        $sheet->getStyle('B1')->applyFromArray(['font' => ['bold' => true, 'size' => 9, 'color' => ['argb' => 'FF' . self::MUTED]]]);
        $sheet->getStyle('B2')->applyFromArray(['font' => ['bold' => true, 'size' => 15]]);
        $sheet->getStyle("{$rightBeg}1")->applyFromArray(['font' => ['bold' => true, 'size' => 8, 'color' => ['argb' => 'FF' . self::MUTED]]]);
        $sheet->getStyle("{$rightBeg}2")->applyFromArray(['font' => ['bold' => true, 'size' => 12]]);
        $sheet->getStyle("A1:{$lastCol}2")->getAlignment()
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(20);
        $sheet->getRowDimension(2)->setRowHeight(34);
        $sheet->getRowDimension(3)->setRowHeight(12);

        $logo = public_path('images/logo-mms.png');
        if (is_file($logo)) {
            $d = new Drawing();
            $d->setPath($logo);
            $d->setCoordinates('A1');
            $d->setHeight(44);
            $d->setOffsetX(12);
            $d->setOffsetY(7);
            $d->setWorksheet($sheet);
        }

        // ===== IDENTITAS (baris 4-8) =====
        $this->sectionTitle($sheet, 'A4:B4', 'IDENTITAS PRODUKSI');
        $this->sectionTitle($sheet, 'C4:G4', 'IDENTITAS PART');

        foreach (self::PRODUKSI as $n => [$key, $label]) {
            $r = 5 + $n;
            $sheet->setCellValue("A{$r}", $label);
            $this->str($sheet, "B{$r}", (string) ($j[$key] ?? ''));
            $this->labelValue($sheet, "A{$r}", "B{$r}", "A{$r}:B{$r}");
        }
        foreach (self::PART as $n => [$key, $label]) {
            $r = 5 + $n;
            $sheet->mergeCells("D{$r}:G{$r}");
            $sheet->setCellValue("C{$r}", $label);
            $this->str($sheet, "D{$r}", (string) ($j[$key] ?? ''));
            $this->labelValue($sheet, "C{$r}", "D{$r}", "C{$r}:G{$r}");
        }
        for ($r = 5; $r <= 8; $r++) {
            $sheet->getRowDimension($r)->setRowHeight(22);
        }
        $sheet->getRowDimension(9)->setRowHeight(14);

        // ===== JUDUL TABEL (baris 10) =====
        $sheet->mergeCells("A10:{$lastCol}10");
        $sheet->setCellValue('A10', 'DETAIL STANDARISASI   ·   ' . count($rows) . ' proses');
        $sheet->getStyle('A10')->applyFromArray(['font' => ['bold' => true, 'size' => 11]]);
        $sheet->getStyle('A10')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setIndent(1);
        $sheet->getStyle("A10:{$lastCol}10")->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setARGB('FF' . self::BLACK);
        $sheet->getRowDimension(10)->setRowHeight(24);

        // ===== HEADER TABEL (baris 11-12) =====
        $h1 = 11;
        $h2 = 12;

        $this->fill($sheet, "A{$h1}:{$tCol}{$h2}", self::HEAD);
        $this->box($sheet, "A{$h1}:{$tCol}{$h2}", self::GRAY);
        $sheet->getStyle("A{$h1}:{$tCol}{$h2}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10],
        ]);
        $sheet->getStyle("A{$h1}:{$tCol}{$h2}")->getAlignment()
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setWrapText(true);

        foreach (['A' => 'QCPC', 'B' => 'Proses', 'C' => 'Model Material', 'D' => 'Type Mesin'] as $col => $text) {
            $sheet->mergeCells("{$col}{$h1}:{$col}{$h2}");
            $sheet->setCellValue("{$col}{$h1}", $text);
            $sheet->getStyle("{$col}{$h1}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_LEFT)->setIndent(1);
        }

        $labelLines = 1;
        foreach ($kolom as $i => $k) {
            $col   = Coordinate::stringFromColumnIndex(5 + $i);
            $label = (string) ($k['label'] ?? '');
            $sheet->setCellValue("{$col}{$h1}", $i + 1);
            $this->str($sheet, "{$col}{$h2}", $label);
            $labelLines = max($labelLines, min(3, $this->lines($label, $this->widths[5 + $i] - 2)));
        }
        if ($nKol > 0) {
            $sheet->getStyle("E{$h1}:{$tCol}{$h1}")->applyFromArray([
                'font' => ['bold' => false, 'size' => 9, 'color' => ['argb' => 'FF' . self::MUTED]],
            ]);
        }
        $sheet->getRowDimension($h1)->setRowHeight(18);
        $sheet->getRowDimension($h2)->setRowHeight(max(26, $labelLines * 14 + 10));

        // ===== BARIS DATA =====
        $start = $h2 + 1;
        $r     = $start;

        foreach ($rows as $row) {
            $nilai = $this->arr($row['nilai'] ?? []);

            $this->box($sheet, "A{$r}:{$tCol}{$r}", self::GRAY);
            $sheet->getStyle("A{$r}:{$tCol}{$r}")->getAlignment()
                ->setVertical(Alignment::VERTICAL_CENTER)
                ->setWrapText(true);
            $sheet->getStyle("A{$r}:D{$r}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_LEFT)->setIndent(1);
            $sheet->getStyle("A{$r}")->getFont()->setBold(true);
            if ($nKol > 0) {
                $sheet->getStyle("E{$r}:{$tCol}{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            $maxLines = 1;
            $fixed = [1 => $row['qcpc'] ?? '', 2 => $row['proses'] ?? '', 3 => $row['model_material'] ?? '', 4 => $row['type_mesin'] ?? ''];
            foreach ($fixed as $ci => $val) {
                $col = Coordinate::stringFromColumnIndex($ci);
                $this->cell($sheet, "{$col}{$r}", $val);
                $maxLines = max($maxLines, $this->lines((string) $val, $this->widths[$ci] - 2));
            }

            $imgSlots = 0; // jumlah foto terbanyak di satu sel pada baris ini
            foreach ($kolom as $i => $k) {
                $ci   = 5 + $i;
                $col  = Coordinate::stringFromColumnIndex($ci);
                $cell = "{$col}{$r}";
                $v    = $nilai[$k['uid'] ?? ''] ?? null;

                if (($k['type'] ?? '') === 'image') {
                    $n = $this->images($sheet, $cell, $this->fotos($v), $this->widths[$ci] * 7 + 5);
                    if ($n > 0) {
                        $imgSlots = max($imgSlots, $n);
                    } else {
                        $this->cell($sheet, $cell, '');
                    }
                    continue;
                }

                $text = is_array($v) ? implode(', ', array_filter($v, 'is_scalar')) : $v;
                $this->cell($sheet, $cell, $text);
                $maxLines = max($maxLines, $this->lines((string) ($text ?? ''), $this->widths[$ci] - 2));
            }

            $height = max(26, $maxLines * 13 + 12);
            if ($imgSlots > 0) {
                $height = max($height, $imgSlots * self::SLOT_PT + 6);
            }
            $sheet->getRowDimension($r)->setRowHeight(min(400, $height));
            $r++;
        }

        $lastRow = max($start, $r - 1);

        // pemisah tegas antara identitas proses dan kolom parameter
        $sheet->getStyle("D{$h1}:D{$lastRow}")->getBorders()->getRight()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setARGB('FF' . self::BLACK);
        // garis luar tabel
        $sheet->getStyle("A{$h1}:{$tCol}{$lastRow}")->getBorders()->getOutline()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setARGB('FF' . self::BLACK);

        // ===== Pengaturan cetak =====
        $ps = $sheet->getPageSetup();
        $ps->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $ps->setPaperSize(PageSetup::PAPERSIZE_A3);
        $ps->setFitToPage(true);
        $ps->setFitToWidth(1);
        $ps->setFitToHeight(0);
        $ps->setHorizontalCentered(true);
        $ps->setPrintArea("A1:{$lastCol}{$lastRow}");
        $ps->setRowsToRepeatAtTopByStartAndEnd($h1, $h2);
        $sheet->getPageMargins()->setTop(0.4)->setBottom(0.5)->setLeft(0.3)->setRight(0.3);

        $safe = str_replace('&', '&&', $noReg);
        $sheet->getHeaderFooter()->setOddFooter("&L&8Joken {$safe}&C&8Dicetak &D &T&R&8Halaman &P dari &N");

        return $book;
    }

    /* ---------------- Helper ---------------- */

    // kolom/nilai bisa berupa array atau string JSON (kalau belum di-cast di Model)
    private function arr(mixed $v): array
    {
        if (is_string($v)) {
            $v = json_decode($v, true);
        }
        return is_array($v) ? $v : [];
    }

    // nilai foto bisa string lama (1 foto), array (banyak foto), atau string JSON
    private function fotos(mixed $v): array
    {
        if (is_string($v) && str_starts_with(trim($v), '[')) {
            $v = json_decode($v, true);
        }
        if (is_string($v)) {
            $v = [$v];
        }

        return array_values(array_filter(is_array($v) ? $v : [], fn ($p) => is_string($p) && $p !== ''));
    }

    // perkiraan jumlah baris teks dalam sel dengan lebar tertentu (karakter)
    private function lines(string $text, float $chars): int
    {
        $n = 0;
        foreach (preg_split('/\R/u', $text) as $part) {
            $n += max(1, (int) ceil(mb_strlen($part) / max(1, $chars)));
        }
        return $n;
    }

    private function fill(Worksheet $sheet, string $range, string $hex): void
    {
        $sheet->getStyle($range)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FF' . $hex);
    }

    private function box(Worksheet $sheet, string $range, string $hex): void
    {
        $sheet->getStyle($range)->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)
            ->getColor()->setARGB('FF' . $hex);
    }

    // Selalu teks: leading zero tetap, dan "=..." tidak dijalankan sebagai rumus.
    private function str(Worksheet $sheet, string $cell, string $value): void
    {
        $sheet->setCellValueExplicit($cell, $value, DataType::TYPE_STRING);
    }

    private function cell(Worksheet $sheet, string $cell, mixed $value): void
    {
        $text = trim((string) ($value ?? ''));

        if ($text === '') {
            $sheet->setCellValue($cell, '–');
            $sheet->getStyle($cell)->getFont()->setBold(false)->getColor()->setARGB('FF' . self::DASH);
            return;
        }
        $this->str($sheet, $cell, $text);
    }

    private function sectionTitle(Worksheet $sheet, string $range, string $text): void
    {
        $first = explode(':', $range)[0];
        $sheet->mergeCells($range);
        $sheet->setCellValue($first, $text);
        $this->fill($sheet, $range, self::HEAD);
        $this->box($sheet, $range, self::GRAY);
        $sheet->getStyle($range)->applyFromArray(['font' => ['bold' => true, 'size' => 9]]);
        $sheet->getStyle($range)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setIndent(1);
        $sheet->getRowDimension((int) preg_replace('/\D/', '', $first))->setRowHeight(20);
    }

    private function labelValue(Worksheet $sheet, string $labelCell, string $valueCell, string $range): void
    {
        $this->box($sheet, $range, self::GRAY);
        $sheet->getStyle($labelCell)->applyFromArray([
            'font' => ['bold' => true, 'size' => 8, 'color' => ['argb' => 'FF' . self::MUTED]],
        ]);
        $sheet->getStyle($valueCell)->applyFromArray([
            'font' => ['bold' => true, 'size' => 10],
        ]);
        $sheet->getStyle($range)->getAlignment()
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setIndent(1)
            ->setWrapText(true);
    }

    // Tanam beberapa foto, ditumpuk ke bawah dalam satu sel. Return jumlah foto yang berhasil dipasang.
    private function images(Worksheet $sheet, string $cell, array $paths, float $cellPx): int
    {
        $base = realpath(storage_path('app/public'));
        if (! $base) {
            return 0;
        }

        $placed = 0;
        foreach ($paths as $rel) {
            $path = realpath($base . DIRECTORY_SEPARATOR . $rel);

            // cegah path traversal dan file di luar storage public
            if (! $path || ! str_starts_with($path, $base . DIRECTORY_SEPARATOR) || ! is_file($path)) {
                continue;
            }

            $size = @getimagesize($path);
            if (! $size) {
                continue;
            }

            [$w, $h] = $size;
            $scale   = min(max(40, $cellPx - 12) / $w, (self::SLOT_PX - 8) / $h, 1);
            $dw      = max(1, (int) round($w * $scale));
            $dh      = max(1, (int) round($h * $scale));

            $d = new Drawing();
            $d->setPath($path);
            $d->setCoordinates($cell);
            $d->setResizeProportional(false);
            $d->setWidth($dw);
            $d->setHeight($dh);
            $d->setOffsetX((int) max(2, ($cellPx - $dw) / 2));
            $d->setOffsetY($placed * self::SLOT_PX + (int) max(2, (self::SLOT_PX - $dh) / 2));
            $d->setWorksheet($sheet);

            $placed++;
        }

        return $placed;
    }
}