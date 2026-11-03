<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        // Akun dinonaktifkan admin saat sedang login: keluarkan
        if (!$user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/login');
        }

        if (!in_array($user->role, $roles, true)) {
            abort(403, 'Anda tidak punya akses ke halaman ini.');
        }

        return $next($request);
    }
}