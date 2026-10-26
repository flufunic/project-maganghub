<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // data lama = per minggu (tanpa divisi), formatnya sudah tidak cocok
        // (hapus permanen, termasuk yang soft delete)
        DB::table('check_sheet_pengirimans')->delete();

        // 1. buang unique lama kalau ada (unique hanya di minggu_mulai)
        foreach (Schema::getIndexes('check_sheet_pengirimans') as $index) {
            if ($index['unique'] && ! $index['primary'] && $index['columns'] === ['minggu_mulai']) {
                Schema::table('check_sheet_pengirimans', function (Blueprint $table) use ($index) {
                    $table->dropUnique($index['name']);
                });
            }
        }

        // 2. tambah kolom divisi_id
        if (! Schema::hasColumn('check_sheet_pengirimans', 'divisi_id')) {
            Schema::table('check_sheet_pengirimans', function (Blueprint $table) {
                $table->unsignedBigInteger('divisi_id')->after('id');
            });
        }

        // 3. unique baru: 1 minggu x 1 divisi
        Schema::table('check_sheet_pengirimans', function (Blueprint $table) {
            $table->unique(['minggu_mulai', 'divisi_id'], 'cs_pengiriman_minggu_divisi_unique');
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_pengirimans', function (Blueprint $table) {
            $table->dropUnique('cs_pengiriman_minggu_divisi_unique');
        });

        if (Schema::hasColumn('check_sheet_pengirimans', 'divisi_id')) {
            Schema::table('check_sheet_pengirimans', function (Blueprint $table) {
                $table->dropColumn('divisi_id');
            });
        }
    }
};