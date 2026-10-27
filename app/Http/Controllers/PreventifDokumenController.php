<?php

namespace App\Http\Controllers;

use App\Models\PreventifDokumen;
use App\Models\PreventifPengiriman;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\HeaderUtils;

class PreventifDokumenController extends Controller
{
    private const DISK = 'local'; // private, tidak bisa diakses langsung lewat URL

    /**
     * Upload satu atau banyak dokumen untuk satu tanggal.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => ['required', 'date'],
            'dokumen' => ['required', 'array', 'min:1', 'max:5'],
            'dokumen.*' => [
                'file',
                'mimes:pdf,jpg,jpeg,png,xls,xlsx,doc,docx',
                'max:102400', // 100 MB (satuan KB)
            ],
        ], [
            'dokumen.required' => 'Pilih minimal satu file.',
            'dokumen.max' => 'Maksimal 5 file sekali upload.',
            'dokumen.*.mimes' => 'Format file harus PDF, gambar (JPG/PNG), Word, atau Excel.',
            'dokumen.*.max' => 'Ukuran tiap file maksimal 100 MB.',
            'dokumen.*.uploaded' => 'File gagal diupload. Cek ukuran file dan batas upload server.',
        ]);

        $tanggal = Carbon::parse($request->tanggal);

        if ($this->terkunci($tanggal)) {
            return back()->withErrors([
                'dokumen' => 'Data tanggal ini sudah disetujui pimpinan, dokumen tidak bisa diubah.',
            ]);
        }

        $namaFile = [];

        foreach ($request->file('dokumen') as $file) {
            $path = $file->store(
                'preventif-dokumen/' . $tanggal->format('Y/m/d'),
                self::DISK
            );

            PreventifDokumen::create([
                'tanggal' => $tanggal->toDateString(),
                'nama_asli' => $file->getClientOriginalName(),
                'path' => $path,
                'mime' => $file->getClientMimeType(),
                'ukuran' => $file->getSize(),
                'diunggah_oleh' => $request->user()?->id,
            ]);

            $namaFile[] = $file->getClientOriginalName();
        }

        $this->catatRevisiDokumen(
            $tanggal,
            'Dokumen ditambahkan: ' . implode(', ', $namaFile),
            null,
            implode(', ', $namaFile),
            $request->user()?->id
        );

        return back()->with(
            'success',
            count($namaFile) . ' dokumen berhasil diupload untuk tanggal ' . $tanggal->format('d/m/Y') . '.'
        );
    }

    /**
     * Tampilkan dokumen langsung di browser (PDF & gambar).
     * Word/Excel tidak bisa ditampilkan browser, jadi diunduh.
     */
    public function lihat(PreventifDokumen $dokumen)
    {
        $disk = Storage::disk(self::DISK);

        abort_unless($disk->exists($dokumen->path), 404);

        $mime = $dokumen->mime ?: 'application/octet-stream';

        $bisaDitampilkan = $mime === 'application/pdf'
            || in_array($mime, ['image/jpeg', 'image/png'], true);

        if (! $bisaDitampilkan) {
            return response()->download(
                $disk->path($dokumen->path),
                $dokumen->nama_asli
            );
        }

        // Nama file aman untuk header (spasi, tanda kutip, karakter non-ASCII)
        $fallback = str_replace(['%', '/', '\\', '"'], '_', Str::ascii($dokumen->nama_asli));

        $disposition = HeaderUtils::makeDisposition(
            HeaderUtils::DISPOSITION_INLINE,
            $dokumen->nama_asli,
            $fallback
        );

        // response()->file(path, headers, disposition): hanya 3 argumen
        return response()->file($disk->path($dokumen->path), [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Download dokumen (dipakai admin dan pimpinan).
     */
    public function download(PreventifDokumen $dokumen)
    {
        $disk = Storage::disk(self::DISK);

        abort_unless($disk->exists($dokumen->path), 404);

        return response()->download(
            $disk->path($dokumen->path),
            $dokumen->nama_asli
        );
    }

    /**
     * Soft delete: baris diberi deleted_at, file fisik tetap aman di storage.
     */
    public function destroy(Request $request, PreventifDokumen $dokumen)
    {
        $tanggal = Carbon::parse($dokumen->tanggal);

        if ($this->terkunci($tanggal)) {
            return back()->withErrors([
                'dokumen' => 'Data tanggal ini sudah disetujui pimpinan, dokumen tidak bisa dihapus.',
            ]);
        }

        $nama = $dokumen->nama_asli;

        $dokumen->delete(); // soft delete

        $this->catatRevisiDokumen(
            $tanggal,
            'Dokumen dihapus: ' . $nama,
            $nama,
            null,
            $request->user()?->id
        );

        return back()->with('success', 'Dokumen "' . $nama . '" berhasil dihapus.');
    }

    // =====================================================
    // HELPER
    // =====================================================

    private function terkunci(Carbon $tanggal): bool
    {
        return PreventifPengiriman::query()
            ->whereDate('tanggal', $tanggal->toDateString())
            ->whereIn('status', ['disetujui', 'approved'])
            ->exists();
    }

    private function catatRevisiDokumen(
        Carbon $tanggal,
        string $keterangan,
        ?string $lama,
        ?string $baru,
        ?int $userId
    ): void {
        PreventifPengiriman::query()
            ->whereDate('tanggal', $tanggal->toDateString())
            ->bisaDirevisi()
            ->get()
            ->each(fn (PreventifPengiriman $pengiriman) => $pengiriman->catatRevisi(
                null,
                'Dokumen',
                'dokumen',
                $keterangan,
                $lama,
                $baru,
                $userId
            ));
    }
}