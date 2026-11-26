import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    X,
    ChevronRight,
    ChevronDown,
    LogOut,
    LayoutDashboard,
    ClipboardList,
    ClipboardCheck,
    Wrench,
    CalendarClock,
    Activity,
    Cog,
    SlidersHorizontal,
    FileText,
    Factory,
    Layers,
    QrCode,
    ListChecks,
} from 'lucide-react';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */

const ICONS = {
    close: X,
    chevron: ChevronRight,
    chevronDown: ChevronDown,
    logout: LogOut,
    approval: LayoutDashboard,
    laporan: ClipboardList,
    rrf: ClipboardCheck,
    preventif: Wrench,
    schedule: CalendarClock,
    checksheet: Activity,
    checksheetPreventif: ListChecks,
    overhaul: Cog,
    joken: SlidersHorizontal,
    sop: FileText,
    mesin: Factory,
    divisi: Layers,
    barcode: QrCode,
};

function Icon({ type, className = 'h-5 w-5' }) {
    const Comp = ICONS[type];
    if (!Comp) return null;

    const thick = ['close', 'chevron', 'chevronDown'].includes(type);

    return <Comp className={className} strokeWidth={thick ? 2 : 1.75} aria-hidden="true" />;
}

/* ------------------------------------------------------------------
| HELPER
------------------------------------------------------------------ */

const mulai = (p, base) => p === base || p.startsWith(`${base}/`);

/* ------------------------------------------------------------------
| KATALOG MENU (dipakai bersama oleh semua role)
------------------------------------------------------------------ */

const MENU = {
    preventif: {
        key: 'preventif-mesin',
        href: '/preventif-mesin',
        icon: 'preventif',
        title: 'Preventif Mesin',
        desc: 'Maintenance schedule',
        match: (p) => mulai(p, '/preventif-mesin'),
    },
    checksheetPreventif: {
        key: 'checksheet-preventif',
        href: '/checksheet-preventif',
        icon: 'checksheetPreventif',
        title: 'Check Sheet Preventif',
        desc: 'Form preventif & countermeasure',
        match: (p) => mulai(p, '/checksheet-preventif'),
    },
    schedule: {
        key: 'schedule-preventif',
        href: '/schedule-preventif',
        icon: 'schedule',
        title: 'Schedule Preventif Mingguan',
        desc: 'Plan & act per week',
        match: (p) => mulai(p, '/schedule-preventif'),
    },
    checksheet: {
        key: 'check-sheets',
        href: '/check-sheets',
        icon: 'checksheet',
        title: 'Check Sheet Prediktif',
        desc: 'Check sheet maintenance',
        match: (p) => mulai(p, '/check-sheets'),
    },
    overhaul: {
        key: 'overhaul',
        href: '/overhaul-sc2',
        icon: 'overhaul',
        title: 'Schedule Overhaul',
        desc: 'Jadwal overhaul mesin',
        match: (p) => mulai(p, '/overhaul-sc2'),
    },
    joken: {
        key: 'joken',
        href: '/joken',
        icon: 'joken',
        title: 'Joken Mesin',
        desc: 'Standarisasi setting mesin',
        match: (p) => mulai(p, '/joken'),
    },
    rrf: {
        key: 'rrf',
        href: '/mtc/rrf/repair-mtc',
        icon: 'rrf',
        title: 'Repair Request Form',
        desc: 'Kelola RRF Maintenance',
        match: (p) => mulai(p, '/mtc/rrf'),
    },
    sop: {
        key: 'sop-ik',
        href: '/sop-ik',
        icon: 'sop',
        title: 'SOP/IK',
        desc: 'Dokumen SOP & IK maintenance',
        match: (p) => mulai(p, '/sop-ik'),
    },
    mesin: {
        key: 'daftar-mesin',
        href: '/machines',
        icon: 'mesin',
        title: 'Daftar Mesin',
        desc: 'Inventaris mesin & barcode',
        match: (p) => mulai(p, '/machines'),
    },
};

const LAPORAN_MINGGUAN = {
    key: 'laporan-mingguan',
    href: '/laporan-mingguan',
    icon: 'laporan',
    title: 'Report Mingguan',
    desc: 'Laporan preventif mingguan',
    match: (p) => mulai(p, '/laporan-mingguan'),
};

