<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mesin extends Model
{
    protected $fillable = [
        'divisi_id',
        'nama_mesin',
        'kode_mesin',
    ];

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    public function checkSheets(): HasMany
    {
        return $this->hasMany(CheckSheet::class);
    }
}