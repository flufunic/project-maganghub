<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\CheckSheetPengiriman;
use App\Services\CheckSheetMingguan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckSheetPimpinanController extends Controller
{
    public function index(Request $request): Response
    {
        $divisis = CheckSheetMingguan::divisiList();

        $pengirimans = CheckSheetPengiriman::with('pengirim')
            ->whereNotNull('divisi_id')
            ->orderByDesc('minggu_mulai')
            ->orderBy('divisi_id')
            ->get()
            ->map(fn ($p) => $this->format($p, $divisis));

        return Inertia::render('Pimpinan/CheckSheet/Index', [
            'user' => [
                'name' => $request->user()?->name,
                'role' => $request->user()?->role,
            ],
            'pengirimans' => $pengirimans,
        ]);
    }

    public function show(Request $request, CheckSheetPengiriman $pengiriman): Response
    {
        return Inertia::render('Pimpinan/CheckSheet/Detail', [
            'user' => [
                'name' => $request->user()?->name,
                'role' => $request->user()?->role,
            ],
            'pengiriman' => $this->format(
                $pengiriman->load('pengirim'),
                CheckSheetMingguan::divisiList()
            ),
            'rekap' => CheckSheetMingguan::rekap(
                $pengiriman->minggu_mulai,
                (int) $pengiriman->divisi_id
            ),

            // Data tambahan per check sheet (Pelumasan, Monitoring Running Hours, BBM).
            // Di halaman, tiap blok check sheet mengambilnya lewat nama check sheet.
            'detail' => $this->detailTambahan($pengiriman),
        ]);
    }

    public function periksa(CheckSheetPengiriman $pengiriman)
    {
        if ($pengiriman->status !== 'menunggu') {
            return back()->withErrors(['pengiriman' => 'Pengiriman ini sudah diproses.']);
        }

        $pengiriman->update(['status' => 'diperiksa']);

        return redirect()
            ->route('pimpinan.check-sheet.index')
            ->with('success', 'Check sheet ditandai sudah diperiksa.');
    }

    public function tolak(Request $request, CheckSheetPengiriman $pengiriman)
    {
        if ($pengiriman->status !== 'menunggu') {
            return back()->withErrors(['pengiriman' => 'Pengiriman ini sudah diproses.']);
        }

        $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:1000'],
        ]);

        $pengiriman->update([
            'status'           => 'ditolak',
            'alasan_penolakan' => $request->alasan_penolakan,
        ]);

        return redirect()
            ->route('pimpinan.check-sheet.index')
            ->with('success', 'Check sheet ditolak dan alasan penolakan disimpan.');
    }

    // Soft delete: catatan pengiriman disembunyikan, data check sheet asli tidak disentuh
    public function destroy(Request $request, CheckSheetPengiriman $pengiriman)
    {
        $pengiriman->update(['dihapus_oleh' => $request->user()->id]);
        $pengiriman->delete();

        return redirect()
            ->route('pimpinan.check-sheet.index')
            ->with('success', 'Data pengiriman berhasil dihapus.');
    }

    private function format(CheckSheetPengiriman $p, array $divisis): array
    {
        return [
            'id'               => $p->id,
            'mulai'            => $p->minggu_mulai->format('Y-m-d'),
            'label'            => CheckSheetMingguan::label($p->minggu_mulai),
            'divisi'           => $divisis[$p->divisi_id] ?? '-',
            'dikirim_oleh'     => $p->pengirim?->name,
            'dikirim_pada'     => $p->dikirim_pada?->translatedFormat('d F Y'),
            'status'           => $p->status,
            'alasan_penolakan' => $p->alasan_penolakan,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | DATA TAMBAHAN PER CHECK SHEET
    |--------------------------------------------------------------------------
    | Hanya check sheet yang memakai opsi:
    |   pakai_pelumasan  -> tabel Pelumasan (jadwal statis)
    |   pakai_monitoring -> Running Hours (+ BBM kalau pakai_bbm)
    |
    | Tabel harian (KWH / Plan & Act / centang) dan abnormality sudah ada
    | di $rekap, jadi tidak dikirim ulang di sini.
    */

    private function detailTambahan(CheckSheetPengiriman $p): array
    {
        $mulai = Carbon::parse($p->minggu_mulai)->startOfDay();
        $akhir = $mulai->copy()->addDays(6);

        // Week bisa melewati pergantian bulan, jadi ambil kedua bulan itu
        $filterBulan = function ($query) use ($mulai, $akhir) {
            $query->where(function ($w) use ($mulai, $akhir) {
                $w->where(function ($a) use ($mulai) {
                    $a->where('bulan', $mulai->month)->where('tahun', $mulai->year);
                })->orWhere(function ($b) use ($akhir) {
                    $b->where('bulan', $akhir->month)->where('tahun', $akhir->year);
                });
            });
        };

        return CheckSheet::with([
            'lubrications' => function ($q) {
                $q->orderBy('no')->orderBy('id');
            },

            'monitoringItems' => function ($q) {
                $q->orderBy('no')->orderBy('id');
            },
            'monitoringItems.weeks' => $filterBulan,

            'bbmItems' => function ($q) {
                $q->orderBy('no')->orderBy('id');
            },
            'bbmItems.weeks' => $filterBulan,
        ])
            ->where('divisi_id', $p->divisi_id)
            ->where(function ($q) {
                $q->where('pakai_pelumasan', true)
                    ->orWhere('pakai_monitoring', true);
            })
            ->orderBy('id')
            ->get()
            ->map(fn (CheckSheet $cs) => [
                'id'               => $cs->id,
                'nama_checksheet'  => $cs->nama_checksheet,
                'nomor_dokumen'    => $cs->nomor_dokumen,
                'pakai_pelumasan'  => (bool) $cs->pakai_pelumasan,
                'pakai_monitoring' => (bool) $cs->pakai_monitoring,
                'pakai_bbm'        => (bool) $cs->pakai_bbm,

                'pelumasan' => $cs->pakai_pelumasan
                    ? $cs->lubrications->map(fn ($l) => [
                        'id'        => $l->id,
                        'sub_mesin' => $l->sub_mesin,
                        'jenis'     => $l->jenis_pelumasan,
                        'qty'       => $l->qty,
                        'method'    => $l->method,
                        'tools'     => $l->tools,
                        'time'      => $l->time_minutes,
                        'interval'  => $l->interval, // day | week | month | year
                        'pic'       => $l->pic,
                    ])->values()->all()
                    : [],

                // Kolom tabel monitoring / BBM diteruskan apa adanya (termasuk 'weeks')
                'monitoring' => $cs->pakai_monitoring
                    ? $cs->monitoringItems->map(fn ($m) => $m->toArray())->values()->all()
                    : [],

                'bbm' => ($cs->pakai_monitoring && $cs->pakai_bbm)
                    ? $cs->bbmItems->map(fn ($m) => $m->toArray())->values()->all()
                    : [],
            ])
            ->values()
            ->all();
    }
}
