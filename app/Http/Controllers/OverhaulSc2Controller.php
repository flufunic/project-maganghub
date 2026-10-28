<?php

namespace App\Http\Controllers;

use App\Exports\OverhaulSc2Export;
use App\Models\OverhaulDokumen;
use App\Models\OverhaulMesin;
use App\Models\OverhaulSatuan;
use App\Models\OverhaulSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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

    // Aturan validasi dokumen. max dalam KB: 102400 KB = 100 MB
    private const ATURAN_DOKUMEN = 'file|max:102400|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png';

    // Maksimal jumlah file per sekali upload
    private const MAKS_FILE = 5;

    // Tipe file yang tampil langsung di browser (lainnya otomatis diunduh)
    private const MIME_INLINE = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    private const DISK_DOKUMEN = 'local';

    // =====================================================
    // DASHBOARD TAHUNAN
    // Plan = jumlah kotak Plan yang dicentang per bulan  (garis)
    // Act  = jumlah kotak Act yang dicentang per bulan   (batang)
    // =====================================================

    public function dashboard(Request $request)
    {
        $tahun = (int) $request->input('tahun', now()->year);
        $tahun = max(2000, min(2100, $tahun));

        // Mesin yang sudah dihapus (soft delete) tidak ikut dihitung.
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
            'dokumens'  => fn ($q) => $q->where('tahun', $tahun)->orderBy('id'),
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
        $mesin = OverhaulMesin::create($this->payload($request));
        $this->simpanDokumen($request, $mesin);
        $this->renumber();

        return back()->with('success', 'Data mesin berhasil ditambahkan.');
    }

    public function update(Request $request, OverhaulMesin $overhaulMesin)
    {
        $overhaulMesin->update($this->payload($request));
        $this->simpanDokumen($request, $overhaulMesin);
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
     * Baris hanya diberi deleted_at, jadwal dan dokumennya tetap utuh
     * sehingga bisa dipulihkan lagi dengan restore().
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

    // =====================================================
    // DOKUMEN
    // File disimpan di disk privat (storage/app/private atau storage/app,
    // tergantung config/filesystems.php) folder overhaul-dokumen/{id_mesin},
    // jadi hanya bisa dibuka lewat route yang dilindungi login.
    // =====================================================

    /** Pesan error validasi dokumen (bahasa Indonesia). */
    private function pesanDokumen(): array
    {
        return [
            'dokumen.required'   => 'Pilih minimal satu file.',
            'dokumen.max'        => 'Maksimal ' . self::MAKS_FILE . ' file sekali unggah.',
            'dokumen.*.max'      => 'Ukuran tiap file maksimal 100 MB.',
            'dokumen.*.mimes'    => 'Format file harus PDF, Word, Excel, PowerPoint, JPG, atau PNG.',
            'dokumen.*.file'     => 'File tidak valid.',
            'dokumen.*.uploaded' => 'Upload gagal. Ukuran file melebihi batas server (maks 100 MB).',
        ];
    }

    /**
     * Simpan semua file dari field "dokumen" milik request ke satu data mesin.
     * Aman dipanggil walau tidak ada file yang dikirim.
     */
    private function simpanDokumen(Request $request, OverhaulMesin $mesin): void
    {
        $tahun = max(2000, min(2100, (int) $request->input('tahun', now()->year)));

        foreach ($request->file('dokumen', []) as $file) {
            $path = $file->store(
                "overhaul-dokumen/{$mesin->id}/{$tahun}",
                self::DISK_DOKUMEN
            );

            $mesin->dokumens()->create([
                'tahun'     => $tahun,
                'nama_asli' => $file->getClientOriginalName(),
                'path'      => $path,
                // MIME dibaca dari isi file di server, bukan dari klien
                'mime'      => $file->getMimeType() ?: 'application/octet-stream',
                'ukuran'    => $file->getSize(),
            ]);
        }
    }

    /** Tambah dokumen ke data mesin yang sudah ada (dari modal Dokumen di index). */
    public function uploadDokumen(Request $request, OverhaulMesin $overhaulMesin)
    {
        $request->validate([
            'tahun'     => 'required|integer|min:2000|max:2100',
            'dokumen'   => 'required|array|min:1|max:' . self::MAKS_FILE,
            'dokumen.*' => self::ATURAN_DOKUMEN,
        ], $this->pesanDokumen());

        $this->simpanDokumen($request, $overhaulMesin);

        return back()->with('success', 'Dokumen berhasil diunggah.');
    }

    /** PDF & gambar tampil di tab browser; Word/Excel/PPT langsung diunduh. */
    public function lihatDokumen(OverhaulDokumen $dokumen)
    {
        $disk = Storage::disk(self::DISK_DOKUMEN);

        abort_unless($disk->exists($dokumen->path), 404, 'File tidak ditemukan.');

        $bisaInline = in_array($dokumen->mime, self::MIME_INLINE, true);

        $headers = [
            'Content-Type'           => $dokumen->mime ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ];

        if (! $bisaInline) {
            return response()->download($disk->path($dokumen->path), $dokumen->nama_asli, $headers);
        }

        return response()->file($disk->path($dokumen->path), $headers);
    }

    /** Unduh dokumen dengan nama aslinya. */
    public function downloadDokumen(OverhaulDokumen $dokumen)
    {
        $disk = Storage::disk(self::DISK_DOKUMEN);

        abort_unless($disk->exists($dokumen->path), 404, 'File tidak ditemukan.');

        return response()->download(
            $disk->path($dokumen->path),
            $dokumen->nama_asli,
            ['Content-Type' => $dokumen->mime ?: 'application/octet-stream']
        );
    }

    /** Hapus satu dokumen (file fisik + barisnya di database). */
    public function hapusDokumen(OverhaulDokumen $dokumen)
    {
        Storage::disk(self::DISK_DOKUMEN)->delete($dokumen->path);
        $dokumen->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    // =====================================================
    // HELPER
    // =====================================================

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
     * - Dokumen          -> divalidasi di sini, tapi disimpan terpisah oleh simpanDokumen()
     */
    private function payload(Request $request): array
    {
        $data = $request->validate([
            'mesin'       => 'required|string|max:255',
            'nama'        => 'required|string|max:255',
            'total_mesin' => 'required|integer|min:1',
            'standar'     => 'nullable|numeric|min:0',
            'satuan'      => 'nullable|string|max:50',
            'dokumen'     => 'nullable|array|max:' . self::MAKS_FILE,
            'dokumen.*'   => self::ATURAN_DOKUMEN,
        ], $this->pesanDokumen());

        // File bukan kolom tabel overhaul_mesins, jangan ikut create()/update()
        unset($data['dokumen']);

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

    // =====================================================
    // EXPORT
    // =====================================================

    public function exportExcel(Request $request)
    {
        $data = $request->validate([
            'tahun' => 'required|integer|min:2000|max:2100',
        ]);

        $tahun = (int) $data['tahun'];

        return Excel::download(
            new OverhaulSc2Export($tahun),
            "Schedule_Overhaul_SC2_{$tahun}.xlsx"
        );
    }
}