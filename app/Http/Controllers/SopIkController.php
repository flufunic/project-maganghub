<?php

namespace App\Http\Controllers;

use App\Models\SopDocument;
use App\Models\SopDocumentRevision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SopIkController extends Controller
{
    /**
     * Menampilkan seluruh dokumen SOP/IK.
     */
    public function index()
    {
        $documents = SopDocument::with([
            'revisions' => function ($query) {
                $query
                    ->orderByDesc('tanggal_revisi')
                    ->orderByDesc('revisi_ke');
            },
        ])
            ->orderBy('id')
            ->get()
            ->map(fn ($doc) => [
                'id' => $doc->id,
                'no_dok' => $doc->no_dok,
                'proses' => $doc->proses,
                'proses_penting' => $doc->proses_penting,

                // Tanggal revisi manual pada data dokumen.
                'tanggal_revisi' => $doc->tanggal_revisi
                    ? $doc->tanggal_revisi->format('Y-m-d')
                    : null,

                // Riwayat revisi diurutkan terbaru terlebih dahulu.
                'revisions' => $doc->revisions
                    ->map(fn ($r) => [
                        'id' => $r->id,
                        'revisi_ke' => $r->revisi_ke,

                        'tanggal' => $r->tanggal_revisi
                            ? $r->tanggal_revisi->format('Y-m-d')
                            : null,

                        'catatan' => $r->catatan,
                        'file_name' => $r->file_name,
                        'file_url' => url("/sop-ik/revisions/{$r->id}/file"),
                    ])
                    ->values(),
            ])
            ->values();

        return Inertia::render('SopIk/Index', [
            'documents' => $documents,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    /**
     * Menambahkan dokumen baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'no_dok' => [
                'required',
                'string',
                'max:100',
                Rule::unique('sop_documents', 'no_dok')
                    ->whereNull('deleted_at'),
            ],

            'proses' => [
                'required',
                'string',
                'max:255',
            ],

            'proses_penting' => [
                'nullable',
                'string',
                'max:255',
            ],

            'tanggal_revisi' => [
                'nullable',
                'date',
            ],

            'file' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx',
                'max:20480',
            ],
        ], [
            'no_dok.unique' => 'No dokumen sudah digunakan.',
            'file.mimes' => 'Format file harus PDF, DOC, DOCX, XLS, atau XLSX.',
            'file.max' => 'Ukuran file maksimal 20 MB.',
        ]);

        DB::transaction(function () use ($data, $request) {
            $doc = SopDocument::create([
                'no_dok' => trim($data['no_dok']),
                'proses' => $data['proses'],
                'proses_penting' => $data['proses_penting'] ?? null,
                'tanggal_revisi' => $data['tanggal_revisi'] ?? null,
            ]);

            // File opsional.
            // Jika diunggah, menjadi versi pertama / dokumen awal.
            if ($request->hasFile('file')) {
                $this->addRevision(
                    $doc,
                    $request,
                    1,
                    null
                );
            }
        });

        return back()->with(
            'success',
            'Dokumen berhasil ditambahkan.'
        );
    }

    /**
     * Memperbarui informasi dokumen atau menambahkan revisi baru.
     */
    public function update(Request $request, SopDocument $sopDocument)
    {
        $hasFile = $request->hasFile('file');

        // Memeriksa apakah masih ada file aktif pada dokumen.
        $sudahAdaFile = $sopDocument->revisions()->exists();

        $data = $request->validate([
            'no_dok' => [
                'required',
                'string',
                'max:100',
                Rule::unique('sop_documents', 'no_dok')
                    ->ignore($sopDocument->id)
                    ->whereNull('deleted_at'),
            ],

            'proses' => [
                'required',
                'string',
                'max:255',
            ],

            'proses_penting' => [
                'nullable',
                'string',
                'max:255',
            ],

            'tanggal_revisi' => [
                'nullable',
                'date',
            ],

            'file' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx',
                'max:20480',
            ],

            'catatan' => [
                $hasFile && $sudahAdaFile
                    ? 'required'
                    : 'nullable',
                'string',
            ],
        ], [
            'no_dok.unique' => 'No dokumen sudah digunakan.',
            'catatan.required' => 'Catatan revisi wajib diisi saat upload dokumen baru.',
            'file.mimes' => 'Format file harus PDF, DOC, DOCX, XLS, atau XLSX.',
            'file.max' => 'Ukuran file maksimal 20 MB.',
        ]);

        DB::transaction(function () use (
            $data,
            $request,
            $sopDocument,
            $hasFile,
            $sudahAdaFile
        ) {
            // Perbarui informasi utama dokumen.
            $sopDocument->update([
                'no_dok' => trim($data['no_dok']),
                'proses' => $data['proses'],
                'proses_penting' => $data['proses_penting'] ?? null,
                'tanggal_revisi' => $data['tanggal_revisi'] ?? null,
            ]);

            // Jika ada file baru, buat versi revisi berikutnya.
            if ($hasFile) {
                // Mengambil nomor revisi terbesar,
                // termasuk revisi yang sudah soft delete.
                $nomorTerakhir = SopDocumentRevision::withTrashed()
                    ->where('sop_document_id', $sopDocument->id)
                    ->max('revisi_ke');

                $next = ($nomorTerakhir ?? 0) + 1;

                // Jika sebelumnya belum ada file aktif,
                // upload pertama menjadi dokumen awal.
                $catatan = $sudahAdaFile
                    ? $data['catatan']
                    : null;

                $this->addRevision(
                    $sopDocument,
                    $request,
                    $next,
                    $catatan
                );
            }
        });

        return back()->with(
            'success',
            'Dokumen berhasil diperbarui.'
        );
    }

    /**
     * Membuka file versi dokumen.
     *
     * File berada di disk local/private.
     */
    public function file(SopDocumentRevision $revision)
    {
        $disk = Storage::disk('local');

        abort_unless(
            $disk->exists($revision->file_path),
            404,
            'File dokumen tidak ditemukan.'
        );

        $path = $disk->path($revision->file_path);
        $mimeType = mime_content_type($path) ?: 'application/octet-stream';

        return response()->file($path, [
            'Content-Type' => $mimeType,

            'Content-Disposition' => 'inline; filename="' .
                addslashes($revision->file_name) . '"',
        ]);
    }

    /**
     * Menghapus seluruh dokumen beserta semua versinya.
     * Menggunakan soft delete.
     */
    public function destroy(SopDocument $sopDocument)
    {
        DB::transaction(function () use ($sopDocument) {
            // Soft delete seluruh revisi aktif.
            $sopDocument->revisions()->delete();

            // Soft delete dokumen utama.
            $sopDocument->delete();
        });

        return back()->with(
            'success',
            'Data dokumen beserta seluruh versinya berhasil dihapus.'
        );
    }

    /**
     * Menghapus satu versi dokumen.
     * Menggunakan soft delete.
     */
    public function destroyRevision(
        SopDocument $sopDocument,
        SopDocumentRevision $revision
    ) {
        // Pastikan versi tersebut milik dokumen yang dipilih.
        abort_unless(
            (int) $revision->sop_document_id === (int) $sopDocument->id,
            404
        );

        // Hitung jumlah versi yang masih aktif.
        $jumlahVersiAktif = $sopDocument->revisions()->count();

        // Versi terakhir tidak boleh dihapus satuan.
        if ($jumlahVersiAktif <= 1) {
            return back()->withErrors([
                'revision' => 'Ini versi terakhir. Gunakan "Hapus Seluruh Data" untuk menghapusnya.',
            ]);
        }

        $revision->delete();

        return back()->with(
            'success',
            'Versi dokumen berhasil dihapus.'
        );
    }

    /**
     * Menyimpan file sebagai versi dokumen baru.
     */
    private function addRevision(
        SopDocument $doc,
        Request $request,
        int $revisiKe,
        ?string $catatan
    ): void {
        $file = $request->file('file');

        if (!$file) {
            return;
        }

        // Simpan file di storage private.
        $filePath = $file->store('sop-ik', 'local');

        $doc->revisions()->create([
            'revisi_ke' => $revisiKe,

            // Tanggal upload otomatis.
            'tanggal_revisi' => now()->toDateString(),

            'catatan' => $catatan,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
        ]);
    }
}
