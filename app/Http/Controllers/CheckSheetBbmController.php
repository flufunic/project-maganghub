<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\CheckSheetBbmItem;
use App\Models\CheckSheetBbmWeek;
use Illuminate\Http\Request;

class CheckSheetBbmController extends Controller
{
    private function rulesItem(): array
    {
        return [
            'nama_item'       => ['required', 'string', 'max:255'],
            'kapasitas'       => ['nullable', 'string', 'max:100'],
            'solar_per_menit' => ['required', 'numeric', 'min:0', 'max:9999'],
        ];
    }

    public function storeItem(Request $request, CheckSheet $checkSheet)
    {
        $validated = $request->validate($this->rulesItem());

        $validated['no'] = ((int) $checkSheet->bbmItems()->max('no')) + 1;

        $checkSheet->bbmItems()->create($validated);

        return back()->with('success', 'Item bahan bakar berhasil ditambahkan.');
    }

    public function updateItem(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate($this->rulesItem());

        $this->cariItem($checkSheet, $item)->update($validated);

        return back()->with('success', 'Item bahan bakar berhasil diperbarui.');
    }

    public function destroyItem(CheckSheet $checkSheet, int $item)
    {
        $this->cariItem($checkSheet, $item)->delete();

        $checkSheet->bbmItems()
            ->orderBy('no')->orderBy('id')
            ->get()
            ->each(function ($row, $i) {
                if ((int) $row->no !== $i + 1) {
                    $row->forceFill(['no' => $i + 1])->save();
                }
            });

        return back()->with('success', 'Item bahan bakar berhasil dihapus.');
    }

    /**
     * Running hours milik tabel BBM (terpisah dari tabel Running Hours).
     */
    public function storeRunning(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'tahun'         => ['required', 'integer', 'between:2000,2100'],
            'bulan'         => ['required', 'integer', 'between:1,12'],
            'week'          => ['required', 'integer', 'between:1,5'],
            'running_hours' => ['nullable', 'numeric', 'min:0', 'max:168'],
        ]);

        $it = $this->cariItem($checkSheet, $item);

        $row = CheckSheetBbmWeek::firstOrNew([
            'bbm_item_id' => $it->id,
            'tahun'       => $validated['tahun'],
            'bulan'       => $validated['bulan'],
            'week'        => $validated['week'],
        ]);

        if (($validated['running_hours'] ?? null) === null) {
            if ($row->exists) {
                $row->delete();
            }

            return back();
        }

        $row->running_hours = $validated['running_hours'];
        $row->save();

        return back();
    }

    private function cariItem(CheckSheet $checkSheet, int $item): CheckSheetBbmItem
    {
        return $checkSheet->bbmItems()->where('id', $item)->firstOrFail();
    }
}