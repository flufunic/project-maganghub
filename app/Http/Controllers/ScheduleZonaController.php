<?php

namespace App\Http\Controllers;

use App\Models\ScheduleBaris;
use App\Models\ScheduleZona;
use Illuminate\Http\Request;

/**
 * CRUD zona. Nama Line zona dipakai sebagai nama baris di jadwal
 * (lewat ScheduleBaris::zona_id). Mengubah Nama Line otomatis mengubah
 * nama baris yang memakainya.
 */
class ScheduleZonaController extends Controller
{
    private function rules(): array
    {
        return [
            'no' => ['nullable', 'integer', 'min:1'],
            'zona' => ['required', 'string', 'max:20'],
            'nama_line' => ['required', 'string', 'max:150'],
            'jumlah_mesin' => ['required', 'integer', 'min:0'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $data['no'] = $data['no'] ?? ((int) ScheduleZona::max('no') + 1);

        $zona = ScheduleZona::create($data);

        return back()->with('success', "Zona {$zona->nama_line} berhasil ditambahkan.");
    }

    public function update(Request $request, ScheduleZona $zona)
    {
        $data = $request->validate($this->rules());
        $data['no'] = $data['no'] ?? $zona->no;

        $zona->update($data);

        return back()->with('success', "Zona {$zona->nama_line} berhasil diperbarui.");
    }

    public function destroy(ScheduleZona $zona)
    {
        $nama = $zona->nama_line;

        // baris jadwal yang memakai zona ini dilepas (nama kembali "Baris N"),
        // isian Plan-nya tetap aman
        ScheduleBaris::where('zona_id', $zona->id)->update(['zona_id' => null]);

        $zona->delete();

        return back()->with('success', "Zona {$nama} berhasil dihapus.");
    }
}
