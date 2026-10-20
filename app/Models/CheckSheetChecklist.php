<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckSheetChecklist extends Model
{
    protected $fillable = [
        'check_sheet_item_id',
        'line_id',
        'tanggal',
        'status',
        'plan',
        'actual',
        'selisih',
        'catatan',
        'catatan_plan',
    ];
    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'status' => 'boolean',
            'plan'    => 'boolean',
        ];
    }

    public function checkSheetItem(): BelongsTo
    {
        return $this->belongsTo(CheckSheetItem::class)->withTrashed();
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(Line::class);
    }
}