<?php

namespace App\Http\Controllers;

use App\Models\PreventifDivisi;
use App\Models\PreventifMesin;
use Illuminate\Http\Request;

class PreventifDivisiController extends Controller
{
    public function store(Request $request)
    {
        // rapikan spasi ganda
        $request->merge([
            'nama' => trim(preg_replace('/\s+/', ' ', (string) $request->input('nama'))),
        ]);

        $request->validate([
            'nama' => ['required', 'string', 'max:50'],
        ], [
            'nama.required' => 'Nama divisi wajib diisi.',
            'nama.max' => 'Nama divisi maksimal 50 karakter.',
        ]);

        // cek duplikat tanpa peduli huruf besar/kecil
        $sudahAda = PreventifDivisi::whereRaw('LOWER(nama) = ?', [mb_strtolower($request->nama)])
            ->exists();

        if ($sudahAda) {
            return back()->withErrors(['nama' => 'Divisi tersebut sudah ada.']);
        }

        PreventifDivisi::create([
            'nama' => $request->nama,
            'urutan' => ((int) PreventifDivisi::max('urutan')) + 1,
            'warna' => PreventifDivisi::warnaBelumDipakai(),
        ]);

        return back()->with('success', 'Divisi berhasil ditambahkan.');
    }

    public function destroy(PreventifDivisi $divisi)
    {
        // item yang "dihapus" (is_hidden) tidak dihitung, tapi item aktif ya
        $dipakai = PreventifMesin::where('is_hidden', false)
            ->where('divisi', $divisi->nama)
            ->count();

        if ($dipakai > 0) {
            return back()->withErrors([
                'divisi' => "Divisi {$divisi->nama} masih dipakai oleh {$dipakai} item preventif. Pindahkan atau hapus item tersebut dulu.",
            ]);
        }

        $divisi->delete();

        return back()->with('success', 'Divisi berhasil dihapus.');
    }
}