import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

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

            <div className="min-h-screen bg-slate-50">

                {/* HEADER */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-4xl px-6 py-5">
                        <div className="flex items-center justify-between">

                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    Edit Preventif Mesin
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Ubah data preventive maintenance.
                                </p>
                            </div>

                            <Link
                                href="/preventif-mesin"
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                ← Kembali
                            </Link>

                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="mx-auto max-w-4xl px-6 py-6">
                    <div className="rounded-xl bg-white p-6 shadow">

                        <form
                            onSubmit={submit}
                            className="space-y-5"
                        >

                            {/* ALERT */}
                            {alert && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    ⚠️ {alert}
                                </div>
                            )}

                            {/* DIVISI */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Divisi
                                </label>

                                <select
                                    value={data.divisi}
                                    onChange={(e) =>
                                        setData(
                                            'divisi',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                >
                                    <option value="">
                                        Pilih divisi
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

                                {errors.divisi && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.divisi}
                                    </p>
                                )}
                            </div>

                            {/* NO ITEM */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    No
                                </label>

                                <input
                                    type="text"
                                    value={data.no_item}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-600"
                                />

                                {errors.no_item && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.no_item}
                                    </p>
                                )}
                            </div>

                            {/* ITEM PREVENTIF */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Item Preventif
                                </label>

                                <textarea
                                    value={data.item_preventif}
                                    onChange={(e) =>
                                        setData(
                                            'item_preventif',
                                            e.target.value
                                        )
                                    }
                                    rows="3"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                />

                                {errors.item_preventif && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.item_preventif}
                                    </p>
                                )}
                            </div>

                            {/* PERIODE */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                        className="w-1/2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                        placeholder="Nilai"
                                    />

                                    <select
                                        value={data.periode_satuan}
                                        onChange={(e) =>
                                            setData(
                                                'periode_satuan',
                                                e.target.value
                                            )
                                        }
                                        className="w-1/2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                    >
                                        <option value="">
                                            Pilih satuan
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

                                </div>

                                {errors.periode_nilai && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.periode_nilai}
                                    </p>
                                )}

                                {errors.periode_satuan && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.periode_satuan}
                                    </p>
                                )}
                            </div>

                            {/* TANGGAL PLAN AWAL */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />

                                {errors.tanggal_plan_awal && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.tanggal_plan_awal}
                                    </p>
                                )}
                            </div>

                            {/* JUMLAH DILAKUKAN */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                    placeholder="Contoh: 2"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Jumlah hari berturut-turut dalam satu periode.
                                </p>

                                {errors.jumlah_dilakukan && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.jumlah_dilakukan}
                                    </p>
                                )}
                            </div>

                            {/* DURASI */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Durasi
                                </label>

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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                    placeholder="Masukkan durasi"
                                />

                                {errors.durasi && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.durasi}
                                    </p>
                                )}
                            </div>

                            {/* TOTAL DURASI */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Total Durasi
                                </label>

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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                />

                                {errors.total_durasi && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.total_durasi}
                                    </p>
                                )}
                            </div>

                            {/* DOT */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                />

                                {errors.dot && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.dot}
                                    </p>
                                )}
                            </div>

                            {/* HOT */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                />

                                {errors.hot && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.hot}
                                    </p>
                                )}
                            </div>

                            {/* STATUS
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Status
                                </label>

                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                >
                                    <option value="">
                                        Pilih status
                                    </option>
                                    <option value="Plan">
                                        Plan
                                    </option>
                                    <option value="ACT">
                                        ACT
                                    </option>
                                </select>

                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.status}
                                    </p>
                                )}
                            </div> */}

                            {/* TOMBOL */}
                            <div className="flex justify-end gap-3 pt-4">

                                <Link
                                    href="/preventif-mesin"
                                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Batal
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}
