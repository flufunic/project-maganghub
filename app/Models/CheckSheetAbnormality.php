<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetAbnormality extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'check_sheet_id',
        'line_id',
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
        return $this->belongsTo(CheckSheet::class)->withTrashed();
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(Line::class);
    }
}