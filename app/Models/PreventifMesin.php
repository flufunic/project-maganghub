<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreventifMesin extends Model
{
    protected $table = 'preventif_mesins';

    protected $primaryKey = 'no';

    public $timestamps = false;

    protected $fillable = [
        'divisi',
        'no_item',
        'item_preventif',
        'periode',
        'periode_nilai',
        'periode_satuan',
        'tanggal_plan_awal',
        'jumlah_dilakukan',
        'durasi',
        'total_durasi',
        'dot',
        'hot',
        'item',
        'status',
    ];

    protected $casts = [
        'periode_nilai' => 'decimal:2',
        'durasi' => 'decimal:2',
        'tanggal_plan_awal' => 'date',
        'total_durasi' => 'decimal:2',
        'dot' => 'decimal:2',
        'hot' => 'decimal:2',
    ];

    public function checklists(): HasMany
    {
        return $this->hasMany(
            PreventifChecklist::class,
            'preventif_mesin_id',
            'no'
        );
    }
}