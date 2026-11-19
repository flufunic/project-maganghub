import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Eye,
    FileSpreadsheet,
    FileText,
    Layers,
    RotateCcw,
    Search,
    ShieldCheck,
    Wrench,
    X,
} from 'lucide-react';

import ProduksiLayout from '../../../Components/ProduksiLayout';

/*
 * Arti tiap status:
 *  draft               = RRF sudah dibuat dari data QMOS, Admin belum selesai mengisi / belum mengirim.
 *  menunggu_verifikasi = Admin sudah mengirim, menunggu keputusan Pimpinan.
 *  revisi              = Pimpinan mengembalikan RRF, Admin harus memperbaiki lalu kirim ulang.
 *  terverifikasi       = Pimpinan sudah menyetujui (selesai / Completed).
 */
const STATUS = {
    draft: {
        label: 'Menunggu Diisi',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
        icon: FileText,
        bar: 'from-sky-400 to-cyan-600',
        soft: 'bg-sky-50 text-sky-600',
        ring: 'ring-sky-300/70',
    },
    menunggu_verifikasi: {
        label: 'Menunggu Konfirmasi Pimpinan',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: Clock3,
        bar: 'from-amber-400 to-orange-500',
        soft: 'bg-amber-50 text-amber-600',
        ring: 'ring-amber-300/70',
    },
    revisi: {
        label: 'Perlu Revisi',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
        icon: RotateCcw,
        bar: 'from-rose-400 to-pink-600',
        soft: 'bg-rose-50 text-rose-600',
        ring: 'ring-rose-300/70',
    },
    terverifikasi: {
        label: 'Completed',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        icon: CheckCircle2,
        bar: 'from-emerald-400 to-green-600',
        soft: 'bg-emerald-50 text-emerald-600',
        ring: 'ring-emerald-300/70',
    },
};

const SEMUA = {
    bar: 'from-blue-500 to-indigo-600',
    soft: 'bg-blue-50 text-blue-600',
    ring: 'ring-blue-300/70',
};

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const delay = (ms) => ({ animationDelay: `${ms}ms` });

// Bagi Pimpinan, "menunggu konfirmasi pimpinan" = menunggu dirinya sendiri.
const labelStatus = (kode, isPimpinan) => {
    if (isPimpinan && kode === 'menunggu_verifikasi') return 'Menunggu Verifikasi';
    return STATUS[kode]?.label ?? kode;
};

