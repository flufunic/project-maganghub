import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

import {
    Plus,
    Eye,
    Trash2,
    ClipboardList,
    CheckCircle2,
    AlertTriangle,
    X,
    ChevronDown,
    Menu,
} from 'lucide-react';

/* =====================================================
   KOMPONEN UMUM (animasi, latar, header, toast, modal)
===================================================== */

const STATUS = {
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    menunggu: { label: 'Menunggu pimpinan', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    diperiksa: { label: 'Sedang diperiksa', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    disetujui: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    ditolak: { label: 'Ditolak', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
};

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const thClass =
    'border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap';

const tdClass =
    'border-b border-slate-100 px-4 py-3 align-middle text-sm text-slate-700';

const delay = (ms) => ({ animationDelay: `${ms}ms` });

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.cls}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
        </span>
    );
}

function Styles() {
    return (
        <style>{`
            @keyframes lpRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes lpFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes lpPop { from { opacity: 0; transform: translateY(14px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes lpSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slideIn { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes lpDrop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes lpPing { 0% { transform: scale(.9); opacity: .7; } 100% { transform: scale(1.6); opacity: 0; } }
            @keyframes lpShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
            @keyframes lpFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
            @keyframes lpFloatRev { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
            @keyframes lpSpin { to { transform: rotate(360deg); } }
            @keyframes lpBar { from { width: 0; } }

            .lp-rise { opacity: 0; animation: lpRise .65s cubic-bezier(.22,1,.36,1) forwards; }
            .lp-fade { animation: lpFade .25s ease-out both; }
            .lp-pop { animation: lpPop .4s cubic-bezier(.22,1,.36,1) both; }
            .lp-slide { animation: lpSlide .45s cubic-bezier(.22,1,.36,1) both; }
            .lp-drop { animation: lpDrop .25s ease-out both; }
            .lp-ping { animation: lpPing 1.8s ease-out infinite; }
            .lp-shimmer { background-size: 200% 100%; animation: lpShimmer 6s linear infinite; }
            .lp-float { animation: lpFloat 14s ease-in-out infinite; }
            .lp-float-rev { animation: lpFloatRev 17s ease-in-out infinite; }
            .lp-spin { animation: lpSpin .8s linear infinite; }
            .lp-bar { animation: lpBar 1s cubic-bezier(.22,1,.36,1) both; }

            .lp-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
            .lp-scroll::-webkit-scrollbar-track { background: transparent; }
            .lp-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }

            @media (prefers-reduced-motion: reduce) {
                .lp-rise { opacity: 1; animation: none; }
                .lp-fade, .lp-pop, .lp-slide, .lp-drop, .lp-ping, .lp-shimmer,
                .lp-float, .lp-float-rev, .lp-bar { animation: none !important; }
            }
        `}</style>
    );
}

function Background() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="lp-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
            <div className="lp-float-rev absolute right-[-100px] top-[10%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
            <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                    maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                }}
            />
        </div>
    );
}

function TopBar({ onMenu, title, subtitle }) {
    return (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
            <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-5 2xl:px-8">
                <button
                    type="button"
                    onClick={onMenu}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                    title="Menu"
                    aria-label="Buka menu"
                >
                    <Menu size={20} />
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="truncate text-xs text-blue-200/80">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="lp-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
        </header>
    );
}

function Toast({ message, onClose }) {
    return (
        <div className="lp-slide fixed right-5 top-5 z-[200] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">Berhasil</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
                title="Tutup"
            >
                <X size={16} />
            </button>
        </div>
    );
}

