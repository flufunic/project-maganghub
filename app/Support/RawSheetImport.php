<?php

namespace App\Support;

use Maatwebsite\Excel\Concerns\ToArray;

/**
 * Import kosong: hanya dipakai supaya Excel::toArray() bisa membaca isi sheet mentah.
 */
class RawSheetImport implements ToArray
{
    public function array(array $array): void
    {
        // tidak ada yang dilakukan, hasilnya diambil lewat Excel::toArray()
    }
}