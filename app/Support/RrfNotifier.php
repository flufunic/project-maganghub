<?php

namespace App\Support;

use App\Models\MtcRepair;
use App\Models\Rrf;
use App\Models\RrfNotification;
use App\Models\User;

class RrfNotifier
{
    public const PRODUKSI = [
        'spv_produksi',
        'operator_produksi',
    ];

    /**
     * Mengirim notifikasi ke user berdasarkan role.
     *
     * SPV dan operator hanya menerima notifikasi untuk divisi yang sama dengan RRF.
     * Admin dan pimpinan menerima notifikasi dari seluruh divisi.
     */
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
            ->where(function ($query) use ($rrf) {
                $query->whereNotIn('role', self::PRODUKSI)
                    ->orWhere('divisi_id', $rrf->divisi_id);
            })
            ->when(
                $kecualiUserId,
                fn ($query) => $query->where('id', '!=', $kecualiUserId)
            )
            ->pluck('id');

        foreach ($penerima as $userId) {
            RrfNotification::create([
                'user_id'       => $userId,
                'rrf_id'        => $rrf->id,
                'mtc_repair_id' => $rrf->mtc_repair_id,
                'judul'         => $judul,
                'pesan'         => $pesan,
            ]);
        }
    }

    /**
     * Notifikasi data Repair QMOS baru (RRF belum dibuat) untuk semua Admin aktif.
     */
    public static function keAdminRepairBaru(
        MtcRepair $repair,
        string $judul,
        string $pesan
    ): void {
        $adminIds = User::query()
            ->where('is_active', true)
            ->where('role', 'admin')
            ->pluck('id');

        foreach ($adminIds as $userId) {
            RrfNotification::create([
                'user_id'       => $userId,
                'rrf_id'        => null,
                'mtc_repair_id' => $repair->id,
                'judul'         => $judul,
                'pesan'         => $pesan,
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