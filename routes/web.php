<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\PreventifMesinController;
use App\Http\Controllers\PreventifLaporanMingguanController;
use App\Http\Controllers\PimpinanController;
use App\Http\Controllers\CheckSheetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckSheetImportController;
use App\Http\Controllers\CheckSheetMonitoringController;
use App\Http\Controllers\CheckSheetBbmController;
use App\Http\Controllers\OverhaulSc2Controller;
use App\Http\Controllers\CheckSheetPengirimanController;
use App\Http\Controllers\CheckSheetPimpinanController;
use App\Http\Controllers\ScheduleBarisController;
use App\Http\Controllers\ScheduleZonaController;
use App\Http\Controllers\SchedulePreventifController;
use App\Http\Controllers\JokenController;
use App\Http\Controllers\RrfNotificationController;
use App\Http\Controllers\SopIkController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\RepairMtcController;
use App\Http\Controllers\Mtc\MtcRrfController;
use App\Http\Controllers\Mtc\MtcRrfExportController;
use App\Http\Controllers\CheckSheetNotificationController;
use App\Http\Controllers\PreventifDivisiController;
use App\Http\Controllers\DivisiController;
use App\Http\Controllers\PreventifChecksheetController;

/*
|--------------------------------------------------------------------------
| Halaman Publik
|--------------------------------------------------------------------------
*/

// Dashboard utama Preventif Mesin
Route::get('/', [
    PreventifMesinController::class,
    'welcome',
])->name('welcome');

// Login
Route::get('/login', [
    AuthController::class,
    'showLogin',
])->name('login');

Route::post('/login', [
    AuthController::class,
    'login',
])->middleware('throttle:5,1')
  ->name('login.store');

// Logout
Route::post('/logout', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return Inertia::location('/');
})->name('logout');

// Dashboard Overhaul SC2 -> sekarang jadi bagian halaman utama
Route::get('/overhaul-dashboard', function (Request $request) {
    return redirect()->route('welcome', array_filter([
        'tahun_overhaul' => $request->query('tahun'),
    ]));
})->name('overhaul-sc2.dashboard');

// Dashboard Check Sheet (publik)
Route::get('/check-sheet-dashboard', function (Request $request) {
    return redirect()->route('welcome', array_filter([
        'tahun_checksheet' => $request->query('tahun'),
    ]));
})->name('check-sheet.dashboard');


