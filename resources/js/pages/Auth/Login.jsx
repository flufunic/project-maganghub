import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing } = useForm({
        name: '',
        password: '',
    });

    const [alert, setAlert] = useState('');

    const submit = (e) => {
        e.preventDefault();

        // Kalau username dan password kosong
        if (!data.name.trim() && !data.password.trim()) {
            setAlert('Username dan password harus diisi.');
            return;
        }

        // Kalau username kosong
        if (!data.name.trim()) {
            setAlert('Username harus diisi.');
            return;
        }

        // Kalau password kosong
        if (!data.password.trim()) {
            setAlert('Password harus diisi.');
            return;
        }

        // Hapus alert sebelum proses login
        setAlert('');

        post('/login', {
            onFinish: () => {
                setTimeout(() => {
                    if (window.location.pathname === '/login') {
                        setAlert('Username atau password salah.');
                    }
                }, 100);
            },
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="relative min-h-screen overflow-hidden bg-slate-950">

                {/* =========================
                    BACKGROUND DECORATION
                ========================== */}
                <div className="absolute inset-0 overflow-hidden">

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

                    <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-indigo-600/20 blur-3xl" />

                    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_40%)]" />

                </div>

                {/* =========================
                    MAIN
                ========================== */}
                <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

                    <div className="w-full max-w-md">

                        {/* =========================
                            BRAND
                        ========================== */}
                        <div className="mb-7 text-center">

                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-900/40 ring-1 ring-white/10">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-8 w-8 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 3h6M10 3v3.5L5.5 14a4.5 4.5 0 0 0 3.8 7h5.4a4.5 4.5 0 0 0 3.8-7L14 6.5V3"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 14h8"
                                    />
                                </svg>

                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                LOGIN
                            </h1>

                            <p className="mt-2 text-sm text-slate-400">
                                Masukkan Username dan Password untuk mengakses sistem
                            </p>

                        </div>

                        {/* =========================
                            LOGIN CARD
                        ========================== */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.97] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

                            {/* Top accent */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

                            {/* =========================
                                ALERT
                            ========================== */}
                            {alert && (
                                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-5 w-5 text-red-600"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.5"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 16.5h.01"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.3 4.8 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"
                                                />
                                            </svg>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-red-700">
                                                Login gagal
                                            </p>

                                            <p className="mt-1 text-sm leading-5 text-red-600">
                                                {alert}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* =========================
                                FORM
                            ========================== */}
                            <form onSubmit={submit} className="space-y-5">

                                {/* USERNAME */}
                                <div>

                                    <label
                                        htmlFor="username"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Username
                                    </label>

                                    <div className="relative">

                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-5 w-5 text-slate-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
                                                />
                                            </svg>
                                        </div>

                                        <input
                                            id="username"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                setAlert('');
                                            }}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            placeholder="Masukkan username"
                                            autoComplete="username"
                                        />

                                    </div>

                                </div>

                                {/* PASSWORD */}
                                <div>

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">

                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-5 w-5 text-slate-400"
                                            >
                                                <rect
                                                    width="14"
                                                    height="10"
                                                    x="5"
                                                    y="11"
                                                    rx="2"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8 11V7a4 4 0 0 1 8 0v4"
                                                />
                                            </svg>
                                        </div>

                                        <input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => {
                                                setData('password', e.target.value);
                                                setAlert('');
                                            }}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            placeholder="Masukkan password"
                                            autoComplete="current-password"
                                        />

                                    </div>

                                </div>

                                {/* LOGIN BUTTON */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                >

                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    {processing ? (
                                        <span className="relative flex items-center gap-2">

                                            <svg
                                                className="h-4 w-4 animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />

                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>

                                            Login...

                                        </span>
                                    ) : (
                                        <span className="relative flex items-center gap-2">

                                            Login

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 12h14"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m13 6 6 6-6 6"
                                                />
                                            </svg>

                                        </span>
                                    )}

                                </button>

                            </form>

                            {/* Bottom info */}
                            <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5">

                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-3.5 w-3.5 text-emerald-600"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m9 12 2 2 4-4"
                                        />
                                    </svg>
                                </div>

                                <p className="text-xs text-slate-500">
                                    Akses sistem secara aman
                                </p>

                            </div>

                        </div>

                        {/* =========================
                            FOOTER
                        ========================== */}
                        <p className="mt-6 text-center text-xs text-slate-500">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>

                    </div>

                </div>
            </div>
        </>
    );
}