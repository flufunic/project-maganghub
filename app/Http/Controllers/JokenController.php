<?php

namespace App\Http\Controllers;

use App\Models\Joken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Exports\JokenExport;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class JokenController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q'));

        $jokens = Joken::withCount('rows')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('no_registrasi', 'like', "%{$q}%")
                      ->orWhere('judul', 'like', "%{$q}%")
                      ->orWhere('model', 'like', "%{$q}%")
                      ->orWhere('part_name', 'like', "%{$q}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Joken/Index', [
            'jokens'  => $jokens,
            'filters' => ['q' => $q],
        ]);
    }

    public function create()
    {
        return Inertia::render('Joken/Form', ['joken' => null]);
    }

    public function store(Request $request)
    {
        $this->validasi($request, null);

        $joken = new Joken();
        $this->simpan($request, $joken);

        return redirect()->route('joken.show', $joken)->with('success', 'Joken berhasil dibuat.');
    }

    public function show(Joken $joken)
    {
        $joken->load('rows');

        return Inertia::render('Joken/Show', ['joken' => $joken]);
    }

    public function edit(Joken $joken)
    {
        $joken->load('rows');

        return Inertia::render('Joken/Form', ['joken' => $joken]);
    }

    public function update(Request $request, Joken $joken)
    {
        $this->validasi($request, $joken);
        $this->simpan($request, $joken);

        return redirect()->route('joken.show', $joken)->with('success', 'Joken berhasil diperbarui.');
    }

    /**
     * Soft delete: di aplikasi hilang, di database tetap ada (deleted_at terisi).
     * Foto sengaja TIDAK dihapus dari storage supaya data bisa dipulihkan lewat SQL:
     *   UPDATE jokens SET deleted_at = NULL WHERE id = ...;
     */
    public function destroy(Joken $joken)
    {
        $nomor = $joken->no_registrasi;
        $joken->delete();

        return redirect()->route('joken.index')->with('success', "Joken {$nomor} berhasil dihapus.");
    }

    /* ----------------------------------------------------------- */

    private function validasi(Request $request, ?Joken $joken): void
    {
        $request->validate([
            'judul'         => 'required|string|max:255',
            // data yang sudah dihapus (soft delete) tidak dihitung, jadi nomornya bisa dipakai lagi
            'no_registrasi' => [
                'required', 'string', 'max:100',
                Rule::unique('jokens', 'no_registrasi')->whereNull('deleted_at')->ignore($joken?->id),
            ],
            'line'          => 'nullable|string|max:100',
            'model'         => 'nullable|string|max:100',
            'pic'           => 'nullable|string|max:100',
            'no_line'       => 'nullable|string|max:100',
            'supplier'      => 'nullable|string|max:150',
            'part_name'     => 'nullable|string|max:255',
            'part_number'   => 'nullable|string|max:150',
            'mfg_location'  => 'nullable|string|max:150',

            'columns'         => 'required|array|min:1|max:50',
            'columns.*.uid'   => 'required|alpha_num|max:40|distinct',
            'columns.*.label' => 'required|string|max:100',
            'columns.*.type'  => 'required|in:text,image',

            'rows'                  => 'required|array|min:1',
            'rows.*.qcpc'           => 'nullable|string|max:100',
            'rows.*.proses'         => 'nullable|string',
            'rows.*.model_material' => 'nullable|string|max:150',
            'rows.*.type_mesin'     => 'nullable|string|max:150',
            'rows.*.values'         => 'nullable|array',
            'rows.*.values.*'       => 'nullable|string|max:500',
            'rows.*.files'          => 'nullable|array',
            'rows.*.files.*'        => 'nullable|image|max:4096',
        ], [
            'no_registrasi.unique' => 'No. Registrasi sudah dipakai joken lain.',
        ], [
            'columns.*.label' => 'nama kolom',
            'rows.*.files.*'  => 'foto',
        ]);
    }

    private function simpan(Request $request, Joken $joken): void
    {
        $kolom = collect($request->input('columns'))
            ->map(fn ($c) => ['uid' => $c['uid'], 'label' => $c['label'], 'type' => $c['type']])
            ->values()
            ->all();

        $oldPaths = $joken->exists ? $this->semuaGambar($joken->load('rows')) : [];

        $keep = DB::transaction(function () use ($request, $joken, $kolom, $oldPaths) {
            $keep = [];

            $joken->fill($request->only([
                'judul', 'no_registrasi', 'line', 'model', 'pic',
                'no_line', 'supplier', 'part_name', 'part_number', 'mfg_location',
            ]));
            $joken->kolom = $kolom;
            $joken->save();

            $joken->rows()->delete();

            $urutan = 1;
            foreach ($request->input('rows') as $i => $r) {
                $nilai = [];

                foreach ($kolom as $k) {
                    $uid = $k['uid'];

                    if ($k['type'] === 'image') {
                        $file = $request->file("rows.$i.files.$uid");

                        if ($file) {
                            $path = $file->store('joken', 'public');
                        } else {
                            $path = $r['values'][$uid] ?? null;
                            if (!in_array($path, $oldPaths, true)) {
                                $path = null;
                            }
                        }

                        if ($path) {
                            $keep[] = $path;
                        }
                        $nilai[$uid] = $path;
                    } else {
                        $nilai[$uid] = $r['values'][$uid] ?? null;
                    }
                }

                $joken->rows()->create([
                    'urutan'         => $urutan++,
                    'qcpc'           => $r['qcpc'] ?? null,
                    'proses'         => $r['proses'] ?? null,
                    'model_material' => $r['model_material'] ?? null,
                    'type_mesin'     => $r['type_mesin'] ?? null,
                    'nilai'          => $nilai,
                ]);
            }

            return $keep;
        });

        // foto yang diganti/dihapus saat edit dibersihkan dari storage
        Storage::disk('public')->delete(array_values(array_diff($oldPaths, $keep)));
    }

    private function semuaGambar(Joken $joken): array
    {
        $imageUids = collect($joken->kolom ?? [])->where('type', 'image')->pluck('uid')->all();
        $paths = [];

        foreach ($joken->rows as $row) {
            foreach ($imageUids as $uid) {
                if (!empty($row->nilai[$uid])) {
                    $paths[] = $row->nilai[$uid];
                }
            }
        }

        return $paths;
    }
    public function export(Joken $joken)
    {
        $joken->load('rows');
        $data     = $joken->toArray();
        $filename = 'Joken-' . Str::slug($joken->no_registrasi) . '.xlsx';

        return response()->streamDownload(function () use ($data) {
            $book = (new JokenExport($data))->build();
            (new Xlsx($book))->save('php://output');
            $book->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}