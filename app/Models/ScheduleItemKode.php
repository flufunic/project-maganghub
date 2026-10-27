<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ScheduleItemKode extends Model
{
    protected $table = 'schedule_item_kodes';

    protected $fillable = ['preventif_mesin_id', 'kode'];

    /**
     * Beri kode ke item preventif yang belum punya kode.
     * Dipanggil otomatis saat halaman Schedule Preventif dibuka,
     * jadi item baru dari menu Preventif Mesin langsung kebagian kode
     * tanpa mengubah menu tersebut.
     */
    public static function sinkron(): void
    {
        $belum = PreventifMesin::where('is_hidden', false)
            ->whereNotIn('no', static::query()->select('preventif_mesin_id'))
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->orderBy('no')
            ->pluck('no');

        if ($belum->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($belum) {
            foreach ($belum as $no) {
                static::create([
                    'preventif_mesin_id' => $no,
                    'kode' => static::kodeBerikutnya(),
                ]);
            }
        });
    }

    /**
     * A..Z, lalu AA, AB, ... AZ, BA, ... ZZ, AAA.
     * Kode item yang sudah dihapus tetap tersimpan, jadi tidak pernah dipakai ulang.
     */
    public static function kodeBerikutnya(): string
    {
        $terakhir = static::query()
            ->lockForUpdate()
            ->orderByRaw('LENGTH(kode) DESC')   // "AA" lebih besar dari "Z"
            ->orderByDesc('kode')
            ->value('kode');

        if (! $terakhir) {
            return 'A';
        }

        $terakhir++;   // increment string PHP: Z -> AA, AZ -> BA, ZZ -> AAA
        return $terakhir;
    }
}
