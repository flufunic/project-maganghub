
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mtc_repairs', function (Blueprint $table) {
            $table->id();

            // Identitas unik dari QMOS
            $table->unsignedBigInteger('qmos_repair_id')->unique();

            // Informasi mesin
            $table->string('location')->nullable();
            $table->string('machine')->nullable();
            $table->string('machine_no')->nullable();
            $table->string('asset_no')->nullable();
            $table->string('jenis_no_post')->nullable();

            // Informasi permintaan
            $table->string('division_pelapor')->nullable();
            $table->string('jenis_permintaan')->nullable();
            $table->string('machine_class')->nullable();
            $table->text('machine_class_description')->nullable();

            // Jadwal permintaan
            $table->date('repair_date')->nullable();
            $table->dateTime('req_start_at')->nullable();
            $table->dateTime('req_finish_at')->nullable();
            $table->integer('req_duration_minutes')->nullable();

            // Permasalahan dan aktivitas
            $table->text('problem')->nullable();
            $table->text('request_activity')->nullable();
            $table->text('counter_measure')->nullable();

            // Sparepart
            $table->string('part_name')->nullable();
            $table->string('part_model_type')->nullable();

            // Pengajuan
            $table->string('requested_by')->nullable();
            $table->string('submitted_by_frm')->nullable();
            $table->string('supervisor')->nullable();

            // Hasil maintenance
            $table->string('mtc_name')->nullable();
            $table->text('analisa')->nullable();
            $table->text('perbaikan')->nullable();
            $table->string('judge')->nullable();
            $table->dateTime('repaired_at')->nullable();

            // Status QMOS
            $table->string('status')->nullable();
            $table->string('rrf_status')->nullable();
            $table->dateTime('rrf_submitted_at')->nullable();

            // Waktu asli dari QMOS
            $table->dateTime('source_created_at')->nullable();
            $table->dateTime('source_updated_at')->nullable();

            // Waktu sinkronisasi lokal
            $table->dateTime('synced_at')->nullable();

            // Menyimpan respons asli untuk keperluan audit
            $table->json('raw_payload')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('rrf_status');
            $table->index('machine');
            $table->index('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mtc_repairs');
    }
};
