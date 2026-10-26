<?php

namespace App\Http\Controllers;

use App\Models\CheckSheetPengiriman;
use App\Services\CheckSheetMingguan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckSheetPengirimanController extends Controller
{
    public function index(Request $request): Response
    {
        $tahun = max(2020, min(2040, (int) ($request->tahun ?: now()->year)));
        $bulan = max(1, min(12, (int) ($request->bulan ?: now()->month)));

        $awalBulan  = Carbon::create($tahun, $bulan, 1);
        $akhirBulan = $awalBulan->copy()->endOfMonth();
        $seninAwal  = CheckSheetMingguan::senin($awalBulan);

        $divisis = CheckSheetMingguan::divisiList();

        // soft delete otomatis menyembunyikan data yang sudah dihapus pimpinan
        $pengirimans = CheckSheetPengiriman::with('pengirim')
            ->whereNotNull('divisi_id')
            ->whereBetween('minggu_mulai', [
                $seninAwal->toDateString(),
                $akhirBulan->toDateString(),
            ])
            ->get()
            ->keyBy(fn ($p) => $p->minggu_mulai->format('Y-m-d') . '|' . $p->divisi_id);

        $minggu = [];

        for ($w = $seninAwal->copy(); $w->lte($akhirBulan); $w->addWeek()) {
            $key  = $w->format('Y-m-d');
            $rows = [];

            foreach ($divisis as $divisiId => $namaDivisi) {
                $p = $pengirimans->get($key . '|' . $divisiId);

                $rows[] = [
                    'divisi_id'        => $divisiId,
                    'divisi'           => $namaDivisi,
                    'status'           => $p?->status,
                    'alasan_penolakan' => $p?->alasan_penolakan,
                    'dikirim_oleh'     => $p?->pengirim?->name,
                    'dikirim_pada'     => $p?->dikirim_pada?->translatedFormat('d F Y'),
                    'boleh_kirim'      => $w->lte(now()) && (! $p || $p->status === 'ditolak'),
                ];
            }

            $minggu[] = [
                'mulai'   => $key,
                'selesai' => $w->copy()->addDays(6)->format('Y-m-d'),
                'label'   => CheckSheetMingguan::label($w),
                'divisis' => $rows,
            ];
        }

        return Inertia::render('CheckSheet/Pengiriman', [
            'tahun'  => $tahun,
            'bulan'  => $bulan,
            'minggu' => $minggu,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'minggu_mulai' => ['required', 'date_format:Y-m-d'],
            'divisi_id'    => ['required', 'integer', 'exists:check_sheets,divisi_id'],
        ]);

        $mulai = CheckSheetMingguan::senin($data['minggu_mulai']);

        if ($mulai->isFuture()) {
            return back()->withErrors([
                'pengiriman' => 'Minggu ini belum dimulai, belum bisa dikirim.',
            ]);
        }

        // withTrashed: kalau pernah dihapus pimpinan, pakai baris lama (hindari bentrok unique index)
        $pengiriman = CheckSheetPengiriman::withTrashed()->firstOrNew([
            'minggu_mulai' => $mulai->toDateString(),
            'divisi_id'    => $data['divisi_id'],
        ]);

        if ($pengiriman->exists && ! $pengiriman->trashed() && $pengiriman->status !== 'ditolak') {
            return back()->withErrors([
                'pengiriman' => 'Divisi ini sudah dikirim untuk minggu tersebut.',
            ]);
        }

        $pengiriman->fill([
            'minggu_selesai'   => $mulai->copy()->addDays(6)->toDateString(),
            'dikirim_oleh'     => $request->user()->id,
            'dikirim_pada'     => now(),
            'status'           => 'menunggu',
            'alasan_penolakan' => null,
            'dihapus_oleh'     => null,
        ]);

        $pengiriman->deleted_at = null; // pulihkan kalau sebelumnya dihapus
        $pengiriman->save();

        $namaDivisi = CheckSheetMingguan::divisiList()[$data['divisi_id']] ?? 'Divisi';

        return back()->with(
            'success',
            "Check sheet {$namaDivisi} · " . CheckSheetMingguan::label($mulai) . ' berhasil dikirim ke pimpinan.'
        );
    }

    // Notifikasi untuk admin: hasil pemeriksaan pimpinan (30 hari terakhir)
    public function notifikasi()
    {
        $divisis = CheckSheetMingguan::divisiList();

        $items = CheckSheetPengiriman::whereNotNull('divisi_id')
            ->whereIn('status', ['diperiksa', 'ditolak'])
            ->where('updated_at', '>=', now()->subDays(30))
            ->orderByDesc('updated_at')
            ->limit(15)
            ->get()
            ->map(fn ($p) => [
                'id'               => $p->id,
                'divisi'           => $divisis[$p->divisi_id] ?? '-',
                'label'            => CheckSheetMingguan::label($p->minggu_mulai),
                'bulan'            => (int) $p->minggu_mulai->format('n'),
                'tahun'            => (int) $p->minggu_mulai->format('Y'),
                'status'           => $p->status,
                'alasan_penolakan' => $p->alasan_penolakan,
                'waktu'            => $p->updated_at?->translatedFormat('d M Y'),
                'ts'               => $p->updated_at?->timestamp ?? 0,
            ])
            ->values();

        return response()->json(['items' => $items]);
    }

    // Halaman riwayat: semua pengiriman yang pernah dikirim admin
    public function riwayat(): Response
    {
        $divisis = CheckSheetMingguan::divisiList();

        $pengirimans = CheckSheetPengiriman::with('pengirim')
            ->whereNotNull('divisi_id')
            ->orderByDesc('minggu_mulai')
            ->orderBy('divisi_id')
            ->get()
            ->map(fn ($p) => [
                'id'               => $p->id,
                'label'            => CheckSheetMingguan::label($p->minggu_mulai),
                'bulan'            => (int) $p->minggu_mulai->format('n'),
                'tahun'            => (int) $p->minggu_mulai->format('Y'),
                'divisi_id'        => $p->divisi_id,
                'divisi'           => $divisis[$p->divisi_id] ?? '-',
                'status'           => $p->status,
                'alasan_penolakan' => $p->alasan_penolakan,
                'dikirim_oleh'     => $p->pengirim?->name,
                'dikirim_pada'     => $p->dikirim_pada?->translatedFormat('d F Y'),
            ])
            ->values();

        return Inertia::render('CheckSheet/Riwayat', [
            'pengirimans' => $pengirimans,
            'divisis'     => collect($divisis)->map(fn ($nama, $id) => [
                'id'   => $id,
                'nama' => $nama,
            ])->values(),
        ]);
    }
}