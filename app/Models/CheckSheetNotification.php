<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckSheetNotification extends Model
{
    protected $table = 'check_sheet_notifications';

    protected $fillable = [
        'user_id',
        'check_sheet_pengiriman_id',
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

    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(
            CheckSheetPengiriman::class,
            'check_sheet_pengiriman_id'
        );
    }
}