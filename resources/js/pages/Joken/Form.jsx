import ConfirmModal from '@/Components/ConfirmModal';
import { Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Icon, PageShell, glassCard, inputClass, cellInput, btnPrimary, Field } from '@/Components/Joken/ui';

const LABEL_DEFAULT = [
    'Tarikan tension atas', 'Tarikan tension bawah', 'Tekanan sepatu', 'Kinop langkah',
    'Model Sepatu', 'Ketinggian Sepatu luar', 'Ketinggian sepatu dalam', 'Keseimbangan Bahan',
    'Jarum', 'Timing Rotary Hook', 'Jarak Timing Rotary Hook', 'Margin Jahitan',
    'Ketinggian Spring', 'FEED_DOG (Gigi Mesin)', 'Ketinggian Rotary Hook', 'Alur Benang',
    'Qty Kunciran', 'Ketinggian Spring Tension', 'Ketinggian Kawat Sepatu', 'Foto Aktual Kawat Sepatu',
];

const IDENTITAS = [
    ['line', 'Line'], ['model', 'Model'], ['pic', 'PIC'], ['no_line', 'No Line'],
    ['supplier', 'Supplier'], ['part_name', 'Part Name'],
    ['part_number', 'Part Number'], ['mfg_location', 'MFG. Location'],
];

const MAKS_KOLOM = 50;
const MAKS_MB = 4;

let seq = 0;
const newUid = (prefix) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

const barisKosong = () => ({
    uid: newUid('r'),
    qcpc: '',
    proses: '',
    model_material: '',
    type_mesin: '',
    values: {},
    files: {},
});

