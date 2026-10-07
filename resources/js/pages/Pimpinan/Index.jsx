import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Pimpinan/Sidebar';

export default function Index({
    user,
    pengirimans = [],
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const totalPengiriman = pengirimans.length;

    const totalMenunggu = pengirimans.filter(
        (item) => item.status === 'menunggu'
    ).length;

    const totalDiperiksa = pengirimans.filter(
        (item) => item.status === 'diperiksa'
    ).length;

    // ============================================
    // SAPAAN BERDASARKAN WAKTU
    // ============================================
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 11) {
            return {
                text: 'Selamat pagi',
                icon: '☀️',
            };
        }

        if (hour >= 11 && hour < 15) {
            return {
                text: 'Selamat siang',
                icon: '🌤️',
            };
        }

        if (hour >= 15 && hour < 18) {
            return {
                text: 'Selamat sore',
                icon: '🌇',
            };
        }

        return {
            text: 'Selamat malam',
            icon: '🌙',
        };
    };

    const greeting = getGreeting();

    return (
        <>
            <Head title="Dashboard Pimpinan" />

            {/* SIDEBAR */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-h-screen flex-col bg-slate-100">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <header className="sticky top-0 z-40 border-b border-white/20 bg-white/90 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

                        {/* KIRI */}
                        <div className="flex items-center gap-3">

                            {/* HAMBURGER */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="group flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300"
                                aria-label="Buka menu"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>

                            {/* JUDUL */}
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">
                                    Dashboard Pimpinan
                                </h1>

                                <p className="hidden text-xs text-slate-500 sm:block">
                                    Sistem Schedule Preventif
                                </p>
                            </div>
                        </div>


                        {/* KANAN */}
                        <div className="flex items-center gap-3">

                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-800">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-blue-600">
                                    Pimpinan
                                </p>
                            </div>

                            {/* AVATAR */}
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-200">
                                {(user?.name || 'P').charAt(0).toUpperCase()}
                            </div>

                        </div>
                    </div>
                </header>


                {/* =====================================================
                    CONTENT
                ====================================================== */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">


                    {/* =================================================
                        GREETING CARD
                    ================================================== */}
                    <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-6 shadow-lg shadow-blue-200 sm:p-8">

                        {/* Dekorasi background */}
                        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
                        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/5" />
                        <div className="absolute -left-10 -bottom-16 h-36 w-36 rounded-full bg-indigo-400/20" />

                        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div>

                                {/* Status */}
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                    Sistem Aktif
                                </div>


                                {/* GREETING */}
                                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    {greeting.text},{' '}
                                    {user?.name || 'Pimpinan'}{' '}
                                    {greeting.icon}
                                </h2>


                                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                                    Periksa dan kelola data preventif yang
                                    telah dikirim oleh Admin.
                                </p>

                            </div>


                            {/* Icon kanan */}
                            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm sm:flex">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.6}
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

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 8 1.5 1.5L13 7"
                                    />
                                </svg>

                            </div>

                        </div>
                    </div>


                    {/* =================================================
                        JUDUL DATA
                    ================================================== */}
                    <div className="mb-5">
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
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

                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Data Preventif Mesin
                                </h2>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Data yang telah dikirim oleh Admin untuk diperiksa.
                                </p>
                            </div>

                        </div>
                    </div>


                    {/* =================================================
                        STAT CARDS
                    ================================================== */}
                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">


                        {/* TOTAL PENGIRIMAN */}
                        <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">

                            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-400 to-blue-600" />

                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Pengiriman
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-800">
                                        {totalPengiriman}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Seluruh data yang dikirim
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v12m6-6H6"
                                        />
                                    </svg>
                                </div>

                            </div>

                            <div className="mt-4 h-1 overflow-hidden rounded-full bg-blue-50">
                                <div className="h-full w-full rounded-full bg-blue-500" />
                            </div>

                        </div>


                        {/* MENUNGGU */}
                        <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-100">

                            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400 to-orange-500" />

                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Menunggu Diperiksa
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-amber-600">
                                        {totalMenunggu}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Belum diperiksa pimpinan
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 7v5l3 2"
                                        />
                                    </svg>
                                </div>

                            </div>

                            <div className="mt-4 h-1 overflow-hidden rounded-full bg-amber-50">
                                <div
                                    className="h-full rounded-full bg-amber-400"
                                    style={{
                                        width:
                                            totalPengiriman > 0
                                                ? `${(totalMenunggu / totalPengiriman) * 100}%`
                                                : '0%',
                                    }}
                                />
                            </div>

                        </div>


                        {/* SUDAH DIPERIKSA */}
                        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100">

                            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 to-green-600" />

                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Sudah Diperiksa
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                                        {totalDiperiksa}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Telah diperiksa pimpinan
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m8 12 2.5 2.5L16 9"
                                        />

                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />
                                    </svg>
                                </div>

                            </div>

                            <div className="mt-4 h-1 overflow-hidden rounded-full bg-emerald-50">
                                <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{
                                        width:
                                            totalPengiriman > 0
                                                ? `${(totalDiperiksa / totalPengiriman) * 100}%`
                                                : '0%',
                                    }}
                                />
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        RIWAYAT PENGIRIMAN
                    ================================================== */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {/* TABLE HEADER */}
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        Riwayat Pengiriman
                                    </h3>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Daftar data preventif yang dikirim oleh Admin.
                                    </p>
                                </div>

                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {totalPengiriman} Pengiriman
                            </div>

                        </div>


                        {/* EMPTY STATE */}
                        {pengirimans.length === 0 ? (

                            <div className="px-6 py-16 text-center">

                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-8 w-8 text-slate-400"
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
                                    Belum ada data preventif yang dikirim oleh Admin.
                                </p>

                            </div>

                        ) : (

                            /* TABLE */
                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[850px] text-sm">

                                    <thead>
                                        <tr className="bg-slate-50/80">

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                No
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Tanggal
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Dikirim Oleh
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Waktu Pengiriman
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Aksi
                                            </th>

                                        </tr>
                                    </thead>


                                    <tbody className="divide-y divide-slate-100">

                                        {pengirimans.map((item, index) => (

                                            <tr
                                                key={item.id}
                                                className="group transition-colors duration-200 hover:bg-blue-50/40"
                                            >

                                                {/* NO */}
                                                <td className="px-6 py-4">

                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                                                        {index + 1}
                                                    </span>

                                                </td>


                                                {/* TANGGAL */}
                                                <td className="px-6 py-4 font-semibold text-slate-800">
                                                    {item.tanggal_format}
                                                </td>


                                                {/* DIKIRIM OLEH */}
                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2.5">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                                            {(item.dikirim_oleh || 'A')
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <span className="text-slate-600">
                                                            {item.dikirim_oleh || '-'}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* WAKTU */}
                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.dikirim_pada || '-'}
                                                </td>


                                                {/* STATUS */}
                                                <td className="px-6 py-4">

                                                    {item.status === 'diperiksa' ? (

                                                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-2.5 w-2.5"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.704 5.293a1 1 0 0 1 .003 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414l2.543 2.543 6.543-6.543a1 1 0 0 1 1.414 0Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </span>

                                                            Sudah Diperiksa

                                                        </span>

                                                    ) : item.status === 'ditolak' ? (

                                                        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">

                                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-2.5 w-2.5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={3}
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18 18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </span>

                                                            Ditolak

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">

                                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-2.5 w-2.5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={3}
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M12 7v5l3 2"
                                                                    />

                                                                    <circle
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="9"
                                                                    />
                                                                </svg>
                                                            </span>

                                                            Menunggu Diperiksa

                                                        </span>

                                                    )}

                                                </td>


                                                {/* AKSI */}
                                                <td className="px-6 py-4 text-center">

                                                    <Link
                                                        href={`/pimpinan/pengiriman/${item.id}`}
                                                        className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-300"
                                                    >
                                                        Lihat Data

                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>

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


                {/* =====================================================
                    FOOTER
                ====================================================== */}
               <footer className="mt-auto border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-5 sm:px-6">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>
                    </div>
                </footer>

            </div>
        </>
    );
}