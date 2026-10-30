<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Baris jadwal bisa dihubungkan ke satu zona. Nama baris di jadwal
        // mengikuti Nama Line milik zona tersebut.
        if (! Schema::hasColumn('schedule_baris', 'zona_id')) {
            Schema::table('schedule_baris', function (Blueprint $table) {
                $table->unsignedBigInteger('zona_id')->nullable()->after('urutan')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('schedule_baris', 'zona_id')) {
            Schema::table('schedule_baris', function (Blueprint $table) {
                $table->dropIndex(['zona_id']);
                $table->dropColumn('zona_id');
            });
        }
    }
};
