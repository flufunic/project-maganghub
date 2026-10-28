<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('overhaul_dokumens', function (Blueprint $table) {
            $table->unsignedSmallInteger('tahun')
                ->nullable()
                ->after('overhaul_mesin_id')
                ->index();
        });

        // Dokumen lama: isi tahun dari tanggal upload-nya
        DB::table('overhaul_dokumens')->update([
            'tahun' => DB::raw('COALESCE(YEAR(created_at), YEAR(CURDATE()))'),
        ]);
    }

    public function down(): void
    {
        Schema::table('overhaul_dokumens', function (Blueprint $table) {
            $table->dropIndex(['tahun']);
            $table->dropColumn('tahun');
        });
    }
};