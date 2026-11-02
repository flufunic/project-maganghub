import ConfirmModal from '@/Components/ConfirmModal';
import { Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Icon, PageShell, glassCard, inputClass, Field } from '@/Components/Joken/ui';

const IDENTITAS_PRODUKSI = [
    ['line', 'Line'],
    ['model', 'Model'],
    ['pic', 'PIC'],
    ['no_line', 'No Line'],
];

const IDENTITAS_PART = [
    ['supplier', 'Supplier'],
    ['part_name', 'Part Name'],
    ['part_number', 'Part Number'],
    ['mfg_location', 'MFG. Location'],
];

const MAKS_KOLOM = 50;
const MAKS_MB = 4;
const MAKS_FOTO = 2; // maksimal foto per sel. Samakan dengan MAKS_FOTO di JokenController.php

const KOSONG = []; // referensi tetap, supaya preview foto tidak dibuat ulang tiap render

// Nilai foto bisa string lama (1 foto), array (banyak foto), atau kosong
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

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

const kolomKosong = () => ({ uid: newUid('c'), label: '', type: 'text' });

/* input di dalam tabel: tampil seperti teks, garis muncul saat fokus */
const tblInput =
    'w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-300 hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';

/* tombol aksi: selalu tampil */
const aksiBtn =
    'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition';
const aksiHapus = `${aksiBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`;
const aksiSalin = `${aksiBtn} border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100`;

const thBase =
    'sticky top-0 z-20 border-b-2 border-r border-slate-300 bg-slate-200 px-3 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-700';

