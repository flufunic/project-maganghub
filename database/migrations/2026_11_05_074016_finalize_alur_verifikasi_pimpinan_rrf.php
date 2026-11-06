<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            if (!Schema::hasColumn('rrf', 'dikirim_pimpinan_at')) {
                $table->timestamp('dikirim_pimpinan_at')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'dikirim_pimpinan_oleh')) {
                $table->unsignedBigInteger('dikirim_pimpinan_oleh')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'closed_at')) {
                $table->timestamp('closed_at')->nullable();
            }
            if (!Schema::hasColumn('rrf', 'closed_by')) {
                $table->unsignedBigInteger('closed_by')->nullable();
            }
        });

        // Alur baru: status "selesai" hanya untuk RRF yang sudah dikirim ke Pimpinan.
        // RRF berstatus selesai tapi belum dikirim (alur lama) dikembalikan ke "dikerjakan"
        // supaya Admin bisa memeriksa lalu mengirimnya.
        DB::table('rrf')
            ->where('status', 'selesai')
            ->whereNull('dikirim_pimpinan_at')
            ->update(['status' => 'dikerjakan']);
    }

    public function down(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            foreach (['dikirim_pimpinan_at', 'dikirim_pimpinan_oleh', 'closed_at', 'closed_by'] as $kolom) {
                if (Schema::hasColumn('rrf', $kolom)) {
                    $table->dropColumn($kolom);
                }
            }
        });
    }
};