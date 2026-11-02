<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Joken extends Model
{
    use SoftDeletes;

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