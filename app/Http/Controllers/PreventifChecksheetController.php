<?php

namespace App\Http\Controllers;

use App\Imports\PreventifChecksheetImporter;
use App\Models\AbnormalityCatatan;
use App\Models\CheckSheetAbnormality;
use App\Models\CheckSheetItem;
use App\Models\PreventifChecksheet;
use App\Models\PreventifChecksheetAksi;
use App\Models\PreventifChecksheetItem;
use App\Models\PreventifChecksheetRecord;
use App\Models\PreventifChecksheetResult;
use App\Models\PreventifDivisi;
use App\Models\PreventifMesin;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use App\Exports\PreventifChecksheetFormExport;
use Maatwebsite\Excel\Facades\Excel;

class PreventifChecksheetController extends Controller
{
    public const AKSI = ['periksa', 'bersihkan', 'lubrikasi', 'ganti', 'perbaiki'];

    private const PREFIX_CATATAN_ACT = 'Perbaikan abnormality (Checksheet Preventif)';

    private const PREFIX_CATATAN_PREDIKTIF = 'Preventif: ';

    private function flash(): array
    {
        return [
            'success' => session('success'),
            'error' => session('error'),
            'import' => session('import'),
        ];
    }

    // =====================================================
    // DAFTAR
    // =====================================================

