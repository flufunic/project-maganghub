<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->string('kode', 50)->nullable()->unique()->after('id');
        });

        // isi kode untuk data lama (termasuk yang sudah di-soft-delete)
        $dipakai = [];

        DB::table('check_sheets')->whereNull('kode')->orderBy('id')->pluck('id')
            ->each(function ($id) use (&$dipakai) {
                do {
                    $kode = 'CS-' . Str::upper(Str::random(8));
                } while (isset($dipakai[$kode]));

                $dipakai[$kode] = true;

                DB::table('check_sheets')->where('id', $id)->update(['kode' => $kode]);
            });
    }

    public function down(): void
    {
        Schema::table('check_sheets', function (Blueprint $table) {
            $table->dropUnique(['kode']);
            $table->dropColumn('kode');
        });
    }
};