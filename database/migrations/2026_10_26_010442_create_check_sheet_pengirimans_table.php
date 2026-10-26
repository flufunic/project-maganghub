<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheet_pengirimans', function (Blueprint $table) {
            $table->id();

            // Senin dari minggu yang dikirim. unique = 1 minggu hanya 1 pengiriman.
            $table->date('minggu_mulai')->unique();
            // Minggu (hari ke-7)
            $table->date('minggu_selesai');

            $table->foreignId('dikirim_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('dikirim_pada')->nullable();

            // menunggu | diperiksa | ditolak
            $table->string('status')->default('menunggu');
            $table->text('alasan_penolakan')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_pengirimans');
    }
};
