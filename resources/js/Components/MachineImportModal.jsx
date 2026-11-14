import React, { useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

const letter = (i) => {
    let n = i + 1;
    let s = '';
    while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
};

const selectClass =
    'h-9 w-full cursor-pointer rounded-lg border bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function MachineImportModal({ initial, onClose }) {
    const [info, setInfo] = useState(initial);
    const [mapping, setMapping] = useState(initial.mapping);
    const [headerRow, setHeaderRow] = useState(initial.header_row);
    const [dataStart, setDataStart] = useState(initial.data_start);
    const [fillDown, setFillDown] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const labels = info.labels;

    // Hitung ulang label & tebakan pemetaan setelah baris header / data diubah
    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/machines/import/preview', {
                token: info.token,
                header_row: Number(headerRow),
                data_start: Number(dataStart),
            });
            setInfo(data);
            setMapping(data.mapping);
        } catch (e) {
            setError(e.response?.data?.message || 'Gagal membaca ulang file.');
        } finally {
            setLoading(false);
        }
    };

    const setField = (key, v) =>
        setMapping((m) => ({ ...m, [key]: v === '' ? null : Number(v) }));

    const missing = info.fields.filter((f) => f.required && (mapping[f.key] === null || mapping[f.key] === undefined));

    const submit = () => {
        setSaving(true);
        setError('');

        router.post(
            '/machines/import',
            {
                token: info.token,
                data_start: Number(dataStart),
                mapping,
                fill_down: fillDown,
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (errs) => setError(Object.values(errs)[0] || 'Import gagal.'),
                onFinish: () => setSaving(false),
            }
        );
    };

    const mappedFields = info.fields.filter((f) => mapping[f.key] !== null && mapping[f.key] !== undefined);
    const start = Number(dataStart) - 1;
    const sampleRows = info.rows.slice(start, start + 6);
    const rawRows = info.rows.slice(0, 12);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#030a26]/60 px-4 py-6 backdrop-blur-md">
            <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Import Excel — Pemetaan Kolom</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Kolom sudah ditebak otomatis. Cek, koreksi kalau perlu, lalu Import.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 overflow-y-auto px-6 py-5">
                    {/* BARIS HEADER & DATA */}
                    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-3">
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baris header</span>
                            <input
                                type="number"
                                min="1"
                                value={headerRow}
                                onChange={(e) => setHeaderRow(e.target.value)}
                                className="h-9 w-24 rounded-lg border border-slate-300 px-2 text-xs font-semibold"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data mulai baris</span>
                            <input
                                type="number"
                                min="1"
                                value={dataStart}
                                onChange={(e) => setDataStart(e.target.value)}
                                className="h-9 w-24 rounded-lg border border-slate-300 px-2 text-xs font-semibold"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={reload}
                            disabled={loading}
                            className="h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            {loading ? 'Memuat…' : 'Terapkan & tebak ulang'}
                        </button>
                        <p className="text-[11px] text-slate-500">
                            Nomor baris sama dengan nomor baris di Excel. Total {info.total_rows} baris.
                        </p>
                    </div>

                    {/* ISI FILE */}
                    <details className="rounded-xl border border-slate-200">
                        <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-slate-600">
                            Lihat isi file (12 baris pertama)
                        </summary>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-500">
                                        <th className="px-2 py-1">#</th>
                                        {labels.map((_, c) => (
                                            <th key={c} className="px-2 py-1">{letter(c)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawRows.map((row, r) => (
                                        <tr
                                            key={r}
                                            className={
                                                r + 1 === Number(headerRow)
                                                    ? 'bg-blue-50 font-bold'
                                                    : r + 1 === Number(dataStart)
                                                    ? 'bg-emerald-50'
                                                    : ''
                                            }
                                        >
                                            <td className="border-t border-slate-100 px-2 py-1 text-slate-400">{r + 1}</td>
                                            {labels.map((_, c) => (
                                                <td key={c} className="whitespace-nowrap border-t border-slate-100 px-2 py-1 text-slate-600">
                                                    {row[c] ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>

                    {/* PEMETAAN */}
                    <div>
                        <h3 className="mb-2 text-sm font-bold text-slate-800">Pemetaan kolom</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {info.fields.map((f) => {
                                const bad = f.required && (mapping[f.key] === null || mapping[f.key] === undefined);

                                return (
                                    <label key={f.key} className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {f.label} {f.required && <span className="text-red-500">*</span>}
                                        </span>
                                        <select
                                            value={mapping[f.key] ?? ''}
                                            onChange={(e) => setField(f.key, e.target.value)}
                                            className={`${selectClass} ${bad ? 'border-red-400' : 'border-slate-300'}`}
                                        >
                                            <option value="">— tidak dipakai —</option>
                                            {labels.map((l, i) => (
                                                <option key={i} value={i}>
                                                    {letter(i)} — {l || '(kosong)'}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                );
                            })}
                        </div>

                        <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-slate-600">
                            <input
                                type="checkbox"
                                checked={fillDown}
                                onChange={(e) => setFillDown(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                            <span>
                                <b>Panel Monitor KWH:</b> sel kosong diisi dari baris di atasnya (untuk sel yang di-merge di Excel).
                            </span>
                        </label>
                    </div>

                    {/* PREVIEW */}
                    <div>
                        <h3 className="mb-2 text-sm font-bold text-slate-800">Preview hasil (6 baris pertama)</h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-[11px]">
                                <thead className="bg-[#0a1a4d] text-white">
                                    <tr>
                                        {mappedFields.map((f) => (
                                            <th key={f.key} className="whitespace-nowrap px-2 py-2 text-left font-bold">
                                                {f.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleRows.map((row, r) => (
                                        <tr key={r} className="border-t border-slate-100">
                                            {mappedFields.map((f) => (
                                                <td key={f.key} className="whitespace-nowrap px-2 py-1.5 text-slate-600">
                                                    {row[mapping[f.key]] ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {missing.length > 0 && (
                        <p className="text-xs font-semibold text-red-600">
                            Pilih dulu kolom: {missing.map((m) => m.label).join(', ')}.
                        </p>
                    )}
                    {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={missing.length > 0 || saving}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Mengimpor…' : 'Import Sekarang'}
                    </button>
                </div>
            </div>
        </div>
    );
}