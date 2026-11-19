import React, { useEffect, useMemo, useState } from 'react';
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

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    edit: {
        paths: [
            'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
            'M15 5l4 4',
        ],
    },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    qr: {
        paths: [
            'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z',
            'M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
        ],
    },
    box: { paths: ['M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5'] },
    bolt: { paths: ['M13 3L4 14h7l-1 7 9-11h-7l1-7z'] },
    truck: {
        paths: [
            'M3 6h11v10H3zM14 9h4l3 3v4h-7',
            'M7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
        ],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];
    if (!icon) return null;
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            {icon.paths.map((d, i) => <path key={i} d={d} />)}
        </svg>
    );
}

/* ------------------------------------------------------------------
| KONFIGURASI FIELD
------------------------------------------------------------------ */
const SPEC_FIELDS = [
    { key: 'merk', label: 'Merk', list: 'merk' },
    { key: 'model_type', label: 'Model / Type' },
    { key: 'electric_consumption', label: 'Electric Consumption', placeholder: '0,10 Kva' },
    { key: 'negara_pembuat', label: 'Negara Pembuat', list: 'negara_pembuat' },
    { key: 'tahun_pembuatan', label: 'Tahun Perakitan', type: 'number', placeholder: '2020' },
    { key: 'start_operasional', label: 'Start Operasional (Tahun)', type: 'number', placeholder: '2021' },
    { key: 'panel_monitor_kwh', label: 'Panel Monitor KWH', list: 'panel_monitor_kwh' },
];

const SUPPLIER_FIELDS = [
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'secondtier', label: 'Second Tier' },
    { key: 'kontak_person', label: 'No. Kontak Person' },
];

const EMPTY = {
    nama_alat: '', no_kontrol_raw: '', merk: '', model_type: '', electric_consumption: '',
    negara_pembuat: '', tahun_pembuatan: '', start_operasional: '', supplier_name: '',
    supplier_active: false, supplier_repair: false, secondtier: '', kontak_person: '',
    panel_monitor_kwh: '', keterangan: '',
};

