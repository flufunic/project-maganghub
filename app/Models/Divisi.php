<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Divisi extends Model
{
    protected $fillable = [
        'nama_divisi',
    ];

    public function mesins(): HasMany
    {
        return $this->hasMany(Mesin::class);
    }
}