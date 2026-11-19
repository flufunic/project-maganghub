<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MachineType;
use App\Support\ControlNumberParser;
use App\Support\MachineImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MachineController extends Controller
{
    /* ---------------------------------------------------------------
     | DAFTAR
     --------------------------------------------------------------- */
    private function typeQuery(Request $request)
    {
        return MachineType::query()
            ->when($request->nama_alat, fn ($q, $v) => $q->where('nama_alat', $v))
            ->when($request->merk, fn ($q, $v) => $q->where('merk', $v))
            ->when($request->negara_pembuat, fn ($q, $v) => $q->where('negara_pembuat', $v))
            ->when($request->panel_monitor_kwh, fn ($q, $v) => $q->where('panel_monitor_kwh', $v))
            ->when($request->search, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('model_type', 'like', "%{$v}%")
                  ->orWhere('no_kontrol_raw', 'like', "%{$v}%")
                  ->orWhere('nama_alat', 'like', "%{$v}%");
            }));
    }

    public function index(Request $request)
    {
        $types = $this->typeQuery($request)
            ->withCount('machines')
            ->orderBy('nama_alat')
            ->orderBy('no_kontrol_raw')
            ->paginate(25)
            ->withQueryString();

        $opt = fn (string $col) => MachineType::whereNotNull($col)
            ->distinct()->orderBy($col)->pluck($col);

        return Inertia::render('Machines/Index', [
            'types'   => $types,
            'filters' => $request->only('nama_alat', 'merk', 'negara_pembuat', 'panel_monitor_kwh', 'search'),
            'options' => [
                'nama_alat'         => $opt('nama_alat'),
                'merk'              => $opt('merk'),
                'negara_pembuat'    => $opt('negara_pembuat'),
                'panel_monitor_kwh' => $opt('panel_monitor_kwh'),
            ],
        ]);
    }

    public function units(MachineType $type)
    {
        return response()->json([
            'type'     => $type,
            'machines' => $type->machines()->orderBy('no_kontrol')->get(['id', 'no_kontrol', 'barcode']),
        ]);
    }

    /* ---------------------------------------------------------------
     | TAMBAH / EDIT / HAPUS (soft delete)
     --------------------------------------------------------------- */
    private function validated(Request $request, ?MachineType $type = null): array
    {
        $data = $request->validate([
            'nama_alat'            => ['required', 'string', 'max:255'],
            'no_kontrol_raw'       => [
                'required', 'string', 'max:255',
                Rule::unique('machine_types', 'no_kontrol_raw')
                    ->whereNull('deleted_at')
                    ->ignore($type?->id),
            ],
            'merk'                 => ['nullable', 'string', 'max:255'],
            'model_type'           => ['nullable', 'string', 'max:255'],
            'electric_consumption' => ['nullable', 'string', 'max:255'],
            'negara_pembuat'       => ['nullable', 'string', 'max:255'],
            'tahun_pembuatan'      => ['nullable', 'integer', 'between:1900,2100'],
            'start_operasional'    => ['nullable', 'integer', 'between:1900,2100'],
            'supplier_name'        => ['nullable', 'string', 'max:255'],
            'secondtier'           => ['nullable', 'string', 'max:255'],
            'kontak_person'        => ['nullable', 'string', 'max:255'],
            'keterangan'           => ['nullable', 'string', 'max:255'],
            'panel_monitor_kwh'    => ['nullable', 'string', 'max:255'],
        ], [
            'nama_alat.required'        => 'Nama alat wajib diisi.',
            'no_kontrol_raw.required'   => 'No. kontrol wajib diisi.',
            'no_kontrol_raw.unique'     => 'No. kontrol ini sudah dipakai jenis mesin lain.',
            'tahun_pembuatan.between'   => 'Tahun tidak valid.',
            'start_operasional.between' => 'Tahun tidak valid.',
        ]);

        $data['nama_alat']       = trim($data['nama_alat']);
        $data['no_kontrol_raw']  = trim($data['no_kontrol_raw']);
        $data['supplier_active'] = $request->boolean('supplier_active');
        $data['supplier_repair'] = $request->boolean('supplier_repair');

        return $data;
    }

    /** Ubah no. kontrol (bisa rentang) jadi daftar unit + cek bentrok */
    private function unitsFrom(string $raw, ?MachineType $type = null): array
    {
        $units = ControlNumberParser::expand($raw);

        if (count($units) > 1000) {
            throw ValidationException::withMessages([
                'no_kontrol_raw' => 'Rentang terlalu besar (maksimal 1000 unit).',
            ]);
        }

        $bentrok = Machine::whereIn('no_kontrol', $units)
            ->when($type, fn ($q) => $q->where('machine_type_id', '!=', $type->id))
            ->pluck('no_kontrol');

        if ($bentrok->isNotEmpty()) {
            throw ValidationException::withMessages([
                'no_kontrol_raw' => 'Nomor sudah dipakai jenis mesin lain: '
                    . $bentrok->take(5)->implode(', ')
                    . ($bentrok->count() > 5 ? ', ...' : ''),
            ]);
        }

        return $units;
    }

    /** Samakan unit di database dengan daftar yang baru */
    private function syncUnits(MachineType $type, array $units): void
    {
        // unit yang tidak ada lagi di rentang -> soft delete
        $type->machines()->whereNotIn('no_kontrol', $units)->delete();

        foreach ($units as $no) {
            $m = Machine::withTrashed()->where('no_kontrol', $no)->first();

            if ($m) {
                if ($m->trashed()) {
                    $m->restore();
                }
                if ((int) $m->machine_type_id !== (int) $type->id) {
                    $m->machine_type_id = $type->id;
                    $m->save();
                }
            } else {
                Machine::create([
                    'machine_type_id' => $type->id,
                    'no_kontrol'      => $no,
                    'barcode'         => $no,
                ]);
            }
        }

        $type->update(['qty' => count($units)]);
    }

    public function store(Request $request)
    {
        $data  = $this->validated($request);
        $units = $this->unitsFrom($data['no_kontrol_raw']);

        $type = DB::transaction(function () use ($data, $units) {
            $type = MachineType::create($data + ['qty' => count($units)]);
            $this->syncUnits($type, $units);

            return $type;
        });

        return back()->with('success', "{$type->nama_alat} ditambahkan ({$type->qty} unit).");
    }

    public function update(Request $request, MachineType $type)
    {
        $data  = $this->validated($request, $type);
        $units = $this->unitsFrom($data['no_kontrol_raw'], $type);

        DB::transaction(function () use ($type, $data, $units) {
            $type->update($data + ['qty' => count($units)]);
            $this->syncUnits($type, $units);
        });

        return back()->with('success', "{$type->nama_alat} diperbarui ({$type->qty} unit).");
    }

    public function destroy(MachineType $type)
    {
        DB::transaction(function () use ($type) {
            $type->machines()->delete(); // soft delete semua unit
            $type->delete();             // soft delete jenis mesin
        });

        return back()->with('success', "{$type->nama_alat} dihapus.");
    }

    /* ---------------------------------------------------------------
     | IMPORT EXCEL
     --------------------------------------------------------------- */
    public function importPreview(Request $request)
    {
        $request->validate([
            'file'       => 'required_without:token|file|mimes:xlsx,xls,csv|max:10240',
            'token'      => ['required_without:file', 'regex:/^[A-Za-z0-9]+\.(xlsx|xls|csv)$/'],
            'header_row' => 'nullable|integer|min:1',
            'data_start' => 'nullable|integer|min:1',
        ]);

        if ($request->hasFile('file')) {
            $file  = $request->file('file');
            $token = Str::random(24) . '.' . strtolower($file->getClientOriginalExtension());
            $file->storeAs('machine-imports', $token, 'local');
        } else {
            $token = $request->input('token');
        }

        $path = "machine-imports/{$token}";
        abort_unless(Storage::disk('local')->exists($path), 404, 'File import tidak ditemukan, upload ulang.');

        $rows = MachineImporter::readRows($path);

        [$headerRow, $dataStart] = MachineImporter::detect(
            $rows,
            $request->filled('header_row') ? (int) $request->header_row : null
        );

        if ($request->filled('data_start')) {
            $dataStart = (int) $request->data_start;
        }

        $labels = MachineImporter::labels($rows, $headerRow, $dataStart);

        return response()->json([
            'token'      => $token,
            'header_row' => $headerRow,
            'data_start' => $dataStart,
            'labels'     => $labels,
            'mapping'    => MachineImporter::suggest($labels),
            'fields'     => collect(MachineImporter::FIELDS)
                ->map(fn ($c, $k) => ['key' => $k, 'label' => $c['label'], 'required' => $c['required']])
                ->values(),
            'rows'       => array_slice($rows, 0, 60),
            'total_rows' => count($rows),
        ]);
    }

    public function import(Request $request)
    {
        $data = $request->validate([
            'token'              => ['required', 'regex:/^[A-Za-z0-9]+\.(xlsx|xls|csv)$/'],
            'data_start'         => 'required|integer|min:1',
            'mapping'            => 'required|array',
            'mapping.nama_alat'  => 'required|integer|min:0',
            'mapping.no_kontrol' => 'required|integer|min:0',
            'mapping.*'          => 'nullable|integer|min:0',
            'fill_down'          => 'boolean',
        ], [
            'mapping.nama_alat.required'  => 'Kolom "Nama Alat" harus dipilih.',
            'mapping.no_kontrol.required' => 'Kolom "No. Kontrol" harus dipilih.',
        ]);

        $path = "machine-imports/{$data['token']}";
        abort_unless(Storage::disk('local')->exists($path), 404, 'File import tidak ditemukan, upload ulang.');

        $rows   = MachineImporter::readRows($path);
        $result = MachineImporter::run(
            $rows,
            array_intersect_key($data['mapping'], MachineImporter::FIELDS),
            (int) $data['data_start'],
            $request->boolean('fill_down')
        );

        Storage::disk('local')->delete($path);

        return back()->with('import_result', $result);
    }

    /* ---------------------------------------------------------------
     | EXPORT EXCEL (1 sheet, ikut filter yang sedang aktif)
     --------------------------------------------------------------- */
    public function export(Request $request)
    {
        $types = $this->typeQuery($request)
            ->withCount('machines')
            ->orderBy('nama_alat')
            ->orderBy('no_kontrol_raw')
            ->get();

        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator($request->user()?->name ?? 'Sistem')
            ->setTitle('Daftar Inventaris Mesin');
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(10);

        $this->xlSheetTypes($spreadsheet->getActiveSheet(), $types, $request);

        $filename = 'daftar-mesin-' . now()->format('Ymd-His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /* ---------- helper style Excel ---------- */
    private function xlFill(string $rgb): array
    {
        return ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rgb]];
    }

    private function xlBanner(Worksheet $sheet, string $title, string $subtitle, string $lastCol): void
    {
        $sheet->setCellValue('A1', $title);
        $sheet->mergeCells("A1:{$lastCol}1");
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font'      => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => $this->xlFill('0B1A4D'),
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'indent'     => 1,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(38);

        $sheet->setCellValue('A2', $subtitle);
        $sheet->mergeCells("A2:{$lastCol}2");
        $sheet->getStyle("A2:{$lastCol}2")->applyFromArray([
            'font'      => ['italic' => true, 'size' => 9, 'color' => ['rgb' => 'BFDBFE']],
            'fill'      => $this->xlFill('12328A'),
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'indent'     => 1,
            ],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(20);
        $sheet->getRowDimension(3)->setRowHeight(10);
    }

    /** Kartu ringkasan: label di baris $from, nilai di baris di bawahnya */
    private function xlCard(Worksheet $sheet, string $from, string $to, string $label, $value, string $accent, int $valueSize = 18): void
    {
        $row = (int) preg_replace('/\D/', '', $from);
        $c1  = preg_replace('/\d/', '', $from);
        $c2  = preg_replace('/\d/', '', $to);
        $v   = $row + 1;

        $sheet->mergeCells("{$c1}{$row}:{$c2}{$row}");
        $sheet->mergeCells("{$c1}{$v}:{$c2}{$v}");
        $sheet->setCellValue("{$c1}{$row}", $label);
        $sheet->setCellValue("{$c1}{$v}", $value);

        $sheet->getStyle("{$c1}{$row}:{$c2}{$row}")->applyFromArray([
            'font'      => ['size' => 9, 'bold' => true, 'color' => ['rgb' => '64748B']],
            'fill'      => $this->xlFill('F1F5F9'),
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['top' => ['borderStyle' => Border::BORDER_THICK, 'color' => ['rgb' => $accent]]],
        ]);
        $sheet->getStyle("{$c1}{$v}:{$c2}{$v}")->applyFromArray([
            'font'      => ['size' => $valueSize, 'bold' => true, 'color' => ['rgb' => $accent]],
            'fill'      => $this->xlFill('F1F5F9'),
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(18);
        $sheet->getRowDimension($v)->setRowHeight(34);
    }

    private function xlPrint(Worksheet $sheet, int $repeatFrom, int $repeatTo, string $footer): void
    {
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4)
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0)
            ->setRowsToRepeatAtTopByStartAndEnd($repeatFrom, $repeatTo);
        $sheet->getPageSetup()->setHorizontalCentered(true);
        $sheet->getPageMargins()->setTop(0.5)->setBottom(0.6)->setLeft(0.4)->setRight(0.4);
        $sheet->getHeaderFooter()->setOddFooter("&L&8{$footer}&R&8Halaman &P dari &N");
    }

    /* ---------- SHEET: DAFTAR MESIN ---------- */
    private function xlSheetTypes(Worksheet $s, Collection $types, Request $request): void
    {
        $s->setTitle('Daftar Mesin');
        $s->getTabColor()->setRGB('1D4ED8');
        $s->setShowGridlines(false);
        $s->getSheetView()->setZoomScale(90);

        $heads = [
            'No', 'Nama Alat', 'Qty', 'Merk', 'No. Kontrol', 'Model / Type', 'Electric',
            'Negara Pembuat', 'Tahun', 'Start Ops', 'Supplier', 'Active', 'Repair',
            'Second Tier', 'Kontak Person', 'Keterangan', 'Panel Monitor KWH',
        ];
        $widths = [6, 28, 8, 18, 30, 22, 14, 18, 9, 10, 24, 9, 9, 18, 18, 30, 20];
        $last   = Coordinate::stringFromColumnIndex(count($heads)); // Q

        foreach ($widths as $i => $w) {
            $s->getColumnDimensionByColumn($i + 1)->setWidth($w);
        }

        $filters = collect($request->only('nama_alat', 'merk', 'negara_pembuat', 'panel_monitor_kwh', 'search'))
            ->filter()
            ->map(fn ($v, $k) => ucwords(str_replace('_', ' ', $k)) . ': ' . $v)
            ->implode('  |  ');

        $this->xlBanner(
            $s,
            'DAFTAR INVENTARIS MESIN',
            'Diexport ' . now()->translatedFormat('d F Y'),
            $last
        );

        /* kartu ringkasan (baris 4-5) */
        $this->xlCard($s, 'A4', 'C4', 'JENIS MESIN', $types->count(), '1D4ED8');
        $this->xlCard($s, 'D4', 'F4', 'TOTAL UNIT', (int) $types->sum('machines_count'), '6D28D9');
        $this->xlCard($s, 'G4', 'J4', 'SUPPLIER ACTIVE', $types->where('supplier_active', true)->count(), '059669');
        $this->xlCard($s, 'K4', 'M4', 'SUPPLIER REPAIR', $types->where('supplier_repair', true)->count(), 'D97706');
        $this->xlCard($s, 'N4', 'Q4', 'FILTER', $filters ?: 'Semua data', '475569', 9);
        $s->getRowDimension(6)->setRowHeight(10);

        /* header kelompok (baris 7) + header kolom (baris 8) */
        $groups = [
            ['A', 'E', 'IDENTITAS', '0B1A4D', '1E3A8A'],
            ['F', 'J', 'SPESIFIKASI', '4C1D95', '6D28D9'],
            ['K', 'O', 'SUPPLIER', '065F46', '059669'],
            ['P', 'Q', 'LAINNYA', '334155', '64748B'],
        ];
        foreach ($groups as [$a, $b, $label, $dark, $mid]) {
            $s->setCellValue("{$a}7", $label);
            $s->mergeCells("{$a}7:{$b}7");
            $s->getStyle("{$a}7:{$b}7")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 9, 'color' => ['rgb' => 'FFFFFF']],
                'fill'      => $this->xlFill($dark),
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders'   => ['right' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'FFFFFF']]],
            ]);
            $s->getStyle("{$a}8:{$b}8")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
                'fill'      => $this->xlFill($mid),
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                    'wrapText'   => true,
                ],
                'borders'   => ['right' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'FFFFFF']]],
            ]);
        }
        $s->fromArray($heads, null, 'A8');
        $s->getRowDimension(7)->setRowHeight(18);
        $s->getRowDimension(8)->setRowHeight(30);

        /* isi data */
        $first = 9;
        $r     = $first;

        if ($types->isEmpty()) {
            $s->setCellValue("A{$r}", 'Tidak ada data yang cocok dengan filter.');
            $s->mergeCells("A{$r}:{$last}{$r}");
            $s->getStyle("A{$r}")->applyFromArray([
                'font'      => ['italic' => true, 'color' => ['rgb' => '94A3B8']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $s->getRowDimension($r)->setRowHeight(34);
            $r++;
        }

        foreach ($types as $i => $t) {
            $s->fromArray([
                $i + 1, $t->nama_alat, (int) $t->machines_count, $t->merk, $t->no_kontrol_raw,
                $t->model_type, $t->electric_consumption, $t->negara_pembuat, $t->tahun_pembuatan,
                $t->start_operasional, $t->supplier_name,
                $t->supplier_active ? 'Ya' : '-', $t->supplier_repair ? 'Ya' : '-',
                $t->secondtier, null, $t->keterangan, $t->panel_monitor_kwh,
            ], null, "A{$r}");

            // kontak sebagai teks supaya angka 0 di depan tidak hilang
            $s->setCellValueExplicit("O{$r}", (string) $t->kontak_person, DataType::TYPE_STRING);

            if ($i % 2 === 1) {
                $s->getStyle("A{$r}:{$last}{$r}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F8FAFC');
            }

            // badge status supplier
            if ($t->supplier_active) {
                $s->getStyle("L{$r}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '047857']],
                    'fill' => $this->xlFill('D1FAE5'),
                ]);
            }
            if ($t->supplier_repair) {
                $s->getStyle("M{$r}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'B45309']],
                    'fill' => $this->xlFill('FEF3C7'),
                ]);
            }

            $s->getRowDimension($r)->setRowHeight(22);
            $r++;
        }

        $end = $r - 1;

        /* baris total */
        $tot = $r;
        $s->setCellValue("A{$tot}", 'TOTAL');
        $s->mergeCells("A{$tot}:B{$tot}");
        $s->setCellValue("C{$tot}", "=SUM(C{$first}:C{$end})");
        $s->setCellValue("D{$tot}", $types->count() . ' jenis mesin  ·  ' . (int) $types->sum('machines_count') . ' unit');
        $s->mergeCells("D{$tot}:{$last}{$tot}");
        $s->getStyle("A{$tot}:{$last}{$tot}")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => $this->xlFill('0B1A4D'),
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $s->getStyle("D{$tot}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setIndent(1);
        $s->getRowDimension($tot)->setRowHeight(26);

        /* gaya isi tabel */
        $s->getStyle("A{$first}:{$last}{$end}")->applyFromArray([
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $s->getStyle("A{$first}:A{$end}")->getFont()->setBold(true)->getColor()->setRGB('94A3B8');
        $s->getStyle("B{$first}:B{$end}")->getFont()->setBold(true)->getColor()->setRGB('0F172A');
        $s->getStyle("C{$first}:C{$end}")->getFont()->setBold(true)->getColor()->setRGB('1D4ED8');
        $s->getStyle("E{$first}:E{$end}")->getFont()->setName('Consolas')->setSize(9);

        foreach (['A', 'C', 'I', 'J', 'L', 'M'] as $col) {
            $s->getStyle("{$col}{$first}:{$col}{$end}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }
        foreach (['B', 'D', 'E', 'F', 'G', 'H', 'K', 'N', 'O', 'P', 'Q'] as $col) {
            $s->getStyle("{$col}{$first}:{$col}{$end}")->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_LEFT)->setIndent(1);
        }
        $s->getStyle("I{$first}:J{$end}")->getNumberFormat()->setFormatCode('0');
        $s->getStyle("P{$first}:P{$end}")->getAlignment()->setWrapText(true);

        $s->freezePane('C9');
        if ($types->isNotEmpty()) {
            $s->setAutoFilter("A8:{$last}{$end}");
        }

        $this->xlPrint($s, 7, 8, 'Daftar Inventaris Mesin');
    }

    /* ---------------------------------------------------------------
     | PRINT QR
     --------------------------------------------------------------- */
    public function printBarcodes(Request $request)
    {
        $data = $request->validate([
            'type_id' => 'nullable|integer',
            'ids'     => 'nullable|array',
            'ids.*'   => 'integer',
        ]);

        abort_if(empty($data['type_id']) && empty($data['ids']), 422, 'Tidak ada unit yang dipilih.');

        $machines = Machine::with('type')
            ->when(!empty($data['type_id']), fn ($q) => $q->where('machine_type_id', $data['type_id']))
            ->when(!empty($data['ids']), fn ($q) => $q->whereIn('id', $data['ids']))
            ->orderBy('no_kontrol')
            ->get();

        return Inertia::render('Machines/PrintBarcodes', ['machines' => $machines]);
    }

    public function printAll(Request $request)
    {
        $machines = Machine::with('type:id,nama_alat,merk')
            ->whereIn('machine_type_id', $this->typeQuery($request)->select('machine_types.id'))
            ->orderBy('no_kontrol')
            ->get();

        return Inertia::render('Machines/PrintBarcodes', ['machines' => $machines]);
    }
}