/* ---------- kartu section ---------- */
function Section({ no, title, desc, action, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-extrabold text-white shadow-md shadow-blue-200">
                        {no}
                    </span>
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-800">{title}</h2>
                        {desc && <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>}
                    </div>
                </div>
                {action}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

/* ---------- sel foto: banyak foto, preview, upload ---------- */
function ImageCell({ paths, files, onAdd, onRemovePath, onRemoveFile }) {
    // preview untuk file yang baru dipilih (belum tersimpan)
    const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

    useEffect(() => {
        return () => previews.forEach((u) => URL.revokeObjectURL(u));
    }, [previews]);

    const total = paths.length + files.length;
    const penuh = total >= MAKS_FOTO;

    const pilih = (e) => {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (picked.length) onAdd(picked);
    };

    const kotak = 'relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border';
    const hapusBtn =
        'absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-600/90 text-white shadow transition hover:bg-red-700';

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
            {/* foto yang sudah tersimpan */}
            {paths.map((p) => (
                <div key={p} className={`${kotak} border-slate-300`}>
                    <img src={`/storage/${p}`} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => onRemovePath(p)} title="Hapus foto" className={hapusBtn}>
                        <span className="text-xs font-bold leading-none">×</span>
                    </button>
                </div>
            ))}

            {/* foto baru (belum tersimpan) */}
            {previews.map((src, i) => (
                <div key={`baru-${i}`} className={`${kotak} border-blue-300`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1 text-[9px] font-bold text-white">BARU</span>
                    <button type="button" onClick={() => onRemoveFile(i)} title="Hapus foto" className={hapusBtn}>
                        <span className="text-xs font-bold leading-none">×</span>
                    </button>
                </div>
            ))}

            {/* tombol upload, hilang kalau sudah penuh */}
            {!penuh && (
                <label
                    className={`${kotak} flex cursor-pointer flex-col items-center justify-center gap-0.5 border-dashed border-slate-400 bg-slate-50 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600`}
                >
                    <Icon type="upload" className="h-4 w-4" />
                    <span className="text-[11px] font-semibold">{total === 0 ? 'Upload foto' : 'Tambah foto'}</span>
                    <span className="text-[10px] text-slate-400">
                        {total}/{MAKS_FOTO}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={pilih} />
                </label>
            )}
        </div>
    );
}

export default function Form({ joken }) {
    const edit = Boolean(joken);

    /* ---------------- state ---------------- */
    const [head, setHead] = useState({
        judul: joken?.judul ?? 'JOKEN MESIN',
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

    const [columns, setColumns] = useState(() =>
        joken?.kolom?.length ? joken.kolom : [kolomKosong()]
    );

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

    const tutup = () => setConfirmDialog(null);

    /* ---------------- helper update ---------------- */
    const setRow = (ruid, patch) =>
        setRows((rs) => rs.map((r) => (r.uid === ruid ? { ...r, ...patch } : r)));

    const setValue = (ruid, cuid, v) =>
        setRows((rs) =>
            rs.map((r) => (r.uid === ruid ? { ...r, values: { ...r.values, [cuid]: v } } : r))
        );

    /* ---------------- foto (banyak per sel) ---------------- */
    const addFotos = (ruid, cuid, picked) => {
        const besar = picked.find((f) => f.size > MAKS_MB * 1024 * 1024);
        if (besar) {
            setErrors({ file: `Ukuran foto maksimal ${MAKS_MB} MB (${besar.name}).` });
            return;
        }

        const baris = rows.find((x) => x.uid === ruid);
        const sisa = MAKS_FOTO - asList(baris?.values[cuid]).length - (baris?.files[cuid]?.length ?? 0);

        if (sisa <= 0) {
            setErrors({ file: `Maksimal ${MAKS_FOTO} foto per sel.` });
            return;
        }

        setErrors(
            picked.length > sisa
                ? { file: `Maksimal ${MAKS_FOTO} foto per sel, hanya ${sisa} foto pertama yang ditambahkan.` }
                : {}
        );

        const diambil = picked.slice(0, sisa);
        setRows((rs) =>
            rs.map((r) =>
                r.uid === ruid
                    ? { ...r, files: { ...r.files, [cuid]: [...(r.files[cuid] ?? []), ...diambil] } }
                    : r
            )
        );
    };

    // hapus satu foto: { path } untuk foto yang sudah tersimpan, { index } untuk foto baru
    const hapusFoto = (ruid, cuid, { path, index }) =>
        setConfirmDialog({
            title: 'Hapus foto?',
            message: 'Apakah kamu yakin ingin menghapus foto ini?',
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setRows((rs) =>
                    rs.map((r) => {
                        if (r.uid !== ruid) return r;

                        if (path !== undefined) {
                            return {
                                ...r,
                                values: { ...r.values, [cuid]: asList(r.values[cuid]).filter((p) => p !== path) },
                            };
                        }

                        return {
                            ...r,
                            files: { ...r.files, [cuid]: (r.files[cuid] ?? []).filter((_, i) => i !== index) },
                        };
                    })
                );
                setErrors({});
                tutup();
            },
        });

    /* ---------------- kolom ---------------- */
    const addCol = () => {
        if (columns.length >= MAKS_KOLOM) {
            setErrors({ kolom: `Maksimal ${MAKS_KOLOM} kolom.` });
            return;
        }
        setErrors({});
        setColumns((cs) => [...cs, kolomKosong()]);
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
                tutup();
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
                tutup();
            },
        });
    };

    /* ---------------- baris ---------------- */
    const addRow = () => setRows((rs) => [...rs, barisKosong()]);

    const duplicateRow = (r) =>
        setRows((rs) => {
            const i = rs.findIndex((x) => x.uid === r.uid);
            const salinan = { ...r, uid: newUid('r'), values: { ...r.values }, files: {} };
            // foto tidak ikut disalin
            columns.filter((c) => c.type === 'image').forEach((c) => (salinan.values[c.uid] = []));
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
                tutup();
            },
        });
    };

    /* ---------------- submit (dengan konfirmasi) ---------------- */
    const kirim = () => {
        const payload = {
            ...head,
            columns,
            rows: rows.map(({ uid, ...r }) => {
                const values = {};
                const files = {};

                columns.forEach((c) => {
                    if (c.type === 'image') {
                        const lama = asList(r.values[c.uid]); // path foto yang dipertahankan
                        const baru = r.files[c.uid] ?? []; // file yang baru dipilih
                        if (lama.length) values[c.uid] = lama;
                        if (baru.length) files[c.uid] = baru;
                    } else {
                        values[c.uid] = r.values[c.uid] ?? '';
                    }
                });

                return { ...r, values, files };
            }),
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

    const submit = (e) => {
        e.preventDefault();
        if (saving) return;

        const nomor = head.no_registrasi.trim();

        setConfirmDialog({
            title: edit ? 'Simpan perubahan?' : 'Simpan joken baru?',
            message: edit
                ? `Apakah kamu yakin ingin menyimpan perubahan pada joken ${nomor || joken.no_registrasi}?`
                : `Apakah kamu yakin ingin menyimpan joken${nomor ? ` ${nomor}` : ' ini'}?`,
            confirmLabel: edit ? 'Ya, Simpan Perubahan' : 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                tutup();
                kirim();
            },
        });
    };

    const pesanError = Object.values(errors);

    return (
        <PageShell
            title={edit ? 'Edit Joken' : 'Buat Joken'}
            heading={edit ? `Edit Joken · ${joken.no_registrasi}` : 'Buat Joken Mesin'}
            backHref="/joken"
        >
            <form onSubmit={submit} className={`overflow-hidden rounded-2xl ${glassCard}`}>
                <div className="space-y-4 bg-slate-50/80 p-4">
                    {pesanError.length > 0 && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
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

                    {/* ===== 1. INFORMASI DOKUMEN ===== */}
                    <Section no="1" title="Informasi Dokumen" desc="Judul dan nomor registrasi dokumen">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <Field label="Judul" error={errors.judul}>
                                    <input
                                        value={head.judul}
                                        onChange={(e) => setHead({ ...head, judul: e.target.value })}
                                        placeholder="contoh: JOKEN MESIN"
                                        className={`${inputClass} text-base font-bold`}
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
                        </div>
                    </Section>

                    {/* ===== 2. IDENTITAS JOKEN ===== */}
                    <Section no="2" title="Identitas Joken" desc="Data line, model, dan part">
                        <div className="grid gap-5 lg:grid-cols-2">
                            {[
                                ['Produksi', IDENTITAS_PRODUKSI],
                                ['Part', IDENTITAS_PART],
                            ].map(([judul, grup]) => (
                                <div key={judul} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{judul}</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {grup.map(([key, label]) => (
                                            <Field key={key} label={label} error={errors[key]}>
                                                <input
                                                    value={head[key]}
                                                    onChange={(e) => setHead({ ...head, [key]: e.target.value })}
                                                    className={inputClass}
                                                />
                                            </Field>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ===== 3. DETAIL STANDARISASI ===== */}
                    <Section
                        no="3"
                        title="Detail Standarisasi"
                        desc={`${columns.length} kolom parameter · ${rows.length} baris`}
                        action={
                            <button
                                type="button"
                                onClick={addCol}
                                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                                <Icon type="plus" className="h-4 w-4" />
                                Tambah kolom
                            </button>
                        }
                    >
                        <p className="mb-3 text-[11px] leading-relaxed text-slate-500">
                            Isi nama parameter di header tiap kolom. Kolom bertipe Foto bisa diisi sampai {MAKS_FOTO} foto per sel. Ikon biru untuk menduplikat baris, ikon merah untuk menghapus kolom atau baris.
                        </p>

                        {(errors.kolom || errors.baris || errors.file) && (
                            <p className="mb-3 text-xs font-medium text-red-500">
                                {errors.kolom || errors.baris || errors.file}
                            </p>
                        )}

                        <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-300">
                            <table className="border-separate border-spacing-0 text-xs">
                                <thead>
                                    <tr className="align-top">
                                        <th className={`${thBase} left-0 z-30 w-20 text-center`}>No</th>
                                        <th className={`${thBase} min-w-[110px]`}>QCPC</th>
                                        <th className={`${thBase} min-w-[240px]`}>Proses</th>
                                        <th className={`${thBase} min-w-[150px]`}>Model Material</th>
                                        <th className={`${thBase} min-w-[130px] !border-r-2 !border-r-slate-500`}>Type Mesin</th>

                                        {columns.map((c, idx) => (
                                            <th
                                                key={c.uid}
                                                className={`sticky top-0 z-20 border-b-2 border-r border-slate-300 bg-slate-200 px-2 py-2 font-normal ${
                                                    c.type === 'image' ? 'min-w-[230px]' : 'min-w-[170px]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                                                        Parameter {idx + 1}
                                                    </span>
                                                    <button type="button" onClick={() => removeCol(c, idx)} title="Hapus kolom" className={aksiHapus}>
                                                        <Icon type="trash" className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                <input
                                                    value={c.label}
                                                    onChange={(e) => setColLabel(c.uid, e.target.value)}
                                                    placeholder="Nama parameter"
                                                    className={`mt-1.5 w-full rounded-md border bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
                                                        c.label.trim() === '' ? 'border-amber-400' : 'border-slate-300'
                                                    }`}
                                                />

                                                <select
                                                    value={c.type}
                                                    onChange={(e) => changeColType(c, e.target.value)}
                                                    className="mt-1 w-full cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-[11px] font-medium text-slate-600 outline-none hover:text-slate-900"
                                                >
                                                    <option value="text">Tipe: Teks</option>
                                                    <option value="image">Tipe: Foto</option>
                                                </select>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map((r, ri) => (
                                        <tr key={r.uid} className="align-top hover:bg-slate-50">
                                            <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 px-1.5 py-2 text-center">
                                                <span className="block text-xs font-bold text-slate-600">{ri + 1}</span>
                                                <div className="mt-1.5 flex justify-center gap-1">
                                                    <button type="button" title="Duplikat baris" onClick={() => duplicateRow(r)} className={aksiSalin}>
                                                        <Icon type="copy" className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button type="button" title="Hapus baris" onClick={() => removeRow(r, ri)} className={aksiHapus}>
                                                        <Icon type="trash" className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="border-b border-slate-200 p-1.5">
                                                <input value={r.qcpc} onChange={(e) => setRow(r.uid, { qcpc: e.target.value })} className={tblInput} />
                                            </td>
                                            <td className="border-b border-slate-200 p-1.5">
                                                <textarea rows={2} value={r.proses} onChange={(e) => setRow(r.uid, { proses: e.target.value })} className={tblInput} />
                                            </td>
                                            <td className="border-b border-slate-200 p-1.5">
                                                <input value={r.model_material} onChange={(e) => setRow(r.uid, { model_material: e.target.value })} className={tblInput} />
                                            </td>
                                            <td className="border-b border-r-2 border-slate-200 border-r-slate-400 p-1.5">
                                                <input value={r.type_mesin} onChange={(e) => setRow(r.uid, { type_mesin: e.target.value })} className={tblInput} />
                                            </td>

                                            {columns.map((c) => (
                                                <td key={c.uid} className="border-b border-slate-200 p-1.5 text-center">
                                                    {c.type === 'image' ? (
                                                        <ImageCell
                                                            paths={asList(r.values[c.uid])}
                                                            files={r.files[c.uid] ?? KOSONG}
                                                            onAdd={(picked) => addFotos(r.uid, c.uid, picked)}
                                                            onRemovePath={(path) => hapusFoto(r.uid, c.uid, { path })}
                                                            onRemoveFile={(index) => hapusFoto(r.uid, c.uid, { index })}
                                                        />
                                                    ) : (
                                                        <input
                                                            value={r.values[c.uid] ?? ''}
                                                            onChange={(e) => setValue(r.uid, c.uid, e.target.value)}
                                                            className={`${tblInput} text-center`}
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={addRow}
                            className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Icon type="plus" className="h-4 w-4" />
                            Tambah baris
                        </button>
                    </Section>

                    {/* ===== TOMBOL ===== */}
                    <div className="sticky bottom-3 z-30 flex items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur">
                        <Link href="/joken" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Menyimpan...' : edit ? 'Simpan Perubahan' : 'Simpan'}
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
                onCancel={tutup}
            />
        </PageShell>
    );
}