/*
|--------------------------------------------------------------------------
| Halaman Admin dan Pengguna yang Sudah Login
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin,pimpinan'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Preventif Mesin
    |--------------------------------------------------------------------------
    */

    Route::get('/preventif-mesin/export', [
        PreventifMesinController::class,
        'exportExcel',
    ])->name('preventif-mesin.export');

    Route::resource('/preventif-mesin', PreventifMesinController::class);

    Route::post('/preventif-mesin/{preventifMesin}/checklist', [
        PreventifMesinController::class,
        'storeChecklist',
    ])->name('preventif-mesin.checklist.store');

    Route::put('/preventif-mesin/{preventifMesin}/plan', [
        PreventifMesinController::class,
        'updatePlan',
    ])->name('preventif-mesin.plan.update');

    Route::put('/preventif-mesin/{preventifMesin}/bulanan', [
        PreventifMesinController::class,
        'updateBulanan',
    ])->name('preventif-mesin.bulanan');

    Route::post('/preventif-divisi', [
        PreventifDivisiController::class,
        'store'])->name('preventif-divisi.store');
    Route::delete('/preventif-divisi/{divisi}', [
        PreventifDivisiController::class,
        'destroy'])->name('preventif-divisi.destroy');

    /*
    |--------------------------------------------------------------------------
    | Checksheet Preventif
    |--------------------------------------------------------------------------
    */

    Route::prefix('checksheet-preventif')
        ->name('preventif-checksheets.')
        ->controller(PreventifChecksheetController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::post('/import', 'import')->name('import');

            // tujuan klik notifikasi dari Schedule Preventif
            Route::get('/item/{preventifMesin}', 'untukItem')->name('untuk-item');

            // form bulanan (harus di atas route /{preventifChecksheet})
            Route::put('/records/{record}', 'updateRecord')->name('records.update');
            Route::delete('/records/{record}', 'destroyRecord')->name('records.destroy');
            Route::post('/records/{record}/aksi', 'setAksi')->name('records.aksi');
            Route::put('/records/{record}/hasil', 'updateHasil')->name('records.hasil');

            Route::get('/{preventifChecksheet}', 'show')->name('show');
            Route::get('/{preventifChecksheet}/export-bulan', 'exportBulan')->name('export-bulan');
            Route::put('/{preventifChecksheet}', 'update')->name('update');
            Route::delete('/{preventifChecksheet}', 'destroy')->name('destroy');

            Route::post('/{preventifChecksheet}/records', 'storeRecord')->name('records.store');

            Route::post('/{preventifChecksheet}/items', 'storeItem')->name('items.store');
            Route::put('/{preventifChecksheet}/items/{item}', 'updateItem')->name('items.update');
            Route::delete('/{preventifChecksheet}/items/{item}', 'destroyItem')->name('items.destroy');

            Route::put('/{preventifChecksheet}/abnormalities/{abnormality}', 'updateAbnormality')
                ->name('abnormalities.update');
            Route::post('/{preventifChecksheet}/abnormalities/{abnormality}/catatan', 'storeCatatan')
                ->name('abnormalities.catatan');
        });


    /*
    |--------------------------------------------------------------------------
    | Report Mingguan Preventif
    | (menggantikan tombol Kirim & Upload Dokumen per tanggal)
    |--------------------------------------------------------------------------
    */

    Route::prefix('laporan-mingguan')
        ->name('laporan-mingguan.')
        ->group(function () {

            // Halaman riwayat laporan
            Route::get('/', [
                PreventifLaporanMingguanController::class,
                'riwayat',
            ])->name('index');

            // Halaman form laporan
            Route::get('/form', [
                PreventifLaporanMingguanController::class,
                'index',
            ])->name('form');

            // Export laporan
            Route::get('/export', [
                PreventifLaporanMingguanController::class,
                'export',
            ])->name('export');

            // Tampilkan foto: admin dan pimpinan
            Route::get('/foto/{item}/{jenis}', [
                PreventifLaporanMingguanController::class,
                'foto',
            ])->name('foto');

            // Semua aksi pengelolaan laporan hanya untuk admin
            Route::middleware('role:admin')->group(function () {

                // Update item laporan
                Route::put('/item/{item}', [
                    PreventifLaporanMingguanController::class,
                    'updateItem',
                ])->name('item.update');

                // Upload atau ganti foto
                Route::post('/item/{item}/foto', [
                    PreventifLaporanMingguanController::class,
                    'uploadFoto',
                ])->name('item.foto');

                // Hapus foto
                Route::delete('/item/{item}/foto', [
                    PreventifLaporanMingguanController::class,
                    'hapusFoto',
                ])->name('item.foto.destroy');

                // Hapus item laporan
                Route::delete('/item/{item}', [
                    PreventifLaporanMingguanController::class,
                    'destroyItem',
                ])->name('item.destroy');

                // Hapus laporan
                Route::delete('/{laporan}', [
                    PreventifLaporanMingguanController::class,
                    'destroy',
                ])->name('destroy');

                // Tambah temuan
                Route::post('/{laporan}/temuan', [
                    PreventifLaporanMingguanController::class,
                    'storeTemuan',
                ])->name('temuan.store');

                // Simpan laporan
                Route::post('/{laporan}/simpan', [
                    PreventifLaporanMingguanController::class,
                    'simpan',
                ])->name('simpan');

                // Kirim laporan ke pimpinan
                Route::post('/{laporan}/kirim', [
                    PreventifLaporanMingguanController::class,
                    'kirim',
                ])->name('kirim');
            });

            // Aksi pimpinan
            Route::middleware('role:pimpinan')->group(function () {

                Route::post('/{laporan}/periksa', [
                    PreventifLaporanMingguanController::class,
                    'periksa',
                ])->name('periksa');

                Route::post('/{laporan}/setujui', [
                    PreventifLaporanMingguanController::class,
                    'setujui',
                ])->name('setujui');

                Route::post('/{laporan}/tolak', [
                    PreventifLaporanMingguanController::class,
                    'tolak',
                ])->name('tolak');
            });
        });



    /*
    |--------------------------------------------------------------------------
    | Schedule Preventif (menu baru, plan per week)
    |--------------------------------------------------------------------------
    */

    Route::prefix('schedule-preventif')->name('schedule-preventif.')->group(function () {
        Route::get('/', [
            SchedulePreventifController::class,
            'index',
        ])->name('index');

        Route::post('cell', [
            SchedulePreventifController::class,
            'simpanCell',
        ])->name('cell');

        Route::post('arsir', [
            SchedulePreventifController::class,
            'toggleArsir',
        ])->name('arsir');

        Route::post('zona', [
            ScheduleZonaController::class,
            'store',
        ])->name('zona.store');

        Route::put('zona/{zona}', [
            ScheduleZonaController::class,
            'update',
        ])->name('zona.update');

        Route::delete('zona/{zona}', [
            ScheduleZonaController::class,
            'destroy',
        ])->name('zona.destroy');

        Route::post('baris', [
            ScheduleBarisController::class,
            'store',
        ])->name('baris.store');

        Route::put('baris/{baris}', [
            ScheduleBarisController::class,
            'update',
        ])->name('baris.update');

        Route::delete('baris/{baris}', [
            ScheduleBarisController::class,
            'destroy',
        ])->name('baris.destroy');
    });


    /*
    |--------------------------------------------------------------------------
    | Check Sheet
    |--------------------------------------------------------------------------
    */

    // Scan barcode dan pencarian berdasarkan line
    Route::post('/check-sheets/scan', [
        CheckSheetController::class,
        'resolve',
    ])->name('check-sheets.resolve');

    Route::get('/check-sheets/line/{kode}', [
        CheckSheetController::class,
        'byLine',
    ])->name('check-sheets.line');

    Route::get('/check-sheets-barcodes', [
        CheckSheetController::class,
        'barcodes',
    ])->name('check-sheets.barcodes');

    // Akses scanner melalui URL
    Route::get('/s/{kode}', [
        CheckSheetController::class,
        'unlock',
    ])->name('check-sheets.unlock');

    Route::post('/check-sheets/salin-line', [CheckSheetController::class, 'salinLine'])
    ->name('check-sheets.salin-line');

    // Monitoring Running Hours
    Route::prefix('check-sheets/{checkSheet}')->group(function () {

        Route::post('/monitoring-items', [
            CheckSheetMonitoringController::class,
            'storeItem',
        ]);

        Route::put('/monitoring-items/{item}', [
            CheckSheetMonitoringController::class,
            'updateItem',
        ]);

        Route::delete('/monitoring-items/{item}', [
            CheckSheetMonitoringController::class,
            'destroyItem',
        ]);

        Route::post('/monitoring/{item}/running', [
            CheckSheetMonitoringController::class,
            'storeRunning',
        ]);

        Route::post('/monitoring/{item}/foto', [
            CheckSheetMonitoringController::class,
            'storeFoto',
        ]);

        Route::delete('/monitoring/{item}/foto', [
            CheckSheetMonitoringController::class,
            'destroyFoto',
        ]);

        // Monitoring Konsumsi Bahan Bakar
        Route::post('/bbm-items', [
            CheckSheetBbmController::class,
            'storeItem',
        ]);

        Route::put('/bbm-items/{item}', [
            CheckSheetBbmController::class,
            'updateItem',
        ]);

        Route::delete('/bbm-items/{item}', [
            CheckSheetBbmController::class,
            'destroyItem',
        ]);

        Route::post('/bbm/{item}/running', [
            CheckSheetBbmController::class,
            'storeRunning',
        ]);

        // Pelumasan
        Route::post('/lubrications', [
            CheckSheetController::class,
            'storeLubrication',
        ])->name('check-sheets.lubrications.store');

        Route::put('/lubrications/{lubrication}', [
            CheckSheetController::class,
            'updateLubrication',
        ])->name('check-sheets.lubrications.update');

        Route::delete('/lubrications/{lubrication}', [
            CheckSheetController::class,
            'destroyLubrication',
        ])->name('check-sheets.lubrications.destroy');
    });

    // CRUD Check Sheet
    Route::resource('/check-sheets', CheckSheetController::class);

    // Item Check Sheet
    Route::post('/check-sheets/{checkSheet}/items', [
        CheckSheetController::class,
        'storeItem',
    ])->name('check-sheets.items.store');

    Route::put('/check-sheets/{checkSheet}/items/{item}', [
        CheckSheetController::class,
        'updateItem',
    ])->name('check-sheets.items.update');

    Route::delete('/check-sheets/{checkSheet}/items/{item}', [
        CheckSheetController::class,
        'destroyItem',
    ])->name('check-sheets.items.destroy');

    // Checklist, nilai, dan abnormality
    Route::post('/check-sheets/{checkSheet}/checklist', [
        CheckSheetController::class,
        'storeChecklist',
    ])->name('check-sheets.checklist.store');

    Route::post('/check-sheets/{checkSheet}/checklist/centang-semua', [
        CheckSheetController::class,
        'centangSemua',
    ])->middleware('role:pimpinan')
      ->name('check-sheets.checklist.centang-semua');

    Route::post('/check-sheets/{checkSheet}/nilai', [
        CheckSheetController::class,
        'storeNilai',
    ])->name('check-sheets.nilai.store');

    Route::post('/check-sheets/{checkSheet}/abnormalities', [
        CheckSheetController::class,
        'storeAbnormality',
    ])->name('check-sheets.abnormalities.store');

    Route::put('/check-sheets/{checkSheet}/abnormalities/{abnormality}', [
        CheckSheetController::class,
        'updateAbnormality',
    ])->name('check-sheets.abnormalities.update');

    Route::delete('/check-sheets/{checkSheet}/abnormalities/{abnormality}', [
        CheckSheetController::class,
        'destroyAbnormality',
    ])->name('check-sheets.abnormalities.destroy');

    // Export dan import Excel
    Route::get('/check-sheets/{checkSheet}/export-excel', [
        CheckSheetController::class,
        'exportExcel',
    ])->name('check-sheets.export-excel');

    Route::post('/check-sheets/{checkSheet}/import/preview', [
        CheckSheetImportController::class,
        'preview',
    ])->name('check-sheets.import.preview');

    Route::post('/check-sheets/{checkSheet}/import', [
        CheckSheetImportController::class,
        'store',
    ])->name('check-sheets.import.store');


    /*
    |--------------------------------------------------------------------------
    | Pengiriman Check Sheet Mingguan oleh Admin
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {

        Route::get('/check-sheet-pengiriman', [
            CheckSheetPengirimanController::class,
            'index',
        ])->name('check-sheet-pengiriman.index');

        Route::post('/check-sheet-pengiriman', [
            CheckSheetPengirimanController::class,
            'store',
        ])->name('check-sheet-pengiriman.store');

        Route::get('/check-sheet-pengiriman/riwayat', [
            CheckSheetPengirimanController::class,
            'riwayat',
        ])->name('check-sheet-pengiriman.riwayat');

        Route::get('/check-sheet-pengiriman/notifikasi', [
            CheckSheetPengirimanController::class,
            'notifikasi',
        ])->name('check-sheet-pengiriman.notifikasi');
    });


    /*
    |--------------------------------------------------------------------------
    | Overhaul SC2
    |--------------------------------------------------------------------------
    */

    // Export harus diletakkan sebelum route dengan parameter mesin
    Route::get('/overhaul-sc2/export', [
        OverhaulSc2Controller::class,
        'exportExcel',
    ])->name('overhaul-sc2.export');

    // Pilihan mesin dan satuan
    Route::delete('/overhaul-sc2-opsi/mesin', [
        OverhaulSc2Controller::class,
        'destroyMesin',
    ])->name('overhaul-sc2.opsi.mesin.destroy');

    Route::delete('/overhaul-sc2-opsi/satuan', [
        OverhaulSc2Controller::class,
        'destroySatuan',
    ])->name('overhaul-sc2.opsi.satuan.destroy');

    // CRUD Overhaul
    Route::get('/overhaul-sc2', [
        OverhaulSc2Controller::class,
        'index',
    ])->name('overhaul-sc2.index');

    Route::post('/overhaul-sc2', [
        OverhaulSc2Controller::class,
        'store',
    ])->name('overhaul-sc2.store');

    Route::put('/overhaul-sc2/{overhaulMesin}', [
        OverhaulSc2Controller::class,
        'update',
    ])->name('overhaul-sc2.update');

    Route::delete('/overhaul-sc2/{overhaulMesin}', [
        OverhaulSc2Controller::class,
        'destroy',
    ])->name('overhaul-sc2.destroy');

    Route::post('/overhaul-sc2/{overhaulMesin}/schedule', [
        OverhaulSc2Controller::class,
        'saveSchedule',
    ])->name('overhaul-sc2.schedule');

    // Dokumen Overhaul
    Route::post('/overhaul-sc2/{overhaulMesin}/dokumen', [
        OverhaulSc2Controller::class,
        'uploadDokumen',
    ])->name('overhaul-sc2.dokumen.upload');

    Route::get('/overhaul-dokumen/{dokumen}', [
        OverhaulSc2Controller::class,
        'lihatDokumen',
    ])->name('overhaul-dokumen.show');

    Route::get('/overhaul-dokumen/{dokumen}/download', [
        OverhaulSc2Controller::class,
        'downloadDokumen',
    ])->name('overhaul-dokumen.download');

    Route::delete('/overhaul-dokumen/{dokumen}', [
        OverhaulSc2Controller::class,
        'hapusDokumen',
    ])->name('overhaul-dokumen.destroy');

    /*
    |--------------------------------------------------------------------------
    | Master Divisi & Line (hanya admin)
    |--------------------------------------------------------------------------
    */

    Route::prefix('master')->group(function () {

        Route::get('/divisi', [DivisiController::class, 'index'])->name('divisi.index');
        Route::post('/divisi', [DivisiController::class, 'store'])->name('divisi.store');
        Route::put('/divisi/{divisi}', [DivisiController::class, 'update'])->name('divisi.update');
        Route::delete('/divisi/{divisi}', [DivisiController::class, 'destroy'])->name('divisi.destroy');

        Route::post('/divisi/{divisi}/lines', [DivisiController::class, 'storeLine'])->name('divisi.lines.store');
        Route::delete('/lines/{line}', [DivisiController::class, 'destroyLine'])->name('lines.destroy');
    });


    /*
    |--------------------------------------------------------------------------
    | Joken
    |--------------------------------------------------------------------------
    */

    // Export harus sebelum resource supaya tidak tertangkap {joken}
    Route::get('/joken/{joken}/export', [
        JokenController::class,
        'export',
    ])->name('joken.export');

    Route::resource('joken', JokenController::class);


    /*
    |--------------------------------------------------------------------------
    | SopIk
    |--------------------------------------------------------------------------
    */

    Route::get('/sop-ik', [SopIkController::class, 'index']);
    Route::get('/sop-ik/revisions/{revision}/file', [SopIkController::class, 'file']);
    Route::post('/sop-ik', [SopIkController::class, 'store']);
    Route::put('/sop-ik/{sopDocument}', [SopIkController::class, 'update']);
    Route::delete('/sop-ik/{sopDocument}', [SopIkController::class, 'destroy']);
    Route::delete('/sop-ik/{sopDocument}/revisions/{revision}', [SopIkController::class, 'destroyRevision']);

    /*
    |--------------------------------------------------------------------------
    | Daftar Mesin
    |--------------------------------------------------------------------------
    */

    Route::prefix('machines')->name('machines.')->group(function () {

        // Lihat, export & print: semua role yang login
        Route::get('/', [MachineController::class, 'index'])->name('index');
        Route::get('/export', [MachineController::class, 'export'])->name('export');
        Route::get('/print-barcodes', [MachineController::class, 'printBarcodes'])->name('print');
        Route::get('/print-all', [MachineController::class, 'printAll'])->name('print-all');
        Route::get('/type/{type}/units', [MachineController::class, 'units'])
            ->whereNumber('type')->name('units');

        // Tambah dan edit: admin dan pimpinan
        Route::middleware('role:admin,pimpinan')->group(function () {
            Route::post('/type', [MachineController::class, 'store'])->name('store');

            Route::put('/type/{type}', [MachineController::class, 'update'])
                ->whereNumber('type')->name('update');
        });

        // Hapus dan import: hanya admin
        Route::middleware('role:admin')->group(function () {
            Route::delete('/type/{type}', [MachineController::class, 'destroy'])
                ->whereNumber('type')->name('destroy');

            Route::post('/import/preview', [MachineController::class, 'importPreview'])
                ->name('import.preview');

            Route::post('/import', [MachineController::class, 'import'])
                ->name('import');
        });
    });

});




