import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

const parseKodes = (text) =>
    String(text ?? '')
        .split(/[\s,;]+/)
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean);

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm uppercase text-slate-700 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50';

export default function ImportExcelModal({ items = [], onClose }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [data, setData] = useState(null); // hasil baca Excel
    const [mapping, setMapping] = useState({}); // kode Excel => "E, O"
    const [tahuns, setTahuns] = useState([]); // tahun yang ikut diimpor
    const [timpa, setTimpa] = useState(false);

    const kodeWeb = useMemo(() => new Set(items.map((i) => i.kode)), [items]);

    /* ---------------- langkah 1: baca Excel ---------------- */
    const bacaFile = async () => {
        if (!file) return;

        setError('');
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('file', file);

            const res = await axios.post('/schedule-preventif/import/preview', fd, {
                headers: { Accept: 'application/json' },
            });

            setData(res.data);
            setTahuns(res.data.tahuns);
            setMapping(Object.fromEntries(res.data.kodes.map((k) => [k.kode, ''])));
        } catch (e) {
            setError(
                e.response?.data?.errors?.file?.[0] ??
                    e.response?.data?.message ??
                    'File tidak bisa dibaca.'
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- validasi pemetaan di layar ---------------- */
    const kodeSalah = (kodeExcel) =>
        parseKodes(mapping[kodeExcel]).filter((k) => !kodeWeb.has(k));

    const adaSalah = data ? data.kodes.some((k) => kodeSalah(k.kode).length > 0) : false;

    const jumlahTerpetakan = data
        ? data.kodes.filter((k) => parseKodes(mapping[k.kode]).length > 0).length
        : 0;

    const jumlahSel = data
        ? data.cells.filter(
              (c) => tahuns.includes(c[1]) && parseKodes(mapping[c[4]]).length > 0
          ).length
        : 0;

    const toggleTahun = (t) =>
        setTahuns((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

    /* ---------------- langkah 2: simpan ---------------- */
    const simpan = () => {
        if (!data || adaSalah || jumlahSel === 0) return;

        setError('');
        setSaving(true);

        router.post(
            '/schedule-preventif/import',
            {
                lines: data.lines,
                cells: data.cells.filter((c) => tahuns.includes(c[1])),
                mapping: Object.fromEntries(
                    Object.entries(mapping).map(([kode, teks]) => [kode, parseKodes(teks)])
                ),
                timpa,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onClose(),
                onError: (errs) => setError(Object.values(errs)[0] ?? 'Import gagal.'),
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Import Plan dari Excel</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Hanya baris Plan yang dibaca. Baris Aktual diabaikan.
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

                {/* ISI */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* LANGKAH 1 */}
                    <p className="mb-2 text-sm font-semibold text-slate-700">1. Pilih file Excel</p>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                setFile(e.target.files?.[0] ?? null);
                                setData(null);
                                setError('');
                            }}
                            className="block min-w-0 flex-1 cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-600 hover:file:bg-blue-100"
                        />

                        <button
                            type="button"
                            onClick={bacaFile}
                            disabled={!file || loading}
                            className="cursor-pointer rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Membaca...' : 'Baca file'}
                        </button>
                    </div>

                    {/* LANGKAH 2 */}
                    {data && (
                        <>
                            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                                Terbaca <b className="text-slate-800">{data.lines.length} line</b>,{' '}
                                <b className="text-slate-800">{data.cells.length} isian Plan</b>,{' '}
                                <b className="text-slate-800">{data.kodes.length} kode Excel</b>.
                                <span className="mt-1 block text-slate-400">
                                    Line: {data.lines.join(', ')}
                                </span>
                            </div>

                            <p className="mb-1 mt-5 text-sm font-semibold text-slate-700">
                                2. Pilih tahun yang diimpor
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {data.tahuns.map((t) => (
                                    <label key={t} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={tahuns.includes(t)}
                                            onChange={() => toggleTahun(t)}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>

                            <p className="mb-1 mt-5 text-sm font-semibold text-slate-700">
                                3. Petakan kode Excel ke kode web
                            </p>
                            <p className="mb-3 text-xs text-slate-400">
                                Isi kode web (boleh lebih dari satu, pisahkan dengan koma, contoh: E, O). Kosongkan kalau kode itu tidak mau diimpor.
                            </p>

                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-500">
                                            <th className="w-20 px-3 py-2 text-center font-bold">Excel</th>
                                            <th className="px-3 py-2 text-left font-bold">Pekerjaan di Excel</th>
                                            <th className="w-16 px-3 py-2 text-center font-bold">Sel</th>
                                            <th className="w-44 px-3 py-2 text-left font-bold">Kode web</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.kodes.map((k) => {
                                            const salah = kodeSalah(k.kode);

                                            return (
                                                <tr key={k.kode} className="border-t border-slate-100">
                                                    <td className="px-3 py-2 text-center font-extrabold text-slate-800">
                                                        {k.kode}
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-slate-600">
                                                        {k.pekerjaan || <span className="text-slate-300">tidak ada di legenda</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-xs text-slate-500">{k.jumlah}</td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            value={mapping[k.kode] ?? ''}
                                                            onChange={(e) =>
                                                                setMapping({ ...mapping, [k.kode]: e.target.value })
                                                            }
                                                            placeholder="contoh: E, O"
                                                            className={`${inputClass} ${salah.length ? 'border-red-300 bg-red-50' : ''}`}
                                                        />
                                                        {salah.length > 0 && (
                                                            <p className="mt-1 text-[11px] font-medium text-red-500">
                                                                Tidak ada: {salah.join(', ')}
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <details className="mt-3">
                                <summary className="cursor-pointer text-xs font-semibold text-blue-600">
                                    Lihat daftar kode dan item di web
                                </summary>

                                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                                    {items.map((item) => (
                                        <div key={item.no}>
                                            <b className="text-slate-800">{item.kode}</b> = {item.item_preventif}{' '}
                                            <span className="text-slate-400">({item.divisi}, {item.frekuensi})</span>
                                        </div>
                                    ))}
                                </div>
                            </details>

                            <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={timpa}
                                    onChange={(e) => setTimpa(e.target.checked)}
                                    className="mt-1"
                                />
                                <span>
                                    Timpa sel yang sudah ada isinya
                                    <span className="block text-xs text-slate-400">
                                        Kalau tidak dicentang, sel yang sudah terisi di web dilewati.
                                    </span>
                                </span>
                            </label>
                        </>
                    )}

                    {error && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <p className="text-xs text-slate-500">
                        {data
                            ? `${jumlahTerpetakan} dari ${data.kodes.length} kode dipetakan · ${jumlahSel} isian akan diproses`
                            : ''}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={simpan}
                            disabled={!data || saving || adaSalah || jumlahSel === 0}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Menyimpan...' : 'Import'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
