<?php

namespace App\Http\Controllers;

use App\Models\Divisi;
use App\Models\Rrf;
use App\Models\RrfApproval;
use App\Models\RrfClass;
use App\Models\RrfNotification;
use App\Models\RrfStatusLog;
use App\Models\User;
use App\Support\RrfNotifier;
use App\Support\RrfPayload;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class RrfController extends Controller
{
    // Nilai kolom rrf_approvals.tahap untuk persetujuan SPV
    private const TAHAP_SPV = 'spv';

    // Maksimal foto before per RRF
    private const MAKS_FOTO = 5;

    /* ================================================================
     | DAFTAR
     ================================================================ */

    public function index(Request $request)
    {
        $user = $request->user();
        $this->pastikanPunyaDivisi($user);

        // SPV dan operator sama-sama melihat SEMUA RRF divisinya, apa pun statusnya
        $query = Rrf::query()
            ->with(['kelas', 'creator:id,name'])
            ->where('divisi_id', $user->divisi_id)
            ->latest('id');

        $status = $request->query('status');
        if ($status && array_key_exists($status, Rrf::STATUS_LABEL)) {
            $query->where('status', $status);
        }

        $rrfs = $query->paginate(15)->withQueryString()->through(function (Rrf $r) use ($user) {
            $alasanEdit = $this->alasanTerkunci($user, $r);

            return [
                'id'               => $r->id,
                'rrf_no'           => $r->rrf_no,
                'tanggal'          => $r->created_at?->format('d/m/Y H:i'),
                'divisi'           => $r->divisi_pelapor,
                'lokasi'           => $r->lokasi,
                'mesin'            => $r->nama_mesin,
                'kelas'            => $r->kelas?->kode,
                'jenis_permintaan' => $r->jenis_permintaan,
                'status'           => $r->status,
                'status_label'     => Rrf::STATUS_LABEL[$r->status] ?? $r->status,
                'pembuat'          => $r->creator?->name,

                // Hak aksi untuk user yang sedang login
                'bisa_edit'        => $alasanEdit === null,
                'alasan_edit'      => $alasanEdit,
                'bisa_hapus'       => true,
            ];
        });

        // Penanda: antrean SPV dan RRF milik sendiri yang ditolak
        $jumlahMenunggu = $user->role === 'spv_produksi'
            ? Rrf::where('divisi_id', $user->divisi_id)
                ->where('status', Rrf::STATUS_DIAJUKAN)
                ->count()
            : 0;

        $jumlahDitolak = Rrf::where('divisi_id', $user->divisi_id)
            ->where('created_by', $user->id)
            ->where('status', Rrf::STATUS_DITOLAK)
            ->count();

        return Inertia::render('Rrf/Index', [
            'rrfs'           => $rrfs,
            'filters'        => ['status' => $status],
            'statuses'       => Rrf::STATUS_LABEL,
            'jumlahMenunggu' => $jumlahMenunggu,
            'jumlahDitolak'  => $jumlahDitolak,
        ]);
    }

    /* ================================================================
     | BUAT
     ================================================================ */

    public function create(Request $request)
    {
        $user = $request->user();
        $this->pastikanPunyaDivisi($user);

        return Inertia::render('Rrf/Create', $this->dataForm($user) + ['rrf' => null]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $this->pastikanPunyaDivisi($user);

        // rapikan ketikan nomor: spasi di pinggir dan spasi ganda dibuang
        $request->merge([
            'rrf_no' => trim(preg_replace('/\s+/', ' ', (string) $request->input('rrf_no', ''))),
        ]);

        $data = $request->validate($this->aturan() + [
            // whereNull('deleted_at'): RRF yang sudah dihapus tidak dihitung, nomornya boleh dipakai lagi
            'rrf_no' => [
                'required',
                'string',
                'max:100',
                Rule::unique('rrf', 'rrf_no')->whereNull('deleted_at'),
            ],
        ], $this->pesan() + [
            'rrf_no.required' => 'No. RRF harus diisi.',
            'rrf_no.unique'   => 'No. RRF ini sudah dipakai RRF lain.',
            'rrf_no.max'      => 'No. RRF maksimal 100 karakter.',
        ]);

        $divisiPelapor = $this->rapikanDivisi($data['divisi_pelapor'], $user->divisi_id);
        $lokasi        = $this->rapikan($data['lokasi'], 'lokasi', $user->divisi_id);
        $mesin         = $this->rapikan($data['nama_mesin'], 'nama_mesin', $user->divisi_id);
        $parts         = $this->olahParts($data);
        $jadwal        = $this->gabungJadwal($data['req_tanggal'] ?? null, $data['req_jam'] ?? null);

        // RRF buatan SPV langsung disetujui, tidak perlu approve diri sendiri
        $otomatis = $user->role === 'spv_produksi';
        $status   = $otomatis ? Rrf::STATUS_DISETUJUI : Rrf::STATUS_DIAJUKAN;

        $stored = [];

        try {
            $rrf = DB::transaction(function () use ($data, $divisiPelapor, $lokasi, $mesin, $parts, $jadwal, $request, $user, $otomatis, $status, &$stored) {
                $rrf = Rrf::create([
                    'rrf_no'           => $data['rrf_no'],
                    'divisi_id'        => $user->divisi_id,
                    'divisi_pelapor'   => $divisiPelapor,
                    'lokasi'           => $lokasi,
                    'nama_mesin'       => $mesin,
                    'rrf_class_id'     => $data['rrf_class_id'],
                    'jenis_permintaan' => $data['jenis_permintaan'],
                    'req_schedule_at'  => $jadwal,
                    'problem'          => $data['problem'],
                    'counter_measure'  => $data['request_activity'] ?? null,
                    'created_by'       => $user->id,
                    'status'           => $status,
                ]);

                foreach ($parts as $p) {
                    $rrf->parts()->create($p);
                }

                foreach ($request->file('fotos', []) as $file) {
                    $path = $file->store('rrf/before', 'public');
                    $stored[] = $path;

                    $rrf->photos()->create([
                        'tipe'        => 'before',
                        'file_path'   => $path,
                        'uploaded_by' => $user->id,
                    ]);
                }

                if ($otomatis) {
                    RrfApproval::create([
                        'rrf_id'   => $rrf->id,
                        'tahap'    => self::TAHAP_SPV,
                        'user_id'  => $user->id,
                        'status'   => Rrf::STATUS_DISETUJUI,
                        'catatan'  => 'Dibuat oleh SPV, disetujui otomatis',
                        'acted_at' => now(),
                    ]);
                }

                RrfStatusLog::create([
                    'rrf_id'      => $rrf->id,
                    'status_lama' => null,
                    'status_baru' => $status,
                    'user_id'     => $user->id,
                    'catatan'     => $otomatis ? 'RRF dibuat oleh SPV, langsung disetujui' : 'RRF dibuat',
                ]);

                if ($otomatis) {
                    // SPV (posisi lebih tinggi) membuat RRF -> operator divisi ikut diberi tahu
                    RrfNotifier::keOperator(
                        $rrf,
                        'RRF Baru dari SPV',
                        "SPV {$user->name} membuat RRF {$rrf->rrf_no} dan langsung disetujui.",
                        $user->id
                    );
                } else {
                    RrfNotifier::keSpv(
                        $rrf,
                        'RRF Baru Menunggu Persetujuan',
                        "Operator mengajukan RRF {$rrf->rrf_no}. Silakan periksa dan berikan keputusan.",
                        $user->id
                    );
                }

                return $rrf;
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($stored);
            throw $e;
        }

        return redirect()
            ->route('rrf.show', $rrf)
            ->with('success', $otomatis
                ? "RRF {$rrf->rrf_no} berhasil dibuat dan langsung disetujui."
                : "RRF {$rrf->rrf_no} berhasil dibuat.");
    }

    /* ================================================================
     | DETAIL
     ================================================================ */

    public function show(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        return Inertia::render('Rrf/Show', [
            'rrf' => RrfPayload::detail($rrf) + [
                // Hak aksi untuk user yang sedang login
                'bisa_approve' => $this->bolehApprove($user, $rrf),
                'bisa_edit'    => $this->bolehEdit($user, $rrf),
                'bisa_hapus'   => $this->bolehHapus($user, $rrf),
                'penolakan'    => $rrf->status === Rrf::STATUS_DITOLAK
                    ? $this->penolakanTerakhir($rrf)
                    : null,
            ],
        ]);
    }

    /* ================================================================
     | EDIT
     | - Operator: miliknya sendiri, selama diajukan / ditolak
     | - SPV     : semua RRF divisinya, selama belum diterima Maintenance
     ================================================================ */

    public function edit(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        $alasan = $this->alasanTerkunci($user, $rrf);
        if ($alasan !== null) {
            abort(403, $alasan);
        }

        $rrf->load(['parts', 'photos', 'statusLogs.user']);

        return Inertia::render('Rrf/Create', $this->dataForm($user) + [
            'rrf' => [
                'id'               => $rrf->id,
                'rrf_no'           => $rrf->rrf_no,
                'status'           => $rrf->status,
                'divisi_pelapor'   => $rrf->divisi_pelapor,
                'lokasi'           => $rrf->lokasi,
                'nama_mesin'       => $rrf->nama_mesin,
                'rrf_class_id'     => $rrf->rrf_class_id,
                'jenis_permintaan' => $rrf->jenis_permintaan,
                'req_tanggal'      => $rrf->req_schedule_at?->format('Y-m-d'),
                'req_jam'          => $rrf->req_schedule_at?->format('H:i'),
                'problem'          => $rrf->problem,
                'request_activity' => $rrf->counter_measure,
                'parts'            => $rrf->parts->map(fn ($p) => [
                    'part_name'  => $p->part_name,
                    'model_type' => $p->model_type,
                    'maker'      => $p->maker,
                    'qty'        => $p->qty,
                    'other'      => $p->other,
                ])->values(),
                'foto_before'      => $rrf->photos
                    ->where('tipe', 'before')
                    ->map(fn ($p) => ['id' => $p->id, 'url' => asset('storage/' . ltrim($p->file_path, '/'))])
                    ->values(),
                // Alasan penolakan hanya tampil kalau RRF memang sedang berstatus ditolak
                'penolakan'        => $rrf->status === Rrf::STATUS_DITOLAK
                    ? $this->penolakanTerakhir($rrf)
                    : null,
            ],
        ]);
    }

    public function update(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        $alasan = $this->alasanTerkunci($user, $rrf);
        if ($alasan !== null) {
            abort(403, $alasan);
        }

        $data = $request->validate($this->aturan() + [
            'hapus_foto_ids'   => ['nullable', 'array'],
            'hapus_foto_ids.*' => ['integer'],
        ], $this->pesan());

        $hapusIds = collect($data['hapus_foto_ids'] ?? [])->map(fn ($i) => (int) $i)->all();

        // Total foto setelah perubahan tidak boleh lebih dari batas
        $sisaFoto = $rrf->photos()
            ->where('tipe', 'before')
            ->whereNotIn('id', $hapusIds)
            ->count();

        if ($sisaFoto + count($request->file('fotos', [])) > self::MAKS_FOTO) {
            throw ValidationException::withMessages([
                'fotos' => 'Total foto before maksimal ' . self::MAKS_FOTO . '.',
            ]);
        }

        $divisiPelapor = $this->rapikanDivisi($data['divisi_pelapor'], $user->divisi_id);
        $lokasi        = $this->rapikan($data['lokasi'], 'lokasi', $user->divisi_id);
        $mesin         = $this->rapikan($data['nama_mesin'], 'nama_mesin', $user->divisi_id);
        $parts         = $this->olahParts($data);
        $jadwal        = $this->gabungJadwal($data['req_tanggal'] ?? null, $data['req_jam'] ?? null);

        $stored     = [];
        $hapusPath  = [];
        $statusLama = null;

        try {
            DB::transaction(function () use ($rrf, $data, $divisiPelapor, $lokasi, $mesin, $parts, $jadwal, $hapusIds, $request, $user, &$stored, &$hapusPath, &$statusLama) {
                $terkunci = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

                // Dicek lagi setelah dikunci: bisa jadi status baru saja berubah
                if (!$this->statusBisaDiubah($terkunci, $user)) {
                    throw ValidationException::withMessages([
                        'status' => $user->role === 'spv_produksi'
                            ? 'RRF ini sudah diterima Maintenance, jadi tidak bisa diubah lagi.'
                            : 'RRF ini sudah diproses SPV, jadi tidak bisa diubah lagi.',
                    ]);
                }

                $statusLama = $terkunci->status;
                $olehSpv    = $user->role === 'spv_produksi';

                // SPV mengedit tanpa mengubah status. Operator mengedit -> diajukan (ulang) ke SPV.
                $statusBaru = $olehSpv ? $statusLama : Rrf::STATUS_DIAJUKAN;

                $terkunci->update([
                    'divisi_pelapor'   => $divisiPelapor,
                    'lokasi'           => $lokasi,
                    'nama_mesin'       => $mesin,
                    'rrf_class_id'     => $data['rrf_class_id'],
                    'jenis_permintaan' => $data['jenis_permintaan'],
                    'req_schedule_at'  => $jadwal,
                    'problem'          => $data['problem'],
                    'counter_measure'  => $data['request_activity'] ?? null,
                    'status'           => $statusBaru,
                ]);

                $terkunci->parts()->delete();
                foreach ($parts as $p) {
                    $terkunci->parts()->create($p);
                }

                $dihapus = $terkunci->photos()
                    ->where('tipe', 'before')
                    ->whereIn('id', $hapusIds)
                    ->get();

                foreach ($dihapus as $foto) {
                    $hapusPath[] = $foto->file_path;
                    $foto->delete();
                }

                foreach ($request->file('fotos', []) as $file) {
                    $path = $file->store('rrf/before', 'public');
                    $stored[] = $path;

                    $terkunci->photos()->create([
                        'tipe'        => 'before',
                        'file_path'   => $path,
                        'uploaded_by' => $user->id,
                    ]);
                }

                $ulang = !$olehSpv && $statusLama === Rrf::STATUS_DITOLAK;

                RrfStatusLog::create([
                    'rrf_id'      => $terkunci->id,
                    'status_lama' => $statusLama,
                    'status_baru' => $statusBaru,
                    'user_id'     => $user->id,
                    'catatan'     => $olehSpv
                        ? 'RRF diubah oleh SPV'
                        : ($ulang
                            ? 'RRF diperbaiki dan diajukan ulang'
                            : 'RRF diubah oleh pembuat sebelum diproses SPV'),
                ]);

                if ($olehSpv) {
                    // SPV mengubah isi RRF -> operator divisi diberi tahu
                    RrfNotifier::keOperator(
                        $terkunci,
                        'RRF Diubah oleh SPV',
                        "SPV {$user->name} mengubah isi RRF {$terkunci->rrf_no}.",
                        $user->id
                    );
                } else {
                    RrfNotifier::keSpv(
                        $terkunci,
                        $ulang ? 'RRF Diajukan Ulang' : 'RRF Diubah Pembuatnya',
                        $ulang
                            ? "Operator mengajukan ulang RRF {$terkunci->rrf_no} setelah melakukan perbaikan."
                            : "Operator mengubah isi RRF {$terkunci->rrf_no} yang masih menunggu keputusan Anda.",
                        $user->id
                    );
                }
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($stored);
            throw $e;
        }

        // File lama baru dihapus setelah database berhasil tersimpan
        Storage::disk('public')->delete($hapusPath);

        return redirect()
            ->route('rrf.show', $rrf)
            ->with('success', ($user->role !== 'spv_produksi' && $statusLama === Rrf::STATUS_DITOLAK)
                ? "RRF {$rrf->rrf_no} diperbaiki dan diajukan ulang ke SPV."
                : "RRF {$rrf->rrf_no} berhasil diperbarui.");
    }

    /* ================================================================
     | HAPUS (soft delete, apa pun statusnya, hanya pembuat)
     ================================================================ */

    /* ================================================================
    | HAPUS (soft delete, apa pun statusnya, semua anggota divisi)
    ================================================================ */

    public function destroy(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        // pastikan RRF ini milik divisi user (404 kalau bukan)
        $this->pastikanBolehLihat($user, $rrf);

        $nomor = $rrf->rrf_no;

        DB::transaction(function () use ($rrf, $user) {
            $terkunci = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

            RrfStatusLog::create([
                'rrf_id'      => $terkunci->id,
                'status_lama' => $terkunci->status,
                'status_baru' => $terkunci->status,
                'user_id'     => $user->id,
                'catatan'     => "RRF dihapus oleh {$user->name} ({$user->role})",
            ]);

            // Notifikasi lama dibuang supaya tidak mengarah ke RRF yang sudah tidak tampil
            RrfNotification::where('rrf_id', $terkunci->id)->delete();

            // Soft delete: baris, foto, dan log tetap tersimpan
            $terkunci->delete();
        });

        return redirect()
            ->route('rrf.index')
            ->with('success', "RRF {$nomor} berhasil dihapus.");
    }

    /* ================================================================
     | APPROVAL SPV
     ================================================================ */

    public function approve(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        $data = $request->validate([
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $this->prosesKeputusan($user, $rrf, Rrf::STATUS_DISETUJUI, $data['catatan'] ?? null);

        return redirect()
            ->route('rrf.show', $rrf)
            ->with('success', "RRF {$rrf->rrf_no} disetujui dan diteruskan ke Maintenance.");
    }

    public function reject(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        $data = $request->validate([
            'catatan' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'catatan.required' => 'Alasan penolakan harus diisi.',
            'catatan.min'      => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $this->prosesKeputusan($user, $rrf, Rrf::STATUS_DITOLAK, $data['catatan']);

        return redirect()
            ->route('rrf.show', $rrf)
            ->with('success', "RRF {$rrf->rrf_no} ditolak dan dikembalikan ke pembuatnya.");
    }

    /**
     * Satu pintu untuk setuju/tolak. Baris RRF dikunci selama proses,
     * jadi kalau dua orang menekan tombol bersamaan, hanya yang pertama berhasil.
     */
    private function prosesKeputusan(User $user, Rrf $rrf, string $statusBaru, ?string $catatan): void
    {
        if ($user->role !== 'spv_produksi') {
            abort(403, 'Hanya SPV Produksi yang bisa menyetujui atau menolak RRF.');
        }

        if (!$this->bolehApprove($user, $rrf)) {
            abort(403, 'Anda tidak berwenang memproses RRF ini.');
        }

        DB::transaction(function () use ($user, $rrf, $statusBaru, $catatan) {
            $terkunci = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

            if ($terkunci->status !== Rrf::STATUS_DIAJUKAN) {
                throw ValidationException::withMessages([
                    'status' => 'RRF ini sudah diproses sebelumnya.',
                ]);
            }

            $terkunci->update(['status' => $statusBaru]);

            RrfApproval::updateOrCreate(
                ['rrf_id' => $terkunci->id, 'tahap' => self::TAHAP_SPV],
                [
                    'user_id'  => $user->id,
                    'status'   => $statusBaru,
                    'catatan'  => $catatan,
                    'acted_at' => now(),
                ]
            );

            RrfStatusLog::create([
                'rrf_id'      => $terkunci->id,
                'status_lama' => Rrf::STATUS_DIAJUKAN,
                'status_baru' => $statusBaru,
                'user_id'     => $user->id,
                'catatan'     => $catatan,
            ]);

            // Keputusan SPV diberitahukan ke semua operator divisi (setuju maupun tolak)
            if ($statusBaru === Rrf::STATUS_DITOLAK) {
                RrfNotifier::keOperator(
                    $terkunci,
                    'RRF Ditolak oleh SPV',
                    "RRF {$terkunci->rrf_no} ditolak oleh SPV. Alasan: {$catatan}",
                    $user->id
                );
            } else {
                RrfNotifier::keOperator(
                    $terkunci,
                    'RRF Disetujui oleh SPV',
                    "RRF {$terkunci->rrf_no} disetujui SPV dan diteruskan ke Maintenance.",
                    $user->id
                );
            }
        });
    }

    /* ================================================================
     | PEMBANTU
     ================================================================ */

    private function aturan(): array
    {
        return [
            'divisi_pelapor'      => ['required', 'string', 'max:255'],
            'lokasi'              => ['required', 'string', 'max:255'],
            'nama_mesin'          => ['required', 'string', 'max:255'],
            'rrf_class_id'        => ['required', 'integer', 'exists:rrf_classes,id'],
            'jenis_permintaan'    => ['required', 'in:terencana,troubleshooting'],
            'req_tanggal'         => ['nullable', 'date', 'required_with:req_jam'],
            'req_jam'             => ['nullable', 'date_format:H:i', 'required_with:req_tanggal'],
            'problem'             => ['required', 'string', 'max:2000'],
            'request_activity'    => ['nullable', 'string', 'max:2000'],
            'parts'               => ['nullable', 'array', 'max:10'],
            'parts.*.part_name'   => ['nullable', 'string', 'max:255'],
            'parts.*.model_type'  => ['nullable', 'string', 'max:255'],
            'parts.*.maker'       => ['nullable', 'string', 'max:255'],
            'parts.*.qty'         => ['nullable', 'integer', 'min:1', 'max:9999'],
            'parts.*.other'       => ['nullable', 'string', 'max:255'],
            'fotos'               => ['nullable', 'array', 'max:' . self::MAKS_FOTO],
            'fotos.*'             => ['image', 'max:5120'],
        ];
    }

    private function pesan(): array
    {
        return [
            'divisi_pelapor.required'   => 'Division pelapor harus diisi.',
            'lokasi.required'           => 'Location harus diisi.',
            'nama_mesin.required'       => 'Machine harus diisi.',
            'rrf_class_id.required'     => 'Class harus dipilih.',
            'problem.required'          => 'Problem harus diisi.',
            'req_tanggal.required_with' => 'Tanggal req. schedule harus diisi kalau jam diisi.',
            'req_jam.required_with'     => 'Jam req. schedule harus diisi kalau tanggal diisi.',
            'req_jam.date_format'       => 'Format jam harus HH:MM, contoh 13:00.',
            'fotos.*.image'             => 'File foto harus berupa gambar.',
            'fotos.*.max'               => 'Ukuran tiap foto maksimal 5 MB.',
        ];
    }

    private function dataForm(User $user): array
    {
        $saran = fn (string $kolom) => Rrf::where('divisi_id', $user->divisi_id)
            ->whereNotNull($kolom)
            ->distinct()
            ->orderBy($kolom)
            ->pluck($kolom);

        return [
            'divisiDefault' => $user->divisi?->nama_divisi,
            'saranDivisi'   => Divisi::orderBy('nama_divisi')
                ->pluck('nama_divisi')
                ->merge($saran('divisi_pelapor'))
                ->unique()
                ->values(),
            'classes'       => RrfClass::orderBy('id')->get(['id', 'kode', 'nama', 'deskripsi']),
            'saranLokasi'   => $saran('lokasi'),
            'saranMesin'    => $saran('nama_mesin'),
        ];
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

    private function gabungJadwal(?string $tanggal, ?string $jam): ?Carbon
    {
        if (!$tanggal || !$jam) {
            return null;
        }

        return Carbon::parse($tanggal . ' ' . $jam);
    }

    private function bolehApprove(User $user, Rrf $rrf): bool
    {
        return $user->role === 'spv_produksi'
            && (int) $rrf->divisi_id === (int) $user->divisi_id
            && $rrf->status === Rrf::STATUS_DIAJUKAN;
    }

    /**
     * Apakah status RRF masih membolehkan perubahan isi?
     * - SPV     : sampai sebelum diterima Maintenance (diajukan, ditolak, disetujui)
     * - Operator: hanya selama belum disetujui SPV (diajukan, ditolak)
     */
    private function statusBisaDiubah(Rrf $rrf, User $user): bool
    {
        $boleh = $user->role === 'spv_produksi'
            ? [Rrf::STATUS_DIAJUKAN, Rrf::STATUS_DITOLAK, Rrf::STATUS_DISETUJUI]
            : [Rrf::STATUS_DIAJUKAN, Rrf::STATUS_DITOLAK];

        return in_array($rrf->status, $boleh, true);
    }

    /** Satu sumber aturan edit: null artinya boleh, selain itu berisi alasan terkunci. */
    private function alasanTerkunci(User $user, Rrf $rrf): ?string
    {
        if ($user->role === 'spv_produksi') {
            if ((int) $rrf->divisi_id !== (int) $user->divisi_id) {
                return 'RRF ini bukan dari divisi Anda.';
            }

            return $this->statusBisaDiubah($rrf, $user)
                ? null
                : 'Sudah diterima Maintenance, tidak bisa diubah lagi.';
        }

        if (!$this->statusBisaDiubah($rrf, $user)) {
            return 'Sudah diproses SPV, tidak bisa diubah.';
        }

        if ((int) $rrf->created_by !== (int) $user->id) {
            return 'Hanya pembuat RRF atau SPV yang bisa mengubah.';
        }

        return null;
    }

    private function bolehEdit(User $user, Rrf $rrf): bool
    {
        return $this->alasanTerkunci($user, $rrf) === null;
    }

   /** Hapus tidak terikat status. Batasan divisi sudah dijaga pastikanBolehLihat(). */
    private function bolehHapus(User $user, Rrf $rrf): bool
    {
        return (int) $rrf->divisi_id === (int) $user->divisi_id;
    }
    
    private function penolakanTerakhir(Rrf $rrf): ?array
    {
        $rrf->loadMissing('statusLogs.user');

        $log = $rrf->statusLogs
            ->where('status_baru', Rrf::STATUS_DITOLAK)
            ->sortByDesc('id')
            ->first();

        if (!$log) {
            return null;
        }

        return [
            'oleh'    => $log->user?->name,
            'waktu'   => $log->created_at?->format('d/m/Y H:i'),
            'catatan' => $log->catatan,
        ];
    }

    private function pastikanPunyaDivisi(User $user): void
    {
        if (!$user->divisi_id) {
            abort(403, 'Akun Anda belum terhubung ke divisi. Hubungi admin maintenance.');
        }
    }

    /** SPV dan operator boleh melihat semua RRF di divisinya. */
    private function pastikanBolehLihat(User $user, Rrf $rrf): void
    {
        $this->pastikanPunyaDivisi($user);

        if ((int) $rrf->divisi_id !== (int) $user->divisi_id) {
            abort(404);
        }
    }

    /**
     * Rapikan ketikan: spasi ganda dibuang, dan kalau sudah pernah ada
     * penulisan yang sama (huruf besar/kecil diabaikan) pakai penulisan itu,
     * supaya riwayat mesin tidak terpecah.
     */
    private function rapikan(string $teks, string $kolom, int $divisiId): string
    {
        $teks = trim(preg_replace('/\s+/', ' ', $teks));

        $ada = Rrf::where('divisi_id', $divisiId)->where($kolom, $teks)->value($kolom);

        return $ada ?: $teks;
    }

    /** Sama seperti rapikan, tapi nama divisi resmi di tabel divisis diutamakan. */
    private function rapikanDivisi(string $teks, int $divisiId): string
    {
        $teks = trim(preg_replace('/\s+/', ' ', $teks));

        $resmi = Divisi::where('nama_divisi', $teks)->value('nama_divisi');

        return $resmi ?: $this->rapikan($teks, 'divisi_pelapor', $divisiId);
    }

    /**
     * Format: RRF/HR/2026/0001, berjalan per kode per tahun.
     * withTrashed(): RRF yang sudah dihapus tetap dihitung, jadi nomornya tidak dipakai ulang.
     */
    private function buatNomor(Divisi $divisi): string
    {
        $kode = $divisi->kode_rrf
            ?: \Illuminate\Support\Str::upper(
                \substr(
                    \preg_replace('/[^A-Za-z]/', '', $divisi->nama_divisi),
                    0,
                    2
                )
            );

        $prefix = 'RRF/' . $kode . '/' . now()->year . '/';

        $terakhir = Rrf::withTrashed()
            ->where('rrf_no', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('rrf_no')
            ->value('rrf_no');

        $berikut = $terakhir
            ? ((int) \substr($terakhir, \strlen($prefix))) + 1
            : 1;

        return $prefix . \str_pad((string) $berikut, 4, '0', STR_PAD_LEFT);
    }
}