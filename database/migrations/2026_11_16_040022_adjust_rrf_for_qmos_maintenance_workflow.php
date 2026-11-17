
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            // Relasi ke data Repair dari QMOS
            $table->foreignId('mtc_repair_id')
                ->nullable()
                ->unique()
                ->after('id')
                ->constrained('mtc_repairs')
                ->cascadeOnDelete();

            // Tidak lagi wajib karena data sumber dari QMOS
            $table->dropForeign(['divisi_id']);
            $table->dropForeign(['machine_id']);
            $table->dropForeign(['rrf_class_id']);

            $table->foreignId('divisi_id')->nullable()->change();
            $table->foreignId('machine_id')->nullable()->change();
            $table->foreignId('rrf_class_id')->nullable()->change();

            $table->foreign('divisi_id')
                ->references('id')->on('divisis')
                ->nullOnDelete();

            $table->foreign('machine_id')
                ->references('id')->on('rrf_machines')
                ->nullOnDelete();

            $table->foreign('rrf_class_id')
                ->references('id')->on('rrf_classes')
                ->nullOnDelete();

            // Status awal RRF
            $table->string('status', 30)->default('draft')->change();
        });

        Schema::table('mtc_repairs', function (Blueprint $table) {
            // Penanda apakah data QMOS sudah dibuatkan RRF
            $table->string('rrf_status', 30)
                ->nullable()
                ->default('belum_dibuat')
                ->change();
        });

        Schema::table('rrf_approvals', function (Blueprint $table) {
            // Tahap verifikasi khusus Maintenance
            // Nilai tahap yang digunakan: pimpinan_mtc
        });
    }

    public function down(): void
    {
        Schema::table('rrf', function (Blueprint $table) {
            $table->dropForeign(['mtc_repair_id']);
            $table->dropUnique(['mtc_repair_id']);
            $table->dropColumn('mtc_repair_id');
        });

        // Kolom FK lama tidak otomatis dibuat wajib kembali.
        // Menghindari kegagalan rollback jika sudah ada data RRF.
    }
};
