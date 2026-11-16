<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\CheckSheetMonitoringItem;
use App\Models\CheckSheetMonitoringWeek;
use App\Services\ImageCompressor;
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
    // (upload biasa, drag & drop, dan paste dari clipboard
    //  semuanya masuk ke endpoint ini; foto otomatis dikompres <= 1 MB)
    // =====================================================

    public function storeFoto(Request $request, CheckSheet $checkSheet, int $item)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'integer', 'between:2000,2100'],
            'bulan' => ['required', 'integer', 'between:1,12'],
            'week'  => ['required', 'integer', 'between:1,5'],
            // batas upload dilonggarkan karena foto dikompres setelah diterima
            'foto'  => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ], [
            'foto.required' => 'Foto wajib dipilih.',
            'foto.image'    => 'File harus berupa gambar.',
            'foto.mimes'    => 'Format foto harus JPG, PNG, atau WEBP.',
            'foto.max'      => 'Ukuran foto maksimal 10 MB.',
        ]);

        $it = $this->cariItem($checkSheet, $item);

        $row = CheckSheetMonitoringWeek::firstOrNew([
            'monitoring_item_id' => $it->id,
            'tahun'              => $validated['tahun'],
            'bulan'              => $validated['bulan'],
            'week'               => $validated['week'],
        ]);

        // Simpan foto baru dulu. Kalau gagal, foto lama tetap aman.
        try {
            $pathBaru = app(ImageCompressor::class)->simpan(
                $request->file('foto'),
                "monitoring/{$checkSheet->id}",
                'public'
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->withErrors([
                'foto' => 'Foto tidak bisa diproses. Coba foto lain.',
            ]);
        }

        $pathLama = $row->foto_path;

        $row->foto_path = $pathBaru;
        $row->save();

        if ($pathLama) {
            Storage::disk('public')->delete($pathLama);
        }

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
