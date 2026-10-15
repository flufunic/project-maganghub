<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lines', function (Blueprint $table) {
            // true = barcode ini untuk 1 mesin, check sheet-nya milik mesin itu saja
            $table->boolean('per_mesin')->default(false)->after('kode');
        });

        Schema::table('check_sheets', function (Blueprint $table) {
            // terisi hanya untuk check sheet milik mesin tertentu
            $table->foreignId('line_id')->nullable()->after('divisi_id')
                ->constrained('lines')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('line_id');
        });

        Schema::table('lines', function (Blueprint $table) {
            $table->dropColumn('per_mesin');
        });
    }
};