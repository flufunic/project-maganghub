<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('preventif_mesin_bulanans', 'item_preventif')) {
            Schema::table('preventif_mesin_bulanans', function (Blueprint $table) {
                $table->string('item_preventif')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('preventif_mesin_bulanans', 'item_preventif')) {
            Schema::table('preventif_mesin_bulanans', function (Blueprint $table) {
                $table->dropColumn('item_preventif');
            });
        }
    }
};