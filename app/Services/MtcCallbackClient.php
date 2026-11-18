<?php

namespace App\Services;

use App\Models\Rrf;
use App\Support\Waktu;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class MtcCallbackClient
{
    /** Isi yang dikirim ke QMOS. Ubah mapping di sini kalau QMOS meminta lain. */
    public function payload(Rrf $rrf): array
    {
        $rrf->loadMissing(['mtcRepair', 'parts']);

        $part = $rrf->parts->first();

        // serv_schedule_at tersimpan sebagai jam WIB polos, sedangkan QMOS
        // membaca waktu yang diterima sebagai UTC. Jadi dikonversi ke UTC dulu.
        // Cadangan: now() sudah UTC (app.timezone = UTC).
        $waktu = Waktu::utcDariWib($rrf->serv_schedule_at)
            ?? now()->utc()->format('Y-m-d H:i:s');

        $menit = $rrf->downtime_detik !== null
            ? intdiv((int) $rrf->downtime_detik, 60)
            : null;

        return [
            'status'          => 'Completed',
            'mtc_name'        => $rrf->pic_nama,
            'analisa'         => $rrf->cause,
            'perbaikan'       => $rrf->counter_measure,
            'counter_measure' => $rrf->remark,
            'part_name'       => $part?->part_name,
            'part_model_type' => $part?->model_type,
            'judge'           => $rrf->mtcRepair?->judge ?: 'OK',

            // Serv. schedule = waktu selesai (UTC)
            'repaired_at'     => $waktu,
            'finish_at'       => $waktu,
            'req_finish_at'   => $waktu,
            'req_duration_minutes' => $menit,
        ];
    }

    /** @return array{0: bool, 1: ?string} [berhasil, pesan error] */
    public function kirim(Rrf $rrf): array
    {
        $repair = $rrf->mtcRepair;

        if (!$repair) {
            return [false, 'RRF tidak terhubung ke data QMOS.'];
        }

        $base   = \rtrim((string) config('services.mtc.url'), '/');
        $path   = \str_replace('{id}', (string) $repair->qmos_repair_id, (string) config('services.mtc.callback_path'));
        $method = strtoupper((string) config('services.mtc.callback_method', 'POST'));
        $url    = $base . '/' . \ltrim($path, '/');

        $repair->increment('callback_attempts');

        try {
            $res = Http::acceptJson()
                ->withHeaders(['X-API-KEY' => (string) config('services.mtc.key')])
                ->connectTimeout(10)
                ->timeout(20)
                ->retry(2, 500, throw: false)
                ->send($method, $url, ['json' => $this->payload($rrf)]);

            if ($res->successful()) {
                $repair->forceFill([
                    'callback_status'  => 'sent',
                    'callback_sent_at' => now(),
                    'callback_error'   => null,
                    'status'           => 'Completed',
                ])->save();

                return [true, null];
            }

            $error = "QMOS membalas HTTP {$res->status()}: " . mb_substr((string) $res->body(), 0, 300);
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }

        Log::warning('Callback QMOS gagal', ['qmos_repair_id' => $repair->qmos_repair_id, 'url' => $url, 'error' => $error]);

        $repair->forceFill(['callback_status' => 'failed', 'callback_error' => $error])->save();

        return [false, $error];
    }
}