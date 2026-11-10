<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PreventifLaporanMingguan extends Model
{
    use SoftDeletes;

    protected $table = 'preventif_laporan_mingguan';

    protected $fillable = [
        'tahun', 'bulan', 'week', 'status',
        'dikirim_oleh', 'dikirim_pada', 'alasan_penolakan',
        'disetujui_oleh', 'disetujui_pada', 'snapshot',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'dikirim_pada' => 'datetime',
        'disetujui_pada' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PreventifLaporanItem::class, 'laporan_id')
            ->orderBy('urutan')
            ->orderBy('id');
    }

    public function revisis(): HasMany
    {
        return $this->hasMany(PreventifLaporanRevisi::class, 'laporan_id')->latest();
    }

    public function terkunci(): bool
    {
        return $this->status === 'disetujui';
    }

    public function sudahDikirim(): bool
    {
        return in_array($this->status, ['menunggu', 'diperiksa', 'disetujui'], true);
    }

    /**
     * W1 = 1-7, W2 = 8-14, W3 = 15-21, W4 = 22-28, W5 = 29-akhir bulan.
     * Hanya Senin-Jumat. Return null kalau week itu tidak punya hari kerja.
     */
    public static function rentang(int $tahun, int $bulan, int $week): ?array
    {
        $hariBulan = Carbon::create($tahun, $bulan, 1)->daysInMonth;
        $awal = ($week - 1) * 7 + 1;

        if ($week < 1 || $week > 5 || $awal > $hariBulan) {
            return null;
        }

        $akhir = $week === 5 ? $hariBulan : min($awal + 6, $hariBulan);

        $hari = [];

        for ($d = $awal; $d <= $akhir; $d++) {
            $tgl = Carbon::create($tahun, $bulan, $d);

            if ($tgl->isWeekday()) {
                $hari[] = $tgl->format('Y-m-d');
            }
        }

        if (empty($hari)) {
            return null;
        }

        return ['awal' => $awal, 'akhir' => $akhir, 'hari' => $hari];
    }

    /** Daftar nomor week yang punya hari kerja di bulan tsb. */
    public static function daftarWeek(int $tahun, int $bulan): array
    {
        return array_values(array_filter(
            [1, 2, 3, 4, 5],
            fn ($w) => self::rentang($tahun, $bulan, $w) !== null
        ));
    }
}
