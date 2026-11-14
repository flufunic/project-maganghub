import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

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

    const semuaTampilTerpilih =
        tampil.length > 0 && tampil.every((m) => selected.includes(m.id));

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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#030a26]/60 px-4 py-6 backdrop-blur-md"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-slate-900">
                            {type ? `${type.nama_alat}${type.merk ? ` — ${type.merk}` : ''}` : 'Memuat…'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">Daftar unit dan cetak QR</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 overflow-y-auto px-6 py-5">
                    {loading && <p className="py-10 text-center text-sm text-slate-400">Memuat data…</p>}
                    {error && <p className="py-10 text-center text-sm font-semibold text-red-600">{error}</p>}

                    {!loading && !error && type && (
                        <>
                            {/* INFO */}
                            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-4">
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
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-800">Daftar Unit</h3>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                                        {machines.length} unit
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                        {selected.length} dipilih
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {machines.length > 12 && (
                                        <input
                                            type="text"
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            placeholder="Cari no. unit…"
                                            className="h-9 w-40 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={toggleTampil}
                                        className="h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        {semuaTampilTerpilih ? 'Kosongkan' : 'Pilih semua'}
                                    </button>
                                </div>
                            </div>

                            {/* GRID UNIT */}
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                                {tampil.map((m) => {
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
                                                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600"
                                            />
                                            <span className="truncate" title={m.no_kontrol}>
                                                {m.no_kontrol}
                                            </span>
                                        </label>
                                    );
                                })}

                                {tampil.length === 0 && (
                                    <p className="col-span-full py-6 text-center text-sm text-slate-400">
                                        Tidak ada unit.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={print}
                        disabled={loading || selected.length === 0}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Print QR ({selected.length})
                    </button>
                </div>
            </div>
        </div>
    );
}