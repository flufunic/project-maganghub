import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// =========================================================
// ICONS  (UI saja, tidak ada logic)
// =========================================================

const ICONS = {
    edit: {
        paths: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z'],
    },
    back: { sw: 2, paths: ['m15 18-6-6 6-6'] },
    list: { paths: ['M4 6h16', 'M4 12h16', 'M4 18h10'] },
    down: { sw: 2, paths: ['m6 9 6 6 6-6'] },
    alert: {
        sw: 2,
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 3.5 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z',
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

const inputBase =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4';

const focusBlue = 'focus:border-blue-400 focus:ring-blue-100';
const focusGreen = 'focus:border-emerald-400 focus:ring-emerald-100';

// =========================================================
// SMALL COMPONENTS
// =========================================================

const Field = ({ label, required = false, badge, error, hint, children }) => (
    <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
            {label}

            {required && <span className="text-red-500">*</span>}

            {badge && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-blue-600">
                    {badge}
                </span>
            )}
        </label>

        {children}

        {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}

        {[error].flat().filter(Boolean).map((message, index) => (
            <p key={index} className="mt-1.5 text-xs font-medium text-red-500">
                {message}
            </p>
        ))}
    </div>
);

const SelectWrap = ({ children }) => (
    <div className="relative">
        {children}

        <Icon
            type="down"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
    </div>
);

const SectionTitle = ({ title, desc, bar }) => (
    <div className="mb-4 flex items-center gap-3">
        <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${bar}`} />

        <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400">{desc}</p>
        </div>
    </div>
);

const UnitInput = ({ unit, ...props }) => (
    <div className="relative">
        <input
            type="number"
            step="0.01"
            min="0"
            {...props}
            className={`${inputBase} ${focusGreen} pr-14`}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {unit}
        </span>
    </div>
);

export default function Edit({ preventifMesin }) {
    const [alert, setAlert] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        divisi: preventifMesin.divisi ?? '',

        no_item:
            preventifMesin.no_item !== null &&
            preventifMesin.no_item !== undefined
                ? Number(preventifMesin.no_item)
                : '',

        item_preventif: preventifMesin.item_preventif ?? '',

        periode_nilai:
            preventifMesin.periode_nilai !== null &&
            preventifMesin.periode_nilai !== undefined
                ? Number(preventifMesin.periode_nilai)
                : '',

        periode_satuan: preventifMesin.periode_satuan ?? '',

        tanggal_plan_awal: preventifMesin.tanggal_plan_awal
            ? String(preventifMesin.tanggal_plan_awal).substring(0, 10)
            : '',

        // Jika data lama kosong, gunakan 1
        jumlah_dilakukan:
            preventifMesin.jumlah_dilakukan !== null &&
            preventifMesin.jumlah_dilakukan !== undefined &&
            preventifMesin.jumlah_dilakukan !== ''
                ? Number(preventifMesin.jumlah_dilakukan)
                : 1,

        durasi:
            preventifMesin.durasi !== null &&
            preventifMesin.durasi !== undefined
                ? Number(preventifMesin.durasi)
                : '',

        total_durasi:
            preventifMesin.total_durasi !== null &&
            preventifMesin.total_durasi !== undefined
                ? Number(preventifMesin.total_durasi)
                : '',

        dot:
            preventifMesin.dot !== null &&
            preventifMesin.dot !== undefined
                ? Number(preventifMesin.dot)
                : '',

        hot:
            preventifMesin.hot !== null &&
            preventifMesin.hot !== undefined
                ? Number(preventifMesin.hot)
                : '',

        // status: preventifMesin.status ?? 'Plan',
    });

    // =========================
    // SUBMIT
    // =========================
    const submit = (e) => {
        e.preventDefault();

        if (!data.divisi) {
            setAlert('Divisi wajib diisi.');
            return;
        }

        if (!data.item_preventif.trim()) {
            setAlert('Item Preventif wajib diisi.');
            return;
        }

        if (
            data.jumlah_dilakukan === '' ||
            data.jumlah_dilakukan === null ||
            data.jumlah_dilakukan === undefined ||
            Number(data.jumlah_dilakukan) < 1
        ) {
            setAlert('Jumlah Dilakukan minimal 1.');
            return;
        }

        setAlert('');

        put(`/preventif-mesin/${preventifMesin.no}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Edit Preventif Mesin" />

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

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }

                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient,
                    .idx-float,
                    .idx-float-reverse,
                    .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">

                {/* =====================================================
                    BACKGROUND
                ====================================================== */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* =====================================================
                    HEADER (TRANSPARAN)
                ====================================================== */}
                <header className="border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">

                    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-6">

                        {/* Breadcrumb */}
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-blue-200/80">
                            <Link
                                href="/preventif-mesin"
                                className="transition hover:text-white"
                            >
                                Preventif Mesin
                            </Link>

                            <span className="text-blue-300/60">/</span>

                            <span className="text-white">Edit Data</span>
                        </div>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            {/* TITLE */}
                            <div className="flex items-center gap-4">

                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 rounded-2xl bg-blue-400/40 blur-xl" />

                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-lg">
                                        <Icon type="edit" className="h-7 w-7" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                            Edit Preventif Mesin
                                        </h1>

                                        <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur-sm">
                                            Edit Data
                                        </span>
                                    </div>

                                    <p className="mt-1.5 text-sm text-white/65">
                                        Perbarui informasi jadwal preventive maintenance.
                                    </p>
                                </div>
                            </div>

                            {/* BACK */}
                            <Link
                                href="/preventif-mesin"
                                className="group inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 sm:self-auto"
                            >
                                <Icon
                                    type="back"
                                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
                                Kembali
                            </Link>
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-6 lg:py-10">

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

                        {/* =================================================
                            FORM CARD
                        ================================================== */}
                        <div className={`idx-rise overflow-hidden rounded-3xl ${glassCard}`}>

                            {/* CARD HEADER */}
                            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 px-6 py-5 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-300/50">
                                        <Icon type="list" className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Informasi Preventif
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Perbarui informasi data preventive maintenance.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-7 p-6 sm:p-8">

                                {/* ALERT */}
                                {alert && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3.5 text-sm text-red-700 shadow-sm"
                                    >
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <Icon type="alert" />
                                        </div>

                                        <div>
                                            <p className="font-bold">
                                                Periksa kembali data
                                            </p>

                                            <p className="mt-0.5 text-xs text-red-600">
                                                {alert}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* IDENTITAS */}
                                <section>
                                    <SectionTitle
                                        title="Identitas Mesin"
                                        desc="Informasi dasar data preventif."
                                        bar="from-blue-500 to-indigo-500"
                                    />

                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* DIVISI */}
                                        <Field label="Divisi" required error={errors.divisi}>
                                            <SelectWrap>
                                                <select
                                                    value={data.divisi}
                                                    onChange={(e) =>
                                                        setData('divisi', e.target.value)
                                                    }
                                                    className={`${inputBase} ${focusBlue} appearance-none pr-10 font-medium`}
                                                >
                                                    <option value="">Pilih divisi</option>
                                                    <option value="Sewing">Sewing</option>
                                                    <option value="Headrest">Headrest</option>
                                                    <option value="Utility">Utility</option>
                                                    <option value="Saidan">Saidan</option>
                                                </select>
                                            </SelectWrap>
                                        </Field>

                                        {/* NO ITEM */}
                                        <Field label="No" badge="Otomatis" error={errors.no_item}>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={data.no_item}
                                                    readOnly
                                                    className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold text-blue-700 outline-none"
                                                />

                                                <div className="pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                    #
                                                </div>
                                            </div>
                                        </Field>
                                    </div>
                                </section>

                                {/* DETAIL PEKERJAAN */}
                                <section>
                                    <SectionTitle
                                        title="Detail Pekerjaan"
                                        desc="Perbarui pekerjaan preventif yang dilakukan."
                                        bar="from-indigo-500 to-violet-500"
                                    />

                                    <Field
                                        label="Item Preventif"
                                        required
                                        error={errors.item_preventif}
                                    >
                                        <textarea
                                            value={data.item_preventif}
                                            onChange={(e) =>
                                                setData('item_preventif', e.target.value)
                                            }
                                            rows="4"
                                            className={`${inputBase} ${focusBlue} resize-none leading-relaxed`}
                                        />
                                    </Field>
                                </section>

                                {/* JADWAL */}
                                <section>
                                    <SectionTitle
                                        title="Jadwal Preventif"
                                        desc="Atur periode dan waktu pelaksanaan."
                                        bar="from-blue-500 to-cyan-500"
                                    />

                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* PERIODE */}
                                        <Field
                                            label="Periode"
                                            error={[errors.periode_nilai, errors.periode_satuan]}
                                        >
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={data.periode_nilai}
                                                    onChange={(e) =>
                                                        setData('periode_nilai', e.target.value)
                                                    }
                                                    className={`${inputBase} ${focusBlue} w-1/2`}
                                                    placeholder="Nilai"
                                                />

                                                <div className="relative w-1/2">
                                                    <select
                                                        value={data.periode_satuan}
                                                        onChange={(e) =>
                                                            setData('periode_satuan', e.target.value)
                                                        }
                                                        className={`${inputBase} ${focusBlue} appearance-none pr-9`}
                                                    >
                                                        <option value="">Satuan</option>
                                                        <option value="hari">Hari</option>
                                                        <option value="minggu">Minggu</option>
                                                        <option value="bulan">Bulan</option>
                                                        <option value="tahun">Tahun</option>
                                                    </select>

                                                    <Icon
                                                        type="down"
                                                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </Field>

                                        {/* TANGGAL PLAN AWAL */}
                                        <Field
                                            label="Tanggal Plan Awal"
                                            error={errors.tanggal_plan_awal}
                                        >
                                            <input
                                                type="date"
                                                value={data.tanggal_plan_awal}
                                                onChange={(e) =>
                                                    setData('tanggal_plan_awal', e.target.value)
                                                }
                                                className={`${inputBase} ${focusBlue}`}
                                            />
                                        </Field>

                                        {/* JUMLAH DILAKUKAN */}
                                        <Field
                                            label="Jumlah Dilakukan"
                                            error={errors.jumlah_dilakukan}
                                            hint="Jumlah hari berturut-turut dalam satu periode."
                                        >
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={data.jumlah_dilakukan}
                                                onChange={(e) =>
                                                    setData('jumlah_dilakukan', e.target.value)
                                                }
                                                className={`${inputBase} ${focusBlue}`}
                                                placeholder="Contoh: 2"
                                            />
                                        </Field>
                                    </div>
                                </section>

                                {/* DURASI & METRIK */}
                                <section>
                                    <SectionTitle
                                        title="Durasi & Metrik"
                                        desc="Perbarui durasi pekerjaan dan nilai pengukuran."
                                        bar="from-emerald-500 to-teal-500"
                                    />

                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* DURASI */}
                                        <Field label="Durasi" error={errors.durasi}>
                                            <UnitInput
                                                unit="JAM"
                                                value={data.durasi}
                                                onChange={(e) => setData('durasi', e.target.value)}
                                                placeholder="Masukkan durasi"
                                            />
                                        </Field>

                                        {/* TOTAL DURASI */}
                                        <Field label="Total Durasi" error={errors.total_durasi}>
                                            <UnitInput
                                                unit="JAM"
                                                value={data.total_durasi}
                                                onChange={(e) =>
                                                    setData('total_durasi', e.target.value)
                                                }
                                                placeholder="Masukkan total durasi"
                                            />
                                        </Field>

                                        {/* DOT */}
                                        <Field label="DOT" error={errors.dot}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.dot}
                                                onChange={(e) => setData('dot', e.target.value)}
                                                placeholder="Masukkan DOT"
                                                className={`${inputBase} ${focusGreen}`}
                                            />
                                        </Field>

                                        {/* HOT */}
                                        <Field label="HOT" error={errors.hot}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.hot}
                                                onChange={(e) => setData('hot', e.target.value)}
                                                placeholder="Masukkan HOT"
                                                className={`${inputBase} ${focusGreen}`}
                                            />
                                        </Field>
                                    </div>
                                </section>

                                {/* BUTTON */}
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                                    <Link
                                        href="/preventif-mesin"
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                                    >
                                        Batal
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-7 text-sm font-semibold text-white shadow-md shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        {processing ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />

                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    />
                                                </svg>

                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Icon
                                                    type="edit"
                                                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                                                />

                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* =================================================
                            SIDE INFO
                        ================================================== */}
                        <aside
                            style={{ animationDelay: '150ms' }}
                            className="idx-rise space-y-4"
                        >

                            {/* EDIT INFO */}
                            <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-5 text-white shadow-[0_20px_50px_rgba(2,6,23,0.30)] backdrop-blur-xl">

                                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-300/20 blur-3xl" />
                                <div className="absolute -bottom-12 left-4 h-28 w-28 rounded-full bg-indigo-300/20 blur-3xl" />

                                <div className="relative">
                                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                                        <Icon type="edit" className="h-5 w-5" />
                                    </div>

                                    <h3 className="text-sm font-bold">Mode Edit</h3>

                                    <p className="mt-2 text-xs leading-relaxed text-blue-100">
                                        Perubahan yang dilakukan akan memperbarui
                                        data preventif mesin yang sudah tersimpan.
                                    </p>

                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]" />
                                            <p className="text-xs leading-relaxed text-blue-100">
                                                Nomor item merupakan identitas data dan tidak dapat diedit.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300 shadow-[0_0_6px_rgba(165,180,252,0.8)]" />
                                            <p className="text-xs leading-relaxed text-blue-100">
                                                Periksa kembali jadwal dan jumlah dilakukan sebelum menyimpan.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300 shadow-[0_0_6px_rgba(196,181,253,0.8)]" />
                                            <p className="text-xs leading-relaxed text-blue-100">
                                                Data akan disimpan setelah tombol Simpan Perubahan ditekan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CURRENT ITEM */}
                            <div className={`rounded-3xl p-5 ${glassCard}`}>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />

                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Data yang Diedit
                                    </h3>
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        No Item
                                    </p>

                                    <p className="mt-1 text-lg font-extrabold text-blue-600">
                                        {data.no_item || '-'}
                                    </p>

                                    <div className="mt-3 h-px bg-slate-200" />

                                    <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Divisi
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                        {data.divisi || '-'}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                {/* =====================================================
                    FOOTER (TRANSPARAN)
                ====================================================== */}
                <footer className="mt-4 border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-6xl items-center justify-center px-5 py-4 text-center sm:px-6">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif Mesin
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
