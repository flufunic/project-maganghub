import React, { useState } from 'react';

export default function Sidebar({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0 z-[90] bg-slate-900/30 backdrop-blur-[2px]"
                    onClick={onClose}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[280px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* =========================================
                    HEADER SIDEBAR
                ========================================== */}
                <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-5 py-5">

                    {/* DECORATION */}
                    <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute -bottom-14 left-12 h-28 w-28 rounded-full bg-indigo-400/20 blur-xl" />
                    <div className="absolute right-20 top-8 h-10 w-10 rounded-full bg-white/5 blur-md" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">

                            {/* LOGO */}
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg shadow-blue-900/20 ring-1 ring-white/20 backdrop-blur-sm">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5.5 w-5.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-7h6v7M9 10h.01M15 10h.01"
                                    />
                                </svg>
                            </div>

                            {/* TITLE */}
                            <div className="min-w-0">
                                <h2 className="text-sm font-extrabold tracking-tight text-white">
                                    Sistem X
                                </h2>

                                <p className="mt-0.5 text-[10px] font-medium text-blue-100">
                                    Maintenance Management
                                </p>
                            </div>
                        </div>

                        {/* CLOSE */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white"
                            title="Tutup"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* STATUS */}
                    <div className="relative mt-4 flex items-center gap-2">
                        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-blue-50 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                            Sistem aktif
                        </span>
                    </div>
                </div>

                {/* =========================================
                    MENU
                ========================================== */}
                <div className="flex-1 overflow-y-auto px-3 py-5">

                    {/* SECTION TITLE */}
                    <div className="mb-3 flex items-center gap-2 px-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                            Sistem
                        </p>
                    </div>

                    {/* =====================================
                        PREVENTIF MESIN - ACTIVE
                    ====================================== */}
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/preventif-mesin';
                            onClose();
                        }}
                        className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3.5 text-left text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md"
                    >
                        {/* ACCENT */}
                        <div className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-600" />

                        {/* ICON */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5a3 3 0 016 0v1H9V5z"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 13h6M9 17h4"
                                />
                            </svg>
                        </div>

                        {/* TEXT */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold">
                                Preventif Mesin
                            </p>

                            <p className="mt-0.5 truncate text-[10px] font-medium text-blue-400">
                                Maintenance schedule
                            </p>
                        </div>

                        {/* ARROW */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 text-blue-500 opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-3.5 w-3.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </button>

                    {/* =====================================
                        CHECK SHEET PREDIKTIF
                    ====================================== */}
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/check-sheets';
                            onClose();
                        }}
                        className="group relative mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 hover:text-violet-700 hover:shadow-sm"
                    >
                        {/* ICON */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-200 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-violet-200">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5a3 3 0 016 0v1H9V5z"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 13l2 2 4-4"
                                />
                            </svg>
                        </div>

                        {/* TEXT */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold">
                                Check Sheet Prediktif
                            </p>

                            <p className="mt-0.5 truncate text-[10px] font-normal text-slate-400 group-hover:text-violet-400">
                                Check sheet maintenance
                            </p>
                        </div>

                        {/* ARROW */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-300 opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-violet-500 group-hover:opacity-100">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-3.5 w-3.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* =========================================
                    FOOTER
                ========================================== */}
                <div className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/80 p-4">

                    {/* LOGOUT */}
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-semibold text-red-500 transition-all duration-200 hover:border-red-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-600 hover:shadow-sm"
                    >
                        {/* ICON */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all duration-200 group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-rose-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-red-200">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12H3"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7l-5 5 5 5"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 19V5a2 2 0 00-2-2h-6a2 2 0 00-2 2v2"
                                />
                            </svg>
                        </div>

                        <div className="flex-1">
                            <p className="text-[13px] font-bold">
                                Logout
                            </p>

                            <p className="mt-0.5 text-[10px] font-normal text-red-300 transition group-hover:text-red-400">
                                Keluar dari sistem
                            </p>
                        </div>

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-red-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
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
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </button>
                </div>
            </aside>

            {/* =========================================
                MODAL KONFIRMASI LOGOUT
            ========================================== */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">

                    <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">

                        {/* TOP DECORATION */}
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

                        {/* CONTENT */}
                        <div className="px-6 pb-6 pt-7">

                            {/* ICON */}
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                                <div className="absolute inset-0 rounded-2xl bg-red-100 blur-xl" />

                                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-200">
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
                                            d="M15 12H3"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 7l-5 5 5 5"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 19V5a2 2 0 00-2-2h-6a2 2 0 00-2 2v2"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* TEXT */}
                            <div className="mt-5 text-center">
                                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
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
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
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
                                        className="w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700 hover:shadow-lg"
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