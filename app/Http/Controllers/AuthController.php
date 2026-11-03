<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return $this->redirectByRole();
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $credentials = [
            'name' => $request->name,
            'password' => $request->password,
            'is_active' => true,
        ];

        if (!Auth::attempt($credentials)) {
            return back()->withErrors([
                'login' => 'Username atau password salah.',
            ]);
        }

        $request->session()->regenerate();
        $request->user()->forceFill(['last_login_at' => now()])->save();

        return $this->redirectByRole();
    }

    private function redirectByRole()
    {
        $user = Auth::user();

        return match ($user->role) {
            'admin'             => redirect('/preventif-mesin'),
            'pimpinan'          => redirect('/pimpinan'),
            'spv_produksi',
            'operator_produksi' => redirect('/rrf'),
            default             => $this->rejectUnknownRole(),
        };
    }

    private function rejectUnknownRole()
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/login')->withErrors([
            'login' => 'Role akun tidak dikenali.',
        ]);
    }
}