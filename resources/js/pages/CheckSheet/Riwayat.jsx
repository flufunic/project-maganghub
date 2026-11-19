
import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

// =========================================================
// STYLE TOKENS
// =========================================================

const cardClass =
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]';

const selectClass =
    'h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100';

const primaryButton =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

const secondaryButton =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

// =========================================================
// STATUS
// =========================================================

const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        shortLabel: 'Menunggu',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
    },
    diperiksa: {
        label: 'Sudah Diperiksa',
        shortLabel: 'Diperiksa',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
    },
    ditolak: {
        label: 'Ditolak',
        shortLabel: 'Ditolak',
        className: 'border-red-200 bg-red-50 text-red-700',
        dot: 'bg-red-500',
    },
};

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'menunggu', label: 'Menunggu' },
    { key: 'diperiksa', label: 'Diperiksa' },
    { key: 'ditolak', label: 'Ditolak' },
];

// =========================================================
// ICON
// =========================================================

function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        back: <path d="M15 19l-7-7 7-7" />,
        menu: <path d="M4 6h16M4 12h16M4 18h16" />,
        send: <>
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </>,
        filter: <>
            <path d="M4 7h16M7 12h10M10 17h4" />
        </>,
        calendar: <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
        </>,
        building: <>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
        </>,
        history: <>
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
            <path d="M3 3v5h5M12 7v5l3 2" />
        </>,
        empty: <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M8 9h8M8 13h5M8 17h8" />
        </>,
        refresh: <>
            <path d="M20 7v5h-5M4 17v-5h5" />
            <path d="M5.64 9A7 7 0 0117.5 6.5L20 12M4 12l2.5 5.5A7 7 0 0018.36 15" />
        </>,
        clock: <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>,
        check: <path d="M5 12l4 4L19 6" />,
        alert: <>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9L2.5 17.4A2 2 0 004.2 20h15.6a2 2 0 001.7-2.6L13.7 3.9a2 2 0 00-3.4 0z" />
        </>,
        close: <path d="M18 6L6 18M6 6l12 12" />,
        document: <>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h8" />
        </>,
        search: <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </>,
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status, compact = false }) {
    const config = STATUS[status] || STATUS.menunggu;

    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border font-bold ${config.className} ${
                compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}

// =========================================================
// CONFIRMATION MODAL
// =========================================================

function ConfirmDialog({
    open,
    onCancel,
    onConfirm,
    periode,
}) {
    if (!open) return null;

    return (
        <div
            className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="modal-content w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 px-5 py-5">
                    <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
                    <div className="absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                                <Icon name="refresh" className="h-5 w-5" />
                            </span>

                            <div>
                                <h2
                                    id="confirm-title"
                                    className="text-base font-bold text-white"
                                >
                                    Kirim Ulang Check Sheet?
                                </h2>
                                <p className="mt-0.5 text-xs text-blue-100">
                                    Konfirmasi pengiriman ulang
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white"
                            aria-label="Tutup modal"
                        >
                            <Icon name="close" className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-600">
                        Check Sheet periode{' '}
                        <strong className="font-bold text-slate-800">
                            {periode}
                        </strong>{' '}
                        sebelumnya ditolak. Kamu akan diarahkan ke halaman
                        pengiriman untuk melakukan perbaikan dan mengirim
                        ulang data.
                    </p>

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
                        <Icon
                            name="alert"
                            className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        />
                        <p className="text-[11px] leading-relaxed text-blue-800">
                            Pastikan data sudah diperbaiki sebelum dikirim
                            kembali kepada pimpinan.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={secondaryButton}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className={primaryButton}
                    >
                        <Icon name="send" className="h-4 w-4" />
                        Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({ filterAktif, resetFilter }) {
    return (
        <div className="px-5 py-16 text-center animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                <Icon name="empty" className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-800">
                Belum ada riwayat pengiriman
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                Belum ada data pengiriman yang sesuai dengan filter yang dipilih.
            </p>

            {filterAktif && (
                <button
                    type="button"
                    onClick={resetFilter}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
                >
                    <Icon name="refresh" className="h-3.5 w-3.5" />
                    Reset Filter
                </button>
            )}
        </div>
    );
}

// =========================================================
// RIWAYAT TABLE ROW
// =========================================================

function RiwayatRow({ p, onResend }) {
    return (
        <tr className="group transition-colors duration-200 hover:bg-blue-50/40">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                        <Icon name="calendar" className="h-4 w-4" />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-800">
                            {p.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                            Tahun {p.tahun || '-'}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon name="building" className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                        {p.divisi}
                    </span>
                </div>
            </td>

            <td className="px-5 py-4">
                <div className="space-y-2">
                    <StatusBadge status={p.status} />

                    {p.status === 'ditolak' && (
                        <div className="max-w-[280px] rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                                Alasan Penolakan
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                {p.alasan_penolakan || '-'}
                            </p>
                        </div>
                    )}
                </div>
            </td>

            <td className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-700">
                    {p.dikirim_pada || '-'}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                    Dikirim oleh {p.dikirim_oleh || '-'}
                </p>
            </td>

            <td className="px-5 py-4 text-center">
                {p.status === 'ditolak' ? (
                    <button
                        type="button"
                        onClick={() => onResend(p)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-[11px] font-bold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0"
                    >
                        <Icon name="refresh" className="h-3.5 w-3.5" />
                        Kirim Ulang
                    </button>
                ) : (
                    <span className="text-xs text-slate-300">—</span>
                )}
            </td>
        </tr>
    );
}

// =========================================================
// RIWAYAT MOBILE CARD
// =========================================================

function RiwayatCard({ p, onResend }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-800">
                        {p.label}
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-slate-400">
                        Tahun {p.tahun || '-'}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <Icon
                            name="building"
                            className="h-3.5 w-3.5 text-blue-600"
                        />
                        {p.divisi}
                    </div>
                </div>

                <StatusBadge status={p.status} compact />
            </div>

            {p.status === 'ditolak' && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50/70 p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                        Alasan Penolakan
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {p.alasan_penolakan || '-'}
                    </p>
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div>
                    <p className="text-[11px] font-semibold text-slate-600">
                        {p.dikirim_pada || '-'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                        Dikirim oleh {p.dikirim_oleh || '-'}
                    </p>
                </div>

                {p.status === 'ditolak' && (
                    <button
                        type="button"
                        onClick={() => onResend(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                        <Icon name="refresh" className="h-3 w-3" />
                        Kirim Ulang
                    </button>
                )}
            </div>
        </article>
    );
}

// =========================================================
// PAGE
// =========================================================

export default function Riwayat({ pengirimans = [], divisis = [] }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [status, setStatus] = useState('semua');
    const [divisi, setDivisi] = useState('semua');
    const [tahun, setTahun] = useState('semua');
    const [selectedResend, setSelectedResend] = useState(null);

    const daftarTahun = useMemo(
        () =>
            [...new Set(pengirimans.map((p) => p.tahun))].sort(
                (a, b) => b - a
            ),
        [pengirimans]
    );

    const hitung = (key) =>
        key === 'semua'
            ? pengirimans.length
            : pengirimans.filter((p) => p.status === key).length;

    const daftar = useMemo(
        () =>
            pengirimans.filter(
                (p) =>
                    (status === 'semua' || p.status === status) &&
                    (divisi === 'semua' || String(p.divisi_id) === divisi) &&
                    (tahun === 'semua' || String(p.tahun) === tahun)
            ),
        [pengirimans, status, divisi, tahun]
    );

    const kembali = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/check-sheets');
        }
    };

    const resetFilter = () => {
        setStatus('semua');
        setDivisi('semua');
        setTahun('semua');
    };

    const filterAktif =
        status !== 'semua' || divisi !== 'semua' || tahun !== 'semua';

    const bukaKirimUlang = (p) => {
        setSelectedResend(p);
    };

    const konfirmasiKirimUlang = () => {
        if (!selectedResend) return;

        const url = `/check-sheet-pengiriman?bulan=${selectedResend.bulan}&tahun=${selectedResend.tahun}`;

        setSelectedResend(null);
        router.visit(url);
    };

    return (
        <>
            <Head title="Riwayat Pengiriman" />

            <style>{`
                @keyframes pageEnter {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes sectionEnter {
                    from {
                        opacity: 0;
                        transform: translateY(9px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes modalEnter {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes overlayEnter {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .page-enter {
                    animation: pageEnter .45s ease-out both;
                }

                .section-enter {
                    animation: sectionEnter .45s ease-out both;
                }

                .modal-overlay {
                    animation: overlayEnter .18s ease-out both;
                }

                .modal-content {
                    animation: modalEnter .22s ease-out both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .page-enter,
                    .section-enter,
                    .modal-overlay,
                    .modal-content {
                        animation: none !important;
                    }

                    *, *::before, *::after {
                        transition-duration: .01ms !important;
                    }
                }
            `}</style>

            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100">
                {/* BACKGROUND ACCENTS */}
                <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[100px]" />
                    <div className="absolute -bottom-48 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-200/30 blur-[100px]" />
                </div>

                {/* HEADER */}
                <header className="relative z-40 border-b border-white/10 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={kembali}
                            title="Kembali"
                            aria-label="Kembali ke halaman sebelumnya"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/20 active:scale-95"
                        >
                            <Icon name="back" className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            aria-label="Buka menu"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/20 active:scale-95"
                        >
                            <Icon name="menu" className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                Riwayat Pengiriman
                            </h1>

                            <p className="mt-0.5 hidden truncate text-[11px] font-medium text-blue-200 sm:block">
                                Check Sheet Prediktif / Riwayat Pengiriman
                            </p>
                        </div>

                        <Link
                            href="/check-sheet-pengiriman"
                            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm shadow-emerald-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0 sm:px-4"
                        >
                            <Icon name="send" className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Kirim ke Pimpinan
                            </span>
                            <span className="sm:hidden">Kirim</span>
                        </Link>
                    </div>
                </header>

                {/* MAIN */}
                <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="page-enter">
                        {/* PAGE INTRO */}
                        <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                    Daftar Riwayat
                                </h2>

                                <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                                    Pantau status pemeriksaan dan tindak lanjuti pengiriman Check Sheet.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Icon name="document" className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Total Pengiriman
                                    </p>
                                    <p className="mt-0.5 text-xl font-black leading-none text-slate-800">
                                        {pengirimans.length}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* STATUS FILTER */}
                        <section className="section-enter mb-5">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-4 w-1 rounded-full bg-blue-600" />
                                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                                    Status Pengiriman
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                                {FILTERS.map((f) => {
                                    const active = status === f.key;

                                    return (
                                        <button
                                            key={f.key}
                                            type="button"
                                            onClick={() => setStatus(f.key)}
                                            className={`inline-flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:justify-center ${
                                                active
                                                    ? 'border-blue-200 bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60'
                                            }`}
                                        >
                                            <span>{f.label}</span>

                                            <span
                                                className={`min-w-6 rounded-md px-1.5 py-1 text-[10px] font-extrabold tabular-nums ${
                                                    active
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {hitung(f.key)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* FILTER CARD */}
                        <section className={`${cardClass} section-enter mb-5 overflow-hidden`}>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon name="filter" className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Filter Data
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Saring riwayat berdasarkan divisi dan tahun
                                        </p>
                                    </div>
                                </div>

                                {filterAktif && (
                                    <button
                                        type="button"
                                        onClick={resetFilter}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        <Icon name="refresh" className="h-3.5 w-3.5" />
                                        Reset Filter
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,0.7fr)_auto] lg:items-end">
                                <label className="block min-w-0">
                                    <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <Icon name="building" className="h-3.5 w-3.5 text-slate-400" />
                                        Divisi
                                    </span>

                                    <select
                                        value={divisi}
                                        onChange={(e) => setDivisi(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="semua">Semua divisi</option>
                                        {divisis.map((d) => (
                                            <option key={d.id} value={String(d.id)}>
                                                {d.nama}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block min-w-0">
                                    <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <Icon name="calendar" className="h-3.5 w-3.5 text-slate-400" />
                                        Tahun
                                    </span>

                                    <select
                                        value={tahun}
                                        onChange={(e) => setTahun(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="semua">Semua tahun</option>
                                        {daftarTahun.map((y) => (
                                            <option key={y} value={String(y)}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="flex h-11 items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/70 px-4 sm:col-span-2 lg:col-span-1 lg:min-w-[155px]">
                                    <span className="text-[11px] font-semibold text-slate-500">
                                        Hasil filter
                                    </span>
                                    <strong className="text-sm font-black text-blue-700">
                                        {daftar.length} data
                                    </strong>
                                </div>
                            </div>
                        </section>

                        {/* DATA TABLE */}
                        <section className={`${cardClass} section-enter overflow-hidden`}>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Icon name="history" className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Data Pengiriman
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Informasi status dan hasil pemeriksaan pimpinan
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-slate-500">
                                    {daftar.length} RECORD
                                </span>
                            </div>

                            {daftar.length === 0 ? (
                                <EmptyState
                                    filterAktif={filterAktif}
                                    resetFilter={resetFilter}
                                />
                            ) : (
                                <>
                                    {/* DESKTOP TABLE */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full min-w-[850px] text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    <th className="px-5 py-4">Periode</th>
                                                    <th className="px-5 py-4">Divisi</th>
                                                    <th className="px-5 py-4">Status Pemeriksaan</th>
                                                    <th className="px-5 py-4">Informasi Pengiriman</th>
                                                    <th className="px-5 py-4 text-center">Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {daftar.map((p) => (
                                                    <RiwayatRow
                                                        key={p.id}
                                                        p={p}
                                                        onResend={bukaKirimUlang}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* MOBILE CARDS */}
                                    <div className="space-y-3 bg-slate-50/60 p-3 md:hidden">
                                        {daftar.map((p) => (
                                            <RiwayatCard
                                                key={p.id}
                                                p={p}
                                                onResend={bukaKirimUlang}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </section>

                        <p className="mt-4 text-right text-[10px] font-medium text-slate-400">
                            Data ditampilkan berdasarkan riwayat pengiriman Check Sheet.
                        </p>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/70">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-[10px] font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                            <span className="mx-1.5 text-slate-300">·</span>
                            Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* MODAL KONFIRMASI KIRIM ULANG */}
            <ConfirmDialog
                open={!!selectedResend}
                periode={selectedResend?.label || ''}
                onCancel={() => setSelectedResend(null)}
                onConfirm={konfirmasiKirimUlang}
            />
        </>
    );
}
