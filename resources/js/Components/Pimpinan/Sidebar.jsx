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
    dashboard: {
        paths: [
            'M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14',
            'M4 19h16',
            'M8 15v-3M12 15V8M16 15v-5',
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

export default function Sidebar({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            {/* =====================================================
                BACKDROP
            ====================================================== */}
            {open && (
                <div
                    className="fixed inset-0 z-[90] bg-[#030a26]/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* =====================================================
                SIDEBAR
            ====================================================== */}
            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[290px] flex-col overflow-hidden border-r border-white/15 bg-gradient-to-b from-[#050f3a]/95 via-[#0a2260]/95 to-[#0c2a78]/95 text-white shadow-[0_0_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >

                {/* TOP DECORATION */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                {/* GLOW */}
                <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-400/25 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/25 blur-[80px]" />

                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="relative border-b border-white/10 px-5 pb-5 pt-6">

                    <div className="flex items-center justify-between">

                        {/* BRAND */}
                        <div className="flex items-center gap-3">

                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl bg-blue-400/40 blur-xl" />

                                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-lg">
                                    <Icon type="logo" className="h-6 w-6" />
                                </div>

                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a2260] bg-emerald-400 shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                            </div>

                            <div>
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
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-95"
                            title="Tutup"
                        >
                            <Icon type="close" className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* =================================================
                    MENU
                ================================================== */}
                <nav className="relative flex-1 overflow-y-auto px-4 py-6">

                    {/* SECTION TITLE */}
                    <div className="mb-3 flex items-center gap-2 px-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-200/60">
                            Menu Utama
                        </span>

                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* DASHBOARD PIMPINAN */}
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/pimpinan';
                            onClose();
                        }}
                        className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/20 bg-white/15 px-3 py-3 text-left shadow-lg shadow-blue-950/30 transition-all duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >

                        {/* ACTIVE BAR */}
                        <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-indigo-400" />

                        {/* ICON */}
                        <div className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/40 transition-transform duration-200 group-hover:scale-105">
                            <Icon type="dashboard" className="h-5 w-5" />
                        </div>

                        {/* TEXT */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                                Dashboard Pimpinan
                            </p>

                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200">
                                Approval & monitoring
                            </p>
                        </div>

                        {/* ARROW */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-blue-100 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                            <Icon type="chevron" className="h-4 w-4" />
                        </div>
                    </button>
                </nav>

                {/* =================================================
                    BOTTOM / LOGOUT
                ================================================== */}
                <div className="relative border-t border-white/10 p-4">

                    {/* LOGOUT */}
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-red-300/20 hover:bg-red-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-950/40 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-red-950/50">
                            <Icon type="logout" className="h-5 w-5" />
                        </div>

                        <span className="flex-1 text-sm font-semibold text-red-200 group-hover:text-white">
                            Logout
                        </span>

                        <Icon
                            type="chevron"
                            className="h-4 w-4 text-red-200 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                    </button>
                </div>
            </aside>

            {/* =====================================================
                MODAL KONFIRMASI LOGOUT
            ====================================================== */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">

                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                    >

                        {/* TOP DECORATION */}
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

                        {/* MODAL TOP */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-white px-6 pb-5 pt-8">

                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-red-100/60" />

                            <div className="relative flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-red-200 blur-xl" />

                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-300/50">
                                        <Icon type="logout" className="h-7 w-7" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-4 text-center">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    Konfirmasi Logout
                                </h3>

                                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                    Apakah kamu yakin ingin keluar dari
                                    sistem?
                                </p>
                            </div>
                        </div>

                        {/* MODAL BUTTON */}
                        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">

                            {/* BATAL */}
                            <button
                                type="button"
                                onClick={() =>
                                    setShowLogoutModal(false)
                                }
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
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
                                    value={
                                        document
                                            .querySelector(
                                                'meta[name="csrf-token"]'
                                            )
                                            ?.getAttribute(
                                                'content'
                                            )
                                    }
                                />

                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700 hover:shadow-lg active:scale-[0.98]"
                                >
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
