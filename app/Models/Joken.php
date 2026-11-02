<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Joken extends Model
{
    protected $fillable = [
        'judul', 'no_registrasi', 'line', 'model', 'pic', 'no_line',
        'supplier', 'part_name', 'part_number', 'mfg_location', 'kolom',
    ];

    protected $casts = ['kolom' => 'array'];

    public function rows()
    {
        return $this->hasMany(JokenRow::class)->orderBy('urutan');
    }
}