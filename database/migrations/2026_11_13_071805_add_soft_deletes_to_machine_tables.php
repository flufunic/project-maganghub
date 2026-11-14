<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machine_types', function (Blueprint $table) {
            // unique diganti index biasa, keunikan dicek lewat validasi (hanya yang belum dihapus)
            $table->dropUnique(['no_kontrol_raw']);
            $table->index('no_kontrol_raw');
            $table->softDeletes();
        });

        Schema::table('machines', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('machine_types', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['no_kontrol_raw']);
            $table->unique('no_kontrol_raw');
        });
    }
};