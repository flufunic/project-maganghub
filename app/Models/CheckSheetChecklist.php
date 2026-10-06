<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckSheetChecklist extends Model
{
    protected $fillable = [
        'check_sheet_item_id',
        'tanggal',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'status' => 'boolean',
        ];
    }

    public function checkSheetItem(): BelongsTo
    {
        return $this->belongsTo(CheckSheetItem::class);
    }
}