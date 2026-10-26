<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PreventifMesinController;
use App\Http\Controllers\PreventifPengirimanController;
use App\Http\Controllers\PimpinanController;
use App\Http\Controllers\CheckSheetController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\CheckSheetImportController;
use App\Http\Controllers\CheckSheetMonitoringController;
use App\Http\Controllers\CheckSheetBbmController;
use App\Http\Controllers\OverhaulSc2Controller;
use App\Http\Controllers\CheckSheetPengirimanController;
use App\Http\Controllers\CheckSheetPimpinanController;


Route::get('/', [
    PreventifMesinController::class,
    'welcome'
])->name('welcome');

Route::get('/login', [
    AuthController::class,
    'showLogin'
])->name('login');

Route::post('/login', [
    AuthController::class,
    'login'
])->name('login.store');

Route::post('/logout', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return Inertia::location('/');
})->name('logout');

Route::get('/overhaul-dashboard', [OverhaulSc2Controller::class, 'dashboard'])
    ->name('overhaul-sc2.dashboard');

// Dashboard Check Sheet (publik, tanpa login)
Route::get('/check-sheet-dashboard', [CheckSheetController::class, 'dashboard'])
    ->name('check-sheet.dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/preventif-mesin/export', [
        PreventifMesinController::class,
        'exportExcel'
    ])->name('preventif-mesin.export');

    Route::resource('/preventif-mesin', PreventifMesinController::class);
        // Scan barcode & daftar per line (harus sebelum resource)
    Route::post('/check-sheets/scan', [
        CheckSheetController::class,
        'resolve'
    ])->name('check-sheets.resolve');

    Route::get('/check-sheets/line/{kode}', [
        CheckSheetController::class,
        'byLine'
    ])->name('check-sheets.line');

    Route::get('/check-sheets-barcodes', [
        CheckSheetController::class,
        'barcodes'
    ])->name('check-sheets.barcodes');

    Route::prefix('check-sheets/{checkSheet}')->group(function () {
        // Tabel Monitoring Running Hours
        Route::post('monitoring-items', [CheckSheetMonitoringController::class, 'storeItem']);
        Route::put('monitoring-items/{item}', [CheckSheetMonitoringController::class, 'updateItem']);
        Route::delete('monitoring-items/{item}', [CheckSheetMonitoringController::class, 'destroyItem']);
        Route::post('monitoring/{item}/running', [CheckSheetMonitoringController::class, 'storeRunning']);
        Route::post('monitoring/{item}/foto', [CheckSheetMonitoringController::class, 'storeFoto']);
        Route::delete('monitoring/{item}/foto', [CheckSheetMonitoringController::class, 'destroyFoto']);

        // Tabel Monitoring Konsumsi Bahan Bakar (data sendiri)
        Route::post('bbm-items', [CheckSheetBbmController::class, 'storeItem']);
        Route::put('bbm-items/{item}', [CheckSheetBbmController::class, 'updateItem']);
        Route::delete('bbm-items/{item}', [CheckSheetBbmController::class, 'destroyItem']);
        Route::post('bbm/{item}/running', [CheckSheetBbmController::class, 'storeRunning']);
    });

    // Kamera bawaan HP membuka URL ini
    Route::get('/s/{kode}', [CheckSheetController::class, 'unlock'])
        ->name('check-sheets.unlock');

    Route::resource('/check-sheets', CheckSheetController::class);

    Route::post('/check-sheets/{checkSheet}/items', [
        CheckSheetController::class,
        'storeItem'
    ])->name('check-sheets.items.store');

    Route::put('/check-sheets/{checkSheet}/items/{item}', [
        CheckSheetController::class,
        'updateItem'
    ])->name('check-sheets.items.update');

    Route::delete('/check-sheets/{checkSheet}/items/{item}', [
        CheckSheetController::class,
        'destroyItem'
    ])->name('check-sheets.items.destroy');

    Route::post('/preventif-mesin/{preventifMesin}/checklist', [
        PreventifMesinController::class,
        'storeChecklist'
    ])->name('preventif-mesin.checklist.store');

    Route::post('/check-sheets/{checkSheet}/checklist', [
        CheckSheetController::class,
        'storeChecklist'
    ])->name('check-sheets.checklist.store');

    Route::post('/check-sheets/{checkSheet}/nilai', [
        CheckSheetController::class,
        'storeNilai'
    ])->name('check-sheets.nilai.store');

    Route::post('/check-sheets/{checkSheet}/abnormalities', [
        CheckSheetController::class,
        'storeAbnormality'
    ])->name('check-sheets.abnormalities.store');

    Route::put('/check-sheets/{checkSheet}/abnormalities/{abnormality}', [
        CheckSheetController::class,
        'updateAbnormality'
    ])->name('check-sheets.abnormalities.update');

    Route::delete('/check-sheets/{checkSheet}/abnormalities/{abnormality}', [
        CheckSheetController::class,
        'destroyAbnormality'
    ])->name('check-sheets.abnormalities.destroy');

    Route::get('/check-sheets/{checkSheet}/export-excel', [
        CheckSheetController::class,
        'exportExcel'
    ])->name('check-sheets.export-excel');

    Route::post('/preventif-pengiriman', [
        PreventifPengirimanController::class,
        'store'
    ])
        ->middleware('role:admin')
        ->name('preventif-pengiriman.store');

    // Kirim check sheet mingguan ke pimpinan (admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/check-sheet-pengiriman', [
            CheckSheetPengirimanController::class,
            'index'
        ])->name('check-sheet-pengiriman.index');

        Route::post('/check-sheet-pengiriman', [
            CheckSheetPengirimanController::class,
            'store'
        ])->name('check-sheet-pengiriman.store');

        Route::get('/check-sheet-pengiriman/riwayat', [
            CheckSheetPengirimanController::class,
            'riwayat'
        ])->name('check-sheet-pengiriman.riwayat');
        
        Route::get('/check-sheet-pengiriman/notifikasi', [
            CheckSheetPengirimanController::class,
            'notifikasi'
        ])->name('check-sheet-pengiriman.notifikasi');
    });

    Route::put(
        '/preventif-mesin/{preventifMesin}/bulanan',
        [PreventifMesinController::class, 'updateBulanan']
    )->name('preventif-mesin.bulanan');

    // Import Excel CheckSheet
    Route::post(
        '/check-sheets/{checkSheet}/import/preview',
        [CheckSheetImportController::class, 'preview']
    )->name('check-sheets.import.preview');

    Route::post(
        '/check-sheets/{checkSheet}/import',
        [CheckSheetImportController::class, 'store']
    )->name('check-sheets.import.store');

    // ===== Overhaul SC2 =====

    // Export harus di atas route yang memakai {overhaulMesin}
    Route::get('/overhaul-sc2/export', [OverhaulSc2Controller::class, 'exportExcel'])
        ->name('overhaul-sc2.export');

    // Hapus pilihan di dropdown form (dipanggil dari Index.jsx)
    Route::delete('/overhaul-sc2-opsi/mesin', [OverhaulSc2Controller::class, 'destroyMesin'])
        ->name('overhaul-sc2.opsi.mesin.destroy');

    Route::delete('/overhaul-sc2-opsi/satuan', [OverhaulSc2Controller::class, 'destroySatuan'])
        ->name('overhaul-sc2.opsi.satuan.destroy');

    Route::get('/overhaul-sc2', [OverhaulSc2Controller::class, 'index']);
    Route::post('/overhaul-sc2', [OverhaulSc2Controller::class, 'store']);
    Route::put('/overhaul-sc2/{overhaulMesin}', [OverhaulSc2Controller::class, 'update']);
    Route::delete('/overhaul-sc2/{overhaulMesin}', [OverhaulSc2Controller::class, 'destroy']);
    Route::post('/overhaul-sc2/{overhaulMesin}/schedule', [OverhaulSc2Controller::class, 'saveSchedule']);

    // Dokumen overhaul
    Route::post('/overhaul-sc2/{overhaulMesin}/dokumen', [OverhaulSc2Controller::class, 'uploadDokumen']);
    Route::get('/overhaul-dokumen/{dokumen}', [OverhaulSc2Controller::class, 'lihatDokumen']);
    Route::get('/overhaul-dokumen/{dokumen}/download', [OverhaulSc2Controller::class, 'downloadDokumen']);
    Route::delete('/overhaul-dokumen/{dokumen}', [OverhaulSc2Controller::class, 'hapusDokumen']);

});

