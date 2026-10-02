<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PreventifMesinController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return view('welcome');
});

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

    Route::post('/preventif-mesin/{preventifMesin}/checklist', [
        PreventifMesinController::class,
        'storeChecklist'
    ])->name('preventif-mesin.checklist.store');
});