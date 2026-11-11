import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Eye,
    Hourglass,
    Inbox,
    Layers,
    Lock,
    RotateCcw,
    ShieldCheck,
    Trash2,
    Wrench,
    X,
} from 'lucide-react';

import ProduksiLayout, {
    StatusBadge,
} from '../../Components/ProduksiLayout';

/* Kelas ditulis utuh supaya terbaca oleh Tailwind */
const TEMA = {
    semua: {
        ikon: Layers,
        warna: 'from-slate-600 to-slate-800',
        cincin: 'ring-slate-400',
        teks: 'text-slate-700',
        titik: 'bg-slate-400',
    },
    disetujui: {
        ikon: Inbox,
        warna: 'from-sky-500 to-blue-600',
        cincin: 'ring-blue-400',
        teks: 'text-blue-700',
        titik: 'bg-blue-500',
    },
    diterima: {
        ikon: CheckCircle2,
        warna: 'from-indigo-500 to-indigo-700',
        cincin: 'ring-indigo-400',
        teks: 'text-indigo-700',
        titik: 'bg-indigo-500',
    },
    dikerjakan: {
        ikon: Wrench,
        warna: 'from-violet-500 to-purple-700',
        cincin: 'ring-violet-400',
        teks: 'text-violet-700',
        titik: 'bg-violet-500',
    },
    selesai: {
        ikon: Hourglass,
        warna: 'from-amber-400 to-orange-500',
        cincin: 'ring-amber-400',
        teks: 'text-amber-700',
        titik: 'bg-amber-500',
    },
    closed: {
        ikon: Lock,
        warna: 'from-emerald-500 to-teal-600',
        cincin: 'ring-emerald-400',
        teks: 'text-emerald-700',
        titik: 'bg-emerald-500',
    },
};

const temaDari = (kode) => TEMA[kode] ?? TEMA.semua;

