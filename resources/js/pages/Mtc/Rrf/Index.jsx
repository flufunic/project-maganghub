import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Eye,
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
 *  terverifikasi       = Pimpinan sudah menyetujui (selesai).
 */
const STATUS = {
    draft: {
        label: 'Menunggu Diisi',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
        icon: FileText,
        kartu: 'from-sky-500 to-blue-600',
    },
    menunggu_verifikasi: {
        label: 'Menunggu Konfirmasi Pimpinan',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: Clock3,
        kartu: 'from-amber-400 to-orange-500',
    },
    revisi: {
        label: 'Perlu Revisi',
        className: 'border-red-200 bg-red-50 text-red-700',
        icon: RotateCcw,
        kartu: 'from-red-500 to-rose-600',
    },
    terverifikasi: {
        label: 'Completed',
        className: 'border-green-200 bg-green-50 text-green-700',
        icon: CheckCircle2,
        kartu: 'from-green-500 to-green-600',
    },
};

// Bagi Pimpinan, "menunggu konfirmasi pimpinan" = menunggu dirinya sendiri.
const labelStatus = (kode, isPimpinan) => {
    if (isPimpinan && kode === 'menunggu_verifikasi') {
        return 'Menunggu Verifikasi';
    }

    return STATUS[kode]?.label ?? kode;
};

