<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreventifChecksheetAksi extends Model
{
    protected $fillable = [
        'preventif_checksheet_record_id',
        'preventif_checksheet_item_id',
        'tanggal',
        'aksi',
    ];

    protected function casts(): array
    {
        return ['tanggal' => 'date:Y-m-d'];
    }
}