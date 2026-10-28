<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OverhaulDokumen extends Model
{
    protected $fillable = [
        'overhaul_mesin_id', 'tahun', 'nama_asli', 'path', 'mime', 'ukuran',
    ];

    protected $appends = ['url', 'download_url'];

    public function mesin(): BelongsTo
    {
        return $this->belongsTo(OverhaulMesin::class, 'overhaul_mesin_id');
    }

    public function getUrlAttribute(): string
    {
        return url("/overhaul-dokumen/{$this->id}");
    }

    public function getDownloadUrlAttribute(): string
    {
        return url("/overhaul-dokumen/{$this->id}/download");
    }
}