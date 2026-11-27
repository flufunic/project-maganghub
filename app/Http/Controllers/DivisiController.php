<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Models\Divisi;
use App\Models\Line;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DivisiController extends Controller
{
    public function index()
    {
        return Inertia::render('Divisi/Index', [
            'divisis' => Divisi::orderBy('nama_divisi')->get(),
            'lines'   => Line::orderBy('divisi_id')->orderBy('id')->get(),

            // check sheet = 1 mesin, menempel ke 1 line
            'checkSheets' => CheckSheet::orderBy('line_id')
                ->orderBy('id')
                ->get(['id', 'divisi_id', 'line_id', 'kode', 'nomor_dokumen', 'nama_checksheet']),
        ]);
    }

    /**
     * Tambah divisi + daftar line-nya sekaligus.
     * Check sheet (mesin) dibuat per line setelah divisi tersimpan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_divisi' => ['required', 'string', 'max:100', 'unique:divisis,nama_divisi'],
            'daftar_line' => ['required', 'string'],
        ], [
            'nama_divisi.unique'   => 'Nama divisi sudah dipakai.',
            'daftar_line.required' => 'Isi minimal satu nama line.',
        ]);

        // satu baris textarea = satu line
        $namaLines = collect(preg_split('/\r\n|\r|\n/', $validated['daftar_line']))
            ->map(fn ($n) => trim($n))
            ->filter()
            ->unique()
            ->values();

        if ($namaLines->isEmpty()) {
            throw ValidationException::withMessages([
                'daftar_line' => 'Isi minimal satu nama line.',
            ]);
        }

        DB::transaction(function () use ($validated, $namaLines) {
            $divisi = new Divisi();
            $divisi->nama_divisi = trim($validated['nama_divisi']);
            $divisi->save();

            foreach ($namaLines as $nama) {
                $this->simpanLine($divisi, $nama);
            }
        });

        return back()->with('success', 'Divisi berhasil ditambahkan. Sekarang tambahkan check sheet (mesin) di tiap line.');
    }

    public function update(Request $request, Divisi $divisi)
    {
        $validated = $request->validate([
            'nama_divisi' => ['required', 'string', 'max:100', 'unique:divisis,nama_divisi,' . $divisi->id],
        ], [
            'nama_divisi.unique' => 'Nama divisi sudah dipakai.',
        ]);

        $divisi->nama_divisi = trim($validated['nama_divisi']);
        $divisi->save();

        return back()->with('success', 'Nama divisi berhasil diperbarui.');
    }

    public function destroy(Divisi $divisi)
    {
        $adaCheckSheet = DB::table('check_sheets')
            ->where('divisi_id', $divisi->id)
            ->whereNull('deleted_at')
            ->exists();

        if ($adaCheckSheet) {
            throw ValidationException::withMessages([
                'hapus' => 'Divisi masih punya check sheet. Hapus check sheet-nya dulu.',
            ]);
        }

        DB::transaction(function () use ($divisi) {
            Line::where('divisi_id', $divisi->id)->delete();
            $divisi->delete();
        });

        return back()->with('success', 'Divisi berhasil dihapus.');
    }

    // ---------------- LINE ----------------

    public function storeLine(Request $request, Divisi $divisi)
    {
        $validated = $request->validate([
            'nama_line' => ['required', 'string', 'max:100'],
        ]);

        $nama = trim($validated['nama_line']);

        $sudahAda = Line::where('divisi_id', $divisi->id)
            ->where('nama_line', $nama)
            ->exists();

        if ($sudahAda) {
            throw ValidationException::withMessages([
                'nama_line' => 'Nama line sudah ada di divisi ini.',
            ]);
        }

        $this->simpanLine($divisi, $nama);

        return back()->with('success', 'Line berhasil ditambahkan.');
    }

    public function destroyLine(Line $line)
    {
        $dipakai =
            DB::table('check_sheets')->where('line_id', $line->id)->whereNull('deleted_at')->exists()
            || DB::table('check_sheet_checklists')->where('line_id', $line->id)->exists()
            || DB::table('check_sheet_abnormalities')->where('line_id', $line->id)->exists();

        if ($dipakai) {
            throw ValidationException::withMessages([
                'hapus' => 'Line masih punya check sheet / data isian, tidak bisa dihapus.',
            ]);
        }

        $line->delete();

        return back()->with('success', 'Line berhasil dihapus.');
    }

    // ---------------- HELPER ----------------

    // Semua line sekarang per mesin: tiap check sheet menempel ke 1 line
    private function simpanLine(Divisi $divisi, string $nama): Line
    {
        $line = new Line();
        $line->divisi_id = $divisi->id;
        $line->nama_line = $nama;
        $line->per_mesin = true;
        $line->kode      = $this->buatKode($divisi->nama_divisi, $nama);
        $line->save();

        return $line;
    }

    // Kode line unik & huruf besar, contoh: "SEWING-D14N"
    // (barcode yang dicetak sekarang memakai kode check sheet, bukan kode line)
    private function buatKode(string $divisi, string $nama): string
    {
        $dasar = Str::upper(Str::slug($divisi . ' ' . $nama, '-'));
        $kode  = $dasar;
        $i     = 2;

        while (Line::where('kode', $kode)->exists()) {
            $kode = $dasar . '-' . $i++;
        }

        return $kode;
    }
}