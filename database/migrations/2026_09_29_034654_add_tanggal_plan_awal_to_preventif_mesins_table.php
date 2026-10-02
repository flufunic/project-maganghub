<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->date('tanggal_plan_awal')
                ->nullable()
                ->after('periode_satuan');
        });
    }

    public function down(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->dropColumn('tanggal_plan_awal');
        });
    }
};