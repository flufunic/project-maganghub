import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const STATUS = {
    menunggu: ['Menunggu Diperiksa', 'border-amber-200 bg-amber-50 text-amber-700'],
    diperiksa: ['Sudah Diperiksa', 'border-emerald-200 bg-emerald-50 text-emerald-700'],
    ditolak: ['Ditolak', 'border-red-200 bg-red-50 text-red-700'],
};

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'menunggu', label: 'Menunggu' },
    { key: 'diperiksa', label: 'Diperiksa' },
    { key: 'ditolak', label: 'Ditolak' },
];

export default function Riwayat({ pengirimans = [], divisis = [] }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [status, setStatus] = useState('semua');
    const [divisi, setDivisi] = useState('semua');
    const [tahun, setTahun] = useState('semua');

    const daftarTahun = useMemo(
        () => [...new Set(pengirimans.map((p) => p.tahun))].sort((a, b) => b - a),
        [pengirimans]
    );

    const hitung = (key) =>
        key === 'semua'
            ? pengirimans.length
            : pengirimans.filter((p) => p.status === key).length;

    const daftar = pengirimans.filter(
        (p) =>
            (status === 'semua' || p.status === status) &&
            (divisi === 'semua' || String(p.divisi_id) === divisi) &&
            (tahun === 'semua' || String(p.tahun) === tahun)
    );

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
            <Head title="Riwayat Pengiriman" />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
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
                                Riwayat Pengiriman
                            </h1>
                            <p className="hidden text-xs text-white/65 sm:block">
                                Semua check sheet yang pernah dikirim ke pimpinan
                            </p>
                        </div>

                        <Link
                            href="/check-sheet-pengiriman"
                            className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-3 text-xs font-bold text-white shadow-sm transition hover:from-emerald-600 hover:to-green-700"
                        >
                            Kirim ke Pimpinan
                        </Link>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
                    {/* FILTER STATUS */}
                    <div className="mb-3 flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setStatus(f.key)}
                                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                                    status === f.key
                                        ? 'border-white bg-white text-blue-700'
                                        : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {f.label} ({hitung(f.key)})
                            </button>
                        ))}
                    </div>

                    {/* FILTER DIVISI + TAHUN */}
                    <div className={`mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 ${glassCard}`}>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            Divisi
                            <select value={divisi} onChange={(e) => setDivisi(e.target.value)} className={selectClass}>
                                <option value="semua">Semua divisi</option>
                                {divisis.map((d) => (
                                    <option key={d.id} value={String(d.id)}>{d.nama}</option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            Tahun
                            <select value={tahun} onChange={(e) => setTahun(e.target.value)} className={selectClass}>
                                <option value="semua">Semua tahun</option>
                                {daftarTahun.map((y) => (
                                    <option key={y} value={String(y)}>{y}</option>
                                ))}
                            </select>
                        </label>

                        <p className="ml-auto text-xs text-slate-400">{daftar.length} data</p>
                    </div>

                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        {daftar.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <h3 className="font-semibold text-slate-700">Belum ada riwayat</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Belum ada pengiriman yang sesuai filter.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-left text-xs font-bold text-slate-500">
                                            <th className="px-5 py-3">Minggu</th>
                                            <th className="px-5 py-3">Divisi</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Dikirim</th>
                                            <th className="px-5 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/60">
                                        {daftar.map((p) => {
                                            const [teks, cls] = STATUS[p.status] ?? STATUS.menunggu;

                                            return (
                                                <tr key={p.id} className="align-top transition-colors hover:bg-blue-50/50">
                                                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                                                        {p.label}
                                                    </td>

                                                    <td className="px-5 py-3.5 font-semibold text-blue-700">
                                                        {p.divisi}
                                                    </td>

                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
                                                            {teks}
                                                        </span>

                                                        {p.status === 'ditolak' && (
                                                            <p className="mt-1.5 max-w-xs border-l-2 border-red-200 pl-2 text-xs leading-relaxed text-slate-600">
                                                                <span className="font-bold text-red-500">Alasan:</span>{' '}
                                                                {p.alasan_penolakan || '-'}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3.5 text-xs text-slate-500">
                                                        {p.dikirim_pada || '-'}
                                                        <br />
                                                        oleh {p.dikirim_oleh || '-'}
                                                    </td>

                                                    <td className="px-5 py-3.5 text-center">
                                                        {p.status === 'ditolak' ? (
                                                            <Link
                                                                href={`/check-sheet-pengiriman?bulan=${p.bulan}&tahun=${p.tahun}`}
                                                                className="inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-800"
                                                            >
                                                                Kirim Ulang
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="px-6 py-4 text-center text-xs font-medium text-white/70">
                        © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                    </div>
                </footer>
            </div>
        </>
    );
}