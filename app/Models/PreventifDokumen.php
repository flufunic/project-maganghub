<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PreventifDokumen extends Model
{
    use SoftDeletes;

    protected $table = 'preventif_dokumens';

    protected $fillable = [
        'tanggal',
        'nama_asli',
        'path',
        'mime',
        'ukuran',
        'diunggah_oleh',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'ukuran' => 'integer',
    ];

    public function pengunggah(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diunggah_oleh');
    }

    /**
     * Ukuran file yang enak dibaca: 1.5 MB, 320 KB, dst.
     */
    public function getUkuranFormatAttribute(): string
    {
        $byte = (int) $this->ukuran;

        if ($byte >= 1048576) {
            return round($byte / 1048576, 1) . ' MB';
        }

        if ($byte >= 1024) {
            return round($byte / 1024) . ' KB';
        }

        return $byte . ' B';
    }

    /**
     * Bentuk data yang dikirim ke React.
     */
    public function toFrontend(): array
    {
        return [
            'id' => $this->id,
            'nama_asli' => $this->nama_asli,
            'ukuran_format' => $this->ukuran_format,
            'mime' => $this->mime,
            'diunggah_pada' => $this->created_at?->translatedFormat('d F Y H:i'),
            'url_lihat' => route('preventif-dokumen.lihat', $this->id),
            'url_download' => route('preventif-dokumen.download', $this->id),
        ];
    }
}