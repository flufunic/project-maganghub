<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifChecklist extends Model
{
    protected $table = 'preventif_checklists';

    protected $fillable = [
        'preventif_mesin_id',
        'tanggal',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'status' => 'boolean',
    ];

    public function preventifMesin(): BelongsTo
    {
        return $this->belongsTo(
            PreventifMesin::class,
            'preventif_mesin_id',
            'no'
        );
    }
}