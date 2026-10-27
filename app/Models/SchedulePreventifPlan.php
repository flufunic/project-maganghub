<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchedulePreventifPlan extends Model
{
    protected $table = 'schedule_preventif_plans';

    protected $fillable = ['tahun', 'preventif_mesin_id', 'bulan', 'minggu'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(PreventifMesin::class, 'preventif_mesin_id', 'no');
    }
}
