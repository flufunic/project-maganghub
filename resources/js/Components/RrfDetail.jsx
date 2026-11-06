import React from 'react';

export function Row({ label, children }) {
    return (
        <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 text-sm last:border-0 sm:grid-cols-3 sm:gap-3">
            <dt className="font-medium text-slate-500">{label}</dt>
            <dd className="break-words font-semibold text-slate-800 sm:col-span-2">
                {children || <span className="font-normal text-slate-400">-</span>}
            </dd>
        </div>
    );
}

export function SectionTitle({ children, description }) {
    return (
        <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                {children}
            </h2>
            {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
    );
}

export const cardCls =
    'rounded-2xl border border-white/40 bg-white/[0.93] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.18)] backdrop-blur-2xl';

export function Foto({ daftar = [] }) {
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
                        className="h-36 w-full rounded-lg object-cover"
                    />
                    <p className="mt-2 text-center text-xs font-semibold text-slate-500 group-hover:text-blue-700">
                        Lihat foto ↗
                    </p>
                </a>
            ))}
        </div>
    );
}

/**
 * `sisip` (opsional) ditampilkan tepat di bawah data produksi
 * (data permintaan, part, foto before), sebelum bagian maintenance.
 */
export default function RrfDetail({ rrf, sisip = null }) {
    const parts = rrf.parts ?? [];
    const logs = rrf.logs ?? [];
    const fotoAfter = rrf.foto_after ?? [];

    const adaIsianMtc =
        rrf.diterima_oleh ||
        rrf.pic ||
        rrf.serv_schedule_text ||
        rrf.cause ||
        rrf.remark ||
        fotoAfter.length > 0;

    return (
        <div className="space-y-5">
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
                        <span className="capitalize">{rrf.jenis_permintaan}</span>
                    </Row>
                    <Row label="Req. schedule">{rrf.req_schedule_text}</Row>
                    <Row label="Dibuat oleh">
                        {rrf.pembuat} ({rrf.dibuat_pada})
                    </Row>
                    <Row label="1. Problem">
                        <span className="whitespace-pre-line">{rrf.problem}</span>
                    </Row>
                    <Row label="3. Request activity & counter measure">
                        <span className="whitespace-pre-line">{rrf.request_activity}</span>
                    </Row>
                </dl>
            </section>

            <section className={cardCls}>
                <SectionTitle description="Part yang diminta produksi, atau yang dipakai setelah dikoreksi maintenance.">
                    Part
                </SectionTitle>

                {parts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                        <p className="text-sm text-slate-400">Tidak ada part.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-[#0a1a4d] text-left text-[10px] font-bold uppercase tracking-wider text-white">
                                    <th className="px-4 py-3">Part name</th>
                                    <th className="px-4 py-3">Model / type</th>
                                    <th className="px-4 py-3">Maker</th>
                                    <th className="px-4 py-3">Qty</th>
                                    <th className="px-4 py-3">Other</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {parts.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
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

            <section className={cardCls}>
                <SectionTitle description="Kondisi mesin sebelum penanganan.">
                    Foto before
                </SectionTitle>
                <Foto daftar={rrf.foto_before ?? []} />
            </section>

            {sisip}

            {adaIsianMtc && (
                <section className={cardCls}>
                    <SectionTitle description="Man: PIC MTC, shift, dan time repair, serta jadwal dan hasil penanganan Maintenance.">
                        Penanganan maintenance
                    </SectionTitle>
                    <dl>
                        <Row label="Diterima oleh">
                            {rrf.diterima_oleh &&
                                `${rrf.diterima_oleh} (${rrf.diterima_pada})`}
                        </Row>
                        <Row label="PIC MTC">{rrf.pic}</Row>
                        <Row label="Shift">{rrf.shift}</Row>
                        <Row label="Time repair">
                            {rrf.time_repair &&
                                (rrf.time_repair_pembagi > 1
                                    ? `${rrf.time_repair} (down time ÷ ${rrf.time_repair_pembagi} RRF mesin ini)`
                                    : rrf.time_repair)}
                        </Row>
                        <Row label="Serv. schedule">{rrf.serv_schedule_text}</Row>
                        <Row label="Stop line">{rrf.stop_line_text}</Row>
                        <Row label="Down time">{rrf.downtime}</Row>
                        <Row label="2. Cause">
                            <span className="whitespace-pre-line">{rrf.cause}</span>
                        </Row>
                        <Row label="4. Remark">
                            <span className="whitespace-pre-line">{rrf.remark}</span>
                        </Row>
                    </dl>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                            5. Picture (foto after)
                        </h3>
                        <Foto daftar={fotoAfter} />
                    </div>
                </section>
            )}

            <section className={cardCls}>
                <SectionTitle description="Catatan perubahan status dan aktivitas RRF.">
                    Riwayat status
                </SectionTitle>

                {logs.length === 0 ? (
                    <p className="text-sm text-slate-400">Belum ada riwayat status.</p>
                ) : (
                    <ol className="relative ml-2 space-y-4 border-l-2 border-blue-100 pl-5">
                        {logs.map((l) => (
                            <li key={l.id} className="relative">
                                <span className="absolute -left-[27px] top-1 flex h-3 w-3 rounded-full border-2 border-white bg-blue-500 ring-2 ring-blue-100" />
                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-slate-800">
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
                                        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
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
    );
}