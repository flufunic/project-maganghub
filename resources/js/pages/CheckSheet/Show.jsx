import React, { useState, useEffect, useRef } from 'react';
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
    chevron: { sw: 2, paths: ['M6 9l6 6 6-6'] },
    note: {
        paths: [
            'M11 4H5a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-6',
            'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
        ],
    },
    info: { circle: { cx: 12, cy: 12, r: 9 }, paths: ['M12 11v5', 'M12 8h.01'] },
    search: { circle: { cx: 11, cy: 11, r: 7 }, paths: ['m20 20-4-4'] },
    building: {
        rect: { x: 4, y: 3, width: 16, height: 18, rx: 2 },
        paths: ['M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3'],
    },
    layers: { paths: ['M12 2l10 5-10 5L2 7z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'] },
    hash: { paths: ['M5 9h14M5 15h14', 'M10 3L8 21M16 3l-2 18'] },
    droplet: { paths: ['M12 2.7s6 6.2 6 10.8a6 6 0 11-12 0c0-4.6 6-10.8 6-10.8z'] },
    clock: { paths: ['M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'] },
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
            {icon.circle && <circle {...icon.circle} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
};

const Spinner = ({ className = 'h-4 w-4' }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`animate-spin ${className}`}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

// =========================================================
// STYLE TOKENS
// =========================================================

const cardClass =
    'rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_48px_-12px_rgba(15,23,42,0.10)]';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

// select di dalam form (panah dibuat sendiri lewat SelectBox)
const selectClass = `${inputClass} cursor-pointer appearance-none pr-9`;

// select kecil untuk toolbar
const toolbarSelect =
    'h-9 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

// tableHeadBase = tanpa padding horizontal (supaya bisa di-override tanpa konflik px-*)
const tableHeadBase =
    'border-b border-slate-200 py-3 text-[11px] font-semibold text-slate-500 whitespace-nowrap';

const tableHead = `${tableHeadBase} px-3`;

// Lebar kolom sticky "No" (HARUS sama dengan offset left kolom Inspection Point)
// w-12 = 48px  ->  left-[48px]

// input kecil untuk sel Actual / Selisih / Catatan
const miniInput =
    'w-full rounded-md border border-slate-200 bg-white px-1 py-1 text-center text-[11px] outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';

// tombol
const btnBase =
    'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs font-bold outline-none transition-all duration-200 active:scale-[0.97] focus-visible:ring-4';

const btnPrimary = `${btnBase} bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 focus-visible:ring-blue-500/30`;
const btnAmber = `${btnBase} bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:bg-amber-600 focus-visible:ring-amber-500/30`;
const btnSoftBlue = `${btnBase} border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500/20`;
const btnSoftGreen = `${btnBase} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-500/20`;

// =========================================================
// OVERLAY HELPER (Esc menutup overlay paling atas + kunci scroll)
// =========================================================

let overlayCount = 0;

const useOverlay = (ref, onClose) => {
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        overlayCount += 1;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key !== 'Escape') return;

            const semua = document.querySelectorAll('[data-overlay]');

            if (semua[semua.length - 1] === ref.current) {
                closeRef.current?.();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            overlayCount -= 1;

            if (overlayCount <= 0) {
                overlayCount = 0;
                document.body.style.overflow = '';
            }
        };
    }, [ref]);
};

// =========================================================
// SMALL COMPONENTS
// =========================================================

const IconButton = ({ title, onClick, variant = 'blue', children }) => {
    const variants = {
        blue: 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200/70 hover:bg-blue-100 hover:text-blue-700',
        red: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200/70 hover:bg-red-100 hover:text-red-700',
        amber: 'bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200/70 hover:bg-amber-100 hover:text-amber-700',
        slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-200 hover:text-slate-800',
    };

    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg outline-none transition-all duration-200 active:scale-90 focus-visible:ring-4 focus-visible:ring-blue-500/20 ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const SelectBox = ({ variant = 'form', children, ...props }) => (
    <div className="relative">
        <select
            {...props}
            className={variant === 'sm' ? toolbarSelect : selectClass}
        >
            {children}
        </select>

        <Icon
            type="chevron"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
    </div>
);

const Field = ({ label, children, error, required = false, className = '' }) => (
    <div className={className}>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {children}

        {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
    </div>
);

// Header section: ikon + judul + jumlah + tombol aksi
const SectionHead = ({ title, desc, count, tone = 'blue', icon = 'clipboard', action }) => {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
                >
                    <Icon type={icon} className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-900">
                            {title}
                        </h2>

                        {count !== undefined && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-500">
                                {count}
                            </span>
                        )}
                    </div>

                    {desc && (
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                            {desc}
                        </p>
                    )}
                </div>
            </div>

            {action}
        </div>
    );
};

const InfoChip = ({ icon, label, value, mono = false }) => (
    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs">
        <Icon type={icon} className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400">{label}</span>
        <span
            className={`font-semibold text-slate-800 ${mono ? 'font-mono text-blue-700' : ''}`}
        >
            {value}
        </span>
    </span>
);

