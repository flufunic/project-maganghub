<?php

namespace Database\Seeders;

use App\Models\CheckSheet;
use App\Models\Line;
use Illuminate\Database\Seeder;

class CheckSheetLineSeeder extends Seeder
{
    public function run(): void
    {
        // id check sheet => kode barcode mesin
        $map = [
            // ===== UTILITY =====
            4  => 'CS-UTILITY-ELECTRICAL-PANEL',              // Electrical Room
            5  => 'CS-UTILITY-GENERATOR',                     // Genset
            6  => 'CS-UTILITY-POMPA-HYDRANT',                 // Pump Room
            7  => 'CS-UTILITY-GWH-LISTRIK',                   // GWH Meter 380 & 200 v
            8  => 'CS-UTILITY-RUNNING-HOURS-MESIN-GENERATOR', // Total House Power Genset
            9  => 'CS-UTILITY-COLING-TOWER',                  // Cooling Tower
            10 => 'CS-UTILITY-COMPOSER',                      // Compressor 1
            24 => 'CS-UTILITY-COMPOSER',                      // Compressor 2
            25 => 'CS-UTILITY-COMPOSER',                      // Compressor 3

            // ===== SAIDAN =====
            11 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 1
            26 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 2
            27 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 3
            28 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 4
            29 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 5
            30 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 6
            31 => 'CS-SAIDAN-SHIMASEIKI',                     // Shimaseiki 7
            12 => 'CS-SAIDAN-WELDER',                         // Welder 1
            32 => 'CS-SAIDAN-WELDER',                         // Welder 2
            33 => 'CS-SAIDAN-WELDER',                         // Preventif Welder 1
            13 => 'CS-SAIDAN-PRESS-HYDROLIK',                 // Press Hidrolik
            14 => 'CS-SAIDAN-KASHIME-BOTAN',                  // Kashime Botan
            15 => 'CS-SAIDAN-ISO-BOTAN',                      // Iso Botan 1&2
        ];

        foreach ($map as $checkSheetId => $kode) {
            $checkSheet = CheckSheet::find($checkSheetId);
            $line       = Line::where('kode', $kode)->first();

            if (! $checkSheet) {
                $this->command?->warn("Check sheet #$checkSheetId tidak ditemukan.");
                continue;
            }

            if (! $line) {
                $this->command?->warn("Line $kode tidak ditemukan. Jalankan LineSeeder dulu.");
                continue;
            }

            if ((int) $checkSheet->divisi_id !== (int) $line->divisi_id) {
                $this->command?->warn("Divisi check sheet #$checkSheetId tidak cocok dengan $kode.");
                continue;
            }

            $checkSheet->update(['line_id' => $line->id]);
        }

        $this->command?->info('line_id check sheet selesai diisi.');
    }
}