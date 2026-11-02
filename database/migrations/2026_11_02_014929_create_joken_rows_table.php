<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('joken_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('joken_id')->constrained('jokens')->cascadeOnDelete();
            $table->unsignedInteger('urutan')->default(0);
            $table->string('qcpc')->nullable();
            $table->text('proses')->nullable();
            $table->string('model_material')->nullable();
            $table->string('type_mesin')->nullable();
            $table->json('nilai')->nullable(); // {uidKolom: nilai / path gambar}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('joken_rows');
    }
};