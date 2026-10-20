import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import MonitoringSection from '@/Components/MonitoringSection';

// =========================================================
// ICONS  (UI saja, tidak ada logic)
// =========================================================

const ICONS = {
    edit: { paths: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'] },
    trash: { paths: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v5M14 11v5'] },
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    back: { paths: ['M19 12H5', 'M12 19l-7-7 7-7'] },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5', 'M9 9h6M9 13h6M9 17h4'],
    },
    alert: {
        paths: [
            'M10.3 3.6L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z',
            'M12 9v4',
            'M12 17h.01',
        ],
    },
    excel: {
        paths: [
            'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
            'M14 2v6h6',
            'M8 13l2 2-2 2M12 13l2 2-2 2',
        ],
    },
    upload: {
        paths: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
    },
    check: { sw: 2.5, paths: ['M5 12l4 4L19 6'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    save: {
        paths: [
            'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z',
            'M17 21v-8H7v8',
            'M7 3v5h8',
        ],
    },
};

const Icon = ({ type, className = 'h-4 w-4' }) => {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

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
            {icon.rect && <rect {...icon.rect} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
};

// =========================================================
// STYLE TOKENS
// =========================================================

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

// select di dalam form: cursor telunjuk
const selectClass = `${inputClass} cursor-pointer`;

// select kecil untuk toolbar
const toolbarSelect =
    'h-8 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

// tableHeadBase = tanpa padding horizontal (supaya bisa di-override tanpa konflik px-*)
const tableHeadBase =
    'border-r border-white/10 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap';

const tableHead = `${tableHeadBase} px-3`;

// Lebar kolom sticky "No" (HARUS sama dengan offset left kolom Inspection Point)
// w-12 = 48px  ->  left-[48px]

// input kecil untuk sel Actual / Selisih / Catatan
const miniInput =
    'w-full rounded border border-slate-200 bg-white px-1 py-0.5 text-center text-[11px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

// =========================================================
// SMALL COMPONENTS
// =========================================================

const IconButton = ({ title, onClick, variant = 'blue', children }) => {
    const variants = {
        blue: 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100',
        red: 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100',
        slate: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800',
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const Field = ({ label, children, error, required = false, className = '' }) => (
    <div className={className}>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {children}

        {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
    </div>
);

// Header section ringkas: judul + jumlah (teks biasa) + tombol aksi
const SectionHead = ({ title, desc, count, tone = 'blue', action }) => (
    <div
        className={`flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
            tone === 'amber' ? 'bg-amber-50/40' : 'bg-blue-50/40'
        }`}
    >
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>

            {count !== undefined && (
                <span className="text-xs font-semibold text-slate-400">
                    {count}
                </span>
            )}

            <span className="hidden text-xs text-slate-400 md:inline">
                · {desc}
            </span>
        </div>

        {action}
    </div>
);

const FormBanner = ({ text, tone = 'blue' }) => {
    const tones = {
        blue: ['border-blue-100 from-blue-50/80 to-indigo-50/50', 'bg-blue-500'],
        indigo: ['border-indigo-100 from-indigo-50/80 to-violet-50/50', 'bg-indigo-500'],
        amber: ['border-amber-100 from-amber-50/80 to-orange-50/50', 'bg-amber-500'],
        orange: ['border-orange-100 from-orange-50/80 to-amber-50/50', 'bg-orange-500'],
    };

    return (
        <div className={`rounded-xl border bg-gradient-to-r px-4 py-3 ${tones[tone][0]}`}>
            <div className="flex items-center gap-3">
                <div className={`h-1.5 w-1.5 rounded-full ${tones[tone][1]}`} />
                <h4 className="text-sm font-bold text-slate-800">{text}</h4>
            </div>
        </div>
    );
};

const FormActions = ({
    onCancel,
    processing,
    label,
    tone = 'blue',
    disabled = false,
    processingLabel = 'Menyimpan...',
}) => (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
            Batal
        </button>

        <button
            type="submit"
            disabled={processing || disabled}
            className={`cursor-pointer rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                tone === 'amber'
                    ? 'from-amber-500 to-orange-500 shadow-amber-300/50 hover:from-amber-600 hover:to-orange-600'
                    : 'from-blue-500 via-indigo-600 to-violet-600 shadow-indigo-300/50 hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700'
            }`}
        >
            {processing ? processingLabel : label}
        </button>
    </div>
);

// Field form Inspection Point (dipakai add & edit)
// `nomor` = nomor otomatis (hanya tampilan, tidak dikirim ke server)
const ItemFields = ({
    data,
    setData,
    errors,
    withPlaceholder = false,
    nomor = '',
}) => (
    <>
        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="No" error={errors.no}>
                <div className="relative">
                    <input
                        type="text"
                        value={nomor}
                        readOnly
                        placeholder="Pilih shift dulu"
                        className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5 text-sm font-bold text-blue-700 outline-none placeholder:font-medium placeholder:text-blue-300"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500">
                        Otomatis
                    </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                    Mengikuti urutan pada shift yang dipilih.
                </p>
            </Field>

            <Field label="Shift" required error={errors.shift}>
                <select
                    value={data.shift}
                    onChange={(e) => setData('shift', e.target.value)}
                    className={selectClass}
                >
                    <option value="">Pilih Shift</option>
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                </select>
            </Field>
        </div>

        <Field label="Inspection Point" required error={errors.inspection_point}>
            <input
                type="text"
                value={data.inspection_point}
                onChange={(e) => setData('inspection_point', e.target.value)}
                className={inputClass}
                placeholder={withPlaceholder ? 'Masukkan titik pemeriksaan' : undefined}
            />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Condition" error={errors.condition}>
                <textarea
                    value={data.condition}
                    onChange={(e) => setData('condition', e.target.value)}
                    rows="4"
                    className={inputClass}
                    placeholder={withPlaceholder ? 'Kondisi normal yang diharapkan' : undefined}
                />
            </Field>

            <Field label="Method" error={errors.method}>
                <textarea
                    value={data.method}
                    onChange={(e) => setData('method', e.target.value)}
                    rows="4"
                    className={inputClass}
                    placeholder={withPlaceholder ? 'Metode pemeriksaan' : undefined}
                />
            </Field>
        </div>
    </>
);

// Field form Abnormality (dipakai add & edit)
const AbnormalityFields = ({ data, setData, errors, withPlaceholder = false }) => (
    <>
        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tanggal" required error={errors.tanggal}>
                <input
                    type="date"
                    value={data.tanggal}
                    onChange={(e) => setData('tanggal', e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                />
            </Field>

            <Field label="Status" required error={errors.status}>
                <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className={selectClass}
                >
                    <option value="Open">Open</option>
                    <option value="Progress">Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </Field>
        </div>

        <Field label="Abnormality" required error={errors.abnormality}>
            <textarea
                value={data.abnormality}
                onChange={(e) => setData('abnormality', e.target.value)}
                rows="4"
                className={inputClass}
                placeholder={withPlaceholder ? 'Jelaskan kondisi abnormal yang ditemukan' : undefined}
            />
        </Field>

        <Field label="Countermeasure" error={errors.countermeasure}>
            <textarea
                value={data.countermeasure}
                onChange={(e) => setData('countermeasure', e.target.value)}
                rows="4"
                className={inputClass}
                placeholder={withPlaceholder ? 'Tindakan perbaikan yang dilakukan' : undefined}
            />
        </Field>

        <Field label="PIC" error={errors.pic}>
            <input
                type="text"
                value={data.pic}
                onChange={(e) => setData('pic', e.target.value)}
                className={inputClass}
                placeholder={withPlaceholder ? 'Nama PIC' : undefined}
            />
        </Field>
    </>
);

// =========================================================
// CHECKBOX KECIL (kolom Plan / Act / centang)
// =========================================================

const CheckBtn = ({ checked, tone = 'emerald', title, onClick }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className={`mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 ${
            checked
                ? tone === 'blue'
                    ? 'border-blue-300 bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm hover:from-blue-500 hover:to-indigo-600'
                    : 'border-emerald-300 bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm hover:from-emerald-500 hover:to-teal-600'
                : 'border-slate-200 bg-slate-50 text-transparent hover:border-blue-300 hover:bg-blue-50'
        }`}
    >
        {checked && <Icon type="check" className="h-3.5 w-3.5" />}
    </button>
);

// =========================================================
// TOMBOL CATATAN (icon 📝, titik merah kalau sudah ada catatan)
// =========================================================

const CatatanBtn = ({ ada, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        title={ada ? 'Lihat / ubah catatan' : 'Tambah catatan'}
        className={`relative mx-auto cursor-pointer text-sm leading-none transition hover:scale-110 ${
            ada ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
        }`}
    >
        📝
        {ada && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        )}
    </button>
);

// =========================================================
// SEL ACTUAL / SELISIH / CATATAN  (khusus checksheet KWH)
// ---------------------------------------------------------
// nilai = {
//   actual  : actual hasil input manual (atau null)
//   selisih : OTOMATIS = actual hari ini - actual terakhir sebelumnya
//             (lintas bulan: tgl 1 menyambung ke actual terakhir bulan lalu)
//   catatan : catatan tersimpan
// }
// Yang dikirim ke server hanya { actual, catatan }.
// Selisih tidak diinput & tidak disimpan, selalu dihitung di tampilan.
// =========================================================

const NilaiCell = ({ nilai, onSave }) => {
    const [act, setAct] = useState(nilai.actual ?? '');
    const [cat, setCat] = useState(nilai.catatan ?? '');

    // Sinkron per field (terpisah) supaya ketikan di field lain tidak tertimpa
    useEffect(() => {
        setAct(nilai.actual ?? '');
    }, [nilai.actual]);

    useEffect(() => {
        setCat(nilai.catatan ?? '');
    }, [nilai.catatan]);

    const simpan = () => {
        const actNum = act === '' ? null : Number(act);

        if (actNum !== null && Number.isNaN(actNum)) {
            return;
        }

        // tidak ada perubahan -> tidak usah kirim
        if (actNum === nilai.actual && cat === (nilai.catatan ?? '')) {
            return;
        }

        onSave({
            actual: actNum,
            catatan: cat.trim() === '' ? null : cat,
        });
    };

    const selisihAda = nilai.selisih !== null && nilai.selisih !== 0;

    return (
        <div className="mx-auto flex w-24 flex-col gap-0.5">
            <input
                type="number"
                step="any"
                value={act}
                placeholder="Act"
                title="Actual (input manual)"
                onChange={(e) => setAct(e.target.value)}
                onBlur={simpan}
                className={`${miniInput} font-bold text-slate-800`}
            />

            <div
                title="Selisih otomatis (actual ini - actual sebelumnya)"
                className={`flex h-[22px] items-center justify-center rounded border px-1 text-[11px] ${
                    nilai.selisih === null
                        ? 'border-slate-100 bg-slate-50 text-slate-300'
                        : selisihAda
                        ? 'border-red-200 bg-red-50 font-bold text-red-600'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
            >
                {nilai.selisih === null ? 'Sel' : nilai.selisih}
            </div>

            <input
                type="text"
                value={cat}
                placeholder="Catatan"
                title="Catatan / preventif"
                maxLength={255}
                onChange={(e) => setCat(e.target.value)}
                onBlur={simpan}
                className={`${miniInput} text-left`}
            />
        </div>
    );
};

// =========================================================
// MODAL FORM
// =========================================================

const Modal = ({
    title,
    description,
    icon = 'default',
    onClose,
    children,
    maxWidth = 'max-w-2xl',
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#030a26]/60 p-4 backdrop-blur-md">
            <div
                role="dialog"
                aria-modal="true"
                className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40`}
            >
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 px-6 py-4">
                    <div className="flex items-start gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                                icon === 'alert'
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-300/50'
                                    : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 shadow-indigo-300/50'
                            }`}
                        >
                            <Icon
                                type={icon === 'alert' ? 'alert' : 'clipboard'}
                                className="h-5 w-5"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold tracking-tight text-slate-900">
                                {title}
                            </h3>

                            {description && (
                                <p className="mt-0.5 text-sm leading-5 text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Tutup"
                        >
                            <Icon type="close" className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// =========================================================
// DIALOG KONFIRMASI (simpan / edit / hapus)
// =========================================================

const ConfirmDialog = ({ dialog, onCancel }) => {
    if (!dialog) {
        return null;
    }

    const isRed = dialog.tone === 'red';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/40"
            >
                <div className="px-5 pb-4 pt-5">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                isRed
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-blue-50 text-blue-600'
                            }`}
                        >
                            <Icon
                                type={dialog.icon ?? (isRed ? 'trash' : 'save')}
                                className="h-5 w-5"
                            />
                        </span>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900">
                                {dialog.title}
                            </h2>

                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                {dialog.message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={() => dialog.onConfirm?.()}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-white transition ${
                            isRed
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {dialog.confirmLabel ?? 'Ya'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// MODAL CATATAN CHECKLIST (mode Plan/Act & mode biasa)
// =========================================================

const CatatanModal = ({
    target,
    value,
    onChange,
    onClose,
    onSave,
    saving,
    namaBulan,
    bulan,
    tahun,
}) => {
    if (!target) {
        return null;
    }

    const hari = Number(String(target.tanggal).substring(8, 10));

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 shadow-sm">
                                📝
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {target.judul ?? 'Catatan Checklist'}
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {hari} {namaBulan[bulan - 1]} {tahun}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            ×
                        </button>
                    </div>

                    <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {target.label}
                    </p>
                </div>

                <div className="px-6 py-5">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Catatan
                    </label>

                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows="5"
                        maxLength={255}
                        autoFocus
                        placeholder="Tulis catatan untuk checklist ini..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <p className="mt-1 text-right text-[11px] text-slate-400">
                        {value.length}/255
                    </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Catatan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// IMPORT EXCEL
// =========================================================

const MAP_FIELDS = [
    {
        key: 'inspection_point',
        label: 'Inspection Point',
        required: true,
        hint: 'Boleh pilih lebih dari satu kolom, digabung sesuai urutan klik (contoh: Mesin - Sub Mesin).',
    },
    { key: 'condition', label: 'Condition', hint: 'Contoh: STANDART.' },
    { key: 'method', label: 'Method', hint: 'Contoh: METHOD.' },
];

const ImportModal = ({ checkSheet, onClose, onDone }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mapping, setMapping] = useState({
        inspection_point: [],
        condition: [],
        method: [],
    });
    const [shifts, setShifts] = useState(['A', 'B']);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Setiap file berubah -> minta preview ke server
    useEffect(() => {
        if (!file) return;

        let cancelled = false;
        const fd = new FormData();
        fd.append('file', file);

        setLoading(true);
        setError('');

        axios
            .post(`/check-sheets/${checkSheet.id}/import/preview`, fd)
            .then((res) => {
                if (cancelled) return;

                setPreview(res.data);
                setMapping(res.data.mapping);
            })
            .catch((err) => {
                if (cancelled) return;

                setPreview(null);
                setError(
                    err.response?.data?.message ||
                        Object.values(err.response?.data?.errors ?? {})[0]?.[0] ||
                        'Gagal membaca file.'
                );
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [file, checkSheet.id]);

    const toggleCol = (field, index) =>
        setMapping((m) => ({
            ...m,
            [field]: m[field].includes(index)
                ? m[field].filter((i) => i !== index)
                : [...m[field], index],
        }));

    const toggleShift = (s) =>
        setShifts((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );

    const canSubmit =
        Boolean(file) &&
        Boolean(preview) &&
        mapping.inspection_point.length > 0 &&
        shifts.length > 0;

    const submit = (e) => {
        e.preventDefault();

        if (!canSubmit) return;

        router.post(
            `/check-sheets/${checkSheet.id}/import`,
            { file, mapping, shifts },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    onDone?.();
                    onClose();
                },
                onError: (errs) =>
                    setError(Object.values(errs)[0] || 'Import gagal.'),
            }
        );
    };

    const headerLabel = (h, i) => (h ? h : `Kolom ${i + 1}`);

    return (
        <Modal
            title="Import dari Excel"
            description="Upload file Excel, lalu cocokkan kolomnya dengan field Inspection Point."
            onClose={onClose}
            maxWidth="max-w-4xl"
        >
            <form onSubmit={submit} className="space-y-6">
                <Field label="File Excel" required>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => {
                            setFile(e.target.files[0] ?? null);
                            setPreview(null);
                        }}
                        className={`${inputClass} cursor-pointer`}
                    />
                </Field>

                {loading && (
                    <p className="text-sm text-slate-500">Membaca file...</p>
                )}

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                {preview && (
                    <>
                        <FormBanner
                            text="Cocokkan Kolom (terisi otomatis, bisa diubah)"
                            tone="indigo"
                        />

                        {MAP_FIELDS.map((f) => (
                            <div key={f.key}>
                                <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                                    {f.label}
                                    {f.required && (
                                        <span className="ml-1 text-red-500">*</span>
                                    )}
                                </p>
                                <p className="mb-2 text-xs text-slate-400">{f.hint}</p>

                                <div className="flex flex-wrap gap-2">
                                    {preview.headers.map((h, i) => {
                                        const order = mapping[f.key].indexOf(i);
                                        const active = order !== -1;

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => toggleCol(f.key, i)}
                                                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                                    active
                                                        ? 'border-indigo-300 bg-indigo-600 text-white shadow-sm'
                                                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {f.key === 'inspection_point' && active && (
                                                    <span className="mr-1 opacity-70">
                                                        {order + 1}.
                                                    </span>
                                                )}
                                                {headerLabel(h, i)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                                Terapkan ke Shift
                            </p>

                            <div className="flex gap-4">
                                {['A', 'B'].map((s) => (
                                    <label
                                        key={s}
                                        className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
                                    >
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            checked={shifts.includes(s)}
                                            onChange={() => toggleShift(s)}
                                        />
                                        Shift {s}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                                Contoh data ({preview.total_rows} baris terdeteksi)
                            </p>

                            <div className="idx-scroll overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            {preview.headers.map((h, i) => (
                                                <th
                                                    key={i}
                                                    className="whitespace-nowrap px-3 py-2 text-left font-bold"
                                                >
                                                    {headerLabel(h, i)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {preview.rows.map((row, r) => (
                                            <tr key={r} className="border-t border-slate-100">
                                                {preview.headers.map((_, i) => (
                                                    <td key={i} className="px-3 py-2 text-slate-600">
                                                        {row[i] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                            Import bersifat menambah data. Jika file yang sama
                            diimport dua kali, item akan terduplikasi.
                        </div>
                    </>
                )}

                <FormActions
                    onCancel={onClose}
                    processing={processing}
                    disabled={!canSubmit}
                    processingLabel="Mengimport..."
                    label="Import Data"
                />
            </form>
        </Modal>
    );
};

// =========================================================
// MAIN
// =========================================================

// prevActuals = { [item_id]: actual terakhir SEBELUM tanggal 1 bulan ini }
// (dikirim dari controller, supaya hitungan selisih menyambung antar bulan)
export default function Show({
    checkSheet,
    bulan,
    tahun,
    tanggal,
    line,
    prevActuals = {},
}) {
    // Flash message dari backend
    const { flash } = usePage().props;

    // tujuan tombol kembali: daftar line yang tadi di-scan
    const backUrl = line ? `/check-sheets/line/${line.kode}` : '/check-sheets';

    // Checksheet ini memakai kolom Actual / Selisih / Catatan (KWH)?
    const pakaiActual = Boolean(checkSheet.pakai_actual);

    // Checksheet ini memakai kolom Plan & Act (Generator / Pompa)?
    const pakaiPlanAct = Boolean(checkSheet.pakai_plan_act);

    // Checksheet ini punya tabel Monitoring Running Hours?
    const pakaiMonitoring = Boolean(checkSheet.pakai_monitoring);

    // Checksheet ini punya tabel Konsumsi Bahan Bakar (Solar)?
    const pakaiBbm = Boolean(checkSheet.pakai_bbm);

    // Mode Plan/Act: tiap tanggal punya 2 kolom (Plan | Act), header 2 baris
    const duaBaris = pakaiPlanAct && !pakaiActual;
    const barisHeader = duaBaris ? 2 : 1;

    // =====================================================
    // STATE
    // =====================================================

    const [editingItem, setEditingItem] = useState(null);
    const [editingAbnormality, setEditingAbnormality] = useState(null);

    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddAbnormalityModal, setShowAddAbnormalityModal] =
        useState(false);

    const [shiftFilter, setShiftFilter] = useState('all');

    // Dialog konfirmasi: { title, message, confirmLabel, tone, icon, onConfirm }
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Toast: { type: 'success' | 'error', message }
    const [toast, setToast] = useState(null);

    // Catatan checklist (mode Plan/Act & biasa)
    const [catatanTarget, setCatatanTarget] = useState(null); // { item, tanggal, label }
    const [catatanText, setCatatanText] = useState('');
    const [savingCatatan, setSavingCatatan] = useState(false);

    const notify = (message, type = 'success') => setToast({ type, message });

    // Toast dari flash backend
    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        }
    }, [flash]);

    // Toast hilang otomatis
    useEffect(() => {
        if (!toast) {
            return;
        }

        const timer = setTimeout(() => setToast(null), 4000);

        return () => clearTimeout(timer);
    }, [toast]);

    // =====================================================
    // FORM - ADD ITEM
    // (nomor tidak diinput, dibuat otomatis)
    // =====================================================

    const { data, setData, post, processing, errors, reset } = useForm({
        inspection_point: '',
        condition: '',
        method: '',
        shift: '',
    });

    // =====================================================
    // FORM - EDIT ITEM
    // =====================================================

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: processingEdit,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        inspection_point: '',
        condition: '',
        method: '',
        shift: '',
    });

    // =====================================================
    // FORM - ADD ABNORMALITY
    // =====================================================

    const {
        data: abnormalityData,
        setData: setAbnormalityData,
        post: postAbnormality,
        processing: processingAbnormality,
        errors: abnormalityErrors,
        reset: resetAbnormality,
    } = useForm({
        line_id: line?.id ?? '',
        tanggal: '',
        abnormality: '',
        countermeasure: '',
        status: 'Open',
        pic: '',
    });

    // =====================================================
    // FORM - EDIT ABNORMALITY
    // =====================================================

    const {
        data: editAbnormalityData,
        setData: setEditAbnormalityData,
        put: putEditAbnormality,
        processing: processingEditAbnormality,
        errors: editAbnormalityErrors,
        reset: resetEditAbnormality,
    } = useForm({
        tanggal: '',
        abnormality: '',
        countermeasure: '',
        status: 'Open',
        pic: '',
    });

    // =====================================================
    // MONTH
    // =====================================================

    const namaBulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    // =====================================================
    // PERIOD
    // =====================================================

    const ubahPeriode = (bulanBaru, tahunBaru) => {
        router.get(
            `/check-sheets/${checkSheet.id}`,
            {
                bulan: bulanBaru,
                tahun: tahunBaru,
                line_id: line?.id,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // =====================================================
    // HELPERS
    // (didefinisikan di atas supaya bisa dipakai handler di bawahnya)
    // =====================================================

    const formatTanggal = (value) => {
        if (!value) return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusClass = (status) => {
        if (status === 'Closed') {
            return 'text-emerald-700';
        }

        if (status === 'Progress') {
            return 'text-amber-700';
        }

        return 'text-red-700';
    };

    const getStatusDot = (status) => {
        if (status === 'Closed') {
            return 'bg-emerald-500';
        }

        if (status === 'Progress') {
            return 'bg-amber-500';
        }

        return 'bg-red-500';
    };

    const getTanggalValue = (itemTanggal) => {
        if (itemTanggal && typeof itemTanggal === 'object') {
            return itemTanggal.tanggal;
        }

        return itemTanggal;
    };

    const getTanggalLengkap = (itemTanggal, bulan, tahun) => {
        if (itemTanggal && typeof itemTanggal === 'object') {
            return itemTanggal.tanggal_lengkap;
        }

        return `${tahun}-${String(bulan).padStart(2, '0')}-${String(
            itemTanggal
        ).padStart(2, '0')}`;
    };

    const getChecklist = (item, tanggalLengkap) => {
        return item.checklists?.find((checklist) => {
            const tanggalChecklist = String(checklist.tanggal).substring(0, 10);

            return tanggalChecklist === tanggalLengkap;
        });
    };

    // =====================================================
    // CHECKLIST (langsung, tanpa konfirmasi)
    // kolom: 'status' = Act / centang biasa, 'plan' = Plan
    // =====================================================

    const toggleChecklist = (item, tanggalLengkap, kolom = 'status') => {
        const checklist = item.checklists?.find(
            (c) => String(c.tanggal).substring(0, 10) === tanggalLengkap
        );

        const statusBaru = checklist ? !checklist[kolom] : true;

        router.post(
            `/check-sheets/${checkSheet.id}/checklist`,
            {
                check_sheet_item_id: item.id,
                line_id: line?.id ?? null,
                tanggal: tanggalLengkap,
                kolom,
                status: statusBaru,
            },
            {
                preserveScroll: true,
            }
        );
    };

    // =====================================================
    // CATATAN CHECKLIST (mode Plan/Act & biasa)
    // =====================================================

    const bukaCatatan = (item, tanggalLengkap, kolom = 'status') => {
        const cl = getChecklist(item, tanggalLengkap);

        // Plan punya catatan sendiri (catatan_plan), Act / centang biasa pakai catatan
        const field = kolom === 'plan' ? 'catatan_plan' : 'catatan';

        setCatatanTarget({
            item,
            tanggal: tanggalLengkap,
            kolom,
            label: item.inspection_point,
            judul:
                kolom === 'plan'
                    ? 'Catatan Plan'
                    : duaBaris
                    ? 'Catatan Act'
                    : 'Catatan Checklist',
        });
        setCatatanText(cl?.[field] ?? '');
    };

    const tutupCatatan = () => {
        setCatatanTarget(null);
        setCatatanText('');
        setSavingCatatan(false);
    };

    const simpanCatatan = () => {
        if (!catatanTarget) {
            return;
        }

        const { item, tanggal: tgl, kolom } = catatanTarget;
        const cl = getChecklist(item, tgl);
        const teks = catatanText.trim();

        router.post(
            `/check-sheets/${checkSheet.id}/checklist`,
            {
                check_sheet_item_id: item.id,
                line_id: line?.id ?? null,
                tanggal: tgl,
                kolom,
                status: Boolean(cl?.[kolom]), // centang tidak berubah
                catatan: teks === '' ? null : teks,
            },
            {
                preserveScroll: true,
                onStart: () => setSavingCatatan(true),
                onFinish: () => setSavingCatatan(false),
                onSuccess: () => {
                    tutupCatatan();
                    notify('Catatan berhasil disimpan.');
                },
                onError: () =>
                    notify('Catatan gagal disimpan. Periksa kembali isian kamu.', 'error'),
            }
        );
    };

    // =====================================================
    // NILAI ACTUAL / SELISIH / CATATAN (khusus KWH)
    // =====================================================

    const bulatkan = (n) => Math.round(n * 100) / 100;

    // Hitung nilai tiap tanggal untuk satu item.
    // - Actual   : input manual (tersimpan di DB).
    // - Selisih  : otomatis = actual hari ini - actual terakhir sebelumnya.
    // - Tanggal 1 menyambung ke actual terakhir bulan lalu (prevActuals).
    // - Kalau ada hari yang actual-nya kosong, hari itu dilewati dan
    //   selisih berikutnya dihitung dari actual terakhir yang terisi.
    const hitungNilai = (item) => {
        const hasil = {};

        const awal = prevActuals?.[item.id];
        let prevActual =
            awal !== null && awal !== undefined ? Number(awal) : null;

        tanggal.forEach((t) => {
            const tl = getTanggalLengkap(t, bulan, tahun);
            const c = getChecklist(item, tl);

            const actual =
                c?.actual !== null && c?.actual !== undefined && c?.actual !== ''
                    ? Number(c.actual)
                    : null;

            const selisih =
                actual !== null && prevActual !== null
                    ? bulatkan(actual - prevActual)
                    : null;

            hasil[tl] = {
                actual,
                selisih,
                catatan: c?.catatan ?? '',
            };

            if (actual !== null) {
                prevActual = actual;
            }
        });

        return hasil;
    };

    // Kirim hanya actual & catatan (selisih dihitung otomatis, tidak disimpan)
    const simpanNilai = (item, tanggalLengkap, payload) => {
        router.post(
            `/check-sheets/${checkSheet.id}/nilai`,
            {
                check_sheet_item_id: item.id,
                line_id: line?.id ?? null,
                tanggal: tanggalLengkap,
                actual: payload.actual,
                catatan: payload.catatan,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    notify('Nilai gagal disimpan. Periksa kembali isian kamu.', 'error'),
            }
        );
    };

    // =====================================================
    // ADD ITEM  (konfirmasi dulu)
    // =====================================================

    const submit = (e) => {
        e.preventDefault();

        setConfirmDialog({
            title: 'Simpan data?',
            message: 'Apakah kamu yakin ingin menyimpan Inspection Point ini?',
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            icon: 'save',
            onConfirm: () => {
                setConfirmDialog(null);

                post(`/check-sheets/${checkSheet.id}/items`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        reset();
                        setShowAddItemModal(false);
                        notify('Inspection Point berhasil ditambahkan.');
                    },
                    onError: () =>
                        notify('Data gagal disimpan. Periksa kembali isian kamu.', 'error'),
                });
            },
        });
    };

    // =====================================================
    // EDIT ITEM  (konfirmasi dulu)
    // =====================================================

    const submitEdit = (e) => {
        e.preventDefault();

        setConfirmDialog({
            title: 'Simpan perubahan?',
            message: 'Apakah kamu yakin ingin menyimpan perubahan Inspection Point ini?',
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            icon: 'edit',
            onConfirm: () => {
                setConfirmDialog(null);

                putEdit(`/check-sheets/${checkSheet.id}/items/${editingItem.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingItem(null);
                        resetEdit();
                        notify('Inspection Point berhasil diperbarui.');
                    },
                    onError: () =>
                        notify('Perubahan gagal disimpan. Periksa kembali isian kamu.', 'error'),
                });
            },
        });
    };

    // =====================================================
    // ADD ABNORMALITY  (konfirmasi dulu)
    // =====================================================

    const submitAbnormality = (e) => {
        e.preventDefault();

        setConfirmDialog({
            title: 'Simpan data?',
            message: 'Apakah kamu yakin ingin menyimpan data abnormality ini?',
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            icon: 'save',
            onConfirm: () => {
                setConfirmDialog(null);

                postAbnormality(`/check-sheets/${checkSheet.id}/abnormalities`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        resetAbnormality();
                        setShowAddAbnormalityModal(false);
                        notify('Abnormality berhasil ditambahkan.');
                    },
                    onError: () =>
                        notify('Data gagal disimpan. Periksa kembali isian kamu.', 'error'),
                });
            },
        });
    };

    // =====================================================
    // EDIT ABNORMALITY  (konfirmasi dulu)
    // =====================================================

    const submitEditAbnormality = (e) => {
        e.preventDefault();

        setConfirmDialog({
            title: 'Simpan perubahan?',
            message: 'Apakah kamu yakin ingin menyimpan perubahan abnormality ini?',
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            icon: 'edit',
            onConfirm: () => {
                setConfirmDialog(null);

                putEditAbnormality(
                    `/check-sheets/${checkSheet.id}/abnormalities/${editingAbnormality.id}`,
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setEditingAbnormality(null);
                            resetEditAbnormality();
                            notify('Abnormality berhasil diperbarui.');
                        },
                        onError: () =>
                            notify('Perubahan gagal disimpan. Periksa kembali isian kamu.', 'error'),
                    }
                );
            },
        });
    };

    // =====================================================
    // URUTKAN SEMUA ITEM
    // Shift A dulu, lalu B. Di dalam shift: urut nomor lama,
    // kalau nomornya sama/kosong, urut berdasarkan id.
    // =====================================================

    const sortedAllItems = [...(checkSheet.items ?? [])].sort(
        (a, b) =>
            String(a.shift ?? '').localeCompare(String(b.shift ?? '')) ||
            (Number(a.no) || 0) - (Number(b.no) || 0) ||
            (Number(a.id) || 0) - (Number(b.id) || 0)
    );

    // =====================================================
    // NOMOR OTOMATIS (BERURUT PER SHIFT)
    // =====================================================

    const nomorUrut = (() => {
        const counter = {};
        const map = {};

        sortedAllItems.forEach((item) => {
            const key = item.shift ?? '';

            counter[key] = (counter[key] ?? 0) + 1;
            map[item.id] = counter[key];
        });

        return map;
    })();

    // Nomor berikutnya pada shift tertentu = jumlah item di shift itu + 1
    const nomorBerikutnya = (shift) => {
        if (!shift) {
            return '';
        }

        const jumlah = sortedAllItems.filter(
            (item) => item.shift === shift
        ).length;

        return jumlah + 1;
    };

    // =====================================================
    // FILTER (urutan sudah benar dari sortedAllItems)
    // =====================================================

    const filteredItems = sortedAllItems.filter((item) => {
        if (shiftFilter === 'all') return true;

        return item.shift === shiftFilter;
    });

    // =====================================================
    // BUKA FORM EDIT
    // =====================================================

    const bukaEditItem = (item) => {
        setEditingItem(item);

        setEditData({
            inspection_point: item.inspection_point,
            condition: item.condition ?? '',
            method: item.method ?? '',
            shift: item.shift,
        });
    };

    const bukaEditAbnormality = (abnormality) => {
        setEditingAbnormality(abnormality);

        setEditAbnormalityData({
            tanggal: abnormality.tanggal,
            abnormality: abnormality.abnormality,
            countermeasure: abnormality.countermeasure ?? '',
            status: abnormality.status,
            pic: abnormality.pic ?? '',
        });
    };

    // =====================================================
    // BUKA FORM TAMBAH ABNORMALITY
    // =====================================================

    const tanggalDefaultAbnormality = () => {
        const pad = (n) => String(n).padStart(2, '0');
        const hariIni = new Date();

        const bulanSekarang =
            hariIni.getMonth() + 1 === Number(bulan) &&
            hariIni.getFullYear() === Number(tahun);

        if (bulanSekarang) {
            return `${hariIni.getFullYear()}-${pad(hariIni.getMonth() + 1)}-${pad(
                hariIni.getDate()
            )}`;
        }

        return `${tahun}-${pad(bulan)}-01`;
    };

    const bukaTambahAbnormality = () => {
        setAbnormalityData('tanggal', tanggalDefaultAbnormality());
        setShowAddAbnormalityModal(true);
    };

    // =====================================================
    // DELETE ITEM  (modal konfirmasi)
    // =====================================================

    const hapusItem = (item) => {
        setConfirmDialog({
            title: 'Hapus Inspection Point?',
            message: `Apakah kamu yakin ingin menghapus ${item.inspection_point}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () => {
                setConfirmDialog(null);

                router.delete(`/check-sheets/${checkSheet.id}/items/${item.id}`, {
                    preserveScroll: true,
                    onSuccess: () => notify('Inspection Point berhasil dihapus.'),
                    onError: () => notify('Data gagal dihapus.', 'error'),
                });
            },
        });
    };

    // =====================================================
    // DELETE ABNORMALITY  (modal konfirmasi)
    // =====================================================

    const hapusAbnormality = (abnormality) => {
        setConfirmDialog({
            title: 'Hapus Abnormality?',
            message: 'Apakah kamu yakin ingin menghapus data abnormality ini?',
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () => {
                setConfirmDialog(null);

                router.delete(
                    `/check-sheets/${checkSheet.id}/abnormalities/${abnormality.id}`,
                    {
                        preserveScroll: true,
                        onSuccess: () => notify('Abnormality berhasil dihapus.'),
                        onError: () => notify('Data gagal dihapus.', 'error'),
                    }
                );
            },
        });
    };

    return (
        <>
            <Head title={`${checkSheet.nama_checksheet} - Check Sheet`} />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes idxFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes idxToast {
                    from { opacity: 0; transform: translateX(24px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }
                .idx-toast { animation: idxToast 0.3s ease-out both; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                /* hilangkan spinner panah pada input number di sel KWH */
                .idx-nilai input[type=number]::-webkit-outer-spin-button,
                .idx-nilai input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .idx-nilai input[type=number] { -moz-appearance: textfield; }

                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient,
                    .idx-float,
                    .idx-float-reverse,
                    .idx-toast,
                    .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-800">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* =================================================
                    HEADER (RINGKAS, SATU BARIS)
                ================================================== */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
                        <Link
                            href={backUrl}
                            title="Kembali"
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                        >
                            <Icon type="back" className="h-4 w-4" />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                {checkSheet.nama_checksheet}
                            </h1>

                            <p className="truncate text-[11px] text-white/60">
                                <Link
                                    href={backUrl}
                                    className="cursor-pointer transition hover:text-white"
                                >
                                    Check Sheet Prediktif
                                </Link>
                                <span className="mx-1.5 text-white/30">/</span>
                                {checkSheet.divisi?.nama_divisi ?? '-'}

                                {line && (
                                    <>
                                        <span className="mx-1.5 text-white/30">·</span>
                                        <span className="font-semibold text-blue-200">
                                            {line.nama_line}
                                        </span>
                                    </>
                                )}

                                <span className="mx-1.5 text-white/30">·</span>
                                <span className="font-mono">
                                    {checkSheet.nomor_dokumen ?? '-'}
                                </span>
                            </p>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    MAIN
                ================================================== */}
                <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-4 sm:px-6 lg:px-8">
                    {/* INFO + PERIODE (SATU TOOLBAR KECIL) */}
                    <section
                        className={`idx-rise mb-4 overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="flex flex-col gap-3 px-4 py-3 xl:flex-row xl:items-end xl:justify-between">
                            {/* INFO */}
                            <dl className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
                                <div>
                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Divisi
                                    </dt>
                                    <dd className="mt-0.5 font-semibold text-slate-800">
                                        {checkSheet.divisi?.nama_divisi ?? '-'}
                                    </dd>
                                </div>

                                {line && (
                                    <div>
                                        <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Line
                                        </dt>
                                        <dd className="mt-0.5 font-semibold text-slate-800">
                                            {line.nama_line}
                                        </dd>
                                    </div>
                                )}

                                <div>
                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Nama Check Sheet
                                    </dt>
                                    <dd className="mt-0.5 font-semibold text-slate-800">
                                        {checkSheet.nama_checksheet}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Nomor Dokumen
                                    </dt>
                                    <dd className="mt-0.5 font-mono font-semibold text-blue-700">
                                        {checkSheet.nomor_dokumen ?? '-'}
                                    </dd>
                                </div>
                            </dl>

                            {/* FILTER PERIODE */}
                            <div className="flex flex-wrap items-end gap-2">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Bulan
                                    </span>

                                    <select
                                        value={bulan}
                                        onChange={(e) =>
                                            ubahPeriode(e.target.value, tahun)
                                        }
                                        className={toolbarSelect}
                                    >
                                        {namaBulan.map((nama, index) => (
                                            <option key={nama} value={index + 1}>
                                                {nama}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Tahun
                                    </span>

                                    <select
                                        value={tahun}
                                        onChange={(e) =>
                                            ubahPeriode(bulan, e.target.value)
                                        }
                                        className={toolbarSelect}
                                    >
                                        {Array.from(
                                            { length: 7 },
                                            (_, index) =>
                                                new Date().getFullYear() - 3 + index
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Shift
                                    </span>

                                    <select
                                        value={shiftFilter}
                                        onChange={(e) =>
                                            setShiftFilter(e.target.value)
                                        }
                                        className={toolbarSelect}
                                    >
                                        <option value="all">Semua Shift</option>
                                        <option value="A">Shift A</option>
                                        <option value="B">Shift B</option>
                                    </select>
                                </label>

                                <a
                                    href={`/check-sheets/${checkSheet.id}/export-excel?bulan=${bulan}&tahun=${tahun}&line_id=${line?.id ?? ''}`}
                                    className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <Icon type="excel" className="h-3.5 w-3.5" />
                                    Export Excel
                                </a>
                            </div>
                        </div>

                        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </section>

                    {/* INSPECTION POINT */}
                    <section
                        style={{ animationDelay: '100ms' }}
                        className={`idx-rise mb-4 overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <SectionHead
                            tone="blue"
                            title="Inspection Point"
                            desc={
                                pakaiActual
                                    ? 'Isi Actual dan Catatan harian, Selisih dihitung otomatis.'
                                    : pakaiPlanAct
                                    ? 'Centang Plan / Act, klik 📝 untuk menambah catatan.'
                                    : 'Kelola titik pemeriksaan, checklist harian, dan catatan (📝).'
                            }
                            count={`${filteredItems.length} item`}
                            action={
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowImportModal(true)}
                                        className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                                    >
                                        <Icon type="upload" className="h-3.5 w-3.5" />
                                        Import Excel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowAddItemModal(true)}
                                        className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white transition hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        <Icon type="plus" className="h-3.5 w-3.5" />
                                        Tambah
                                    </button>
                                </div>
                            }
                        />

                        {/* Keterangan cara baca sel (khusus KWH) */}
                        {pakaiActual && (
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500">
                                <span className="font-bold text-slate-600">
                                    Tiap tanggal: Act / Sel / Catatan
                                </span>

                                <span>
                                    <span className="font-bold text-slate-700">Act</span> =
                                    diisi manual
                                </span>

                                <span>
                                    <span className="font-bold text-slate-700">Sel</span> =
                                    otomatis (Act ini − Act sebelumnya, tanggal 1
                                    menyambung ke bulan lalu)
                                </span>

                                <span>
                                    <span className="font-bold text-red-600">merah</span> =
                                    ada selisih
                                </span>
                            </div>
                        )}

                        {/* Keterangan icon catatan (mode Plan/Act & biasa) */}
                        {!pakaiActual && (
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <span>📝</span>
                                    Klik untuk menambah / melihat catatan
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                                    Titik merah = sudah ada catatan
                                </span>
                            </div>
                        )}

                        <div className="idx-scroll overflow-x-auto">
                            {/* border-separate + border-spacing-0 => sticky column tidak ada celah */}
                            <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                                <thead>
                                    <tr className="text-white">
                                        {/* No (sticky, lebar dikunci 48px) */}
                                        <th
                                            rowSpan={barisHeader}
                                            className={`sticky left-0 z-20 w-12 min-w-[48px] max-w-[48px] bg-[#0a1a4d] px-0 text-center ${tableHeadBase}`}
                                        >
                                            No
                                        </th>

                                        {/* Inspection Point (sticky, offset 48px = lebar kolom No) */}
                                        <th
                                            rowSpan={barisHeader}
                                            className={`sticky left-[48px] z-20 min-w-[220px] bg-[#0a1a4d] text-left shadow-[4px_0_8px_-4px_rgba(0,0,0,0.35)] ${tableHead}`}
                                        >
                                            Inspection Point
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`min-w-[160px] bg-[#0a1a4d] text-left ${tableHead}`}
                                        >
                                            Condition
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`min-w-[170px] bg-[#0a1a4d] text-left ${tableHead}`}
                                        >
                                            Method
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`w-20 bg-[#0a1a4d] text-center ${tableHead}`}
                                        >
                                            Shift
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`w-24 bg-[#0a1a4d] text-center ${tableHead}`}
                                        >
                                            Aksi
                                        </th>

                                        {tanggal.map((itemTanggal, index) => {
                                            const tanggalValue =
                                                getTanggalValue(itemTanggal);
                                            const tanggalLengkap =
                                                getTanggalLengkap(
                                                    itemTanggal,
                                                    bulan,
                                                    tahun
                                                );

                                            return (
                                                <th
                                                    key={tanggalLengkap || index}
                                                    colSpan={duaBaris ? 2 : 1}
                                                    className={`${
                                                        pakaiActual
                                                            ? 'min-w-[108px]'
                                                            : duaBaris
                                                            ? ''
                                                            : 'w-10 min-w-10'
                                                    } border-r border-white/10 bg-[#0a1a4d] px-1 py-3 text-center text-[11px] font-bold`}
                                                >
                                                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/10">
                                                        {tanggalValue}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>

                                    {/* Baris header kedua: Plan | Act per tanggal */}
                                    {duaBaris && (
                                        <tr className="text-white">
                                            {tanggal.map((itemTanggal, index) => {
                                                const key =
                                                    getTanggalLengkap(
                                                        itemTanggal,
                                                        bulan,
                                                        tahun
                                                    ) || index;

                                                return (
                                                    <React.Fragment key={key}>
                                                        <th className="w-10 min-w-[40px] border-r border-white/10 bg-[#13307a] px-1 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-blue-200">
                                                            Plan
                                                        </th>
                                                        <th className="w-10 min-w-[40px] border-r border-white/10 bg-[#13307a] px-1 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                                                            Act
                                                        </th>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    )}
                                </thead>

                                <tbody>
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6 + tanggal.length * (duaBaris ? 2 : 1)}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                        <Icon type="clipboard" className="h-6 w-6" />
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Belum ada Inspection Point
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Tambahkan inspection point atau
                                                        import dari Excel untuk mulai
                                                        menggunakan checklist.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map((item) => {
                                            // hitung selisih otomatis sekali per item
                                            const nilaiMap = pakaiActual
                                                ? hitungNilai(item)
                                                : null;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="group transition-colors hover:bg-blue-50/50"
                                                >
                                                    {/* No (sticky) - nomor urut per shift */}
                                                    <td className="sticky left-0 z-10 w-12 min-w-[48px] max-w-[48px] border-b border-r border-slate-100 bg-white px-0 py-2 text-center text-xs font-bold text-slate-500 group-hover:bg-blue-50">
                                                        {nomorUrut[item.id]}
                                                    </td>

                                                    {/* Inspection Point (sticky) */}
                                                    <td className="sticky left-[48px] z-10 border-b border-r border-slate-100 bg-white px-3 py-2 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)] group-hover:bg-blue-50">
                                                        <div className="text-sm font-semibold text-slate-800">
                                                            {item.inspection_point}
                                                        </div>
                                                    </td>

                                                    <td className="border-b border-r border-slate-100 px-3 py-2 text-xs text-slate-600">
                                                        {item.condition || '-'}
                                                    </td>

                                                    <td className="border-b border-r border-slate-100 px-3 py-2 text-xs text-slate-600">
                                                        {item.method || '-'}
                                                    </td>

                                                    <td className="border-b border-r border-slate-100 px-3 py-2 text-center text-xs font-bold text-indigo-600">
                                                        {item.shift || '-'}
                                                    </td>

                                                    <td className="border-b border-r border-slate-100 px-2 py-2">
                                                        <div className="flex justify-center gap-1.5">
                                                            <IconButton
                                                                title="Edit"
                                                                onClick={() => bukaEditItem(item)}
                                                                variant="blue"
                                                            >
                                                                <Icon type="edit" />
                                                            </IconButton>

                                                            <IconButton
                                                                title="Hapus"
                                                                onClick={() => hapusItem(item)}
                                                                variant="red"
                                                            >
                                                                <Icon type="trash" />
                                                            </IconButton>
                                                        </div>
                                                    </td>

                                                    {tanggal.map((itemTanggal, idx) => {
                                                        const tanggalLengkap =
                                                            getTanggalLengkap(
                                                                itemTanggal,
                                                                bulan,
                                                                tahun
                                                            );

                                                        // ---------- MODE KWH: Actual / Selisih / Catatan ----------
                                                        if (pakaiActual) {
                                                            const nilai =
                                                                nilaiMap[tanggalLengkap];

                                                            return (
                                                                <td
                                                                    key={tanggalLengkap || idx}
                                                                    className="idx-nilai border-b border-r border-slate-100 px-1 py-1.5 text-center align-top"
                                                                >
                                                                    <NilaiCell
                                                                        nilai={nilai}
                                                                        onSave={(payload) =>
                                                                            simpanNilai(
                                                                                item,
                                                                                tanggalLengkap,
                                                                                payload
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            );
                                                        }

                                                        // ---------- MODE PLAN / ACT: 2 kolom, masing-masing checkbox ----------
                                                        if (pakaiPlanAct) {
                                                            const cl = getChecklist(
                                                                item,
                                                                tanggalLengkap
                                                            );
                                                            const plan = Boolean(cl?.plan);
                                                            const act = Boolean(cl?.status);

                                                            return (
                                                                <React.Fragment
                                                                    key={tanggalLengkap || idx}
                                                                >
                                                                    <td
                                                                        className={`border-b border-r border-slate-100 px-1 py-1.5 text-center ${
                                                                            plan
                                                                                ? 'bg-blue-50/70'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <CheckBtn
                                                                            checked={plan}
                                                                            tone="blue"
                                                                            title={
                                                                                plan
                                                                                    ? 'Batalkan Plan'
                                                                                    : 'Tandai Plan'
                                                                            }
                                                                            onClick={() =>
                                                                                toggleChecklist(
                                                                                    item,
                                                                                    tanggalLengkap,
                                                                                    'plan'
                                                                                )
                                                                            }
                                                                        />

                                                                            <CatatanBtn
                                                                                ada={Boolean(
                                                                                    String(
                                                                                        cl?.catatan_plan ?? ''
                                                                                    ).trim()
                                                                                )}
                                                                                onClick={() =>
                                                                                    bukaCatatan(
                                                                                        item,
                                                                                        tanggalLengkap,
                                                                                        'plan'
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </td>

                                                                    <td
                                                                        className={`border-b border-r border-slate-100 px-1 py-1.5 text-center ${
                                                                            act
                                                                                ? 'bg-emerald-50/70'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <CheckBtn
                                                                                checked={act}
                                                                                tone="emerald"
                                                                                title={
                                                                                    act
                                                                                        ? 'Batalkan Act'
                                                                                        : 'Tandai Act'
                                                                                }
                                                                                onClick={() =>
                                                                                    toggleChecklist(
                                                                                        item,
                                                                                        tanggalLengkap,
                                                                                        'status'
                                                                                    )
                                                                                }
                                                                            />

                                                                            <CatatanBtn
                                                                                ada={Boolean(
                                                                                    String(
                                                                                        cl?.catatan ?? ''
                                                                                    ).trim()
                                                                                )}
                                                                                onClick={() =>
                                                                                    bukaCatatan(
                                                                                        item,
                                                                                        tanggalLengkap,
                                                                                        'status'
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </React.Fragment>
                                                            );
                                                        }

                                                        // ---------- MODE BIASA: centang + catatan ----------
                                                        const checklist = getChecklist(
                                                            item,
                                                            tanggalLengkap
                                                        );

                                                        const checked = Boolean(
                                                            checklist?.status
                                                        );

                                                        return (
                                                            <td
                                                                key={tanggalLengkap || idx}
                                                                className={`border-b border-r border-slate-100 px-1 py-1.5 text-center ${
                                                                    checked ? 'bg-emerald-50/70' : ''
                                                                }`}
                                                            >
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <CheckBtn
                                                                        checked={checked}
                                                                        tone="emerald"
                                                                        title={
                                                                            checked
                                                                                ? 'Klik untuk membatalkan'
                                                                                : 'Klik untuk menandai selesai'
                                                                        }
                                                                        onClick={() =>
                                                                            toggleChecklist(
                                                                                item,
                                                                                tanggalLengkap
                                                                            )
                                                                        }
                                                                    />

                                                                    <CatatanBtn
                                                                        ada={Boolean(
                                                                            String(
                                                                                checklist?.catatan ?? ''
                                                                            ).trim()
                                                                        )}
                                                                        onClick={() =>
                                                                            bukaCatatan(
                                                                                item,
                                                                                tanggalLengkap
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* MONITORING RUNNING HOURS + KONSUMSI BAHAN BAKAR */}
                    {pakaiMonitoring && (
                        <MonitoringSection
                            checkSheet={checkSheet}
                            bulan={bulan}
                            tahun={tahun}
                            namaBulan={namaBulan[bulan - 1]}
                            pakaiBbm={pakaiBbm}
                            notify={notify}
                        />
                    )}

                    {/* ABNORMALITY (per bulan & tahun yang dipilih) */}
                    <section
                        style={{ animationDelay: '200ms' }}
                        className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <SectionHead
                            tone="amber"
                            title={`Abnormality ${namaBulan[bulan - 1]} ${tahun}${line ? ' · ' + line.nama_line : ''}`}
                            // desc="Catat abnormality, countermeasure, status, dan PIC."
                            count={`${checkSheet.abnormalities?.length ?? 0} data`}
                            action={
                                <button
                                    type="button"
                                    onClick={bukaTambahAbnormality}
                                    className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs font-bold text-white transition hover:from-amber-600 hover:to-orange-600"
                                >
                                    <Icon type="plus" className="h-3.5 w-3.5" />
                                    Tambah
                                </button>
                            }
                        />

                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-indigo-900 to-violet-900 text-white">
                                        <th className={`w-32 text-left ${tableHead}`}>
                                            Tanggal
                                        </th>

                                        <th className={`min-w-[220px] text-left ${tableHead}`}>
                                            Abnormality
                                        </th>

                                        <th className={`min-w-[240px] text-left ${tableHead}`}>
                                            Countermeasure
                                        </th>

                                        <th className={`w-28 text-center ${tableHead}`}>
                                            Status
                                        </th>

                                        <th className={`w-36 text-left ${tableHead}`}>
                                            PIC
                                        </th>

                                        <th className="w-24 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {!checkSheet.abnormalities ||
                                    checkSheet.abnormalities.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                                                        <Icon type="alert" className="h-6 w-6" />
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Belum ada abnormality bulan{' '}
                                                        {namaBulan[bulan - 1]} {tahun}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Tambahkan data abnormality jika
                                                        ditemukan kondisi tidak normal.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        checkSheet.abnormalities.map(
                                            (abnormality) => (
                                                <tr
                                                    key={abnormality.id}
                                                    className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-amber-50/40"
                                                >
                                                    <td className="px-3 py-3 text-xs font-semibold text-slate-700">
                                                        {formatTanggal(abnormality.tanggal)}
                                                    </td>

                                                    <td className="px-3 py-3 text-sm font-semibold text-slate-800">
                                                        {abnormality.abnormality || '-'}
                                                    </td>

                                                    <td className="px-3 py-3 text-sm leading-5 text-slate-600">
                                                        {abnormality.countermeasure || '-'}
                                                    </td>

                                                    <td className="px-3 py-3 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${getStatusClass(
                                                                abnormality.status
                                                            )}`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                                                    abnormality.status
                                                                )}`}
                                                            />

                                                            {abnormality.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-3 py-3 text-sm text-slate-600">
                                                        {abnormality.pic || '-'}
                                                    </td>

                                                    <td className="px-2 py-3">
                                                        <div className="flex justify-center gap-1.5">
                                                            <IconButton
                                                                title="Edit"
                                                                onClick={() =>
                                                                    bukaEditAbnormality(abnormality)
                                                                }
                                                                variant="blue"
                                                            >
                                                                <Icon type="edit" />
                                                            </IconButton>

                                                            <IconButton
                                                                title="Hapus"
                                                                onClick={() =>
                                                                    hapusAbnormality(abnormality)
                                                                }
                                                                variant="red"
                                                            >
                                                                <Icon type="trash" />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
                TOAST (berhasil / gagal)
            ====================================================== */}
            {toast && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`idx-toast fixed right-5 top-5 z-[120] flex w-[340px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-xl border bg-white p-3.5 shadow-2xl shadow-slate-950/40 ${
                        toast.type === 'error'
                            ? 'border-red-100'
                            : 'border-emerald-100'
                    }`}
                >
                    <div
                        className={`absolute left-0 top-0 h-full w-1 ${
                            toast.type === 'error'
                                ? 'bg-gradient-to-b from-red-400 to-rose-600'
                                : 'bg-gradient-to-b from-emerald-400 to-green-600'
                        }`}
                    />

                    <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            toast.type === 'error'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-emerald-50 text-emerald-600'
                        }`}
                    >
                        <Icon
                            type={toast.type === 'error' ? 'alert' : 'check'}
                            className="h-4 w-4"
                        />
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">
                            {toast.type === 'error' ? 'Gagal' : 'Berhasil'}
                        </p>

                        <p className="mt-0.5 break-words text-sm leading-snug text-slate-500">
                            {toast.message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                        aria-label="Tutup"
                    >
                        <Icon type="close" className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* MODAL - IMPORT EXCEL */}
            {showImportModal && (
                <ImportModal
                    checkSheet={checkSheet}
                    onClose={() => setShowImportModal(false)}
                    onDone={() => notify('Import data berhasil.')}
                />
            )}

            {/* MODAL - ADD ITEM */}
            {showAddItemModal && (
                <Modal
                    title="Tambah Inspection Point"
                    description="Tambahkan titik pemeriksaan baru ke dalam check sheet."
                    onClose={() => setShowAddItemModal(false)}
                >
                    <form onSubmit={submit} className="space-y-6">
                        <ItemFields
                            data={data}
                            setData={setData}
                            errors={errors}
                            withPlaceholder
                            nomor={nomorBerikutnya(data.shift)}
                        />

                        <FormActions
                            onCancel={() => setShowAddItemModal(false)}
                            processing={processing}
                            label="Simpan Data"
                        />
                    </form>
                </Modal>
            )}

            {/* MODAL - EDIT ITEM */}
            {editingItem && (
                <Modal
                    title="Edit Inspection Point"
                    description="Perbarui informasi inspection point yang sudah tersimpan."
                    onClose={() => {
                        setEditingItem(null);
                        resetEdit();
                    }}
                >
                    <form onSubmit={submitEdit} className="space-y-6">
                        <ItemFields
                            data={editData}
                            setData={setEditData}
                            errors={editErrors}
                            nomor={
                                editData.shift === editingItem.shift
                                    ? nomorUrut[editingItem.id]
                                    : nomorBerikutnya(editData.shift)
                            }
                        />

                        <FormActions
                            onCancel={() => {
                                setEditingItem(null);
                                resetEdit();
                            }}
                            processing={processingEdit}
                            label="Simpan Perubahan"
                        />
                    </form>
                </Modal>
            )}

            {/* MODAL - ADD ABNORMALITY */}
            {showAddAbnormalityModal && (
                <Modal
                    title="Tambah Abnormality"
                    description="Catat kondisi abnormal yang ditemukan selama pemeriksaan."
                    icon="alert"
                    onClose={() => setShowAddAbnormalityModal(false)}
                >
                    <form onSubmit={submitAbnormality} className="space-y-6">
                        <AbnormalityFields
                            data={abnormalityData}
                            setData={setAbnormalityData}
                            errors={abnormalityErrors}
                            withPlaceholder
                        />

                        <FormActions
                            onCancel={() => setShowAddAbnormalityModal(false)}
                            processing={processingAbnormality}
                            label="Simpan Data"
                            tone="amber"
                        />
                    </form>
                </Modal>
            )}

            {/* MODAL - EDIT ABNORMALITY */}
            {editingAbnormality && (
                <Modal
                    title="Edit Abnormality"
                    description="Perbarui data abnormality yang sudah tersimpan."
                    icon="alert"
                    onClose={() => {
                        setEditingAbnormality(null);
                        resetEditAbnormality();
                    }}
                >
                    <form onSubmit={submitEditAbnormality} className="space-y-6">
                        <AbnormalityFields
                            data={editAbnormalityData}
                            setData={setEditAbnormalityData}
                            errors={editAbnormalityErrors}
                        />

                        <FormActions
                            onCancel={() => {
                                setEditingAbnormality(null);
                                resetEditAbnormality();
                            }}
                            processing={processingEditAbnormality}
                            label="Simpan Perubahan"
                            tone="amber"
                        />
                    </form>
                </Modal>
            )}

            {/* MODAL - CATATAN CHECKLIST */}
            <CatatanModal
                target={catatanTarget}
                value={catatanText}
                onChange={setCatatanText}
                onClose={tutupCatatan}
                onSave={simpanCatatan}
                saving={savingCatatan}
                namaBulan={namaBulan}
                bulan={bulan}
                tahun={tahun}
            />

            {/* DIALOG KONFIRMASI (simpan / edit / hapus) */}
            <ConfirmDialog
                dialog={confirmDialog}
                onCancel={() => setConfirmDialog(null)}
            />
        </>
    );
}
