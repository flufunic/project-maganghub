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
| JENIS REVISI (label + warna badge)
------------------------------------------------------------------ */
const JENIS_REVISI = {
    centang: {
        label: 'Centang',
        cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    catatan: {
        label: 'Catatan',
        cls: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    item: {
        label: 'Nama Item',
        cls: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    },
    durasi: {
        label: 'Durasi',
        cls: 'border-sky-200 bg-sky-50 text-sky-700',
    },
    total_durasi: {
        label: 'Total Durasi',
        cls: 'border-sky-200 bg-sky-50 text-sky-700',
    },
    dot: {
        label: 'DOT',
        cls: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    },
    hot: {
        label: 'HOT',
        cls: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    },
};

const jenisFallback = {
    label: 'Perubahan',
    cls: 'border-slate-200 bg-slate-50 text-slate-600',
};

/* ------------------------------------------------------------------
| SATU REVISI (di dalam pop up)
------------------------------------------------------------------ */
function RevisiItem({ rev }) {
    const jenis = JENIS_REVISI[rev.jenis] ?? jenisFallback;

    return (
        <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
                <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${jenis.cls}`}
                >
                    {jenis.label}
                </span>

                {rev.baru && (
                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Baru
                    </span>
                )}
            </div>

            <p className="mt-1.5 text-sm font-medium text-slate-700">
                {rev.keterangan}
            </p>

            {rev.jenis === 'catatan' && (rev.nilai_lama || rev.nilai_baru) && (
                <div className="mt-1.5 space-y-0.5 text-xs">
                    {rev.nilai_lama && (
                        <p className="text-slate-400 line-through">
                            {rev.nilai_lama}
                        </p>
                    )}

                    {rev.nilai_baru && (
                        <p className="italic text-slate-600">
                            “{rev.nilai_baru}”
                        </p>
                    )}
                </div>
            )}

            <p className="mt-2 text-[11px] text-slate-400">
                {rev.oleh || 'Admin'} · {rev.waktu}
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

export default function Detail({
    pengiriman,
    preventifMesins = [],
    revisis = [],
}) {
    const [showTolakModal, setShowTolakModal] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Item yang revisinya sedang dibuka di pop up
    const [revisiItem, setRevisiItem] = useState(null);

    // Kolom revisi hanya muncul kalau memang ada revisi
    const adaRevisi = revisis.length > 0;
    const jumlahRevisiBaru = revisis.filter((rev) => rev.baru).length;

    // Tutup pop up revisi dengan tombol Esc
    useEffect(() => {
        if (!revisiItem) {
            return;
        }

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setRevisiItem(null);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [revisiItem]);

    const handleTolak = () => {
        if (!alasanPenolakan.trim()) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/pimpinan/pengiriman/${pengiriman.id}/tolak`,
            {
                alasan_penolakan: alasanPenolakan,
            },
            {
                onSuccess: () => {
                    setShowTolakModal(false);
                    setAlasanPenolakan('');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const getChecklist = (item, tanggal) => {
        return item.checklists?.find(
            (checklist) => checklist.tanggal === tanggal
        );
    };

    const isPlan = (item, tanggal) => {
        return item.tanggal_plan?.includes(tanggal);
    };

    // ACT = ada checklist berstatus true di tanggal ini,
    // TIDAK harus di tanggal Plan (sama dengan halaman admin).
    const isAct = (item, tanggal) => {
        const checklist = getChecklist(item, tanggal);

        return Boolean(checklist && checklist.status);
    };

    const handlePeriksa = () => {
        if (!window.confirm('Apakah data ini sudah diperiksa?')) {
            return;
        }

        router.post(`/pimpinan/pengiriman/${pengiriman.id}/periksa`);
    };

    // Data untuk pop up revisi
    const revisiList = revisiItem?.revisis ?? [];
    const revisiBaruItem = revisiList.filter((rev) => rev.baru).length;

    return (
        <>
            <Head title="Detail Data Preventif" />

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

                {/* =========================
                    BACKGROUND
                ========================= */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="dtl-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="dtl-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="dtl-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="dtl-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* =========================
                    HEADER (TRANSPARAN)
                ========================= */}
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
                                    Detail Data Preventif
                                </h1>

                                <p className="hidden text-xs text-white/65 sm:block">
                                    Pemeriksaan data schedule preventif
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* =========================
                    CONTENT
                ========================= */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">

                    {/* =========================
                        INFO + STATUS + AKSI (satu kartu)
                    ========================= */}
                    <div className={`mb-6 overflow-hidden rounded-2xl ${glassCard}`}>

                        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex flex-wrap gap-x-10 gap-y-3">

                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Tanggal Pengiriman
                                    </p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {pengiriman.tanggal_format}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Dikirim Oleh
                                    </p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {pengiriman.dikirim_oleh || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Status
                                    </p>

                                    <div className="mt-1">
                                        {pengiriman.status === 'menunggu' && (
                                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                                Menunggu Diperiksa
                                            </span>
                                        )}

                                        {pengiriman.status === 'diperiksa' && (
                                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                Sudah Diperiksa
                                            </span>
                                        )}

                                        {pengiriman.status === 'ditolak' && (
                                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                                Ditolak
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AKSI */}
                            {pengiriman.status === 'menunggu' && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePeriksa}
                                        disabled={isSubmitting}
                                        className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Tandai Sudah Diperiksa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowTolakModal(true)}
                                        disabled={isSubmitting}
                                        className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Tolak
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Info revisi baru */}
                        {jumlahRevisiBaru > 0 && pengiriman.status === 'menunggu' && (
                            <div className="border-t border-violet-100 bg-violet-50/80 px-5 py-2.5 sm:px-6">
                                <p className="text-xs text-violet-700">
                                    <span className="font-bold">
                                        {jumlahRevisiBaru} revisi baru
                                    </span>{' '}
                                    dari Admin. Klik tombol Revisi pada tabel untuk melihat perubahannya.
                                </p>
                            </div>
                        )}

                        {/* Alasan penolakan */}
                        {pengiriman.status === 'ditolak' && (
                            <div className="border-t border-red-100 bg-red-50/80 px-5 py-3 sm:px-6">
                                <p className="text-xs font-bold text-red-700">
                                    Alasan Penolakan
                                </p>

                                <p className="mt-0.5 text-sm leading-relaxed text-red-600">
                                    {pengiriman.alasan_penolakan || '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* =========================
                        TABEL
                    ========================= */}
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>

                        {/* Table Header */}
                        <div className="flex flex-col gap-2 border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Jadwal Preventif
                                </h3>

                                <p className="text-xs text-slate-500">
                                    {pengiriman.tanggal_format}
                                </p>
                            </div>

                            <p className="text-xs text-slate-500">
                                <span className="font-bold text-blue-600">○</span> Plan
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="font-bold text-emerald-600">✓</span> Act
                            </p>
                        </div>

                        {preventifMesins.length === 0 ? (

                            <div className="px-6 py-16 text-center">
                                <h3 className="font-semibold text-slate-700">
                                    Belum ada data preventif
                                </h3>

                                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                                    Tidak ada data preventif pada periode ini.
                                </p>
                            </div>

                        ) : (

                            <div className="dtl-scroll overflow-x-auto">

                                <table className="w-full min-w-max border-collapse text-xs">

                                    <thead>
                                        <tr className="bg-slate-50">

                                            <th className="sticky left-0 z-20 border border-slate-200 bg-slate-50 px-4 py-3 text-left font-bold text-slate-700">
                                                Divisi
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                No
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-left font-bold text-slate-700">
                                                Item Preventif
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                Periode
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                Durasi
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                Total Durasi
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                DOT
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                HOT
                                            </th>

                                            <th className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                Status
                                            </th>

                                            <th className="min-w-[90px] border border-slate-200 bg-blue-50 px-4 py-3 text-center font-bold text-blue-700">
                                                {pengiriman.tanggal_format}
                                            </th>

                                            <th className="min-w-[220px] border border-slate-200 bg-amber-50 px-4 py-3 text-center font-bold text-amber-700">
                                                Catatan
                                            </th>

                                            {adaRevisi && (
                                                <th className="min-w-[110px] border border-slate-200 bg-violet-50 px-4 py-3 text-center font-bold text-violet-700">
                                                    Revisi
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {preventifMesins.map((item) => {
                                            const jumlahRevisi = item.revisis?.length ?? 0;

                                            const adaRevisiBaru = (item.revisis ?? []).some(
                                                (rev) => rev.baru
                                            );

                                            return (
                                                <React.Fragment key={item.id}>

                                                    {/* PLAN */}
                                                    <tr className="transition-colors hover:bg-blue-50/40">

                                                        <td
                                                            rowSpan="2"
                                                            className="sticky left-0 z-10 border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700"
                                                        >
                                                            {item.divisi}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 text-center font-medium text-slate-700"
                                                        >
                                                            {item.no_item}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 font-semibold text-slate-800"
                                                        >
                                                            {item.item_preventif}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 text-center text-slate-600"
                                                        >
                                                            {item.periode || '-'}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 text-center text-slate-600"
                                                        >
                                                            {item.durasi ?? '-'}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 text-center text-slate-600"
                                                        >
                                                            {item.total_durasi ?? '-'}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 text-center text-slate-600"
                                                        >
                                                            {item.dot ?? '-'}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="border border-slate-200 px-4 py-3 text-center text-slate-600"
                                                        >
                                                            {item.hot ?? '-'}
                                                        </td>

                                                        <td className="border border-slate-200 bg-blue-50/50 px-4 py-2 text-center font-bold text-blue-600">
                                                            PLAN
                                                        </td>

                                                        <td className="border border-slate-200 bg-blue-50/30 px-2 py-2 text-center text-lg font-semibold text-blue-600">
                                                            {isPlan(item, pengiriman.tanggal) ? '○' : ''}
                                                        </td>

                                                        <td
                                                            rowSpan="2"
                                                            className="max-w-[280px] border border-slate-200 bg-amber-50/30 px-4 py-3 text-left align-top"
                                                        >
                                                            {getChecklist(item, pengiriman.tanggal)?.catatan ? (
                                                                <div className="text-xs leading-relaxed text-slate-600">
                                                                    {getChecklist(item, pengiriman.tanggal).catatan}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-300">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* REVISI (tombol -> pop up) */}
                                                        {adaRevisi && (
                                                            <td
                                                                rowSpan="2"
                                                                className="border border-slate-200 bg-violet-50/40 px-3 py-3 text-center align-middle"
                                                            >
                                                                {jumlahRevisi > 0 ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setRevisiItem(item)}
                                                                        title="Lihat revisi"
                                                                        className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-100"
                                                                    >
                                                                        Lihat
                                                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                                                                            {jumlahRevisi}
                                                                        </span>

                                                                        {adaRevisiBaru && (
                                                                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-slate-300">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>

                                                    {/* ACT */}
                                                    <tr className="transition-colors hover:bg-emerald-50/30">

                                                        <td className="border border-slate-200 bg-emerald-50/50 px-4 py-2 text-center font-bold text-emerald-600">
                                                            ACT
                                                        </td>

                                                        <td
                                                            title={getChecklist(item, pengiriman.tanggal)?.catatan || ''}
                                                            className="border border-slate-200 bg-emerald-50/30 px-2 py-2 text-center text-lg font-bold text-emerald-600"
                                                        >
                                                            {isAct(item, pengiriman.tanggal) ? '✓' : ''}
                                                        </td>
                                                    </tr>

                                                </React.Fragment>
                                            );
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                {/* =========================
                    FOOTER (TRANSPARAN)
                ========================= */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =========================
                POP UP REVISI
            ========================= */}
            {revisiItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md"
                    onClick={() => setRevisiItem(null)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white px-6 py-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-slate-800">
                                        Revisi dari Admin
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {revisiList.length} revisi
                                        {revisiBaruItem > 0 && (
                                            <span className="font-semibold text-violet-600">
                                                {' '}
                                                · {revisiBaruItem} baru
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setRevisiItem(null)}
                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    title="Tutup"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold text-slate-400">
                                    {revisiItem.divisi} · No {revisiItem.no_item}
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-slate-700">
                                    {revisiItem.item_preventif}
                                </p>
                            </div>
                        </div>

                        {/* ISI (scroll kalau panjang) */}
                        <div className="dtl-scroll flex-1 space-y-3 overflow-y-auto bg-violet-50/30 px-6 py-4">
                            {revisiList.map((rev) => (
                                <RevisiItem key={rev.id} rev={rev} />
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
                            <button
                                type="button"
                                onClick={() => setRevisiItem(null)}
                                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                Tutup
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
                            <h2 className="text-lg font-bold text-slate-800">
                                Tolak Data Preventif
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Silakan masukkan alasan penolakan data ini.
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
                                placeholder="Contoh: Checklist belum lengkap..."
                                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Alasan ini akan disimpan bersama status penolakan data.
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
                                    onClick={handleTolak}
                                    disabled={isSubmitting || !alasanPenolakan.trim()}
                                    className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Mengirim...' : 'Tolak Data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}