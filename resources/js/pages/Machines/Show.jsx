import Sidebar from '@/Components/Sidebar';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

function Info({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-700" title={value || ''}>
                {value || '-'}
            </p>
        </div>
    );
}

export default function Show({ type, machines = [] }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selected, setSelected] = useState(machines.map((m) => m.id));

    const semua = selected.length === machines.length;

    const toggle = (id) =>
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const print = () => router.get('/machines/print-barcodes', { ids: selected });

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title={`Unit ${type.nama_alat}`} />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxFloat {
                    0%, 100% { transform: translate3d(0,0,0) scale(1); }
                    50% { transform: translate3d(30px,-30px,0) scale(1.08); }
                }
                @keyframes idxFloatReverse {
                    0%, 100% { transform: translate3d(0,0,0) scale(1); }
                    50% { transform: translate3d(-35px,25px,0) scale(1.1); }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .idx-gradient { background-size: 250% 250%; animation: idxGradient 20s ease infinite; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }
                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient, .idx-float, .idx-float-reverse, .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />
                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-2.5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                                title="Menu"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                                    strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                {type.nama_alat}
                                {type.merk ? ` — ${type.merk}` : ''}
                            </h1>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 space-y-3 px-4 py-4 sm:px-6">
                    <Link
                        href="/machines"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25"
                    >
                        ← Kembali ke daftar
                    </Link>

                    {/* INFO JENIS MESIN */}
                    <div className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="grid grid-cols-2 gap-4 px-4 py-4 md:grid-cols-4 xl:grid-cols-6">
                            <Info label="Nama Alat" value={type.nama_alat} />
                            <Info label="Merk" value={type.merk} />
                            <Info label="Model" value={type.model_type} />
                            <Info label="No. Kontrol" value={type.no_kontrol_raw} />
                            <Info label="Negara" value={type.negara_pembuat} />
                            <Info label="Electric" value={type.electric_consumption} />
                            <Info label="Tahun" value={type.tahun_pembuatan} />
                            <Info label="Start Ops" value={type.start_operasional} />
                            <Info label="Supplier" value={type.supplier_name} />
                            <Info label="Kontak" value={type.kontak_person} />
                            <Info label="Panel KWH" value={type.panel_monitor_kwh} />
                            <Info label="Keterangan" value={type.keterangan} />
                        </div>
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </div>

                    {/* DAFTAR UNIT */}
                    <div
                        style={{ animationDelay: '100ms' }}
                        className={`idx-rise rounded-2xl ${glassCard}`}
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold tracking-tight text-slate-900">
                                    Daftar Unit
                                </h2>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                                    {machines.length} unit
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                    {selected.length} dipilih
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelected(semua ? [] : machines.map((m) => m.id))
                                    }
                                    className="h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                                >
                                    {semua ? 'Kosongkan' : 'Pilih semua'}
                                </button>

                                <button
                                    type="button"
                                    onClick={print}
                                    disabled={selected.length === 0}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Print Barcode ({selected.length})
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                            {machines.map((m) => {
                                const on = selected.includes(m.id);

                                return (
                                    <label
                                        key={m.id}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                                            on
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={on}
                                            onChange={() => toggle(m.id)}
                                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                                        />
                                        <span className="truncate" title={m.no_kontrol}>
                                            {m.no_kontrol}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Daftar Inventaris Mesin
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}