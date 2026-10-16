<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetMonitoringItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'check_sheet_id',
        'no',
        'nama_item',
    ];

    protected function casts(): array
    {
        return [
            'no' => 'integer',
        ];
    }

    public function checkSheet(): BelongsTo
    {
        return $this->belongsTo(CheckSheet::class)->withTrashed();
    }

    public function weeks(): HasMany
    {
        return $this->hasMany(CheckSheetMonitoringWeek::class, 'monitoring_item_id');
    }
}