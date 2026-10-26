<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OverhaulMesin extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'no', 'mesin', 'nama', 'total_mesin', 'standar', 'satuan',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(OverhaulSchedule::class);
    }
    public function dokumens(): HasMany
    {
        return $this->hasMany(OverhaulDokumen::class);
    }
}
