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

            <div className="min-h-screen bg-slate-50">

                {/* HEADER */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Detail Data Preventif
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Tanggal Pengiriman: {pengiriman.tanggal_format}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">

                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800">
                                    {user?.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Pimpinan
                                </p>
                            </div>

                            <Link
                                href="/pimpinan"
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Kembali
                            </Link>

                        </div>
                    </div>
                </header>


                {/* CONTENT */}
                <main className="mx-auto max-w-7xl px-6 py-8">

                    {/* INFO PENGIRIMAN */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Data Preventif Mesin
                                </h2>

                                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">

                                    <div>
                                        <span className="text-slate-500">
                                            Tanggal:
                                        </span>{' '}
                                        <span className="font-medium text-slate-700">
                                            {pengiriman.tanggal_format}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-slate-500">
                                            Dikirim oleh:
                                        </span>{' '}
                                        <span className="font-medium text-slate-700">
                                            {pengiriman.dikirim_oleh || '-'}
                                        </span>
                                    </div>

                                   {pengiriman.status === 'ditolak' && (
                                        <div className="sm:col-span-3 mt-2 rounded-xl border border-red-200 bg-red-50 p-4">
                                            <p className="text-sm font-semibold text-red-700">
                                                Alasan Penolakan
                                            </p>

                                            <p className="mt-1 text-sm text-red-600">
                                                {pengiriman.alasan_penolakan || '-'}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            </div>


                            <div>
                                {pengiriman.status === 'menunggu' && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handlePeriksa}
                                            disabled={isSubmitting}
                                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            ✓ Tandai Sudah Diperiksa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowTolakModal(true)}
                                            disabled={isSubmitting}
                                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            ✕ Tolak
                                        </button>
                                    </div>
                                )}

                                {pengiriman.status === 'diperiksa' && (
                                    <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                                        ✓ Sudah Diperiksa
                                    </div>
                                )}

                                {pengiriman.status === 'ditolak' && (
                                    <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                                        ✕ Ditolak
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>


                    {/* TABLE */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-6 py-4">
                            <h3 className="font-semibold text-slate-800">
                                Jadwal Preventif — {pengiriman.tanggal_format}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Tanda ○ menunjukkan jadwal Plan dan ✓ menunjukkan pekerjaan yang sudah dilakukan.
                            </p>
                        </div>


                        {preventifMesins.length === 0 ? (

                            <div className="px-6 py-16 text-center">
                                <h3 className="font-semibold text-slate-700">
                                    Belum ada data preventif
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
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
                                                className="sticky left-0 z-20 border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700"
                                            >
                                                Divisi
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                No
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700"
                                            >
                                                Item Preventif
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                Periode
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                Durasi
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                Total Durasi
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                DOT
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                HOT
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                Status
                                            </th>

                                            <th
                                                rowSpan="2"
                                                className="min-w-[90px] border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700"
                                            >
                                                {pengiriman.tanggal_format}
                                            </th>

                                        </tr>
                                    </thead>


                                    <tbody>

                                        {preventifMesins.map((item) => (

                                            <React.Fragment key={item.id}>

                                                {/* PLAN */}
                                                <tr>

                                                    <td
                                                        rowSpan="2"
                                                        className="sticky left-0 z-10 border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700"
                                                    >
                                                        {item.divisi}
                                                    </td>

                                                    <td
                                                        rowSpan="2"
                                                        className="border border-slate-200 px-4 py-3 text-center text-slate-700"
                                                    >
                                                        {item.no_item}
                                                    </td>

                                                    <td
                                                        rowSpan="2"
                                                        className="border border-slate-200 px-4 py-3 font-medium text-slate-800"
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

                                                    <td className="border border-slate-200 px-4 py-2 text-center font-semibold text-slate-600">
                                                        PLAN
                                                    </td>

                                                    <td className="border border-slate-200 px-2 py-2 text-center text-slate-500">
                                                        {isPlan(item, pengiriman.tanggal) ? '○' : ''}
                                                    </td>

                                                </tr>


                                                {/* ACT */}
                                                <tr>

                                                    <td className="border border-slate-200 px-4 py-2 text-center font-semibold text-emerald-600">
                                                        ACT
                                                    </td>

                                                    <td
                                                        title={
                                                            getChecklist(
                                                                item,
                                                                pengiriman.tanggal
                                                            )?.catatan || ''
                                                        }
                                                        className="border border-slate-200 px-2 py-2 text-center font-bold text-emerald-600"
                                                    >
                                                        {isAct(item, pengiriman.tanggal) ? '✓' : ''}
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
            </div>

            {showTolakModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-800">
                            Tolak Data Preventif
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Silakan masukkan alasan penolakan data ini.
                        </p>

                        <textarea
                            value={alasanPenolakan}
                            onChange={(e) => setAlasanPenolakan(e.target.value)}
                            rows={5}
                            placeholder="Contoh: Checklist belum lengkap..."
                            className="mt-4 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTolakModal(false);
                                    setAlasanPenolakan('');
                                }}
                                disabled={isSubmitting}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Tolak Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}