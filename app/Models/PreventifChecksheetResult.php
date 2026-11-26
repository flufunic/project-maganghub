<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreventifChecksheetResult extends Model
{
    protected $fillable = [
        'preventif_checksheet_record_id',
        'preventif_checksheet_item_id',
        'kondisi',
        'keterangan',
    ];
}