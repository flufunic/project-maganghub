<?php

namespace App\Http\Controllers;

use App\Models\Divisi;
use App\Models\Rrf;
use App\Models\RrfApproval;
use App\Models\RrfStatusLog;
use App\Models\User;
use App\Support\RrfDurasi;
use App\Support\RrfNotifier;
use App\Support\RrfPayload;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MtcRrfController extends Controller
{
    private const MAKS_FOTO = 5;

    // Nilai kolom rrf_approvals.tahap untuk keputusan Maintenance
    private const TAHAP_MTC = 'mtc';

    /**
     * Status yang boleh masuk ke daftar Maintenance.
     * RRF harus disetujui SPV Produksi terlebih dahulu.
     */
    private const STATUS_MTC = [
        Rrf::STATUS_DISETUJUI,
        Rrf::STATUS_DITERIMA,
        Rrf::STATUS_DIKERJAKAN,
        Rrf::STATUS_SELESAI,
        Rrf::STATUS_CLOSED,
    ];

    /**
     * Status yang tampil untuk Pimpinan: menunggu verifikasi + riwayat yang sudah closed.
     */
    private const STATUS_PIMPINAN = [
        Rrf::STATUS_SELESAI,
        Rrf::STATUS_CLOSED,
    ];

    /* ================================================================
     | DAFTAR dan DETAIL (Admin dan Pimpinan)
     ================================================================ */

    public function index(Request $request)
    {
        $user = $request->user();

        abort_unless(
            in_array($user->role, ['admin', 'pimpinan'], true),
            403
        );

        $isAdmin = $user->role === 'admin';

        // Status yang boleh dilihat role ini
        $statusBoleh = $isAdmin ? self::STATUS_MTC : self::STATUS_PIMPINAN;

        $status  = $request->query('status');
        $antrean = $isAdmin ? $request->query('antrean') : null;

        $query = Rrf::query()
            ->with(['kelas', 'creator:id,name'])
            ->withExists([
                'statusLogs as dikembalikan' => fn ($l) =>
                    $this->saringPengembalian($l),
            ])
            ->whereIn('status', $statusBoleh);

        if ($status && in_array($status, $statusBoleh, true)) {
            $query->where('status', $status);
        }

        if ($antrean === 'dikembalikan') {
            $query->where('status', Rrf::STATUS_DIKERJAKAN)
                ->whereHas(
                    'statusLogs',
                    fn ($l) => $this->saringPengembalian($l)
                );
        }

        // Pimpinan: yang menunggu verifikasi tampil paling atas, lalu riwayat closed
        if (!$isAdmin) {
            $query->orderByRaw(
                'CASE WHEN status = ? THEN 0 ELSE 1 END',
                [Rrf::STATUS_SELESAI]
            );
        }

        $query->latest('id');

        $rrfs = $query
            ->paginate(15)
            ->withQueryString()
            ->through(function (Rrf $r) {
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

                    // Status selesai berarti menunggu verifikasi Pimpinan
                    'status_label'     => $r->status === Rrf::STATUS_SELESAI
                        ? 'Menunggu Verifikasi'
                        : (Rrf::STATUS_LABEL[$r->status] ?? $r->status),

                    'pembuat'          => $r->creator?->name,
                    'dikembalikan'     => (bool) $r->dikembalikan,
                ];
            });

        // Ringkasan jumlah per status (sesuai status yang boleh dilihat role ini)
        $ringkasan = Rrf::query()
            ->whereIn('status', $statusBoleh)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statuses = collect(Rrf::STATUS_LABEL)
            ->only($statusBoleh)
            ->map(fn ($label, $kode) => $kode === Rrf::STATUS_SELESAI
                ? 'Menunggu Verifikasi'
                : $label)
            ->all();

        $antreanData = [
            'verifikasi' => (int) ($ringkasan[Rrf::STATUS_SELESAI] ?? 0),

            'dikembalikan' => $isAdmin
                ? Rrf::where('status', Rrf::STATUS_DIKERJAKAN)
                    ->whereHas(
                        'statusLogs',
                        fn ($l) => $this->saringPengembalian($l)
                    )
                    ->count()
                : 0,
        ];

        return Inertia::render('Rrf/MtcIndex', [
            'rrfs' => $rrfs,

            'filters' => [
                'status'  => $status,
                'antrean' => $antrean,
            ],

            'statuses'  => $statuses,
            'ringkasan' => $ringkasan,
            'antrean'   => $antreanData,
            'role'      => $user->role,
        ]);
    }

    public function show(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        $admin = $user->role === 'admin';
        $pimpinan = $user->role === 'pimpinan';

        abort_unless($admin || $pimpinan, 403);

        /*
        | Admin: bisa membuka seluruh RRF dalam antrean Maintenance.
        | Pimpinan: hanya bisa membuka RRF yang menunggu verifikasi.
        */

        if ($admin) {
            abort_unless(
                in_array($rrf->status, self::STATUS_MTC, true),
                404
            );
        } else {
            // Pimpinan: boleh membuka yang menunggu verifikasi dan yang sudah closed
            abort_unless(
                in_array($rrf->status, self::STATUS_PIMPINAN, true),
                404
            );
        }

        $fmt = fn ($dt) => $dt?->format('d/m/Y H:i');

        $riwayat = $rrf->queryRiwayatMesin()
            ->latest('id')
            ->limit(5)
            ->get([
                'id',
                'rrf_no',
                'created_at',
                'downtime_detik',
            ])
            ->map(fn ($r) => [
                'id'       => $r->id,
                'rrf_no'   => $r->rrf_no,
                'tanggal'  => $fmt($r->created_at),
                'downtime' => RrfDurasi::format($r->downtime_detik),
            ])
            ->values();

        // Nama pengirim dan penutup RRF
        $nama = User::whereIn(
            'id',
            array_filter([
                $rrf->dikirim_pimpinan_oleh,
                $rrf->closed_by,
            ])
        )->pluck('name', 'id');

        // Form penanganan hanya untuk Admin
        $penanganan = (
            $admin &&
            in_array(
                $rrf->status,
                [
                    Rrf::STATUS_DITERIMA,
                    Rrf::STATUS_DIKERJAKAN,
                ],
                true
            )
        )
            ? $this->dataPenanganan($rrf)
            : null;

        // Alasan pengembalian Pimpinan
        $dikembalikan = null;

        if ($rrf->status === Rrf::STATUS_DIKERJAKAN) {
            $log = RrfStatusLog::with('user:id,name')
                ->where('rrf_id', $rrf->id)
                ->where('status_lama', Rrf::STATUS_SELESAI)
                ->where('status_baru', Rrf::STATUS_DIKERJAKAN)
                ->latest('id')
                ->first();

            if ($log) {
                $dikembalikan = [
                    'oleh'    => $log->user?->name,
                    'waktu'   => $fmt($log->created_at),
                    'catatan' => $log->catatan,
                ];
            }
        }

        return Inertia::render('Rrf/MtcShow', [
            'rrf' => RrfPayload::detail($rrf),

            'shiftOptions' => config('rrf.shift_options'),

            'bisaAksi' => $admin,

            'bisaVerifikasi' => (
                $pimpinan &&
                $rrf->status === Rrf::STATUS_SELESAI
            ),

            'penanganan' => $penanganan,

            'dikembalikan' => $dikembalikan,

            'verifikasi' => [
                'dikirim_pada' => $fmt($rrf->dikirim_pimpinan_at),
                'dikirim_oleh' => $nama[$rrf->dikirim_pimpinan_oleh] ?? null,
                'closed_pada'  => $fmt($rrf->closed_at),
                'closed_oleh'  => $nama[$rrf->closed_by] ?? null,
            ],

            'pembagi' => $rrf->pembagiTimeRepair(),

            'riwayatMesin' => $riwayat,
        ]);
    }

    /* ================================================================
     | AKSI ADMIN  ->  notifikasi ke SPV + semua operator divisi RRF
     ================================================================ */

    /** disetujui -> diterima */
    public function terima(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        DB::transaction(function () use ($rrf, $user) {
            $fresh = $this->kunci($rrf, Rrf::STATUS_DISETUJUI);

            $fresh->update([
                'status'      => Rrf::STATUS_DITERIMA,
                'received_by' => $user->id,
                'received_at' => now(),
            ]);

            $this->catat(
                $fresh,
                Rrf::STATUS_DISETUJUI,
                Rrf::STATUS_DITERIMA,
                $user->id,
                'RRF diterima Maintenance'
            );

            RrfNotifier::keProduksi(
                $fresh,
                'RRF Diterima Maintenance',
                "RRF {$fresh->rrf_no} sudah diterima Maintenance dan akan segera ditangani.",
                $user->id
            );
        });

        return back()->with('success', 'RRF diterima. Silakan lengkapi data penanganan.');
    }

    /** disetujui -> ditolak (kembali ke produksi) */
    public function tolak(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        $data = $request->validate([
            'catatan' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'catatan.required' => 'Alasan penolakan harus diisi.',
            'catatan.min'      => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $alasan = trim($data['catatan']);

        DB::transaction(function () use ($rrf, $user, $alasan) {
            $fresh = $this->kunci($rrf, Rrf::STATUS_DISETUJUI);

            $fresh->update(['status' => Rrf::STATUS_DITOLAK]);

            RrfApproval::create([
                'rrf_id'   => $fresh->id,
                'tahap'    => self::TAHAP_MTC,
                'user_id'  => $user->id,
                'status'   => Rrf::STATUS_DITOLAK,
                'catatan'  => $alasan,
                'acted_at' => now(),
            ]);

            $this->catat(
                $fresh,
                Rrf::STATUS_DISETUJUI,
                Rrf::STATUS_DITOLAK,
                $user->id,
                "Ditolak Maintenance. Alasan: {$alasan}"
            );

            RrfNotifier::keProduksi(
                $fresh,
                'RRF Ditolak Maintenance',
                "RRF {$fresh->rrf_no} ditolak Maintenance. Alasan: {$alasan}",
                $user->id
            );
        });

        // RRF yang ditolak keluar dari daftar Maintenance, jadi kembali ke daftar
        return redirect()
            ->route('mtc.rrf.index')
            ->with('success', "RRF {$rrf->rrf_no} ditolak dan dikembalikan ke produksi.");
    }

    /**
     * diterima -> dikerjakan
     * Admin mengisi PIC, shift, serv. schedule, cause, counter measure,
     * remark, part, dan foto sebelum perbaikan berjalan.
     */
    public function mulai(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        $data = $request->validate(
            $this->aturanPenanganan(false),
            $this->pesanPenanganan()
        );

        $pic       = trim(preg_replace('/\s+/', ' ', $data['pic_nama']));
        $serv      = Carbon::parse($data['serv_tanggal'] . ' ' . $data['serv_jam']);
        $parts     = $this->olahParts($data);
        $gantiPart = $request->has('parts');
        $stored    = [];

        try {
            DB::transaction(function () use ($rrf, $user, $data, $pic, $serv, $parts, $gantiPart, $request, &$stored) {
                $fresh = $this->kunci($rrf, Rrf::STATUS_DITERIMA);

                $this->cekKuotaFoto($fresh, $request);

                $fresh->update([
                    'status'           => Rrf::STATUS_DIKERJAKAN,
                    'pic_nama'         => $pic,
                    'shift_kerja'      => $data['shift_kerja'],
                    'serv_schedule_at' => $serv,
                    'cause'            => $data['cause'],
                    'counter_measure'  => $data['counter_measure'] ?? null,
                    'remark'           => $data['remark'] ?? null,
                ]);

                if ($gantiPart) {
                    $fresh->parts()->delete();

                    foreach ($parts as $p) {
                        $fresh->parts()->create($p);
                    }
                }

                $this->simpanFotoAfter($fresh, $request, $user->id, $stored);

                $this->catat(
                    $fresh,
                    Rrf::STATUS_DITERIMA,
                    Rrf::STATUS_DIKERJAKAN,
                    $user->id,
                    "Perbaikan dimulai. PIC MTC: {$pic}. Serv. schedule " . $serv->format('d/m/Y H:i')
                );

                RrfNotifier::keProduksi(
                    $fresh,
                    'RRF Sedang Dikerjakan',
                    "Maintenance mulai mengerjakan RRF {$fresh->rrf_no}. PIC MTC: {$pic}.",
                    $user->id
                );
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($stored);
            throw $e;
        }

        return back()->with('success', 'Data penanganan tersimpan. RRF sedang dikerjakan.');
    }

    /**
     * Selama status "dikerjakan": Admin bisa mengubah seluruh data penanganan kapan saja.
     *
     * - kirim = false : data disimpan, status tetap "dikerjakan".
     * - kirim = true  : data disimpan, lalu RRF dikirim ke Pimpinan (status "selesai").
     *                   Jam stop line wajib diisi.
     *
     * Down time = jam stop line - jam serv. schedule.
     * Time repair = down time dibagi jumlah RRF mesin ini (riwayat selesai + RRF ini).
     */
    public function simpan(Request $request, Rrf $rrf)
    {
        $user  = $request->user();
        $kirim = $request->boolean('kirim');

        $data = $request->validate(
            $this->aturanPenanganan(true, $kirim),
            $this->pesanPenanganan()
        );

        $pic       = trim(preg_replace('/\s+/', ' ', $data['pic_nama']));
        $serv      = Carbon::parse($data['serv_tanggal'] . ' ' . $data['serv_jam']);
        $parts     = $this->olahParts($data);
        $gantiPart = $request->has('parts');
        $hapusIds  = collect($data['hapus_foto_ids'] ?? [])->map(fn ($i) => (int) $i)->all();
        $stored    = [];
        $hapusPath = [];

        try {
            DB::transaction(function () use ($rrf, $user, $data, $pic, $serv, $parts, $gantiPart, $hapusIds, $kirim, $request, &$stored, &$hapusPath) {
                $fresh = $this->kunci($rrf, Rrf::STATUS_DIKERJAKAN);

                if ($kirim && empty($this->idPimpinan())) {
                    throw ValidationException::withMessages([
                        'aksi' => 'Belum ada akun Pimpinan yang aktif untuk menerima RRF ini.',
                    ]);
                }

                // Total foto after setelah perubahan tidak boleh lebih dari batas
                $sisa = $fresh->photos()
                    ->where('tipe', 'after')
                    ->whereNotIn('id', $hapusIds)
                    ->count();

                if ($sisa + count($request->file('fotos', [])) > self::MAKS_FOTO) {
                    throw ValidationException::withMessages([
                        'fotos' => 'Total foto after maksimal ' . self::MAKS_FOTO . '.',
                    ]);
                }

                $atribut = [
                    'pic_nama'         => $pic,
                    'shift_kerja'      => $data['shift_kerja'],
                    'serv_schedule_at' => $serv,
                    'cause'            => $data['cause'],
                    'counter_measure'  => $data['counter_measure'] ?? null,
                    'remark'           => $data['remark'] ?? null,
                ];

                $stopAt = null;
                $detik  = null;
                $repair = null;
                $bagi   = null;

                if (!empty($data['stop_line_jam'])) {
                    [$stopAt, $detik] = RrfDurasi::hitung($serv, $data['stop_line_jam']);

                    $bagi   = $fresh->pembagiTimeRepair();
                    $repair = (int) round($detik / $bagi);
                }

                $atribut += [
                    'stop_line_at'        => $stopAt,
                    'downtime_detik'      => $detik,
                    'time_repair_detik'   => $repair,
                    'time_repair_pembagi' => $bagi,
                ];

                $fresh->update($atribut);

                if ($gantiPart) {
                    $fresh->parts()->delete();

                    foreach ($parts as $p) {
                        $fresh->parts()->create($p);
                    }
                }

                // Foto after yang ditandai hapus
                $dihapus = $fresh->photos()
                    ->where('tipe', 'after')
                    ->whereIn('id', $hapusIds)
                    ->get();

                foreach ($dihapus as $foto) {
                    $hapusPath[] = $foto->file_path;
                    $foto->delete();
                }

                $this->simpanFotoAfter($fresh, $request, $user->id, $stored);

                if ($kirim) {
                    $this->kirimKePimpinan(
                        $fresh,
                        $user,
                        $data['kirim_catatan'] ?? null,
                        (int) $detik,
                        (int) $repair,
                        (int) $bagi
                    );
                } else {
                    $ket = $detik !== null
                        ? '. Down time ' . RrfDurasi::format($detik)
                        : '';

                    $this->catat(
                        $fresh,
                        Rrf::STATUS_DIKERJAKAN,
                        Rrf::STATUS_DIKERJAKAN,
                        $user->id,
                        'Data penanganan diperbarui' . $ket
                    );

                    RrfNotifier::keProduksi(
                        $fresh,
                        'Penanganan RRF Diperbarui',
                        "Maintenance memperbarui data penanganan RRF {$fresh->rrf_no}. PIC MTC: {$pic}.",
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

        return back()->with(
            'success',
            $kirim
                ? 'Perbaikan selesai dan dikirim ke Pimpinan untuk diverifikasi.'
                : 'Data penanganan tersimpan.'
        );
    }

    /* ================================================================
     | AKSI PIMPINAN  ->  notifikasi ke Admin + SPV + semua operator
     ================================================================ */

    /** selesai -> closed */
    public function close(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        abort_unless($user->role === 'pimpinan', 403, 'Hanya Pimpinan yang bisa meng-close RRF.');

        $data = $request->validate([
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $catatan = trim((string) ($data['catatan'] ?? ''));

        DB::transaction(function () use ($rrf, $user, $catatan) {
            $fresh = $this->kunci($rrf, Rrf::STATUS_SELESAI);

            $fresh->update([
                'status'    => Rrf::STATUS_CLOSED,
                'closed_at' => now(),
                'closed_by' => $user->id,
            ]);

            $this->catat(
                $fresh,
                Rrf::STATUS_SELESAI,
                Rrf::STATUS_CLOSED,
                $user->id,
                'Diverifikasi dan di-close oleh Pimpinan'
                    . ($catatan !== '' ? ". Catatan: {$catatan}" : '')
            );

            RrfNotifier::kirim(
                $fresh,
                ['admin', 'spv_produksi', 'operator_produksi'],
                'RRF Di-close',
                "RRF {$fresh->rrf_no} sudah diverifikasi Pimpinan dan berstatus Closed.",
                $user->id
            );
        });

        return back()->with('success', "RRF {$rrf->rrf_no} sudah diverifikasi dan di-close.");
    }

    /** selesai -> dikerjakan (dikembalikan Pimpinan ke Maintenance, Admin bisa mengedit lagi) */
    public function kembalikan(Request $request, Rrf $rrf)
    {
        $user = $request->user();

        abort_unless($user->role === 'pimpinan', 403, 'Hanya Pimpinan yang bisa mengembalikan RRF ke Maintenance.');

        $data = $request->validate([
            'catatan' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'catatan.required' => 'Alasan pengembalian harus diisi.',
            'catatan.min'      => 'Alasan pengembalian minimal 5 karakter.',
        ]);

        $alasan = trim($data['catatan']);

        DB::transaction(function () use ($rrf, $user, $alasan) {
            $fresh = $this->kunci($rrf, Rrf::STATUS_SELESAI);

            $fresh->update([
                'status'                => Rrf::STATUS_DIKERJAKAN,
                'dikirim_pimpinan_at'   => null,
                'dikirim_pimpinan_oleh' => null,
            ]);

            $this->catat(
                $fresh,
                Rrf::STATUS_SELESAI,
                Rrf::STATUS_DIKERJAKAN,
                $user->id,
                "Dikembalikan Pimpinan ke Maintenance. Alasan: {$alasan}"
            );

            RrfNotifier::kirim(
                $fresh,
                ['admin', 'spv_produksi', 'operator_produksi'],
                'RRF Dikembalikan Pimpinan',
                "RRF {$fresh->rrf_no} dikembalikan Pimpinan ke Maintenance untuk diperbaiki. Alasan: {$alasan}",
                $user->id
            );
        });

        return back()->with('success', 'RRF dikembalikan ke Maintenance.');
    }

    /* ================================================================
     | PEMBANTU
     ================================================================ */

    /** Aturan isian penanganan. Mode "ubah" (status dikerjakan) menambah stop line dan hapus foto. */
    private function aturanPenanganan(bool $ubah, bool $kirim = false): array
    {
        $aturan = [
            'pic_nama'            => ['required', 'string', 'max:255'],
            'shift_kerja'         => ['required', Rule::in(config('rrf.shift_options'))],
            'serv_tanggal'        => ['required', 'date'],
            'serv_jam'            => ['required', 'date_format:H:i'],
            'cause'               => ['required', 'string', 'max:2000'],
            'counter_measure'     => ['nullable', 'string', 'max:2000'],
            'remark'              => ['nullable', 'string', 'max:2000'],
            'parts'               => ['nullable', 'array', 'max:10'],
            'parts.*.part_name'   => ['nullable', 'string', 'max:255'],
            'parts.*.model_type'  => ['nullable', 'string', 'max:255'],
            'parts.*.maker'       => ['nullable', 'string', 'max:255'],
            'parts.*.qty'         => ['nullable', 'integer', 'min:1', 'max:9999'],
            'parts.*.other'       => ['nullable', 'string', 'max:255'],
            'fotos'               => ['nullable', 'array', 'max:' . self::MAKS_FOTO],
            'fotos.*'             => ['image', 'max:5120'],
        ];

        if ($ubah) {
            $aturan['stop_line_jam']     = $kirim
                ? ['required', 'date_format:H:i']
                : ['nullable', 'date_format:H:i'];
            $aturan['hapus_foto_ids']    = ['nullable', 'array'];
            $aturan['hapus_foto_ids.*']  = ['integer'];
            $aturan['kirim_catatan']     = ['nullable', 'string', 'max:500'];
        }

        return $aturan;
    }

    private function pesanPenanganan(): array
    {
        return [
            'pic_nama.required'         => 'PIC MTC harus diisi.',
            'shift_kerja.required'      => 'Shift harus dipilih.',
            'serv_tanggal.required'     => 'Tanggal serv. schedule harus diisi.',
            'serv_jam.required'         => 'Jam serv. schedule harus diisi.',
            'serv_jam.date_format'      => 'Format jam harus HH:MM, contoh 13:00.',
            'cause.required'            => 'Cause (penyebab) harus diisi.',
            'stop_line_jam.required'    => 'Jam stop line harus diisi sebelum dikirim ke Pimpinan.',
            'stop_line_jam.date_format' => 'Format jam harus HH:MM, contoh 12:00.',
            'fotos.*.image'             => 'File foto harus berupa gambar.',
            'fotos.*.max'               => 'Ukuran tiap foto maksimal 5 MB.',
        ];
    }

    /** Data awal form penanganan, langsung dari kolom di database. */
    private function dataPenanganan(Rrf $rrf): array
    {
        $rrf->loadMissing(['parts', 'photos']);

        // Kalau serv. schedule belum diisi, pakai jadwal yang diminta produksi
        $serv = $rrf->serv_schedule_at ?? $rrf->req_schedule_at;

        return [
            'pic_nama'        => $rrf->pic_nama,
            'shift_kerja'     => $rrf->shift_kerja,
            'serv_tanggal'    => $serv?->format('Y-m-d'),
            'serv_jam'        => $serv?->format('H:i'),
            'stop_line_jam'   => $rrf->stop_line_at?->format('H:i'),
            'cause'           => $rrf->cause,
            'counter_measure' => $rrf->counter_measure,
            'remark'          => $rrf->remark,
            'parts'           => $rrf->parts->map(fn ($p) => [
                'part_name'  => $p->part_name,
                'model_type' => $p->model_type,
                'maker'      => $p->maker,
                'qty'        => $p->qty,
                'other'      => $p->other,
            ])->values(),
            'foto_after'      => $rrf->photos
                ->where('tipe', 'after')
                ->map(fn ($p) => [
                    'id'  => $p->id,
                    'url' => asset('storage/' . ltrim($p->file_path, '/')),
                ])
                ->values(),
        ];
    }

    /** Penanda "dikembalikan Pimpinan" pada riwayat status. */
    private function saringPengembalian($query)
    {
        return $query
            ->where('status_lama', Rrf::STATUS_SELESAI)
            ->where('status_baru', Rrf::STATUS_DIKERJAKAN);
    }

    /** dikerjakan -> selesai. Dipanggil di dalam transaksi `simpan`. */
    private function kirimKePimpinan(
        Rrf $fresh,
        User $user,
        ?string $catatan,
        int $detik,
        int $repair,
        int $pembagi
    ): void {
        $fresh->update([
            'status'                => Rrf::STATUS_SELESAI,
            'dikirim_pimpinan_at'   => now(),
            'dikirim_pimpinan_oleh' => $user->id,
        ]);

        $downtimeText = RrfDurasi::format($detik);
        $repairText   = RrfDurasi::format($repair);
        $ket          = $pembagi > 1 ? " (dibagi {$pembagi} RRF mesin ini)" : '';
        $catatan      = trim((string) $catatan);

        $this->catat(
            $fresh,
            Rrf::STATUS_DIKERJAKAN,
            Rrf::STATUS_SELESAI,
            $user->id,
            "Perbaikan selesai dan dikirim ke Pimpinan. Down time {$downtimeText}, time repair {$repairText}{$ket}"
                . ($catatan !== '' ? ". Catatan Maintenance: {$catatan}" : '')
        );

        // Pimpinan: ada RRF yang menunggu verifikasi
        RrfNotifier::kePimpinan(
            $fresh,
            'RRF Menunggu Verifikasi Anda',
            "RRF {$fresh->rrf_no} ({$fresh->nama_mesin}) selesai dikerjakan Maintenance dan menunggu verifikasi Anda. Down time {$downtimeText}.",
            $user->id
        );

        // SPV + semua operator divisi: perbaikan selesai
        RrfNotifier::keProduksi(
            $fresh,
            'Perbaikan Selesai',
            "Maintenance menyelesaikan RRF {$fresh->rrf_no}. Menunggu verifikasi Pimpinan.",
            $user->id
        );
    }

    /** Kunci baris dan pastikan statusnya masih sesuai (cegah klik ganda). */
    private function kunci(Rrf $rrf, string $statusSyarat): Rrf
    {
        $fresh = Rrf::whereKey($rrf->id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($fresh->status !== $statusSyarat) {
            throw ValidationException::withMessages([
                'aksi' => 'Status RRF sudah berubah. Muat ulang halaman.',
            ]);
        }

        return $fresh;
    }

    /** Total foto after (yang sudah ada + yang baru) tidak boleh lebih dari batas. */
    private function cekKuotaFoto(Rrf $rrf, Request $request): void
    {
        $ada  = $rrf->photos()->where('tipe', 'after')->count();
        $baru = count($request->file('fotos', []));

        if ($ada + $baru > self::MAKS_FOTO) {
            throw ValidationException::withMessages([
                'fotos' => 'Total foto after maksimal ' . self::MAKS_FOTO
                    . " (sudah ada {$ada}).",
            ]);
        }
    }

    private function simpanFotoAfter(Rrf $rrf, Request $request, int $userId, array &$stored): void
    {
        foreach ($request->file('fotos', []) as $file) {
            $path = $file->store('rrf/after', 'public');
            $stored[] = $path;

            $rrf->photos()->create([
                'tipe'        => 'after',
                'file_path'   => $path,
                'uploaded_by' => $userId,
            ]);
        }
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

    /** @return array<int,int> */
    private function idPimpinan(): array
    {
        return User::where('role', 'pimpinan')
            ->where('is_active', true)
            ->pluck('id')
            ->all();
    }

    private function catat(
        Rrf $rrf,
        string $lama,
        string $baru,
        int $userId,
        ?string $catatan
    ): void {
        RrfStatusLog::create([
            'rrf_id'      => $rrf->id,
            'status_lama' => $lama,
            'status_baru' => $baru,
            'user_id'     => $userId,
            'catatan'     => $catatan,
        ]);
    }
}