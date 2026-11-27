<?php

namespace App\Console\Commands;

use App\Models\CheckSheet;
use App\Models\Line;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PecahCheckSheetPerLine extends Command
{
    protected $signature = 'checksheet:pecah-per-line';

    protected $description = 'Pecah check sheet bersama (line_id kosong) menjadi 1 check sheet per line.';

    public function handle(): int
    {
        // semua line sekarang per mesin
        Line::query()->update(['per_mesin' => true]);

        $lama = CheckSheet::whereNull('line_id')->with('items')->get();

        if ($lama->isEmpty()) {
            $this->info('Tidak ada check sheet bersama. Selesai.');

            return self::SUCCESS;
        }

        foreach ($lama as $sheet) {
            $lines = Line::where('divisi_id', $sheet->divisi_id)->orderBy('id')->get();

            if ($lines->isEmpty()) {
                $this->warn("Dilewati (divisi belum punya line): {$sheet->nama_checksheet}");

                continue;
            }

            DB::transaction(function () use ($sheet, $lines) {
                foreach ($lines as $line) {
                    $baru = $sheet->replicate();
                    $baru->line_id = $line->id;
                    $baru->save();

                    $peta = []; // id item lama => id item baru

                    foreach ($sheet->items as $item) {
                        $itemBaru = $baru->items()->create($item->only([
                            'no', 'shift', 'inspection_point', 'condition', 'method',
                        ]));

                        $peta[$item->id] = $itemBaru->id;

                        // pindahkan centang milik line ini ke item baru
                        $item->checklists()
                            ->where('line_id', $line->id)
                            ->update(['check_sheet_item_id' => $itemBaru->id]);
                    }

                    // pindahkan abnormality milik line ini
                    foreach ($sheet->abnormalities()->where('line_id', $line->id)->get() as $abn) {
                        $abn->update([
                            'check_sheet_id'      => $baru->id,
                            'check_sheet_item_id' => $peta[$abn->check_sheet_item_id] ?? null,
                        ]);
                    }

                    // pindahkan pelumasan milik line ini
                    $sheet->lubrications()
                        ->where('line_id', $line->id)
                        ->update(['check_sheet_id' => $baru->id]);
                }

                // check sheet bersama yang lama di-soft-delete
                $sheet->delete();
            });

            $this->info("OK: {$sheet->nama_checksheet} -> {$lines->count()} line");
        }

        $this->info('Selesai.');

        return self::SUCCESS;
    }
}