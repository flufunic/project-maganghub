import React, { useEffect, useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';

import {
    X,
    ChevronRight,
    ChevronDown,
    LogOut,
    ClipboardList,
    ClipboardCheck,
    Wrench,
    CalendarClock,
    Activity,
    Cog,
    SlidersHorizontal,
    FileText,
    Factory,
} from 'lucide-react';

import SidebarPimpinan from './Pimpinan/Sidebar';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */

const ICONS = {
    close: X,
    chevron: ChevronRight,
    chevronDown: ChevronDown,
    logout: LogOut,
    laporan: ClipboardList,
    rrf: ClipboardCheck,
    preventif: Wrench,
    schedule: CalendarClock,
    checksheet: Activity,
    overhaul: Cog,
    joken: SlidersHorizontal,
    sop: FileText,
    mesin: Factory,
};

function Icon({ type, className = 'h-5 w-5' }) {
    const Comp = ICONS[type];

    if (!Comp) {
        return null;
    }

    const strokeWidth = ['close', 'chevron', 'chevronDown'].includes(type) ? 2 : 1.75;

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
                href: '/mtc/rrf/repair-mtc',
                icon: 'rrf',
                title: 'Repair Request Form',
                desc: 'Kelola data repair QMOS dan buat RRF Maintenance',
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
            {
                key: 'daftar-mesin',
                href: '/machines',
                icon: 'mesin',
                title: 'Daftar Mesin',
                desc: 'Inventaris mesin & barcode',
                match: (p) => mulai(p, '/machines'),
            },
        ],
    },
];

/* ------------------------------------------------------------------
| STYLE (animasi sidebar + modal)
------------------------------------------------------------------ */
const STYLES = `
    @keyframes sbItem { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes sbFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sbPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes sbIcon { 0% { transform: scale(.5); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
    @keyframes sbShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
    @keyframes sbFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(24px,-18px,0) scale(1.08); } }
    @keyframes sbSpin { to { transform: rotate(360deg); } }

    .sb-item { animation: sbItem .45s cubic-bezier(.22,1,.36,1) both; }
    .sb-fade { animation: sbFade .25s ease-out both; }
    .sb-pop { animation: sbPop .4s cubic-bezier(.22,1,.36,1) both; }
    .sb-icon { animation: sbIcon .5s .1s cubic-bezier(.22,1,.36,1) both; }
    .sb-shimmer { background-size: 200% 100%; animation: sbShimmer 6s linear infinite; }
    .sb-float { animation: sbFloat 14s ease-in-out infinite; }
    .sb-spin { animation: sbSpin .8s linear infinite; }

    @media (prefers-reduced-motion: reduce) {
        .sb-item, .sb-fade, .sb-pop, .sb-icon, .sb-shimmer, .sb-float, .sb-spin { animation: none !important; }
    }
`;

