<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreventifMesin extends Model
{
    protected $table = 'preventif_mesins';

    protected $primaryKey = 'no';

    public $timestamps = false;

    protected $fillable = [
        'divisi',
        'no_item',
        'item_preventif',
        'periode',
        'periode_nilai',
        'periode_satuan',
        'tanggal_plan_awal',
        'jumlah_dilakukan',
        'durasi',
        'total_durasi',
        'dot',
        'hot',
        'item',
        'status',
    ];

    protected $casts = [
        'periode_nilai' => 'decimal:2',
        'durasi' => 'decimal:2',
        'tanggal_plan_awal' => 'date',
        'total_durasi' => 'decimal:2',
        'dot' => 'decimal:2',
        'hot' => 'decimal:2',
        'is_hidden' => 'boolean',
    ];

    public function checklists(): HasMany
    {
        return $this->hasMany(
            PreventifChecklist::class,
            'preventif_mesin_id',
            'no'
        );
    }

    public function bulanans(): HasMany
    {
        return $this->hasMany(
            PreventifMesinBulanan::class,
            'preventif_mesin_id',
            'no'
        );
    }

    /**
     * Abnormality checksheet yang dihubungkan ke item preventif ini.
     */
    public function abnormalities(): BelongsToMany
    {
        return $this->belongsToMany(
            CheckSheetAbnormality::class,
            'check_sheet_abnormality_preventif',
            'preventif_mesin_id',
            'check_sheet_abnormality_id',
            'no',
            'id'
        )->withTimestamps();
    }

    /**
     * Nomor item berikutnya untuk satu divisi
     * (hanya menghitung item yang tidak disembunyikan).
     */
    public static function nomorBerikutnya(?string $divisi): int
    {
        $terakhir = static::query()
            ->where('divisi', $divisi)
            ->where('is_hidden', false)
            ->max('no_item');

        return ((int) $terakhir) + 1;
    }

    /**
     * Rapikan no_item satu divisi jadi 1, 2, 3, ...
     * (hanya item yang tidak disembunyikan).
     *
     * $prioritasNo      = no (primary key) item yang baru diubah nomornya manual.
     * $prioritasDiDepan = true  -> kalau nomornya sama dengan item lain, item ini didahulukan
     *                              (dipakai saat nomor diubah jadi LEBIH KECIL / pindah divisi).
     *                     false -> item ini ditaruh sesudahnya
     *                              (dipakai saat nomor diubah jadi LEBIH BESAR).
     */
    public static function susunUlangNoItem(
        ?string $divisi,
        ?int $prioritasNo = null,
        bool $prioritasDiDepan = true
    ): void {
        if ($divisi === null || $divisi === '') {
            return;
        }

        $query = static::query()
            ->where('divisi', $divisi)
            ->where('is_hidden', false)
            ->orderBy('no_item');

        if ($prioritasNo !== null) {
            $kolomNo = $query->getQuery()->getGrammar()->wrap('no');

            $query->orderByRaw(
                "CASE WHEN {$kolomNo} = ? THEN ? ELSE 1 END",
                [$prioritasNo, $prioritasDiDepan ? 0 : 2]
            );
        }

        $urut = 1;

        foreach ($query->orderBy('no')->get() as $item) {
            if ((int) $item->no_item !== $urut) {
                $item->no_item = $urut;
                $item->save();
            }

            $urut++;
        }
    }

    /**
     * Rapikan no_item untuk SEMUA divisi
     * (dipakai sekali untuk membereskan data lama).
     */
    public static function susunUlangSemuaNoItem(): void
    {
        static::query()
            ->where('is_hidden', false)
            ->distinct()
            ->pluck('divisi')
            ->each(fn ($divisi) => static::susunUlangNoItem($divisi));
    }

    public static function generateScheduleCode(): string
    {
        $usedCodes = static::query()
            ->whereNotNull('kode_schedule')
            ->pluck('kode_schedule')
            ->map(fn ($code) => strtoupper(trim($code)))
            ->flip();

        $number = 1;

        while (true) {
            $code = '';
            $value = $number;

            while ($value > 0) {
                $value--;
                $code = chr(65 + ($value % 26)) . $code;
                $value = intdiv($value, 26);
            }

            if (!isset($usedCodes[$code])) {
                return $code;
            }

            $number++;
        }
    }

    protected static function booted(): void
    {
        static::creating(function (PreventifMesin $item) {
            if (empty($item->kode_schedule)) {
                $item->kode_schedule = static::generateScheduleCode();
            }
        });
    }
}
