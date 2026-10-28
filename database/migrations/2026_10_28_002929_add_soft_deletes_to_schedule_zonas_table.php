<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('schedule_zonas', 'deleted_at')) {
            Schema::table('schedule_zonas', function (Blueprint $table) {
                $table->softDeletes();   // kolom deleted_at
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('schedule_zonas', 'deleted_at')) {
            Schema::table('schedule_zonas', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
