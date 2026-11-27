import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Check,
    Copy,
    FileText,
    HelpCircle,
    Layers,
    Pencil,
    Plus,
    QrCode,
    Save,
    Trash2,
    X,
} from 'lucide-react';

const card =
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]';
const input =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100';
const btnPrimary =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60';

/* ------------------------------------------------------------------
| Modal konfirmasi (pengganti confirm() bawaan browser)
------------------------------------------------------------------ */
const TONES = {
    danger: {
        icon: AlertTriangle,
        iconWrap: 'bg-red-100 text-red-600',
        button: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-200',
    },
    primary: {
        icon: Save,
        iconWrap: 'bg-blue-100 text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-200',
    },
    warning: {
        icon: Pencil,
        iconWrap: 'bg-amber-100 text-amber-600',
        button: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-200',
    },
    info: {
        icon: HelpCircle,
        iconWrap: 'bg-indigo-100 text-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-200',
    },
};

function ConfirmModal({
    open,
    tone = 'primary',
    title,
    message,
    confirmText = 'Ya',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (e) => e.key === 'Escape' && onCancel();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onCancel]);

    if (!open || typeof document === 'undefined') return null;

    const t = TONES[tone] ?? TONES.primary;
    const Icon = t.icon;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${t.iconWrap}`}>
                    <Icon className="h-7 w-7" />
                </span>

                <h3 className="mt-4 text-base font-extrabold text-slate-900">{title}</h3>
                {message && (
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-500">{message}</p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        autoFocus
                        className={`h-10 cursor-pointer rounded-xl text-xs font-bold text-white shadow-sm outline-none transition focus-visible:ring-4 ${t.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* Pemakaian: const [ask, modal] = useConfirm();  ask({ title, message, tone, confirmText, onConfirm }) */
function useConfirm() {
    const [dlg, setDlg] = useState(null);

    const ask = (opts) => setDlg(opts);
    const close = () => setDlg(null);

    const modal = (
        <ConfirmModal
            open={dlg !== null}
            {...(dlg ?? {})}
            onCancel={close}
            onConfirm={() => {
                const fn = dlg?.onConfirm;
                close();
                fn?.();
            }}
        />
    );

    return [ask, modal];
}

/* ------------------------------------------------------------------
| 1 line + check sheet (mesin) miliknya
------------------------------------------------------------------ */
function BarisLine({ line, sheets, saudara }) {
    const [buka, setBuka] = useState(true);
    const [salinMode, setSalinMode] = useState(false);
    const [tujuan, setTujuan] = useState([]);
    const [ask, modal] = useConfirm();

    const hapusLine = () =>
        ask({
            tone: 'danger',
            title: 'Apakah yakin mau hapus?',
            message: `Line "${line.nama_line}" akan dihapus.`,
            confirmText: 'Ya, Hapus',
            onConfirm: () => router.delete(`/master/lines/${line.id}`, { preserveScroll: true }),
        });

    const hapusSheet = (s) =>
        ask({
            tone: 'danger',
            title: 'Apakah yakin mau hapus?',
            message: `${s.nama_checksheet} akan dihapus dari ${line.nama_line}.`,
            confirmText: 'Ya, Hapus',
            onConfirm: () => router.delete(`/check-sheets/${s.id}`, { preserveScroll: true }),
        });

    const editSheet = (s) =>
        ask({
            tone: 'warning',
            title: 'Apakah yakin mau edit?',
            message: `${s.nama_checksheet} akan dibuka untuk diedit.`,
            confirmText: 'Ya, Edit',
            onConfirm: () => router.visit(`/check-sheets/${s.id}/edit`),
        });

    const toggleTujuan = (id) =>
        setTujuan((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const salin = () => {
        if (tujuan.length === 0) return;

        ask({
            tone: 'info',
            title: 'Apakah yakin mau salin?',
            message:
                `${sheets.length} check sheet dari ${line.nama_line} akan disalin ke ${tujuan.length} line lain.\n` +
                'Yang namanya sudah ada di line tujuan akan dilewati.',
            confirmText: 'Ya, Salin',
            onConfirm: () =>
                router.post(
                    '/check-sheets/salin-line',
                    { sumber_line_id: line.id, tujuan_line_ids: tujuan },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSalinMode(false);
                            setTujuan([]);
                        },
                    }
                ),
        });
    };

    return (
        <li className="rounded-xl border border-slate-200 bg-slate-50/60">
            {modal}

            {/* header line */}
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <button
                    type="button"
                    onClick={() => setBuka((v) => !v)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                >
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-800">{line.nama_line}</span>
                        <span className="block text-[11px] text-slate-400">{sheets.length} mesin / check sheet</span>
                    </span>
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                    {saudara.length > 0 && sheets.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setSalinMode((v) => !v)}
                            title="Salin semua mesin ke line lain"
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${
                                salinMode ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-500 hover:bg-indigo-50'
                            }`}
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={hapusLine}
                        title="Hapus line"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* panel salin */}
            {salinMode && (
                <div className="mx-3 mb-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
                    <p className="mb-2 text-[11px] font-bold text-indigo-800">
                        Salin {sheets.length} mesin (beserta inspection point) ke:
                    </p>

                    <div className="space-y-1.5">
                        {saudara.map((s) => (
                            <label
                                key={s.id}
                                className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={tujuan.includes(s.id)}
                                    onChange={() => toggleTujuan(s.id)}
                                    className="h-3.5 w-3.5 cursor-pointer accent-indigo-600"
                                />
                                {s.nama_line}
                            </label>
                        ))}
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSalinMode(false);
                                setTujuan([]);
                            }}
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={salin}
                            disabled={tujuan.length === 0}
                            className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Salin
                        </button>
                    </div>
                </div>
            )}

            {/* daftar mesin (check sheet) milik line ini */}
            {buka && (
                <div className="border-t border-slate-200 px-3 pb-3 pt-2">
                    {sheets.length === 0 ? (
                        <p className="py-2 text-center text-[11px] text-slate-400">Belum ada mesin / check sheet.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {sheets.map((s) => (
                                <li
                                    key={s.id}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-200/70"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                                        <div className="min-w-0">
                                            <p
                                                className="truncate text-xs font-semibold text-slate-800"
                                               
                                            >
                                                {s.nama_checksheet}
                                            </p>
                                            <p className="font-mono text-[10px] text-slate-400">
                                                {s.nomor_dokumen} · {s.kode}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => editSheet(s)}
                                            title="Edit check sheet"
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => hapusSheet(s)}
                                            title="Hapus check sheet"
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        href={`/check-sheets/create?line_id=${line.id}`}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Mesin / Check Sheet
                    </Link>
                </div>
            )}
        </li>
    );
}

/* ------------------------------------------------------------------
| Kartu divisi
------------------------------------------------------------------ */
function KartuDivisi({ divisi, lines, checkSheets }) {
    const [editNama, setEditNama] = useState(null);
    const tambah = useForm({ nama_line: '' });
    const [ask, modal] = useConfirm();

    const simpanNama = () => {
        if (!editNama || !editNama.trim()) return;

        ask({
            tone: 'warning',
            title: 'Apakah yakin mau edit?',
            message: `Nama divisi "${divisi.nama_divisi}" akan diubah menjadi "${editNama.trim()}".`,
            confirmText: 'Ya, Simpan',
            onConfirm: () =>
                router.put(
                    `/master/divisi/${divisi.id}`,
                    { nama_divisi: editNama },
                    { preserveScroll: true, onSuccess: () => setEditNama(null) }
                ),
        });
    };

    const hapusDivisi = () =>
        ask({
            tone: 'danger',
            title: 'Apakah yakin mau hapus?',
            message: `Divisi "${divisi.nama_divisi}" beserta semua line-nya akan dihapus.`,
            confirmText: 'Ya, Hapus',
            onConfirm: () => router.delete(`/master/divisi/${divisi.id}`, { preserveScroll: true }),
        });

    const submitLine = (e) => {
        e.preventDefault();
        if (!tambah.data.nama_line.trim()) return;

        ask({
            tone: 'primary',
            title: 'Apakah yakin mau simpan?',
            message: `Line "${tambah.data.nama_line.trim()}" akan ditambahkan ke divisi ${divisi.nama_divisi}.`,
            confirmText: 'Ya, Simpan',
            onConfirm: () =>
                tambah.post(`/master/divisi/${divisi.id}/lines`, {
                    preserveScroll: true,
                    onSuccess: () => tambah.reset(),
                }),
        });
    };

    return (
        <article className={`${card} p-5`}>
            {modal}

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    {editNama === null ? (
                        <h3 className="truncate text-base font-extrabold text-slate-900">{divisi.nama_divisi}</h3>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                value={editNama}
                                onChange={(e) => setEditNama(e.target.value)}
                                className={input}
                                autoFocus
                            />
                            <button type="button" onClick={simpanNama} className="cursor-pointer text-emerald-600">
                                <Check className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditNama(null)}
                                className="cursor-pointer text-slate-400"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {lines.length} line · {checkSheets.length} mesin / check sheet
                    </p>
                </div>

                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setEditNama(divisi.nama_divisi)}
                        title="Ubah nama"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={hapusDivisi}
                        title="Hapus divisi"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <ul className="mt-4 space-y-2.5">
                {lines.map((l) => (
                    <BarisLine
                        key={l.id}
                        line={l}
                        sheets={checkSheets.filter((s) => s.line_id === l.id)}
                        saudara={lines.filter((x) => x.id !== l.id)}
                    />
                ))}
            </ul>

            <form onSubmit={submitLine} className="mt-4 flex gap-2">
                <input
                    value={tambah.data.nama_line}
                    onChange={(e) => tambah.setData('nama_line', e.target.value)}
                    placeholder="Tambah line..."
                    className={input}
                />
                <button type="submit" disabled={tambah.processing} className={btnPrimary}>
                    <Plus className="h-4 w-4" />
                </button>
            </form>
            {tambah.errors.nama_line && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">{tambah.errors.nama_line}</p>
            )}
        </article>
    );
}

/* ------------------------------------------------------------------
| Halaman
------------------------------------------------------------------ */
export default function Index({ divisis = [], lines = [], checkSheets = [] }) {
    const { flash, errors } = usePage().props;
    const [ask, modal] = useConfirm();

    const form = useForm({
        nama_divisi: '',
        daftar_line: '',
    });

    const submit = (e) => {
        e.preventDefault();

        ask({
            tone: 'primary',
            title: 'Apakah yakin mau simpan?',
            message: form.data.nama_divisi.trim()
                ? `Divisi "${form.data.nama_divisi.trim()}" beserta line-nya akan disimpan.`
                : 'Divisi baru akan disimpan.',
            confirmText: 'Ya, Simpan',
            onConfirm: () =>
                form.post('/master/divisi', {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                }),
        });
    };

    return (
        <>
            <Head title="Master Divisi & Line" />
            {modal}

            <div className="min-h-screen bg-slate-100">
                <header className="bg-[#071735] shadow-lg">
                    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href="/check-sheets"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-sm font-bold text-white sm:text-base">Master Divisi, Line & Mesin</h1>
                            <p className="text-[11px] text-blue-200">
                                Divisi → Line → Mesin (check sheet). Barcode dibuat per mesin.
                            </p>
                        </div>
                        <Link
                            href="/check-sheets-barcodes"
                            className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0b1d57]"
                        >
                            <QrCode className="h-4 w-4" /> Cetak Barcode
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
                    {flash?.success && (
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {flash.success}
                        </div>
                    )}
                    {errors?.hapus && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                            {errors.hapus}
                        </div>
                    )}
                    {errors?.tujuan_line_ids && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                            {errors.tujuan_line_ids}
                        </div>
                    )}

                    {/* FORM DIVISI BARU */}
                    <form onSubmit={submit} className={`${card} space-y-5 p-5 sm:p-6`}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Layers className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Tambah Divisi Baru</h2>
                                <p className="text-[11px] text-slate-400">
                                    Isi nama divisi dan line-nya. Mesin (check sheet) ditambahkan di tiap line setelah
                                    divisi tersimpan.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">Nama Divisi</label>
                            <input
                                value={form.data.nama_divisi}
                                onChange={(e) => form.setData('nama_divisi', e.target.value)}
                                placeholder="Contoh: Sewing"
                                className={input}
                            />
                            {form.errors.nama_divisi && (
                                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                                    {form.errors.nama_divisi}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Daftar Line (satu baris = satu line)
                            </label>
                            <textarea
                                rows={5}
                                value={form.data.daftar_line}
                                onChange={(e) => form.setData('daftar_line', e.target.value)}
                                placeholder={'D14N\nD52'}
                                className={input}
                            />
                            {form.errors.daftar_line && (
                                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                                    {form.errors.daftar_line}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={form.processing} className={btnPrimary}>
                                <Plus className="h-4 w-4" />
                                {form.processing ? 'Menyimpan...' : 'Simpan Divisi'}
                            </button>
                        </div>
                    </form>

                    {/* DAFTAR DIVISI */}
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {divisis.map((d) => (
                            <KartuDivisi
                                key={d.id}
                                divisi={d}
                                lines={lines.filter((l) => l.divisi_id === d.id)}
                                checkSheets={checkSheets.filter((s) => s.divisi_id === d.id)}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}