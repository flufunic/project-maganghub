<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\CheckSheetMonitoringItem;
use App\Models\CheckSheetMonitoringWeek;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CheckSheetMonitoringController extends Controller
{
    // =====================================================
    // ITEM (tabel Monitoring Running Hours)
    // =====================================================

    private function rulesItem(): array
    {
        return [
            'nama_item' => ['required', 'string', 'max:255'],
        ];
    }

    public function storeItem(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate($this->rulesItem());

        $validated['no'] = ((int) $checkSheet->monitoringItems()->max('no')) + 1;

        $checkSheet->monitoringItems()->create($validated);

        return back()->with('success', 'Item monitoring berhasil ditambahkan.');
    }

    public function updateItem(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate($this->rulesItem());

        $this->cariItem($checkSheet, $item)->update($validated);

        return back()->with('success', 'Item monitoring berhasil diperbarui.');
    }

    public function destroyItem(CheckSheet $checkSheet, int $item)
    {
        $this->cariItem($checkSheet, $item)->delete(); // soft delete

        $checkSheet->monitoringItems()
            ->orderBy('no')->orderBy('id')
            ->get()
            ->each(function ($row, $i) {
                if ((int) $row->no !== $i + 1) {
                    $row->forceFill(['no' => $i + 1])->save();
                }
            });

        return back()->with('success', 'Item monitoring berhasil dihapus.');
    }

    // =====================================================
    // ACTUAL RUNNING (input manual per minggu)
    // =====================================================

    public function storeRunning(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'tahun'         => ['required', 'integer', 'between:2000,2100'],
            'bulan'         => ['required', 'integer', 'between:1,12'],
            'week'          => ['required', 'integer', 'between:1,5'],
            'running_hours' => ['nullable', 'numeric', 'min:0', 'max:168'],
        ]);

        $it = $this->cariItem($checkSheet, $item);

        $row = CheckSheetMonitoringWeek::firstOrNew([
            'monitoring_item_id' => $it->id,
            'tahun'              => $validated['tahun'],
            'bulan'              => $validated['bulan'],
            'week'               => $validated['week'],
        ]);

        $row->running_hours = $validated['running_hours'] ?? null;

        $this->simpanAtauBersihkan($row);

        return back();
    }

    // =====================================================
    // FOTO PER MINGGU
    // =====================================================

    public function storeFoto(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'integer', 'between:2000,2100'],
            'bulan' => ['required', 'integer', 'between:1,12'],
            'week'  => ['required', 'integer', 'between:1,5'],
            'foto'  => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $it = $this->cariItem($checkSheet, $item);

        $row = CheckSheetMonitoringWeek::firstOrNew([
            'monitoring_item_id' => $it->id,
            'tahun'              => $validated['tahun'],
            'bulan'              => $validated['bulan'],
            'week'               => $validated['week'],
        ]);

        if ($row->foto_path) {
            Storage::disk('public')->delete($row->foto_path);
        }

        $row->foto_path = $request->file('foto')
            ->store("monitoring/{$checkSheet->id}", 'public');
        $row->save();

        return back()->with('success', 'Foto berhasil diupload.');
    }

    public function destroyFoto(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'integer'],
            'bulan' => ['required', 'integer'],
            'week'  => ['required', 'integer', 'between:1,5'],
        ]);

        $it = $this->cariItem($checkSheet, $item);

        $row = CheckSheetMonitoringWeek::where('monitoring_item_id', $it->id)
            ->where('tahun', $validated['tahun'])
            ->where('bulan', $validated['bulan'])
            ->where('week', $validated['week'])
            ->first();

        if ($row && $row->foto_path) {
            Storage::disk('public')->delete($row->foto_path);
            $row->foto_path = null;
            $this->simpanAtauBersihkan($row);
        }

        return back()->with('success', 'Foto berhasil dihapus.');
    }

    // =====================================================
    // HELPER
    // =====================================================

    private function simpanAtauBersihkan(CheckSheetMonitoringWeek $row): void
    {
        if ($row->running_hours === null && ! $row->foto_path) {
            if ($row->exists) {
                $row->delete();
            }

            return;
        }

        $row->save();
    }

    private function cariItem(CheckSheet $checkSheet, int $item): CheckSheetMonitoringItem
    {
        return $checkSheet->monitoringItems()->where('id', $item)->firstOrFail();
    }
}