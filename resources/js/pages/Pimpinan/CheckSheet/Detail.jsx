import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    diperiksa: {
        label: 'Sudah Diperiksa',
        cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'border-red-200 bg-red-50 text-red-700',
    },
};

// warna persentase: hijau >= 90, kuning >= 60, merah di bawahnya
const warnaPersen = (p) => {
    if (p === null || p === undefined) return 'text-slate-400';
    if (p >= 90) return 'text-emerald-600';
    if (p >= 60) return 'text-amber-600';

    return 'text-red-600';
};

const teksPersen = (p) => (p === null || p === undefined ? '-' : `${p}%`);

// Isi 1 sel (1 item x 1 hari)
function Sel({ sel, mode }) {
    if (!sel) {
        return <span className="text-slate-200">·</span>;
    }

    const catatan = sel.catatan ? (
        <span title={sel.catatan} className="ml-0.5 cursor-help text-[10px]">📝</span>
    ) : null;

    if (mode === 'actual') {
        return (
            <span className="font-bold text-slate-700">
                {sel.actual ?? '-'}
                {catatan}
            </span>
        );
    }

    if (mode === 'plan_act') {
        return (
            <span className="inline-flex flex-col items-center leading-tight">
                {sel.plan && <span className="font-bold text-blue-500">○</span>}
                {sel.status && <span className="font-bold text-emerald-600">✓</span>}
                {!sel.plan && !sel.status && <span className="text-slate-200">·</span>}
                {catatan}
            </span>
        );
    }

    return sel.status ? (
        <span className="font-bold text-emerald-600">
            ✓{catatan}
        </span>
    ) : (
        <span className="text-slate-200">·</span>
    );
}

