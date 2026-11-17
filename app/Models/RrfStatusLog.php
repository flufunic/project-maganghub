<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RrfStatusLog extends Model
{
    protected $table = 'rrf_status_logs';

    public $timestamps = false;

    protected $fillable = [
        'rrf_id',
        'status_lama',
        'status_baru',
        'user_id',
        'catatan',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function rrf(): BelongsTo
    {
        return $this->belongsTo(Rrf::class, 'rrf_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
