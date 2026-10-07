import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ nextNo }) {
    const [alert, setAlert] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        divisi: '',
        no_item: '',
        item_preventif: '',
        periode_nilai: '',
        periode_satuan: '',
        tanggal_plan_awal: '',
        jumlah_dilakukan: 1,
        durasi: '',
        total_durasi: '',
        dot: '',
        hot: '',
    });

    // =========================
    // SUBMIT
    // =========================
    const submit = (e) => {
        e.preventDefault();

        // Validasi manual
        if (!data.divisi) {
            setAlert('Divisi wajib diisi.');
            return;
        }

        if (!data.item_preventif.trim()) {
            setAlert('Item Preventif wajib diisi.');
            return;
        }

        // if (!data.periode_nilai) {
        //     setAlert('Periode wajib diisi.');
        //     return;
        // }

        // if (!data.periode_satuan) {
        //     setAlert('Satuan periode wajib dipilih.');
        //     return;
        // }

        // if (!data.tanggal_plan_awal) {
        //     setAlert('Tanggal Plan Awal wajib diisi.');
        //     return;
        // }

        if (
            data.jumlah_dilakukan === '' ||
            data.jumlah_dilakukan === null ||
            Number(data.jumlah_dilakukan) < 1
        ) {
            setAlert('Jumlah Dilakukan minimal 1.');
            return;
        }

        setAlert('');

        // Pastikan jumlah_dilakukan dikirim sebagai angka
        post('/preventif-mesin', {
            preserveScroll: true,
        });
    };

    // =========================
    // DIVISI
    // =========================
    const handleDivisiChange = (e) => {
        const divisi = e.target.value;

        setData({
            ...data,
            divisi,
            no_item: divisi ? nextNo[divisi] : '',
        });
    };

    return (
        <>
            <Head title="Tambah Preventif Mesin" />

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
                                href="/preventif-mesin"
                                className="transition hover:text-white"
                            >
                                Preventif Mesin
                            </Link>

                            <span className="text-blue-400">/</span>

                            <span className="text-white">
                                Tambah Data
                            </span>
                        </div>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            {/* Title */}
                            <div className="flex items-center gap-4">

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
                                        <path d="M12 5v14" />
                                        <path d="M5 12h14" />
                                        <rect
                                            x="3"
                                            y="3"
                                            width="18"
                                            height="18"
                                            rx="4"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                                            Tambah Preventif Mesin
                                        </h1>

                                        <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                            Data Baru
                                        </span>
                                    </div>

                                    <p className="mt-1.5 text-sm text-blue-200">
                                        Tambahkan data jadwal preventive maintenance mesin.
                                    </p>
                                </div>
                            </div>

                            {/* Back button */}
                            <Link
                                href="/preventif-mesin"
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

                            {/* Card Header */}
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
                                            Informasi Preventif
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Lengkapi informasi jadwal dan pekerjaan preventif.
                                        </p>
                                    </div>

                                </div>
                            </div>


                            <form
                                onSubmit={submit}
                                className="space-y-7 p-6 sm:p-8"
                            >

                                {/* =================================================
                                    ALERT
                                ================================================== */}
                                {alert && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">

                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="M12 9v4" />
                                                <path d="M12 17h.01" />
                                                <path d="M10.3 3.5 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z" />
                                            </svg>
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


                                {/* =================================================
                                    IDENTITAS
                                ================================================== */}
                                <section>

                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Identitas Mesin
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Informasi dasar data preventif.
                                            </p>
                                        </div>
                                    </div>


                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* DIVISI */}
                                        <div>
                                            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                                                Divisi
                                                <span className="text-red-500">*</span>
                                            </label>

                                            <div className="relative">
                                                <select
                                                    value={data.divisi}
                                                    onChange={handleDivisiChange}
                                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                >
                                                    <option value="">
                                                        Pilih Divisi
                                                    </option>

                                                    <option value="Sewing">
                                                        Sewing
                                                    </option>

                                                    <option value="Headrest">
                                                        Headrest
                                                    </option>

                                                    <option value="Utility">
                                                        Utility
                                                    </option>

                                                    <option value="Saidan">
                                                        Saidan
                                                    </option>
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

                                            {errors.divisi && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.divisi}
                                                </p>
                                            )}
                                        </div>


                                        {/* NO ITEM */}
                                        <div>
                                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                                                No Item

                                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold normal-case tracking-normal text-blue-600">
                                                    Otomatis
                                                </span>
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={data.no_item}
                                                    readOnly
                                                    placeholder="Otomatis"
                                                    className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold text-blue-700 outline-none"
                                                />

                                                <div className="pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                    #
                                                </div>
                                            </div>

                                            {errors.no_item && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.no_item}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </section>


                                {/* =================================================
                                    ITEM
                                ================================================== */}
                                <section>

                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Detail Pekerjaan
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Jelaskan pekerjaan preventif yang dilakukan.
                                            </p>
                                        </div>
                                    </div>


                                    {/* ITEM PREVENTIF */}
                                    <div>
                                        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                                            Item Preventif
                                            <span className="text-red-500">*</span>
                                        </label>

                                        <textarea
                                            value={data.item_preventif}
                                            onChange={(e) =>
                                                setData(
                                                    'item_preventif',
                                                    e.target.value
                                                )
                                            }
                                            rows="4"
                                            placeholder="Contoh: Pemeriksaan kondisi belt, pelumasan bearing, pengecekan baut, dan sebagainya."
                                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        />

                                        {errors.item_preventif && (
                                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                                {errors.item_preventif}
                                            </p>
                                        )}
                                    </div>

                                </section>


                                {/* =================================================
                                    JADWAL
                                ================================================== */}
                                <section>

                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Jadwal Preventif
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Atur periode dan waktu pelaksanaan.
                                            </p>
                                        </div>
                                    </div>


                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* PERIODE */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                Periode
                                            </label>

                                            <div className="flex gap-2">

                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={data.periode_nilai}
                                                    onChange={(e) =>
                                                        setData(
                                                            'periode_nilai',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Nilai"
                                                    className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                />

                                                <div className="relative w-1/2">
                                                    <select
                                                        value={data.periode_satuan}
                                                        onChange={(e) =>
                                                            setData(
                                                                'periode_satuan',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-9 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                                    >
                                                        <option value="">
                                                            Satuan
                                                        </option>

                                                        <option value="hari">
                                                            Hari
                                                        </option>

                                                        <option value="minggu">
                                                            Minggu
                                                        </option>

                                                        <option value="bulan">
                                                            Bulan
                                                        </option>

                                                        <option value="tahun">
                                                            Tahun
                                                        </option>
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

                                            </div>

                                            {errors.periode_nilai && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.periode_nilai}
                                                </p>
                                            )}

                                            {errors.periode_satuan && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.periode_satuan}
                                                </p>
                                            )}
                                        </div>


                                        {/* TANGGAL PLAN */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                Tanggal Plan Awal
                                            </label>

                                            <input
                                                type="date"
                                                value={data.tanggal_plan_awal}
                                                onChange={(e) =>
                                                    setData(
                                                        'tanggal_plan_awal',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                            />

                                            {errors.tanggal_plan_awal && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.tanggal_plan_awal}
                                                </p>
                                            )}
                                        </div>


                                        {/* JUMLAH DILAKUKAN */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                Jumlah Dilakukan
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={data.jumlah_dilakukan}
                                                onChange={(e) =>
                                                    setData(
                                                        'jumlah_dilakukan',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Contoh: 2"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                            />

                                            <p className="mt-1.5 text-xs text-slate-400">
                                                Jumlah hari berturut-turut dalam satu periode.
                                            </p>

                                            {errors.jumlah_dilakukan && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.jumlah_dilakukan}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </section>


                                {/* =================================================
                                    DURASI & METRIK
                                ================================================== */}
                                <section>

                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Durasi & Metrik
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Masukkan durasi pekerjaan dan nilai pengukuran.
                                            </p>
                                        </div>
                                    </div>


                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* DURASI */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                Durasi (Jam)
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.durasi}
                                                    onChange={(e) =>
                                                        setData(
                                                            'durasi',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Contoh: 0.5"
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                                />

                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                    JAM
                                                </span>
                                            </div>

                                            {errors.durasi && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.durasi}
                                                </p>
                                            )}
                                        </div>


                                        {/* TOTAL DURASI */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                Total Durasi (Jam)
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.total_durasi}
                                                    onChange={(e) =>
                                                        setData(
                                                            'total_durasi',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Masukkan total durasi"
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                                />

                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                    JAM
                                                </span>
                                            </div>

                                            {errors.total_durasi && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.total_durasi}
                                                </p>
                                            )}
                                        </div>


                                        {/* DOT */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                DOT
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.dot}
                                                onChange={(e) =>
                                                    setData(
                                                        'dot',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Masukkan DOT"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                            />

                                            {errors.dot && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.dot}
                                                </p>
                                            )}
                                        </div>


                                        {/* HOT */}
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                                                HOT
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.hot}
                                                onChange={(e) =>
                                                    setData(
                                                        'hot',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Masukkan HOT"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                            />

                                            {errors.hot && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500">
                                                    {errors.hot}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </section>


                                {/* =================================================
                                    BUTTON
                                ================================================== */}
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                                    <Link
                                        href="/preventif-mesin"
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

                            {/* Info */}
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
                                    Isi data preventif mesin sesuai dengan jadwal dan
                                    parameter pekerjaan yang telah ditentukan.
                                </p>

                                <div className="mt-5 space-y-3">

                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-200" />
                                        <p className="text-xs leading-relaxed text-blue-100">
                                            Divisi akan menentukan nomor item secara otomatis.
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-200" />
                                        <p className="text-xs leading-relaxed text-blue-100">
                                            Jumlah dilakukan digunakan untuk menentukan jumlah hari pelaksanaan.
                                        </p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-200" />
                                        <p className="text-xs leading-relaxed text-blue-100">
                                            Nilai DOT dan HOT digunakan sebagai metrik preventif.
                                        </p>
                                    </div>

                                </div>
                            </div>


                            {/* Required info */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />

                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Field Wajib
                                    </h3>
                                </div>

                                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                                    Field bertanda
                                    <span className="mx-1 font-bold text-red-500">*</span>
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
                            © {new Date().getFullYear()} Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>

            </div>
        </>
    );
}