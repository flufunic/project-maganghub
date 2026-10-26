<?php

namespace App\Http\Controllers;

use App\Models\CheckSheetPengiriman;
use App\Services\CheckSheetMingguan;
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
}
