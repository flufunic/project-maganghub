<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MtcRepair extends Model
{
    protected $table = 'mtc_repairs';

    protected $fillable = [
        'qmos_repair_id',
        'location',
        'machine',
        'machine_no',
        'asset_no',
        'jenis_no_post',
        'division_pelapor',
        'jenis_permintaan',
        'machine_class',
        'machine_class_description',
        'repair_date',
        'req_start_at',
        'req_finish_at',
        'req_duration_minutes',
        'problem',
        'request_activity',
        'counter_measure',
        'part_name',
        'part_model_type',
        'requested_by',
        'submitted_by_frm',
        'supervisor',
        'mtc_name',
        'analisa',
        'perbaikan',
        'judge',
        'repaired_at',
        'status',
        'rrf_status',
        'rrf_submitted_at',
        'source_created_at',
        'source_updated_at',
        'synced_at',
        'raw_payload',
    ];

    protected function casts(): array
    {
        return [
            'repair_date' => 'date',
            'req_start_at' => 'datetime',
            'req_finish_at' => 'datetime',
            'rrf_submitted_at' => 'datetime',
            'repaired_at' => 'datetime',
            'source_created_at' => 'datetime',
            'source_updated_at' => 'datetime',
            'synced_at' => 'datetime',
            'raw_payload' => 'array',
        ];
    }

    public function rrf(): HasOne
    {
        return $this->hasOne(Rrf::class, 'mtc_repair_id');
    }
}
