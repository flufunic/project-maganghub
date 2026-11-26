<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Master form (1 form = 1 sheet Excel = 1 equipment)
        Schema::create('preventif_checksheets', function (Blueprint $table) {
            $table->id();
            $table->string('divisi');

            // = preventif_mesins.no (tanpa FK supaya tipe kolom tidak bentrok)
            $table->unsignedBigInteger('preventif_mesin_id')->nullable()->index();

            $table->string('nama_equipment');
            $table->string('nomor_dokumen')->nullable();
            $table->date('tanggal_terbit')->nullable();
            $table->date('tanggal_revisi')->nullable();
            $table->string('revisi')->nullable();
            $table->string('disetujui')->nullable();
            $table->string('diperiksa')->nullable();
            $table->string('dibuat')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Inspection Point + Standar
        Schema::create('preventif_checksheet_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('preventif_checksheet_id');

            $table->unsignedInteger('no')->default(1);
            $table->text('inspection_point');
            $table->string('standar')->nullable();
            $table->timestamps();

            $table->foreign(
                'preventif_checksheet_id',
                'pci_checksheet_fk'
            )->references('id')
             ->on('preventif_checksheets')
             ->cascadeOnDelete();
        });

        // Header form per bulan
        Schema::create('preventif_checksheet_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('preventif_checksheet_id');

            $table->unsignedSmallInteger('tahun');
            $table->unsignedTinyInteger('bulan');
            $table->string('nama_mesin')->nullable();
            $table->string('line')->nullable();
            $table->date('tanggal_pelaksanaan')->nullable();
            $table->string('pic_pelaksana')->nullable();
            $table->timestamps();

            $table->index(
                ['preventif_checksheet_id', 'tahun', 'bulan'],
                'pcr_periode_idx'
            );

            $table->foreign(
                'preventif_checksheet_id',
                'pcr_checksheet_fk'
            )->references('id')
             ->on('preventif_checksheets')
             ->cascadeOnDelete();
        });

        // Aksi per item per TANGGAL
        Schema::create('preventif_checksheet_aksis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('preventif_checksheet_record_id');
            $table->foreignId('preventif_checksheet_item_id');

            $table->date('tanggal');
            $table->string('aksi', 20);
            $table->timestamps();

            $table->unique(
                [
                    'preventif_checksheet_record_id',
                    'preventif_checksheet_item_id',
                    'tanggal'
                ],
                'pcaksi_unique'
            );

            $table->foreign(
                'preventif_checksheet_record_id',
                'pca_record_fk'
            )->references('id')
             ->on('preventif_checksheet_records')
             ->cascadeOnDelete();

            $table->foreign(
                'preventif_checksheet_item_id',
                'pca_item_fk'
            )->references('id')
             ->on('preventif_checksheet_items')
             ->cascadeOnDelete();
        });

        // Kondisi terakhir + keterangan per item per bulan
        Schema::create('preventif_checksheet_results', function (Blueprint $table) {
            $table->id();

            $table->foreignId('preventif_checksheet_record_id');
            $table->foreignId('preventif_checksheet_item_id');

            $table->string('kondisi', 2)->nullable(); // OK / NG
            $table->string('keterangan', 500)->nullable();
            $table->timestamps();

            $table->unique(
                [
                    'preventif_checksheet_record_id',
                    'preventif_checksheet_item_id'
                ],
                'pcres_unique'
            );

            $table->foreign(
                'preventif_checksheet_record_id',
                'pcrs_record_fk'
            )->references('id')
             ->on('preventif_checksheet_records')
             ->cascadeOnDelete();

            $table->foreign(
                'preventif_checksheet_item_id',
                'pcrs_item_fk'
            )->references('id')
             ->on('preventif_checksheet_items')
             ->cascadeOnDelete();
        });

        // Catatan progress abnormality
        Schema::create('check_sheet_abnormality_catatans', function (Blueprint $table) {
            $table->id();

            $table->foreignId('check_sheet_abnormality_id');

            $table->text('catatan');
            $table->string('oleh')->nullable();
            $table->timestamps();

            $table->foreign(
                'check_sheet_abnormality_id',
                'csac_abnormality_fk'
            )->references('id')
             ->on('check_sheet_abnormalities')
             ->cascadeOnDelete();
        });

        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->date('tanggal_selesai')->nullable()->after('status');
        });

        // Penanda ACT yang dibuat otomatis saat abnormality di-Closed
        Schema::table('check_sheet_abnormality_preventif', function (Blueprint $table) {
            $table->date('act_tanggal')->nullable();
            $table->boolean('act_otomatis')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_abnormality_preventif', function (Blueprint $table) {
            $table->dropColumn(['act_tanggal', 'act_otomatis']);
        });

        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->dropColumn('tanggal_selesai');
        });

        Schema::dropIfExists('check_sheet_abnormality_catatans');
        Schema::dropIfExists('preventif_checksheet_results');
        Schema::dropIfExists('preventif_checksheet_aksis');
        Schema::dropIfExists('preventif_checksheet_records');
        Schema::dropIfExists('preventif_checksheet_items');
        Schema::dropIfExists('preventif_checksheets');
    }
};