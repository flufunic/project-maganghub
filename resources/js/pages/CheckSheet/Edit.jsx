
import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// =========================================================
// ICONS
// =========================================================

const ICONS = {
    back: ['m15 18-6-6 6-6'],
    down: ['m6 9 6 6 6-6'],
    edit: [
        'M12 20h9',
        'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z',
    ],
    save: [
        'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z',
        'M17 21v-8H7v8',
        'M7 3v5h8',
    ],
    check: ['M5 12l4 4L19 6'],
    close: ['M18 6 6 18M6 6l12 12'],
    file: [
        'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
        'M14 2v6h6',
        'M8 13h8M8 17h8',
    ],
    settings: [
        'M12 8a4 4 0 100 8 4 4 0 000-8z',
        'M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 00-1.78.54l-.05.07h-3.4l-.05-.07a1.7 1.7 0 00-1.78-.54l-.08.02-1.7-2.94.06-.06A1.7 1.7 0 008.6 15l-.08-.04v-3.4l.08-.04a1.7 1.7 0 00.34-1.88l-.06-.06 1.7-2.94.08.02a1.7 1.7 0 001.78-.54l.05-.07h3.4l.05.07a1.7 1.7 0 001.78.54l.08-.02 1.7 2.94-.06.06a1.7 1.7 0 00-.34 1.88l.08.04v3.4z',
    ],
    clipboard: [
        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2',
        'M9 3h6v4H9z',
        'M9 12h6M9 16h6',
    ],
    fuel: [
        'M3 22h14',
        'M5 22V5a2 2 0 012-2h6a2 2 0 012 2v17',
        'M5 10h10',
        'M15 7h2l3 3v8a2 2 0 01-4 0v-5',
    ],
    oil: [
        'M12 3s-7 8-7 12a7 7 0 0014 0c0-4-7-12-7-12z',
    ],
    clock: [
        'M12 8v4l3 2',
        'M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    ],
    alert: [
        'M12 9v4m0 4h.01',
        'M10.3 3.9 2.6 17.2A2 2 0 004.3 20h15.4a2 2 0 001.7-2.8L13.7 3.9a2 2 0 00-3.4 0z',
    ],
};

const Icon = ({ type, className = 'h-4 w-4' }) => {
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
            {paths.map((path, index) => (
                <path key={index} d={path} />
            ))}
        </svg>
    );
};

// =========================================================
// STYLE TOKENS
// =========================================================

const cardClass =
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]';

const inputBase =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const labelClass =
    'mb-2 block text-xs font-bold tracking-wide text-slate-700';

const primaryButton =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

const secondaryButton =
    'inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

// =========================================================
// FIELD
// =========================================================

