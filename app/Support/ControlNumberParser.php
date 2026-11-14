<?php

namespace App\Support;

class ControlNumberParser
{
    /**
     * Ubah teks nomor kontrol jadi daftar nomor per unit.
     *
     * "FJI - SC2 - M.HD 004 - 024" => ["FJI-SC2-M.HD 004", ..., "FJI-SC2-M.HD 024"]
     * "FJI - SC2 - MSD 001"        => ["FJI-SC2-MSD 001"]
     * "FJI - SC2 - MSD 016 - 17"   => ["FJI-SC2-MSD 016", "FJI-SC2-MSD 017"]
     *
     * @return string[]
     */
    public static function expand(string $raw): array
    {
        $raw = trim(preg_replace('/\s+/', ' ', $raw));

        // pola: <prefix> <angka awal> [- <angka akhir>]
        if (!preg_match('/^(.*?)\s*(\d+)\s*(?:-\s*(\d+))?\s*$/', $raw, $m)) {
            return [self::normalize($raw)];
        }

        $prefix = self::normalize($m[1]);
        $start  = $m[2];
        $end    = $m[3] ?? null;
        $pad    = strlen($start);

        // tanpa rentang, atau rentang terbalik -> 1 unit saja
        if ($end === null || (int) $end < (int) $start) {
            return [trim("$prefix $start")];
        }

        $result = [];
        for ($i = (int) $start; $i <= (int) $end; $i++) {
            $result[] = trim($prefix . ' ' . str_pad((string) $i, $pad, '0', STR_PAD_LEFT));
        }

        return $result;
    }

    private static function normalize(string $s): string
    {
        // "FJI - SC2 - M.HD" -> "FJI-SC2-M.HD"
        return trim(preg_replace('/\s*-\s*/', '-', $s));
    }
}