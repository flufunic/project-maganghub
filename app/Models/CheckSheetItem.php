<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CheckSheetItem extends Model
{
    protected $fillable = [
        'check_sheet_id',
        'no',
        'inspection_point',
        'condition',
        'method',
        'shift',
    ];

    protected function casts(): array
    {
        return [
            'no' => 'integer',
        ];
    }

    public function checkSheet(): BelongsTo
    {
        return $this->belongsTo(CheckSheet::class);
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(CheckSheetChecklist::class);
    }
}