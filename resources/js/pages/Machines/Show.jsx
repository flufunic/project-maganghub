import Sidebar from '@/Components/Sidebar';
import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    back: { sw: 2, paths: ['M19 12H5M11 6l-6 6 6 6'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    search: { sw: 2, paths: ['M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z'] },
    print: {
        paths: [
            'M6 9V3.75h12V9M6 18H4.5A1.5 1.5 0 013 16.5v-6A1.5 1.5 0 014.5 9h15a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H18',
            'M6 14h12v6.75H6z',
        ],
    },
    box: { paths: ['M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5'] },
    qr: {
        paths: [
            'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z',
            'M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
        ],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];
    if (!icon) return null;
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            {icon.paths.map((d, i) => <path key={i} d={d} />)}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

function Info({ label, value, wide = false }) {
    return (
        <div className={`min-w-0 rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100 ${wide ? 'col-span-2' : ''}`}>
            <p className="text-[11px] font-medium text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-700" title={value || ''}>
                {value || '-'}
            </p>
        </div>
    );
}

export default function Show({ type, machines = [] }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selected, setSelected] = useState(machines.map((m) => m.id));
    const [q, setQ] = useState('');

    const tampil = useMemo(() => {
        const s = q.trim().toLowerCase();
        return s ? machines.filter((m) => m.no_kontrol.toLowerCase().includes(s)) : machines;
    }, [machines, q]);

    const semuaTampilTerpilih = tampil.length > 0 && tampil.every((m) => selected.includes(m.id));

    const toggle = (id) =>
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const toggleTampil = () => {
        const ids = tampil.map((m) => m.id);
        setSelected((s) =>
            semuaTampilTerpilih ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])]
        );
    };

    const print = () => router.get('/machines/print-barcodes', { ids: selected });

    const delay = (ms) => ({ animationDelay: `${ms}ms` });
    const persen = machines.length ? Math.round((selected.length / machines.length) * 100) : 0;

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title={`Unit ${type.nama_alat}`} />

            <style>{`
                @keyframes idxRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes idxFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
                @keyframes idxFloatReverse { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
                @keyframes idxShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes idxCheck { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.18); } 100% { transform: scale(1); opacity: 1; } }
                .idx-rise { animation: idxRise .7s cubic-bezier(.22,1,.36,1) both; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-shimmer { background-size: 200% 100%; animation: idxShimmer 6s linear infinite; }
                .idx-check { animation: idxCheck .3s cubic-bezier(.22,1,.36,1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .idx-rise, .idx-float, .idx-float-reverse, .idx-shimmer, .idx-check { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="idx-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-100px] top-[8%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="w-full px-3 py-3 sm:px-5 2xl:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                                title="Menu"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    {type.nama_alat}{type.merk ? ` — ${type.merk}` : ''}
                                </h1>
                                <p className="truncate text-xs text-blue-200/80">Detail jenis mesin & daftar unit</p>
                            </div>
                        </div>
                    </div>
                    <div className="idx-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* MAIN */}
                <main className="w-full flex-1 space-y-4 px-3 py-4 sm:px-5 2xl:px-8">
                    <Link
                        href="/machines"
                        className="group inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-blue-600 hover:shadow-md"
                    >
                        <Icon type="back" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                        Kembali ke daftar
                    </Link>

                    {/* INFO JENIS MESIN */}
                    <div className={`idx-rise relative overflow-hidden ${card}`}>
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-600" />
                        <div className="flex items-center gap-3 px-5 pb-1 pt-5">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Icon type="box" className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{type.nama_alat}</h2>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {machines.length} unit
                                    </span>
                                    {type.supplier_active && (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">Supplier Active</span>
                                    )}
                                    {type.supplier_repair && (
                                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">Supplier Repair</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4 xl:grid-cols-6">
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
                    </div>

                    {/* DAFTAR UNIT */}
                    <div style={delay(100)} className={`idx-rise ${card}`}>
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Daftar Unit</h2>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {machines.length} unit
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                                        {selected.length} dipilih
                                    </span>
                                </div>
                                <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                        style={{ width: `${persen}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Icon type="search" className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Cari no. unit…"
                                        className="h-9 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleTampil}
                                    className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
                                >
                                    {semuaTampilTerpilih ? 'Kosongkan' : 'Pilih semua'}
                                </button>

                                <button
                                    type="button"
                                    onClick={print}
                                    disabled={selected.length === 0}
                                    className="group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                    <Icon type="print" className="relative h-4 w-4" />
                                    <span className="relative">Print Barcode ({selected.length})</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 p-5 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                            {tampil.map((m) => {
                                const on = selected.includes(m.id);
                                return (
                                    <label
                                        key={m.id}
                                        className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                            on
                                                ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <input type="checkbox" checked={on} onChange={() => toggle(m.id)} className="sr-only" />
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                                                on ? 'border-blue-600 bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {on && <Icon type="check" className="idx-check h-3.5 w-3.5" />}
                                        </span>
                                        <span className="truncate" title={m.no_kontrol}>{m.no_kontrol}</span>
                                    </label>
                                );
                            })}

                            {tampil.length === 0 && (
                                <div className="col-span-full flex flex-col items-center py-12 text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                        <Icon type="qr" className="h-7 w-7 text-slate-400" />
                                    </div>
                                    <p className="font-semibold text-slate-700">Tidak ada unit</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {q ? 'Tidak ada unit yang cocok dengan pencarian.' : 'Jenis mesin ini belum punya unit.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Daftar Inventaris Mesin
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}