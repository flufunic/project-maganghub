<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\Divisi;
use App\Models\Line;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CheckSheetWorkbookExport;
use App\Models\PreventifMesin;

class CheckSheetController extends Controller
{
    // Divisi yang ditampilkan di grafik dashboard
    // (harus sama persis dengan divisis.nama_divisi)
    private const DASHBOARD_DIVISI = ['Headrest', 'Saidan', 'Utility'];

    private const DASHBOARD_BULAN = [
        1  => 'Jan', 2  => 'Feb', 3  => 'Mar', 4  => 'Apr',
        5  => 'Mei', 6  => 'Jun', 7  => 'Jul', 8  => 'Agu',
        9  => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    // =====================================================
    // DASHBOARD CHECK SHEET (tahunan, Januari - Desember)
    // Route publik: GET /check-sheet-dashboard
    //
    // 3 grafik per divisi (Headrest, Saidan, Utility):
    //   1. Jumlah centang   = checklist yang sudah diisi (status = 1)
    //   2. Persentase isi   = centang / (item x hari x line) x 100
    //   3. Jumlah abnormality yang tercatat
    // =====================================================

    public function dashboard(Request $request): Response
    {
        $tahun = (int) ($request->tahun ?: now()->year);
        $tahun = max(2020, min(2040, $tahun));

        $awal  = "{$tahun}-01-01";
        $akhir = "{$tahun}-12-31";

        $divisiList = self::DASHBOARD_DIVISI;

        // ---------- 1. JUMLAH CENTANG ----------
        $centangRows = DB::table('check_sheet_checklists as c')
            ->join('check_sheet_items as i', 'i.id', '=', 'c.check_sheet_item_id')
            ->join('check_sheets as s', 's.id', '=', 'i.check_sheet_id')
            ->join('divisis as d', 'd.id', '=', 's.divisi_id')
            ->whereNull('i.deleted_at')
            ->whereNull('s.deleted_at')
            ->where('c.status', 1)
            ->whereBetween('c.tanggal', [$awal, $akhir])
            ->whereIn('d.nama_divisi', $divisiList)
            ->selectRaw('MONTH(c.tanggal) as bulan, d.nama_divisi as divisi, COUNT(*) as jumlah')
            ->groupBy(DB::raw('MONTH(c.tanggal)'), 'd.nama_divisi')
            ->get();

        // ---------- 3. JUMLAH ABNORMALITY ----------
        $abnormalRows = DB::table('check_sheet_abnormalities as a')
            ->join('check_sheets as s', 's.id', '=', 'a.check_sheet_id')
            ->join('divisis as d', 'd.id', '=', 's.divisi_id')
            ->whereNull('a.deleted_at')
            ->whereNull('s.deleted_at')
            ->whereBetween('a.tanggal', [$awal, $akhir])
            ->whereIn('d.nama_divisi', $divisiList)
            ->selectRaw('MONTH(a.tanggal) as bulan, d.nama_divisi as divisi, COUNT(*) as jumlah')
            ->groupBy(DB::raw('MONTH(a.tanggal)'), 'd.nama_divisi')
            ->get();

        // ---------- 2. TARGET ISI (untuk persentase) ----------
        // Target per hari per divisi = jumlah item x jumlah line yang memakai check sheet itu.
        // - Check sheet milik mesin (line_id terisi)  -> 1 line
        // - Check sheet divisi (Headrest)             -> semua line divisi yang bukan per mesin
        $jumlahLineDivisi = DB::table('lines')
            ->where('per_mesin', false)
            ->selectRaw('divisi_id, COUNT(*) as jumlah')
            ->groupBy('divisi_id')
            ->pluck('jumlah', 'divisi_id');

        $sheets = DB::table('check_sheets as s')
            ->join('divisis as d', 'd.id', '=', 's.divisi_id')
            ->leftJoin('check_sheet_items as i', function ($join) {
                $join->on('i.check_sheet_id', '=', 's.id')->whereNull('i.deleted_at');
            })
            ->whereNull('s.deleted_at')
            ->whereIn('d.nama_divisi', $divisiList)
            ->selectRaw('s.id, s.divisi_id, s.line_id, d.nama_divisi as divisi, COUNT(i.id) as jumlah_item')
            ->groupBy('s.id', 's.divisi_id', 's.line_id', 'd.nama_divisi')
            ->get();

        $targetPerHari = array_fill_keys($divisiList, 0);

        foreach ($sheets as $sheet) {
            $line = $sheet->line_id
                ? 1
                : max(1, (int) ($jumlahLineDivisi[$sheet->divisi_id] ?? 1));

            $targetPerHari[$sheet->divisi] += (int) $sheet->jumlah_item * $line;
        }

        // ---------- SUSUN 12 BULAN ----------
        $laporan = [];

        foreach (self::DASHBOARD_BULAN as $no => $nama) {
            $laporan[$no] = [
                'bulan'       => $no,
                'nama_bulan'  => $nama,
                'centang'     => array_fill_keys($divisiList, 0),
                'persen'      => array_fill_keys($divisiList, null),
                'abnormality' => array_fill_keys($divisiList, 0),
            ];
        }

        $total = [];

        foreach ($divisiList as $divisi) {
            $total[$divisi] = [
                'centang'     => 0,
                'target'      => 0,
                'persen'      => null,
                'abnormality' => 0,
            ];
        }

        foreach ($centangRows as $row) {
            $laporan[(int) $row->bulan]['centang'][$row->divisi] = (int) $row->jumlah;
            $total[$row->divisi]['centang'] += (int) $row->jumlah;
        }

        foreach ($abnormalRows as $row) {
            $laporan[(int) $row->bulan]['abnormality'][$row->divisi] = (int) $row->jumlah;
            $total[$row->divisi]['abnormality'] += (int) $row->jumlah;
        }

        // Hari yang dihitung: bulan lampau penuh, bulan berjalan sampai hari ini,
        // bulan yang belum datang = 0 (persen kosong).
        $hariIni = now();

        foreach ($laporan as $no => $bulanData) {
            $tanggalAwal = Carbon::create($tahun, $no, 1);

            if ($tanggalAwal->isAfter($hariIni)) {
                $hari = 0;
            } elseif ($tanggalAwal->isSameMonth($hariIni)) {
                $hari = $hariIni->day;
            } else {
                $hari = $tanggalAwal->daysInMonth;
            }

            foreach ($divisiList as $divisi) {
                $target = $targetPerHari[$divisi] * $hari;

                if ($target > 0) {
                    $persen = min(100, round($bulanData['centang'][$divisi] / $target * 100, 1));
                    $laporan[$no]['persen'][$divisi] = $persen;
                    $total[$divisi]['target'] += $target;
                }
            }
        }

        foreach ($divisiList as $divisi) {
            if ($total[$divisi]['target'] > 0) {
                $total[$divisi]['persen'] = min(
                    100,
                    round($total[$divisi]['centang'] / $total[$divisi]['target'] * 100, 1)
                );
            }
        }

        return Inertia::render('CheckSheet/Dashboard', [
            'tahun'   => $tahun,
            'divisi'  => $divisiList,
            'laporan' => array_values($laporan),
            'total'   => $total,
        ]);
    }

    // =====================================================
    // SCAN BARCODE
    // =====================================================

    public function index()
    {
        return Inertia::render('CheckSheet/Scan');
    }

    // Dipakai form manual & scanner di web (POST)
    public function resolve(Request $request)
    {
        $data = $request->validate([
            'kode' => ['required', 'string', 'max:100'],
        ]);

        $line = Line::where('kode', strtoupper(trim($data['kode'])))->first();

        if (! $line) {
            return back()->withErrors([
                'kode' => 'Barcode tidak dikenali. Pastikan barcode mesin yang benar.',
            ]);
        }

        $this->bukaAkses($line);

        return redirect()->route('check-sheets.line', $line->kode);
    }

    // Dipakai kamera bawaan HP (GET, QR berisi URL /s/{kode})
    public function unlock(string $kode)
    {
        $line = Line::where('kode', strtoupper(trim($kode)))->first();

        if (! $line) {
            return redirect()->route('check-sheets.index')
                ->withErrors(['kode' => 'Barcode tidak dikenali.']);
        }

        $this->bukaAkses($line);

        return redirect()->route('check-sheets.line', $line->kode);
    }

    // Izin akses mesin ini berlaku 8 jam (1 shift)
    private function bukaAkses(Line $line): void
    {
        $akses = session('line_akses', []);
        $akses[$line->kode] = now()->addHours(8)->timestamp;

        session([
            'line_akses' => $akses,
            'last_line'  => $line->kode,
        ]);
    }

    // Daftar check sheet dari barcode yang di-scan
    public function byLine(string $kode)
    {
        $line = Line::with('divisi')->where('kode', $kode)->firstOrFail();

        session(['last_line' => $line->kode]);

        $query = CheckSheet::with('divisi')->orderBy('id');

        if ($line->per_mesin) {
            // Utility / Saidan: hanya check sheet milik mesin ini
            $query->where('line_id', $line->id);
        } else {
            // Headrest: semua check sheet divisi (yang bukan milik mesin tertentu)
            $query->where('divisi_id', $line->divisi_id)->whereNull('line_id');
        }

        return Inertia::render('CheckSheet/Index', [
            'line'        => $line,
            'checkSheets' => $query->get(),
        ]);
    }

    public function barcodes()
    {
        return Inertia::render('CheckSheet/Barcodes', [
            'lines' => Line::with('divisi')->orderBy('divisi_id')->orderBy('id')->get(),
        ]);
    }

    // =====================================================
    // HELPER LINE
    // =====================================================

    /**
     * Line terakhir yang di-scan. Kalau $divisiId tidak cocok dengan
     * divisi line tersebut, pakai line pertama milik divisi itu.
     */
    private function lineAktif(?int $divisiId = null): ?Line
    {
        $kode = session('last_line');

        $line = $kode
            ? Line::with('divisi')->where('kode', $kode)->first()
            : null;

        if ($line && (! $divisiId || (int) $line->divisi_id === $divisiId)) {
            return $line;
        }

        if ($divisiId) {
            return Line::with('divisi')
                ->where('divisi_id', $divisiId)
                ->orderBy('id')
                ->first();
        }

        return $line;
    }

    /**
     * Line yang berlaku untuk sebuah check sheet.
     * - Check sheet milik mesin  -> selalu mesinnya.
     * - Check sheet Headrest     -> $lineId kalau valid (line satu divisi, bukan per mesin),
     *                               kalau tidak, line terakhir yang di-scan.
     */
    private function lineUntuk(CheckSheet $checkSheet, ?int $lineId = null): ?Line
    {
        if ($checkSheet->line_id) {
            return Line::with('divisi')->find($checkSheet->line_id);
        }

        if ($lineId) {
            $line = Line::with('divisi')
                ->where('id', $lineId)
                ->where('divisi_id', $checkSheet->divisi_id)
                ->where('per_mesin', false)
                ->first();

            if ($line) {
                return $line;
            }
        }

        return $this->lineAktif((int) $checkSheet->divisi_id);
    }

    private function kembaliKeDaftar(?Line $line, string $pesan)
    {
        $redirect = $line
            ? redirect()->route('check-sheets.line', $line->kode)
            : redirect()->route('check-sheets.index');

        return $redirect->with('success', $pesan);
    }

    /**
     * Divisi yang punya barcode per mesin (Utility / Saidan) WAJIB memilih mesin,
     * dan mesin itu harus milik divisinya. Divisi lain (Headrest) selalu NULL.
     */
    private function tentukanLineId(int $divisiId, int|string|null $lineId): ?int
    {
        $adaPerMesin = Line::where('divisi_id', $divisiId)
            ->where('per_mesin', true)
            ->exists();

        if (! $adaPerMesin) {
            return null;
        }

        if (! $lineId) {
            throw ValidationException::withMessages([
                'line_id' => 'Pilih mesin untuk check sheet ini.',
            ]);
        }

        $valid = Line::where('id', $lineId)
            ->where('divisi_id', $divisiId)
            ->where('per_mesin', true)
            ->exists();

        if (! $valid) {
            throw ValidationException::withMessages([
                'line_id' => 'Mesin tidak sesuai dengan divisi yang dipilih.',
            ]);
        }

        return (int) $lineId;
    }

    private function daftarMesin()
    {
        return Line::where('per_mesin', true)
            ->orderBy('divisi_id')
            ->orderBy('nama_line')
            ->get(['id', 'divisi_id', 'nama_line', 'kode']);
    }

    // =====================================================
    // CRUD CHECK SHEET
    // =====================================================

    public function create()
    {
        return Inertia::render('CheckSheet/Create', [
            'divisis' => Divisi::orderBy('nama_divisi')->get(),
            'mesins'  => $this->daftarMesin(),
            'line'    => $this->lineAktif(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'divisi_id'        => ['required', 'exists:divisis,id'],
            'line_id'          => ['nullable', 'exists:lines,id'],
            'nomor_dokumen'    => ['required', 'string', 'max:255'],
            'nama_checksheet'  => ['required', 'string', 'max:255'],
            'pakai_actual'     => ['nullable', 'boolean'],
            'pakai_plan_act'   => ['nullable', 'boolean'],
            'pakai_monitoring' => ['nullable', 'boolean'],
            'pakai_bbm'        => ['nullable', 'boolean'],
            'bbm_kali_60'      => ['nullable', 'boolean'],
        ]);

        $lineId = $this->tentukanLineId(
            (int) $validated['divisi_id'],
            $validated['line_id'] ?? null
        );

        CheckSheet::create([
            'divisi_id'        => $validated['divisi_id'],
            'line_id'          => $lineId,
            'nomor_dokumen'    => $validated['nomor_dokumen'],
            'nama_checksheet'  => $validated['nama_checksheet'],
            'pakai_actual'     => $request->boolean('pakai_actual'),
            'pakai_plan_act'   => $request->boolean('pakai_plan_act'),
            'pakai_monitoring' => $request->boolean('pakai_monitoring'),
            // BBM hanya masuk akal kalau monitoring aktif
            'pakai_bbm'        => $request->boolean('pakai_monitoring') && $request->boolean('pakai_bbm'),
            'bbm_kali_60'      => $request->boolean('pakai_bbm') && $request->boolean('bbm_kali_60'),
        ]);

        $line = $lineId
            ? Line::with('divisi')->find($lineId)
            : $this->lineAktif((int) $validated['divisi_id']);

        return $this->kembaliKeDaftar($line, 'Check Sheet berhasil ditambahkan.');
    }

    public function edit(CheckSheet $checkSheet)
    {
        return Inertia::render('CheckSheet/Edit', [
            'checkSheet' => $checkSheet,
            'divisis'    => Divisi::orderBy('nama_divisi')->get(),
            'mesins'     => $this->daftarMesin(),
            'line'       => $this->lineUntuk($checkSheet),
        ]);
    }

    public function update(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'divisi_id'        => ['required', 'exists:divisis,id'],
            'line_id'          => ['nullable', 'exists:lines,id'],
            'nomor_dokumen'    => ['required', 'string', 'max:255'],
            'nama_checksheet'  => ['required', 'string', 'max:255'],
            'pakai_actual'     => ['nullable', 'boolean'],
            'pakai_plan_act'   => ['nullable', 'boolean'],
            'pakai_monitoring' => ['nullable', 'boolean'],
            'pakai_bbm'        => ['nullable', 'boolean'],
        ]);

        // check sheet milik mesin tidak boleh pindah divisi
        if ($checkSheet->line_id) {
            $validated['divisi_id'] = $checkSheet->divisi_id;
        }

        $validated['line_id'] = $this->tentukanLineId(
            (int) $validated['divisi_id'],
            $validated['line_id'] ?? null
        );

        // checkbox yang tidak dicentang = false (bukan "tidak diubah")
        $validated['pakai_actual']     = $request->boolean('pakai_actual');
        $validated['pakai_plan_act']   = $request->boolean('pakai_plan_act');
        $validated['pakai_monitoring'] = $request->boolean('pakai_monitoring');
        $validated['pakai_bbm']        = $request->boolean('pakai_monitoring') && $request->boolean('pakai_bbm');
        $validated['bbm_kali_60']      = $request->boolean('pakai_bbm') && $request->boolean('bbm_kali_60');

        $checkSheet->update($validated);

        return $this->kembaliKeDaftar(
            $this->lineUntuk($checkSheet->fresh()),
            'Check Sheet berhasil diperbarui.'
        );
    }