// Satu blok check sheet (+ line), bisa dibuka / ditutup
function SheetBlok({ sheet, hari }) {
    const [buka, setBuka] = useState(false);

    return (
        <div className="border-t border-slate-200/70">
            <button
                type="button"
                onClick={() => setBuka((v) => !v)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-blue-50/50"
            >
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                        {sheet.nama}
                        {sheet.line && (
                            <span className="ml-2 text-xs font-bold text-blue-600">
                                {sheet.line}
                            </span>
                        )}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        {sheet.nomor_dokumen || '-'} · {sheet.items.length} item
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-500">
                        {sheet.terisi}/{sheet.target}
                    </span>
                    <span className={`w-14 text-right text-sm font-extrabold ${warnaPersen(sheet.persen)}`}>
                        {teksPersen(sheet.persen)}
                    </span>
                    <span className="text-xs text-slate-400">{buka ? '▲' : '▼'}</span>
                </div>
            </button>

            {buka && (
                <div className="overflow-x-auto border-t border-slate-100 bg-white/60">
                    <table className="w-full min-w-[640px] border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="w-10 border border-slate-200 px-2 py-2 text-center font-bold text-slate-600">
                                    No
                                </th>
                                <th className="min-w-[220px] border border-slate-200 px-3 py-2 text-left font-bold text-slate-600">
                                    Inspection Point
                                </th>
                                <th className="w-12 border border-slate-200 px-2 py-2 text-center font-bold text-slate-600">
                                    Shift
                                </th>
                                {hari.map((h) => (
                                    <th
                                        key={h.tanggal}
                                        className="w-14 border border-slate-200 bg-blue-50 px-2 py-2 text-center font-bold text-blue-700"
                                    >
                                        {h.nama}
                                        <br />
                                        <span className="text-[10px] font-semibold text-blue-400">{h.tgl}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {sheet.items.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/40">
                                    <td className="border border-slate-200 px-2 py-1.5 text-center text-slate-500">
                                        {item.no}
                                    </td>
                                    <td className="border border-slate-200 px-3 py-1.5 font-medium text-slate-700">
                                        {item.inspection_point}
                                    </td>
                                    <td className="border border-slate-200 px-2 py-1.5 text-center font-bold text-indigo-600">
                                        {item.shift || '-'}
                                    </td>
                                    {item.sel.map((sel, i) => (
                                        <td
                                            key={i}
                                            className={`border border-slate-200 px-1 py-1.5 text-center ${
                                                sel?.status ? 'bg-emerald-50/60' : ''
                                            }`}
                                        >
                                            <Sel sel={sel} mode={sheet.mode} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function Detail({ pengiriman, rekap }) {
    const [showTolak, setShowTolak] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPeriksa, setShowPeriksa] = useState(false);

    const { hari, divisis, abnormalities, ringkasan } = rekap;
    const s = STATUS[pengiriman.status] ?? STATUS.menunggu;

    const periksa = () => {
        setShowPeriksa(true);
    };

    const konfirmasiPeriksa = () => {
        setSubmitting(true);

        router.post(
            `/pimpinan/check-sheet/${pengiriman.id}/periksa`,
            {},
            {
                onFinish: () => {
                    setSubmitting(false);
                    setShowPeriksa(false);
                },
            }
        );
    };

    const tolak = () => {
        if (!alasan.trim()) return;

        setSubmitting(true);

        router.post(
            `/pimpinan/check-sheet/${pengiriman.id}/tolak`,
            { alasan_penolakan: alasan },
            {
                onSuccess: () => {
                    setShowTolak(false);
                    setAlasan('');
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <>
            <Head title="Detail Check Sheet Mingguan" />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href="/pimpinan/check-sheet"
                            title="Kembali"
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>

                        <div>
                            <h1 className="text-lg font-bold text-white">Detail Check Sheet Mingguan</h1>
                            <p className="hidden text-xs text-white/65 sm:block">{pengiriman.label}</p>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 sm:py-8">
                    {/* INFO + AKSI */}
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-x-10 gap-y-3">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Minggu</p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">{pengiriman.label}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Dikirim Oleh</p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {pengiriman.dikirim_oleh || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Waktu Kirim</p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {pengiriman.dikirim_pada || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Status</p>
                                    <span className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${s.cls}`}>
                                        {s.label}
                                    </span>
                                </div>
                            </div>

                            {pengiriman.status === 'menunggu' && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={periksa}
                                        className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        Tandai Sudah Diperiksa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTolak(true)}
                                        className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                    >
                                        Tolak
                                    </button>
                                </div>
                            )}
                        </div>

                        {pengiriman.status === 'ditolak' && (
                            <div className="border-t border-red-100 bg-red-50/80 px-5 py-3 sm:px-6">
                                <p className="text-xs font-bold text-red-700">Alasan Penolakan</p>
                                <p className="mt-0.5 text-sm leading-relaxed text-red-600">
                                    {pengiriman.alasan_penolakan || '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RINGKASAN */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                            {
                                label: 'Persentase Terisi',
                                value: teksPersen(ringkasan.persen),
                                cls: warnaPersen(ringkasan.persen),
                            },
                            {
                                label: 'Centang Terisi',
                                value: `${ringkasan.terisi} / ${ringkasan.target}`,
                                cls: 'text-slate-800',
                            },
                            {
                                label: 'Abnormality',
                                value: ringkasan.abnormality,
                                cls: ringkasan.abnormality > 0 ? 'text-amber-600' : 'text-slate-800',
                            },
                            {
                                label: 'Abnormality Belum Selesai',
                                value: ringkasan.abnormality_terbuka,
                                cls: ringkasan.abnormality_terbuka > 0 ? 'text-red-600' : 'text-emerald-600',
                            },
                        ].map((c) => (
                            <div key={c.label} className={`rounded-2xl px-5 py-4 ${glassCard}`}>
                                <p className="text-xs font-medium text-slate-500">{c.label}</p>
                                <p className={`mt-1 text-2xl font-extrabold ${c.cls}`}>{c.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* PER DIVISI */}
                    {divisis.length === 0 ? (
                        <div className={`rounded-2xl px-6 py-14 text-center ${glassCard}`}>
                            <p className="font-semibold text-slate-700">Belum ada check sheet</p>
                        </div>
                    ) : (
                        divisis.map((d) => (
                            <section key={d.nama} className={`overflow-hidden rounded-2xl ${glassCard}`}>
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-4">
                                    <div>
                                        <h2 className="font-bold text-slate-800">{d.nama}</h2>
                                        <p className="text-xs text-slate-500">
                                            {d.sheets.length} check sheet · {d.terisi}/{d.target} centang
                                        </p>
                                    </div>
                                    <span className={`text-xl font-extrabold ${warnaPersen(d.persen)}`}>
                                        {teksPersen(d.persen)}
                                    </span>
                                </div>

                                {d.sheets.map((sheet) => (
                                    <SheetBlok key={sheet.key} sheet={sheet} hari={hari} />
                                ))}
                            </section>
                        ))
                    )}

                    {/* ABNORMALITY */}
                    <section className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="bg-amber-50/50 px-5 py-4">
                            <h2 className="font-bold text-slate-800">
                                Abnormality Minggu Ini ({abnormalities.length})
                            </h2>
                        </div>

                        {abnormalities.length === 0 ? (
                            <p className="px-5 py-10 text-center text-sm text-slate-500">
                                Tidak ada abnormality pada minggu ini.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-left text-xs font-bold text-slate-500">
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Check Sheet</th>
                                            <th className="px-4 py-3">Abnormality</th>
                                            <th className="px-4 py-3">Countermeasure</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">PIC</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/60">
                                        {abnormalities.map((a) => (
                                            <tr key={a.id} className="align-top">
                                                <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-700">
                                                    {a.tanggal_format}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    <span className="font-semibold text-slate-800">{a.divisi}</span>
                                                    <br />
                                                    {a.check_sheet}
                                                    {a.line && <span className="font-bold text-blue-600"> · {a.line}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-800">
                                                    {a.abnormality}
                                                    {a.preventif.map((p) => (
                                                        <span
                                                            key={p}
                                                            className="mt-1 block w-fit rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700"
                                                        >
                                                            Preventif {p}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {a.countermeasure || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-bold ${a.selesai ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{a.pic || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="px-6 py-4 text-center text-xs font-medium text-white/70">
                        © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                    </div>
                </footer>
            </div>

            {/* MODAL KONFIRMASI PERIKSA */}
            {showPeriksa && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md"
                    onClick={() => !submitting && setShowPeriksa(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-400" />

                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white px-6 pb-5 pt-8">
                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-100/60" />

                            <div className="relative flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-emerald-200 blur-xl" />

                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-300/50">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2.2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-7 w-7"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-4 text-center">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    Tandai Sudah Diperiksa?
                                </h3>

                                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                    Check sheet {pengiriman.divisi ? `${pengiriman.divisi} · ` : ''}{pengiriman.label} akan ditandai sudah diperiksa.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">
                            <button
                                type="button"
                                onClick={() => setShowPeriksa(false)}
                                disabled={submitting}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={konfirmasiPeriksa}
                                disabled={submitting}
                                className="flex-1 cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? 'Memproses...' : 'Ya, Sudah Diperiksa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TOLAK */}
            {showTolak && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl">
                        <div className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-800">Tolak Check Sheet</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Masukkan alasan penolakan. Admin akan melihatnya dan bisa mengirim ulang.
                            </p>
                        </div>

                        <div className="p-6">
                            <textarea
                                value={alasan}
                                onChange={(e) => setAlasan(e.target.value)}
                                rows={5}
                                placeholder="Contoh: Check sheet Line 3 belum lengkap..."
                                className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                            />

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTolak(false);
                                        setAlasan('');
                                    }}
                                    disabled={submitting}
                                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={tolak}
                                    disabled={submitting || !alasan.trim()}
                                    className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? 'Mengirim...' : 'Tolak Data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
