import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import MachineImportModal from '@/Components/MachineImportModal';
import MachineFormModal from '@/Components/MachineFormModal';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MachineUnitsModal from '@/Components/MachineUnitsModal';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    edit: {
        paths: [
            'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
            'M15 5l4 4',
        ],
    },
    trash: {
        paths: [
            'M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5',
            'M10 11v5.5M14 11v5.5',
        ],
    },
    eye: {
        paths: [
            'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
            'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        ],
    },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];
    if (!icon) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-9 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const inputClass =
    'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

function Field({ label, children }) {
    return (
        <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </span>
            {children}
        </label>
    );
}

function Filter({ label, value, options, onChange }) {
    return (
        <Field label={label}>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={selectClass}
            >
                <option value="">Semua</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </Field>
    );
}

const HEADERS = [
    'No', 'Nama Alat', 'Qty', 'Merk', 'No. Kontrol', 'Model', 'Electric',
    'Negara', 'Tahun', 'Start Ops', 'Supplier', 'Kontak', 'Ket.', 'Panel KWH', 'Aksi',
];

export default function Index({ types, filters = {}, options }) {
    const { flash, auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const [showSidebar, setShowSidebar] = useState(false);
    const [f, setF] = useState(filters);
    const [search, setSearch] = useState(filters.search || '');
    const [hasil, setHasil] = useState(true); // tutup kotak hasil import

    // import excel
    const [importInfo, setImportInfo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // tambah / edit
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null); // null = mode tambah

    // hapus
    const [confirmDialog, setConfirmDialog] = useState(null);
    // pop up unit & QR
    const [unitTypeId, setUnitTypeId] = useState(null);

    // toast
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 4000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    /* ---------------- FILTER ---------------- */
    const apply = (patch) => {
        const next = { ...f, ...patch };
        Object.keys(next).forEach((k) => !next[k] && delete next[k]);
        setF(next);

        router.get('/machines', next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setF({});
        setSearch('');
        router.get('/machines', {}, { preserveState: true, replace: true });
    };

    /* ---------------- IMPORT ---------------- */
    const pilihFile = async (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;

        setUploading(true);
        setUploadError('');
        setHasil(true);

        const fd = new FormData();
        fd.append('file', file);

        try {
            const { data } = await axios.post('/machines/import/preview', fd);
            setImportInfo(data);
        } catch (err) {
            setUploadError(
                err.response?.data?.errors?.file?.[0] ||
                    err.response?.data?.message ||
                    'Gagal membaca file.'
            );
        } finally {
            setUploading(false);
        }
    };

    /* ---------------- TAMBAH / EDIT / HAPUS ---------------- */
    const openCreate = () => {
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (t) => {
        setEditing(t);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    const confirmDelete = (t) => {
        setConfirmDialog({
            title: 'Hapus jenis mesin?',
            message: `Apakah kamu yakin ingin menghapus ${t.nama_alat} (${t.no_kontrol_raw}) beserta ${t.machines_count} unitnya?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/machines/type/${t.id}`, {
                    preserveScroll: true,
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    const result = flash?.import_result;
    const adaFilter = Object.keys(f).length > 0;
    const nomorAwal = types.from ?? 1;

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Daftar Mesin" />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxFloat {
                    0%, 100% { transform: translate3d(0,0,0) scale(1); }
                    50% { transform: translate3d(30px,-30px,0) scale(1.08); }
                }
                @keyframes idxFloatReverse {
                    0%, 100% { transform: translate3d(0,0,0) scale(1); }
                    50% { transform: translate3d(-35px,25px,0) scale(1.1); }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .idx-gradient { background-size: 250% 250%; animation: idxGradient 20s ease infinite; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }
                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.4); border-radius: 999px; }
                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient, .idx-float, .idx-float-reverse, .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />
                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-2.5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                                title="Menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                Daftar Inventaris Mesin
                            </h1>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 space-y-3 px-4 py-4 sm:px-6">
                    {/* TOOLBAR */}
                    <div className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold tracking-tight text-slate-900">
                                    Daftar Mesin
                                </h2>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                                    {types.total} jenis
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    href={`/machines/print-all?${new URLSearchParams(f).toString()}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                                >
                                    Print Semua QR{adaFilter ? ' (sesuai filter)' : ''}
                                </Link>

                                {isAdmin && (
                                    <>
                                        <label
                                            className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 ${
                                                uploading ? 'pointer-events-none opacity-60' : ''
                                            }`}
                                        >
                                            {uploading ? 'Membaca file…' : 'Import Excel'}
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={pilihFile}
                                                className="hidden"
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={openCreate}
                                            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                                        >
                                            <Icon type="plus" className="h-4 w-4" />
                                            Tambah
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {uploadError && (
                            <p className="px-4 pb-3 text-xs font-semibold text-red-600">
                                {uploadError}
                            </p>
                        )}

                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </div>

                    {/* HASIL IMPORT */}
                    {result && hasil && (
                        <div className={`idx-rise rounded-2xl p-4 ${glassCard}`}>
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-emerald-700">
                                    Import selesai: {result.types} jenis mesin baru, {result.machines} unit baru.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setHasil(false)}
                                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            </div>

                            {result.warnings?.length > 0 && (
                                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-amber-700">
                                    {result.warnings.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* FILTER */}
                    <div
                        style={{ animationDelay: '80ms' }}
                        className={`idx-rise rounded-2xl p-4 ${glassCard}`}
                    >
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                            <Filter label="Nama Alat" value={f.nama_alat} options={options.nama_alat}
                                onChange={(v) => apply({ nama_alat: v })} />
                            <Filter label="Merk" value={f.merk} options={options.merk}
                                onChange={(v) => apply({ merk: v })} />
                            <Filter label="Negara Pembuat" value={f.negara_pembuat} options={options.negara_pembuat}
                                onChange={(v) => apply({ negara_pembuat: v })} />
                            <Filter label="Panel Monitor KWH" value={f.panel_monitor_kwh} options={options.panel_monitor_kwh}
                                onChange={(v) => apply({ panel_monitor_kwh: v })} />

                            <Field label="Cari">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && apply({ search })}
                                    placeholder="Model / no. kontrol, Enter"
                                    className={inputClass}
                                />
                            </Field>

                            <div className="flex items-end">
                                {adaFilter && (
                                    <button
                                        type="button"
                                        onClick={resetFilter}
                                        className="h-9 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TABEL */}
                    <div
                        style={{ animationDelay: '160ms' }}
                        className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead className="text-white">
                                    <tr className="bg-[#0a1a4d]">
                                        {HEADERS.map((h) => (
                                            <th
                                                key={h}
                                                className="whitespace-nowrap border-b border-r border-white/10 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider first:border-l"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {types.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={HEADERS.length} className="px-6 py-16 text-center">
                                                <p className="font-semibold text-slate-700">Tidak ada data</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {isAdmin
                                                        ? 'Klik Tambah atau Import Excel untuk mengisi data mesin.'
                                                        : 'Belum ada data mesin.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        types.data.map((t, i) => (
                                            <tr key={t.id} className="transition-colors hover:bg-blue-50/40">
                                                <td className="border border-slate-200 bg-slate-50 px-3 py-2 text-center font-bold text-slate-700">
                                                    {nomorAwal + i}
                                                </td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 font-semibold text-slate-700">
                                                    {t.nama_alat}
                                                </td>
                                                <td className="border border-slate-200 px-3 py-2 text-center">
                                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                                                        {t.machines_count}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">{t.merk}</td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">{t.no_kontrol_raw}</td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">{t.model_type}</td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">{t.electric_consumption}</td>
                                                <td className="border border-slate-200 px-3 py-2 text-slate-600">{t.negara_pembuat}</td>
                                                <td className="border border-slate-200 px-3 py-2 text-center text-slate-600">{t.tahun_pembuatan}</td>
                                                <td className="border border-slate-200 px-3 py-2 text-center text-slate-600">{t.start_operasional}</td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">
                                                    {t.supplier_name}
                                                    {(t.supplier_active || t.supplier_repair) && (
                                                        <span className="ml-1.5 inline-flex gap-1 align-middle">
                                                            {t.supplier_active && (
                                                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
                                                            )}
                                                            {t.supplier_repair && (
                                                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Repair</span>
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">{t.kontak_person}</td>
                                                <td className="border border-slate-200 px-3 py-2 text-slate-600">{t.keterangan}</td>
                                                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-slate-600">{t.panel_monitor_kwh}</td>
                                                <td className="border border-slate-200 px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title="Lihat unit & QR"
                                                            aria-label="Lihat unit dan QR"
                                                            onClick={() => setUnitTypeId(t.id)}
                                                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
                                                        >
                                                            <Icon type="eye" />
                                                        </button>
                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    title="Edit data"
                                                                    onClick={() => openEdit(t)}
                                                                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
                                                                >
                                                                    <Icon type="edit" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    title="Hapus data"
                                                                    onClick={() => confirmDelete(t)}
                                                                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md"
                                                                >
                                                                    <Icon type="trash" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {types.last_page > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-500">
                                    Menampilkan {types.from}–{types.to} dari {types.total}
                                </p>

                                <div className="flex flex-wrap gap-1">
                                    {types.links.map((l, i) => (
                                        <Link
                                            key={i}
                                            href={l.url || '#'}
                                            preserveState
                                            preserveScroll
                                            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                                                l.active
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                            } ${!l.url ? 'pointer-events-none opacity-40' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: l.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Daftar Mesin
                        </p>
                    </div>
                </footer>
            </div>

            {/* TOAST */}
            {showSuccess && (
                <div className="fixed right-5 top-5 z-[110] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{successMessage}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSuccess(false)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* MODAL TAMBAH / EDIT */}
            {showForm && (
                <MachineFormModal
                    key={editing?.id ?? 'new'}
                    mesin={editing}
                    options={options}
                    onClose={closeForm}
                />
            )}

            {/* MODAL PEMETAAN KOLOM IMPORT */}
            {importInfo && (
                <MachineImportModal
                    initial={importInfo}
                    onClose={() => setImportInfo(null)}
                />
            )}

            {/* POP UP UNIT & QR */}
            {unitTypeId && (
                <MachineUnitsModal
                    typeId={unitTypeId}
                    onClose={() => setUnitTypeId(null)}
                />
            )}

            {/* KONFIRMASI HAPUS */}
            <ConfirmModal
                open={Boolean(confirmDialog)}
                title={confirmDialog?.title}
                message={confirmDialog?.message}
                confirmLabel={confirmDialog?.confirmLabel}
                tone={confirmDialog?.tone}
                onConfirm={() => confirmDialog?.onConfirm?.()}
                onCancel={() => setConfirmDialog(null)}
            />
        </>
    );
}