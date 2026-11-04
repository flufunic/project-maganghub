<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RrfApproval extends Model
{
    protected $fillable = ['rrf_id', 'tahap', 'user_id', 'status', 'catatan', 'acted_at'];

    protected function casts(): array
    {
        return ['acted_at' => 'datetime'];
    }

    public function rrf(): BelongsTo
    {
        return $this->belongsTo(Rrf::class, 'rrf_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}