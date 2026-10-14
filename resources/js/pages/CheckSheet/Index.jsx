import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4'],
    },
    eye: {
        paths: [
            'M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.05.153.05.316 0 .469C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z',
            'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        ],
    },
    edit: {
        paths: [
            'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
            'M15 5l4 4',
        ],
    },
    trash: {
        paths: [
            'M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5',
            'M10 11v5.5M14 11v5.5',
        ],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];

    if (!icon) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.rect && <rect {...icon.rect} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

/* Tombol aksi: tetap berwarna karena ini tombol sungguhan */
const actionBase =
    'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md';

const getNamaDivisi = (checkSheet) => checkSheet.divisi?.nama_divisi || '-';

// Kunci penyimpanan pesan toast dari halaman Create / Edit
const TOAST_KEY = 'checksheet_toast';

export default function Index({ checkSheets = [], flash }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedCheckSheet, setSelectedCheckSheet] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // =========================
    // SUCCESS TOAST (dari flash backend)
    // =========================
    useEffect(() => {
        let pesan = null;

        // Pesan yang disimpan Create / Edit sebelum redirect
        try {
            pesan = sessionStorage.getItem(TOAST_KEY);
            sessionStorage.removeItem(TOAST_KEY);
        } catch (e) {
            pesan = null;
        }

        // Cadangan: flash dari backend (kalau ada)
        pesan = pesan || flash?.success;

        if (pesan) {
            setSuccessMessage(pesan);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!showSuccess) {
            return;
        }

        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [showSuccess]);

    /* URUTKAN DIVISI A-Z, DATA LAMA KE BARU */
    const sortedCheckSheets = [...checkSheets].sort(
        (a, b) =>
            getNamaDivisi(a).localeCompare(getNamaDivisi(b)) || a.id - b.id
    );

    /* HITUNG ROWSPAN DIVISI */
    const getRowSpan = (data, index) => {
        const currentDivisi = getNamaDivisi(data[index]);

        if (index > 0 && getNamaDivisi(data[index - 1]) === currentDivisi) {
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

    /* HAPUS CHECK SHEET */
    const handleDelete = () => {
        if (!selectedCheckSheet || deleting) return;

        setDeleting(true);

        router.delete(`/check-sheets/${selectedCheckSheet.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedCheckSheet(null);
                setSuccessMessage('Check Sheet berhasil dihapus.');
                setShowSuccess(true);
            },
            onFinish: () => setDeleting(false),
        });
    };

    // Aksi di pojok kanan (sticky), kolom Nama mengambil sisa ruang
    const headers = [
        { label: 'No', cls: 'w-14 text-center' },
        { label: 'Divisi', cls: 'w-40 text-left' },
        { label: 'Nomor Dokumen', cls: 'w-56 text-left' },
        { label: 'Nama Check Sheet', cls: 'text-left' },
        {
            label: 'Aksi',
            cls: 'w-36 text-center sticky right-0 z-20 border-l border-white/10',
        },
    ];

    return (
        <>
            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <Head title="Check Sheet Prediktif" />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes idxFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient,
                    .idx-float,
                    .idx-float-reverse,
                    .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />
                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER (RINGKAS) */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-2.5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                                title="Menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                    Check Sheet Prediktif
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-4 sm:px-6">
                    {/* TOOLBAR (SATU BARIS, KECIL) */}
                    <div
                        className={`idx-rise mb-3 overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                            <div className="flex min-w-0 items-baseline gap-2">
                                <h2 className="text-sm font-bold tracking-tight text-slate-900">
                                    Data Check Sheet
                                </h2>

                                <span className="text-xs text-slate-400">
                                    {checkSheets.length} data
                                </span>
                            </div>

                            <Link
                                href="/check-sheets/create"
                                className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white transition hover:from-blue-700 hover:to-indigo-800"
                            >
                                <Icon type="plus" className="h-3.5 w-3.5" />
                                Tambah
                            </Link>
                        </div>

                        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </div>

                    {/* TABLE (SCROLL VERTIKAL DI DALAM KARTU) */}
                    <div
                        style={{ animationDelay: '100ms' }}
                        className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="idx-scroll max-h-[calc(100vh-250px)] min-h-[260px] overflow-auto">
                            {/* Tanpa min-width besar: di layar normal tidak ada scroll samping */}
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead>
                                    <tr>
                                        {headers.map((header) => (
                                            <th
                                                key={header.label}
                                                className={`sticky top-0 z-10 whitespace-nowrap border-b border-white/10 bg-[#0a1a4d] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white ${header.cls}`}
                                            >
                                                {header.label}
                                            </th>
                                        ))}
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
                                                    className="group transition-colors hover:bg-blue-50/50"
                                                >
                                                    {/* NO */}
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center text-xs font-semibold text-slate-400">
                                                        {index + 1}
                                                    </td>

                                                    {/* DIVISI */}
                                                    {rowSpan > 0 && (
                                                        <td
                                                            rowSpan={rowSpan}
                                                            className="border-b border-r border-slate-200 bg-slate-50/70 px-4 py-2.5 align-top text-sm font-bold text-slate-700"
                                                        >
                                                            {getNamaDivisi(checkSheet)}
                                                        </td>
                                                    )}

                                                    {/* NOMOR DOKUMEN */}
                                                    <td className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 font-mono text-xs font-semibold text-blue-700">
                                                        {checkSheet.nomor_dokumen}
                                                    </td>

                                                    {/* NAMA CHECK SHEET (teks turun ke bawah kalau panjang) */}
                                                    <td className="whitespace-normal break-words border-b border-slate-200 px-4 py-2.5 text-sm font-medium leading-snug text-slate-700">
                                                        {checkSheet.nama_checksheet}
                                                    </td>

                                                    {/* AKSI (pojok kanan, sticky) */}
                                                    <td className="sticky right-0 z-[5] border-b border-l border-slate-200 bg-white px-2 py-2.5 transition-colors group-hover:bg-blue-50">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <Link
                                                                href={`/check-sheets/${checkSheet.id}`}
                                                                title="Buka Check Sheet"
                                                                className={`${actionBase} border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100`}
                                                            >
                                                                <Icon type="eye" className="h-4 w-4" />
                                                            </Link>

                                                            <Link
                                                                href={`/check-sheets/${checkSheet.id}/edit`}
                                                                title="Edit Check Sheet"
                                                                className={`${actionBase} border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100`}
                                                            >
                                                                <Icon type="edit" className="h-4 w-4" />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                title="Hapus Check Sheet"
                                                                onClick={() =>
                                                                    setSelectedCheckSheet(checkSheet)
                                                                }
                                                                className={`${actionBase} border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100`}
                                                            >
                                                                <Icon type="trash" className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-14 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                        <Icon
                                                            type="clipboard"
                                                            className="h-6 w-6 text-slate-400"
                                                        />
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Belum ada Check Sheet
                                                    </p>

                                                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                                                        Klik tombol Tambah untuk membuat dokumen check
                                                        sheet pertama.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* BOTTOM BAR */}
                        {checkSheets.length > 0 && (
                            <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2">
                                <p className="text-xs text-slate-500">
                                    Total{' '}
                                    <span className="font-semibold text-slate-700">
                                        {checkSheets.length}
                                    </span>{' '}
                                    check sheet
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* MODAL KONFIRMASI HAPUS */}
                {selectedCheckSheet && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget && !deleting) {
                                setSelectedCheckSheet(null);
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-modal-title"
                            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
                        >
                            <div className="px-5 pb-4 pt-5">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                        <Icon type="trash" className="h-5 w-5" />
                                    </span>

                                    <div className="min-w-0">
                                        <h2
                                            id="delete-modal-title"
                                            className="text-base font-bold text-slate-900"
                                        >
                                            Hapus Check Sheet?
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                                    <p className="break-words text-sm font-semibold text-slate-800">
                                        {selectedCheckSheet.nama_checksheet}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => setSelectedCheckSheet(null)}
                                    className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={handleDelete}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deleting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        'Ya, Hapus'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
                SUCCESS TOAST
            ====================================================== */}
            {showSuccess && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>

                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                            {successMessage}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSuccess(false)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}