/*
|--------------------------------------------------------------------------
| Menu Pimpinan
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:pimpinan'])->group(function () {

    // Approval Report Mingguan Preventif (dikirim Admin)
    // Nama route 'pimpinan.index' tetap dipakai supaya link lama tidak error.
    Route::get('/pimpinan', [
        PimpinanController::class,
        'index',
    ])->name('pimpinan.index');

    Route::get('/pimpinan/laporan/{laporan}', [
        PimpinanController::class,
        'show',
    ])->name('pimpinan.laporan.show');

    Route::post('/pimpinan/laporan/{laporan}/periksa', [
        PimpinanController::class,
        'periksa',
    ])->name('pimpinan.laporan.periksa');

    Route::post('/pimpinan/laporan/{laporan}/setujui', [
        PimpinanController::class,
        'setujui',
    ])->name('pimpinan.laporan.setujui');

    Route::post('/pimpinan/laporan/{laporan}/tolak', [
        PimpinanController::class,
        'tolak',
    ])->name('pimpinan.laporan.tolak');

    Route::post('/pimpinan/laporan/{laporan}/batalkan', [
        PimpinanController::class,
        'batalkan',
    ])->name('pimpinan.laporan.batalkan');

    // Pengiriman Check Sheet
    Route::get('/pimpinan/check-sheet', [
        CheckSheetPimpinanController::class,
        'index',
    ])->name('pimpinan.check-sheet.index');

    Route::get('/pimpinan/check-sheet/{pengiriman}', [
        CheckSheetPimpinanController::class,
        'show',
    ])->name('pimpinan.check-sheet.show');

    Route::post('/pimpinan/check-sheet/{pengiriman}/periksa', [
        CheckSheetPimpinanController::class,
        'periksa',
    ])->name('pimpinan.check-sheet.periksa');

    Route::post('/pimpinan/check-sheet/{pengiriman}/tolak', [
        CheckSheetPimpinanController::class,
        'tolak',
    ])->name('pimpinan.check-sheet.tolak');

    Route::delete('/pimpinan/check-sheet/{pengiriman}', [
        CheckSheetPimpinanController::class,
        'destroy',
    ])->name('pimpinan.check-sheet.destroy');
    
    Route::post(
        '/pimpinan/check-sheet/notifikasi/{notification}/baca',
        [CheckSheetNotificationController::class, 'baca']
    )->name('pimpinan.check-sheet.notifikasi.baca');
});


/*
|--------------------------------------------------------------------------
| RRF MAINTENANCE - INTEGRASI QMOS
|--------------------------------------------------------------------------
*/