const inputBase =
    'h-10 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4';

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */
function Section({ icon, title, hint, tone = 'blue', children }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon type={icon} className="h-4 w-4" />
                </span>
                <div>
                    <h3 className="text-sm font-bold leading-tight text-slate-800">{title}</h3>
                    {hint && <p className="text-[11px] leading-tight text-slate-400">{hint}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function Field({ label, required, error, children, className = '' }) {
    return (
        <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
            <span className="text-[11px] font-medium text-slate-500">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            {children}
            {error && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                    <Icon type="alert" className="h-3 w-3" />
                    {error}
                </span>
            )}
        </label>
    );
}

function Switch({ checked, onChange, label, tone = 'emerald' }) {
    const on = tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 ${
                checked ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
        >
            <span className="text-xs font-semibold text-slate-700">{label}</span>
            <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${checked ? on : 'bg-slate-300'}`}>
                <span
                    className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </span>
        </button>
    );
}

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
    const terlaluBanyak = units.length > 1000;

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

    // Esc: tutup dialog konfirmasi dulu, baru modal
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape' || saving) return;
            if (konfirmasi) setKonfirmasi(false);
            else onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [konfirmasi, saving, onClose]);

    // Form disubmit (tombol atau Enter) -> tampilkan dialog konfirmasi dulu
    const submit = (e) => {
        e.preventDefault();
        if (saving || terlaluBanyak) return;
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

    const ring = (k) =>
        errors[k]
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10';

    const renderInput = (f) => (
        <Field key={f.key} label={f.label} error={errors[f.key]}>
            <input
                type={f.type || 'text'}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                list={f.list ? `dl-${f.list}` : undefined}
                className={`${inputBase} ${ring(f.key)}`}
            />
        </Field>
    );

    const formValid = form.nama_alat.trim() && form.no_kontrol_raw.trim() && !terlaluBanyak;

    return (
        <div className="idx-fade fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
            <style>{`
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxPing { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.6); opacity: 0; } }
                @keyframes idxSpin { to { transform: rotate(360deg); } }
                @keyframes idxChip { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-ping { animation: idxPing 1.8s ease-out infinite; }
                .idx-spin { animation: idxSpin .8s linear infinite; }
                .idx-chip { animation: idxChip .25s cubic-bezier(.22,1,.36,1) both; }
                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                @media (prefers-reduced-motion: reduce) {
                    .idx-fade, .idx-pop, .idx-ping, .idx-chip { animation: none !important; }
                }
            `}</style>

            <form
                onSubmit={submit}
                className="idx-pop flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
            >
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                            <Icon type={isEdit ? 'edit' : 'plus'} className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {isEdit ? 'Edit Jenis Mesin' : 'Tambah Jenis Mesin'}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Unit dan QR dibuat otomatis dari No. Kontrol.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                <div className="idx-scroll space-y-4 overflow-y-auto bg-slate-50/60 px-6 py-5">
                    {/* IDENTITAS */}
                    <Section icon="qr" title="Identitas & Unit" hint="Nama alat dan nomor kontrol (bisa rentang)">
                        <div className="grid grid-cols-1 gap-3">
                            <Field label="Nama Alat" required error={errors.nama_alat}>
                                <input
                                    type="text"
                                    value={form.nama_alat}
                                    onChange={(e) => set('nama_alat', e.target.value)}
                                    list="dl-nama_alat"
                                    placeholder="Contoh: Hydraulic Press"
                                    className={`${inputBase} ${ring('nama_alat')}`}
                                />
                            </Field>

                            <Field label="No. Kontrol / No. Mesin" required error={errors.no_kontrol_raw}>
                                <input
                                    type="text"
                                    value={form.no_kontrol_raw}
                                    onChange={(e) => set('no_kontrol_raw', e.target.value)}
                                    placeholder="FJI - SC2 - M.HD 004 - 024"
                                    className={`${inputBase} font-mono ${ring('no_kontrol_raw')}`}
                                />
                            </Field>
                        </div>

                        {units.length > 0 && !terlaluBanyak && (
                            <div className="idx-pop mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                                <p className="text-xs font-semibold text-blue-800">
                                    {units.length} unit akan dibuat
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {units.slice(0, 6).map((u, i) => (
                                        <span
                                            key={u}
                                            style={{ animationDelay: `${i * 40}ms` }}
                                            className="idx-chip rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100"
                                        >
                                            {u}
                                        </span>
                                    ))}
                                    {units.length > 6 && (
                                        <>
                                            <span className="self-center text-[11px] font-semibold text-blue-400">…</span>
                                            <span className="idx-chip rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">
                                                {units[units.length - 1]}
                                            </span>
                                            <span className="self-center text-[11px] font-semibold text-blue-500">
                                                (+{units.length - 7} lainnya)
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {terlaluBanyak && (
                            <div className="idx-pop mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">
                                <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                                Rentang terlalu besar (maksimal 1000 unit).
                            </div>
                        )}

                        {isEdit && diff && (diff.removed > 0 || diff.added > 0) && (
                            <div className="idx-pop mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                                <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    Perubahan unit: <b>{diff.added}</b> ditambah, <b>{diff.removed}</b> dihapus.
                                    {diff.removed > 0 && ' QR unit yang dihapus tidak berlaku lagi.'}
                                </span>
                            </div>
                        )}
                    </Section>

                    {/* SPESIFIKASI */}
                    <Section icon="bolt" tone="violet" title="Spesifikasi" hint="Merk, model, dan data pembuatan">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {SPEC_FIELDS.map(renderInput)}
                        </div>
                    </Section>

                    {/* SUPPLIER */}
                    <Section icon="truck" tone="emerald" title="Supplier" hint="Kontak dan status supplier">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {SUPPLIER_FIELDS.map(renderInput)}
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Switch
                                checked={form.supplier_active}
                                onChange={(v) => set('supplier_active', v)}
                                label="Supplier Active"
                            />
                            <Switch
                                checked={form.supplier_repair}
                                onChange={(v) => set('supplier_repair', v)}
                                label="Supplier Repair"
                                tone="amber"
                            />
                        </div>
                    </Section>

                    {/* KETERANGAN */}
                    <Section icon="box" title="Keterangan" hint="Catatan tambahan (opsional)">
                        <Field label="Keterangan" error={errors.keterangan}>
                            <textarea
                                rows={2}
                                maxLength={255}
                                value={form.keterangan}
                                onChange={(e) => set('keterangan', e.target.value)}
                                placeholder="Tulis catatan…"
                                className={`w-full resize-none rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 ${ring('keterangan')}`}
                            />
                            <span className="text-right text-[10px] text-slate-400">{form.keterangan.length}/255</span>
                        </Field>
                    </Section>

                    {/* saran isian dari data yang sudah ada */}
                    {['nama_alat', 'merk', 'negara_pembuat', 'panel_monitor_kwh'].map((k) => (
                        <datalist key={k} id={`dl-${k}`}>
                            {(options?.[k] || []).map((o) => (
                                <option key={o} value={o} />
                            ))}
                        </datalist>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !formValid}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah'}
                    </button>
                </div>
            </form>

            {/* DIALOG KONFIRMASI SIMPAN / EDIT */}
            {konfirmasi && (
                <div
                    onClick={() => !saving && setKonfirmasi(false)}
                    className="idx-fade fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        role="alertdialog"
                        aria-modal="true"
                        className="idx-pop w-full max-w-sm overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
                    >
                        <div className="px-6 pb-2 pt-6 text-center">
                            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                                <span className="idx-ping absolute inset-0 rounded-full bg-blue-400/40" />
                                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                                    <Icon type={isEdit ? 'edit' : 'check'} className="h-7 w-7" />
                                </span>
                            </div>

                            <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                {isEdit ? 'Konfirmasi Edit' : 'Konfirmasi Simpan'}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                {isEdit
                                    ? 'Apakah kamu yakin ingin mengedit data ini?'
                                    : 'Apakah kamu yakin ingin menyimpan data ini?'}
                            </p>

                            {isEdit && diff && diff.removed > 0 && (
                                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    {diff.removed} unit akan dihapus dan QR-nya tidak berlaku lagi.
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setKonfirmasi(false)}
                                disabled={saving}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={simpan}
                                disabled={saving}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {saving && <span className="idx-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />}
                                {saving ? 'Menyimpan…' : isEdit ? 'Ya, Edit' : 'Ya, Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}