<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifMesinBulanan extends Model
{
    protected $table = 'preventif_mesin_bulanans';

    public $timestamps = false;

    protected $fillable = [
        'preventif_mesin_id',
        'tahun',
        'bulan',
        'durasi',
        'total_durasi',
        'dot',
        'hot',
    ];

    protected $casts = [
        'durasi' => 'decimal:2',
        'total_durasi' => 'decimal:2',
        'dot' => 'decimal:2',
        'hot' => 'decimal:2',
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