const FormBanner = ({ text, tone = 'blue' }) => {
    const tones = {
        blue: 'border-blue-500 bg-blue-50/60',
        indigo: 'border-indigo-500 bg-indigo-50/60',
        amber: 'border-amber-500 bg-amber-50/60',
        orange: 'border-orange-500 bg-orange-50/60',
    };

    return (
        <div className={`rounded-xl border-l-4 px-4 py-3 ${tones[tone]}`}>
            <h4 className="text-sm font-bold text-slate-800">{text}</h4>
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
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-slate-300/50"
        >
            Batal
        </button>

        <button
            type="submit"
            disabled={processing || disabled}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white outline-none transition-all duration-200 active:scale-[0.97] focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                tone === 'amber'
                    ? 'bg-amber-500 shadow-lg shadow-amber-500/25 hover:bg-amber-600 focus-visible:ring-amber-500/30'
                    : 'bg-blue-600 shadow-lg shadow-blue-600/25 hover:bg-blue-700 focus-visible:ring-blue-500/30'
            }`}
        >
            {processing && <Spinner />}
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
                        className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-sm font-bold text-blue-700 outline-none placeholder:font-medium placeholder:text-blue-300"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                        Otomatis
                    </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                    Mengikuti urutan pada shift yang dipilih.
                </p>
            </Field>

            <Field label="Shift" required error={errors.shift}>
                <SelectBox
                    value={data.shift}
                    onChange={(e) => setData('shift', e.target.value)}
                >
                    <option value="">Pilih Shift</option>
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                </SelectBox>
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

// =========================================================
// PILIH BANYAK ITEM PREVENTIF
// (checkbox, bisa dicari, dikelompokkan per divisi)
// value    = array no item preventif yang dipilih, contoh [12, 15, 18]
// onChange = dipanggil dengan array no yang baru
// =========================================================

const PreventifPicker = ({ options = [], value = [], onChange }) => {
    const [cari, setCari] = useState('');

    const terpilih = (value ?? []).map(String);

    const toggle = (no) => {
        const key = String(no);

        const berikutnya = terpilih.includes(key)
            ? terpilih.filter((v) => v !== key)
            : [...terpilih, key];

        onChange(berikutnya.map(Number));
    };

    const kataKunci = cari.trim().toLowerCase();

    const grup = options
        .filter(
            (p) =>
                !kataKunci ||
                String(p.item_preventif ?? '').toLowerCase().includes(kataKunci) ||
                String(p.divisi ?? '').toLowerCase().includes(kataKunci)
        )
        .reduce((hasil, p) => {
            const kunci = p.divisi || 'Lainnya';

            (hasil[kunci] ||= []).push(p);

            return hasil;
        }, {});

    const dipilihList = options.filter((p) => terpilih.includes(String(p.no)));

    return (
        <div className="space-y-2.5">
            {/* Chip item yang sudah dipilih */}
            {dipilihList.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {dipilihList.map((p) => (
                        <span
                            key={p.no}
                            className="idx-pop-in inline-flex max-w-full items-center gap-1.5 rounded-lg bg-indigo-50 py-1 pl-2.5 pr-1.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200/80"
                        >
                            <span className="truncate">
                                {p.divisi} {p.no_item}. {p.item_preventif}
                            </span>

                            <button
                                type="button"
                                onClick={() => toggle(p.no)}
                                className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-md text-indigo-400 transition hover:bg-indigo-100 hover:text-red-500"
                                title="Hapus pilihan"
                                aria-label="Hapus pilihan"
                            >
                                <Icon type="close" className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative">
                <Icon
                    type="search"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari item preventif... (contoh: air loading)"
                    className={`${inputClass} pl-10`}
                />
            </div>

            <div className="idx-scroll max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                {Object.keys(grup).length === 0 ? (
                    <p className="px-3 py-6 text-center text-xs text-slate-400">
                        Item tidak ditemukan.
                    </p>
                ) : (
                    Object.entries(grup).map(([divisi, items]) => (
                        <div key={divisi}>
                            <p className="sticky top-0 z-10 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                                {divisi}
                            </p>

                            {items.map((p) => {
                                const aktif = terpilih.includes(String(p.no));

                                return (
                                    <label
                                        key={p.no}
                                        className={`flex cursor-pointer items-start gap-2.5 border-t border-slate-100 px-3 py-2 text-xs transition hover:bg-blue-50/60 ${
                                            aktif ? 'bg-indigo-50/60' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={aktif}
                                            onChange={() => toggle(p.no)}
                                            className="mt-0.5 h-3.5 w-3.5 cursor-pointer accent-indigo-600"
                                        />

                                        <span className="leading-snug text-slate-700">
                                            <span className="font-bold text-slate-500">
                                                {p.no_item}.
                                            </span>{' '}
                                            {p.item_preventif}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Field form Abnormality (dipakai add & edit)
// preventifOptions = daftar item preventif untuk pilihan "Item Preventif Terkait"
// hideTanggal      = true kalau tanggal sudah ditentukan oleh kotak yang diklik
const AbnormalityFields = ({
    data,
    setData,
    errors,
    withPlaceholder = false,
    preventifOptions = [],
    hideTanggal = false,
}) => {
    // error array dari Laravel: preventif_mesin_ids / preventif_mesin_ids.0 / ...
    const errorPreventif =
        errors.preventif_mesin_ids ||
        Object.entries(errors).find(([k]) =>
            k.startsWith('preventif_mesin_ids.')
        )?.[1];

    const jumlahDipilih = (data.preventif_mesin_ids ?? []).length;

    return (
        <>
            <div className={`grid gap-5 ${hideTanggal ? '' : 'sm:grid-cols-2'}`}>
                {!hideTanggal && (
                    <Field label="Tanggal" required error={errors.tanggal}>
                        <input
                            type="date"
                            value={data.tanggal}
                            onChange={(e) => setData('tanggal', e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                        />
                    </Field>
                )}

                <Field label="Status" required error={errors.status}>
                    <SelectBox
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        <option value="Open">Open</option>
                        <option value="Progress">Progress</option>
                        <option value="Closed">Closed</option>
                    </SelectBox>
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

            {/* ITEM PREVENTIF TERKAIT (BOLEH LEBIH DARI 1) -> memicu notifikasi di halaman Preventif */}
            <Field
                label={`Item Preventif Terkait${
                    jumlahDipilih > 0 ? ` (${jumlahDipilih} dipilih)` : ''
                }`}
                error={errorPreventif}
            >
                <PreventifPicker
                    options={preventifOptions}
                    value={data.preventif_mesin_ids ?? []}
                    onChange={(ids) => setData('preventif_mesin_ids', ids)}
                />

                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
                    <Icon type="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>
                        Boleh pilih lebih dari satu. Jika dipilih, abnormality ini muncul
                        sebagai notifikasi &quot;perlu pengecekan lebih lanjut&quot; di
                        semua item preventif tersebut sampai statusnya <b>Closed</b>.
                    </span>
                </p>
            </Field>
        </>
    );
};

// state: null | 'open' (silang merah) | 'progress' (jam, menunggu) | 'closed' (centang normal)
// =========================================================
// CHECKBOX KECIL (kolom Plan / Act / centang)
// dot kuning = ada catatan, dot merah = ada abnormality
// =========================================================

const CheckBtn = ({ checked, tone = 'emerald', title, onClick, catatan = false, abnormality = false }) => {
    const warna = checked
        ? tone === 'blue'
            ? 'border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/30'
            : 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
        : 'border-slate-200 bg-white text-transparent hover:border-blue-400 hover:bg-blue-50';

    return (
        <span className="relative mx-auto block h-6 w-6">
            <button
                type="button"
                title={title}
                aria-label={title}
                aria-pressed={checked}
                onClick={onClick}
                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-2 outline-none transition-all duration-200 active:scale-90 focus-visible:ring-4 focus-visible:ring-blue-500/25 ${warna}`}
            >
                {checked && <Icon type="check" className="idx-check h-3.5 w-3.5" />}
            </button>

            {catatan && (
                <span
                    title="Ada catatan"
                    className="pointer-events-none absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400"
                />
            )}

            {abnormality && (
                <span
                    title="Ada abnormality"
                    className="pointer-events-none absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"
                />
            )}
        </span>
    );
};

// =========================================================
// TOMBOL CATATAN (ikon catatan, kuning kalau sudah ada catatan)
// =========================================================

const CatatanBtn = ({ ada, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        title={ada ? 'Lihat / ubah catatan' : 'Tambah catatan'}
        aria-label={ada ? 'Lihat atau ubah catatan' : 'Tambah catatan'}
        className={`mx-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded-md outline-none transition-all duration-200 hover:scale-110 focus-visible:ring-4 focus-visible:ring-blue-500/25 ${
            ada ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
        }`}
    >
        <Icon type="note" className="h-3.5 w-3.5" />
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
// abnormalCount / onAbnormal = tombol "Abn" untuk abnormality per kotak
// =========================================================

const NilaiCell = ({ nilai, onSave, abnormalCount = 0, onAbnormal }) => {
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
        <div className="mx-auto flex w-24 flex-col gap-1">
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
                className={`flex h-[24px] items-center justify-center rounded-md px-1 text-[11px] ${
                    nilai.selisih === null
                        ? 'bg-slate-50 text-slate-300'
                        : selisihAda
                        ? 'bg-red-50 font-bold text-red-600 ring-1 ring-inset ring-red-200'
                        : 'bg-slate-50 text-slate-500'
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

            {/* Tombol abnormality (merah + jumlah kalau sudah ada) */}
            <button
                type="button"
                onClick={onAbnormal}
                title={abnormalCount > 0 ? 'Lihat / ubah abnormality' : 'Tambah abnormality'}
                className={`flex h-6 cursor-pointer items-center justify-center gap-1 rounded-md text-[10px] font-bold outline-none transition active:scale-95 ${
                    abnormalCount > 0
                        ? 'bg-red-500 text-white shadow-sm shadow-red-500/30'
                        : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'
                }`}
            >
                <Icon type="close" className="h-3 w-3" />
                {abnormalCount > 0 ? `Abn ${abnormalCount}` : 'Abn'}
            </button>
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
    const overlayRef = useRef(null);

    useOverlay(overlayRef, onClose);

    return (
        <div
            ref={overlayRef}
            data-overlay
            className="idx-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-md sm:items-center sm:p-4"
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`idx-sheet relative flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl`}
            >
                <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            icon === 'alert'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-blue-50 text-blue-600'
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
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-slate-300/50"
                        title="Tutup"
                        aria-label="Tutup"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                <div className="idx-scroll overflow-y-auto p-5 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// =========================================================
// DIALOG KONFIRMASI (simpan / edit / hapus)
// =========================================================

const ConfirmDialogInner = ({ dialog, onCancel }) => {
    const overlayRef = useRef(null);
    const cancelRef = useRef(null);
    const confirmRef = useRef(null);

    useOverlay(overlayRef, onCancel);

    const isRed = dialog.tone === 'red';

    // aksi hapus: fokus awal di "Batal" supaya tidak terhapus tidak sengaja
    useEffect(() => {
        (isRed ? cancelRef : confirmRef).current?.focus();
    }, [isRed]);

    return (
        <div
            ref={overlayRef}
            data-overlay
            className="idx-overlay fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 backdrop-blur-md sm:items-center sm:p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-desc"
                className="idx-sheet w-full max-w-sm overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
            >
                <div className="px-6 pb-2 pt-7 text-center">
                    <div
                        className={`idx-icon-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-8 ${
                            isRed
                                ? 'bg-red-50 ring-red-50/60'
                                : 'bg-blue-50 ring-blue-50/60'
                        }`}
                    >
                        <span
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ${
                                isRed
                                    ? 'bg-red-600 shadow-red-600/30'
                                    : 'bg-blue-600 shadow-blue-600/30'
                            }`}
                        >
                            <Icon
                                type={dialog.icon ?? (isRed ? 'trash' : 'save')}
                                className="h-5 w-5"
                            />
                        </span>
                    </div>

                    <h2
                        id="confirm-title"
                        className="mt-5 text-lg font-extrabold tracking-tight text-slate-900"
                    >
                        {dialog.title}
                    </h2>

                    <p
                        id="confirm-desc"
                        className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500"
                    >
                        {dialog.message}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 px-6 pb-6 pt-6">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-slate-300/50"
                    >
                        Batal
                    </button>

                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={() => dialog.onConfirm?.()}
                        className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg outline-none transition active:scale-[0.97] focus-visible:ring-4 ${
                            isRed
                                ? 'bg-red-600 shadow-red-600/25 hover:bg-red-700 focus-visible:ring-red-500/30'
                                : 'bg-blue-600 shadow-blue-600/25 hover:bg-blue-700 focus-visible:ring-blue-500/30'
                        }`}
                    >
                        {dialog.confirmLabel ?? 'Ya'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmDialog = ({ dialog, onCancel }) => {
    if (!dialog) {
        return null;
    }

    return <ConfirmDialogInner dialog={dialog} onCancel={onCancel} />;
};

// =========================================================
// TAB ABNORMALITY DI DALAM MODAL CATATAN
// (abnormality milik 1 item pada 1 tanggal)
// =========================================================

const formatCatatanWaktu = (v) => {
    if (!v) return '';

    const d = new Date(v);

    return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AbnormalitasTab = ({
    checkSheet,
    line,
    target,
    list,
    preventifOptions,
    notify,
    confirm,
    onDone,
}) => {
    const baseUrl = `/check-sheets/${checkSheet.id}/abnormalities`;

    const kosong = {
        line_id: line?.id ?? '',
        check_sheet_item_id: target.item.id,
        preventif_mesin_ids: [],
        tanggal: target.tanggal,
        abnormality: '',
        countermeasure: '',
        status: 'Open',
        pic: '',
    };

    const form = useForm(kosong);

    // null = mode tambah baru, object = mode edit
    const [editing, setEditing] = useState(null);

    const bukaBaru = () => {
        form.clearErrors();
        form.setData(kosong);
        setEditing(null);
    };

    const bukaEdit = (a) => {
        form.clearErrors();
        form.setData({
            ...kosong,
            preventif_mesin_ids: (a.preventif_mesin_ids ?? []).map(Number),
            tanggal: String(a.tanggal).substring(0, 10),
            abnormality: a.abnormality ?? '',
            countermeasure: a.countermeasure ?? '',
            status: a.status ?? 'Open',
            pic: a.pic ?? '',
        });
        setEditing(a);
    };

    const submit = (e) => {
        e.preventDefault();

        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                notify(
                    editing
                        ? 'Abnormality berhasil diperbarui.'
                        : 'Abnormality berhasil ditambahkan.'
                );
                onDone();
            },
            onError: () =>
                notify('Data gagal disimpan. Periksa kembali isian kamu.', 'error'),
        };

        if (editing) {
            form.put(`${baseUrl}/${editing.id}`, opsi);
        } else {
            form.post(baseUrl, opsi);
        }
    };

    const hapus = () =>
        confirm({
            title: 'Hapus Abnormality?',
            message: 'Apakah kamu yakin ingin menghapus data abnormality ini?',
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () => {
                confirm(null);

                router.delete(`${baseUrl}/${editing.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        notify('Abnormality berhasil dihapus.');
                        onDone();
                    },
                    onError: () => notify('Data gagal dihapus.', 'error'),
                });
            },
        });

    const statusClass = (s) =>
        s === 'Closed'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
            : s === 'Progress'
            ? 'bg-amber-50 text-amber-700 ring-amber-200/80'
            : 'bg-red-50 text-red-700 ring-red-200/80';

    return (
        <form onSubmit={submit} className="space-y-5">
            {/* Daftar abnormality yang sudah ada di kotak ini */}
            {list.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                        Abnormality di kotak ini ({list.length})
                    </p>

                    {list.map((a) => (
                        <button
                            key={a.id}
                            type="button"
                            onClick={() => bukaEdit(a)}
                            className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                                editing?.id === a.id
                                    ? 'border-amber-400 bg-amber-50/60'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                            <span className="min-w-0 text-xs leading-snug text-slate-700">
                                {a.abnormality}
                            </span>

                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusClass(
                                    a.status
                                )}`}
                            >
                                {a.status}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <FormBanner
                text={editing ? 'Edit Abnormality' : 'Tambah Abnormality Baru'}
                tone="amber"
            />

            {editing && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                    <p className="text-xs font-bold text-amber-700">
                        Tindak lanjut dari Checksheet Preventif
                    </p>

                    {(editing.catatans ?? []).length === 0 ? (
                        <p className="mt-1 text-xs text-amber-700/70">
                            Belum ada catatan progress.
                        </p>
                    ) : (
                        <ul className="mt-2 space-y-1.5">
                            {editing.catatans.map((c) => (
                                <li key={c.id} className="text-xs leading-snug text-slate-700">
                                    <span className="font-semibold">{c.catatan}</span>
                                    <span className="ml-2 text-[11px] text-slate-400">
                                        {formatCatatanWaktu(c.created_at)}
                                        {c.oleh ? ` · ${c.oleh}` : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <AbnormalityFields
                data={form.data}
                setData={form.setData}
                errors={form.errors}
                preventifOptions={preventifOptions}
                withPlaceholder
                hideTanggal
            />

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                    {editing && (
                        <>
                            <button
                                type="button"
                                onClick={hapus}
                                className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.97]"
                            >
                                <Icon type="trash" className="h-4 w-4" />
                                Hapus
                            </button>

                            <button
                                type="button"
                                onClick={bukaBaru}
                                className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.97]"
                            >
                                <Icon type="plus" className="h-4 w-4" />
                                Baru
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-bold text-white shadow-lg shadow-amber-500/25 outline-none transition-all duration-200 hover:bg-amber-600 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {form.processing && <Spinner />}
                    {form.processing
                        ? 'Menyimpan...'
                        : editing
                        ? 'Simpan Perubahan'
                        : 'Simpan Abnormality'}
                </button>
            </div>
        </form>
    );
};

// =========================================================
// MODAL CATATAN CHECKLIST (tab Catatan + tab Abnormality)
// target.hanyaAbnormality = true (mode KWH) -> tab Catatan disembunyikan
// =========================================================

const CatatanModalInner = ({
    target,
    value,
    onChange,
    onClose,
    onSave,
    saving,
    namaBulan,
    bulan,
    tahun,
    abnormalList = [],
    checkSheet,
    line,
    preventifOptions = [],
    notify,
    confirm,
}) => {
    const overlayRef = useRef(null);

    useOverlay(overlayRef, onClose);

    // semua mode boleh punya abnormality
    const hanyaAbnormality = Boolean(target.hanyaAbnormality);

    const [tab, setTab] = useState(
        hanyaAbnormality || target.tab === 'abnormality' ? 'abnormality' : 'catatan'
    );

    const hari = Number(String(target.tanggal).substring(8, 10));

    const tabBtn = (key, label, activeClass, badge) => (
        <button
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold outline-none transition ${
                tab === key
                    ? activeClass
                    : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
            {label}
            {badge > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none text-white">
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <div
            ref={overlayRef}
            data-overlay
            className="idx-overlay fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 backdrop-blur-md sm:items-center sm:p-4"
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`idx-sheet flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl ${
                    tab === 'abnormality' ? 'max-w-2xl' : 'max-w-lg'
                }`}
            >
                {/* HEADER */}
                <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            hanyaAbnormality
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-blue-50 text-blue-600'
                        }`}
                    >
                        <Icon type={hanyaAbnormality ? 'alert' : 'note'} className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold text-slate-900">
                            {target.judul ?? 'Catatan Checklist'}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            {hari} {namaBulan[bulan - 1]} {tahun}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-slate-300/50"
                        aria-label="Tutup"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                {/* TAB */}
                {!hanyaAbnormality && (
                    <div className="flex shrink-0 gap-1 border-b border-slate-200 px-4 sm:px-5">
                        {tabBtn('catatan', 'Catatan', 'border-blue-600 text-blue-700')}
                        {tabBtn(
                            'abnormality',
                            'Abnormality',
                            'border-red-500 text-red-600',
                            abnormalList.length
                        )}
                    </div>
                )}

                {/* ISI */}
                <div className="idx-scroll flex-1 overflow-y-auto">
                    <div className="px-5 py-5 sm:px-6">
                        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3">
                            <Icon type="clipboard" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <p className="text-sm leading-snug text-slate-600">
                                {target.label}
                            </p>
                        </div>

                        {tab === 'catatan' ? (
                            <>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    Catatan
                                </label>

                                <textarea
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    rows="5"
                                    maxLength={255}
                                    autoFocus
                                    placeholder="Tulis catatan untuk checklist ini..."
                                    className={`${inputClass} resize-none`}
                                />

                                <p className="mt-1.5 text-right text-[11px] tabular-nums text-slate-400">
                                    {value.length}/255
                                </p>
                            </>
                        ) : (
                            <AbnormalitasTab
                                checkSheet={checkSheet}
                                line={line}
                                target={target}
                                list={abnormalList}
                                preventifOptions={preventifOptions}
                                notify={notify}
                                confirm={confirm}
                                onDone={onClose}
                            />
                        )}
                    </div>
                </div>

                {/* FOOTER (hanya tab Catatan) */}
                {tab === 'catatan' && (
                    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-slate-300/50"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 outline-none transition-all duration-200 hover:bg-blue-700 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && <Spinner />}
                            {saving ? 'Menyimpan...' : 'Simpan Catatan'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CatatanModal = (props) => {
    if (!props.target) {
        return null;
    }

    return <CatatanModalInner {...props} />;
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
                        className={`${inputClass} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100`}
                    />
                </Field>

                {loading && (
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                        <Spinner className="h-4 w-4 text-blue-600" />
                        Membaca file...
                    </p>
                )}

                {error && (
                    <div className="idx-fade flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {preview && (
                    <div className="idx-fade space-y-6">
                        <FormBanner
                            text="Cocokkan Kolom (terisi otomatis, bisa diubah)"
                            tone="indigo"
                        />

                        {MAP_FIELDS.map((f) => (
                            <div key={f.key}>
                                <p className="mb-1 text-xs font-semibold text-slate-700">
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
                                                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold outline-none transition-all duration-200 active:scale-95 focus-visible:ring-4 focus-visible:ring-indigo-500/20 ${
                                                    active
                                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/60'
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
                            <p className="mb-2 text-xs font-semibold text-slate-700">
                                Terapkan ke Shift
                            </p>

                            <div className="flex gap-3">
                                {['A', 'B'].map((s) => (
                                    <label
                                        key={s}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                                            shifts.includes(s)
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
                                            checked={shifts.includes(s)}
                                            onChange={() => toggleShift(s)}
                                        />
                                        Shift {s}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-semibold text-slate-700">
                                Contoh data ({preview.total_rows} baris terdeteksi)
                            </p>

                            <div className="idx-scroll overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            {preview.headers.map((h, i) => (
                                                <th
                                                    key={i}
                                                    className="whitespace-nowrap px-3 py-2.5 text-left font-semibold"
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

                        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-700">
                            <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                            Import bersifat menambah data. Jika file yang sama
                            diimport dua kali, item akan terduplikasi.
                        </div>
                    </div>
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
// PELUMASAN
// =========================================================

const INTERVALS = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
];

const LUB_KOSONG = {
    sub_mesin: '',
    jenis_pelumasan: '',
    qty: '',
    method: '',
    tools: '',
    time_minutes: '',
    interval: 'month',
    pic: '',
};

const LubrikasiSection = ({ checkSheet, line, confirm, notify }) => {
    const rows = checkSheet.lubrications ?? [];
    const baseUrl = `/check-sheets/${checkSheet.id}/lubrications`;

    // null = modal tutup, 'new' = tambah, object = edit
    const [editing, setEditing] = useState(null);
    const form = useForm(LUB_KOSONG);

    const tutup = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
    };

    const bukaTambah = () => {
        form.setData(LUB_KOSONG);
        setEditing('new');
    };

    const bukaEdit = (row) => {
        form.setData({
            sub_mesin: row.sub_mesin ?? '',
            jenis_pelumasan: row.jenis_pelumasan ?? '',
            qty: row.qty ?? '',
            method: row.method ?? '',
            tools: row.tools ?? '',
            time_minutes: row.time_minutes ?? '',
            interval: row.interval ?? '',
            pic: row.pic ?? '',
        });
        setEditing(row);
    };

    const submit = (e) => {
        e.preventDefault();

        const baru = editing === 'new';

        // line_id selalu ikut terkirim (data pelumasan milik line ini)
        form.transform((data) => ({
            ...data,
            line_id: line?.id ?? null,
        }));

        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                tutup();
                notify(baru ? 'Data pelumasan berhasil ditambahkan.' : 'Data pelumasan berhasil diperbarui.');
            },
            onError: () => notify('Data gagal disimpan. Periksa kembali isian kamu.', 'error'),
        };

        if (baru) {
            form.post(baseUrl, opsi);
        } else {
            form.put(`${baseUrl}/${editing.id}`, opsi);
        }
    };

    const hapus = (row) =>
        confirm({
            title: 'Hapus data pelumasan?',
            message: `Apakah kamu yakin ingin menghapus ${row.jenis_pelumasan}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () => {
                confirm(null);

                router.delete(`${baseUrl}/${row.id}`, {
                    preserveScroll: true,
                    onSuccess: () => notify('Data pelumasan berhasil dihapus.'),
                    onError: () => notify('Data gagal dihapus.', 'error'),
                });
            },
        });

    const th = 'border-b border-slate-200 px-3 py-3 text-[11px] font-semibold text-slate-500 whitespace-nowrap';
    const td = 'border-b border-slate-100 px-3 py-2.5 text-xs text-slate-600';

    return (
        <>
            <section className={`idx-rise mb-5 overflow-hidden ${cardClass}`}>
                <SectionHead
                    tone="blue"
                    icon="droplet"
                    title={`Pelumasan${line ? ' · ' + line.nama_line : ''}`}
                    desc="Jadwal pelumasan per sub mesin untuk line ini."
                    count={`${rows.length} data`}
                    action={
                        <button type="button" onClick={bukaTambah} className={btnPrimary}>
                            <Icon type="plus" className="h-3.5 w-3.5" />
                            Tambah
                        </button>
                    }
                />

                <div className="idx-scroll overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50">
                                <th rowSpan={2} className={`w-12 text-center ${th}`}>No</th>
                                <th rowSpan={2} className={`text-left ${th}`}>Sub Mesin</th>
                                <th rowSpan={2} className={`text-left ${th}`}>Jenis Pelumasan</th>
                                <th rowSpan={2} className={`text-left ${th}`}>Qty</th>
                                <th rowSpan={2} className={`text-left ${th}`}>Method</th>
                                <th rowSpan={2} className={`text-left ${th}`}>Tools</th>
                                <th rowSpan={2} className={`text-center ${th}`}>Time (Min)</th>
                                <th colSpan={4} className={`border-b border-slate-200 px-3 py-2 text-center text-[11px] font-semibold text-slate-500`}>Interval</th>
                                <th rowSpan={2} className={`text-left ${th}`}>PIC</th>
                                <th rowSpan={2} className={`w-24 text-center ${th}`}>Aksi</th>
                            </tr>
                            <tr className="bg-slate-50">
                                {INTERVALS.map((i) => (
                                    <th key={i.key} className="w-14 border-b border-slate-200 px-1 py-1.5 text-center text-[10px] font-semibold text-slate-400">
                                        {i.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-12 text-center">
                                        <div className="mx-auto flex max-w-sm flex-col items-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Icon type="droplet" className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                Belum ada data pelumasan
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {line ? `Tambahkan jadwal pelumasan untuk ${line.nama_line}.` : 'Tambahkan jadwal pelumasan pertama.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, idx) => (
                                    <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
                                        <td className={`${td} text-center font-bold text-slate-400`}>{idx + 1}</td>
                                        <td className={td}>{row.sub_mesin || '-'}</td>
                                        <td className={`${td} font-semibold text-slate-800`}>{row.jenis_pelumasan}</td>
                                        <td className={td}>{row.qty || '-'}</td>
                                        <td className={td}>{row.method || '-'}</td>
                                        <td className={td}>{row.tools || '-'}</td>
                                        <td className={`${td} text-center`}>{row.time_minutes ?? '-'}</td>

                                        {INTERVALS.map((i) => (
                                            <td key={i.key} className={`${td} text-center`}>
                                                {row.interval === i.key && (
                                                    <span className="mx-auto block h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
                                                )}
                                            </td>
                                        ))}

                                        <td className={td}>{row.pic || '-'}</td>

                                        <td className="border-b border-slate-100 px-2 py-2">
                                            <div className="flex justify-center gap-1">
                                                <IconButton title="Edit" variant="blue" onClick={() => bukaEdit(row)}>
                                                    <Icon type="edit" />
                                                </IconButton>
                                                <IconButton title="Hapus" variant="red" onClick={() => hapus(row)}>
                                                    <Icon type="trash" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {editing && (
                <Modal
                    title={editing === 'new' ? 'Tambah Pelumasan' : 'Edit Pelumasan'}
                    description={`Isi data pelumasan${line ? ' untuk ' + line.nama_line : ''}.`}
                    onClose={tutup}
                >
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Sub Mesin" error={form.errors.sub_mesin}>
                                <input type="text" value={form.data.sub_mesin}
                                    onChange={(e) => form.setData('sub_mesin', e.target.value)}
                                    className={inputClass} placeholder="Contoh: Pompa Oli" />
                            </Field>

                            <Field label="Jenis Pelumasan" required error={form.errors.jenis_pelumasan}>
                                <input type="text" value={form.data.jenis_pelumasan}
                                    onChange={(e) => form.setData('jenis_pelumasan', e.target.value)}
                                    className={inputClass} placeholder="Contoh: Pergantian oli" />
                            </Field>

                            <Field label="Qty Pelumasan" error={form.errors.qty}>
                                <input type="text" value={form.data.qty}
                                    onChange={(e) => form.setData('qty', e.target.value)}
                                    className={inputClass} placeholder="Contoh: 2 Liter" />
                            </Field>

                            <Field label="Method" error={form.errors.method}>
                                <input type="text" value={form.data.method}
                                    onChange={(e) => form.setData('method', e.target.value)}
                                    className={inputClass} />
                            </Field>

                            <Field label="Tools" error={form.errors.tools}>
                                <input type="text" value={form.data.tools}
                                    onChange={(e) => form.setData('tools', e.target.value)}
                                    className={inputClass} />
                            </Field>

                            <Field label="Time (Menit)" error={form.errors.time_minutes}>
                                <input type="number" min="0" value={form.data.time_minutes}
                                    onChange={(e) => form.setData('time_minutes', e.target.value)}
                                    className={inputClass} />
                            </Field>

                            <Field label="Interval" error={form.errors.interval}>
                                <SelectBox value={form.data.interval}
                                    onChange={(e) => form.setData('interval', e.target.value)}>
                                    <option value="">Pilih interval</option>
                                    {INTERVALS.map((i) => (
                                        <option key={i.key} value={i.key}>{i.label}</option>
                                    ))}
                                </SelectBox>
                            </Field>

                            <Field label="PIC" error={form.errors.pic}>
                                <input type="text" value={form.data.pic}
                                    onChange={(e) => form.setData('pic', e.target.value)}
                                    className={inputClass} />
                            </Field>
                        </div>

                        <FormActions onCancel={tutup} processing={form.processing} label="Simpan Data" />
                    </form>
                </Modal>
            )}
        </>
    );
};

// =========================================================
// MAIN
// =========================================================

// prevActuals = { [item_id]: actual terakhir SEBELUM tanggal 1 bulan ini }
// (dikirim dari controller, supaya hitungan selisih menyambung antar bulan)
//
// preventifOptions = [{ no, divisi, no_item, item_preventif }]
// (dikirim dari CheckSheetController::show, untuk pilihan Item Preventif Terkait)
//
// checkSheet.abnormalities[].preventif_mesin_ids = [no, no, ...]
// checkSheet.abnormalities[].check_sheet_item_id = id item (kotak tempat abnormality dicatat)
export default function Show({
    checkSheet,
    bulan,
    tahun,
    tanggal,
    line,
    prevActuals = {},
    preventifOptions = [],
    isPimpinan = false,
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

    const pakaiPelumasan = Boolean(checkSheet.pakai_pelumasan);

    // Mode Plan/Act: tiap tanggal punya 2 kolom (Plan | Act), header 2 baris
    const duaBaris = pakaiPlanAct && !pakaiActual;
    const barisHeader = duaBaris ? 2 : 1;

    // Cari data item preventif dari BANYAK id (untuk label di tabel abnormality)
    const getPreventifList = (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) {
            return [];
        }

        return ids
            .map((id) =>
                preventifOptions.find((p) => String(p.no) === String(id))
            )
            .filter(Boolean);
    };

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

    // Toast: { id, type: 'success' | 'error', message }
    const [toast, setToast] = useState(null);

    // Catatan checklist (mode Plan/Act & biasa) + abnormality per kotak
    const [catatanTarget, setCatatanTarget] = useState(null); // { item, tanggal, kolom, tab, label }
    const [catatanText, setCatatanText] = useState('');
    const [savingCatatan, setSavingCatatan] = useState(false);

    const notify = (message, type = 'success') =>
        setToast({ id: Date.now(), type, message });

    // Toast dari flash backend
    useEffect(() => {
        if (flash?.success) {
            setToast({ id: Date.now(), type: 'success', message: flash.success });
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
    // FORM - ADD ABNORMALITY (tombol Tambah di tabel bawah)
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
        preventif_mesin_ids: [],
        tanggal: '',
        abnormality: '',
        countermeasure: '',
        status: 'Open',
        pic: '',
    });

    // =====================================================
    // FORM - EDIT ABNORMALITY (dari tabel bawah)
    // =====================================================

    const {
        data: editAbnormalityData,
        setData: setEditAbnormalityData,
        put: putEditAbnormality,
        processing: processingEditAbnormality,
        errors: editAbnormalityErrors,
        reset: resetEditAbnormality,
    } = useForm({
        preventif_mesin_ids: [],
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
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200/80';
        }

        if (status === 'Progress') {
            return 'bg-amber-50 text-amber-700 ring-amber-200/80';
        }

        return 'bg-red-50 text-red-700 ring-red-200/80';
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

    // Abnormality milik 1 item pada 1 tanggal (kotak tertentu)
    const abnormalDi = (itemId, tanggalLengkap) =>
        (checkSheet.abnormalities ?? []).filter(
            (a) =>
                Number(a.check_sheet_item_id) === Number(itemId) &&
                String(a.tanggal).substring(0, 10) === tanggalLengkap
        );

    // Status abnormality di satu kotak: 'open' | 'progress' | 'closed' | null
    // (open > progress > closed kalau ada lebih dari satu)
    const statusAbnormal = (itemId, tanggalLengkap) => {
        const list = abnormalDi(itemId, tanggalLengkap);

        if (list.length === 0) {
            return null;
        }

        const norm = (v) => {
            const x = String(v ?? '').trim().toLowerCase();

            if (['close', 'closed', 'selesai', 'done', 'ok', 'finish', 'finished'].includes(x)) {
                return 'closed';
            }

            if (['progress', 'in progress', 'on progress', 'proses'].includes(x)) {
                return 'progress';
            }

            return 'open';
        };

        const semua = list.map((a) => norm(a.status));

        if (semua.includes('open')) return 'open';
        if (semua.includes('progress')) return 'progress';

        return 'closed';
    };

    // =====================================================
    // CATATAN CHECKLIST + ABNORMALITY PER KOTAK
    // =====================================================

    const bukaCatatan = (item, tanggalLengkap, kolom = 'status', tab = null) => {
        const cl = getChecklist(item, tanggalLengkap);

        // Plan punya catatan sendiri (catatan_plan), Act / centang biasa pakai catatan
        const field = kolom === 'plan' ? 'catatan_plan' : 'catatan';

        // ada abnormality & belum ada catatan -> langsung buka tab Abnormality
        const adaAbn = kolom === 'status' && abnormalDi(item.id, tanggalLengkap).length > 0;
        const tabAwal =
            tab ?? (adaAbn && !String(cl?.[field] ?? '').trim() ? 'abnormality' : 'catatan');

        setCatatanTarget({
            item,
            tanggal: tanggalLengkap,
            kolom,
            tab: tabAwal,
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

    // KWH: buka modal yang hanya berisi form abnormality
    const bukaAbnormalityKwh = (item, tanggalLengkap) => {
        setCatatanTarget({
            item,
            tanggal: tanggalLengkap,
            kolom: 'status',
            tab: 'abnormality',
            hanyaAbnormality: true,
            label: item.inspection_point,
            judul: 'Abnormality',
        });
        setCatatanText('');
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
    // CENTANG SEMUA (khusus pimpinan, skip Sabtu/Minggu & tanggal mendatang)
    // Hanya untuk item yang sedang tampil (ikut filter Shift).
    // =====================================================

    const bisaCentangSemua =
        isPimpinan && !pakaiActual && filteredItems.length > 0;

    const jumlahHariKerja = (() => {
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        return tanggal.filter((t) => {
            const [y, m, d] = getTanggalLengkap(t, bulan, tahun)
                .split('-')
                .map(Number);
            const tgl = new Date(y, m - 1, d);
            const hari = tgl.getDay(); // 0 = Minggu, 6 = Sabtu

            return hari !== 0 && hari !== 6 && tgl <= hariIni;
        }).length;
    })();

    const centangSemua = (kolom = 'status') => {
        const labelKolom = kolom === 'plan' ? 'Plan' : duaBaris ? 'Act' : 'centang';

        setConfirmDialog({
            title: `Centang semua ${labelKolom}?`,
            message: `${filteredItems.length} item × ${jumlahHariKerja} hari kerja akan dicentang untuk ${namaBulan[bulan - 1]} ${tahun}. Sabtu, Minggu, dan tanggal yang belum datang dilewati.`,
            confirmLabel: 'Ya, Centang Semua',
            tone: 'blue',
            icon: 'check',
            onConfirm: () => {
                setConfirmDialog(null);

                router.post(
                    `/check-sheets/${checkSheet.id}/checklist/centang-semua`,
                    {
                        bulan,
                        tahun,
                        kolom,
                        line_id: line?.id ?? null,
                        item_ids: filteredItems.map((i) => i.id),
                    },
                    {
                        preserveScroll: true,
                        onError: () =>
                            notify('Gagal mencentang semua. Coba lagi.', 'error'),
                    }
                );
            },
        });
    };

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
            preventif_mesin_ids: (abnormality.preventif_mesin_ids ?? []).map(Number),
            tanggal: String(abnormality.tanggal).substring(0, 10),
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
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes idxFade {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes idxOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes idxSheet {
                    0% { opacity: 0; transform: translateY(28px) scale(.96); }
                    60% { opacity: 1; transform: translateY(-3px) scale(1.005); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes idxIconPop {
                    0% { transform: scale(.4) rotate(-30deg); opacity: 0; }
                    70% { transform: scale(1.1) rotate(6deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0); opacity: 1; }
                }
                @keyframes idxPopIn {
                    from { opacity: 0; transform: scale(.85); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes idxCheck {
                    0% { transform: scale(0) rotate(-20deg); }
                    70% { transform: scale(1.25); }
                    100% { transform: scale(1) rotate(0); }
                }
                @keyframes idxToast {
                    from { opacity: 0; transform: translateX(28px) scale(.97); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes idxProgress {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }

                .idx-rise { animation: idxRise .55s cubic-bezier(.22,1,.36,1) both; }
                .idx-fade { animation: idxFade .35s cubic-bezier(.22,1,.36,1) both; }
                .idx-overlay { animation: idxOverlay .2s ease-out both; }
                .idx-sheet { animation: idxSheet .38s cubic-bezier(.22,1,.36,1) both; }
                .idx-icon-pop { animation: idxIconPop .5s cubic-bezier(.34,1.56,.64,1) .1s both; }
                .idx-pop-in { animation: idxPopIn .25s cubic-bezier(.34,1.56,.64,1) both; }
                .idx-check { animation: idxCheck .3s cubic-bezier(.34,1.56,.64,1) both; }
                .idx-toast { animation: idxToast .35s cubic-bezier(.22,1,.36,1) both; }
                .idx-progress { animation: idxProgress 4s linear both; transform-origin: left; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.35);
                    border-radius: 999px;
                }
                .idx-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.55);
                }

                /* hilangkan spinner panah pada input number di sel KWH */
                .idx-nilai input[type=number]::-webkit-outer-spin-button,
                .idx-nilai input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .idx-nilai input[type=number] { -moz-appearance: textfield; }

                @media (prefers-reduced-motion: reduce) {
                    .idx-rise,
                    .idx-fade,
                    .idx-overlay,
                    .idx-sheet,
                    .idx-icon-pop,
                    .idx-pop-in,
                    .idx-check,
                    .idx-toast,
                    .idx-progress { animation: none !important; }

                    *, *::before, *::after {
                        transition-duration: .01ms !important;
                    }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100 text-slate-800">
                {/* BACKGROUND ACCENTS */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-blue-200/40 blur-[110px]" />
                    <div className="absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-200/30 blur-[110px]" />
                </div>

                {/* =================================================
                    HEADER (RINGKAS, SATU BARIS)
                ================================================== */}
                <header className="sticky top-0 z-40 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <Link
                            href={backUrl}
                            title="Kembali"
                            aria-label="Kembali"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white outline-none transition hover:bg-white/20 active:scale-95 focus-visible:ring-4 focus-visible:ring-white/30"
                        >
                            <Icon type="back" className="h-5 w-5" />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                {checkSheet.nama_checksheet}
                            </h1>

                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200/80">
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
                                        <span className="mx-1.5 text-white/30">/</span>
                                        <span className="font-semibold text-white/90">
                                            {line.nama_line}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    MAIN
                ================================================== */}
                <main className="relative z-10 mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {/* INFO + PERIODE */}
                    <section className={`idx-rise mb-5 ${cardClass}`}>
                        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-end xl:justify-between">
                            {/* INFO */}
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-400">
                                    Periode {namaBulan[bulan - 1]} {tahun}
                                </p>

                                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                                    {checkSheet.nama_checksheet}
                                </h2>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <InfoChip
                                        icon="building"
                                        label="Divisi"
                                        value={checkSheet.divisi?.nama_divisi ?? '-'}
                                    />

                                    {line && (
                                        <InfoChip
                                            icon="layers"
                                            label="Line"
                                            value={line.nama_line}
                                        />
                                    )}

                                    <InfoChip
                                        icon="hash"
                                        label="Dokumen"
                                        value={checkSheet.nomor_dokumen ?? '-'}
                                        mono
                                    />
                                </div>
                            </div>

                            {/* FILTER PERIODE */}
                            <div className="flex flex-wrap items-end gap-3">
                                <label className="flex min-w-[130px] flex-col gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500">
                                        Bulan
                                    </span>

                                    <SelectBox
                                        variant="sm"
                                        value={bulan}
                                        onChange={(e) =>
                                            ubahPeriode(e.target.value, tahun)
                                        }
                                    >
                                        {namaBulan.map((nama, index) => (
                                            <option key={nama} value={index + 1}>
                                                {nama}
                                            </option>
                                        ))}
                                    </SelectBox>
                                </label>

                                <label className="flex min-w-[100px] flex-col gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500">
                                        Tahun
                                    </span>

                                    <SelectBox
                                        variant="sm"
                                        value={tahun}
                                        onChange={(e) =>
                                            ubahPeriode(bulan, e.target.value)
                                        }
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
                                    </SelectBox>
                                </label>

                                <label className="flex min-w-[130px] flex-col gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500">
                                        Shift
                                    </span>

                                    <SelectBox
                                        variant="sm"
                                        value={shiftFilter}
                                        onChange={(e) =>
                                            setShiftFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">Semua Shift</option>
                                        <option value="A">Shift A</option>
                                        <option value="B">Shift B</option>
                                    </SelectBox>
                                </label>

                                <a
                                    href={`/check-sheets/${checkSheet.id}/export-excel?bulan=${bulan}&tahun=${tahun}&line_id=${line?.id ?? ''}`}
                                    className={btnSoftGreen}
                                >
                                    <Icon type="excel" className="h-3.5 w-3.5" />
                                    Export Excel
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* INSPECTION POINT */}
                    <section
                        style={{ animationDelay: '80ms' }}
                        className={`idx-rise mb-5 overflow-hidden ${cardClass}`}
                    >
                        <SectionHead
                            tone="blue"
                            icon="clipboard"
                            title="Inspection Point"
                            desc={
                                pakaiActual
                                    ? 'Isi Actual dan Catatan harian, Selisih dihitung otomatis.'
                                    : pakaiPlanAct
                                    ? 'Centang Plan / Act, klik ikon catatan untuk menambah catatan atau abnormality.'
                                    : 'Kelola titik pemeriksaan, checklist harian, catatan, dan abnormality.'
                            }
                            count={`${filteredItems.length} item`}
                            action={
                                <div className="flex flex-wrap gap-2">
                                    {bisaCentangSemua && (
                                        <>
                                            {pakaiPlanAct && (
                                                <button
                                                    type="button"
                                                    onClick={() => centangSemua('plan')}
                                                    className={btnSoftBlue}
                                                >
                                                    <Icon type="check" className="h-3.5 w-3.5" />
                                                    Centang Semua Plan
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => centangSemua('status')}
                                                className={btnSoftGreen}
                                            >
                                                <Icon type="check" className="h-3.5 w-3.5" />
                                                {pakaiPlanAct ? 'Centang Semua Act' : 'Centang Semua'}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowImportModal(true)}
                                        className={btnSoftGreen}
                                    >
                                        <Icon type="upload" className="h-3.5 w-3.5" />
                                        Import Excel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowAddItemModal(true)}
                                        className={btnPrimary}
                                    >
                                        <Icon type="plus" className="h-3.5 w-3.5" />
                                        Tambah
                                    </button>
                                </div>
                            }
                        />

                        {/* Keterangan cara baca sel (khusus KWH) */}
                        {pakaiActual && (
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500 sm:px-5">
                                <span className="font-bold text-slate-600">
                                    Tiap tanggal: Act / Sel / Catatan / Abn
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

                                <span>
                                    <span className="font-bold text-red-600">Abn</span> =
                                    catat abnormality di kotak ini
                                </span>
                            </div>
                        )}

                        {/* Keterangan icon catatan (mode Plan/Act & biasa) */}
                        {!pakaiActual && (
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500 sm:px-5">
                                <span className="inline-flex items-center gap-1.5">
                                    <Icon type="note" className="h-3.5 w-3.5 text-slate-400" />
                                    Klik ikon untuk catatan / abnormality
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    Dot kuning = ada catatan
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                                    Dot merah = ada abnormality
                                </span>
                            </div>
                        )}

                        <div className="idx-scroll overflow-x-auto">
                            {/* border-separate + border-spacing-0 => sticky column tidak ada celah */}
                            <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                                <thead>
                                    <tr>
                                        {/* No (sticky, lebar dikunci 48px) */}
                                        <th
                                            rowSpan={barisHeader}
                                            className={`sticky left-0 z-20 w-12 min-w-[48px] max-w-[48px] bg-slate-50 px-0 text-center ${tableHeadBase}`}
                                        >
                                            No
                                        </th>

                                        {/* Inspection Point (sticky, offset 48px = lebar kolom No) */}
                                        <th
                                            rowSpan={barisHeader}
                                            className={`sticky left-[48px] z-20 min-w-[220px] bg-slate-50 text-left shadow-[4px_0_8px_-4px_rgba(15,23,42,0.12)] ${tableHead}`}
                                        >
                                            Inspection Point
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`min-w-[160px] bg-slate-50 text-left ${tableHead}`}
                                        >
                                            Condition
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`min-w-[170px] bg-slate-50 text-left ${tableHead}`}
                                        >
                                            Method
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`w-20 bg-slate-50 text-center ${tableHead}`}
                                        >
                                            Shift
                                        </th>

                                        <th
                                            rowSpan={barisHeader}
                                            className={`w-24 bg-slate-50 text-center ${tableHead}`}
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
                                                    } border-b border-l border-slate-200 bg-slate-50 px-1 py-3 text-center text-[11px] font-bold text-slate-600`}
                                                >
                                                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-white tabular-nums shadow-sm ring-1 ring-slate-200">
                                                        {tanggalValue}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>

                                    {/* Baris header kedua: Plan | Act per tanggal */}
                                    {duaBaris && (
                                        <tr>
                                            {tanggal.map((itemTanggal, index) => {
                                                const key =
                                                    getTanggalLengkap(
                                                        itemTanggal,
                                                        bulan,
                                                        tahun
                                                    ) || index;

                                                return (
                                                    <React.Fragment key={key}>
                                                        <th className="w-10 min-w-[40px] border-b border-l border-slate-200 bg-slate-50 px-1 py-1.5 text-center text-[10px] font-bold text-blue-600">
                                                            Plan
                                                        </th>
                                                        <th className="w-10 min-w-[40px] border-b border-slate-200 bg-slate-50 px-1 py-1.5 text-center text-[10px] font-bold text-emerald-600">
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
                                                className="px-6 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                        <Icon type="clipboard" className="h-7 w-7" />
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Belum ada Inspection Point
                                                    </p>

                                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
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
                                                    className="group transition-colors hover:bg-slate-50"
                                                >
                                                    {/* No (sticky) - nomor urut per shift */}
                                                    <td className="sticky left-0 z-10 w-12 min-w-[48px] max-w-[48px] border-b border-slate-100 bg-white px-0 py-2 text-center text-xs font-bold tabular-nums text-slate-400 transition-colors group-hover:bg-slate-50">
                                                        {nomorUrut[item.id]}
                                                    </td>

                                                    {/* Inspection Point (sticky) */}
                                                    <td className="sticky left-[48px] z-10 border-b border-slate-100 bg-white px-3 py-2 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.10)] transition-colors group-hover:bg-slate-50">
                                                        <div className="text-sm font-semibold text-slate-800">
                                                            {item.inspection_point}
                                                        </div>
                                                    </td>

                                                    <td className="border-b border-slate-100 px-3 py-2 text-xs text-slate-600">
                                                        {item.condition || '-'}
                                                    </td>

                                                    <td className="border-b border-slate-100 px-3 py-2 text-xs text-slate-600">
                                                        {item.method || '-'}
                                                    </td>

                                                    <td className="border-b border-slate-100 px-3 py-2 text-center">
                                                        {item.shift ? (
                                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">
                                                                {item.shift}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">-</span>
                                                        )}
                                                    </td>

                                                    <td className="border-b border-slate-100 px-2 py-2">
                                                        <div className="flex justify-center gap-1">
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

                                                        const adaAbnormal =
                                                            abnormalDi(item.id, tanggalLengkap).length > 0;

                                                        const statusAbn = statusAbnormal(item.id, tanggalLengkap);

                                                        // ---------- MODE KWH: Actual / Selisih / Catatan / Abn ----------
                                                        if (pakaiActual) {
                                                            const nilai =
                                                                nilaiMap[tanggalLengkap];

                                                            return (
                                                                <td
                                                                    key={tanggalLengkap || idx}
                                                                    className="idx-nilai border-b border-l border-slate-100 px-1 py-1.5 text-center align-top"
                                                                >
                                                                    <NilaiCell
                                                                        nilai={nilai}
                                                                        abnormalCount={
                                                                            abnormalDi(item.id, tanggalLengkap).length
                                                                        }
                                                                        onAbnormal={() =>
                                                                            bukaAbnormalityKwh(
                                                                                item,
                                                                                tanggalLengkap
                                                                            )
                                                                        }
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
                                                        // ---------- MODE PLAN / ACT: 2 kolom, masing-masing checkbox ----------
                                                        if (pakaiPlanAct) {
                                                            const cl = getChecklist(item, tanggalLengkap);
                                                            const plan = Boolean(cl?.plan);
                                                            const act = Boolean(cl?.status);
                                                            const adaCatatanPlan = Boolean(String(cl?.catatan_plan ?? '').trim());
                                                            const adaCatatanAct = Boolean(String(cl?.catatan ?? '').trim());

                                                            return (
                                                                <React.Fragment key={tanggalLengkap || idx}>
                                                                    <td
                                                                        className={`border-b border-l border-slate-100 px-1 py-1.5 text-center transition-colors ${
                                                                            plan ? 'bg-blue-50/70' : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <CheckBtn
                                                                                checked={plan}
                                                                                tone="blue"
                                                                                catatan={adaCatatanPlan}
                                                                                title={plan ? 'Batalkan Plan' : 'Tandai Plan'}
                                                                                onClick={() => toggleChecklist(item, tanggalLengkap, 'plan')}
                                                                            />

                                                                            <CatatanBtn
                                                                                ada={adaCatatanPlan}
                                                                                onClick={() => bukaCatatan(item, tanggalLengkap, 'plan')}
                                                                            />
                                                                        </div>
                                                                    </td>

                                                                    <td
                                                                        className={`border-b border-slate-100 px-1 py-1.5 text-center transition-colors ${
                                                                            act ? 'bg-emerald-50/70' : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <CheckBtn
                                                                                checked={act}
                                                                                tone="emerald"
                                                                                catatan={adaCatatanAct}
                                                                                abnormality={adaAbnormal}
                                                                                title={act ? 'Batalkan Act' : 'Tandai Act'}
                                                                                onClick={() => toggleChecklist(item, tanggalLengkap, 'status')}
                                                                            />

                                                                            <CatatanBtn
                                                                                ada={adaCatatanAct}
                                                                                onClick={() => bukaCatatan(item, tanggalLengkap, 'status')}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </React.Fragment>
                                                            );
                                                        }

                                                        // ---------- MODE BIASA: centang + catatan ----------
                                                        const checklist = getChecklist(item, tanggalLengkap);
                                                        const checked = Boolean(checklist?.status);
                                                        const adaCatatan = Boolean(String(checklist?.catatan ?? '').trim());

                                                        return (
                                                            <td
                                                                key={tanggalLengkap || idx}
                                                                className={`border-b border-l border-slate-100 px-1 py-1.5 text-center transition-colors ${
                                                                    checked ? 'bg-emerald-50/70' : ''
                                                                }`}
                                                            >
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <CheckBtn
                                                                        checked={checked}
                                                                        tone="emerald"
                                                                        catatan={adaCatatan}
                                                                        abnormality={adaAbnormal}
                                                                        title={checked ? 'Klik untuk membatalkan' : 'Klik untuk menandai selesai'}
                                                                        onClick={() => toggleChecklist(item, tanggalLengkap)}
                                                                    />

                                                                    <CatatanBtn
                                                                        ada={adaCatatan}
                                                                        onClick={() => bukaCatatan(item, tanggalLengkap)}
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

                    {/* PELUMASAN */}
                    {pakaiPelumasan && (
                        <LubrikasiSection
                            checkSheet={checkSheet}
                            line={line}
                            confirm={setConfirmDialog}
                            notify={notify}
                        />
                    )}

                    {/* ABNORMALITY (per bulan & tahun yang dipilih) */}
                    <section
                        style={{ animationDelay: '160ms' }}
                        className={`idx-rise overflow-hidden ${cardClass}`}
                    >
                        <SectionHead
                            tone="amber"
                            icon="alert"
                            title={`Abnormality ${namaBulan[bulan - 1]} ${tahun}${line ? ' · ' + line.nama_line : ''}`}
                            desc="Catat kondisi tidak normal beserta tindak lanjutnya."
                            count={`${checkSheet.abnormalities?.length ?? 0} data`}
                            action={
                                <button
                                    type="button"
                                    onClick={bukaTambahAbnormality}
                                    className={btnAmber}
                                >
                                    <Icon type="plus" className="h-3.5 w-3.5" />
                                    Tambah
                                </button>
                            }
                        />

                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full min-w-[1000px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className={`w-32 text-left ${tableHead}`}>
                                            Tanggal
                                        </th>
                                        
                                        <th className={`min-w-[200px] text-left ${tableHead}`}>
                                            Item
                                        </th>

                                        <th className={`min-w-[220px] text-left ${tableHead}`}>
                                            Abnormality
                                        </th>

                                        <th className={`min-w-[240px] text-left ${tableHead}`}>
                                            Countermeasure
                                        </th>

                                        <th className={`w-32 text-center ${tableHead}`}>
                                            Status
                                        </th>

                                        <th className={`w-36 text-left ${tableHead}`}>
                                            PIC
                                        </th>

                                        <th className={`w-24 text-center ${tableHead}`}>
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {!checkSheet.abnormalities ||
                                    checkSheet.abnormalities.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                                        <Icon type="alert" className="h-7 w-7" />
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Belum ada abnormality bulan{' '}
                                                        {namaBulan[bulan - 1]} {tahun}
                                                    </p>

                                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                                        Tambahkan data abnormality jika
                                                        ditemukan kondisi tidak normal.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        checkSheet.abnormalities.map(
                                            (abnormality) => {
                                                const preventifTerkait = getPreventifList(
                                                    abnormality.preventif_mesin_ids
                                                );

                                                return (
                                                    <tr
                                                        key={abnormality.id}
                                                        className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                                                    >
                                                        <td className="px-3 py-3 align-top text-xs font-semibold text-slate-700">
                                                            {formatTanggal(abnormality.tanggal)}
                                                        </td>

                                                        <td className="px-3 py-3 align-top">
                                                            {(() => {
                                                                const itemAsal =
                                                                    abnormality.item ??
                                                                    checkSheet.items?.find(
                                                                        (i) => Number(i.id) === Number(abnormality.check_sheet_item_id)
                                                                    );

                                                                if (!itemAsal) {
                                                                    return (
                                                                        <span className="text-xs text-slate-300">
                                                                            {abnormality.check_sheet_item_id ? 'Item dihapus' : 'Umum'}
                                                                        </span>
                                                                    );
                                                                }

                                                                return (
                                                                    <span className="inline-flex max-w-[260px] items-start gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold leading-snug text-slate-700">
                                                                        <span className="shrink-0 rounded bg-indigo-100 px-1 text-indigo-700">
                                                                            {itemAsal.shift}
                                                                            {nomorUrut[itemAsal.id] ?? ''}
                                                                        </span>
                                                                        <span>{itemAsal.inspection_point}</span>
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>

                                                        <td className="px-3 py-3 align-top text-sm font-semibold text-slate-800">
                                                            {abnormality.abnormality || '-'}

                                                            {/* Item preventif yang terhubung (bisa lebih dari satu) */}
                                                            {preventifTerkait.length > 0 && (
                                                                <span className="mt-2 flex flex-col gap-1">
                                                                    {preventifTerkait.map((p) => (
                                                                        <span
                                                                            key={p.no}
                                                                            title="Terhubung ke Schedule Preventif Mesin"
                                                                            className="flex w-fit max-w-full items-start gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold leading-snug text-indigo-700 ring-1 ring-inset ring-indigo-100"
                                                                        >
                                                                            <Icon
                                                                                type="clipboard"
                                                                                className="mt-px h-3 w-3 shrink-0"
                                                                            />
                                                                            <span>
                                                                                Preventif {p.divisi} No. {p.no_item}:{' '}
                                                                                {p.item_preventif}
                                                                            </span>
                                                                        </span>
                                                                    ))}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-3 align-top text-sm leading-5 text-slate-600">
                                                            {abnormality.countermeasure || '-'}

                                                            {(abnormality.catatans ?? []).length > 0 && (
                                                                <span className="mt-2 block rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium leading-snug text-amber-700 ring-1 ring-inset ring-amber-200">
                                                                    Catatan: {abnormality.catatans[0].catatan}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-3 text-center align-top">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${getStatusClass(
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

                                                        <td className="px-3 py-3 align-top text-sm text-slate-600">
                                                            {abnormality.pic || '-'}
                                                        </td>

                                                        <td className="px-2 py-3 align-top">
                                                            <div className="flex justify-center gap-1">
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
                                                );
                                            }
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-[11px] font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                            <span className="mx-1.5 text-slate-300">·</span>
                            Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
                TOAST (berhasil / gagal)
            ====================================================== */}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    aria-live="polite"
                    className="idx-toast fixed right-4 top-4 z-[120] w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-200/80 sm:right-5 sm:top-5"
                >
                    <div className="flex items-start gap-3 p-3.5">
                        <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
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

                        <div className="min-w-0 flex-1 pt-0.5">
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
                            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-300 outline-none transition hover:bg-slate-100 hover:text-slate-500 focus-visible:ring-4 focus-visible:ring-slate-300/50"
                            aria-label="Tutup"
                        >
                            <Icon type="close" className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="h-1 bg-slate-100">
                        <div
                            className={`idx-progress h-full w-full ${
                                toast.type === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                            }`}
                        />
                    </div>
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
                            preventifOptions={preventifOptions}
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
                            preventifOptions={preventifOptions}
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

            {/* MODAL - CATATAN CHECKLIST + ABNORMALITY PER KOTAK */}
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
                abnormalList={
                    catatanTarget
                        ? abnormalDi(catatanTarget.item.id, catatanTarget.tanggal)
                        : []
                }
                checkSheet={checkSheet}
                line={line}
                preventifOptions={preventifOptions}
                notify={notify}
                confirm={setConfirmDialog}
            />

            {/* DIALOG KONFIRMASI (simpan / edit / hapus) */}
            <ConfirmDialog
                dialog={confirmDialog}
                onCancel={() => setConfirmDialog(null)}
            />
        </>
    );
}