const MASTER_DIVISI = {
    key: 'master-divisi',
    href: '/master/divisi',
    icon: 'divisi',
    title: 'Kelola Divisi & Line',
    desc: 'Tambah divisi & mesin baru',
    match: (p) => mulai(p, '/master/divisi'),
};

const CETAK_BARCODE = {
    key: 'cetak-barcode',
    href: '/check-sheets-barcodes',
    icon: 'barcode',
    title: 'Cetak Barcode',
    desc: 'QR tiap line / mesin',
    match: (p) => p === '/check-sheets-barcodes',
};

/* ------------------------------------------------------------------
| MENU PER ROLE
| Tambah / ubah role cukup di sini.
------------------------------------------------------------------ */

const ROLES = {
    pimpinan: {
        label: 'Pimpinan',
        groups: [
            {
                judul: 'Menu Pimpinan',
                menus: [
                    {
                        key: 'preventif-approval',
                        href: '/pimpinan',
                        icon: 'approval',
                        title: 'Approval Report Mingguan',
                        desc: 'Approval & monitoring',
                        match: (p) =>
                            p === '/pimpinan' ||
                            p.startsWith('/pimpinan/laporan') ||
                            p.startsWith('/laporan-mingguan'),
                    },
                    {
                        key: 'checksheet-mingguan',
                        href: '/pimpinan/check-sheet',
                        icon: 'laporan',
                        title: 'Check Sheet Mingguan',
                        desc: 'Rekap & pemeriksaan mingguan',
                        match: (p) => mulai(p, '/pimpinan/check-sheet'),
                    },
                    {
                        ...MENU.rrf,
                        desc: 'Verifikasi permintaan perbaikan',
                    },
                ],
            },
            {
                judul: 'Menu Maintenance',
                menus: [
                    MENU.preventif,
                    MENU.checksheetPreventif,
                    MENU.schedule,
                    { ...MENU.checksheet, children: [MASTER_DIVISI, CETAK_BARCODE] },
                    MENU.overhaul,
                    MENU.joken,
                    MENU.sop,
                    MENU.mesin,
                ],
            },
        ],
    },

    // Admin (punya submenu Report Mingguan)
    admin: {
        label: 'Admin',
        groups: [
            {
                judul: 'Menu Maintenance',
                menus: [
                    { ...MENU.preventif, children: [LAPORAN_MINGGUAN] },
                    MENU.checksheetPreventif,
                    MENU.schedule,
                    { ...MENU.checksheet, children: [MASTER_DIVISI, CETAK_BARCODE] },
                    MENU.overhaul,
                    MENU.joken,
                    { ...MENU.rrf, desc: 'Kelola data repair QMOS dan buat RRF Maintenance' },
                    MENU.sop,
                    MENU.mesin,
                ],
            },
        ],
    },
};

// Role yang tidak dikenal memakai menu admin
const getRole = (role) => ROLES[role] ?? ROLES.admin;

/* ------------------------------------------------------------------
| ANIMASI
------------------------------------------------------------------ */

const STYLES = `
    @keyframes sbItem   { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
    @keyframes sbFade   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sbPop    { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
    @keyframes sbPing   { 0% { transform: scale(1); opacity: .5; } 80%,100% { transform: scale(2); opacity: 0; } }
    @keyframes sbBar    { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes sbSpin   { to { transform: rotate(360deg); } }
    @keyframes sbGlow   { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .85; transform: scale(1.1); } }
    @keyframes sbLine   { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

    .sb-item  { animation: sbItem .45s cubic-bezier(.22,1,.36,1) both; }
    .sb-fade  { animation: sbFade .25s ease-out both; }
    .sb-pop   { animation: sbPop .35s cubic-bezier(.22,1,.36,1) both; }
    .sb-ping  { animation: sbPing 1.9s cubic-bezier(0,0,.2,1) infinite; }
    .sb-bar   { transform-origin: center; animation: sbBar .3s cubic-bezier(.22,1,.36,1) both; }
    .sb-spin  { animation: sbSpin .8s linear infinite; }
    .sb-glow  { animation: sbGlow 8s ease-in-out infinite; }
    .sb-line  { background-size: 200% 100%; animation: sbLine 7s linear infinite; }

    @media (prefers-reduced-motion: reduce) {
        .sb-item,.sb-fade,.sb-pop,.sb-ping,.sb-bar,.sb-spin,.sb-glow,.sb-line { animation: none !important; }
    }
`;

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */

