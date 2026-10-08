import React, { useState } from 'react';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
------------------------------------------------------------------ */
const ICONS = {
    logo: {
        paths: ['M3 21h18M5 21V7l7-4 7 4v14M9 21v-7h6v7M9 10h.01M15 10h.01'],
    },
    close: { sw: 2, paths: ['M6 18L18 6M6 6l12 12'] },
    chevron: { sw: 2, paths: ['M9 5l7 7-7 7'] },
    preventif: {
        paths: [
            'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
            'M9 5a3 3 0 016 0v1H9V5z',
            'M9 13h6M9 17h4',
        ],
    },
    checksheet: {
        paths: [
            'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
            'M9 5a3 3 0 016 0v1H9V5z',
            'M9 13l2 2 4-4',
        ],
    },
    logout: {
        paths: [
            'M15 12H3',
            'M8 7l-5 5 5 5',
            'M21 19V5a2 2 0 00-2-2h-6a2 2 0 00-2 2v2',
        ],
    },
};

function Icon({ type, className = 'h-5 w-5' }) {
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
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| MENU  (data tampilan; navigasi tetap window.location.href)
------------------------------------------------------------------ */
const MENUS = [
    {
        href: '/preventif-mesin',
        icon: 'preventif',
        label: 'Preventif Mesin',
        desc: 'Maintenance schedule',
        active: true,
    },
    {
        href: '/check-sheets',
        icon: 'checksheet',
        label: 'Check Sheet Prediktif',
        desc: 'Check sheet maintenance',
        active: false,
    },
];

export default function Sidebar({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0 z-[90] bg-[#030a26]/60 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[280px] flex-col overflow-hidden border-r border-white/15 bg-gradient-to-b from-[#050f3a]/95 via-[#0a2260]/95 to-[#0c2a78]/95 text-white shadow-[0_0_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* DECORATION */}
                <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-400/25 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/25 blur-[80px]" />

                {/* =========================================
                    HEADER SIDEBAR
                ========================================== */}
                <div className="relative border-b border-white/10 px-5 pb-5 pt-5">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">

                            {/* LOGO */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 rounded-2xl bg-blue-400/40 blur-xl" />
                                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-lg">
                                    <Icon type="logo" className="h-5 w-5" />
                                </div>
                            </div>

                            {/* TITLE */}
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold tracking-tight text-white">
                                    Sistem X
                                </h2>

                                <p className="mt-0.5 text-[11px] font-medium text-blue-200/70">
                                    Maintenance Management
                                </p>
                            </div>
                        </div>

                        {/* CLOSE */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                            title="Tutup"
                        >
                            <Icon type="close" className="h-4.5 w-4.5" />
                        </button>
                    </div>

                    {/* STATUS */}
                    <div className="mt-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-50 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                            Sistem aktif
                        </span>
                    </div>
                </div>

                {/* =========================================
                    MENU
                ========================================== */}
                <nav className="relative flex-1 overflow-y-auto px-3 py-5">

                    {/* SECTION TITLE */}
                    <div className="mb-3 flex items-center gap-2 px-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]" />

                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-200/60">
                            Sistem
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        {MENUS.map((menu) => (
                            <button
                                key={menu.href}
                                type="button"
                                onClick={() => {
                                    window.location.href = menu.href;
                                    onClose();
                                }}
                                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                                    menu.active
                                        ? 'border border-white/20 bg-white/15 shadow-lg shadow-blue-950/30'
                                        : 'border border-transparent hover:border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {/* ACCENT */}
                                {menu.active && (
                                    <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-indigo-400" />
                                )}

                                {/* ICON */}
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                                        menu.active
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                                            : 'bg-white/10 text-blue-100/80 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-900/40'
                                    }`}
                                >
                                    <Icon type={menu.icon} className="h-5 w-5" />
                                </div>

                                {/* TEXT */}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`truncate text-[13px] font-semibold ${
                                            menu.active
                                                ? 'text-white'
                                                : 'text-blue-50/90 group-hover:text-white'
                                        }`}
                                    >
                                        {menu.label}
                                    </p>

                                    <p
                                        className={`mt-0.5 truncate text-[11px] ${
                                            menu.active
                                                ? 'text-blue-200'
                                                : 'text-blue-200/50 group-hover:text-blue-200/80'
                                        }`}
                                    >
                                        {menu.desc}
                                    </p>
                                </div>

                                {/* ARROW */}
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-blue-100 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                                    <Icon type="chevron" className="h-3.5 w-3.5" />
                                </div>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* =========================================
                    FOOTER
                ========================================== */}
                <div className="relative border-t border-white/10 p-4">

                    {/* LOGOUT */}
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-red-300/20 hover:bg-red-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        {/* ICON */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-950/40 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-red-950/50">
                            <Icon type="logout" className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                            <p className="text-[13px] font-semibold text-red-200 group-hover:text-white">
                                Logout
                            </p>

                            <p className="mt-0.5 text-[11px] text-red-200/50 transition group-hover:text-red-100/80">
                                Keluar dari sistem
                            </p>
                        </div>

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-red-200 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                            <Icon type="chevron" className="h-4 w-4" />
                        </div>
                    </button>
                </div>
            </aside>

            {/* =========================================
                MODAL KONFIRMASI LOGOUT
            ========================================== */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">

                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                    >

                        {/* TOP DECORATION */}
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

                        <div className="px-6 pb-6 pt-8">

                            {/* ICON */}
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                                <div className="absolute inset-0 rounded-2xl bg-red-200 blur-xl" />

                                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-300/50">
                                    <Icon type="logout" className="h-6 w-6" />
                                </div>
                            </div>

                            {/* TEXT */}
                            <div className="mt-5 text-center">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    Konfirmasi Logout
                                </h3>

                                <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-slate-500">
                                    Apakah kamu yakin ingin keluar dari sistem?
                                </p>
                            </div>

                            {/* BUTTON */}
                            <div className="mt-7 flex gap-3">

                                {/* BATAL */}
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                                >
                                    Batal
                                </button>

                                {/* LOGOUT */}
                                <form
                                    method="POST"
                                    action="/logout"
                                    className="flex-1"
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={document
                                            .querySelector(
                                                'meta[name="csrf-token"]'
                                            )
                                            ?.getAttribute('content')}
                                    />

                                    <button
                                        type="submit"
                                        className="w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700 hover:shadow-lg"
                                    >
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
