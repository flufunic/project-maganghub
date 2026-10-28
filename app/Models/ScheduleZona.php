<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Tabel zona berdiri sendiri: tidak berelasi dengan item maupun jadwal.
 * Memakai soft delete: zona yang dihapus hanya diberi deleted_at,
 * barisnya tetap ada di database dan otomatis tidak muncul di query biasa.
 */
class ScheduleZona extends Model
{
    use SoftDeletes;

    protected $table = 'schedule_zonas';

    protected $fillable = ['no', 'zona', 'nama_line', 'jumlah_mesin'];
}
