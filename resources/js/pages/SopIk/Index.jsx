import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
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
            'M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z',
            'M12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
        ],
    },
    file: {
        paths: [
            'M14 3.5H7.5a2 2 0 00-2 2v13a2 2 0 002 2h9a2 2 0 002-2V8l-4.5-4.5z',
            'M14 3.5V8h4.5',
        ],
    },
    calendar: {
        paths: [
            'M7 3v3M17 3v3M4 8h16',
            'M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
            'M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01',
        ],
    },
    search: { paths: ['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M17 17l4 4'] },
    upload: { sw: 2, paths: ['M12 16V4m0 0 4 4m-4-4-4 4', 'M5 20h14'] },
    layers: { paths: ['M12 3l9 5-9 5-9-5 9-5z', 'M3 13l9 5 9-5'] },
    clock: { paths: ['M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'] },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    open: { sw: 2, paths: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5'] },
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

const inputClass =
    'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

const btnPrimary =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const btnGhost =
    'cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50';

const iconBtn =
    'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(s) {
    if (!s) return '-';

    const [y, m, d] = String(s).slice(0, 10).split('-');

    if (!y || !m || !d) return '-';

    return `${d}-${MON[Number(m) - 1]}-${y.slice(2)}`;
}

/* ------------------------------------------------------------------
| HELPER REVISI
------------------------------------------------------------------ */

// Revisi paling baru berdasarkan tanggal, lalu nomor revisi jika tanggal sama.
function getLatestRevision(doc) {
    const revisions = Array.isArray(doc?.revisions) ? doc.revisions : [];

    if (revisions.length === 0) return null;

    return [...revisions].sort((a, b) => {
        const dateA = String(a.tanggal ?? '');
        const dateB = String(b.tanggal ?? '');

        if (dateA !== dateB) {
            return dateB.localeCompare(dateA);
        }

        return Number(b.revisi_ke ?? 0) - Number(a.revisi_ke ?? 0);
    })[0];
}

function getLatestDate(doc) {
    const latestRevision = getLatestRevision(doc);

    return latestRevision?.tanggal || doc?.tanggal_revisi || null;
}

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */
function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
            {children}
            {error && (
                <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600">
                    <Icon type="alert" className="h-3 w-3" />
                    {error}
                </span>
            )}
        </label>
    );
}

/* Toast */
function Toast({ tone = 'emerald', title, message, onClose, icon }) {
    const tones = {
        emerald: { bar: 'from-emerald-400 to-green-600', ico: 'bg-emerald-50 text-emerald-600' },
        red: { bar: 'from-rose-400 to-red-600', ico: 'bg-red-50 text-red-600' },
    };
    const t = tones[tone];

    return (
        <div className="idx-slide fixed right-5 top-5 z-[220] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25">
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

            <span className="idx-progress absolute bottom-0 left-0 h-0.5 w-full origin-left bg-slate-200" />
        </div>
    );
}

