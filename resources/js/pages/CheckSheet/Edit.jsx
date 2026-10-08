import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// =========================================================
// ICONS  (UI saja, tidak ada logic)
// =========================================================

const ICONS = {
    edit: {
        paths: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z'],
    },
    back: { sw: 2, paths: ['m15 18-6-6 6-6'] },
    list: { paths: ['M4 6h16', 'M4 12h16', 'M4 18h10'] },
    down: { sw: 2, paths: ['m6 9 6 6 6-6'] },
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
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4';

const labelClass =
    'mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600';

export default function Edit({ checkSheet, divisis }) {
    const { data, setData, put, processing, errors } = useForm({
        divisi_id: checkSheet.divisi_id ?? '',
        nomor_dokumen: checkSheet.nomor_dokumen ?? '',
        nama_checksheet: checkSheet.nama_checksheet ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(`/check-sheets/${checkSheet.id}`);
    };

    return (
        <>
            <Head title="Edit Check Sheet" />

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
                                href="/check-sheets"
                                className="transition hover:text-white"
                            >
                                Check Sheet Prediktif
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
                                            Edit Check Sheet
                                        </h1>

                                        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-100 backdrop-blur-sm">
                                            Edit Data
                                        </span>
                                    </div>

                                    <p className="mt-1.5 text-sm text-white/65">
                                        Perbarui informasi check sheet yang sudah tersimpan.
                                    </p>
                                </div>
                            </div>

                            {/* BACK BUTTON */}
                            <Link
                                href="/check-sheets"
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
                                            Informasi Check Sheet
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Perbarui informasi dasar check sheet.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FORM */}
                            <form onSubmit={submit} className="space-y-7 p-6 sm:p-8">

                                {/* IDENTITAS CHECK SHEET */}
                                <section>
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Identitas Check Sheet
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Perbarui informasi dasar dokumen check sheet.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">

                                        {/* DIVISI */}
                                        <div>
                                            <label className={labelClass}>
                                                Divisi
                                                <span className="text-red-500">*</span>
                                            </label>

                                            <div className="relative">
                                                <select
                                                    value={data.divisi_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            'divisi_id',
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`${inputBase} appearance-none pr-10 focus:border-blue-400 focus:ring-blue-100`}
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

                                            {errors.divisi_id && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.divisi_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* NOMOR DOKUMEN */}
                                        <div>
                                            <label className={labelClass}>
                                                Nomor Dokumen
                                                <span className="text-red-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                value={data.nomor_dokumen}
                                                onChange={(e) =>
                                                    setData(
                                                        'nomor_dokumen',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Contoh: CS-001"
                                                className={`${inputBase} focus:border-indigo-400 focus:ring-indigo-100`}
                                            />

                                            {errors.nomor_dokumen && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.nomor_dokumen}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* DETAIL CHECK SHEET */}
                                <section>
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Detail Check Sheet
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Perbarui nama atau judul check sheet.
                                            </p>
                                        </div>
                                    </div>

                                    {/* NAMA CHECK SHEET */}
                                    <div>
                                        <label className={labelClass}>
                                            Nama Check Sheet
                                            <span className="text-red-500">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            value={data.nama_checksheet}
                                            onChange={(e) =>
                                                setData(
                                                    'nama_checksheet',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Contoh: Check Sheet Preventif Mesin"
                                            className={`${inputBase} focus:border-violet-400 focus:ring-violet-100`}
                                        />

                                        {errors.nama_checksheet && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {errors.nama_checksheet}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* BUTTON */}
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                                    <Link
                                        href="/check-sheets"
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

                            {/* INFO CARD */}
                            <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-5 text-white shadow-[0_20px_50px_rgba(2,6,23,0.30)] backdrop-blur-xl">

                                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-300/20 blur-3xl" />
                                <div className="absolute -bottom-12 left-4 h-28 w-28 rounded-full bg-indigo-300/20 blur-3xl" />

                                <div className="relative">
                                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                                        <Icon type="edit" className="h-5 w-5" />
                                    </div>

                                    <h3 className="text-sm font-bold">
                                        Edit Data Check Sheet
                                    </h3>

                                    <p className="mt-2 text-xs leading-relaxed text-blue-100">
                                        Perubahan yang kamu lakukan akan memperbarui
                                        informasi check sheet yang sudah tersimpan.
                                    </p>

                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]" />

                                            <p className="text-xs leading-relaxed text-blue-100">
                                                Pastikan divisi yang dipilih sudah sesuai.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300 shadow-[0_0_6px_rgba(165,180,252,0.8)]" />

                                            <p className="text-xs leading-relaxed text-blue-100">
                                                Periksa kembali nomor dokumen sebelum menyimpan.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300 shadow-[0_0_6px_rgba(196,181,253,0.8)]" />

                                            <p className="text-xs leading-relaxed text-blue-100">
                                                Pastikan nama check sheet sudah sesuai dengan dokumen.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CURRENT DATA CARD */}
                            <div className={`rounded-3xl p-5 ${glassCard}`}>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />

                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Data Saat Ini
                                    </h3>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Nomor Dokumen
                                        </p>

                                        <p className="mt-1 truncate font-mono text-xs font-semibold text-slate-700">
                                            {checkSheet.nomor_dokumen || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Nama Check Sheet
                                        </p>

                                        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
                                            {checkSheet.nama_checksheet || '-'}
                                        </p>
                                    </div>
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
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
