import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MIN_YEAR = 2020;
const MAX_YEAR = 2040;

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const labelClass = 'text-[11px] font-bold uppercase tracking-wide text-slate-400';

function StatusBadge({ status }) {
    const map = {
        diperiksa: ['Sudah Diperiksa', 'border-emerald-200 bg-emerald-50 text-emerald-700'],
        ditolak: ['Ditolak', 'border-red-200 bg-red-50 text-red-700'],
        menunggu: ['Menunggu Diperiksa', 'border-amber-200 bg-amber-50 text-amber-700'],
    };

    const [teks, cls] = map[status] ?? [
        'Belum Dikirim',
        'border-slate-200 bg-slate-50 text-slate-500',
    ];

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
            {teks}
        </span>
    );
}

export default function Pengiriman({ tahun, bulan, minggu = [] }) {
    const { flash, errors } = usePage().props;

    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(Number(bulan));
    const [selectedYear, setSelectedYear] = useState(Number(tahun));
    const [mingguMulai, setMingguMulai] = useState('');
    const [divisiId, setDivisiId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [toast, setToast] = useState(null);

    // sinkron dengan data server
    useEffect(() => {
        setSelectedMonth(Number(bulan));
        setSelectedYear(Number(tahun));
    }, [bulan, tahun]);

    // pilih minggu default: minggu terbaru yang sudah bisa dikirim
    useEffect(() => {
        const bisa = [...minggu].reverse().find((m) =>
            (m.divisis ?? []).some((d) => d.boleh_kirim)
        );

        setMingguMulai(bisa?.mulai ?? minggu[0]?.mulai ?? '');
        setDivisiId(null);
    }, [minggu]);

    useEffect(() => {
        if (flash?.success) setToast({ type: 'success', message: flash.success });
    }, [flash]);

    useEffect(() => {
        if (errors?.pengiriman) setToast({ type: 'error', message: errors.pengiriman });
    }, [errors]);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => setToast(null), 5000);

        return () => clearTimeout(timer);
    }, [toast]);

    const mingguTerpilih = useMemo(
        () => minggu.find((m) => m.mulai === mingguMulai) ?? null,
        [minggu, mingguMulai]
    );

    const divisiTerpilih = useMemo(
        () => mingguTerpilih?.divisis?.find((d) => d.divisi_id === divisiId) ?? null,
        [mingguTerpilih, divisiId]
    );

    const ubahPeriode = (month, year) => {
        if (year < MIN_YEAR || year > MAX_YEAR) return;

        setSelectedMonth(month);
        setSelectedYear(year);

        router.get(
            '/check-sheet-pengiriman',
            { bulan: month, tahun: year },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const kirim = () => {
        if (!mingguTerpilih || !divisiTerpilih) return;

        const ulang = divisiTerpilih.status === 'ditolak';

        setConfirmDialog({
            title: ulang ? 'Kirim ulang?' : 'Kirim ke pimpinan?',
            message: `${divisiTerpilih.divisi} · ${mingguTerpilih.label} akan dikirim ke pimpinan untuk diperiksa.`,
            confirmLabel: 'Ya, Kirim',
            tone: 'blue',
            onConfirm: () => {
                router.post(
                    '/check-sheet-pengiriman',
                    {
                        minggu_mulai: mingguTerpilih.mulai,
                        divisi_id: divisiTerpilih.divisi_id,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => setDivisiId(null),
                        onFinish: () => setConfirmDialog(null),
                    }
                );
            },
        });
    };

    const kembali = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/check-sheets');
        }
    };

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Kirim ke Pimpinan" />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={kembali}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                            title="Kembali"
                            aria-label="Kembali ke halaman sebelumnya"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                            aria-label="Buka menu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-base font-bold text-white sm:text-lg">
                                Kirim ke Pimpinan
                            </h1>
                            <p className="hidden text-xs text-white/65 sm:block">
                                Pilih minggu dan divisi, lalu kirim untuk diperiksa
                            </p>
                        </div>

                        <Link
                            href="/check-sheet-pengiriman/riwayat"
                            className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                        >
                            Riwayat Kirim
                        </Link>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        {/* LANGKAH 1: PERIODE */}
                        <section className="border-b border-slate-200/70 px-5 py-5">
                            <p className="mb-3 text-sm font-bold text-slate-800">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">1</span>
                                Pilih bulan dan minggu
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="flex flex-col gap-1">
                                    <span className={labelClass}>Bulan</span>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => ubahPeriode(Number(e.target.value), selectedYear)}
                                        className={selectClass}
                                    >
                                        {months.map((nama, i) => (
                                            <option key={nama} value={i + 1}>{nama}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-1">
                                    <span className={labelClass}>Tahun</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => ubahPeriode(selectedMonth, Number(e.target.value))}
                                        className={selectClass}
                                    >
                                        {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <label className="mt-3 flex flex-col gap-1">
                                <span className={labelClass}>Minggu</span>
                                <select
                                    value={mingguMulai}
                                    onChange={(e) => {
                                        setMingguMulai(e.target.value);
                                        setDivisiId(null);
                                    }}
                                    className={selectClass}
                                >
                                    {minggu.length === 0 && <option value="">Tidak ada minggu</option>}

                                    {minggu.map((m) => {
                                        const total = (m.divisis ?? []).length;
                                        const terkirim = (m.divisis ?? []).filter((d) => d.status).length;

                                        return (
                                            <option key={m.mulai} value={m.mulai}>
                                                {m.label} ({terkirim}/{total} terkirim)
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>

                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                Minggu yang melewati pergantian bulan muncul di kedua bulan,
                                tapi tiap divisi hanya dikirim satu kali per minggu.
                            </p>
                        </section>

                        {/* LANGKAH 2: DIVISI */}
                        <section className="px-5 py-5">
                            <p className="mb-3 text-sm font-bold text-slate-800">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">2</span>
                                Pilih divisi
                            </p>

                            {!mingguTerpilih ? (
                                <p className="py-6 text-center text-sm text-slate-400">
                                    Tidak ada minggu pada bulan ini.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {(mingguTerpilih.divisis ?? []).map((d) => {
                                        const aktif = divisiId === d.divisi_id;
                                        const bisa = d.boleh_kirim;

                                        return (
                                            <button
                                                key={d.divisi_id}
                                                type="button"
                                                disabled={!bisa}
                                                onClick={() => setDivisiId(d.divisi_id)}
                                                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                                    aktif
                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                                                        : bisa
                                                        ? 'cursor-pointer border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                                                        : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800">{d.divisi}</p>

                                                    {d.status === 'ditolak' && (
                                                        <p className="mt-1 border-l-2 border-red-200 pl-2 text-xs leading-relaxed text-slate-600">
                                                            <span className="font-bold text-red-500">Alasan ditolak:</span>{' '}
                                                            {d.alasan_penolakan || '-'}
                                                        </p>
                                                    )}

                                                    {d.dikirim_pada && (
                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            Dikirim {d.dikirim_pada} oleh {d.dikirim_oleh || '-'}
                                                        </p>
                                                    )}

                                                    {!bisa && !d.status && (
                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            Minggu ini belum dimulai
                                                        </p>
                                                    )}
                                                </div>

                                                <StatusBadge status={d.status} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* AKSI */}
                        <div className="flex flex-col gap-3 border-t border-slate-200/70 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500">
                                {divisiTerpilih && mingguTerpilih ? (
                                    <>
                                        Akan dikirim:{' '}
                                        <span className="font-bold text-slate-700">
                                            {divisiTerpilih.divisi}
                                        </span>{' '}
                                        · {mingguTerpilih.label}
                                    </>
                                ) : (
                                    'Pilih divisi yang akan dikirim.'
                                )}
                            </p>

                            <button
                                type="button"
                                onClick={kirim}
                                disabled={!divisiTerpilih}
                                className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {divisiTerpilih?.status === 'ditolak' ? 'Kirim Ulang' : 'Kirim ke Pimpinan'}
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="px-6 py-4 text-center text-xs font-medium text-white/70">
                        © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                    </div>
                </footer>
            </div>

            {toast && (
                <div
                    className={`fixed right-5 top-5 z-[100] w-[340px] max-w-[calc(100vw-2.5rem)] rounded-xl border bg-white p-4 shadow-2xl ${
                        toast.type === 'error' ? 'border-red-200' : 'border-emerald-200'
                    }`}
                >
                    <p className="text-sm font-bold text-slate-800">
                        {toast.type === 'error' ? 'Gagal' : 'Berhasil'}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{toast.message}</p>
                </div>
            )}

            <ConfirmModal
                open={Boolean(confirmDialog)}
                title={confirmDialog?.title}
                message={confirmDialog?.message}
                confirmLabel={confirmDialog?.confirmLabel}
                tone={confirmDialog?.tone}
                onConfirm={() => confirmDialog?.onConfirm?.()}
                onCancel={() => setConfirmDialog(null)}
            />
        </>
    );
}