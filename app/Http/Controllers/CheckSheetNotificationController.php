<?php

namespace App\Http\Controllers;

use App\Models\CheckSheetNotification;
use Illuminate\Http\Request;

class CheckSheetNotificationController extends Controller
{
    public function baca(Request $request, CheckSheetNotification $notification)
    {
        // Pastikan notifikasi milik user yang sedang login
        abort_unless(
            (int) $notification->user_id === (int) $request->user()->id,
            404
        );

        // Tandai sudah dibaca
        if (!$notification->dibaca_pada) {
            $notification->update([
                'dibaca_pada' => now(),
            ]);
        }

        $pengiriman = $notification->pengiriman;

        // Jika pengiriman sudah dihapus, kembali ke halaman utama
        if (!$pengiriman || $pengiriman->trashed()) {
            return redirect()->route('pimpinan.check-sheet.index');
        }

        // Arahkan ke detail Check Sheet
        return redirect()->route(
            'pimpinan.check-sheet.show',
            $pengiriman->id
        );
    }
}