const Field = ({ label, error, children }) => (
    <div className="min-w-0">
        <label className={labelClass}>
            {label}
            <span className="ml-1 text-red-500">*</span>
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

// =========================================================
// CHECKBOX OPTION
// =========================================================

const CheckboxField = ({
    label,
    hint,
    checked,
    onChange,
    error,
    icon,
}) => (
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
                <span className="block text-xs font-bold leading-relaxed text-slate-800">
                    {label}
                </span>

                {hint && (
                    <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-500">
                        {hint}
                    </span>
                )}
            </span>

            <span className="relative mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />

                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                        checked
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white text-transparent peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100'
                    }`}
                >
                    {checked && (
                        <Icon type="check" className="h-3.5 w-3.5" />
                    )}
                </span>
            </span>
        </label>

        {error && (
            <p className="mt-1.5 text-[11px] font-medium text-red-600">
                {error}
            </p>
        )}
    </div>
);

// =========================================================
// CONFIRMATION MODAL
// =========================================================

const ConfirmDialog = ({
    open,
    title,
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
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !processing
                ) {
                    onCancel();
                }
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
                    <div className="absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                                <Icon type="edit" className="h-5 w-5" />
                            </span>

                            <div>
                                <h2
                                    id="confirm-title"
                                    className="text-base font-bold text-white"
                                >
                                    {title}
                                </h2>

                                <p className="mt-0.5 text-xs text-blue-100">
                                    Konfirmasi perubahan data
                                </p>
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
                    <p className="text-sm leading-relaxed text-slate-600">
                        {message}
                    </p>

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
                        <Icon
                            type="alert"
                            className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        />

                        <p className="text-[11px] leading-relaxed text-blue-800">
                            Pastikan informasi dan konfigurasi check sheet sudah benar sebelum menyimpan perubahan.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className={secondaryButton}
                    >
                        Periksa Kembali
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={primaryButton}
                    >
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

// =========================================================
// PAGE
// =========================================================

export default function Edit({ checkSheet, divisis, mesins = [], line }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        divisi_id: checkSheet.divisi_id ?? '',
        line_id: checkSheet.line_id ?? '',
        nomor_dokumen: checkSheet.nomor_dokumen ?? '',
        nama_checksheet: checkSheet.nama_checksheet ?? '',
        pakai_actual: Boolean(checkSheet.pakai_actual),
        pakai_plan_act: Boolean(checkSheet.pakai_plan_act),
        pakai_monitoring: Boolean(checkSheet.pakai_monitoring),
        pakai_bbm: Boolean(checkSheet.pakai_bbm),
        bbm_kali_60: Boolean(checkSheet.bbm_kali_60),
        pakai_pelumasan: Boolean(checkSheet.pakai_pelumasan),
    });

    // MESIN BERDASARKAN DIVISI
    const mesinTersedia = useMemo(
        () =>
            mesins.filter(
                (mesin) =>
                    Number(mesin.divisi_id) === Number(data.divisi_id)
            ),
        [mesins, data.divisi_id]
    );

    // GANTI DIVISI
    const gantiDivisi = (value) => {
        setData({
            ...data,
            divisi_id: value,
            line_id: '',
        });
    };

    // MONITORING DIMATIKAN -> OPSI BBM IKUT DIMATIKAN
    const gantiMonitoring = (value) => {
        setData({
            ...data,
            pakai_monitoring: value,
            pakai_bbm: value ? data.pakai_bbm : false,
            bbm_kali_60: value ? data.bbm_kali_60 : false,
        });
    };

    // URL KEMBALI
    const backUrl = line
        ? `/check-sheets/line/${line.kode}`
        : '/check-sheets';

    // SUBMIT
    const submit = (event) => {
        event.preventDefault();
        setShowConfirm(true);
    };

    // KONFIRMASI EDIT
    const konfirmasiEdit = () => {
        try {
            sessionStorage.setItem(
                'checksheet_toast',
                'Check Sheet berhasil diperbarui.'
            );
        } catch (error) {
            // Abaikan jika storage tidak tersedia.
        }

        put(`/check-sheets/${checkSheet.id}`, {
            onError: () => {
                try {
                    sessionStorage.removeItem('checksheet_toast');
                } catch (error) {
                    // Abaikan jika storage tidak tersedia.
                }

                setShowConfirm(false);
            },
            onFinish: () => setShowConfirm(false),
        });
    };

    return (
        <>
            <Head title="Edit Check Sheet" />

            <style>{`
                @keyframes pageEnter {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes modalEnter {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes overlayEnter {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .page-enter {
                    animation: pageEnter .45s ease-out both;
                }

                .modal-overlay {
                    animation: overlayEnter .18s ease-out both;
                }

                .modal-content {
                    animation: modalEnter .22s ease-out both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .page-enter,
                    .modal-overlay,
                    .modal-content {
                        animation: none !important;
                    }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[100px]" />
                    <div className="absolute -bottom-48 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-200/30 blur-[100px]" />
                </div>

                {/* HEADER */}
                <header className="relative z-10 border-b border-white/10 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <Link
                            href={backUrl}
                            title="Kembali"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/20 active:scale-95"
                        >
                            <Icon type="back" className="h-5 w-5" />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                Edit Check Sheet
                            </h1>

                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200 sm:text-xs">
                                {line
                                    ? `${line.divisi?.nama_divisi || 'Divisi'} / ${line.nama_line}`
                                    : 'Check Sheet Prediktif / Edit Data'}
                            </p>
                        </div>

                        <div className="ml-auto hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            <span className="text-[10px] font-semibold text-white/70">
                                Mode Edit
                            </span>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="page-enter">
                        {/* PAGE INTRO */}
                        <div className="mb-6">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="h-1.5 w-8 rounded-full bg-blue-600" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                    Manajemen Dokumen
                                </span>
                            </div>

                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                Edit Check Sheet
                            </h2>

                            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                                Perbarui informasi dokumen dan sesuaikan konfigurasi fitur check sheet.
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className={`${cardClass} overflow-hidden`}
                        >
                            {/* SECTION 1 */}
                            <div className="border-b border-slate-100 px-5 py-6 sm:px-8 lg:px-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon type="file" className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Informasi Dokumen
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Perbarui identitas utama check sheet
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                                    <Field
                                        label="Divisi"
                                        error={errors.divisi_id}
                                    >
                                        <div className="relative">
                                            <select
                                                value={data.divisi_id}
                                                onChange={(event) =>
                                                    gantiDivisi(event.target.value)
                                                }
                                                disabled={!!checkSheet.line_id}
                                                className={`${inputBase} appearance-none pr-10`}
                                            >
                                                <option value="">
                                                    Pilih Divisi
                                                </option>

                                                {divisis.map((divisi) => (
                                                    <option
                                                        key={divisi.id}
                                                        value={divisi.id}
                                                    >
                                                        {divisi.nama_divisi}
                                                    </option>
                                                ))}
                                            </select>

                                            <Icon
                                                type="down"
                                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                            />
                                        </div>

                                        {!!checkSheet.line_id && (
                                            <p className="mt-1.5 text-[10px] text-blue-600">
                                                Divisi tidak dapat diubah karena check sheet terhubung dengan mesin.
                                            </p>
                                        )}
                                    </Field>

                                    {mesinTersedia.length > 0 && (
                                        <Field
                                            label="Mesin"
                                            error={errors.line_id}
                                        >
                                            <div className="relative">
                                                <select
                                                    value={data.line_id}
                                                    onChange={(event) =>
                                                        setData('line_id', event.target.value)
                                                    }
                                                    className={`${inputBase} appearance-none pr-10`}
                                                >
                                                    <option value="">
                                                        Pilih Mesin
                                                    </option>

                                                    {mesinTersedia.map((mesin) => (
                                                        <option
                                                            key={mesin.id}
                                                            value={mesin.id}
                                                        >
                                                            {mesin.nama_line}
                                                        </option>
                                                    ))}
                                                </select>

                                                <Icon
                                                    type="down"
                                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                />
                                            </div>
                                        </Field>
                                    )}

                                    <Field
                                        label="Nomor Dokumen"
                                        error={errors.nomor_dokumen}
                                    >
                                        <input
                                            type="text"
                                            value={data.nomor_dokumen}
                                            onChange={(event) =>
                                                setData('nomor_dokumen', event.target.value)
                                            }
                                            placeholder="Contoh: CS-001"
                                            className={inputBase}
                                        />
                                    </Field>

                                    <Field
                                        label="Nama Check Sheet"
                                        error={errors.nama_checksheet}
                                    >
                                        <input
                                            type="text"
                                            value={data.nama_checksheet}
                                            onChange={(event) =>
                                                setData('nama_checksheet', event.target.value)
                                            }
                                            placeholder="Contoh: Check Sheet Preventif Mesin"
                                            className={inputBase}
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* SECTION 2 */}
                            <div className="px-5 py-6 sm:px-8 lg:px-10">
                                <div className="mb-5 flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Icon type="settings" className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Konfigurasi Check Sheet
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Aktifkan atau nonaktifkan fitur sesuai kebutuhan
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    <CheckboxField
                                        icon="file"
                                        label="Actual / Selisih (KWH)"
                                        hint="Untuk pengecekan KWH. Setiap tanggal memiliki kolom Actual, Selisih, dan Catatan. Data centang lama tidak terhapus jika opsi dimatikan."
                                        checked={data.pakai_actual}
                                        onChange={(value) =>
                                            setData('pakai_actual', value)
                                        }
                                        error={errors.pakai_actual}
                                    />

                                    <CheckboxField
                                        icon="clipboard"
                                        label="Plan & Act"
                                        hint="Untuk check sheet Generator / Pompa. Setiap tanggal memiliki dua kotak: P (Plan) dan A (Act). Data lama tetap tersimpan jika opsi dimatikan."
                                        checked={data.pakai_plan_act}
                                        onChange={(value) =>
                                            setData('pakai_plan_act', value)
                                        }
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
                                        onChange={(value) =>
                                            setData('pakai_pelumasan', value)
                                        }
                                        error={errors.pakai_pelumasan}
                                    />
                                </div>

                                {/* OPSI MONITORING */}
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
                                                onChange={(value) =>
                                                    setData({
                                                        ...data,
                                                        pakai_bbm: value,
                                                        bbm_kali_60: value
                                                            ? data.bbm_kali_60
                                                            : false,
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
                                                    onChange={(value) =>
                                                        setData('bbm_kali_60', value)
                                                    }
                                                    error={errors.bbm_kali_60}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* FORM FOOTER */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                                <p className="text-[10px] text-slate-400">
                                    <span className="text-red-500">*</span>
                                    {' '}Wajib diisi
                                </p>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <Link
                                        href={backUrl}
                                        className={secondaryButton}
                                    >
                                        Batal
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={primaryButton}
                                    >
                                        <Icon type="edit" className="h-4 w-4" />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/70">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-[10px] font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                            <span className="mx-1.5 text-slate-300">·</span>
                            Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* MODAL KONFIRMASI EDIT */}
            <ConfirmDialog
                open={showConfirm}
                title="Simpan perubahan?"
                message="Apakah kamu yakin ingin menyimpan perubahan check sheet ini?"
                confirmLabel="Ya, Simpan"
                processing={processing}
                onCancel={() => setShowConfirm(false)}
                onConfirm={konfirmasiEdit}
            />
        </>
    );
}
