<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Tabel zona berdiri sendiri: tidak berelasi dengan item maupun jadwal. */
class ScheduleZona extends Model
{
    protected $table = 'schedule_zonas';

    protected $fillable = ['no', 'zona', 'nama_line', 'jumlah_mesin'];
}
