<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_laporan_mingguan', function (Blueprint $t) {
            $t->id();
            $t->unsignedSmallInteger('tahun');
            $t->unsignedTinyInteger('bulan');
            $t->unsignedTinyInteger('week'); // 1-5

            // draft | menunggu | diperiksa | disetujui | ditolak
            $t->string('status', 20)->default('draft');

            $t->unsignedBigInteger('dikirim_oleh')->nullable();
            $t->timestamp('dikirim_pada')->nullable();
            $t->text('alasan_penolakan')->nullable();
            $t->unsignedBigInteger('disetujui_oleh')->nullable();
            $t->timestamp('disetujui_pada')->nullable();

            // angka Bagian 1 dibekukan saat dikirim
            $t->json('snapshot')->nullable();

            $t->timestamps();
            $t->unique(['tahun', 'bulan', 'week']);
        });

        Schema::create('preventif_laporan_item', function (Blueprint $t) {
            $t->id();
            $t->foreignId('laporan_id')
                ->constrained('preventif_laporan_mingguan')
                ->cascadeOnDelete();

            $t->unsignedTinyInteger('bagian'); // 1 = pencapaian (komentar), 2 = laporan preventif, 3 = temuan
            $t->unsignedBigInteger('preventif_mesin_id')->nullable(); // null untuk bagian 3
            $t->string('mesin')->nullable();   // nama item preventif
            $t->text('aktivitas')->nullable();
            $t->text('penanggulangan')->nullable();
            $t->text('komentar')->nullable();
            $t->string('foto_before')->nullable(); // bagian 3 memakai kolom ini sebagai foto tunggal
            $t->string('foto_after')->nullable();
            $t->unsignedInteger('urutan')->default(0);
            $t->timestamps();

            $t->index(['laporan_id', 'bagian']);
        });

        Schema::create('preventif_laporan_revisi', function (Blueprint $t) {
            $t->id();
            $t->foreignId('laporan_id')
                ->constrained('preventif_laporan_mingguan')
                ->cascadeOnDelete();
            $t->unsignedBigInteger('user_id')->nullable();
            $t->string('keterangan');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_laporan_revisi');
        Schema::dropIfExists('preventif_laporan_item');
        Schema::dropIfExists('preventif_laporan_mingguan');
    }
};
