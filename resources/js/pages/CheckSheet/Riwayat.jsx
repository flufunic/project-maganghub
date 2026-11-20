import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

// =========================================================
// STYLE TOKENS
// =========================================================

const cardClass =
    'rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_48px_-12px_rgba(15,23,42,0.10)]';

const selectClass =
    'h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const primaryButton =
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/35 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30';

const secondaryButton =
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50';

// =========================================================
// STATUS
// =========================================================

const STATUS = {
    menunggu: {
        label: 'Menunggu diperiksa',
        className: 'bg-amber-50 text-amber-700 ring-amber-200/80',
        dot: 'bg-amber-500',
        pulse: true,
    },
    diperiksa: {
        label: 'Sudah diperiksa',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
        dot: 'bg-emerald-500',
        pulse: false,
    },
    ditolak: {
        label: 'Ditolak',
        className: 'bg-red-50 text-red-700 ring-red-200/80',
        dot: 'bg-red-500',
        pulse: false,
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
        send: (
            <>
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
            </>
        ),
        building: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
            </>
        ),
        empty: (
            <>
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 9h8M8 13h5M8 17h8" />
            </>
        ),
        refresh: (
            <>
                <path d="M20 7v5h-5M4 17v-5h5" />
                <path d="M5.64 9A7 7 0 0117.5 6.5L20 12M4 12l2.5 5.5A7 7 0 0018.36 15" />
            </>
        ),
        chevron: <path d="M6 9l6 6 6-6" />,
        alert: (
            <>
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9L2.5 17.4A2 2 0 004.2 20h15.6a2 2 0 001.7-2.6L13.7 3.9a2 2 0 00-3.4 0z" />
            </>
        ),
        close: <path d="M18 6L6 18M6 6l12 12" />,
        document: (
            <>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h8" />
            </>
        ),
        info: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
            </>
        ),
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

