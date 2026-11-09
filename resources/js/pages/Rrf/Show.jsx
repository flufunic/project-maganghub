import React, { useState } from 'react';

import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

import { Pencil, Trash2 } from 'lucide-react';

import ProduksiLayout, { StatusBadge } from '../../Components/ProduksiLayout';

import RrfDetail from '../../Components/RrfDetail';

import KonfirmasiDialog from '../../Components/KonfirmasiDialog';



const btnEdit =
    'inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-700';



/* PANEL KEPUTUSAN SPV */

function PanelApproval({ rrf }) {

    const { data, setData, post, processing, errors } = useForm({
        catatan: '',
    });



    const [konfirmasi, setKonfirmasi] = useState(null); // 'approve' | 'reject' | null



    const bisaTolak = data.catatan.trim().length >= 5;



    // Konfirmasi sudah ditangani panel di bawah, jadi tidak perlu window.confirm lagi

    const kirim = (aksi) => {

        post(`/rrf/${rrf.id}/${aksi}`, {

            preserveScroll: true,

            onFinish: () => setKonfirmasi(null),

        });

    };



    return (

        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/95 shadow-lg shadow-amber-950/5">

            <div className="flex items-start gap-3 border-b border-amber-200 px-5 py-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-bold text-amber-700">

                    !

                </div>



                <div>

                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-amber-900">

                        Menunggu keputusan Anda

                    </h2>



                    <p className="mt-1 text-xs leading-relaxed text-amber-800">

                        Periksa data permintaan sebelum memberikan keputusan.

                        Jika disetujui, RRF diteruskan ke Maintenance. Jika

                        ditolak, RRF dikembalikan kepada pembuatnya untuk

                        diperbaiki.

                    </p>

                </div>

            </div>



            <div className="p-5">

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                    Catatan{' '}

                    <span className="font-normal text-slate-500">

                        (wajib diisi kalau menolak)

                    </span>

                </label>



                <textarea

                    rows={3}

                    value={data.catatan}

                    onChange={(e) => setData('catatan', e.target.value)}

                    placeholder="Contoh: Foto kurang jelas, mohon tambahkan foto bagian yang rusak."

                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

                />



                {errors.catatan && (

                    <p className="mt-1 text-xs font-medium text-red-600">

                        {errors.catatan}

                    </p>

                )}



                {errors.status && (

                    <p className="mt-1 text-xs font-medium text-red-600">

                        {errors.status}

                    </p>

                )}



                {konfirmasi === null ? (

                    <div className="mt-4 flex flex-wrap gap-3">

                        <button

                            type="button"

                            onClick={() => setKonfirmasi('approve')}

                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"

                        >

                            ✓ Setujui

                        </button>



                        <button

                            type="button"

                            onClick={() => setKonfirmasi('reject')}

                            disabled={!bisaTolak}

                            title={

                                bisaTolak

                                    ? ''

                                    : 'Isi alasan penolakan minimal 5 karakter.'

                            }

                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"

                        >

                            ✕ Tolak

                        </button>

                    </div>

                ) : (

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                        <p className="text-sm font-bold text-slate-800">

                            {konfirmasi === 'approve'

                                ? 'Yakin menyetujui RRF ini?'

                                : 'Yakin menolak RRF ini?'}

                        </p>



                        <p className="mt-1 text-xs text-slate-500">

                            {konfirmasi === 'approve'

                                ? 'RRF akan diteruskan ke Maintenance.'

                                : 'RRF akan dikembalikan kepada pembuatnya.'}

                        </p>



                        <div className="mt-4 flex flex-wrap gap-3">

                            <button

                                type="button"

                                disabled={processing}

                                onClick={() => kirim(konfirmasi)}

                                className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${

                                    konfirmasi === 'approve'

                                        ? 'bg-emerald-600 hover:bg-emerald-700'

                                        : 'bg-red-600 hover:bg-red-700'

                                }`}

                            >

                                {processing ? 'Memproses...' : 'Ya, lanjutkan'}

                            </button>



                            <button

                                type="button"

                                disabled={processing}

                                onClick={() => setKonfirmasi(null)}

                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"

                            >

                                Batal

                            </button>

                        </div>

                    </div>

                )}

            </div>

        </section>

    );

}



export default function Show({ rrf }) {

    const { rrfForm } = usePage().props;



    const [hapusOpen, setHapusOpen] = useState(false);

    const [menghapus, setMenghapus] = useState(false);

    const [errorHapus, setErrorHapus] = useState('');



    const bukaHapus = () => {

        setErrorHapus('');

        setHapusOpen(true);

    };



    const tutupHapus = () => {

        if (!menghapus) {

            setHapusOpen(false);

            setErrorHapus('');

        }

    };



    const konfirmasiHapus = () => {

        router.delete(`/rrf/${rrf.id}`, {

            onStart: () => setMenghapus(true),

            onFinish: () => setMenghapus(false),

            // Kalau berhasil, server mengarahkan ke daftar RRF

            onError: (errs) =>

                setErrorHapus(Object.values(errs)[0] ?? 'RRF gagal dihapus.'),

        });

    };



    return (

        <ProduksiLayout>

            <Head title={rrf.rrf_no} />



            {/* HEADER HALAMAN */}

            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">

                <div>

                    <Link

                        href="/rrf"

                        className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-lg transition hover:bg-white/20"

                    >

                        <span>←</span>

                        Kembali ke daftar

                    </Link>



                    <div className="flex items-center gap-2">

                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600" />



                        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">

                            {rrf.rrf_no}

                        </h1>

                    </div>



                    <p className="mt-1 pl-3 text-xs text-blue-100/70">

                        Detail Repair Request Form · Rev {rrfForm.form_rev}

                    </p>

                </div>

                {/* STATUS + HAPUS */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <StatusBadge status={rrf.status} label={rrf.status_label} />

                    <button
                        type="button"
                        onClick={bukaHapus}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-white/95 px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        Hapus RRF
                    </button>
                </div>

            </div>


            <div className="space-y-5">

                {/* RRF MASIH MENUNGGU SPV */}

                {rrf.status === 'diajukan' && rrf.bisa_edit && (

                    <section className="rounded-2xl border border-blue-200 bg-blue-50/95 p-5 shadow-lg shadow-blue-950/5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">

                                <Pencil className="h-5 w-5" strokeWidth={1.75} />

                            </div>



                            <div className="min-w-0 flex-1">

                                <h2 className="text-sm font-extrabold uppercase tracking-wide text-blue-900">

                                    Masih bisa diubah

                                </h2>



                                <p className="mt-1 text-sm leading-relaxed text-blue-900">

                                    RRF ini masih menunggu keputusan SPV, jadi

                                    datanya masih bisa diubah. Setelah SPV

                                    menyetujui, RRF tidak bisa diubah lagi.

                                </p>



                                <div className="mt-4 flex flex-wrap gap-3">

                                    <Link

                                        href={`/rrf/${rrf.id}/edit`}

                                        className={btnEdit}

                                    >

                                        <Pencil

                                            className="h-4 w-4"

                                            strokeWidth={1.75}

                                        />

                                        Ubah RRF

                                    </Link>

                                </div>

                            </div>

                        </div>

                    </section>

                )}



                {/* RRF DITOLAK */}

                {rrf.status === 'ditolak' && (

                    <section className="rounded-2xl border border-red-200 bg-red-50/95 p-5 shadow-lg shadow-red-950/5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg font-bold text-red-700">

                                !

                            </div>



                            <div className="min-w-0 flex-1">

                                <h2 className="text-sm font-extrabold uppercase tracking-wide text-red-800">

                                    RRF ini ditolak

                                </h2>



                                {rrf.penolakan ? (

                                    <div className="mt-2 text-sm text-red-900">

                                        <p className="whitespace-pre-line font-medium leading-relaxed">

                                            {rrf.penolakan.catatan}

                                        </p>



                                        <p className="mt-2 text-xs text-red-700">

                                            Oleh {rrf.penolakan.oleh ?? '-'} ·{' '}

                                            {rrf.penolakan.waktu}

                                        </p>

                                    </div>

                                ) : (

                                    <p className="mt-2 text-sm text-red-900">

                                        Tidak ada catatan penolakan.

                                    </p>

                                )}



                                {rrf.bisa_edit && (

                                    <div className="mt-4 flex flex-wrap gap-3">

                                        <Link

                                            href={`/rrf/${rrf.id}/edit`}

                                            className={btnEdit}

                                        >

                                            <Pencil

                                                className="h-4 w-4"

                                                strokeWidth={1.75}

                                            />

                                            Perbaiki &amp; ajukan ulang

                                        </Link>

                                    </div>

                                )}

                            </div>

                        </div>

                    </section>

                )}



                {/* PANEL APPROVAL SPV */}

                {rrf.bisa_approve && <PanelApproval rrf={rrf} />}



                {/* DETAIL */}

                <RrfDetail rrf={rrf} />

            </div>



            {/* KONFIRMASI HAPUS */}

            <KonfirmasiDialog

                open={hapusOpen}

                title="Hapus RRF?"

                message={`Apakah kamu yakin ingin menghapus RRF ${rrf.rrf_no}?${

                    ['diajukan', 'ditolak'].includes(rrf.status)

                        ? ''

                        : ' RRF ini sudah diproses, jadi RRF dan riwayat penanganannya tidak akan muncul lagi di daftar.'

                }`}

                confirmLabel="Ya, Hapus"

                tone="red"

                processing={menghapus}

                error={errorHapus}

                onCancel={tutupHapus}

                onConfirm={konfirmasiHapus}

            />

        </ProduksiLayout>

    );

}