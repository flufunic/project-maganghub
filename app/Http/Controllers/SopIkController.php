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
    public function index()
    {
        $documents = SopDocument::with('revisions')
            ->orderBy('id')
            ->get()
            ->map(fn ($doc) => [
                'id'             => $doc->id,
                'no_dok'         => $doc->no_dok,
                'proses'         => $doc->proses,
                'proses_penting' => $doc->proses_penting,
                'tanggal_revisi' => $doc->tanggal_revisi?->format('Y-m-d'), // inputan manual
                'revisions'      => $doc->revisions->map(fn ($r) => [
                    'id'         => $r->id,
                    'revisi_ke'  => $r->revisi_ke,
                    'tanggal'    => $r->tanggal_revisi->format('Y-m-d'),     // otomatis saat upload/edit
                    'catatan'    => $r->catatan,
                    'file_name'  => $r->file_name,
                    'file_url'   => url("/sop-ik/revisions/{$r->id}/file"),
                ])->values(),
            ]);

        return Inertia::render('SopIk/Index', [
            'documents' => $documents,
            'flash'     => ['success' => session('success')],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'no_dok'         => ['required', 'string', 'max:100',
                Rule::unique('sop_documents', 'no_dok')->whereNull('deleted_at')],
            'proses'         => ['required', 'string', 'max:255'],
            'proses_penting' => ['nullable', 'string', 'max:255'],
            'tanggal_revisi' => ['nullable', 'date'],
            'file'           => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx', 'max:20480'],
        ], [
            'no_dok.unique' => 'No dokumen sudah digunakan.',
            'file.required' => 'File dokumen wajib diupload.',
        ]);

        DB::transaction(function () use ($data, $request) {
            $doc = SopDocument::create([
                'no_dok'         => trim($data['no_dok']),
                'proses'         => $data['proses'],
                'proses_penting' => $data['proses_penting'] ?? null,
                'tanggal_revisi' => $data['tanggal_revisi'] ?? null,
            ]);

            // Versi pertama = dokumen awal (tanpa catatan, tidak masuk kolom keterangan)
            $this->addRevision($doc, $request, 1, null);
        });

        return back()->with('success', 'Dokumen berhasil ditambahkan.');
    }

    public function update(Request $request, SopDocument $sopDocument)
    {
        $hasFile = $request->hasFile('file');

        $data = $request->validate([
            'no_dok'         => ['required', 'string', 'max:100',
                Rule::unique('sop_documents', 'no_dok')
                    ->ignore($sopDocument->id)->whereNull('deleted_at')],
            'proses'         => ['required', 'string', 'max:255'],
            'proses_penting' => ['nullable', 'string', 'max:255'],
            'tanggal_revisi' => ['nullable', 'date'],
            'file'           => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx', 'max:20480'],
            'catatan'        => [$hasFile ? 'required' : 'nullable', 'string'],
        ], [
            'no_dok.unique'    => 'No dokumen sudah digunakan.',
            'catatan.required' => 'Catatan revisi wajib diisi saat upload dokumen baru.',
        ]);

        DB::transaction(function () use ($data, $request, $sopDocument, $hasFile) {
            $sopDocument->update([
                'no_dok'         => trim($data['no_dok']),
                'proses'         => $data['proses'],
                'proses_penting' => $data['proses_penting'] ?? null,
                'tanggal_revisi' => $data['tanggal_revisi'] ?? null,
            ]);

            if ($hasFile) {
                // termasuk yang soft-deleted, supaya nomor versi tidak bentrok
                $next = SopDocumentRevision::withTrashed()
                    ->where('sop_document_id', $sopDocument->id)
                    ->max('revisi_ke') + 1;

                $this->addRevision($sopDocument, $request, $next, $data['catatan']);
            }
        });

        return back()->with('success', 'Dokumen berhasil diperbarui.');
    }

    // Buka / unduh file versi dokumen (disk private, hanya user login)
    public function file(SopDocumentRevision $revision)
    {
        abort_unless(Storage::disk('local')->exists($revision->file_path), 404);

        return response()->download(
            Storage::disk('local')->path($revision->file_path),
            $revision->file_name
        );
    }

    // Hapus seluruh data (soft delete dokumen + semua versinya)
    public function destroy(SopDocument $sopDocument)
    {
        DB::transaction(function () use ($sopDocument) {
            $sopDocument->revisions()->delete();
            $sopDocument->delete();
        });

        return back()->with('success', 'Data dokumen dihapus.');
    }

    // Hapus satu versi dokumen saja (soft delete)
    public function destroyRevision(SopDocument $sopDocument, SopDocumentRevision $revision)
    {
        abort_unless($revision->sop_document_id === $sopDocument->id, 404);

        if ($sopDocument->revisions()->count() <= 1) {
            return back()->withErrors([
                'revision' => 'Ini versi terakhir. Gunakan "Hapus Seluruh Data" untuk menghapusnya.',
            ]);
        }

        $revision->delete();

        return back()->with('success', 'Versi dokumen dihapus.');
    }

    private function addRevision(SopDocument $doc, Request $request, int $revisiKe, ?string $catatan): void
    {
        $file = $request->file('file');

        $doc->revisions()->create([
            'revisi_ke'      => $revisiKe,
            'tanggal_revisi' => now()->toDateString(), // tanggal otomatis
            'catatan'        => $catatan,
            'file_path'      => $file->store('sop-ik', 'local'), // private
            'file_name'      => $file->getClientOriginalName(),
        ]);
    }
}
