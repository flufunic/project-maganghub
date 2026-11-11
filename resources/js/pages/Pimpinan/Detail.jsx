import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON  (hanya tombol kembali)
------------------------------------------------------------------ */
function BackIcon({ className = 'h-5 w-5' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M15 19l-7-7 7-7" />
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const thClass =
    'border border-slate-200 bg-slate-50 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600';

const tdClass = 'border border-slate-200 px-4 py-3 align-top text-sm text-slate-700';

const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    diperiksa: {
        label: 'Sedang Diperiksa',
        cls: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    disetujui: {
        label: 'Disetujui',
        cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'border-red-200 bg-red-50 text-red-700',
    },
};

/* Teks panjang: tampilkan apa adanya (termasuk baris baru) */
function Teks({ children }) {
    if (!children || !String(children).trim()) {
        return <span className="text-slate-300">-</span>;
    }

    return (
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
            {children}
        </p>
    );
}

function Foto({ url, label }) {
    if (!url) {
        return (
            <div className="flex h-24 w-32 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] text-slate-400">
                Tidak ada foto
            </div>
        );
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" title={`Buka foto ${label ?? ''}`}>
            <img
                src={url}
                alt={label ?? 'foto'}
                className="h-24 w-32 rounded-lg border border-slate-200 object-cover transition hover:opacity-90"
            />
        </a>
    );
}

export default function Detail({
    laporan,
    bagian1 = [],
    bagian2 = [],
    bagian3 = [],
    revisis = [],
    flash,
}) {
    const [showSetujuiModal, setShowSetujuiModal] = useState(false);
    const [showTolakModal, setShowTolakModal] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const status = STATUS[laporan.status] ?? STATUS.menunggu;
    const bisaDiputuskan = ['menunggu', 'diperiksa'].includes(laporan.status);

    const totalJumlah = bagian1.reduce((a, r) => a + r.jumlah, 0);
    const totalSudah = bagian1.reduce((a, r) => a + r.sudah, 0);
    const totalBelum = bagian1.reduce((a, r) => a + r.belum, 0);
    const totalPersen = totalJumlah > 0 ? Math.round((totalSudah / totalJumlah) * 100) : 0;

    // Tutup modal dengan tombol Esc
    useEffect(() => {
        if (!showSetujuiModal && !showTolakModal) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !isSubmitting) {
                setShowSetujuiModal(false);
                setShowTolakModal(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showSetujuiModal, showTolakModal, isSubmitting]);

    const kirimAksi = (aksi, data = {}, selesai) => {
        setIsSubmitting(true);

        router.post(`/pimpinan/laporan/${laporan.id}/${aksi}`, data, {
            preserveScroll: true,
            onSuccess: selesai,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const periksa = () => kirimAksi('periksa');

    const setujui = () => kirimAksi('setujui', {}, () => setShowSetujuiModal(false));

    const tolak = () => {
        if (!alasanPenolakan.trim()) return;

        kirimAksi('tolak', { alasan_penolakan: alasanPenolakan }, () => {
            setShowTolakModal(false);
            setAlasanPenolakan('');
        });
    };

    return (
        <>
            <Head title={`Report Mingguan W${laporan.week}`} />

            <style>{`
                @keyframes dtlGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes dtlFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes dtlFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }

                .dtl-gradient {
                    background-size: 250% 250%;
                    animation: dtlGradient 20s ease infinite;
                }
                .dtl-float { animation: dtlFloat 14s ease-in-out infinite; }
                .dtl-float-reverse { animation: dtlFloatReverse 17s ease-in-out infinite; }

                .dtl-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .dtl-scroll::-webkit-scrollbar-track { background: transparent; }
                .dtl-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .dtl-gradient,
                    .dtl-float,
                    .dtl-float-reverse { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">

                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="dtl-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="dtl-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="dtl-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="dtl-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/pimpinan"
                                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition-colors duration-200 hover:bg-white/25"
                                title="Kembali ke Dashboard"
                            >
                                <BackIcon />
                            </Link>

                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                                    Detail Report Mingguan
                                </h1>

                                <p className="hidden text-xs text-white/65 sm:block">
                                    Pemeriksaan report preventif mingguan
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {/* =========================
                        INFO + STATUS + AKSI
                    ========================= */}
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex flex-wrap gap-x-10 gap-y-3">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Periode</p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        Week {laporan.week} · {laporan.periode}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500">Dikirim Oleh</p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {laporan.dikirim_oleh || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500">Waktu Pengiriman</p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {laporan.dikirim_pada || '-'}
                                    </p>
                                </div>

                                {laporan.status === 'disetujui' && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Disetujui</p>
                                        <p className="mt-0.5 text-sm font-bold text-slate-800">
                                            {laporan.disetujui_oleh || '-'}
                                            {laporan.disetujui_pada && ` · ${laporan.disetujui_pada}`}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-medium text-slate-500">Status</p>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.cls}`}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* AKSI */}
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={`/laporan-mingguan/export?bulan=${laporan.bulan}&tahun=${laporan.tahun}&week=${laporan.week}`}
                                    className="cursor-pointer rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                                >
                                    Export Excel
                                </a>

                                {laporan.status === 'menunggu' && (
                                    <button
                                        type="button"
                                        onClick={periksa}
                                        disabled={isSubmitting}
                                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Tandai Sedang Diperiksa
                                    </button>
                                )}

                                {bisaDiputuskan && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowSetujuiModal(true)}
                                            disabled={isSubmitting}
                                            className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Setujui
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowTolakModal(true)}
                                            disabled={isSubmitting}
                                            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Tolak
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Info revisi dari admin */}
                        {revisis.length > 0 && bisaDiputuskan && (
                            <div className="border-t border-violet-100 bg-violet-50/80 px-5 py-2.5 sm:px-6">
                                <p className="text-xs text-violet-700">
                                    <span className="font-bold">{revisis.length} perubahan</span> dilakukan
                                    Admin setelah report dikirim. Lihat riwayat revisi di bagian bawah halaman.
                                </p>
                            </div>
                        )}

                        {/* Alasan penolakan */}
                        {laporan.status === 'ditolak' && (
                            <div className="border-t border-red-100 bg-red-50/80 px-5 py-3 sm:px-6">
                                <p className="text-xs font-bold text-red-700">Alasan Penolakan</p>

                                <p className="mt-0.5 text-sm leading-relaxed text-red-600">
                                    {laporan.alasan_penolakan || '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* =========================
                        BAGIAN 1
                    ========================= */}
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                            <h3 className="font-bold text-slate-800">1. Pencapaian Preventif</h3>
                            <p className="text-xs text-slate-500">
                                Angka dibekukan saat report dikirim oleh Admin.
                            </p>
                        </div>

                        <div className="dtl-scroll overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse">
                                <thead>
                                    <tr>
                                        {[
                                            'No',
                                            'Mesin',
                                            'Jumlah Item',
                                            'Item Sudah Preventif',
                                            'Item Belum Preventif',
                                            'Presentase',
                                            'Komentar',
                                        ].map((h) => (
                                            <th key={h} className={thClass}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bagian1.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className={`${tdClass} text-center text-slate-400`}>
                                                Tidak ada Plan preventif di week ini.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian1.map((r, i) => (
                                        <tr key={r.no} className="transition-colors hover:bg-blue-50/40">
                                            <td className={`${tdClass} text-center`}>{i + 1}</td>
                                            <td className={`${tdClass} font-medium`}>{r.mesin}</td>
                                            <td className={`${tdClass} text-center`}>{r.jumlah}</td>
                                            <td className={`${tdClass} text-center`}>{r.sudah}</td>
                                            <td className={`${tdClass} text-center`}>{r.belum}</td>
                                            <td className={`${tdClass} text-center font-semibold`}>{r.persen}%</td>
                                            <td className={`${tdClass} min-w-[220px]`}>
                                                <Teks>{r.komentar}</Teks>
                                            </td>
                                        </tr>
                                    ))}

                                    {bagian1.length > 0 && (
                                        <tr className="bg-slate-50 font-bold">
                                            <td className={tdClass} />
                                            <td className={`${tdClass} text-center`}>TOTAL ITEM</td>
                                            <td className={`${tdClass} text-center`}>{totalJumlah}</td>
                                            <td className={`${tdClass} text-center`}>{totalSudah}</td>
                                            <td className={`${tdClass} text-center`}>{totalBelum}</td>
                                            <td className={`${tdClass} text-center`}>{totalPersen}%</td>
                                            <td className={tdClass} />
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* =========================
                        BAGIAN 2
                    ========================= */}
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                            <h3 className="font-bold text-slate-800">2. Laporan Preventif</h3>
                        </div>

                        <div className="dtl-scroll overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead>
                                    <tr>
                                        {[
                                            'No',
                                            'Mesin',
                                            'Aktivitas / Problem',
                                            'Penanggulangan',
                                            'Foto Before',
                                            'Foto After',
                                        ].map((h) => (
                                            <th key={h} className={thClass}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bagian2.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={`${tdClass} text-center text-slate-400`}>
                                                Tidak ada item preventif pada report ini.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian2.map((it, i) => (
                                        <tr key={it.id} className="transition-colors hover:bg-blue-50/40">
                                            <td className={`${tdClass} text-center`}>{i + 1}</td>
                                            <td className={`${tdClass} min-w-[200px] font-medium`}>{it.mesin}</td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.aktivitas}</Teks>
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.penanggulangan}</Teks>
                                            </td>
                                            <td className={`${tdClass} text-center`}>
                                                <div className="flex justify-center">
                                                    <Foto url={it.foto_before_url} label="before" />
                                                </div>
                                            </td>
                                            <td className={`${tdClass} text-center`}>
                                                <div className="flex justify-center">
                                                    <Foto url={it.foto_after_url} label="after" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* =========================
                        BAGIAN 3
                    ========================= */}
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                            <h3 className="font-bold text-slate-800">
                                3. Laporan Temuan Preventif &amp; Tambahan Pekerjaan
                            </h3>
                        </div>

                        <div className="dtl-scroll overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead>
                                    <tr>
                                        {['No', 'Mesin', 'Aktivitas / Problem', 'Penanggulangan', 'Foto'].map((h) => (
                                            <th key={h} className={thClass}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bagian3.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className={`${tdClass} text-center text-slate-400`}>
                                                Tidak ada temuan.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian3.map((it, i) => (
                                        <tr key={it.id} className="transition-colors hover:bg-blue-50/40">
                                            <td className={`${tdClass} text-center`}>{i + 1}</td>
                                            <td className={`${tdClass} min-w-[200px] font-medium`}>
                                                <Teks>{it.mesin}</Teks>
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.aktivitas}</Teks>
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.penanggulangan}</Teks>
                                            </td>
                                            <td className={`${tdClass} text-center`}>
                                                <div className="flex justify-center">
                                                    <Foto url={it.foto_before_url} label="temuan" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* =========================
                        RIWAYAT REVISI
                    ========================= */}
                    {revisis.length > 0 && (
                        <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                            <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white px-5 py-4 sm:px-6">
                                <h3 className="font-bold text-slate-800">Revisi dari Admin</h3>
                                <p className="text-xs text-slate-500">
                                    Perubahan yang dilakukan setelah report dikirim.
                                </p>
                            </div>

                            <ul className="dtl-scroll max-h-80 divide-y divide-violet-100 overflow-y-auto bg-violet-50/30">
                                {revisis.map((r) => (
                                    <li key={r.id} className="px-5 py-3 sm:px-6">
                                        <p className="text-sm font-medium text-slate-700">{r.keterangan}</p>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            {r.oleh} · {r.waktu}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =========================
                MODAL SETUJUI
            ========================= */}
            {showSetujuiModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md"
                    onClick={() => !isSubmitting && setShowSetujuiModal(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-400" />

                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white px-6 pb-5 pt-8">
                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-100/60" />

                            <div className="relative flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-emerald-200 blur-xl" />

                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-300/50">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2.2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-7 w-7"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-4 text-center">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    Setujui Report Ini?
                                </h3>

                                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                    Report Week {laporan.week} akan disetujui dan Admin tidak bisa mengubahnya
                                    lagi.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">
                            <button
                                type="button"
                                onClick={() => setShowSetujuiModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={setujui}
                                disabled={isSubmitting}
                                className="flex-1 cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Memproses...' : 'Ya, Setujui'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
                MODAL TOLAK
            ========================= */}
            {showTolakModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                        <div className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-800">Tolak Report Mingguan</h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Silakan masukkan alasan penolakan report ini.
                            </p>
                        </div>

                        <div className="p-6">
                            <label className="text-sm font-semibold text-slate-700">
                                Alasan Penolakan
                            </label>

                            <textarea
                                value={alasanPenolakan}
                                onChange={(e) => setAlasanPenolakan(e.target.value)}
                                rows={5}
                                placeholder="Contoh: Foto after pada item ke-3 belum sesuai..."
                                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Alasan ini akan terlihat oleh Admin, lalu report dikembalikan untuk direvisi.
                            </p>

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTolakModal(false);
                                        setAlasanPenolakan('');
                                    }}
                                    disabled={isSubmitting}
                                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={tolak}
                                    disabled={isSubmitting || !alasanPenolakan.trim()}
                                    className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Mengirim...' : 'Tolak Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
