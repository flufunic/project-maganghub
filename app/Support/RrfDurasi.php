<?php

namespace App\Support;

use Carbon\CarbonInterface;

class RrfDurasi
{
    /** 7200 -> "2 jam", 600 -> "10 menit", 30 -> "30 detik", 4500 -> "1 jam 15 menit". */
    public static function format(?int $detik): ?string
    {
        if ($detik === null) {
            return null;
        }

        if ($detik <= 0) {
            return '0 menit';
        }

        $jam   = intdiv($detik, 3600);
        $menit = intdiv($detik % 3600, 60);
        $sisa  = $detik % 60;

        $bagian = [];
        if ($jam > 0) {
            $bagian[] = "{$jam} jam";
        }
        if ($menit > 0) {
            $bagian[] = "{$menit} menit";
        }
        if ($sisa > 0) {
            $bagian[] = "{$sisa} detik";
        }

        return implode(' ', $bagian);
    }

    /**
     * Down time = jam stop line dikurangi serv. schedule.
     * Kalau jam stop line lebih awal dari serv. schedule, dianggap hari berikutnya.
     *
     * @return array{0: CarbonInterface, 1: int, 2: bool} [waktu stop line, selisih detik, melewati tengah malam]
     */
    public static function hitung(CarbonInterface $serv, string $jamStop): array
    {
        $stop  = $serv->copy()->setTimeFromTimeString($jamStop);
        $lewat = false;

        if ($stop->lt($serv)) {
            $stop->addDay();
            $lewat = true;
        }

        return [$stop, $stop->timestamp - $serv->timestamp, $lewat];
    }
}