function IconBox({ type, active, small = false }) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center transition-all duration-300 ${
                small ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-[10px]'
            } ${
                active
                    ? 'bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                    : 'bg-white/[0.06] text-slate-300 group-hover:scale-105 group-hover:bg-white/[0.12] group-hover:text-white'
            }`}
        >
            <Icon type={type} className={small ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
        </span>
    );
}

function NavRow({ item, active, onClose, style, animate = '', small = false, tabIndex }) {
    return (
        <Link
            href={item.href}
            onClick={onClose}
            style={style}
            tabIndex={tabIndex}
            aria-current={active ? 'page' : undefined}
            className={`${animate} group relative flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-sky-400/60 ${
                small ? 'min-h-[44px] px-2 py-1.5' : 'min-h-[54px] px-2.5 py-2'
            } ${active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'}`}
        >
            {active && (
                <span className="sb-bar absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
            )}

            <IconBox type={item.icon} active={active} small={small} />

            <span className="min-w-0 flex-1">
                <span
                    title={item.title}
                    className={`line-clamp-2 block font-semibold leading-tight ${
                        small ? 'text-xs' : 'text-[13px]'
                    } ${active ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}
                >
                    {item.title}
                </span>

                <span
                    className={`mt-0.5 block truncate font-medium ${
                        small ? 'text-[10px]' : 'text-[11px]'
                    } ${active ? 'text-sky-200/80' : 'text-slate-400/70 group-hover:text-slate-300'}`}
                >
                    {item.desc}
                </span>
            </span>

            <Icon
                type="chevron"
                className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    active
                        ? 'text-sky-300'
                        : '-translate-x-1 text-slate-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                }`}
            />
        </Link>
    );
}

/* ------------------------------------------------------------------
| SIDEBAR (satu komponen untuk semua role)
------------------------------------------------------------------ */

