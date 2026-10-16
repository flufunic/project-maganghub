<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckSheetMonitoringWeek extends Model
{
    protected $fillable = [
        'monitoring_item_id',
        'tahun',
        'bulan',
        'week',
        'foto_path',
        'running_hours',
    ];

    protected $appends = ['foto_url'];

    protected function casts(): array
    {
        return [
            'tahun'         => 'integer',
            'bulan'         => 'integer',
            'week'          => 'integer',
            'running_hours' => 'float',
        ];
    }

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto_path ? asset('storage/' . $this->foto_path) : null;
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(CheckSheetMonitoringItem::class, 'monitoring_item_id')->withTrashed();
    }
}