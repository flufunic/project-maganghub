import Sidebar from '@/Components/Sidebar';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ checkSheets }) {

    const [showSidebar, setShowSidebar] = useState(false);

    const jam = new Date().getHours();

    const greeting =
        jam >= 5 && jam < 11
            ? 'Selamat Pagi'
            : jam >= 11 && jam < 15
            ? 'Selamat Siang'
            : jam >= 15 && jam < 18
            ? 'Selamat Sore'
            : 'Selamat Malam';

    return (
        <>
            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <Head title="Check Sheet Prediktif" />

            <div className="flex min-h-screen flex-col bg-slate-50">

                {/* =========================
                    HEADER
                ========================= */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">

                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                                {/* Hamburger */}
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(true)}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>

                                {/* Logo + Judul */}
                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200 sm:h-12 sm:w-12 sm:rounded-2xl">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.8}
                                            stroke="currentColor"
                                            className="h-5 w-5 text-white sm:h-6 sm:w-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13 3v5h5"
                                            />
                                        </svg>
                                    </div>

                                    <div className="min-w-0">
                                        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                            Check Sheet Prediktif
                                        </h1>

                                        <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                                            Sistem pengelolaan dan monitoring xxx
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notification */}
                            <div className="flex w-full items-center justify-end rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:p-2 md:w-auto">
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 01-2.31 6.022c1.74.64 3.56 1.09 5.453 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                        />
                                    </svg>
                                </button>
                            </div>

                        </div>
                    </div>
                </header>

                {/* =========================
                    CONTENT
                ========================= */}
                <div className="flex-1">

                    {/* =========================
                        GREETING
                    ========================= */}
                    <div className="mx-auto max-w-[1800px] px-6 pt-5">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {greeting},{' '}
                            <span className="font-bold">Admin!</span> 👋
                        </h2>
                    </div>

                    {/* =========================
                        MAIN
                    ========================= */}
                    <main className="mx-auto max-w-[1800px] px-6 py-7">

                        {/* Toolbar */}
                        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                {/* Judul */}
                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.8}
                                            stroke="currentColor"
                                            className="h-6 w-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13 3v5h5"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">

                                            <h2 className="text-lg font-bold text-slate-800">
                                                Check Sheet Prediktif
                                            </h2>

                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                                {checkSheets.length} Data
                                            </span>

                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Pengelolaan check sheet dan pemeriksaan mesin
                                        </p>
                                    </div>

                                </div>

                                {/* Tambah */}
                                <Link
                                    href="/check-sheets/create"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>

                                    Tambah Check Sheet
                                </Link>

                            </div>
                        </div>

                        {/* =========================
                            TABLE
                        ========================= */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[900px] text-sm">

                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">

                                            <th className="w-16 px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                                No
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Divisi
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Nomor Dokumen
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Nama Check Sheet
                                            </th>

                                            <th className="w-32 px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Aksi
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {checkSheets.length > 0 ? (

                                            checkSheets.map((checkSheet, index) => (

                                                <tr
                                                    key={checkSheet.id}
                                                    className="transition hover:bg-blue-50/40"
                                                >

                                                    <td className="px-5 py-4 text-center font-medium text-slate-500">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                            {checkSheet.divisi?.nama_divisi || '-'}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-blue-700">
                                                            {checkSheet.nomor_dokumen}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-slate-700">
                                                            {checkSheet.nama_checksheet}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">

                                                            {/* Buka - Kuning */}
                                                            <Link
                                                                href={`/check-sheets/${checkSheet.id}`}
                                                                title="Buka Check Sheet"
                                                                className="group flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-all duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-200"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.8}
                                                                    stroke="currentColor"
                                                                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.05.153.05.316 0 .469C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                </svg>
                                                            </Link>

                                                            {/* Edit - Biru */}
                                                            <Link
                                                                href={`/check-sheets/${checkSheet.id}/edit`}
                                                                title="Edit Check Sheet"
                                                                className="group flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-200"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.8}
                                                                    stroke="currentColor"
                                                                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-3.33.999.999-3.33a4.5 4.5 0 011.13-1.897L16.862 4.487z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M19.5 7.125L16.875 4.5"
                                                                    />
                                                                </svg>
                                                            </Link>

                                                            {/* Hapus - Merah */}
                                                            <button
                                                                type="button"
                                                                title="Hapus Check Sheet"
                                                                onClick={() => {
                                                                    if (
                                                                        window.confirm(
                                                                            'Apakah kamu yakin ingin menghapus Check Sheet ini?'
                                                                        )
                                                                    ) {
                                                                        router.delete(`/check-sheets/${checkSheet.id}`);
                                                                    }
                                                                }}
                                                                className="group flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-200 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-200"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.8}
                                                                    stroke="currentColor"
                                                                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 7.5h12"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M9.75 7.5V5.25A1.25 1.25 0 0111 4h2a1.25 1.25 0 011.25 1.25V7.5"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M8.25 7.5v11.25A1.25 1.25 0 009.5 20h5a1.25 1.25 0 001.25-1.25V7.5"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M10.5 11v5.25M13.5 11v5.25"
                                                                    />
                                                                </svg>
                                                            </button>

                                                        </div>
                                                    </td>

                                                </tr>

                                            ))

                                        ) : (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-16 text-center"
                                                >

                                                    <div className="flex flex-col items-center justify-center">

                                                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="h-7 w-7"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>

                                                        </div>

                                                        <p className="font-semibold text-slate-700">
                                                            Belum ada Check Sheet
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            Tambahkan check sheet untuk mulai
                                                            melakukan pemeriksaan mesin.
                                                        </p>

                                                    </div>

                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </main>

                </div>

                {/* =========================
                    FOOTER
                ========================= */}
                <footer className="mt-10 border-t border-slate-200 bg-white py-5">
                    <div className="mx-auto max-w-[1800px] px-6 text-center text-sm text-slate-400">
                        © 2026 Emma Sarkilla
                    </div>
                </footer>

            </div>
        </>
    );
}