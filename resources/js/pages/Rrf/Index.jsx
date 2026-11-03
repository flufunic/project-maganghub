import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';

export default function Index() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="RRF" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
                    <h1 className="text-xl font-bold text-slate-900">
                        Repair Request Form
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Login sebagai <b>{auth.user.name}</b> ({auth.user.role})
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Halaman ini masih placeholder. Form RRF dibuat di tahap berikutnya.
                    </p>

                    <button
                        onClick={() => router.post('/logout')}
                        className="mt-5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}