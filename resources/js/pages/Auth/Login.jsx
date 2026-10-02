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
                // Cek setelah request selesai.
                // Kalau masih berada di halaman login,
                // berarti login gagal.
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

            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">

                    <h1 className="text-2xl font-bold text-center mb-2">
                        Login
                    </h1>

                    <p className="text-gray-500 text-center mb-6">
                        Sistem Schedule Preventif
                    </p>

                    {alert && (
                        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                                <span className="text-sm font-bold text-red-600">
                                    !
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-red-700">
                                    Login gagal
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {alert}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit}>

                        {/* USERNAME */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    setAlert('');
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Masukkan username"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => {
                                    setData('password', e.target.value);
                                    setAlert('');
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Masukkan password"
                            />
                        </div>

                        {/* LOGIN */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Login...' : 'Login'}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}
