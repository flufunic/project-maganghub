import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Search,
    Eye,
    ClipboardList,
    RefreshCw,
    RotateCcw,
    ShieldCheck,
    Clock3,
    X,
} from 'lucide-react';

import ProduksiLayout, {
    StatusBadge,
} from '../../Components/ProduksiLayout';

export default function MtcIndex({
    rrfs,
    filters = {},
    statuses = {},
    ringkasan = {},
    antrean = {},
    divisis = [],
    role = null,
}) {
    const { auth } = usePage().props;

    const peran = role ?? auth?.user?.role;
    const isPimpinan = peran === 'pimpinan';
    const isAdmin = peran === 'admin';

    const [search, setSearch] = useState(filters.q ?? '');
    const [status, setStatus] = useState(
        isPimpinan ? 'selesai' : (filters.status ?? '')
    );
    const [divisi, setDivisi] = useState(filters.divisi ?? '');

    const opsi = {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    };

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const terapkanFilter = (e) => {
        e.preventDefault();

        const params = {
            q: search,
            status: isPimpinan ? 'selesai' : status,
            divisi,
        };

        router.get('/mtc/rrf', params, opsi);
    };

    const resetFilter = () => {
        setSearch('');
        setDivisi('');

        if (isPimpinan) {
            setStatus('selesai');

            router.get(
                '/mtc/rrf',
                {
                    status: 'selesai',
                },
                opsi
            );

            return;
        }

        setStatus('');

        router.get('/mtc/rrf', {}, opsi);
    };

    /*
    |--------------------------------------------------------------------------
    | ANTREAN PIMPINAN
    |--------------------------------------------------------------------------
    */

    const lihatMenungguVerifikasi = () => {
        setSearch('');
        setDivisi('');
        setStatus('selesai');

        router.get(
            '/mtc/rrf',
            {
                status: 'selesai',
            },
            opsi
        );
    };

    /*
    |--------------------------------------------------------------------------
    | ANTREAN ADMIN
    |--------------------------------------------------------------------------
    */

    const lihatDikembalikan = () => {
        setSearch('');
        setDivisi('');
        setStatus('');

        router.get(
            '/mtc/rrf',
            {
                antrean: 'dikembalikan',
            },
            opsi
        );
    };

    /*
    |--------------------------------------------------------------------------
    | LABEL STATUS
    |--------------------------------------------------------------------------
    */

    const getStatusLabel = (rrf) => {
        if (isPimpinan && rrf.status === 'selesai') {
            return 'Menunggu Verifikasi';
        }

        return rrf.status_label;
    };

    /*
    |--------------------------------------------------------------------------
    | JUDUL HALAMAN
    |--------------------------------------------------------------------------
    */

    const judulHalaman = isPimpinan
        ? 'Verifikasi RRF Maintenance'
        : 'RRF Maintenance';

    const deskripsiHalaman = isPimpinan
        ? 'Periksa hasil penanganan maintenance dan lakukan verifikasi RRF.'
        : 'Kelola dan pantau permintaan perbaikan mesin dari bagian produksi.';

    const judulTabel = isPimpinan
        ? 'RRF Menunggu Verifikasi'
        : 'Data Permintaan Perbaikan';

    const deskripsiTabel = isPimpinan
        ? 'Daftar RRF yang telah diselesaikan Maintenance dan menunggu verifikasi.'
        : 'Daftar RRF yang masuk dari bagian produksi.';

    return (
        <ProduksiLayout>
            <Head title={judulHalaman} />

            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-8 w-1 rounded-full ${
                                isPimpinan
                                    ? 'bg-gradient-to-b from-amber-400 to-orange-500'
                                    : 'bg-gradient-to-b from-blue-400 to-indigo-600'
                            }`}
                        />

                        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                            {judulHalaman}
                        </h1>
                    </div>

                    <p className="mt-1 pl-3 text-xs text-blue-100/70 sm:text-sm">
                        {deskripsiHalaman}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`rounded-xl border px-4 py-2.5 text-xs font-bold text-white backdrop-blur ${
                            isPimpinan
                                ? 'border-amber-300/30 bg-amber-500/10'
                                : 'border-white/20 bg-white/10'
                        }`}
                    >
                        <ClipboardList className="mr-2 inline h-4 w-4" />

                        {isPimpinan
                            ? `${rrfs.total ?? 0} Menunggu Verifikasi`
                            : `${rrfs.total ?? 0} Permintaan`}
                    </span>
                </div>
            </div>

            {/* =========================================================
                BANNER PIMPINAN
            ========================================================= */}

            {isPimpinan && (antrean.verifikasi ?? 0) > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 px-4 py-3 shadow-lg shadow-amber-950/5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <ShieldCheck
                                className="h-5 w-5"
                                strokeWidth={1.75}
                            />
                        </span>

                        <div>
                            <p className="text-sm font-bold text-amber-900">
                                Ada RRF menunggu verifikasi
                            </p>

                            <p className="mt-0.5 text-xs text-amber-800/80">
                                {antrean.verifikasi} RRF telah selesai
                                dikerjakan oleh Maintenance.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={lihatMenungguVerifikasi}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
                    >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Lihat antrean
                    </button>
                </div>
            )}

            {/* =========================================================
                BANNER ADMIN
            ========================================================= */}

            {isAdmin && (antrean.dikembalikan ?? 0) > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-300 bg-red-50/95 px-4 py-3 shadow-lg shadow-red-950/5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
                            <RotateCcw
                                className="h-5 w-5"
                                strokeWidth={1.75}
                            />
                        </span>

                        <div>
                            <p className="text-sm font-bold text-red-900">
                                Ada RRF yang dikembalikan Pimpinan
                            </p>

                            <p className="mt-0.5 text-xs text-red-800/80">
                                {antrean.dikembalikan} RRF perlu diperbaiki
                                kembali.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={lihatDikembalikan}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Lihat daftar
                    </button>
                </div>
            )}

            {/* =========================================================
                CHIP FILTER DIKEMBALIKAN
            ========================================================= */}

            {isAdmin && filters.antrean === 'dikembalikan' && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 py-1.5 pl-4 pr-2 text-xs font-bold text-red-700 shadow">
                    Menampilkan: dikembalikan Pimpinan

                    <button
                        type="button"
                        onClick={resetFilter}
                        aria-label="Tampilkan semua"
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-red-500 transition hover:bg-red-100"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* =========================================================
                RINGKASAN STATUS
            ========================================================= */}

            <div
                className={`mb-5 grid gap-3 ${
                    isPimpinan
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}
            >
                {Object.entries(statuses).map(([kode, label]) => {
                    const labelTampilan =
                        isPimpinan && kode === 'selesai'
                            ? 'Menunggu Verifikasi'
                            : label;

                    return (
                        <div
                            key={kode}
                            className={`rounded-xl border p-4 shadow-lg backdrop-blur ${
                                isPimpinan && kode === 'selesai'
                                    ? 'border-amber-200 bg-amber-50/95 shadow-amber-950/10'
                                    : 'border-white/30 bg-white/[0.93] shadow-slate-950/10'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p
                                    className={`text-xs font-semibold ${
                                        isPimpinan && kode === 'selesai'
                                            ? 'text-amber-700'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {labelTampilan}
                                </p>

                                {isPimpinan && kode === 'selesai' && (
                                    <Clock3 className="h-4 w-4 text-amber-500" />
                                )}
                            </div>

                            <p
                                className={`mt-2 text-2xl font-extrabold ${
                                    isPimpinan && kode === 'selesai'
                                        ? 'text-amber-700'
                                        : 'text-slate-800'
                                }`}
                            >
                                {ringkasan[kode] ?? 0}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* =========================================================
                FILTER
            ========================================================= */}

            <form
                onSubmit={terapkanFilter}
                className="mb-4 rounded-2xl border border-white/40 bg-white/[0.93] p-4 shadow-lg shadow-slate-950/10 backdrop-blur"
            >
                <div className="mb-3">
                    <h2 className="text-sm font-bold text-slate-800">
                        {isPimpinan
                            ? 'Cari RRF Menunggu Verifikasi'
                            : 'Filter Data RRF'}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                        Cari berdasarkan nomor RRF, nama mesin, atau lokasi.
                    </p>
                </div>

                <div
                    className={`grid grid-cols-1 gap-3 ${
                        isPimpinan
                            ? 'md:grid-cols-3'
                            : 'md:grid-cols-4'
                    }`}
                >
                    {/* SEARCH */}

                    <div
                        className={`relative ${
                            isPimpinan ? 'md:col-span-2' : 'md:col-span-2'
                        }`}
                    >
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor RRF, mesin, lokasi..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    {/* STATUS */}

                    {!isPimpinan && (
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="">Semua Status</option>

                            {Object.entries(statuses).map(
                                ([kode, label]) => (
                                    <option key={kode} value={kode}>
                                        {label}
                                    </option>
                                )
                            )}
                        </select>
                    )}

                    {/* DIVISI */}

                    <select
                        value={divisi}
                        onChange={(e) => setDivisi(e.target.value)}
                        className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                        <option value="">Semua Divisi</option>

                        {divisis.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.nama_divisi}
                            </option>
                        ))}
                    </select>
                </div>

                {/* BUTTON */}

                <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button
                        type="button"
                        onClick={resetFilter}
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reset
                    </button>

                    <button
                        type="submit"
                        className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-4 text-xs font-bold text-white shadow-md transition ${
                            isPimpinan
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        }`}
                    >
                        <Search className="h-3.5 w-3.5" />
                        Terapkan
                    </button>
                </div>
            </form>

            {/* =========================================================
                TABEL
            ========================================================= */}

            <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.30)] backdrop-blur-2xl">
                <div
                    className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 ${
                        isPimpinan
                            ? 'border-amber-100 bg-gradient-to-r from-white via-amber-50/50 to-orange-50/60'
                            : 'border-slate-100 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/60'
                    }`}
                >
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            {judulTabel}
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                            {deskripsiTabel}
                        </p>
                    </div>

                    <div
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                            isPimpinan
                                ? 'border-amber-100 bg-amber-50 text-amber-700'
                                : 'border-blue-100 bg-blue-50 text-blue-700'
                        }`}
                    >
                        {rrfs.total ?? 0}{' '}
                        {isPimpinan ? 'Menunggu Verifikasi' : 'Data'}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr className="bg-[#0a1a4d] text-white">
                                {[
                                    'No. RRF',
                                    'Tanggal',
                                    'Divisi',
                                    'Lokasi',
                                    'Mesin',
                                    'Class',
                                    'Jenis Permintaan',
                                    'Pembuat',
                                    'Status',
                                    'Aksi',
                                ].map((judul) => (
                                    <th
                                        key={judul}
                                        className={`whitespace-nowrap border-r border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-wider last:border-r-0 ${
                                            judul === 'Aksi'
                                                ? 'text-center'
                                                : 'text-left'
                                        }`}
                                    >
                                        {judul}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {!rrfs.data?.length ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            {isPimpinan ? (
                                                <ShieldCheck className="h-6 w-6" />
                                            ) : (
                                                <ClipboardList className="h-6 w-6" />
                                            )}
                                        </div>

                                        <p className="mt-3 text-sm font-bold text-slate-600">
                                            {isPimpinan
                                                ? 'Tidak ada RRF menunggu verifikasi'
                                                : 'Belum ada RRF'}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {isPimpinan
                                                ? 'Semua RRF yang dikirim Maintenance sudah diverifikasi atau belum ada pengiriman baru.'
                                                : 'Belum ada permintaan perbaikan yang sesuai dengan filter.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                rrfs.data.map((r, index) => (
                                    <tr
                                        key={r.id}
                                        className={`transition-colors duration-150 hover:bg-blue-50/70 ${
                                            index % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-slate-50/50'
                                        }`}
                                    >
                                        {/* RRF */}

                                        <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5">
                                            <Link
                                                href={`/mtc/rrf/${r.id}`}
                                                className="font-bold text-blue-700 transition hover:text-indigo-700 hover:underline"
                                            >
                                                {r.rrf_no}
                                            </Link>
                                        </td>

                                        {/* TANGGAL */}

                                        <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                            {r.tanggal
                                                ? String(r.tanggal).split(
                                                      ' '
                                                  )[0]
                                                : '-'}
                                        </td>

                                        {/* DIVISI */}

                                        <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs font-semibold text-slate-700">
                                            {r.divisi ?? '-'}
                                        </td>

                                        {/* LOKASI */}

                                        <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                            {r.lokasi ?? '-'}
                                        </td>

                                        {/* MESIN */}

                                        <td className="border-b border-r border-slate-100 px-4 py-3.5">
                                            <p className="text-xs font-bold text-slate-800">
                                                {r.mesin ?? '-'}
                                            </p>
                                        </td>

                                        {/* CLASS */}

                                        <td className="border-b border-r border-slate-100 px-4 py-3.5">
                                            <span className="inline-flex rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                                {r.kelas ?? '-'}
                                            </span>
                                        </td>

                                        {/* JENIS */}

                                        <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs font-medium capitalize text-slate-600">
                                            {r.jenis_permintaan ?? '-'}
                                        </td>

                                        {/* PEMBUAT */}

                                        <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                            {r.pembuat ?? '-'}
                                        </td>

                                        {/* STATUS */}

                                        <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5">
                                            {isPimpinan &&
                                            r.status === 'selesai' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                                                    <Clock3 className="h-3 w-3" />
                                                    Menunggu Verifikasi
                                                </span>
                                            ) : (
                                                <StatusBadge
                                                    status={r.status}
                                                    label={getStatusLabel(r)}
                                                />
                                            )}

                                            {isAdmin &&
                                                r.status === 'dikerjakan' &&
                                                r.dikembalikan && (
                                                    <span className="mt-1 block text-[10px] font-semibold text-red-600">
                                                        Dikembalikan Pimpinan
                                                    </span>
                                                )}
                                        </td>

                                        {/* AKSI */}

                                        <td className="border-b border-slate-100 px-4 py-3.5">
                                            <div className="flex justify-center">
                                                <Link
                                                    href={`/mtc/rrf/${r.id}`}
                                                    title={
                                                        isPimpinan
                                                            ? 'Verifikasi RRF'
                                                            : 'Lihat detail RRF'
                                                    }
                                                    aria-label={
                                                        isPimpinan
                                                            ? `Verifikasi ${r.rrf_no}`
                                                            : `Lihat detail ${r.rrf_no}`
                                                    }
                                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                                        isPimpinan
                                                            ? 'border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800'
                                                            : 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800'
                                                    }`}
                                                >
                                                    {isPimpinan ? (
                                                        <ShieldCheck
                                                            className="h-4 w-4"
                                                            strokeWidth={1.75}
                                                        />
                                                    ) : (
                                                        <Eye
                                                            className="h-4 w-4"
                                                            strokeWidth={1.75}
                                                        />
                                                    )}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                    <span className="text-[11px] font-medium text-slate-400">
                        Menampilkan {rrfs.from ?? 0}–{rrfs.to ?? 0} dari{' '}
                        {rrfs.total ?? 0} data
                    </span>

                    {rrfs.last_page > 1 && (
                        <div className="flex items-center gap-2">
                            <span className="mr-1 text-xs font-semibold text-slate-500">
                                Halaman {rrfs.current_page} dari{' '}
                                {rrfs.last_page}
                            </span>

                            {rrfs.links?.map((link, index) => {
                                if (
                                    !link.url ||
                                    link.label.includes('Previous') ||
                                    link.label.includes('Next')
                                ) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-bold transition ${
                                            link.active
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                    >
                                        {link.label.replace(
                                            /&hellip;/g,
                                            '…'
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProduksiLayout>
    );
}