import React, { useEffect, useState } from 'react';
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

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    upload: { sw: 2, paths: ['M12 16V4m0 0 4 4m-4-4-4 4', 'M5 20h14'] },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    refresh: { sw: 2, paths: ['M20 11a8 8 0 10-2.3 5.7', 'M20 4v7h-7'] },
    table: { paths: ['M3.5 5.5h17v13h-17z', 'M3.5 10h17M9 5.5v13'] },
    link: {
        paths: [
            'M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1',
            'M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1',
        ],
    },
    eye: {
        paths: [
            'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
            'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
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

function Section({ icon, title, hint, tone = 'blue', children, right }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
                        <Icon type={icon} className="h-4 w-4" />
                    </span>
                    <div>
                        <h3 className="text-sm font-bold leading-tight text-slate-800">{title}</h3>
                        {hint && <p className="text-[11px] leading-tight text-slate-400">{hint}</p>}
                    </div>
                </div>
                {right}
            </div>
            {children}
        </section>
    );
}

const selectBase =
    'h-10 w-full cursor-pointer rounded-xl border bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:bg-white focus:ring-4';

const numInput =
    'h-10 w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

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

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && !saving && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [saving, onClose]);

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

    const isEmpty = (v) => v === null || v === undefined;
    const missing = info.fields.filter((f) => f.required && isEmpty(mapping[f.key]));

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

    const mappedFields = info.fields.filter((f) => !isEmpty(mapping[f.key]));
    const start = Number(dataStart) - 1;
    const sampleRows = info.rows.slice(start, start + 6);
    const rawRows = info.rows.slice(0, 12);
    const jumlahData = Math.max(info.total_rows - start, 0);

    return (
        <div className="idx-fade fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
            <style>{`
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxSpin { to { transform: rotate(360deg); } }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-spin { animation: idxSpin .8s linear infinite; }
                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                @media (prefers-reduced-motion: reduce) { .idx-fade, .idx-pop { animation: none !important; } }
            `}</style>

            <div className="idx-pop flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 text-violet-600">
                            <Icon type="upload" className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Import Excel — Pemetaan Kolom</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Kolom sudah ditebak otomatis. Cek, koreksi kalau perlu, lalu Import.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Tutup"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                <div className="idx-scroll space-y-4 overflow-y-auto bg-slate-50/60 px-6 py-5">
                    {/* RINGKASAN */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total baris', value: info.total_rows, tone: 'text-blue-600 bg-blue-50' },
                            { label: 'Baris data', value: jumlahData, tone: 'text-violet-600 bg-violet-50' },
                            { label: 'Kolom dipetakan', value: `${mappedFields.length}/${info.fields.length}`, tone: 'text-emerald-600 bg-emerald-50' },
                        ].map((s) => (
                            <div key={s.label} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
                                <p className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-lg font-bold ${s.tone}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* BARIS HEADER & DATA */}
                    <Section icon="table" title="Baris header & data" hint={`Nomor baris sama dengan nomor baris di Excel (total ${info.total_rows} baris)`}>
                        <div className="flex flex-wrap items-end gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-slate-500">Baris header</span>
                                <input type="number" min="1" value={headerRow}
                                    onChange={(e) => setHeaderRow(e.target.value)} className={numInput} />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-slate-500">Data mulai baris</span>
                                <input type="number" min="1" value={dataStart}
                                    onChange={(e) => setDataStart(e.target.value)} className={numInput} />
                            </label>
                            <button
                                type="button"
                                onClick={reload}
                                disabled={loading}
                                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <span className="idx-spin h-4 w-4 rounded-full border-2 border-slate-200 border-t-slate-600" />
                                ) : (
                                    <Icon type="refresh" className="h-4 w-4" />
                                )}
                                {loading ? 'Memuat…' : 'Terapkan & tebak ulang'}
                            </button>
                        </div>
                    </Section>

                    {/* ISI FILE */}
                    <details className="group rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 text-sm font-bold text-slate-700 [&::-webkit-details-marker]:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <Icon type="eye" className="h-4 w-4" />
                            </span>
                            Lihat isi file (12 baris pertama)
                            <span className="ml-auto text-xs font-medium text-slate-400 transition-transform duration-200 group-open:rotate-180">▾</span>
                        </summary>
                        <div className="idx-scroll overflow-x-auto border-t border-slate-100">
                            <table className="w-full border-separate border-spacing-0 text-[11px]">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-500">
                                        <th className="px-2 py-1.5">#</th>
                                        {labels.map((_, c) => (
                                            <th key={c} className="px-2 py-1.5 font-semibold">{letter(c)}</th>
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
                                            <td className="border-t border-slate-100 px-2 py-1.5 text-slate-400">{r + 1}</td>
                                            {labels.map((_, c) => (
                                                <td key={c} className="whitespace-nowrap border-t border-slate-100 px-2 py-1.5 text-slate-600">
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
                    <Section icon="link" tone="violet" title="Pemetaan kolom" hint="Pilih kolom Excel untuk tiap data mesin">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {info.fields.map((f) => {
                                const kosong = isEmpty(mapping[f.key]);
                                const bad = f.required && kosong;

                                return (
                                    <label key={f.key} className="flex flex-col gap-1">
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                            {f.label} {f.required && <span className="text-red-500">*</span>}
                                            {!kosong && (
                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                    <Icon type="check" className="h-3 w-3" />
                                                </span>
                                            )}
                                        </span>
                                        <select
                                            value={mapping[f.key] ?? ''}
                                            onChange={(e) => setField(f.key, e.target.value)}
                                            className={`${selectBase} ${
                                                bad
                                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                                                    : kosong
                                                    ? 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                                                    : 'border-emerald-300 bg-emerald-50/50 focus:border-emerald-500 focus:ring-emerald-500/10'
                                            }`}
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

                        <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
                            <input
                                type="checkbox"
                                checked={fillDown}
                                onChange={(e) => setFillDown(e.target.checked)}
                                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                            />
                            <span>
                                <b>Panel Monitor KWH:</b> sel kosong diisi dari baris di atasnya (untuk sel yang di-merge di Excel).
                            </span>
                        </label>
                    </Section>

                    {/* PREVIEW */}
                    <Section icon="table" tone="emerald" title="Preview hasil" hint="6 baris pertama sesuai pemetaan">
                        <div className="idx-scroll overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full border-separate border-spacing-0 text-[11px]">
                                <thead className="text-white">
                                    <tr>
                                        {mappedFields.map((f) => (
                                            <th
                                                key={f.key}
                                                className="whitespace-nowrap border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-3 py-2.5 text-left font-semibold last:border-r-0"
                                            >
                                                {f.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleRows.length === 0 && (
                                        <tr>
                                            <td colSpan={Math.max(mappedFields.length, 1)} className="px-3 py-6 text-center text-slate-400">
                                                Belum ada data untuk ditampilkan.
                                            </td>
                                        </tr>
                                    )}
                                    {sampleRows.map((row, r) => (
                                        <tr key={r} className="even:bg-slate-50/60">
                                            {mappedFields.map((f) => (
                                                <td key={f.key} className="whitespace-nowrap border-t border-slate-100 px-3 py-2 text-slate-600">
                                                    {row[mapping[f.key]] ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {missing.length > 0 && (
                        <div className="idx-pop flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                            <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                            Pilih dulu kolom: {missing.map((m) => m.label).join(', ')}.
                        </div>
                    )}
                    {error && (
                        <div className="idx-pop flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                            <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={missing.length > 0 || saving}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {saving && <span className="idx-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />}
                        {saving ? 'Mengimpor…' : 'Import Sekarang'}
                    </button>
                </div>
            </div>
        </div>
    );
}