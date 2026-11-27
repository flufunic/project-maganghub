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
use App\Models\CheckSheetAbnormality;

class CheckSheetController extends Controller
{
    private const DASHBOARD_BULAN = [
        1  => 'Jan', 2  => 'Feb', 3  => 'Mar', 4  => 'Apr',
        5  => 'Mei', 6  => 'Jun', 7  => 'Jul', 8  => 'Agu',
        9  => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    // Halaman kelola check sheet sekarang ada di Master Data
    private const URL_MASTER = '/master/divisi';

    // =====================================================
    // DATA DASHBOARD CHECK SHEET (tahunan, Januari - Desember)
    // =====================================================

    public function dashboardData(int $tahun): array
    {
        $tahun = max(2020, min(2040, $tahun));

        $awal  = "{$tahun}-01-01";
        $akhir = "{$tahun}-12-31";

        $divisiList = DB::table('divisis as d')
            ->whereExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('check_sheets as s')
                    ->whereColumn('s.divisi_id', 'd.id')
                    ->whereNull('s.deleted_at');
            })
            ->orderBy('d.id')
            ->pluck('d.nama_divisi')
            ->all();

        if (empty($divisiList)) {
            return [
                'tahun'   => $tahun,
                'divisi'  => [],
                'laporan' => [],
                'total'   => [],
            ];
        }

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

        // ---------- 2. TARGET ISI ----------
        // Sekarang SEMUA check sheet milik 1 line, jadi target per hari
        // = jumlah item di check sheet itu (x 1 line).
        // Fallback (data lama yang line_id-nya kosong): x jumlah line divisi.
        $jumlahLineDivisi = DB::table('lines')
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

