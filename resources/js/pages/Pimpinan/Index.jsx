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
    documentCheck: {
        paths: [
            'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z',
            'M14 3v5h5',
            'm9 8 1.5 1.5L13 7',
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

    // ============================================
    // DATA KARTU STATISTIK (tampilan saja)
    // ============================================
    const statCards = [
        {
            label: 'Total Pengiriman',
            value: totalPengiriman,
            hint: 'Seluruh data yang dikirim',
            icon: 'plus',
            border: 'border-blue-100',
            hover: 'hover:shadow-blue-200/60',
            accent: 'from-blue-400 to-blue-600',
            iconBox: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
            valueClass: 'text-slate-800',
            track: 'bg-blue-50',
            bar: 'bg-blue-500',
            width: '100%',
        },
        {
            label: 'Menunggu Diperiksa',
            value: totalMenunggu,
            hint: 'Belum diperiksa pimpinan',
            icon: 'clock',
            border: 'border-amber-100',
            hover: 'hover:shadow-amber-200/60',
            accent: 'from-amber-400 to-orange-500',
            iconBox: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
            valueClass: 'text-amber-600',
            track: 'bg-amber-50',
            bar: 'bg-amber-400',
            width:
                totalPengiriman > 0
                    ? `${(totalMenunggu / totalPengiriman) * 100}%`
                    : '0%',
        },
        {
            label: 'Sudah Diperiksa',
            value: totalDiperiksa,
            hint: 'Telah diperiksa pimpinan',
            icon: 'check',
            border: 'border-emerald-100',
            hover: 'hover:shadow-emerald-200/60',
            accent: 'from-emerald-400 to-green-600',
            iconBox: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
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
            <Head title="Dashboard Pimpinan" />

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
                @keyframes pmpRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .pmp-gradient {
                    background-size: 250% 250%;
                    animation: pmpGradient 20s ease infinite;
                }
                .pmp-float { animation: pmpFloat 14s ease-in-out infinite; }
                .pmp-float-reverse { animation: pmpFloatReverse 17s ease-in-out infinite; }
                .pmp-rise { animation: pmpRise 0.7s ease-out both; }

                .pmp-scroll::-webkit-scrollbar { height: 8px; }
                .pmp-scroll::-webkit-scrollbar-track { background: transparent; }
                .pmp-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .pmp-gradient,
                    .pmp-float,
                    .pmp-float-reverse,
                    .pmp-rise { animation: none !important; }
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
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

                        {/* KIRI */}
                        <div className="flex items-center gap-3">

                            {/* HAMBURGER */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg hover:shadow-blue-900/30"
                                aria-label="Buka menu"
                            >
                                <Icon
                                    type="menu"
                                    className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                                />
                            </button>

                            {/* JUDUL */}
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white">
                                    Dashboard Pimpinan
                                </h1>

                                <p className="hidden text-xs text-white/65 sm:block">
                                    Sistem Schedule Preventif
                                </p>
                            </div>
                        </div>

                        {/* KANAN */}
                        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-1.5 pl-4 pr-1.5 backdrop-blur-md">

                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-white">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-blue-200">
                                    Pimpinan
                                </p>
                            </div>

                            {/* AVATAR */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white shadow-md">
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
                    <div className="pmp-rise relative mb-7 overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-r from-white/20 via-white/10 to-white/5 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.30)] backdrop-blur-xl sm:p-8">

                        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />
                        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                        <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-indigo-400/20 blur-3xl" />

                        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div>
                                {/* Status */}
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                                    </span>
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
                            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm sm:flex">
                                <Icon
                                    type="documentCheck"
                                    className="h-10 w-10 text-white"
                                    strokeWidth={1.6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        JUDUL DATA
                    ================================================== */}
                    <div className="mb-5">
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white backdrop-blur-sm">
                                <Icon type="document" className="h-5 w-5" strokeWidth={2} />
                            </div>

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
                        STAT CARDS
                    ================================================== */}
                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {statCards.map((card, index) => (
                            <div
                                key={card.label}
                                style={{ animationDelay: `${index * 90}ms` }}
                                className={`pmp-rise group relative overflow-hidden rounded-2xl border bg-white/[0.93] p-5 shadow-[0_16px_45px_rgba(2,6,23,0.30)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl ${card.border} ${card.hover}`}
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
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${card.iconBox}`}
                                    >
                                        <Icon type={card.icon} className="h-6 w-6" />
                                    </div>
                                </div>

                                <div
                                    className={`mt-4 h-1.5 overflow-hidden rounded-full ${card.track}`}
                                >
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${card.bar}`}
                                        style={{ width: card.width }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* =================================================
                        RIWAYAT PENGIRIMAN
                    ================================================== */}
                    <div
                        style={{ animationDelay: '300ms' }}
                        className={`pmp-rise overflow-hidden rounded-3xl ${glassCard}`}
                    >

                        {/* TABLE HEADER */}
                        <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <Icon type="calendar" className="h-5 w-5" />
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

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {totalPengiriman} Pengiriman
                            </div>
                        </div>

                        {/* EMPTY STATE */}
                        {pengirimans.length === 0 ? (

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
                                    Belum ada data preventif yang dikirim oleh Admin.
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

                                        {pengirimans.map((item, index) => (

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

                                                {/* STATUS */}
                                                <td className="px-6 py-4">

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
                                                </td>

                                                {/* AKSI */}
                                                <td className="px-6 py-4 text-center">
                                                    <Link
                                                        href={`/pimpinan/pengiriman/${item.id}`}
                                                        className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-md"
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
