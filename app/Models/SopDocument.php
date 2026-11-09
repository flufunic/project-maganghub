<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SopDocument extends Model
{
    use SoftDeletes;

    protected $fillable = ['no_dok', 'proses', 'proses_penting', 'tanggal_revisi'];

    protected $casts = ['tanggal_revisi' => 'date'];

    // Hanya versi yang belum di-soft-delete, terbaru di atas
    public function revisions()
    {
        return $this->hasMany(SopDocumentRevision::class)->orderByDesc('revisi_ke');
    }
}
