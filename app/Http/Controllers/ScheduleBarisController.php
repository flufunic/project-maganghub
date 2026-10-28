<?php

namespace App\Http\Controllers;

use App\Models\ScheduleBaris;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Tambah / ubah nama / hapus (soft delete) baris Plan-Act pada jadwal. */
class ScheduleBarisController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'tahun' => ['required', 'integer', 'between:2000,2100'],
            'nama' => ['nullable', 'string', 'max:100'],
        ]);

        $urutan = (int) ScheduleBaris::where('tahun', $data['tahun'])->max('urutan') + 1;

        ScheduleBaris::create([
            'tahun' => $data['tahun'],
            'urutan' => $urutan,
            'nama' => $data['nama'] ?? null,
        ]);

        return back()->with('success', 'Baris jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, ScheduleBaris $baris)
    {
        $data = $request->validate([
            'nama' => ['nullable', 'string', 'max:100'],
        ]);

        $baris->update(['nama' => $data['nama'] ?? null]);

        return back()->with('success', 'Nama baris berhasil diperbarui.');
    }

    public function destroy(ScheduleBaris $baris)
    {
        // tahun yang sama harus tetap punya minimal 1 baris
        if (ScheduleBaris::where('tahun', $baris->tahun)->count() <= 1) {
            throw ValidationException::withMessages([
                'baris' => 'Minimal harus ada 1 baris jadwal.',
            ]);
        }

        $baris->delete();   // soft delete

        return back()->with('success', 'Baris jadwal berhasil dihapus.');
    }
}
