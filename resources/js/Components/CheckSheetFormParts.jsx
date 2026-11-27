import React from 'react';

const ICONS = {
    back: ['m15 18-6-6 6-6'],
    down: ['m6 9 6 6 6-6'],
    save: [
        'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z',
        'M17 21v-8H7v8',
        'M7 3v5h8',
    ],
    edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z'],
    check: ['M5 12l4 4L19 6'],
    close: ['M18 6 6 18M6 6l12 12'],
    file: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M8 13h8M8 17h8'],
    clipboard: ['M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2', 'M9 3h6v4H9z', 'M9 12h6M9 16h6'],
    settings: [
        'M12 8a4 4 0 100 8 4 4 0 000-8z',
        'M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 00-1.78.54l-.05.07h-3.4l-.05-.07a1.7 1.7 0 00-1.78-.54l-.08.02-1.7-2.94.06-.06A1.7 1.7 0 008.6 15l-.08-.04v-3.4l.08-.04a1.7 1.7 0 00.34-1.88l-.06-.06 1.7-2.94.08.02a1.7 1.7 0 001.78-.54l.05-.07h3.4l.05.07a1.7 1.7 0 001.78.54l.08-.02 1.7 2.94-.06.06a1.7 1.7 0 00-.34 1.88l.08.04v3.4z',
    ],
    fuel: ['M3 22h14', 'M5 22V5a2 2 0 012-2h6a2 2 0 012 2v17', 'M5 10h10', 'M15 7h2l3 3v8a2 2 0 01-4 0v-5'],
    oil: ['M12 3s-7 8-7 12a7 7 0 0014 0c0-4-7-12-7-12z'],
    clock: ['M12 8v4l3 2', 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z'],
    alert: [
        'M12 9v4m0 4h.01',
        'M10.3 3.9 2.6 17.2A2 2 0 004.3 20h15.4a2 2 0 001.7-2.8L13.7 3.9a2 2 0 00-3.4 0z',
    ],
    layers: ['M12 2l10 5-10 5L2 7z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
};

export const Icon = ({ type, className = 'h-4 w-4' }) => {
    const paths = ICONS[type];
    if (!paths) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
};

export const cardClass =
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]';

export const inputBase =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

export const primaryButton =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButton =
    'inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

export const FormStyles = () => (
    <style>{`
        @keyframes pageEnter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes modalEnter { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes overlayEnter { from { opacity: 0; } to { opacity: 1; } }
        .page-enter { animation: pageEnter .45s ease-out both; }
        .modal-overlay { animation: overlayEnter .18s ease-out both; }
        .modal-content { animation: modalEnter .22s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
            .page-enter, .modal-overlay, .modal-content { animation: none !important; }
        }
    `}</style>
);

export const Field = ({ label, error, required = true, children }) => (
    <div className="min-w-0">
        <label className="mb-2 block text-xs font-bold tracking-wide text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {children}

        {error && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                <Icon type="alert" className="h-3.5 w-3.5" />
                {error}
            </p>
        )}
    </div>
);

