<?php

namespace App\Http\Controllers;

use App\Models\PreventifLaporanMingguan;
use App\Models\PreventifMesin;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Sisi Pimpinan untuk Report Mingguan Preventif yang dikirim Admin.
 *
 * Alur status: menunggu -> diperiksa -> disetujui / ditolak
 * (draft tidak pernah tampil di sisi pimpinan).
 */
class PimpinanController extends Controller
{
    private const NAMA_BULAN = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    // =====================================================
    // DASHBOARD
    // =====================================================

    public function index(Request $request): Response
    {
        $laporans = PreventifLaporanMingguan::query()
            ->where('status', '!=', 'draft')
            ->withCount('revisis')
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderByDesc('week')
            ->get();

        $nama = $this->namaUser($laporans->pluck('dikirim_oleh'));

        return Inertia::render('Pimpinan/Index', [
            'user' => [
                'name' => $request->user()?->name,
                'role' => $request->user()?->role,
            ],

            'laporans' => $laporans->map(fn ($l) => [
                'id' => $l->id,
                'tahun' => $l->tahun,
                'bulan' => $l->bulan,
                'week' => $l->week,
                'periode' => $this->labelPeriode($l),
                'status' => $l->status,
                'alasan_penolakan' => $l->alasan_penolakan,
                'dikirim_oleh' => $nama[$l->dikirim_oleh] ?? null,
                'dikirim_pada' => $this->waktu($l->dikirim_pada),
                'disetujui_pada' => $this->waktu($l->disetujui_pada),

                // Perubahan yang dilakukan admin setelah laporan dikirim
                'jumlah_revisi' => (int) $l->revisis_count,

                // Angka dari snapshot (dibekukan saat dikirim); null kalau tidak ada
                'ringkasan' => $this->ringkasanSnapshot($l),
            ])->values(),

            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    // =====================================================
    // DETAIL LAPORAN
    // =====================================================

    public function show(Request $request, PreventifLaporanMingguan $laporan): Response
    {
        abort_if($laporan->status === 'draft', 404);

        $items = $laporan->items()
            ->orderBy('bagian')
            ->orderBy('urutan')
            ->get();

        $revisis = $laporan->revisis()->latest()->limit(50)->get();

        $nama = $this->namaUser(
            $revisis->pluck('user_id')
                ->push($laporan->dikirim_oleh)
                ->push($laporan->disetujui_oleh)
        );

        return Inertia::render('Pimpinan/Detail', [
            'user' => [
                'name' => $request->user()?->name,
                'role' => $request->user()?->role,
            ],

            'laporan' => [
                'id' => $laporan->id,
                'tahun' => $laporan->tahun,
                'bulan' => $laporan->bulan,
                'week' => $laporan->week,
                'periode' => $this->labelPeriode($laporan),
                'status' => $laporan->status,
                'alasan_penolakan' => $laporan->alasan_penolakan,
                'dikirim_oleh' => $nama[$laporan->dikirim_oleh] ?? null,
                'dikirim_pada' => $this->waktu($laporan->dikirim_pada),
                'disetujui_oleh' => $nama[$laporan->disetujui_oleh] ?? null,
                'disetujui_pada' => $this->waktu($laporan->disetujui_pada),
            ],

            'bagian1' => $this->bagian1($laporan, $items),

            'bagian2' => $items->where('bagian', 2)
                ->map(fn ($i) => $this->itemKeArray($i))
                ->values(),

            'bagian3' => $items->where('bagian', 3)
                ->map(fn ($i) => $this->itemKeArray($i))
                ->values(),

            'revisis' => $revisis->map(fn ($r) => [
                'id' => $r->id,
                'keterangan' => $r->keterangan,
                'oleh' => $nama[$r->user_id] ?? 'Admin',
                'waktu' => $r->created_at?->translatedFormat('d F Y'),
            ])->values(),

            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    // =====================================================
    // AKSI PIMPINAN
    // =====================================================

    public function periksa(PreventifLaporanMingguan $laporan)
    {
        abort_unless($laporan->status === 'menunggu', 422, 'Laporan ini tidak sedang menunggu.');

        $laporan->update(['status' => 'diperiksa']);

        return back()->with('success', 'Laporan ditandai sedang diperiksa.');
    }

    public function setujui(Request $request, PreventifLaporanMingguan $laporan)
    {
        abort_unless(
            in_array($laporan->status, ['menunggu', 'diperiksa'], true),
            422,
            'Laporan ini tidak bisa disetujui.'
        );

        $laporan->update([
            'status' => 'disetujui',
            'disetujui_oleh' => $request->user()->id,
            'disetujui_pada' => now(),
            'alasan_penolakan' => null,
        ]);

        return redirect()
            ->route('pimpinan.index')
            ->with('success', 'Laporan W' . $laporan->week . ' berhasil disetujui.');
    }

    public function tolak(Request $request, PreventifLaporanMingguan $laporan)
    {
        abort_unless(
            in_array($laporan->status, ['menunggu', 'diperiksa'], true),
            422,
            'Laporan ini tidak bisa ditolak.'
        );

        $data = $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:1000'],
        ]);

        $laporan->update([
            'status' => 'ditolak',
            'alasan_penolakan' => $data['alasan_penolakan'],
            'snapshot' => null, // kembali ke angka live supaya admin bisa merevisi
        ]);

        return redirect()
            ->route('pimpinan.index')
            ->with('success', 'Laporan ditolak dan alasan penolakan telah disimpan.');
    }

    /** Batalkan persetujuan: laporan kembali ke admin untuk direvisi dan dikirim ulang. */
    public function batalkan(PreventifLaporanMingguan $laporan)
    {
        if ($laporan->status !== 'disetujui') {
            return back()->with('error', 'Hanya laporan yang sudah disetujui yang bisa dibatalkan.');
        }

        $laporan->update([
            'status' => 'ditolak',
            'alasan_penolakan' => 'Persetujuan dibatalkan oleh pimpinan. Mohon periksa data dan kirim ulang.',
            'snapshot' => null,
            'disetujui_oleh' => null,
            'disetujui_pada' => null,
        ]);

        return redirect()
            ->route('pimpinan.index')
            ->with('success', 'Persetujuan dibatalkan. Admin perlu merevisi dan mengirim ulang laporan.');
    }

    // =====================================================
    // HELPER
    // =====================================================

    /** Angka Bagian 1: snapshot kalau ada (dibekukan saat dikirim), kalau tidak hitungan live. */
    private function bagian1(PreventifLaporanMingguan $laporan, $items): array
    {
        $snapshot = $this->snapshotArray($laporan);

        if ($laporan->sudahDikirim() && ! empty($snapshot)) {
            $dasar = $snapshot;
        } else {
            $rentang = PreventifLaporanMingguan::rentang($laporan->tahun, $laporan->bulan, $laporan->week);

            $dasar = $rentang
                ? $this->hitungBagian1($laporan->tahun, $laporan->bulan, $rentang['hari'])
                : [];
        }

        $komentar = $items->where('bagian', 1)->keyBy('preventif_mesin_id');

        return array_map(function ($row) use ($komentar) {
            $row['komentar'] = $komentar->get($row['no'])?->komentar;

            return $row;
        }, $dasar);
    }

    /** Sama dengan perhitungan di sisi admin (PreventifLaporanMingguanController). */
    private function hitungBagian1(int $tahun, int $bulan, array $hari): array
    {
        $pertama = $hari[0];
        $terakhir = end($hari);

        $mesins = PreventifMesin::where('is_hidden', false)->with([
            'checklists' => fn ($q) => $q->whereDate('tanggal', '>=', $pertama)
                ->whereDate('tanggal', '<=', $terakhir),
            'bulanans' => fn ($q) => $q->where('tahun', $tahun)->where('bulan', $bulan),
        ])->orderBy('divisi')->orderBy('no_item')->get();

        $ctrl = app(PreventifMesinController::class);

        $hasil = [];

        foreach ($mesins as $pm) {
            $plan = array_values(array_intersect(
                $ctrl->getTanggalPlanEfektif($pm, $tahun, $bulan),
                $hari
            ));

            if (count($plan) === 0) {
                continue;
            }

            $byDate = $pm->checklists->keyBy(fn ($c) => substr((string) $c->tanggal, 0, 10));

            $sudah = 0;

            foreach ($plan as $tgl) {
                $c = $byDate->get($tgl);

                if ($c && (bool) $c->status) {
                    $sudah++;
                }
            }

            $jumlah = count($plan);

            $hasil[] = [
                'no' => $pm->no,
                'divisi' => $pm->divisi,
                'mesin' => $pm->bulanans->first()?->item_preventif ?: $pm->getOriginal('item_preventif'),
                'jumlah' => $jumlah,
                'sudah' => $sudah,
                'belum' => $jumlah - $sudah,
                'persen' => (int) round(($sudah / $jumlah) * 100),
            ];
        }

        return $hasil;
    }

    private function itemKeArray($item): array
    {
        return [
            'id' => $item->id,
            'mesin' => $item->mesin,
            'aktivitas' => $item->aktivitas,
            'penanggulangan' => $item->penanggulangan,

            // route foto yang sama dengan sisi admin
            'foto_before_url' => $item->foto_before
                ? route('laporan-mingguan.foto', ['item' => $item->id, 'jenis' => 'before'])
                : null,

            'foto_after_url' => $item->foto_after
                ? route('laporan-mingguan.foto', ['item' => $item->id, 'jenis' => 'after'])
                : null,
        ];
    }

    private function snapshotArray(PreventifLaporanMingguan $laporan): array
    {
        $snapshot = $laporan->snapshot;

        if (is_string($snapshot)) {
            $snapshot = json_decode($snapshot, true);
        }

        return is_array($snapshot) ? $snapshot : [];
    }

    private function ringkasanSnapshot(PreventifLaporanMingguan $laporan): ?array
    {
        $snapshot = $this->snapshotArray($laporan);

        if (empty($snapshot)) {
            return null;
        }

        $jumlah = (int) array_sum(array_column($snapshot, 'jumlah'));
        $sudah = (int) array_sum(array_column($snapshot, 'sudah'));

        return [
            'jumlah' => $jumlah,
            'sudah' => $sudah,
            'persen' => $jumlah > 0 ? (int) round(($sudah / $jumlah) * 100) : 0,
        ];
    }

    private function labelPeriode(PreventifLaporanMingguan $laporan): string
    {
        $rentang = PreventifLaporanMingguan::rentang($laporan->tahun, $laporan->bulan, $laporan->week);
        $bulanTahun = (self::NAMA_BULAN[$laporan->bulan] ?? '-') . ' ' . $laporan->tahun;

        return $rentang
            ? $rentang['awal'] . '-' . $rentang['akhir'] . ' ' . $bulanTahun
            : $bulanTahun;
    }

    private function waktu($nilai): ?string
    {
        return $nilai ? Carbon::parse($nilai)->translatedFormat('d F Y') : null;
    }

    /** [id => nama] untuk beberapa user sekaligus (tanpa relasi). */
    private function namaUser(Collection $ids): array
    {
        $ids = $ids->filter()->unique()->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return User::whereIn('id', $ids)->pluck('name', 'id')->all();
    }
}
