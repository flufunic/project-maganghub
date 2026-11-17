<?php

namespace App\Http\Controllers;

use App\Models\RrfNotification;
use Illuminate\Http\Request;

class RrfNotificationController extends Controller
{
    public function baca(Request $request, RrfNotification $notification)
    {
        // Pastikan notifikasi milik user yang sedang login.
        abort_unless(
            (int) $notification->user_id === (int) $request->user()->id,
            404
        );

        if (!$notification->dibaca_pada) {
            $notification->update(['dibaca_pada' => now()]);
        }

        // Notif data masuk (RRF belum dibuat) -> daftar Repair QMOS
        if (!$notification->rrf_id) {
            return redirect()->route('mtc.rrf.repair-mtc.index');
        }

        return redirect()->route('mtc.rrf.show', $notification->rrf_id);
    }
}