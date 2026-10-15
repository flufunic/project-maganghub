<?php

namespace Database\Seeders;

use App\Models\Divisi;
use App\Models\Line;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LineSeeder extends Seeder
{
    public function run(): void
    {
        // Headrest: Line 1..N (check sheet satu divisi dipakai semua line)
        $perLine = [
            'Headrest' => 3,
        ];

        // Utility & Saidan: 'kode barcode' => 'Nama mesin'
        $perMesin = [
            'Utility' => [
                'CS-UTILITY-COMPOSER'                      => 'Compressor',
                'CS-UTILITY-ELECTRICAL-PANEL'              => 'Electrical Panel',
                'CS-UTILITY-GENERATOR'                     => 'Generator',
                'CS-UTILITY-POMPA-HYDRANT'                 => 'Pompa Hydrant',
                'CS-UTILITY-GWH-LISTRIK'                   => 'GWH Listrik',
                'CS-UTILITY-RUNNING-HOURS-MESIN-GENERATOR' => 'Running Hours Mesin Generator',
                'CS-UTILITY-COLING-TOWER'                  => 'Cooling Tower',
            ],
            'Saidan' => [
                'CS-SAIDAN-SHIMASEIKI'     => 'Shimaseiki',
                'CS-SAIDAN-WELDER'         => 'Welder',
                'CS-SAIDAN-PRESS-HYDROLIK' => 'Press Hydrolik',
                'CS-SAIDAN-KASHIME-BOTAN'  => 'Kashime Botan',
                'CS-SAIDAN-ISO-BOTAN'      => 'Iso Botan',
            ],
        ];

        foreach ($perLine as $namaDivisi => $jumlah) {
            $divisi = Divisi::where('nama_divisi', $namaDivisi)->first();

            if (! $divisi) {
                continue;
            }

            for ($i = 1; $i <= $jumlah; $i++) {
                Line::updateOrCreate(
                    ['kode' => 'CS-' . Str::upper(Str::slug($divisi->nama_divisi)) . "-L$i"],
                    [
                        'divisi_id' => $divisi->id,
                        'nama_line' => "Line $i",
                        'per_mesin' => false,
                    ]
                );
            }
        }

        foreach ($perMesin as $namaDivisi => $daftar) {
            $divisi = Divisi::where('nama_divisi', $namaDivisi)->first();

            if (! $divisi) {
                continue;
            }

            foreach ($daftar as $kode => $namaMesin) {
                Line::updateOrCreate(
                    ['kode' => $kode],
                    [
                        'divisi_id' => $divisi->id,
                        'nama_line' => $namaMesin,
                        'per_mesin' => true,
                    ]
                );
            }
        }
    }
}