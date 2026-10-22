<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckSheetAbnormality extends Model
{
    use SoftDeletes;

    /**
     * Status yang dianggap SUDAH SELESAI (huruf kecil semua).
     * Form abnormality memakai: Open, Progress, Closed.
     */
    public const STATUS_SELESAI = [
        'close',
        'closed',
        'selesai',
        'done',
        'ok',
        'finish',
        'finished',
    ];

    protected $fillable = [
        'check_sheet_id',
        'line_id',
        'tanggal',
        'abnormality',
        'countermeasure',
        'status',
        'pic',
    ];

    /**
     * Ikut dikirim ke frontend: daftar id item preventif terkait.
     * (dipakai form edit untuk mencentang pilihan yang sudah tersimpan)
     */
    protected $appends = ['preventif_mesin_ids'];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
        ];
    }

    public function checkSheet(): BelongsTo
    {
        return $this->belongsTo(CheckSheet::class)->withTrashed();
    }

    public function line(): BelongsTo
    {
        return $this->belongsTo(Line::class);
    }

    /**
     * Banyak item preventif yang terkait dengan abnormality ini.
     * Primary key preventif_mesins adalah "no".
     */
    public function preventifMesins(): BelongsToMany
    {
        return $this->belongsToMany(
            PreventifMesin::class,
            'check_sheet_abnormality_preventif',
            'check_sheet_abnormality_id',
            'preventif_mesin_id',
            'id',
            'no'
        )->withTimestamps();
    }

    public function getPreventifMesinIdsAttribute(): array
    {
        return $this->preventifMesins
            ->pluck('no')
            ->map(fn ($no) => (int) $no)
            ->values()
            ->all();
    }

    /**
     * Abnormality yang belum selesai (status BUKAN salah satu STATUS_SELESAI).
     */
    public function scopeBelumSelesai(Builder $query): Builder
    {
        $placeholders = implode(',', array_fill(0, count(self::STATUS_SELESAI), '?'));

        return $query->whereRaw(
            "LOWER(TRIM(status)) NOT IN ({$placeholders})",
            self::STATUS_SELESAI
        );
    }
}