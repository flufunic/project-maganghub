import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Pimpinan/Sidebar';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
------------------------------------------------------------------ */
const ICONS = {
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    document: {
        paths: [
            'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z',
            'M14 3v5h5',
        ],
    },
    plus: { paths: ['M12 6v12m6-6H6'] },
    clock: { paths: ['M12 7v5l3 2'], circle: true },
    check: { paths: ['m8 12 2.5 2.5L16 9'], circle: true },
    calendar: {
        paths: [
            'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
        ],
    },
    chevron: { sw: 2, paths: ['M9 5l7 7-7 7'] },
    x: { sw: 3, paths: ['M6 18 18 6M6 6l12 12'] },
    clockSmall: { sw: 3, paths: ['M12 7v5l3 2'], circle: true },
    tick: { sw: 3, paths: ['m5 13 4 4L19 7'] },
    revisi: {
        sw: 2,
        paths: [
            'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z',
        ],
    },
};

function Icon({ type, className = 'h-5 w-5', strokeWidth }) {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth ?? icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.circle && <circle cx="12" cy="12" r="9" />}
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

export default function Index({
    user,
    pengirimans = [],
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // semua | menunggu | diperiksa
    const [filter, setFilter] = useState('semua');

    const totalPengiriman = pengirimans.length;

    const totalMenunggu = pengirimans.filter(
        (item) => item.status === 'menunggu'
    ).length;

    const totalDiperiksa = pengirimans.filter(
        (item) => item.status === 'diperiksa'
    ).length;

    const daftar =
        filter === 'semua'
            ? pengirimans
            : pengirimans.filter((item) => item.status === filter);

    // Klik kartu yang sedang aktif -> kembali ke semua
    const pilihFilter = (nilai) => {
        setFilter((sekarang) =>
            sekarang === nilai || nilai === 'semua' ? 'semua' : nilai
        );
    };

    const judulTabel =
        filter === 'menunggu'
            ? 'Menunggu Diperiksa'
            : filter === 'diperiksa'
              ? 'Sudah Diperiksa'
              : 'Riwayat Pengiriman';

    // ============================================
    // DATA KARTU STATISTIK (tampilan saja)
    // ============================================
    const statCards = [
        {
            key: 'semua',
            label: 'Total Pengiriman',
            value: totalPengiriman,
            hint: 'Seluruh data yang dikirim',
            icon: 'plus',
            border: 'border-blue-100',
            accent: 'from-blue-400 to-blue-600',
            iconBox: 'bg-blue-50 text-blue-600',
            valueClass: 'text-slate-800',
            track: 'bg-blue-50',
            bar: 'bg-blue-500',
            width: '100%',
        },
        {
            key: 'menunggu',
            label: 'Menunggu Diperiksa',
            value: totalMenunggu,
            hint: 'Belum diperiksa pimpinan',
            icon: 'clock',
            border: 'border-amber-100',
            accent: 'from-amber-400 to-orange-500',
            iconBox: 'bg-amber-50 text-amber-600',
            valueClass: 'text-amber-600',
            track: 'bg-amber-50',
            bar: 'bg-amber-400',
            width:
                totalPengiriman > 0
                    ? `${(totalMenunggu / totalPengiriman) * 100}%`
                    : '0%',
        },
        {
            key: 'diperiksa',
            label: 'Sudah Diperiksa',
            value: totalDiperiksa,
            hint: 'Telah diperiksa pimpinan',
            icon: 'check',
            border: 'border-emerald-100',
            accent: 'from-emerald-400 to-green-600',
            iconBox: 'bg-emerald-50 text-emerald-600',
            valueClass: 'text-emerald-600',
            track: 'bg-emerald-50',
            bar: 'bg-emerald-500',
            width:
                totalPengiriman > 0
                    ? `${(totalDiperiksa / totalPengiriman) * 100}%`
                    : '0%',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            {/* SIDEBAR */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <style>{`
                @keyframes pmpGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes pmpFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes pmpFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }

                .pmp-gradient {
                    background-size: 250% 250%;
                    animation: pmpGradient 20s ease infinite;
                }
                .pmp-float { animation: pmpFloat 14s ease-in-out infinite; }
                .pmp-float-reverse { animation: pmpFloatReverse 17s ease-in-out infinite; }

                .pmp-scroll::-webkit-scrollbar { height: 8px; }
                .pmp-scroll::-webkit-scrollbar-track { background: transparent; }
                .pmp-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .pmp-gradient,
                    .pmp-float,
                    .pmp-float-reverse { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">

                {/* =====================================================
                    BACKGROUND
                ====================================================== */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="pmp-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="pmp-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="pmp-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="pmp-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* =====================================================
                    HEADER (TRANSPARAN)
                ====================================================== */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">

                        <div className="flex items-center gap-3">

                            {/* HAMBURGER */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition-colors duration-200 hover:bg-white/25"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            {/* JUDUL */}
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white">
                                    Dashboard 
                                </h1>

                                <p className="hidden text-xs text-white/65 sm:block">
                                    Sistem Schedule Preventif
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    CONTENT
                ====================================================== */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">

                    {/* =================================================
                        JUDUL DATA
                    ================================================== */}
                    <div className="mb-5">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Data Preventif Mesin
                                </h2>

                                <p className="mt-0.5 text-sm text-blue-100/90">
                                    Data yang telah dikirim oleh Admin untuk diperiksa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        STAT CARDS (bisa diklik untuk filter)
                    ================================================== */}
                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {statCards.map((card) => {
                            const aktif = filter === card.key;

                            return (
                                <button
                                    key={card.key}
                                    type="button"
                                    onClick={() => pilihFilter(card.key)}
                                    aria-pressed={aktif}
                                    className={`relative cursor-pointer overflow-hidden rounded-2xl border bg-white/[0.93] p-5 text-left shadow-[0_16px_45px_rgba(2,6,23,0.30)] backdrop-blur-2xl transition-colors duration-200 hover:bg-white ${card.border} ${
                                        aktif ? 'ring-2 ring-white' : ''
                                    }`}
                                >
                                    <div
                                        className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${card.accent}`}
                                    />

                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                {card.label}
                                            </p>

                                            <p
                                                className={`mt-2 text-3xl font-bold ${card.valueClass}`}
                                            >
                                                {card.value}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {card.hint}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBox}`}
                                        >
                                            <Icon type={card.icon} className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <div
                                        className={`mt-4 h-1.5 overflow-hidden rounded-full ${card.track}`}
                                    >
                                        <div
                                            className={`h-full rounded-full ${card.bar}`}
                                            style={{ width: card.width }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* =================================================
                        RIWAYAT PENGIRIMAN
                    ================================================== */}
                    <div className={`overflow-hidden rounded-3xl ${glassCard}`}>

                        {/* TABLE HEADER */}
                        <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <Icon type="calendar" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        {judulTabel}
                                    </h3>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Daftar data preventif yang dikirim oleh Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {daftar.length} Pengiriman
                            </div>
                        </div>

                        {/* EMPTY STATE */}
                        {daftar.length === 0 ? (

                            <div className="px-6 py-16 text-center">

                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                    <Icon
                                        type="document"
                                        className="h-8 w-8 text-slate-400"
                                    />
                                </div>

                                <h3 className="font-semibold text-slate-700">
                                    Belum ada data
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {filter === 'semua'
                                        ? 'Belum ada data preventif yang dikirim oleh Admin.'
                                        : 'Tidak ada data pada kategori ini.'}
                                </p>
                            </div>

                        ) : (

                            /* TABLE */
                            <div className="pmp-scroll overflow-x-auto">

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

                                    <tbody className="divide-y divide-slate-200/60">

                                        {daftar.map((item, index) => (

                                            <tr
                                                key={item.id}
                                                className="group transition-colors duration-200 hover:bg-blue-50/60"
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

                                                {/* STATUS + REVISI */}
                                                <td className="px-6 py-4">

                                                    <div className="flex flex-col items-start gap-2">

                                                        {item.status === 'diperiksa' ? (

                                                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                                    <Icon type="tick" className="h-2.5 w-2.5" />
                                                                </span>

                                                                Sudah Diperiksa
                                                            </span>

                                                        ) : item.status === 'ditolak' ? (

                                                            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
                                                                    <Icon type="x" className="h-2.5 w-2.5" />
                                                                </span>

                                                                Ditolak
                                                            </span>

                                                        ) : (

                                                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white">
                                                                    <Icon type="clockSmall" className="h-2.5 w-2.5" />
                                                                </span>

                                                                Menunggu Diperiksa
                                                            </span>

                                                        )}

                                                        {/* BADGE REVISI (hanya kalau ada revisi) */}
                                                        {(item.jumlah_revisi ?? 0) > 0 && (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                                                    <Icon type="revisi" className="h-3.5 w-3.5" />

                                                                    Ada Revisi ({item.jumlah_revisi})

                                                                    {(item.revisi_baru ?? 0) > 0 && (
                                                                        <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                                                                            {item.revisi_baru} baru
                                                                        </span>
                                                                    )}
                                                                </span>

                                                                {item.revisi_terakhir && (
                                                                    <p className="mt-1 pl-1 text-[11px] text-slate-400">
                                                                        Direvisi: {item.revisi_terakhir}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* AKSI */}
                                                <td className="px-6 py-4 text-center">
                                                    <Link
                                                        href={`/pimpinan/pengiriman/${item.id}`}
                                                        className="group/btn inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-300/50 transition-all duration-200 hover:from-blue-700 hover:to-indigo-800 hover:shadow-md"
                                                    >
                                                        Lihat Data

                                                        <Icon
                                                            type="chevron"
                                                            className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                                                        />
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
                    FOOTER (TRANSPARAN)
                ====================================================== */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}