<?php

namespace App\Http\Controllers;

use App\Models\PreventifMesin;
use App\Models\PreventifPengiriman;
use App\Models\PreventifRevisi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PimpinanController extends Controller
{
    public function index(Request $request): Response
    {
        $pengirimans = PreventifPengiriman::with('pengirim')
            ->withCount([
                'revisis',
                'revisis as revisi_baru_count' => function ($query) {
                    $query->whereNull('ditinjau_pada');
                },
            ])
            ->withMax('revisis', 'created_at')
            ->orderByDesc('tanggal')
            ->get()
            ->map(function ($pengiriman) {
                return [
                    'id' => $pengiriman->id,
                    'tanggal' => $pengiriman->tanggal->format('Y-m-d'),
                    'tanggal_format' => $pengiriman->tanggal->translatedFormat('d F Y'),
                    'dikirim_oleh' => $pengiriman->pengirim?->name,
                    'dikirim_pada' => $pengiriman->dikirim_pada?->translatedFormat('d F Y'),
                    'status' => $pengiriman->status,
                    'alasan_penolakan' => $pengiriman->alasan_penolakan,

                    // Info revisi
                    'jumlah_revisi' => (int) $pengiriman->revisis_count,
                    'revisi_baru' => (int) $pengiriman->revisi_baru_count,
                    'revisi_terakhir' => $pengiriman->revisis_max_created_at
                        ? Carbon::parse($pengiriman->revisis_max_created_at)
                            ->translatedFormat('d F Y')
                        : null,
                ];
            });

        return Inertia::render('Pimpinan/Index', [
            'user' => [
                'name' => $request->user()?->name,
                'role' => $request->user()?->role,
            ],
            'pengirimans' => $pengirimans,
        ]);
    }

    public function show(PreventifPengiriman $pengiriman): Response
    {
        $tanggalPengiriman = Carbon::parse($pengiriman->tanggal);

        $tanggal = $tanggalPengiriman->format('Y-m-d');

        $bulan = $tanggalPengiriman->month;
        $tahun = $tanggalPengiriman->year;

        $preventifMesins = PreventifMesin::with([
            'checklists' => function ($query) use ($tanggal) {
                $query->whereDate('tanggal', $tanggal);
            },

            // Nilai durasi/total_durasi/dot/hot khusus bulan pengiriman
            'bulanans' => function ($query) use ($bulan, $tahun) {
                $query->where('tahun', $tahun)
                    ->where('bulan', $bulan);
            },
        ])
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get();

        // =========================
        // REVISI
        // =========================
        $revisis = $pengiriman->revisis()
            ->with('pengubah')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $revisiPerItem = $revisis->groupBy('preventif_mesin_id');

        $revisiList = $revisis
            ->map(fn ($revisi) => $this->formatRevisi($revisi))
            ->values();

        // =========================
        // DATA TABEL
        // =========================
        $data = $preventifMesins
            ->map(function ($preventif) use ($bulan, $tahun, $tanggal, $revisiPerItem) {

                $tanggalPlan = $this->generateTanggalPlan(
                    $preventif,
                    $tahun,
                    $bulan
                );

                $adaPlan = in_array($tanggal, $tanggalPlan, true);

                $nilai = $this->nilaiBulanan($preventif);

                $revisiItem = ($revisiPerItem->get($preventif->no) ?? collect())
                    ->map(fn ($revisi) => $this->formatRevisi($revisi))
                    ->values();

                return [
                    'id' => $preventif->no,
                    'divisi' => $preventif->divisi,
                    'no_item' => $preventif->no_item,
                    'item_preventif' => $nilai['item_preventif'],

                    'periode' => $preventif->periode_nilai
                        ? rtrim(
                            rtrim(
                                number_format(
                                    (float) $preventif->periode_nilai,
                                    2,
                                    '.',
                                    ''
                                ),
                                '0'
                            ),
                            '.'
                        ) . ' ' . $preventif->periode_satuan
                        : '',

                    'durasi' => $nilai['durasi'],
                    'total_durasi' => $nilai['total_durasi'],
                    'dot' => $nilai['dot'],
                    'hot' => $nilai['hot'],

                    // Tetap kirim tanggal yang dikirim saja
                    'tanggal_plan' => $adaPlan
                        ? [$tanggal]
                        : [],

                    'checklists' => $preventif->checklists
                        ->map(function ($checklist) {
                            return [
                                'tanggal' => Carbon::parse($checklist->tanggal)
                                    ->format('Y-m-d'),
                                'status' => (bool) $checklist->status,
                                'catatan' => $checklist->catatan,
                            ];
                        })
                        ->values(),

                    'revisis' => $revisiItem,
                ];
            })
            ->values();

        return Inertia::render('Pimpinan/Detail', [
            'user' => [
                'name' => request()->user()?->name,
                'role' => request()->user()?->role,
            ],

            'pengiriman' => [
                'id' => $pengiriman->id,
                'tanggal' => $tanggalPengiriman->format('Y-m-d'),
                'tanggal_format' => $tanggalPengiriman->translatedFormat('d F Y'),
                'dikirim_oleh' => $pengiriman->pengirim?->name,
                'dikirim_pada' => $pengiriman->dikirim_pada?->translatedFormat('d F Y'),
                'status' => $pengiriman->status,
                'alasan_penolakan' => $pengiriman->alasan_penolakan,
            ],

            'bulan' => $bulan,
            'tahun' => $tahun,
            'preventifMesins' => $data,
            'revisis' => $revisiList,
        ]);
    }

    public function periksa(PreventifPengiriman $pengiriman)
    {
        // Semua revisi yang ada dianggap sudah ditinjau pimpinan
        $pengiriman->revisis()
            ->whereNull('ditinjau_pada')
            ->update(['ditinjau_pada' => now()]);

        $pengiriman->update([
            'status' => 'diperiksa',
        ]);

        return redirect()
            ->route('pimpinan.index')
            ->with(
                'success',
                'Data berhasil ditandai sudah diperiksa.'
            );
    }

    public function tolak(Request $request, PreventifPengiriman $pengiriman)
    {
        $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:1000'],
        ]);

        $pengiriman->update([
            'status' => 'ditolak',
            'alasan_penolakan' => $request->alasan_penolakan,
        ]);

        return redirect()
            ->route('pimpinan.index')
            ->with(
                'success',
                'Data berhasil ditolak dan alasan penolakan telah disimpan.'
            );
    }

    private function formatRevisi(PreventifRevisi $revisi): array
    {
        return [
            'id' => $revisi->id,
            'item_id' => $revisi->preventif_mesin_id,
            'item' => $revisi->item_label,
            'jenis' => $revisi->jenis,
            'keterangan' => $revisi->keterangan,
            'nilai_lama' => $revisi->nilai_lama,
            'nilai_baru' => $revisi->nilai_baru,
            'oleh' => $revisi->pengubah?->name,
            'waktu' => $revisi->created_at?->translatedFormat('d F Y'),
            'baru' => $revisi->ditinjau_pada === null,
        ];
    }

    /**
     * Nilai durasi/total_durasi/dot/hot/nama item untuk bulan pengiriman.
     * Sama dengan di sisi admin: hanya dari tabel bulanan.
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
        ];
    }

    private function generateTanggalPlan(
        PreventifMesin $preventifMesin,
        int $tahun,
        int $bulan
    ): array {

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

            if ($tanggalBerikutnya->lte($tanggal)) {
                break;
            }

            $tanggal = $tanggalBerikutnya;
        }

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
            'hari' => $tanggal->copy()->addDays($nilai),
            'minggu' => $tanggal->copy()->addWeeks($nilai),
            'bulan' => $tanggal->copy()->addMonths($nilai),
            'tahun' => $tanggal->copy()->addYears($nilai),
            default => $tanggal->copy(),
        };
    }

    /**
     * Ambil N hari kerja (Senin-Jumat) berurutan mulai dari tanggal tertentu.
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
}