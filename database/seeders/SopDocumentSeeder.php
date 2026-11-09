<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SopDocument;

class SopDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'no_dok' => 'IK001-FJI-PD-45',
                'proses' => 'S. O. P BELL STOP PANGGIL TUNGGU',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK001-FJI-PD-46',
                'proses' => 'SOP CARA SETTING SPEED KUNCIAN',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK002-FJI-PD-46',
                'proses' => 'SOP PENGECEKAN MESIN JAHIT SEWING',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK002-FJI-PD-45',
                'proses' => 'SOP PERGANTIAN LAMPU MESIN JAHIT',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK003-FJI-PD-45',
                'proses' => 'SOP SETTING PEDAL ERROR',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK004-FJI-PD-45',
                'proses' => 'SOP SETTING SPEED MESIN JUKI DU&LIU',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK003-FJI-PD-46',
                'proses' => 'SOP START UP MESIN JAHIT',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK004-FJI-PD-46',
                'proses' => 'SOP START UP HYDRANT',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK005-FJI-PD-46',
                'proses' => 'SOP PERALIHAN GENERATOR KE PLN',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK006-FJI-PD-46',
                'proses' => 'SOP START UP MESIN SHIMA',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK007-FJI-PD-46',
                'proses' => 'SOP START UP MESIN PRESS HIDROLIK',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK008-FJI-PD-46',
                'proses' => 'SOP START UP MESIN PP SOLIT',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK009-FJI-PD-46',
                'proses' => 'SOP START UP MESIN NCA',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK010-FJI-PD-46',
                'proses' => 'SOP STAR UP MESIN WELDER',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK011-FJI-PD-46',
                'proses' => 'SOP STAR UP MESIN SNAPING',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK012-FJI-PD-46',
                'proses' => 'SOP CLEANING GRIDSTONE UNIT',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK013-FJI-PD-46',
                'proses' => 'SOP CLEANING PIRINGAN SHIMASEIKI',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK005-FJI-PD-45',
                'proses' => 'SOP PERGANTIAN MIXING HEAD',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK006-FJI-PD-45',
                'proses' => 'SOP BACKUP PROGRAM PLC',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK014-FJI-PD-46',
                'proses' => 'SOP CLEANING & PENGENCANGAN KATUP IN MATERIAL HAPO',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK015-FJI-PD-46',
                'proses' => 'SOP CLEANING COOLINTOWER',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK016-FJI-PD-46',
                'proses' => 'SOP CLEANING FILTER STRAINER HAPO',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK017-FJI-PD-46',
                'proses' => 'SOP CLEANING NOZZLE',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK007-FJI-PD-45',
                'proses' => 'SOP GANTI NOZZLE NEEDLE GUIDE',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK008-FJI-PD-45',
                'proses' => 'SOP PERGANTIAN HIDRAULIC DN25',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK009-FJI-PD-45',
                'proses' => 'SOP PERGANTIAN OIL HIDROLIK',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK010-FJI-PD-45',
                'proses' => 'SOP PERGANTIAN SELANG',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK018-FJI-PD-46',
                'proses' => 'SOP START UP MESIN HEADREST',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK011-FJI-PD-45',
                'proses' => 'WI PERGANTIAN ORING AIRLOADING',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK001-FJI-PD-48',
                'proses' => 'SOP STO SPAREPART',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK012-FJI-PD-45',
                'proses' => 'SOP TROBLE SHOOTING SHIMASEIKI',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK013-FJI-PD-45',
                'proses' => 'SOP TROBLE SHOOTING HEADREST',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK014-FJI-PD-45',
                'proses' => 'SOP TROBLE SHOOTING SEWING',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK001-MTC-SC2',
                'proses' => 'SOP PENGGUNAAN TANGGA',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK019-FJI-PD-46',
                'proses' => 'SOP START UP GENERATOR',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK020-FJI-PD-46',
                'proses' => 'SOP START UP COMPRESSOR',
                'tanggal_revisi' => '2025-08-18',
            ],
            [
                'no_dok' => 'IK021-FJI-PD-46',
                'proses' => 'SOP PENGAMBILAN SPARE PART',
                'tanggal_revisi' => '2025-08-18',
            ],
        ];

        foreach ($data as $item) {
            SopDocument::create($item);
        }
    }
}