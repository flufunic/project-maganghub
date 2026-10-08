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

Route::middleware('auth')->group(function () {
    Route::get('/preventif-mesin/export', [
        PreventifMesinController::class,
        'exportExcel'
    ])->name('preventif-mesin.export');

    Route::resource('/preventif-mesin', PreventifMesinController::class);
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
});