import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
------------------------------------------------------------------ */
const ICONS = {
    back: { sw: 2, paths: ['M15 19l-7-7 7-7'] },
    check: { sw: 2, paths: ['M5 13l4 4L19 7'] },
    x: { sw: 2, paths: ['M6 18L18 6M6 6l12 12'] },
    calendar: {
        paths: [
            'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        ],
    },
    user: {
        paths: [
            'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        ],
    },
    warning: {
        sw: 2,
        paths: [
            'M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z',
        ],
    },
    list: { paths: ['M4 6h16M4 10h16M4 14h16M4 18h16'] },
    document: {
        sw: 1.5,
        paths: [
            'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        ],
    },
};

function Icon({ type, className = 'h-5 w-5' }) {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

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
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

export default function Detail({
    user,
    pengiriman,
    bulan,
    tahun,
    preventifMesins = [],
}) {
    const [showTolakModal, setShowTolakModal] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const namaBulan = [
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

    const getChecklist = (item, tanggal) => {
        return item.checklists?.find(
            (checklist) => checklist.tanggal === tanggal
        );
    };

    const isPlan = (item, tanggal) => {
        return item.tanggal_plan?.includes(tanggal);
    };

    const isAct = (item, tanggal) => {
        const checklist = getChecklist(item, tanggal);

        return (
            isPlan(item, tanggal) &&
            checklist &&
            checklist.status === true
        );
    };

    const handlePeriksa = () => {
        if (
            !window.confirm(
                'Apakah data ini sudah diperiksa?'
            )
        ) {
            return;
        }

        router.post(
            `/pimpinan/pengiriman/${pengiriman.id}/periksa`
        );
    };

    // ============================================
    // INFO PENGIRIMAN (tampilan saja)
    // ============================================
    const infoCards = [
        {
            label: 'Tanggal Pengiriman',
            value: pengiriman.tanggal_format,
            icon: 'calendar',
            iconBox: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Dikirim Oleh',
            value: pengiriman.dikirim_oleh || '-',
            icon: 'user',
            iconBox: 'bg-indigo-50 text-indigo-600',
        },
    ];

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
                @keyframes dtlRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dtl-gradient {
                    background-size: 250% 250%;
                    animation: dtlGradient 20s ease infinite;
                }
                .dtl-float { animation: dtlFloat 14s ease-in-out infinite; }
                .dtl-float-reverse { animation: dtlFloatReverse 17s ease-in-out infinite; }
                .dtl-rise { animation: dtlRise 0.7s ease-out both; }

                .dtl-scroll::-webkit-scrollbar { height: 8px; }
                .dtl-scroll::-webkit-scrollbar-track { background: transparent; }
                .dtl-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .dtl-gradient,
                    .dtl-float,
                    .dtl-float-reverse,
                    .dtl-rise { animation: none !important; }
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
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

                        <div className="flex items-center gap-3">

                            <Link
                                href="/pimpinan"
                                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg hover:shadow-blue-900/30"
                                title="Kembali ke Dashboard"
                            >
                                <Icon
                                    type="back"
                                    className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
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

                        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-1.5 pl-4 pr-1.5 backdrop-blur-md">

                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-white">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-blue-200">
                                    Pimpinan
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white shadow-md">
                                {(user?.name || 'P')
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* =========================
                    CONTENT
                ========================= */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">

                    {/* =========================
                        HERO / INFO CARD
                    ========================= */}
                    <div className="dtl-rise relative mb-7 overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-r from-white/20 via-white/10 to-white/5 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.30)] backdrop-blur-xl sm:p-8">

                        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />
                        <div className="absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />

                        <div className="relative">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                                        </span>
                                        Data Preventif Mesin
                                    </div>

                                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        Pemeriksaan Schedule Preventif
                                    </h2>

                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">
                                        Periksa jadwal preventif mesin dan
                                        pastikan pekerjaan yang telah dilakukan
                                        sudah sesuai dengan data checklist.
                                    </p>
                                </div>

                                <div className="shrink-0 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 backdrop-blur-md">
                                    <p className="text-xs font-medium text-blue-100">
                                        Tanggal Pengiriman
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-white">
                                        {pengiriman.tanggal_format}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =========================
                        INFO PENGIRIMAN
                    ========================= */}
                    <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {infoCards.map((card, index) => (
                            <div
                                key={card.label}
                                style={{ animationDelay: `${100 + index * 90}ms` }}
                                className="dtl-rise group rounded-2xl border border-white/40 bg-white/[0.93] p-5 shadow-[0_16px_45px_rgba(2,6,23,0.30)] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBox}`}
                                    >
                                        <Icon type={card.icon} className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-500">
                                            {card.label}
                                        </p>

                                        <p className="mt-1 text-base font-bold text-slate-800">
                                            {card.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* =========================
                        STATUS + ACTION
                    ========================= */}
                    <div
                        style={{ animationDelay: '250ms' }}
                        className={`dtl-rise mb-7 overflow-hidden rounded-2xl ${glassCard}`}
                    >

                        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Status Pemeriksaan
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Status data pengiriman saat ini
                                </p>
                            </div>

                            <div>
                                {pengiriman.status === 'menunggu' && (
                                    <div className="flex flex-col gap-3 sm:flex-row">

                                        <button
                                            type="button"
                                            onClick={handlePeriksa}
                                            disabled={isSubmitting}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Icon type="check" className="h-5 w-5" />

                                            Tandai Sudah Diperiksa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowTolakModal(true)
                                            }
                                            disabled={isSubmitting}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Icon type="x" className="h-5 w-5" />

                                            Tolak
                                        </button>
                                    </div>
                                )}

                                {pengiriman.status === 'diperiksa' && (
                                    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                                            ✓
                                        </span>

                                        Sudah Diperiksa
                                    </div>
                                )}

                                {pengiriman.status === 'ditolak' && (
                                    <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                            ✕
                                        </span>

                                        Ditolak
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Alasan Penolakan */}
                        {pengiriman.status === 'ditolak' && (
                            <div className="border-t border-red-100 bg-red-50/80 px-5 py-5 sm:px-6">
                                <div className="flex gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                        <Icon type="warning" className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-red-700">
                                            Alasan Penolakan
                                        </p>

                                        <p className="mt-1 text-sm leading-relaxed text-red-600">
                                            {pengiriman.alasan_penolakan || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =========================
                        TABLE CARD
                    ========================= */}
                    <div
                        style={{ animationDelay: '350ms' }}
                        className={`dtl-rise overflow-hidden rounded-3xl ${glassCard}`}
                    >

                        {/* Table Header */}
                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                        <Icon type="list" className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-800">
                                            Jadwal Preventif
                                        </h3>

                                        <p className="text-xs text-slate-500">
                                            {pengiriman.tanggal_format}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                        <span className="text-sm">○</span>
                                        Plan
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        <span className="text-sm">✓</span>
                                        Act
                                    </span>
                                </div>
                            </div>

                            <p className="mt-4 text-xs leading-relaxed text-slate-500">
                                Tanda <span className="font-bold text-blue-600">○</span>{' '}
                                menunjukkan jadwal Plan dan tanda{' '}
                                <span className="font-bold text-emerald-600">✓</span>{' '}
                                menunjukkan pekerjaan yang sudah dilakukan.
                            </p>
                        </div>

                        {/* Empty State */}
                        {preventifMesins.length === 0 ? (

                            <div className="px-6 py-20 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <Icon type="document" className="h-8 w-8" />
                                </div>

                                <h3 className="mt-4 font-semibold text-slate-700">
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

                                            <th
                                                rowSpan="2"
                                                className="sticky left-0 z-20 border border-slate-200 bg-slate-50 px-4 py-3 text-left font-bold text-slate-700"
                                            >
                                                Divisi
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                No
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-left font-bold text-slate-700"
                                            >
                                                Item Preventif
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                Periode
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                Durasi
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                Total Durasi
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                DOT
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                HOT
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700"
                                            >
                                                Status
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="min-w-[90px] border border-slate-200 bg-blue-50 px-4 py-3 text-center font-bold text-blue-700"
                                            >
                                                {pengiriman.tanggal_format}
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="min-w-[220px] border border-slate-200 bg-amber-50 px-4 py-3 text-center font-bold text-amber-700"
                                            >
                                                Catatan
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {preventifMesins.map((item) => (

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
                                                        {isPlan(
                                                            item,
                                                            pengiriman.tanggal
                                                        )
                                                            ? '○'
                                                            : ''}
                                                    </td>

                                                    <td
                                                        rowSpan="2"
                                                        className="max-w-[280px] border border-slate-200 bg-amber-50/30 px-4 py-3 text-left align-top"
                                                    >
                                                        {getChecklist(
                                                            item,
                                                            pengiriman.tanggal
                                                        )?.catatan ? (
                                                            <div className="text-xs leading-relaxed text-slate-600">
                                                                {getChecklist(
                                                                    item,
                                                                    pengiriman.tanggal
                                                                ).catatan}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* ACT */}
                                                <tr className="transition-colors hover:bg-emerald-50/30">

                                                    <td className="border border-slate-200 bg-emerald-50/50 px-4 py-2 text-center font-bold text-emerald-600">
                                                        ACT
                                                    </td>

                                                    <td
                                                        title={
                                                            getChecklist(
                                                                item,
                                                                pengiriman.tanggal
                                                            )?.catatan || ''
                                                        }
                                                        className="border border-slate-200 bg-emerald-50/30 px-2 py-2 text-center text-lg font-bold text-emerald-600"
                                                    >
                                                        {isAct(
                                                            item,
                                                            pengiriman.tanggal
                                                        )
                                                            ? '✓'
                                                            : ''}
                                                    </td>
                                                </tr>

                                            </React.Fragment>

                                        ))}

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
                MODAL TOLAK
            ========================= */}
            {showTolakModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">

                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">

                        {/* Modal Header */}
                        <div className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-5">
                            <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <Icon type="x" className="h-6 w-6" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Tolak Data Preventif
                                    </h2>

                                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                        Silakan masukkan alasan penolakan
                                        data ini.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">

                            <label className="text-sm font-semibold text-slate-700">
                                Alasan Penolakan
                            </label>

                            <textarea
                                value={alasanPenolakan}
                                onChange={(e) =>
                                    setAlasanPenolakan(e.target.value)
                                }
                                rows={5}
                                placeholder="Contoh: Checklist belum lengkap..."
                                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Alasan ini akan disimpan bersama status
                                penolakan data.
                            </p>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTolakModal(false);
                                        setAlasanPenolakan('');
                                    }}
                                    disabled={isSubmitting}
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={handleTolak}
                                    disabled={
                                        isSubmitting ||
                                        !alasanPenolakan.trim()
                                    }
                                    className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all duration-200 hover:from-red-600 hover:to-rose-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? 'Mengirim...'
                                        : 'Tolak Data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
