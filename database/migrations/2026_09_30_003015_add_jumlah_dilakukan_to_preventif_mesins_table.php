<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->unsignedInteger('jumlah_dilakukan')
                ->default(1)
                ->after('tanggal_plan_awal');
        });
    }

    public function down(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->dropColumn('jumlah_dilakukan');
        });
    }
};