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

                {/* HEADER */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-4xl px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    Tambah Check Sheet
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Tambahkan check sheet baru.
                                </p>
                            </div>

                            <Link
                                href="/check-sheets"
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

                            {/* DIVISI */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Divisi
                                </label>

                                <select
                                    value={data.divisi_id}
                                    onChange={(e) =>
                                        setData(
                                            'divisi_id',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
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

                                {errors.divisi_id && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.divisi_id}
                                    </p>
                                )}
                            </div>

                            {/* NOMOR DOKUMEN */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Nomor Dokumen
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                />

                                {errors.nomor_dokumen && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.nomor_dokumen}
                                    </p>
                                )}
                            </div>

                            {/* NAMA CHECK SHEET */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Nama Check Sheet
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                />

                                {errors.nama_checksheet && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.nama_checksheet}
                                    </p>
                                )}
                            </div>

                            {/* BUTTON */}
                            <div className="flex justify-end gap-3 pt-4">

                                <Link
                                    href="/check-sheets"
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
                                        : 'Simpan'}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}