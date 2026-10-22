<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OverhaulSchedule extends Model
{
    protected $fillable = [
        'overhaul_mesin_id', 'item', 'tahun', 'bulan', 'minggu', 'checked', 'catatan',
    ];

    protected $casts = [
        'checked' => 'boolean',
    ];

    public function mesin(): BelongsTo
    {
        return $this->belongsTo(OverhaulMesin::class, 'overhaul_mesin_id');
    }
}