<?php

namespace App\Http\Controllers;

use App\Exports\JokenExport;
use App\Models\Joken;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class JokenController extends Controller
{
    // Maksimal foto per sel. Samakan dengan MAKS_FOTO di Form.jsx
    private const MAKS_FOTO = 2;

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

    /* ----------------------------------------------------------- */

    private function validasi(Request $request, ?Joken $joken): void
    {
        $rules = [
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

            'rows'                   => 'required|array|min:1',
            'rows.*.qcpc'            => 'nullable|string|max:100',
            'rows.*.proses'          => 'nullable|string',
            'rows.*.model_material'  => 'nullable|string|max:150',
            'rows.*.type_mesin'      => 'nullable|string|max:150',
            'rows.*.values'          => 'nullable|array',
            'rows.*.files'           => 'nullable|array',
        ];

        $attributes = ['columns.*.label' => 'nama kolom'];

        // Aturan nilai/foto dibuat per kolom, karena kolom teks (string) dan foto (array) beda bentuknya.
        $kolom = collect($request->input('columns', []))
            ->filter(fn ($c) => is_array($c) && isset($c['uid']) && is_string($c['uid']) && ctype_alnum($c['uid']))
            ->values();

        foreach ($kolom as $c) {
            $uid = $c['uid'];

            if (($c['type'] ?? '') === 'image') {
                $rules["rows.*.values.$uid"]   = 'nullable|array|max:' . self::MAKS_FOTO;
                $rules["rows.*.values.$uid.*"] = 'nullable|string|max:500';
                $rules["rows.*.files.$uid"]    = 'nullable|array|max:' . self::MAKS_FOTO;
                $rules["rows.*.files.$uid.*"]  = 'image|max:4096';
                $attributes["rows.*.files.$uid.*"] = 'foto';
            } else {
                $rules["rows.*.values.$uid"] = 'nullable|string|max:500';
            }
        }

        $validator = Validator::make($request->all(), $rules, [
            'no_registrasi.unique' => 'No. Registrasi sudah dipakai joken lain.',
        ], $attributes);

        // Foto lama yang dipertahankan + foto baru tidak boleh melebihi batas per sel.
        $validator->after(function ($v) use ($request, $kolom) {
            foreach ((array) $request->input('rows', []) as $i => $r) {
                foreach ($kolom as $c) {
                    if (($c['type'] ?? '') !== 'image') {
                        continue;
                    }

                    $uid  = $c['uid'];
                    $lama = count(Arr::wrap(data_get($r, "values.$uid")));
                    $baru = count(Arr::wrap($request->file("rows.$i.files.$uid")));

                    if ($lama + $baru > self::MAKS_FOTO) {
                        $v->errors()->add(
                            "rows.$i.files.$uid",
                            'Baris ' . ($i + 1) . ', kolom "' . ($c['label'] ?? '') . '": maksimal ' . self::MAKS_FOTO . ' foto per sel.'
                        );
                    }
                }
            }
        });

        $validator->validate();
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
                        // 1) foto lama yang dipertahankan (hanya path yang memang milik joken ini)
                        $paths = collect(Arr::wrap($r['values'][$uid] ?? []))
                            ->filter(fn ($p) => is_string($p) && in_array($p, $oldPaths, true))
                            ->unique()
                            ->values()
                            ->all();

                        // 2) foto baru yang diupload
                        foreach (Arr::wrap($request->file("rows.$i.files.$uid")) as $file) {
                            if ($file) {
                                $paths[] = $file->store('joken', 'public');
                            }
                        }

                        $keep        = array_merge($keep, $paths);
                        $nilai[$uid] = $paths ?: null;   // disimpan sebagai array path
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

    /** Semua path foto milik joken ini. Nilai lama (string) maupun baru (array) sama-sama dibaca. */
    private function semuaGambar(Joken $joken): array
    {
        $imageUids = collect($joken->kolom ?? [])->where('type', 'image')->pluck('uid')->all();
        $paths = [];

        foreach ($joken->rows as $row) {
            $nilai = $row->nilai ?? [];

            foreach ($imageUids as $uid) {
                foreach (Arr::wrap($nilai[$uid] ?? []) as $p) {
                    if (is_string($p) && $p !== '') {
                        $paths[] = $p;
                    }
                }
            }
        }

        return $paths;
    }
}