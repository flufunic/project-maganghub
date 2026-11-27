<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) tambah kolom tanggal + unique baru (record, item, tanggal)
        Schema::table('preventif_checksheet_results', function (Blueprint $table) {
            $table->date('tanggal')->nullable()->after('preventif_checksheet_item_id');
            $table->unique(
                ['preventif_checksheet_record_id', 'preventif_checksheet_item_id', 'tanggal'],
                'pcs_results_record_item_tanggal_unique'
            );
        });

        // 2) buang unique lama (record, item) kalau ada
        try {
            Schema::table('preventif_checksheet_results', function (Blueprint $table) {
                $table->dropUnique(['preventif_checksheet_record_id', 'preventif_checksheet_item_id']);
            });
        } catch (\Throwable $e) {
            // nama index lama beda: hapus manual (cek lewat SHOW INDEX FROM preventif_checksheet_results)
        }
    }

    public function down(): void
    {
        Schema::table('preventif_checksheet_results', function (Blueprint $table) {
            $table->dropUnique('pcs_results_record_item_tanggal_unique');
            $table->dropColumn('tanggal');
        });
    }
};