    public function destroy(CheckSheet $checkSheet)
    {
        // tentukan tujuan kembali SEBELUM data dihapus
        $line = $this->lineUntuk($checkSheet);

        $checkSheet->delete();

        return $this->kembaliKeDaftar($line, 'Check Sheet berhasil dihapus.');
    }

    // =====================================================
    // HALAMAN CHECK SHEET (per line / mesin)
    // =====================================================

    public function show(Request $request, CheckSheet $checkSheet): Response
    {
        $checkSheet->susunUlangNomorItem();

        $bulan = (int) ($request->bulan ?? now()->month);
        $tahun = (int) ($request->tahun ?? now()->year);

        // Line yang sedang dilihat (Headrest bisa lewat ?line_id=, kalau tidak pakai session)
        $line   = $this->lineUntuk($checkSheet, $request->integer('line_id') ?: null);
        $lineId = $line?->id;

        if ($line) {
            session(['last_line' => $line->kode]);
        }

        $tanggalAwal = Carbon::create($tahun, $bulan, 1);
        $jumlahHari = $tanggalAwal->daysInMonth;

        $awalBulan = $tanggalAwal->copy()->startOfMonth();
        $akhirBulan = $tanggalAwal->copy()->endOfMonth();

        $checkSheet->load([
            'divisi',

            'items' => function ($query) {
                $query->orderBy('shift')->orderBy('no')->orderBy('id');
            },

            // centang / nilai HANYA milik line ini
            'items.checklists' => function ($query) use ($awalBulan, $akhirBulan, $lineId) {
                $query->where('line_id', $lineId)
                    ->whereBetween('tanggal', [
                        $awalBulan->toDateString(),
                        $akhirBulan->toDateString(),
                    ]);
            },

            // abnormality HANYA milik line ini
            'abnormalities' => function ($query) use ($awalBulan, $akhirBulan, $lineId) {
                $query->with('preventifMesins')
                    ->where('line_id', $lineId)
                    ->whereBetween('tanggal', [
                        $awalBulan->toDateString(),
                        $akhirBulan->toDateString(),
                    ])
                    ->orderBy('tanggal')
                    ->orderBy('id');
            },
            'monitoringItems' => function ($query) {
                $query->orderBy('no')->orderBy('id');
            },

            // hanya data bulan & tahun yang dilihat
            'monitoringItems.weeks' => function ($query) use ($bulan, $tahun) {
                $query->where('bulan', $bulan)->where('tahun', $tahun);
            },

            // item BBM + running hours-nya sendiri (bulan & tahun yang dilihat)
            'bbmItems' => function ($query) {
                $query->orderBy('no')->orderBy('id');
            },
            'bbmItems.weeks' => function ($query) use ($bulan, $tahun) {
                $query->where('bulan', $bulan)->where('tahun', $tahun);
            },
        ]);

        $tanggal = [];

        for ($i = 1; $i <= $jumlahHari; $i++) {
            $tanggal[] = [
                'tanggal' => $i,
                'tanggal_lengkap' => Carbon::create($tahun, $bulan, $i)->format('Y-m-d'),
            ];
        }

        return Inertia::render('CheckSheet/Show', [
            'checkSheet'  => $checkSheet,
            'bulan'       => $bulan,
            'tahun'       => $tahun,
            'tanggal'     => $tanggal,
            'line'        => $line,
            'prevActuals' => $checkSheet->pakai_actual
                ? $this->actualSebelumBulan($checkSheet, $awalBulan, $lineId)
                : (object) [],

            // pilihan item preventif untuk form abnormality
            'preventifOptions' => PreventifMesin::where('is_hidden', false)
                ->orderBy('divisi')
                ->orderBy('no_item')
                ->get(['no', 'divisi', 'no_item', 'item_preventif']),
        ]);
    }

