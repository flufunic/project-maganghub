<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PreventifChecksheet extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'divisi',
        'preventif_mesin_id',
        'nama_equipment',
        'nomor_dokumen',
        'tanggal_terbit',
        'tanggal_revisi',
        'revisi',
        'disetujui',
        'diperiksa',
        'dibuat',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_terbit' => 'date:Y-m-d',
            'tanggal_revisi' => 'date:Y-m-d',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PreventifChecksheetItem::class)->orderBy('no')->orderBy('id');
    }

    public function records(): HasMany
    {
        return $this->hasMany(PreventifChecksheetRecord::class);
    }

    /** Item di Schedule Preventif (primary key preventif_mesins = "no"). */
    public function preventifMesin(): BelongsTo
    {
        return $this->belongsTo(PreventifMesin::class, 'preventif_mesin_id', 'no');
    }

    public function susunUlangNomorItem(): void
    {
        $this->items()->get()->each(function ($item, $i) {
            if ((int) $item->no !== $i + 1) {
                $item->update(['no' => $i + 1]);
            }
        });
    }
}