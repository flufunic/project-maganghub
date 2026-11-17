<?php

namespace App\Http\Controllers\Mtc;

use App\Http\Controllers\Controller;
use App\Models\MtcRepair;
use App\Models\Rrf;
use App\Services\ImageCompressor;
use App\Services\MtcCallbackClient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Support\RrfNotifier;

class MtcRrfController extends Controller
{
    private const MAKS_FOTO = 5;

    private const SHIFT = ['A', 'B', 'Non Shift'];

    private const BISA_DIEDIT = ['draft', 'revisi'];

    private const STATUS_ADMIN = ['draft', 'menunggu_verifikasi', 'revisi', 'terverifikasi'];

    private const STATUS_PIMPINAN = ['menunggu_verifikasi', 'terverifikasi'];

    /* ================================================================
     | DAFTAR
     ================================================================ */

    public function index(Request $request)
    {
        $user     = $request->user();
        $isAdmin  = $user->role === 'admin';
        $statusOk = $isAdmin ? self::STATUS_ADMIN : self::STATUS_PIMPINAN;

        $query = Rrf::with(['mtcRepair'])->whereIn('status', $statusOk);

        if ($request->filled('status') && in_array($request->status, $statusOk, true)) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('rrf_no', 'like', "%{$search}%")
                    ->orWhereHas('mtcRepair', function ($repair) use ($search) {
                        $repair->where('machine', 'like', "%{$search}%")
                            ->orWhere('machine_no', 'like', "%{$search}%")
                            ->orWhere('problem', 'like', "%{$search}%")
                            ->orWhere('location', 'like', "%{$search}%");
                    });
            });
        }

        if (!$isAdmin) {
            $query->orderByRaw('CASE WHEN status = ? THEN 0 ELSE 1 END', ['menunggu_verifikasi']);
        }

        $query->latest('id');

        $ringkasan = Rrf::query()
            ->whereIn('status', $statusOk)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Mtc/Rrf/Index', [
            'rrfs' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
            'ringkasan'     => $ringkasan,
            'statusOptions' => $statusOk,
            'role'          => $user->role,
        ]);
    }

    /* ================================================================
     | DETAIL
     ================================================================ */

    public function show(Request $request, Rrf $rrf)
    {
        if ($request->user()->role === 'pimpinan') {
            abort_unless(in_array($rrf->status, self::STATUS_PIMPINAN, true), 404);
        }

        $rrf->load([
            'mtcRepair',
            'parts',
            'photos',
            'approvals.user:id,name',
            'statusLogs.user:id,name',
        ]);

        $repair = $rrf->mtcRepair;

        $serv = $rrf->serv_schedule_at
            ? Carbon::parse($rrf->serv_schedule_at)
            : null;

        $menit = $rrf->downtime_detik !== null
            ? intdiv((int) $rrf->downtime_detik, 60)
            : null;

        $fmt = function ($dt) {
            if (empty($dt)) {
                return null;
            }

            try {
                return \Carbon\Carbon::parse($dt)->format('d/m/Y H:i');
            } catch (\Throwable) {
                return null;
            }
        };

        // Supervisor = Pimpinan Maintenance yang memverifikasi
        $supervisor = $rrf->approvals
            ->where('status', 'disetujui')
            ->sortBy('id')
            ->last()?->user?->name;

        return Inertia::render('Mtc/Rrf/Show', [
            'role' => $request->user()->role,

            'rrf' => [
                'id'         => $rrf->id,
                'rrf_no'     => $rrf->rrf_no,
                'rev'        => $rrf->rev ?? 0,
                'status'     => $rrf->status,
                'created_at' => $fmt($rrf->created_at),
                'updated_at' => $rrf->updated_at ? \Carbon\Carbon::parse($rrf->updated_at)->format('Y-m-d H:i:s') : null,

                'serv_tanggal'    => $serv?->format('Y-m-d'),
                'serv_jam'        => $serv?->format('H:i'),
                'pic_nama'        => $rrf->pic_nama,
                'shift_kerja'     => $rrf->shift_kerja,
                'cause'           => $rrf->cause,
                'counter_measure' => $rrf->counter_measure,
                'remark'          => $rrf->remark,
                'downtime_menit'  => $menit,

                'req_start_raw' => $repair?->req_start_at ? \Carbon\Carbon::parse($repair->req_start_at)->format('Y-m-d H:i') : null,

                'callback_status'  => $repair?->callback_status,
                'callback_error'   => $repair?->callback_error,
                'callback_sent_at' => $fmt($repair?->callback_sent_at),
            ],

            'mtcRepair' => $repair ? [
                'qmos_repair_id'            => $repair->qmos_repair_id,
                'repair_date'               => $repair->repair_date?->format('d/m/Y'),
                'division_pelapor'          => $repair->division_pelapor,
                'location'                  => $repair->location,
                'machine'                   => $repair->machine,
                'machine_no'                => $repair->machine_no,
                'asset_no'                  => $repair->asset_no,
                'machine_class'             => $repair->machine_class,
                'machine_class_description' => $repair->machine_class_description,
                'jenis_permintaan'          => $repair->jenis_permintaan,
                'requested_by'              => $repair->requested_by,
                'submitted_by_frm'          => $repair->submitted_by_frm,
                'supervisor'                => $supervisor,
                'req_start_at'              => $fmt($repair->req_start_at),
                'req_finish_at'             => $fmt($serv), // Selesai permintaan = Serv. schedule // Selesai permintaan = Serv. schedule
                'problem'                   => $repair->problem,
                'request_activity'          => $repair->request_activity,
                'counter_measure'           => $repair->counter_measure,
            ] : null,

            'parts' => $rrf->parts->map(fn ($p) => [
                'id'         => $p->id,
                'part_name'  => $p->part_name,
                'model_type' => $p->model_type,
                'maker'      => $p->maker,
                'qty'        => $p->qty,
                'other'      => $p->other,
            ])->values(),

            'photos' => $rrf->photos->map(fn ($p) => [
                'id'   => $p->id,
                'tipe' => $p->tipe,
                'url'  => '/storage/' . ltrim($p->file_path, '/'),
            ])->values(),

            'approvals' => $rrf->approvals->sortBy('id')->map(fn ($a) => [
                'id'       => $a->id,
                'status'   => $a->status,
                'catatan'  => $a->catatan,
                'acted_at' => $fmt($a->acted_at),
                'user'     => ['name' => $a->user?->name],
            ])->values(),

            'statusLogs' => $rrf->statusLogs->sortBy('id')->map(fn ($l) => [
                'id'          => $l->id,
                'status_baru' => $l->status_baru,
                'catatan'     => $l->catatan,
                'created_at'  => $fmt($l->created_at),
                'user'        => ['name' => $l->user?->name],
            ])->values(),

            'shiftOptions' => self::SHIFT,
        ]);
    }

    /* ================================================================
     | BUAT RRF DARI DATA QMOS
     ================================================================ */

    public function buatDariRepair(MtcRepair $repair)
    {
        $rrf = DB::transaction(function () use ($repair) {
            $repair = MtcRepair::whereKey($repair->id)->lockForUpdate()->firstOrFail();

            if ($repair->rrf()->exists()) {
                throw ValidationException::withMessages([
                    'repair' => 'Data Repair QMOS ini sudah memiliki RRF.',
                ]);
            }

            $user = Auth::user();

            $rrf = Rrf::create([
                'mtc_repair_id'    => $repair->id,
                'jenis_permintaan' => $repair->jenis_permintaan ?: 'troubleshooting',
                'req_schedule_at'  => $repair->req_start_at,
                'problem'          => $repair->problem ?: '-',
                'created_by'       => $user->id,
                'status'           => 'draft',
            ]);

            $rrf->update([
                'rrf_no' => 'RRF-MTC-' . now()->format('Ym') . '-'
                    . str_pad($rrf->id, 5, '0', STR_PAD_LEFT),
            ]);

            if ($repair->part_name) {
                $rrf->parts()->create([
                    'part_name'  => $repair->part_name,
                    'model_type' => $repair->part_model_type,
                    'qty'        => 1,
                ]);
            }

            $repair->update(['rrf_status' => 'draft']);

            $rrf->statusLogs()->create([
                'status_lama' => null,
                'status_baru' => 'draft',
                'user_id'     => $user->id,
                'catatan'     => 'RRF dibuat dari data Repair QMOS.',
            ]);

            return $rrf;
        });

        return redirect()
            ->route('mtc.rrf.show', $rrf->id)
            ->with('success', 'RRF berhasil dibuat. Silakan lengkapi data Maintenance.');
    }

    /* ================================================================
     | SIMPAN (draft) atau SIMPAN & KIRIM ke Pimpinan  (Admin)
     ================================================================ */

    public function simpan(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        abort_unless($user?->role === 'admin', 403);

        $kirim = $request->boolean('kirim');
        $wajib = $kirim ? 'required' : 'nullable';

        $data = $request->validate([
            'serv_tanggal'    => ['required', 'date'],
            'serv_jam'        => ['required', 'date_format:H:i'],
            'pic_nama'        => [$wajib, 'string', 'max:255'],
            'shift_kerja'     => [$wajib, Rule::in(self::SHIFT)],
            'cause'           => [$wajib, 'string', 'max:2000'],
            'counter_measure' => ['nullable', 'string', 'max:2000'],
            'remark'          => [$wajib, 'string', 'max:2000'],

            'parts'              => ['nullable', 'array', 'max:10'],
            'parts.*.part_name'  => ['nullable', 'string', 'max:255'],
            'parts.*.model_type' => ['nullable', 'string', 'max:255'],
            'parts.*.maker'      => ['nullable', 'string', 'max:255'],
            'parts.*.qty'        => ['nullable', 'integer', 'min:1', 'max:9999'],
            'parts.*.other'      => ['nullable', 'string', 'max:255'],

            'fotos_before'   => ['nullable', 'array', 'max:' . self::MAKS_FOTO],
            'fotos_before.*' => ['image', 'max:5120'],
            'fotos_after'    => ['nullable', 'array', 'max:' . self::MAKS_FOTO],
            'fotos_after.*'  => ['image', 'max:5120'],

            'hapus_foto_ids'   => ['nullable', 'array'],
            'hapus_foto_ids.*' => ['integer'],
        ], [
            'serv_tanggal.required' => 'Tanggal serv. schedule harus diisi.',
            'serv_jam.required'     => 'Jam serv. schedule harus diisi.',
            'serv_jam.date_format'  => 'Format jam harus HH:MM.',
            'pic_nama.required'     => 'Nama PIC MTC (Man) harus diisi.',
            'shift_kerja.required'  => 'Shift harus dipilih.',
            'cause.required'        => 'Cause (penyebab) harus diisi.',
            'remark.required'       => 'Remark harus diisi.',
            'fotos_before.*.image'  => 'File foto before harus berupa gambar.',
            'fotos_after.*.image'   => 'File foto after harus berupa gambar.',
            'fotos_before.*.max'    => 'Ukuran tiap foto maksimal 5 MB.',
            'fotos_after.*.max'     => 'Ukuran tiap foto maksimal 5 MB.',
        ]);

        $serv      = Carbon::parse($data['serv_tanggal'] . ' ' . $data['serv_jam']);
        $parts     = $this->olahParts($data);
        $gantiPart = $request->has('parts');
        $hapusIds  = collect($data['hapus_foto_ids'] ?? [])->map(fn ($i) => (int) $i)->all();
        $stored    = [];
        $hapusPath = [];

        try {
            DB::transaction(function () use (
                $rrf, $user, $data, $serv, $parts, $gantiPart,
                $hapusIds, $kirim, $request, &$stored, &$hapusPath
            ) {
                $fresh = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

                if (!in_array($fresh->status, self::BISA_DIEDIT, true)) {
                    throw ValidationException::withMessages([
                        'aksi' => 'RRF tidak dapat diedit pada status ini. Muat ulang halaman.',
                    ]);
                }

                foreach (['before', 'after'] as $tipe) {
                    $sisa = $fresh->photos()
                        ->where('tipe', $tipe)
                        ->whereNotIn('id', $hapusIds)
                        ->count();

                    $baru = count($request->file("fotos_{$tipe}", []));

                    if ($sisa + $baru > self::MAKS_FOTO) {
                        throw ValidationException::withMessages([
                            "fotos_{$tipe}" => "Foto {$tipe} maksimal " . self::MAKS_FOTO . '.',
                        ]);
                    }
                }

                $mulai = MtcRepair::find($fresh->mtc_repair_id)?->req_start_at;
                $menit = null;

                if ($mulai) {
                    $selisih = max(0, $serv->getTimestamp() - $mulai->getTimestamp());
                    $menit   = (int) round($selisih / 60);
                }

                // forceFill: tidak bergantung pada $fillable model Rrf
                $fresh->forceFill([
                    'serv_schedule_at'  => $serv,
                    'stop_line_at'      => $serv,
                    'downtime_detik'    => $menit !== null ? $menit * 60 : null,
                    'time_repair_detik' => $menit !== null ? $menit * 60 : null,
                    'pic_nama'          => isset($data['pic_nama'])
                        ? trim(preg_replace('/\s+/', ' ', $data['pic_nama']))
                        : null,
                    'shift_kerja'       => $data['shift_kerja'] ?? null,
                    'cause'             => $data['cause'] ?? null,
                    'counter_measure'   => $data['counter_measure'] ?? null,
                    'remark'            => $data['remark'] ?? null,
                ])->save();

                if ($gantiPart) {
                    $fresh->parts()->delete();

                    foreach ($parts as $p) {
                        $fresh->parts()->create($p);
                    }
                }

                foreach ($fresh->photos()->whereIn('id', $hapusIds)->get() as $foto) {
                    $hapusPath[] = $foto->file_path;
                    $foto->delete();
                }

                foreach (['before', 'after'] as $tipe) {
                    foreach ($request->file("fotos_{$tipe}", []) as $file) {
                        try {
                            $path = app(ImageCompressor::class)->simpan($file, "rrf/{$tipe}", 'public');
                        } catch (\Throwable $e) {
                            report($e);

                            throw ValidationException::withMessages([
                                "fotos_{$tipe}" => 'Salah satu foto tidak bisa diproses. Coba foto lain.',
                            ]);
                        }

                        $stored[] = $path;

                        $fresh->photos()->create([
                            'tipe'        => $tipe,
                            'file_path'   => $path,
                            'uploaded_by' => $user->id,
                        ]);
                    }
                }

                if ($kirim) {
                    $this->ubahKeMenungguVerifikasi($fresh, $user->id, $menit);
                }
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($stored);
            throw $e;
        }

        Storage::disk('public')->delete($hapusPath);

        return back()->with(
            'success',
            $kirim
                ? 'RRF disimpan dan dikirim kepada Pimpinan Maintenance.'
                : 'Data Maintenance berhasil disimpan.'
        );
    }

    public function kirim(Request $request, Rrf $rrf)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        if (!in_array($rrf->status, self::BISA_DIEDIT, true)) {
            return back()->with('error', 'RRF tidak dapat dikirim pada status ini.');
        }

        $kurang = [];

        if (!$rrf->serv_schedule_at) $kurang[] = 'Serv. schedule';
        if (!$rrf->pic_nama)         $kurang[] = 'PIC MTC (Man)';
        if (!$rrf->shift_kerja)      $kurang[] = 'Shift';
        if (!$rrf->cause)            $kurang[] = 'Cause';
        if (!$rrf->remark)           $kurang[] = 'Remark';

        if ($kurang) {
            return back()->with('error', 'Lengkapi dulu: ' . implode(', ', $kurang) . '.');
        }

        DB::transaction(function () use ($rrf, $request) {
            $fresh = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

            if (!in_array($fresh->status, self::BISA_DIEDIT, true)) {
                throw ValidationException::withMessages([
                    'aksi' => 'Status RRF sudah berubah. Muat ulang halaman.',
                ]);
            }

            $menit = $fresh->downtime_detik !== null ? intdiv((int) $fresh->downtime_detik, 60) : null;

            $this->ubahKeMenungguVerifikasi($fresh, $request->user()->id, $menit);
        });

        return back()->with('success', 'RRF berhasil dikirim kepada Pimpinan Maintenance.');
    }

    /* ================================================================
     | AKSI PIMPINAN
     ================================================================ */

    public function verifikasi(Request $request, Rrf $rrf)
    {
        abort_unless($request->user()?->role === 'pimpinan', 403);

        $validated = $request->validate([
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $catatan = trim((string) ($validated['catatan'] ?? ''));

        $sukses = DB::transaction(function () use ($rrf, $catatan) {
            $fresh = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

            if ($fresh->status !== 'menunggu_verifikasi') {
                return false;
            }

            $statusLama = $fresh->status;

            $fresh->approvals()->create([
                'tahap'    => 'pimpinan_mtc',
                'user_id'  => Auth::id(),
                'status'   => 'disetujui',
                'catatan'  => $catatan !== '' ? $catatan : null,
                'acted_at' => now(),
            ]);

            $fresh->update(['status' => 'terverifikasi']);

            $fresh->mtcRepair()->update([
                'rrf_status'      => 'terverifikasi',
                'callback_status' => 'pending',
            ]);

            $fresh->statusLogs()->create([
                'status_lama' => $statusLama,
                'status_baru' => 'terverifikasi',
                'user_id'     => Auth::id(),
                'catatan'     => $catatan !== '' ? $catatan : 'RRF diverifikasi Pimpinan Maintenance.',
            ]);

            RrfNotifier::keAdmin(
                $fresh,
                'RRF Sudah Terverifikasi',
                "RRF {$fresh->rrf_no} telah diverifikasi oleh Pimpinan Maintenance."
                    . ($catatan !== '' ? " Catatan: {$catatan}" : ''),
                Auth::id()
            );

            return true;
        });

        if (!$sukses) {
            return back()->with('error', 'RRF tidak sedang menunggu verifikasi.');
        }

        // Callback ke QMOS setelah data tersimpan; kegagalan tidak membatalkan verifikasi.
        [$ok, $error] = app(MtcCallbackClient::class)->kirim($rrf->fresh(['mtcRepair', 'parts']));

        if ($ok) {
            return back()->with('success', 'RRF berhasil diverifikasi dan hasilnya sudah dikirim ke QMOS.');
        }

        return back()->with(
            'error',
            'RRF terverifikasi, tetapi pengiriman ke QMOS gagal: ' . $error . ' Gunakan tombol "Kirim ulang ke QMOS".'
        );
    }

    
    public function kembalikan(Request $request, Rrf $rrf)
    {
        abort_unless($request->user()?->role === 'pimpinan', 403);

        $validated = $request->validate([
            'catatan' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'catatan.required' => 'Alasan pengembalian harus diisi.',
            'catatan.min' => 'Alasan pengembalian minimal 5 karakter.',
        ]);

        $alasan = trim($validated['catatan']);

        $sukses = DB::transaction(function () use ($rrf, $alasan) {

            $fresh = Rrf::whereKey($rrf->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Pastikan RRF masih menunggu verifikasi.
            if ($fresh->status !== 'menunggu_verifikasi') {
                return false;
            }

            $statusLama = $fresh->status;

            // Simpan riwayat keputusan Pimpinan.
            $fresh->approvals()->create([
                'tahap' => 'pimpinan_mtc',
                'user_id' => Auth::id(),
                'status' => 'ditolak',
                'catatan' => $alasan,
                'acted_at' => now(),
            ]);

            // Ubah status RRF menjadi revisi.
            $fresh->update([
                'status' => 'revisi',
            ]);

            // Sinkronkan status pada data Repair QMOS.
            $fresh->mtcRepair()->update([
                'rrf_status' => 'revisi',
            ]);

            // Simpan riwayat perubahan status.
            $fresh->statusLogs()->create([
                'status_lama' => $statusLama,
                'status_baru' => 'revisi',
                'user_id' => Auth::id(),
                'catatan' => $alasan,
            ]);

            // Kirim notifikasi kepada Admin.
            RrfNotifier::keAdmin(
                $fresh,
                'RRF Ditolak, Perlu Revisi',
                "RRF {$fresh->rrf_no} dikembalikan oleh Pimpinan. Alasan: {$alasan}",
                Auth::id()
            );

            return true;
        });

        if (!$sukses) {
            return redirect()
                ->route('mtc.rrf.index')
                ->with('error', 'RRF tidak sedang menunggu verifikasi.');
        }

        // PENTING:
        // Jangan gunakan back() karena halaman detail Pimpinan
        // tidak mengizinkan RRF dengan status revisi.
        return redirect()
            ->route('mtc.rrf.index')
            ->with('success', 'RRF berhasil dikembalikan kepada Admin untuk direvisi.');
    }

    /** Kirim ulang hasil ke QMOS (Admin atau Pimpinan) bila callback sebelumnya gagal. */
    public function callbackUlang(Request $request, Rrf $rrf)
    {
        abort_unless(in_array($request->user()?->role, ['admin', 'pimpinan'], true), 403);

        if ($rrf->status !== 'terverifikasi') {
            return back()->with('error', 'Hanya RRF yang sudah terverifikasi yang dikirim ke QMOS.');
        }

        [$ok, $error] = app(MtcCallbackClient::class)->kirim($rrf->fresh(['mtcRepair', 'parts']));

        return $ok
            ? back()->with('success', 'Hasil berhasil dikirim ke QMOS.')
            : back()->with('error', 'Pengiriman ke QMOS gagal: ' . $error);
    }

    /* ================================================================
     | PEMBANTU
     ================================================================ */

    
    private function ubahKeMenungguVerifikasi(
        Rrf $rrf,
        int $userId,
        ?int $menit
    ): void {
        $lama = $rrf->status;

        $rrf->update([
            'status' => 'menunggu_verifikasi',
        ]);

        $rrf->mtcRepair()->update([
            'rrf_status' => 'menunggu_verifikasi',
        ]);

        $rrf->statusLogs()->create([
            'status_lama' => $lama,
            'status_baru' => 'menunggu_verifikasi',
            'user_id'     => $userId,
            'catatan'     => 'RRF dikirim kepada Pimpinan Maintenance.'
                . ($menit !== null ? " Down time {$menit} menit." : ''),
        ]);

        // Kirim notifikasi kepada seluruh Pimpinan aktif.
        RrfNotifier::kePimpinan(
            $rrf,
            'RRF Baru Menunggu Verifikasi',
            "RRF {$rrf->rrf_no} telah dikirim oleh Admin dan menunggu verifikasi Anda."
        );
    }


    private function olahParts(array $data)
    {
        return collect($data['parts'] ?? [])
            ->filter(fn ($p) => filled($p['part_name'] ?? null))
            ->map(fn ($p) => [
                'part_name'  => trim($p['part_name']),
                'model_type' => $p['model_type'] ?? null,
                'maker'      => $p['maker'] ?? null,
                'qty'        => (int) ($p['qty'] ?? 1) ?: 1,
                'other'      => $p['other'] ?? null,
            ])
            ->values();
    }
}