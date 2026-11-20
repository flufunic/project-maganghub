<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheet_notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('check_sheet_pengiriman_id')
                ->constrained('check_sheet_pengirimans')
                ->cascadeOnDelete();

            $table->string('judul');
            $table->text('pesan');

            $table->timestamp('dibaca_pada')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'dibaca_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_notifications');
    }
};