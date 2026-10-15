<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class CheckSheet extends Model
{
    protected $fillable = [
        'divisi_id',
        'nomor_dokumen',
        'nama_checksheet',
        'line_id',
    ];

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CheckSheetItem::class);
    }

    public function abnormalities(): HasMany
    {
        return $this->hasMany(CheckSheetAbnormality::class);
    }
    
    public function line()
    {
        return $this->belongsTo(Line::class);
    }

    /**
     * Susun ulang nomor Inspection Point per shift: 1, 2, 3, ... tanpa bolong.
     * Urutan mengikuti nomor lama, lalu id.
     */
    public function susunUlangNomorItem(): void
    {
        DB::transaction(function () {
            $this->items()
                ->orderBy('shift')
                ->orderBy('no')
                ->orderBy('id')
                ->get()
                ->groupBy('shift')
                ->each(function ($items) {
                    foreach ($items->values() as $index => $item) {
                        $nomor = $index + 1;

                        if ((int) $item->no !== $nomor) {
                            // forceFill: aman walau 'no' belum ada di $fillable
                            $item->forceFill(['no' => $nomor])->save();
                        }
                    }
                });
        });
    }
}