<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->decimal('periode_nilai', 12, 2)
                ->nullable()
                ->after('item_preventif');

            $table->string('periode_satuan')
                ->nullable()
                ->after('periode_nilai');
        });
    }

    public function down(): void
    {
        Schema::table('preventif_mesins', function (Blueprint $table) {
            $table->dropColumn([
                'periode_nilai',
                'periode_satuan',
            ]);
        });
    }
};