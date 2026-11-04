<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RrfPart extends Model
{
    protected $fillable = ['rrf_id', 'part_name', 'model_type', 'maker', 'qty', 'other'];

    public function rrf(): BelongsTo
    {
        return $this->belongsTo(Rrf::class, 'rrf_id');
    }
}