<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JokenRow extends Model
{
    protected $fillable = [
        'joken_id', 'urutan', 'qcpc', 'proses', 'model_material', 'type_mesin', 'nilai',
    ];

    protected $casts = ['nilai' => 'array'];

    public function joken()
    {
        return $this->belongsTo(Joken::class);
    }
}