/* ---------- sel foto: preview + upload ---------- */
function ImageCell({ path, file, onPick, onRemove }) {
    const preview = useMemo(
        () => (file ? URL.createObjectURL(file) : path ? `/storage/${path}` : null),
        [file, path]
    );

    useEffect(() => {
        return () => {
            if (file && preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="flex w-36 flex-col items-center gap-1.5">
            {preview && (
                <img src={preview} alt="" className="h-16 w-full rounded-md border border-slate-200 object-cover" />
            )}

            <div className="flex items-center gap-1">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 transition hover:bg-blue-100">
                    <Icon type="upload" className="h-3.5 w-3.5" />
                    {preview ? 'Ganti' : 'Upload'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onPick(f);
                            e.target.value = '';
                        }}
                    />
                </label>

                {preview && (
                    <button
                        type="button"
                        title="Hapus foto"
                        onClick={onRemove}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-red-200 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Form({ joken }) {
    const edit = Boolean(joken);

    /* ---------------- state ---------------- */
    const [head, setHead] = useState({
        judul: joken?.judul ?? 'JOKEN MESIN SEWING',
        no_registrasi: joken?.no_registrasi ?? '',
        line: joken?.line ?? '',
        model: joken?.model ?? '',
        pic: joken?.pic ?? '',
        no_line: joken?.no_line ?? '',
        supplier: joken?.supplier ?? '',
        part_name: joken?.part_name ?? '',
        part_number: joken?.part_number ?? '',
        mfg_location: joken?.mfg_location ?? '',
    });

    const [columns, setColumns] = useState(() => {
        if (joken?.kolom?.length) return joken.kolom;
        return LABEL_DEFAULT.map((label, i) => ({
            uid: `c${i + 1}`,
            label,
            type: i === LABEL_DEFAULT.length - 1 ? 'image' : 'text',
        }));
    });

    const [rows, setRows] = useState(() => {
        if (joken?.rows?.length) {
            return joken.rows.map((r) => ({
                uid: `r${r.id}`,
                qcpc: r.qcpc ?? '',
                proses: r.proses ?? '',
                model_material: r.model_material ?? '',
                type_mesin: r.type_mesin ?? '',
                values: { ...(r.nilai ?? {}) },
                files: {},
            }));
        }
        return [barisKosong()];
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);

    /* ---------------- helper update ---------------- */
    const setRow = (ruid, patch) =>
        setRows((rs) => rs.map((r) => (r.uid === ruid ? { ...r, ...patch } : r)));

    const setValue = (ruid, cuid, v) =>
        setRows((rs) =>
            rs.map((r) => (r.uid === ruid ? { ...r, values: { ...r.values, [cuid]: v } } : r))
        );

    const pickImage = (ruid, cuid, file) => {
        if (file.size > MAKS_MB * 1024 * 1024) {
            setErrors({ file: `Ukuran foto maksimal ${MAKS_MB} MB.` });
            return;
        }
        setErrors({});
        setRows((rs) =>
            rs.map((r) => (r.uid === ruid ? { ...r, files: { ...r.files, [cuid]: file } } : r))
        );
    };

    const removeImage = (ruid, cuid) =>
        setRows((rs) =>
            rs.map((r) => {
                if (r.uid !== ruid) return r;
                const files = { ...r.files };
                delete files[cuid];
                return { ...r, files, values: { ...r.values, [cuid]: null } };
            })
        );

    /* ---------------- kolom ---------------- */
    const addCol = () => {
        if (columns.length >= MAKS_KOLOM) {
            setErrors({ kolom: `Maksimal ${MAKS_KOLOM} kolom.` });
            return;
        }
        setColumns((cs) => [...cs, { uid: newUid('c'), label: '', type: 'text' }]);
    };

    const setColLabel = (cuid, label) =>
        setColumns((cs) => cs.map((c) => (c.uid === cuid ? { ...c, label } : c)));

    const bersihkanKolom = (cuid) =>
        setRows((rs) =>
            rs.map((r) => {
                const values = { ...r.values };
                const files = { ...r.files };
                delete values[cuid];
                delete files[cuid];
                return { ...r, values, files };
            })
        );

    const changeColType = (col, type) => {
        if (type === col.type) return;
        setConfirmDialog({
            title: 'Ubah tipe kolom?',
            message: `Isi kolom "${col.label || 'tanpa nama'}" di semua baris akan dikosongkan karena tipenya berubah.`,
            confirmLabel: 'Ya, Ubah',
            tone: 'blue',
            onConfirm: () => {
                bersihkanKolom(col.uid);
                setColumns((cs) => cs.map((c) => (c.uid === col.uid ? { ...c, type } : c)));
                setConfirmDialog(null);
            },
        });
    };

    const removeCol = (col, idx) => {
        if (columns.length <= 1) {
            setErrors({ kolom: 'Minimal harus ada 1 kolom.' });
            return;
        }
        setConfirmDialog({
            title: 'Hapus kolom?',
            message: `Apakah kamu yakin ingin menghapus kolom ${idx + 1}${col.label ? ` (${col.label})` : ''} beserta isinya di semua baris?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                bersihkanKolom(col.uid);
                setColumns((cs) => cs.filter((c) => c.uid !== col.uid));
                setConfirmDialog(null);
            },
        });
    };

    /* ---------------- baris ---------------- */
    const addRow = () => setRows((rs) => [...rs, barisKosong()]);

    const duplicateRow = (r) =>
        setRows((rs) => {
            const i = rs.findIndex((x) => x.uid === r.uid);
            const salinan = {
                ...r,
                uid: newUid('r'),
                values: { ...r.values },
                files: {},
            };
            // foto tidak ikut disalin
            columns.filter((c) => c.type === 'image').forEach((c) => (salinan.values[c.uid] = null));
            return [...rs.slice(0, i + 1), salinan, ...rs.slice(i + 1)];
        });

    const removeRow = (r, idx) => {
        if (rows.length <= 1) {
            setErrors({ baris: 'Minimal harus ada 1 baris.' });
            return;
        }
        setConfirmDialog({
            title: 'Hapus baris?',
            message: `Apakah kamu yakin ingin menghapus baris ${idx + 1}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setRows((rs) => rs.filter((x) => x.uid !== r.uid));
                setConfirmDialog(null);
            },
        });
    };

    /* ---------------- submit ---------------- */
    const submit = (e) => {
        e.preventDefault();

        const payload = {
            ...head,
            columns,
            rows: rows.map(({ uid, ...r }) => r),
        };
        if (edit) payload._method = 'put'; // multipart tidak bisa PUT, jadi POST + _method

        router.post(edit ? `/joken/${joken.id}` : '/joken', payload, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onError: (errs) => {
                setErrors(errs);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const pesanError = Object.values(errors);

    return (
        <PageShell
            title={edit ? 'Edit Joken' : 'Buat Joken'}
            heading={edit ? `Edit Joken · ${joken.no_registrasi}` : 'Buat Joken Mesin Sewing'}
            backHref="/joken"
        >
            <form onSubmit={submit} className={`overflow-hidden rounded-2xl ${glassCard}`}>
                <div className="space-y-5 bg-white p-4">
                    {pesanError.length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            <ul className="list-inside list-disc space-y-0.5">
                                {pesanError.slice(0, 8).map((m, i) => (
                                    <li key={i}>{m}</li>
                                ))}
                            </ul>
                            {pesanError.length > 8 && (
                                <p className="mt-1 text-xs">...dan {pesanError.length - 8} galat lainnya.</p>
                            )}
                        </div>
                    )}

                    {/* ===== JUDUL & NO REGISTRASI ===== */}
                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Field label="Judul" error={errors.judul}>
                                <input
                                    value={head.judul}
                                    onChange={(e) => setHead({ ...head, judul: e.target.value })}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                        <Field label="No. Registrasi" error={errors.no_registrasi}>
                            <input
                                value={head.no_registrasi}
                                onChange={(e) => setHead({ ...head, no_registrasi: e.target.value })}
                                placeholder="contoh: FJIK/SC2/MTC/000"
                                className={inputClass}
                            />
                        </Field>
                    </section>

                    {/* ===== IDENTITAS JOKEN ===== */}
                    <section>
                        <h2 className="mb-3 text-sm font-extrabold text-slate-800">Identitas Joken</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {IDENTITAS.map(([key, label]) => (
                                <Field key={key} label={label} error={errors[key]}>
                                    <input
                                        value={head[key]}
                                        onChange={(e) => setHead({ ...head, [key]: e.target.value })}
                                        className={inputClass}
                                    />
                                </Field>
                            ))}
                        </div>
                    </section>

                    {/* ===== DETAIL STANDARISASI ===== */}
                    <section>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-800">Detail Standarisasi</h2>
                                <p className="text-[11px] text-slate-500">
                                    {columns.length} kolom parameter · {rows.length} baris. Nama dan tipe kolom bisa diubah, kolom bisa ditambah atau dihapus.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={addCol} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
                                    <Icon type="plus" className="h-4 w-4" />
                                    Tambah kolom
                                </button>
                                <button type="button" onClick={addRow} className={btnPrimary}>
                                    <Icon type="plus" className="h-4 w-4" />
                                    Tambah baris
                                </button>
                            </div>
                        </div>

                        {(errors.kolom || errors.baris || errors.file) && (
                            <p className="mb-2 text-xs font-medium text-red-500">
                                {errors.kolom || errors.baris || errors.file}
                            </p>
                        )}

                        <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200">
                            <table className="border-separate border-spacing-0 text-xs">
                                <thead>
                                    <tr className="bg-slate-100 align-top">
                                        <th className="sticky top-0 z-20 w-14 border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-center font-bold text-slate-700">No</th>
                                        <th className="sticky top-0 z-20 min-w-[110px] border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-center font-bold text-slate-700">QCPC</th>
                                        <th className="sticky top-0 z-20 min-w-[240px] border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-center font-bold text-slate-700">PROSES</th>
                                        <th className="sticky top-0 z-20 min-w-[140px] border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-center font-bold text-slate-700">MODEL MATERIAL</th>
                                        <th className="sticky top-0 z-20 min-w-[120px] border-b border-r-2 border-r-blue-900 border-slate-200 bg-slate-100 px-2 py-2 text-center font-bold text-slate-700">TYPE MESIN</th>

                                        {columns.map((c, idx) => (
                                            <th key={c.uid} className="sticky top-0 z-20 min-w-[160px] border-b border-r border-slate-200 bg-slate-100 px-2 py-2 font-normal">
                                                <div className="mb-1 text-center text-sm font-extrabold text-blue-700">{idx + 1}</div>
                                                <input
                                                    value={c.label}
                                                    onChange={(e) => setColLabel(c.uid, e.target.value)}
                                                    placeholder="Nama parameter"
                                                    className={cellInput}
                                                />
                                                <select
                                                    value={c.type}
                                                    onChange={(e) => changeColType(c, e.target.value)}
                                                    className={`${cellInput} mt-1 cursor-pointer`}
                                                >
                                                    <option value="text">Teks</option>
                                                    <option value="image">Foto (upload)</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCol(c, idx)}
                                                    className="mt-1 inline-flex h-7 w-full cursor-pointer items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 text-[11px] font-bold text-red-600 transition hover:bg-red-100"
                                                >
                                                    <Icon type="trash" className="h-3.5 w-3.5" />
                                                    Hapus
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map((r, ri) => (
                                        <tr key={r.uid} className="align-top hover:bg-blue-50/30">
                                            <td className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-center">
                                                <div className="font-extrabold text-slate-700">{ri + 1}</div>
                                                <div className="mt-1 flex flex-col items-center gap-1">
                                                    <button type="button" title="Duplikat baris" onClick={() => duplicateRow(r)} className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                                                        <Icon type="copy" className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button type="button" title="Hapus baris" onClick={() => removeRow(r, ri)} className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100">
                                                        <Icon type="trash" className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="border-b border-r border-slate-200 p-1.5">
                                                <input value={r.qcpc} onChange={(e) => setRow(r.uid, { qcpc: e.target.value })} className={cellInput} />
                                            </td>
                                            <td className="border-b border-r border-slate-200 p-1.5">
                                                <textarea rows={2} value={r.proses} onChange={(e) => setRow(r.uid, { proses: e.target.value })} className={cellInput} />
                                            </td>
                                            <td className="border-b border-r border-slate-200 p-1.5">
                                                <input value={r.model_material} onChange={(e) => setRow(r.uid, { model_material: e.target.value })} className={cellInput} />
                                            </td>
                                            <td className="border-b border-r-2 border-r-blue-900 border-slate-200 p-1.5">
                                                <input value={r.type_mesin} onChange={(e) => setRow(r.uid, { type_mesin: e.target.value })} className={cellInput} />
                                            </td>

                                            {columns.map((c) => (
                                                <td key={c.uid} className="border-b border-r border-slate-200 p-1.5 text-center">
                                                    {c.type === 'image' ? (
                                                        <div className="flex justify-center">
                                                            <ImageCell
                                                                path={r.values[c.uid]}
                                                                file={r.files[c.uid]}
                                                                onPick={(f) => pickImage(r.uid, c.uid, f)}
                                                                onRemove={() => removeImage(r.uid, c.uid)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <input
                                                            value={r.values[c.uid] ?? ''}
                                                            onChange={(e) => setValue(r.uid, c.uid, e.target.value)}
                                                            className={`${cellInput} text-center`}
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ===== TOMBOL ===== */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <Link href="/joken" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </form>

            <ConfirmModal
                open={Boolean(confirmDialog)}
                title={confirmDialog?.title}
                message={confirmDialog?.message}
                confirmLabel={confirmDialog?.confirmLabel}
                tone={confirmDialog?.tone}
                onConfirm={() => confirmDialog?.onConfirm?.()}
                onCancel={() => setConfirmDialog(null)}
            />
        </PageShell>
    );
}