<?php

namespace App\Http\Controllers;

use App\Models\OverhaulMesin;
use App\Models\OverhaulSatuan;
use App\Models\OverhaulSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OverhaulSc2Controller extends Controller
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
    // DASHBOARD TAHUNAN
    // Plan = jumlah kotak Plan yang dicentang per bulan  (garis)
    // Act  = jumlah kotak Act yang dicentang per bulan   (batang)
    // =====================================================

    public function dashboard(Request $request)
    {
        $tahun = (int) $request->input('tahun', now()->year);
        $tahun = max(2000, min(2100, $tahun));

        // Jumlahkan per bulan & item. Mesin yang sudah dihapus (soft delete) tidak ikut.
        $rows = OverhaulSchedule::query()
            ->join(
                'overhaul_mesins',
                'overhaul_mesins.id',
                '=',
                'overhaul_schedules.overhaul_mesin_id'
            )
            ->whereNull('overhaul_mesins.deleted_at')
            ->where('overhaul_schedules.tahun', $tahun)
            ->where('overhaul_schedules.checked', true)
            ->selectRaw('overhaul_schedules.bulan as bulan, overhaul_schedules.item as item, COUNT(*) as total')
            ->groupBy('overhaul_schedules.bulan', 'overhaul_schedules.item')
            ->get();

        // Siapkan Januari - Desember, bulan kosong = 0
        $bulanan = [];

        for ($b = 1; $b <= 12; $b++) {
            $plan = (int) ($rows->first(
                fn ($r) => (int) $r->bulan === $b && $r->item === 'plan'
            )->total ?? 0);

            $act = (int) ($rows->first(
                fn ($r) => (int) $r->bulan === $b && $r->item === 'act'
            )->total ?? 0);

            $bulanan[] = [
                'bulan'      => $b,
                'nama_bulan' => self::NAMA_BULAN[$b],
                'plan'       => $plan,
                'act'        => $act,
            ];
        }

        $totalPlan = array_sum(array_column($bulanan, 'plan'));
        $totalAct  = array_sum(array_column($bulanan, 'act'));

        return Inertia::render('OverhaulSc2/Dashboard', [
            'tahun'         => $tahun,
            'bulanan'       => $bulanan,
            'totalPlan'     => $totalPlan,
            'totalAct'      => $totalAct,
            'persentaseAct' => $totalPlan > 0
                ? round(($totalAct / $totalPlan) * 100, 1)
                : 0,
            'jumlahMesin'   => OverhaulMesin::count(),
        ]);
    }

    // =====================================================
    // SCHEDULE
    // =====================================================

    public function index(Request $request)
    {
        $tahun = (int) $request->input('tahun', now()->year);

        $mesins = OverhaulMesin::with([
            'schedules' => fn ($q) => $q->where('tahun', $tahun),
        ])
            ->orderBy('no')
            ->orderBy('mesin')
            ->orderBy('id')
            ->get();

        return Inertia::render('OverhaulSc2/Index', [
            'mesins'  => $mesins,
            'satuans' => OverhaulSatuan::orderBy('id')->pluck('nama'),
            'tahun'   => $tahun,
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function store(Request $request)
    {
        OverhaulMesin::create($this->payload($request));
        $this->renumber();

        return back()->with('success', 'Data mesin berhasil ditambahkan.');
    }

    public function update(Request $request, OverhaulMesin $overhaulMesin)
    {
        $overhaulMesin->update($this->payload($request));
        $this->renumber();

        return back()->with('success', 'Data mesin berhasil diperbarui.');
    }

    public function destroy(OverhaulMesin $overhaulMesin)
    {
        $overhaulMesin->delete();
        $this->renumber();

        return back()->with('success', 'Data mesin berhasil dihapus.');
    }

    /**
     * Hapus SATU MESIN (grup) beserta semua datanya (SOFT DELETE).
     * Baris hanya diberi deleted_at, jadwalnya tetap utuh sehingga
     * bisa dipulihkan lagi dengan restore().
     */
    public function destroyMesin(Request $request)
    {
        $data = $request->validate([
            'mesin' => 'required|string|max:255',
        ]);

        $jumlah = OverhaulMesin::where('mesin', $data['mesin'])->count();

        if ($jumlah === 0) {
            return back();
        }

        OverhaulMesin::where('mesin', $data['mesin'])->delete();
        $this->renumber();

        return back()->with(
            'success',
            "Mesin {$data['mesin']} beserta {$jumlah} datanya berhasil dihapus."
        );
    }

    /**
     * Hapus satuan dari daftar pilihan.
     * Ditolak kalau masih dipakai oleh data mesin.
     */
    public function destroySatuan(Request $request)
    {
        $data = $request->validate([
            'satuan' => 'required|string|max:50',
        ]);

        $nama = strtolower(trim($data['satuan']));

        $dipakai = OverhaulMesin::whereRaw('LOWER(satuan) = ?', [$nama])->count();

        if ($dipakai > 0) {
            return back()->withErrors([
                'satuan' => "Satuan {$nama} masih dipakai {$dipakai} data, tidak bisa dihapus.",
            ]);
        }

        OverhaulSatuan::where('nama', $nama)->delete();

        return back()->with('success', "Satuan {$nama} berhasil dihapus.");
    }

    /**
     * Simpan checkbox ATAU catatan satu kotak minggu.
     * Hanya field yang dikirim yang diubah.
     */
    public function saveSchedule(Request $request, OverhaulMesin $overhaulMesin)
    {
        $data = $request->validate([
            'item'    => 'required|in:plan,act',
            'tahun'   => 'required|integer|min:2000|max:2100',
            'bulan'   => 'required|integer|min:1|max:12',
            'minggu'  => 'required|integer|min:1|max:4',
            'checked' => 'sometimes|boolean',
            'catatan' => 'sometimes|nullable|string|max:1000',
        ]);

        $key = [
            'overhaul_mesin_id' => $overhaulMesin->id,
            'item'   => $data['item'],
            'tahun'  => $data['tahun'],
            'bulan'  => $data['bulan'],
            'minggu' => $data['minggu'],
        ];

        $schedule = OverhaulSchedule::firstOrNew($key);

        if ($request->has('checked')) {
            $schedule->checked = (bool) $data['checked'];
        }

        if ($request->has('catatan')) {
            $schedule->catatan = $data['catatan'];
        }

        // Kotak kosong (tidak dicentang & tanpa catatan) tidak perlu disimpan
        if (! $schedule->checked && trim((string) $schedule->catatan) === '') {
            if ($schedule->exists) {
                $schedule->delete();
            }

            return back();
        }

        $schedule->save();

        return back()->with('success', 'Jadwal berhasil disimpan.');
    }

    /**
     * Rapikan nomor mesin jadi urut 1, 2, 3, ... tanpa loncat.
     * Mesin yang sama (nama sama) selalu berbagi satu nomor.
     * Dipanggil setelah tambah, ubah, dan hapus data.
     */
    private function renumber(): void
    {
        $urutan = OverhaulMesin::selectRaw('mesin, MIN(no) as min_no, MIN(id) as min_id')
            ->groupBy('mesin')
            ->orderBy('min_no')
            ->orderBy('min_id')
            ->pluck('mesin');

        foreach ($urutan as $i => $mesin) {
            OverhaulMesin::where('mesin', $mesin)
                ->where('no', '!=', $i + 1)
                ->update(['no' => $i + 1]);
        }
    }

    /**
     * Validasi + hitung nomor otomatis.
     * - Mesin sudah ada  -> pakai nomor mesin itu (dan nama penulisan aslinya)
     * - Mesin baru       -> nomor terakhir + 1
     * - Satuan baru      -> otomatis masuk daftar pilihan satuan
     */
    private function payload(Request $request): array
    {
        $data = $request->validate([
            'mesin'       => 'required|string|max:255',
            'nama'        => 'required|string|max:255',
            'total_mesin' => 'required|integer|min:1',
            'standar'     => 'nullable|numeric|min:0',
            'satuan'      => 'nullable|string|max:50',
        ]);

        $data['mesin'] = trim($data['mesin']);

        if (! empty($data['satuan'])) {
            $data['satuan'] = strtolower(trim($data['satuan']));

            // Simpan satuan baru supaya muncul di pilihan berikutnya.
            // withTrashed: nama satuan unik, jadi satuan yang pernah dihapus dipulihkan.
            $satuan = OverhaulSatuan::withTrashed()->firstOrCreate(['nama' => $data['satuan']]);

            if ($satuan->trashed()) {
                $satuan->restore();
            }
        }

        $existing = OverhaulMesin::where('mesin', $data['mesin'])->orderBy('id')->first();

        if ($existing) {
            $data['mesin'] = $existing->mesin;
            $data['no']    = $existing->no;
        } else {
            $data['no'] = ((int) OverhaulMesin::withTrashed()->max('no')) + 1;
        }

        return $data;
    }
}
