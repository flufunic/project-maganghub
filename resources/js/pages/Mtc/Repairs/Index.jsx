import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    RefreshCw,
    Search,
    ClipboardList,
    Clock3,
    Wrench,
    Eye,
    X,
    FilePlus2,
    ExternalLink,
    CheckCircle2,
    RotateCcw,
    ShieldCheck,
    FileSpreadsheet,
} from 'lucide-react';

import ProduksiLayout from '../../../Components/ProduksiLayout';

// Status RRF lokal -> tampilan badge
const STATUS_RRF = {
    draft: ['Menunggu Diisi', 'border-sky-200 bg-sky-50 text-sky-700'],
    revisi: ['Perlu Revisi', 'border-red-200 bg-red-50 text-red-700'],
    menunggu_verifikasi: ['Menunggu Verifikasi', 'border-amber-200 bg-amber-50 text-amber-700'],
    terverifikasi: ['Completed', 'border-green-200 bg-green-50 text-green-700'],
};

function ConfirmationModal({
    open,
    title,
    description,
    confirmText = 'Ya, lanjutkan',
    cancelText = 'Batal',
    tone = 'blue',
    loading = false,
    icon: Icon = AlertCircle,
    onConfirm,
    onCancel,
}) {
    if (!open || typeof document === 'undefined') return null;

    const toneStyle = {
        blue: {
            icon: 'bg-blue-100 text-blue-700',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
        green: {
            icon: 'bg-emerald-100 text-emerald-700',
            button: 'bg-emerald-600 hover:bg-emerald-700',
        },
        red: {
            icon: 'bg-red-100 text-red-700',
            button: 'bg-red-600 hover:bg-red-700',
        },
    }[tone] ?? {
        icon: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/25 p-3"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onCancel();
            }}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="px-5 pb-4 pt-5">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${toneStyle.icon}`}>
                        <Icon className="h-6 w-6" />
                    </div>

                    <h3 id="confirmation-title" className="mt-3 text-center text-base font-extrabold text-slate-800">
                        {title}
                    </h3>

                    {description ? (
                        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">{description}</p>
                    ) : null}
                </div>

                <div className="flex justify-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${toneStyle.button}`}
                    >
                        {loading ? 'Memproses...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function Index({
    repairs = {},
    filters = {},
    canCreateRrf = false,
    role = null,
    ringkasanRrf = {},
}) {
    const isPimpinan = role === 'pimpinan';

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusRrf, setStatusRrf] = useState(filters.status_rrf ?? '');
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [confirmRepair, setConfirmRepair] = useState(null);
    const [creatingRrf, setCreatingRrf] = useState(false);

    const { flash = {}, errors = {} } = usePage().props;

    /* ---------- EXPORT EXCEL ---------- */

    // Export 1 RRF dalam bentuk Repair Request Form
    const urlExportRrf = (rrfId) => `/mtc/rrf/${rrfId}/export`;

    const kirimFilter = (s, st) =>
        router.get(
            '/mtc/rrf/repair-mtc',
            { search: s, status_rrf: st },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    const pilihKartu = (status) => {
        setStatusRrf(status);
        kirimFilter(search, status);
    };

    const cariData = (e) => {
        e.preventDefault();
        kirimFilter(search, statusRrf);
    };

    const sinkronisasi = () => {
        if (loading) return;

        router.post(
            '/mtc/rrf/repair-mtc/sync',
            {},
            {
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            }
        );
    };

    const formatStatus = (status) => {
        if (!status) return '-';

        return String(status)
            .replaceAll('_', ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2');
    };

    // Status yang ditampilkan: RRF lokal bila ada, kalau tidak status QMOS
    const tampilStatus = (repair) => {
        if (repair.rrf_local_status && STATUS_RRF[repair.rrf_local_status]) {
            return STATUS_RRF[repair.rrf_local_status];
        }

        const selesai = repair.status?.toLowerCase() === 'completed';

        return [
            formatStatus(repair.status),
            selesai
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700',
        ];
    };

    const buatRrf = (repair) => {
        if (repair.has_rrf || !canCreateRrf || creatingRrf) return;
        setConfirmRepair(repair);
    };

    const konfirmasiBuatRrf = () => {
        if (!confirmRepair || creatingRrf) return;

        router.post(
            `/mtc/rrf/repair-mtc/${confirmRepair.id}/buat-rrf`,
            {},
            {
                preserveScroll: true,
                onStart: () => setCreatingRrf(true),
                onFinish: () => {
                    setCreatingRrf(false);
                    setConfirmRepair(null);
                },
            }
        );
    };

    const bukaHalaman = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    // Kartu ringkasan: Admin 5 kartu, Pimpinan 3 kartu
    const kartuRingkasan = isPimpinan
        ? [
              { kode: '', judul: 'Semua', jumlah: ringkasanRrf.semua ?? 0, icon: ClipboardList, warnaIcon: 'bg-blue-100 text-blue-700', warnaAngka: 'text-slate-800' },
              { kode: 'menunggu_verifikasi', judul: 'Menunggu Verifikasi', jumlah: ringkasanRrf.menungguVerifikasi ?? 0, icon: ShieldCheck, warnaIcon: 'bg-amber-100 text-amber-700', warnaAngka: 'text-slate-800' },
              { kode: 'terverifikasi', judul: 'Completed', jumlah: ringkasanRrf.completed ?? 0, icon: CheckCircle2, warnaIcon: 'bg-green-100 text-green-700', warnaAngka: 'text-green-700' },
          ]
        : [
              { kode: '', judul: 'Semua Data', jumlah: ringkasanRrf.semua ?? 0, icon: ClipboardList, warnaIcon: 'bg-blue-100 text-blue-700', warnaAngka: 'text-slate-800' },
              { kode: 'draft', judul: 'Menunggu Lengkapi RRF', jumlah: ringkasanRrf.menungguDiisi ?? 0, icon: Clock3, warnaIcon: 'bg-sky-100 text-sky-700', warnaAngka: 'text-slate-800' },
              { kode: 'revisi', judul: 'Perlu Revisi', jumlah: ringkasanRrf.revisi ?? 0, icon: RotateCcw, warnaIcon: 'bg-red-100 text-red-700', warnaAngka: 'text-red-700' },
              { kode: 'menunggu_verifikasi', judul: 'Menunggu Verifikasi', jumlah: ringkasanRrf.menungguVerifikasi ?? 0, icon: Clock3, warnaIcon: 'bg-amber-100 text-amber-700', warnaAngka: 'text-slate-800' },
              { kode: 'terverifikasi', judul: 'Completed', jumlah: ringkasanRrf.completed ?? 0, icon: CheckCircle2, warnaIcon: 'bg-green-100 text-green-700', warnaAngka: 'text-green-700' },
          ];

    const gridKartu = isPimpinan
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-5';

    return (
        <ProduksiLayout>
            <Head title={isPimpinan ? 'Verifikasi Repair QMOS' : 'Data Repair QMOS'} />

            <div className="space-y-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${
                                isPimpinan ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-indigo-700'
                            }`}
                        >
                            {isPimpinan ? <ShieldCheck className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                        </div>

                        <div>
                            <h1 className="text-lg font-extrabold text-white">
                                {isPimpinan ? 'Verifikasi Repair QMOS' : 'Data Repair QMOS'}
                            </h1>

                            <p className="text-xs text-blue-100/70">
                                {isPimpinan
                                    ? 'Repair yang menunggu verifikasi Anda dan yang sudah selesai.'
                                    : 'Data permintaan perbaikan dari integrasi API QMOS.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {isPimpinan && (
                            <Link
                                href="/mtc/rrf"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
                            >
                                <ClipboardList className="h-4 w-4" />
                                Daftar RRF
                            </Link>
                        )}

                        {canCreateRrf && (
                            <button
                                type="button"
                                onClick={sinkronisasi}
                                disabled={loading}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Sinkronisasi...' : 'Sinkronkan API'}
                            </button>
                        )}
                    </div>
                </div>

                {/* FLASH */}
                {flash.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {flash.error}
                    </div>
                )}

                {errors.repair && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {errors.repair}
                    </div>
                )}

                {/* KARTU RINGKASAN = FILTER */}
                <div className={`grid gap-3 ${gridKartu}`}>
                    {kartuRingkasan.map((kartu) => {
                        const Icon = kartu.icon;
                        const aktif = statusRrf === kartu.kode;

                        return (
                            <button
                                key={kartu.judul}
                                type="button"
                                onClick={() => pilihKartu(kartu.kode)}
                                className={`w-full cursor-pointer rounded-2xl border bg-white/[0.95] p-4 text-left shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                                    aktif ? 'border-blue-500 ring-2 ring-blue-400' : 'border-white/40 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kartu.warnaIcon}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-slate-500">{kartu.judul}</p>
                                            <p className={`text-2xl font-black ${kartu.warnaAngka}`}>{kartu.jumlah}</p>
                                        </div>
                                    </div>

                                    {aktif && (
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-extrabold text-blue-700">
                                            AKTIF
                                        </span>
                                    )}
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
                                {isPimpinan ? 'Antrean Verifikasi' : 'Antrean Repair dari QMOS'}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {isPimpinan
                                    ? 'Yang menunggu verifikasi tampil paling atas.'
                                    : 'Data yang telah disinkronkan ke database Maintenance.'}
                            </p>
                        </div>

                        <form onSubmit={cariData} className="flex w-full max-w-sm gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari mesin, lokasi, divisi..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <button
                                type="submit"
                                className="cursor-pointer rounded-xl bg-slate-800 px-4 text-xs font-bold text-white transition hover:bg-slate-700"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr className="bg-[#0a1a4d] text-white">
                                    {['ID QMOS', 'Tanggal', 'Divisi', 'Lokasi', 'Mesin', 'Class', 'Permasalahan', 'Jadwal', 'Status', 'Aksi'].map((judul) => (
                                        <th
                                            key={judul}
                                            className="whitespace-nowrap border-r border-white/10 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider last:border-r-0"
                                        >
                                            {judul}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {!repairs.data?.length ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-16 text-center">
                                            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                                            <p className="mt-3 text-sm font-bold text-slate-600">Belum ada data</p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {statusRrf
                                                    ? 'Tidak ada data dengan status yang dipilih.'
                                                    : isPimpinan
                                                    ? 'Belum ada RRF yang dikirim Maintenance untuk diverifikasi.'
                                                    : canCreateRrf
                                                    ? 'Klik Sinkronkan API untuk mengambil data QMOS.'
                                                    : 'Belum terdapat data repair yang tersimpan.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    repairs.data.map((repair, index) => {
                                        const [labelStatus, kelasStatus] = tampilStatus(repair);
                                        const perluVerifikasi =
                                            isPimpinan && repair.rrf_local_status === 'menunggu_verifikasi';
                                        const bisaExport =
                                            repair.has_rrf && repair.rrf_local_status === 'terverifikasi';

                                        return (
                                            <tr
                                                key={repair.id}
                                                className={`transition hover:bg-blue-50/70 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                }`}
                                            >
                                                <td className="border-b border-r border-slate-100 px-4 py-3 text-xs font-bold text-blue-700">
                                                    QMOS-{repair.qmos_repair_id}
                                                </td>

                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-600">
                                                    {repair.repair_date ?? '-'}
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
                                                    {repair.division_pelapor ?? '-'}
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-600">
                                                    {repair.location ?? '-'}
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <p className="text-xs font-bold text-slate-800">{repair.machine ?? '-'}</p>
                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        {repair.machine_no ?? repair.asset_no ?? '-'}
                                                    </p>
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                                        {repair.machine_class ?? '-'}
                                                    </span>
                                                </td>

                                                <td className="max-w-[200px] border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-600">
                                                    <p className="line-clamp-2">{repair.problem ?? '-'}</p>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3 text-xs text-slate-600">
                                                    {repair.req_start_at ?? '-'}
                                                </td>

                                                {/* STATUS: RRF lokal bila ada */}
                                                <td className="border-b border-r border-slate-100 px-4 py-3">
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${kelasStatus}`}
                                                    >
                                                        {labelStatus}
                                                    </span>
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelected(repair)}
                                                            title="Detail"
                                                            aria-label="Detail"
                                                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition bg-blue-600 text-white hover:bg-blue-700"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {repair.has_rrf ? (
                                                            <Link
                                                                href={`/mtc/rrf/${repair.rrf_id}`}
                                                                title={perluVerifikasi ? 'Verifikasi RRF' : 'Lihat RRF'}
                                                                aria-label={perluVerifikasi ? 'Verifikasi RRF' : 'Lihat RRF'}
                                                                className={
                                                                    perluVerifikasi
                                                                        ? 'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 text-[11px] font-bold text-white transition hover:from-amber-600 hover:to-orange-700'
                                                                        : 'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition bg-emerald-600 text-white hover:bg-emerald-700'
                                                                }
                                                            >
                                                                {perluVerifikasi ? (
                                                                    <>
                                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                                        Verifikasi
                                                                    </>
                                                                ) : (
                                                                    <ExternalLink className="h-4 w-4" />
                                                                )}
                                                            </Link>
                                                        ) : canCreateRrf ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => buatRrf(repair)}
                                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-indigo-700"
                                                            >
                                                                <FilePlus2 className="h-3.5 w-3.5" />
                                                                Buat RRF
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                Belum dibuat
                                                            </span>
                                                        )}

                                                        {bisaExport && (
                                                            <a
                                                                href={urlExportRrf(repair.rrf_id)}
                                                                title="Export Excel"
                                                                aria-label="Export Excel"
                                                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                        <p className="text-xs text-slate-500">
                            Menampilkan {repairs.from ?? 0} - {repairs.to ?? 0} dari {repairs.total ?? 0} data
                        </p>

                        <div className="flex flex-wrap gap-1">
                            {repairs.links?.map((link, index) => (
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

            {/* MODAL DETAIL */}
            {selected && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="font-extrabold text-slate-900">Detail Repair QMOS</h2>
                                <p className="text-xs text-slate-500">
                                    QMOS-{selected.qmos_repair_id}
                                    {selected.rrf_no ? ` • ${selected.rrf_no}` : ''}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    ['Lokasi', selected.location],
                                    ['Mesin', selected.machine],
                                    ['Nomor Mesin', selected.machine_no],
                                    ['Asset Number', selected.asset_no],
                                    ['Divisi', selected.division_pelapor],
                                    ['Jenis Permintaan', selected.jenis_permintaan],
                                    ['Kelas Mesin', selected.machine_class],
                                    ['Tanggal Perbaikan', selected.repair_date],
                                    ['Mulai Permintaan', selected.req_start_at],
                                    ['Selesai Permintaan', selected.req_finish_at],
                                    ['Durasi (menit)', selected.req_duration_minutes],
                                    ['Pemohon', selected.requested_by],
                                    ['Pengaju', selected.submitted_by_frm],
                                    ['Supervisor', selected.supervisor],
                                    ['Teknisi MTC', selected.mtc_name],
                                    ['Shift', selected.shift_kerja],
                                    ['Judge', selected.judge],
                                    ['Status QMOS', formatStatus(selected.status)],
                                    ['Status RRF', tampilStatus(selected)[0]],
                                    ['Part', selected.part_name],
                                    ['Model Part', selected.part_model_type],
                                    ['Waktu Diperbaiki', selected.repaired_at],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                                        <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value ?? '-'}</p>
                                    </div>
                                ))}

                                {[
                                    ['Permasalahan', selected.problem],
                                    ['Aktivitas Permintaan', selected.request_activity],
                                    ['Counter Measure', selected.counter_measure],
                                    ['Deskripsi Kelas', selected.machine_class_description],
                                    ['Analisa', selected.analisa],
                                    ['Perbaikan', selected.perbaikan],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:col-span-2"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                                            {value ?? '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {['before', 'after'].map((tipe) => {
                                const fotos = (selected.photos ?? []).filter((f) => f.tipe === tipe);

                                if (!fotos.length) return null;

                                return (
                                    <div key={tipe} className="mt-5">
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                            Foto {tipe}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {fotos.map((f, i) => (
                                                <a key={i} href={f.url} target="_blank" rel="noreferrer">
                                                    <img
                                                        src={f.url}
                                                        alt={`Foto ${tipe}`}
                                                        className="h-28 w-full rounded-lg border border-slate-200 object-cover"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 px-5 py-3">
                            <div>
                                {selected.has_rrf && selected.rrf_local_status === 'terverifikasi' && (
                                    <a
                                        href={urlExportRrf(selected.rrf_id)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                                    >
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Export Excel
                                    </a>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="cursor-pointer rounded-lg bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                open={!!confirmRepair}
                title="Apakah mau buat RRF?"
                description={
                    confirmRepair
                        ? `Data QMOS-${confirmRepair.qmos_repair_id} akan dibuat menjadi Repair Request Form baru untuk dilengkapi oleh Maintenance.`
                        : ''
                }
                confirmText="Ya, Buat RRF"
                tone="blue"
                icon={FilePlus2}
                loading={creatingRrf}
                onCancel={() => setConfirmRepair(null)}
                onConfirm={konfirmasiBuatRrf}
            />
        </ProduksiLayout>
    );
}
