<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetItem extends Model
{
    use SoftDeletes;

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
        return $this->belongsTo(CheckSheet::class)->withTrashed();
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(CheckSheetChecklist::class);
    }
}