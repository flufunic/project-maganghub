
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

import {
    Plus,
    Eye,
    Trash2,
    ClipboardList,
    CheckCircle2,
    AlertTriangle,
    X,
    ChevronDown,
} from 'lucide-react';

const STATUS = {
    draft: {
        label: 'Draft',
        cls: 'bg-slate-100 text-slate-600',
    },

    menunggu: {
        label: 'Menunggu Pimpinan',
        cls: 'bg-amber-100 text-amber-700',
    },

    diperiksa: {
        label: 'Sedang Diperiksa',
        cls: 'bg-blue-100 text-blue-700',
    },

    disetujui: {
        label: 'Disetujui',
        cls: 'bg-emerald-100 text-emerald-700',
    },

    ditolak: {
        label: 'Ditolak',
        cls: 'bg-red-100 text-red-700',
    },
};

const thClass =
    'border border-slate-200 bg-sky-100 px-3 py-3 text-center text-[11px] font-bold uppercase text-slate-700 whitespace-nowrap';

const tdClass =
    'border border-slate-200 px-3 py-3 text-sm text-slate-700';

export default function Riwayat({
    tahun,
    bulan = '',
    laporan,
    flash = {},
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [laporanHapus, setLaporanHapus] = useState(null);
    const [menghapus, setMenghapus] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Dropdown item preventif per week
    const [weekTerbuka, setWeekTerbuka] = useState(null);

    // =====================================================
    // TOAST NOTIFICATION
    // =====================================================

    useEffect(() => {
        if (!flash?.success) return;

        setShowToast(true);

        const timer = setTimeout(() => {
            setShowToast(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, [flash?.success]);

    // =====================================================
    // TOGGLE WEEK
    // =====================================================

    const toggleWeek = (id) => {
        setWeekTerbuka((prev) => (
            prev === id ? null : id
        ));
    };

    // =====================================================
    // HAPUS LAPORAN
    // =====================================================

    const hapusLaporan = () => {
        if (!laporanHapus || menghapus) return;

        setMenghapus(true);

        router.delete(`/laporan-mingguan/${laporanHapus.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setLaporanHapus(null);
            },

            onFinish: () => {
                setMenghapus(false);
            },
        });
    };


    // =====================================================
    // FILTER TAHUN DAN BULAN
    // =====================================================

    const pilihFilter = (filterTahun, filterBulan) => {
        router.get(
            '/laporan-mingguan',
            {
                tahun: Number(filterTahun),
                bulan: filterBulan || '',
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const pilihTahun = (value) => {
        pilihFilter(value, bulan);
    };

    const pilihBulan = (value) => {
        pilihFilter(tahun, value);
    };

    return (
        <>
            <Head title="Riwayat Laporan Mingguan" />

            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            {/* =====================================================
                TOAST NOTIFICATION
            ===================================================== */}

            {showToast && flash?.success && (
                <div className="fixed right-5 top-5 z-[200] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-xl border border-green-200 bg-white p-4 shadow-2xl animate-[slideIn_.3s_ease-out]">

                    <CheckCircle2
                        size={22}
                        className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                            Berhasil!
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                            {flash.success}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowToast(false)}
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Tutup"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* =====================================================
                MAIN
            ===================================================== */}

            <div className="min-h-screen bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/60 backdrop-blur-2xl">

                    <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">

                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white hover:bg-white/25"
                        >
                            ☰
                        </button>

                        <div>
                            <h1 className="text-base font-bold text-white sm:text-lg">
                                Report Mingguan Preventif
                            </h1>

                            <p className="text-[11px] text-blue-200/70">
                                Riwayat laporan preventif mingguan
                            </p>
                        </div>

                    </div>

                </header>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-5 sm:px-6">

                    <section className="rounded-2xl bg-white p-5 shadow-xl">

                        {/* =================================================
                            JUDUL
                        ================================================= */}

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                            <div>
                                <div className="flex items-center gap-2">

                                    <ClipboardList className="h-5 w-5 text-blue-600" />

                                    <h2 className="text-lg font-bold text-slate-900">
                                        Riwayat Laporan Mingguan
                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                    Daftar laporan preventif yang sudah dibuat.
                                </p>
                            </div>

                            <Link
                                href="/laporan-mingguan/form"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 text-xs font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-800"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Laporan Baru
                            </Link>

                        </div>

                        {/* =================================================
                            FILTER TAHUN DAN BULAN
                        ================================================= */}

                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">

                            <div className="flex flex-wrap items-end gap-3">

                                {/* FILTER TAHUN */}
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold text-slate-500">
                                        Filter Tahun
                                    </label>

                                    <select
                                        value={tahun}
                                        onChange={(e) => pilihTahun(e.target.value)}
                                        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                                    >
                                        {Array.from(
                                            { length: 16 },
                                            (_, i) => 2020 + i
                                        ).map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* FILTER BULAN */}
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold text-slate-500">
                                        Filter Bulan
                                    </label>

                                    <select
                                        value={bulan ?? ''}
                                        onChange={(e) => pilihBulan(e.target.value)}
                                        className="h-9 min-w-[145px] rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                                    >
                                        <option value="">Semua Bulan</option>

                                        {[
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
                                        ].map((nama, index) => (
                                            <option key={index + 1} value={index + 1}>
                                                {nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                                Total: {laporan.total} laporan
                            </div>

                        </div>

                        {/* =================================================
                            TABEL
                        ================================================= */}

                        <div className="mt-4 overflow-x-auto rounded-xl">

                            <table className="w-full border-collapse">

                                <thead>
                                    <tr>
                                        {[
                                            'No',
                                            'Periode',
                                            'Jumlah Item',
                                            'Status',
                                            'Tanggal Dikirim',
                                            'Tanggal Disetujui',
                                            'Aksi',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className={thClass}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>

                                    {laporan.data.length === 0 ? (

                                        <tr>
                                            <td
                                                colSpan={7}
                                                className={`${tdClass} py-12 text-center`}
                                            >
                                                <ClipboardList className="mx-auto mb-2 h-9 w-9 text-slate-300" />

                                                <p className="font-semibold text-slate-500">
                                                    Belum ada riwayat laporan.
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Silakan buat laporan mingguan baru.
                                                </p>
                                            </td>
                                        </tr>

                                    ) : (

                                        laporan.data.map((item, index) => {

                                            const status =
                                                STATUS[item.status] ??
                                                STATUS.draft;

                                            const isOpen =
                                                weekTerbuka === item.id;

                                            const daftarItem =
                                                item.item_preventif ?? [];

                                            return (

                                                <tr
                                                    key={item.id}
                                                    className="transition hover:bg-blue-50/60"
                                                >

                                                    {/* NO */}

                                                    <td
                                                        className={`${tdClass} text-center`}
                                                    >
                                                        {(laporan.from ?? 1) + index}
                                                    </td>

                                                    {/* =================================================
                                                        PERIODE + DROPDOWN COMPACT
                                                    ================================================= */}

                                                    <td className={`${tdClass} min-w-[190px]`}>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleWeek(item.id)}
                                                            aria-expanded={isOpen}
                                                            className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-slate-50"
                                                        >

                                                            <div className="min-w-0">

                                                                <p className="text-xs font-bold text-slate-800">
                                                                    Week {item.week}
                                                                </p>

                                                                <p className="mt-0.5 text-[10px] text-slate-500">
                                                                    {item.periode_tanggal
                                                                        ? `${item.periode_tanggal} ${item.tahun}`
                                                                        : `${item.nama_bulan} ${item.tahun}`}
                                                                </p>

                                                            </div>

                                                            <div className="flex shrink-0 items-center gap-1.5">

                                                                <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                                                                    {daftarItem.length || item.items_count || 0}
                                                                </span>

                                                                <ChevronDown
                                                                    size={15}
                                                                    className={`text-slate-400 transition-transform duration-200 ${
                                                                        isOpen ? 'rotate-180' : ''
                                                                    }`}
                                                                />

                                                            </div>

                                                        </button>

                                                        {/* DROPDOWN ITEM */}

                                                        {isOpen && (

                                                            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">

                                                                <div className="mb-1.5 flex items-center justify-between">

                                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                                                        Item Preventif
                                                                    </p>

                                                                    <span className="text-[9px] font-semibold text-slate-400">
                                                                        {daftarItem.length} item
                                                                    </span>

                                                                </div>

                                                                {daftarItem.length > 0 ? (

                                                                    <ol className="max-h-36 space-y-1 overflow-y-auto pr-1">

                                                                        {daftarItem.map((nama, itemIndex) => (

                                                                            <li
                                                                                key={`${item.id}-${itemIndex}`}
                                                                                className="flex items-start gap-2 text-[10px] leading-relaxed text-slate-700"
                                                                            >

                                                                                <span className="w-4 shrink-0 text-right font-semibold tabular-nums text-blue-500">
                                                                                    {itemIndex + 1}.
                                                                                </span>

                                                                                <span className="min-w-0 break-words">
                                                                                    {nama}
                                                                                </span>

                                                                            </li>

                                                                        ))}

                                                                    </ol>

                                                                ) : (

                                                                    <p className="py-1 text-[10px] text-slate-400">
                                                                        Belum ada item preventif.
                                                                    </p>

                                                                )}

                                                            </div>

                                                        )}

                                                    </td>

                                                    {/* JUMLAH ITEM */}

                                                    <td
                                                        className={`${tdClass} text-center`}
                                                    >
                                                        <span className="font-semibold text-slate-700">
                                                            {item.items_count}
                                                        </span>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td
                                                        className={`${tdClass} text-center`}
                                                    >

                                                        <span
                                                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${status.cls}`}
                                                        >
                                                            {status.label}
                                                        </span>

                                                        {item.status === 'ditolak' &&
                                                            item.alasan_penolakan && (

                                                                <p
                                                                    title={item.alasan_penolakan}
                                                                    className="mx-auto mt-1 max-w-[180px] truncate text-[10px] text-red-500"
                                                                >
                                                                    {item.alasan_penolakan}
                                                                </p>

                                                            )}

                                                    </td>

                                                    {/* TANGGAL DIKIRIM */}

                                                    <td
                                                        className={`${tdClass} whitespace-nowrap text-center text-xs`}
                                                    >
                                                        {item.dikirim_pada || '-'}
                                                    </td>

                                                    {/* TANGGAL DISETUJUI */}

                                                    <td
                                                        className={`${tdClass} whitespace-nowrap text-center text-xs`}
                                                    >
                                                        {item.disetujui_pada || '-'}
                                                    </td>

                                                    {/* AKSI */}

                                                    <td
                                                        className={`${tdClass} min-w-[110px]`}
                                                    >

                                                        <div className="flex items-center justify-center gap-2">

                                                            <Link
                                                                href={`/laporan-mingguan/form?bulan=${item.bulan}&tahun=${item.tahun}&week=${item.week}`}
                                                                title="Lihat laporan"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                            >
                                                                <Eye size={17} />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                disabled={item.status === 'disetujui'}
                                                                onClick={() => setLaporanHapus(item)}
                                                                title={
                                                                    item.status === 'disetujui'
                                                                        ? 'Laporan sudah disetujui'
                                                                        : 'Hapus laporan'
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        })

                                    )}

                                </tbody>

                            </table>

                        </div>

                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        {laporan.last_page > 1 && (

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">

                                <p className="text-xs text-slate-500">
                                    Menampilkan {laporan.from}–{laporan.to} dari{' '}
                                    {laporan.total} laporan
                                </p>

                                <div className="flex flex-wrap gap-1">

                                    {laporan.links.map((link, index) => (

                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url && router.visit(link.url)
                                            }
                                            className={`min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                                                link.active
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            } disabled:cursor-not-allowed disabled:opacity-40`}
                                        >
                                            {index === 0
                                                ? '‹'
                                                : index === laporan.links.length - 1
                                                    ? '›'
                                                    : link.label}
                                        </button>

                                    ))}

                                </div>

                            </div>

                        )}

                    </section>

                </main>

            </div>

            {/* =====================================================
                MODAL KONFIRMASI HAPUS
            ===================================================== */}

            {laporanHapus && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex justify-end px-4 pt-4">

                            <button
                                type="button"
                                onClick={() => setLaporanHapus(null)}
                                disabled={menghapus}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <div className="px-6 pb-6 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                                <AlertTriangle size={27} />
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-800">
                                Hapus Laporan?
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                Yakin ingin menghapus laporan

                                <span className="font-bold text-slate-700">
                                    {' '}
                                    Week {laporanHapus.week}{' '}
                                    {laporanHapus.nama_bulan}{' '}
                                    {laporanHapus.tahun}
                                </span>
                                ?
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                                Laporan akan dipindahkan ke data terhapus dan
                                tidak tampil lagi di riwayat.
                            </p>

                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    disabled={menghapus}
                                    onClick={() => setLaporanHapus(null)}
                                    className="h-10 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    disabled={menghapus}
                                    onClick={hapusLaporan}
                                    className="h-10 flex-1 rounded-xl bg-red-600 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    {menghapus ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}
