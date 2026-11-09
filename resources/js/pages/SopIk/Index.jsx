import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
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
| STYLE TOKENS (sama dengan halaman Schedule Preventif)
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50';

const btnPrimary =
    'cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2025-08-18" -> "18-Aug-25"
function fmtDate(s) {
    if (!s) return '';
    const [y, m, d] = String(s).slice(0, 10).split('-');
    return `${d}-${MON[Number(m) - 1]}-${y.slice(2)}`;
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
        </label>
    );
}

function ModalShell({ title, subtitle, onClose, footer, wide = false, children }) {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div
                className={`w-full overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40 ${
                    wide ? 'max-w-2xl' : 'max-w-lg'
                }`}
            >
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900">{title}</h2>
                        {subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

                {footer && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
| MODAL KONFIRMASI (selalu di atas modal lain)
------------------------------------------------------------------ */
function KonfirmasiModal({ dialog, loading, onCancel }) {
    if (!dialog) return null;

    const merah = dialog.tone === 'red';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
            >
                <div
                    className={`absolute left-0 right-0 top-0 h-1.5 ${
                        merah
                            ? 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-400'
                            : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400'
                    }`}
                />

                <div className="px-6 pb-6 pt-8">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                        <div className={`absolute inset-0 rounded-2xl blur-xl ${merah ? 'bg-red-200' : 'bg-blue-200'}`} />
                        <div
                            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ${
                                merah
                                    ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-300/50'
                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-300/50'
                            }`}
                        >
                            {merah ? '!' : '?'}
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <h3 className="text-lg font-bold tracking-tight text-slate-900">{dialog.title}</h3>
                        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-slate-500">
                            {dialog.message}
                        </p>
                    </div>

                    <div className="mt-7 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={() => dialog.onConfirm?.()}
                            disabled={loading}
                            className={`flex-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                merah ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {loading ? 'Memproses...' : dialog.confirmLabel ?? 'Ya'}
                        </button>
                    </div>
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
    punyaFile: false, // dokumen ini sudah pernah punya file atau belum
};

export default function Index({ documents = [], flash }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [search, setSearch] = useState('');

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [form, setForm] = useState(null); // modal tambah / edit
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [viewId, setViewId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const viewDoc = documents.find((d) => d.id === viewId) ?? null;
    const deleteDoc = documents.find((d) => d.id === deleteId) ?? null;

    /* ---------------- toast ---------------- */
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

    /* ---------------- tambah / edit ---------------- */
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
                      punyaFile: doc.revisions.length > 0,
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

    // Tambah dan edit sama-sama minta konfirmasi dulu.
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

    /* ---------------- hapus ---------------- */
    const confirmDeleteRevision = (doc, r) => {
        setConfirmDialog({
            title: 'Hapus versi dokumen?',
            message: `Apakah kamu yakin ingin menghapus versi ${fmtDate(r.tanggal)} (${r.file_name})?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/sop-ik/${doc.id}/revisions/${r.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onError: (e) => setErrorMessage(Object.values(e)[0] ?? 'Gagal menghapus versi.'),
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    const confirmDeleteAll = (doc) => {
        setConfirmDialog({
            title: 'Hapus seluruh data?',
            message: `Apakah kamu yakin ingin menghapus ${doc.no_dok} beserta semua versi dokumennya?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/sop-ik/${doc.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => setDeleteId(null),
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    /* ---------------- filter ---------------- */
    const q = search.trim().toLowerCase();
    const tampil = q
        ? documents.filter((d) => `${d.no_dok} ${d.proses}`.toLowerCase().includes(q))
        : documents;

    const th = 'px-4 py-3 text-center font-bold';
    const td = 'border-b border-slate-200 px-4 py-2.5 align-top';

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Daftar Isi SOP/IK" />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-2.5 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                            title="Menu"
                        >
                            <Icon type="menu" className="h-5 w-5" />
                        </button>

                        <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                            Daftar Isi SOP/IK Maintenance
                        </h1>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-4 sm:px-6">
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="bg-white p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari no dok / proses..."
                                    className="h-9 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => openForm()}
                                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                                >
                                    <Icon type="plus" className="h-4 w-4" />
                                    Tambah dokumen
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full border-separate border-spacing-0 text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900 text-[11px] uppercase tracking-wider text-white">
                                            <th className={`${th} w-14`}>No</th>
                                            <th className={`${th} w-52`}>No Dok</th>
                                            <th className={`${th} text-left`}>Proses</th>
                                            <th className={`${th} w-36`}>Proses Penting</th>
                                            <th className={`${th} w-36`}>Tanggal Revisi</th>
                                            <th className={`${th} w-80 text-left`}>Keterangan</th>
                                            <th className={`${th} w-36`}>Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tampil.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                                                    {documents.length === 0 ? 'Belum ada dokumen.' : 'Tidak ada dokumen yang cocok.'}
                                                </td>
                                            </tr>
                                        )}

                                        {tampil.map((d, i) => {
                                            // Keterangan = riwayat dari edit saja (versi 1 = dokumen awal, tidak ditampilkan)
                                            const riwayat = d.revisions.filter((r) => r.revisi_ke > 1);

                                            return (
                                                <tr key={d.id} className="hover:bg-blue-50/50">
                                                    <td className={`${td} text-center font-semibold text-slate-600`}>{i + 1}</td>
                                                    <td className={`${td} text-center`}>
                                                        {d.revisions[0] ? (
                                                            <a
                                                                href={d.revisions[0].file_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                title="Buka dokumen terbaru"
                                                                className="font-semibold text-blue-700 hover:underline"
                                                            >
                                                                {d.no_dok}
                                                            </a>
                                                        ) : (
                                                            d.no_dok
                                                        )}
                                                    </td>
                                                    <td className={`${td} text-slate-700`}>{d.proses}</td>
                                                    <td className={`${td} text-center text-slate-700`}>{d.proses_penting}</td>
                                                    <td className={`${td} text-center text-slate-700`}>{fmtDate(d.tanggal_revisi)}</td>
                                                    <td className={td}>
                                                        {riwayat.length === 0 ? (
                                                            <span className="text-slate-300">-</span>
                                                        ) : (
                                                            <ul className="space-y-1.5">
                                                                {riwayat.map((r) => (
                                                                    <li key={r.id} className="text-xs leading-snug text-slate-600">
                                                                        <a
                                                                            href={r.file_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            title={r.file_name}
                                                                            className="font-bold text-blue-700 hover:underline"
                                                                        >
                                                                            {fmtDate(r.tanggal)}
                                                                        </a>
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
                                                                onClick={() => setViewId(d.id)}
                                                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 transition hover:bg-sky-100"
                                                            >
                                                                <Icon type="eye" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Edit"
                                                                onClick={() => openForm(d)}
                                                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                            >
                                                                <Icon type="edit" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Hapus"
                                                                onClick={() => setDeleteId(d.id)}
                                                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
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
                        </div>
                    </div>
                </main>

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Daftar Isi SOP/IK
                        </p>
                    </div>
                </footer>
            </div>

            {/* TOAST SUKSES */}
            {showSuccess && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{successMessage}</p>
                    </div>
                    <button type="button" onClick={() => setShowSuccess(false)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">×</button>
                </div>
            )}

            {/* TOAST GALAT */}
            {errorMessage && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-red-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-400 to-rose-600" />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-rose-100">
                        <span className="font-bold text-red-600">!</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Tidak bisa diproses</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{errorMessage}</p>
                    </div>
                    <button type="button" onClick={() => setErrorMessage('')} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">×</button>
                </div>
            )}

            {/* MODAL TAMBAH / EDIT */}
            {form && (
                <ModalShell
                    title={form.id ? 'Edit Dokumen' : 'Tambah Dokumen'}
                    subtitle={form.id && form.punyaFile ? 'Upload dokumen baru untuk membuat revisi, dokumen lama tetap tersimpan' : undefined}
                    onClose={() => setForm(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setForm(null)} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Batal</button>
                            <button type="button" onClick={simpan} disabled={saving} className={btnPrimary}>
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <Field label="No Dokumen" error={errors.no_dok}>
                            <input
                                autoFocus
                                value={form.no_dok}
                                onChange={(e) => setForm({ ...form, no_dok: e.target.value })}
                                placeholder="contoh: IK006-FJI-PD-46"
                                className={inputClass}
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

                        <div className="grid grid-cols-2 gap-3">
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

                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                            <Field
                                label={form.id && form.punyaFile ? 'Upload Dokumen Baru (opsional)' : 'File Dokumen (opsional)'}
                                error={errors.file}
                            >
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={(e) => setForm({ ...form, file: e.target.files[0] ?? null })}
                                    className="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </Field>

                            {form.id && form.punyaFile && form.file && (
                                <div className="mt-3">
                                    <Field label="Catatan Revisi" error={errors.catatan}>
                                        <textarea
                                            rows={3}
                                            value={form.catatan}
                                            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                            placeholder="Apa yang diperbaiki di dokumen baru ini?"
                                            className={inputClass}
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

            {/* MODAL LIHAT */}
            {viewDoc && (
                <ModalShell
                    wide
                    title={viewDoc.no_dok}
                    subtitle={viewDoc.proses}
                    onClose={() => setViewId(null)}
                    footer={
                        <button type="button" onClick={() => setViewId(null)} className={btnPrimary}>
                            Tutup
                        </button>
                    }
                >
                    <dl className="mb-5 grid grid-cols-3 gap-y-2 text-sm">
                        <dt className="font-semibold text-slate-500">Proses Penting</dt>
                        <dd className="col-span-2 text-slate-700">{viewDoc.proses_penting || '-'}</dd>
                        <dt className="font-semibold text-slate-500">Tanggal Revisi</dt>
                        <dd className="col-span-2 text-slate-700">{fmtDate(viewDoc.tanggal_revisi) || '-'}</dd>
                    </dl>

                    <h3 className="mb-2 text-sm font-bold text-slate-800">Semua Versi Dokumen</h3>
                    {viewDoc.revisions.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">
                            Belum ada file dokumen.
                        </p>
                    )}
                    <ul className="space-y-2">
                        {viewDoc.revisions.map((r, i) => (
                            <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="min-w-0 text-sm">
                                    <p className="font-bold text-slate-800">
                                        {fmtDate(r.tanggal)}
                                        {i === 0 && (
                                            <span className="ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">TERBARU</span>
                                        )}
                                    </p>
                                    <p className="mt-0.5 text-slate-600">
                                        {r.revisi_ke === 1 ? 'Dokumen awal' : r.catatan || '-'}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                                        <Icon type="file" className="h-3 w-3" /> {r.file_name}
                                    </p>
                                </div>

                                <a
                                    href={r.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                                >
                                    Buka
                                </a>
                            </li>
                        ))}
                    </ul>
                </ModalShell>
            )}

            {/* MODAL HAPUS */}
            {deleteDoc && (
                <ModalShell
                    wide
                    title="Hapus Dokumen"
                    subtitle={`${deleteDoc.no_dok} · ${deleteDoc.proses}`}
                    onClose={() => setDeleteId(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setDeleteId(null)} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Batal</button>
                            <button
                                type="button"
                                onClick={() => confirmDeleteAll(deleteDoc)}
                                className="cursor-pointer rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                            >
                                Hapus Seluruh Data
                            </button>
                        </>
                    }
                >
                    <h3 className="mb-2 text-sm font-bold text-slate-800">Hapus per versi dokumen</h3>
                    {deleteDoc.revisions.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">
                            Dokumen ini belum punya file.
                        </p>
                    )}
                    <ul className="space-y-2">
                        {deleteDoc.revisions.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <div className="min-w-0 text-sm">
                                    <p className="font-bold text-slate-800">{fmtDate(r.tanggal)}</p>
                                    <p className="truncate text-xs text-slate-500">
                                        {r.revisi_ke === 1 ? 'Dokumen awal' : r.catatan || r.file_name}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => confirmDeleteRevision(deleteDoc, r)}
                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                >
                                    <Icon type="trash" className="h-3.5 w-3.5" /> Hapus versi
                                </button>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        Versi terakhir tidak bisa dihapus satuan. Pakai "Hapus Seluruh Data" untuk menghapus dokumen beserta semua versinya.
                    </p>
                </ModalShell>
            )}

            {/* DIALOG KONFIRMASI */}
            <KonfirmasiModal dialog={confirmDialog} loading={saving} onCancel={() => setConfirmDialog(null)} />
        </>
    );
}
