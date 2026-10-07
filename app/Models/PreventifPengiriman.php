<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifPengiriman extends Model
{
    protected $table = 'preventif_pengirimans';

    protected $fillable = [
        'tanggal',
        'dikirim_oleh',
        'dikirim_pada',
        'status',
        'alasan_penolakan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'dikirim_pada' => 'datetime',
    ];

    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dikirim_oleh');
    }
}