    public function index(Request $request): Response
    {
        $divisi = $request->input('divisi', 'all');

        // jumlah abnormality terbuka per item Schedule Preventif
        $terbuka = CheckSheetAbnormality::with('preventifMesins')
            ->belumSelesai()
            ->get()
            ->flatMap(fn ($a) => $a->preventifMesins->pluck('no'))
            ->countBy();

        $checksheets = PreventifChecksheet::withCount('items')
            ->with('preventifMesin:no,divisi,no_item,item_preventif')
            ->when($divisi !== 'all', fn ($q) => $q->where('divisi', $divisi))
            ->orderBy('divisi')
            ->orderBy('nama_equipment')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'divisi' => $c->divisi,
                // nama equipment = nama item Schedule Preventif yang dihubungkan
                'nama_equipment' => $c->preventifMesin?->item_preventif ?? $c->nama_equipment,
                'nomor_dokumen' => $c->nomor_dokumen,
                'preventif_mesin_id' => $c->preventif_mesin_id,
                'item_preventif' => $c->preventifMesin?->item_preventif,
                'items_count' => $c->items_count,
                'abnormality_terbuka' => $c->preventif_mesin_id
                    ? (int) $terbuka->get($c->preventif_mesin_id, 0)
                    : 0,
            ]);

        return Inertia::render('PreventifChecksheet/Index', [
            'checksheets' => $checksheets,
            'divisis' => PreventifDivisi::orderBy('urutan')->orderBy('id')->pluck('nama'),
            'filterDivisi' => $divisi,
            'preventifOptions' => $this->preventifOptions(),
            'flash' => $this->flash(),
        ]);
    }

    private function preventifOptions()
    {
        // item yang sudah punya checksheet (1 item = 1 checksheet)
        $dipakai = PreventifChecksheet::whereNotNull('preventif_mesin_id')
            ->pluck('preventif_mesin_id')
            ->map(fn ($i) => (int) $i)
            ->all();

        return PreventifMesin::where('is_hidden', false)
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get(['no', 'divisi', 'no_item', 'item_preventif'])
            ->map(fn ($p) => [
                'no' => $p->no,
                'divisi' => $p->divisi,
                'no_item' => $p->no_item,
                'item_preventif' => $p->item_preventif,
                'terpakai' => in_array((int) $p->no, $dipakai, true),
            ])
            ->values();
    }

    /**
     * Tujuan klik notifikasi di Schedule Preventif:
     * buka Checksheet Preventif milik item tersebut.
     */
    public function untukItem(Request $request, PreventifMesin $preventifMesin)
    {
        $checksheet = PreventifChecksheet::where('preventif_mesin_id', $preventifMesin->no)
            ->orderBy('id')
            ->first();

        if (! $checksheet) {
            return redirect()
                ->route('preventif-checksheets.index')
                ->with('error', 'Belum ada Checksheet Preventif yang terhubung ke item "'
                    . $preventifMesin->item_preventif . '". Import Excel atau hubungkan lewat tombol Edit.');
        }

        $params = ['preventifChecksheet' => $checksheet->id];

        // buka bulan abnormality-nya supaya langsung kelihatan
        if ($request->filled('abnormality')) {
            $a = CheckSheetAbnormality::find($request->integer('abnormality'));

            if ($a) {
                $params['bulan'] = $a->tanggal->month;
                $params['tahun'] = $a->tanggal->year;
                $params['abnormality'] = $a->id;
            }
        }

        return redirect()->route('preventif-checksheets.show', $params);
    }

    // =====================================================
    // CRUD MASTER
    // =====================================================

    /**
     * Validasi + nama_equipment diambil dari item Schedule Preventif yang dihubungkan.
     * 1 item hanya boleh punya 1 checksheet.
     */
    private function dataMaster(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate(
            [
                'divisi' => ['required', 'string', Rule::exists('preventif_divisis', 'nama')],
                'preventif_mesin_id' => [
                    'required',
                    'integer',
                    Rule::exists('preventif_mesins', 'no'),
                    Rule::unique('preventif_checksheets', 'preventif_mesin_id')
                        ->whereNull('deleted_at')
                        ->ignore($ignoreId),
                ],
                'nomor_dokumen' => ['nullable', 'string', 'max:255'],
            ],
            [
                'preventif_mesin_id.required' => 'Pilih item Schedule Preventif.',
                'preventif_mesin_id.unique' => 'Item ini sudah punya Checksheet Preventif.',
            ]
        );

        $item = PreventifMesin::findOrFail($data['preventif_mesin_id']);

        if ($item->divisi !== $data['divisi']) {
            throw ValidationException::withMessages([
                'preventif_mesin_id' => 'Item tidak termasuk divisi yang dipilih.',
            ]);
        }

        $data['nama_equipment'] = $item->item_preventif;

        return $data;
    }

    public function store(Request $request)
    {
        $checksheet = PreventifChecksheet::create($this->dataMaster($request));

        return redirect()
            ->route('preventif-checksheets.show', $checksheet->id)
            ->with('success', 'Checksheet Preventif berhasil ditambahkan.');
    }

    public function update(Request $request, PreventifChecksheet $preventifChecksheet)
    {
        $preventifChecksheet->update($this->dataMaster($request, $preventifChecksheet->id));

        return back()->with('success', 'Checksheet Preventif berhasil diperbarui.');
    }

    public function destroy(PreventifChecksheet $preventifChecksheet)
    {
        $preventifChecksheet->delete();

        return redirect()
            ->route('preventif-checksheets.index')
            ->with('success', 'Checksheet Preventif berhasil dihapus.');
    }

    // =====================================================
    // IMPORT EXCEL
    // =====================================================

    public function import(Request $request, PreventifChecksheetImporter $importer)
    {
        $request->validate([
            'divisi' => ['required', 'string', Rule::exists('preventif_divisis', 'nama')],
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        try {
            $laporan = $importer->import($request->file('file')->getRealPath(), $request->divisi);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'File Excel tidak bisa dibaca: ' . $e->getMessage());
        }

        return back()
            ->with('success', $laporan['ringkasan'])
            ->with('import', $laporan['sheets']);
    }

    /** Export hasil pengisian SATU bulan ke Excel (formatnya sama dengan import). */
    /** Export hasil pengisian SATU bulan ke Excel dengan tampilan form kertas. */
    public function exportBulan(Request $request, PreventifChecksheet $preventifChecksheet)
    {
        $data = $request->validate([
            'bulan' => ['required', 'integer', 'between:1,12'],
            'tahun' => ['required', 'integer', 'between:2020,2040'],
        ]);

        $bulan = (int) $data['bulan'];
        $tahun = (int) $data['tahun'];
        $cs = $preventifChecksheet;

        $record = $cs->records()
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->with('aksis')
            ->orderBy('id')
            ->first();

        $items = $cs->items()->orderBy('no')->orderBy('id')->get();

        // aksi per item per tanggal
        $aksiPerItem = [];

        foreach ($record?->aksis ?? [] as $x) {
            $aksiPerItem[$x->preventif_checksheet_item_id][$x->tanggal->format('Y-m-d')] = $x->aksi;
        }

        // ACTION #1..#4 = 4 tanggal pelaksanaan pertama di bulan itu
        $tanggalAksi = ($record?->aksis ?? collect())
            ->map(fn ($x) => $x->tanggal->format('Y-m-d'))
            ->unique()
            ->sort()
            ->values()
            ->take(4);

        $actions = $tanggalAksi
            ->map(fn ($t) => [
                'tanggal' => $t,
                'label' => Carbon::parse($t)->translatedFormat('d M Y'),
            ])
            ->all();

        $hasil = $record
            ? PreventifChecksheetResult::where('preventif_checksheet_record_id', $record->id)
                ->get()
                ->keyBy('preventif_checksheet_item_id')
            : collect();

        // abnormality item ini di bulan itu
        $abn = collect();

        if ($cs->preventif_mesin_id) {
            $awal = Carbon::create($tahun, $bulan, 1)->startOfMonth()->toDateString();
            $akhir = Carbon::create($tahun, $bulan, 1)->endOfMonth()->toDateString();

            $abn = CheckSheetAbnormality::with('line:id,nama_line')
                ->whereHas(
                    'preventifMesins',
                    fn ($q) => $q->where('preventif_mesins.no', $cs->preventif_mesin_id)
                )
                ->whereBetween('tanggal', [$awal, $akhir])
                ->orderBy('tanggal')
                ->orderBy('id')
                ->get();
        }

        $tanggalLabel = $tanggalAksi->isNotEmpty()
            ? $tanggalAksi->map(fn ($t) => Carbon::parse($t)->translatedFormat('d F Y'))->implode(', ')
            : ($abn->isNotEmpty() ? $abn->first()->tanggal->translatedFormat('d F Y') : '');

        $export = new PreventifChecksheetFormExport([
            'nama_equipment' => $cs->nama_equipment,
            'nomor_dokumen' => $cs->nomor_dokumen,
            'mesin' => $abn->pluck('line.nama_line')->filter()->unique()->implode(', '),
            'line' => (string) ($record?->line ?? ''),
            'bulan_label' => Carbon::create($tahun, $bulan, 1)->translatedFormat('F Y'),
            'tanggal_label' => $tanggalLabel,
            'pic' => (string) ($record?->pic_pelaksana ?: $abn->pluck('pic')->filter()->first() ?: ''),
            'actions' => $actions,
            'items' => $items->map(fn ($i) => [
                'no' => $i->no,
                'inspection_point' => $i->inspection_point,
                'standar' => $i->standar,
                'aksi' => $aksiPerItem[$i->id] ?? [],
                'kondisi' => $hasil->get($i->id)?->kondisi,
                'keterangan' => $hasil->get($i->id)?->keterangan,
            ])->all(),
            'abnormalities' => $abn->map(fn ($a) => [
                'tanggal' => $a->tanggal->format('d/m/Y'),
                'abnormality' => $a->abnormality,
                'countermeasure' => $a->countermeasure,
                'status' => $this->normalisasiStatus($a->status),
                'pic' => $a->pic,
            ])->all(),
        ]);

        $namaFile = 'checksheet-preventif-'
            . Str::slug($cs->nama_equipment)
            . '-' . $tahun . '-' . str_pad((string) $bulan, 2, '0', STR_PAD_LEFT) . '.xlsx';

        return $export->download($namaFile);
    }

    // =====================================================
    // HALAMAN FORM
    // =====================================================

    public function show(Request $request, PreventifChecksheet $preventifChecksheet): Response
    {
        $cs = $preventifChecksheet->load([
            'items',
            'preventifMesin:no,divisi,no_item,item_preventif',
        ]);

        $bulan = max(1, min(12, (int) $request->input('bulan', now()->month)));
        $tahun = max(2020, min(2040, (int) $request->input('tahun', now()->year)));

        // satu form per bulan: dibuat otomatis kalau belum ada
        $record = $cs->records()->firstOrCreate(['tahun' => $tahun, 'bulan' => $bulan]);

        // abnormality item ini pada bulan yang dipilih
        $abnormalities = collect();
        $headerOtomatis = null;

        if ($cs->preventif_mesin_id) {
            $awal = Carbon::create($tahun, $bulan, 1)->startOfMonth()->toDateString();
            $akhir = Carbon::create($tahun, $bulan, 1)->endOfMonth()->toDateString();

            $lista = CheckSheetAbnormality::with([
                'checkSheet:id,nomor_dokumen,nama_checksheet',
                'line:id,nama_line',
                'catatans',
            ])
                ->whereHas(
                    'preventifMesins',
                    fn ($q) => $q->where('preventif_mesins.no', $cs->preventif_mesin_id)
                )
                ->whereBetween('tanggal', [$awal, $akhir])
                ->orderBy('tanggal')
                ->orderBy('id')
                ->get();

            $abnormalities = $lista->map(fn ($a) => $this->formatAbnormality($a))->values();

            // Header form: hari/tanggal ikut abnormality
            // (yang dibuka dari notifikasi, kalau tidak ada = yang paling baru)
            $target = $request->filled('abnormality')
                ? $lista->firstWhere('id', $request->integer('abnormality'))
                : null;

            $target ??= $lista->last();

            if ($target) {
                $headerOtomatis = [
                    'tanggal' => $target->tanggal->format('Y-m-d'),
                    'tanggal_format' => $target->tanggal->translatedFormat('l, d F Y'),
                    'pic' => $target->pic,
                ];

                // PIC pelaksana otomatis dari PIC abnormality (hanya kalau belum diisi)
                if (blank($record->pic_pelaksana) && filled($target->pic)) {
                    $record->update(['pic_pelaksana' => $target->pic]);
                }
            }
        }

        // key "i{id}" / "{itemId}-{tanggal}" supaya selalu jadi object di JSON
        $results = [];
        $aksi = [];

        foreach ($record->results as $r) {
            $results['i' . $r->preventif_checksheet_item_id] = [
                'kondisi' => $r->kondisi,
                'keterangan' => $r->keterangan,
            ];
        }

        foreach ($record->aksis as $x) {
            $aksi[$x->preventif_checksheet_item_id . '-' . $x->tanggal->format('Y-m-d')] = $x->aksi;
        }
        
        $riwayat = $cs->records()
            ->withCount('aksis')
            ->with('results:id,preventif_checksheet_record_id,kondisi')
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'bulan' => $r->bulan,
                'tahun' => $r->tahun,
                'jumlah_aksi' => $r->aksis_count,
                'ok' => $r->results->where('kondisi', 'OK')->count(),
                'ng' => $r->results->where('kondisi', 'NG')->count(),
                'pic_pelaksana' => $r->pic_pelaksana,
            ])
            ->values();

        return Inertia::render('PreventifChecksheet/Show', [
            'checksheet' => [
                'id' => $cs->id,
                'divisi' => $cs->divisi,
                'preventif_mesin_id' => $cs->preventif_mesin_id,
                'item_preventif' => $cs->preventifMesin?->item_preventif,
                'nama_equipment' => $cs->preventifMesin?->item_preventif ?? $cs->nama_equipment,
                'nomor_dokumen' => $cs->nomor_dokumen,
                'items' => $cs->items->map(fn ($i) => [
                    'id' => $i->id,
                    'no' => $i->no,
                    'inspection_point' => $i->inspection_point,
                    'standar' => $i->standar,
                ])->values(),
            ],
            'bulan' => $bulan,
            'tahun' => $tahun,
            'records' => collect([$record])->map(fn ($r) => [
                'id' => $r->id,
                'line' => $r->line,
                'tanggal_pelaksanaan' => $r->tanggal_pelaksanaan?->format('Y-m-d'),
                'pic_pelaksana' => $r->pic_pelaksana,
            ])->values(),
            'recordId' => $record->id,
            'results' => (object) $results,
            'aksi' => (object) $aksi,
            'headerOtomatis' => $headerOtomatis,
            'abnormalities' => $abnormalities,
            'highlightAbnormality' => $request->integer('abnormality') ?: null,
            'divisis' => PreventifDivisi::orderBy('urutan')->orderBy('id')->pluck('nama'),
            'preventifOptions' => $this->preventifOptions(),
            'flash' => $this->flash(),
            'riwayat' => $riwayat,
        ]);
    }

    private function normalisasiStatus(?string $status): string
    {
        $s = strtolower(trim((string) $status));

        if (in_array($s, CheckSheetAbnormality::STATUS_SELESAI, true)) {
            return 'Closed';
        }

        if (in_array($s, ['progress', 'in progress', 'on progress', 'proses'], true)) {
            return 'Progress';
        }

        return 'Open';
    }

    private function formatAbnormality(CheckSheetAbnormality $a): array
    {
        return [
            'id' => $a->id,
            'tanggal' => $a->tanggal->format('Y-m-d'),
            'tanggal_format' => $a->tanggal->translatedFormat('d F Y'),
            'checksheet' => $a->checkSheet?->nama_checksheet,
            'nomor_dokumen' => $a->checkSheet?->nomor_dokumen,
            'mesin' => $a->line?->nama_line,
            'abnormality' => $a->abnormality,
            'countermeasure' => $a->countermeasure,
            'status' => $this->normalisasiStatus($a->status),
            'pic' => $a->pic,
            'tanggal_selesai' => $a->tanggal_selesai?->format('Y-m-d'),
            'url_checksheet' => route('check-sheets.show', [
                'check_sheet' => $a->check_sheet_id,
                'bulan' => $a->tanggal->month,
                'tahun' => $a->tanggal->year,
                'line_id' => $a->line_id,
            ]),
            'catatans' => $a->catatans->map(fn ($c) => [
                'id' => $c->id,
                'catatan' => $c->catatan,
                'oleh' => $c->oleh,
                'waktu' => $c->created_at?->translatedFormat('d M Y'),
            ])->values(),
        ];
    }

    // =====================================================
    // ITEM (Inspection Point + Standar)
    // =====================================================

    private function aturanItem(): array
    {
        return [
            'inspection_point' => ['required', 'string'],
            'standar' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function storeItem(Request $request, PreventifChecksheet $preventifChecksheet)
    {
        $data = $request->validate($this->aturanItem());

        $preventifChecksheet->items()->create($data + [
            'no' => ((int) $preventifChecksheet->items()->max('no')) + 1,
        ]);

        return back()->with('success', 'Inspection point berhasil ditambahkan.');
    }

    public function updateItem(Request $request, PreventifChecksheet $preventifChecksheet, int $item)
    {
        $data = $request->validate($this->aturanItem());

        $preventifChecksheet->items()->where('id', $item)->firstOrFail()->update($data);

        return back()->with('success', 'Inspection point berhasil diperbarui.');
    }

    public function destroyItem(PreventifChecksheet $preventifChecksheet, int $item)
    {
        $preventifChecksheet->items()->where('id', $item)->firstOrFail()->delete();
        $preventifChecksheet->susunUlangNomorItem();

        return back()->with('success', 'Inspection point berhasil dihapus.');
    }

    // =====================================================
    // FORM BULANAN (header + tindakan per tanggal + kondisi)
    // =====================================================

    public function storeRecord(Request $request, PreventifChecksheet $preventifChecksheet)
    {
        $data = $request->validate([
            'bulan' => ['required', 'integer', 'between:1,12'],
            'tahun' => ['required', 'integer', 'between:2020,2040'],
        ]);

        $record = $preventifChecksheet->records()->firstOrCreate($data);

        return redirect()->route('preventif-checksheets.show', [
            'preventifChecksheet' => $preventifChecksheet->id,
            'bulan' => $data['bulan'],
            'tahun' => $data['tahun'],
            'record_id' => $record->id,
        ]);
    }

    public function updateRecord(Request $request, PreventifChecksheetRecord $record)
    {
        $data = $request->validate([
            'line' => ['nullable', 'string', 'max:255'],
            'tanggal_pelaksanaan' => ['nullable', 'date'],
            'pic_pelaksana' => ['nullable', 'string', 'max:255'],
        ]);

        $record->update($data);

        return back();
    }

    public function destroyRecord(PreventifChecksheetRecord $record)
    {
        $cs = $record->checksheet;
        $bulan = $record->bulan;
        $tahun = $record->tahun;

        $record->delete();

        return redirect()
            ->route('preventif-checksheets.show', [
                'preventifChecksheet' => $cs->id,
                'bulan' => $bulan,
                'tahun' => $tahun,
            ])
            ->with('success', 'Form bulan ini berhasil dihapus.');
    }

    private function itemMilik(PreventifChecksheetRecord $record, int $itemId): PreventifChecksheetItem
    {
        return PreventifChecksheetItem::where('preventif_checksheet_id', $record->preventif_checksheet_id)
            ->where('id', $itemId)
            ->firstOrFail();
    }

    /** Pilih aksi (dropdown) untuk satu item pada satu tanggal. aksi kosong = hapus. */
    public function setAksi(Request $request, PreventifChecksheetRecord $record)
    {
        $data = $request->validate([
            'item_id' => ['required', 'integer'],
            'tanggal' => ['required', 'date_format:Y-m-d'],
            'aksi' => ['nullable', Rule::in(self::AKSI)],
        ]);

        $item = $this->itemMilik($record, $data['item_id']);
        $tanggal = Carbon::createFromFormat('Y-m-d', $data['tanggal']);

        if ((int) $tanggal->year !== (int) $record->tahun || (int) $tanggal->month !== (int) $record->bulan) {
            throw ValidationException::withMessages([
                'tanggal' => 'Tanggal harus berada di bulan form ini.',
            ]);
        }

        $kunci = [
            'preventif_checksheet_record_id' => $record->id,
            'preventif_checksheet_item_id' => $item->id,
            'tanggal' => $data['tanggal'],
        ];

        if (blank($data['aksi'] ?? null)) {
            PreventifChecksheetAksi::where($kunci)->delete();
        } else {
            PreventifChecksheetAksi::updateOrCreate($kunci, ['aksi' => $data['aksi']]);
        }

        return back();
    }

    /** Kondisi (OK / NG) dan Keterangan. Mengubah Kondisi ikut memperbarui status abnormality. */
    public function updateHasil(Request $request, PreventifChecksheetRecord $record)
    {
        $data = $request->validate([
            'item_id' => ['required', 'integer'],
            'kondisi' => ['nullable', Rule::in(['OK', 'NG'])],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $item = $this->itemMilik($record, $data['item_id']);

        $nilai = [];

        if ($request->has('kondisi')) {
            $nilai['kondisi'] = $data['kondisi'] ?? null;
        }

        if ($request->has('keterangan')) {
            $nilai['keterangan'] = $data['keterangan'] ?? null;
        }

        PreventifChecksheetResult::updateOrCreate(
            [
                'preventif_checksheet_record_id' => $record->id,
                'preventif_checksheet_item_id' => $item->id,
            ],
            $nilai
        );

        if ($request->has('kondisi')) {
            $pesan = $this->sinkronStatusAbnormality($record);

            if ($pesan) {
                return back()->with('success', $pesan);
            }
        }

        return back();
    }

    /**
     * Status abnormality bulan form ini otomatis dari Kondisi tiap baris:
     *  - semua baris OK      -> Closed (ACT Schedule Preventif + centang Prediktif ikut)
     *  - ada yang NG         -> Progress
     *  - selain itu          -> Open (atau Progress kalau sudah ada catatan kendala)
     *
     * @return string|null pesan untuk toast kalau ada status yang berubah
     */
    private function sinkronStatusAbnormality(PreventifChecksheetRecord $record): ?string
    {
        $cs = $record->checksheet;

        if (! $cs || ! $cs->preventif_mesin_id) {
            return null;
        }

        $itemIds = $cs->items()->pluck('id');

        if ($itemIds->isEmpty()) {
            return null;
        }

        $kondisi = $record->results()
            ->whereIn('preventif_checksheet_item_id', $itemIds)
            ->pluck('kondisi');

        $adaNg = $kondisi->contains('NG');
        $semuaOk = ! $adaNg && $kondisi->filter(fn ($k) => $k === 'OK')->count() === $itemIds->count();

        $statusBaru = $adaNg ? 'Progress' : ($semuaOk ? 'Closed' : 'Open');
        $closed = $statusBaru === 'Closed';

        $awal = Carbon::create($record->tahun, $record->bulan, 1)->startOfMonth()->toDateString();
        $akhir = Carbon::create($record->tahun, $record->bulan, 1)->endOfMonth()->toDateString();

        $lista = CheckSheetAbnormality::whereHas(
            'preventifMesins',
            fn ($q) => $q->where('preventif_mesins.no', $cs->preventif_mesin_id)
        )
            ->whereBetween('tanggal', [$awal, $akhir])
            ->get();

        $item = PreventifMesin::find($cs->preventif_mesin_id);
        $berubah = false;
        $actDitandai = false;
        $statusAkhir = $statusBaru;

        DB::transaction(function () use ($lista, $statusBaru, $closed, $item, &$berubah, &$actDitandai, &$statusAkhir) {
            foreach ($lista as $a) {
                // belum semua OK & tidak ada NG, tapi ada catatan kendala (mis. terkendala produksi)
                // -> tetap Progress, bukan Open
                $target = $statusBaru;

                if ($target === 'Open' && $a->catatans()->exists()) {
                    $target = 'Progress';
                }

                if ($this->normalisasiStatus($a->status) === $target) {
                    continue;
                }

                $berubah = true;
                $statusAkhir = $target;

                $tanggalSelesai = $target === 'Closed'
                    ? max($a->tanggal->toDateString(), now()->toDateString())
                    : null;

                $a->update([
                    'status' => $target,
                    'tanggal_selesai' => $tanggalSelesai,
                ]);

                // Closed -> kotak di Check Sheet Prediktif dipastikan tercentang
                $this->sinkronkanChecklistPrediktif($a, $target === 'Closed');

                if ($item && $this->sinkronkanAct($a, $item, $target === 'Closed', $tanggalSelesai)) {
                    $actDitandai = true;
                }
            }
        });

        if (! $berubah) {
            return null;
        }

        return match ($statusAkhir) {
            'Closed' => 'Semua inspection point OK, abnormality ditutup.'
                . ($actDitandai ? ' ACT di Schedule Preventif sudah ditandai.' : ''),
            'Progress' => $adaNg
                ? 'Ada inspection point NG, status abnormality menjadi Progress.'
                : 'Status abnormality menjadi Progress (ada catatan kendala).',
            default => 'Status abnormality kembali Open.',
        };
    }

    // =====================================================
    // ABNORMALITY (countermeasure, PIC, catatan progress)
    // =====================================================

    private function abnormalityMilik(PreventifChecksheet $cs, int $id): CheckSheetAbnormality
    {
        abort_unless($cs->preventif_mesin_id, 404);

        return CheckSheetAbnormality::whereHas(
            'preventifMesins',
            fn ($q) => $q->where('preventif_mesins.no', $cs->preventif_mesin_id)
        )->findOrFail($id);
    }

    /** Status tidak diatur di sini: otomatis dari Kondisi OK / NG (lihat updateHasil). */
    public function updateAbnormality(
        Request $request,
        PreventifChecksheet $preventifChecksheet,
        int $abnormality
    ) {
        $data = $request->validate([
            'countermeasure' => ['nullable', 'string'],
        ]);

        $a = $this->abnormalityMilik($preventifChecksheet, $abnormality);

        $a->update([
            'countermeasure' => $data['countermeasure'] ?? null,
        ]);

        return back();
    }

    /**
     * Closed  -> tandai ACT di Schedule Preventif (tanggal selesai).
     * Dibuka lagi -> batalkan ACT HANYA kalau ACT itu dibuat otomatis oleh proses ini.
     * ACT yang sudah dicentang manual tidak pernah disentuh.
     *
     * @return bool true kalau ACT baru ditandai
     */
    private function sinkronkanAct(
        CheckSheetAbnormality $a,
        PreventifMesin $item,
        bool $closed,
        ?string $tanggal
    ): bool {
        $relasi = $a->preventifMesins()->where('preventif_mesins.no', $item->no)->first();
        $pivot = $relasi?->pivot;

        $otomatisLama = $pivot && $pivot->act_otomatis && $pivot->act_tanggal;
        $tanggalLama = $otomatisLama ? Carbon::parse($pivot->act_tanggal)->toDateString() : null;

        // batalkan ACT otomatis lama (dibuka lagi, atau tanggal selesai diganti)
        if ($otomatisLama && (! $closed || $tanggalLama !== $tanggal)) {
            $lama = $item->checklists()->whereDate('tanggal', $tanggalLama)->first();

            if ($lama) {
                $lama->update([
                    'status' => false,
                    'catatan' => str_starts_with((string) $lama->catatan, self::PREFIX_CATATAN_ACT)
                        ? null
                        : $lama->catatan,
                ]);
            }

            $a->preventifMesins()->updateExistingPivot($item->no, [
                'act_otomatis' => false,
                'act_tanggal' => null,
            ]);
        }

        if (! $closed) {
            return false;
        }

        // sudah ACT pada tanggal itu (manual atau otomatis sebelumnya) -> jangan disentuh
        $ada = $item->checklists()->whereDate('tanggal', $tanggal)->first();

        if ($ada && (bool) $ada->status) {
            return false;
        }

        $item->checklists()->updateOrCreate(
            ['tanggal' => $tanggal],
            [
                'status' => true,
                'catatan' => $ada?->catatan ?: self::PREFIX_CATATAN_ACT . " #{$a->id}",
            ]
        );

        $a->preventifMesins()->updateExistingPivot($item->no, [
            'act_otomatis' => true,
            'act_tanggal' => $tanggal,
        ]);

        return true;
    }

    /**
     * Kotak abnormality di Check Sheet Prediktif:
     * saat Closed dipastikan tercentang (status = true).
     * Open / Progress tidak mengubah centang; tampilannya ditentukan dari status abnormality.
     * KWH (pakai_actual) dikecualikan: terisi tidaknya ditentukan angka Actual.
     */
    private function sinkronkanChecklistPrediktif(CheckSheetAbnormality $a, bool $closed): void
    {
        if (! $closed || ! $a->check_sheet_item_id) {
            return;
        }

        $item = CheckSheetItem::with('checkSheet')->find($a->check_sheet_item_id);

        if (! $item || $item->checkSheet?->pakai_actual) {
            return;
        }

        $item->checklists()->updateOrCreate(
            [
                'line_id' => $a->line_id,
                'tanggal' => $a->tanggal->toDateString(),
            ],
            ['status' => true]
        );
    }

    /**
     * Catatan progress dari sini ikut tampil di kolom "Catatan" kotak Check Sheet Prediktif
     * (item & tanggal abnormality itu). Catatan yang diketik manual di prediktif tidak ditimpa:
     * catatan preventif ditambahkan di belakangnya.
     */
    private function salinCatatanKePrediktif(CheckSheetAbnormality $a, string $teks): void
    {
        if (! $a->check_sheet_item_id) {
            return;
        }

        $item = CheckSheetItem::find($a->check_sheet_item_id);

        if (! $item) {
            return;
        }

        $tanggal = $a->tanggal->toDateString();

        $ada = $item->checklists()
            ->where('line_id', $a->line_id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        // buang catatan preventif sebelumnya, sisakan catatan manual
        $manual = trim((string) preg_replace(
            '/\s*\|?\s*' . preg_quote(self::PREFIX_CATATAN_PREDIKTIF, '/') . '.*$/s',
            '',
            (string) $ada?->catatan
        ));

        $baru = self::PREFIX_CATATAN_PREDIKTIF . $teks;

        if ($manual !== '') {
            $baru = $manual . ' | ' . $baru;
        }

        $item->checklists()->updateOrCreate(
            ['line_id' => $a->line_id, 'tanggal' => $tanggal],
            ['catatan' => Str::limit($baru, 255, '')]
        );
    }

    public function storeCatatan(
        Request $request,
        PreventifChecksheet $preventifChecksheet,
        int $abnormality
    ) {
        $data = $request->validate([
            'catatan' => ['required', 'string', 'max:1000'],
        ]);

        $a = $this->abnormalityMilik($preventifChecksheet, $abnormality);

        AbnormalityCatatan::create([
            'check_sheet_abnormality_id' => $a->id,
            'catatan' => $data['catatan'],
            'oleh' => $request->user()?->name,
        ]);

        // catatan ikut tampil di Check Sheet Prediktif
        $this->salinCatatanKePrediktif($a, $data['catatan']);

        // ada kendala dicatat (mis. terkendala produksi) -> yang masih Open otomatis jadi Progress
        $pesan = 'Catatan progress berhasil ditambahkan.';

        if ($this->normalisasiStatus($a->status) === 'Open') {
            $a->update(['status' => 'Progress']);
            $pesan = 'Catatan ditambahkan, status abnormality menjadi Progress.';
        }

        return back()->with('success', $pesan);
    }
}