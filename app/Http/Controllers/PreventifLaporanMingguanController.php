<?php

namespace App\Http\Controllers;

use App\Exports\LaporanMingguanExport;
use App\Models\PreventifLaporanItem;
use App\Models\PreventifLaporanMingguan;
use App\Models\PreventifMesin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PreventifLaporanMingguanController extends Controller
{
    private const NAMA_BULAN = [
        1 => 'Januari',
        2 => 'Februari',
        3 => 'Maret',
        4 => 'April',
        5 => 'Mei',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'Agustus',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Desember',
    ];

    private const DISK = 'public';

    // =====================================================
    // HALAMAN LAPORAN / FORM
    // =====================================================

    public function index(Request $request)
    {
        $tahun = (int) $request->input('tahun', now()->year);
        $bulan = (int) $request->input('bulan', now()->month);

        $daftarWeek = PreventifLaporanMingguan::daftarWeek(
            $tahun,
            $bulan
        );

        $default = $daftarWeek[0];

        if ($tahun === now()->year && $bulan === now()->month) {
            $weekIni = min(
                5,
                intdiv(now()->day - 1, 7) + 1
            );

            $default = in_array(
                $weekIni,
                $daftarWeek,
                true
            )
                ? $weekIni
                : $default;
        }

        $week = (int) $request->input('week', $default);

        if (!in_array($week, $daftarWeek, true)) {
            $week = $daftarWeek[0];
        }

        $laporan = PreventifLaporanMingguan::firstOrCreate(
            [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'week' => $week,
            ],
            [
                'status' => 'draft',
            ]
        );

        $rentang = PreventifLaporanMingguan::rentang(
            $tahun,
            $bulan,
            $week
        );

        $hitung = $this->hitungBagian1(
            $tahun,
            $bulan,
            $rentang['hari']
        );

        /*
         * Kalau masih draft / ditolak, data mesin disinkronkan.
         * Kalau sudah dikirim, jangan dibuat ulang supaya
         * laporan yang dikirim tetap menjadi riwayat/snapshot.
         */
        if (in_array($laporan->status, ['draft', 'ditolak'], true)) {
            $this->sinkron($laporan, $hitung);
        }

        $items = $laporan
            ->items()
            ->orderBy('bagian')
            ->orderBy('urutan')
            ->get();

        return Inertia::render('LaporanMingguan/Index', [
            'tahun' => $tahun,
            'bulan' => $bulan,
            'week' => $week,
            'daftarWeek' => $daftarWeek,
            'namaBulan' => self::NAMA_BULAN,

            'rentangLabel' =>
                $rentang['awal']
                . '-'
                . $rentang['akhir']
                . ' '
                . self::NAMA_BULAN[$bulan]
                . ' '
                . $tahun,

            'laporan' => [
                'id' => $laporan->id,
                'status' => $laporan->status,
                'alasan_penolakan' => $laporan->alasan_penolakan,
                'dikirim_pada' => $laporan->dikirim_pada?->translatedFormat('d F Y'),
                'disetujui_pada' => $laporan->disetujui_pada?->translatedFormat('d F Y'),
            ],

            'bagian1' => $this->bagian1Untuk(
                $laporan,
                $hitung,
                $items
            ),

            'bagian2' => $items
                ->where('bagian', 2)
                ->map(fn ($item) => $this->itemKeArray($item))
                ->values(),

            'bagian3' => $items
                ->where('bagian', 3)
                ->map(fn ($item) => $this->itemKeArray($item))
                ->values(),

            'revisis' => $laporan
                ->revisis()
                ->latest()
                ->limit(15)
                ->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'keterangan' => $r->keterangan,
                    'waktu' => $r->created_at
                        ->translatedFormat('d F Y'),
                ]),

            'bisaPersetujuan' => $this->adalahPimpinan($request),

            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    // =====================================================
    // RIWAYAT LAPORAN
    // =====================================================

    public function riwayat(Request $request)
    {
        $tahun = (int) $request->input(
            'tahun',
            now()->year
        );

        $bulan = $request->input('bulan');

        // Pastikan bulan yang diterima valid (1–12)
        $bulan = is_numeric($bulan) &&
            (int) $bulan >= 1 &&
            (int) $bulan <= 12
                ? (int) $bulan
                : '';

        /*
        * Ambil item laporan sekaligus.
        *
        * Tidak perlu relasi tambahan ke PreventifMesin,
        * karena nama item sudah tersimpan di field "mesin".
        */
        $query = PreventifLaporanMingguan::query()
            ->with([
                'items' => function ($q) {
                    $q->select([
                        'id',
                        'laporan_id',
                        'bagian',
                        'preventif_mesin_id',
                        'mesin',
                        'urutan',
                    ])
                    ->whereIn('bagian', [1, 2])
                    ->orderBy('urutan')
                    ->orderBy('id');
                },
            ])
            ->withCount('items')
            ->where('tahun', $tahun);

        /*
        * FILTER BULAN
        *
        * Jika bulan kosong, tampilkan semua bulan.
        * Jika bulan dipilih, tampilkan bulan tersebut saja.
        */
        if ($bulan !== '') {
            $query->where('bulan', $bulan);
        }

        $query
            ->orderByDesc('bulan')
            ->orderByDesc('week');

        /*
        * PAGINATION
        *
        * withQueryString() mempertahankan filter
        * tahun dan bulan ketika pindah halaman.
        */
        $laporan = $query
            ->paginate(15)
            ->withQueryString();

        /*
        * Tambahkan data yang dibutuhkan oleh halaman Riwayat:
        *
        * - periode_tanggal
        * - hari_kerja
        * - item_preventif
        */
        $laporan->through(function ($item) {

            $rentang = PreventifLaporanMingguan::rentang(
                (int) $item->tahun,
                (int) $item->bulan,
                (int) $item->week
            );

            // Format tanggal periode
            if ($rentang) {
                $item->periode_tanggal =
                    $rentang['awal']
                    . ' - '
                    . $rentang['akhir']
                    . ' '
                    . self::NAMA_BULAN[$item->bulan];

                $item->hari_kerja = $rentang['hari'];
            } else {
                $item->periode_tanggal = null;
                $item->hari_kerja = [];
            }

            /*
            * Ambil nama item preventif dari field "mesin".
            *
            * Gunakan unique() supaya item yang sama
            * dari bagian 1 dan 2 tidak muncul dua kali.
            */
            $item->item_preventif = $item->items
                ->pluck('mesin')
                ->filter(function ($nama) {
                    return filled($nama);
                })
                ->map(function ($nama) {
                    return trim($nama);
                })
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            return [
                'id' => $item->id,

                'tahun' => $item->tahun,
                'bulan' => $item->bulan,
                'nama_bulan' => self::NAMA_BULAN[$item->bulan] ?? '-',

                'week' => $item->week,

                'periode_tanggal' => $item->periode_tanggal,
                'hari_kerja' => $item->hari_kerja,

                'items_count' => $item->items_count,
                'item_preventif' => $item->item_preventif,

                'status' => $item->status,

                'dikirim_pada' =>
                    $item->dikirim_pada?->translatedFormat('d F Y'),

                'disetujui_pada' =>
                    $item->disetujui_pada?->translatedFormat('d F Y'),

                'alasan_penolakan' =>
                    $item->alasan_penolakan,
            ];
        });

        return Inertia::render('LaporanMingguan/Riwayat', [
            'tahun' => $tahun,

            // Kirim bulan terpilih ke React
            'bulan' => $bulan,

            'laporan' => $laporan,

            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }


    // =====================================================
    // SIMPAN LAPORAN
    // =====================================================

    public function simpan(
        Request $request,
        PreventifLaporanMingguan $laporan
    ) {
        abort_if(
            $laporan->status === 'disetujui',
            403,
            'Laporan sudah disetujui dan tidak bisa diubah.'
        );

        /*
         * Data item sebenarnya sudah tersimpan ketika user
         * mengubah field / upload foto.
         *
         * Tombol Simpan ini berfungsi sebagai konfirmasi
         * bahwa draft laporan sudah selesai disimpan.
         */
        if ($laporan->status === 'ditolak') {
            $laporan->update([
                'status' => 'draft',
                'alasan_penolakan' => null,
                'snapshot' => null,
            ]);
        }

        return redirect()
            ->route('laporan-mingguan.index')
            ->with(
                'success',
                'Laporan berhasil disimpan sebagai draft.'
            );
    }

    // =====================================================
    // UPDATE ITEM
    // =====================================================

    public function updateItem(
        Request $request,
        PreventifLaporanItem $item
    ) {
        $laporan = $item->laporan;

        abort_if(
            $laporan->terkunci(),
            403,
            'Laporan sudah disetujui.'
        );

        $data = $request->validate([
            'mesin' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'aktivitas' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'penanggulangan' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'komentar' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ]);

        $item->update($data);

        if ($item->wasChanged()) {
            $this->catatRevisi(
                $laporan,
                'Bagian ' . $item->bagian . ' diubah: '
                    . ($item->mesin ?: 'item baru'),
                $request
            );
        }

        return back();
    }

    // =====================================================
    // TAMBAH TEMUAN
    // =====================================================

    public function storeTemuan(
        Request $request,
        PreventifLaporanMingguan $laporan
    ) {
        abort_if(
            $laporan->terkunci(),
            403,
            'Laporan sudah disetujui.'
        );

        PreventifLaporanItem::create([
            'laporan_id' => $laporan->id,
            'bagian' => 3,
            'urutan' => (
                (int) $laporan
                    ->items()
                    ->where('bagian', 3)
                    ->max('urutan')
            ) + 1,
        ]);

        $this->catatRevisi(
            $laporan,
            'Baris temuan ditambahkan',
            $request
        );

        return back();
    }

    // =====================================================
    // HAPUS TEMUAN
    // =====================================================

    public function destroyItem(
        Request $request,
        PreventifLaporanItem $item
    ) {
        $laporan = $item->laporan;

        abort_if(
            $laporan->terkunci(),
            403,
            'Laporan sudah disetujui.'
        );

        abort_unless(
            $item->bagian === 3,
            422,
            'Hanya baris temuan yang bisa dihapus.'
        );

        foreach (
            [$item->foto_before, $item->foto_after]
            as $path
        ) {
            if ($path) {
                Storage::disk(self::DISK)->delete($path);
            }
        }

        $item->delete();

        $this->catatRevisi(
            $laporan,
            'Baris temuan dihapus',
            $request
        );

        return back();
    }

    // =====================================================
    // UPLOAD FOTO
    // =====================================================

    
    public function uploadFoto(
        Request $request,
        PreventifLaporanItem $item
    ) {
        $laporan = $item->laporan;

        abort_if(
            $laporan->terkunci(),
            403,
            'Laporan sudah disetujui.'
        );

        $request->validate([
            'jenis' => [
                'required',
                'in:before,after',
            ],

            'foto' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png',
                'max:10240',
            ],
        ], [
            'foto.required' => 'Foto wajib dipilih.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.mimes' => 'Format foto harus JPG, JPEG, atau PNG.',
            'foto.max' => 'Ukuran foto maksimal 10 MB.',
        ]);

        // Bagian 3 hanya menggunakan foto_before.
        $kolom = (
            $request->jenis === 'after'
            && $item->bagian === 2
        )
            ? 'foto_after'
            : 'foto_before';

        // Simpan foto baru terlebih dahulu.
        $pathBaru = $request
            ->file('foto')
            ->store(
                'laporan-mingguan/'
                . $laporan->tahun
                . '/'
                . $laporan->bulan,
                self::DISK
            );

        // Jika penyimpanan berhasil, hapus foto lama.
        $pathLama = $item->{$kolom};

        $item->update([
            $kolom => $pathBaru,
        ]);

        if ($pathLama) {
            Storage::disk(self::DISK)->delete($pathLama);
        }

        $this->catatRevisi(
            $laporan,
            'Foto ' . $request->jenis . ' diupload/diganti: '
                . ($item->mesin ?: 'temuan'),
            $request
        );

        return back()->with(
            'success',
            'Foto berhasil diupload.'
        );
    }

    // =====================================================
    // HAPUS FOTO
    // =====================================================
    
    public function hapusFoto(
        Request $request,
        PreventifLaporanItem $item
    ) {
        $laporan = $item->laporan;

        abort_if(
            $laporan->terkunci(),
            403,
            'Laporan sudah disetujui dan tidak bisa diubah.'
        );

        $data = $request->validate([
            'jenis' => [
                'required',
                'in:before,after',
            ],
        ]);

        // Foto hanya tersedia pada bagian 2 dan 3.
        abort_unless(
            in_array($item->bagian, [2, 3], true),
            422,
            'Item ini tidak memiliki foto.'
        );

        // Bagian 3 hanya memiliki foto_before.
        if ($data['jenis'] === 'after' && $item->bagian !== 2) {
            abort(
                422,
                'Foto after hanya tersedia untuk laporan preventif.'
            );
        }

        $kolom = $data['jenis'] === 'after'
            ? 'foto_after'
            : 'foto_before';

        $path = $item->{$kolom};

        if (!$path) {
            return back()->with(
                'error',
                'Foto belum tersedia atau sudah dihapus.'
            );
        }

        // Hapus file fisik jika masih tersedia.
        if (Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }

        // Kosongkan kolom foto di database.
        $item->update([
            $kolom => null,
        ]);

        // Catat aktivitas perubahan.
        $this->catatRevisi(
            $laporan,
            'Foto ' . $data['jenis'] . ' dihapus: '
                . ($item->mesin ?: 'temuan'),
            $request
        );

        return back()->with(
            'success',
            'Foto berhasil dihapus.'
        );
    }


    // =====================================================
    // TAMPILKAN FOTO
    // =====================================================

    public function foto(
        PreventifLaporanItem $item,
        string $jenis
    ) {
        abort_unless(
            in_array($jenis, ['before', 'after']),
            404
        );

        $path = $jenis === 'before'
            ? $item->foto_before
            : $item->foto_after;

        abort_unless(
            $path
            && Storage::disk(self::DISK)->exists($path),
            404
        );

        $filePath = Storage::disk(self::DISK)->path($path);

        abort_unless(
            file_exists($filePath),
            404
        );

        return response()->file($filePath);
    }

    // =====================================================
    // ALUR PERSETUJUAN
    // =====================================================

    public function kirim(
        Request $request,
        PreventifLaporanMingguan $laporan
    ) {
        abort_if(
            $laporan->sudahDikirim(),
            422,
            'Laporan sudah dikirim.'
        );

        $rentang = PreventifLaporanMingguan::rentang(
            $laporan->tahun,
            $laporan->bulan,
            $laporan->week
        );

        $hitung = $this->hitungBagian1(
            $laporan->tahun,
            $laporan->bulan,
            $rentang['hari']
        );

        $laporan->update([
            'status' => 'menunggu',
            'snapshot' => $hitung,
            'dikirim_oleh' => $request->user()->id,
            'dikirim_pada' => now(),
            'alasan_penolakan' => null,
        ]);

        return back()->with(
            'success',
            'Laporan W' . $laporan->week
                . ' berhasil dikirim ke Pimpinan.'
        );
    }

    public function periksa(
        Request $request,
        PreventifLaporanMingguan $laporan
    ) {
        $this->wajibPimpinan($request);

        abort_unless(
            $laporan->status === 'menunggu',
            422
        );

        $laporan->update([
            'status' => 'diperiksa',
        ]);

        return back()->with(
            'success',
            'Laporan ditandai sedang diperiksa.'
        );
    }

    public function setujui(
        Request $request,
        PreventifLaporanMingguan $laporan
    ) {
        $this->wajibPimpinan($request);

        abort_unless(
            in_array(
                $laporan->status,
                ['menunggu', 'diperiksa'],
                true
            ),
            422
        );

        $laporan->update([
            'status' => 'disetujui',
            'disetujui_oleh' => $request->user()->id,
            'disetujui_pada' => now(),
        ]);

        return back()->with(
            'success',
            'Laporan disetujui.'
        );
    }

    public function tolak(
        Request $request,
        PreventifLaporanMingguan $laporan
    ) {
        $this->wajibPimpinan($request);

        abort_unless(
            in_array(
                $laporan->status,
                ['menunggu', 'diperiksa'],
                true
            ),
            422
        );

        $data = $request->validate([
            'alasan' => [
                'required',
                'string',
                'max:1000',
            ],
        ]);

        $laporan->update([
            'status' => 'ditolak',
            'alasan_penolakan' => $data['alasan'],
            'snapshot' => null,
        ]);

        return back()->with(
            'success',
            'Laporan ditolak.'
        );
    }

    // =====================================================
    // EXPORT EXCEL
    // =====================================================

    public function export(Request $request)
    {
        $tahun = (int) $request->input(
            'tahun',
            now()->year
        );

        $bulan = (int) $request->input(
            'bulan',
            now()->month
        );

        $week = (int) $request->input('week', 1);

        $rentang = PreventifLaporanMingguan::rentang(
            $tahun,
            $bulan,
            $week
        );

        abort_if($rentang === null, 404);

        $laporan = PreventifLaporanMingguan::where([
            'tahun' => $tahun,
            'bulan' => $bulan,
            'week' => $week,
        ])->firstOrFail();

        $hitung = $this->hitungBagian1(
            $tahun,
            $bulan,
            $rentang['hari']
        );

        $items = $laporan
            ->items()
            ->orderBy('bagian')
            ->orderBy('urutan')
            ->get();

        $bagian1 = $this->bagian1Untuk(
            $laporan,
            $hitung,
            $items
        );

        $judul =
            'LAPORAN PREVENTIF W' . $week
            . ' · '
            . $rentang['awal']
            . '-'
            . $rentang['akhir']
            . ' '
            . self::NAMA_BULAN[$bulan]
            . ' '
            . $tahun;

        return Excel::download(
            new LaporanMingguanExport(
                $judul,
                $bagian1,
                $items->where('bagian', 2)->values(),
                $items->where('bagian', 3)->values()
            ),
            'Laporan_Preventif_W'
                . $week
                . '_'
                . self::NAMA_BULAN[$bulan]
                . '_'
                . $tahun
                . '.xlsx'
        );
    }

    // =====================================================
    // HELPER
    // =====================================================

    private function hitungBagian1(
        int $tahun,
        int $bulan,
        array $hari
    ): array {
        $pertama = $hari[0];
        $terakhir = end($hari);

        $mesins = PreventifMesin::where(
            'is_hidden',
            false
        )
            ->with([
                'checklists' => fn ($q) =>
                    $q->whereDate('tanggal', '>=', $pertama)
                        ->whereDate('tanggal', '<=', $terakhir),

                'bulanans' => fn ($q) =>
                    $q->where('tahun', $tahun)
                        ->where('bulan', $bulan),
            ])
            ->orderBy('divisi')
            ->orderBy('no_item')
            ->get();

        $ctrl = app(
            PreventifMesinController::class
        );

        $hasil = [];

        foreach ($mesins as $pm) {

            $plan = array_values(
                array_intersect(
                    $ctrl->getTanggalPlanEfektif(
                        $pm,
                        $tahun,
                        $bulan
                    ),
                    $hari
                )
            );

            if (count($plan) === 0) {
                continue;
            }

            $byDate = $pm->checklists->keyBy(
                fn ($c) => substr(
                    (string) $c->tanggal,
                    0,
                    10
                )
            );

            $sudah = 0;

            foreach ($plan as $tgl) {
                $c = $byDate->get($tgl);

                if ($c && (bool) $c->status) {
                    $sudah++;
                }
            }

            $jumlah = count($plan);

            $nama =
                $pm->bulanans->first()?->item_preventif
                ?: $pm->getOriginal('item_preventif');

            $hasil[] = [
                'no' => $pm->no,
                'divisi' => $pm->divisi,
                'mesin' => $nama,
                'jumlah' => $jumlah,
                'sudah' => $sudah,
                'belum' => $jumlah - $sudah,
                'persen' => (int) round(
                    ($sudah / $jumlah) * 100
                ),
            ];
        }

        return $hasil;
    }

    private function sinkron(
        PreventifLaporanMingguan $laporan,
        array $hitung
    ): void {
        foreach ($hitung as $i => $row) {

            foreach ([1, 2] as $bagian) {

                PreventifLaporanItem::firstOrCreate(
                    [
                        'laporan_id' => $laporan->id,
                        'bagian' => $bagian,
                        'preventif_mesin_id' => $row['no'],
                    ],
                    [
                        'mesin' => $row['mesin'],
                        'urutan' => $i,
                    ]
                );
            }
        }

        PreventifLaporanItem::where(
            'laporan_id',
            $laporan->id
        )
            ->whereIn('bagian', [1, 2])
            ->whereNotIn(
                'preventif_mesin_id',
                array_column($hitung, 'no')
            )
            ->whereNull('aktivitas')
            ->whereNull('penanggulangan')
            ->whereNull('komentar')
            ->whereNull('foto_before')
            ->whereNull('foto_after')
            ->delete();
    }

    private function bagian1Untuk(
        PreventifLaporanMingguan $laporan,
        array $hitung,
        $items
    ): array {
        $dasar =
            ($laporan->sudahDikirim()
                && !empty($laporan->snapshot))
            ? $laporan->snapshot
            : $hitung;

        $komentar = $items
            ->where('bagian', 1)
            ->keyBy('preventif_mesin_id');

        return array_map(
            function ($row) use ($komentar) {

                $item = $komentar->get(
                    $row['no']
                );

                $row['item_id'] = $item?->id;
                $row['komentar'] = $item?->komentar;

                return $row;
            },
            $dasar
        );
    }

    private function itemKeArray(
        PreventifLaporanItem $item
    ): array {
        return [
            'id' => $item->id,
            'mesin' => $item->mesin,
            'aktivitas' => $item->aktivitas,
            'penanggulangan' => $item->penanggulangan,

            /*
             * Jangan lagi mengandalkan /storage/...
             * untuk preview browser.
             *
             * Kita pakai route controller khusus foto.
             */
            'foto_before_url' => $item->foto_before
                ? route(
                    'laporan-mingguan.foto',
                    [
                        'item' => $item->id,
                        'jenis' => 'before',
                    ]
                )
                : null,

            'foto_after_url' => $item->foto_after
                ? route(
                    'laporan-mingguan.foto',
                    [
                        'item' => $item->id,
                        'jenis' => 'after',
                    ]
                )
                : null,
        ];
    }

    private function catatRevisi(
        PreventifLaporanMingguan $laporan,
        string $keterangan,
        Request $request
    ): void {
        if (!in_array(
            $laporan->status,
            ['menunggu', 'diperiksa'],
            true
        )) {
            return;
        }

        $laporan->revisis()->create([
            'user_id' => $request->user()?->id,
            'keterangan' => $keterangan,
        ]);

        if ($laporan->status === 'diperiksa') {
            $laporan->update([
                'status' => 'menunggu',
            ]);
        }
    }

    private function adalahPimpinan(
        Request $request
    ): bool {
        return ($request->user()?->role ?? null)
            === 'pimpinan';
    }

    private function wajibPimpinan(
        Request $request
    ): void {
        abort_unless(
            $this->adalahPimpinan($request),
            403
        );
    }

    // =====================================================
    // HAPUS LAPORAN
    // =====================================================

    public function destroy(
        PreventifLaporanMingguan $laporan
    ) {
        abort_if(
            $laporan->status === 'disetujui',
            403,
            'Laporan yang sudah disetujui tidak dapat dihapus.'
        );

        $laporan->delete();

        return redirect()
            ->route('laporan-mingguan.index')
            ->with(
                'success',
                'Laporan mingguan berhasil dihapus.'
            );
    }
}