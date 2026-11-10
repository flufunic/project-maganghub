
import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';

import {
    ArrowLeft,
    AlertTriangle,
    X,
    Save,
    Send,
    Trash2,
    CheckCircle2,
} from 'lucide-react';

const STATUS = {
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600' },
    menunggu: { label: 'Menunggu pimpinan', cls: 'bg-amber-100 text-amber-700' },
    diperiksa: { label: 'Sedang diperiksa', cls: 'bg-blue-100 text-blue-700' },
    disetujui: { label: 'Disetujui', cls: 'bg-emerald-100 text-emerald-700' },
    ditolak: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
};

const selectClass =
    'h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500';

const thClass =
    'border border-slate-300 bg-sky-100 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-700';

const tdClass =
    'border border-slate-300 px-3 py-2 align-middle text-sm text-slate-700';

/* Textarea yang menyimpan saat kehilangan fokus */
function TeksSel({ value, onSave, disabled, rows = 3, placeholder }) {
    const [teks, setTeks] = useState(value ?? '');

    useEffect(() => {
        setTeks(value ?? '');
    }, [value]);

    return (
        <textarea
            value={teks}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setTeks(e.target.value)}
            onBlur={() => {
                if ((value ?? '') !== teks) onSave(teks);
            }}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:bg-white disabled:opacity-60"
        />
    );
}

function FotoSel({ url, itemId, jenis, disabled, label }) {
    const upload = (file) => {
        if (!file) return;

        router.post(
            `/laporan-mingguan/item/${itemId}/foto`,
            {
                jenis,
                foto: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {label && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                </span>
            )}

            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block"
                >
                    <img
                        src={url}
                        alt={label ?? 'Foto'}
                        className="h-28 w-36 rounded-xl border border-slate-200 bg-slate-100 object-cover shadow-sm transition group-hover:scale-[1.02]"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />

                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-2 py-1 text-[9px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        Lihat foto
                    </span>
                </a>
            ) : (
                <div className="flex h-28 w-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-400">
                    Belum ada foto
                </div>
            )}

            {!disabled && (
                <label className="cursor-pointer rounded-lg bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-violet-700">
                    {url ? 'Ganti Foto' : 'Upload Foto'}

                    <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => {
                            upload(e.target.files?.[0]);
                            e.target.value = '';
                        }}
                    />
                </label>
            )}
        </div>
    );
}

