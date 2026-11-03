<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Root template yang dimuat pada kunjungan pertama.
     * Harus sama dengan nama file di resources/views/.
     */
    protected $rootView = 'welcome';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Data yang tersedia di semua halaman React lewat usePage().props
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'role' => $request->user()->role,
                    'department_id' => $request->user()->department_id,
                ] : null,
            ],
        ];
    }
}