/* ------------------------------------------------------------------
| KOTAK IKON MENU
------------------------------------------------------------------ */
function IconBox({ type, active, small = false }) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center transition-all duration-200 ${
                small ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl'
            } ${
                active
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-950/40 ring-1 ring-white/25'
                    : 'bg-white/10 text-blue-100/80 ring-1 ring-white/5 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:ring-white/20'
            }`}
        >
            <Icon type={type} className={small ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
    );
}

/* Garis penanda menu aktif */
function ActiveBar() {
    return (
        <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-indigo-400" />
    );
}

const rowBase =
    'group relative flex min-h-[60px] w-full items-center gap-3 overflow-hidden rounded-xl text-left transition-all duration-200';
const rowActive = 'bg-white/[0.13] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]';
const rowIdle = 'hover:bg-white/[0.07]';

function SidebarAdmin({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const { url, props } = usePage();
    const user = props.auth?.user;

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

    // ESC: tutup modal logout dulu, baru sidebar
    useEffect(() => {
        if (!open && !showLogoutModal) return;

        const onKey = (e) => {
            if (e.key !== 'Escape') return;

            if (showLogoutModal) {
                if (!loggingOut) setShowLogoutModal(false);
            } else {
                onClose?.();
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, showLogoutModal, loggingOut, onClose]);

    const logout = () => {
        if (loggingOut) return;
        setLoggingOut(true);

        router.post(
            '/logout',
            {},
            {
                onFinish: () => {
                    setLoggingOut(false);
                    setShowLogoutModal(false);
                },
            }
        );
    };

    // Urutan animasi masuk antar menu
    let urutan = 0;
    const delay = () => ({ animationDelay: `${120 + urutan++ * 45}ms` });
    const anim = open ? 'sb-item' : '';

    const inisial = (user?.name ?? 'A').trim().charAt(0).toUpperCase();

    return (
        <>
            <style>{STYLES}</style>

            {/* BACKDROP */}
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-[90] cursor-pointer bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            {/* SIDEBAR */}
            <aside
                aria-label="Menu navigasi"
                aria-hidden={!open}
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[300px] max-w-[88vw] flex-col overflow-hidden bg-gradient-to-b from-[#061033] via-[#0b1d57] to-[#12328a] text-white shadow-[0_0_80px_rgba(2,6,23,0.55)] transition-[transform,visibility] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                    open ? 'visible translate-x-0' : 'invisible -translate-x-full'
                }`}
            >
                {/* garis aksen bergerak */}
                <div className="sb-shimmer absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />

                {/* dekorasi */}
                <div className="sb-float pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-[80px]" />
                <div className="sb-float pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/25 blur-[80px] [animation-delay:-6s]" />

                {/* HEADER */}
                <div className="relative px-5 pb-4 pt-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/15">
                                <img
                                    src="/images/logo-mms.png"
                                    alt="Logo MMS"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-bold tracking-tight text-white">
                                    MMS (Admin)
                                </h2>

                                <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200/70">
                                    Maintenance Management System
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:rotate-90 hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-95"
                            title="Tutup"
                            aria-label="Tutup menu"
                        >
                            <Icon type="close" className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* MENU */}
                <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
                    {GRUP.map((grup) => (
                        <div key={grup.judul}>
                            {/* JUDUL GRUP */}
                            <div className="mb-2 flex items-center gap-3 px-3">
                                <span className="text-xs font-semibold text-blue-200/60">{grup.judul}</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                            </div>

                            <div className="space-y-1">
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
                                            <div key={item.key} style={delay()} className={anim}>
                                                {/* PARENT */}
                                                <div
                                                    className={`${rowBase} pr-2 ${
                                                        parentActive ? rowActive : rowIdle
                                                    }`}
                                                >
                                                    {parentActive && <ActiveBar />}

                                                    <Link
                                                        href={item.href}
                                                        onClick={onClose}
                                                        aria-current={active ? 'page' : undefined}
                                                        className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                                                    >
                                                        <IconBox type={item.icon} active={parentActive} />

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
                                                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-blue-100 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-90"
                                                    >
                                                        <Icon
                                                            type="chevronDown"
                                                            className={`h-4 w-4 transition-transform duration-300 ${
                                                                submenuOpen ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* SUBMENU (buka/tutup halus) */}
                                                <div
                                                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                                                        submenuOpen
                                                            ? 'grid-rows-[1fr] opacity-100'
                                                            : 'grid-rows-[0fr] opacity-0'
                                                    }`}
                                                >
                                                    <div className="overflow-hidden">
                                                        <div className="ml-6 mt-1 space-y-1 border-l border-white/15 py-0.5 pl-3">
                                                            {item.children.map((child) => {
                                                                const childIsActive = child.match(path);

                                                                return (
                                                                    <Link
                                                                        key={child.key}
                                                                        href={child.href}
                                                                        onClick={onClose}
                                                                        tabIndex={submenuOpen ? 0 : -1}
                                                                        aria-current={childIsActive ? 'page' : undefined}
                                                                        className={`group relative flex min-h-[50px] w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                                                                            childIsActive
                                                                                ? 'bg-white/[0.13] text-white'
                                                                                : 'text-blue-100/70 hover:bg-white/[0.07] hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {childIsActive && (
                                                                            <span className="absolute -left-[13px] bottom-2.5 top-2.5 w-1 rounded-full bg-gradient-to-b from-sky-300 to-indigo-400" />
                                                                        )}

                                                                        <IconBox
                                                                            type={child.icon}
                                                                            active={childIsActive}
                                                                            small
                                                                        />

                                                                        <div className="min-w-0 flex-1">
                                                                            <p
                                                                                className={`text-xs font-semibold ${
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
                                                                            className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 ${
                                                                                childIsActive
                                                                                    ? 'text-blue-200'
                                                                                    : 'text-blue-200/30 group-hover:text-blue-200/70'
                                                                            }`}
                                                                        />
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    /* ------------------------------------------------
                                    | MENU BIASA
                                    ------------------------------------------------ */
                                    return (
                                        <div key={item.key} style={delay()} className={anim}>
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                aria-current={active ? 'page' : undefined}
                                                className={`${rowBase} cursor-pointer px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                                                    active ? rowActive : rowIdle
                                                }`}
                                            >
                                                {active && <ActiveBar />}

                                                <IconBox type={item.icon} active={active} />

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

                                                <Icon
                                                    type="chevron"
                                                    className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                                        active
                                                            ? 'text-blue-200'
                                                            : '-translate-x-1 text-blue-100 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                                                    }`}
                                                />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* FOOTER: user + logout */}
                <div className="relative border-t border-white/10 p-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-white/10">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md shadow-blue-950/40">
                            {inisial}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-white">
                                {user?.name ?? 'Admin'}
                            </p>
                            <p className="truncate text-[11px] capitalize text-blue-200/60">
                                {user?.role ?? 'admin'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowLogoutModal(true)}
                            title="Logout"
                            aria-label="Logout"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-500/15 text-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 active:translate-y-0"
                        >
                            <Icon type="logout" className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MODAL KONFIRMASI LOGOUT */}
            {showLogoutModal && (
                <div
                    className="sb-fade fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !loggingOut) setShowLogoutModal(false);
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="logout-title"
                        aria-describedby="logout-message"
                        className="sb-pop w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
                    >
                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="sb-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-600">
                                    <Icon type="logout" className="h-5 w-5" />
                                </div>

                                <h3 id="logout-title" className="text-base font-bold text-slate-900">
                                    Konfirmasi logout
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={loggingOut}
                                aria-label="Tutup"
                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Icon type="close" className="h-4 w-4" />
                            </button>
                        </div>

                        {/* ISI */}
                        <div className="px-6 py-5">
                            <p id="logout-message" className="text-sm leading-relaxed text-slate-600">
                                Apakah kamu yakin ingin keluar dari sistem? Kamu perlu login lagi untuk mengakses data.
                            </p>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={loggingOut}
                                autoFocus
                                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={logout}
                                disabled={loggingOut}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {loggingOut && (
                                    <span className="sb-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                )}
                                {loggingOut ? 'Keluar...' : 'Ya, Logout'}
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