<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\PreventifMesinController;
use App\Http\Controllers\PreventifPengirimanController;
use App\Http\Controllers\PimpinanController;
use App\Http\Controllers\CheckSheetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckSheetImportController;
use App\Http\Controllers\CheckSheetMonitoringController;
use App\Http\Controllers\CheckSheetBbmController;
use App\Http\Controllers\OverhaulSc2Controller;
use App\Http\Controllers\CheckSheetPengirimanController;
use App\Http\Controllers\CheckSheetPimpinanController;
use App\Http\Controllers\PreventifDokumenController;

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
])->name('login.store');

// Logout
Route::post('/logout', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return Inertia::location('/');
})->name('logout');

// Dashboard Overhaul SC2
Route::get('/overhaul-dashboard', [
    OverhaulSc2Controller::class,
    'dashboard',
])->name('overhaul-sc2.dashboard');

// Dashboard Check Sheet (publik)
Route::get('/check-sheet-dashboard', [
    CheckSheetController::class,
    'dashboard',
])->name('check-sheet.dashboard');


/*
|--------------------------------------------------------------------------
| Halaman Admin dan Pengguna yang Sudah Login
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

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

    Route::put('/preventif-mesin/{preventifMesin}/bulanan', [
        PreventifMesinController::class,
        'updateBulanan',
    ])->name('preventif-mesin.bulanan');

    Route::post('/preventif-pengiriman', [
        PreventifPengirimanController::class,
        'store',
    ])->middleware('role:admin')
      ->name('preventif-pengiriman.store');

    Route::post('/preventif-dokumen', [PreventifDokumenController::class, 'store'])
    ->name('preventif-dokumen.store');

    Route::get('/preventif-dokumen/{dokumen}/download', [PreventifDokumenController::class, 'download'])
        ->name('preventif-dokumen.download');

    Route::delete('/preventif-dokumen/{dokumen}', [PreventifDokumenController::class, 'destroy'])
        ->name('preventif-dokumen.destroy');
    
    Route::get('/preventif-dokumen/{dokumen}/lihat', [PreventifDokumenController::class, 'lihat'])
        ->name('preventif-dokumen.lihat');

    Route::get('/preventif-dokumen/{dokumen}/download', [PreventifDokumenController::class, 'download'])
        ->name('preventif-dokumen.download');
    Route::get('/dokumen/{dokumen}/lihat', [
        PreventifDokumenController::class,
        'lihat',
    ])->name('pimpinan.dokumen.lihat');

    Route::get('/dokumen/{dokumen}/download', [
        PreventifDokumenController::class,
        'download',
    ])->name('pimpinan.dokumen.download');


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
});


/*
|--------------------------------------------------------------------------
| Menu Pimpinan
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:pimpinan'])->group(function () {

    // Pengiriman Preventif Mesin
    Route::get('/pimpinan', [
        PimpinanController::class,
        'index',
    ])->name('pimpinan.index');

    Route::get('/pimpinan/pengiriman/{pengiriman}', [
        PimpinanController::class,
        'show',
    ])->name('pimpinan.pengiriman.show');

    Route::post('/pimpinan/pengiriman/{pengiriman}/periksa', [
        PimpinanController::class,
        'periksa',
    ])->name('pimpinan.pengiriman.periksa');

    Route::post('/pimpinan/pengiriman/{pengiriman}/tolak', [
        PimpinanController::class,
        'tolak',
    ])->name('pimpinan.pengiriman.tolak');


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
});

