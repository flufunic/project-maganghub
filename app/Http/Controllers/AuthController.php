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
        ];

        if (!Auth::attempt($credentials)) {
            return back()->withErrors([
                'login' => 'Username atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        return $this->redirectByRole();
    }

    private function redirectByRole()
    {
        $user = Auth::user();

        if ($user->role === 'pimpinan') {
            return redirect('/pimpinan');
        }

        return redirect('/preventif-mesin');
    }
}