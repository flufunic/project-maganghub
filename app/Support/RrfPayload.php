<?php

namespace App\Support;

use App\Models\Rrf;

class RrfPayload
{
    public static function detail(Rrf $rrf): array
    {
        $rrf->loadMissing([
            'divisi', 'kelas', 'creator', 'pic', 'receiver',
            'parts', 'photos', 'statusLogs.user',
        ]);

        $fmt = fn ($dt) => $dt?->format('d/m/Y H:i');
        $foto = fn (string $tipe) => $rrf->photos
            ->where('tipe', $tipe)
            ->map(fn ($p) => [
                'id'  => $p->id,
                'url' => asset('storage/' . ltrim($p->file_path, '/')),
            ])
            ->values();

        $stopText = null;
        if ($rrf->stop_line_at) {
            $stopText = $rrf->stop_line_at->format('H:i');

            if ($rrf->serv_schedule_at && !$rrf->stop_line_at->isSameDay($rrf->serv_schedule_at)) {
                $stopText .= ' (hari berikutnya)';
            }
        }

        return [
            'id'                  => $rrf->id,
            'rrf_no'              => $rrf->rrf_no,
            'status'              => $rrf->status,
            'status_label'        => Rrf::STATUS_LABEL[$rrf->status] ?? $rrf->status,
            'divisi'              => $rrf->divisi_pelapor ?: $rrf->divisi?->nama_divisi,
            'lokasi'              => $rrf->lokasi,
            'mesin'               => $rrf->nama_mesin,
            'kelas'               => $rrf->kelas ? [
                'kode'      => $rrf->kelas->kode,
                'nama'      => $rrf->kelas->nama,
                'deskripsi' => $rrf->kelas->deskripsi,
            ] : null,
            'jenis_permintaan'    => $rrf->jenis_permintaan,
            'req_tanggal'         => $rrf->req_schedule_at?->format('Y-m-d'),
            'req_jam'             => $rrf->req_schedule_at?->format('H:i'),
            'req_schedule_text'   => $fmt($rrf->req_schedule_at),
            'problem'             => $rrf->problem,
            'request_activity'    => $rrf->counter_measure,
            'pembuat'             => $rrf->creator?->name,
            'dibuat_pada'         => $fmt($rrf->created_at),

            'diterima_oleh'       => $rrf->receiver?->name,
            'diterima_pada'       => $fmt($rrf->received_at),
            'pic'                 => $rrf->pic_nama ?: $rrf->pic?->name,
            'serv_tanggal'        => $rrf->serv_schedule_at?->format('Y-m-d'),
            'serv_jam'            => $rrf->serv_schedule_at?->format('H:i'),
            'serv_schedule_text'  => $fmt($rrf->serv_schedule_at),
            'stop_line_text'      => $stopText,
            'downtime'            => RrfDurasi::format($rrf->downtime_detik),
            'time_repair'         => RrfDurasi::format($rrf->time_repair_detik),
            'time_repair_pembagi' => $rrf->time_repair_pembagi,
            'man'                 => $rrf->man_kerja,
            'shift'               => $rrf->shift_kerja,
            'cause'               => $rrf->cause,
            'remark'              => $rrf->remark,

            'parts' => $rrf->parts->map(fn ($p) => [
                'id'         => $p->id,
                'part_name'  => $p->part_name,
                'model_type' => $p->model_type,
                'maker'      => $p->maker,
                'qty'        => $p->qty,
                'other'      => $p->other,
            ])->values(),

            'foto_before' => $foto('before'),
            'foto_after'  => $foto('after'),

            'logs' => $rrf->statusLogs->sortBy('id')->map(fn ($l) => [
                'id'      => $l->id,
                'status'  => Rrf::STATUS_LABEL[$l->status_baru] ?? $l->status_baru,
                'oleh'    => $l->user?->name,
                'waktu'   => $fmt($l->created_at),
                'catatan' => $l->catatan,
            ])->values(),
        ];
    }
}