const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return tanggal;

    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const formatTanggalWaktu = (tanggal) => {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return tanggal;

    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const StatusBadge = ({ status, isPimpinan }) => {
    const config = STATUS[status] ?? {
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold ${config.className}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {labelStatus(status, isPimpinan) ?? 'Tidak diketahui'}
        </span>
    );
};

export default function Index({
    rrfs = {},
    filters = {},
    ringkasan = {},
    statusOptions = [],
    role = null,
}) {
    const isPimpinan = role === 'pimpinan';
    const isAdmin = role === 'admin';

    const { flash = {} } = usePage().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const statusAktif = filters.status ?? '';

    /* ---------- EXPORT EXCEL (1 RRF) ---------- */
    const urlExportRrf = (id) => `/mtc/rrf/${id}/export`;

    // Kirim filter ke server (parameter kosong tidak ikut dikirim)
    const kirim = (s, st) => {
        const params = {};
        if (s) params.search = s;
        if (st) params.status = st;

        router.get('/mtc/rrf', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Pencarian otomatis 0,4 detik setelah selesai mengetik
    const pertama = useRef(true);

    useEffect(() => {
        if (pertama.current) {
            pertama.current = false;
            return undefined;
        }

        const timer = setTimeout(() => kirim(search.trim(), statusAktif), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const cariSekarang = (e) => {
        e.preventDefault();
        kirim(search.trim(), statusAktif);
    };

    const pilihKartu = (kode) => kirim(search.trim(), kode);

    const bukaHalaman = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const totalSemua = statusOptions.reduce((a, k) => a + Number(ringkasan[k] ?? 0), 0);
    const menunggu = Number(ringkasan.menunggu_verifikasi ?? 0);

    const daftarStatus = isAdmin
        ? ['draft', 'menunggu_verifikasi', 'revisi', 'terverifikasi']
        : ['menunggu_verifikasi', 'terverifikasi'];

    const kartu = [
        { kode: '', label: 'Semua RRF', jumlah: totalSemua, Ikon: Layers, tone: SEMUA },
        ...daftarStatus.map((k) => ({
            kode: k,
            label: labelStatus(k, isPimpinan),
            jumlah: Number(ringkasan[k] ?? 0),
            Ikon: STATUS[k]?.icon ?? ClipboardList,
            tone: STATUS[k] ?? SEMUA,
        })),
    ];

    const judul = isPimpinan ? 'Verifikasi RRF Maintenance' : 'Daftar RRF Maintenance';
    const deskripsi = isPimpinan
        ? 'Periksa hasil penanganan Maintenance, lalu verifikasi atau kembalikan untuk revisi.'
        : 'Daftar permintaan perbaikan yang dikelola oleh Maintenance.';

    const gridKartu = isPimpinan ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-5';

    const kolom = ['No.', 'Nomor RRF', 'Data QMOS', 'Mesin', 'Permasalahan', 'Jadwal Service', 'Tanggal Dibuat', 'Status', 'Aksi'];

    return (
        <ProduksiLayout>
            <Head title={judul} />

            <div className="space-y-4 pb-2">
                {/* HEADER HALAMAN */}
                <section className={`rrf-enter relative overflow-hidden px-4 py-4 sm:px-5 ${card}`}>
                    <div className="rrf-shimmer absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 via-cyan-400 to-blue-500" />

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
                                    isPimpinan
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                                }`}
                            >
                                {isPimpinan ? <ShieldCheck className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-lg font-bold tracking-tight text-slate-900">{judul}</h1>
                                <p className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">{deskripsi}</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <Link
                                href="/mtc/rrf/repair-mtc"
                                className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                            >
                                <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                <Wrench className="relative h-4 w-4" />
                                <span className="relative">Data Repair QMOS</span>
                            </Link>
                        )}
                    </div>
                </section>

                {/* FLASH */}
                {flash.success && (
                    <div className="rrf-slide-down relative flex items-start gap-3 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-4 pl-5 text-emerald-800 shadow-sm">
                        <span className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-semibold leading-relaxed">{flash.success}</p>
                    </div>
                )}

                {flash.error && (
                    <div className="rrf-slide-down relative flex items-start gap-3 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 p-4 pl-5 text-rose-800 shadow-sm">
                        <span className="absolute inset-y-0 left-0 w-1 bg-rose-500" />
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-semibold leading-relaxed">{flash.error}</p>
                    </div>
                )}

                {/* BANNER PIMPINAN */}
                {isPimpinan && menunggu > 0 && (
                    <div className="rrf-slide-down relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5 shadow-sm">
                        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />

                        <div className="flex items-center gap-3 pl-1">
                            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
                                </span>
                            </span>

                            <div>
                                <p className="text-sm font-bold text-amber-900">Ada RRF menunggu verifikasi Anda</p>
                                <p className="mt-0.5 text-xs text-amber-800/80">{menunggu} RRF sudah dikirim Maintenance.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => pilihKartu('menunggu_verifikasi')}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            Lihat antrean
                        </button>
                    </div>
                )}

                {/* KARTU RINGKASAN = FILTER */}
                <div className={`grid gap-3 ${gridKartu}`}>
                    {kartu.map(({ kode, label, jumlah, Ikon, tone }, index) => {
                        const aktif = statusAktif === kode;

                        return (
                            <button
                                key={kode || 'semua'}
                                type="button"
                                onClick={() => pilihKartu(kode)}
                                title={`Tampilkan: ${label}`}
                                style={delay(index * 70)}
                                className={`rrf-enter group relative cursor-pointer overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card} ${
                                    aktif ? `ring-2 ${tone.ring}` : ''
                                }`}
                            >
                                <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${tone.bar}`} />

                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium leading-tight text-slate-500">{label}</p>
                                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                                            {Number(jumlah).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <span
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${tone.soft}`}
                                    >
                                        <Ikon className="h-5 w-5" />
                                    </span>
                                </div>

                                <div className="mt-3 flex h-4 items-center">
                                    {aktif ? (
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                            Filter aktif
                                        </span>
                                    ) : (
                                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* TABEL */}
                <section style={delay(280)} className={`rrf-enter overflow-hidden ${card}`}>
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold tracking-tight text-slate-900">
                                    {isPimpinan ? 'Verifikasi & riwayat RRF' : 'Data RRF'}
                                </h2>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                    {Number(rrfs.total ?? 0).toLocaleString('id-ID')} data
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                {isPimpinan
                                    ? 'RRF yang menunggu verifikasi tampil paling atas.'
                                    : 'Pantau proses permintaan perbaikan Maintenance.'}
                            </p>
                        </div>

                        <form onSubmit={cariSekarang} className="w-full sm:w-auto">
                            <div className="relative sm:min-w-[300px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nomor RRF, mesin..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        title="Hapus pencarian"
                                        aria-label="Hapus pencarian"
                                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="rrf-scroll overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr className="bg-[#0b1a4d]">
                                    {kolom.map((k) => (
                                        <th
                                            key={k}
                                            className={`whitespace-nowrap border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3.5 text-xs font-semibold text-white/90 first:pl-5 last:border-r-0 last:pr-5 ${
                                                k === 'Aksi' ? 'text-center' : 'text-left'
                                            }`}
                                        >
                                            {k}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {!rrfs.data?.length ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <ClipboardList className="h-7 w-7" />
                                                </div>
                                                <p className="font-semibold text-slate-700">Belum ada data RRF</p>
                                                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
                                                    {isPimpinan
                                                        ? 'Belum ada RRF yang dikirim Maintenance untuk diverifikasi.'
                                                        : 'RRF yang dibuat dari data Repair QMOS akan tampil di sini.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rrfs.data.map((rrf, index) => {
                                        const repair = rrf.mtc_repair ?? {};
                                        const perluVerifikasi = isPimpinan && rrf.status === 'menunggu_verifikasi';
                                        const bisaExport = rrf.status === 'terverifikasi';

                                        return (
                                            <tr
                                                key={rrf.id}
                                                className={`transition-colors duration-200 hover:bg-blue-50/50 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                }`}
                                            >
                                                <td className="border-b border-slate-100 px-4 py-3.5 pl-5 text-xs text-slate-400">
                                                    {(rrfs.from ?? 1) + index}
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5">
                                                    <span className="whitespace-nowrap rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                                                        {rrf.rrf_no ?? `RRF-${rrf.id}`}
                                                    </span>
                                                    <p className="mt-1.5 text-[11px] text-slate-400">Rev. {rrf.rev ?? '0'}</p>
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5">
                                                    <p className="whitespace-nowrap text-xs font-semibold text-slate-700">
                                                        QMOS-{repair.qmos_repair_id ?? '-'}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-slate-400">{repair.location ?? '-'}</p>
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5">
                                                    <p className="text-xs font-semibold text-slate-800">{repair.machine ?? '-'}</p>
                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        {repair.machine_no ?? repair.asset_no ?? '-'}
                                                    </p>
                                                </td>

                                                <td className="max-w-[220px] border-b border-slate-100 px-4 py-3.5 text-xs leading-4 text-slate-600">
                                                    <p className="line-clamp-2">{rrf.problem ?? repair.problem ?? '-'}</p>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                                        <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                                                        {formatTanggalWaktu(rrf.serv_schedule_at)}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                    {formatTanggal(rrf.created_at)}
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5">
                                                    <StatusBadge status={rrf.status} isPimpinan={isPimpinan} />
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5 pr-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/mtc/rrf/${rrf.id}`}
                                                            title={perluVerifikasi ? 'Verifikasi RRF' : 'Detail RRF'}
                                                            aria-label={perluVerifikasi ? 'Verifikasi RRF' : 'Detail RRF'}
                                                            className={
                                                                perluVerifikasi
                                                                    ? 'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 text-[11px] font-semibold text-white shadow-sm shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
                                                                    : 'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0'
                                                            }
                                                        >
                                                            {perluVerifikasi ? (
                                                                <>
                                                                    <ShieldCheck className="h-3.5 w-3.5" /> Verifikasi
                                                                </>
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Link>

                                                        {bisaExport && (
                                                            <a
                                                                href={urlExportRrf(rrf.id)}
                                                                title="Export Excel"
                                                                aria-label="Export Excel"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
                                                            >
                                                                <FileSpreadsheet className="h-4 w-4" />
                                                            </a>
                                                        )}
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
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-xs text-slate-500">
                            Menampilkan{' '}
                            <span className="font-semibold text-slate-700">
                                {rrfs.from ?? 0}–{rrfs.to ?? 0}
                            </span>{' '}
                            dari <span className="font-semibold text-slate-700">{Number(rrfs.total ?? 0).toLocaleString('id-ID')}</span> data
                        </p>

                        <div className="flex flex-wrap items-center gap-1">
                            {rrfs.links?.map((link, index) => {
                                const isPrev = index === 0;
                                const isNext = index === rrfs.links.length - 1;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => bukaHalaman(link.url)}
                                        aria-label={isPrev ? 'Halaman sebelumnya' : isNext ? 'Halaman selanjutnya' : `Halaman ${link.label}`}
                                        className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
                                            link.active
                                                ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30'
                                                : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                        }`}
                                    >
                                        {isPrev ? (
                                            <ChevronLeft className="h-4 w-4" />
                                        ) : isNext ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </ProduksiLayout>
    );
}
