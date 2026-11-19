import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    search: { sw: 2, paths: ['M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z'] },
    print: {
        paths: [
            'M6 9V3.75h12V9M6 18H4.5A1.5 1.5 0 013 16.5v-6A1.5 1.5 0 014.5 9h15a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H18',
            'M6 14h12v6.75H6z',
        ],
    },
    qr: {
        paths: [
            'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z',
            'M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
        ],
    },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
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

function Info({ label, value }) {
    return (
        <div className="min-w-0 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100">
            <p className="text-[11px] font-medium text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-700" title={value || ''}>
                {value || '-'}
            </p>
        </div>
    );
}

export default function MachineUnitsModal({ typeId, onClose }) {
    const [type, setType] = useState(null);
    const [machines, setMachines] = useState([]);
    const [selected, setSelected] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let batal = false;
        setLoading(true);
        setError('');

        axios
            .get(`/machines/type/${typeId}/units`)
            .then(({ data }) => {
                if (batal) return;
                setType(data.type);
                setMachines(data.machines);
                setSelected(data.machines.map((m) => m.id));
            })
            .catch(() => !batal && setError('Gagal memuat data unit.'))
            .finally(() => !batal && setLoading(false));

        return () => {
            batal = true;
        };
    }, [typeId]);

    // tutup dengan tombol Esc
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const tampil = useMemo(() => {
        const s = q.trim().toLowerCase();
        return s ? machines.filter((m) => m.no_kontrol.toLowerCase().includes(s)) : machines;
    }, [machines, q]);

    const semuaTampilTerpilih = tampil.length > 0 && tampil.every((m) => selected.includes(m.id));
    const persen = machines.length ? Math.round((selected.length / machines.length) * 100) : 0;

    const toggle = (id) =>
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const toggleTampil = () => {
        const ids = tampil.map((m) => m.id);
        setSelected((s) =>
            semuaTampilTerpilih ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])]
        );
    };

    // buka halaman cetak di tab baru supaya pop up tetap terbuka
    const print = () => {
        const params = new URLSearchParams();

        if (selected.length === machines.length) {
            params.set('type_id', typeId); // semua unit: URL pendek
        } else {
            selected.forEach((id) => params.append('ids[]', id));
        }

        window.open(`/machines/print-barcodes?${params.toString()}`, '_blank');
    };

    return (
        <div
            className="idx-fade fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <style>{`
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxCheck { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.18); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes idxPulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-check { animation: idxCheck .3s cubic-bezier(.22,1,.36,1) both; }
                .idx-skel { animation: idxPulse 1.4s ease-in-out infinite; }
                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                @media (prefers-reduced-motion: reduce) { .idx-fade, .idx-pop, .idx-check, .idx-skel { animation: none !important; } }
            `}</style>

            <div className="idx-pop flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                            <Icon type="qr" className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-slate-900">
                                {type ? `${type.nama_alat}${type.merk ? ` — ${type.merk}` : ''}` : 'Memuat…'}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">Daftar unit dan cetak QR</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                <div className="idx-scroll space-y-4 overflow-y-auto bg-slate-50/60 px-6 py-5">
                    {/* LOADING SKELETON */}
                    {loading && (
                        <div className="idx-skel space-y-4">
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-14 rounded-xl bg-slate-200/70" />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-10 rounded-xl bg-slate-200/70" />
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center py-12 text-center">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                <Icon type="alert" className="h-7 w-7" />
                            </div>
                            <p className="font-semibold text-slate-700">{error}</p>
                            <p className="mt-1 text-sm text-slate-400">Tutup lalu coba buka lagi.</p>
                        </div>
                    )}

                    {!loading && !error && type && (
                        <>
                            {/* INFO */}
                            <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-100 bg-slate-100/60 p-3 md:grid-cols-4">
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

                            {/* TOOLBAR UNIT */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-800">Daftar Unit</h3>
                                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                                {machines.length} unit
                                            </span>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                                                {selected.length} dipilih
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                                style={{ width: `${persen}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {machines.length > 12 && (
                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Icon type="search" className="h-4 w-4" />
                                                </span>
                                                <input
                                                    type="text"
                                                    value={q}
                                                    onChange={(e) => setQ(e.target.value)}
                                                    placeholder="Cari no. unit…"
                                                    className="h-9 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={toggleTampil}
                                            className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
                                        >
                                            {semuaTampilTerpilih ? 'Kosongkan' : 'Pilih semua'}
                                        </button>
                                    </div>
                                </div>

                                {/* GRID UNIT */}
                                <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                                    {tampil.map((m) => {
                                        const on = selected.includes(m.id);

                                        return (
                                            <label
                                                key={m.id}
                                                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                                    on
                                                        ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <input type="checkbox" checked={on} onChange={() => toggle(m.id)} className="sr-only" />
                                                <span
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                                                        on
                                                            ? 'border-blue-600 bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                                            : 'border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    {on && <Icon type="check" className="idx-check h-3.5 w-3.5" />}
                                                </span>
                                                <span className="truncate" title={m.no_kontrol}>{m.no_kontrol}</span>
                                            </label>
                                        );
                                    })}

                                    {tampil.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center py-8 text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Icon type="qr" className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">Tidak ada unit</p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {q ? 'Tidak ada yang cocok dengan pencarian.' : 'Jenis mesin ini belum punya unit.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={print}
                        disabled={loading || selected.length === 0}
                        className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                        <Icon type="print" className="relative h-4 w-4" />
                        <span className="relative">Print QR ({selected.length})</span>
                    </button>
                </div>
            </div>
        </div>
    );
}