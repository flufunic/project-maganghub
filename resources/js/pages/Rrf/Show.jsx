import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ProduksiLayout, { StatusBadge } from '../../Components/ProduksiLayout';

function Row({ label, children }) {
    return (
        <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 text-sm last:border-0 sm:grid-cols-3 sm:gap-3">
            <dt className="font-medium text-slate-500">{label}</dt>

            <dd className="break-words font-semibold text-slate-800 sm:col-span-2">
                {children || (
                    <span className="font-normal text-slate-400">-</span>
                )}
            </dd>
        </div>
    );
}

function SectionTitle({ children, description }) {
    return (
        <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                {children}
            </h2>

            {description && (
                <p className="mt-1 text-xs text-slate-400">{description}</p>
            )}
        </div>
    );
}

const cardCls =
    'rounded-2xl border border-white/40 bg-white/[0.93] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.18)] backdrop-blur-2xl';

function Foto({ daftar = [] }) {
    if (!daftar.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-400">Belum ada foto.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {daftar.map((f) => (
                <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-2 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                >
                    <img
                        src={f.url}
                        alt="Foto RRF"
                        className="h-36 w-full rounded-lg object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    <p className="mt-2 text-center text-xs font-semibold text-slate-500 group-hover:text-blue-700">
                        Lihat foto ↗
                    </p>
                </a>
            ))}
        </div>
    );
}

