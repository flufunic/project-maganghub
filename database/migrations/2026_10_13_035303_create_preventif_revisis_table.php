<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_revisis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('preventif_pengiriman_id')
                ->constrained('preventif_pengirimans')
                ->cascadeOnDelete();

            // = kolom "no" di tabel preventif_mesins
            $table->unsignedBigInteger('preventif_mesin_id')->nullable()->index();
            $table->string('item_label')->nullable();

            // centang | catatan | item | durasi | total_durasi | dot | hot
            $table->string('jenis', 30);
            $table->text('keterangan');
            $table->text('nilai_lama')->nullable();
            $table->text('nilai_baru')->nullable();

            $table->foreignId('diubah_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // diisi saat pimpinan menandai sudah diperiksa
            $table->timestamp('ditinjau_pada')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_revisis');
    }
};