<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineType extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'supplier_active' => 'boolean',
        'supplier_repair' => 'boolean',
    ];

    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class);
    }
}