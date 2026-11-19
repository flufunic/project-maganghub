import Sidebar from '@/Components/Sidebar';
import MachineImportModal from '@/Components/MachineImportModal';
import MachineFormModal from '@/Components/MachineFormModal';
import MachineUnitsModal from '@/Components/MachineUnitsModal';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

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
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    download: { sw: 2, paths: ['M12 3v12m0 0 4-4m-4 4-4-4', 'M5 21h14'] },
    upload: { sw: 2, paths: ['M12 16V4m0 0 4 4m-4-4-4 4', 'M5 20h14'] },
    print: {
        paths: [
            'M6 9V3.75h12V9M6 18H4.5A1.5 1.5 0 013 16.5v-6A1.5 1.5 0 014.5 9h15a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H18',
            'M6 14h12v6.75H6z',
        ],
    },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    search: { sw: 2, paths: ['M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z'] },
    box: {
        paths: ['M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5'],
    },
    layers: { paths: ['M12 3l9 5-9 5-9-5 9-5z', 'M3 13l9 5 9-5'] },
    filter: { paths: ['M3 5h18l-7 8v6l-4 2v-8L3 5z'] },
    page: {
        paths: [
            'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z',
            'M14 3v5h5',
        ],
    },
    qr: {
        paths: [
            'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z',
            'M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
        ],
    },
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
const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const selectClass =
    'h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const inputClass =
    'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

const iconBtn =
    'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0';

function Field({ label, children }) {
    return (
        <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400">{label}</span>
            {children}
        </label>
    );
}

function Filter({ label, value, options = [], onChange }) {
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

/* Toast (success / warning) */
function Toast({ tone = 'emerald', title, message, onClose, icon }) {
    const tones = {
        emerald: { bar: 'from-emerald-400 to-green-600', ico: 'bg-emerald-50 text-emerald-600' },
        amber: { bar: 'from-amber-400 to-orange-500', ico: 'bg-amber-50 text-amber-600' },
        red: { bar: 'from-rose-400 to-red-600', ico: 'bg-red-50 text-red-600' },
    };
    const t = tones[tone];

    return (
        <div className="idx-slide fixed right-5 top-5 z-[120] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25">
            <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${t.bar}`} />

            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.ico}`}>
                <Icon type={icon} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
            >
                <Icon type="close" className="h-4 w-4" />
            </button>

            {/* progress bar auto-close */}
            <span className="idx-progress absolute bottom-0 left-0 h-0.5 w-full origin-left bg-slate-200" />
        </div>
    );
}

