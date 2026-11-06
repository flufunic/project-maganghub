import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import ProduksiLayout, { StatusBadge } from '../../Components/ProduksiLayout';

const aksiBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition';

const aksiEdit = `${aksiBtn} cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100`;
const aksiHapus = `${aksiBtn} cursor-pointer border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100`;
const aksiMati = `${aksiBtn} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300`;

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
                                yang sudah dihapus tidak akan muncul lagi di daftar.
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

export default function Index({
    rrfs,
    filters,
    statuses,
    jumlahMenunggu = 0,
    jumlahDitolak = 0,
}) {
    const [hapusTarget, setHapusTarget] = useState(null);
    const [menghapus, setMenghapus] = useState(false);
    const [errorHapus, setErrorHapus] = useState('');

    const pilihStatus = (status) => {
        router.get(
            '/rrf',
            status ? { status } : {},
            { preserveState: true, replace: true }
        );
    };

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

        router.delete(`/rrf/${hapusTarget.id}`, {
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

    return (
        <ProduksiLayout>
            <Head title="Daftar RRF" />

            {/* HEADER HALAMAN */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600" />

                        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                            Daftar RRF
                        </h1>
                    </div>

                    <p className="mt-1 pl-3 text-xs text-blue-100/70 sm:text-sm">
                        Kelola dan pantau seluruh Repair Request Form.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* FILTER STATUS */}
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => pilihStatus(e.target.value)}
                        className="h-10 cursor-pointer rounded-xl border border-white/30 bg-white/95 px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20"
                    >
                        <option value="">Semua status</option>

                        {Object.entries(statuses).map(([kode, label]) => (
                            <option key={kode} value={kode}>
                                {label}
                            </option>
                        ))}
                    </select>

                    {/* BUTTON BUAT RRF */}
                    <Link
                        href="/rrf/create"
                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700 hover:shadow-xl"
                    >
                        <span className="text-lg leading-none">＋</span>
                        Buat RRF
                    </Link>
                </div>
            </div>

            {/* TABLE CARD */}
            <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.30)] backdrop-blur-2xl">
                {/* CARD HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/60 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Data Repair Request Form
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                            Daftar permintaan perbaikan mesin
                        </p>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {rrfs.total} Data
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1150px] border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr className="bg-[#0a1a4d] text-white">
                                {[
                                    'No. RRF',
                                    'Tanggal',
                                    'Divisi',
                                    'Mesin',
                                    'Class',
                                    'Jenis',
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
                            {rrfs.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                                            ▤
                                        </div>

                                        <p className="mt-3 text-sm font-bold text-slate-600">
                                            Belum ada RRF
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Data permintaan belum tersedia.
                                        </p>
                                    </td>
                                </tr>
                            )}

                            {rrfs.data.map((r, index) => (
                                <tr
                                    key={r.id}
                                    className={`transition-colors duration-150 hover:bg-blue-50/70 ${
                                        index % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-slate-50/50'
                                    }`}
                                >
                                    <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5">
                                        <Link
                                            href={`/rrf/${r.id}`}
                                            className="font-bold text-blue-700 transition hover:text-indigo-700 hover:underline"
                                        >
                                            {r.rrf_no}
                                        </Link>
                                    </td>

                                    <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5 text-xs font-medium text-slate-600">
                                        {r.tanggal ? String(r.tanggal).split(' ')[0] : '-'}
                                    </td>

                                    <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs font-semibold text-slate-700">
                                        {r.divisi}
                                    </td>

                                    <td className="border-b border-r border-slate-100 px-4 py-3.5">
                                        <p className="text-xs font-bold text-slate-800">
                                            {r.mesin}
                                        </p>

                                        <span className="mt-1 block text-[10px] text-slate-400">
                                            {r.lokasi}
                                        </span>
                                    </td>

                                    <td className="border-b border-r border-slate-100 px-4 py-3.5">
                                        <span className="inline-flex rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                            {r.kelas}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5 text-xs font-medium capitalize text-slate-600">
                                        {r.jenis_permintaan}
                                    </td>

                                    <td className="border-b border-r border-slate-100 px-4 py-3.5 text-xs font-medium text-slate-600">
                                        {r.pembuat}
                                    </td>

                                    <td className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-3.5">
                                        <StatusBadge
                                            status={r.status}
                                            label={r.status_label}
                                        />
                                    </td>

                                    {/* AKSI: edit & hapus */}
                                    <td className="border-b border-slate-100 px-4 py-3.5">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {r.bisa_edit ? (
                                                <Link
                                                    href={`/rrf/${r.id}/edit`}
                                                    title="Edit RRF"
                                                    className={aksiEdit}
                                                >
                                                    <Pencil
                                                        className="h-4 w-4"
                                                        strokeWidth={1.75}
                                                    />
                                                </Link>
                                            ) : (
                                                <span title={r.alasan_edit ?? ''}>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        aria-label="Edit tidak tersedia"
                                                        className={aksiMati}
                                                    >
                                                        <Pencil
                                                            className="h-4 w-4"
                                                            strokeWidth={1.75}
                                                        />
                                                    </button>
                                                </span>
                                            )}

                                            {r.bisa_hapus ? (
                                                <button
                                                    type="button"
                                                    title="Hapus RRF"
                                                    onClick={() => bukaHapus(r)}
                                                    className={aksiHapus}
                                                >
                                                    <Trash2
                                                        className="h-4 w-4"
                                                        strokeWidth={1.75}
                                                    />
                                                </button>
                                            ) : (
                                                <span title={r.alasan_hapus ?? ''}>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        aria-label="Hapus tidak tersedia"
                                                        className={aksiMati}
                                                    >
                                                        <Trash2
                                                            className="h-4 w-4"
                                                            strokeWidth={1.75}
                                                        />
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER TABLE */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                    <span className="text-[11px] font-medium text-slate-400">
                        Menampilkan {rrfs.data.length} data pada halaman ini
                    </span>

                    {rrfs.last_page > 1 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-500">
                                Halaman {rrfs.current_page} dari {rrfs.last_page}
                            </span>

                            <div className="flex gap-2">
                                {rrfs.prev_page_url && (
                                    <Link
                                        href={rrfs.prev_page_url}
                                        className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        ← Sebelumnya
                                    </Link>
                                )}

                                {rrfs.next_page_url && (
                                    <Link
                                        href={rrfs.next_page_url}
                                        className="inline-flex cursor-pointer items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
                                    >
                                        Berikutnya →
                                    </Link>
                                )}
                            </div>
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