<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            // false = Generator (Solar L/jam x Running Hours)
            // true  = Pompa Hydrant (Solar L/menit x Running Hours x 60)
            $table->boolean('bbm_kali_60')->default(false)->after('pakai_bbm');
        });
    }

    public function down(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropColumn('bbm_kali_60');
        });
    }
};