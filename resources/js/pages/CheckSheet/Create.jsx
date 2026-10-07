import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ divisis }) {
    const { data, setData, post, processing, errors } = useForm({
        divisi_id: '',
        nomor_dokumen: '',
        nama_checksheet: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post('/check-sheets');
    };

    return (
        <>
            <Head title="Tambah Check Sheet" />

            <div className="min-h-screen bg-slate-50">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">

                    {/* Decorative background */}
                    <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-6">

                        {/* Breadcrumb */}
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-blue-200">

                            <Link
                                href="/check-sheets"
                                className="transition hover:text-white"
                            >
                                Check Sheet Prediktif
                            </Link>

                            <span className="text-blue-400">
                                /
                            </span>

                            <span className="text-white">
                                Tambah Data
                            </span>

                        </div>


                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            {/* TITLE */}
                            <div className="flex items-center gap-4">

                                {/* ICON */}
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg shadow-blue-950/20 backdrop-blur-sm">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-7 w-7"
                                    >
                                        <path d="M7 3.5h7.5L19 8v12.5H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />

                                        <path d="M14 3.5V8h5" />

                                        <path d="M9 12h6" />

                                        <path d="M9 15.5h6" />

                                        <path d="M9 9h2" />
                                    </svg>

                                </div>


                                <div>

                                    <div className="flex flex-wrap items-center gap-2">

                                        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                                            Tambah Check Sheet
                                        </h1>

                                        <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                            Data Baru
                                        </span>

                                    </div>

                                    <p className="mt-1.5 text-sm text-blue-200">
                                        Tambahkan data check sheet baru ke dalam sistem.
                                    </p>

                                </div>

                            </div>


                            {/* BACK BUTTON */}
                            <Link
                                href="/check-sheets"
                                className="group inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 sm:self-auto"
                            >

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                                >
                                    <path d="m15 18-6-6 6-6" />
                                </svg>

                                Kembali

                            </Link>

                        </div>

                    </div>


                    {/* Bottom accent */}
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />

                </header>


                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">


                        {/* =================================================
                            FORM CARD
                        ================================================== */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">

                            {/* CARD HEADER */}
                            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 px-6 py-5 sm:px-8">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5"
                                        >
                                            <path d="M4 6h16" />
                                            <path d="M4 12h16" />
                                            <path d="M4 18h10" />
                                        </svg>

                                    </div>


                                    <div>

                                        <h2 className="text-base font-bold text-slate-900">
                                            Informasi Check Sheet
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Lengkapi informasi dasar check sheet.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* FORM */}
                            <form
                                onSubmit={submit}
                                className="space-y-7 p-6 sm:p-8"
                            >


                                {/* =================================================
                                    IDENTITAS CHECK SHEET
                                ================================================== */}
                                <section>

                                    <div className="mb-4 flex items-center gap-3">

                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />

                                        <div>

                                            <h3 className="text-sm font-bold text-slate-800">
                                                Identitas Check Sheet
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Informasi dasar dokumen check sheet.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="space-y-5">


                                        {/* DIVISI */}
                                        <div>

                                            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">

                                                Divisi

                                                <span className="text-red-500">
                                                    *
                                                </span>

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
                                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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


                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                >
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>

                                            </div>


                                            {errors.divisi_id && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.divisi_id}
                                                </p>
                                            )}

                                        </div>


                                        {/* NOMOR DOKUMEN */}
                                        <div>

                                            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">

                                                Nomor Dokumen

                                                <span className="text-red-500">
                                                    *
                                                </span>

                                            </label>


                                            <div className="relative">

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
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                                />

                                            </div>


                                            {errors.nomor_dokumen && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.nomor_dokumen}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </section>


                                {/* =================================================
                                    DETAIL CHECK SHEET
                                ================================================== */}
                                <section>

                                    <div className="mb-4 flex items-center gap-3">

                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />

                                        <div>

                                            <h3 className="text-sm font-bold text-slate-800">
                                                Detail Check Sheet
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Tentukan nama atau judul check sheet.
                                            </p>

                                        </div>

                                    </div>


                                    {/* NAMA CHECK SHEET */}
                                    <div>

                                        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">

                                            Nama Check Sheet

                                            <span className="text-red-500">
                                                *
                                            </span>

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
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                        />


                                        {errors.nama_checksheet && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {errors.nama_checksheet}
                                            </p>
                                        )}

                                    </div>

                                </section>


                                {/* =================================================
                                    BUTTON
                                ================================================== */}
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                                    <Link
                                        href="/check-sheets"
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                                    >
                                        Batal
                                    </Link>


                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                                                >
                                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                                                    <path d="M17 21v-8H7v8" />
                                                    <path d="M7 3v5h8" />
                                                </svg>

                                                Simpan Data
                                            </>
                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>


                        {/* =================================================
                            SIDE INFO CARD
                        ================================================== */}
                        <aside className="space-y-4">


                            {/* INFO CARD */}
                            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 text-white shadow-xl shadow-blue-200/50">

                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <path d="M12 11v5" />

                                        <path d="M12 8h.01" />
                                    </svg>

                                </div>


                                <h3 className="text-sm font-bold">
                                    Informasi Pengisian
                                </h3>


                                <p className="mt-2 text-xs leading-relaxed text-blue-100">
                                    Lengkapi informasi check sheet dengan data
                                    yang sesuai agar dokumen mudah dikelola.
                                </p>


                                <div className="mt-5 space-y-3">

                                    <div className="flex items-start gap-3">

                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-200" />

                                        <p className="text-xs leading-relaxed text-blue-100">
                                            Pilih divisi yang menggunakan check sheet.
                                        </p>

                                    </div>


                                    <div className="flex items-start gap-3">

                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-200" />

                                        <p className="text-xs leading-relaxed text-blue-100">
                                            Gunakan nomor dokumen yang sesuai dengan dokumen check sheet.
                                        </p>

                                    </div>


                                    <div className="flex items-start gap-3">

                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-200" />

                                        <p className="text-xs leading-relaxed text-blue-100">
                                            Nama check sheet sebaiknya dibuat singkat dan mudah dikenali.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* REQUIRED CARD */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center gap-2">

                                    <span className="h-2 w-2 rounded-full bg-red-500" />

                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Field Wajib
                                    </h3>

                                </div>


                                <p className="mt-2 text-xs leading-relaxed text-slate-400">

                                    Field bertanda

                                    <span className="mx-1 font-bold text-red-500">
                                        *
                                    </span>

                                    wajib diisi sebelum data disimpan.

                                </p>

                            </div>


                        </aside>

                    </div>

                </main>


                {/* =====================================================
                    FOOTER
                ====================================================== */}
                <footer className="border-t border-slate-200 bg-white">

                    <div className="mx-auto max-w-6xl px-5 py-5 text-center sm:px-6">

                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>

                    </div>

                </footer>

            </div>
        </>
    );
}