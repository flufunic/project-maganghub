<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CheckSheet extends Model
{
    protected $fillable = [
        'divisi_id',
        'nomor_dokumen',
        'nama_checksheet',
    ];

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CheckSheetItem::class);
    }

    public function abnormalities(): HasMany
    {
        return $this->hasMany(CheckSheetAbnormality::class);
    }
}