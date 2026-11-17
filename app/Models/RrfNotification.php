<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RrfNotification extends Model
{
    protected $table = 'rrf_notifications';

    protected $fillable = [
        'user_id',
        'rrf_id',
        'mtc_repair_id',
        'judul',
        'pesan',
        'dibaca_pada',
    ];

    protected $casts = [
        'dibaca_pada' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function rrf(): BelongsTo
    {
        return $this->belongsTo(Rrf::class, 'rrf_id');
    }

    public function mtcRepair(): BelongsTo
    {
        return $this->belongsTo(MtcRepair::class, 'mtc_repair_id');
    }
}