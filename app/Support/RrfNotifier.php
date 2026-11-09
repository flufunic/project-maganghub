<?php

namespace App\Support;

use App\Models\Rrf;
use App\Models\RrfNotification;
use App\Models\User;

/**
 * Satu pintu untuk mengirim notifikasi RRF.
 * Role produksi (SPV & operator) dibatasi ke divisi RRF-nya,
 * role lain (admin, pimpinan) menerima untuk semua divisi.
 */
class RrfNotifier
{
    public const PRODUKSI = ['spv_produksi', 'operator_produksi'];

    public static function kirim(
        Rrf $rrf,
        array $roles,
        string $judul,
        string $pesan,
        ?int $kecualiUserId = null
    ): void {
        $penerima = User::query()
            ->where('is_active', true)
            ->whereIn('role', $roles)
            ->where(function ($q) use ($rrf) {
                $q->whereNotIn('role', self::PRODUKSI)
                    ->orWhere('divisi_id', $rrf->divisi_id);
            })
            ->when($kecualiUserId, fn ($q) => $q->where('id', '!=', $kecualiUserId))
            ->pluck('id');

        foreach ($penerima as $userId) {
            RrfNotification::create([
                'user_id' => $userId,
                'rrf_id'  => $rrf->id,
                'judul'   => $judul,
                'pesan'   => $pesan,
            ]);
        }
    }

    public static function keSpv(Rrf $rrf, string $judul, string $pesan, ?int $kecualiUserId = null): void
    {
        self::kirim($rrf, ['spv_produksi'], $judul, $pesan, $kecualiUserId);
    }

    public static function keOperator(Rrf $rrf, string $judul, string $pesan, ?int $kecualiUserId = null): void
    {
        self::kirim($rrf, ['operator_produksi'], $judul, $pesan, $kecualiUserId);
    }

    public static function keProduksi(Rrf $rrf, string $judul, string $pesan, ?int $kecualiUserId = null): void
    {
        self::kirim($rrf, self::PRODUKSI, $judul, $pesan, $kecualiUserId);
    }

    public static function keAdmin(Rrf $rrf, string $judul, string $pesan, ?int $kecualiUserId = null): void
    {
        self::kirim($rrf, ['admin'], $judul, $pesan, $kecualiUserId);
    }

    public static function kePimpinan(Rrf $rrf, string $judul, string $pesan, ?int $kecualiUserId = null): void
    {
        self::kirim($rrf, ['pimpinan'], $judul, $pesan, $kecualiUserId);
    }
}