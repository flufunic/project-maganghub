<?php

namespace Database\Seeders;

use App\Models\RrfClass;
use App\Models\Shift;
use Illuminate\Database\Seeder;

class RrfMasterSeeder extends Seeder
{
    public function run(): void
    {
        $kelas = [
            ['kode' => 'SA', 'nama' => 'Super A class', 'deskripsi' => 'Ketika bermasalah produksi stop'],
            ['kode' => 'A',  'nama' => 'A class',       'deskripsi' => 'Ketika bermasalah hanya line / mesin tersebut yang stop'],
            ['kode' => 'B',  'nama' => 'B class',       'deskripsi' => 'Mesin pendukung produksi'],
            ['kode' => 'C',  'nama' => 'C class',       'deskripsi' => 'Perubahan / improvement'],
        ];

        foreach ($kelas as $k) {
            RrfClass::updateOrCreate(['kode' => $k['kode']], $k);
        }

        // Sesuaikan jumlah shift dengan pabrikmu
        foreach (['Shift 1', 'Shift 2', 'Shift 3'] as $s) {
            Shift::firstOrCreate(['nama' => $s]);
        }
    }
}