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
        'pakai_plan_act',
        'pakai_monitoring',
        'pakai_bbm',
        'bbm_kali_60',
    ];

    protected static function booted(): void
    {
        static::deleted(function (CheckSheet $cs) {
            if ($cs->isForceDeleting()) {
                return;
            }

            $cs->items()->update(['deleted_at' => $cs->deleted_at]);
            $cs->abnormalities()->update(['deleted_at' => $cs->deleted_at]);
            $cs->monitoringItems()->update(['deleted_at' => $cs->deleted_at]);
            $cs->bbmItems()->update(['deleted_at' => $cs->deleted_at]);
        });

        static::restoring(function (CheckSheet $cs) {
            $cs->items()->onlyTrashed()
                ->where('deleted_at', $cs->deleted_at)->restore();

            $cs->abnormalities()->onlyTrashed()
                ->where('deleted_at', $cs->deleted_at)->restore();

            $cs->monitoringItems()->onlyTrashed()
                ->where('deleted_at', $cs->deleted_at)->restore();

            $cs->bbmItems()->onlyTrashed()
                ->where('deleted_at', $cs->deleted_at)->restore();
        });
    }

    protected function casts(): array
    {
        return [
            'pakai_actual'     => 'boolean',
            'pakai_plan_act'   => 'boolean',
            'pakai_monitoring' => 'boolean',
            'pakai_bbm'        => 'boolean',
            'bbm_kali_60' => 'boolean',
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

    public function monitoringItems(): HasMany
    {
        return $this->hasMany(CheckSheetMonitoringItem::class);
    }

    public function bbmItems(): HasMany
    {
        return $this->hasMany(CheckSheetBbmItem::class);
    }

    public function line()
    {
        return $this->belongsTo(Line::class);
    }

    /**
     * Susun ulang nomor Inspection Point per shift: 1, 2, 3, ... tanpa bolong.
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

    /**
     * Konsumsi solar (Liter) dari running hours (jam).
     * - Generator     : Solar (L/jam)   x jam
     * - Pompa Hydrant : Solar (L/menit) x jam x 60
    */
    public function hitungKonsumsiBbm(?float $runningHours, float $solar): ?float
    {
        if ($runningHours === null) {
            return null;
        }

        $faktor = $this->bbm_kali_60 ? 60 : 1;

        return round($runningHours * $solar * $faktor, 2);
    }
}