<?php

namespace App\Support;

use App\Models\Machine;
use App\Models\MachineType;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class MachineImporter
{
    /**
     * keys: kata kunci header (sudah huruf kecil tanpa spasi/simbol).
     * Awalan "=" berarti harus persis sama, selain itu cukup mengandung.
     */
    public const FIELDS = [
        'nama_alat'            => ['label' => 'Nama Alat',          'required' => true,  'keys' => ['namaalat', '=alat']],
        'no_kontrol'           => ['label' => 'No. Kontrol / Mesin', 'required' => true,  'keys' => ['nokontrol', 'nomesin', 'kodemesin']],
        'qty'                  => ['label' => 'Qty',                'required' => false, 'keys' => ['=qty', 'jumlah']],
        'merk'                 => ['label' => 'Merk',               'required' => false, 'keys' => ['merk', 'merek', 'brand']],
        'model_type'           => ['label' => 'Model / Type',       'required' => false, 'keys' => ['model']],
        'electric_consumption' => ['label' => 'Electric Consumption', 'required' => false, 'keys' => ['electric', 'listrik']],
        'negara_pembuat'       => ['label' => 'Negara Pembuat',     'required' => false, 'keys' => ['negara']],
        'tahun_pembuatan'      => ['label' => 'Tahun Perakitan',    'required' => false, 'keys' => ['perakitan', 'tahunpembuatan']],
        'start_operasional'    => ['label' => 'Start Operasional',  'required' => false, 'keys' => ['startoperasi']],
        'supplier_name'        => ['label' => 'Supplier (Name)',    'required' => false, 'keys' => ['supliername', 'suppliername', '=name']],
        'supplier_active'      => ['label' => 'Supplier Active',    'required' => false, 'keys' => ['=active', '=aktif']],
        'supplier_repair'      => ['label' => 'Supplier Repair',    'required' => false, 'keys' => ['=repair']],
        'secondtier'           => ['label' => 'Second Tier',        'required' => false, 'keys' => ['secondtier', '2ndtier']],
        'kontak_person'        => ['label' => 'No. Kontak Person',  'required' => false, 'keys' => ['kontak']],
        'keterangan'           => ['label' => 'Keterangan',         'required' => false, 'keys' => ['keterangan']],
        'panel_monitor_kwh'    => ['label' => 'Panel Monitor KWH',  'required' => false, 'keys' => ['panelmonitor', 'kvh', 'kwh']],
    ];

    /* ---------------------------------------------------------------
     | BACA FILE
     --------------------------------------------------------------- */
   public static function readRows(string $path): array
    {
        $sheets = Excel::toArray(new RawSheetImport(), $path, 'local');
        $sheet  = $sheets[0] ?? [];

        return array_map(fn ($r) => array_map([self::class, 'cell'], $r), $sheet);
    }

    public static function cell($v): string
    {
        if ($v === null) {
            return '';
        }
        if (is_float($v) && floor($v) == $v) {
            return (string) (int) $v;
        }

        return trim(preg_replace('/\s+/u', ' ', (string) $v));
    }

    /* ---------------------------------------------------------------
     | DETEKSI BARIS HEADER & BARIS DATA (hasil 1-based, sesuai nomor baris Excel)
     --------------------------------------------------------------- */
    public static function detect(array $rows, ?int $headerRow = null): array
    {
        if ($headerRow) {
            $best = $headerRow - 1;
        } else {
            $best = 0;
            $bestScore = -1;

            foreach (array_slice($rows, 0, 30, true) as $i => $row) {
                $score = count(array_filter(self::suggest($row), fn ($v) => $v !== null));
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $best = $i;
                }
            }
        }

        // Baris data pertama = baris pertama di bawah header yang nama alat & no kontrol-nya terisi
        $map   = self::suggest($rows[$best] ?? []);
        $start = $best + 1;

        if ($map['nama_alat'] !== null && $map['no_kontrol'] !== null) {
            $limit = min(count($rows), $best + 10);
            for ($r = $best + 1; $r < $limit; $r++) {
                if (($rows[$r][$map['nama_alat']] ?? '') !== '' && ($rows[$r][$map['no_kontrol']] ?? '') !== '') {
                    $start = $r;
                    break;
                }
            }
        }

        return [$best + 1, $start + 1];
    }

    /** Gabungkan header yang terdiri dari beberapa baris (mis. SUPLIER + NAME) */
    public static function labels(array $rows, int $headerRow, int $dataStart): array
    {
        $widths = array_map('count', array_slice($rows, 0, 60));
        $width  = min($widths ? max($widths) : 0, 40);
        $end    = max($dataStart - 1, $headerRow);

        $labels = [];
        for ($c = 0; $c < $width; $c++) {
            $parts = [];
            for ($r = $headerRow - 1; $r < $end; $r++) {
                $v = $rows[$r][$c] ?? '';
                if ($v !== '') {
                    $parts[] = $v;
                }
            }
            $labels[] = implode(' ', $parts);
        }

        return $labels;
    }

    /** Tebak pemetaan: field => index kolom (atau null) */
    public static function suggest(array $labels): array
    {
        $norm = array_map(fn ($l) => preg_replace('/[^a-z0-9]/', '', strtolower((string) $l)), $labels);
        $used = [];
        $map  = [];

        foreach (self::FIELDS as $field => $cfg) {
            $map[$field] = null;

            foreach ($norm as $i => $n) {
                if ($n === '' || in_array($i, $used, true)) {
                    continue;
                }

                foreach ($cfg['keys'] as $k) {
                    $hit = str_starts_with($k, '=') ? $n === substr($k, 1) : str_contains($n, $k);

                    if ($hit) {
                        $map[$field] = $i;
                        $used[] = $i;
                        break 2;
                    }
                }
            }
        }

        return $map;
    }

    /* ---------------------------------------------------------------
     | JALANKAN IMPORT
     --------------------------------------------------------------- */
    public static function run(array $rows, array $map, int $dataStart, bool $fillDown): array
    {
        return DB::transaction(function () use ($rows, $map, $dataStart, $fillDown) {
            $warnings = [];
            $typesNew = 0;
            $machinesNew = 0;
            $lastPanel = '';

            $get = fn (array $row, string $f) =>
                isset($map[$f]) && $map[$f] !== null ? ($row[(int) $map[$f]] ?? '') : '';

            $bool = fn (string $v) => in_array(
                mb_strtolower($v),
                ['1', 'o', '○', '●', '✓', '√', 'v', 'y', 'ya', 'yes', 'true'],
                true
            );

            $num = fn (string $v) => ctype_digit($v) ? (int) $v : null;

            foreach ($rows as $i => $row) {
                if ($i < $dataStart - 1) {
                    continue;
                }

                $line  = $i + 1;
                $nama  = $get($row, 'nama_alat');
                $raw   = $get($row, 'no_kontrol');
                $panel = $get($row, 'panel_monitor_kwh');

                // merged cell: nilai hanya ada di baris pertama, baris bawahnya kosong
                if ($fillDown) {
                    if ($panel !== '') {
                        $lastPanel = $panel;
                    } elseif ($nama !== '' || $raw !== '') {
                        $panel = $lastPanel;
                    }
                }

                if ($nama === '' && $raw === '') {
                    continue;
                }

                if ($nama === '' || $raw === '') {
                    $warnings[] = "Baris {$line}: dilewati (" . ($nama === '' ? 'nama alat' : 'no kontrol') . ' kosong).';
                    continue;
                }

                $units = ControlNumberParser::expand($raw);
                $qty   = $get($row, 'qty');

                if ($qty !== '' && (int) $qty !== count($units)) {
                    $warnings[] = "Baris {$line}: Qty={$qty} tapi no kontrol menghasilkan " . count($units) . ' unit.';
                }

                $type = MachineType::updateOrCreate(
                    ['no_kontrol_raw' => $raw],
                    [
                        'nama_alat'            => $nama,
                        'merk'                 => $get($row, 'merk') ?: null,
                        'model_type'           => $get($row, 'model_type') ?: null,
                        'negara_pembuat'       => $get($row, 'negara_pembuat') ?: null,
                        'tahun_pembuatan'      => $num($get($row, 'tahun_pembuatan')),
                        'start_operasional'    => $num($get($row, 'start_operasional')),
                        'electric_consumption' => $get($row, 'electric_consumption') ?: null,
                        'supplier_name'        => $get($row, 'supplier_name') ?: null,
                        'supplier_active'      => $bool($get($row, 'supplier_active')),
                        'supplier_repair'      => $bool($get($row, 'supplier_repair')),
                        'secondtier'           => $get($row, 'secondtier') ?: null,
                        'kontak_person'        => $get($row, 'kontak_person') ?: null,
                        'keterangan'           => $get($row, 'keterangan') ?: null,
                        'panel_monitor_kwh'    => $panel ?: null,
                        'qty'                  => count($units),
                    ]
                );

                if ($type->wasRecentlyCreated) {
                    $typesNew++;
                }

                foreach ($units as $no) {
                    $m = Machine::withTrashed()->firstOrCreate(
                        ['no_kontrol' => $no],
                        ['machine_type_id' => $type->id, 'barcode' => $no]
                    );

                    if ($m->wasRecentlyCreated) {
                        $machinesNew++;
                    } elseif ($m->trashed()) {
                        // unit yang pernah dihapus diaktifkan lagi
                        $m->restore();
                        $m->update(['machine_type_id' => $type->id]);
                        $machinesNew++;
                    } elseif ((int) $m->machine_type_id !== (int) $type->id) {
                        $warnings[] = "Baris {$line}: {$no} sudah terdaftar di jenis mesin lain, dilewati.";
                    }
                }
            }

            return [
                'types'    => $typesNew,
                'machines' => $machinesNew,
                'warnings' => $warnings,
            ];
        });
    }
}