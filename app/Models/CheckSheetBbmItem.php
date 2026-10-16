<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetBbmItem extends Model
{
    use SoftDeletes;

    public const MENIT_PER_JAM = 60;

    protected $table = 'check_sheet_bbm_items';

    protected $fillable = [
        'check_sheet_id',
        'no',
        'nama_item',
        'kapasitas',
        'solar_per_menit', // nama kolom tetap; isinya L/jam (Generator) atau L/menit (Pompa)
    ];

    protected $appends = ['ringkasan'];

    protected function casts(): array
    {
        return [
            'no'              => 'integer',
            'solar_per_menit' => 'float',
        ];
    }

    public function checkSheet(): BelongsTo
    {
        return $this->belongsTo(CheckSheet::class)->withTrashed();
    }

    public function weeks(): HasMany
    {
        return $this->hasMany(CheckSheetBbmWeek::class, 'bbm_item_id');
    }

    /**
     * Konsumsi (Liter):
     * - Generator     ($kali60 = false): Solar (L/jam)   x Running Hours (jam)
     * - Pompa Hydrant ($kali60 = true) : Solar (L/menit) x Running Hours (jam) x 60
     */
    public static function hitungKonsumsi(
        ?float $runningHours,
        float $solar,
        bool $kali60 = false
    ): ?float {
        if ($runningHours === null) {
            return null;
        }

        $faktor = $kali60 ? self::MENIT_PER_JAM : 1;

        return round($runningHours * $solar * $faktor, 3);
    }

    /**
     * Flag rumus dari check sheet induknya.
     * Memakai query langsung (bukan relasi) supaya tidak ikut ter-serialize ke JSON.
     */
    protected function pakaiKali60(): bool
    {
        return (bool) CheckSheet::withTrashed()
            ->whereKey($this->check_sheet_id)
            ->value('bbm_kali_60');
    }

    /**
     * Ringkasan per week + total (hanya terisi kalau relasi weeks sudah di-load).
     */
    public function getRingkasanAttribute(): ?array
    {
        if (! $this->relationLoaded('weeks')) {
            return null;
        }

        $rate      = (float) $this->solar_per_menit;
        $kali60    = $this->pakaiKali60();
        $perMinggu = [];
        $totalRh   = 0.0;
        $totalKons = 0.0;

        for ($w = 1; $w <= 5; $w++) {
            $rh   = $this->weeks->firstWhere('week', $w)?->running_hours;
            $kons = self::hitungKonsumsi($rh, $rate, $kali60);

            $perMinggu[$w] = [
                'running_hours' => $rh,
                'konsumsi'      => $kons,
            ];

            $totalRh   += $rh ?? 0;
            $totalKons += $kons ?? 0;
        }

        return [
            'kali_60'        => $kali60,
            'per_minggu'     => $perMinggu,
            'total_running'  => round($totalRh, 3),
            'total_konsumsi' => round($totalKons, 3),
        ];
    }
}
