<?php

namespace App\Support;

use Carbon\Carbon;

class Waktu
{
    /** Nilai UTC dari DB -> teks WIB. */
    public static function wib($nilai, string $format = 'd/m/Y H:i'): ?string
    {
        if (empty($nilai)) {
            return null;
        }

        try {
            return Carbon::parse($nilai)->copy()->timezone('Asia/Jakarta')->format($format);
        } catch (\Throwable) {
            return null;
        }
    }
}