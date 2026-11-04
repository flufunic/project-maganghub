<?php

namespace App\Http\Middleware;

use App\Models\RrfNotification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'role'      => $user->role,
                    'divisi_id' => $user->divisi_id,
                    'divisi'    => $user->divisi?->nama_divisi,
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],

            'rrfForm' => [
                'form_no'    => config('rrf.form_no'),
                'form_rev'   => config('rrf.form_rev'),
                'perusahaan' => config('rrf.perusahaan'),
            ],

            'rrfNotifications' => fn () => $user
                ? [
                    'jumlah_belum_dibaca' => RrfNotification::where('user_id', $user->id)
                        ->whereNull('dibaca_pada')
                        ->count(),

                    'daftar' => RrfNotification::where('user_id', $user->id)
                        ->with('rrf:id,rrf_no')
                        ->latest()
                        ->limit(10)
                        ->get()
                        ->map(fn ($notification) => [
                            'id' => $notification->id,
                            'judul' => $notification->judul,
                            'pesan' => $notification->pesan,
                            'dibaca' => !is_null($notification->dibaca_pada),
                            'waktu' => $notification->created_at?->format('d/m/Y H:i'),
                            'rrf_no' => $notification->rrf?->rrf_no,
                            'read_url' => route(
                                'rrf.notifikasi.baca',
                                $notification->id
                            ),
                        ])
                        ->values(),
                ]
                : [
                    'jumlah_belum_dibaca' => 0,
                    'daftar' => [],
                ],
        ];
    }
}
