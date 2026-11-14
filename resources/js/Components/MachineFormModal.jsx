import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

/* Salinan logika ControlNumberParser (PHP) supaya preview unit bisa tampil langsung */
export function expandNo(raw) {
    const s = (raw || '').trim().replace(/\s+/g, ' ');
    if (!s) return [];

    const norm = (t) => t.replace(/\s*-\s*/g, '-').trim();
    const m = s.match(/^(.*?)\s*(\d+)\s*(?:-\s*(\d+))?\s*$/);

    if (!m) return [norm(s)];

    const prefix = norm(m[1]);
    const start = m[2];
    const end = m[3];
    const pad = start.length;

    if (end === undefined || Number(end) < Number(start)) {
        return [`${prefix} ${start}`.trim()];
    }

    const out = [];
    for (let i = Number(start); i <= Number(end) && out.length <= 1000; i++) {
        out.push(`${prefix} ${String(i).padStart(pad, '0')}`.trim());
    }
    return out;
}

const TEXT_FIELDS = [
    { key: 'nama_alat', label: 'Nama Alat', required: true, list: 'nama_alat' },
    { key: 'merk', label: 'Merk', list: 'merk' },
    { key: 'model_type', label: 'Model / Type' },
    { key: 'electric_consumption', label: 'Electric Consumption', placeholder: '0,10 Kva' },
    { key: 'negara_pembuat', label: 'Negara Pembuat', list: 'negara_pembuat' },
    { key: 'tahun_pembuatan', label: 'Tahun Perakitan', type: 'number' },
    { key: 'start_operasional', label: 'Start Operasional (Tahun)', type: 'number' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'secondtier', label: 'Second Tier' },
    { key: 'kontak_person', label: 'No. Kontak Person' },
    { key: 'panel_monitor_kwh', label: 'Panel Monitor KWH', list: 'panel_monitor_kwh' },
    { key: 'keterangan', label: 'Keterangan' },
];

const inputClass =
    'h-9 w-full rounded-lg border bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const EMPTY = {
    nama_alat: '', no_kontrol_raw: '', merk: '', model_type: '', electric_consumption: '',
    negara_pembuat: '', tahun_pembuatan: '', start_operasional: '', supplier_name: '',
    supplier_active: false, supplier_repair: false, secondtier: '', kontak_person: '',
    panel_monitor_kwh: '', keterangan: '',
};

