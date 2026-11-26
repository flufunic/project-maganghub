import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import PreventifChecksheetFormModal from '@/Components/PreventifChecksheetFormModal';

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

/* ---------------- ICONS ---------------- */
const Svg = ({ children, className = 'h-4 w-4' }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {children}
    </svg>
);

const IconEye = () => (
    <Svg>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);

const IconPencil = () => (
    <Svg>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
);

const IconTrash = () => (
    <Svg>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
    </Svg>
);

const IconUpload = () => (
    <Svg>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5" />
        <path d="M12 3v12" />
    </Svg>
);

const TONE = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white',
    slate: 'bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white',
    red: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
};

function IconBtn({ title, tone = 'blue', href, onClick, children }) {
    const cls = `inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${TONE[tone]}`;

    if (href) {
        return (
            <Link href={href} title={title} aria-label={title} className={cls}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" title={title} aria-label={title} onClick={onClick} className={`${cls} cursor-pointer`}>
            {children}
        </button>
    );
}

/* Banner flash: sukses / error / laporan import */
function FlashBanner({ flash, onClose }) {
    if (!flash?.success && !flash?.error) return null;

    const error = Boolean(flash.error);
    const laporan = flash.import ?? [];

    return (
        <div
            className={`mb-4 rounded-2xl border px-5 py-4 text-sm ${
                error
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{flash.error ?? flash.success}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer text-xs font-semibold opacity-60 hover:opacity-100"
                >
                    Tutup
                </button>
            </div>

            {laporan.length > 0 && (
                <ul className="mt-3 space-y-2 text-xs">
                    {laporan.map((s, i) => (
                        <li key={i} className="rounded-xl bg-white/70 px-3 py-2 text-slate-700">
                            <span className="font-bold">{s.sheet}</span>
                            {' · '}
                            <span
                                className={
                                    s.status === 'dilewati' ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-600'
                                }
                            >
                                {s.status}
                            </span>
                            {s.equipment && <> · {s.equipment}</>}
                            {s.status !== 'dilewati' && (
                                <> · {s.item_baru} item baru, {s.item_diperbarui} diperbarui</>
                            )}
                            {(s.catatan ?? []).map((c, j) => (
                                <div key={j} className="mt-0.5 text-amber-700">
                                    • {c}
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* Modal import struktur checksheet (sheet = checksheet). Ada konfirmasi sebelum kirim. */
function ImportModal({ divisis, defaultDivisi, sembunyi, onMinta, onClose }) {
    const fileRef = useRef(null);
    const form = useForm({
        divisi: defaultDivisi && defaultDivisi !== 'all' ? defaultDivisi : divisis[0] ?? '',
        file: null,
    });

    const kirim = () =>
        form.post('/checksheet-preventif/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onClose(),
        });

    const submit = (e) => {
        e.preventDefault();

        onMinta({
            title: 'Konfirmasi import',
            message: `File "${form.data.file?.name}" akan diimpor ke divisi ${form.data.divisi}. Data yang sudah ada akan diperbarui. Lanjutkan?`,
            confirmLabel: 'Ya, Import',
            onConfirm: kirim,
        });
    };

    return (
        <div
            style={{ display: sembunyi ? 'none' : undefined }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        >
            <form
                onSubmit={submit}
                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-base font-bold text-slate-900">Import Checksheet dari Excel</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Satu sheet = satu Checksheet Preventif. Semua sheet di file akan diproses.
                    </p>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Divisi untuk file ini</span>
                        <select
                            value={form.data.divisi}
                            onChange={(e) => form.setData('divisi', e.target.value)}
                            className={`${selectClass} h-10 w-full`}
                        >
                            {divisis.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                        {form.errors.divisi && <span className="text-xs text-red-500">{form.errors.divisi}</span>}
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">File Excel (.xlsx / .xls)</span>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                            className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
                        />
                        {form.errors.file && <span className="text-xs text-red-500">{form.errors.file}</span>}
                    </label>

                    <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
                        Diimpor: nama equipment, no. dokumen, tgl terbit/revisi, penandatangan, Inspection Point dan
                        Standar. Import ulang file yang sama aman: data yang sudah ada diperbarui, tidak digandakan, dan
                        centang/hasil pengisian tidak disentuh. Untuk import hasil pengisian per bulan, buka checksheet
                        lalu pakai bagian <b>Riwayat Pengisian</b>.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.file}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing ? 'Mengimpor...' : 'Import'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({
    checksheets = [],
    divisis = [],
    filterDivisi = 'all',
    preventifOptions = [],
    flash = {},
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [banner, setBanner] = useState(flash);

    useEffect(() => setBanner(flash), [flash]);

    const gantiDivisi = (divisi) => {
        router.get('/checksheet-preventif', { divisi }, { preserveState: true, replace: true });
    };

    const hapus = (c) => {
        setConfirm({
            title: 'Hapus checksheet preventif?',
            message: `"${c.nama_equipment}" beserta seluruh riwayat pengisiannya akan dihapus dari daftar.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => router.delete(`/checksheet-preventif/${c.id}`, { preserveScroll: true }),
        });
    };

    const totalTerbuka = checksheets.reduce((n, c) => n + c.abnormality_terbuka, 0);

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Checksheet Preventif" />

            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="flex items-center gap-3 px-3 py-3 sm:px-5 2xl:px-8">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            aria-label="Buka menu"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/20"
                        >
                            ☰
                        </button>
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                Checksheet Preventif
                            </h1>
                            <p className="truncate text-xs text-blue-200/80">
                                Check list preventif maintenance per equipment
                            </p>
                        </div>
                    </div>
                </header>

                <main className="px-3 py-4 sm:px-5 2xl:px-8">
                    <FlashBanner flash={banner} onClose={() => setBanner({})} />

                    <div className={`mb-4 ${card}`}>
                        <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Daftar Checksheet</h2>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                    {checksheets.length} form
                                </span>
                                {totalTerbuka > 0 && (
                                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
                                        {totalTerbuka} abnormality terbuka
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <select
                                    value={filterDivisi}
                                    onChange={(e) => gantiDivisi(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="all">Semua divisi</option>
                                    {divisis.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => setShowImport(true)}
                                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <IconUpload />
                                    Import Excel
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(null);
                                        setShowForm(true);
                                    }}
                                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:shadow-lg"
                                >
                                    + Tambah
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`overflow-hidden ${card}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead>
                                    <tr className="bg-[#0b1a4d] text-xs font-semibold text-white">
                                        {['Divisi', 'Equipment', 'No. Dokumen', 'Item Schedule Preventif', 'Item', 'Abnormality', 'Aksi'].map(
                                            (h) => (
                                                <th
                                                    key={h}
                                                    className={`whitespace-nowrap px-4 py-3 ${
                                                        ['Item', 'Abnormality', 'Aksi'].includes(h) ? 'text-center' : 'text-left'
                                                    }`}
                                                >
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {checksheets.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                                Belum ada checksheet preventif. Klik <b>Import Excel</b> atau{' '}
                                                <b>Tambah</b>.
                                            </td>
                                        </tr>
                                    )}

                                    {checksheets.map((c) => (
                                        <tr key={c.id} className="transition-colors hover:bg-blue-50/40">
                                            <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-700">
                                                {c.divisi}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-3">
                                                <Link
                                                    href={`/checksheet-preventif/${c.id}`}
                                                    className="font-semibold text-blue-600 hover:underline"
                                                >
                                                    {c.nama_equipment}
                                                </Link>
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                                                {c.nomor_dokumen || '-'}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                                                {c.item_preventif ? (
                                                    c.item_preventif
                                                ) : (
                                                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                                                        Belum terhubung
                                                    </span>
                                                )}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-3 text-center text-slate-600">
                                                {c.items_count}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-3 text-center">
                                                {c.abnormality_terbuka > 0 ? (
                                                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                                                        {c.abnormality_terbuka} terbuka
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <IconBtn title="Lihat" href={`/checksheet-preventif/${c.id}`}>
                                                        <IconEye />
                                                    </IconBtn>
                                                    <IconBtn
                                                        title="Edit"
                                                        tone="slate"
                                                        onClick={() => {
                                                            setEditing(c);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        <IconPencil />
                                                    </IconBtn>
                                                    <IconBtn title="Hapus" tone="red" onClick={() => hapus(c)}>
                                                        <IconTrash />
                                                    </IconBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {showForm && (
                <PreventifChecksheetFormModal
                    checksheet={editing}
                    divisis={divisis}
                    preventifOptions={preventifOptions}
                    defaultDivisi={filterDivisi}
                    onClose={() => setShowForm(false)}
                />
            )}

            {showImport && (
                <ImportModal
                    divisis={divisis}
                    defaultDivisi={filterDivisi}
                    sembunyi={Boolean(confirm)}
                    onMinta={setConfirm}
                    onClose={() => setShowImport(false)}
                />
            )}

            <ConfirmModal
                open={Boolean(confirm)}
                title={confirm?.title}
                message={confirm?.message}
                confirmLabel={confirm?.confirmLabel}
                tone={confirm?.tone}
                onConfirm={() => {
                    const fn = confirm?.onConfirm;
                    setConfirm(null);
                    fn?.();
                }}
                onCancel={() => setConfirm(null)}
            />
        </>
    );
}