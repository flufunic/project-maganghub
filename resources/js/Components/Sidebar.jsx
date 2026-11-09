import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    X,
    ChevronRight,
    Wrench,
    CalendarClock,
    Activity,
    Cog,
    SlidersHorizontal,
    LogOut,
    ClipboardCheck,
    FileText,
} from "lucide-react";

import SidebarPimpinan from "./Pimpinan/Sidebar";


const ICONS = {
    close: X,
    chevron: ChevronRight,
    preventif: Wrench,
    schedule: CalendarClock,
    checksheet: Activity,
    overhaul: Cog,
    joken: SlidersHorizontal,
    logout: LogOut,
    rrf: ClipboardCheck,
    sop: FileText,
};

function Icon({ type, className = "h-5 w-5" }) {
    const Comp = ICONS[type];

    if (!Comp) return null;

    const strokeWidth = type === "close" || type === "chevron" ? 2 : 1.75;

    return <Comp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

const MENUS = [
    {
        href: "/preventif-mesin",
        icon: "preventif",
        label: "Preventif Mesin",
        desc: "Maintenance schedule",
    },
    {
        href: "/schedule-preventif",
        icon: "schedule",
        label: "Schedule Preventif Mingguan",
        desc: "Plan & act per week",
    },
    {
        href: "/check-sheets",
        icon: "checksheet",
        label: "Check Sheet Prediktif",
        desc: "Check sheet maintenance",
    },
    {
        href: "/overhaul-sc2",
        icon: "overhaul",
        label: "Schedule Overhaul",
        desc: "Jadwal overhaul mesin",
    },
    {
        href: "/joken",
        icon: "joken",
        label: "Joken Mesin",
        desc: "Standarisasi setting mesin",
    },
    {
        href: "/mtc/rrf",
        icon: "rrf",
        label: "Repair Request Form",
        desc: "Request perbaikan mesin",
    },
    {
        href: "/sop-ik",
        icon: "sop",
        label: "SOP/IK",
        desc: "Dokumen SOP & IK maintenance",
    },
];
function SidebarAdmin({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const currentPath =
        typeof window !== "undefined"
            ? window.location.pathname
            : "";

    const activeMenus = MENUS.map((menu) => ({
        ...menu,
        active:
            currentPath === menu.href ||
            currentPath.startsWith(`${menu.href}/`),
    }));

    function logout() {
        router.post("/logout", {}, {
            onFinish: () => setShowLogoutModal(false),
        });
    }

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-[90] bg-[#030a26]/60 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[280px] flex-col overflow-hidden border-r border-white/15 bg-gradient-to-b from-[#050f3a]/95 via-[#0a2260]/95 to-[#0c2a78]/95 text-white shadow-[0_0_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-400/25 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/25 blur-[80px]" />

                {/* HEADER */}
                <div className="relative border-b border-white/10 px-5 pb-5 pt-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                                <img
                                    src="/images/logo-mms.png"
                                    alt="Logo MMS"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-bold tracking-tight text-white">
                                    MMS (Admin)
                                </h2>
                                <p className="mt-0.5 text-[11px] font-medium text-blue-200/70">
                                    Maintenance Management System
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:rotate-90 hover:bg-white/15 hover:text-white"
                            title="Tutup"
                        >
                            <Icon type="close" className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* MENU */}
                <nav className="relative flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
                    <div className="mb-3 flex items-center gap-2 px-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-200/60">
                            Menu
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        {activeMenus.map((menu) => (
                            <button
                                key={menu.href}
                                type="button"
                                aria-current={menu.active ? "page" : undefined}
                                onClick={() => {
                                    router.visit(menu.href);
                                    onClose();
                                }}
                                className={`group relative flex h-[68px] w-full items-center gap-3 overflow-hidden rounded-2xl px-3 text-left transition ${
                                    menu.active
                                        ? "border border-white/20 bg-white/15 shadow-lg shadow-blue-950/30"
                                        : "border border-transparent hover:border-white/10 hover:bg-white/10"
                                }`}
                            >
                                {menu.active && (
                                    <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-indigo-400" />
                                )}

                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 ${
                                        menu.active
                                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-white/25"
                                            : "bg-white/10 text-blue-100/80 ring-1 ring-white/5 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:ring-white/20"
                                    }`}
                                >
                                    <Icon type={menu.icon} className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p
                                        title={menu.label}
                                        className={`line-clamp-2 text-[13px] font-semibold leading-tight ${
                                            menu.active
                                                ? "text-white"
                                                : "text-blue-50/90 group-hover:text-white"
                                        }`}
                                    >
                                        {menu.label}
                                    </p>
                                    <p
                                        className={`mt-0.5 truncate text-[11px] ${
                                            menu.active
                                                ? "text-blue-200"
                                                : "text-blue-200/50 group-hover:text-blue-200/80"
                                        }`}
                                    >
                                        {menu.desc}
                                    </p>
                                </div>

                                <div className="absolute right-2 top-1/2 flex h-7 w-7 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-lg bg-white/10 text-blue-100 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                                    <Icon type="chevron" className="h-3.5 w-3.5" />
                                </div>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* LOGOUT */}
                <div className="relative border-t border-white/10 p-4">
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-red-300/20 hover:bg-red-500/15"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-950/40 ring-1 ring-white/20 transition group-hover:scale-105">
                            <Icon type="logout" className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                            <p className="text-[13px] font-semibold text-red-200 group-hover:text-white">
                                Logout
                            </p>
                            <p className="mt-0.5 text-[11px] text-red-200/50 group-hover:text-red-100/80">
                                Keluar dari sistem
                            </p>
                        </div>

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-red-200 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                            <Icon type="chevron" className="h-4 w-4" />
                        </div>
                    </button>
                </div>
            </aside>

            {/* MODAL LOGOUT */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                    >
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

                        <div className="px-6 pb-6 pt-8">
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                                <div className="absolute inset-0 rounded-2xl bg-red-200 blur-xl" />
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-300/50">
                                    <Icon type="logout" className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-5 text-center">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    Konfirmasi Logout
                                </h3>
                                <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-slate-500">
                                    Apakah kamu yakin ingin keluar dari sistem?
                                </p>
                            </div>

                            <div className="mt-7 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

}
export default function Sidebar(props) {
    const { auth } = usePage().props;

    if (auth?.user?.role === "pimpinan") {
        return <SidebarPimpinan {...props} />;
    }

    return <SidebarAdmin {...props} />;
}
