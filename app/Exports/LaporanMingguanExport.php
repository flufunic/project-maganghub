<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Layout memakai grid 13 kolom (A..M):
 *   A      = nomor (sempit)
 *   B..M   = 12 kolom sama lebar, digabung (merge) sesuai kebutuhan tiap tabel,
 *            jadi kolom angka tidak melebar dan kolom teks / foto tetap lega.
 *
 * Semua isi digambar di AfterSheet supaya tinggi baris & posisi foto bisa
 * dihitung dari panjang teks dan ukuran sel.
 *
 * $meta: week, rentang, status, status_label, disimpan_pada, dikirim_pada, disetujui_pada
 */
class LaporanMingguanExport implements FromArray, WithColumnWidths, WithEvents, WithTitle
{
    private const KOLOM = 13;
    private const LEBAR_NO = 6;
    private const LEBAR_KOLOM = 14;

    // palet warna
    private const C_JUDUL = '34495E';
    private const C_SUBJUDUL = '5D6D7E';
    private const C_SECTION = 'E9EDF2';
    private const C_HEADER = 'DDE3EA';
    private const C_ZEBRA = 'F8FAFC';
    private const C_GARIS = 'C9D1D9';
    private const C_TEKS = '333333';
    private const C_REDUP = '7F8C8D';

    private const TINGGI_FOTO = 125.0; // point

    private array $meta;

    /**
     * $meta bisa array (disarankan) atau string judul lama
     * ("LAPORAN PREVENTIF W2 · 8-14 Januari 2026") supaya controller lama tetap jalan.
     */
    public function __construct(
        array|string $meta,
        private array $bagian1,
        private Collection $bagian2,
        private Collection $bagian3
    ) {
        $this->meta = is_array($meta) ? $meta : $this->metaDariJudul($meta);
    }

    private function metaDariJudul(string $judul): array
    {
        preg_match('/W\s*(\d+)/i', $judul, $w);

        return [
            'week' => $w[1] ?? '',
            'rentang' => trim((string) (explode('·', $judul, 2)[1] ?? '')),
            'status' => 'draft',
            'status_label' => 'Draft',
            'dikirim_pada' => null,
            'disetujui_pada' => null,
        ];
    }

    public function array(): array
    {
        return [];
    }

    public function title(): string
    {
        return 'Laporan W' . ($this->meta['week'] ?? '');
    }

