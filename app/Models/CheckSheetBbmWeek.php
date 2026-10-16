<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckSheetBbmWeek extends Model
{
    protected $table = 'check_sheet_bbm_weeks';

    protected $fillable = [
        'bbm_item_id',
        'tahun',
        'bulan',
        'week',
        'running_hours',
    ];

    protected function casts(): array
    {
        return [
            'tahun'         => 'integer',
            'bulan'         => 'integer',
            'week'          => 'integer',
            'running_hours' => 'float',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(CheckSheetBbmItem::class, 'bbm_item_id')->withTrashed();
    }
}