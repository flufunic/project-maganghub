import React, { useState } from 'react';

export default function Sidebar({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            {/* =====================================================
                BACKDROP
            ====================================================== */}
            {open && (
                <div
                    className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-[3px] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* =====================================================
                SIDEBAR
            ====================================================== */}
            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[290px] flex-col overflow-hidden border-r border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >

                {/* =================================================
                    TOP DECORATION
                ================================================== */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />


                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="relative border-b border-slate-100 px-5 pb-5 pt-6">

                    <div className="flex items-center justify-between">

                        {/* BRAND */}
                        <div className="flex items-center gap-3">

                            <div className="relative">

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-7h6v7M9 10h.01M15 10h.01"
                                        />
                                    </svg>

                                </div>

                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            </div>


                            <div>
                                <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                                    Sistem X
                                </h2>

                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                    Maintenance Management
                                </p>
                            </div>

                        </div>


                        {/* CLOSE */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
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

                </div>


                {/* =================================================
                    MENU
                ================================================== */}
                <div className="flex-1 overflow-y-auto px-4 py-6">

                    {/* SECTION TITLE */}
                    <div className="mb-3 flex items-center gap-2 px-2">

                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Menu Utama
                        </span>

                        <div className="h-px flex-1 bg-slate-100" />

                    </div>


                    {/* =================================================
                        DASHBOARD PIMPINAN
                    ================================================== */}
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/pimpinan';
                            onClose();
                        }}
                        className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3.5 text-left transition-all duration-200 hover:from-blue-100 hover:to-indigo-100"
                    >

                        {/* ACTIVE BAR */}
                        <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-blue-600" />


                        {/* ICON */}
                        <div className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105">

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
                                    d="M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 19h16"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 15v-3M12 15V8M16 15v-5"
                                />
                            </svg>

                        </div>


                        {/* TEXT */}
                        <div className="min-w-0 flex-1">

                            <p className="text-sm font-bold text-blue-700">
                                Dashboard Pimpinan
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-blue-400">
                                Approval & monitoring
                            </p>

                        </div>


                        {/* ARROW */}
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 text-blue-500 opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">

                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
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


                {/* =================================================
                    BOTTOM PROFILE / LOGOUT
                ================================================== */}
                <div className="border-t border-slate-100 bg-slate-50/70 p-4">

                    {/* LOGOUT */}
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                    >

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors group-hover:bg-red-200 group-hover:text-red-700">

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

                        <span className="flex-1">
                            Logout
                        </span>

                        <svg
                            className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>

                    </button>

                </div>

            </aside>


            {/* =====================================================
                MODAL KONFIRMASI LOGOUT
            ====================================================== */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">

                    <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-slate-900/20">

                        {/* MODAL TOP */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-white px-6 pb-5 pt-6">

                            {/* Decorative */}
                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-red-100/60" />

                            <div className="relative flex justify-center">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-7 w-7"
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


                            <div className="relative mt-4 text-center">

                                <h3 className="text-lg font-bold text-slate-900">
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
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
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
                                    className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-100 transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 active:scale-[0.98]"
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