<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbnormalityCatatan extends Model
{
    protected $table = 'check_sheet_abnormality_catatans';

    protected $fillable = ['check_sheet_abnormality_id', 'catatan', 'oleh'];

    public function abnormality(): BelongsTo
    {
        return $this->belongsTo(CheckSheetAbnormality::class, 'check_sheet_abnormality_id');
    }
}