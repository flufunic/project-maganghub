import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

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

    return (
        <>
            <Head title="Detail Data Preventif" />

            <div className="flex min-h-screen flex-col bg-slate-100">

                {/* =========================
                    HEADER
                ========================= */}
                <header className="sticky top-0 z-40 border-b border-white/20 bg-white/90 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

                        <div className="flex items-center gap-3">

                            <Link
                                href="/pimpinan"
                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300"
                                title="Kembali ke Dashboard"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </Link>

                            <div>
                                <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                                    Detail Data Preventif
                                </h1>

                                <p className="hidden text-xs text-slate-500 sm:block">
                                    Pemeriksaan data schedule preventif
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-800">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-blue-600">
                                    Pimpinan
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-200">
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
                    <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-6 shadow-lg shadow-blue-200 sm:p-8">

                        {/* Decorative circle */}
                        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
                        <div className="absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-indigo-400/20" />

                        <div className="relative">

                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
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

                                <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
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

                        {/* Tanggal */}
                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Tanggal Pengiriman
                                    </p>

                                    <p className="mt-1 text-base font-bold text-slate-800">
                                        {pengiriman.tanggal_format}
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* Pengirim */}
                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Dikirim Oleh
                                    </p>

                                    <p className="mt-1 text-base font-bold text-slate-800">
                                        {pengiriman.dikirim_oleh || '-'}
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>


                    {/* =========================
                        STATUS + ACTION
                    ========================= */}
                    <div className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

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
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>

                                            Tandai Sudah Diperiksa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowTolakModal(true)
                                            }
                                            disabled={isSubmitting}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>

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
                            <div className="border-t border-red-100 bg-red-50/70 px-5 py-5 sm:px-6">

                                <div className="flex gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                                            />
                                        </svg>
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
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                        {/* Table Header */}
                        <div className="border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                                />
                                            </svg>
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
                                </div>


                                <div className="flex flex-wrap items-center gap-2">

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                        <span className="text-sm">○</span>
                                        Plan
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
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
                                    <svg
                                        className="h-8 w-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-4 font-semibold text-slate-700">
                                    Belum ada data preventif
                                </h3>

                                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                                    Tidak ada data preventif pada periode ini.
                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="min-w-max w-full border-collapse text-xs">

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
                                                className="min-w-[90px] border border-slate-200 bg-blue-50/60 px-4 py-3 text-center font-bold text-blue-700"
                                            >
                                                {pengiriman.tanggal_format}
                                            </th>

                                        </tr>
                                    </thead>


                                    <tbody>

                                        {preventifMesins.map((item) => (

                                            <React.Fragment key={item.id}>

                                                {/* PLAN */}
                                                <tr className="transition-colors hover:bg-blue-50/30">

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

                                                    <td className="border border-slate-200 bg-blue-50/30 px-4 py-2 text-center font-bold text-blue-600">
                                                        PLAN
                                                    </td>

                                                    <td className="border border-slate-200 bg-blue-50/20 px-2 py-2 text-center text-lg font-semibold text-blue-600">
                                                        {isPlan(
                                                            item,
                                                            pengiriman.tanggal
                                                        )
                                                            ? '○'
                                                            : ''}
                                                    </td>

                                                </tr>


                                                {/* ACT */}
                                                <tr className="transition-colors hover:bg-emerald-50/20">

                                                    <td className="border border-slate-200 bg-emerald-50/30 px-4 py-2 text-center font-bold text-emerald-600">
                                                        ACT
                                                    </td>

                                                    <td
                                                        title={
                                                            getChecklist(
                                                                item,
                                                                pengiriman.tanggal
                                                            )?.catatan || ''
                                                        }
                                                        className="border border-slate-200 bg-emerald-50/20 px-2 py-2 text-center text-lg font-bold text-emerald-600"
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
                    FOOTER
                ========================= */}
                <footer className="mt-auto border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-5 sm:px-6">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>

            </div>


            {/* =========================
                MODAL TOLAK
            ========================= */}
            {showTolakModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-5">

                            <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
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
                                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-100 transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 disabled:cursor-not-allowed disabled:opacity-50"
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