<?php

namespace App\Http\Controllers;

use App\Models\PreventifMesin;
use App\Models\PreventifPengiriman;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PimpinanController extends Controller
{
    public function index(Request $request): Response
    {
        $pengirimans = PreventifPengiriman::with('pengirim')
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
            }
        ])
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get();

        $data = $preventifMesins
            ->map(function ($preventif) use ($bulan, $tahun, $tanggal) {

                $tanggalPlan = $this->generateTanggalPlan(
                    $preventif,
                    $tahun,
                    $bulan
                );

                // Hanya tampilkan mesin yang memang Plan
                // pada tanggal yang dikirim Admin
                if (!in_array($tanggal, $tanggalPlan, true)) {
                    return null;
                }

                return [
                    'id' => $preventif->no,
                    'divisi' => $preventif->divisi,
                    'no_item' => $preventif->no_item,
                    'item_preventif' => $preventif->item_preventif,

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

                    'durasi' => $preventif->durasi,
                    'total_durasi' => $preventif->total_durasi,
                    'dot' => $preventif->dot,
                    'hot' => $preventif->hot,

                    'tanggal_plan' => [$tanggal],

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
                ];
            })
            ->filter()
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
        ]);
    }

    public function periksa(PreventifPengiriman $pengiriman)
    {
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

        $tanggalMulai = Carbon::create(
            $tahun,
            $bulan,
            1
        )->startOfMonth();

        $tanggalAkhir = Carbon::create(
            $tahun,
            $bulan,
            1
        )->endOfMonth();

        $tanggalPlan = [];

        $jumlahDilakukan = max(
            1,
            (int) ($preventifMesin->jumlah_dilakukan ?? 1)
        );

        if (
            empty($preventifMesin->periode_nilai) ||
            empty($preventifMesin->periode_satuan)
        ) {
            for ($i = 0; $i < $jumlahDilakukan; $i++) {

                $tgl = $tanggalAwal->copy()
                    ->addDays($i);

                if (
                    $tgl->gte($tanggalMulai) &&
                    $tgl->lte($tanggalAkhir)
                ) {
                    $tanggalPlan[] = $tgl->format('Y-m-d');
                }
            }

            return $tanggalPlan;
        }

        $tanggal = $tanggalAwal->copy();

        while ($tanggal->lte($tanggalAkhir)) {

            for ($i = 0; $i < $jumlahDilakukan; $i++) {

                $tanggalDilakukan = $tanggal->copy()
                    ->addDays($i);

                if (
                    $tanggalDilakukan->gte($tanggalMulai) &&
                    $tanggalDilakukan->lte($tanggalAkhir)
                ) {
                    $tanggalPlan[] =
                        $tanggalDilakukan->format('Y-m-d');
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

        return $tanggalPlan;
    }

    private function tambahPeriode(
        Carbon $tanggal,
        $nilai,
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
}