        return [
            'tahun'   => $tahun,
            'divisi'  => $divisiList,
            'laporan' => array_values($laporan),
            'total'   => $total,
        ];
    }

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

        $tujuan = $this->bukaDariKode($data['kode']);

        if (! $tujuan) {
            return back()->withErrors([
                'kode' => 'Barcode tidak dikenali. Pastikan barcode mesin yang benar.',
            ]);
        }

        return $tujuan;
    }


    // Kamera bawaan HP (QR berisi URL /s/{kode})
    public function unlock(string $kode)
    {
        $tujuan = $this->bukaDariKode($kode);

        if (! $tujuan) {
            return redirect()->route('check-sheets.index')
                ->withErrors(['kode' => 'Barcode tidak dikenali.']);
        }

        return $tujuan;
    }

    /**
     * Kode barcode = kode CHECK SHEET (1 mesin).
     * Dibuka lewat Index line dengan ?mesin=ID, supaya hanya 1 mesin tampil.
     * Mesin yang dibuka diingat di session (per line) supaya tombol Back
     * dari halaman Show tetap kembali ke 1 mesin itu.
     *
     * Fallback: kode Line lama (barcode yang sudah terlanjur dicetak).
     * - Line hanya punya 1 mesin  -> langsung buka mesin itu.
     * - Line punya banyak mesin   -> tampilkan daftar untuk memilih 1 mesin.
     */
    private function bukaDariKode(string $kode)
    {
        $kode = Str::upper(trim($kode));

        // 1) Kode MESIN (QR / input manual) -> Index berisi 1 mesin itu saja
        $sheet = CheckSheet::with('line')->where('kode', $kode)->first();

        if ($sheet && $sheet->line) {
            $this->bukaAkses($sheet->line);
            $this->ingatMesin($sheet->line->id, $sheet->id);

            return redirect()->route('check-sheets.line', [
                $sheet->line->kode,
                'mesin' => $sheet->id,
            ]);
        }

        // 2) Kode LINE (barcode lama) -> tidak tahu mesin yang mana
        $line = Line::where('kode', $kode)->first();

        if ($line) {
            $this->bukaAkses($line);

            $idMesin = CheckSheet::where('line_id', $line->id)->pluck('id');

            if ($idMesin->count() === 1) {
                $this->ingatMesin($line->id, $idMesin->first());

                return redirect()->route('check-sheets.line', [
                    $line->kode,
                    'mesin' => $idMesin->first(),
                ]);
            }

            // banyak mesin: tampilkan daftar untuk memilih
            return redirect()->route('check-sheets.line', [
                $line->kode,
                'semua' => 1,
            ]);
        }

        return null;
    }

    private function bukaAkses(Line $line): void
    {
        $akses = session('line_akses', []);
        $akses[$line->kode] = now()->addHours(8)->timestamp;

        session([
            'line_akses' => $akses,
            'last_line'  => $line->kode,
        ]);
    }

    // Ingat mesin terakhir yang dibuka pada sebuah line
    private function ingatMesin(int $lineId, int $checkSheetId): void
    {
        session()->put("last_mesin.{$lineId}", $checkSheetId);
    }

    /**
     * Halaman Index untuk sebuah line.
     * Urutan penentuan mesin:
     *   1. ?mesin=ID       -> hanya mesin itu
     *   2. ?semua=1        -> daftar semua mesin di line
     *   3. mesin terakhir yang diingat di session (mis. saat tekan Back)
     *   4. tidak ada       -> daftar semua mesin di line
     */
    public function byLine(Request $request, string $kode)
    {
        $line = Line::with('divisi')->where('kode', $kode)->firstOrFail();

        session(['last_line' => $line->kode]);

        $mesinId = $request->integer('mesin') ?: null;

        if (! $mesinId && ! $request->boolean('semua')) {
            $mesinId = session("last_mesin.{$line->id}");
        }

        $checkSheet = $mesinId
            ? CheckSheet::with('divisi')
                ->where('line_id', $line->id)
                ->where('id', $mesinId)
                ->first()
            : null;

        return Inertia::render('CheckSheet/Index', [
            'line'        => $line,
            'checkSheet'  => $checkSheet,
            'checkSheets' => $checkSheet
                ? []
                : CheckSheet::with('divisi')
                    ->where('line_id', $line->id)
                    ->orderBy('id')
                    ->get(),
        ]);
    }

    public function barcodes()
    {
        return Inertia::render('CheckSheet/Barcodes', [
            'sheets' => CheckSheet::with(['divisi:id,nama_divisi', 'line:id,nama_line,kode'])
                ->whereNotNull('line_id')
                ->orderBy('divisi_id')
                ->orderBy('line_id')
                ->orderBy('id')
                ->get(['id', 'divisi_id', 'line_id', 'kode', 'nama_checksheet', 'nomor_dokumen']),
        ]);
    }

    // =====================================================
    // HELPER LINE
    // =====================================================

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
     * Line milik sebuah check sheet. Sekarang selalu line_id miliknya.
     * (Fallback untuk data lama yang belum dipecah: pakai line terakhir.)
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
                ->first();

            if ($line) {
                return $line;
            }
        }

        return $this->lineAktif((int) $checkSheet->divisi_id);
    }

    private function kembaliKeMaster(string $pesan)
    {
        return redirect(self::URL_MASTER)->with('success', $pesan);
    }

    // =====================================================
    // CRUD CHECK SHEET (diakses dari Master Data)
    // =====================================================

    public function create(Request $request)
    {
        return Inertia::render('CheckSheet/Create', [
            'divisis' => Divisi::orderBy('nama_divisi')->get(),
            'lines'   => Line::orderBy('divisi_id')->orderBy('id')
                ->get(['id', 'divisi_id', 'nama_line', 'kode']),
            // line yang dipilih dari Master Data (?line_id=)
            'line'    => $request->filled('line_id')
                ? Line::with('divisi')->find($request->integer('line_id'))
                : null,
        ]);
    }

    /**
     * Satu form bisa membuat check sheet untuk BANYAK line sekaligus:
     * 1 line dipilih = 1 check sheet milik line itu.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'divisi_id'        => ['required', 'exists:divisis,id'],
            'line_ids'         => ['required', 'array', 'min:1'],
            'line_ids.*'       => ['integer', 'distinct', 'exists:lines,id'],
            'nomor_dokumen'    => ['required', 'string', 'max:255'],
            'nama_checksheet'  => ['required', 'string', 'max:255'],
            'pakai_actual'     => ['nullable', 'boolean'],
            'pakai_plan_act'   => ['nullable', 'boolean'],
            'pakai_monitoring' => ['nullable', 'boolean'],
            'pakai_bbm'        => ['nullable', 'boolean'],
            'bbm_kali_60'      => ['nullable', 'boolean'],
            'pakai_pelumasan'  => ['nullable', 'boolean'],
        ], [
            'line_ids.required' => 'Pilih minimal satu line / mesin.',
            'line_ids.min'      => 'Pilih minimal satu line / mesin.',
        ]);

        $lines = Line::whereIn('id', $validated['line_ids'])
            ->where('divisi_id', $validated['divisi_id'])
            ->get();

        if ($lines->count() !== count($validated['line_ids'])) {
            throw ValidationException::withMessages([
                'line_ids' => 'Ada line yang tidak sesuai dengan divisi yang dipilih.',
            ]);
        }

        $flags = $this->flagCheckSheet($request);

        DB::transaction(function () use ($lines, $validated, $flags) {
            foreach ($lines as $line) {
                CheckSheet::create([
                    'divisi_id'       => $validated['divisi_id'],
                    'line_id'         => $line->id,
                    'nomor_dokumen'   => $validated['nomor_dokumen'],
                    'nama_checksheet' => $validated['nama_checksheet'],
                ] + $flags);
            }
        });

        return $this->kembaliKeMaster(
            $lines->count() . ' Check Sheet berhasil ditambahkan.'
        );
    }

    /** Flag fitur (checkbox) - dipakai store & update */
    private function flagCheckSheet(Request $request): array
    {
        return [
            'pakai_actual'     => $request->boolean('pakai_actual'),
            'pakai_plan_act'   => $request->boolean('pakai_plan_act'),
            'pakai_monitoring' => $request->boolean('pakai_monitoring'),
            // BBM hanya masuk akal kalau monitoring aktif
            'pakai_bbm'        => $request->boolean('pakai_monitoring') && $request->boolean('pakai_bbm'),
            'bbm_kali_60'      => $request->boolean('pakai_monitoring')
                && $request->boolean('pakai_bbm')
                && $request->boolean('bbm_kali_60'),
            'pakai_pelumasan'  => $request->boolean('pakai_pelumasan'),
        ];
    }

    public function edit(CheckSheet $checkSheet)
    {
        return Inertia::render('CheckSheet/Edit', [
            'checkSheet' => $checkSheet,
            'line'       => $this->lineUntuk($checkSheet),
            'divisi'     => Divisi::find($checkSheet->divisi_id),
        ]);
    }

    public function update(Request $request, CheckSheet $checkSheet)
    {
        // divisi & line TIDAK bisa diubah: check sheet menempel ke 1 line
        $validated = $request->validate([
            'nomor_dokumen'    => ['required', 'string', 'max:255'],
            'nama_checksheet'  => ['required', 'string', 'max:255'],
            'pakai_actual'     => ['nullable', 'boolean'],
            'pakai_plan_act'   => ['nullable', 'boolean'],
            'pakai_monitoring' => ['nullable', 'boolean'],
            'pakai_bbm'        => ['nullable', 'boolean'],
            'bbm_kali_60'      => ['nullable', 'boolean'],
            'pakai_pelumasan'  => ['nullable', 'boolean'],
        ]);

        $checkSheet->update([
            'nomor_dokumen'   => $validated['nomor_dokumen'],
            'nama_checksheet' => $validated['nama_checksheet'],
        ] + $this->flagCheckSheet($request));

        return $this->kembaliKeMaster('Check Sheet berhasil diperbarui.');
    }

    public function destroy(CheckSheet $checkSheet)
    {
        $checkSheet->delete();

        return $this->kembaliKeMaster('Check Sheet berhasil dihapus.');
    }

    /**
     * Salin SEMUA check sheet (beserta inspection point-nya) dari satu line
     * ke line lain di divisi yang sama. Check sheet yang namanya sudah ada
     * di line tujuan dilewati (tidak dobel).
     *
     * Yang disalin: check sheet + inspection point.
     * Tidak disalin: data centang, abnormality, pelumasan, monitoring.
     */
    public function salinLine(Request $request)
    {
        $validated = $request->validate([
            'sumber_line_id'    => ['required', 'exists:lines,id'],
            'tujuan_line_ids'   => ['required', 'array', 'min:1'],
            'tujuan_line_ids.*' => ['integer', 'distinct', 'exists:lines,id'],
        ], [
            'tujuan_line_ids.required' => 'Pilih minimal satu line tujuan.',
        ]);

        $sumber = Line::findOrFail($validated['sumber_line_id']);

        $tujuan = Line::whereIn('id', $validated['tujuan_line_ids'])
            ->where('divisi_id', $sumber->divisi_id)
            ->where('id', '!=', $sumber->id)
            ->get();

        if ($tujuan->isEmpty()) {
            throw ValidationException::withMessages([
                'tujuan_line_ids' => 'Line tujuan harus satu divisi dan berbeda dari line sumber.',
            ]);
        }

        $sheets = CheckSheet::with('items')
            ->where('line_id', $sumber->id)
            ->orderBy('id')
            ->get();

        if ($sheets->isEmpty()) {
            return back()->with('success', 'Line sumber belum punya check sheet.');
        }

        $dibuat = 0;

        DB::transaction(function () use ($sheets, $tujuan, &$dibuat) {
            foreach ($tujuan as $line) {
                foreach ($sheets as $sheet) {
                    $sudahAda = CheckSheet::where('line_id', $line->id)
                        ->where('nama_checksheet', $sheet->nama_checksheet)
                        ->exists();

                    if ($sudahAda) {
                        continue;
                    }

                    $baru = $sheet->replicate();
                    $baru->line_id = $line->id;
                    $baru->save();

                    foreach ($sheet->items as $item) {
                        $baru->items()->create($item->only([
                            'no', 'shift', 'inspection_point', 'condition', 'method',
                        ]));
                    }

                    $dibuat++;
                }
            }
        });

        return back()->with('success', "{$dibuat} check sheet berhasil disalin ke {$tujuan->count()} line.");
    }

    // =====================================================
    // HALAMAN CHECK SHEET (per line / mesin)
    // =====================================================

    public function show(Request $request, CheckSheet $checkSheet): Response
    {
        $checkSheet->susunUlangNomorItem();

        $bulan = (int) ($request->bulan ?? now()->month);
        $tahun = (int) ($request->tahun ?? now()->year);

        $line   = $this->lineUntuk($checkSheet, $request->integer('line_id') ?: null);
        $lineId = $line?->id;

        if ($line) {
            session(['last_line' => $line->kode]);

            // ingat mesin ini, supaya tombol Back kembali ke Index 1 mesin
            $this->ingatMesin($line->id, $checkSheet->id);
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

            'items.checklists' => function ($query) use ($awalBulan, $akhirBulan, $lineId) {
                $query->where('line_id', $lineId)
                    ->whereBetween('tanggal', [
                        $awalBulan->toDateString(),
                        $akhirBulan->toDateString(),
                    ]);
            },

            'abnormalities' => function ($query) use ($awalBulan, $akhirBulan, $lineId) {
                $query->with([
                        'preventifMesins',
                        'item:id,no,shift,inspection_point',
                    ])
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

            'monitoringItems.weeks' => function ($query) use ($bulan, $tahun) {
                $query->where('bulan', $bulan)->where('tahun', $tahun);
            },

            'bbmItems' => function ($query) {
                $query->orderBy('no')->orderBy('id');
            },
            'bbmItems.weeks' => function ($query) use ($bulan, $tahun) {
                $query->where('bulan', $bulan)->where('tahun', $tahun);
            },
            'lubrications' => function ($query) use ($lineId) {
                $query->where('line_id', $lineId)
                    ->orderBy('no')
                    ->orderBy('id');
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
            'isPimpinan'  => $request->user()?->role === 'pimpinan',
            'prevActuals' => $checkSheet->pakai_actual
                ? $this->actualSebelumBulan($checkSheet, $awalBulan, $lineId)
                : (object) [],

            'preventifOptions' => PreventifMesin::where('is_hidden', false)
                ->orderBy('divisi')
                ->orderBy('no_item')
                ->get(['no', 'divisi', 'no_item', 'item_preventif']),
        ]);
    }

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
    // ITEM
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
    // PELUMASAN
    // =====================================================

    private function aturanPelumasan(): array
    {
        return [
            'sub_mesin'       => ['nullable', 'string', 'max:255'],
            'jenis_pelumasan' => ['required', 'string', 'max:255'],
            'qty'             => ['nullable', 'string', 'max:100'],
            'method'          => ['nullable', 'string', 'max:255'],
            'tools'           => ['nullable', 'string', 'max:255'],
            'time_minutes'    => ['nullable', 'integer', 'min:0'],
            'interval'        => ['nullable', 'in:day,week,month,year'],
            'pic'             => ['nullable', 'string', 'max:100'],
        ];
    }

    public function storeLubrication(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate(
            $this->aturanPelumasan() + [
                'line_id' => ['nullable', 'integer'],
            ]
        );

        $line = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);

        $validated['line_id'] = $line?->id;

        $validated['no'] = ((int) $checkSheet->lubrications()
            ->where('line_id', $line?->id)
            ->max('no')) + 1;

        $checkSheet->lubrications()->create($validated);

        return back()->with('success', 'Data pelumasan berhasil ditambahkan.');
    }

    public function updateLubrication(Request $request, CheckSheet $checkSheet, int $lubrication)
    {
        $validated = $request->validate($this->aturanPelumasan());

        $checkSheet->lubrications()->where('id', $lubrication)->firstOrFail()
            ->update($validated);

        return back()->with('success', 'Data pelumasan berhasil diperbarui.');
    }

    public function destroyLubrication(CheckSheet $checkSheet, int $lubrication)
    {
        $row = $checkSheet->lubrications()->where('id', $lubrication)->firstOrFail();

        $lineId = $row->line_id;

        $row->delete();

        $checkSheet->lubrications()
            ->where('line_id', $lineId)
            ->orderBy('no')
            ->orderBy('id')
            ->get()
            ->each(fn ($item, $i) => $item->update(['no' => $i + 1]));

        return back()->with('success', 'Data pelumasan berhasil dihapus.');
    }

    // =====================================================
    // CENTANG SEMUA (khusus pimpinan)
    // =====================================================

    public function centangSemua(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'bulan'      => ['required', 'integer', 'between:1,12'],
            'tahun'      => ['required', 'integer', 'between:2020,2040'],
            'kolom'      => ['required', 'in:status,plan'],
            'line_id'    => ['nullable', 'integer'],
            'item_ids'   => ['required', 'array', 'min:1'],
            'item_ids.*' => ['integer'],
        ]);

        if ($checkSheet->pakai_actual) {
            throw ValidationException::withMessages([
                'kolom' => 'Check sheet ini memakai nilai Actual, tidak bisa dicentang semua.',
            ]);
        }

        if ($validated['kolom'] === 'plan' && ! $checkSheet->pakai_plan_act) {
            throw ValidationException::withMessages([
                'kolom' => 'Check sheet ini tidak memakai kolom Plan.',
            ]);
        }

        $kolom = $validated['kolom'];
        $line  = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);

        $awal  = Carbon::create((int) $validated['tahun'], (int) $validated['bulan'], 1)->startOfDay();
        $akhir = $awal->copy()->endOfMonth()->startOfDay();
        $batas = now()->startOfDay();

        $tanggalList = [];

        for ($d = $awal->copy(); $d->lte($akhir); $d->addDay()) {
            if ($d->isSaturday() || $d->isSunday()) {
                continue;
            }

            if ($d->gt($batas)) {
                continue;
            }

            $tanggalList[] = $d->toDateString();
        }

        if (empty($tanggalList)) {
            return back()->with('success', 'Tidak ada hari kerja yang bisa dicentang pada periode ini.');
        }

        $items = $checkSheet->items()
            ->whereIn('id', $validated['item_ids'])
            ->get();

        $jumlah = 0;

        DB::transaction(function () use ($items, $line, $kolom, $tanggalList, &$jumlah) {
            foreach ($items as $item) {
                $sudah = $item->checklists()
                    ->when(
                        $line,
                        fn ($q) => $q->where('line_id', $line->id),
                        fn ($q) => $q->whereNull('line_id')
                    )
                    ->whereIn('tanggal', $tanggalList)
                    ->where($kolom, true)
                    ->pluck('tanggal')
                    ->map(fn ($t) => substr((string) $t, 0, 10))
                    ->all();

                foreach (array_diff($tanggalList, $sudah) as $tgl) {
                    $item->checklists()->updateOrCreate(
                        ['line_id' => $line?->id, 'tanggal' => $tgl],
                        [$kolom => true]
                    );

                    $jumlah++;
                }
            }
        });

        return back()->with(
            'success',
            "Berhasil mencentang {$jumlah} kotak ({$items->count()} item, "
            . count($tanggalList) . ' hari kerja, Sabtu & Minggu dilewati).'
        );
    }

    // =====================================================
    // NILAI ACTUAL / CATATAN (khusus KWH)
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
                'status'  => isset($validated['actual']),
            ]
        );

        return back();
    }

    // =====================================================
    // ABNORMALITY
    // =====================================================

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
                'line_id'             => ['nullable', 'integer'],
                'check_sheet_item_id' => ['nullable', 'integer'],
            ]
        );

        $line = $this->lineUntuk($checkSheet, $validated['line_id'] ?? null);

        $item = null;

        if (! empty($validated['check_sheet_item_id'])) {
            $item = $checkSheet->items()
                ->where('id', $validated['check_sheet_item_id'])
                ->firstOrFail();
        }

        $preventifIds = collect($validated['preventif_mesin_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        unset(
            $validated['line_id'],
            $validated['preventif_mesin_ids'],
            $validated['check_sheet_item_id']
        );

        DB::transaction(function () use ($checkSheet, $validated, $line, $item, $preventifIds) {
            $abnormality = $checkSheet->abnormalities()->create($validated + [
                'line_id'             => $line?->id,
                'check_sheet_item_id' => $item?->id,
            ]);

            $abnormality->preventifMesins()->sync($preventifIds);

            // Centang hanya kalau abnormality langsung dibuat dengan status Closed.
            if ($item && ! $checkSheet->pakai_actual
                && in_array(strtolower(trim($validated['status'])), CheckSheetAbnormality::STATUS_SELESAI, true)) {
                $item->checklists()->updateOrCreate(
                    ['line_id' => $line?->id, 'tanggal' => $validated['tanggal']],
                    ['status' => true]
                );
            }
        });

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
        if ($checkSheetAbnormality->check_sheet_item_id
            && ! $checkSheet->pakai_actual
            && in_array(strtolower(trim($validated['status'])), CheckSheetAbnormality::STATUS_SELESAI, true)) {
            $checkSheetAbnormality->item?->checklists()->updateOrCreate(
                [
                    'line_id' => $checkSheetAbnormality->line_id,
                    'tanggal' => $checkSheetAbnormality->tanggal->toDateString(),
                ],
                ['status' => true]
            );
        }

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
        $checkSheet->susunUlangNomorItem();

        $bulan = (int) ($request->bulan ?: now()->month);
        $tahun = (int) ($request->tahun ?: now()->year);

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