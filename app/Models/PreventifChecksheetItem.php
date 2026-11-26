<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifChecksheetItem extends Model
{
    protected $fillable = ['preventif_checksheet_id', 'no', 'inspection_point', 'standar'];

    public function checksheet(): BelongsTo
    {
        return $this->belongsTo(PreventifChecksheet::class, 'preventif_checksheet_id');
    }
}