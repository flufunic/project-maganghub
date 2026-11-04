<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rrf_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('divisi_id')->constrained('divisis');
            $table->string('nama');
            $table->timestamps();

            $table->unique(['divisi_id', 'nama']);
        });

        Schema::create('rrf_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rrf_line_id')->constrained('rrf_lines');
            $table->string('kode')->nullable()->unique();
            $table->string('nama');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['rrf_line_id', 'nama']);
        });

        Schema::create('rrf_classes', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 5)->unique();
            $table->string('nama');
            $table->string('deskripsi');
            $table->timestamps();
        });

        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
        Schema::dropIfExists('rrf_classes');
        Schema::dropIfExists('rrf_machines');
        Schema::dropIfExists('rrf_lines');
    }
};