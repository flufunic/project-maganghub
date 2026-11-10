<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreventifLaporanRevisi extends Model
{
    protected $table = 'preventif_laporan_revisi';

    protected $fillable = ['laporan_id', 'user_id', 'keterangan'];
}
