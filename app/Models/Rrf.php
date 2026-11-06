<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rrf extends Model
{
    use SoftDeletes;

    protected $table = 'rrf';

    public const STATUS_DIAJUKAN   = 'diajukan';
    public const STATUS_DISETUJUI  = 'disetujui';
    public const STATUS_DITOLAK    = 'ditolak';
    public const STATUS_DITERIMA   = 'diterima';
    public const STATUS_DIKERJAKAN = 'dikerjakan';
    public const STATUS_SELESAI    = 'selesai';
    public const STATUS_CLOSED     = 'closed';

    public const STATUS_LABEL = [
        self::STATUS_DIAJUKAN   => 'Menunggu SPV Produksi',
        self::STATUS_DISETUJUI  => 'Disetujui, menunggu MTC',
        self::STATUS_DITOLAK    => 'Ditolak',
        self::STATUS_DITERIMA   => 'Diterima MTC',
        self::STATUS_DIKERJAKAN => 'Sedang dikerjakan',
        self::STATUS_SELESAI    => 'Selesai, menunggu verifikasi',
        self::STATUS_CLOSED     => 'Closed',
    ];

    protected $fillable = [
        'rrf_no', 'rev',
        'divisi_id', 'divisi_pelapor', 'lokasi', 'nama_mesin', 'machine_id',
        'rrf_class_id',
        'jenis_permintaan', 'req_schedule_at', 'problem', 'created_by',
        'serv_schedule_at', 'stop_line_at',
        'cause', 'counter_measure', 'remark',
        'downtime_detik', 'time_repair_detik', 'time_repair_pembagi',
        'man_kerja', 'shift_kerja',
        'pic_nama', 'pic_mtc_id', 'received_by', 'received_at',
        'dikirim_pimpinan_at', 'dikirim_pimpinan_oleh',
        'closed_at', 'closed_by',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'req_schedule_at'     => 'datetime',
            'serv_schedule_at'    => 'datetime',
            'stop_line_at'        => 'datetime',
            'received_at'         => 'datetime',
            'dikirim_pimpinan_at' => 'datetime',
            'closed_at'           => 'datetime',
        ];
    }

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class);
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(RrfClass::class, 'rrf_class_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_mtc_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(RrfPart::class, 'rrf_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(RrfPhoto::class, 'rrf_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(RrfApproval::class, 'rrf_id');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(RrfStatusLog::class, 'rrf_id');
    }

    /**
     * Riwayat mesin ini: RRF sebelumnya (id lebih kecil) untuk mesin yang sama
     * di divisi yang sama, yang perbaikannya sudah selesai (sudah dikirim ke Pimpinan).
     * Huruf besar/kecil dan spasi di pinggir tidak dibedakan.
     */
    public function queryRiwayatMesin(): Builder
    {
        return static::query()
            ->where('divisi_id', $this->divisi_id)
            ->whereRaw(
                'LOWER(TRIM(nama_mesin)) = ?',
                [mb_strtolower(trim((string) $this->nama_mesin))]
            )
            ->where('id', '<', $this->id)
            ->whereIn('status', [self::STATUS_SELESAI, self::STATUS_CLOSED]);
    }

    /** Pembagi time repair = jumlah riwayat mesin ini + RRF ini sendiri. */
    public function pembagiTimeRepair(): int
    {
        if (!filled($this->nama_mesin)) {
            return 1;
        }

        return $this->queryRiwayatMesin()->count() + 1;
    }
}