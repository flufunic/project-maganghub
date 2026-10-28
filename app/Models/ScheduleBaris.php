<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Satu pasangan baris Plan + Act pada jadwal (per tahun).
 * Soft delete: baris yang dihapus hanya diberi deleted_at,
 * isian Plan-nya tetap tersimpan tetapi tidak ikut tampil maupun dihitung.
 */
class ScheduleBaris extends Model
{
    use SoftDeletes;

    protected $table = 'schedule_baris';

    protected $fillable = ['tahun', 'urutan', 'nama'];

    public function plans(): HasMany
    {
        return $this->hasMany(SchedulePreventifPlan::class, 'baris_id');
    }
}
