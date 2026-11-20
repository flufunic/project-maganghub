import Sidebar from '@/Components/Sidebar';
import NotifPengiriman from '@/Components/NotifPengiriman';
import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

/* ================================================================
| ICON
================================================================ */
const ICONS = {
    plus: ['M12 5v14M5 12h14'],
    menu: ['M4 6h16M4 12h16M4 18h16'],
    send: ['M22 2 11 13', 'm22 2-7 20-4-9-9-4Z'],
    history: ['M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'],
    scan: [
        'M4 8V6a2 2 0 012-2h2',
        'M16 4h2a2 2 0 012 2v2',
        'M20 16v2a2 2 0 01-2 2h-2',
        'M8 20H6a2 2 0 01-2-2v-2',
        'M4 12h16',
    ],
    pin: [
        'M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z',
        'M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    ],
    clipboard: ['M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2', 'M9 3h6v4H9z', 'M9 12h6M9 16h6'],
    eye: [
        'M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.05.153.05.316 0 .469C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z',
        'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    ],
    edit: [
        'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
        'M15 5l4 4',
    ],
    trash: [
        'M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5',
        'M10 11v5.5M14 11v5.5',
    ],
    close: ['M18 6 6 18M6 6l12 12'],
    check: ['M5 12l4 4L19 6'],
    alert: ['M12 9v4m0 4h.01', 'M10.3 3.9 2.6 17.2A2 2 0 004.3 20h15.4a2 2 0 001.7-2.8L13.7 3.9a2 2 0 00-3.4 0z'],
    info: ['M12 11v5M12 8h.01', 'M12 21a9 9 0 100-18 9 9 0 000 18z'],
};

function Icon({ name, className = 'h-4 w-4', strokeWidth = 1.8 }) {
    const paths = ICONS[name];

    if (!paths) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {paths.map((path, index) => (
                <path key={index} d={path} />
            ))}
        </svg>
    );
}

function Spinner({ className = 'h-4 w-4' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`animate-spin ${className}`}
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

/* ================================================================
| HELPER
================================================================ */
const getNamaDivisi = (checkSheet) =>
    checkSheet.divisi?.nama_divisi || '-';

const TOAST_KEY = 'checksheet_toast';

const pad = (number) => String(number).padStart(2, '0');

const formatYmd = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const hitungMingguIni = () => {
    const senin = new Date();
    senin.setHours(0, 0, 0, 0);
    senin.setDate(senin.getDate() - ((senin.getDay() + 6) % 7));

    const minggu = new Date(senin);
    minggu.setDate(senin.getDate() + 6);

    const pendek = { day: 'numeric', month: 'short' };

    return {
        mulai: formatYmd(senin),
        label: `${senin.toLocaleDateString('id-ID', pendek)} – ${minggu.toLocaleDateString(
            'id-ID',
            { ...pendek, year: 'numeric' }
        )}`,
    };
};

/* ================================================================
| STYLE CLASS
================================================================ */
const cardClass =
    'rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_48px_-12px_rgba(15,23,42,0.10)]';

const actionButton =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg outline-none transition-all duration-200 active:scale-90 focus-visible:ring-4 focus-visible:ring-blue-500/20';

const buttonBase =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold outline-none transition-all duration-200 active:scale-[0.97] focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const primaryButton = `${buttonBase} bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 focus-visible:ring-blue-500/30`;

const successButton = `${buttonBase} bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-500/30`;

const secondaryButton = `${buttonBase} border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300/50`;

const thClass =
    'sticky top-0 z-20 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-[11px] font-semibold text-slate-500';

/* ================================================================
| MAIN
================================================================ */
export default function Index({ checkSheets = [], line, flash }) {
    const { auth, errors } = usePage().props;

    const role = auth?.user?.role;
    const bolehKirim = !role || role === 'admin';

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedCheckSheet, setSelectedCheckSheet] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState(null);

    const [showKirim, setShowKirim] = useState(false);
    const [sending, setSending] = useState(false);

    const mingguIni = hitungMingguIni();

    const notify = (type, message) =>
        setToast({ id: Date.now(), type, message });

    /* ------------------------------------------------------------
    | TOAST
    ------------------------------------------------------------ */
    useEffect(() => {
        let pesan = null;

        try {
            pesan = sessionStorage.getItem(TOAST_KEY);
            sessionStorage.removeItem(TOAST_KEY);
        } catch (error) {
            pesan = null;
        }

        pesan = pesan || flash?.success;

        if (pesan) {
            notify('success', pesan);
        }
    }, [flash]);

    useEffect(() => {
        if (errors?.pengiriman) {
            notify('error', errors.pengiriman);
        }
    }, [errors]);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    /* ------------------------------------------------------------
    | MODAL: Esc untuk menutup + kunci scroll halaman
    ------------------------------------------------------------ */
    const modalTerbuka = showKirim || Boolean(selectedCheckSheet);

    useEffect(() => {
        if (!modalTerbuka) return undefined;

        const sebelumnya = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (event) => {
            if (event.key !== 'Escape') return;

            if (showKirim && !sending) setShowKirim(false);
            if (selectedCheckSheet && !deleting) setSelectedCheckSheet(null);
        };

        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = sebelumnya;
            window.removeEventListener('keydown', onKey);
        };
    }, [modalTerbuka, showKirim, selectedCheckSheet, sending, deleting]);

    /* ------------------------------------------------------------
    | SORT DATA
    ------------------------------------------------------------ */
    const sortedCheckSheets = [...checkSheets].sort(
        (a, b) =>
            getNamaDivisi(a).localeCompare(getNamaDivisi(b)) ||
            a.id - b.id
    );

    const getRowSpan = (data, index) => {
        const currentDivisi = getNamaDivisi(data[index]);

        if (
            index > 0 &&
            getNamaDivisi(data[index - 1]) === currentDivisi
        ) {
            return 0;
        }

        let count = 1;

        for (let i = index + 1; i < data.length; i++) {
            if (getNamaDivisi(data[i]) === currentDivisi) {
                count++;
            } else {
                break;
            }
        }

        return count;
    };

    /* ------------------------------------------------------------
    | DELETE
    ------------------------------------------------------------ */
    const handleDelete = () => {
        if (!selectedCheckSheet || deleting) return;

        setDeleting(true);

        router.delete(`/check-sheets/${selectedCheckSheet.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedCheckSheet(null);
                notify('success', 'Check Sheet berhasil dihapus.');
            },
            onError: () => {
                notify('error', 'Check Sheet gagal dihapus. Silakan coba kembali.');
            },
            onFinish: () => setDeleting(false),
        });
    };

    /* ------------------------------------------------------------
    | SEND WEEKLY REPORT
    ------------------------------------------------------------ */
    const handleKirim = () => {
        if (sending) return;

        router.post(
            '/check-sheet-pengiriman',
            { minggu_mulai: mingguIni.mulai },
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onError: (responseErrors) => {
                    const message =
                        responseErrors?.pengiriman ||
                        'Pengiriman gagal. Silakan coba kembali.';

                    notify('error', message);
                },
                onSuccess: () => {
                    setShowKirim(false);
                    notify('success', 'Rekap Check Sheet berhasil dikirim.');
                },
                onFinish: () => {
                    setSending(false);
                },
            }
        );
    };

    const lokasi = `${line?.divisi?.nama_divisi || '-'} / ${line?.nama_line || '-'}`;

    return (
        <>
            <Head title="Check Sheet Prediktif" />

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

                @keyframes toastEnter {
                    from { opacity: 0; transform: translateX(28px) scale(.97); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }

                @keyframes toastProgress {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }

                .page-enter { animation: pageEnter .5s cubic-bezier(.22,1,.36,1) both; }
                .row-enter { animation: rowEnter .4s cubic-bezier(.22,1,.36,1) both; }
                .overlay-enter { animation: overlayEnter .2s ease-out both; }
                .modal-enter { animation: modalEnter .38s cubic-bezier(.22,1,.36,1) both; }
                .icon-pop { animation: iconPop .5s cubic-bezier(.34,1.56,.64,1) .1s both; }
                .toast-enter { animation: toastEnter .35s cubic-bezier(.22,1,.36,1) both; }
                .toast-progress { animation: toastProgress 4.5s linear both; transform-origin: left; }

                .table-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .table-scroll::-webkit-scrollbar-track { background: transparent; }
                .table-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.35);
                    border-radius: 999px;
                }
                .table-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.55);
                }

                @media (prefers-reduced-motion: reduce) {
                    .page-enter,
                    .row-enter,
                    .overlay-enter,
                    .modal-enter,
                    .icon-pop,
                    .toast-enter,
                    .toast-progress {
                        animation: none !important;
                    }

                    * {
                        scroll-behavior: auto !important;
                        transition-duration: .01ms !important;
                    }
                }
            `}</style>

            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-blue-200/40 blur-[110px]" />
                    <div className="absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-200/30 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            title="Buka menu"
                            aria-label="Buka menu"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white outline-none transition hover:bg-white/20 active:scale-95 focus-visible:ring-4 focus-visible:ring-white/30"
                        >
                            <Icon name="menu" className="h-5 w-5" />
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                Check Sheet Prediktif
                            </h1>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200/80 sm:text-xs">
                                {line?.divisi?.nama_divisi || 'Divisi'}
                                <span className="mx-1.5 text-white/30">/</span>
                                {line?.nama_line || 'Line'}
                            </p>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {bolehKirim && <NotifPengiriman />}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="relative z-10 mx-auto w-full max-w-[1800px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
                    <div className="page-enter">
                        {/* PAGE INTRO */}
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                    Daftar Check Sheet
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Kelola dan pantau dokumen check sheet pada line ini.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Icon name="clipboard" className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400">
                                        Total dokumen
                                    </p>
                                    <p className="mt-0.5 text-xl font-black leading-none tabular-nums text-slate-800">
                                        {checkSheets.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MAIN CARD: LOKASI + AKSI + TABEL */}
                        <section className={`${cardClass} overflow-hidden`}>
                            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon name="pin" className="h-5 w-5" />
                                    </span>

                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-slate-400">
                                            Lokasi aktif
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                                            {lokasi}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {bolehKirim && (
                                        <>
                                            <Link
                                                href="/check-sheet-pengiriman/riwayat"
                                                className={secondaryButton}
                                            >
                                                <Icon name="history" className="h-4 w-4" />
                                                Riwayat Kirim
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => setShowKirim(true)}
                                                className={successButton}
                                            >
                                                <Icon name="send" className="h-4 w-4" />
                                                Kirim ke Pimpinan
                                            </button>
                                        </>
                                    )}

                                    <Link
                                        href="/check-sheets"
                                        className={secondaryButton}
                                    >
                                        <Icon name="scan" className="h-4 w-4" />
                                        Scan Ulang
                                    </Link>

                                    <Link
                                        href="/check-sheets/create"
                                        className={primaryButton}
                                    >
                                        <Icon name="plus" className="h-4 w-4" />
                                        Tambah Check Sheet
                                    </Link>
                                </div>
                            </div>

                            <div className="table-scroll max-h-[calc(100vh-360px)] min-h-[280px] overflow-auto">
                                <table className="w-full border-separate border-spacing-0 text-sm">
                                    <thead>
                                        <tr>
                                            <th className={`${thClass} w-14 text-center`}>
                                                No
                                            </th>
                                            <th className={`${thClass} w-44`}>
                                                Divisi
                                            </th>
                                            <th className={`${thClass} w-56`}>
                                                Nomor Dokumen
                                            </th>
                                            <th className={thClass}>
                                                Nama Check Sheet
                                            </th>
                                            <th className="sticky right-0 top-0 z-30 w-32 border-b border-l border-slate-200 bg-slate-50 px-3 py-3 text-center text-[11px] font-semibold text-slate-500">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sortedCheckSheets.length > 0 ? (
                                            sortedCheckSheets.map((checkSheet, index) => {
                                                const rowSpan = getRowSpan(
                                                    sortedCheckSheets,
                                                    index
                                                );

                                                return (
                                                    <tr
                                                        key={checkSheet.id}
                                                        className="row-enter group transition-colors duration-150 hover:bg-slate-50"
                                                        style={{
                                                            animationDelay: `${Math.min(index, 10) * 30}ms`,
                                                        }}
                                                    >
                                                        <td className="border-b border-slate-100 px-4 py-3 text-center text-xs font-semibold tabular-nums text-slate-400">
                                                            {index + 1}
                                                        </td>

                                                        {rowSpan > 0 && (
                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="border-b border-r border-slate-100 bg-white px-4 py-3 align-top"
                                                            >
                                                                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                                    {getNamaDivisi(checkSheet)}
                                                                </span>
                                                            </td>
                                                        )}

                                                        <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">
                                                            <span className="font-mono text-xs font-semibold text-slate-600">
                                                                {checkSheet.nomor_dokumen}
                                                            </span>
                                                        </td>

                                                        <td className="border-b border-slate-100 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-800">
                                                            {checkSheet.nama_checksheet}
                                                        </td>

                                                        <td className="sticky right-0 z-[5] border-b border-l border-slate-100 bg-white px-3 py-2.5 transition-colors group-hover:bg-slate-50">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Link
                                                                    href={`/check-sheets/${checkSheet.id}`}
                                                                    title="Lihat Check Sheet"
                                                                    aria-label="Lihat Check Sheet"
                                                                    className={`${actionButton} bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200/70 hover:bg-amber-100 hover:text-amber-700`}
                                                                >
                                                                    <Icon name="eye" className="h-4 w-4" />
                                                                </Link>

                                                                <Link
                                                                    href={`/check-sheets/${checkSheet.id}/edit`}
                                                                    title="Edit Check Sheet"
                                                                    aria-label="Edit Check Sheet"
                                                                    className={`${actionButton} bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200/70 hover:bg-blue-100 hover:text-blue-700`}
                                                                >
                                                                    <Icon name="edit" className="h-4 w-4" />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    title="Hapus Check Sheet"
                                                                    aria-label="Hapus Check Sheet"
                                                                    onClick={() => setSelectedCheckSheet(checkSheet)}
                                                                    className={`${actionButton} bg-red-50 text-red-600 ring-1 ring-inset ring-red-200/70 hover:bg-red-100 hover:text-red-700`}
                                                                >
                                                                    <Icon name="trash" className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-16 text-center">
                                                    <div className="mx-auto flex max-w-xs flex-col items-center">
                                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                            <Icon name="clipboard" className="h-7 w-7" />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            Belum ada Check Sheet
                                                        </p>
                                                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                                            Belum terdapat dokumen untuk line ini. Tambahkan check sheet untuk mulai mengelola dokumen.
                                                        </p>
                                                        <Link
                                                            href="/check-sheets/create"
                                                            className={`${primaryButton} mt-5`}
                                                        >
                                                            <Icon name="plus" className="h-4 w-4" />
                                                            Tambah Check Sheet
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* TABLE FOOTER */}
                            <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
                                <p className="text-[11px] text-slate-500">
                                    Menampilkan{' '}
                                    <span className="font-bold text-slate-700">
                                        {checkSheets.length}
                                    </span>{' '}
                                    dokumen check sheet
                                </p>
                            </div>
                        </section>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-[11px] font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                            <span className="mx-1.5 text-slate-300">·</span>
                            Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
            | MODAL KIRIM KE PIMPINAN
            ====================================================== */}
            {showKirim && (
                <div
                    className="overlay-enter fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 backdrop-blur-md sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !sending
                        ) {
                            setShowKirim(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="kirim-modal-title"
                        aria-describedby="kirim-modal-desc"
                        className="modal-enter w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
                    >
                        <div className="relative px-6 pb-2 pt-7 text-center">
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => setShowKirim(false)}
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-40"
                                aria-label="Tutup"
                            >
                                <Icon name="close" className="h-4 w-4" />
                            </button>

                            <div className="icon-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                                    <Icon name="send" className="h-5 w-5" />
                                </span>
                            </div>

                            <h2
                                id="kirim-modal-title"
                                className="mt-5 text-lg font-extrabold tracking-tight text-slate-900"
                            >
                                Kirim ke pimpinan?
                            </h2>

                            <p
                                id="kirim-modal-desc"
                                className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500"
                            >
                                Rekap Check Sheet dan abnormality untuk minggu ini akan dikirim kepada pimpinan untuk diperiksa.
                            </p>
                        </div>

                        <div className="mx-6 mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                                <Icon name="history" className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-400">
                                    Periode pengiriman
                                </p>
                                <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                                    {mingguIni.label}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    Senin sampai Minggu
                                </p>
                            </div>
                        </div>

                        <div className="mx-6 mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                            <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            Pastikan data check sheet sudah sesuai sebelum dikirim.
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 px-6 pb-6">
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => setShowKirim(false)}
                                className={`${secondaryButton} h-11`}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={sending}
                                onClick={handleKirim}
                                className={`${successButton} h-11`}
                            >
                                {sending ? (
                                    <>
                                        <Spinner />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="send" className="h-4 w-4" />
                                        Ya, Kirim
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
            | MODAL HAPUS CHECK SHEET
            ====================================================== */}
            {selectedCheckSheet && (
                <div
                    className="overlay-enter fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 backdrop-blur-md sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleting
                        ) {
                            setSelectedCheckSheet(null);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        aria-describedby="delete-modal-desc"
                        className="modal-enter w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
                    >
                        <div className="relative px-6 pb-2 pt-7 text-center">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedCheckSheet(null)}
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-40"
                                aria-label="Tutup"
                            >
                                <Icon name="close" className="h-4 w-4" />
                            </button>

                            <div className="icon-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
                                    <Icon name="trash" className="h-5 w-5" />
                                </span>
                            </div>

                            <h2
                                id="delete-modal-title"
                                className="mt-5 text-lg font-extrabold tracking-tight text-slate-900"
                            >
                                Hapus check sheet?
                            </h2>

                            <p
                                id="delete-modal-desc"
                                className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500"
                            >
                                Apakah kamu yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="mx-6 mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="break-words text-sm font-bold text-slate-800">
                                {selectedCheckSheet.nama_checksheet}
                            </p>
                            <p className="mt-1 font-mono text-[11px] font-semibold text-slate-500">
                                {selectedCheckSheet.nomor_dokumen}
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 px-6 pb-6">
                            <button
                                type="button"
                                disabled={deleting}
                                autoFocus
                                onClick={() => setSelectedCheckSheet(null)}
                                className={`${secondaryButton} h-11`}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className={`${buttonBase} h-11 bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 focus-visible:ring-red-500/30`}
                            >
                                {deleting ? (
                                    <>
                                        <Spinner />
                                        Menghapus...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="trash" className="h-4 w-4" />
                                        Ya, Hapus
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
            | TOAST NOTIFICATION
            ====================================================== */}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    aria-live="polite"
                    className="toast-enter fixed right-4 top-4 z-[120] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-200/80 sm:right-5 sm:top-5"
                >
                    <div className="flex items-start gap-3 p-3.5">
                        <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                toast.type === 'error'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            <Icon
                                name={toast.type === 'error' ? 'alert' : 'check'}
                                className="h-4 w-4"
                            />
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-bold text-slate-800">
                                {toast.type === 'error' ? 'Terjadi kesalahan' : 'Berhasil'}
                            </p>
                            <p className="mt-0.5 break-words text-sm leading-snug text-slate-500">
                                {toast.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            title="Tutup notifikasi"
                            aria-label="Tutup notifikasi"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 outline-none transition hover:bg-slate-100 hover:text-slate-500 focus-visible:ring-4 focus-visible:ring-slate-300/50"
                        >
                            <Icon name="close" className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="h-1 bg-slate-100">
                        <div
                            className={`toast-progress h-full w-full ${
                                toast.type === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                            }`}
                        />
                    </div>
                </div>
            )}
        </>
    );
}