export const CheckboxField = ({ label, hint, checked, onChange, error, icon }) => (
    <div className="min-w-0">
        <label
            className={`group flex h-full cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 ${
                checked
                    ? 'border-blue-300 bg-blue-50/70 shadow-sm shadow-blue-100'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm'
            }`}
        >
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    checked
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}
            >
                <Icon type={icon || 'settings'} className="h-4 w-4" />
            </span>

            <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-xs font-bold leading-relaxed text-slate-800">{label}</span>
                {hint && (
                    <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-500">{hint}</span>
                )}
            </span>

            <span className="relative mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                        checked
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white text-transparent peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100'
                    }`}
                >
                    {checked && <Icon type="check" className="h-3.5 w-3.5" />}
                </span>
            </span>
        </label>

        {error && <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
);

/* Blok "Konfigurasi Check Sheet" (dipakai Create & Edit) */
export const ConfigFields = ({ data, setData, errors }) => {
    const gantiMonitoring = (value) =>
        setData({
            ...data,
            pakai_monitoring: value,
            pakai_bbm: value ? data.pakai_bbm : false,
            bbm_kali_60: value ? data.bbm_kali_60 : false,
        });

    return (
        <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <CheckboxField
                    icon="file"
                    label="Actual / Selisih (KWH)"
                    hint="Untuk pengecekan KWH. Setiap tanggal memiliki kolom Actual, Selisih, dan Catatan."
                    checked={data.pakai_actual}
                    onChange={(v) => setData('pakai_actual', v)}
                    error={errors.pakai_actual}
                />

                <CheckboxField
                    icon="clipboard"
                    label="Plan & Act"
                    hint="Untuk check sheet Generator / Pompa. Setiap tanggal memiliki dua kotak: Plan dan Act."
                    checked={data.pakai_plan_act}
                    onChange={(v) => setData('pakai_plan_act', v)}
                    error={errors.pakai_plan_act}
                />

                <CheckboxField
                    icon="clock"
                    label="Monitoring Running Hours"
                    hint="Menambahkan tabel foto per minggu (Week 1–5) dan Actual Running (jam) di bawah daftar item."
                    checked={data.pakai_monitoring}
                    onChange={gantiMonitoring}
                    error={errors.pakai_monitoring}
                />

                <CheckboxField
                    icon="oil"
                    label="Tabel Pelumasan"
                    hint="Menambahkan tabel pelumasan: Sub Mesin, Jenis, Qty, Method, Tools, Time, Interval, dan PIC."
                    checked={data.pakai_pelumasan}
                    onChange={(v) => setData('pakai_pelumasan', v)}
                    error={errors.pakai_pelumasan}
                />
            </div>

            {data.pakai_monitoring && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            Opsi Monitoring Tambahan
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <CheckboxField
                            icon="fuel"
                            label="Monitoring Konsumsi Bahan Bakar (Solar)"
                            hint="Menambahkan tabel konsumsi solar yang dihitung berdasarkan Running Hours."
                            checked={data.pakai_bbm}
                            onChange={(v) =>
                                setData({
                                    ...data,
                                    pakai_bbm: v,
                                    bbm_kali_60: v ? data.bbm_kali_60 : false,
                                })
                            }
                            error={errors.pakai_bbm}
                        />

                        {data.pakai_bbm && (
                            <CheckboxField
                                icon="settings"
                                label="Rumus × 60 (Solar dalam L/menit) — Pompa Hydrant"
                                hint="Tidak dicentang (Generator): Solar (L/jam) × Running Hours. Dicentang (Pompa Hydrant): Solar (L/menit) × Running Hours × 60."
                                checked={data.bbm_kali_60}
                                onChange={(v) => setData('bbm_kali_60', v)}
                                error={errors.bbm_kali_60}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export const ConfirmDialog = ({
    open,
    title,
    subtitle = 'Konfirmasi penyimpanan data',
    message,
    confirmLabel,
    processing,
    onCancel,
    onConfirm,
}) => {
    if (!open) return null;

    return (
        <div
            className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !processing) onCancel();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="modal-content w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 px-5 py-5">
                    <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
                    <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                                <Icon type="save" className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 id="confirm-title" className="text-base font-bold text-white">{title}</h2>
                                <p className="mt-0.5 text-xs text-blue-100">{subtitle}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={processing}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-40"
                        >
                            <Icon type="close" className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-600">{message}</p>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onCancel} disabled={processing} className={secondaryButton}>
                        Periksa Kembali
                    </button>

                    <button type="button" onClick={onConfirm} disabled={processing} className={primaryButton}>
                        {processing ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Icon type="save" className="h-4 w-4" />
                                {confirmLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AppFooter = () => (
    <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-5 py-3">
            <p className="text-[10px] font-medium text-slate-400">
                © {new Date().getFullYear()} Emma Sarkilla
                <span className="mx-1.5 text-slate-300">·</span>
                Check Sheet Prediktif
            </p>
        </div>
    </footer>
);