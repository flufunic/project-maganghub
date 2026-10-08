import Sidebar from '@/Components/Sidebar';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
------------------------------------------------------------------ */
const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4'],
    },
    list: { paths: ['M6 4.5h12M6 8.5h12M6 12.5h8M6 16.5h10'] },
    eye: {
        paths: [
            'M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.05.153.05.316 0 .469C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z',
            'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        ],
    },
    edit: {
        paths: [
            'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
            'M15 5l4 4',
        ],
    },
    trash: {
        paths: [
            'M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5',
            'M10 11v5.5M14 11v5.5',
        ],
    },
    sheet: {
        paths: [
            'M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z',
            'M8 8h8M8 12h8M8 16h5',
        ],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.rect && <rect {...icon.rect} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

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

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes idxFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient,
                    .idx-float,
                    .idx-float-reverse,
                    .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">

                {/* =====================================================
                    BACKGROUND
                ====================================================== */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* =====================================================
                    HEADER (TRANSPARAN)
                ====================================================== */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-3.5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-3">

                                {/* HAMBURGER */}
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(true)}
                                    className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg hover:shadow-blue-900/30"
                                    title="Menu"
                                >
                                    <Icon
                                        type="menu"
                                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                                    />
                                </button>

                                {/* ICON */}
                                <div className="relative hidden shrink-0 sm:block">
                                    <div className="absolute inset-0 rounded-2xl bg-blue-400/40 blur-xl" />
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg">
                                        <Icon
                                            type="clipboard"
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>

                                {/* TITLE */}
                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                                        Check Sheet Prediktif
                                    </h1>

                                    <p className="mt-0.5 truncate text-xs text-white/65 sm:text-sm">
                                        Sistem pengelolaan dan monitoring pemeriksaan mesin
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    GREETING
                ====================================================== */}
                <div className="mx-auto w-full max-w-[1800px] px-4 pt-6 sm:px-6">
                    <div className="idx-rise relative overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-r from-white/20 via-white/10 to-white/5 px-6 py-5 shadow-[0_20px_50px_rgba(2,6,23,0.30)] backdrop-blur-xl">

                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
                        <div className="absolute -bottom-14 right-24 h-32 w-32 rounded-full bg-indigo-300/20 blur-3xl" />

                        <div className="relative flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Dashboard Admin
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                                    {greeting}, Admin! 👋
                                </h2>

                                <p className="mt-1 text-xs text-blue-100/90 sm:text-sm">
                                    Kelola dan pantau dokumen check sheet prediktif dengan mudah.
                                </p>
                            </div>

                            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl backdrop-blur-sm sm:flex">
                                📋
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-6 sm:px-6">

                    {/* TOOLBAR */}
                    <div
                        style={{ animationDelay: '100ms' }}
                        className={`idx-rise mb-6 overflow-hidden rounded-3xl ${glassCard}`}
                    >
                        <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">

                            {/* LEFT - INFO DATA */}
                            <div className="flex min-w-0 items-center gap-4">

                                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-lg shadow-blue-300/50">
                                    <div className="absolute inset-0 rounded-2xl bg-white/10" />

                                    <Icon
                                        type="clipboard"
                                        className="relative h-6 w-6"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                                            Data Check Sheet
                                        </h2>

                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            {checkSheets.length} Data
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                        Pengelolaan check sheet dan pemeriksaan mesin
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT - ADD BUTTON */}
                            <Link
                                href="/check-sheets/create"
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15">
                                    <Icon
                                        type="plus"
                                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90"
                                    />
                                </span>

                                Tambah Check Sheet
                            </Link>
                        </div>

                        {/* ACCENT LINE */}
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </div>

                    {/* TABLE */}
                    <div
                        style={{ animationDelay: '200ms' }}
                        className={`idx-rise overflow-hidden rounded-3xl ${glassCard}`}
                    >
                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">

                                <thead className="text-white">
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900">

                                        {[
                                            { label: 'No', cls: 'w-16 text-center', dot: 'bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]' },
                                            { label: 'Divisi', cls: 'text-left', dot: 'bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]' },
                                            { label: 'Nomor Dokumen', cls: 'text-left', dot: 'bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]' },
                                            { label: 'Nama Check Sheet', cls: 'text-left', dot: 'bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]' },
                                            { label: 'Aksi', cls: 'w-40 text-center', dot: 'bg-violet-300 shadow-[0_0_6px_rgba(196,181,253,0.8)]' },
                                        ].map((header) => (
                                            <th
                                                key={header.label}
                                                className={`border-b border-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${header.cls}`}
                                            >
                                                <div
                                                    className={`flex items-center gap-2 ${
                                                        header.cls.includes('text-left')
                                                            ? 'justify-start'
                                                            : 'justify-center'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${header.dot}`} />
                                                    {header.label}
                                                </div>
                                            </th>
                                        ))}

                                    </tr>
                                </thead>

                                <tbody>

                                    {checkSheets.length > 0 ? (

                                        checkSheets.map((checkSheet, index) => (

                                            <tr
                                                key={checkSheet.id}
                                                className="group transition-colors hover:bg-blue-50/50"
                                            >

                                                {/* NO */}
                                                <td className="border-b border-slate-200 px-5 py-3.5 text-center">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-600">
                                                        {index + 1}
                                                    </span>
                                                </td>

                                                {/* DIVISI */}
                                                <td className="border-b border-slate-200 px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors duration-200 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                        {checkSheet.divisi?.nama_divisi || '-'}
                                                    </span>
                                                </td>

                                                {/* NOMOR DOKUMEN */}
                                                <td className="border-b border-slate-200 px-5 py-3.5">
                                                    <span className="inline-flex items-center rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 font-mono text-xs font-bold text-blue-700 shadow-sm">
                                                        {checkSheet.nomor_dokumen}
                                                    </span>
                                                </td>

                                                {/* NAMA */}
                                                <td className="border-b border-slate-200 px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-indigo-100 text-indigo-500 shadow-sm">
                                                            <Icon type="sheet" className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-slate-700">
                                                                {checkSheet.nama_checksheet}
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                Dokumen pemeriksaan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* AKSI */}
                                                <td className="border-b border-slate-200 px-3 py-3.5">
                                                    <div className="flex items-center justify-center gap-1.5">

                                                        {/* BUKA */}
                                                        <Link
                                                            href={`/check-sheets/${checkSheet.id}`}
                                                            title="Buka Check Sheet"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md"
                                                        >
                                                            <Icon type="eye" className="h-4 w-4" />
                                                        </Link>

                                                        {/* EDIT */}
                                                        <Link
                                                            href={`/check-sheets/${checkSheet.id}/edit`}
                                                            title="Edit Check Sheet"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
                                                        >
                                                            <Icon type="edit" className="h-4 w-4" />
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
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md"
                                                        >
                                                            <Icon type="trash" className="h-4 w-4" />
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        ))

                                    ) : (

                                        /* EMPTY STATE */
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center">

                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                        <Icon
                                                            type="clipboard"
                                                            className="h-7 w-7 text-slate-400"
                                                        />
                                                    </div>

                                                    <p className="font-semibold text-slate-700">
                                                        Belum ada Check Sheet
                                                    </p>

                                                    <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-400">
                                                        Belum ada dokumen check sheet yang
                                                        tersedia. Tambahkan check sheet baru
                                                        untuk mulai melakukan pemeriksaan mesin.
                                                    </p>

                                                    <Link
                                                        href="/check-sheets/create"
                                                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg"
                                                    >
                                                        <Icon type="plus" className="h-4 w-4" />
                                                        Tambah Check Sheet
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>

                        {/* BOTTOM BAR */}
                        {checkSheets.length > 0 && (
                            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-5 py-4">
                                <p className="text-sm text-slate-500">
                                    Total{' '}
                                    <span className="font-semibold text-slate-700">
                                        {checkSheets.length}
                                    </span>{' '}
                                    check sheet
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* =====================================================
                    FOOTER (TRANSPARAN)
                ====================================================== */}
                <footer className="mt-4 border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-[1800px] items-center justify-center px-6 py-4 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
