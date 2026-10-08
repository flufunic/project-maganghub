<?php

namespace App\Http\Controllers;

use App\Models\PreventifMesin;
use App\Models\PreventifPengiriman;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Exports\PreventifMesinExport;
use Maatwebsite\Excel\Facades\Excel;

class PreventifMesinController extends Controller
{

    public function welcome(Request $request)
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        /*
        |--------------------------------------------------------------------------
        | FILTER PERIOD REPORT
        |--------------------------------------------------------------------------
        | Default: Januari - Desember
        */
        $bulanMulai = (int) $request->input('bulan_mulai', 1);
        $bulanSelesai = (int) $request->input('bulan_selesai', 12);

        // Pastikan bulan tetap berada di 1-12
        $bulanMulai = max(1, min(12, $bulanMulai));
        $bulanSelesai = max(1, min(12, $bulanSelesai));

        // Kalau terbalik, otomatis dibalik
        if ($bulanMulai > $bulanSelesai) {
            [$bulanMulai, $bulanSelesai] = [
                $bulanSelesai,
                $bulanMulai
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | DATA PREVENTIF
        |--------------------------------------------------------------------------
        | Untuk Monthly Report dan Period Report.
        |
        | Checklist diambil untuk SATU TAHUN penuh supaya setiap bulan
        | pada Period Report bisa dicek status ACT/Plan masing-masing.
        |--------------------------------------------------------------------------
        */
        $preventifMesins = PreventifMesin::with([
            'checklists' => function ($query) use ($tahun) {
                $query->whereYear('tanggal', $tahun);
            }
        ])
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | MONTHLY REPORT
        |--------------------------------------------------------------------------
        */
        $detail = [];

        $totalItem = 0;
        $totalJadwal = 0;
        $totalAct = 0;
        $totalPlan = 0;

        $divisiReport = [];

        foreach ($preventifMesins as $preventif) {

            /*
            |--------------------------------------------------------------------------
            | Ambil tanggal jadwal preventif pada bulan yang dipilih
            |--------------------------------------------------------------------------
            */
            $tanggalPlan = $this->generateTanggalPlan(
                $preventif,
                $tahun,
                $bulan
            );

            $totalJadwalItem = count($tanggalPlan);

            /*
            |--------------------------------------------------------------------------
            | Kalau item tidak punya jadwal pada bulan ini,
            | tidak ditampilkan di report bulan tersebut.
            |--------------------------------------------------------------------------
            */
            if ($totalJadwalItem === 0) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Mapping checklist berdasarkan tanggal
            |--------------------------------------------------------------------------
            */
            $checklistByDate = $preventif->checklists->keyBy(function ($checklist) {
                return Carbon::parse($checklist->tanggal)->format('Y-m-d');
            });

            $actItem = 0;

            foreach ($tanggalPlan as $tanggal) {

                $checklist = $checklistByDate->get($tanggal);

                if ($checklist && (bool) $checklist->status === true) {
                    $actItem++;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Jadwal yang belum dikerjakan = Plan
            |--------------------------------------------------------------------------
            */
            $planItem = $totalJadwalItem - $actItem;

            /*
            |--------------------------------------------------------------------------
            | Total keseluruhan
            |--------------------------------------------------------------------------
            */
            $totalItem++;
            $totalJadwal += $totalJadwalItem;
            $totalAct += $actItem;
            $totalPlan += $planItem;

            /*
            |--------------------------------------------------------------------------
            | Report per divisi
            |--------------------------------------------------------------------------
            */
            $divisi = $preventif->divisi ?: 'Lainnya';

            if (!isset($divisiReport[$divisi])) {
                $divisiReport[$divisi] = [
                    'divisi' => $divisi,
                    'act' => 0,
                    'plan' => 0,
                    'total' => 0,
                ];
            }

            $divisiReport[$divisi]['act'] += $actItem;
            $divisiReport[$divisi]['plan'] += $planItem;
            $divisiReport[$divisi]['total'] += $totalJadwalItem;

            /*
            |--------------------------------------------------------------------------
            | Detail tabel
            |--------------------------------------------------------------------------
            */
            $detail[] = [
                'divisi' => $preventif->divisi,
                'no_item' => $preventif->no_item,
                'item_preventif' => $preventif->item_preventif,

                'total_jadwal' => $totalJadwalItem,

                'act' => $actItem,

                'plan' => $planItem,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Persentase ACT
        |--------------------------------------------------------------------------
        */
        $persentaseAct = $totalJadwal > 0
            ? round(($totalAct / $totalJadwal) * 100, 1)
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Nama bulan
        |--------------------------------------------------------------------------
        */
        $namaBulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        /*
        |--------------------------------------------------------------------------
        | PERIOD REPORT
        |--------------------------------------------------------------------------
        |
        | Contoh:
        | Januari - Juni
        | => hanya 6 bulan yang ditampilkan.
        |
        | ACT  = BAR
        | Plan = LINE
        |
        */
        $annualReport = [];

        for (
            $bulanTahunan = $bulanMulai;
            $bulanTahunan <= $bulanSelesai;
            $bulanTahunan++
        ) {

            $totalActTahunan = 0;
            $totalPlanTahunan = 0;

            foreach ($preventifMesins as $preventif) {

                /*
                |--------------------------------------------------------------------------
                | Generate jadwal untuk bulan tersebut
                |--------------------------------------------------------------------------
                */
                $tanggalPlanTahunan = $this->generateTanggalPlan(
                    $preventif,
                    $tahun,
                    $bulanTahunan
                );

                if (count($tanggalPlanTahunan) === 0) {
                    continue;
                }

                /*
                |--------------------------------------------------------------------------
                | Checklist tahun tersebut sudah tersedia dari query di atas.
                |--------------------------------------------------------------------------
                */
                $checklistByDate = $preventif->checklists
                    ->keyBy(function ($checklist) {
                        return Carbon::parse($checklist->tanggal)
                            ->format('Y-m-d');
                    });

                /*
                |--------------------------------------------------------------------------
                | Hitung ACT dan PLAN khusus bulan tersebut
                |--------------------------------------------------------------------------
                */
                foreach ($tanggalPlanTahunan as $tanggal) {

                    $checklist = $checklistByDate->get($tanggal);

                    if (
                        $checklist &&
                        (bool) $checklist->status === true
                    ) {
                        $totalActTahunan++;
                    } else {
                        $totalPlanTahunan++;
                    }
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Simpan data per bulan
            |--------------------------------------------------------------------------
            */
            $annualReport[] = [
                'bulan' => $bulanTahunan,
                'nama_bulan' => $namaBulan[$bulanTahunan] ?? '',
                'act' => $totalActTahunan,
                'plan' => $totalPlanTahunan,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | KIRIM DATA KE REACT
        |--------------------------------------------------------------------------
        */
        return Inertia::render('Welcome', [
            'bulan' => $bulan,
            'tahun' => $tahun,

            /*
            | Monthly Report
            */
            'detail' => $detail,

            'totalItem' => $totalItem,
            'totalJadwal' => $totalJadwal,
            'totalAct' => $totalAct,
            'totalPlan' => $totalPlan,

            'persentaseAct' => $persentaseAct,

            'divisiReport' => array_values($divisiReport),

            /*
            | Period Report
            */
            'annualReport' => $annualReport,

            'bulanMulai' => $bulanMulai,
            'bulanSelesai' => $bulanSelesai,

            'namaBulan' => $namaBulan,
        ]);
    }

    public function index(Request $request): Response
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);
        $status = $request->input('status', 'all');

        // =========================
        // QUERY SEMUA DATA
        // =========================
        $query = PreventifMesin::with([
            'checklists' => function ($query) use ($bulan, $tahun) {
                $query->whereYear('tanggal', $tahun)
                    ->whereMonth('tanggal', $bulan);
            }
        ])
            ->orderBy('divisi')
            ->orderBy('no_item');

        // =========================
        // TOTAL DOT & HOT SEMUA DATA
        // =========================
        $totalDotAll = (clone $query)->sum('dot');
        $totalHotAll = (clone $query)->sum('hot');

        // =========================
        // AMBIL SEMUA DATA DULU
        // =========================
        $allPreventifMesins = $query->get();

        // =========================
        // GENERATE TANGGAL PLAN
        // =========================
        $allPreventifMesins->transform(
            function ($preventif) use ($tahun, $bulan) {

                $tanggalPlan = $this->generateTanggalPlan(
                    $preventif,
                    $tahun,
                    $bulan
                );

                $preventif->tanggal_plan = $tanggalPlan;

                return $preventif;
            }
        );

        // =========================
        // FILTER STATUS + BULAN/TAHUN
        // =========================
        $allPreventifMesins = $allPreventifMesins
            ->filter(function ($preventif) use ($status, $tahun, $bulan) {

                $tanggalPlan = $preventif->tanggal_plan ?? [];

                // Kalau tidak punya tanggal plan
                if (empty($tanggalPlan)) {
                    return $status === 'all';
                }

                // Cari apakah ADA checklist ACT pada tanggal plan
                $adaAct = collect($tanggalPlan)->contains(function ($tanggal) use ($preventif) {

                    $tanggalPlanFormatted = Carbon::parse($tanggal)->format('Y-m-d');

                    return $preventif->checklists->contains(function ($checklist) use ($tanggalPlanFormatted) {

                        $tanggalChecklist = Carbon::parse($checklist->tanggal)
                            ->format('Y-m-d');

                        return $tanggalChecklist === $tanggalPlanFormatted
                            && (bool) $checklist->status === true;
                    });
                });

                // Filter ACT
                if ($status === 'ACT') {
                    return $adaAct;
                }

                // Filter Plan
                if ($status === 'Plan') {
                    return !$adaAct;
                }

                // Semua
                return true;
            })
            ->values();

        // =========================
        // PAGINATION SETELAH FILTER
        // =========================
        $perPage = 10;

        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $currentItems = $allPreventifMesins
            ->slice(
                ($currentPage - 1) * $perPage,
                $perPage
            )
            ->values();

        $preventifMesins = new LengthAwarePaginator(
            $currentItems,
            $allPreventifMesins->count(),
            $perPage,
            $currentPage,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        // =========================
        // NOTIFIKASI PREVENTIF
        // =========================
        $hariIni = Carbon::today();

        $semuaPreventif = PreventifMesin::with('checklists')->get();

        $notifikasi = [];

        // Tanggal yang perlu dicek:
        // - kemarin → untuk mencari plan yang belum dilakukan
        // - besok → untuk mencari plan H-1
        $tanggalKemarin = $hariIni->copy()->subDay();
        $tanggalBesok = $hariIni->copy()->addDay();

        foreach ($semuaPreventif as $preventif) {

            // =====================================================
            // GENERATE PLAN UNTUK BULAN KEMARIN
            // =====================================================
            $planKemarin = $this->generateTanggalPlan(
                $preventif,
                $tanggalKemarin->year,
                $tanggalKemarin->month
            );

            // =====================================================
            // GENERATE PLAN UNTUK BULAN BESOK
            // =====================================================
            $planBesok = $this->generateTanggalPlan(
                $preventif,
                $tanggalBesok->year,
                $tanggalBesok->month
            );

            // =====================================================
            // 1. CEK PLAN BESOK → NOTIF H-1
            // =====================================================
            if (
                in_array(
                    $tanggalBesok->format('Y-m-d'),
                    $planBesok,
                    true
                )
            ) {

                $notifikasi[] = [
                    'tipe' => 'besok',

                    'tanggal' => $tanggalBesok->format('Y-m-d'),

                    'divisi' => $preventif->divisi,

                    'no_item' => $preventif->no_item,

                    'item_preventif' => $preventif->item_preventif,

                    'pesan' =>
                        'Preventif ' .
                        $preventif->item_preventif .
                        ' dijadwalkan besok, ' .
                        $tanggalBesok->translatedFormat('d F Y') .
                        '.',
                ];
            }

            // =====================================================
            // 2. CEK PLAN KEMARIN → BELUM DILAKUKAN
            // =====================================================
            if (
                in_array(
                    $tanggalKemarin->format('Y-m-d'),
                    $planKemarin,
                    true
                )
            ) {

                $sudahDilakukan = $preventif->checklists
                    ->contains(function ($checklist) use ($tanggalKemarin) {

                        return Carbon::parse($checklist->tanggal)
                            ->isSameDay($tanggalKemarin)
                            && (bool) $checklist->status === true;
                    });

                // Kalau belum ada ACT
                if (!$sudahDilakukan) {

                    $notifikasi[] = [
                        'tipe' => 'terlambat',

                        'tanggal' => $tanggalKemarin->format('Y-m-d'),

                        'divisi' => $preventif->divisi,

                        'no_item' => $preventif->no_item,

                        'item_preventif' => $preventif->item_preventif,

                        'pesan' =>
                            'Preventif ' .
                            $preventif->item_preventif .
                            ' pada ' .
                            $tanggalKemarin->translatedFormat('d F Y') .
                            ' belum dilakukan.',
                    ];
                }
            }
        }

        // =========================
        // STATUS PENGIRIMAN PER TANGGAL
        // =========================
        $notifikasiPengiriman = PreventifPengiriman::query()
            ->whereIn('status', [
                'menunggu',
                'diperiksa',
                'ditolak',
            ])
            ->get()
            ->map(function ($pengiriman) {
                return [
                    'id' => $pengiriman->id,

                    'tanggal' => Carbon::parse($pengiriman->tanggal)
                        ->format('Y-m-d'),

                    'tanggal_format' => Carbon::parse($pengiriman->tanggal)
                        ->translatedFormat('d F Y'),

                    'status' => $pengiriman->status,

                    'alasan_penolakan' => $pengiriman->alasan_penolakan,
                ];
            })
            ->values();
        // =========================
        // KIRIM KE INERTIA
        // =========================
        return Inertia::render('PreventifMesin/Index', [
        'preventifMesins' => $preventifMesins,

        'bulan' => $bulan,

        'tahun' => $tahun,

        'status' => $status,

        'totalDotAll' => $totalDotAll,

        'totalHotAll' => $totalHotAll,

        'notifikasi' => $notifikasi,

        'notifikasiPengiriman' => $notifikasiPengiriman,

        'flash' => [
            'success' => session('success'),
        ],
    ]);

    }

    public function create(): Response
    {
        $divisis = [
            'Sewing',
            'Headrest',
            'Utility',
            'Saidan',
        ];

        $nextNo = [];

        foreach ($divisis as $divisi) {
            $lastNo = PreventifMesin::where(
                'divisi',
                $divisi
            )->max('no_item');

            $nextNo[$divisi] = ($lastNo ?? 0) + 1;
        }

        return Inertia::render('PreventifMesin/Create', [
            'nextNo' => $nextNo,
        ]);
    }

    public function edit(
        PreventifMesin $preventifMesin
    ): Response {
        return Inertia::render('PreventifMesin/Edit', [
            'preventifMesin' => $preventifMesin,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            // WAJIB
            'divisi' => [
                'required',
                'string',
            ],

            'item_preventif' => [
                'required',
                'string',
            ],

            // OPSIONAL
            'periode_nilai' => [
                'nullable',
                'numeric',
                'min:1',
            ],

            'periode_satuan' => [
                'nullable',
                'string',
                'in:hari,minggu,bulan,tahun',
            ],

            'tanggal_plan_awal' => [
                'nullable',
                'date',
            ],

            'jumlah_dilakukan' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'durasi' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'total_durasi' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'dot' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'hot' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            // 'status' => [
            //     'required',
            //     'in:Plan,ACT',
            // ],
        ]);

        $lastNo = PreventifMesin::where(
            'divisi',
            $request->divisi
        )->max('no_item');

        $nextNo = ($lastNo ?? 0) + 1;

        $bulanAwal = now()->month;
        $tahunAwal = now()->year;

        if ($request->filled('tanggal_plan_awal')) {
            $tanggalAwal = Carbon::parse(
                $request->tanggal_plan_awal
            );

            $bulanAwal = $tanggalAwal->month;
            $tahunAwal = $tanggalAwal->year;
        }

        PreventifMesin::create([
            'divisi' => $request->divisi,
            'no_item' => $nextNo,
            'item_preventif' => $request->item_preventif,

            'periode_nilai' => $request->periode_nilai,
            'periode_satuan' => $request->periode_satuan,

            'tanggal_plan_awal' => $request->tanggal_plan_awal,
            'jumlah_dilakukan' => $request->jumlah_dilakukan,

            // MANUAL
            'durasi' => $request->durasi,
            'total_durasi' => $request->total_durasi,
            'dot' => $request->dot,
            'hot' => $request->hot,
            // 'status' => $request->status,
        ]);

        return redirect()
            ->route(
                'preventif-mesin.index',
                [
                    'bulan' => $bulanAwal,
                    'tahun' => $tahunAwal,
                ]
            )
            ->with(
                'success',
                'Data preventif mesin berhasil ditambahkan.'
            );
    }

    public function update(
        Request $request,
        PreventifMesin $preventifMesin
    ) {
        $request->validate([
            // WAJIB
            'divisi' => [
                'required',
                'string',
            ],

            'item_preventif' => [
                'required',
                'string',
            ],

            // OPSIONAL
            'no_item' => [
                'nullable',
                'integer',
            ],

            'periode_nilai' => [
                'nullable',
                'numeric',
                'min:1',
            ],

            'periode_satuan' => [
                'nullable',
                'string',
                'in:hari,minggu,bulan,tahun',
            ],

            'tanggal_plan_awal' => [
                'nullable',
                'date',
            ],

            'jumlah_dilakukan' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'durasi' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'total_durasi' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'dot' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'hot' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            // 'status' => [
            //     'required',
            //     'in:Plan,ACT',
            // ],
        ]);

        $bulanAwal = now()->month;
        $tahunAwal = now()->year;

        if ($request->filled('tanggal_plan_awal')) {
            $tanggalAwal = Carbon::parse(
                $request->tanggal_plan_awal
            );

            $bulanAwal = $tanggalAwal->month;
            $tahunAwal = $tanggalAwal->year;
        }

        $preventifMesin->update([
            'divisi' => $request->divisi,

            'no_item' => $request->filled('no_item')
                ? $request->no_item
                : $preventifMesin->no_item,

            'item_preventif' => $request->item_preventif,

            'periode_nilai' => $request->periode_nilai,
            'periode_satuan' => $request->periode_satuan,

            'tanggal_plan_awal' => $request->tanggal_plan_awal,
            'jumlah_dilakukan' => $request->jumlah_dilakukan,

            // MANUAL
            'durasi' => $request->durasi,
            'total_durasi' => $request->total_durasi,
            'dot' => $request->dot,
            'hot' => $request->hot,
            // 'status' => $request->status,
        ]);

        return redirect()
            ->route(
                'preventif-mesin.index',
                [
                    'bulan' => $bulanAwal,
                    'tahun' => $tahunAwal,
                ]
            )
            ->with(
                'success',
                'Data preventif mesin berhasil diperbarui.'
            );
    }

    public function storeChecklist(
        Request $request,
        PreventifMesin $preventifMesin
    ) {
        $request->validate([
            'tanggal' => [
                'required',
                'date',
            ],

            'status' => [
                'required',
                'boolean',
            ],

            'catatan' => [
                'nullable',
                'string',
            ],
        ]);

        $preventifMesin->checklists()->updateOrCreate(
            [
                'tanggal' => $request->tanggal,
            ],
            [
                'status' => $request->status,
                'catatan' => $request->catatan,
            ]
        );

        return back();
    }

    public function destroy(
        PreventifMesin $preventifMesin
    ) {
        $preventifMesin->delete();

        return redirect()
            ->route(
                'preventif-mesin.index'
            )
            ->with(
                'success',
                'Data preventif mesin berhasil dihapus.'
            );
    }

    private function generateTanggalPlan(
        PreventifMesin $preventifMesin,
        int $tahun,
        int $bulan
    ): array {

        // Tanpa tanggal plan awal: tidak ada jadwal
        if (empty($preventifMesin->tanggal_plan_awal)) {
            return [];
        }

        $tanggalAwal = Carbon::parse(
            $preventifMesin->tanggal_plan_awal
        );

        $tanggalMulai = Carbon::create($tahun, $bulan, 1)->startOfMonth();
        $tanggalAkhir = Carbon::create($tahun, $bulan, 1)->endOfMonth();

        $tanggalPlan = [];

        $jumlahDilakukan = max(
            1,
            (int) ($preventifMesin->jumlah_dilakukan ?? 1)
        );

        // Tanpa periode: jadwal sekali saja (hari kerja berurutan)
        if (
            empty($preventifMesin->periode_nilai) ||
            empty($preventifMesin->periode_satuan)
        ) {
            foreach ($this->generateHariKerja($tanggalAwal, $jumlahDilakukan) as $tgl) {
                if ($tgl->gte($tanggalMulai) && $tgl->lte($tanggalAkhir)) {
                    $tanggalPlan[] = $tgl->format('Y-m-d');
                }
            }

            return $tanggalPlan;
        }

        $tanggal = $tanggalAwal->copy();

        while ($tanggal->lte($tanggalAkhir)) {

            foreach ($this->generateHariKerja($tanggal, $jumlahDilakukan) as $tanggalDilakukan) {
                if (
                    $tanggalDilakukan->gte($tanggalMulai)
                    &&
                    $tanggalDilakukan->lte($tanggalAkhir)
                ) {
                    $tanggalPlan[] = $tanggalDilakukan->format('Y-m-d');
                }
            }

            $tanggalBerikutnya = $this->tambahPeriode(
                $tanggal,
                $preventifMesin->periode_nilai,
                $preventifMesin->periode_satuan
            );

            // Pengaman supaya while tidak infinite loop
            if ($tanggalBerikutnya->lte($tanggal)) {
                break;
            }

            $tanggal = $tanggalBerikutnya;
        }

        // Hapus tanggal ganda (kalau dua periode saling tumpang tindih) lalu urutkan
        $tanggalPlan = array_values(array_unique($tanggalPlan));
        sort($tanggalPlan);

        return $tanggalPlan;
    }

    private function tambahPeriode(
        Carbon $tanggal,
        int $nilai,
        ?string $satuan
    ): Carbon {

        $nilai = (float) $nilai;


        return match ($satuan) {

            'hari' =>
                $tanggal->copy()
                    ->addDays($nilai),

            'minggu' =>
                $tanggal->copy()
                    ->addWeeks($nilai),

            'bulan' =>
                $tanggal->copy()
                    ->addMonths($nilai),

            'tahun' =>
                $tanggal->copy()
                    ->addYears($nilai),

            default =>
                $tanggal->copy(),
        };
    }

    /**
     * Ambil N hari kerja (Senin-Jumat) berurutan mulai dari tanggal tertentu.
     * Sabtu & Minggu dilewati. Kalau tanggal mulai jatuh di weekend,
     * otomatis mulai dari Senin berikutnya.
     */
    private function generateHariKerja(Carbon $mulai, int $jumlah): array
    {
        $hasil = [];
        $tanggal = $mulai->copy();

        while (count($hasil) < $jumlah) {
            if ($tanggal->isWeekday()) {
                $hasil[] = $tanggal->copy();
            }

            $tanggal->addDay();
        }

        return $hasil;
    }

    public function exportExcel(Request $request)
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        $query = PreventifMesin::with([
            'checklists' => function ($query) use ($bulan, $tahun) {
                $query->whereYear('tanggal', $tahun)
                    ->whereMonth('tanggal', $bulan);
            }
        ])
            ->orderBy('divisi')
            ->orderBy('no_item');

        $preventifMesins = $query->get();

        $jumlahHari = Carbon::create(
            $tahun,
            $bulan,
            1
        )->daysInMonth;

        $namaBulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        $data = [];

        $data[] = [
            'LIST PREVENTIF MESIN SURYA CIPTA 2'
        ];

        $data[] = [];
        $data[] = [];
        $data[] = [];

        $header = [
            'Divisi',
            'No',
            'Item Preventif',
            'Periode',
            'Durasi',
            'Total Durasi',
            'DOT',
            'HOT',
            'Status',
        ];

        for ($hari = 1; $hari <= $jumlahHari; $hari++) {
            $header[] = $hari;
        }

        $data[] = $header;

        // =========================
        // DATA
        // =========================
        foreach ($preventifMesins as $preventif) {

            $tanggalPlan = $this->generateTanggalPlan(
                $preventif,
                $tahun,
                $bulan
            );

            /*
            |--------------------------------------------------------------------------
            | PLAN
            |--------------------------------------------------------------------------
            */

            $periode = '';

            if ($preventif->periode_nilai) {
                $nilaiPeriode = (float) $preventif->periode_nilai;

                $nilaiPeriode = rtrim(
                    rtrim(number_format($nilaiPeriode, 2, '.', ''), '0'),
                    '.'
                );

                $periode = $nilaiPeriode
                    . ' '
                    . $preventif->periode_satuan;
            }

            $formatJam = function ($nilai) {
                if ($nilai === null || $nilai === '') {
                    return '';
                }

                $nilai = (float) $nilai;

                $nilai = rtrim(
                    rtrim(number_format($nilai, 2, '.', ''), '0'),
                    '.'
                );

                return $nilai . ' jam';
            };

            $planRow = [
                $preventif->divisi,
                $preventif->no_item,
                $preventif->item_preventif ?? '',
                $periode,
                $formatJam($preventif->durasi),
                $formatJam($preventif->total_durasi),
                $formatJam($preventif->dot),
                $formatJam($preventif->hot),
                'PLAN',
            ];

            for ($hari = 1; $hari <= $jumlahHari; $hari++) {

                $tanggal = Carbon::create(
                    $tahun,
                    $bulan,
                    $hari
                )->format('Y-m-d');

                $planRow[] = in_array(
                    $tanggal,
                    $tanggalPlan,
                    true
                )
                    ? '○'
                    : '';
            }

            $data[] = $planRow;

            /*
            |--------------------------------------------------------------------------
            | ACT
            |--------------------------------------------------------------------------
            */

            $actRow = [
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                'ACT',
            ];

            for ($hari = 1; $hari <= $jumlahHari; $hari++) {

                $tanggal = Carbon::create(
                    $tahun,
                    $bulan,
                    $hari
                )->format('Y-m-d');

                $checklist = $preventif->checklists->first(
                    function ($item) use ($tanggal) {
                        return Carbon::parse($item->tanggal)
                            ->format('Y-m-d') === $tanggal;
                    }
                );

                $actRow[] = (
                    in_array(
                        $tanggal,
                        $tanggalPlan,
                        true
                    )
                    && $checklist
                    && (bool) $checklist->status
                )
                    ? '✓'
                    : '';
            }

            $data[] = $actRow;
        }

        $filename = 'Preventif_Mesin_'
            . $namaBulan[$bulan]
            . '_'
            . $tahun
            . '.xlsx';

        return Excel::download(
            new PreventifMesinExport(
                $data,
                $jumlahHari
            ),
            $filename
        );
    }
}