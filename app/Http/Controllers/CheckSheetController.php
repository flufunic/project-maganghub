<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use Illuminate\Http\Request;
use App\Models\Divisi;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use App\Models\CheckSheetItem;
use App\Models\CheckSheetChecklist;
use App\Models\CheckSheetAbnormality;
use Maatwebsite\Excel\Facades\Excel;

class CheckSheetController extends Controller
{
    public function index()
    {
        $checkSheets = CheckSheet::with('divisi')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('CheckSheet/Index', [
            'checkSheets' => $checkSheets,
        ]);
    }

        public function create()
    {
        $divisis = Divisi::orderBy('nama_divisi')->get();

        return Inertia::render('CheckSheet/Create', [
            'divisis' => $divisis,
        ]);
    }

        public function edit(CheckSheet $checkSheet)
    {
        $divisis = Divisi::orderBy('nama_divisi')->get();

        return Inertia::render('CheckSheet/Edit', [
            'checkSheet' => $checkSheet,
            'divisis' => $divisis,
        ]);
    }

        public function update(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'divisi_id' => [
                'required',
                'exists:divisis,id',
            ],
            'nomor_dokumen' => [
                'required',
                'string',
                'max:255',
                'unique:check_sheets,nomor_dokumen,' . $checkSheet->id,
            ],
            'nama_checksheet' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $checkSheet->update($validated);

        return redirect()
            ->route('check-sheets.index')
            ->with('success', 'Check Sheet berhasil diperbarui.');
    }

        public function destroy(CheckSheet $checkSheet)
    {
        $checkSheet->delete();

        return redirect()
            ->route('check-sheets.index')
            ->with('success', 'Check Sheet berhasil dihapus.');
    }

       public function store(Request $request)
    {
        $validated = $request->validate([
            'divisi_id' => [
                'required',
                'exists:divisis,id',
            ],
            'nomor_dokumen' => [
                'required',
                'string',
                'max:255',
                'unique:check_sheets,nomor_dokumen',
            ],
            'nama_checksheet' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        CheckSheet::create($validated);

        return redirect()
            ->route('check-sheets.index')
            ->with('success', 'Check Sheet berhasil ditambahkan.');
    }

        public function show(Request $request, CheckSheet $checkSheet): Response
    {
        $bulan = (int) ($request->bulan ?? now()->month);
        $tahun = (int) ($request->tahun ?? now()->year);

        $tanggalAwal = Carbon::create($tahun, $bulan, 1);
        $jumlahHari = $tanggalAwal->daysInMonth;

        $awalBulan = $tanggalAwal->copy()->startOfMonth();
        $akhirBulan = $tanggalAwal->copy()->endOfMonth();

        $checkSheet->load([
            'divisi',

            'items.checklists' => function ($query) use ($awalBulan, $akhirBulan) {
                $query->whereBetween('tanggal', [
                    $awalBulan->toDateString(),
                    $akhirBulan->toDateString(),
                ]);
            },

            'abnormalities',
        ]);

        $tanggal = [];

        for ($i = 1; $i <= $jumlahHari; $i++) {
            $tanggal[] = [
                'tanggal' => $i,
                'tanggal_lengkap' => Carbon::create(
                    $tahun,
                    $bulan,
                    $i
                )->format('Y-m-d'),
            ];
        }

        return Inertia::render('CheckSheet/Show', [
            'checkSheet' => $checkSheet,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'tanggal' => $tanggal,
        ]);
    }

        public function storeItem(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'no' => [
                'required',
                'integer',
                'min:1',
            ],
            'inspection_point' => [
                'required',
                'string',
            ],
            'condition' => [
                'nullable',
                'string',
            ],
            'method' => [
                'nullable',
                'string',
            ],
            'shift' => [
                'required',
                'in:A,B',
            ],
        ]);

        $checkSheet->items()->create($validated);

        return redirect()
            ->route('check-sheets.show', $checkSheet)
            ->with('success', 'Item pemeriksaan berhasil ditambahkan.');
    }

        public function updateItem(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'no' => [
                'required',
                'integer',
                'min:1',
            ],
            'inspection_point' => [
                'required',
                'string',
            ],
            'condition' => [
                'nullable',
                'string',
            ],
            'method' => [
                'nullable',
                'string',
            ],
            'shift' => [
                'required',
                'in:A,B',
            ],
        ]);

        $checkSheetItem = $checkSheet->items()
            ->where('id', $item)
            ->firstOrFail();

        $checkSheetItem->update($validated);

        return back()->with(
            'success',
            'Inspection Point berhasil diperbarui.'
        );
    }

        public function destroyItem(CheckSheet $checkSheet, int $item)
    {
        $checkSheetItem = $checkSheet->items()
            ->where('id', $item)
            ->firstOrFail();

        $checkSheetItem->delete();

        return back()->with(
            'success',
            'Inspection Point berhasil dihapus.'
        );
    }

        public function storeChecklist(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'check_sheet_item_id' => [
                'required',
                'exists:check_sheet_items,id',
            ],
            'tanggal' => [
                'required',
                'date',
            ],
            'status' => [
                'required',
                'boolean',
            ],
        ]);

        $item = $checkSheet->items()
            ->where('id', $validated['check_sheet_item_id'])
            ->firstOrFail();

        $checklist = $item->checklists()->updateOrCreate(
            [
                'tanggal' => $validated['tanggal'],
            ],
            [
                'status' => $validated['status'],
            ]
        );

        return back();
    }

        public function storeAbnormality(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate([
            'tanggal' => [
                'required',
                'date',
            ],
            'abnormality' => [
                'required',
                'string',
            ],
            'countermeasure' => [
                'nullable',
                'string',
            ],
            'status' => [
                'required',
                'string',
                'max:255',
            ],
            'pic' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $checkSheet->abnormalities()->create($validated);

        return back()->with(
            'success',
            'Abnormality berhasil ditambahkan.'
        );
    }

    public function updateAbnormality(
        Request $request,
        CheckSheet $checkSheet,
        int $abnormality
    ) {
        $validated = $request->validate([
            'tanggal' => [
                'required',
                'date',
            ],
            'abnormality' => [
                'required',
                'string',
            ],
            'countermeasure' => [
                'nullable',
                'string',
            ],
            'status' => [
                'required',
                'string',
                'max:255',
            ],
            'pic' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $checkSheetAbnormality = $checkSheet->abnormalities()
            ->where('id', $abnormality)
            ->firstOrFail();

        $checkSheetAbnormality->update($validated);

        return back()->with(
            'success',
            'Abnormality berhasil diperbarui.'
        );
    }

    public function destroyAbnormality(
        CheckSheet $checkSheet,
        int $abnormality
    ) {
        $checkSheetAbnormality = $checkSheet->abnormalities()
            ->where('id', $abnormality)
            ->firstOrFail();

        $checkSheetAbnormality->delete();

        return back()->with(
            'success',
            'Abnormality berhasil dihapus.'
        );
    }
        public function exportExcel(Request $request, CheckSheet $checkSheet)
    {
        $bulan = (int) $request->bulan;
        $tahun = (int) $request->tahun;

        return Excel::download(
            new \App\Exports\CheckSheetExport(
                $checkSheet->id,
                $bulan,
                $tahun
            ),
            'check-sheet-' . $checkSheet->id . '-' . $bulan . '-' . $tahun . '.xlsx'
        );
    }
}