export default function Sidebar({ open, onClose }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const { url, props } = usePage();
    const user = props.auth?.user;
    const config = getRole(user?.role);
    const groups = config.groups;

    const path = url.split('?')[0];

    /* ---------- SUBMENU ---------- */
    const [terbuka, setTerbuka] = useState(() =>
        groups
            .flatMap((g) => g.menus)
            .filter((m) => m.children?.some((c) => c.match(path)))
            .map((m) => m.key)
    );

    const toggle = (key) =>
        setTerbuka((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

    /* ---------- ESC: tutup modal dulu, baru sidebar ---------- */
    useEffect(() => {
        if (!open && !showLogoutModal) return undefined;

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

    /* ---------- animasi stagger ---------- */
    let urutan = 0;
    const delay = () => ({ animationDelay: `${80 + urutan++ * 35}ms` });
    const anim = open ? 'sb-item' : '';

    const inisial = (user?.name ?? 'U').trim().charAt(0).toUpperCase();

    return (
        <>
            <style>{STYLES}</style>

            {/* BACKDROP */}
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-[90] cursor-pointer bg-slate-950/50 backdrop-blur-[3px] transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            {/* SIDEBAR */}
            <aside
                aria-label="Menu navigasi"
                aria-hidden={!open}
                className={`fixed left-0 top-0 z-[100] flex h-screen w-[296px] max-w-[88vw] flex-col overflow-hidden bg-[#0b1224] text-white shadow-[0_0_80px_rgba(2,6,23,0.55)] transition-[transform,visibility] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                    open ? 'visible translate-x-0' : 'invisible -translate-x-full'
                }`}
            >
                {/* dekorasi tipis */}
                <div className="sb-line absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-400 via-violet-400 to-sky-400" />
                <div className="sb-glow pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-sky-500/15 blur-[90px]" />

                {/* HEADER */}
                <div className="relative flex items-center justify-between gap-3 px-5 pb-4 pt-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] p-1.5 ring-1 ring-white/10">
                            <img src="/images/logo-mms.png" alt="Logo MMS" className="h-full w-full object-contain" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold tracking-tight">
                                MMS
                            </h2>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                                Maintenance Management System
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Tutup"
                        aria-label="Tutup menu"
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/[0.06] text-white/70 outline-none transition-all duration-200 hover:rotate-90 hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400/60 active:scale-95"
                    >
                        <Icon type="close" className="h-5 w-5" />
                    </button>
                </div>

                {/* MENU */}
                <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
                    {groups.map((grup) => (
                        <div key={grup.judul}>
                            <div className="mb-2 flex items-center gap-3 px-3">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400/70">
                                    {grup.judul}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>

                            <div className="space-y-0.5">
                                {grup.menus.map((item) => {
                                    const active = item.match(path);
                                    const hasChildren = item.children?.length > 0;

                                    /* ---------- MENU DENGAN SUBMENU ---------- */
                                    if (hasChildren) {
                                        const childActive = item.children.some((c) => c.match(path));
                                        const parentActive = active || childActive;
                                        const submenuOpen = terbuka.includes(item.key);

                                        return (
                                            <div key={item.key}>
                                                <div className="flex items-center gap-1" style={delay()}>
                                                    <NavRow
                                                        item={item}
                                                        active={parentActive}
                                                        onClose={onClose}
                                                        animate={anim}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => toggle(item.key)}
                                                        aria-label={submenuOpen ? 'Tutup submenu' : 'Buka submenu'}
                                                        aria-expanded={submenuOpen}
                                                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/[0.06] text-slate-300 outline-none transition hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400/60 active:scale-90"
                                                    >
                                                        <Icon
                                                            type="chevronDown"
                                                            className={`h-4 w-4 transition-transform duration-300 ${
                                                                submenuOpen ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    </button>
                                                </div>

                                                <div
                                                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                                                        submenuOpen
                                                            ? 'grid-rows-[1fr] opacity-100'
                                                            : 'grid-rows-[0fr] opacity-0'
                                                    }`}
                                                >
                                                    <div className="overflow-hidden">
                                                        <div className="ml-7 mt-1 space-y-0.5 border-l border-white/10 py-0.5 pl-2.5">
                                                            {item.children.map((child) => (
                                                                <div key={child.key} className="flex">
                                                                    <NavRow
                                                                        item={child}
                                                                        small
                                                                        active={child.match(path)}
                                                                        onClose={onClose}
                                                                        tabIndex={submenuOpen ? 0 : -1}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    /* ---------- MENU BIASA ---------- */
                                    return (
                                        <div key={item.key} className="flex">
                                            <NavRow
                                                item={item}
                                                active={active}
                                                onClose={onClose}
                                                style={delay()}
                                                animate={anim}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* FOOTER: user + logout */}
                <div className="relative border-t border-white/10 p-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2.5 ring-1 ring-white/10">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md shadow-indigo-950/40">
                            {inisial}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-white">{user?.name ?? config.label}</p>
                            <p className="truncate text-[11px] capitalize text-slate-400">
                                {user?.divisi ? `${user.divisi} · ` : ''}
                                {user?.role?.replace('_', ' ') ?? config.label}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowLogoutModal(true)}
                            title="Logout"
                            aria-label="Logout"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-500/15 text-red-200 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-950/40 focus-visible:ring-2 focus-visible:ring-red-300 active:translate-y-0"
                        >
                            <Icon type="logout" className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MODAL LOGOUT */}
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
                        className="sb-pop w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                    >
                        <div className="px-6 pb-5 pt-8 text-center">
                            <div className="relative mx-auto h-14 w-14">
                                <span className="sb-ping absolute inset-0 rounded-2xl bg-red-300/60" />
                                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-300/50">
                                    <Icon type="logout" className="h-7 w-7" />
                                </span>
                            </div>

                            <h3 id="logout-title" className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                                Konfirmasi logout
                            </h3>

                            <p
                                id="logout-message"
                                className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500"
                            >
                                Apakah kamu yakin ingin keluar dari sistem? Kamu perlu login lagi untuk mengakses data.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={loggingOut}
                                autoFocus
                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={logout}
                                disabled={loggingOut}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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