/* PANEL KEPUTUSAN SPV */
function PanelApproval({ rrf }) {
    const { data, setData, post, processing, errors } = useForm({
        catatan: '',
    });

    const [konfirmasi, setKonfirmasi] = useState(null);

    const bisaTolak = data.catatan.trim().length >= 5;

    const kirim = (aksi) => {
        const pesan =
            aksi === 'approve'
                ? 'Apakah kamu yakin ingin menyetujui RRF ini?'
                : 'Apakah kamu yakin ingin menolak RRF ini?';

        if (!window.confirm(pesan)) return;

        post(`/rrf/${rrf.id}/${aksi}`, {
            preserveScroll: true,
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
                                onClick={() =>
                                    kirim(
                                        konfirmasi === 'approve'
                                            ? 'approve'
                                            : 'reject'
                                    )
                                }
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

    const fotoBefore = rrf.foto_before ?? [];
    const fotoAfter = rrf.foto_after ?? [];
    const parts = rrf.parts ?? [];
    const logs = rrf.logs ?? [];

    const adaIsianMtc =
        rrf.cause ||
        rrf.remark ||
        rrf.start_at ||
        rrf.finish_at ||
        rrf.pic ||
        fotoAfter.length > 0;

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

                <div className="pt-1">
                    <StatusBadge
                        status={rrf.status}
                        label={rrf.status_label}
                    />
                </div>
            </div>

            <div className="space-y-5">
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
                                    <Link
                                        href={`/rrf/${rrf.id}/edit`}
                                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-700"
                                    >
                                        Perbaiki &amp; ajukan ulang →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* PANEL APPROVAL SPV */}
                {rrf.bisa_approve && <PanelApproval rrf={rrf} />}

                {/* DATA PERMINTAAN */}
                <section className={cardCls}>
                    <SectionTitle description="Informasi utama permintaan perbaikan mesin.">
                        Data permintaan
                    </SectionTitle>

                    <dl>
                        <Row label="Division pelapor">{rrf.divisi}</Row>
                        <Row label="Location">{rrf.lokasi}</Row>
                        <Row label="Machine">{rrf.mesin}</Row>

                        <Row label="Class">
                            {rrf.kelas &&
                                `${rrf.kelas.kode} - ${rrf.kelas.nama} (${rrf.kelas.deskripsi})`}
                        </Row>

                        <Row label="Jenis permintaan">
                            <span className="capitalize">
                                {rrf.jenis_permintaan}
                            </span>
                        </Row>

                        <Row label="Req. schedule">
                            {rrf.req_schedule_at}
                        </Row>

                        <Row label="Dibuat oleh">
                            {rrf.pembuat} ({rrf.dibuat_pada})
                        </Row>

                        <Row label="1. Problem">
                            <span className="whitespace-pre-line">
                                {rrf.problem}
                            </span>
                        </Row>

                        <Row label="3. Request activity & counter measure">
                            <span className="whitespace-pre-line">
                                {rrf.request_activity}
                            </span>
                        </Row>
                    </dl>
                </section>

                {/* PART */}
                <section className={cardCls}>
                    <SectionTitle description="Daftar komponen atau spare part yang diminta.">
                        Part yang diminta
                    </SectionTitle>

                    {parts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                            <p className="text-sm text-slate-400">
                                Tidak ada part yang diminta.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-[#0a1a4d] text-left text-[10px] font-bold uppercase tracking-wider text-white">
                                        <th className="whitespace-nowrap px-4 py-3">
                                            Part name
                                        </th>
                                        <th className="whitespace-nowrap px-4 py-3">
                                            Model / type
                                        </th>
                                        <th className="whitespace-nowrap px-4 py-3">
                                            Maker
                                        </th>
                                        <th className="whitespace-nowrap px-4 py-3">
                                            Qty
                                        </th>
                                        <th className="whitespace-nowrap px-4 py-3">
                                            Other
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {parts.map((p, index) => (
                                        <tr
                                            key={p.id}
                                            className={`transition hover:bg-blue-50/60 ${
                                                index % 2 === 0
                                                    ? 'bg-white'
                                                    : 'bg-slate-50/60'
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {p.part_name || '-'}
                                            </td>

                                            <td className="px-4 py-3 text-slate-600">
                                                {p.model_type || '-'}
                                            </td>

                                            <td className="px-4 py-3 text-slate-600">
                                                {p.maker || '-'}
                                            </td>

                                            <td className="px-4 py-3 font-semibold text-slate-700">
                                                {p.qty}
                                            </td>

                                            <td className="px-4 py-3 text-slate-600">
                                                {p.other || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* FOTO BEFORE */}
                <section className={cardCls}>
                    <SectionTitle description="Dokumentasi kondisi mesin sebelum penanganan.">
                        Foto before
                    </SectionTitle>

                    <Foto daftar={fotoBefore} />
                </section>

                {/* PENANGANAN MAINTENANCE */}
                {adaIsianMtc && (
                    <section className={cardCls}>
                        <SectionTitle description="Informasi tindakan dan hasil penanganan oleh tim Maintenance.">
                            Penanganan maintenance
                        </SectionTitle>

                        <dl>
                            <Row label="PIC MTC">{rrf.pic}</Row>
                            <Row label="Serv. schedule">
                                {rrf.serv_schedule_at}
                            </Row>
                            <Row label="Start">{rrf.start_at}</Row>
                            <Row label="Finish">{rrf.finish_at}</Row>

                            <Row label="Down time">
                                {rrf.downtime_menit != null &&
                                    `${rrf.downtime_menit} menit`}
                            </Row>

                            <Row label="Stop line">
                                {rrf.stop_line_menit != null &&
                                    `${rrf.stop_line_menit} menit`}
                            </Row>

                            <Row label="Man">{rrf.jumlah_man}</Row>
                            <Row label="Shift">{rrf.shift}</Row>
                            <Row label="2. Cause">{rrf.cause}</Row>
                            <Row label="4. Remark">{rrf.remark}</Row>
                        </dl>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                                Foto after
                            </h3>

                            <Foto daftar={fotoAfter} />
                        </div>
                    </section>
                )}

                {/* RIWAYAT STATUS */}
                <section className={cardCls}>
                    <SectionTitle description="Catatan perubahan status dan aktivitas RRF.">
                        Riwayat status
                    </SectionTitle>

                    {logs.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            Belum ada riwayat status.
                        </p>
                    ) : (
                        <ol className="relative ml-2 space-y-4 border-l-2 border-blue-100 pl-5">
                            {logs.map((l) => (
                                <li key={l.id} className="relative">
                                    <span className="absolute -left-[27px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-blue-500 ring-2 ring-blue-100" />

                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-sm font-bold capitalize text-slate-800">
                                                {l.status}
                                            </span>

                                            <span className="text-[11px] font-medium text-slate-400">
                                                {l.waktu}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Oleh {l.oleh ?? 'Sistem'}
                                        </p>

                                        {l.catatan && (
                                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                                {l.catatan}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </div>
        </ProduksiLayout>
    );
}