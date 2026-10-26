<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetPengiriman extends Model
{
    use SoftDeletes;

    protected $table = 'check_sheet_pengirimans';

    protected $fillable = [
        'minggu_mulai',
        'minggu_selesai',
        'divisi_id',
        'dikirim_oleh',
        'dikirim_pada',
        'status',
        'alasan_penolakan',
        'dihapus_oleh',
    ];

    protected function casts(): array
    {
        return [
            'minggu_mulai'   => 'date',
            'minggu_selesai' => 'date',
            'dikirim_pada'   => 'datetime',
        ];
    }

    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dikirim_oleh');
    }
}