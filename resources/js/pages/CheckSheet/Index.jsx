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
    'rounded-2xl border border-white/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]';

const actionButton =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95';

const primaryButton =
    'inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

const secondaryButton =
    'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]';

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
            setToast({ type: 'success', message: pesan });
        }
    }, [flash]);

    useEffect(() => {
        if (errors?.pengiriman) {
            setToast({
                type: 'error',
                message: errors.pengiriman,
            });
        }
    }, [errors]);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

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
                setToast({
                    type: 'success',
                    message: 'Check Sheet berhasil dihapus.',
                });
            },
            onError: () => {
                setToast({
                    type: 'error',
                    message: 'Check Sheet gagal dihapus. Silakan coba kembali.',
                });
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

                    setToast({ type: 'error', message });
                },
                onSuccess: () => {
                    setShowKirim(false);
                    setToast({
                        type: 'success',
                        message: 'Rekap Check Sheet berhasil dikirim.',
                    });
                },
                onFinish: () => {
                    setSending(false);
                },
            }
        );
    };

    return (
        <>
            <Head title="Check Sheet Prediktif" />

            <style>{`
                @keyframes pageEnter {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes modalEnter {
                    from { opacity: 0; transform: translateY(12px) scale(.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes toastEnter {
                    from { opacity: 0; transform: translateX(18px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes overlayEnter {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .page-enter { animation: pageEnter .45s ease-out both; }
                .modal-enter { animation: modalEnter .22s ease-out both; }
                .overlay-enter { animation: overlayEnter .18s ease-out both; }
                .toast-enter { animation: toastEnter .3s ease-out both; }

                .table-scroll::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }

                .table-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .table-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 999px;
                }

                .table-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                @media (prefers-reduced-motion: reduce) {
                    .page-enter,
                    .modal-enter,
                    .overlay-enter,
                    .toast-enter {
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
                <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[100px]" />
                    <div className="absolute -bottom-48 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-200/30 blur-[100px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            title="Buka menu"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20 active:scale-95"
                        >
                            <Icon name="menu" className="h-5 w-5" />
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                Check Sheet Prediktif
                            </h1>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200 sm:text-xs">
                                {line?.divisi?.nama_divisi || 'Divisi'} 
                                <span className="mx-1.5 text-blue-400">/</span>
                                {line?.nama_line || 'Line'}
                            </p>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {bolehKirim && <NotifPengiriman />}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="relative z-10 mx-auto w-full max-w-[1800px] flex-1 px-4 py-5 sm:px-6 lg:py-7">
                    <div className="page-enter">
                        {/* PAGE INTRO */}
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>

                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                    Daftar Check Sheet
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Kelola dan pantau dokumen check sheet pada line ini.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm sm:self-auto">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Icon name="clipboard" className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Total Dokumen
                                    </p>
                                    <p className="text-base font-extrabold leading-tight text-slate-800">
                                        {checkSheets.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TOOLBAR */}
                        <section className={`${cardClass} mb-4 overflow-hidden`}>
                            <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Lokasi Aktif
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                                        {line?.divisi?.nama_divisi || '-'} 
                                        <span className="mx-1.5 text-slate-300">/</span>
                                        {line?.nama_line || '-'}
                                    </p>
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
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
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
                                        <Icon name="history" className="h-4 w-4" />
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
                        </section>

                        {/* TABLE */}
                        <section className={`${cardClass} overflow-hidden`}>
                            <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">
                                        Data Check Sheet
                                    </h3>
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Daftar dokumen berdasarkan divisi.
                                    </p>
                                </div>

                                <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 sm:mt-0">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    {checkSheets.length} dokumen
                                </span>
                            </div>

                            <div className="table-scroll max-h-[calc(100vh-330px)] min-h-[280px] overflow-auto">
                                <table className="w-full border-separate border-spacing-0 text-sm">
                                    <thead>
                                        <tr>
                                            <th className="sticky top-0 z-20 w-14 border-b border-slate-200 bg-slate-50 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                No
                                            </th>
                                            <th className="sticky top-0 z-20 w-44 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Divisi
                                            </th>
                                            <th className="sticky top-0 z-20 w-56 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Nomor Dokumen
                                            </th>
                                            <th className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Nama Check Sheet
                                            </th>
                                            <th className="sticky right-0 top-0 z-30 w-32 border-b border-l border-slate-200 bg-slate-50 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                                                        className="group transition-colors duration-150 hover:bg-blue-50/60"
                                                    >
                                                        <td className="border-b border-slate-100 px-4 py-3 text-center text-xs font-semibold tabular-nums text-slate-400">
                                                            {index + 1}
                                                        </td>

                                                        {rowSpan > 0 && (
                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="border-b border-r border-slate-100 bg-slate-50/60 px-4 py-3 align-top text-xs font-bold text-slate-700"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                                    <span>
                                                                        {getNamaDivisi(checkSheet)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">
                                                            <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-bold text-blue-700">
                                                                {checkSheet.nomor_dokumen}
                                                            </span>
                                                        </td>

                                                        <td className="border-b border-slate-100 px-4 py-3 text-xs font-medium leading-relaxed text-slate-700">
                                                            {checkSheet.nama_checksheet}
                                                        </td>

                                                        <td className="sticky right-0 z-[5] border-b border-l border-slate-100 bg-white px-3 py-2.5 transition-colors group-hover:bg-blue-50">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Link
                                                                    href={`/check-sheets/${checkSheet.id}`}
                                                                    title="Lihat Check Sheet"
                                                                    className={`${actionButton} border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100`}
                                                                >
                                                                    <Icon name="eye" className="h-4 w-4" />
                                                                </Link>

                                                                <Link
                                                                    href={`/check-sheets/${checkSheet.id}/edit`}
                                                                    title="Edit Check Sheet"
                                                                    className={`${actionButton} border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100`}
                                                                >
                                                                    <Icon name="edit" className="h-4 w-4" />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    title="Hapus Check Sheet"
                                                                    onClick={() => setSelectedCheckSheet(checkSheet)}
                                                                    className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100`}
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
                                                            className={`${primaryButton} mt-4`}
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
                            <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <p className="text-[11px] text-slate-500">
                                    Menampilkan{' '}
                                    <span className="font-bold text-slate-700">
                                        {checkSheets.length}
                                    </span>{' '}
                                    dokumen check sheet
                                </p>
                                <p className="text-[10px] font-medium text-slate-400">
                                    Check Sheet Prediktif
                                </p>
                            </div>
                        </section>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/70">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-[10px] font-medium text-slate-400">
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
                    className="overlay-enter fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
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
                        className="modal-enter w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/30"
                    >
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-5">
                            <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10" />
                            <div className="absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/10" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                                        <Icon name="send" className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-bold text-white">
                                            Kirim ke Pimpinan
                                        </h2>
                                        <p className="mt-0.5 text-xs text-emerald-100">
                                            Konfirmasi pengiriman rekap mingguan
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={sending}
                                    onClick={() => setShowKirim(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-40"
                                >
                                    <Icon name="close" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <p className="text-sm leading-relaxed text-slate-600">
                                Rekap Check Sheet dan abnormality untuk minggu ini akan dikirim kepada pimpinan untuk diperiksa.
                            </p>

                            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <Icon name="history" className="h-4 w-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">
                                        Periode Pengiriman
                                    </p>
                                </div>
                                <p className="mt-2 text-base font-bold text-slate-800">
                                    {mingguIni.label}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Periode Senin sampai Minggu
                                </p>
                            </div>

                            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
                                <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <p className="text-[11px] leading-relaxed text-amber-800">
                                    Pastikan data check sheet sudah sesuai sebelum dikirim.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => setShowKirim(false)}
                                className={secondaryButton}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={sending}
                                onClick={handleKirim}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {sending ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="send" className="h-4 w-4" />
                                        Ya, Kirim Sekarang
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
                    className="overlay-enter fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
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
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        className="modal-enter w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/30"
                    >
                        <div className="flex items-start gap-3 px-5 pb-4 pt-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                                <Icon name="trash" className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2
                                    id="delete-modal-title"
                                    className="text-base font-bold text-slate-900"
                                >
                                    Hapus Check Sheet?
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    Apakah kamu yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedCheckSheet(null)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                            >
                                <Icon name="close" className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mx-5 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Dokumen yang akan dihapus
                            </p>
                            <p className="mt-1.5 break-words text-sm font-bold text-slate-800">
                                {selectedCheckSheet.nama_checksheet}
                            </p>
                            <p className="mt-1 font-mono text-[11px] font-semibold text-blue-600">
                                {selectedCheckSheet.nomor_dokumen}
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedCheckSheet(null)}
                                className={secondaryButton}
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
                    role="status"
                    className={`toast-enter fixed right-4 top-4 z-[120] flex w-[380px] max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 shadow-2xl shadow-slate-900/15 ${
                        toast.type === 'error'
                            ? 'border-red-100'
                            : 'border-emerald-100'
                    }`}
                >
                    <div
                        className={`absolute left-0 top-0 h-full w-1 ${
                            toast.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-emerald-500'
                        }`}
                    />

                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            toast.type === 'error'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-emerald-50 text-emerald-600'
                        }`}
                    >
                        <Icon
                            name={toast.type === 'error' ? 'alert' : 'check'}
                            className="h-5 w-5"
                        />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                        <p
                            className={`text-xs font-extrabold ${
                                toast.type === 'error'
                                    ? 'text-red-700'
                                    : 'text-emerald-700'
                            }`}
                        >
                            {toast.type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil'}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {toast.message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        title="Tutup notifikasi"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
            )}
        </>
    );
}