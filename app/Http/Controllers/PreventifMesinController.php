<?php

namespace App\Http\Controllers;

use App\Models\PreventifMesin;
use App\Models\PreventifMesinBulanan;
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
        | FILTER PERIOD REPORT (bisa lintas tahun)
        |--------------------------------------------------------------------------
        | Contoh: Oktober 2025 - Oktober 2026
        |
        | Default (kalau tidak dikirim): Januari - Desember pada tahun
        | yang dipilih di Monthly Report.
        */
        $bulanMulai = (int) $request->input('bulan_mulai', 1);
        $bulanSelesai = (int) $request->input('bulan_selesai', 12);

        $tahunMulai = (int) $request->input('tahun_mulai', $tahun);
        $tahunSelesai = (int) $request->input('tahun_selesai', $tahun);

        // Pastikan bulan tetap 1-12 dan tahun masuk akal
        $bulanMulai = max(1, min(12, $bulanMulai));
        $bulanSelesai = max(1, min(12, $bulanSelesai));

        $tahunMulai = max(2000, min(2100, $tahunMulai));
        $tahunSelesai = max(2000, min(2100, $tahunSelesai));

        // Ubah ke "nomor bulan" supaya gampang dibandingkan lintas tahun
        $indexMulai = ($tahunMulai * 12) + ($bulanMulai - 1);
        $indexSelesai = ($tahunSelesai * 12) + ($bulanSelesai - 1);

        // Kalau terbalik, otomatis dibalik
        if ($indexMulai > $indexSelesai) {
            [$indexMulai, $indexSelesai] = [
                $indexSelesai,
                $indexMulai
            ];
        }

        // Batasi maksimal 60 bulan (5 tahun) supaya perhitungan tidak berat
        $maksBulanPeriode = 60;

        if (($indexSelesai - $indexMulai) >= $maksBulanPeriode) {
            $indexSelesai = $indexMulai + $maksBulanPeriode - 1;
        }

        // Kembalikan ke bulan & tahun (sudah dirapikan)
        $tahunMulai = intdiv($indexMulai, 12);
        $bulanMulai = ($indexMulai % 12) + 1;

        $tahunSelesai = intdiv($indexSelesai, 12);
        $bulanSelesai = ($indexSelesai % 12) + 1;

        /*
        |--------------------------------------------------------------------------
        | RENTANG CHECKLIST YANG DIAMBIL
        |--------------------------------------------------------------------------
        | Gabungan dari rentang Period Report dan bulan Monthly Report,
        | supaya keduanya punya data checklist yang lengkap.
        |--------------------------------------------------------------------------
        */
        $rentangAwal = Carbon::create($tahunMulai, $bulanMulai, 1)
            ->startOfMonth()
            ->min(Carbon::create($tahun, $bulan, 1)->startOfMonth());

        $rentangAkhir = Carbon::create($tahunSelesai, $bulanSelesai, 1)
            ->endOfMonth()
            ->max(Carbon::create($tahun, $bulan, 1)->endOfMonth());

        /*
        |--------------------------------------------------------------------------
        | DATA PREVENTIF
        |--------------------------------------------------------------------------
        | Untuk Monthly Report dan Period Report.
        |--------------------------------------------------------------------------
        */
        $preventifMesins = PreventifMesin::with([
            'checklists' => function ($query) use ($rentangAwal, $rentangAkhir) {
                $query->whereDate('tanggal', '>=', $rentangAwal->toDateString())
                    ->whereDate('tanggal', '<=', $rentangAkhir->toDateString());
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
        | DAFTAR DIVISI (untuk stack batang & warna di Period Report)
        |--------------------------------------------------------------------------
        | Urutan: divisi utama dulu (urutan tetap), sisanya menyusul.
        | Urutan ini = urutan tumpukan dari bawah ke atas.
        |--------------------------------------------------------------------------
        */
        $urutanUtama = ['Sewing', 'Headrest', 'Utility', 'Saidan'];

        $divisiAda = $preventifMesins
            ->pluck('divisi')
            ->map(fn ($d) => $d ?: 'Lainnya')
            ->unique()
            ->values()
            ->all();

        $daftarDivisi = array_values(array_merge(
            array_values(array_intersect($urutanUtama, $divisiAda)),
            array_values(array_diff($divisiAda, $urutanUtama))
        ));

        /*
        |--------------------------------------------------------------------------
        | PERIOD REPORT
        |--------------------------------------------------------------------------
        |
        | Contoh:
        | Oktober 2025 - Oktober 2026
        | => 13 bulan yang ditampilkan.
        |
        | ACT  = BATANG bertumpuk per divisi (jumlah jadwal yang sudah dikerjakan)
        | Plan = LINE kuning (total jadwal, tidak berkurang saat ACT)
        |
        */
        $annualReport = [];

        // Mapping checklist per tanggal untuk tiap item (dihitung sekali saja)
        $checklistPerItem = [];

        foreach ($preventifMesins as $preventif) {
            $checklistPerItem[$preventif->no] = $preventif->checklists
                ->keyBy(function ($checklist) {
                    return Carbon::parse($checklist->tanggal)
                        ->format('Y-m-d');
                });
        }

        for (
            $index = $indexMulai;
            $index <= $indexSelesai;
            $index++
        ) {

            $tahunLaporan = intdiv($index, 12);
            $bulanLaporan = ($index % 12) + 1;

            $totalActTahunan = 0;
            $totalPlanTahunan = 0;

            // ACT per divisi untuk bulan ini, awalnya 0 semua
            $actPerDivisi = array_fill_keys($daftarDivisi, 0);

            foreach ($preventifMesins as $preventif) {

                /*
                |--------------------------------------------------------------------------
                | Generate jadwal untuk bulan & tahun tersebut
                |--------------------------------------------------------------------------
                */
                $tanggalPlanTahunan = $this->generateTanggalPlan(
                    $preventif,
                    $tahunLaporan,
                    $bulanLaporan
                );

                if (count($tanggalPlanTahunan) === 0) {
                    continue;
                }

                $checklistByDate = $checklistPerItem[$preventif->no];

                $divisi = $preventif->divisi ?: 'Lainnya';

                /*
                |--------------------------------------------------------------------------
                | Hitung ACT dan PLAN khusus bulan tersebut
                |--------------------------------------------------------------------------
                */
                foreach ($tanggalPlanTahunan as $tanggal) {

                    $checklist = $checklistByDate->get($tanggal);

                    // Plan = TOTAL jadwal bulan ini, tidak berkurang
                    // walau sudah di-ACT.
                    $totalPlanTahunan++;

                    // ACT = jadwal yang sudah dikerjakan.
                    if (
                        $checklist &&
                        (bool) $checklist->status === true
                    ) {
                        $totalActTahunan++;
                        $actPerDivisi[$divisi]++;
                    }
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Simpan data per bulan
            |--------------------------------------------------------------------------
            */
            $annualReport[] = [
                'bulan' => $bulanLaporan,
                'tahun' => $tahunLaporan,
                'nama_bulan' => $namaBulan[$bulanLaporan] ?? '',
                'act' => $totalActTahunan,
                'plan' => $totalPlanTahunan,
                'act_per_divisi' => $actPerDivisi,
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
            'daftarDivisi' => $daftarDivisi,

            'bulanMulai' => $bulanMulai,
            'tahunMulai' => $tahunMulai,

            'bulanSelesai' => $bulanSelesai,
            'tahunSelesai' => $tahunSelesai,

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
            },

            // Nilai durasi/total_durasi/dot/hot khusus bulan yang dipilih
            'bulanans' => function ($query) use ($bulan, $tahun) {
                $query->where('tahun', $tahun)
                    ->where('bulan', $bulan);
            },
        ])
            ->orderBy('divisi')
            ->orderBy('no_item');

        // =========================
        // AMBIL SEMUA DATA DULU
        // =========================
        $allPreventifMesins = $query->get();

        // =========================
        // GENERATE TANGGAL PLAN + NILAI BULANAN
        // =========================
        $allPreventifMesins->transform(
            function ($preventif) use ($tahun, $bulan) {

                $preventif->tanggal_plan = $this->generateTanggalPlan(
                    $preventif,
                    $tahun,
                    $bulan
                );

                // Isi (di memori saja) dengan nilai bulan ini,
                // jadi frontend tetap membaca
                // durasi / total_durasi / dot / hot seperti biasa.
                $nilai = $this->nilaiBulanan($preventif);

                $preventif->durasi = $nilai['durasi'];
                $preventif->total_durasi = $nilai['total_durasi'];
                $preventif->dot = $nilai['dot'];
                $preventif->hot = $nilai['hot'];

                // Simpan nama item master, lalu timpa (di memori saja)
                // dengan nama item khusus bulan ini kalau ada.
                $preventif->item_preventif_master = $preventif->getOriginal('item_preventif');
                $preventif->item_preventif = $nilai['item_preventif'];
                $preventif->punya_data_bulanan = $nilai['punya_data_bulanan'];

                return $preventif;
            }
        );

        // =========================
        // TOTAL DOT & HOT BULAN INI
        // =========================
        // Jumlah SEMUA nilai DOT/HOT yang diisi untuk bulan ini,
        // tidak peduli item tersebut punya jadwal (○) di bulan itu atau tidak.
        // Dihitung sebelum filter status & pagination, jadi total
        // tidak berubah saat filter dipakai atau pindah halaman.
        $totalDotAll = round(
            $allPreventifMesins->sum(fn ($p) => (float) $p->dot),
            2
        );

        $totalHotAll = round(
            $allPreventifMesins->sum(fn ($p) => (float) $p->hot),
            2
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

    /**
     * Simpan durasi / total_durasi / dot / hot untuk SATU bulan tertentu.
     * Kalau semua field dikosongkan, data bulanan dihapus
     * dan bulan tersebut kembali kosong.
     */
    public function updateBulanan(
        Request $request,
        PreventifMesin $preventifMesin
    ) {
        $data = $request->validate([
            'bulan' => ['required', 'integer', 'between:1,12'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],

            'durasi' => ['nullable', 'numeric', 'min:0'],
            'total_durasi' => ['nullable', 'numeric', 'min:0'],
            'dot' => ['nullable', 'numeric', 'min:0'],
            'hot' => ['nullable', 'numeric', 'min:0'],

            'item_preventif' => ['nullable', 'string'],
        ]);

        // Nama item bulan ini. Kosong atau sama dengan nama master
        // -> tidak perlu disimpan (pakai nama master).
        $itemBulan = trim((string) ($data['item_preventif'] ?? ''));

        if ($itemBulan === '' || $itemBulan === trim((string) $preventifMesin->item_preventif)) {
            $itemBulan = null;
        }

        $nilai = [
            'item_preventif' => $itemBulan,
            'durasi' => $data['durasi'] ?? null,
            'total_durasi' => $data['total_durasi'] ?? null,
            'dot' => $data['dot'] ?? null,
            'hot' => $data['hot'] ?? null,
        ];

        $kunci = [
            'preventif_mesin_id' => $preventifMesin->no,
            'tahun' => $data['tahun'],
            'bulan' => $data['bulan'],
        ];

        // Semua kosong -> hapus data bulanan
        if (collect($nilai)->every(fn ($v) => $v === null)) {
            PreventifMesinBulanan::where($kunci)->delete();
        } else {
            PreventifMesinBulanan::updateOrCreate($kunci, $nilai);
        }

        return back()->with(
            'success',
            'Data bulanan berhasil disimpan.'
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
        // Hapus juga data bulanan milik item ini
        // (jaga-jaga kalau foreign key cascade tidak dipasang)
        PreventifMesinBulanan::where(
            'preventif_mesin_id',
            $preventifMesin->no
        )->delete();

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

    /**
     * Ambil nilai durasi/total_durasi/dot/hot untuk bulan tertentu.
     * Nilai hanya berasal dari tabel bulanan. Kalau bulan tsb belum
     * diisi, semua nilai null (tampil "-" dan dihitung 0 di total).
     *
     * $preventif->bulanans harus sudah di-load (eager load)
     * dan sudah difilter untuk bulan & tahun yang dimaksud.
     */
    private function nilaiBulanan(PreventifMesin $preventif): array
    {
        $bulanan = $preventif->bulanans->first();

        return [
            'durasi' => $bulanan?->durasi,
            'total_durasi' => $bulanan?->total_durasi,
            'dot' => $bulanan?->dot,
            'hot' => $bulanan?->hot,

            // Nama item khusus bulan ini. Kalau tidak diisi,
            // pakai nama item master.
            'item_preventif' => filled($bulanan?->item_preventif)
                ? $bulanan->item_preventif
                : $preventif->getOriginal('item_preventif'),

            'punya_data_bulanan' => $bulanan !== null,
        ];
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
            },

            // Nilai durasi/total_durasi/dot/hot khusus bulan yang diexport
            'bulanans' => function ($query) use ($bulan, $tahun) {
                $query->where('tahun', $tahun)
                    ->where('bulan', $bulan);
            },
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

        // Format angka jam, contoh: 2.50 => "2.5 jam"
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

        // =========================
        // DATA
        // =========================
        foreach ($preventifMesins as $preventif) {

            $tanggalPlan = $this->generateTanggalPlan(
                $preventif,
                $tahun,
                $bulan
            );

            // Nilai durasi/dot/hot untuk bulan yang diexport
            $nilai = $this->nilaiBulanan($preventif);

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

            $planRow = [
                $preventif->divisi,
                $preventif->no_item,
                $nilai['item_preventif'] ?? '',
                $periode,
                $formatJam($nilai['durasi']),
                $formatJam($nilai['total_durasi']),
                $formatJam($nilai['dot']),
                $formatJam($nilai['hot']),
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

                // ✓ untuk semua tanggal yang dicentang,
                // termasuk tanggal yang tidak ada jadwal Plan-nya.
                $actRow[] = (
                    $checklist
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
