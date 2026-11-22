<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreventifDivisi extends Model
{
    protected $table = 'preventif_divisis';

    protected $fillable = ['nama', 'urutan', 'warna'];

    // Palet yang berbeda dari warna 4 divisi lama
    public const PALET = [
        '#14b8a6', '#ec4899', '#eab308', '#0ea5e9', '#ef4444',
        '#84cc16', '#a16207', '#64748b', '#f472b6', '#22d3ee',
    ];

    // Pilih acak dari palet yang belum dipakai divisi lain
    public static function warnaBelumDipakai(): string
    {
        $dipakai = static::whereNotNull('warna')
            ->pluck('warna')
            ->map(fn ($w) => strtolower($w))
            ->all();

        $sisa = array_values(array_diff(self::PALET, $dipakai));

        if ($sisa) {
            return $sisa[array_rand($sisa)];
        }

        // palet habis: acak warna sedang supaya teks tetap terbaca
        return sprintf('#%02x%02x%02x', rand(40, 200), rand(40, 200), rand(40, 200));
    }
}