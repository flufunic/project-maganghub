<?php

namespace App\Exports;

use App\Models\CheckSheet;
use App\Models\Line;
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
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class CheckSheetExport implements FromArray, WithEvents, WithTitle
{
    protected $checkSheetId;
    protected $bulan;
    protected $tahun;
    protected ?int $lineId;

    // Mode KWH    : tiap tanggal = 3 kolom (Act, Sel, Catatan).
    // Mode Plan/Act: tiap tanggal = 2 kolom (Plan, Act).
    // Mode biasa  : tiap tanggal = 1 kolom (centang).
    protected bool $pakaiActual = false;
    protected bool $pakaiPlanAct = false;
    protected bool $pakaiPelumasan = false;
    protected bool $pakaiMonitoring = false;
    protected bool $pakaiBbm = false;
    protected bool $bbmKali60 = false;
    protected bool $adaSubHeader = false; // header tabel 2 baris (KWH atau Plan/Act)
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

    // Bagian "CATATAN CHECKLIST" (mode Plan/Act & mode biasa).
    // Kalau tidak ada catatan sama sekali, semuanya tetap 0 dan bagian ini tidak dibuat.
    protected int $catatanTitleRow = 0;
    protected int $catatanHeaderRow = 0;
    protected int $catatanStartRow = 0;
    protected int $catatanEndRow = 0;

    // Bagian "PELUMASAN" (hanya kalau check sheet memakai opsi pelumasan).
    // Header 2 baris: $lubHeaderRow (judul kolom) + $lubHeaderRow + 1 (Day/Week/Month/Year).
    protected int $lubTitleRow = 0;
    protected int $lubHeaderRow = 0;
    protected int $lubStartRow = 0;
    protected int $lubEndRow = 0;

    // Baris data pelumasan (dipakai lagi saat styling untuk tinggi baris)
    protected array $lubData = [];

    // Bagian "MONITORING RUNNING HOURS" (opsi Monitoring)
    protected int $monTitleRow = 0;
    protected int $monHeaderRow = 0;
    protected int $monStartRow = 0;
    protected int $monEndRow = 0;
    protected array $monItems = [];

    // Foto monitoring: [koordinat sel, path file, lebar segmen]
    protected array $monFotos = [];

    // Bagian "KONSUMSI BAHAN BAKAR" (opsi Monitoring + BBM)
    protected int $bbmTitleRow = 0;
    protected int $bbmHeaderRow = 0;
    protected int $bbmStartRow = 0;
    protected int $bbmEndRow = 0;
    protected int $bbmCatatanRow = 0;
    protected array $bbmItems = [];

    protected int $abnormalityTitleRow = 0;
    protected int $abnormalityHeaderRow = 0;
    protected int $abnormalityStartRow = 0;
    protected int $abnormalityEndRow = 0;

    // Data abnormality (dipakai lagi saat styling untuk tinggi baris)
    protected $abnormalities;

    // Sel Selisih yang perlu diberi warna merah (diisi saat array() dibuat)
    protected array $redCells = [];

    // Catatan checklist yang terkumpul saat baris item dibuat
    // [ ['hari','shift','no','item','kolom','catatan','sub'], ... ]
    protected array $catatanList = [];

    // Hasil urut $catatanList (dipakai lagi saat styling)
    protected array $catatanSorted = [];

    // Sel centang yang diberi komentar Excel (segitiga merah di pojok sel)
    // [ ['cell' => 'F12', 'text' => '...'], ... ]
    protected array $noteCells = [];

    public function __construct($checkSheetId, $bulan, $tahun, $lineId = null)
    {
        $this->checkSheetId = $checkSheetId;
        $this->bulan = (int) $bulan;
        $this->tahun = (int) $tahun;
        $this->lineId = $lineId ? (int) $lineId : null;

        $this->pakaiActual = (bool) CheckSheet::whereKey($checkSheetId)
            ->value('pakai_actual');

        $this->pakaiPlanAct = (bool) CheckSheet::whereKey($checkSheetId)
            ->value('pakai_plan_act');

        $this->pakaiPelumasan = (bool) CheckSheet::whereKey($checkSheetId)
            ->value('pakai_pelumasan');

        $this->pakaiMonitoring = (bool) CheckSheet::whereKey($checkSheetId)
            ->value('pakai_monitoring');

        // BBM hanya ada kalau monitoring aktif
        $this->pakaiBbm = $this->pakaiMonitoring
            && (bool) CheckSheet::whereKey($checkSheetId)->value('pakai_bbm');

        $this->bbmKali60 = $this->pakaiBbm
            && (bool) CheckSheet::whereKey($checkSheetId)->value('bbm_kali_60');

        $this->perTanggal = $this->pakaiActual
            ? 3
            : ($this->pakaiPlanAct ? 2 : 1);

        $this->adaSubHeader = $this->pakaiActual || $this->pakaiPlanAct;

        $jumlahHari = cal_days_in_month(
            CAL_GREGORIAN,
            $this->bulan,
            $this->tahun
        );

        // A-D = informasi item
        // E dst = tanggal (1, 2, atau 3 kolom per tanggal)
        $this->lastColumnNumber = 4 + ($jumlahHari * $this->perTanggal);
        $this->lastColumn = $this->columnLetter(
            $this->lastColumnNumber
        );
    }

    /**
     * Nama sheet (dipakai saat digabung dengan sheet Monitoring).
     */
    public function title(): string
    {
        return 'Check Sheet';
    }

    /**
     * Nomor kolom untuk tanggal $hari.
     * $sub: 0 = Act / Plan / centang, 1 = Sel / Act, 2 = Catatan.
     */
    private function dayColumn(int $hari, int $sub = 0): int
    {
        return 4 + (($hari - 1) * $this->perTanggal) + 1 + $sub;
    }

    /**
     * Kolom paling kanan untuk sel yang di-merge pada bagian judul / catatan.
     * Dibatasi sampai kolom ke-22 supaya tetap terlihat di layar pertama
     * (di mode lebar tabel bisa 90+ kolom).
     */
    private function mergeAkhirColumn(): string
    {
        return $this->columnLetter(min($this->lastColumnNumber, 22));
    }

    /**
     * Lebar rata-rata satu kolom tanggal (sesuai pengaturan lebar kolom di bawah).
     */
    private function rataLebarKolomTanggal(): float
    {
        if ($this->pakaiActual) {
            return (9 + 7 + 16) / 3;
        }

        return $this->pakaiPlanAct ? 5.5 : 4.2;
    }

    /**
     * Bagi kolom $mulai..$akhir ke beberapa field sesuai bobot.
     * Field terakhir selalu sampai $akhir, jadi tabel penuh sampai ujung
     * (sama lebarnya dengan tabel Shift di atas).
     *
     * Hasil: [ 'kunci' => ['start' => 5, 'end' => 9, 'width' => 21.0], ... ]
     */
    private function distribusiKolom(array $bobot, int $mulai, int $akhir): array
    {
        $total = $akhir - $mulai + 1;
        $jumlahBobot = array_sum($bobot);
        $rata = $this->rataLebarKolomTanggal();

        $hasil = [];
        $cursor = $mulai;
        $sisa = count($bobot);

        foreach ($bobot as $kunci => $b) {
            $sisa--;

            if ($sisa === 0) {
                $end = $akhir;
            } else {
                $span = max(1, (int) round($total * $b / $jumlahBobot));
                // sisakan minimal 1 kolom untuk tiap field berikutnya
                $end = min($cursor + $span - 1, $akhir - $sisa);
            }

            $hasil[$kunci] = [
                'start' => $cursor,
                'end'   => $end,
                'width' => ($end - $cursor + 1) * $rata,
            ];

            $cursor = $end + 1;
        }

        return $hasil;
    }

    /**
     * Pembagian kolom untuk tabel pelumasan.
     *
     * Kolom A-D dipakai No, Sub Mesin, Jenis Pelumasan, Qty (lebarnya sudah tetap).
     * Sisanya (Method, Tools, Time, Day, Week, Month, Year, PIC) dibagi rata sesuai
     * bobot dari kolom E sampai kolom terakhir, jadi tabel penuh selebar tabel Shift.
     */
    private function lubSegments(): array
    {
        return $this->distribusiKolom([
            'method' => 18,
            'tools'  => 18,
            'time'   => 8,
            'day'    => 6,
            'week'   => 6,
            'month'  => 6,
            'year'   => 6,
            'pic'    => 14,
        ], 5, $this->lastColumnNumber);
    }

    /**
     * Pembagian kolom untuk tabel abnormality.
     *
     * No = A, Tanggal = B, Abnormality = C:D (merge),
     * sisanya (Countermeasure, Status, PIC) dibagi di E sampai kolom terakhir.
     */
    private function abnSegments(): array
    {
        return $this->distribusiKolom([
            'countermeasure' => 55,
            'status'         => 20,
            'pic'            => 25,
        ], 5, $this->lastColumnNumber);
    }

    /**
     * Baris tabel pelumasan (header maupun data).
     * $nilai = [ 'no','sub_mesin','jenis','qty','method','tools','time','day','week','month','year','pic' ]
     */
    private function makeLubRow(array $nilai): array
    {
        $row = $this->emptyRow();

        $row[0] = $nilai['no'] ?? '';
        $row[1] = $nilai['sub_mesin'] ?? '';
        $row[2] = $nilai['jenis'] ?? '';
        $row[3] = $nilai['qty'] ?? '';

        foreach ($this->lubSegments() as $kunci => $segmen) {
            $row[$segmen['start'] - 1] = $nilai[$kunci] ?? '';
        }

        return $row;
    }

    /**
     * Tabel Monitoring Running Hours: Week 1-5 sama lebar,
     * dari kolom E sampai kolom terakhir (sama lebarnya dengan tabel Shift).
     */
    private function monSegments(): array
    {
        return $this->distribusiKolom([
            'w1' => 1,
            'w2' => 1,
            'w3' => 1,
            'w4' => 1,
            'w5' => 1,
        ], 5, $this->lastColumnNumber);
    }

    /**
     * Tabel Konsumsi Bahan Bakar: keterangan, W1-W5, Total.
     */
    private function bbmSegments(): array
    {
        return $this->distribusiKolom([
            'label' => 18,
            'w1'    => 12,
            'w2'    => 12,
            'w3'    => 12,
            'w4'    => 12,
            'w5'    => 12,
            'total' => 14,
        ], 5, $this->lastColumnNumber);
    }

    /**
     * Baris tabel monitoring.
     * $nilai = [ 'no','item','ket','w1'..'w5' ]
     */
    private function makeMonRow(array $nilai): array
    {
        $row = $this->emptyRow();

        $row[0] = $nilai['no'] ?? '';
        $row[1] = $nilai['item'] ?? '';
        $row[2] = $nilai['ket'] ?? '';

        foreach ($this->monSegments() as $kunci => $segmen) {
            $row[$segmen['start'] - 1] = $nilai[$kunci] ?? '';
        }

        return $row;
    }

    /**
     * Baris tabel konsumsi bahan bakar.
     * $nilai = [ 'no','type','kap','solar','label','w1'..'w5','total' ]
     */
    private function makeBbmRow(array $nilai): array
    {
        $row = $this->emptyRow();

        $row[0] = $nilai['no'] ?? '';
        $row[1] = $nilai['type'] ?? '';
        $row[2] = $nilai['kap'] ?? '';
        $row[3] = $nilai['solar'] ?? '';

        foreach ($this->bbmSegments() as $kunci => $segmen) {
            $row[$segmen['start'] - 1] = $nilai[$kunci] ?? '';
        }

        return $row;
    }

    /**
     * Baris tabel abnormality (header maupun data).
     * $nilai = [ 'no','tanggal','abnormality','countermeasure','status','pic' ]
     */
    private function makeAbnRow(array $nilai): array
    {
        $row = $this->emptyRow();

        $row[0] = $nilai['no'] ?? '';
        $row[1] = $nilai['tanggal'] ?? '';
        $row[2] = $nilai['abnormality'] ?? '';

        foreach ($this->abnSegments() as $kunci => $segmen) {
            $row[$segmen['start'] - 1] = $nilai[$kunci] ?? '';
        }

        return $row;
    }

    /**
     * Membuat seluruh isi Excel sebagai array.
     */
    public function array(): array
    {
        $this->redCells = [];
        $this->catatanList = [];
        $this->catatanSorted = [];
        $this->noteCells = [];
        $this->lubData = [];
        $this->monItems = [];
        $this->monFotos = [];
        $this->bbmItems = [];

        // Rentang tanggal bulan yang diexport
        $awalBulan = Carbon::create($this->tahun, $this->bulan, 1)->startOfMonth();
        $akhirBulan = $awalBulan->copy()->endOfMonth();

        // data monitoring / BBM hanya untuk bulan & tahun yang diexport
        $filterBulan = fn ($query) => $query
            ->where('bulan', $this->bulan)
            ->where('tahun', $this->tahun);

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

            // pelumasan dipakai bersama semua line (jadwal statis)
            'lubrications' => function ($query) {
                $query->orderBy('no')->orderBy('id');
            },

            // monitoring running hours + konsumsi bahan bakar
            'monitoringItems' => fn ($query) => $query->orderBy('no')->orderBy('id'),
            'monitoringItems.weeks' => $filterBulan,
            'bbmItems' => fn ($query) => $query->orderBy('no')->orderBy('id'),
            'bbmItems.weeks' => $filterBulan,

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

        // simpan supaya bisa dipakai lagi di registerEvents()
        $this->abnormalities = $abnormalities;

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

        if ($this->adaSubHeader) {
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

        if ($this->adaSubHeader) {
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
        | CATATAN CHECKLIST (mode Plan/Act & mode biasa)
        | Mode KWH tidak dipakai karena sudah punya kolom Catatan sendiri.
        |--------------------------------------------------------------------------
        */

        if (! $this->pakaiActual && count($this->catatanList) > 0) {
            $this->catatanSorted = collect($this->catatanList)
                ->sortBy([
                    ['hari', 'asc'],
                    ['shift', 'asc'],
                    ['no', 'asc'],
                    ['sub', 'asc'],
                ])
                ->values()
                ->all();

            $this->catatanTitleRow = count($rows) + 1;

            $rows[] = $this->makeRow([
                'CATATAN CHECKLIST',
            ]);

            $this->catatanHeaderRow = count($rows) + 1;

            $rows[] = $this->makeRow([
                'No',
                'Inspection Point',
                'Tanggal',
                'Shift / Kolom',
                'Catatan',
            ]);

            $this->catatanStartRow = count($rows) + 1;

            foreach ($this->catatanSorted as $index => $n) {
                $rows[] = $this->makeRow([
                    $index + 1,
                    $n['item'],
                    Carbon::create($this->tahun, $this->bulan, $n['hari'])->format('d/m/Y'),
                    'Shift ' . $n['shift'] . ' · ' . $n['kolom'],
                    $n['catatan'],
                ]);
            }

            $this->catatanEndRow = count($rows);

            /*
            | JARAK
            */

            $rows[] = $this->emptyRow();
        }

        /*
        |--------------------------------------------------------------------------
        | MONITORING RUNNING HOURS (hanya kalau opsi Monitoring dicentang)
        |--------------------------------------------------------------------------
        */

        if ($this->pakaiMonitoring) {
            $this->monItems = ($checkSheet->monitoringItems ?? collect())
                ->values()
                ->all();

            $segMon = $this->monSegments();

            $this->monTitleRow = count($rows) + 1;

            $rows[] = $this->makeRow([
                'MONITORING RUNNING HOURS - ' . $checkSheet->nama_checksheet . ' | ' . $namaBulan,
            ]);

            $this->monHeaderRow = count($rows) + 1;

            $rows[] = $this->makeMonRow([
                'no'   => 'No',
                'item' => 'Item',
                'ket'  => 'Keterangan',
                'w1'   => 'Week 1',
                'w2'   => 'Week 2',
                'w3'   => 'Week 3',
                'w4'   => 'Week 4',
                'w5'   => 'Week 5',
            ]);

            $this->monStartRow = count($rows) + 1;

            foreach ($this->monItems as $item) {
                $weeks = $item->weeks->keyBy('week');

                $r1 = count($rows) + 1; // baris foto

                $barisFoto = [
                    'no'   => $item->no,
                    'item' => $item->nama_item,
                    'ket'  => 'Foto',
                ];

                $barisAct = [
                    'ket' => 'Actual Running (jam)',
                ];

                for ($n = 1; $n <= 5; $n++) {
                    $wk = $weeks->get($n);

                    $barisAct['w' . $n] = ($wk && $wk->running_hours !== null)
                        ? (float) $wk->running_hours
                        : '';

                    if ($wk && $wk->foto_path
                        && Storage::disk('public')->exists($wk->foto_path)) {
                        $this->monFotos[] = [
                            $r1,
                            $segMon['w' . $n]['start'],
                            $segMon['w' . $n]['end'],
                            Storage::disk('public')->path($wk->foto_path),
                        ];
                    }
                }

                $rows[] = $this->makeMonRow($barisFoto);
                $rows[] = $this->makeMonRow($barisAct);
            }

            $this->monEndRow = count($rows);

            /*
            | JARAK
            */

            $rows[] = $this->emptyRow();
        }

        /*
        |--------------------------------------------------------------------------
        | KONSUMSI BAHAN BAKAR (hanya kalau Monitoring + BBM dicentang)
        |--------------------------------------------------------------------------
        */

        if ($this->pakaiMonitoring && $this->pakaiBbm) {
            $this->bbmItems = ($checkSheet->bbmItems ?? collect())
                ->values()
                ->all();

            // Generator     : Solar (L/jam)   x Running Hours
            // Pompa Hydrant : Solar (L/menit) x Running Hours x 60
            $satuanSolar = $this->bbmKali60 ? 'L/menit' : 'L/jam';

            $this->bbmTitleRow = count($rows) + 1;

            $rows[] = $this->makeRow([
                'MONITORING KONSUMSI BAHAN BAKAR (SOLAR) - ' . $namaBulan,
            ]);

            $this->bbmHeaderRow = count($rows) + 1;

            $rows[] = $this->makeBbmRow([
                'no'    => 'No',
                'type'  => 'Type / Merk',
                'kap'   => 'Kapasitas',
                'solar' => "Solar ({$satuanSolar})",
                'label' => 'Keterangan',
                'w1'    => 'W1',
                'w2'    => 'W2',
                'w3'    => 'W3',
                'w4'    => 'W4',
                'w5'    => 'W5',
                'total' => 'Total',
            ]);

            $this->bbmStartRow = count($rows) + 1;

            foreach ($this->bbmItems as $item) {
                // sumber hitungan yang sama dengan tampilan web
                $ring = $item->ringkasan;

                $barisRh = [
                    'no'    => $item->no,
                    'type'  => $item->nama_item,
                    'kap'   => $item->kapasitas ?? '',
                    'solar' => (float) $item->solar_per_menit,
                    'label' => 'Running Hours (jam)',
                ];

                $barisKons = [
                    'label' => 'Konsumsi Solar (L)',
                ];

                for ($n = 1; $n <= 5; $n++) {
                    $barisRh['w' . $n]   = $ring['per_minggu'][$n]['running_hours'] ?? '';
                    $barisKons['w' . $n] = $ring['per_minggu'][$n]['konsumsi'] ?? '';
                }

                $barisRh['total']   = $ring['total_running'] ?? '';
                $barisKons['total'] = $ring['total_konsumsi'] ?? '';

                $rows[] = $this->makeBbmRow($barisRh);
                $rows[] = $this->makeBbmRow($barisKons);
            }

            $this->bbmEndRow = count($rows);

            $this->bbmCatatanRow = count($rows) + 1;

            $rows[] = $this->makeRow([
                $this->bbmKali60
                    ? 'Rumus: Konsumsi Solar (L) = Solar (L/menit) x Running Hours (jam) x 60'
                    : 'Rumus: Konsumsi Solar (L) = Solar (L/jam) x Running Hours (jam)',
            ]);

            /*
            | JARAK
            */

            $rows[] = $this->emptyRow();
        }

        /*
        |--------------------------------------------------------------------------
        | PELUMASAN (hanya kalau opsi "Pakai tabel Pelumasan" dicentang)
        |--------------------------------------------------------------------------
        */

        if ($this->pakaiPelumasan) {
            $this->lubData = ($checkSheet->lubrications ?? collect())
                ->values()
                ->all();

            $this->lubTitleRow = count($rows) + 1;

            $rows[] = $this->makeRow([
                'PELUMASAN',
            ]);

            // header baris 1
            $this->lubHeaderRow = count($rows) + 1;

            $rows[] = $this->makeLubRow([
                'no'        => 'No',
                'sub_mesin' => 'Sub Mesin',
                'jenis'     => 'Jenis Pelumasan',
                'qty'       => 'Qty Pelumasan',
                'method'    => 'Method',
                'tools'     => 'Tools',
                'time'      => 'Time (Min)',
                'day'       => 'Interval',
                'pic'       => 'PIC',
            ]);

            // header baris 2 (Day / Week / Month / Year)
            $rows[] = $this->makeLubRow([
                'day'   => 'Day',
                'week'  => 'Week',
                'month' => 'Month',
                'year'  => 'Year',
            ]);

            $this->lubStartRow = count($rows) + 1;

            foreach ($this->lubData as $index => $lub) {
                $rows[] = $this->makeLubRow([
                    'no'        => $index + 1,
                    'sub_mesin' => $lub->sub_mesin ?? '',
                    'jenis'     => $lub->jenis_pelumasan ?? '',
                    'qty'       => $lub->qty ?? '',
                    'method'    => $lub->method ?? '',
                    'tools'     => $lub->tools ?? '',
                    'time'      => $lub->time_minutes ?? '',
                    'day'       => $lub->interval === 'day' ? 'o' : '',
                    'week'      => $lub->interval === 'week' ? 'o' : '',
                    'month'     => $lub->interval === 'month' ? 'o' : '',
                    'year'      => $lub->interval === 'year' ? 'o' : '',
                    'pic'       => $lub->pic ?? '',
                ]);
            }

            $this->lubEndRow = count($rows);

            /*
            | JARAK
            */

            $rows[] = $this->emptyRow();
        }

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
     * Mode KWH / Plan-Act: angka tanggal ditaruh di kolom pertama,
     * lalu di-merge selebar jumlah kolom per tanggal.
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

            for ($i = 1; $i < $this->perTanggal; $i++) {
                $row[] = '';
            }
        }

        return $this->makeRow($row);
    }

    /**
     * Baris header kedua:
     * - KWH       : Act / Sel / Catatan per tanggal.
     * - Plan/Act  : Plan / Act per tanggal.
     */
    private function makeSubHeader(int $jumlahHari): array
    {
        $row = ['', '', '', ''];

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {
            if ($this->pakaiActual) {
                $row[] = 'Act';
                $row[] = 'Sel';
                $row[] = 'Catatan';
            } else {
                $row[] = 'Plan';
                $row[] = 'Act';
            }
        }

        return $this->makeRow($row);
    }

    /**
     * Actual terakhir (yang terisi) SEBELUM tanggal 1 bulan yang diexport,
     * supaya selisih tanggal 1 menyambung ke bulan lalu.
     */
    private function actualSebelumBulan($item): ?float
    {
        $awalBulan = Carbon::create($this->tahun, $this->bulan, 1)->toDateString();

        $nilai = $item->checklists()
            ->where('line_id', $this->lineId)
            ->where('tanggal', '<', $awalBulan)
            ->whereNotNull('actual')
            ->orderByDesc('tanggal')
            ->value('actual');

        return $nilai !== null ? (float) $nilai : null;
    }

    /**
     * Hitung Actual / Selisih / Catatan tiap tanggal untuk satu item.
     * Aturan sama dengan di halaman web:
     * - Actual  : input manual (tersimpan di DB).
     * - Selisih : otomatis = actual hari ini - actual terakhir sebelumnya.
     * - Tanggal 1 menyambung ke actual terakhir bulan lalu.
     * - Hari dengan actual kosong dilewati; selisih berikutnya dihitung
     *   dari actual terakhir yang terisi.
     */
    private function hitungNilai($item, int $jumlahHari): array
    {
        $hasil = [];
        $prevActual = $this->actualSebelumBulan($item);

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {
            $tanggal = Carbon::create($this->tahun, $this->bulan, $hari);

            $c = $item->checklists->first(
                function ($checklist) use ($tanggal) {
                    return $checklist->tanggal
                        && Carbon::parse($checklist->tanggal)->isSameDay($tanggal);
                }
            );

            $actual = ($c && $c->actual !== null) ? (float) $c->actual : null;

            $selisih = ($actual !== null && $prevActual !== null)
                ? round($actual - $prevActual, 2)
                : null;

            $hasil[$hari] = [
                'actual'  => $actual,
                'selisih' => $selisih,
                'catatan' => $c->catatan ?? '',
            ];

            if ($actual !== null) {
                $prevActual = $actual;
            }
        }

        return $hasil;
    }

    /**
     * Simpan satu catatan checklist:
     * - masuk ke daftar "CATATAN CHECKLIST" di bagian bawah sheet
     * - sel centangnya diberi komentar Excel (segitiga merah)
     *
     * $kolom : 'Plan', 'Act', atau 'Checklist' (mode biasa)
     * $sub   : 0 = kolom pertama tanggal itu, 1 = kolom kedua (Act di mode Plan/Act)
     */
    private function catatNote(
        $item,
        int $hari,
        string $kolom,
        $teks,
        int $rowNumber,
        int $sub
    ): void {
        $teks = trim((string) $teks);

        if ($teks === '') {
            return;
        }

        $this->catatanList[] = [
            'hari'    => $hari,
            'shift'   => (string) $item->shift,
            'no'      => (int) $item->no,
            'item'    => (string) $item->inspection_point,
            'kolom'   => $kolom,
            'catatan' => $teks,
            'sub'     => $sub,
        ];

        $this->noteCells[] = [
            'cell' => $this->columnLetter($this->dayColumn($hari, $sub)) . $rowNumber,
            'text' => $kolom === 'Checklist' ? $teks : $kolom . ': ' . $teks,
        ];
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

                if ($n['selisih'] !== null && abs($n['selisih']) > 0.00001) {
                    $this->redCells[] =
                        $this->columnLetter($this->dayColumn($hari, 1)) . $rowNumber;
                }
            }

            return $this->makeRow($row);
        }

        /*
         * MODE PLAN / ACT: dua kolom per tanggal
         * catatan_plan = catatan kolom Plan, catatan = catatan kolom Act
         */
        if ($this->pakaiPlanAct) {
            for ($hari = 1; $hari <= $jumlahHari; $hari++) {
                $tanggal = Carbon::create(
                    $this->tahun,
                    $this->bulan,
                    $hari
                );

                $c = $item->checklists->first(
                    function ($checklist) use ($tanggal) {
                        return $checklist->tanggal
                            && Carbon::parse($checklist->tanggal)
                                ->isSameDay($tanggal);
                    }
                );

                $row[] = ($c && (bool) $c->plan) ? '✓' : '';
                $row[] = ($c && (bool) $c->status) ? '✓' : '';

                if ($c) {
                    $this->catatNote($item, $hari, 'Plan', $c->catatan_plan ?? null, $rowNumber, 0);
                    $this->catatNote($item, $hari, 'Act', $c->catatan ?? null, $rowNumber, 1);
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

            if ($checklist) {
                $this->catatNote($item, $hari, 'Checklist', $checklist->catatan ?? null, $rowNumber, 0);
            }
        }

        return $this->makeRow($row);
    }

    /**
     * Header abnormality.
     */
    private function makeAbnormalityHeader(): array
    {
        return $this->makeAbnRow([
            'no'             => 'No',
            'tanggal'        => 'Tanggal',
            'abnormality'    => 'Abnormality',
            'countermeasure' => 'Countermeasure',
            'status'         => 'Status',
            'pic'            => 'PIC',
        ]);
    }

    /**
     * Data abnormality.
     */
    private function makeAbnormalityRow(
        int $no,
        $abnormality
    ): array {
        return $this->makeAbnRow([
            'no'             => $no,

            'tanggal'        => $abnormality->tanggal
                ? Carbon::parse($abnormality->tanggal)->format('d/m/Y')
                : '',

            'abnormality'    => $abnormality->abnormality ?? '',

            'countermeasure' => $abnormality->countermeasure ?? '',

            'status'         => $abnormality->status ?? '',

            'pic'            => $abnormality->pic ?? '',
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

                $abnormalities = $this->abnormalities ?? collect();

                $highestRow = $sheet->getHighestRow();

                // jumlah baris header tabel (2 di mode KWH / Plan-Act, 1 di mode biasa)
                $headerSpan = $this->adaSubHeader ? 2 : 1;

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

                // Judul rata tengah.
                $alignJudul = Alignment::HORIZONTAL_CENTER;

                // Judul di-merge selebar seluruh tabel (A sampai kolom terakhir)
                // supaya tepat berada di tengah-tengah tabel.
                $judulAkhir = $this->lastColumn;

                /*
                |--------------------------------------------------------------------------
                | TITLE
                |--------------------------------------------------------------------------
                */

                $sheet->mergeCells(
                    "A1:{$judulAkhir}1"
                );

                $sheet->mergeCells(
                    "A2:{$judulAkhir}2"
                );

                $sheet->getStyle(
                    "A1:{$judulAkhir}1"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => $this->adaSubHeader ? 26 : 18,
                        'color' => ['rgb' => '000000'],
                    ],

                    'alignment' => [
                        'horizontal' => $alignJudul,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle(
                    "A2:{$judulAkhir}2"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => $this->adaSubHeader ? 15 : 11,
                        'color' => ['rgb' => '000000'],
                    ],

                    'alignment' => [
                        'horizontal' => $alignJudul,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight($this->adaSubHeader ? 44 : 32);
                $sheet->getRowDimension(2)->setRowHeight($this->adaSubHeader ? 28 : 22);

                /*
                |--------------------------------------------------------------------------
                | DETAIL DOKUMEN
                |--------------------------------------------------------------------------
                */

                $sheet->mergeCells("A3:{$judulAkhir}3");

                $sheet->getStyle("A3:{$judulAkhir}3")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => $this->adaSubHeader ? 13 : 10,
                        'color' => ['rgb' => '000000'],
                    ],
                    'alignment' => [
                        'horizontal' => $alignJudul,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                ]);

                $sheet->getRowDimension(3)->setRowHeight($this->adaSubHeader ? 30 : 28);

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

                    if ($this->adaSubHeader) {
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

                        // Mode KWH / Plan-Act: tanggal digabung selebar 2-3 kolom
                        if ($this->adaSubHeader) {
                            $columnAkhir = $this->columnLetter(
                                $this->dayColumn($hari, $this->perTanggal - 1)
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
                | WARNA KHUSUS KWH: selisih merah
                | (setelah weekend, supaya tidak tertimpa)
                |--------------------------------------------------------------------------
                */

                foreach ($this->redCells as $cell) {
                    $sheet->getStyle($cell)->getFont()
                        ->setBold(true)
                        ->getColor()->setRGB('C00000');
                }

                /*
                |--------------------------------------------------------------------------
                | KOMENTAR EXCEL PADA SEL YANG PUNYA CATATAN
                | (segitiga merah di pojok sel, isi catatan muncul saat kursor diarahkan)
                |--------------------------------------------------------------------------
                */

                foreach ($this->noteCells as $note) {
                    $comment = $sheet->getComment($note['cell']);

                    $comment->setAuthor('Catatan');
                    $comment->getText()->createTextRun($note['text']);
                    $comment->setWidth('220pt');
                    $comment->setHeight('70pt');
                }

                /*
                |--------------------------------------------------------------------------
                | CATATAN CHECKLIST (daftar di bawah tabel shift)
                |--------------------------------------------------------------------------
                */

                $barisCatatan = [];

                if ($this->catatanStartRow > 0) {
                    $akhirCatatan = $this->mergeAkhirColumn();

                    // Judul
                    $sheet->mergeCells(
                        "A{$this->catatanTitleRow}:{$this->lastColumn}{$this->catatanTitleRow}"
                    );

                    $sheet->getStyle(
                        "A{$this->catatanTitleRow}:{$this->lastColumn}{$this->catatanTitleRow}"
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
                                'rgb' => 'E2EFDA',
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

                    $sheet->getRowDimension($this->catatanTitleRow)->setRowHeight(24);

                    // Header
                    $sheet->mergeCells(
                        "E{$this->catatanHeaderRow}:{$akhirCatatan}{$this->catatanHeaderRow}"
                    );

                    $sheet->getStyle(
                        "A{$this->catatanHeaderRow}:{$akhirCatatan}{$this->catatanHeaderRow}"
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

                    $sheet->getRowDimension($this->catatanHeaderRow)->setRowHeight(22);

                    // Data
                    for ($r = $this->catatanStartRow; $r <= $this->catatanEndRow; $r++) {
                        $sheet->mergeCells("E{$r}:{$akhirCatatan}{$r}");

                        $n = $this->catatanSorted[$r - $this->catatanStartRow] ?? null;

                        // merge tidak auto-tinggi, jadi tinggi baris dihitung dari panjang teks
                        $barisTeks = $n ? (int) ceil(mb_strlen($n['catatan']) / 70) : 1;
                        $barisItem = $n ? (int) ceil(mb_strlen($n['item']) / 30) : 1;

                        $sheet->getRowDimension($r)->setRowHeight(
                            max(22, max($barisTeks, $barisItem, 1) * 15)
                        );

                        $barisCatatan[] = $r;
                    }

                    $sheet->getStyle(
                        "A{$this->catatanStartRow}:{$akhirCatatan}{$this->catatanEndRow}"
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

                    // No, Tanggal, Shift / Kolom rata tengah
                    foreach (['A', 'C', 'D'] as $col) {
                        $sheet->getStyle(
                            "{$col}{$this->catatanStartRow}:{$col}{$this->catatanEndRow}"
                        )->getAlignment()->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );
                    }

                    // Catatan rata kiri
                    $sheet->getStyle(
                        "E{$this->catatanStartRow}:{$akhirCatatan}{$this->catatanEndRow}"
                    )->getAlignment()->setHorizontal(
                        Alignment::HORIZONTAL_LEFT
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | MONITORING RUNNING HOURS (selebar tabel Shift)
                |--------------------------------------------------------------------------
                */

                $barisMon = [];

                if ($this->pakaiMonitoring && $this->monTitleRow > 0) {
                    $mseg = $this->monSegments();
                    $hM = $this->monHeaderRow;

                    $barisMon[] = $this->monTitleRow;
                    $barisMon[] = $hM;

                    // Judul
                    $sheet->mergeCells(
                        "A{$this->monTitleRow}:{$this->lastColumn}{$this->monTitleRow}"
                    );

                    $sheet->getStyle(
                        "A{$this->monTitleRow}:{$this->lastColumn}{$this->monTitleRow}"
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
                                'rgb' => 'DDEBF7',
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

                    $sheet->getRowDimension($this->monTitleRow)->setRowHeight(24);

                    // Header
                    $sheet->getStyle(
                        "A{$hM}:{$this->lastColumn}{$hM}"
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

                    $sheet->getRowDimension($hM)->setRowHeight(26);

                    $sheet->mergeCells("C{$hM}:D{$hM}");

                    foreach ($mseg as $segmen) {
                        $s = $this->columnLetter($segmen['start']);
                        $e = $this->columnLetter($segmen['end']);

                        if ($s !== $e) {
                            $sheet->mergeCells("{$s}{$hM}:{$e}{$hM}");
                        }
                    }

                    // Data (tiap item = 2 baris: Foto + Actual Running)
                    if ($this->monStartRow <= $this->monEndRow) {
                        $sheet->getStyle(
                            "A{$this->monStartRow}:{$this->lastColumn}{$this->monEndRow}"
                        )->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
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
                            "B{$this->monStartRow}:B{$this->monEndRow}"
                        )->getAlignment()->setHorizontal(
                            Alignment::HORIZONTAL_LEFT
                        );

                        foreach ($this->monItems as $i => $item) {
                            $r1 = $this->monStartRow + ($i * 2); // foto
                            $r2 = $r1 + 1;                       // actual running

                            $sheet->mergeCells("A{$r1}:A{$r2}");
                            $sheet->mergeCells("B{$r1}:B{$r2}");
                            $sheet->mergeCells("C{$r1}:D{$r1}");
                            $sheet->mergeCells("C{$r2}:D{$r2}");

                            foreach ($mseg as $segmen) {
                                $s = $this->columnLetter($segmen['start']);
                                $e = $this->columnLetter($segmen['end']);

                                if ($s !== $e) {
                                    $sheet->mergeCells("{$s}{$r1}:{$e}{$r1}");
                                    $sheet->mergeCells("{$s}{$r2}:{$e}{$r2}");
                                }
                            }

                            // baris foto lebih tinggi supaya foto muat
                            $sheet->getRowDimension($r1)->setRowHeight(82);
                            $sheet->getRowDimension($r2)->setRowHeight(22);

                            $barisMon[] = $r1;
                            $barisMon[] = $r2;
                        }
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | KONSUMSI BAHAN BAKAR (selebar tabel Shift)
                |--------------------------------------------------------------------------
                */

                $barisBbm = [];

                if ($this->pakaiMonitoring && $this->pakaiBbm && $this->bbmTitleRow > 0) {
                    $bseg = $this->bbmSegments();
                    $hB = $this->bbmHeaderRow;

                    $barisBbm[] = $this->bbmTitleRow;
                    $barisBbm[] = $hB;

                    // Judul
                    $sheet->mergeCells(
                        "A{$this->bbmTitleRow}:{$this->lastColumn}{$this->bbmTitleRow}"
                    );

                    $sheet->getStyle(
                        "A{$this->bbmTitleRow}:{$this->lastColumn}{$this->bbmTitleRow}"
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
                                'rgb' => 'EAF1DD',
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

                    $sheet->getRowDimension($this->bbmTitleRow)->setRowHeight(24);

                    // Header
                    $sheet->getStyle(
                        "A{$hB}:{$this->lastColumn}{$hB}"
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

                    $sheet->getRowDimension($hB)->setRowHeight(30);

                    foreach ($bseg as $segmen) {
                        $s = $this->columnLetter($segmen['start']);
                        $e = $this->columnLetter($segmen['end']);

                        if ($s !== $e) {
                            $sheet->mergeCells("{$s}{$hB}:{$e}{$hB}");
                        }
                    }

                    // Data (tiap item = 2 baris: Running Hours + Konsumsi Solar)
                    if ($this->bbmStartRow <= $this->bbmEndRow) {
                        $sheet->getStyle(
                            "A{$this->bbmStartRow}:{$this->lastColumn}{$this->bbmEndRow}"
                        )->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
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
                            "B{$this->bbmStartRow}:B{$this->bbmEndRow}"
                        )->getAlignment()->setHorizontal(
                            Alignment::HORIZONTAL_LEFT
                        );

                        foreach ($this->bbmItems as $i => $item) {
                            $r1 = $this->bbmStartRow + ($i * 2); // running hours
                            $r2 = $r1 + 1;                       // konsumsi solar

                            foreach (['A', 'B', 'C', 'D'] as $col) {
                                $sheet->mergeCells("{$col}{$r1}:{$col}{$r2}");
                            }

                            foreach ($bseg as $segmen) {
                                $s = $this->columnLetter($segmen['start']);
                                $e = $this->columnLetter($segmen['end']);

                                if ($s !== $e) {
                                    $sheet->mergeCells("{$s}{$r1}:{$e}{$r1}");
                                    $sheet->mergeCells("{$s}{$r2}:{$e}{$r2}");
                                }
                            }

                            $sheet->getRowDimension($r1)->setRowHeight(22);
                            $sheet->getRowDimension($r2)->setRowHeight(22);

                            $barisBbm[] = $r1;
                            $barisBbm[] = $r2;
                        }
                    }

                    // Catatan rumus
                    if ($this->bbmCatatanRow > 0) {
                        $rc = $this->bbmCatatanRow;

                        $sheet->mergeCells("A{$rc}:{$this->lastColumn}{$rc}");

                        $sheet->getStyle("A{$rc}")->getFont()
                            ->setItalic(true)
                            ->setSize(10);

                        $sheet->getRowDimension($rc)->setRowHeight(20);

                        $barisBbm[] = $rc;
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | PELUMASAN (tabel di bawah catatan, sebelum abnormality)
                | Selebar tabel Shift (A sampai kolom terakhir).
                |--------------------------------------------------------------------------
                */

                $barisLub = [];

                if ($this->pakaiPelumasan && $this->lubTitleRow > 0) {
                    $seg = $this->lubSegments();
                    $akhirLub = $this->columnLetter($seg['pic']['end']);

                    $h1 = $this->lubHeaderRow;
                    $h2 = $h1 + 1;

                    $barisLub[] = $this->lubTitleRow;
                    $barisLub[] = $h1;
                    $barisLub[] = $h2;

                    // Judul
                    $sheet->mergeCells(
                        "A{$this->lubTitleRow}:{$this->lastColumn}{$this->lubTitleRow}"
                    );

                    $sheet->getStyle(
                        "A{$this->lubTitleRow}:{$this->lastColumn}{$this->lubTitleRow}"
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
                                'rgb' => 'FFF2CC',
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

                    $sheet->getRowDimension($this->lubTitleRow)->setRowHeight(24);

                    // Header (2 baris)
                    $sheet->getStyle(
                        "A{$h1}:{$akhirLub}{$h2}"
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

                    $sheet->getRowDimension($h1)->setRowHeight(22);
                    $sheet->getRowDimension($h2)->setRowHeight(20);

                    // Kolom A-D: gabung 2 baris header
                    foreach (['A', 'B', 'C', 'D'] as $col) {
                        $sheet->mergeCells("{$col}{$h1}:{$col}{$h2}");
                    }

                    // Method, Tools, Time, PIC: gabung selebar segmen dan 2 baris header
                    foreach (['method', 'tools', 'time', 'pic'] as $kunci) {
                        $s = $this->columnLetter($seg[$kunci]['start']);
                        $e = $this->columnLetter($seg[$kunci]['end']);

                        $sheet->mergeCells("{$s}{$h1}:{$e}{$h2}");
                    }

                    // "Interval" di atas Day / Week / Month / Year
                    $sheet->mergeCells(
                        $this->columnLetter($seg['day']['start']) . $h1
                        . ':' . $this->columnLetter($seg['year']['end']) . $h1
                    );

                    foreach (['day', 'week', 'month', 'year'] as $kunci) {
                        $s = $this->columnLetter($seg[$kunci]['start']);
                        $e = $this->columnLetter($seg[$kunci]['end']);

                        if ($s !== $e) {
                            $sheet->mergeCells("{$s}{$h2}:{$e}{$h2}");
                        }
                    }

                    // Data
                    foreach ($this->lubData as $i => $lub) {
                        $r = $this->lubStartRow + $i;

                        foreach ($seg as $kunci => $segmen) {
                            $s = $this->columnLetter($segmen['start']);
                            $e = $this->columnLetter($segmen['end']);

                            if ($s !== $e) {
                                $sheet->mergeCells("{$s}{$r}:{$e}{$r}");
                            }
                        }

                        // merge tidak auto-tinggi, jadi tinggi baris dihitung dari panjang teks
                        $baris = max(
                            1,
                            (int) ceil(mb_strlen((string) $lub->sub_mesin) / 30),
                            (int) ceil(mb_strlen((string) $lub->jenis_pelumasan) / 18),
                            (int) ceil(mb_strlen((string) $lub->qty) / 16),
                            (int) ceil(mb_strlen((string) $lub->method) / ($seg['method']['width'] * 0.95)),
                            (int) ceil(mb_strlen((string) $lub->tools) / ($seg['tools']['width'] * 0.95)),
                            (int) ceil(mb_strlen((string) $lub->pic) / ($seg['pic']['width'] * 0.95))
                        );

                        $sheet->getRowDimension($r)->setRowHeight(max(22, $baris * 15));

                        $barisLub[] = $r;
                    }

                    if ($this->lubStartRow <= $this->lubEndRow) {
                        $sheet->getStyle(
                            "A{$this->lubStartRow}:{$akhirLub}{$this->lubEndRow}"
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

                        // No rata tengah
                        $sheet->getStyle(
                            "A{$this->lubStartRow}:A{$this->lubEndRow}"
                        )->getAlignment()->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );

                        // Time + Day..Year rata tengah (tanda "o" dibuat tebal)
                        $tengahAwal = $this->columnLetter($seg['time']['start']);
                        $tengahAkhir = $this->columnLetter($seg['year']['end']);

                        $sheet->getStyle(
                            "{$tengahAwal}{$this->lubStartRow}:{$tengahAkhir}{$this->lubEndRow}"
                        )->getAlignment()->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );

                        $intervalAwal = $this->columnLetter($seg['day']['start']);

                        $sheet->getStyle(
                            "{$intervalAwal}{$this->lubStartRow}:{$tengahAkhir}{$this->lubEndRow}"
                        )->getFont()->setBold(true);
                    }
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
                | ABNORMALITY HEADER + DATA (selebar tabel Shift)
                |--------------------------------------------------------------------------
                */

                $abn = $this->abnSegments();
                $barisAbn = [];

                $hAbn = $this->abnormalityHeaderRow;

                $sheet->getStyle(
                    "A{$hAbn}:{$this->lastColumn}{$hAbn}"
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

                $sheet->getRowDimension($hAbn)->setRowHeight(22);
                $barisAbn[] = $hAbn;

                // header + semua baris data: merge C:D (Abnormality) dan tiap segmen
                for ($r = $hAbn; $r <= max($hAbn, $this->abnormalityEndRow); $r++) {
                    $sheet->mergeCells("C{$r}:D{$r}");

                    foreach ($abn as $segmen) {
                        $s = $this->columnLetter($segmen['start']);
                        $e = $this->columnLetter($segmen['end']);

                        if ($s !== $e) {
                            $sheet->mergeCells("{$s}{$r}:{$e}{$r}");
                        }
                    }
                }

                if ($this->abnormalityStartRow <= $this->abnormalityEndRow) {

                    $sheet->getStyle(
                        "A{$this->abnormalityStartRow}:{$this->lastColumn}{$this->abnormalityEndRow}"
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

                    // No & Tanggal rata tengah
                    $sheet->getStyle(
                        "A{$this->abnormalityStartRow}:B{$this->abnormalityEndRow}"
                    )->getAlignment()->setHorizontal(
                        Alignment::HORIZONTAL_CENTER
                    );

                    // Status rata tengah
                    $stS = $this->columnLetter($abn['status']['start']);
                    $stE = $this->columnLetter($abn['status']['end']);

                    $sheet->getStyle(
                        "{$stS}{$this->abnormalityStartRow}:{$stE}{$this->abnormalityEndRow}"
                    )->getAlignment()->setHorizontal(
                        Alignment::HORIZONTAL_CENTER
                    );

                    // tinggi baris dihitung dari panjang teks (merge tidak auto-tinggi)
                    foreach ($abnormalities as $i => $ab) {
                        $r = $this->abnormalityStartRow + $i;

                        $baris = max(
                            1,
                            (int) ceil(mb_strlen((string) $ab->abnormality) / 36),
                            (int) ceil(mb_strlen((string) $ab->countermeasure) / ($abn['countermeasure']['width'] * 0.95)),
                            (int) ceil(mb_strlen((string) $ab->pic) / ($abn['pic']['width'] * 0.95))
                        );

                        $sheet->getRowDimension($r)->setRowHeight(max(22, $baris * 15));

                        $barisAbn[] = $r;
                    }
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
                        // Plan, Act (2 kolom) atau centang (1 kolom)
                        for ($sub = 0; $sub < $this->perTanggal; $sub++) {
                            $letter = $this->columnLetter(
                                $this->dayColumn($hari, $sub)
                            );

                            $sheet->getColumnDimension($letter)
                                ->setVisible(true)
                                ->setWidth($this->pakaiPlanAct ? 5.5 : 4.2);
                        }
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

                if ($this->catatanStartRow > 0) {
                    $barisKhusus[] = $this->catatanTitleRow;
                    $barisKhusus[] = $this->catatanHeaderRow;

                    // tinggi baris catatan sudah dihitung sendiri di atas
                    foreach ($barisCatatan as $r) {
                        $barisKhusus[] = $r;
                    }
                }

                // tinggi baris monitoring & bahan bakar juga sudah dihitung sendiri di atas
                foreach ($barisMon as $r) {
                    $barisKhusus[] = $r;
                }

                foreach ($barisBbm as $r) {
                    $barisKhusus[] = $r;
                }

                // tinggi baris pelumasan juga sudah dihitung sendiri di atas
                foreach ($barisLub as $r) {
                    $barisKhusus[] = $r;
                }

                // tinggi baris abnormality juga sudah dihitung sendiri di atas
                foreach ($barisAbn as $r) {
                    $barisKhusus[] = $r;
                }

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
                | FOTO MONITORING (maks 110 x 100 px, proporsional)
                |--------------------------------------------------------------------------
                */

                // tinggi baris foto 82 pt = sekitar 109 px
                $tinggiBarisPx = (int) round(82 * 96 / 72);

                foreach ($this->monFotos as [$barisFoto, $kolomAwal, $kolomAkhir, $pathFoto]) {
                    $ukuran = @getimagesize($pathFoto);

                    // lebar seluruh kotak Week (gabungan beberapa kolom)
                    $lebarKotakPx = 0;

                    for ($c = $kolomAwal; $c <= $kolomAkhir; $c++) {
                        $lebarKotakPx += $this->lebarKolomPx($c);
                    }

                    $maksLebar = max(40, min(110, $lebarKotakPx - 8));

                    $lebarFoto = $maksLebar;
                    $tinggiFoto = 100;

                    if ($ukuran && $ukuran[0] && $ukuran[1]) {
                        $skala = min($maksLebar / $ukuran[0], 100 / $ukuran[1]);

                        $lebarFoto = (int) ($ukuran[0] * $skala);
                        $tinggiFoto = (int) ($ukuran[1] * $skala);
                    }

                    // posisi kiri foto (dari tepi kiri kotak) supaya tepat di tengah
                    $targetX = max(0, (int) (($lebarKotakPx - $lebarFoto) / 2));

                    // Excel hanya menerima geseran di dalam kolom tempat foto menempel,
                    // jadi cari kolom yang berisi titik targetX lalu geser di dalamnya.
                    $kolomTempel = $kolomAwal;
                    $sudahLewat = 0;

                    for ($c = $kolomAwal; $c <= $kolomAkhir; $c++) {
                        $lebarKolom = $this->lebarKolomPx($c);

                        if ($targetX < $sudahLewat + $lebarKolom) {
                            $kolomTempel = $c;
                            break;
                        }

                        $sudahLewat += $lebarKolom;
                        $kolomTempel = $c;
                    }

                    $d = new Drawing();
                    $d->setPath($pathFoto);
                    $d->setCoordinates($this->columnLetter($kolomTempel) . $barisFoto);

                    if ($ukuran && $ukuran[0] && $ukuran[1]) {
                        $d->setResizeProportional(false);
                        $d->setWidth($lebarFoto);
                        $d->setHeight($tinggiFoto);
                    }

                    $d->setOffsetX(max(0, $targetX - $sudahLewat));
                    $d->setOffsetY(max(2, (int) (($tinggiBarisPx - $tinggiFoto) / 2)));

                    $d->setWorksheet($sheet);
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
         * ✓ dibuat lebih jelas (mode biasa / Plan-Act) / angka (mode KWH).
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

            // semua kolom milik tanggal ini (1, 2, atau 3 kolom)
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
     * Perkiraan lebar kolom (px) sesuai pengaturan lebar kolom di registerEvents().
     */
    private function lebarKolomPx(int $kolom): int
    {
        if ($kolom <= 4) {
            $karakter = [6, 32, 20, 18][$kolom - 1];
        } elseif ($this->pakaiActual) {
            $karakter = [9, 7, 16][($kolom - 5) % 3];
        } else {
            $karakter = $this->pakaiPlanAct ? 5.5 : 4.2;
        }

        return (int) round($karakter * 7 + 5);
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
