<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            // Item preventif yang perlu dicek lebih lanjut (boleh kosong).
            // Tanpa foreign key karena primary key preventif_mesins bernama "no".
            $table->unsignedBigInteger('preventif_mesin_id')->nullable()->after('line_id');
            $table->index('preventif_mesin_id');
        });
    }

    public function down(): void
    {
        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->dropIndex(['preventif_mesin_id']);
            $table->dropColumn('preventif_mesin_id');
        });
    }
};