    public function columnWidths(): array
    {
        $lebar = ['A' => self::LEBAR_NO];

        for ($i = 2; $i <= self::KOLOM; $i++) {
            $lebar[Coordinate::stringFromColumnIndex($i)] = self::LEBAR_KOLOM;
        }

        return $lebar;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $this->gambar($event->sheet->getDelegate());
            },
        ];
    }

    // =====================================================
    // SUSUN SHEET
    // =====================================================

    private function gambar(Worksheet $s): void
    {
        $s->setShowGridlines(false);
        $s->getSheetView()->setZoomScale(90);

        $total = $this->totalBagian1();

        $r = 1;
        $r = $this->kepala($s, $r, $total);
        $r = $this->bagianSatu($s, $r, $total);
        $r = $this->bagianDua($s, $r);
        $r = $this->bagianTiga($s, $r);
        $r = $this->tandaTangan($s, $r);

        $akhir = $r - 1;

        $this->aturCetak($s, $akhir);
    }

    private function kepala(Worksheet $s, int $r, array $total): int
    {
        $week = $this->meta['week'] ?? '';
        $rentang = $this->meta['rentang'] ?? '';

        // judul
        $this->sel($s, 1, self::KOLOM, $r, 'LAPORAN PREVENTIF MINGGUAN', $this->gaya([
            'fill' => self::C_JUDUL,
            'warna' => 'FFFFFF',
            'bold' => true,
            'size' => 16,
            'h' => Alignment::HORIZONTAL_CENTER,
        ]));
        $s->getRowDimension($r)->setRowHeight(36);
        $r++;

        // sub judul
        $this->sel($s, 1, self::KOLOM, $r, 'WEEK ' . $week . '   ·   ' . $rentang, $this->gaya([
            'fill' => self::C_SUBJUDUL,
            'warna' => 'FFFFFF',
            'bold' => true,
            'size' => 11,
            'h' => Alignment::HORIZONTAL_CENTER,
        ]));
        $s->getRowDimension($r)->setRowHeight(22);
        $r++;

        $s->getRowDimension($r)->setRowHeight(8);
        $r++;

        // blok informasi
        [$fillStatus, $warnaStatus] = $this->warnaStatus((string) ($this->meta['status'] ?? 'draft'));

        $pencapaian = $total['jumlah'] > 0
            ? $total['sudah'] . ' dari ' . $total['jumlah'] . ' item preventif  ·  ' . $total['persen'] . '%'
            : 'Tidak ada Plan preventif';

        $info = [
            ['Periode', $rentang, 'Status', $this->meta['status_label'] ?? '-', true],
            ['Week', 'Week ' . $week, 'Dikirim ke Pimpinan', $this->meta['dikirim_pada'] ?? '-', false],
            ['Pencapaian', $pencapaian, 'Disetujui', $this->meta['disetujui_pada'] ?? '-', false],
        ];

        foreach ($info as [$labelKiri, $isiKiri, $labelKanan, $isiKanan, $adalahStatus]) {
            $label = $this->gaya(['bold' => true, 'fill' => self::C_SECTION, 'garis' => true, 'indent' => 1]);
            $isi = $this->gaya(['garis' => true, 'indent' => 1]);

            $this->sel($s, 2, 3, $r, $labelKiri, $label);
            $this->sel($s, 4, 7, $r, (string) $isiKiri, $isi);
            $this->sel($s, 9, 10, $r, $labelKanan, $label);

            $this->sel($s, 11, 13, $r, (string) $isiKanan, $adalahStatus
                ? $this->gaya(['garis' => true, 'indent' => 1, 'bold' => true, 'fill' => $fillStatus, 'warna' => $warnaStatus])
                : $isi);

            $s->getRowDimension($r)->setRowHeight(20);
            $r++;
        }

        $s->getRowDimension($r)->setRowHeight(10);

        return $r + 1;
    }

    // ---------- 1. PENCAPAIAN ----------

    private function bagianSatu(Worksheet $s, int $r, array $total): int
    {
        $r = $this->judulBagian($s, $r, '1. PENCAPAIAN PREVENTIF');

        $r = $this->headerTabel($s, $r, [
            [1, 1, 'NO'],
            [2, 4, 'MESIN'],
            [5, 5, 'JUMLAH ITEM'],
            [6, 6, 'ITEM SUDAH PREVENTIF'],
            [7, 7, 'ITEM BELUM PREVENTIF'],
            [8, 8, 'PRESENTASE'],
            [9, 13, 'KOMENTAR'],
        ]);

        if (count($this->bagian1) === 0) {
            $r = $this->barisKosong($s, $r, 'Tidak ada Plan preventif di week ini.');
        }

        foreach ($this->bagian1 as $i => $row) {
            $zebra = $i % 2 === 1;
            $dasar = ['garis' => true] + ($zebra ? ['fill' => self::C_ZEBRA] : []);
            $persen = (int) ($row['persen'] ?? 0);

            $tinggi = max(
                $this->tinggiTeks($row['mesin'] ?? '', 3 * self::LEBAR_KOLOM),
                $this->tinggiTeks($row['komentar'] ?? '', 5 * self::LEBAR_KOLOM)
            );
            $s->getRowDimension($r)->setRowHeight($tinggi);

            $tengah = $dasar + ['h' => Alignment::HORIZONTAL_CENTER];

            $this->sel($s, 1, 1, $r, $i + 1, $this->gaya($tengah));
            $this->sel($s, 2, 4, $r, (string) ($row['mesin'] ?? ''), $this->gaya($dasar + ['indent' => 1]));
            $this->sel($s, 5, 5, $r, (int) $row['jumlah'], $this->gaya($tengah));
            $this->sel($s, 6, 6, $r, (int) $row['sudah'], $this->gaya($tengah));
            $this->sel($s, 7, 7, $r, (int) $row['belum'], $this->gaya($tengah));
            $this->sel($s, 8, 8, $r, $persen / 100, $this->gaya($tengah + ['bold' => true, 'warna' => $this->warnaPersen($persen)]), '0%');
            $this->sel($s, 9, 13, $r, (string) ($row['komentar'] ?? ''), $this->gaya($dasar + ['indent' => 1]));

            $r++;
        }

        // total
        $dasar = ['garis' => true, 'fill' => self::C_SECTION, 'bold' => true];
        $tengah = $dasar + ['h' => Alignment::HORIZONTAL_CENTER];

        $this->sel($s, 1, 4, $r, 'TOTAL ITEM', $this->gaya($tengah));
        $this->sel($s, 5, 5, $r, $total['jumlah'], $this->gaya($tengah));
        $this->sel($s, 6, 6, $r, $total['sudah'], $this->gaya($tengah));
        $this->sel($s, 7, 7, $r, $total['belum'], $this->gaya($tengah));
        $this->sel($s, 8, 8, $r, $total['persen'] / 100, $this->gaya($tengah + ['warna' => $this->warnaPersen($total['persen'])]), '0%');
        $this->sel($s, 9, 13, $r, '', $this->gaya($dasar));
        $s->getRowDimension($r)->setRowHeight(24);

        return $r + 2;
    }

    // ---------- 2. LAPORAN PREVENTIF ----------

    private function bagianDua(Worksheet $s, int $r): int
    {
        $r = $this->judulBagian($s, $r, '2. LAPORAN PREVENTIF');

        $r = $this->headerTabel($s, $r, [
            [1, 1, 'NO'],
            [2, 3, 'MESIN'],
            [4, 6, 'AKTIVITAS / PROBLEM'],
            [7, 9, 'PENANGGULANGAN'],
            [10, 11, 'FOTO BEFORE'],
            [12, 13, 'FOTO AFTER'],
        ]);

        if ($this->bagian2->count() === 0) {
            $r = $this->barisKosong($s, $r, 'Belum ada item preventif di week ini.');
        }

        foreach ($this->bagian2->values() as $i => $it) {
            $adaBefore = $this->fotoAda($it->foto_before);
            $adaAfter = $this->fotoAda($it->foto_after);

            $tinggi = max(
                $this->tinggiTeks($it->mesin, 2 * self::LEBAR_KOLOM),
                $this->tinggiTeks($it->aktivitas, 3 * self::LEBAR_KOLOM),
                $this->tinggiTeks($it->penanggulangan, 3 * self::LEBAR_KOLOM),
                ($adaBefore || $adaAfter) ? self::TINGGI_FOTO : 46.0
            );
            $tinggi = min(409.0, $tinggi);
            $s->getRowDimension($r)->setRowHeight($tinggi);

            $dasar = ['garis' => true] + ($i % 2 === 1 ? ['fill' => self::C_ZEBRA] : []);

            $this->sel($s, 1, 1, $r, $i + 1, $this->gaya($dasar + ['h' => Alignment::HORIZONTAL_CENTER]));
            $this->sel($s, 2, 3, $r, (string) $it->mesin, $this->gaya($dasar + ['bold' => true, 'indent' => 1]));
            $this->sel($s, 4, 6, $r, (string) $it->aktivitas, $this->gaya($dasar + ['indent' => 1]));
            $this->sel($s, 7, 9, $r, (string) $it->penanggulangan, $this->gaya($dasar + ['indent' => 1]));

            $this->selFoto($s, 10, 11, $r, $it->foto_before, $adaBefore, $dasar, $tinggi);
            $this->selFoto($s, 12, 13, $r, $it->foto_after, $adaAfter, $dasar, $tinggi);

            $r++;
        }

        return $r + 1;
    }

    // ---------- 3. TEMUAN ----------

    private function bagianTiga(Worksheet $s, int $r): int
    {
        $r = $this->judulBagian($s, $r, '3. LAPORAN TEMUAN PREVENTIF & TAMBAHAN PEKERJAAN');

        $r = $this->headerTabel($s, $r, [
            [1, 1, 'NO'],
            [2, 4, 'MESIN'],
            [5, 7, 'AKTIVITAS / PROBLEM'],
            [8, 10, 'PENANGGULANGAN'],
            [11, 13, 'FOTO'],
        ]);

        if ($this->bagian3->count() === 0) {
            $r = $this->barisKosong($s, $r, 'Tidak ada temuan.');
        }

        foreach ($this->bagian3->values() as $i => $it) {
            $ada = $this->fotoAda($it->foto_before);

            $tinggi = max(
                $this->tinggiTeks($it->mesin, 3 * self::LEBAR_KOLOM),
                $this->tinggiTeks($it->aktivitas, 3 * self::LEBAR_KOLOM),
                $this->tinggiTeks($it->penanggulangan, 3 * self::LEBAR_KOLOM),
                $ada ? self::TINGGI_FOTO : 46.0
            );
            $tinggi = min(409.0, $tinggi);
            $s->getRowDimension($r)->setRowHeight($tinggi);

            $dasar = ['garis' => true] + ($i % 2 === 1 ? ['fill' => self::C_ZEBRA] : []);

            $this->sel($s, 1, 1, $r, $i + 1, $this->gaya($dasar + ['h' => Alignment::HORIZONTAL_CENTER]));
            $this->sel($s, 2, 4, $r, (string) $it->mesin, $this->gaya($dasar + ['bold' => true, 'indent' => 1]));
            $this->sel($s, 5, 7, $r, (string) $it->aktivitas, $this->gaya($dasar + ['indent' => 1]));
            $this->sel($s, 8, 10, $r, (string) $it->penanggulangan, $this->gaya($dasar + ['indent' => 1]));

            $this->selFoto($s, 11, 13, $r, $it->foto_before, $ada, $dasar, $tinggi);

            $r++;
        }

        return $r + 1;
    }

    // ---------- TANDA TANGAN ----------

    private function tandaTangan(Worksheet $s, int $r): int
    {
        $blok = [
            [2, 5, 'DIBUAT OLEH'],
            [6, 9, 'DIPERIKSA OLEH'],
            [10, 13, 'DISETUJUI OLEH'],
        ];

        foreach ($blok as [$dari, $sampai, $judul]) {
            $this->sel($s, $dari, $sampai, $r, $judul, $this->gaya([
                'bold' => true,
                'fill' => self::C_HEADER,
                'garis' => true,
                'h' => Alignment::HORIZONTAL_CENTER,
            ]));
        }
        $s->getRowDimension($r)->setRowHeight(22);
        $r++;

        foreach ($blok as [$dari, $sampai]) {
            $this->sel($s, $dari, $sampai, $r, '( ........................................ )', $this->gaya([
                'garis' => true,
                'h' => Alignment::HORIZONTAL_CENTER,
                'v' => Alignment::VERTICAL_BOTTOM,
                'warna' => self::C_REDUP,
            ]));
        }
        $s->getRowDimension($r)->setRowHeight(64);
        $r++;

        $s->getRowDimension($r)->setRowHeight(8);
        $r++;

        $this->sel($s, 1, self::KOLOM, $r, 'Dokumen dibuat otomatis oleh Maintenance Management System  ·  ' . now()->translatedFormat('d F Y H:i'), $this->gaya([
            'italic' => true,
            'size' => 8,
            'warna' => self::C_REDUP,
            'h' => Alignment::HORIZONTAL_RIGHT,
        ]));

        return $r + 1;
    }

    private function aturCetak(Worksheet $s, int $akhir): void
    {
        $s->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4)
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0)
            ->setHorizontalCentered(true)
            ->setPrintArea('A1:' . Coordinate::stringFromColumnIndex(self::KOLOM) . $akhir);

        $s->getPageMargins()
            ->setTop(0.5)
            ->setRight(0.35)
            ->setBottom(0.6)
            ->setLeft(0.35);

        $s->getHeaderFooter()->setOddFooter(
            '&L&8Maintenance Management System&C&8Laporan Preventif Mingguan&R&8Halaman &P dari &N'
        );

        $s->getParent()->getProperties()
            ->setCreator('Maintenance Management System')
            ->setTitle('Laporan Preventif Mingguan W' . ($this->meta['week'] ?? ''))
            ->setSubject('Laporan Preventif Mingguan');
    }

    // =====================================================
    // KOMPONEN BARIS
    // =====================================================

    private function judulBagian(Worksheet $s, int $r, string $teks): int
    {
        $this->sel($s, 1, self::KOLOM, $r, $teks, $this->gaya([
            'bold' => true,
            'size' => 11,
            'warna' => self::C_JUDUL,
            'fill' => self::C_SECTION,
            'indent' => 1,
        ]));

        $s->getStyle('A' . $r . ':' . Coordinate::stringFromColumnIndex(self::KOLOM) . $r)
            ->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM)
            ->getColor()->setRGB('AAB5C1');

        $s->getRowDimension($r)->setRowHeight(24);

        return $r + 1;
    }

    private function headerTabel(Worksheet $s, int $r, array $kolom): int
    {
        foreach ($kolom as [$dari, $sampai, $teks]) {
            $this->sel($s, $dari, $sampai, $r, $teks, $this->gaya([
                'bold' => true,
                'size' => 9,
                'fill' => self::C_HEADER,
                'garis' => true,
                'h' => Alignment::HORIZONTAL_CENTER,
            ]));
        }

        $s->getRowDimension($r)->setRowHeight(32);

        return $r + 1;
    }

    private function barisKosong(Worksheet $s, int $r, string $teks): int
    {
        $this->sel($s, 1, self::KOLOM, $r, $teks, $this->gaya([
            'garis' => true,
            'italic' => true,
            'warna' => self::C_REDUP,
            'h' => Alignment::HORIZONTAL_CENTER,
        ]));
        $s->getRowDimension($r)->setRowHeight(28);

        return $r + 1;
    }

    private function selFoto(
        Worksheet $s,
        int $dari,
        int $sampai,
        int $r,
        ?string $path,
        bool $ada,
        array $dasar,
        float $tinggiPt
    ): void {
        $this->sel($s, $dari, $sampai, $r, $ada ? '' : 'Tidak ada foto', $this->gaya($dasar + [
            'italic' => true,
            'size' => 9,
            'warna' => self::C_REDUP,
            'h' => Alignment::HORIZONTAL_CENTER,
        ]));

        if ($ada && $path) {
            $this->tambahFoto($s, $path, $dari, $sampai, $r, $tinggiPt);
        }
    }

    // =====================================================
    // FOTO
    // =====================================================

    private function fotoAda(?string $path): bool
    {
        return $path && Storage::disk('public')->exists($path);
    }

    /**
     * Foto diperkecil (GD) lalu ditanam di tengah sel dengan proporsi asli,
     * jadi ukuran file Excel tetap ringan dan foto tidak keluar dari kotaknya.
     */
    private function tambahFoto(Worksheet $s, string $path, int $dari, int $sampai, int $baris, float $tinggiPt): void
    {
        $file = Storage::disk('public')->path($path);

        $lebarSel = $this->pxLebar($dari, $sampai);
        $tinggiSel = (int) floor($tinggiPt * 4 / 3);

        $kotakW = max(40, $lebarSel - 12);
        $kotakH = max(40, $tinggiSel - 12);

        $gd = $this->bukaGambar($file);

        if ($gd !== null) {
            $w = imagesx($gd);
            $h = imagesy($gd);

            $skala = min($kotakW / $w, $kotakH / $h, 1.0);
            $tw = max(1, (int) round($w * $skala));
            $th = max(1, (int) round($h * $skala));

            // sumber untuk Excel maksimal 2x ukuran tampil (tajam, tapi ringan)
            $sw = min($w, $tw * 2);
            $sh = max(1, (int) round($sw * $h / $w));

            $kecil = imagecreatetruecolor($sw, $sh);
            imagefill($kecil, 0, 0, imagecolorallocate($kecil, 255, 255, 255));
            imagecopyresampled($kecil, $gd, 0, 0, 0, 0, $sw, $sh, $w, $h);

            $d = new MemoryDrawing();
            $d->setName('Foto');
            $d->setDescription('Foto laporan preventif');
            $d->setImageResource($kecil);
            $d->setRenderingFunction(MemoryDrawing::RENDERING_JPEG);
            $d->setMimeType(MemoryDrawing::MIMETYPE_JPEG);
            $d->setResizeProportional(false);
            $d->setWidth($tw);
            $d->setHeight($th);
        } else {
            // tanpa ekstensi GD: pakai file asli, tetap dimuat proporsional ke dalam kotak
            $d = new Drawing();
            $d->setName('Foto');
            $d->setDescription('Foto laporan preventif');
            $d->setPath($file);
            $d->setResizeProportional(true);
            $d->setWidthAndHeight($kotakW, $kotakH);

            $tw = $d->getWidth();
            $th = $d->getHeight();
        }

        $offsetX = (int) floor(($lebarSel - $tw) / 2);
        $offsetX = max(0, min($offsetX, $this->pxLebar($dari, $dari) - 1));
        $offsetY = max(0, (int) floor(($tinggiSel - $th) / 2));

        $d->setCoordinates(Coordinate::stringFromColumnIndex($dari) . $baris);
        $d->setOffsetX($offsetX);
        $d->setOffsetY($offsetY);
        $d->setWorksheet($s);
    }

    private function bukaGambar(string $file)
    {
        if (!function_exists('imagecreatetruecolor') || !is_file($file)) {
            return null;
        }

        $info = @getimagesize($file);

        if (!$info) {
            return null;
        }

        $gd = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($file),
            IMAGETYPE_PNG => @imagecreatefrompng($file),
            default => false,
        };

        if (!$gd) {
            return null;
        }

        // foto dari HP sering membawa rotasi di EXIF, Excel tidak membacanya
        if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
            $exif = @exif_read_data($file);
            $sudut = [3 => 180, 6 => -90, 8 => 90][$exif['Orientation'] ?? 1] ?? 0;

            if ($sudut !== 0) {
                $putar = imagerotate($gd, $sudut, 0);

                if ($putar) {
                    $gd = $putar;
                }
            }
        }

        return $gd;
    }

    // =====================================================
    // HELPER
    // =====================================================

    private function pxLebar(int $dari, int $sampai): int
    {
        $px = 0;

        for ($c = $dari; $c <= $sampai; $c++) {
            $px += (int) floor(($c === 1 ? self::LEBAR_NO : self::LEBAR_KOLOM) * 7);
        }

        return $px;
    }

    /** Perkiraan tinggi baris (point) supaya teks yang dibungkus tidak terpotong. */
    private function tinggiTeks(?string $teks, float $lebarChar, float $min = 22.0): float
    {
        $teks = trim((string) $teks);

        if ($teks === '') {
            return $min;
        }

        $perBaris = max(8, (int) floor($lebarChar * 1.1));
        $baris = 0;

        foreach (preg_split('/\r\n|\r|\n/', $teks) as $b) {
            $baris += max(1, (int) ceil(mb_strlen($b) / $perBaris));
        }

        return min(409.0, max($min, $baris * 13.5 + 10));
    }

    private function totalBagian1(): array
    {
        $jumlah = array_sum(array_column($this->bagian1, 'jumlah'));
        $sudah = array_sum(array_column($this->bagian1, 'sudah'));

        return [
            'jumlah' => (int) $jumlah,
            'sudah' => (int) $sudah,
            'belum' => (int) ($jumlah - $sudah),
            'persen' => $jumlah > 0 ? (int) round(($sudah / $jumlah) * 100) : 0,
        ];
    }

    private function warnaPersen(int $persen): string
    {
        return $persen >= 100 ? '00703C' : ($persen >= 50 ? '9C5700' : '9C0006');
    }

    /** @return array{0:string,1:string} [warna latar, warna teks] */
    private function warnaStatus(string $status): array
    {
        return match ($status) {
            'disetujui' => ['C6EFCE', '006100'],
            'ditolak' => ['FFC7CE', '9C0006'],
            'menunggu' => ['FFEB9C', '7F6000'],
            'diperiksa' => ['BDD7EE', '1F4E79'],
            'tersimpan' => ['DDEBF7', '1F4E79'],
            default => ['EDEDED', '404040'],
        };
    }

    private function gaya(array $o = []): array
    {
        $g = [
            'font' => [
                'name' => 'Arial',
                'size' => $o['size'] ?? 10,
                'bold' => $o['bold'] ?? false,
                'italic' => $o['italic'] ?? false,
                'color' => ['rgb' => $o['warna'] ?? self::C_TEKS],
            ],
            'alignment' => [
                'horizontal' => $o['h'] ?? Alignment::HORIZONTAL_LEFT,
                'vertical' => $o['v'] ?? Alignment::VERTICAL_CENTER,
                'wrapText' => true,
                'indent' => ($o['h'] ?? Alignment::HORIZONTAL_LEFT) === Alignment::HORIZONTAL_LEFT ? ($o['indent'] ?? 0) : 0,
            ],
        ];

        if (isset($o['fill'])) {
            $g['fill'] = [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $o['fill']],
            ];
        }

        if (!empty($o['garis'])) {
            $g['borders'] = [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => self::C_GARIS],
                ],
            ];
        }

        return $g;
    }

    /** Tulis nilai ke sel (atau gabungan sel) lalu terapkan gaya ke seluruh rentang. */
    private function sel(
        Worksheet $s,
        int $dari,
        int $sampai,
        int $r,
        mixed $nilai,
        array $gaya = [],
        ?string $format = null
    ): void {
        $a = Coordinate::stringFromColumnIndex($dari) . $r;
        $z = Coordinate::stringFromColumnIndex($sampai) . $r;

        // teks selalu ditulis sebagai string supaya isian yang diawali "=" tidak jadi rumus
        if (is_string($nilai)) {
            $s->setCellValueExplicit($a, $nilai, DataType::TYPE_STRING);
        } else {
            $s->setCellValue($a, $nilai);
        }

        if ($sampai > $dari) {
            $s->mergeCells("{$a}:{$z}");
        }

        if ($gaya) {
            $s->getStyle("{$a}:{$z}")->applyFromArray($gaya);
        }

        if ($format) {
            $s->getStyle("{$a}:{$z}")->getNumberFormat()->setFormatCode($format);
        }
    }
}