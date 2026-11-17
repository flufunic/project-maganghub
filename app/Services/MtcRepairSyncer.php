<?php

namespace App\Services;

use App\Models\MtcRepair;
use App\Support\RrfNotifier;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class MtcRepairSyncer
{
    public function __construct(private MtcRepairClient $client)
    {
    }

    /** @return array{total_api:int, baru:int, diperbarui:int, dilewati:int, tidak_ada_di_api:array} */
    public function jalankan(): array
    {
        $response = $client = $this->client->repairs(fresh: true);
        $data     = $response['data'];

        $baru = $diperbarui = $dilewati = 0;
        $idDariApi = [];
        $repairBaru = [];

        DB::transaction(function () use ($data, &$baru, &$diperbarui, &$dilewati, &$idDariApi, &$repairBaru) {
            foreach ($data as $item) {
                if (!is_array($item) || (int) ($item['qmos_repair_id'] ?? 0) <= 0) {
                    $dilewati++;
                    continue;
                }

                $id          = (int) $item['qmos_repair_id'];
                $idDariApi[] = $id;

                $schedule    = $item['req_schedule'] ?? [];
                $production  = $item['for_production_use'] ?? [];
                $maintenance = $item['maintenance_result'] ?? [];

                $existing = MtcRepair::where('qmos_repair_id', $id)->first();

                // Status lokal jangan tertimpa kalau hasil sudah terkirim ke QMOS
                $status = ($existing && $existing->callback_status === 'sent')
                    ? $existing->status
                    : ($item['status'] ?? null);

                // rrf_status & callback_* sengaja tidak ditimpa (milik aplikasi ini)
                $repair = MtcRepair::updateOrCreate(
                    ['qmos_repair_id' => $id],
                    [
                        'location' => $item['location'] ?? null,
                        'machine' => $item['machine'] ?? null,
                        'machine_no' => $item['machine_no'] ?? null,
                        'asset_no' => $item['asset_no'] ?? null,
                        'jenis_no_post' => $item['jenis_no_post'] ?? null,
                        'division_pelapor' => $item['division_pelapor'] ?? null,
                        'jenis_permintaan' => $item['jenis_permintaan'] ?? null,
                        'machine_class' => $item['machine_class'] ?? null,
                        'machine_class_description' => $item['machine_class_description'] ?? null,
                        'repair_date' => $this->tanggal($schedule['repair_date'] ?? null),
                        'req_start_at' => $this->tanggal($schedule['req_start_at'] ?? null),
                        'req_finish_at' => $this->tanggal($schedule['req_finish_at'] ?? null),
                        'req_duration_minutes' => isset($schedule['req_duration_minutes'])
                            ? (int) $schedule['req_duration_minutes'] : null,
                        'problem' => $item['problem'] ?? null,
                        'request_activity' => $item['request_activity'] ?? null,
                        'counter_measure' => $item['counter_measure'] ?? null,
                        'part_name' => $item['part_name'] ?? null,
                        'part_model_type' => $item['part_model_type'] ?? null,
                        'requested_by' => $production['requested_by'] ?? null,
                        'submitted_by_frm' => $production['submitted_by_frm'] ?? null,
                        'supervisor' => $production['supervisor'] ?? null,
                        'mtc_name' => $maintenance['mtc_name'] ?? null,
                        'analisa' => $maintenance['analisa'] ?? null,
                        'perbaikan' => $maintenance['perbaikan'] ?? null,
                        'judge' => $maintenance['judge'] ?? null,
                        'repaired_at' => $this->tanggal($maintenance['repaired_at'] ?? null),
                        'status' => $status,
                        'rrf_submitted_at' => $this->tanggal($item['rrf_submitted_at'] ?? null),
                        'source_created_at' => $this->tanggal($item['created_at'] ?? null),
                        'source_updated_at' => $this->tanggal($item['updated_at'] ?? null),
                        'synced_at' => now(),
                        'raw_payload' => $item,
                    ]
                );

                if ($repair->wasRecentlyCreated) {
                    $baru++;
                    $repairBaru[] = $repair;

                    if (!$repair->rrf_status) {
                        $repair->update(['rrf_status' => 'belum_dibuat']);
                    }
                } else {
                    $diperbarui++;
                }
            }
        });

        // Notifikasi ke Admin untuk setiap data yang baru masuk (di luar transaksi)
        foreach ($repairBaru as $repair) {
            try {
                RrfNotifier::keAdminRepairBaru(
                    $repair,
                    'Data Repair Baru dari QMOS',
                    "QMOS-{$repair->qmos_repair_id} ({$repair->machine}) masuk dan menunggu dibuatkan RRF. Masalah: "
                        . ($repair->problem ?: '-')
                );
            } catch (Throwable $e) {
                Log::warning('Notifikasi repair baru gagal', [
                    'qmos_repair_id' => $repair->qmos_repair_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $tidakAdaDiApi = MtcRepair::whereNotIn('qmos_repair_id', $idDariApi)
            ->orderBy('qmos_repair_id')
            ->pluck('qmos_repair_id')
            ->all();

        return [
            'total_api'        => (int) $response['total'],
            'baru'             => $baru,
            'diperbarui'       => $diperbarui,
            'dilewati'         => $dilewati,
            'tidak_ada_di_api' => $tidakAdaDiApi,
        ];
    }

    private function tanggal($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d H:i:s');
        } catch (Throwable) {
            return null;
        }
    }
}