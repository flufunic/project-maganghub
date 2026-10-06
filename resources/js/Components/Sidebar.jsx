import React, { useState } from 'react';

export default function Sidebar({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    return (
        <>
            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0 z-[90] bg-slate-900/30 backdrop-blur-[1px]"
                    onClick={onClose}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[280px] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* HEADER SIDEBAR */}
                <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
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
                                    d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-7h6v7M9 10h.01M15 10h.01"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Sistem X
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Maintenance Management
                            </p>
                        </div>
                    </div>

                    {/* CLOSE */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

                {/* MENU */}
                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Sistem
                    </p>

                    {/* PREVENTIF MESIN */}
                   <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/preventif-mesin';
                            onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-left text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
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

                        <div>
                            <p>Preventif Mesin</p>
                            <p className="mt-0.5 text-[10px] font-normal text-blue-400">
                                Maintenance schedule
                            </p>
                        </div>
                    </button>

                    {/* CHECK SHEET PREDIKTIF */}
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/check-sheets';
                            onClose();
                        }}
                        className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
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

                        <div>
                            <p>Check Sheet Prediktif</p>
                            <p className="mt-0.5 text-[10px] font-normal text-slate-400">
                                Check sheet maintenance
                            </p>
                        </div>
                    </button>

                </div>
                {/* FOOTER */}
                <div className="border-t border-slate-100 p-4">

                    {/* LOGOUT */}
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 transition group-hover:bg-red-100">
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

                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MODAL KONFIRMASI LOGOUT */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        {/* ICON */}
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-6 w-6 text-red-500"
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

                        {/* TEXT */}
                        <div className="mt-4 text-center">
                            <h3 className="text-base font-bold text-slate-900">
                                Konfirmasi Logout
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                Apakah kamu yakin ingin keluar dari sistem?
                            </p>
                        </div>

                        {/* BUTTON */}
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <form
                                method="POST"
                                action="/logout"
                                className="flex-1"
                            >
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={document
                                        .querySelector('meta[name="csrf-token"]')
                                        ?.getAttribute('content')}
                                />

                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
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