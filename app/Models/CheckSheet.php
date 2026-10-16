<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class CheckSheet extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'divisi_id',
        'nomor_dokumen',
        'nama_checksheet',
        'line_id',
        'pakai_actual',
    ];

    protected static function booted(): void
    {
        // Setelah check sheet di-soft-delete, item & abnormality yang MASIH AKTIF
        // diberi deleted_at yang SAMA dengan induknya (penanda "dihapus bersama induk").
        static::deleted(function (CheckSheet $cs) {
            if ($cs->isForceDeleting()) {
                return;
            }

            $cs->items()->update(['deleted_at' => $cs->deleted_at]);
            $cs->abnormalities()->update(['deleted_at' => $cs->deleted_at]);
        });

        // Restore: hanya anak dengan deleted_at yang sama yang dikembalikan.
        // Item yang dulu dihapus manual (waktunya beda) tetap terhapus.
        static::restoring(function (CheckSheet $cs) {
            $cs->items()->onlyTrashed()
                ->where('deleted_at', $cs->deleted_at)
                ->restore();

            $cs->abnormalities()->onlyTrashed()
                ->where('deleted_at', $cs->deleted_at)
                ->restore();
        });
    }

    protected function casts(): array
    {
        return [
            'pakai_actual' => 'boolean',
        ];
    }

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
                            $item->forceFill(['no' => $nomor])->save();
                        }
                    }
                });
        });
    }
}