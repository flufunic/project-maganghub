<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Kolom line_id
        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->foreignId('line_id')->nullable()->after('check_sheet_item_id')
                ->constrained('lines')->nullOnDelete();
        });

        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->foreignId('line_id')->nullable()->after('check_sheet_id')
                ->constrained('lines')->nullOnDelete();
        });

        // 2. Isi data lama: check sheet per mesin -> ikut line_id check sheet-nya
        DB::table('check_sheet_abnormalities')
            ->join('check_sheets', 'check_sheets.id', '=', 'check_sheet_abnormalities.check_sheet_id')
            ->whereNotNull('check_sheets.line_id')
            ->update(['check_sheet_abnormalities.line_id' => DB::raw('check_sheets.line_id')]);

        DB::table('check_sheet_checklists')
            ->join('check_sheet_items', 'check_sheet_items.id', '=', 'check_sheet_checklists.check_sheet_item_id')
            ->join('check_sheets', 'check_sheets.id', '=', 'check_sheet_items.check_sheet_id')
            ->whereNotNull('check_sheets.line_id')
            ->update(['check_sheet_checklists.line_id' => DB::raw('check_sheets.line_id')]);

        // 3. Data lama Headrest (belum tahu dari line mana) -> dimasukkan ke Line 1
        $sheets = DB::table('check_sheets')->whereNull('line_id')->get(['id', 'divisi_id']);

        foreach ($sheets as $cs) {
            $lineId = DB::table('lines')
                ->where('divisi_id', $cs->divisi_id)
                ->where('per_mesin', false)
                ->orderBy('id')
                ->value('id');

            if (! $lineId) {
                continue;
            }

            DB::table('check_sheet_abnormalities')
                ->where('check_sheet_id', $cs->id)
                ->whereNull('line_id')
                ->update(['line_id' => $lineId]);

            $itemIds = DB::table('check_sheet_items')
                ->where('check_sheet_id', $cs->id)
                ->pluck('id');

            DB::table('check_sheet_checklists')
                ->whereIn('check_sheet_item_id', $itemIds)
                ->whereNull('line_id')
                ->update(['line_id' => $lineId]);
        }

        // 4. Unique baru: 1 centang per item + line + tanggal
        //    (dibuat dulu sebelum unique lama dihapus, supaya foreign key tetap punya index)
        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->unique(
                ['check_sheet_item_id', 'line_id', 'tanggal'],
                'cs_checklists_item_line_tgl_unique'
            );
        });

        // Hapus unique lama (item + tanggal) kalau ada
        try {
            Schema::table('check_sheet_checklists', function (Blueprint $table) {
                $table->dropUnique(['check_sheet_item_id', 'tanggal']);
            });
        } catch (\Throwable $e) {
            // unique lama memang tidak ada, abaikan
        }
    }

    public function down(): void
    {
        Schema::table('check_sheet_abnormalities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('line_id');
        });

        Schema::table('check_sheet_checklists', function (Blueprint $table) {
            $table->dropUnique('cs_checklists_item_line_tgl_unique');
            $table->dropConstrainedForeignId('line_id');
        });
    }
};