export default function MachineFormModal({ mesin, options = {}, onClose }) {
    const isEdit = Boolean(mesin);

    const [form, setForm] = useState(() =>
        isEdit
            ? Object.fromEntries(
                  Object.keys(EMPTY).map((k) => [k, mesin[k] ?? (typeof EMPTY[k] === 'boolean' ? false : '')])
              )
            : EMPTY
    );
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [konfirmasi, setKonfirmasi] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const units = useMemo(() => expandNo(form.no_kontrol_raw), [form.no_kontrol_raw]);

    // perbandingan dengan unit lama (saat edit)
    const diff = useMemo(() => {
        if (!isEdit) return null;
        const old = new Set(expandNo(mesin.no_kontrol_raw));
        const now = new Set(units);
        return {
            removed: [...old].filter((u) => !now.has(u)).length,
            added: [...now].filter((u) => !old.has(u)).length,
        };
    }, [isEdit, mesin, units]);

    // Form disubmit (tombol atau Enter) -> tampilkan dialog konfirmasi dulu
    const submit = (e) => {
        e.preventDefault();
        if (saving) return;
        setKonfirmasi(true);
    };

    // Dijalankan setelah user menekan "Ya"
    const simpan = () => {
        setErrors({});

        const opts = {
            preserveScroll: true,
            onStart: () => setSaving(true),
            onSuccess: () => onClose(),
            onError: (errs) => {
                setErrors(errs);
                setKonfirmasi(false); // balik ke form supaya error terlihat
            },
            onFinish: () => setSaving(false),
        };

        if (isEdit) {
            router.put(`/machines/type/${mesin.id}`, form, opts);
        } else {
            router.post('/machines/type', form, opts);
        }
    };

    const border = (k) => (errors[k] ? 'border-red-400' : 'border-slate-300');

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#030a26]/60 px-4 py-6 backdrop-blur-md">
            <form
                onSubmit={submit}
                className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
            >
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {isEdit ? 'Edit Jenis Mesin' : 'Tambah Jenis Mesin'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Unit dan QR dibuat otomatis dari No. Kontrol.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 overflow-y-auto px-6 py-5">
                    {/* NO KONTROL */}
                    <div>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                No. Kontrol / No. Mesin <span className="text-red-500">*</span>
                            </span>
                            <input
                                type="text"
                                value={form.no_kontrol_raw}
                                onChange={(e) => set('no_kontrol_raw', e.target.value)}
                                placeholder="FJI - SC2 - M.HD 004 - 024"
                                className={`${inputClass} ${border('no_kontrol_raw')}`}
                            />
                        </label>
                        {errors.no_kontrol_raw && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.no_kontrol_raw}</p>
                        )}

                        {units.length > 0 && (
                            <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
                                <b>{units.length} unit</b> akan dibuat:{' '}
                                <span className="font-mono">{units[0]}</span>
                                {units.length > 1 && (
                                    <>
                                        {' '}s/d <span className="font-mono">{units[units.length - 1]}</span>
                                    </>
                                )}
                            </div>
                        )}

                        {isEdit && diff && (diff.removed > 0 || diff.added > 0) && (
                            <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                Perubahan unit: <b>{diff.added}</b> ditambah, <b>{diff.removed}</b> dihapus.
                                {diff.removed > 0 && ' QR unit yang dihapus tidak berlaku lagi.'}
                            </div>
                        )}
                    </div>

                    {/* FIELD LAIN */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {TEXT_FIELDS.map((f) => (
                            <label key={f.key} className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {f.label} {f.required && <span className="text-red-500">*</span>}
                                </span>
                                <input
                                    type={f.type || 'text'}
                                    value={form[f.key]}
                                    onChange={(e) => set(f.key, e.target.value)}
                                    placeholder={f.placeholder}
                                    list={f.list ? `dl-${f.list}` : undefined}
                                    className={`${inputClass} ${border(f.key)}`}
                                />
                                {errors[f.key] && (
                                    <span className="text-xs font-semibold text-red-600">{errors[f.key]}</span>
                                )}
                            </label>
                        ))}
                    </div>

                    {/* saran isian dari data yang sudah ada */}
                    {['nama_alat', 'merk', 'negara_pembuat', 'panel_monitor_kwh'].map((k) => (
                        <datalist key={k} id={`dl-${k}`}>
                            {(options[k] || []).map((o) => (
                                <option key={o} value={o} />
                            ))}
                        </datalist>
                    ))}

                    {/* SUPPLIER STATUS */}
                    <div className="flex flex-wrap gap-5">
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
                            <input
                                type="checkbox"
                                checked={form.supplier_active}
                                onChange={(e) => set('supplier_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                            Supplier Active
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
                            <input
                                type="checkbox"
                                checked={form.supplier_repair}
                                onChange={(e) => set('supplier_repair', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                            Supplier Repair
                        </label>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !form.nama_alat.trim() || !form.no_kontrol_raw.trim()}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah'}
                    </button>
                </div>
            </form>
            {/* DIALOG KONFIRMASI SIMPAN / EDIT */}
            {konfirmasi && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                    >
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                        <div className="px-6 pb-5 pt-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl text-white shadow-lg shadow-blue-300/50">
                                {isEdit ? '✎' : '✓'}
                            </div>

                            <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
                                {isEdit ? 'Konfirmasi Edit' : 'Konfirmasi Simpan'}
                            </h3>

                            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                {isEdit
                                    ? 'Apakah kamu yakin ingin mengedit data ini?'
                                    : 'Apakah kamu yakin ingin menyimpan data ini?'}
                            </p>

                            {isEdit && diff && diff.removed > 0 && (
                                <p className="mx-auto mt-3 max-w-xs rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    {diff.removed} unit akan dihapus dan QR-nya tidak berlaku lagi.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">
                            <button
                                type="button"
                                onClick={() => setKonfirmasi(false)}
                                disabled={saving}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={simpan}
                                disabled={saving}
                                className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan…' : isEdit ? 'Ya, Edit' : 'Ya, Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}