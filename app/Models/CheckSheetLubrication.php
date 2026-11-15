<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetLubrication extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'check_sheet_id', 'line_id', 'no', 'sub_mesin', 'jenis_pelumasan', 'qty',
        'method', 'tools', 'time_minutes', 'interval', 'pic',
    ];

    public function checkSheet(): BelongsTo
    {
        return $this->belongsTo(CheckSheet::class)->withTrashed();
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(Line::class);
    }
}
