<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckSheetAbnormality extends Model
{
    protected $fillable = [
        'check_sheet_id',
        'tanggal',
        'abnormality',
        'countermeasure',
        'status',
        'pic',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
        ];
    }

    public function checkSheet(): BelongsTo
    {
        return $this->belongsTo(CheckSheet::class);
    }
}