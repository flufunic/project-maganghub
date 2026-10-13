<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifRevisi extends Model
{
    protected $table = 'preventif_revisis';

    protected $fillable = [
        'preventif_pengiriman_id',
        'preventif_mesin_id',
        'item_label',
        'jenis',
        'keterangan',
        'nilai_lama',
        'nilai_baru',
        'diubah_oleh',
        'ditinjau_pada',
    ];

    protected $casts = [
        'ditinjau_pada' => 'datetime',
    ];

    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(
            PreventifPengiriman::class,
            'preventif_pengiriman_id'
        );
    }

    public function pengubah(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diubah_oleh');
    }
}