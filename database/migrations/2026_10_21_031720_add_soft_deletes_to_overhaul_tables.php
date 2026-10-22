<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['overhaul_mesins', 'overhaul_satuans'] as $tabel) {
            if (! Schema::hasColumn($tabel, 'deleted_at')) {
                Schema::table($tabel, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['overhaul_mesins', 'overhaul_satuans'] as $tabel) {
            if (Schema::hasColumn($tabel, 'deleted_at')) {
                Schema::table($tabel, function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }
    }
};
