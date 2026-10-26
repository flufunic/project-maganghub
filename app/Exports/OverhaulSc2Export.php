<?php

namespace App\Exports;

use App\Models\OverhaulMesin;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;


class OverhaulSc2Export implements FromArray, WithEvents, WithTitle
{
    private const JUMLAH_KOLOM = 54; // A..BB  (6 kolom info + 48 minggu)
    private const KOLOM_MINGGU = 7;  // kolom G = minggu pertama
    private const BARIS_DATA   = 7;  // header memakai baris 4-6

    // Perkiraan jumlah karakter per baris pada kolom catatan (G..BB digabung)
    private const KARAKTER_PER_BARIS = 190;

    private const BULAN_PENDEK = [
        1 => 'JAN', 2 => 'FEB', 3 => 'MAR', 4 => 'APR', 5 => 'MEI', 6 => 'JUN',
        7 => 'JUL', 8 => 'AGU', 9 => 'SEP', 10 => 'OKT', 11 => 'NOV', 12 => 'DES',
    ];

    private const BULAN_PANJANG = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    private const MINGGU = [1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV'];

    // Palet hitam putih
    private const HITAM       = '000000';
    private const PUTIH       = 'FFFFFF';
    private const ABU_TUA     = '595959';
    private const ABU_SEDANG  = 'D9D9D9';
    private const ABU_MUDA    = 'F2F2F2';
    private const GARIS_TIPIS = 'A6A6A6';

    private int $tahun;
    private string $kolomAkhir;
    private int $barisAkhir = self::BARIS_DATA;     // baris terakhir tabel jadwal
    private int $barisTerakhir = self::BARIS_DATA;  // baris terakhir seluruh sheet (termasuk catatan)
    private bool $kosong = false;

    /** grup mesin (No + Mesin digabung) */
    private array $grup = [];

    /** [['plan' => 7, 'act' => 8], ...] satu entri per data mesin */
    private array $barisMesin = [];

    /** sel jadwal yang dicentang */
    private array $sel = [];

    /** daftar catatan yang ditampilkan di bawah tabel */
    private array $daftarCatatan = [];

    /** posisi baris bagian catatan */
    private int $barisCatatanJudul = 0;
    private int $barisCatatanHeader = 0;
    private int $barisCatatanAwal = 0;

    public function __construct(int $tahun)
    {
        $this->tahun = $tahun;
        $this->kolomAkhir = Coordinate::stringFromColumnIndex(self::JUMLAH_KOLOM);
    }

    public function title(): string
    {
        return 'Schedule Overhaul ' . $this->tahun;
    }

    // =====================================================
    // DATA
    // =====================================================

    public function array(): array
    {
        $this->grup = [];
        $this->barisMesin = [];
        $this->sel = [];
        $this->daftarCatatan = [];
        $this->kosong = false;

        $mesins = OverhaulMesin::with([
            'schedules' => fn ($q) => $q->where('tahun', $this->tahun),
        ])
            ->orderBy('no')
            ->orderBy('mesin')
            ->orderBy('id')
            ->get();

        $rows = [];

        // Baris 1-2: judul dan periode
        $rows[] = $this->baris([0 => 'SCHEDULE OVERHAUL MESIN SC2']);
        $rows[] = $this->baris([0 => 'LAPORAN JADWAL TAHUN ' . $this->tahun]);

        // Baris 3: jarak kosong
        $rows[] = $this->baris([]);

        // Baris 4: kolom tetap + tahun
        $rows[] = $this->baris([
            0 => 'No',
            1 => 'Mesin',
            2 => 'Nama',
            3 => 'Total Mesin',
            4 => 'Standar',
            5 => 'Item',
            6 => (string) $this->tahun,
        ]);

        // Baris 5: bulan (mis. JAN-26)
        $barisBulan = [];
        for ($b = 1; $b <= 12; $b++) {
            $barisBulan[6 + ($b - 1) * 4] = self::BULAN_PENDEK[$b] . '-' . substr((string) $this->tahun, -2);
        }
        $rows[] = $this->baris($barisBulan);

        // Baris 6: minggu I - IV
        $barisMinggu = [];
        for ($b = 1; $b <= 12; $b++) {
            for ($m = 1; $m <= 4; $m++) {
                $barisMinggu[6 + ($b - 1) * 4 + ($m - 1)] = self::MINGGU[$m];
            }
        }
        $rows[] = $this->baris($barisMinggu);

        // Baris 7 dst: 2 baris (Plan + Act) per data mesin
        $nomor = [];
        $baris = self::BARIS_DATA;
        $grupTerakhir = null;
        $namaTerakhir = null;

        foreach ($mesins as $mesin) {
            $namaMesin = (string) $mesin->mesin;

            if (! isset($nomor[$namaMesin])) {
                $nomor[$namaMesin] = count($nomor) + 1;
            }

            $barisPlan = $baris;
            $barisAct  = $baris + 1;
            $baris += 2;

            $this->barisMesin[] = ['plan' => $barisPlan, 'act' => $barisAct];

            // Mesin berurutan dengan nama sama digabung (seperti rowspan di web)
            if ($namaTerakhir === $namaMesin && $grupTerakhir !== null) {
                $this->grup[$grupTerakhir]['akhir'] = $barisAct;
            } else {
                $this->grup[] = ['mulai' => $barisPlan, 'akhir' => $barisAct];
                $grupTerakhir = array_key_last($this->grup);
                $namaTerakhir = $namaMesin;
            }

            $jadwal = $mesin->schedules->keyBy(
                fn ($s) => strtolower((string) $s->item) . '-' . (int) $s->bulan . '-' . (int) $s->minggu
            );

            foreach (['plan', 'act'] as $item) {
                $isPlan = $item === 'plan';
                $barisIni = $isPlan ? $barisPlan : $barisAct;

                $row = $this->baris([]);

                if ($isPlan) {
                    $row[0] = $nomor[$namaMesin];
                    $row[1] = mb_strtoupper($namaMesin);
                    $row[2] = $mesin->nama ?? '-';
                    $row[3] = (int) $mesin->total_mesin;
                    $row[4] = $this->formatStandar($mesin);
                }

                $row[5] = $isPlan ? 'Plan' : 'Act';

                for ($b = 1; $b <= 12; $b++) {
                    for ($m = 1; $m <= 4; $m++) {
                        $s = $jadwal->get("{$item}-{$b}-{$m}");
                        $checked = (bool) ($s && $s->checked);
                        $catatan = $s ? trim((string) $s->catatan) : '';

                        $idx = 6 + ($b - 1) * 4 + ($m - 1); // index array (0-based)

                        $row[$idx] = $checked ? ($isPlan ? '○' : '✓') : null;

                        if ($checked) {
                            $this->sel[] = [
                                'cell' => Coordinate::stringFromColumnIndex($idx + 1) . $barisIni,
                                'item' => $item,
                            ];
                        }

                        if ($catatan !== '') {
                            $this->daftarCatatan[] = [
                                'no_mesin' => $nomor[$namaMesin],
                                'mesin'    => mb_strtoupper($namaMesin),
                                'nama'     => $mesin->nama ?? '-',
                                'periode'  => self::BULAN_PANJANG[$b] . ' - Minggu ' . self::MINGGU[$m],
                                'item'     => $isPlan ? 'Plan' : 'Act',
                                'catatan'  => $catatan,
                            ];
                        }
                    }
                }

                $rows[] = $row;
            }
        }

        if (count($mesins) === 0) {
            $this->kosong = true;
            $rows[] = $this->baris([0 => 'Tidak ada data jadwal untuk tahun ' . $this->tahun]);
            $baris = self::BARIS_DATA + 1;
        }

        $this->barisAkhir = $baris - 1;

        // -------------------------------------------------
        // BAGIAN CATATAN (di bawah tabel)
        // -------------------------------------------------

        // Jarak kosong
        $rows[] = $this->baris([]);

        $this->barisCatatanJudul = $this->barisAkhir + 2;
        $rows[] = $this->baris([0 => 'CATATAN']);

        $this->barisCatatanHeader = $this->barisAkhir + 3;
        $rows[] = $this->baris([
            0 => 'No',
            1 => 'Mesin',
            2 => 'Nama',
            3 => 'Periode',
            5 => 'Item',
            6 => 'Catatan',
        ]);

        $this->barisCatatanAwal = $this->barisAkhir + 4;

        if (count($this->daftarCatatan) === 0) {
            $rows[] = $this->baris([0 => 'Tidak ada catatan']);
        } else {
            foreach ($this->daftarCatatan as $i => $c) {
                $rows[] = $this->baris([
                    0 => $i + 1,
                    1 => $c['mesin'],
                    2 => $c['nama'],
                    3 => $c['periode'],
                    5 => $c['item'],
                    6 => $c['catatan'],
                ]);
            }
        }

        $this->barisTerakhir = count($rows);

        return $rows;
    }

    private function baris(array $isi): array
    {
        $row = array_fill(0, self::JUMLAH_KOLOM, null);

        foreach ($isi as $i => $v) {
            $row[$i] = $v;
        }

        return $row;
    }

    // Contoh: 1200000 + shot -> "1.200.000 shot" (sama dengan tampilan web)
    private function formatStandar($mesin): string
    {
        $standar = $mesin->standar;

        if ($standar === null || $standar === '') {
            return '-';
        }

        if (is_numeric($standar)) {
            $n = (float) $standar;

            $angka = floor($n) == $n
                ? number_format($n, 0, ',', '.')
                : rtrim(rtrim(number_format($n, 3, ',', '.'), '0'), ',');
        } else {
            $angka = (string) $standar;
        }

        return $mesin->satuan ? "{$angka} {$mesin->satuan}" : $angka;
    }

    // =====================================================
    // STYLING
    // =====================================================

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $this->gabungSel($sheet);
                $this->gayaJudul($sheet);
                $this->gayaHeader($sheet);
                $this->gayaIsi($sheet);
                $this->gayaJadwal($sheet);
                $this->gayaCatatan($sheet);
                $this->ukuranDanCetak($sheet);
            },
        ];
    }

    private function gabungSel(Worksheet $sheet): void
    {
        $akhir = $this->kolomAkhir;

        $sheet->mergeCells("A1:{$akhir}1");
        $sheet->mergeCells("A2:{$akhir}2");

        // Header: kolom tetap menyatu 3 baris
        foreach (range('A', 'F') as $k) {
            $sheet->mergeCells("{$k}4:{$k}6");
        }

        // Tahun
        $sheet->mergeCells("G4:{$akhir}4");

        // Bulan (4 kolom per bulan)
        for ($b = 1; $b <= 12; $b++) {
            $mulai = Coordinate::stringFromColumnIndex(self::KOLOM_MINGGU + ($b - 1) * 4);
            $selesai = Coordinate::stringFromColumnIndex(self::KOLOM_MINGGU + ($b - 1) * 4 + 3);
            $sheet->mergeCells("{$mulai}5:{$selesai}5");
        }

        if ($this->kosong) {
            $sheet->mergeCells('A' . self::BARIS_DATA . ":{$akhir}" . self::BARIS_DATA);
        } else {
            // No + Mesin digabung per grup mesin
            foreach ($this->grup as $g) {
                foreach (['A', 'B'] as $k) {
                    $sheet->mergeCells("{$k}{$g['mulai']}:{$k}{$g['akhir']}");
                }
            }

            // Nama, Total Mesin, Standar digabung Plan + Act
            foreach ($this->barisMesin as $b) {
                foreach (['C', 'D', 'E'] as $k) {
                    $sheet->mergeCells("{$k}{$b['plan']}:{$k}{$b['act']}");
                }
            }
        }

        // ----- Bagian catatan -----
        $sheet->mergeCells("A{$this->barisCatatanJudul}:{$akhir}{$this->barisCatatanJudul}");

        if (count($this->daftarCatatan) === 0) {
            $sheet->mergeCells("A{$this->barisCatatanAwal}:{$akhir}{$this->barisCatatanAwal}");
        }

        for ($r = $this->barisCatatanHeader; $r <= $this->barisTerakhir; $r++) {
            if (count($this->daftarCatatan) === 0 && $r === $this->barisCatatanAwal) {
                continue; // sudah digabung penuh
            }

            $sheet->mergeCells("D{$r}:E{$r}");
            $sheet->mergeCells("G{$r}:{$akhir}{$r}");
        }
    }

    private function gayaJudul(Worksheet $sheet): void
    {
        $akhir = $this->kolomAkhir;

        $sheet->getRowDimension(1)->setRowHeight(34);
        $sheet->getRowDimension(2)->setRowHeight(22);
        $sheet->getRowDimension(3)->setRowHeight(8); // jarak tipis

        $tengah = [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
        ];

        $sheet->getStyle("A1:{$akhir}1")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 18, 'color' => ['rgb' => self::HITAM]],
            'alignment' => $tengah,
        ]);

        $sheet->getStyle("A1:{$akhir}1")->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);

        $sheet->getStyle("A2:{$akhir}2")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 11, 'color' => ['rgb' => self::ABU_TUA]],
            'alignment' => $tengah,
        ]);
    }

    private function gayaHeader(Worksheet $sheet): void
    {
        $akhir = $this->kolomAkhir;

        $sheet->getRowDimension(4)->setRowHeight(24);
        $sheet->getRowDimension(5)->setRowHeight(22);
        $sheet->getRowDimension(6)->setRowHeight(20);

        $tengah = [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true,
        ];

        // Seluruh header: latar putih, teks hitam tebal
        $sheet->getStyle("A4:{$akhir}6")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 9, 'color' => ['rgb' => self::HITAM]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::PUTIH]],
            'alignment' => $tengah,
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => self::HITAM],
                ],
            ],
        ]);

        // Tahun sedikit lebih besar
        $sheet->getStyle("G4:{$akhir}4")->getFont()->setSize(11);

        // Minggu sedikit lebih kecil
        $sheet->getStyle("G6:{$akhir}6")->getFont()->setSize(8);

        // Garis tebal di bawah header
        $sheet->getStyle("A6:{$akhir}6")->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);
    }

    private function gayaIsi(Worksheet $sheet): void
    {
        $akhir = $this->kolomAkhir;
        $awal = self::BARIS_DATA;
        $last = $this->barisAkhir;

        // Dasar tabel
        $sheet->getStyle("A{$awal}:{$akhir}{$last}")->applyFromArray([
            'font' => ['name' => 'Arial', 'size' => 9, 'color' => ['rgb' => self::HITAM]],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => self::GARIS_TIPIS],
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
        ]);

        if ($this->kosong) {
            $sheet->getRowDimension($awal)->setRowHeight(40);
            $sheet->getStyle("A{$awal}")->applyFromArray([
                'font' => ['name' => 'Arial', 'italic' => true, 'size' => 11, 'color' => ['rgb' => self::ABU_TUA]],
            ]);
            return;
        }

        // No + Mesin: abu-abu muda, tebal
        foreach ($this->grup as $g) {
            $sheet->getStyle("A{$g['mulai']}:B{$g['akhir']}")->applyFromArray([
                'font' => ['name' => 'Arial', 'bold' => true, 'size' => 9, 'color' => ['rgb' => self::HITAM]],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::ABU_MUDA]],
            ]);
        }

        foreach ($this->barisMesin as $b) {
            $plan = $b['plan'];
            $act = $b['act'];

            $sheet->getRowDimension($plan)->setRowHeight(22);
            $sheet->getRowDimension($act)->setRowHeight(22);

            // Nama tebal
            $sheet->getStyle("C{$plan}")->getFont()->setBold(true);

            // Kolom Item: Plan tebal, Act tebal dengan latar abu muda
            $sheet->getStyle("F{$plan}")->getFont()->setBold(true);

            $sheet->getStyle("F{$act}")->applyFromArray([
                'font' => ['name' => 'Arial', 'bold' => true, 'size' => 9, 'color' => ['rgb' => self::HITAM]],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::ABU_SEDANG]],
            ]);

            // Garis pemisah antar data mesin
            $sheet->getStyle("A{$act}:{$akhir}{$act}")->getBorders()->getBottom()
                ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);
        }

        // Pemisah antar bulan (garis kiri di minggu I tiap bulan)
        for ($b = 1; $b <= 12; $b++) {
            $kol = Coordinate::stringFromColumnIndex(self::KOLOM_MINGGU + ($b - 1) * 4);

            $sheet->getStyle("{$kol}7:{$kol}{$last}")->getBorders()->getLeft()
                ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB(self::HITAM);
        }

        // Garis tepi luar tabel
        $sheet->getStyle("A4:{$akhir}{$last}")->getBorders()->getOutline()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);
    }

    private function gayaJadwal(Worksheet $sheet): void
    {
        foreach ($this->sel as $s) {
            if ($s['item'] === 'plan') {
                // Plan: lingkaran hitam, tanpa isi
                $sheet->getStyle($s['cell'])->applyFromArray([
                    'font' => ['name' => 'Segoe UI Symbol', 'bold' => true, 'size' => 11, 'color' => ['rgb' => self::HITAM]],
                ]);
            } else {
                // Act: centang hitam, latar abu-abu
                $sheet->getStyle($s['cell'])->applyFromArray([
                    'font' => ['name' => 'Segoe UI Symbol', 'bold' => true, 'size' => 11, 'color' => ['rgb' => self::HITAM]],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::ABU_SEDANG]],
                ]);
            }
        }
    }

    private function gayaCatatan(Worksheet $sheet): void
    {
        $akhir = $this->kolomAkhir;
        $judul = $this->barisCatatanJudul;
        $header = $this->barisCatatanHeader;
        $awal = $this->barisCatatanAwal;
        $last = $this->barisTerakhir;

        // Jarak antara tabel dan catatan
        $sheet->getRowDimension($judul - 1)->setRowHeight(12);

        // Judul bagian
        $sheet->getRowDimension($judul)->setRowHeight(22);
        $sheet->getStyle("A{$judul}:{$akhir}{$judul}")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 11, 'color' => ['rgb' => self::HITAM]],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getStyle("A{$judul}:{$akhir}{$judul}")->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);

        // Header tabel catatan
        $sheet->getRowDimension($header)->setRowHeight(20);
        $sheet->getStyle("A{$header}:{$akhir}{$header}")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 9, 'color' => ['rgb' => self::HITAM]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::PUTIH]],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::HITAM]],
            ],
        ]);
        $sheet->getStyle("A{$header}:{$akhir}{$header}")->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);

        // Isi catatan
        $sheet->getStyle("A{$awal}:{$akhir}{$last}")->applyFromArray([
            'font' => ['name' => 'Arial', 'size' => 9, 'color' => ['rgb' => self::HITAM]],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::GARIS_TIPIS]],
            ],
        ]);

        if (count($this->daftarCatatan) === 0) {
            $sheet->getRowDimension($awal)->setRowHeight(26);
            $sheet->getStyle("A{$awal}")->applyFromArray([
                'font' => ['name' => 'Arial', 'italic' => true, 'size' => 9, 'color' => ['rgb' => self::ABU_TUA]],
            ]);
        } else {
            // Nama dan catatan rata kiri
            $sheet->getStyle("C{$awal}:C{$last}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_LEFT)->setIndent(1);
            $sheet->getStyle("G{$awal}:{$akhir}{$last}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_LEFT)->setIndent(1);

            // Mesin tebal
            $sheet->getStyle("B{$awal}:B{$last}")->getFont()->setBold(true);

            // Tinggi baris menyesuaikan panjang catatan (sel gabungan tidak auto-fit)
            foreach ($this->daftarCatatan as $i => $c) {
                $baris = $awal + $i;

                $jumlahBaris = 0;
                foreach (explode("\n", $c['catatan']) as $potong) {
                    $jumlahBaris += max(1, (int) ceil(mb_strlen($potong) / self::KARAKTER_PER_BARIS));
                }

                $sheet->getRowDimension($baris)->setRowHeight(max(22, $jumlahBaris * 12 + 8));
            }
        }

        // Garis tepi luar tabel catatan
        $sheet->getStyle("A{$header}:{$akhir}{$last}")->getBorders()->getOutline()
            ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB(self::HITAM);
    }

    private function ukuranDanCetak(Worksheet $sheet): void
    {
        $akhir = $this->kolomAkhir;
        $last = $this->barisTerakhir;

        // Lebar kolom
        foreach (['A' => 6, 'B' => 14, 'C' => 28, 'D' => 10, 'E' => 16, 'F' => 8] as $k => $w) {
            $sheet->getColumnDimension($k)->setWidth($w);
        }

        for ($i = self::KOLOM_MINGGU; $i <= self::JUMLAH_KOLOM; $i++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setWidth(4.8);
        }

        // Tampilan layar: tanpa gridline, tanpa freeze/split
        $sheet->setShowGridlines(false);
        $sheet->getSheetView()->setZoomScale(90);

        // Cetak: semua (jadwal + catatan) muat dalam 1 halaman
        $setup = $sheet->getPageSetup();
        $setup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $setup->setPaperSize(PageSetup::PAPERSIZE_A3);
        $setup->setFitToPage(true);
        $setup->setFitToWidth(1);
        $setup->setFitToHeight(1);
        $setup->setPrintArea("A1:{$akhir}{$last}");
        $setup->setHorizontalCentered(true);
        $setup->setVerticalCentered(false);

        $sheet->getPageMargins()->setTop(0.5);
        $sheet->getPageMargins()->setBottom(0.5);
        $sheet->getPageMargins()->setLeft(0.25);
        $sheet->getPageMargins()->setRight(0.25);

        $sheet->getHeaderFooter()->setOddFooter('&LInternal Document&CDicetak: &D&RHalaman &P dari &N');
    }
}