/* ---------- Dialog konfirmasi hapus ---------- */
function ConfirmHapus({ rrf, processing, error, onCancel, onConfirm }) {
    if (!rrf) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !processing) {
                    onCancel();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/40"
            >
                <div className="px-5 pb-4 pt-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
                        </span>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900">
                                Hapus RRF?
                            </h2>

                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Apakah kamu yakin ingin menghapus RRF{' '}
                                <b className="text-slate-800">{rrf.rrf_no}</b>? RRF
                                tidak akan muncul lagi di daftar, tetapi datanya
                                tetap tersimpan sebagai arsip.
                            </p>

                            {error && (
                                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MtcIndex({
    rrfs,
    filters = {},
    statuses = {},
    ringkasan = {},
    antrean = {},
    role = null,
}) {
    const { auth } = usePage().props;

    const peran = role ?? auth?.user?.role;
    const isPimpinan = peran === 'pimpinan';
    const isAdmin = peran === 'admin';
    const [hapusTarget, setHapusTarget] = useState(null);
    const [menghapus, setMenghapus] = useState(false);
    const [errorHapus, setErrorHapus] = useState('');

    const bukaHapus = (rrf) => {
        setErrorHapus('');
        setHapusTarget(rrf);
    };

    const tutupHapus = () => {
        if (menghapus) {
            return;
        }

        setHapusTarget(null);
        setErrorHapus('');
    };

    const konfirmasiHapus = () => {
        if (!hapusTarget) {
            return;
        }

        router.delete(`/mtc/rrf/${hapusTarget.id}`, {
            preserveScroll: true,
            onStart: () => setMenghapus(true),
            onFinish: () => setMenghapus(false),
            onSuccess: () => setHapusTarget(null),
            onError: (errs) =>
                setErrorHapus(Object.values(errs)[0] ?? 'RRF gagal dihapus.'),
        });
    };

    // Tombol Esc menutup dialog
    useEffect(() => {
        if (!hapusTarget) {
            return undefined;
        }

        const onKey = (e) => {
            if (e.key === 'Escape' && !menghapus) {
                setHapusTarget(null);
                setErrorHapus('');
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [hapusTarget, menghapus]);

    const opsi = {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    };

    const statusAktif = filters.status ?? '';
    const filterDikembalikan = isAdmin && filters.antrean === 'dikembalikan';

    const totalSemua = Object.values(ringkasan ?? {}).reduce(
        (a, b) => a + Number(b || 0),
        0
    );

    const pilihStatus = (kode) =>
        router.get('/mtc/rrf', kode ? { status: kode } : {}, opsi);

    const lihatDikembalikan = () =>
        router.get('/mtc/rrf', { antrean: 'dikembalikan' }, opsi);

    const resetFilter = () => router.get('/mtc/rrf', {}, opsi);

    const labelStatus = (r) =>
        r.status === 'selesai' ? 'Menunggu Verifikasi' : r.status_label;

    const judulHalaman = isPimpinan
        ? 'Verifikasi RRF Maintenance'
        : 'RRF Maintenance';

    const deskripsiHalaman = isPimpinan
        ? 'Periksa hasil penanganan dan lihat riwayat RRF yang sudah di-close.'
        : 'Kelola dan pantau permintaan perbaikan mesin dari bagian produksi.';

    /* Kartu: Semua + tiap status */
    const kartu = [
        ['', 'Semua RRF', totalSemua],
        ...Object.entries(statuses).map(([kode, label]) => [
            kode,
            label,
            ringkasan[kode] ?? 0,
        ]),
    ];

    const gridKartu = isPimpinan
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6';

    return (
        <ProduksiLayout>
            <Head title={judulHalaman} />

            {/* HEADER (ringkas) */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${
                            isPimpinan
                                ? 'from-amber-400 to-orange-500'
                                : 'from-blue-500 to-indigo-600'
                        }`}
                    >
                        {isPimpinan ? (
                            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                        ) : (
                            <ClipboardList className="h-5 w-5" strokeWidth={1.75} />
                        )}
                    </span>

                    <div className="min-w-0">
                        <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                            {judulHalaman}
                        </h1>
                        <p className="truncate text-[11px] text-blue-100/70 sm:text-xs">
                            {deskripsiHalaman}
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                    <span className="text-base font-black leading-none">
                        {rrfs.total ?? 0}
                    </span>
                    data tampil
                </span>
            </div>

            {/* BANNER PIMPINAN */}
            {/* {isPimpinan && (antrean.verifikasi ?? 0) > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 px-4 py-3 shadow-lg shadow-amber-950/10">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                        </span>

                        <div>
                            <p className="text-sm font-bold text-amber-900">
                                Ada RRF menunggu verifikasi Anda
                            </p>
                            <p className="mt-0.5 text-xs text-amber-800/80">
                                {antrean.verifikasi} RRF telah selesai dikerjakan
                                Maintenance.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => pilihStatus('selesai')}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
                    >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Lihat antrean
                    </button>
                </div>
            )} */}

            {/* BANNER ADMIN */}
            {isAdmin && (antrean.dikembalikan ?? 0) > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-300 bg-red-50/95 px-4 py-3 shadow-lg shadow-red-950/10">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
                            <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
                        </span>

                        <div>
                            <p className="text-sm font-bold text-red-900">
                                Ada RRF yang dikembalikan Pimpinan
                            </p>
                            <p className="mt-0.5 text-xs text-red-800/80">
                                {antrean.dikembalikan} RRF perlu diperbaiki kembali.
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

            {filterDikembalikan && (
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

            {/* FILTER STATUS = KARTU RINGKASAN */}
            {/* FILTER STATUS = KARTU RINGKASAN (kompak) */}
            <div className={`mb-4 grid gap-2.5 ${gridKartu}`}>
                {kartu.map(([kode, label, jumlah]) => {
                    const t = temaDari(kode || 'semua');
                    const Ikon = t.ikon;
                    const aktif = !filterDikembalikan && statusAktif === kode;

                    return (
                        <button
                            key={kode || 'semua'}
                            type="button"
                            title={label}
                            onClick={() => pilihStatus(kode)}
                            className={`group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border border-white/40 bg-white/[0.94] px-3 pb-2 pt-2.5 text-left shadow-md shadow-slate-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                                aktif ? `ring-2 ${t.cincin}` : ''
                            }`}
                        >
                            <span
                                className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${t.warna}`}
                            />

                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow ${t.warna}`}
                            >
                                <Ikon className="h-4 w-4" strokeWidth={1.75} />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className={`text-xl font-black leading-none ${t.teks}`}>
                                    {jumlah}
                                </p>

                                <p className="mt-1 truncate text-[11px] font-bold text-slate-600">
                                    {label}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>


            {/* TABEL */}
            <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/[0.94] shadow-[0_24px_70px_rgba(2,6,23,0.30)] backdrop-blur-2xl">
                <div
                    className={`flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 ${
                        isPimpinan
                            ? 'border-amber-100 bg-gradient-to-r from-white via-amber-50/60 to-orange-50/70'
                            : 'border-slate-100 bg-gradient-to-r from-white via-blue-50/60 to-indigo-50/70'
                    }`}
                >
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-900">
                            {isPimpinan
                                ? 'Verifikasi & Riwayat RRF'
                                : 'Data Permintaan Perbaikan'}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                            {isPimpinan
                                ? 'RRF menunggu verifikasi tampil paling atas, diikuti riwayat yang sudah closed.'
                                : 'Klik kartu di atas untuk menyaring berdasarkan status.'}
                        </p>
                    </div>

                    <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            isPimpinan
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-blue-100 bg-blue-50 text-blue-700'
                        }`}
                    >
                        {rrfs.total ?? 0} data
                    </span>
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
                                    'Jenis',
                                    'Pembuat',
                                    'Status',
                                    'Aksi',
                                ].map((judul) => (
                                    <th
                                        key={judul}
                                        className={`whitespace-nowrap border-r border-white/10 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider last:border-r-0 ${
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
                                        className="px-4 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            {isPimpinan ? (
                                                <ShieldCheck className="h-7 w-7" />
                                            ) : (
                                                <ClipboardList className="h-7 w-7" />
                                            )}
                                        </div>

                                        <p className="mt-3 text-sm font-bold text-slate-600">
                                            Belum ada RRF
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Tidak ada permintaan dengan status ini.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                rrfs.data.map((r, index) => {
                                    const t = temaDari(r.status);
                                    const perluVerifikasi =
                                        isPimpinan && r.status === 'selesai';

                                    return (
                                        <tr
                                            key={r.id}
                                            className={`group transition-colors duration-150 hover:bg-blue-50/70 ${
                                                index % 2 === 0
                                                    ? 'bg-white'
                                                    : 'bg-slate-50/50'
                                            }`}
                                        >
                                            <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className={`h-8 w-1 rounded-full ${t.titik}`}
                                                    />
                                                    <Link
                                                        href={`/mtc/rrf/${r.id}`}
                                                        className="font-bold text-blue-700 transition hover:text-indigo-700 hover:underline"
                                                    >
                                                        {r.rrf_no}
                                                    </Link>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                {r.tanggal
                                                    ? String(r.tanggal).split(' ')[0]
                                                    : '-'}
                                            </td>

                                            <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs font-semibold text-slate-700">
                                                {r.divisi ?? '-'}
                                            </td>

                                            <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                {r.lokasi ?? '-'}
                                            </td>

                                            <td className="border-b border-r border-slate-100 px-4 py-3.5">
                                                <p className="text-xs font-bold text-slate-800">
                                                    {r.mesin ?? '-'}
                                                </p>
                                            </td>

                                            <td className="border-b border-r border-slate-100 px-4 py-3.5">
                                                <span className="inline-flex rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                                    {r.kelas ?? '-'}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5 text-xs font-medium capitalize text-slate-600">
                                                {r.jenis_permintaan ?? '-'}
                                            </td>

                                            <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                {r.pembuat ?? '-'}
                                            </td>

                                            <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5">
                                                {r.status === 'selesai' ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                                                        <Clock3 className="h-3 w-3" />
                                                        Menunggu Verifikasi
                                                    </span>
                                                ) : (
                                                    <StatusBadge
                                                        status={r.status}
                                                        label={labelStatus(r)}
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

                                            <td className="border-b border-slate-100 px-4 py-3.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={`/mtc/rrf/${r.id}`}
                                                        className={`inline-flex h-8 w-[112px] items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-bold text-white shadow-sm transition group-hover:shadow-md ${
                                                            perluVerifikasi
                                                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                                        }`}
                                                    >
                                                        {perluVerifikasi ? (
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Eye className="h-3.5 w-3.5" />
                                                        )}
                                                        {perluVerifikasi ? 'Verifikasi' : 'Detail'}
                                                        <ArrowRight className="h-3 w-3" />
                                                    </Link>

                                                    {/* Hapus: tersedia di semua status */}
                                                    <button
                                                        type="button"
                                                        title="Hapus RRF"
                                                        onClick={() => bukaHapus(r)}
                                                        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
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

                {/* PAGINATION */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                    <span className="text-[11px] font-medium text-slate-400">
                        Menampilkan {rrfs.from ?? 0}–{rrfs.to ?? 0} dari{' '}
                        {rrfs.total ?? 0} data
                    </span>

                    {rrfs.last_page > 1 && (
                        <div className="flex items-center gap-2">
                            <span className="mr-1 text-xs font-semibold text-slate-500">
                                Halaman {rrfs.current_page} dari {rrfs.last_page}
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
                                        {link.label.replace(/&hellip;/g, '…')}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* DIALOG KONFIRMASI HAPUS */}
            <ConfirmHapus
                rrf={hapusTarget}
                processing={menghapus}
                error={errorHapus}
                onCancel={tutupHapus}
                onConfirm={konfirmasiHapus}
            />
        </ProduksiLayout>
    );
}