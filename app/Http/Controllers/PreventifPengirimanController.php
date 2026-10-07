<?php

namespace App\Http\Controllers;

use App\Models\PreventifPengiriman;
use Illuminate\Http\Request;

class PreventifPengirimanController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => ['required', 'date'],
        ]);

        $pengiriman = PreventifPengiriman::updateOrCreate(
            [
                'tanggal' => $request->tanggal,
            ],
            [
                'dikirim_oleh' => $request->user()->id,
                'dikirim_pada' => now(),
                'status' => 'menunggu',
                'alasan_penolakan' => null,
            ]
        );

        return back()->with(
            'success',
            'Data tanggal ' . $pengiriman->tanggal->format('d/m/Y') . ' berhasil dikirim ke Pimpinan.'
        );
    }
}