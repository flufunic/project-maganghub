<?php

namespace App\Http\Controllers;

use App\Exports\PreventifMesinExport;
use App\Models\CheckSheetAbnormality;
use App\Models\PreventifMesin;
use App\Models\PreventifMesinBulanan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\PreventifMesinPlanOverride;

class PreventifMesinController extends Controller
{
    private const NAMA_BULAN = [
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

    // =====================================================
    // WELCOME (Monthly Report + Period Report)
    // =====================================================

    public function welcome(Request $request)
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        // Filter Period Report (bisa lintas tahun). Default: Jan - Des pada tahun terpilih.
        $bulanMulai = (int) $request->input('bulan_mulai', 1);
        $bulanSelesai = (int) $request->input('bulan_selesai', 12);

        $tahunMulai = (int) $request->input('tahun_mulai', $tahun);
        $tahunSelesai = (int) $request->input('tahun_selesai', $tahun);

        $bulanMulai = max(1, min(12, $bulanMulai));
        $bulanSelesai = max(1, min(12, $bulanSelesai));

        $tahunMulai = max(2000, min(2100, $tahunMulai));
        $tahunSelesai = max(2000, min(2100, $tahunSelesai));

        // Ubah ke "nomor bulan" supaya gampang dibandingkan lintas tahun
        $indexMulai = ($tahunMulai * 12) + ($bulanMulai - 1);
        $indexSelesai = ($tahunSelesai * 12) + ($bulanSelesai - 1);

        if ($indexMulai > $indexSelesai) {
            [$indexMulai, $indexSelesai] = [$indexSelesai, $indexMulai];
        }

        // Batasi maksimal 60 bulan (5 tahun)
        $maksBulanPeriode = 60;

        if (($indexSelesai - $indexMulai) >= $maksBulanPeriode) {
            $indexSelesai = $indexMulai + $maksBulanPeriode - 1;
        }

        $tahunMulai = intdiv($indexMulai, 12);
        $bulanMulai = ($indexMulai % 12) + 1;

        $tahunSelesai = intdiv($indexSelesai, 12);
        $bulanSelesai = ($indexSelesai % 12) + 1;

        // Rentang checklist = gabungan Period Report dan bulan Monthly Report
        $rentangAwal = Carbon::create($tahunMulai, $bulanMulai, 1)
            ->startOfMonth()
            ->min(Carbon::create($tahun, $bulan, 1)->startOfMonth());

        $rentangAkhir = Carbon::create($tahunSelesai, $bulanSelesai, 1)
            ->endOfMonth()
            ->max(Carbon::create($tahun, $bulan, 1)->endOfMonth());

        $preventifMesins = PreventifMesin::where('is_hidden', false)->with([
            'checklists' => function ($query) use ($rentangAwal, $rentangAkhir) {
                $query->whereDate('tanggal', '>=', $rentangAwal->toDateString())
                    ->whereDate('tanggal', '<=', $rentangAkhir->toDateString());
            },
        ])
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get();

        // ---------- MONTHLY REPORT ----------
        $detail = [];

        $totalItem = 0;
        $totalJadwal = 0;
        $totalAct = 0;
        $totalPlan = 0;

        $divisiReport = [];

        foreach ($preventifMesins as $preventif) {
            // Pakai Plan efektif:
            // - Plan manual jika sudah pernah diatur
            // - Plan otomatis jika belum pernah diatur
            $tanggalPlan = $this->getTanggalPlanEfektif(
                $preventif,
                $tahun,
                $bulan
            );

            $totalJadwalItem = count($tanggalPlan);

            // Item tanpa jadwal di bulan ini tidak ditampilkan
            if ($totalJadwalItem === 0) {
                continue;
            }

            $checklistByDate = $preventif->checklists->keyBy(
                fn ($checklist) => Carbon::parse($checklist->tanggal)->format('Y-m-d')
            );

            $actItem = 0;

            foreach ($tanggalPlan as $tanggal) {
                $checklist = $checklistByDate->get($tanggal);

                if ($checklist && (bool) $checklist->status === true) {
                    $actItem++;
                }
            }

            $planItem = $totalJadwalItem - $actItem;

            $totalItem++;
            $totalJadwal += $totalJadwalItem;
            $totalAct += $actItem;
            $totalPlan += $planItem;

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

            $detail[] = [
                'divisi' => $preventif->divisi,
                'no_item' => $preventif->no_item,
                'item_preventif' => $preventif->item_preventif,
                'total_jadwal' => $totalJadwalItem,
                'act' => $actItem,
                'plan' => $planItem,
            ];
        }

        $persentaseAct = $totalJadwal > 0
            ? round(($totalAct / $totalJadwal) * 100, 1)
            : 0;

        $namaBulan = self::NAMA_BULAN;

        // Daftar divisi: divisi utama dulu (urutan tetap), sisanya menyusul
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

        // ---------- PERIOD REPORT ----------
        // ACT  = batang bertumpuk per divisi
        // Plan = line kuning (total jadwal, tidak berkurang saat ACT)
        $annualReport = [];

        // Rincian per item per bulan (untuk PDF tahunan / periode)
        $annualDetail = [];

        $checklistPerItem = [];

        foreach ($preventifMesins as $preventif) {
            $checklistPerItem[$preventif->no] = $preventif->checklists
                ->keyBy(fn ($checklist) => Carbon::parse($checklist->tanggal)->format('Y-m-d'));
        }

        for ($index = $indexMulai; $index <= $indexSelesai; $index++) {
            $tahunLaporan = intdiv($index, 12);
            $bulanLaporan = ($index % 12) + 1;

            $totalActTahunan = 0;
            $totalPlanTahunan = 0;

            $actPerDivisi = array_fill_keys($daftarDivisi, 0);

            foreach ($preventifMesins as $preventif) {
                $tanggalPlanTahunan = $this->getTanggalPlanEfektif(
                    $preventif,
                    $tahunLaporan,
                    $bulanLaporan
                );

                if (count($tanggalPlanTahunan) === 0) {
                    continue;
                }

                $checklistByDate = $checklistPerItem[$preventif->no];

                $divisi = $preventif->divisi ?: 'Lainnya';

                $actItemBulanIni = 0;

                foreach ($tanggalPlanTahunan as $tanggal) {
                    $checklist = $checklistByDate->get($tanggal);

                    $totalPlanTahunan++;

                    if ($checklist && (bool) $checklist->status === true) {
                        $totalActTahunan++;
                        $actPerDivisi[$divisi]++;
                        $actItemBulanIni++;
                    }
                }

                // Simpan rincian item ini untuk bulan yang sedang diproses
                $kodeItem = $preventif->no;

                if (!isset($annualDetail[$kodeItem])) {
                    $annualDetail[$kodeItem] = [
                        'divisi' => $divisi,
                        'no_item' => $preventif->no_item,
                        'item_preventif' => $preventif->item_preventif,
                        'bulan' => [],
                        'total_jadwal' => 0,
                        'total_act' => 0,
                    ];
                }

                $annualDetail[$kodeItem]['bulan'][$tahunLaporan . '-' . $bulanLaporan] = [
                    'jadwal' => count($tanggalPlanTahunan),
                    'act' => $actItemBulanIni,
                ];

                $annualDetail[$kodeItem]['total_jadwal'] += count($tanggalPlanTahunan);
                $annualDetail[$kodeItem]['total_act'] += $actItemBulanIni;
            }

            $annualReport[] = [
                'bulan' => $bulanLaporan,
                'tahun' => $tahunLaporan,
                'nama_bulan' => $namaBulan[$bulanLaporan] ?? '',
                'act' => $totalActTahunan,
                'plan' => $totalPlanTahunan,
                'act_per_divisi' => $actPerDivisi,
            ];
        }

        // Urutkan rincian: urutan divisi dulu, lalu nomor item
        $urutanDivisi = array_flip($daftarDivisi);

        $annualDetail = array_values($annualDetail);

        usort($annualDetail, function ($a, $b) use ($urutanDivisi) {
            return [$urutanDivisi[$a['divisi']] ?? 99, (int) $a['no_item']]
                <=> [$urutanDivisi[$b['divisi']] ?? 99, (int) $b['no_item']];
        });

        return Inertia::render('Welcome', [
            'bulan' => $bulan,
            'tahun' => $tahun,

            'detail' => $detail,

            'totalItem' => $totalItem,
            'totalJadwal' => $totalJadwal,
            'totalAct' => $totalAct,
            'totalPlan' => $totalPlan,

            'persentaseAct' => $persentaseAct,

            'divisiReport' => array_values($divisiReport),

            'annualReport' => $annualReport,
            'annualDetail' => $annualDetail,
            'daftarDivisi' => $daftarDivisi,

            'bulanMulai' => $bulanMulai,
            'tahunMulai' => $tahunMulai,

            'bulanSelesai' => $bulanSelesai,
            'tahunSelesai' => $tahunSelesai,

            'namaBulan' => $namaBulan,
        ]);
    }