// Cangkang modal: backdrop blur + animasi pop + ring berdenyut pada ikon
function ModalCard({ z = 'z-[100]', maxW = 'max-w-sm', icon: IconCmp, tone, title, children, onClose, closeDisabled }) {
    const tones = {
        blue: { ring: 'bg-blue-400/40', icon: 'bg-blue-50 text-blue-600' },
        indigo: { ring: 'bg-indigo-400/40', icon: 'bg-indigo-50 text-indigo-600' },
        red: { ring: 'bg-red-400/40', icon: 'bg-red-50 text-red-600' },
    };
    const t = tones[tone] ?? tones.blue;

    return (
        <div className={`lp-fade fixed inset-0 ${z} flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm`}>
            <div className={`lp-pop relative w-full ${maxW} overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30`}>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={closeDisabled}
                    className="absolute right-3 top-3 cursor-pointer rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>

                <div className="px-6 pb-6 pt-8 text-center">
                    <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                        <span className={`lp-ping absolute inset-0 rounded-full ${t.ring}`} />
                        <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${t.icon}`}>
                            <IconCmp size={28} />
                        </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>

                    {children}
                </div>
            </div>
        </div>
    );
}

const btnCancel =
    'h-11 flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

const btnConfirmBase =
    'group relative flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const btnTone = {
    blue: 'from-blue-600 to-indigo-600 shadow-blue-500/30',
    indigo: 'from-indigo-600 to-violet-600 shadow-indigo-500/30',
    red: 'from-red-500 to-rose-600 shadow-red-500/30',
};

const Shine = () => (
    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
);

const Spinner = () => (
    <span className="lp-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
);

const NAMA_BULAN = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export default function Riwayat({
    tahun,
    bulan = '',
    laporan,
    flash = {},
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [laporanHapus, setLaporanHapus] = useState(null);
    const [menghapus, setMenghapus] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Dropdown item preventif per week
    const [weekTerbuka, setWeekTerbuka] = useState(null);

    // =====================================================
    // TOAST NOTIFICATION
    // =====================================================

    useEffect(() => {
        if (!flash?.success) return;

        setShowToast(true);

        const timer = setTimeout(() => {
            setShowToast(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, [flash?.success]);

    // =====================================================
    // TOGGLE WEEK
    // =====================================================

    const toggleWeek = (id) => {
        setWeekTerbuka((prev) => (
            prev === id ? null : id
        ));
    };

    // =====================================================
    // HAPUS LAPORAN
    // =====================================================

    const hapusLaporan = () => {
        if (!laporanHapus || menghapus) return;

        setMenghapus(true);

        router.delete(`/laporan-mingguan/${laporanHapus.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setLaporanHapus(null);
            },

            onFinish: () => {
                setMenghapus(false);
            },
        });
    };

    // =====================================================
    // FILTER TAHUN DAN BULAN
    // =====================================================

    const pilihFilter = (filterTahun, filterBulan) => {
        router.get(
            '/laporan-mingguan',
            {
                tahun: Number(filterTahun),
                bulan: filterBulan || '',
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const pilihTahun = (value) => {
        pilihFilter(value, bulan);
    };

    const pilihBulan = (value) => {
        pilihFilter(tahun, value);
    };

    return (
        <>
            <Head title="Riwayat Laporan Mingguan" />

            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <Styles />

            {/* =====================================================
                TOAST NOTIFICATION
            ===================================================== */}

            {showToast && flash?.success && (
                <Toast
                    message={flash.success}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* =====================================================
                MAIN
            ===================================================== */}

            <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
                <Background />

                <TopBar
                    onMenu={() => setShowSidebar(true)}
                    title="Report Mingguan Preventif"
                    subtitle="Riwayat laporan preventif mingguan"
                />

                <main className="w-full space-y-4 px-3 py-5 sm:px-5 2xl:px-8">

                    <section className={`lp-rise overflow-hidden ${card}`}>

                        <div className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                        <div className="p-5 sm:p-6">

                            {/* =================================================
                                JUDUL
                            ================================================= */}

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                                <div className="flex items-center gap-3">

                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                                        <ClipboardList className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                            Riwayat Laporan Mingguan
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Daftar laporan preventif yang sudah dibuat.
                                        </p>
                                    </div>

                                </div>

                                <Link
                                    href="/laporan-mingguan/form"
                                    className="group relative inline-flex h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                                >
                                    <Shine />
                                    <Plus className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                    <span className="relative">Buat Laporan Baru</span>
                                </Link>

                            </div>

                            {/* =================================================
                                FILTER TAHUN DAN BULAN
                            ================================================= */}

                            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">

                                <div className="flex flex-wrap items-end gap-3">

                                    {/* FILTER TAHUN */}
                                    <div>
                                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                                            Filter Tahun
                                        </label>

                                        <select
                                            value={tahun}
                                            onChange={(e) => pilihTahun(e.target.value)}
                                            className={selectClass}
                                        >
                                            {Array.from(
                                                { length: 16 },
                                                (_, i) => 2020 + i
                                            ).map((y) => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* FILTER BULAN */}
                                    <div>
                                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                                            Filter Bulan
                                        </label>

                                        <select
                                            value={bulan ?? ''}
                                            onChange={(e) => pilihBulan(e.target.value)}
                                            className={`${selectClass} min-w-[145px]`}
                                        >
                                            <option value="">Semua Bulan</option>

                                            {NAMA_BULAN.map((nama, index) => (
                                                <option key={index + 1} value={index + 1}>
                                                    {nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    Total: {laporan.total} laporan
                                </div>

                            </div>

                            {/* =================================================
                                TABEL
                            ================================================= */}

                            <div className="lp-scroll mt-5 overflow-x-auto rounded-xl border border-slate-200">

                                <table className="w-full border-separate border-spacing-0">

                                    <thead>
                                        <tr>
                                            {[
                                                'No',
                                                'Periode',
                                                'Jumlah Item',
                                                'Status',
                                                'Tanggal Dikirim',
                                                'Tanggal Disetujui',
                                                'Aksi',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className={`${thClass} text-center`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {laporan.data.length === 0 ? (

                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-16 text-center"
                                                >
                                                    <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                        <ClipboardList className="h-7 w-7 text-slate-400" />
                                                    </span>

                                                    <p className="font-semibold text-slate-600">
                                                        Belum ada riwayat laporan.
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Silakan buat laporan mingguan baru.
                                                    </p>
                                                </td>
                                            </tr>

                                        ) : (

                                            laporan.data.map((item, index) => {

                                                const status =
                                                    STATUS[item.status] ??
                                                    STATUS.draft;

                                                const isOpen =
                                                    weekTerbuka === item.id;

                                                const daftarItem =
                                                    item.item_preventif ?? [];

                                                return (

                                                    <tr
                                                        key={item.id}
                                                        style={delay(Math.min(index, 8) * 40)}
                                                        className="lp-rise transition-colors hover:bg-blue-50/50"
                                                    >

                                                        {/* NO */}

                                                        <td
                                                            className={`${tdClass} text-center text-slate-400`}
                                                        >
                                                            {(laporan.from ?? 1) + index}
                                                        </td>

                                                        {/* =================================================
                                                            PERIODE + DROPDOWN COMPACT
                                                        ================================================= */}

                                                        <td className={`${tdClass} min-w-[200px]`}>

                                                            <button
                                                                type="button"
                                                                onClick={() => toggleWeek(item.id)}
                                                                aria-expanded={isOpen}
                                                                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left transition-colors ${
                                                                    isOpen
                                                                        ? 'bg-blue-50'
                                                                        : 'hover:bg-slate-50'
                                                                }`}
                                                            >

                                                                <div className="min-w-0">

                                                                    <p className="text-xs font-bold text-slate-800">
                                                                        Week {item.week}
                                                                    </p>

                                                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                                                        {item.periode_tanggal
                                                                            ? `${item.periode_tanggal} ${item.tahun}`
                                                                            : `${item.nama_bulan} ${item.tahun}`}
                                                                    </p>

                                                                </div>

                                                                <div className="flex shrink-0 items-center gap-1.5">

                                                                    <span className="rounded-md bg-blue-100/70 px-2 py-1 text-[10px] font-bold text-blue-600">
                                                                        {daftarItem.length || item.items_count || 0}
                                                                    </span>

                                                                    <ChevronDown
                                                                        size={15}
                                                                        className={`text-slate-400 transition-transform duration-300 ${
                                                                            isOpen ? 'rotate-180' : ''
                                                                        }`}
                                                                    />

                                                                </div>

                                                            </button>

                                                            {/* DROPDOWN ITEM */}

                                                            {isOpen && (

                                                                <div className="lp-drop mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">

                                                                    <div className="mb-2 flex items-center justify-between">

                                                                        <p className="text-[10px] font-semibold text-slate-500">
                                                                            Item Preventif
                                                                        </p>

                                                                        <span className="text-[10px] font-medium text-slate-400">
                                                                            {daftarItem.length} item
                                                                        </span>

                                                                    </div>

                                                                    {daftarItem.length > 0 ? (

                                                                        <ol className="lp-scroll max-h-36 space-y-1.5 overflow-y-auto pr-1">

                                                                            {daftarItem.map((nama, itemIndex) => (

                                                                                <li
                                                                                    key={`${item.id}-${itemIndex}`}
                                                                                    className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-700"
                                                                                >

                                                                                    <span className="w-4 shrink-0 text-right font-semibold tabular-nums text-blue-500">
                                                                                        {itemIndex + 1}.
                                                                                    </span>

                                                                                    <span className="min-w-0 break-words">
                                                                                        {nama}
                                                                                    </span>

                                                                                </li>

                                                                            ))}

                                                                        </ol>

                                                                    ) : (

                                                                        <p className="py-1 text-[11px] text-slate-400">
                                                                            Belum ada item preventif.
                                                                        </p>

                                                                    )}

                                                                </div>

                                                            )}

                                                        </td>

                                                        {/* JUMLAH ITEM */}

                                                        <td
                                                            className={`${tdClass} text-center`}
                                                        >
                                                            <span className="font-semibold text-slate-700">
                                                                {item.items_count}
                                                            </span>
                                                        </td>

                                                        {/* STATUS */}

                                                        <td
                                                            className={`${tdClass} text-center`}
                                                        >

                                                            <StatusPill status={status} />

                                                            {item.status === 'ditolak' &&
                                                                item.alasan_penolakan && (

                                                                    <p
                                                                        title={item.alasan_penolakan}
                                                                        className="mx-auto mt-1.5 max-w-[180px] truncate text-[11px] text-red-500"
                                                                    >
                                                                        {item.alasan_penolakan}
                                                                    </p>

                                                                )}

                                                        </td>

                                                        {/* TANGGAL DIKIRIM */}

                                                        <td
                                                            className={`${tdClass} whitespace-nowrap text-center text-xs text-slate-500`}
                                                        >
                                                            {item.dikirim_pada || '-'}
                                                        </td>

                                                        {/* TANGGAL DISETUJUI */}

                                                        <td
                                                            className={`${tdClass} whitespace-nowrap text-center text-xs text-slate-500`}
                                                        >
                                                            {item.disetujui_pada || '-'}
                                                        </td>

                                                        {/* AKSI */}

                                                        <td
                                                            className={`${tdClass} min-w-[110px]`}
                                                        >

                                                            <div className="flex items-center justify-center gap-2">

                                                                <Link
                                                                    href={`/laporan-mingguan/form?bulan=${item.bulan}&tahun=${item.tahun}&week=${item.week}`}
                                                                    title="Lihat laporan"
                                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0"
                                                                >
                                                                    <Eye size={17} />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    disabled={item.status === 'disetujui'}
                                                                    onClick={() => setLaporanHapus(item)}
                                                                    title={
                                                                        item.status === 'disetujui'
                                                                            ? 'Laporan sudah disetujui'
                                                                            : 'Hapus laporan'
                                                                    }
                                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-red-50 disabled:hover:text-red-600 disabled:hover:shadow-none"
                                                                >
                                                                    <Trash2 size={17} />
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            })

                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* =================================================
                                PAGINATION
                            ================================================= */}

                            {laporan.last_page > 1 && (

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">

                                    <p className="text-xs text-slate-500">
                                        Menampilkan {laporan.from}–{laporan.to} dari{' '}
                                        {laporan.total} laporan
                                    </p>

                                    <div className="flex flex-wrap gap-1.5">

                                        {laporan.links.map((link, index) => (

                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url && router.visit(link.url)
                                                }
                                                className={`min-w-9 cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
                                                    link.active
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:text-blue-600 hover:ring-blue-300'
                                                } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0`}
                                            >
                                                {index === 0
                                                    ? '‹'
                                                    : index === laporan.links.length - 1
                                                        ? '›'
                                                        : link.label}
                                            </button>

                                        ))}

                                    </div>

                                </div>

                            )}

                        </div>

                    </section>

                </main>

            </div>

            {/* =====================================================
                MODAL KONFIRMASI HAPUS
            ===================================================== */}

            {laporanHapus && (

                <ModalCard
                    icon={AlertTriangle}
                    tone="red"
                    title="Hapus Laporan?"
                    onClose={() => setLaporanHapus(null)}
                    closeDisabled={menghapus}
                >

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Yakin ingin menghapus laporan

                        <span className="font-bold text-slate-700">
                            {' '}
                            Week {laporanHapus.week}{' '}
                            {laporanHapus.nama_bulan}{' '}
                            {laporanHapus.tahun}
                        </span>
                        ?
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                        Laporan akan dipindahkan ke data terhapus dan
                        tidak tampil lagi di riwayat.
                    </p>

                    <div className="mt-6 flex gap-3">

                        <button
                            type="button"
                            disabled={menghapus}
                            onClick={() => setLaporanHapus(null)}
                            className={btnCancel}
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            disabled={menghapus}
                            onClick={hapusLaporan}
                            className={`${btnConfirmBase} ${btnTone.red}`}
                        >
                            <Shine />

                            {menghapus ? (
                                <span className="relative flex items-center gap-2">
                                    <Spinner />
                                    Menghapus...
                                </span>
                            ) : (
                                <span className="relative">Ya, Hapus</span>
                            )}
                        </button>

                    </div>

                </ModalCard>

            )}

        </>
    );
}
