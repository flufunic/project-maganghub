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

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <header className="sticky top-0 z-40 overflow-hidden border-b border-blue-100/80 bg-gradient-to-r from-blue-50/95 via-white/95 to-violet-50/90 shadow-sm backdrop-blur-xl">
                

                    <div className="mx-auto w-full max-w-[1800px] px-4 py-3.5 sm:px-6 sm:py-4">

                        <div className="flex items-center justify-between gap-4">

                            {/* LEFT */}
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                                {/* HAMBURGER */}
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(true)}
                                    className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:via-indigo-600 hover:to-violet-600 hover:shadow-xl hover:shadow-indigo-200"
                                    title="Buka menu"
                                >
                                    <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/15" />
                                    <span className="absolute -bottom-3 -left-2 h-7 w-7 rounded-full bg-white/10" />

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="relative h-5.5 w-5.5 transition-transform duration-200 group-hover:scale-110"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>

                                {/* LOGO + TITLE */}
                                <div className="flex min-w-0 items-center gap-3">

                                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 sm:h-12 sm:w-12">

                                        <div className="absolute inset-0 rounded-2xl bg-white/10" />

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="relative h-5 w-5 sm:h-5.5 sm:w-5.5"
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
                                        <div className="flex items-center gap-2">
                                            <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                                                Check Sheet Prediktif
                                            </h1>

                                            {/* <span className="hidden rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100 sm:inline-flex">
                                                Maintenance
                                            </span> */}
                                        </div>

                                        <p className="mt-0.5 hidden truncate text-[11px] font-medium text-slate-400 sm:block">
                                            Sistem pengelolaan dan monitoring pemeriksaan mesin
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* RIGHT */}
                            {/* <div className="flex items-center gap-2"> */}

                                {/* STATUS
                                <div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                    </span>

                                    <span className="text-[10px] font-bold text-emerald-600">
                                        Sistem Aktif
                                    </span>
                                </div> */}

                                {/* NOTIFICATION
                                <button
                                    type="button"
                                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                                    title="Notifikasi"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 01-2.31 6.022c1.74.64 3.56 1.09 5.453 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                        />
                                    </svg>
                                </button> */}

                            {/* </div> */}
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    CONTENT
                ====================================================== */}
                <div className="flex-1">

                    {/* GREETING */}
                    <div className="mx-auto max-w-[1800px] px-4 pt-6 sm:px-6 sm:pt-7">

                        <div className="flex items-center gap-2">

                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-500">
                                Dashboard Admin
                            </p>

                        </div>

                        <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
                            {greeting},{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Admin!
                            </span>{' '}
                            👋
                        </h2>

                        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                            Kelola dan pantau dokumen check sheet prediktif dengan mudah.
                        </p>
                    </div>

                    {/* =================================================
                        MAIN
                    ================================================== */}
                    <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-7">

                        {/* =================================================
                            TOOLBAR CARD
                        ================================================== */}
                        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">

                            {/* TOP GRADIENT */}
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                            {/* DECORATION */}
                            <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-100/40 blur-3xl" />
                            <div className="absolute -bottom-20 left-24 h-40 w-40 rounded-full bg-indigo-100/30 blur-3xl" />

                            <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                                {/* TITLE */}
                                <div className="flex min-w-0 items-center gap-4">

                                    <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
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

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h2 className="text-base font-extrabold tracking-tight text-slate-800 sm:text-lg">
                                                Data Check Sheet
                                            </h2>

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-600 ring-1 ring-blue-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                {checkSheets.length} Data
                                            </span>

                                        </div>

                                        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                                            Pengelolaan check sheet dan pemeriksaan mesin
                                        </p>

                                    </div>
                                </div>

                                {/* ADD BUTTON */}
                                <Link
                                    href="/check-sheets/create"
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-200"
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                    </span>

                                    Tambah Check Sheet
                                </Link>

                            </div>
                        </div>

                        {/* =================================================
                            TABLE CARD
                        ================================================== */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">

                            {/* TABLE TOP BAR */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-5 py-4 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-4.5 w-4.5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-xs font-extrabold text-slate-700 sm:text-sm">
                                            Daftar Check Sheet
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                            Data dokumen pemeriksaan mesin
                                        </p>
                                    </div>

                                </div>

                                <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 sm:inline-flex">
                                    Total {checkSheets.length}
                                </span>

                            </div>

                            {/* TABLE */}
                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[900px] text-sm">

                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800">

                                            <th className="w-16 px-5 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest text-blue-100">
                                                No
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest text-blue-100">
                                                Divisi
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest text-blue-100">
                                                Nomor Dokumen
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest text-blue-100">
                                                Nama Check Sheet
                                            </th>

                                            <th className="w-36 px-5 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest text-blue-100">
                                                Aksi
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {checkSheets.length > 0 ? (

                                            checkSheets.map((checkSheet, index) => (

                                                <tr
                                                    key={checkSheet.id}
                                                    className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/60 hover:via-indigo-50/30 hover:to-white"
                                                >

                                                    {/* NO */}
                                                    <td className="px-5 py-4 text-center">

                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 transition-all duration-200 group-hover:bg-blue-100 group-hover:text-blue-600">
                                                            {index + 1}
                                                        </span>

                                                    </td>

                                                    {/* DIVISI */}
                                                    <td className="px-5 py-4">

                                                        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-all duration-200 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-700">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                                                            {checkSheet.divisi?.nama_divisi || '-'}

                                                        </span>

                                                    </td>

                                                    {/* NOMOR DOKUMEN */}
                                                    <td className="px-5 py-4">

                                                        <span className="inline-flex items-center rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 font-mono text-xs font-bold text-blue-700">

                                                            {checkSheet.nomor_dokumen}

                                                        </span>

                                                    </td>

                                                    {/* NAMA */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-indigo-100 text-indigo-500">

                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.7"
                                                                    className="h-4 w-4"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                                                                    />

                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M8 8h8M8 12h8M8 16h5"
                                                                    />
                                                                </svg>

                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold text-slate-700">
                                                                    {checkSheet.nama_checksheet}
                                                                </p>

                                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                                    Dokumen pemeriksaan
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* AKSI */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center justify-center gap-2">

                                                            {/* BUKA */}
                                                            <Link
                                                                href={`/check-sheets/${checkSheet.id}`}
                                                                title="Buka Check Sheet"
                                                                className="group/action flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-200"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className="h-4 w-4 transition-transform duration-200 group-hover/action:scale-110"
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

                                                            {/* EDIT */}
                                                            <Link
                                                                href={`/check-sheets/${checkSheet.id}/edit`}
                                                                title="Edit Check Sheet"
                                                                className="group/action flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className="h-4 w-4 transition-transform duration-200 group-hover/action:scale-110"
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

                                                            {/* HAPUS */}
                                                            <button
                                                                type="button"
                                                                title="Hapus Check Sheet"
                                                                onClick={() => {
                                                                    if (
                                                                        window.confirm(
                                                                            'Apakah kamu yakin ingin menghapus Check Sheet ini?'
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            `/check-sheets/${checkSheet.id}`
                                                                        );
                                                                    }
                                                                }}
                                                                className="group/action flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className="h-4 w-4 transition-transform duration-200 group-hover/action:scale-110"
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

                                            /* =================================================
                                                EMPTY STATE
                                            ================================================== */
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-20 text-center"
                                                >

                                                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">

                                                        <div className="relative mb-5">

                                                            <div className="absolute inset-0 rounded-3xl bg-blue-100 blur-2xl" />

                                                            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 text-blue-500 shadow-sm ring-1 ring-blue-100">

                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.5"
                                                                    className="h-9 w-9"
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

                                                        </div>

                                                        <p className="text-base font-extrabold text-slate-700">
                                                            Belum ada Check Sheet
                                                        </p>

                                                        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                                                            Belum ada dokumen check sheet yang
                                                            tersedia. Tambahkan check sheet baru
                                                            untuk mulai melakukan pemeriksaan mesin.
                                                        </p>

                                                        <Link
                                                            href="/check-sheets/create"
                                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                                                        >
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
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

                                                </td>
                                            </tr>
                                        )}

                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </main>
                </div>

                {/* =====================================================
                    FOOTER
                ====================================================== */}
                <footer className="mt-auto border-t border-slate-200 bg-white">

                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-4 py-5 sm:px-6">

                        <p className="text-[11px] font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>

                    </div>

                </footer>

            </div>
        </>
    );
}