    /**
     * Actual terakhir (yang terisi) sebelum $awalBulan, per item.
     * Hasil: [item_id => actual|null]
     */
    private function actualSebelumBulan(CheckSheet $checkSheet, Carbon $awalBulan, ?int $lineId): array
    {
        $hasil = [];

        foreach ($checkSheet->items as $item) {
            $hasil[$item->id] = $item->checklists()
                ->where('line_id', $lineId)
                ->where('tanggal', '<', $awalBulan->toDateString())
                ->whereNotNull('actual')
                ->orderByDesc('tanggal')
                ->value('actual');
        }

        return $hasil;
    }

    // =====================================================
    // ITEM (Inspection Point dipakai bersama oleh semua line)
    // =====================================================

    public function storeItem(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'inspection_point' => ['required', 'string'],
            'condition' => ['nullable', 'string'],
            'method' => ['nullable', 'string'],
            'shift' => ['required', 'in:A,B'],
        ]);

        $validated['no'] = $this->nomorBerikutnya($checkSheet, $validated['shift']);

        $checkSheet->items()->create($validated);

        $checkSheet->susunUlangNomorItem();

        return redirect()
            ->route('check-sheets.show', [
                'check_sheet' => $checkSheet->id,
                'line_id'     => $this->lineUntuk($checkSheet)?->id,
            ])
            ->with('success', 'Item pemeriksaan berhasil ditambahkan.');
    }

    public function updateItem(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'inspection_point' => ['required', 'string'],
            'condition' => ['nullable', 'string'],
            'method' => ['nullable', 'string'],
            'shift' => ['required', 'in:A,B'],
        ]);

        $checkSheetItem = $checkSheet->items()
            ->where('id', $item)
            ->firstOrFail();

        if ($checkSheetItem->shift !== $validated['shift']) {
            $validated['no'] = $this->nomorBerikutnya($checkSheet, $validated['shift']);
        }

        $checkSheetItem->update($validated);

        $checkSheet->susunUlangNomorItem();

        return back()->with('success', 'Inspection Point berhasil diperbarui.');
    }

    public function destroyItem(CheckSheet $checkSheet, int $item)
    {
        $checkSheetItem = $checkSheet->items()
            ->where('id', $item)
            ->firstOrFail();

        $checkSheetItem->delete();

        $checkSheet->susunUlangNomorItem();

        return back()->with('success', 'Inspection Point berhasil dihapus.');
    }

    // =====================================================
    // CHECKLIST (per line)
    // =====================================================

    public function storeChecklist(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'check_sheet_item_id' => ['required', 'exists:check_sheet_items,id'],
            'line_id' => ['nullable', 'integer'],
            'tanggal' => ['required', 'date'],
            'status'  => ['nullable', 'boolean'],
            // kolom mana yang diubah: Act (status) atau Plan
            'kolom'   => ['nullable', 'in:status,plan'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $item = $checkSheet->items()
            ->where('id', $validated['check_sheet_item_id'])
            ->firstOrFail();

        $line  = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);
        $kolom = $validated['kolom'] ?? 'status';

        $values = [];

        if (array_key_exists('status', $validated) && $validated['status'] !== null) {
            $values[$kolom] = $validated['status'];
        }

        // has() supaya catatan bisa dikosongkan (null) tanpa mengubah centang
        if ($request->has('catatan')) {
            $values[$kolom === 'plan' ? 'catatan_plan' : 'catatan'] = $validated['catatan'] ?? null;
        }

        $item->checklists()->updateOrCreate(
            [
                'line_id' => $line?->id,
                'tanggal' => $validated['tanggal'],
            ],
            $values
        );

        return back();
    }

    // =====================================================
    // NILAI ACTUAL / CATATAN (khusus KWH, per line)
    // Actual = input manual. Selisih TIDAK disimpan: dihitung
    // otomatis di tampilan (actual ini - actual sebelumnya).
    // =====================================================

    public function storeNilai(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'check_sheet_item_id' => ['required', 'exists:check_sheet_items,id'],
            'line_id' => ['nullable', 'integer'],
            'tanggal' => ['required', 'date'],
            'actual'  => ['nullable', 'numeric'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $item = $checkSheet->items()
            ->where('id', $validated['check_sheet_item_id'])
            ->firstOrFail();

        $line = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);

        $item->checklists()->updateOrCreate(
            [
                'line_id' => $line?->id,
                'tanggal' => $validated['tanggal'],
            ],
            [
                'actual'  => $validated['actual'] ?? null,
                'catatan' => $validated['catatan'] ?? null,
                // dianggap terisi kalau actual diisi
                'status'  => isset($validated['actual']),
            ]
        );

        return back();
    }

    // =====================================================
    // ABNORMALITY (per line)
    // =====================================================

    /**
     * Aturan validasi bersama (add & edit).
     * preventif_mesin_ids = BOLEH LEBIH DARI SATU item preventif.
     */
    private function aturanAbnormality(): array
    {
        return [
            'preventif_mesin_ids'   => ['nullable', 'array'],
            'preventif_mesin_ids.*' => ['integer', 'distinct', 'exists:preventif_mesins,no'],
            'tanggal'               => ['required', 'date'],
            'abnormality'           => ['required', 'string'],
            'countermeasure'        => ['nullable', 'string'],
            'status'                => ['required', 'string', 'max:255'],
            'pic'                   => ['nullable', 'string', 'max:255'],
        ];
    }

    public function storeAbnormality(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate(
            $this->aturanAbnormality() + [
                'line_id' => ['nullable', 'integer'],
            ]
        );

        $line = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);

        $preventifIds = collect($validated['preventif_mesin_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        unset($validated['line_id'], $validated['preventif_mesin_ids']);

        $abnormality = $checkSheet->abnormalities()->create($validated + [
            'line_id' => $line?->id,
        ]);

        $abnormality->preventifMesins()->sync($preventifIds);

        return $this->redirectKePeriode($checkSheet, $validated['tanggal'], $line?->id)
            ->with('success', 'Abnormality berhasil ditambahkan.');
    }

    public function updateAbnormality(
        Request $request,
        CheckSheet $checkSheet,
        int $abnormality
    ) {
        $validated = $request->validate($this->aturanAbnormality());

        $checkSheetAbnormality = $checkSheet->abnormalities()
            ->where('id', $abnormality)
            ->firstOrFail();

        $preventifIds = collect($validated['preventif_mesin_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        unset($validated['preventif_mesin_ids']);

        $checkSheetAbnormality->update($validated);

        // sync: yang tidak dicentang lagi otomatis dilepas
        $checkSheetAbnormality->preventifMesins()->sync($preventifIds);

        return $this->redirectKePeriode(
            $checkSheet,
            $validated['tanggal'],
            $checkSheetAbnormality->line_id
        )->with('success', 'Abnormality berhasil diperbarui.');
    }

    public function destroyAbnormality(CheckSheet $checkSheet, int $abnormality)
    {
        $checkSheetAbnormality = $checkSheet->abnormalities()
            ->where('id', $abnormality)
            ->firstOrFail();

        // soft delete: otomatis tidak lagi muncul di notifikasi preventif
        $checkSheetAbnormality->delete();

        return back()->with('success', 'Abnormality berhasil dihapus.');
    }

    // =====================================================
    // LAIN-LAIN
    // =====================================================

    private function redirectKePeriode(CheckSheet $checkSheet, string $tanggal, ?int $lineId = null)
    {
        $date = Carbon::parse($tanggal);

        return redirect()->route('check-sheets.show', [
            'check_sheet' => $checkSheet->id,
            'bulan' => $date->month,
            'tahun' => $date->year,
            'line_id' => $lineId,
        ]);
    }

    private function nomorBerikutnya(CheckSheet $checkSheet, string $shift): int
    {
        return ((int) $checkSheet->items()
            ->where('shift', $shift)
            ->max('no')) + 1;
    }

    public function exportExcel(Request $request, CheckSheet $checkSheet)
    {
        // Pastikan nomor di database sudah berurutan sebelum diexport
        $checkSheet->susunUlangNomorItem();

        $bulan = (int) ($request->bulan ?: now()->month);
        $tahun = (int) ($request->tahun ?: now()->year);

        // Line / mesin yang sedang dilihat user
        $line = $this->lineUntuk($checkSheet, $request->integer('line_id') ?: null);

        $namaFile = 'check-sheet-' . $checkSheet->id
            . ($line ? '-' . Str::slug($line->nama_line) : '')
            . '-' . $bulan . '-' . $tahun . '.xlsx';

        return Excel::download(
            new CheckSheetWorkbookExport(
                $checkSheet->id,
                $bulan,
                $tahun,
                $line?->id
            ),
            $namaFile
        );
    }
}
