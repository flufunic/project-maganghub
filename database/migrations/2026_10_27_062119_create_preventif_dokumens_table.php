<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preventif_dokumens', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->index();
            $table->string('nama_asli');
            $table->string('path');
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('ukuran')->default(0);
            $table->foreignId('diunggah_oleh')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preventif_dokumens');
    }
};