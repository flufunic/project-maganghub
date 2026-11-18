<?php

namespace App\Support;

use Carbon\Carbon;

class Waktu
{
    /** Nilai UTC dari DB -> teks WIB. Untuk created_at, req_start_at, acted_at, dll. */
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

    /**
     * Jam WIB polos (serv_schedule_at, stop_line_at) -> string UTC.
     * Dipakai saat mengirim ke QMOS, karena QMOS menganggap waktu yang diterima adalah UTC.
     */
    public static function utcDariWib($nilai, string $format = 'Y-m-d H:i:s'): ?string
    {
        if (empty($nilai)) {
            return null;
        }

        try {
            // Ambil jam polosnya, tafsirkan sebagai WIB, lalu ubah ke UTC.
            $polos = Carbon::parse($nilai)->format('Y-m-d H:i:s');

            return Carbon::parse($polos, 'Asia/Jakarta')->utc()->format($format);
        } catch (\Throwable) {
            return null;
        }
    }
}