    // =====================================================
    // INDEX
    // =====================================================

    public function index(Request $request): Response
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);
        $status = $request->input('status', 'all');

        // =========================
        // ABNORMALITY CHECKSHEET YANG BELUM SELESAI
        // (hanya yang sudah dihubungkan ke minimal 1 item preventif)
        // =========================
        $abnormalitasTerbuka = CheckSheetAbnormality::query()
            ->with([
                'checkSheet:id,nomor_dokumen,nama_checksheet',
                'line:id,nama_line',
                'preventifMesins',
            ])
            ->whereHas('preventifMesins')
            ->belumSelesai()
            ->orderBy('tanggal')
            ->get();

        // [no item preventif => koleksi abnormality]
        // 1 abnormality yang terhubung ke 3 item akan masuk ke 3 kelompok.
        $abnormalitasPerItem = collect();

        foreach ($abnormalitasTerbuka as $a) {
            foreach ($a->preventifMesins as $pm) {
                $abnormalitasPerItem->put(
                    $pm->no,
                    ($abnormalitasPerItem->get($pm->no) ?? collect())->push($a)
                );
            }
        }

        $formatAbnormalitas = fn ($a) => [
            'id' => $a->id,
            'tanggal' => $a->tanggal->format('Y-m-d'),
            'tanggal_format' => $a->tanggal->translatedFormat('d F Y'),
            'checksheet' => $a->checkSheet?->nama_checksheet,
            'nomor_dokumen' => $a->checkSheet?->nomor_dokumen,
            'mesin' => $a->line?->nama_line,
            'abnormality' => $a->abnormality,
            'status' => $a->status,
            'pic' => $a->pic,
            'url' => route('check-sheets.show', [
                'check_sheet' => $a->check_sheet_id,
                'bulan' => $a->tanggal->month,
                'tahun' => $a->tanggal->year,
                'line_id' => $a->line_id,
            ]),
        ];

        // =========================
        // QUERY SEMUA DATA
        // =========================
        $allPreventifMesins = PreventifMesin::where('is_hidden', false)->with([
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
            ->orderBy('no_item')
            ->get();

        // =========================
        // TANGGAL PLAN + NILAI BULANAN + STATUS ACT + ABNORMALITAS
        // =========================
        $allPreventifMesins->transform(
            function ($preventif) use ($tahun, $bulan, $abnormalitasPerItem, $formatAbnormalitas) {

                // Tanggal Plan efektif (otomatis atau manual)
                $preventif->tanggal_plan = $this->getTanggalPlanEfektif(
                    $preventif,
                    $tahun,
                    $bulan
                );

                // Menandai apakah Plan bulan ini sudah diedit secara manual
                $preventif->punya_plan_manual = $preventif->planOverrides()
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->exists();

                $nilai = $this->nilaiBulanan($preventif);

                $preventif->durasi = $nilai['durasi'];
                $preventif->total_durasi = $nilai['total_durasi'];
                $preventif->dot = $nilai['dot'];
                $preventif->hot = $nilai['hot'];

                $preventif->item_preventif_master = $preventif->getOriginal('item_preventif');
                $preventif->item_preventif = $nilai['item_preventif'];
                $preventif->punya_data_bulanan = $nilai['punya_data_bulanan'];

                // ACT = ada checklist yang dicentang di bulan ini (tanggal mana pun)
                $preventif->status_act = $preventif->checklists->contains(
                    fn ($checklist) => (bool) $checklist->status === true
                );

                // Abnormality checksheet yang belum selesai untuk item ini
                $preventif->abnormalitas_terbuka = ($abnormalitasPerItem->get($preventif->no) ?? collect())
                    ->map($formatAbnormalitas)
                    ->values();

                return $preventif;
            }
        );

        // =========================
        // TOTAL DOT & HOT (SEMUA / ACT / PLAN)
        // =========================
        $sumJam = fn ($items, string $field) => round(
            $items->sum(fn ($p) => (float) $p->{$field}),
            2
        );

        $dataAct = $allPreventifMesins->filter(fn ($p) => $p->status_act);
        $dataPlan = $allPreventifMesins->filter(fn ($p) => !$p->status_act);

        $totalDotAll = $sumJam($allPreventifMesins, 'dot');
        $totalHotAll = $sumJam($allPreventifMesins, 'hot');

        $totalDotAct = $sumJam($dataAct, 'dot');
        $totalHotAct = $sumJam($dataAct, 'hot');

        $totalDotPlan = $sumJam($dataPlan, 'dot');
        $totalHotPlan = $sumJam($dataPlan, 'hot');

        // =========================
        // FILTER STATUS
        // =========================
        $allPreventifMesins = $allPreventifMesins
            ->filter(function ($preventif) use ($status) {
                if ($status === 'ACT') {
                    return $preventif->status_act;
                }

                if ($status === 'Plan') {
                    return !$preventif->status_act;
                }

                return true;
            })
            ->values();

        // =========================
        // PAGINATION SETELAH FILTER
        // =========================
        $perPage = 10;

        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $currentItems = $allPreventifMesins
            ->slice(($currentPage - 1) * $perPage, $perPage)
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
        // NOTIFIKASI PREVENTIF (jadwal)
        // =========================
        $hariIni = Carbon::today();

        $semuaPreventif = PreventifMesin::where('is_hidden', false)->with('checklists')->get();

        $notifikasi = [];

        $tanggalKemarin = $hariIni->copy()->subDay();
        $tanggalBesok = $hariIni->copy()->addDay();

        foreach ($semuaPreventif as $preventif) {
            $planKemarin = $this->generateTanggalPlan(
                $preventif,
                $tanggalKemarin->year,
                $tanggalKemarin->month
            );

            $planBesok = $this->generateTanggalPlan(
                $preventif,
                $tanggalBesok->year,
                $tanggalBesok->month
            );

            // 1. Plan besok -> notif H-1
            if (in_array($tanggalBesok->format('Y-m-d'), $planBesok, true)) {
                $notifikasi[] = [
                    'tipe' => 'besok',
                    'tanggal' => $tanggalBesok->format('Y-m-d'),
                    'no' => $preventif->no,
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

            // 2. Plan kemarin -> belum dilakukan
            if (in_array($tanggalKemarin->format('Y-m-d'), $planKemarin, true)) {
                $sudahDilakukan = $preventif->checklists
                    ->contains(function ($checklist) use ($tanggalKemarin) {
                        return Carbon::parse($checklist->tanggal)
                            ->isSameDay($tanggalKemarin)
                            && (bool) $checklist->status === true;
                    });

                if (!$sudahDilakukan) {
                    $notifikasi[] = [
                        'tipe' => 'terlambat',
                        'tanggal' => $tanggalKemarin->format('Y-m-d'),
                        'no' => $preventif->no,
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
        // NOTIFIKASI ABNORMALITY (dari checksheet)
        // Satu notifikasi per (abnormality x item preventif)
        // =========================
        $preventifByNo = $semuaPreventif->keyBy('no');
        $notifAbnormality = [];

        foreach ($abnormalitasTerbuka as $a) {
            $info = $formatAbnormalitas($a);

            foreach ($a->preventifMesins as $pm) {
                $preventif = $preventifByNo->get($pm->no);

                // item preventif sudah dihapus/disembunyikan -> lewati
                if (! $preventif) {
                    continue;
                }

                $notifAbnormality[] = [
                    'tipe' => 'abnormality',
                    'tanggal' => $info['tanggal'],
                    'no' => $preventif->no,
                    'divisi' => $preventif->divisi,
                    'no_item' => $preventif->no_item,
                    'item_preventif' => $preventif->item_preventif,
                    'checksheet' => $info['checksheet'],
                    'mesin' => $info['mesin'],
                    'abnormality' => $info['abnormality'],
                    'url' => $info['url'],
                    'pesan' =>
                        'Ditemukan abnormality pada checksheet "' . $info['checksheet'] . '"'
                        . ($info['mesin'] ? ' (' . $info['mesin'] . ')' : '')
                        . ' tanggal ' . $info['tanggal_format']
                        . '. Perlu pengecekan lebih lanjut penyebab abnormality pada item preventif ini.',
                ];
            }
        }

        // Abnormality paling atas karena paling penting
        $notifikasi = array_merge($notifAbnormality, $notifikasi);

        return Inertia::render('PreventifMesin/Index', [
            'preventifMesins' => $preventifMesins,

            'bulan' => $bulan,
            'tahun' => $tahun,
            'status' => $status,

            'totalDotAll' => $totalDotAll,
            'totalHotAll' => $totalHotAll,
            'totalDotAct' => $totalDotAct,
            'totalHotAct' => $totalHotAct,
            'totalDotPlan' => $totalDotPlan,
            'totalHotPlan' => $totalHotPlan,

            'notifikasi' => $notifikasi,

            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    // =====================================================
    // CREATE / EDIT / STORE / UPDATE / DESTROY
    // =====================================================

    public function create(): Response
    {
        $divisis = ['Sewing', 'Headrest', 'Utility', 'Saidan'];

        $nextNo = [];

        foreach ($divisis as $divisi) {
            // hanya item yang masih tampil (tidak disembunyikan)
            $nextNo[$divisi] = PreventifMesin::nomorBerikutnya($divisi);
        }

        return Inertia::render('PreventifMesin/Create', [
            'nextNo' => $nextNo,
        ]);
    }

    public function edit(PreventifMesin $preventifMesin): Response
    {
        return Inertia::render('PreventifMesin/Edit', [
            'preventifMesin' => $preventifMesin,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'divisi' => ['required', 'string'],
            'item_preventif' => ['required', 'string'],

            'periode_nilai' => ['nullable', 'numeric', 'min:1'],
            'periode_satuan' => ['nullable', 'string', 'in:hari,minggu,bulan,tahun'],
            'tanggal_plan_awal' => ['nullable', 'date'],
            'jumlah_dilakukan' => ['nullable', 'integer', 'min:1'],
        ]);

        // Nomor otomatis: lanjut dari item terakhir yang masih tampil
        $nextNo = PreventifMesin::nomorBerikutnya($request->divisi);

        $bulanAwal = now()->month;
        $tahunAwal = now()->year;

        if ($request->filled('tanggal_plan_awal')) {
            $tanggalAwal = Carbon::parse($request->tanggal_plan_awal);

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

        // jaga-jaga kalau ada nomor yang bolong di data lama
        PreventifMesin::susunUlangNoItem($request->divisi);

        return redirect()
            ->route('preventif-mesin.index', [
                'bulan' => $bulanAwal,
                'tahun' => $tahunAwal,
            ])
            ->with('success', 'Data preventif mesin berhasil ditambahkan.');
    }

    public function update(Request $request, PreventifMesin $preventifMesin)
    {
        $request->validate([
            'divisi' => ['required', 'string'],
            'item_preventif' => ['required', 'string'],

            'no_item' => ['nullable', 'integer', 'min:1'],
            'periode_nilai' => ['nullable', 'numeric', 'min:1'],
            'periode_satuan' => ['nullable', 'string', 'in:hari,minggu,bulan,tahun'],
            'tanggal_plan_awal' => ['nullable', 'date'],
            'jumlah_dilakukan' => ['nullable', 'integer', 'min:1'],
        ]);

        $bulanAwal = now()->month;
        $tahunAwal = now()->year;

        if ($request->filled('tanggal_plan_awal')) {
            $tanggalAwal = Carbon::parse($request->tanggal_plan_awal);

            $bulanAwal = $tanggalAwal->month;
            $tahunAwal = $tanggalAwal->year;
        }

        $divisiLama = $preventifMesin->divisi;
        $noLama = (int) $preventifMesin->no_item;
        $divisiBaru = $request->divisi;

        if ($request->filled('no_item')) {
            $noBaru = (int) $request->no_item;
        } elseif ($divisiLama !== $divisiBaru) {
            // pindah divisi tanpa isi nomor -> taruh di urutan paling akhir divisi baru
            $noBaru = PreventifMesin::nomorBerikutnya($divisiBaru);
        } else {
            $noBaru = $noLama;
        }

        $preventifMesin->update([
            'divisi' => $divisiBaru,

            'no_item' => $noBaru,

            'item_preventif' => $request->item_preventif,

            'periode_nilai' => $request->periode_nilai,
            'periode_satuan' => $request->periode_satuan,

            'tanggal_plan_awal' => $request->tanggal_plan_awal,
            'jumlah_dilakukan' => $request->jumlah_dilakukan,
        ]);

        // divisi lama ikut dirapikan kalau item pindah divisi
        if ($divisiLama !== $divisiBaru) {
            PreventifMesin::susunUlangNoItem($divisiLama);
        }

        // nomor diubah jadi lebih kecil / pindah divisi -> item ini didahulukan,
        // nomor diubah jadi lebih besar -> item ini ditaruh sesudah item yang bernomor sama
        PreventifMesin::susunUlangNoItem(
            $divisiBaru,
            (int) $preventifMesin->no,
            $divisiLama !== $divisiBaru || $noBaru < $noLama
        );

        return redirect()
            ->route('preventif-mesin.index', [
                'bulan' => $bulanAwal,
                'tahun' => $tahunAwal,
            ])
            ->with('success', 'Data preventif mesin berhasil diperbarui.');
    }

    public function destroy(PreventifMesin $preventifMesin)
    {
        // Tandai sebagai terhapus dari website tanpa menghapus record database.
        $preventifMesin->is_hidden = true;
        $preventifMesin->save();

        // Nomor item lain di divisi yang sama otomatis maju
        PreventifMesin::susunUlangNoItem($preventifMesin->divisi);

        return redirect()
            ->route('preventif-mesin.index')
            ->with('success', 'Data preventif mesin berhasil dihapus.');
    }

    // =====================================================
    // DATA BULANAN
    // =====================================================

    /**
     * Simpan durasi / total_durasi / dot / hot untuk SATU bulan tertentu.
     * Kalau semua field dikosongkan, data bulanan dihapus.
     */
    public function updateBulanan(Request $request, PreventifMesin $preventifMesin)
    {
        $data = $request->validate([
            'bulan' => ['required', 'integer', 'between:1,12'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],

            'durasi' => ['nullable', 'numeric', 'min:0'],
            'total_durasi' => ['nullable', 'numeric', 'min:0'],
            'dot' => ['nullable', 'numeric', 'min:0'],
            'hot' => ['nullable', 'numeric', 'min:0'],

            'item_preventif' => ['nullable', 'string'],
        ]);

        // Nama item bulan ini. Kosong / sama dengan master -> pakai nama master.
        $namaMaster = trim((string) $preventifMesin->item_preventif);
        $itemBulan = trim((string) ($data['item_preventif'] ?? ''));

        if ($itemBulan === '' || $itemBulan === $namaMaster) {
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

        return back()->with('success', 'Data bulanan berhasil disimpan.');
    }

    // =====================================================
    // CHECKLIST
    // =====================================================

    public function storeChecklist(Request $request, PreventifMesin $preventifMesin)
    {
        $request->validate([
            'tanggal' => ['required', 'date'],
            'status' => ['required', 'boolean'],
            'catatan' => ['nullable', 'string'],
        ]);

        $preventifMesin->checklists()->updateOrCreate(
            ['tanggal' => $request->tanggal],
            [
                'status' => $request->status,
                'catatan' => $request->catatan,
            ]
        );

        return back();
    }

    // =====================================================
    // HELPER
    // =====================================================

    /**
     * Nilai durasi/total_durasi/dot/hot untuk bulan tertentu.
     * $preventif->bulanans harus sudah di-eager-load dan difilter bulan & tahunnya.
     */
    private function nilaiBulanan(PreventifMesin $preventif): array
    {
        $bulanan = $preventif->bulanans->first();

        return [
            'durasi' => $bulanan?->durasi,
            'total_durasi' => $bulanan?->total_durasi,
            'dot' => $bulanan?->dot,
            'hot' => $bulanan?->hot,

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

        $tanggalAwal = Carbon::parse($preventifMesin->tanggal_plan_awal);

        $tanggalMulai = Carbon::create($tahun, $bulan, 1)->startOfMonth();
        $tanggalAkhir = Carbon::create($tahun, $bulan, 1)->endOfMonth();

        $tanggalPlan = [];

        $jumlahDilakukan = max(1, (int) ($preventifMesin->jumlah_dilakukan ?? 1));

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
                    && $tanggalDilakukan->lte($tanggalAkhir)
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

        // Hapus tanggal ganda lalu urutkan
        $tanggalPlan = array_values(array_unique($tanggalPlan));
        sort($tanggalPlan);

        return $tanggalPlan;
    }


    public function getTanggalPlanEfektif(
        PreventifMesin $preventifMesin,
        int $tahun,
        int $bulan
    ): array {
        $override = $preventifMesin->planOverrides()
            ->where('tahun', $tahun)
            ->where('bulan', $bulan)
            ->first();

        // Jika sudah ada Plan manual, gunakan tanggal manual.
        // Termasuk jika array-nya kosong.
        if ($override !== null) {
            return $override->tanggal_plan ?? [];
        }

        // Jika belum pernah diedit, gunakan jadwal otomatis.
        return $this->generateTanggalPlan(
            $preventifMesin,
            $tahun,
            $bulan
        );
    }


    private function tambahPeriode(Carbon $tanggal, int $nilai, ?string $satuan): Carbon
    {
        $nilai = (float) $nilai;

        return match ($satuan) {
            'hari' => $tanggal->copy()->addDays($nilai),
            'minggu' => $tanggal->copy()->addWeeks($nilai),
            'bulan' => $tanggal->copy()->addMonths($nilai),
            'tahun' => $tanggal->copy()->addYears($nilai),
            default => $tanggal->copy(),
        };
    }

    /**
     * Ambil N hari kerja (Senin-Jumat) berurutan mulai dari tanggal tertentu.
     * Kalau tanggal mulai jatuh di weekend, mulai dari Senin berikutnya.
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

    // =====================================================
    // EXPORT EXCEL
    // =====================================================

    public function exportExcel(Request $request)
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        $preventifMesins = PreventifMesin::where('is_hidden', false)->with([
            'checklists' => function ($query) use ($bulan, $tahun) {
                $query->whereYear('tanggal', $tahun)
                    ->whereMonth('tanggal', $bulan);
            },

            'bulanans' => function ($query) use ($bulan, $tahun) {
                $query->where('tahun', $tahun)
                    ->where('bulan', $bulan);
            },
        ])
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get();

        $jumlahHari = Carbon::create($tahun, $bulan, 1)->daysInMonth;

        $namaBulan = self::NAMA_BULAN;

        $data = [];

        $data[] = ['LIST PREVENTIF MESIN SURYA CIPTA 2'];
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
        $totalDot = 0;
        $totalHot = 0;

        // Format angka jam, contoh: 2.50 => "2.5 jam"
        $formatJam = function ($nilai) {
            if ($nilai === null || $nilai === '') {
                return '';
            }

            $nilai = rtrim(
                rtrim(number_format((float) $nilai, 2, '.', ''), '0'),
                '.'
            );

            return $nilai . ' jam';
        };

        foreach ($preventifMesins as $preventif) {
            $tanggalPlan = $this->getTanggalPlanEfektif($preventif, $tahun, $bulan);

            $nilai = $this->nilaiBulanan($preventif);
            $totalDot += (float) ($nilai['dot'] ?? 0);
            $totalHot += (float) ($nilai['hot'] ?? 0);

            // ---------- PLAN ----------
            $periode = '';

            if ($preventif->periode_nilai) {
                $nilaiPeriode = rtrim(
                    rtrim(number_format((float) $preventif->periode_nilai, 2, '.', ''), '0'),
                    '.'
                );

                $periode = $nilaiPeriode . ' ' . $preventif->periode_satuan;
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
                $tanggal = Carbon::create($tahun, $bulan, $hari)->format('Y-m-d');

                $planRow[] = in_array($tanggal, $tanggalPlan, true) ? '○' : '';
            }

            $data[] = $planRow;

            // ---------- ACT ----------
            $actRow = ['', '', '', '', '', '', '', '', 'ACT'];

            for ($hari = 1; $hari <= $jumlahHari; $hari++) {
                $tanggal = Carbon::create($tahun, $bulan, $hari)->format('Y-m-d');

                $checklist = $preventif->checklists->first(
                    fn ($item) => Carbon::parse($item->tanggal)->format('Y-m-d') === $tanggal
                );

                // ✓ untuk semua tanggal yang dicentang, termasuk di luar jadwal Plan
                $actRow[] = ($checklist && (bool) $checklist->status) ? '✓' : '';
            }

            $data[] = $actRow;
        }

        $filename = 'Preventif_Mesin_' . $namaBulan[$bulan] . '_' . $tahun . '.xlsx';

        return Excel::download(
            new PreventifMesinExport(
                $data,
                $jumlahHari,
                [
                    'dot' => $formatJam(round($totalDot, 2)),
                    'hot' => $formatJam(round($totalHot, 2)),
                ]
            ),
            $filename
        );
    }

    public function updatePlan(Request $request, PreventifMesin $preventifMesin)
    {
        $validated = $request->validate([
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer|between:2000,2100',
            'tanggal_plan' => 'present|array',
            'tanggal_plan.*' => 'required|date_format:Y-m-d',
        ]);

        $bulan = (int) $validated['bulan'];
        $tahun = (int) $validated['tahun'];

        $tanggalPlan = collect($validated['tanggal_plan'])
            ->unique()
            ->sort()
            ->values()
            ->all();

        // Pastikan semua tanggal berada pada bulan dan tahun yang dipilih.
        foreach ($tanggalPlan as $tanggal) {
            $tanggalCarbon = Carbon::createFromFormat('Y-m-d', $tanggal);

            if (
                $tanggalCarbon->year !== $tahun ||
                $tanggalCarbon->month !== $bulan
            ) {
                return back()->withErrors([
                    'tanggal_plan' => 'Tanggal Plan harus sesuai dengan bulan dan tahun yang dipilih.',
                ])->withInput();
            }
        }

        PreventifMesinPlanOverride::updateOrCreate(
            [
                'preventif_mesin_id' => $preventifMesin->no,
                'tahun' => $tahun,
                'bulan' => $bulan,
            ],
            [
                'tanggal_plan' => $tanggalPlan,
            ]
        );

        return back()->with('success', 'Plan bulanan berhasil diperbarui.');
    }

}
