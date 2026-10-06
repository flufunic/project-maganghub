<?php

namespace Database\Seeders;

use App\Models\Divisi;
use App\Models\Mesin;
use Illuminate\Database\Seeder;

class MesinSeeder extends Seeder
{
    public function run(): void
    {
        $divisis = Divisi::orderBy('id')->take(3)->get();

        if ($divisis->count() < 3) {
            return;
        }

        Mesin::create([
            'divisi_id' => $divisis[0]->id,
            'nama_mesin' => 'Mesin 1',
            'kode_mesin' => 'M001',
        ]);

        Mesin::create([
            'divisi_id' => $divisis[0]->id,
            'nama_mesin' => 'Mesin 2',
            'kode_mesin' => 'M002',
        ]);

        Mesin::create([
            'divisi_id' => $divisis[1]->id,
            'nama_mesin' => 'Mesin 3',
            'kode_mesin' => 'M003',
        ]);

        Mesin::create([
            'divisi_id' => $divisis[1]->id,
            'nama_mesin' => 'Mesin 4',
            'kode_mesin' => 'M004',
        ]);

        Mesin::create([
            'divisi_id' => $divisis[2]->id,
            'nama_mesin' => 'Mesin 5',
            'kode_mesin' => 'M005',
        ]);
    }
}