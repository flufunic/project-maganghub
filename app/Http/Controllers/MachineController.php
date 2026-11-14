<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MachineType;
use App\Support\ControlNumberParser;
use App\Support\MachineImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

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
            'nama_alat.required'      => 'Nama alat wajib diisi.',
            'no_kontrol_raw.required' => 'No. kontrol wajib diisi.',
            'no_kontrol_raw.unique'   => 'No. kontrol ini sudah dipakai jenis mesin lain.',
            'tahun_pembuatan.between' => 'Tahun tidak valid.',
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