/* Dialog konfirmasi (menggantikan ConfirmModal, tetap satu file) */
function ConfirmDialog({ dialog, busy, onCancel }) {
    useEffect(() => {
        if (!dialog) return;
        const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [dialog, busy, onCancel]);

    if (!dialog) return null;

    const red = dialog.tone === 'red';

    return (
        <div
            onClick={() => !busy && onCancel()}
            className="idx-fade fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                className="idx-pop w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="px-6 pb-2 pt-6 text-center">
                    <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                        <span
                            className={`idx-ping absolute inset-0 rounded-full ${
                                red ? 'bg-red-400/40' : 'bg-blue-400/40'
                            }`}
                        />
                        <span
                            className={`relative flex h-16 w-16 items-center justify-center rounded-full ${
                                red
                                    ? 'bg-gradient-to-br from-red-50 to-rose-100 text-red-600'
                                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600'
                            }`}
                        >
                            <Icon type={red ? 'trash' : 'alert'} className="h-7 w-7" />
                        </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-slate-900">{dialog.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{dialog.message}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={() => dialog.onConfirm?.()}
                        disabled={busy}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${
                            red
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'
                        }`}
                    >
                        {busy && (
                            <span className="idx-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                        )}
                        {busy ? 'Memproses...' : dialog.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
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
    const [confirmBusy, setConfirmBusy] = useState(false);

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

    useEffect(() => {
        if (!uploadError) return;
        const timer = setTimeout(() => setUploadError(''), 6000);
        return () => clearTimeout(timer);
    }, [uploadError]);

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

    const closeConfirm = () => {
        if (confirmBusy) return;
        setConfirmDialog(null);
    };

    const confirmDelete = (t) => {
        setConfirmDialog({
            title: 'Hapus jenis mesin?',
            message: `Apakah kamu yakin ingin menghapus ${t.nama_alat} (${t.no_kontrol_raw}) beserta ${t.machines_count} unitnya? Tindakan ini tidak dapat dibatalkan.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setConfirmBusy(true);
                router.delete(`/machines/type/${t.id}`, {
                    preserveScroll: true,
                    onFinish: () => {
                        setConfirmBusy(false);
                        setConfirmDialog(null);
                    },
                });
            },
        });
    };

    const result = flash?.import_result;
    const adaFilter = Object.keys(f).length > 0;
    const nomorAwal = types.from ?? 1;
    const jumlahUnitHalaman = types.data.reduce((sum, t) => sum + Number(t.machines_count || 0), 0);
    const queryString = new URLSearchParams(f).toString();

    const stats = [
        {
            label: 'Total jenis mesin',
            value: types.total,
            hint: adaFilter ? 'Sesuai filter aktif' : 'Seluruh inventaris',
            icon: 'box',
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Unit di halaman ini',
            value: jumlahUnitHalaman,
            hint: `${types.data.length} jenis ditampilkan`,
            icon: 'layers',
            tone: 'from-violet-500 to-purple-600',
            soft: 'bg-violet-50 text-violet-600',
        },
        {
            label: 'Filter aktif',
            value: Object.keys(f).length,
            hint: adaFilter ? 'Klik Reset untuk menghapus' : 'Menampilkan semua data',
            icon: 'filter',
            tone: 'from-cyan-500 to-sky-600',
            soft: 'bg-cyan-50 text-cyan-600',
        },
        {
            label: 'Halaman',
            value: `${types.current_page ?? 1} / ${types.last_page ?? 1}`,
            hint: types.total > 0 ? `Data ${types.from}–${types.to}` : 'Belum ada data',
            icon: 'page',
            tone: 'from-emerald-500 to-green-600',
            soft: 'bg-emerald-50 text-emerald-600',
        },
    ];

    const delay = (ms) => ({ animationDelay: `${ms}ms` });

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Daftar Mesin" />

            <style>{`
                @keyframes idxRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes idxFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
                @keyframes idxFloatReverse { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
                @keyframes idxShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes idxPing { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.6); opacity: 0; } }
                @keyframes idxSpin { to { transform: rotate(360deg); } }
                @keyframes idxProgress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
                @keyframes idxRow { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

                .idx-rise { animation: idxRise .7s cubic-bezier(.22,1,.36,1) both; }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-slide { animation: idxSlide .45s cubic-bezier(.22,1,.36,1) both; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-shimmer { background-size: 200% 100%; animation: idxShimmer 6s linear infinite; }
                .idx-ping { animation: idxPing 1.8s ease-out infinite; }
                .idx-spin { animation: idxSpin .8s linear infinite; }
                .idx-progress { animation: idxProgress 4s linear forwards; }
                .idx-row { animation: idxRow .45s cubic-bezier(.22,1,.36,1) both; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                .idx-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

                @media (prefers-reduced-motion: reduce) {
                    .idx-rise, .idx-fade, .idx-pop, .idx-slide, .idx-float, .idx-float-reverse,
                    .idx-shimmer, .idx-ping, .idx-progress, .idx-row { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="idx-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-100px] top-[8%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="w-full px-3 py-3 sm:px-5 2xl:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                                title="Menu"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    Daftar Inventaris Mesin
                                </h1>
                                <p className="truncate text-xs text-blue-200/80">
                                    Data jenis mesin, unit & QR code
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="idx-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* MAIN: full width, ikut lebar layar saat zoom out */}
                <main className="w-full flex-1 px-3 py-4 sm:px-5 2xl:px-8">
                    {/* STAT CARDS */}
                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((item, i) => (
                            <div
                                key={item.label}
                                style={delay(i * 70)}
                                className={`idx-rise group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card}`}
                            >
                                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.tone}`} />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                        <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900">
                                            {item.value}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.hint}</p>
                                    </div>

                                    <span
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${item.soft}`}
                                    >
                                        <Icon type={item.icon} className="h-5 w-5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOOLBAR */}
                    <div style={delay(280)} className={`idx-rise mb-4 ${card}`}>
                        <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Daftar Mesin</h2>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {types.total} jenis
                                    </span>
                                    {adaFilter && (
                                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600">
                                            Filter aktif
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Kelola jenis mesin, lihat unit, dan cetak QR code.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <a
                                    href={`/machines/export${queryString ? `?${queryString}` : ''}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-0"
                                >
                                    <Icon type="download" className="h-4 w-4" />
                                    Export Excel{adaFilter ? ' (filter)' : ''}
                                </a>

                                <Link
                                    href={`/machines/print-all?${queryString}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
                                >
                                    <Icon type="print" className="h-4 w-4" />
                                    Print Semua QR{adaFilter ? ' (filter)' : ''}
                                </Link>

                                {isAdmin && (
                                    <>
                                        <label
                                            className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3.5 text-xs font-semibold text-violet-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-100 active:translate-y-0 ${
                                                uploading ? 'pointer-events-none opacity-60' : ''
                                            }`}
                                        >
                                            {uploading ? (
                                                <span className="idx-spin h-4 w-4 rounded-full border-2 border-violet-200 border-t-violet-600" />
                                            ) : (
                                                <Icon type="upload" className="h-4 w-4" />
                                            )}
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
                                            className="group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                                        >
                                            <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                            <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                            <span className="relative">Tambah</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* HASIL IMPORT */}
                    {result && hasil && (
                        <div className={`idx-pop relative mb-4 overflow-hidden p-4 ${card}`}>
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />
                            <div className="flex items-start gap-3 pl-2">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Icon type="check" className="h-5 w-5" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800">Import selesai</p>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {result.types} jenis mesin baru, {result.machines} unit baru ditambahkan.
                                    </p>

                                    {result.warnings?.length > 0 && (
                                        <ul className="mt-2 list-disc space-y-0.5 rounded-xl bg-amber-50 py-2 pl-7 pr-3 text-xs text-amber-700">
                                            {result.warnings.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setHasil(false)}
                                    aria-label="Tutup"
                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <Icon type="close" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FILTER */}
                    <div style={delay(340)} className={`idx-rise mb-4 p-4 ${card}`}>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                            <Filter label="Nama Alat" value={f.nama_alat} options={options?.nama_alat}
                                onChange={(v) => apply({ nama_alat: v })} />
                            <Filter label="Merk" value={f.merk} options={options?.merk}
                                onChange={(v) => apply({ merk: v })} />
                            <Filter label="Negara Pembuat" value={f.negara_pembuat} options={options?.negara_pembuat}
                                onChange={(v) => apply({ negara_pembuat: v })} />
                            <Filter label="Panel Monitor KWH" value={f.panel_monitor_kwh} options={options?.panel_monitor_kwh}
                                onChange={(v) => apply({ panel_monitor_kwh: v })} />

                            <Field label="Cari">
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Icon type="search" className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && apply({ search })}
                                        placeholder="Model / no. kontrol, Enter"
                                        className={inputClass}
                                    />
                                </div>
                            </Field>

                            <div className="flex items-end">
                                {adaFilter && (
                                    <button
                                        type="button"
                                        onClick={resetFilter}
                                        className="idx-pop inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:translate-y-0"
                                    >
                                        <Icon type="close" className="h-3.5 w-3.5" />
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TABEL */}
                    <div style={delay(400)} className={`idx-rise overflow-hidden ${card}`}>
                        <div className="idx-scroll w-full overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-[13px]">
                                <thead className="text-white">
                                    <tr className="bg-[#0b1a4d]">
                                        {HEADERS.map((h) => (
                                            <th
                                                key={h}
                                                className="whitespace-nowrap border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-3 py-3 text-center text-[11px] font-semibold tracking-wide last:border-r-0"
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
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                        <Icon type="box" className="h-7 w-7 text-slate-400" />
                                                    </div>
                                                    <p className="font-semibold text-slate-700">Tidak ada data</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {adaFilter
                                                            ? 'Tidak ada mesin yang cocok dengan filter. Coba reset filter.'
                                                            : isAdmin
                                                            ? 'Klik Tambah atau Import Excel untuk mengisi data mesin.'
                                                            : 'Belum ada data mesin.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        types.data.map((t, i) => (
                                            <tr
                                                key={t.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className="idx-row group transition-colors duration-200 even:bg-slate-50/50 hover:bg-blue-50/50"
                                            >
                                                <td className="border-b border-r border-slate-100 bg-slate-50/80 px-3 py-2.5 text-center font-semibold text-slate-500">
                                                    {nomorAwal + i}
                                                </td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 font-semibold text-slate-800">
                                                    {t.nama_alat}
                                                </td>
                                                <td className="border-b border-r border-slate-100 px-3 py-2.5 text-center">
                                                    <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                                                        {t.machines_count}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">{t.merk}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 font-medium text-slate-700">{t.no_kontrol_raw}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">{t.model_type}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">{t.electric_consumption}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">{t.negara_pembuat}</td>
                                                <td className="border-b border-r border-slate-100 px-3 py-2.5 text-center text-slate-600">{t.tahun_pembuatan}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-center text-slate-600">{t.start_operasional}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">
                                                    {t.supplier_name}
                                                    {(t.supplier_active || t.supplier_repair) && (
                                                        <span className="ml-1.5 inline-flex gap-1 align-middle">
                                                            {t.supplier_active && (
                                                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">Active</span>
                                                            )}
                                                            {t.supplier_repair && (
                                                                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Repair</span>
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">{t.kontak_person}</td>
                                                <td className="min-w-[120px] border-b border-r border-slate-100 px-3 py-2.5 text-slate-500">{t.keterangan}</td>
                                                <td className="whitespace-nowrap border-b border-r border-slate-100 px-3 py-2.5 text-slate-600">{t.panel_monitor_kwh}</td>
                                                <td className="border-b border-slate-100 px-3 py-2.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title="Lihat unit & QR"
                                                            aria-label="Lihat unit dan QR"
                                                            onClick={() => setUnitTypeId(t.id)}
                                                            className={`${iconBtn} bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/30`}
                                                        >
                                                            <Icon type="eye" />
                                                        </button>
                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    title="Edit data"
                                                                    aria-label="Edit data"
                                                                    onClick={() => openEdit(t)}
                                                                    className={`${iconBtn} bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white hover:shadow-slate-500/30`}
                                                                >
                                                                    <Icon type="edit" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    title="Hapus data"
                                                                    aria-label="Hapus data"
                                                                    onClick={() => confirmDelete(t)}
                                                                    className={`${iconBtn} bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-500/30`}
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
                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                                <p className="text-sm text-slate-500">
                                    Menampilkan{' '}
                                    <span className="font-semibold text-slate-700">{types.from}</span> -{' '}
                                    <span className="font-semibold text-slate-700">{types.to}</span> dari{' '}
                                    <span className="font-semibold text-slate-700">{types.total}</span> data
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    {types.links.map((l, i) => (
                                        <Link
                                            key={i}
                                            href={l.url || '#'}
                                            preserveState
                                            preserveScroll
                                            className={`min-w-[36px] cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200 ${
                                                l.active
                                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:text-blue-600 hover:ring-blue-300'
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
                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Daftar Mesin
                        </p>
                    </div>
                </footer>
            </div>

            {/* TOAST SUKSES */}
            {showSuccess && (
                <Toast
                    tone="emerald"
                    icon="check"
                    title="Berhasil"
                    message={successMessage}
                    onClose={() => setShowSuccess(false)}
                />
            )}

            {/* TOAST ERROR UPLOAD */}
            {uploadError && (
                <Toast
                    tone="red"
                    icon="alert"
                    title="Import gagal"
                    message={uploadError}
                    onClose={() => setUploadError('')}
                />
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
                <MachineImportModal initial={importInfo} onClose={() => setImportInfo(null)} />
            )}

            {/* POP UP UNIT & QR */}
            {unitTypeId && (
                <MachineUnitsModal typeId={unitTypeId} onClose={() => setUnitTypeId(null)} />
            )}

            {/* KONFIRMASI HAPUS */}
            <ConfirmDialog dialog={confirmDialog} busy={confirmBusy} onCancel={closeConfirm} />
        </>
    );
}