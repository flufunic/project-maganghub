import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({
    user,
    pengirimans = [],
}) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const getStatusLabel = (status) => {
        if (status === 'diperiksa') {
            return 'Sudah Diperiksa';
        }

        return 'Menunggu Diperiksa';
    };

    return (
        <>
            <Head title="Dashboard Pimpinan" />

            <div className="min-h-screen bg-slate-50">

                {/* HEADER */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Dashboard Pimpinan
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Sistem Schedule Preventif
                            </p>
                        </div>

                        <div className="flex items-center gap-4">

                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Pimpinan
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                Logout
                            </button>

                        </div>
                    </div>
                </header>


                {/* CONTENT */}
                <main className="mx-auto max-w-7xl px-6 py-8">

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Data Preventif Mesin
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Data yang telah dikirim oleh Admin untuk diperiksa.
                        </p>
                    </div>


                    {/* STAT CARD */}
                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Total Pengiriman
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-800">
                                {pengirimans.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Data tanggal yang dikirim
                            </p>
                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Menunggu Diperiksa
                            </p>

                            <p className="mt-2 text-3xl font-bold text-amber-600">
                                {
                                    pengirimans.filter(
                                        (item) => item.status === 'menunggu'
                                    ).length
                                }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Belum diperiksa pimpinan
                            </p>
                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Sudah Diperiksa
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                {
                                    pengirimans.filter(
                                        (item) => item.status === 'diperiksa'
                                    ).length
                                }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Telah diperiksa pimpinan
                            </p>
                        </div>

                    </div>


                    {/* TABLE */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-800">
                                Riwayat Pengiriman
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Daftar data preventif yang dikirim oleh Admin.
                            </p>
                        </div>


                        {pengirimans.length === 0 ? (

                            <div className="px-6 py-16 text-center">

                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-7 w-7 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 3v5h5"
                                        />
                                    </svg>

                                </div>

                                <h3 className="font-semibold text-slate-700">
                                    Belum ada data
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Belum ada data preventif yang dikirim oleh
                                    Admin.
                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[800px] text-sm">

                                    <thead className="bg-slate-50">
                                        <tr>

                                            <th className="px-6 py-4 text-left font-semibold text-slate-600">
                                                No
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-slate-600">
                                                Tanggal
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-slate-600">
                                                Dikirim Oleh
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-slate-600">
                                                Waktu Pengiriman
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-slate-600">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-center font-semibold text-slate-600">
                                                Aksi
                                            </th>

                                        </tr>
                                    </thead>


                                    <tbody className="divide-y divide-slate-100">

                                        {pengirimans.map((item, index) => (

                                            <tr
                                                key={item.id}
                                                className="transition hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-4 text-slate-500">
                                                    {index + 1}
                                                </td>

                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {item.tanggal_format}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.dikirim_oleh || '-'}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.dikirim_pada || '-'}
                                                </td>

                                                <td className="px-6 py-4">

                                                    {item.status === 'diperiksa' ? (

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Sudah Diperiksa
                                                        </span>

                                                    ) : item.status === 'ditolak' ? (

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                            Ditolak
                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                            Menunggu Diperiksa
                                                        </span>

                                                    )}

                                                </td>

                                                <td className="px-6 py-4 text-center">

                                                    <Link
                                                        href={`/pimpinan/pengiriman/${item.id}`}
                                                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                    >
                                                        Lihat Data
                                                    </Link>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </main>
            </div>
        </>
    );
}