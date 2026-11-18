<?php

namespace App\Http\Controllers;

use App\Models\MtcRepair;
use App\Services\MtcRepairSyncer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;
use App\Support\Waktu;

class RepairMtcController extends Controller
{
    private const STATUS_PIMPINAN = ['menunggu_verifikasi', 'terverifikasi'];

    private const STATUS_ADMIN = ['draft', 'revisi', 'menunggu_verifikasi', 'terverifikasi'];

    public function index(Request $request)
    {
        $user    = $request->user();
        $isAdmin = $user?->role === 'admin';

        $search = trim((string) $request->query('search', ''));

        // Status yang boleh difilter oleh role ini
        $statusBoleh = $isAdmin ? self::STATUS_ADMIN : self::STATUS_PIMPINAN;

        $statusRrf = trim((string) $request->query('status_rrf', ''));

        if (!in_array($statusRrf, $statusBoleh, true)) {
            $statusRrf = '';
        }

        // Admin: belum punya RRF + status QMOS "waiting mtc" dianggap menunggu diisi
        $waitingMtc = fn ($q) => $q->whereDoesntHave('rrf')
            ->whereRaw("LOWER(REPLACE(TRIM(status), '_', ' ')) = ?", ['waiting mtc']);

        // Cakupan dasar per role
        $dasar = function () use ($isAdmin) {
            $q = MtcRepair::query();

            if (!$isAdmin) {
                $q->whereHas('rrf', fn ($r) => $r->whereIn('status', self::STATUS_PIMPINAN));
            }

            return $q;
        };

        // Ringkasan kartu (mengikuti cakupan role)
        $ringkasanRrf = [
            'semua' => $dasar()->count(),

            'menungguVerifikasi' => $dasar()
                ->whereHas('rrf', fn ($r) => $r->where('status', 'menunggu_verifikasi'))
                ->count(),

            'completed' => $dasar()
                ->whereHas('rrf', fn ($r) => $r->where('status', 'terverifikasi'))
                ->count(),
        ];

        if ($isAdmin) {
            $ringkasanRrf['menungguDiisi'] = MtcRepair::where(function ($q) use ($waitingMtc) {
                $q->whereHas('rrf', fn ($r) => $r->where('status', 'draft'))
                    ->orWhere($waitingMtc);
            })->count();

            $ringkasanRrf['revisi'] = MtcRepair::whereHas(
                'rrf',
                fn ($r) => $r->where('status', 'revisi')
            )->count();
        }

        $repairs = $dasar()
            ->with([
                'rrf:id,mtc_repair_id,rrf_no,status,pic_nama,shift_kerja,serv_schedule_at,downtime_detik,cause,counter_measure,remark',
                'rrf.parts',
                'rrf.photos',
                'rrf.approvals.user:id,name',
            ])

            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('qmos_repair_id', 'like', "%{$search}%")
                        ->orWhere('machine', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('division_pelapor', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhere('problem', 'like', "%{$search}%");
                });
            })

            ->when($statusRrf, function ($query) use ($statusRrf, $waitingMtc) {
                if ($statusRrf === 'draft') {
                    $query->where(function ($q) use ($waitingMtc) {
                        $q->whereHas('rrf', fn ($r) => $r->where('status', 'draft'))
                            ->orWhere($waitingMtc);
                    });
                } else {
                    $query->whereHas('rrf', fn ($r) => $r->where('status', $statusRrf));
                }
            })

            // Pimpinan: yang menunggu verifikasi tampil paling atas
            ->when(!$isAdmin, function ($query) {
                $query->orderByRaw(
                    "CASE WHEN EXISTS (
                        SELECT 1 FROM rrf
                        WHERE rrf.mtc_repair_id = mtc_repairs.id
                          AND rrf.status = 'menunggu_verifikasi'
                    ) THEN 0 ELSE 1 END"
                );
            })

            ->latest('source_updated_at')
            ->paginate(15)
            ->withQueryString()

            ->through(function ($repair) {
                $rrf = $repair->rrf;

                $fmt  = fn ($d) => Waktu::wib($d);

                $serv = $rrf?->serv_schedule_at
                    ? Carbon::parse($rrf->serv_schedule_at)->format('d/m/Y H:i')   // WIB apa adanya
                    : null;
                $part = $rrf?->parts->first();

                $menit = ($rrf && $rrf->downtime_detik !== null)
                    ? intdiv((int) $rrf->downtime_detik, 60)
                    : null;

                $supervisor = $rrf?->approvals
                    ->where('status', 'disetujui')
                    ->sortBy('id')
                    ->last()?->user?->name;

                return [
                    'id' => $repair->id,
                    'qmos_repair_id' => $repair->qmos_repair_id,
                    'location' => $repair->location,
                    'machine' => $repair->machine,
                    'machine_no' => $repair->machine_no,
                    'asset_no' => $repair->asset_no,
                    'division_pelapor' => $repair->division_pelapor,
                    'jenis_permintaan' => $repair->jenis_permintaan,
                    'machine_class' => $repair->machine_class,
                    'machine_class_description' => $repair->machine_class_description,

                    'repair_date' => $repair->repair_date?->format('d/m/Y'),
                    'req_start_at'     => $fmt($repair->req_start_at),

                    'problem' => $repair->problem,
                    'request_activity' => $repair->request_activity,
                    'requested_by' => $repair->requested_by,
                    'submitted_by_frm' => $repair->submitted_by_frm,
                    'judge' => $repair->judge,

                    'status' => $repair->status,
                    'rrf_status' => $repair->rrf_status,
                    'rrf_submitted_at' => $fmt($repair->rrf_submitted_at),
                    'synced_at'        => $fmt($repair->synced_at),

                    'has_rrf' => $rrf !== null,
                    'rrf_id' => $rrf?->id,
                    'rrf_local_status' => $rrf?->status,
                    'rrf_no' => $rrf?->rrf_no,

                    'req_finish_at'    => $fmt($repair->req_finish_at) ?: $serv,
                    'req_duration_minutes' => $repair->req_duration_minutes ?? $menit,
                    'supervisor' => $repair->supervisor ?: $supervisor,
                    'mtc_name' => $repair->mtc_name ?: $rrf?->pic_nama,
                    'analisa' => $repair->analisa ?: $rrf?->cause,
                    'perbaikan' => $repair->perbaikan ?: $rrf?->counter_measure,
                    'counter_measure' => $repair->counter_measure ?: $rrf?->remark,
                    'part_name' => $repair->part_name ?: $part?->part_name,
                    'part_model_type' => $repair->part_model_type ?: $part?->model_type,
                    'repaired_at'      => $fmt($repair->repaired_at) ?: $serv,

                    'shift_kerja' => $rrf?->shift_kerja,

                    'photos' => $rrf
                        ? $rrf->photos->map(fn ($p) => [
                            'tipe' => $p->tipe,
                            'url' => '/storage/' . ltrim($p->file_path, '/'),
                        ])->values()
                        : [],
                ];
            });

        return Inertia::render('Mtc/Repairs/Index', [
            'repairs' => $repairs,
            'filters' => [
                'search' => $search,
                'status_rrf' => $statusRrf,
            ],
            'totalRepairs' => $ringkasanRrf['semua'],
            'canCreateRrf' => $isAdmin,
            'role' => $user?->role,
            'ringkasanRrf' => $ringkasanRrf,
        ]);
    }

    public function sync(Request $request, MtcRepairSyncer $syncer)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        try {
            $h = $syncer->jalankan();

            $pesan = "Sinkronisasi selesai. API melaporkan {$h['total_api']} data. "
                . "Baru: {$h['baru']}, diperbarui: {$h['diperbarui']}, dilewati: {$h['dilewati']}.";

            return redirect()
                ->route('mtc.rrf.repair-mtc.index')
                ->with('success', $pesan);
        } catch (Throwable $e) {
            Log::error('Sinkronisasi API QMOS gagal', [
                'message' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
            ]);

            return redirect()
                ->route('mtc.rrf.repair-mtc.index')
                ->with('error', 'Sinkronisasi gagal: ' . $e->getMessage());
        }
    }
}