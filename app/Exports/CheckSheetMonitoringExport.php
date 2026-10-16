<?php

namespace App\Exports;

use App\Models\CheckSheet;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class CheckSheetMonitoringExport implements FromArray, WithEvents, WithTitle
{
    // Kolom A..K
    private const KOLOM = 11;

    private array $merges = [];
    private array $fotos = [];       // [koordinat, path file]
    private array $judulRows = [];
    private array $headerRows = [];  // [baris awal, baris akhir]
    private array $dataRanges = [];  // [baris awal, baris akhir]
    private array $fotoRows = [];
    private int $catatanRow = 0;

    public function __construct(
        protected int $checkSheetId,
        protected int $bulan,
        protected int $tahun,
        protected bool $pakaiBbm = false,
        protected bool $kali60 = false
    ) {
    }

    public function title(): string
    {
        return 'Monitoring';
    }

    private function huruf(int $kolom): string
    {
        $letter = '';

        while ($kolom > 0) {
            $sisa = ($kolom - 1) % 26;
            $letter = chr(65 + $sisa) . $letter;
            $kolom = intdiv($kolom - 1, 26);
        }

        return $letter;
    }

    public function array(): array
    {
        $filterBulan = fn ($q) => $q
            ->where('bulan', $this->bulan)
            ->where('tahun', $this->tahun);

        $cs = CheckSheet::with([
            'monitoringItems'       => fn ($q) => $q->orderBy('no')->orderBy('id'),
            'monitoringItems.weeks' => $filterBulan,
            'bbmItems'              => fn ($q) => $q->orderBy('no')->orderBy('id'),
            'bbmItems.weeks'        => $filterBulan,
        ])->findOrFail($this->checkSheetId);

        // Generator     : Solar (L/jam)   x Running Hours
        // Pompa Hydrant : Solar (L/menit) x Running Hours x 60
        $kali60 = $this->kali60;
        $satuanSolar = $kali60 ? 'L/menit' : 'L/jam';

        $namaBulan = Carbon::create($this->tahun, $this->bulan, 1)
            ->translatedFormat('F Y');

        $rows = [];

        $add = function (array $values) use (&$rows): int {
            $rows[] = array_pad($values, self::KOLOM, '');

            return count($rows);
        };

        /* ============ TABEL: MONITORING RUNNING HOURS ============ */

        $this->judulRows[] = $add([
            'MONITORING RUNNING HOURS - ' . $cs->nama_checksheet . ' | ' . $namaBulan,
        ]);

        $h = $add(['No', 'Item', 'Keterangan', '', '', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']);
        $this->headerRows[] = [$h, $h];
        $this->merges[] = "C{$h}:E{$h}";

        $mulai = $h + 1;

        foreach ($cs->monitoringItems as $item) {
            $weeks = $item->weeks->keyBy('week');

            $r1 = count($rows) + 1; // baris foto
            $r2 = $r1 + 1;          // baris actual running

            $barisFoto = [$item->no, $item->nama_item, 'Foto', '', ''];
            $barisAct  = ['', '', 'Actual Running (jam)', '', ''];

            for ($n = 1; $n <= 5; $n++) {
                $wk = $weeks->get($n);

                $barisFoto[] = '';
                $barisAct[]  = ($wk && $wk->running_hours !== null)
                    ? (float) $wk->running_hours
                    : '';

                if ($wk && $wk->foto_path
                    && Storage::disk('public')->exists($wk->foto_path)) {
                    $this->fotos[] = [
                        $this->huruf(5 + $n) . $r1, // F..J
                        Storage::disk('public')->path($wk->foto_path),
                    ];
                }
            }

            $add($barisFoto);
            $add($barisAct);

            $this->fotoRows[] = $r1;

            $this->merges[] = "A{$r1}:A{$r2}";
            $this->merges[] = "B{$r1}:B{$r2}";
            $this->merges[] = "C{$r1}:E{$r1}";
            $this->merges[] = "C{$r2}:E{$r2}";
        }

        $akhir = count($rows);

        if ($akhir >= $mulai) {
            $this->dataRanges[] = [$mulai, $akhir];
        }

        /* ============ TABEL: KONSUMSI BAHAN BAKAR (data sendiri) ============ */

        if ($this->pakaiBbm) {
            $add([]);

            $this->judulRows[] = $add([
                'MONITORING KONSUMSI BAHAN BAKAR (SOLAR) - ' . $namaBulan,
            ]);

            // A No | B Type | C Kapasitas | D:E Solar | F..J W1-W5 | K Total
            $h = $add([
                'No', 'Type / Merk', 'Kapasitas', "Solar ({$satuanSolar})", '',
                'W1', 'W2', 'W3', 'W4', 'W5', 'Total',
            ]);
            $this->headerRows[] = [$h, $h];
            $this->merges[] = "D{$h}:E{$h}";

            $mulai3 = $h + 1;

            foreach ($cs->bbmItems as $item) {
                // sumber hitungan yang sama dengan tampilan web
                // (rumus mengikuti flag bbm_kali_60 di check sheet)
                $r = $item->ringkasan;

                $r1 = count($rows) + 1;
                $r2 = $r1 + 1;

                $barisRh = [
                    $item->no,
                    $item->nama_item,
                    $item->kapasitas ?? '',
                    (float) $item->solar_per_menit,
                    'Running Hours (jam)',
                ];
                $barisKons = ['', '', '', '', 'Konsumsi Solar (L)'];

                for ($n = 1; $n <= 5; $n++) {
                    $barisRh[]   = $r['per_minggu'][$n]['running_hours'] ?? '';
                    $barisKons[] = $r['per_minggu'][$n]['konsumsi'] ?? '';
                }

                $barisRh[]   = $r['total_running'];
                $barisKons[] = $r['total_konsumsi'];

                $add($barisRh);
                $add($barisKons);

                foreach (['A', 'B', 'C', 'D'] as $col) {
                    $this->merges[] = "{$col}{$r1}:{$col}{$r2}";
                }
            }

            $akhir3 = count($rows);

            if ($akhir3 >= $mulai3) {
                $this->dataRanges[] = [$mulai3, $akhir3];
            }

            $this->catatanRow = $add([
                $kali60
                    ? 'Rumus: Konsumsi Solar (L) = Solar (L/menit) x Running Hours (jam) x 60'
                    : 'Rumus: Konsumsi Solar (L) = Solar (L/jam) x Running Hours (jam)',
            ]);
        }

        return $rows;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $s = $event->sheet->getDelegate();
                $tinggi = $s->getHighestRow();

                $s->setShowGridlines(false);

                $s->getStyle("A1:K{$tinggi}")->getFont()->setName('Calibri');

                // Judul
                foreach ($this->judulRows as $r) {
                    $s->mergeCells("A{$r}:K{$r}");
                    $s->getStyle("A{$r}:K{$r}")->applyFromArray([
                        'font' => ['bold' => true, 'size' => 12],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_LEFT,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'color' => ['rgb' => 'D9EAF7'],
                        ],
                    ]);
                    $s->getRowDimension($r)->setRowHeight(24);
                }

                // Header
                foreach ($this->headerRows as [$a, $b]) {
                    $s->getStyle("A{$a}:K{$b}")->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                            'wrapText' => true,
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'color' => ['rgb' => 'EDEDED'],
                        ],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '808080'],
                            ],
                        ],
                    ]);

                    for ($r = $a; $r <= $b; $r++) {
                        $s->getRowDimension($r)->setRowHeight(30);
                    }
                }

                // Data
                foreach ($this->dataRanges as [$a, $b]) {
                    $s->getStyle("A{$a}:K{$b}")->applyFromArray([
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                            'wrapText' => true,
                        ],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'BFBFBF'],
                            ],
                        ],
                    ]);

                    $s->getStyle("B{$a}:B{$b}")
                        ->getAlignment()
                        ->setHorizontal(Alignment::HORIZONTAL_LEFT);

                    for ($r = $a; $r <= $b; $r++) {
                        $s->getRowDimension($r)->setRowHeight(22);
                    }
                }

                // Gabung sel (setelah styling)
                foreach ($this->merges as $range) {
                    $s->mergeCells($range);
                }

                // Baris foto lebih tinggi
                foreach ($this->fotoRows as $r) {
                    $s->getRowDimension($r)->setRowHeight(82);
                }

                // Catatan rumus
                if ($this->catatanRow) {
                    $r = $this->catatanRow;
                    $s->mergeCells("A{$r}:K{$r}");
                    $s->getStyle("A{$r}")->getFont()->setItalic(true)->setSize(10);
                }

                // Lebar kolom
                foreach ([
                    'A' => 6, 'B' => 30, 'C' => 14, 'D' => 14, 'E' => 22,
                    'F' => 17, 'G' => 17, 'H' => 17, 'I' => 17, 'J' => 17,
                    'K' => 18,
                ] as $col => $lebar) {
                    $s->getColumnDimension($col)->setWidth($lebar);
                }

                // Foto (maks 110 x 100 px, proporsional)
                foreach ($this->fotos as [$koordinat, $path]) {
                    $ukuran = @getimagesize($path);

                    $d = new Drawing();
                    $d->setPath($path);
                    $d->setCoordinates($koordinat);
                    $d->setOffsetX(4);
                    $d->setOffsetY(4);

                    if ($ukuran && $ukuran[0] && $ukuran[1]) {
                        $skala = min(110 / $ukuran[0], 100 / $ukuran[1]);

                        $d->setResizeProportional(false);
                        $d->setWidth((int) ($ukuran[0] * $skala));
                        $d->setHeight((int) ($ukuran[1] * $skala));
                    }

                    $d->setWorksheet($s);
                }

                $s->getPageSetup()
                    ->setOrientation('landscape')
                    ->setFitToWidth(1)
                    ->setFitToHeight(0);
            },
        ];
    }
}
