<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Machine extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function type(): BelongsTo
    {
        return $this->belongsTo(MachineType::class, 'machine_type_id');
    }
}