Route::middleware(['auth', 'role:pimpinan'])->group(function () {
    Route::get('/pimpinan', [
        PimpinanController::class,
        'index'
    ])->name('pimpinan.index');

    Route::get('/pimpinan/pengiriman/{pengiriman}', [
        PimpinanController::class,
        'show'
    ])->name('pimpinan.pengiriman.show');

    Route::post('/pimpinan/pengiriman/{pengiriman}/periksa', [
        PimpinanController::class,
        'periksa'
    ])->name('pimpinan.pengiriman.periksa');

    Route::post('/pimpinan/pengiriman/{pengiriman}/tolak', [PimpinanController::class, 'tolak'])
        ->name('pimpinan.pengiriman.tolak');

    // Check sheet mingguan (pimpinan)
    Route::get('/pimpinan/check-sheet', [
        CheckSheetPimpinanController::class,
        'index'
    ])->name('pimpinan.check-sheet.index');

    Route::get('/pimpinan/check-sheet/{pengiriman}', [
        CheckSheetPimpinanController::class,
        'show'
    ])->name('pimpinan.check-sheet.show');

    Route::post('/pimpinan/check-sheet/{pengiriman}/periksa', [
        CheckSheetPimpinanController::class,
        'periksa'
    ])->name('pimpinan.check-sheet.periksa');

    Route::post('/pimpinan/check-sheet/{pengiriman}/tolak', [
        CheckSheetPimpinanController::class,
        'tolak'
    ])->name('pimpinan.check-sheet.tolak');

    Route::delete('/pimpinan/check-sheet/{pengiriman}', [
        CheckSheetPimpinanController::class,
        'destroy'
    ])->name('pimpinan.check-sheet.destroy');
});