function StatusBadge({ status }) {
    const config = STATUS[status] || STATUS.menunggu;

    return (
        <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ${config.className}`}
        >
            <span className="relative flex h-2 w-2">
                {config.pulse && (
                    <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${config.dot}`}
                    />
                )}
                <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`}
                />
            </span>
            {config.label}
        </span>
    );
}

// =========================================================
// CONFIRMATION MODAL
// =========================================================

function ConfirmDialog({ open, onCancel, onConfirm, periode, divisi }) {
    const confirmRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key === 'Escape') onCancel();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        confirmRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            className="modal-overlay fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-md sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onCancel();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-desc"
                className="modal-content w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
            >
                <div className="relative px-6 pb-2 pt-7 text-center">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50"
                        aria-label="Tutup"
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>

                    <div className="modal-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                            <Icon name="refresh" className="h-5 w-5" />
                        </span>
                    </div>

                    <h2
                        id="confirm-title"
                        className="mt-5 text-lg font-extrabold tracking-tight text-slate-900"
                    >
                        Kirim ulang check sheet?
                    </h2>

                    <p
                        id="confirm-desc"
                        className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500"
                    >
                        Pengiriman sebelumnya ditolak. Kamu akan diarahkan ke
                        halaman pengiriman untuk memperbaiki dan mengirim
                        ulang data.
                    </p>
                </div>

                <div className="mx-6 mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                        <Icon name="calendar" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                            {periode}
                        </p>
                        {divisi && (
                            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                                Divisi {divisi}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mx-6 mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                    <Icon
                        name="info"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500"
                    />
                    Pastikan data sudah diperbaiki sebelum dikirim kembali ke
                    pimpinan.
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 px-6 pb-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={secondaryButton}
                    >
                        Batal
                    </button>

                    <button
                        ref={confirmRef}
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
        <div className="px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Icon name="empty" className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-sm font-extrabold text-slate-800">
                {filterAktif
                    ? 'Tidak ada data yang cocok'
                    : 'Belum ada riwayat pengiriman'}
            </h3>

            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                {filterAktif
                    ? 'Coba ubah atau reset filter untuk melihat data lainnya.'
                    : 'Riwayat akan muncul di sini setelah check sheet dikirim ke pimpinan.'}
            </p>

            {filterAktif && (
                <button
                    type="button"
                    onClick={resetFilter}
                    className={`${primaryButton} mt-6`}
                >
                    <Icon name="refresh" className="h-3.5 w-3.5" />
                    Reset filter
                </button>
            )}
        </div>
    );
}

// =========================================================
// RIWAYAT TABLE ROW
// =========================================================

function RiwayatRow({ p, onResend, index }) {
    return (
        <tr
            className="row-enter group transition-colors duration-200 hover:bg-slate-50/80"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-105">
                        <Icon name="calendar" className="h-[18px] w-[18px]" />
                    </div>

                    <div>
                        <p className="text-[13px] font-bold text-slate-800">
                            {p.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                            Tahun {p.tahun || '-'}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    <Icon name="building" className="h-3.5 w-3.5 text-slate-400" />
                    {p.divisi}
                </span>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-2">
                    <StatusBadge status={p.status} />

                    {p.status === 'ditolak' && (
                        <div className="max-w-[300px] border-l-2 border-red-300 pl-3">
                            <p className="text-[11px] font-bold text-red-600">
                                Alasan penolakan
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                {p.alasan_penolakan || '-'}
                            </p>
                        </div>
                    )}
                </div>
            </td>

            <td className="px-6 py-4">
                <p className="text-xs font-semibold text-slate-700">
                    {p.dikirim_pada || '-'}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                    oleh {p.dikirim_oleh || '-'}
                </p>
            </td>

            <td className="px-6 py-4 text-right">
                {p.status === 'ditolak' ? (
                    <button
                        type="button"
                        onClick={() => onResend(p)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[11px] font-bold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
                    >
                        <Icon name="refresh" className="h-3.5 w-3.5" />
                        Kirim ulang
                    </button>
                ) : (
                    <span className="text-xs text-slate-300">-</span>
                )}
            </td>
        </tr>
    );
}

// =========================================================
// RIWAYAT MOBILE CARD
// =========================================================

function RiwayatCard({ p, onResend, index }) {
    return (
        <article
            className="row-enter rounded-2xl border border-slate-200 bg-white p-4"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon name="calendar" className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-800">
                            {p.label}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {p.divisi} · {p.tahun || '-'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <StatusBadge status={p.status} />
            </div>

            {p.status === 'ditolak' && (
                <div className="mt-3 rounded-xl bg-red-50/70 p-3">
                    <p className="text-[11px] font-bold text-red-600">
                        Alasan penolakan
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {p.alasan_penolakan || '-'}
                    </p>
                </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-slate-600">
                        {p.dikirim_pada || '-'}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        oleh {p.dikirim_oleh || '-'}
                    </p>
                </div>

                {p.status === 'ditolak' && (
                    <button
                        type="button"
                        onClick={() => onResend(p)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-[11px] font-bold text-white shadow-md shadow-blue-600/20 transition active:scale-[0.97]"
                    >
                        <Icon name="refresh" className="h-3.5 w-3.5" />
                        Kirim ulang
                    </button>
                )}
            </div>
        </article>
    );
}

// =========================================================
// FILTER SELECT
// =========================================================

function FilterSelect({ icon, label, value, onChange, children }) {
    return (
        <label className="relative block min-w-0">
            <span className="sr-only">{label}</span>
            <Icon
                name={icon}
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <select value={value} onChange={onChange} className={selectClass}>
                {children}
            </select>
            <Icon
                name="chevron"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
        </label>
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

    const activeIndex = Math.max(
        0,
        FILTERS.findIndex((f) => f.key === status)
    );

    const bukaKirimUlang = (p) => setSelectedResend(p);
    const tutupDialog = () => setSelectedResend(null);

    const konfirmasiKirimUlang = () => {
        if (!selectedResend) return;

        const url = `/check-sheet-pengiriman?bulan=${selectedResend.bulan}&tahun=${selectedResend.tahun}`;

        setSelectedResend(null);
        router.visit(url);
    };

    // key supaya animasi baris diputar ulang tiap filter berubah
    const listKey = `${status}-${divisi}-${tahun}`;

    return (
        <>
            <Head title="Riwayat Pengiriman" />

            <style>{`
                @keyframes pageEnter {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes rowEnter {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes overlayEnter {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes modalEnter {
                    0% { opacity: 0; transform: translateY(24px) scale(.95); }
                    60% { opacity: 1; transform: translateY(-3px) scale(1.01); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes iconPop {
                    0% { transform: scale(.4) rotate(-30deg); opacity: 0; }
                    70% { transform: scale(1.1) rotate(6deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0); opacity: 1; }
                }

                .page-enter { animation: pageEnter .5s cubic-bezier(.22,1,.36,1) both; }
                .row-enter { animation: rowEnter .4s cubic-bezier(.22,1,.36,1) both; }
                .modal-overlay { animation: overlayEnter .2s ease-out both; }
                .modal-content { animation: modalEnter .38s cubic-bezier(.22,1,.36,1) both; }
                .modal-icon { animation: iconPop .5s cubic-bezier(.34,1.56,.64,1) .12s both; }

                @media (prefers-reduced-motion: reduce) {
                    .page-enter,
                    .row-enter,
                    .modal-overlay,
                    .modal-content,
                    .modal-icon {
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
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-blue-200/40 blur-[110px]" />
                    <div className="absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-200/30 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="relative z-40 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={kembali}
                            title="Kembali"
                            aria-label="Kembali ke halaman sebelumnya"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                        >
                            <Icon name="back" className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            aria-label="Buka menu"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                        >
                            <Icon name="menu" className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                Riwayat Pengiriman
                            </h1>

                            <p className="mt-0.5 hidden truncate text-[11px] font-medium text-blue-200/80 sm:block">
                                Check Sheet Prediktif / Riwayat Pengiriman
                            </p>
                        </div>

                        <Link
                            href="/check-sheet-pengiriman"
                            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/20 transition-all duration-200 hover:bg-emerald-600 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40 sm:px-4"
                        >
                            <Icon name="send" className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Kirim ke pimpinan
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
                                    Daftar riwayat
                                </h2>

                                <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                                    Pantau status pemeriksaan dan tindak lanjuti
                                    pengiriman check sheet.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Icon name="document" className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">
                                        Total pengiriman
                                    </p>
                                    <p className="mt-0.5 text-xl font-black leading-none tabular-nums text-slate-800">
                                        {pengirimans.length}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* MAIN CARD: FILTER + DATA */}
                        <section className={`${cardClass} overflow-hidden`}>
                            {/* UNIFIED FILTER */}
                            <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
                                {/* Segmented status */}
                                <div
                                    role="tablist"
                                    aria-label="Filter status pengiriman"
                                    className="relative grid grid-cols-4 rounded-2xl bg-slate-100 p-1"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-y-1 left-1 rounded-xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
                                        style={{
                                            width: 'calc((100% - 0.5rem) / 4)',
                                            transform: `translateX(${activeIndex * 100}%)`,
                                        }}
                                    />

                                    {FILTERS.map((f) => {
                                        const active = status === f.key;

                                        return (
                                            <button
                                                key={f.key}
                                                type="button"
                                                role="tab"
                                                aria-selected={active}
                                                onClick={() => setStatus(f.key)}
                                                className={`relative z-10 flex h-10 items-center justify-center gap-1.5 rounded-xl px-1 text-xs font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:gap-2 ${
                                                    active
                                                        ? 'text-blue-700'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                <span className="truncate">
                                                    {f.label}
                                                </span>
                                                <span
                                                    className={`min-w-5 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums transition-colors duration-200 ${
                                                        active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-200/80 text-slate-500'
                                                    }`}
                                                >
                                                    {hitung(f.key)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Divisi + Tahun + Reset */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                                    <FilterSelect
                                        icon="building"
                                        label="Divisi"
                                        value={divisi}
                                        onChange={(e) => setDivisi(e.target.value)}
                                    >
                                        <option value="semua">Semua divisi</option>
                                        {divisis.map((d) => (
                                            <option key={d.id} value={String(d.id)}>
                                                {d.nama}
                                            </option>
                                        ))}
                                    </FilterSelect>

                                    <FilterSelect
                                        icon="calendar"
                                        label="Tahun"
                                        value={tahun}
                                        onChange={(e) => setTahun(e.target.value)}
                                    >
                                        <option value="semua">Semua tahun</option>
                                        {daftarTahun.map((y) => (
                                            <option key={y} value={String(y)}>
                                                {y}
                                            </option>
                                        ))}
                                    </FilterSelect>

                                    <div className="flex h-11 items-center justify-between gap-3 sm:justify-end">
                                        <span className="text-xs font-semibold text-slate-500">
                                            <strong className="tabular-nums text-slate-800">
                                                {daftar.length}
                                            </strong>{' '}
                                            data
                                        </span>

                                        {filterAktif && (
                                            <button
                                                type="button"
                                                onClick={resetFilter}
                                                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-blue-600 transition hover:bg-blue-50 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
                                            >
                                                <Icon
                                                    name="refresh"
                                                    className="h-3.5 w-3.5"
                                                />
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DATA */}
                            {daftar.length === 0 ? (
                                <EmptyState
                                    filterAktif={filterAktif}
                                    resetFilter={resetFilter}
                                />
                            ) : (
                                <div key={listKey}>
                                    {/* DESKTOP TABLE */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full min-w-[850px] text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400">
                                                    <th className="px-6 py-3.5 font-semibold">Periode</th>
                                                    <th className="px-6 py-3.5 font-semibold">Divisi</th>
                                                    <th className="px-6 py-3.5 font-semibold">Status pemeriksaan</th>
                                                    <th className="px-6 py-3.5 font-semibold">Pengiriman</th>
                                                    <th className="px-6 py-3.5 text-right font-semibold">Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {daftar.map((p, i) => (
                                                    <RiwayatRow
                                                        key={p.id}
                                                        p={p}
                                                        index={i}
                                                        onResend={bukaKirimUlang}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* MOBILE CARDS */}
                                    <div className="space-y-3 bg-slate-50/70 p-3 md:hidden">
                                        {daftar.map((p, i) => (
                                            <RiwayatCard
                                                key={p.id}
                                                p={p}
                                                index={i}
                                                onResend={bukaKirimUlang}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        <p className="mt-4 text-right text-[11px] font-medium text-slate-400">
                            Data ditampilkan berdasarkan riwayat pengiriman check sheet.
                        </p>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-[11px] font-medium text-slate-400">
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
                divisi={selectedResend?.divisi || ''}
                onCancel={tutupDialog}
                onConfirm={konfirmasiKirimUlang}
            />
        </>
    );
}