export default function Index({
    tahun,
    bulan,
    week,
    daftarWeek,
    namaBulan,
    rentangLabel,
    laporan,
    bagian1,
    bagian2,
    bagian3,
    revisis,
    bisaPersetujuan,
    flash,
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [modalAksi, setModalAksi] = useState(null);
    const [alasanTolak, setAlasanTolak] = useState('');
    const [prosesAksi, setProsesAksi] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const status = STATUS[laporan.status] ?? STATUS.draft;
    const terkunci = laporan.status === 'disetujui';

    // NOTIFIKASI TOAST
    useEffect(() => {
        if (!flash?.success) return;

        setShowToast(true);

        const timer = setTimeout(() => {
            setShowToast(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, [flash?.success]);

    const pindah = (next) =>
        router.get(
            '/laporan-mingguan/form',
            { bulan, tahun, week, ...next },
            { preserveScroll: true }
        );

    const simpanItem = (id, field, value) =>
        router.put(
            `/laporan-mingguan/item/${id}`,
            { [field]: value },
            { preserveScroll: true }
        );

    const post = (url, data = {}) =>
        router.post(url, data, { preserveScroll: true });

    // JALANKAN AKSI MODAL
    const jalankanAksi = () => {
        if (!modalAksi || prosesAksi) return;

        if (modalAksi.type === 'tolak' && !alasanTolak.trim()) {
            return;
        }

        setProsesAksi(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setModalAksi(null);
                setAlasanTolak('');
            },
            onFinish: () => setProsesAksi(false),
        };

        switch (modalAksi.type) {
            case 'simpan':
                router.post(
                    `/laporan-mingguan/${laporan.id}/simpan`,
                    {},
                    options
                );
                break;

            case 'kirim':
                router.post(
                    `/laporan-mingguan/${laporan.id}/kirim`,
                    {},
                    options
                );
                break;

            case 'tolak':
                router.post(
                    `/laporan-mingguan/${laporan.id}/tolak`,
                    { alasan: alasanTolak.trim() },
                    options
                );
                break;

            case 'hapusBaris':
                router.delete(
                    `/laporan-mingguan/item/${modalAksi.itemId}`,
                    options
                );
                break;

            default:
                setProsesAksi(false);
        }
    };

    const tolak = () => {
        setAlasanTolak('');
        setModalAksi({ type: 'tolak' });
    };

    const totalJumlah = bagian1.reduce((a, r) => a + r.jumlah, 0);
    const totalSudah = bagian1.reduce((a, r) => a + r.sudah, 0);
    const totalBelum = bagian1.reduce((a, r) => a + r.belum, 0);
    const totalPersen =
        totalJumlah > 0
            ? Math.round((totalSudah / totalJumlah) * 100)
            : 0;

    return (
        <>
            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <Head title="Report Mingguan Preventif" />

            {/* TOAST NOTIFICATION */}
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

            <div className="min-h-screen bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]">
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/60 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white hover:bg-white/25"
                            title="Menu"
                        >
                            ☰
                        </button>

                        <h1 className="text-base font-bold text-white sm:text-lg">
                            Report Mingguan Preventif
                        </h1>
                    </div>
                </header>

                <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-4 sm:px-6">
                    {/* NAVIGASI KEMBALI */}
                    <div>
                        <Link
                            href="/laporan-mingguan"
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-white/20"
                        >
                            <ArrowLeft size={15} />
                            Kembali ke Riwayat
                        </Link>
                    </div>

                    {/* TOOLBAR */}
                    <div className="rounded-2xl bg-white/95 p-4 shadow-xl">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-bold text-slate-900">
                                        Week {week} · {rentangLabel}
                                    </h2>

                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.cls}`}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Hanya hari Senin-Jumat yang dihitung.
                                    {laporan.dikirim_pada &&
                                        ` Dikirim ${laporan.dikirim_pada}.`}
                                    {laporan.disetujui_pada &&
                                        ` Disetujui ${laporan.disetujui_pada}.`}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                                <select
                                    value={bulan}
                                    onChange={(e) =>
                                        pindah({
                                            bulan: Number(e.target.value),
                                            week: undefined,
                                        })
                                    }
                                    className={selectClass}
                                >
                                    {Object.entries(namaBulan).map(
                                        ([n, nama]) => (
                                            <option key={n} value={n}>
                                                {nama}
                                            </option>
                                        )
                                    )}
                                </select>

                                <select
                                    value={tahun}
                                    onChange={(e) =>
                                        pindah({
                                            tahun: Number(e.target.value),
                                            week: undefined,
                                        })
                                    }
                                    className={selectClass}
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

                                <select
                                    value={week}
                                    onChange={(e) =>
                                        pindah({
                                            week: Number(e.target.value),
                                        })
                                    }
                                    className={selectClass}
                                >
                                    {daftarWeek.map((w) => (
                                        <option key={w} value={w}>
                                            Week {w}
                                        </option>
                                    ))}
                                </select>

                                <a
                                    href={`/laporan-mingguan/export?bulan=${bulan}&tahun=${tahun}&week=${week}`}
                                    className="inline-flex h-9 items-center rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                    Export Excel
                                </a>

                                {['draft', 'ditolak'].includes(
                                    laporan.status
                                ) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalAksi({ type: 'simpan' })
                                        }
                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    >
                                        <Save size={14} />
                                        Simpan Draft
                                    </button>
                                )}

                                {['draft', 'ditolak'].includes(
                                    laporan.status
                                ) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalAksi({ type: 'kirim' })
                                        }
                                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 text-xs font-bold text-white shadow transition hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        <Send size={14} />
                                        {laporan.status === 'ditolak'
                                            ? 'Kirim Ulang'
                                            : 'Kirim ke Pimpinan'}
                                    </button>
                                )}

                                {bisaPersetujuan &&
                                    ['menunggu', 'diperiksa'].includes(
                                        laporan.status
                                    ) && (
                                        <>
                                            {laporan.status === 'menunggu' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        post(
                                                            `/laporan-mingguan/${laporan.id}/periksa`
                                                        )
                                                    }
                                                    className="h-9 rounded-lg bg-blue-500 px-3 text-xs font-bold text-white hover:bg-blue-600"
                                                >
                                                    Periksa
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    post(
                                                        `/laporan-mingguan/${laporan.id}/setujui`
                                                    )
                                                }
                                                className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700"
                                            >
                                                Setujui
                                            </button>

                                            <button
                                                type="button"
                                                onClick={tolak}
                                                className="h-9 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700"
                                            >
                                                Tolak
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>

                        {laporan.status === 'ditolak' && (
                            <p className="mt-3 rounded-lg border-l-4 border-red-400 bg-red-50 px-3 py-2 text-xs text-red-700">
                                <span className="font-bold">
                                    Ditolak pimpinan:
                                </span>{' '}
                                {laporan.alasan_penolakan || '-'}
                            </p>
                        )}

                        {terkunci && (
                            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                Laporan sudah disetujui dan tidak bisa diubah.
                            </p>
                        )}
                    </div>

                    {/* BAGIAN 1 */}
                    <section className="rounded-2xl bg-white/95 p-4 shadow-xl">
                        <h3 className="mb-3 text-sm font-bold text-slate-900">
                            1. Pencapaian Preventif
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        {[
                                            'No',
                                            'Mesin',
                                            'Jumlah Item',
                                            'Item Sudah Preventif',
                                            'Item Belum Preventif',
                                            'Presentase',
                                            'Komentar',
                                        ].map((h) => (
                                            <th key={h} className={thClass}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bagian1.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className={`${tdClass} text-center text-slate-400`}
                                            >
                                                Tidak ada Plan preventif di week ini.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian1.map((r, i) => (
                                        <tr key={r.no}>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {i + 1}
                                            </td>
                                            <td className={tdClass}>
                                                {r.mesin}
                                            </td>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {r.jumlah}
                                            </td>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {r.sudah}
                                            </td>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {r.belum}
                                            </td>
                                            <td
                                                className={`${tdClass} text-center font-semibold`}
                                            >
                                                {r.persen}%
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[220px]`}
                                            >
                                                {r.item_id && (
                                                    <TeksSel
                                                        value={r.komentar}
                                                        rows={2}
                                                        disabled={terkunci}
                                                        onSave={(v) =>
                                                            simpanItem(
                                                                r.item_id,
                                                                'komentar',
                                                                v
                                                            )
                                                        }
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="bg-slate-50 font-bold">
                                        <td className={tdClass} />
                                        <td
                                            className={`${tdClass} text-center`}
                                        >
                                            TOTAL ITEM
                                        </td>
                                        <td
                                            className={`${tdClass} text-center`}
                                        >
                                            {totalJumlah}
                                        </td>
                                        <td
                                            className={`${tdClass} text-center`}
                                        >
                                            {totalSudah}
                                        </td>
                                        <td
                                            className={`${tdClass} text-center`}
                                        >
                                            {totalBelum}
                                        </td>
                                        <td
                                            className={`${tdClass} text-center`}
                                        >
                                            {totalPersen}%
                                        </td>
                                        <td className={tdClass} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* BAGIAN 2 */}
                    <section className="rounded-2xl bg-white/95 p-4 shadow-xl">
                        <h3 className="mb-3 text-sm font-bold text-slate-900">
                            2. Laporan Preventif
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        {[
                                            'No',
                                            'Mesin',
                                            'Aktivitas / Problem',
                                            'Penanggulangan',
                                            'Foto Before',
                                            'Foto After',
                                        ].map((h) => (
                                            <th key={h} className={thClass}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bagian2.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className={`${tdClass} text-center text-slate-400`}
                                            >
                                                Belum ada item preventif di week ini.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian2.map((it, i) => (
                                        <tr key={it.id}>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {i + 1}
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[200px] font-medium`}
                                            >
                                                {it.mesin}
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[240px]`}
                                            >
                                                <TeksSel
                                                    value={it.aktivitas}
                                                    disabled={terkunci}
                                                    onSave={(v) =>
                                                        simpanItem(
                                                            it.id,
                                                            'aktivitas',
                                                            v
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[240px]`}
                                            >
                                                <TeksSel
                                                    value={it.penanggulangan}
                                                    disabled={terkunci}
                                                    onSave={(v) =>
                                                        simpanItem(
                                                            it.id,
                                                            'penanggulangan',
                                                            v
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className={tdClass}>
                                                <FotoSel
                                                    url={it.foto_before_url}
                                                    itemId={it.id}
                                                    jenis="before"
                                                    disabled={terkunci}
                                                    label="Before"
                                                />
                                            </td>
                                            <td className={tdClass}>
                                                <FotoSel
                                                    url={it.foto_after_url}
                                                    itemId={it.id}
                                                    jenis="after"
                                                    disabled={terkunci}
                                                    label="After"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* BAGIAN 3 */}
                    <section className="rounded-2xl bg-white/95 p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900">
                                3. Laporan Temuan Preventif &amp; Tambahan Pekerjaan
                            </h3>

                            {!terkunci && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        post(
                                            `/laporan-mingguan/${laporan.id}/temuan`
                                        )
                                    }
                                    className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
                                >
                                    + Tambah baris
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        {[
                                            'No',
                                            'Mesin',
                                            'Aktivitas / Problem',
                                            'Penanggulangan',
                                            'Foto',
                                            '',
                                        ].map((h, i) => (
                                            <th key={i} className={thClass}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bagian3.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className={`${tdClass} text-center text-slate-400`}
                                            >
                                                Belum ada temuan.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian3.map((it, i) => (
                                        <tr key={it.id}>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {i + 1}
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[200px]`}
                                            >
                                                <TeksSel
                                                    value={it.mesin}
                                                    rows={2}
                                                    disabled={terkunci}
                                                    onSave={(v) =>
                                                        simpanItem(
                                                            it.id,
                                                            'mesin',
                                                            v
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[240px]`}
                                            >
                                                <TeksSel
                                                    value={it.aktivitas}
                                                    disabled={terkunci}
                                                    onSave={(v) =>
                                                        simpanItem(
                                                            it.id,
                                                            'aktivitas',
                                                            v
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td
                                                className={`${tdClass} min-w-[240px]`}
                                            >
                                                <TeksSel
                                                    value={it.penanggulangan}
                                                    disabled={terkunci}
                                                    onSave={(v) =>
                                                        simpanItem(
                                                            it.id,
                                                            'penanggulangan',
                                                            v
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className={tdClass}>
                                                <FotoSel
                                                    url={it.foto_before_url}
                                                    itemId={it.id}
                                                    jenis="before"
                                                    disabled={terkunci}
                                                />
                                            </td>
                                            <td
                                                className={`${tdClass} text-center`}
                                            >
                                                {!terkunci && (
                                                    <button
                                                        type="button"
                                                        title="Hapus baris"
                                                        onClick={() =>
                                                            setModalAksi({
                                                                type: 'hapusBaris',
                                                                itemId: it.id,
                                                            })
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* RIWAYAT REVISI */}
                    {revisis.length > 0 && (
                        <section className="rounded-2xl bg-white/95 p-4 shadow-xl">
                            <h3 className="mb-2 text-sm font-bold text-slate-900">
                                Riwayat revisi setelah dikirim
                            </h3>

                            <ul className="space-y-1 text-xs text-slate-600">
                                {revisis.map((r) => (
                                    <li key={r.id}>
                                        <span className="font-semibold text-slate-400">
                                            {r.waktu}
                                        </span>{' '}
                                        · {r.keterangan}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </main>
            </div>

            {/* MODAL KONFIRMASI */}
            {modalAksi && (() => {
                const konfigurasi = {
                    simpan: {
                        icon: Save,
                        warna: 'bg-blue-50 text-blue-600',
                        tombol: 'bg-blue-600 hover:bg-blue-700',
                        judul: 'Simpan Draft?',
                        deskripsi:
                            'Apakah kamu yakin ingin menyimpan laporan ini sebagai draft?',
                        aksi: 'Ya, Simpan',
                    },
                    kirim: {
                        icon: Send,
                        warna: 'bg-indigo-50 text-indigo-600',
                        tombol: 'bg-indigo-600 hover:bg-indigo-700',
                        judul: 'Kirim Laporan?',
                        deskripsi:
                            'Laporan akan dikirim ke pimpinan untuk diperiksa. Pastikan data sudah benar.',
                        aksi: 'Ya, Kirim',
                    },
                    tolak: {
                        icon: AlertTriangle,
                        warna: 'bg-red-50 text-red-600',
                        tombol: 'bg-red-600 hover:bg-red-700',
                        judul: 'Tolak Laporan?',
                        deskripsi: 'Masukkan alasan penolakan laporan ini.',
                        aksi: 'Ya, Tolak',
                    },
                    hapusBaris: {
                        icon: Trash2,
                        warna: 'bg-red-50 text-red-600',
                        tombol: 'bg-red-600 hover:bg-red-700',
                        judul: 'Hapus Baris?',
                        deskripsi:
                            'Apakah kamu yakin ingin menghapus baris temuan ini?',
                        aksi: 'Ya, Hapus',
                    },
                };

                const config = konfigurasi[modalAksi.type];

                if (!config) return null;

                const Icon = config.icon;

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex justify-end px-4 pt-4">
                                <button
                                    type="button"
                                    disabled={prosesAksi}
                                    onClick={() => {
                                        setModalAksi(null);
                                        setAlasanTolak('');
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <div className="px-6 pb-6 text-center">
                                <div
                                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${config.warna}`}
                                >
                                    <Icon size={26} />
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-800">
                                    {config.judul}
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                    {config.deskripsi}
                                </p>

                                {modalAksi.type === 'tolak' && (
                                    <textarea
                                        value={alasanTolak}
                                        onChange={(e) =>
                                            setAlasanTolak(e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Tuliskan alasan penolakan..."
                                        className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-red-400 focus:bg-white"
                                    />
                                )}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={prosesAksi}
                                        onClick={() => {
                                            setModalAksi(null);
                                            setAlasanTolak('');
                                        }}
                                        className="h-10 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            prosesAksi ||
                                            (modalAksi.type === 'tolak' &&
                                                !alasanTolak.trim())
                                        }
                                        onClick={jalankanAksi}
                                        className={`h-10 flex-1 rounded-xl text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${config.tombol}`}
                                    >
                                        {prosesAksi
                                            ? 'Memproses...'
                                            : config.aksi}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </>
    );
}
