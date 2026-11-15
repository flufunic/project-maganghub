<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->boolean('pakai_pelumasan')->default(false);
        });

        Schema::create('check_sheet_lubrications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('check_sheet_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('no')->default(1);
            $table->string('sub_mesin')->nullable();
            $table->string('jenis_pelumasan');
            $table->string('qty')->nullable();
            $table->string('method')->nullable();
            $table->string('tools')->nullable();
            $table->unsignedInteger('time_minutes')->nullable();
            $table->enum('interval', ['day', 'week', 'month', 'year'])->nullable();
            $table->string('pic')->nullable();
            $table->softDeletes(); // supaya ikut pola soft delete CheckSheet
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_sheet_lubrications');

        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropColumn('pakai_pelumasan');
        });
    }


};
