<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rrf extends Model
{
    protected $table = 'rrf';

    protected $fillable = [
        'mtc_repair_id',
        'rrf_no',
        'rev',
        'divisi_id',
        'machine_id',
        'rrf_class_id',
        'jenis_permintaan',
        'req_schedule_at',
        'problem',
        'created_by',
        'serv_schedule_at',
        'cause',
        'counter_measure',
        'remark',
        'start_at',
        'finish_at',
        'downtime_menit',
        'stop_line_menit',
        'jumlah_man',
        'shift_id',
        'pic_mtc_id',
        'pic_nama',       // TAMBAHKAN
        'shift_kerja',    // TAMBAHKAN
        'received_by',
        'received_at',
        'status',
        'stop_line_at',
        'downtime_detik',
        'time_repair_detik',
        'time_repair_pembagi',
    ];

    protected function casts(): array
    {
        return [
            'req_schedule_at' => 'datetime',
            'serv_schedule_at' => 'datetime',
            'start_at' => 'datetime',
            'finish_at' => 'datetime',
            'received_at' => 'datetime',
            'stop_line_at'     => 'datetime',
            
        ];
    }

    public function mtcRepair(): BelongsTo
    {
        return $this->belongsTo(MtcRepair::class, 'mtc_repair_id');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(RrfPart::class, 'rrf_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(RrfPhoto::class, 'rrf_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(RrfApproval::class, 'rrf_id');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(RrfStatusLog::class, 'rrf_id');
    }
}