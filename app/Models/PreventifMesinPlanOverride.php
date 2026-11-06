<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifMesinPlanOverride extends Model
{
    protected $table = 'preventif_mesin_plan_overrides';

    protected $fillable = [
        'preventif_mesin_id',
        'tahun',
        'bulan',
        'tanggal_plan',
    ];

    protected function casts(): array
    {
        return [
            'tahun' => 'integer',
            'bulan' => 'integer',
            'tanggal_plan' => 'array',
        ];
    }

    public function preventifMesin(): BelongsTo
    {
        return $this->belongsTo(
            PreventifMesin::class,
            'preventif_mesin_id',
            'no'
        );
    }
}
