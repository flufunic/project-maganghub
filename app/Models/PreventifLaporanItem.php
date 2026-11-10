<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreventifLaporanItem extends Model
{
    protected $table = 'preventif_laporan_item';

    protected $fillable = [
        'laporan_id', 'bagian', 'preventif_mesin_id', 'mesin',
        'aktivitas', 'penanggulangan', 'komentar',
        'foto_before', 'foto_after', 'urutan',
    ];

    public function laporan(): BelongsTo
    {
        return $this->belongsTo(PreventifLaporanMingguan::class, 'laporan_id');
    }
}
