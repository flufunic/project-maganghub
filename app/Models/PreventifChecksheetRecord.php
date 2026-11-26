<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreventifChecksheetRecord extends Model
{
    protected $fillable = [
        'preventif_checksheet_id',
        'tahun',
        'bulan',
        'nama_mesin',
        'line',
        'tanggal_pelaksanaan',
        'pic_pelaksana',
    ];

    protected function casts(): array
    {
        return ['tanggal_pelaksanaan' => 'date:Y-m-d'];
    }

    public function checksheet(): BelongsTo
    {
        return $this->belongsTo(PreventifChecksheet::class, 'preventif_checksheet_id');
    }

    public function aksis(): HasMany
    {
        return $this->hasMany(PreventifChecksheetAksi::class, 'preventif_checksheet_record_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(PreventifChecksheetResult::class, 'preventif_checksheet_record_id');
    }
}