<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RrfPhoto extends Model
{
    protected $fillable = ['rrf_id', 'tipe', 'file_path', 'uploaded_by'];

    public function rrf(): BelongsTo
    {
        return $this->belongsTo(Rrf::class, 'rrf_id');
    }
}