const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return tanggal;

    return new Intl.DateTimeFormat('id-ID', {
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
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold ${config.className}`}
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

    const [search, setSearch] = useState(filters.search ?? '');

    const statusAktif = filters.status ?? '';

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

    // Pencarian otomatis 0,4 detik setelah selesai mengetik (tanpa tombol)
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
        [
            '',
            'Semua RRF',
            totalSemua,
            Layers,
            'from-blue-500 to-indigo-600',
        ],
        ...daftarStatus.map((k) => [
            k,
            labelStatus(k, isPimpinan),
            Number(ringkasan[k] ?? 0),
            STATUS[k]?.icon ?? ClipboardList,
            STATUS[k]?.kartu ?? 'from-slate-500 to-slate-700',
        ]),
    ];

    const judul = isPimpinan ? 'Verifikasi RRF Maintenance' : 'Daftar RRF Maintenance';

    const deskripsi = isPimpinan
        ? 'Periksa hasil penanganan Maintenance lalu verifikasi atau kembalikan untuk revisi.'
        : 'Daftar permintaan perbaikan yang dikelola oleh Maintenance.';

    const gridKartu = isPimpinan ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-5';

    return (
        <ProduksiLayout>
            <Head title={judul} />

            <div className="space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${
                                isPimpinan ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-indigo-700'
                            }`}
                        >
                            {isPimpinan ? <ShieldCheck className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                        </div>

                        <div>
                            <h1 className="text-lg font-extrabold text-white">{judul}</h1>
                            <p className="text-xs text-blue-100/70">{deskripsi}</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <Link
                            href="/mtc/rrf/repair-mtc"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Wrench className="h-4 w-4" />
                            Data Repair QMOS
                        </Link>
                    )}
                </div>

                {/* BANNER PIMPINAN */}
                {isPimpinan && menunggu > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <ShieldCheck className="h-5 w-5" />
                            </span>

                            <div>
                                <p className="text-sm font-bold text-amber-900">Ada RRF menunggu verifikasi Anda</p>
                                <p className="mt-0.5 text-xs text-amber-800/80">
                                    {menunggu} RRF sudah dikirim Maintenance.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => pilihKartu('menunggu_verifikasi')}
                            className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
                        >
                            Lihat antrean
                        </button>
                    </div>
                )}

                {/* KARTU RINGKASAN = FILTER (klik kartu untuk memfilter) */}
                <div className={`grid gap-3 ${gridKartu}`}>
                    {kartu.map(([kode, label, jumlah, Ikon, warna]) => {
                        const aktif = statusAktif === kode;

                        return (
                            <button
                                key={kode || 'semua'}
                                type="button"
                                onClick={() => pilihKartu(kode)}
                                title={`Tampilkan: ${label}`}
                                className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-white/40 bg-white/[0.95] px-3 pb-2.5 pt-3 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
                                    aktif ? 'ring-2 ring-blue-400' : ''
                                }`}
                            >
                                <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${warna}`} />

                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow ${warna}`}
                                >
                                    <Ikon className="h-4 w-4" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-xl font-black leading-none text-slate-800">{jumlah}</p>
                                    <p className="mt-1 text-[11px] font-bold leading-tight text-slate-600">{label}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* TABEL */}
                <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/[0.95] shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/70 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-900">
                                {isPimpinan ? 'Verifikasi & Riwayat RRF' : 'Data RRF'}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {isPimpinan
                                    ? 'RRF yang menunggu verifikasi tampil paling atas.'
                                    : 'Pantau proses permintaan perbaikan Maintenance.'}
                            </p>
                        </div>

                        <form onSubmit={cariSekarang} className="w-full lg:w-auto">
                            <div className="relative min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nomor RRF, mesin..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        title="Hapus pencarian"
                                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr className="bg-[#0a1a4d] text-white">
                                    {[
                                        'No.',
                                        'Nomor RRF',
                                        'Data QMOS',
                                        'Mesin',
                                        'Permasalahan',
                                        'Jadwal Service',
                                        'Tanggal Dibuat',
                                        'Status',
                                        'Aksi',
                                    ].map((k) => (
                                        <th
                                            key={k}
                                            className="whitespace-nowrap border-r border-white/10 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider last:border-r-0"
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
                                            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                                            <p className="mt-3 text-sm font-bold text-slate-600">Belum ada data RRF</p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {isPimpinan
                                                    ? 'Belum ada RRF yang dikirim Maintenance untuk diverifikasi.'
                                                    : 'RRF yang dibuat dari data Repair QMOS akan tampil di sini.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    rrfs.data.map((rrf, index) => {
                                        const repair = rrf.mtc_repair ?? {};
                                        const perluVerifikasi = isPimpinan && rrf.status === 'menunggu_verifikasi';

                                        return (
                                            <tr
                                                key={rrf.id}
                                                className={`transition hover:bg-blue-50/70 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                }`}
                                            >
                                                <td className="border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-500">
                                                    {(rrfs.from ?? 1) + index}
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <p className="whitespace-nowrap text-xs font-extrabold text-blue-700">
                                                        {rrf.rrf_no ?? `RRF-${rrf.id}`}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-slate-400">Rev. {rrf.rev ?? '0'}</p>
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <p className="whitespace-nowrap text-xs font-bold text-slate-700">
                                                        QMOS-{repair.qmos_repair_id ?? '-'}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-slate-400">{repair.location ?? '-'}</p>
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <p className="text-xs font-bold text-slate-800">{repair.machine ?? '-'}</p>
                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        {repair.machine_no ?? repair.asset_no ?? '-'}
                                                    </p>
                                                </td>

                                                <td className="max-w-[220px] border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-600">
                                                    <p className="line-clamp-2">{rrf.problem ?? repair.problem ?? '-'}</p>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                                                        {formatTanggalWaktu(rrf.serv_schedule_at)}
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-600">
                                                    {formatTanggal(rrf.created_at)}
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <StatusBadge status={rrf.status} isPimpinan={isPimpinan} />
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <Link
                                                            href={`/mtc/rrf/${rrf.id}`}
                                                            className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold text-white transition ${
                                                                perluVerifikasi
                                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                            }`}
                                                        >
                                                            {perluVerifikasi ? (
                                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <Eye className="h-3.5 w-3.5" />
                                                            )}
                                                            {perluVerifikasi ? 'Verifikasi' : 'Detail RRF'}
                                                        </Link>
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
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                        <p className="text-xs text-slate-500">
                            Menampilkan {rrfs.from ?? 0} - {rrfs.to ?? 0} dari {rrfs.total ?? 0} data
                        </p>

                        <div className="flex flex-wrap gap-1">
                            {rrfs.links?.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => bukaHalaman(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`min-w-9 rounded-lg border px-3 py-2 text-xs font-semibold ${
                                        link.active
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-blue-50'
                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProduksiLayout>
    );
}
