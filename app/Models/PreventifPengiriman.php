<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreventifPengiriman extends Model
{
    protected $table = 'preventif_pengirimans';

    protected $fillable = [
        'tanggal',
        'dikirim_oleh',
        'dikirim_pada',
        'status',
        'alasan_penolakan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'dikirim_pada' => 'datetime',
    ];

    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dikirim_oleh');
    }

    public function revisis(): HasMany
    {
        return $this->hasMany(PreventifRevisi::class, 'preventif_pengiriman_id');
    }

    /**
     * Pengiriman yang masih "hidup" di sisi pimpinan.
     * Kalau ditolak, admin sedang memperbaiki, jadi tidak dicatat sebagai revisi.
     */
    public function scopeBisaDirevisi(Builder $query): Builder
    {
        return $query->whereIn('status', ['menunggu', 'diperiksa']);
    }

    /**
     * Catat satu revisi. Kalau data sudah berstatus "diperiksa",
     * status otomatis kembali ke "menunggu" supaya pimpinan cek ulang.
     */
    public function catatRevisi(
        ?int $preventifMesinId,
        ?string $itemLabel,
        string $jenis,
        string $keterangan,
        ?string $nilaiLama,
        ?string $nilaiBaru,
        ?int $userId
    ): void {
        $this->revisis()->create([
            'preventif_mesin_id' => $preventifMesinId,
            'item_label' => $itemLabel,
            'jenis' => $jenis,
            'keterangan' => $keterangan,
            'nilai_lama' => $nilaiLama,
            'nilai_baru' => $nilaiBaru,
            'diubah_oleh' => $userId,
        ]);

        if ($this->status === 'diperiksa') {
            $this->update(['status' => 'menunggu']);
        }
    }
}