// Admin saja: sinkron API, buat RRF, isi & kirim RRF
Route::middleware(['auth', 'role:admin'])
    ->prefix('mtc/rrf')
    ->name('mtc.rrf.')
    ->group(function () {

        Route::post('/repair-mtc/sync', [RepairMtcController::class, 'sync'])
            ->name('repair-mtc.sync');

        Route::post('/repair-mtc/{repair}/buat-rrf', [MtcRrfController::class, 'buatDariRepair'])
            ->whereNumber('repair')
            ->name('repair-mtc.buat-rrf');

        Route::put('/{rrf}/simpan', [MtcRrfController::class, 'simpan'])
            ->whereNumber('rrf')
            ->name('simpan');

        Route::post('/{rrf}/kirim', [MtcRrfController::class, 'kirim'])
            ->whereNumber('rrf')
            ->name('kirim');
    });

// Admin dan Pimpinan: Data QMOS (hanya lihat), daftar RRF, dan detail RRF
Route::middleware(['auth', 'role:admin,pimpinan'])
    ->prefix('mtc/rrf')
    ->name('mtc.rrf.')
    ->group(function () {

        Route::get('/repair-mtc', [RepairMtcController::class, 'index'])
            ->name('repair-mtc.index');

        Route::get('/', [MtcRrfController::class, 'index'])
            ->name('index');

        Route::get('/{rrf}', [MtcRrfController::class, 'show'])
            ->whereNumber('rrf')
            ->name('show');

        Route::get('/{rrf}/export', [MtcRrfExportController::class, 'formulir'])
            ->whereNumber('rrf')
            ->name('export');

        Route::post('/{rrf}/callback-ulang', [MtcRrfController::class, 'callbackUlang'])
            ->whereNumber('rrf')
            ->name('callback-ulang');
    });

// Pimpinan: keputusan verifikasi
Route::middleware(['auth', 'role:pimpinan'])
    ->prefix('mtc/rrf')
    ->name('mtc.rrf.')
    ->group(function () {

        Route::post('/{rrf}/verifikasi', [MtcRrfController::class, 'verifikasi'])
            ->whereNumber('rrf')
            ->name('verifikasi');

        Route::post('/{rrf}/kembalikan', [MtcRrfController::class, 'kembalikan'])
            ->whereNumber('rrf')
            ->name('kembalikan');
    });

// Notifikasi RRF untuk Admin dan Pimpinan Maintenance
Route::middleware(['auth', 'role:admin,pimpinan'])
    ->group(function () {

        Route::post('/notifikasi/{notification}/baca', [
            RrfNotificationController::class,
            'baca',
        ])->name('notifikasi.baca');

        Route::post('/rrf/notifikasi/{notification}/baca', [
            RrfNotificationController::class,
            'baca',
        ])->name('rrf.notifikasi.baca');
    });