<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_sheet_abnormalities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('check_sheet_id')
                ->constrained('check_sheets')
                ->cascadeOnDelete();

            $table->date('tanggal');

            $table->text('abnormality');

            $table->text('countermeasure')->nullable();

            $table->string('status')->default('Open');

            $table->string('pic')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_abnormalities');
    }
};