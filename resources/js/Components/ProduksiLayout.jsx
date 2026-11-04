
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

const ROLE_LABEL = {
    spv_produksi: 'SPV Produksi',
    operator_produksi: 'Operator Produksi',
};

const BADGE = {
    diajukan: 'bg-amber-100 text-amber-800 border-amber-200',
    disetujui: 'bg-blue-100 text-blue-800 border-blue-200',
    ditolak: 'bg-red-100 text-red-800 border-red-200',
    diterima: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dikerjakan: 'bg-violet-100 text-violet-800 border-violet-200',
    selesai: 'bg-teal-100 text-teal-800 border-teal-200',
    closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export function StatusBadge({ status, label }) {
    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
                BADGE[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {label ?? status}
        </span>
    );
}

export default function ProduksiLayout({ children }) {
    const page = usePage();
    const { auth, flash, rrfNotifications } = page.props;
    const user = auth.user;

    const [notifikasiTerbuka, setNotifikasiTerbuka] = useState(false);

    const jumlahBelumDibaca =
        rrfNotifications?.jumlah_belum_dibaca ?? 0;

    const daftarNotifikasi =
        rrfNotifications?.daftar ?? [];

    const adaNotifikasi = jumlahBelumDibaca > 0;

    const bacaNotifikasi = (notification) => {
        router.post(notification.read_url, {}, {
            preserveScroll: true,
            onFinish: () => setNotifikasiTerbuka(false),
        });
    };

    return (
        <>
            <style>{`
                @keyframes rrfGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes rrfFloat {
                    0%, 100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                    50% {
                        transform: translate3d(30px, -25px, 0) scale(1.08);
                    }
                }

                @keyframes rrfFloatReverse {
                    0%, 100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                    50% {
                        transform: translate3d(-30px, 25px, 0) scale(1.1);
                    }
                }

                @keyframes rrfRise {
                    from {
                        opacity: 0;
                        transform: translateY(14px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* ANIMASI LONCENG */
                @keyframes rrfBellShake {
                    0%, 100% {
                        transform: rotate(0deg);
                    }
                    10%, 30%, 50%, 70% {
                        transform: rotate(12deg);
                    }
                    20%, 40%, 60%, 80% {
                        transform: rotate(-12deg);
                    }
                    90% {
                        transform: rotate(0deg);
                    }
                }

                /* ANIMASI LINGKARAN DI BELAKANG LONCENG */
                @keyframes rrfNotificationPulse {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(1.65);
                        opacity: 0;
                    }
                }

                /* ANIMASI BADGE */
                @keyframes rrfBadgePop {
                    0% {
                        transform: scale(0);
                    }
                    60% {
                        transform: scale(1.25);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                @keyframes rrfBadgePulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.12);
                    }
                }

                .rrf-gradient {
                    background-size: 250% 250%;
                    animation: rrfGradient 20s ease infinite;
                }

                .rrf-float {
                    animation: rrfFloat 14s ease-in-out infinite;
                }

                .rrf-float-reverse {
                    animation: rrfFloatReverse 17s ease-in-out infinite;
                }

                .rrf-rise {
                    animation: rrfRise 0.6s ease-out both;
                }

                .rrf-bell-shake {
                    animation: rrfBellShake 1.1s ease-in-out infinite;
                    transform-origin: 50% 15%;
                }

                .rrf-notification-pulse {
                    animation: rrfNotificationPulse 1.8s ease-out infinite;
                }

                .rrf-badge-pop {
                    animation: rrfBadgePop 0.45s ease-out both,
                               rrfBadgePulse 1.5s ease-in-out 0.5s infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .rrf-gradient,
                    .rrf-float,
                    .rrf-float-reverse,
                    .rrf-rise,
                    .rrf-bell-shake,
                    .rrf-notification-pulse,
                    .rrf-badge-pop {
                        animation: none !important;
                    }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-800">

                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="rrf-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="rrf-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />

                    <div className="rrf-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />

                    <div className="rrf-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/55 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

                        {/* BRAND */}
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white shadow-lg">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                >
                                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                    <path d="M14 3v6h6" />
                                    <path d="M8 13h8M8 17h6" />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                    Repair Request Form
                                </p>

                                <p className="truncate text-[11px] text-white/65">
                                    {user.name}
                                    {' · '}
                                    {ROLE_LABEL[user.role] ?? user.role}
                                    {user.divisi ? ` · ${user.divisi}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex shrink-0 items-center gap-2">

                            {/* NOTIFICATION */}
                            <div className="relative">

                                <button
                                    type="button"
                                    onClick={() => setNotifikasiTerbuka((prev) => !prev)}
                                    className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all duration-300 hover:bg-white/20 ${
                                        adaNotifikasi
                                            ? 'border-blue-300/50 shadow-[0_0_18px_rgba(59,130,246,0.4)]'
                                            : ''
                                    }`}
                                    aria-label={`Notifikasi ${jumlahBelumDibaca} belum dibaca`}
                                    title="Notifikasi"
                                >

                                    {/* PULSE DI BELAKANG LONCENG */}
                                    {adaNotifikasi && (
                                        <span className="rrf-notification-pulse pointer-events-none absolute inset-1 rounded-xl border border-blue-300/80 bg-blue-400/20" />
                                    )}

                                    {/* ICON LONCENG */}
                                    <span className={`relative z-10 flex items-center justify-center ${
                                        adaNotifikasi ? 'rrf-bell-shake' : ''
                                    }`}>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className={`h-5 w-5 ${
                                                adaNotifikasi
                                                    ? 'text-blue-200'
                                                    : 'text-white'
                                            }`}
                                        >
                                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                            <path d="M10 21h4" />
                                        </svg>
                                    </span>

                                    {/* BADGE JUMLAH */}
                                    {adaNotifikasi && (
                                        <span
                                            key={jumlahBelumDibaca}
                                            className="rrf-badge-pop absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#030a26] bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-lg shadow-red-500/40"
                                        >
                                            {jumlahBelumDibaca > 99
                                                ? '99+'
                                                : jumlahBelumDibaca}
                                        </span>
                                    )}
                                </button>

                                {notifikasiTerbuka && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Tutup notifikasi"
                                            className="fixed inset-0 z-40 cursor-default"
                                            onClick={() => setNotifikasiTerbuka(false)}
                                        />

                                        <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-extrabold text-slate-800">
                                                        Notifikasi
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {jumlahBelumDibaca} belum dibaca
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setNotifikasiTerbuka(false)}
                                                    className="cursor-pointer rounded-lg px-2 py-1 text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="max-h-[380px] overflow-y-auto">
                                                {daftarNotifikasi.length === 0 ? (
                                                    <div className="px-4 py-10 text-center">
                                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.7"
                                                                className="h-6 w-6"
                                                            >
                                                                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                                                <path d="M10 21h4" />
                                                            </svg>
                                                        </div>

                                                        <p className="text-sm font-semibold text-slate-600">
                                                            Belum ada notifikasi
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Notifikasi RRF akan muncul di sini.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    daftarNotifikasi.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => bacaNotifikasi(item)}
                                                            className={`flex w-full cursor-pointer gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-blue-50 ${
                                                                !item.dibaca
                                                                    ? 'bg-blue-50/70'
                                                                    : 'bg-white'
                                                            }`}
                                                        >
                                                            <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                                !item.dibaca
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className="h-4 w-4"
                                                                >
                                                                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                                                    <path d="M14 3v6h6" />
                                                                    <path d="M8 13h8M8 17h6" />
                                                                </svg>
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className="text-xs font-extrabold text-slate-800">
                                                                        {item.judul}
                                                                    </p>

                                                                    {!item.dibaca && (
                                                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                                    )}
                                                                </div>

                                                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                                                    {item.pesan}
                                                                </p>

                                                                {item.rrf_no && (
                                                                    <p className="mt-1 text-[11px] font-bold text-blue-700">
                                                                        {item.rrf_no}
                                                                    </p>
                                                                )}

                                                                <p className="mt-1 text-[10px] text-slate-400">
                                                                    {item.waktu}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* LOGOUT */}
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-red-300/25 bg-red-500/15 px-3.5 py-2.5 text-xs font-bold text-white transition hover:border-red-300/50 hover:bg-red-500/30 sm:px-4"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                >
                                    <path d="M10 17l5-5-5-5" />
                                    <path d="M15 12H3" />
                                    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

                    {flash?.success && (
                        <div className="rrf-rise mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg shadow-emerald-950/10">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                ✓
                            </span>
                            {flash.success}
                        </div>
                    )}

                    <div className="rrf-rise">
                        {children}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-xs font-medium text-white/60">
                            © {new Date().getFullYear()} Repair Request Form
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
