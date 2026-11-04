<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rrf', function (Blueprint $table) {
            $table->id();
            $table->string('rrf_no')->nullable()->unique();
            $table->string('rev', 10)->default('0');

            // Diisi PRODUKSI
            $table->foreignId('divisi_id')->constrained('divisis');
            $table->foreignId('machine_id')->constrained('rrf_machines');
            $table->foreignId('rrf_class_id')->constrained('rrf_classes');
            $table->string('jenis_permintaan', 30); // terencana | troubleshooting
            $table->dateTime('req_schedule_at')->nullable();
            $table->text('problem');
            $table->foreignId('created_by')->constrained('users');

            // Diisi MAINTENANCE
            $table->dateTime('serv_schedule_at')->nullable();
            $table->text('cause')->nullable();
            $table->text('counter_measure')->nullable();
            $table->text('remark')->nullable();
            $table->dateTime('start_at')->nullable();
            $table->dateTime('finish_at')->nullable();
            $table->unsignedInteger('downtime_menit')->nullable();
            $table->unsignedInteger('stop_line_menit')->nullable();
            $table->unsignedTinyInteger('jumlah_man')->nullable();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->foreignId('pic_mtc_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('received_at')->nullable();

            // diajukan | disetujui | ditolak | diterima | dikerjakan | selesai | closed
            $table->string('status', 20)->default('diajukan')->index();

            $table->timestamps();

            $table->index(['divisi_id', 'status']);
        });

        // Part yang diminta (diisi produksi, boleh dikoreksi maintenance)
        Schema::create('rrf_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rrf_id')->constrained('rrf')->cascadeOnDelete();
            $table->string('part_name');
            $table->string('model_type')->nullable();
            $table->string('maker')->nullable();
            $table->unsignedInteger('qty')->default(1);
            $table->string('other')->nullable();
            $table->timestamps();
        });

        Schema::create('rrf_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rrf_id')->constrained('rrf')->cascadeOnDelete();
            $table->string('tipe', 10); // before | after
            $table->string('file_path');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('rrf_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rrf_id')->constrained('rrf')->cascadeOnDelete();
            $table->string('tahap', 30);  // spv_produksi | spv_mtc | frm_gl
            $table->foreignId('user_id')->constrained('users');
            $table->string('status', 20); // disetujui | ditolak
            $table->text('catatan')->nullable();
            $table->timestamp('acted_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('rrf_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rrf_id')->constrained('rrf')->cascadeOnDelete();
            $table->string('status_lama', 20)->nullable();
            $table->string('status_baru', 20);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rrf_status_logs');
        Schema::dropIfExists('rrf_approvals');
        Schema::dropIfExists('rrf_photos');
        Schema::dropIfExists('rrf_parts');
        Schema::dropIfExists('rrf');
    }
};