/* Cangkang modal */
function ModalShell({
    title,
    subtitle,
    icon = 'file',
    tone = 'blue',
    onClose,
    footer,
    wide = false,
    closeOnBackdrop = true,
    children,
}) {
    const tones = {
        blue: 'from-blue-50 to-indigo-100 text-blue-600',
        sky: 'from-sky-50 to-cyan-100 text-sky-600',
        red: 'from-red-50 to-rose-100 text-red-600',
    };

    return (
        <div
            onMouseDown={(e) => closeOnBackdrop && e.target === e.currentTarget && onClose()}
            className="idx-fade fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        >
            <div
                className={`idx-pop flex max-h-full w-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30 ${
                    wide ? 'max-w-2xl' : 'max-w-lg'
                }`}
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]}`}>
                            <Icon type={icon} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-slate-900">{title}</h2>
                            {subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                <div className="idx-scroll overflow-y-auto bg-slate-50/60 px-6 py-5">{children}</div>

                {footer && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/* Dialog konfirmasi */
function KonfirmasiModal({ dialog, busy, onCancel }) {
    if (!dialog) return null;

    const merah = dialog.tone === 'red';

    return (
        <div
            onClick={() => !busy && onCancel()}
            className="idx-fade fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                className="idx-pop w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="px-6 pb-2 pt-6 text-center">
                    <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                        <span className={`idx-ping absolute inset-0 rounded-full ${merah ? 'bg-red-400/40' : 'bg-blue-400/40'}`} />
                        <span
                            className={`relative flex h-16 w-16 items-center justify-center rounded-full ${
                                merah
                                    ? 'bg-gradient-to-br from-red-50 to-rose-100 text-red-600'
                                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600'
                            }`}
                        >
                            <Icon type={merah ? 'trash' : 'check'} className="h-7 w-7" />
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
                            merah
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'
                        }`}
                    >
                        {busy && <span className="idx-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />}
                        {busy ? 'Memproses...' : dialog.confirmLabel ?? 'Ya'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const emptyForm = {
    id: null,
    no_dok: '',
    proses: '',
    proses_penting: '',
    tanggal_revisi: '',
    catatan: '',
    file: null,
    punyaFile: false,
};

/* ==================================================================
| HALAMAN UTAMA
================================================================== */
export default function Index({ documents = [], flash }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [search, setSearch] = useState('');

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [viewId, setViewId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const viewDoc = documents.find((d) => d.id === viewId) ?? null;
    const deleteDoc = documents.find((d) => d.id === deleteId) ?? null;

    /* ---------------- RINGKASAN ---------------- */
    const totalDokumen = documents.length;

    const dokumenTersedia = documents.filter(
        (d) => Array.isArray(d.revisions) && d.revisions.length > 0
    ).length;

    const totalVersi = documents.reduce(
        (n, d) => n + (Array.isArray(d.revisions) ? d.revisions.length : 0),
        0
    );

    // 3 dokumen dengan tanggal revisi terbaru
    const dokumenTerbaru = useMemo(() => {
        return [...documents]
            .map((doc) => ({
                ...doc,
                latestRevision: getLatestRevision(doc),
                latestDate: getLatestDate(doc),
            }))
            .filter((doc) => doc.latestDate)
            .sort((a, b) => {
                const dateA = String(a.latestDate ?? '');
                const dateB = String(b.latestDate ?? '');

                if (dateA !== dateB) {
                    return dateB.localeCompare(dateA);
                }

                return Number(b.latestRevision?.revisi_ke ?? 0) - Number(a.latestRevision?.revisi_ke ?? 0);
            })
            .slice(0, 3);
    }, [documents]);

    const stats = [
        {
            label: 'Total dokumen',
            value: totalDokumen,
            hint: 'SOP & IK Maintenance',
            icon: 'file',
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Dokumen berfile',
            value: dokumenTersedia,
            hint: `${totalDokumen - dokumenTersedia} belum ada file`,
            icon: 'check',
            tone: 'from-emerald-500 to-green-600',
            soft: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Total versi',
            value: totalVersi,
            hint: 'Seluruh revisi tersimpan',
            icon: 'layers',
            tone: 'from-violet-500 to-purple-600',
            soft: 'bg-violet-50 text-violet-600',
        },
        {
            label: 'Pembaruan terakhir',
            value: fmtDate(dokumenTerbaru[0]?.latestDate),
            hint: dokumenTerbaru[0]?.no_dok ?? 'Belum ada pembaruan',
            icon: 'clock',
            tone: 'from-cyan-500 to-sky-600',
            soft: 'bg-cyan-50 text-cyan-600',
        },
    ];

    /* ---------------- TOAST ---------------- */
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!showSuccess) return;

        const t = setTimeout(() => setShowSuccess(false), 4000);

        return () => clearTimeout(t);
    }, [showSuccess]);

    useEffect(() => {
        if (!errorMessage) return;

        const t = setTimeout(() => setErrorMessage(''), 5000);

        return () => clearTimeout(t);
    }, [errorMessage]);

    /* ---------------- TOMBOL ESC ---------------- */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;

            if (confirmDialog) {
                if (!confirmBusy) setConfirmDialog(null);
            } else if (form) {
                if (!saving) setForm(null);
            } else if (viewId) {
                setViewId(null);
            } else if (deleteId) {
                setDeleteId(null);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [confirmDialog, confirmBusy, form, saving, viewId, deleteId]);

    /* ---------------- TAMBAH / EDIT ---------------- */
    const openForm = (doc = null) => {
        setErrors({});

        setForm(
            doc
                ? {
                      ...emptyForm,
                      id: doc.id,
                      no_dok: doc.no_dok,
                      proses: doc.proses,
                      proses_penting: doc.proses_penting ?? '',
                      tanggal_revisi: doc.tanggal_revisi ?? '',
                      punyaFile: Array.isArray(doc.revisions) && doc.revisions.length > 0,
                  }
                : { ...emptyForm }
        );
    };

    const kirim = () => {
        const body = {
            no_dok: form.no_dok,
            proses: form.proses,
            proses_penting: form.proses_penting,
            tanggal_revisi: form.tanggal_revisi,
        };

        if (form.file) {
            body.file = form.file;
            body.catatan = form.catatan;
        }

        const opsi = {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onSuccess: () => setForm(null),
            onError: (e) => setErrors(e),
        };

        if (form.id) {
            router.post(`/sop-ik/${form.id}`, { ...body, _method: 'put' }, opsi);
        } else {
            router.post('/sop-ik', body, opsi);
        }
    };

    const simpan = () => {
        const baru = !form.id;

        setConfirmDialog({
            title: baru ? 'Tambah dokumen?' : 'Simpan data edit?',
            message: baru
                ? `Apakah kamu yakin ingin menambahkan dokumen ${form.no_dok || 'ini'}?`
                : form.file && form.punyaFile
                  ? 'Apakah kamu yakin ingin menyimpan data edit ini? Dokumen baru akan tersimpan sebagai revisi, dan dokumen sebelumnya tetap ada.'
                  : 'Apakah kamu yakin ingin menyimpan data edit ini?',
            confirmLabel: baru ? 'Ya, Tambah' : 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                kirim();
            },
        });
    };

    /* ---------------- HAPUS REVISI ---------------- */
    const confirmDeleteRevision = (doc, r) => {
        setConfirmDialog({
            title: 'Hapus versi dokumen?',
            message: `Apakah kamu yakin ingin menghapus versi ${fmtDate(r.tanggal)} (${r.file_name})?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setConfirmBusy(true);

                router.delete(`/sop-ik/${doc.id}/revisions/${r.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onError: (e) => setErrorMessage(Object.values(e)[0] ?? 'Gagal menghapus versi.'),
                    onFinish: () => {
                        setConfirmBusy(false);
                        setConfirmDialog(null);
                    },
                });
            },
        });
    };

    /* ---------------- HAPUS SELURUH DOKUMEN ---------------- */
    const confirmDeleteAll = (doc) => {
        setConfirmDialog({
            title: 'Hapus seluruh data?',
            message: `Apakah kamu yakin ingin menghapus ${doc.no_dok} beserta semua versi dokumennya? Tindakan ini tidak dapat dibatalkan.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setConfirmBusy(true);

                router.delete(`/sop-ik/${doc.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => setDeleteId(null),
                    onFinish: () => {
                        setConfirmBusy(false);
                        setConfirmDialog(null);
                    },
                });
            },
        });
    };

    /* ---------------- PENCARIAN ---------------- */
    const q = search.trim().toLowerCase();

    const tampil = q
        ? documents.filter((d) =>
              `${d.no_dok} ${d.proses} ${d.proses_penting ?? ''}`.toLowerCase().includes(q)
          )
        : documents;

    const delay = (ms) => ({ animationDelay: `${ms}ms` });

    const th =
        'whitespace-nowrap border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3 text-center text-[11px] font-semibold tracking-wide last:border-r-0';

    const td = 'border-b border-r border-slate-100 px-4 py-3 align-top last:border-r-0';

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />

            <Head title="Daftar Isi SOP/IK" />

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
                                    Daftar Isi SOP/IK Maintenance
                                </h1>
                                <p className="truncate text-xs text-blue-200/80">
                                    Dokumen, informasi, dan riwayat revisi
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

                    {/* DOKUMEN TERAKHIR DIPERBARUI */}
                    <section style={delay(280)} className={`idx-rise mb-4 ${card}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Dokumen Terakhir Diperbarui</h3>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    3 dokumen dengan tanggal revisi terbaru
                                </p>
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="idx-ping absolute inset-0 rounded-full bg-blue-500" />
                                    <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
                                </span>
                                Pembaruan terbaru
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
                            {dokumenTerbaru.length === 0 && (
                                <div className="col-span-full flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <Icon type="file" className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">Belum ada pembaruan dokumen</p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Dokumen dengan riwayat tanggal revisi akan muncul di sini.
                                    </p>
                                </div>
                            )}

                            {dokumenTerbaru.map((doc, index) => (
                                <button
                                    key={doc.id}
                                    type="button"
                                    onClick={() => setViewId(doc.id)}
                                    style={delay(index * 60)}
                                    className="idx-rise group relative min-w-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10"
                                >
                                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:-rotate-6 group-hover:bg-blue-600 group-hover:text-white">
                                                <Icon type="file" className="h-4 w-4" />
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold text-blue-700">{doc.no_dok}</p>
                                                <p className="truncate text-[11px] text-slate-400">
                                                    {doc.latestRevision
                                                        ? `Revisi ${doc.latestRevision.revisi_ke}`
                                                        : 'Informasi dokumen'}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <p className="mt-3 line-clamp-2 min-h-[34px] text-xs font-semibold leading-snug text-slate-700">
                                        {doc.proses || '-'}
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                                        <Icon type="calendar" className="h-3.5 w-3.5" />
                                        <span>Diperbarui {fmtDate(doc.latestDate)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* DAFTAR SELURUH DOKUMEN */}
                    <section style={delay(360)} className={`idx-rise overflow-hidden ${card}`}>
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                        Daftar Seluruh Dokumen
                                    </h2>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {totalDokumen} dokumen
                                    </span>
                                    {q && (
                                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600">
                                            {tampil.length} hasil pencarian
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Kelola data SOP dan IK beserta riwayat revisinya.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="relative w-full sm:w-72">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Icon type="search" className="h-4 w-4" />
                                    </span>

                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari no dok / proses..."
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            aria-label="Hapus pencarian"
                                            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                        >
                                            <Icon type="close" className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openForm()}
                                    className="group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                                >
                                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                    <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                    <span className="relative">Tambah Dokumen</span>
                                </button>
                            </div>
                        </div>

                        <div className="idx-scroll w-full overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-[13px]">
                                <thead className="text-white">
                                    <tr className="bg-[#0b1a4d]">
                                        <th className={`${th} w-14`}>No</th>
                                        <th className={`${th} w-56`}>No Dok</th>
                                        <th className={`${th} min-w-[260px] !text-left`}>Proses</th>
                                        <th className={`${th} w-40`}>Proses Penting</th>
                                        <th className={`${th} w-36`}>Tanggal Revisi</th>
                                        <th className={`${th} min-w-[300px] !text-left`}>Keterangan</th>
                                        <th className={`${th} w-36`}>Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tampil.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                        <Icon type="file" className="h-7 w-7 text-slate-400" />
                                                    </div>
                                                    <p className="font-semibold text-slate-700">
                                                        {documents.length === 0
                                                            ? 'Belum ada dokumen'
                                                            : 'Tidak ada dokumen yang cocok'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {documents.length === 0
                                                            ? 'Klik Tambah Dokumen untuk mulai mengisi daftar.'
                                                            : 'Coba kata kunci lain atau hapus pencarian.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {tampil.map((d, i) => {
                                        const revisions = Array.isArray(d.revisions) ? d.revisions : [];
                                        const riwayat = revisions.filter((r) => r.revisi_ke > 1);
                                        const latestRevision = getLatestRevision(d);

                                        return (
                                            <tr
                                                key={d.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className="idx-row group transition-colors duration-200 even:bg-slate-50/50 hover:bg-blue-50/50"
                                            >
                                                <td className={`${td} bg-slate-50/80 text-center font-semibold text-slate-500`}>
                                                    {i + 1}
                                                </td>

                                                <td className={`${td} text-center`}>
                                                    {latestRevision?.file_url ? (
                                                        <a
                                                            href={latestRevision.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Buka dokumen terbaru"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                                        >
                                                            <Icon type="file" className="h-3.5 w-3.5" />
                                                            {d.no_dok}
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                                            {d.no_dok}
                                                        </span>
                                                    )}

                                                    {revisions.length > 0 && (
                                                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                                                            {revisions.length} versi
                                                        </p>
                                                    )}
                                                </td>

                                                <td className={`${td} font-semibold text-slate-800`}>{d.proses}</td>

                                                <td className={`${td} text-center`}>
                                                    {d.proses_penting ? (
                                                        <span className="inline-flex rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
                                                            {d.proses_penting}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>

                                                <td className={`${td} whitespace-nowrap text-center`}>
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                        <Icon type="calendar" className="h-3.5 w-3.5 text-slate-400" />
                                                        {fmtDate(d.tanggal_revisi)}
                                                    </span>
                                                </td>

                                                <td className={td}>
                                                    {riwayat.length === 0 ? (
                                                        <span className="text-slate-300">-</span>
                                                    ) : (
                                                        <ul className="space-y-1.5 border-l-2 border-slate-100 pl-3">
                                                            {riwayat.map((r) => (
                                                                <li
                                                                    key={r.id}
                                                                    className="relative text-xs leading-snug text-slate-600"
                                                                >
                                                                    <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-blue-400" />

                                                                    {r.file_url ? (
                                                                        <a
                                                                            href={r.file_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            title={r.file_name}
                                                                            className="font-bold text-blue-700 hover:underline"
                                                                        >
                                                                            {fmtDate(r.tanggal)}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="font-bold text-slate-600">
                                                                            {fmtDate(r.tanggal)}
                                                                        </span>
                                                                    )}

                                                                    {r.catatan ? ` — ${r.catatan}` : ''}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>

                                                <td className={td}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title="Lihat"
                                                            aria-label="Lihat"
                                                            onClick={() => setViewId(d.id)}
                                                            className={`${iconBtn} bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-sky-500/30`}
                                                        >
                                                            <Icon type="eye" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Edit"
                                                            aria-label="Edit"
                                                            onClick={() => openForm(d)}
                                                            className={`${iconBtn} bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white hover:shadow-slate-500/30`}
                                                        >
                                                            <Icon type="edit" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Hapus"
                                                            aria-label="Hapus"
                                                            onClick={() => setDeleteId(d.id)}
                                                            className={`${iconBtn} bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-500/30`}
                                                        >
                                                            <Icon type="trash" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                            <p className="text-sm text-slate-500">
                                Menampilkan{' '}
                                <span className="font-semibold text-slate-700">{tampil.length}</span> dari{' '}
                                <span className="font-semibold text-slate-700">{documents.length}</span> dokumen
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="cursor-pointer text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                                >
                                    Reset pencarian
                                </button>
                            )}
                        </div>
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Daftar Isi SOP/IK
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

            {/* TOAST GALAT */}
            {errorMessage && (
                <Toast
                    tone="red"
                    icon="alert"
                    title="Tidak bisa diproses"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            {/* MODAL TAMBAH / EDIT */}
            {form && (
                <ModalShell
                    icon={form.id ? 'edit' : 'plus'}
                    title={form.id ? 'Edit Dokumen' : 'Tambah Dokumen'}
                    subtitle={
                        form.id && form.punyaFile
                            ? 'Upload dokumen baru untuk membuat revisi, dokumen lama tetap tersimpan'
                            : 'Isi informasi dokumen SOP / IK'
                    }
                    closeOnBackdrop={false}
                    onClose={() => !saving && setForm(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setForm(null)} disabled={saving} className={btnGhost}>
                                Batal
                            </button>

                            <button type="button" onClick={simpan} disabled={saving} className={btnPrimary}>
                                {saving && (
                                    <span className="idx-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                )}
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <Field label="No Dokumen" error={errors.no_dok}>
                                <input
                                    autoFocus
                                    value={form.no_dok}
                                    onChange={(e) => setForm({ ...form, no_dok: e.target.value })}
                                    placeholder="contoh: IK006-FJI-PD-46"
                                    className={`${inputClass} font-mono`}
                                />
                            </Field>

                            <Field label="Proses" error={errors.proses}>
                                <input
                                    value={form.proses}
                                    onChange={(e) => setForm({ ...form, proses: e.target.value })}
                                    placeholder="contoh: SOP START UP MESIN SHIMA"
                                    className={inputClass}
                                />
                            </Field>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Field label="Proses Penting" error={errors.proses_penting}>
                                    <input
                                        value={form.proses_penting}
                                        onChange={(e) => setForm({ ...form, proses_penting: e.target.value })}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Tanggal Revisi" error={errors.tanggal_revisi}>
                                    <input
                                        type="date"
                                        value={form.tanggal_revisi}
                                        onChange={(e) => setForm({ ...form, tanggal_revisi: e.target.value })}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* UPLOAD FILE */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                                {form.id && form.punyaFile
                                    ? 'Upload Dokumen Baru (opsional)'
                                    : 'File Dokumen (opsional)'}
                            </p>

                            <label
                                className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
                                    form.file
                                        ? 'border-emerald-300 bg-emerald-50/60'
                                        : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
                                }`}
                            >
                                <span
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                        form.file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                    }`}
                                >
                                    <Icon type={form.file ? 'check' : 'upload'} className="h-5 w-5" />
                                </span>

                                <span className="max-w-full truncate text-sm font-semibold text-slate-700">
                                    {form.file ? form.file.name : 'Klik untuk memilih file'}
                                </span>

                                <span className="text-[11px] text-slate-400">PDF, DOC, DOCX, XLS, XLSX</span>

                                <input
                                    key={form.file ? 'ada' : 'kosong'}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={(e) => setForm({ ...form, file: e.target.files[0] ?? null })}
                                    className="hidden"
                                />
                            </label>

                            {form.file && (
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, file: null, catatan: '' })}
                                    className="mt-2 cursor-pointer text-xs font-semibold text-red-600 transition hover:text-red-700"
                                >
                                    Hapus file terpilih
                                </button>
                            )}

                            {errors.file && (
                                <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                    <Icon type="alert" className="h-3 w-3" />
                                    {errors.file}
                                </span>
                            )}

                            {form.id && form.punyaFile && form.file && (
                                <div className="idx-pop mt-3">
                                    <Field label="Catatan Revisi" error={errors.catatan}>
                                        <textarea
                                            rows={3}
                                            value={form.catatan}
                                            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                            placeholder="Apa yang diperbaiki di dokumen baru ini?"
                                            className={`${inputClass} h-auto resize-none py-2.5`}
                                        />
                                    </Field>

                                    <p className="mt-1.5 text-[11px] text-slate-400">
                                        Tanggal di riwayat keterangan terisi otomatis (hari ini).
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalShell>
            )}

            {/* MODAL LIHAT DETAIL */}
            {viewDoc && (
                <ModalShell
                    wide
                    tone="sky"
                    icon="eye"
                    title={viewDoc.no_dok}
                    subtitle={viewDoc.proses}
                    onClose={() => setViewId(null)}
                    footer={
                        <button type="button" onClick={() => setViewId(null)} className={btnPrimary}>
                            Tutup
                        </button>
                    }
                >
                    <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <div className="rounded-xl bg-white px-3.5 py-3 ring-1 ring-slate-100">
                            <p className="text-[11px] font-medium text-slate-400">Proses Penting</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-700">
                                {viewDoc.proses_penting || '-'}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white px-3.5 py-3 ring-1 ring-slate-100">
                            <p className="text-[11px] font-medium text-slate-400">Tanggal Revisi</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-700">
                                {fmtDate(viewDoc.tanggal_revisi)}
                            </p>
                        </div>
                    </div>

                    <h3 className="mb-2 text-sm font-bold text-slate-800">Semua Versi Dokumen</h3>

                    {(!viewDoc.revisions || viewDoc.revisions.length === 0) && (
                        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-3 py-8 text-center">
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Icon type="file" className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Belum ada file dokumen</p>
                        </div>
                    )}

                    <ul className="space-y-2">
                        {(viewDoc.revisions ?? []).map((r, i) => {
                            const latest = getLatestRevision(viewDoc);
                            const isLatest = latest?.id === r.id;

                            return (
                                <li
                                    key={r.id}
                                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                                    className={`idx-rise flex items-start justify-between gap-3 rounded-xl border bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                        isLatest ? 'border-emerald-200' : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span
                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                isLatest ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <Icon type="file" className="h-4 w-4" />
                                        </span>

                                        <div className="min-w-0 text-sm">
                                            <p className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
                                                {fmtDate(r.tanggal)}

                                                {isLatest && (
                                                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                                                        TERBARU
                                                    </span>
                                                )}
                                            </p>

                                            <p className="mt-0.5 text-slate-600">
                                                {r.revisi_ke === 1 ? 'Dokumen awal' : r.catatan || '-'}
                                            </p>

                                            <p className="mt-0.5 truncate text-xs text-slate-400">{r.file_name}</p>
                                        </div>
                                    </div>

                                    {r.file_url && (
                                        <a
                                            href={r.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                        >
                                            <Icon type="open" className="h-3.5 w-3.5" />
                                            Buka
                                        </a>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </ModalShell>
            )}

            {/* MODAL HAPUS */}
            {deleteDoc && (
                <ModalShell
                    wide
                    tone="red"
                    icon="trash"
                    title="Hapus Dokumen"
                    subtitle={`${deleteDoc.no_dok} · ${deleteDoc.proses}`}
                    onClose={() => setDeleteId(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setDeleteId(null)} className={btnGhost}>
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={() => confirmDeleteAll(deleteDoc)}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <Icon type="trash" className="h-4 w-4" />
                                Hapus Seluruh Data
                            </button>
                        </>
                    }
                >
                    <h3 className="mb-2 text-sm font-bold text-slate-800">Hapus per versi dokumen</h3>

                    {(!deleteDoc.revisions || deleteDoc.revisions.length === 0) && (
                        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-3 py-8 text-center">
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Icon type="file" className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Dokumen ini belum punya file</p>
                        </div>
                    )}

                    <ul className="space-y-2">
                        {(deleteDoc.revisions ?? []).map((r, i) => (
                            <li
                                key={r.id}
                                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                                className="idx-rise flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                        <Icon type="file" className="h-4 w-4" />
                                    </span>

                                    <div className="min-w-0 text-sm">
                                        <p className="font-bold text-slate-800">{fmtDate(r.tanggal)}</p>
                                        <p className="truncate text-xs text-slate-500">
                                            {r.revisi_ke === 1 ? 'Dokumen awal' : r.catatan || r.file_name}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => confirmDeleteRevision(deleteDoc, r)}
                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-500/30"
                                >
                                    <Icon type="trash" className="h-3.5 w-3.5" />
                                    Hapus versi
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
                        <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            Versi terakhir tidak bisa dihapus satuan. Pakai "Hapus Seluruh Data" untuk menghapus
                            dokumen beserta semua versinya.
                        </span>
                    </div>
                </ModalShell>
            )}

            {/* DIALOG KONFIRMASI */}
            <KonfirmasiModal dialog={confirmDialog} busy={confirmBusy} onCancel={() => setConfirmDialog(null)} />
        </>
    );
}