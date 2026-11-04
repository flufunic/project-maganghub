<?php

namespace App\Http\Controllers;

use App\Models\Divisi;
use App\Models\Rrf;
use App\Models\RrfApproval;
use App\Models\RrfClass;
use App\Models\RrfStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Models\RrfNotification;
use App\Models\User;

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

        $query = Rrf::query()
            ->with(['kelas', 'creator:id,name'])
            ->where('divisi_id', $user->divisi_id)
            ->latest('id');

        if ($user->role === 'operator_produksi') {
            $query->where('created_by', $user->id);
        }

        $status = $request->query('status');
        if ($status && array_key_exists($status, Rrf::STATUS_LABEL)) {
            $query->where('status', $status);
        }

        $rrfs = $query->paginate(15)->withQueryString()->through(fn (Rrf $r) => [
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
        ]);

        // Penanda di atas tabel: antrean SPV dan RRF milik sendiri yang ditolak
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

        $data = $request->validate($this->aturan(), $this->pesan());

        $divisiPelapor = $this->rapikanDivisi($data['divisi_pelapor'], $user->divisi_id);
        $lokasi        = $this->rapikan($data['lokasi'], 'lokasi', $user->divisi_id);
        $mesin         = $this->rapikan($data['nama_mesin'], 'nama_mesin', $user->divisi_id);
        $parts         = $this->olahParts($data);

        // RRF buatan SPV langsung disetujui, tidak perlu approve diri sendiri
        $otomatis = $user->role === 'spv_produksi';
        $status   = $otomatis ? Rrf::STATUS_DISETUJUI : Rrf::STATUS_DIAJUKAN;

        $stored = [];

        try {
            $rrf = DB::transaction(function () use ($data, $divisiPelapor, $lokasi, $mesin, $parts, $request, $user, $otomatis, $status, &$stored) {
                $rrf = Rrf::create([
                    'rrf_no'           => $this->buatNomor($user->divisi),
                    'divisi_id'        => $user->divisi_id,
                    'divisi_pelapor'   => $divisiPelapor,
                    'lokasi'           => $lokasi,
                    'nama_mesin'       => $mesin,
                    'rrf_class_id'     => $data['rrf_class_id'],
                    'jenis_permintaan' => $data['jenis_permintaan'],
                    'req_schedule_at'  => $data['req_schedule_at'] ?? null,
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

                if (!$otomatis) {
                    $this->kirimNotifikasiKeSpv(
                        $rrf,
                        "Operator mengajukan RRF {$rrf->rrf_no}. Silakan periksa dan berikan keputusan."
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

        $rrf->load([
            'divisi', 'kelas', 'creator', 'pic', 'receiver', 'shift',
            'parts', 'photos', 'statusLogs.user',
        ]);

        $fmt = fn ($dt) => $dt?->format('d/m/Y H:i');
        $foto = fn ($tipe) => $rrf->photos
            ->where('tipe', $tipe)
            ->map(fn ($p) => ['id' => $p->id, 'url' => asset('storage/' . ltrim($p->file_path, '/'))])
            ->values();

        return Inertia::render('Rrf/Show', [
            'rrf' => [
                'id'               => $rrf->id,
                'rrf_no'           => $rrf->rrf_no,
                'status'           => $rrf->status,
                'status_label'     => Rrf::STATUS_LABEL[$rrf->status] ?? $rrf->status,
                'divisi'           => $rrf->divisi_pelapor ?: $rrf->divisi?->nama_divisi,
                'lokasi'           => $rrf->lokasi,
                'mesin'            => $rrf->nama_mesin,
                'kelas'            => $rrf->kelas ? [
                    'kode'      => $rrf->kelas->kode,
                    'nama'      => $rrf->kelas->nama,
                    'deskripsi' => $rrf->kelas->deskripsi,
                ] : null,
                'jenis_permintaan' => $rrf->jenis_permintaan,
                'req_schedule_at'  => $fmt($rrf->req_schedule_at),
                'problem'          => $rrf->problem,
                'request_activity' => $rrf->counter_measure,
                'pembuat'          => $rrf->creator?->name,
                'dibuat_pada'      => $fmt($rrf->created_at),

                'serv_schedule_at' => $fmt($rrf->serv_schedule_at),
                'cause'            => $rrf->cause,
                'remark'           => $rrf->remark,
                'start_at'         => $fmt($rrf->start_at),
                'finish_at'        => $fmt($rrf->finish_at),
                'downtime_menit'   => $rrf->downtime_menit,
                'stop_line_menit'  => $rrf->stop_line_menit,
                'jumlah_man'       => $rrf->jumlah_man,
                'shift'            => $rrf->shift?->nama,
                'pic'              => $rrf->pic?->name,

                'parts'        => $rrf->parts->map(fn ($p) => [
                    'id'         => $p->id,
                    'part_name'  => $p->part_name,
                    'model_type' => $p->model_type,
                    'maker'      => $p->maker,
                    'qty'        => $p->qty,
                    'other'      => $p->other,
                ])->values(),
                'foto_before'  => $foto('before'),
                'foto_after'   => $foto('after'),
                'logs'         => $rrf->statusLogs->sortBy('id')->map(fn ($l) => [
                    'id'      => $l->id,
                    'status'  => Rrf::STATUS_LABEL[$l->status_baru] ?? $l->status_baru,
                    'oleh'    => $l->user?->name,
                    'waktu'   => $fmt($l->created_at),
                    'catatan' => $l->catatan,
                ])->values(),

                // Hak aksi untuk user yang sedang login
                'bisa_approve' => $this->bolehApprove($user, $rrf),
                'bisa_edit'    => $this->bolehEdit($user, $rrf),
                'penolakan'    => $rrf->status === Rrf::STATUS_DITOLAK
                    ? $this->penolakanTerakhir($rrf)
                    : null,
            ],
        ]);
    }

    /* ================================================================
     | PERBAIKI & AJUKAN ULANG (RRF yang ditolak)
     ================================================================ */

    public function edit(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        if (!$this->bolehEdit($user, $rrf)) {
            abort(403, 'RRF ini tidak bisa diperbaiki.');
        }

        $rrf->load(['parts', 'photos', 'statusLogs.user']);

        return Inertia::render('Rrf/Create', $this->dataForm($user) + [
            'rrf' => [
                'id'               => $rrf->id,
                'rrf_no'           => $rrf->rrf_no,
                'divisi_pelapor'   => $rrf->divisi_pelapor,
                'lokasi'           => $rrf->lokasi,
                'nama_mesin'       => $rrf->nama_mesin,
                'rrf_class_id'     => $rrf->rrf_class_id,
                'jenis_permintaan' => $rrf->jenis_permintaan,
                'req_schedule_at'  => $rrf->req_schedule_at?->format('Y-m-d'),
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
                    ->map(fn ($p) => ['id' => $p->id, 'url' => asset('storage/' . $p->file_path)])
                    ->values(),
                'penolakan'        => $this->penolakanTerakhir($rrf),
            ],
        ]);
    }

    public function update(Request $request, Rrf $rrf)
    {
        $user = $request->user();
        $this->pastikanBolehLihat($user, $rrf);

        if (!$this->bolehEdit($user, $rrf)) {
            abort(403, 'RRF ini tidak bisa diperbaiki.');
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

        $stored    = [];
        $hapusPath = [];

        try {
            DB::transaction(function () use ($rrf, $data, $divisiPelapor, $lokasi, $mesin, $parts, $hapusIds, $request, $user, &$stored, &$hapusPath) {
                $terkunci = Rrf::whereKey($rrf->id)->lockForUpdate()->firstOrFail();

                if ($terkunci->status !== Rrf::STATUS_DITOLAK) {
                    throw ValidationException::withMessages([
                        'status' => 'RRF ini sudah tidak bisa diubah.',
                    ]);
                }

                $terkunci->update([
                    'divisi_pelapor'   => $divisiPelapor,
                    'lokasi'           => $lokasi,
                    'nama_mesin'       => $mesin,
                    'rrf_class_id'     => $data['rrf_class_id'],
                    'jenis_permintaan' => $data['jenis_permintaan'],
                    'req_schedule_at'  => $data['req_schedule_at'] ?? null,
                    'problem'          => $data['problem'],
                    'counter_measure'  => $data['request_activity'] ?? null,
                    'status'           => Rrf::STATUS_DIAJUKAN,
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

                RrfStatusLog::create([
                    'rrf_id'      => $terkunci->id,
                    'status_lama' => Rrf::STATUS_DITOLAK,
                    'status_baru' => Rrf::STATUS_DIAJUKAN,
                    'user_id'     => $user->id,
                    'catatan'     => 'RRF diperbaiki dan diajukan ulang',
                ]);

                $this->kirimNotifikasiKeSpv(
                    $terkunci,
                    "Operator mengajukan ulang RRF {$terkunci->rrf_no} setelah melakukan perbaikan."
                );
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($stored);
            throw $e;
        }

        // File lama baru dihapus setelah database berhasil tersimpan
        Storage::disk('public')->delete($hapusPath);

        return redirect()
            ->route('rrf.show', $rrf)
            ->with('success', "RRF {$rrf->rrf_no} diperbaiki dan diajukan ulang ke SPV.");
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
    private function prosesKeputusan($user, Rrf $rrf, string $statusBaru, ?string $catatan): void
    {
        if ($user->role !== 'spv_produksi') {
            abort(403, 'Hanya SPV Produksi yang bisa menyetujui atau menolak RRF.');
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

            if ($statusBaru === Rrf::STATUS_DITOLAK) {
                $this->kirimNotifikasiKeOperator(
                    $terkunci,
                    "RRF {$terkunci->rrf_no} ditolak oleh SPV. Alasan: {$catatan}"
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
            'req_schedule_at'     => ['nullable', 'date'],
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
            'divisi_pelapor.required' => 'Division pelapor harus diisi.',
            'lokasi.required'         => 'Location harus diisi.',
            'nama_mesin.required'     => 'Machine harus diisi.',
            'rrf_class_id.required'   => 'Class harus dipilih.',
            'problem.required'        => 'Problem harus diisi.',
            'fotos.*.image'           => 'File foto harus berupa gambar.',
            'fotos.*.max'             => 'Ukuran tiap foto maksimal 5 MB.',
        ];
    }

    private function dataForm($user): array
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

    private function bolehApprove($user, Rrf $rrf): bool
    {
        return $user->role === 'spv_produksi'
            && (int) $rrf->divisi_id === (int) $user->divisi_id
            && $rrf->status === Rrf::STATUS_DIAJUKAN;
    }

    private function bolehEdit($user, Rrf $rrf): bool
    {
        return $rrf->status === Rrf::STATUS_DITOLAK
            && (int) $rrf->created_by === (int) $user->id;
    }

    private function penolakanTerakhir(Rrf $rrf): ?array
    {
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

    private function pastikanPunyaDivisi($user): void
    {
        if (!$user->divisi_id) {
            abort(403, 'Akun Anda belum terhubung ke divisi. Hubungi admin maintenance.');
        }
    }

    private function pastikanBolehLihat($user, Rrf $rrf): void
    {
        $this->pastikanPunyaDivisi($user);

        if ((int) $rrf->divisi_id !== (int) $user->divisi_id) {
            abort(404);
        }

        if ($user->role === 'operator_produksi' && (int) $rrf->created_by !== (int) $user->id) {
            abort(403, 'Anda hanya bisa melihat RRF yang Anda buat.');
        }
    }

    /**
     * Rapikan ketikan: spasi ganda dibuang, dan kalau sudah pernah ada
     * penulisan yang sama (huruf besar/kecil diabaikan) pakai penulisan itu,
     * supaya laporan per mesin tidak terpecah.
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

    /** Format: RRF/HR/2026/0001, berjalan per kode per tahun. */
    private function buatNomor(Divisi $divisi): string
    {
        $kode = $divisi->kode_rrf
            ?: strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $divisi->nama_divisi), 0, 2));

        $prefix = 'RRF/' . $kode . '/' . now()->year . '/';

        $terakhir = Rrf::where('rrf_no', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('rrf_no')
            ->value('rrf_no');

        $berikut = $terakhir ? ((int) substr($terakhir, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad((string) $berikut, 4, '0', STR_PAD_LEFT);
    }

    private function kirimNotifikasiKeSpv(Rrf $rrf, string $pesan): void
    {
        $spvs = User::where('role', 'spv_produksi')
            ->where('divisi_id', $rrf->divisi_id)
            ->get(['id']);

        foreach ($spvs as $spv) {
            RrfNotification::create([
                'user_id' => $spv->id,
                'rrf_id' => $rrf->id,
                'judul' => 'RRF Baru Menunggu Persetujuan',
                'pesan' => $pesan,
            ]);
        }
    }

    private function kirimNotifikasiKeOperator(
        Rrf $rrf,
        string $pesan
    ): void {
        RrfNotification::create([
            'user_id' => $rrf->created_by,
            'rrf_id' => $rrf->id,
            'judul' => 'RRF Ditolak oleh SPV',
            'pesan' => $pesan,
        ]);
    }
}