<?php
namespace App\Http\Controllers;

use App\Models\RrfNotification;
use Illuminate\Http\Request;

class RrfNotificationController extends Controller
{
    public function baca(Request $request, RrfNotification $notification)
    {
        // Pastikan notifikasi hanya bisa dibaca pemiliknya.
        abort_unless(
            (int) $notification->user_id === (int) $request->user()->id,
            404
        );

        // Tandai sudah dibaca.
        if (!$notification->dibaca_pada) {
            $notification->update([
                'dibaca_pada' => now(),
            ]);
        }

        // Arahkan ke detail RRF terkait.
        return redirect()->route('rrf.show', $notification->rrf_id);
    }
}
