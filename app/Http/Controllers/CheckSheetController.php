<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\Divisi;
use App\Models\Line;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CheckSheetWorkbookExport;

class CheckSheetController extends Controller
{
    // =====================================================
    // SCAN BARCODE
    // =====================================================

    public function index()
    {
        return Inertia::render('CheckSheet/Scan');
    }

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

        return redirect()->route('check-sheets.line', $line->kode);
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
            'bbm_kali_60' => ['nullable', 'boolean'],
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
            'bbm_kali_60' => $request->boolean('pakai_bbm') && $request->boolean('bbm_kali_60'),
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
        $validated['bbm_kali_60'] = $request->boolean('pakai_bbm')
        && $request->boolean('bbm_kali_60');

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
                $query->where('line_id', $lineId)
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
            // Actual terakhir SEBELUM tanggal 1 bulan ini, supaya selisih
            // tanggal 1 menyambung ke bulan lalu (khusus checksheet KWH)
            'prevActuals' => $checkSheet->pakai_actual
                ? $this->actualSebelumBulan($checkSheet, $awalBulan, $lineId)
                : (object) [],
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
            'status'  => ['required', 'boolean'],
            // kolom mana yang diubah: Act (status) atau Plan
            'kolom'   => ['nullable', 'in:status,plan'],
        ]);

        $item = $checkSheet->items()
            ->where('id', $validated['check_sheet_item_id'])
            ->firstOrFail();

        $line  = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);
        $kolom = $validated['kolom'] ?? 'status';

        $item->checklists()->updateOrCreate(
            [
                'line_id' => $line?->id,
                'tanggal' => $validated['tanggal'],
            ],
            [$kolom => $validated['status']]
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

    public function storeAbnormality(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'line_id' => ['nullable', 'integer'],
            'tanggal' => ['required', 'date'],
            'abnormality' => ['required', 'string'],
            'countermeasure' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:255'],
            'pic' => ['nullable', 'string', 'max:255'],
        ]);

        $line = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);

        unset($validated['line_id']);

        $checkSheet->abnormalities()->create($validated + [
            'line_id' => $line?->id,
        ]);

        // Arahkan ke bulan sesuai tanggal abnormality, supaya langsung terlihat
        return $this->redirectKePeriode($checkSheet, $validated['tanggal'], $line?->id)
            ->with('success', 'Abnormality berhasil ditambahkan.');
    }

    public function updateAbnormality(
        Request $request,
        CheckSheet $checkSheet,
        int $abnormality
    ) {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'abnormality' => ['required', 'string'],
            'countermeasure' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:255'],
            'pic' => ['nullable', 'string', 'max:255'],
        ]);

        $checkSheetAbnormality = $checkSheet->abnormalities()
            ->where('id', $abnormality)
            ->firstOrFail();

        $checkSheetAbnormality->update($validated);

        // line tidak berubah saat edit
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
