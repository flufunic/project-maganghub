import React, { useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';

import {
    X,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    LogOut,
    ClipboardList,
    ClipboardCheck,
    Wrench,
    CalendarClock,
    Activity,
    Cog,
    SlidersHorizontal,
    FileText,
} from 'lucide-react';

import SidebarPimpinan from './Pimpinan/Sidebar';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */

const ICONS = {
    close: X,
    chevron: ChevronRight,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
    logout: LogOut,
    laporan: ClipboardList,
    rrf: ClipboardCheck,
    preventif: Wrench,
    schedule: CalendarClock,
    checksheet: Activity,
    overhaul: Cog,
    joken: SlidersHorizontal,
    sop: FileText,
};

function Icon({ type, className = 'h-5 w-5' }) {
    const Comp = ICONS[type];

    if (!Comp) {
        return null;
    }

    const strokeWidth = ['close', 'chevron', 'chevronDown', 'chevronUp'].includes(type)
        ? 2
        : 1.75;

    return <Comp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

const mulai = (p, base) => p === base || p.startsWith(`${base}/`);

/* ------------------------------------------------------------------
| DAFTAR MENU ADMIN (tanpa menu pimpinan)
| Report Mingguan = submenu dari Preventif Mesin
------------------------------------------------------------------ */

const GRUP = [
    {
        judul: 'Menu Maintenance',

        menus: [
            {
                key: 'preventif-mesin',
                href: '/preventif-mesin',
                icon: 'preventif',
                title: 'Preventif Mesin',
                desc: 'Maintenance schedule',
                match: (p) => mulai(p, '/preventif-mesin'),

                children: [
                    {
                        key: 'laporan-mingguan',
                        href: '/laporan-mingguan',
                        icon: 'laporan',
                        title: 'Report Mingguan',
                        desc: 'Laporan preventif mingguan',
                        match: (p) => mulai(p, '/laporan-mingguan'),
                    },
                ],
            },

            {
                key: 'schedule-preventif',
                href: '/schedule-preventif',
                icon: 'schedule',
                title: 'Schedule Preventif Mingguan',
                desc: 'Plan & act per week',
                match: (p) => mulai(p, '/schedule-preventif'),
            },

            {
                key: 'check-sheets',
                href: '/check-sheets',
                icon: 'checksheet',
                title: 'Check Sheet Prediktif',
                desc: 'Check sheet maintenance',
                match: (p) => mulai(p, '/check-sheets'),
            },

            {
                key: 'overhaul',
                href: '/overhaul-sc2',
                icon: 'overhaul',
                title: 'Schedule Overhaul',
                desc: 'Jadwal overhaul mesin',
                match: (p) => mulai(p, '/overhaul-sc2'),
            },

            {
                key: 'joken',
                href: '/joken',
                icon: 'joken',
                title: 'Joken Mesin',
                desc: 'Standarisasi setting mesin',
                match: (p) => mulai(p, '/joken'),
            },

            {
                key: 'rrf',
                href: '/mtc/rrf',
                icon: 'rrf',
                title: 'Repair Request Form',
                desc: 'Request perbaikan mesin',
                match: (p) => mulai(p, '/mtc/rrf'),
            },

            {
                key: 'sop-ik',
                href: '/sop-ik',
                icon: 'sop',
                title: 'SOP/IK',
                desc: 'Dokumen SOP & IK maintenance',
                match: (p) => mulai(p, '/sop-ik'),
            },
        ],
    },
];

function SidebarAdmin({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const { url } = usePage();

    // Buang query string (?a=b)
    const path = url.split('?')[0];

    // Submenu terbuka otomatis kalau sedang berada di salah satu halaman anaknya,
    // tapi tetap bisa ditutup/dibuka manual lewat tombol panah.
    const [terbuka, setTerbuka] = useState(() =>
        GRUP.flatMap((g) => g.menus)
            .filter((m) => m.children?.some((c) => c.match(path)))
            .map((m) => m.key)
    );

    const toggle = (key) =>
        setTerbuka((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );

    return (
        <>
            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0 z-[90] cursor-pointer bg-[#030a26]/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[290px] flex-col overflow-hidden border-r border-white/15 bg-gradient-to-b from-[#050f3a]/95 via-[#0a2260]/95 to-[#0c2a78]/95 text-white shadow-[0_0_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-400/25 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/25 blur-[80px]" />

                {/* HEADER */}
                <div className="relative border-b border-white/10 px-5 pb-5 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                                <img
                                    src="/images/logo-mms.png"
                                    alt="Logo MMS"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div>
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
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-95"
                            title="Tutup"
                        >
                            <Icon type="close" className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* MENU */}
                <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
                    {GRUP.map((grup) => (
                        <div key={grup.judul}>
                            {/* JUDUL GRUP */}
                            <div className="mb-2.5 flex items-center gap-2 px-3">
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-200/60">
                                    {grup.judul}
                                </span>

                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            <div className="space-y-1.5">
                                {grup.menus.map((item) => {
                                    const active = item.match(path);
                                    const hasChildren = item.children?.length > 0;

                                    /* ------------------------------------------------
                                    | MENU DENGAN SUBMENU
                                    ------------------------------------------------ */
                                    if (hasChildren) {
                                        const childActive = item.children.some((c) => c.match(path));
                                        const parentActive = active || childActive;
                                        const submenuOpen = terbuka.includes(item.key);

                                        return (
                                            <div key={item.key}>
                                                {/* PARENT */}
                                                <div
                                                    className={`group relative flex h-[68px] items-center gap-3 overflow-hidden rounded-2xl border transition-all duration-200 ${
                                                        parentActive
                                                            ? 'border-white/20 bg-white/15 shadow-lg shadow-blue-950/30'
                                                            : 'border-transparent hover:border-white/10 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {parentActive && (
                                                        <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-indigo-400" />
                                                    )}

                                                    <Link
                                                        href={item.href}
                                                        onClick={onClose}
                                                        aria-current={active ? 'page' : undefined}
                                                        className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-1"
                                                    >
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 ${
                                                                parentActive
                                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-white/25'
                                                                    : 'bg-white/10 text-blue-100/80 ring-1 ring-white/5 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:ring-white/20'
                                                            }`}
                                                        >
                                                            <Icon type={item.icon} className="h-5 w-5" />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p
                                                                title={item.title}
                                                                className={`line-clamp-2 text-[13px] font-semibold leading-tight ${
                                                                    parentActive
                                                                        ? 'text-white'
                                                                        : 'text-blue-50/90 group-hover:text-white'
                                                                }`}
                                                            >
                                                                {item.title}
                                                            </p>

                                                            <p
                                                                className={`mt-0.5 truncate text-[11px] font-medium ${
                                                                    parentActive
                                                                        ? 'text-blue-200'
                                                                        : 'text-blue-200/50 group-hover:text-blue-200/80'
                                                                }`}
                                                            >
                                                                {item.desc}
                                                            </p>
                                                        </div>
                                                    </Link>

                                                    {/* PANAH BUKA/TUTUP SUBMENU */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggle(item.key)}
                                                        aria-label={submenuOpen ? 'Tutup submenu' : 'Buka submenu'}
                                                        aria-expanded={submenuOpen}
                                                        className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-100 transition hover:bg-white/20"
                                                    >
                                                        <Icon
                                                            type={submenuOpen ? 'chevronUp' : 'chevronDown'}
                                                            className="h-4 w-4"
                                                        />
                                                    </button>
                                                </div>

                                                {/* SUBMENU */}
                                                {submenuOpen && (
                                                    <div className="ml-5 mt-1.5 space-y-1 border-l border-white/15 pl-3">
                                                        {item.children.map((child) => {
                                                            const childIsActive = child.match(path);

                                                            return (
                                                                <Link
                                                                    key={child.key}
                                                                    href={child.href}
                                                                    onClick={onClose}
                                                                    aria-current={childIsActive ? 'page' : undefined}
                                                                    className={`group relative flex min-h-[50px] w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 ${
                                                                        childIsActive
                                                                            ? 'bg-white/15 text-white shadow-sm'
                                                                            : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                                                                    }`}
                                                                >
                                                                    {childIsActive && (
                                                                        <span className="absolute -left-[4px] bottom-2 top-2 w-1 rounded-full bg-gradient-to-b from-sky-300 to-indigo-400" />
                                                                    )}

                                                                    <div
                                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                                            childIsActive
                                                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                                                                : 'bg-white/10 text-blue-200/70 group-hover:bg-white/15 group-hover:text-white'
                                                                        }`}
                                                                    >
                                                                        <Icon type={child.icon} className="h-4 w-4" />
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <p
                                                                            className={`text-[12px] font-semibold ${
                                                                                childIsActive
                                                                                    ? 'text-white'
                                                                                    : 'text-blue-100/80 group-hover:text-white'
                                                                            }`}
                                                                        >
                                                                            {child.title}
                                                                        </p>

                                                                        <p
                                                                            className={`mt-0.5 truncate text-[10px] ${
                                                                                childIsActive
                                                                                    ? 'text-blue-200'
                                                                                    : 'text-blue-200/40 group-hover:text-blue-200/70'
                                                                            }`}
                                                                        >
                                                                            {child.desc}
                                                                        </p>
                                                                    </div>

                                                                    <ChevronRight
                                                                        className={`h-3.5 w-3.5 ${
                                                                            childIsActive
                                                                                ? 'text-blue-200'
                                                                                : 'text-blue-200/30 group-hover:text-blue-200/70'
                                                                        }`}
                                                                    />
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    /* ------------------------------------------------
                                    | MENU BIASA
                                    ------------------------------------------------ */
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            onClick={onClose}
                                            aria-current={active ? 'page' : undefined}
                                            className={`group relative flex h-[68px] w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border px-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                                                active
                                                    ? 'border-white/20 bg-white/15 shadow-lg shadow-blue-950/30 hover:bg-white/20'
                                                    : 'border-transparent hover:border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            {active && (
                                                <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-indigo-400" />
                                            )}

                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 ${
                                                    active
                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-white/25'
                                                        : 'bg-white/10 text-blue-100/80 ring-1 ring-white/5 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:ring-white/20'
                                                }`}
                                            >
                                                <Icon type={item.icon} className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p
                                                    title={item.title}
                                                    className={`line-clamp-2 text-[13px] font-semibold leading-tight ${
                                                        active
                                                            ? 'text-white'
                                                            : 'text-blue-50/90 group-hover:text-white'
                                                    }`}
                                                >
                                                    {item.title}
                                                </p>

                                                <p
                                                    className={`mt-0.5 truncate text-[11px] font-medium ${
                                                        active
                                                            ? 'text-blue-200'
                                                            : 'text-blue-200/50 group-hover:text-blue-200/80'
                                                    }`}
                                                >
                                                    {item.desc}
                                                </p>
                                            </div>

                                            <div className="absolute right-2 top-1/2 flex h-7 w-7 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-lg bg-white/10 text-blue-100 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                                                <Icon type="chevron" className="h-3.5 w-3.5" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* LOGOUT */}
                <div className="relative border-t border-white/10 p-4">
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-red-300/20 hover:bg-red-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-950/40 ring-1 ring-white/20 transition-all duration-200 group-hover:scale-105">
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

                        <Icon
                            type="chevron"
                            className="h-4 w-4 text-red-200 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                    </button>
                </div>
            </aside>

            {/* MODAL KONFIRMASI LOGOUT */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                    >
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

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
                                    Apakah kamu yakin ingin keluar dari sistem?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ------------------------------------------------------------------
| Pemilih sidebar berdasarkan role
------------------------------------------------------------------ */
export default function Sidebar(props) {
    const { auth } = usePage().props;

    if (auth?.user?.role === 'pimpinan') {
        return <SidebarPimpinan {...props} />;
    }

    return <SidebarAdmin {...props} />;
}
