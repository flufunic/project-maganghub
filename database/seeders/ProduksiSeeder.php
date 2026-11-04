<?php

namespace Database\Seeders;

use App\Models\Divisi;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProduksiSeeder extends Seeder
{
    public function run(): void
    {
        // Divisi di pabrik 1 beserta kode nomor RRF
        $divisi = [
            'Headrest' => 'HR',
            'Saidan'   => 'SD',
            'Utility'  => 'UT',
            'Sewing'   => 'SW',
        ];

        foreach ($divisi as $nama => $kode) {
            $d = Divisi::firstOrCreate(['nama_divisi' => $nama]);

            if (!$d->kode_rrf) {
                $d->kode_rrf = $kode;
                $d->save();
            }
        }

        // [username SPV, username operator, divisi]
        $akun = [
            ['spvproduksi', 'opproduksi', 'Headrest'],
            ['spvsaidan',   'opsaidan',   'Saidan'],
            ['spvutility',  'oputility',  'Utility'],
            ['spvsewing',   'opsewing',   'Sewing'],
        ];

        foreach ($akun as [$spv, $op, $namaDivisi]) {
            $divisiId = Divisi::where('nama_divisi', $namaDivisi)->value('id');

            foreach ([[$spv, 'spv_produksi'], [$op, 'operator_produksi']] as [$nama, $role]) {
                User::firstOrCreate(
                    ['name' => $nama],
                    [
                        'email'                => $nama . '@fujiseat.com',
                        'password'             => $nama . '123',
                        'role'                 => $role,
                        'divisi_id'            => $divisiId,
                        'is_active'            => true,
                        'must_change_password' => true,
                    ]
                );
            }
        }
    }
}