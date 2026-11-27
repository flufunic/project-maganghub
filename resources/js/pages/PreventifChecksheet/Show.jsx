import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';

const BASE = '/checksheet-preventif';

const BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const AKSI = [
    { key: 'periksa', label: 'Periksa', warna: 'border-blue-300 bg-blue-50 text-blue-700' },
    { key: 'bersihkan', label: 'Bersihkan', warna: 'border-cyan-300 bg-cyan-50 text-cyan-700' },
    { key: 'lubrikasi', label: 'Lubrikasi', warna: 'border-amber-300 bg-amber-50 text-amber-700' },
    { key: 'ganti', label: 'Ganti', warna: 'border-violet-300 bg-violet-50 text-violet-700' },
    { key: 'perbaiki', label: 'Perbaiki', warna: 'border-rose-300 bg-rose-50 text-rose-700' },
];

const AKSI_WARNA = Object.fromEntries(AKSI.map((a) => [a.key, a.warna]));

const EMPTY = {};

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const STATUS_STYLE = {
    Open: 'bg-red-50 text-red-600 border-red-200',
    Progress: 'bg-amber-50 text-amber-600 border-amber-200',
    Closed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const KONDISI_STYLE = {
    OK: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    NG: 'border-red-300 bg-red-50 text-red-700',
};

function formatTanggal(value) {
    if (!value) return '-';

    const [y, m, d] = String(value).substring(0, 10).split('-').map(Number);

    return `${String(d).padStart(2, '0')} ${BULAN[m - 1]} ${y}`;
}

/* ---------------- ICONS ---------------- */
const Svg = ({ children, className = 'h-4 w-4' }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {children}
    </svg>
);

const IconEye = () => (
    <Svg>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);

const IconPencil = () => (
    <Svg>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
);

const IconTrash = () => (
    <Svg>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
    </Svg>
);

const IconUpload = () => (
    <Svg>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5" />
        <path d="M12 3v12" />
    </Svg>
);

const IconDownload = () => (
    <Svg>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
    </Svg>
);

const IconBack = () => (
    <Svg>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </Svg>
);

const IconCheck = () => (
    <Svg>
        <path d="M5 12l4 4L19 6" />
    </Svg>
);

const TONE = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white',
    slate: 'bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white',
    red: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
};

function IconBtn({ title, tone = 'blue', onClick, href, children }) {
    const cls = `inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${TONE[tone]}`;

    if (href) {
        return (
            <a href={href} title={title} aria-label={title} className={cls}>
                {children}
            </a>
        );
    }

    return (
        <button type="button" title={title} aria-label={title} onClick={onClick} className={cls}>
            {children}
        </button>
    );
}

/* ------------------------------------------------------------------
| Radio Kondisi OK / NG. Klik lagi pada pilihan aktif = kosongkan.
------------------------------------------------------------------ */
function KondisiRadio({ name, value, disabled, onPilih }) {
    return (
        <div className="flex items-center justify-center gap-1.5">
            {['OK', 'NG'].map((v) => {
                const aktif = value === v;

                return (
                    <label
                        key={v}
                        className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-bold transition ${
                            aktif
                                ? KONDISI_STYLE[v]
                                : 'border-slate-200 bg-white text-slate-400 hover:border-blue-300'
                        } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={v}
                            checked={aktif}
                            disabled={disabled}
                            onChange={() => {}}
                            onClick={() => onPilih(aktif ? '' : v)}
                            className="h-3 w-3 cursor-pointer accent-current"
                        />
                        {v}
                    </label>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------
| Header form:
| - Hari/tanggal  : otomatis dari tanggal abnormality yang dipilih
| - PIC pelaksana : otomatis dari PIC abnormality
| - Line          : diisi manual, tersimpan saat selesai mengetik
------------------------------------------------------------------ */
function RecordHeader({ record, auto }) {
    const [line, setLine] = useState(record.line ?? '');
    const tersimpan = useRef(record.line ?? '');

    const simpan = () => {
        if (tersimpan.current === line) return;

        tersimpan.current = line;

        router.put(
            `${BASE}/records/${record.id}`,
            { line },
            { preserveScroll: true, preserveState: true, only: ['records', 'flash'] }
        );
    };

    const pic = auto?.pic || record.pic_pelaksana || '';

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-400">Hari / tanggal</span>
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2 text-sm font-semibold text-blue-800">
                    {auto?.tanggal_format || (
                        <span className="font-normal text-slate-400">Belum ada abnormality</span>
                    )}
                </div>
            </div>

            <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-400">Line</span>
                <input
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    onBlur={simpan}
                    className={inputClass}
                />
            </label>

            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-400">PIC pelaksana (otomatis dari PIC abnormality)</span>
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2 text-sm font-semibold text-blue-800">
                    {pic || <span className="font-normal text-slate-400">PIC abnormality belum diisi</span>}
                </div>
            </div>
        </div>
    );
}

/* Keterangan (per tanggal): tersimpan saat kehilangan fokus */
function KeteranganInput({ recordId, itemId, tanggal, value }) {
    const [text, setText] = useState(value ?? '');

    useEffect(() => setText(value ?? ''), [value]);

    const simpan = () => {
        if (!tanggal || (value ?? '') === text) return;

        router.put(
            `${BASE}/records/${recordId}/hasil`,
            { item_id: itemId, tanggal, keterangan: text },
            { preserveScroll: true, preserveState: true, only: ['results'] }
        );
    };

    return (
        <input
            value={text}
            disabled={!tanggal}
            onChange={(e) => setText(e.target.value)}
            onBlur={simpan}
            placeholder="Keterangan"
            className="w-full min-w-[160px] rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-xs text-slate-700 outline-none transition hover:border-slate-200 focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        />
    );
}

/* ------------------------------------------------------------------
| Modal Inspection Point (ada konfirmasi simpan / edit)
------------------------------------------------------------------ */
function ItemModal({ checksheetId, item, sembunyi, onMinta, onClose }) {
    const [form, setForm] = useState({
        inspection_point: item?.inspection_point ?? '',
        standar: item?.standar ?? '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const kirim = () => {
        setSaving(true);

        const opsi = {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (err) => setErrors(err),
            onFinish: () => setSaving(false),
        };

        if (item) {
            router.put(`${BASE}/${checksheetId}/items/${item.id}`, form, opsi);
        } else {
            router.post(`${BASE}/${checksheetId}/items`, form, opsi);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        onMinta({
            title: item ? 'Konfirmasi edit' : 'Konfirmasi simpan',
            message: item
                ? `Perubahan pada inspection point "${form.inspection_point}" akan disimpan. Lanjutkan?`
                : `Inspection point "${form.inspection_point}" akan ditambahkan. Lanjutkan?`,
            confirmLabel: item ? 'Ya, Simpan Perubahan' : 'Ya, Simpan',
            onConfirm: kirim,
        });
    };

    return (
        <div
            style={{ display: sembunyi ? 'none' : undefined }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        >
            <form
                onSubmit={submit}
                className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-base font-bold text-slate-900">
                        {item ? 'Edit Inspection Point' : 'Tambah Inspection Point'}
                    </h2>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Inspection Point</span>
                        <input
                            value={form.inspection_point}
                            onChange={(e) => setForm({ ...form, inspection_point: e.target.value })}
                            className={inputClass}
                            required
                            autoFocus
                        />
                        {errors.inspection_point && (
                            <span className="text-xs text-red-500">{errors.inspection_point}</span>
                        )}
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Standar</span>
                        <input
                            value={form.standar}
                            onChange={(e) => setForm({ ...form, standar: e.target.value })}
                            className={inputClass}
                            placeholder="mis. Tidak oblak"
                        />
                    </label>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ------------------------------------------------------------------
| Modal Import Excel hasil pengisian PER BULAN
------------------------------------------------------------------ */
function ImportBulanModal({ checksheetId, bulanAwal, tahunAwal, sembunyi, onMinta, onClose }) {
    const [bulan, setBulan] = useState(bulanAwal);
    const [tahun, setTahun] = useState(tahunAwal);
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const kirim = () => {
        setSaving(true);

        router.post(
            `${BASE}/${checksheetId}/import-bulan`,
            { bulan, tahun, file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (err) => setErrors(err),
                onFinish: () => setSaving(false),
            }
        );
    };

    const submit = (e) => {
        e.preventDefault();

        onMinta({
            title: 'Konfirmasi import',
            message: `Hasil pengisian ${BULAN[bulan - 1]} ${tahun} akan diisi dari file "${file?.name}". Isian bulan itu yang sudah ada pada tanggal/baris yang sama akan ditimpa. Lanjutkan?`,
            confirmLabel: 'Ya, Import',
            onConfirm: kirim,
        });
    };

    return (
        <div
            style={{ display: sembunyi ? 'none' : undefined }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        >
            <form
                onSubmit={submit}
                className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-base font-bold text-slate-900">Import Pengisian dari Excel</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Satu file = satu bulan pengisian.</p>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-600">Bulan</span>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(Number(e.target.value))}
                                className={`${selectClass} h-10 w-full`}
                            >
                                {BULAN.map((b, i) => (
                                    <option key={b} value={i + 1}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-600">Tahun</span>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(Number(e.target.value))}
                                className={`${selectClass} h-10 w-full`}
                            >
                                {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">File Excel (.xlsx / .xls)</span>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
                        />
                        {errors.file && <span className="text-xs text-red-500">{errors.file}</span>}
                        {errors.bulan && <span className="text-xs text-red-500">{errors.bulan}</span>}
                    </label>

                    <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
                        <p className="font-semibold text-slate-600">Format file yang dibaca:</p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4">
                            <li>
                                Baris judul berisi kolom <b>Inspection Point</b>, angka tanggal <b>1–31</b>, <b>Kondisi</b>{' '}
                                dan (opsional) <b>Keterangan</b>.
                            </li>
                            <li>
                                Isi sel tanggal: <b>Periksa, Bersihkan, Lubrikasi, Ganti,</b> atau <b>Perbaiki</b>.
                            </li>
                            <li>
                                Kondisi: <b>OK</b> atau <b>NG</b>. Baris dicocokkan lewat nama Inspection Point.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !file}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Mengimpor...' : 'Import'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ------------------------------------------------------------------
| Riwayat pengisian per bulan
------------------------------------------------------------------ */
function Riwayat({ checksheetId, riwayat, bulan, tahun, onLihat, onHapus, onImport }) {
    const urlExport = (b, t) => `${BASE}/${checksheetId}/export-bulan?bulan=${b}&tahun=${t}`;

    return (
        <section className={`overflow-hidden ${card}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                    <h2 className="text-sm font-bold text-slate-900">Riwayat Pengisian</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Satu baris = satu bulan pengisian.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={urlExport(bulan, tahun)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                        <IconDownload />
                        Export {BULAN[bulan - 1]} {tahun}
                    </a>
                    <button
                        type="button"
                        onClick={onImport}
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                        <IconUpload />
                        Import Excel
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-xs font-semibold text-slate-500">
                            <th className="px-5 py-2.5 text-left">Periode</th>
                            <th className="px-4 py-2.5 text-center">Aksi terisi</th>
                            <th className="px-4 py-2.5 text-center">OK</th>
                            <th className="px-4 py-2.5 text-center">NG</th>
                            <th className="px-4 py-2.5 text-left">PIC</th>
                            <th className="px-4 py-2.5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riwayat.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                    Belum ada riwayat pengisian.
                                </td>
                            </tr>
                        )}

                        {riwayat.map((r) => {
                            const aktif = r.bulan === bulan && r.tahun === tahun;

                            return (
                                <tr key={r.id} className={aktif ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                                    <td className="border-t border-slate-100 px-5 py-3 font-semibold text-slate-700">
                                        {BULAN[r.bulan - 1]} {r.tahun}
                                        {aktif && (
                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                                Dilihat
                                            </span>
                                        )}
                                    </td>
                                    <td className="border-t border-slate-100 px-4 py-3 text-center text-slate-600">
                                        {r.jumlah_aksi}
                                    </td>
                                    <td className="border-t border-slate-100 px-4 py-3 text-center font-semibold text-emerald-600">
                                        {r.ok}
                                    </td>
                                    <td className="border-t border-slate-100 px-4 py-3 text-center font-semibold text-red-600">
                                        {r.ng}
                                    </td>
                                    <td className="border-t border-slate-100 px-4 py-3 text-slate-500">
                                        {r.pic_pelaksana || '-'}
                                    </td>
                                    <td className="border-t border-slate-100 px-4 py-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <IconBtn title="Lihat bulan ini" onClick={() => onLihat(r)}>
                                                <IconEye />
                                            </IconBtn>
                                            <IconBtn title="Export Excel bulan ini" tone="slate" href={urlExport(r.bulan, r.tahun)}>
                                                <IconDownload />
                                            </IconBtn>
                                            <IconBtn title="Hapus pengisian bulan ini" tone="red" onClick={() => onHapus(r)}>
                                                <IconTrash />
                                            </IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------
| Kartu abnormality: satu kartu = satu abnormality dari Check Sheet Prediktif.
| Status diubah lewat tombol Closed per tanggal; countermeasure & PIC tersimpan otomatis.
------------------------------------------------------------------ */
function AbnormalityCard({ checksheetId, a, highlight, aktif }) {
    const ambil = () => ({ countermeasure: a.countermeasure ?? '', pic: a.pic ?? '' });

    const [form, setForm] = useState(ambil);
    const [catatan, setCatatan] = useState('');
    const tersimpan = useRef(form);

    useEffect(() => {
        const baru = ambil();

        setForm(baru);
        tersimpan.current = baru;
    }, [a.countermeasure, a.pic]);

    const simpan = () => {
        if (JSON.stringify(tersimpan.current) === JSON.stringify(form)) return;

        tersimpan.current = form;

        router.put(`${BASE}/${checksheetId}/abnormalities/${a.id}`, form, {
            preserveScroll: true,
            preserveState: true,
            only: ['abnormalities', 'tanggalList', 'headerOtomatis', 'records', 'riwayat', 'flash'],
        });
    };

    const tambahCatatan = () => {
        if (!catatan.trim()) return;

        router.post(
            `${BASE}/${checksheetId}/abnormalities/${a.id}/catatan`,
            { catatan },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['abnormalities', 'tanggalList', 'flash'],
                onSuccess: () => setCatatan(''),
            }
        );
    };

    return (
        <div
            id={`abn-${a.id}`}
            className={`rounded-2xl border p-4 transition-shadow ${
                highlight
                    ? 'border-amber-300 bg-amber-50/60 ring-4 ring-amber-200/60'
                    : aktif
                      ? 'border-blue-300 bg-white ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white'
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">
                        Ditemukan {a.tanggal_format}
                        {a.mesin ? ` · ${a.mesin}` : ''}
                        {a.checksheet ? ` · ${a.checksheet}` : ''}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{a.abnormality}</p>
                    <a
                        href={a.url_checksheet}
                        className="mt-1 inline-block text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                        Lihat di checksheet harian →
                    </a>
                </div>

                <span
                    title="Ubah lewat tombol Closed pada tanggal abnormality"
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_STYLE[a.status]}`}
                >
                    {a.status}
                    {a.status === 'Closed' && a.tanggal_selesai ? ` · ${formatTanggal(a.tanggal_selesai)}` : ''}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[11px] font-medium text-slate-400">Countermeasure</span>
                    <textarea
                        rows={2}
                        value={form.countermeasure}
                        onChange={(e) => setForm({ ...form, countermeasure: e.target.value })}
                        onBlur={simpan}
                        placeholder="Tindakan perbaikan yang dilakukan..."
                        className={`${inputClass} resize-none`}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-slate-400">PIC</span>
                    <input
                        value={form.pic}
                        onChange={(e) => setForm({ ...form, pic: e.target.value })}
                        onBlur={simpan}
                        className={inputClass}
                    />
                </label>
            </div>

            {(a.catatans.length > 0 || a.status !== 'Closed') && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                    {a.catatans.length > 0 && (
                        <ul className="space-y-1.5">
                            {a.catatans.map((c) => (
                                <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-700">{c.catatan}</span>
                                    <span className="ml-2 text-[11px] text-slate-400">
                                        {c.waktu}
                                        {c.oleh ? ` · ${c.oleh}` : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {a.status !== 'Closed' && (
                        <input
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && tambahCatatan()}
                            placeholder="Catatan progress / kendala, tekan Enter (ikut tampil di Check Sheet Prediktif)"
                            className={`${inputClass} ${a.catatans.length > 0 ? 'mt-2' : ''}`}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Show({
    checksheet,
    bulan,
    tahun,
    records = [],
    recordId = null,
    results = EMPTY,
    aksi = EMPTY,
    headerOtomatis = null,
    abnormalities = [],
    tanggalList = [],
    tanggalAktif = null,
    riwayat = [],
    highlightAbnormality = null,
    flash = {},
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [itemModal, setItemModal] = useState(null); // { item } | {}
    const [showImport, setShowImport] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const pesan = flash?.error ?? flash?.success;

        if (!pesan) return undefined;

        setToast({ pesan, error: Boolean(flash?.error) });
        const t = setTimeout(() => setToast(null), 3500);

        return () => clearTimeout(t);
    }, [flash]);

    useEffect(() => {
        if (!highlightAbnormality) return undefined;

        const t = setTimeout(
            () =>
                document
                    .getElementById(`abn-${highlightAbnormality}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
            300
        );

        return () => clearTimeout(t);
    }, [highlightAbnormality]);

    const record = records.find((r) => r.id === recordId) ?? records[0] ?? null;

    const ganti = (params) =>
        router.get(`${BASE}/${checksheet.id}`, { bulan, tahun, ...params }, { preserveScroll: true, replace: true });

    // ---------- kolom per tanggal ----------
    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    const hari = Array.from({ length: jumlahHari }, (_, i) => i + 1);
    const minggu = Array.from({ length: Math.ceil(jumlahHari / 7) }, (_, i) => ({
        nomor: i + 1,
        colSpan: Math.min(7, jumlahHari - i * 7),
    }));

    const tanggalStr = (d) => `${tahun}-${String(bulan).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const akhirPekan = (d) => [0, 6].includes(new Date(tahun, bulan - 1, d).getDay());

    // status abnormality per tanggal: { '2026-11-01': 'Open' | 'Progress' | 'Closed' }
    const statusPerTanggal = Object.fromEntries(tanggalList.map((t) => [t.tanggal, t.status]));
    const statusTgl = (d) => statusPerTanggal[tanggalStr(d)] ?? null;

    const tanggalAktifInfo = tanggalList.find((t) => t.tanggal === tanggalAktif) ?? null;

    // salinan lokal supaya dropdown / radio langsung berubah tanpa menunggu server
    const [aksiLokal, setAksiLokal] = useState(aksi);
    const [kondisiLokal, setKondisiLokal] = useState(results);

    useEffect(() => setAksiLokal(aksi), [aksi]);
    useEffect(() => setKondisiLokal(results), [results]);

    const pilihAksi = (item, d, nilai) => {
        const kunci = `${item.id}-${tanggalStr(d)}`;

        setAksiLokal((cur) => {
            const baru = { ...cur };

            if (nilai) baru[kunci] = nilai;
            else delete baru[kunci];

            return baru;
        });

        router.post(
            `${BASE}/records/${record.id}/aksi`,
            { item_id: item.id, tanggal: tanggalStr(d), aksi: nilai || null },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['aksi', 'riwayat'],
                onError: () => router.reload({ only: ['aksi'] }),
            }
        );
    };

    // Kondisi OK / NG hanya untuk tanggal abnormality yang dipilih (tidak mengubah status)
    const pilihKondisi = (item, nilai) => {
        if (!tanggalAktif) return;

        setKondisiLokal((cur) => ({
            ...cur,
            [`i${item.id}`]: { ...(cur?.[`i${item.id}`] ?? {}), kondisi: nilai || null },
        }));

        router.put(
            `${BASE}/records/${record.id}/hasil`,
            { item_id: item.id, tanggal: tanggalAktif, kondisi: nilai || null },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['results', 'riwayat', 'flash'],
                onError: () => router.reload({ only: ['results'] }),
            }
        );
    };

    // Tombol Closed / Buka lagi untuk tanggal aktif
    const ubahStatusTanggal = (closed) => {
        const nilai = Object.values(kondisiLokal ?? {});
        const jumlahNg = nilai.filter((v) => v?.kondisi === 'NG').length;
        const belumIsi = checksheet.items.length - nilai.filter((v) => v?.kondisi).length;

        let peringatan = '';

        if (closed && jumlahNg > 0) {
            peringatan = ` Masih ada ${jumlahNg} inspection point berkondisi NG.`;
        } else if (closed && belumIsi > 0) {
            peringatan = ` Masih ada ${belumIsi} inspection point yang Kondisinya belum diisi.`;
        }

        setConfirm({
            title: closed ? 'Tandai Closed?' : 'Buka lagi abnormality?',
            message: closed
                ? `Semua abnormality tanggal ${tanggalAktifInfo?.tanggal_format} akan ditutup (Closed).${peringatan} Lanjutkan?`
                : `Abnormality tanggal ${tanggalAktifInfo?.tanggal_format} akan dibuka kembali. Lanjutkan?`,
            confirmLabel: closed ? 'Ya, Closed' : 'Ya, Buka Lagi',
            onConfirm: () =>
                router.post(
                    `${BASE}/records/${record.id}/status-tanggal`,
                    { tanggal: tanggalAktif, closed },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        only: ['abnormalities', 'tanggalList', 'headerOtomatis', 'records', 'riwayat', 'flash'],
                    }
                ),
        });
    };

    const hapusItem = (item) =>
        setConfirm({
            title: 'Hapus inspection point?',
            message: `"${item.inspection_point}" dan seluruh hasil pengisiannya (semua bulan) akan dihapus.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () =>
                router.delete(`${BASE}/${checksheet.id}/items/${item.id}`, { preserveScroll: true }),
        });

    const hapusRiwayat = (r) =>
        setConfirm({
            title: 'Hapus pengisian bulan ini?',
            message: `Seluruh pengisian ${BULAN[r.bulan - 1]} ${r.tahun} (aksi, kondisi, dan keterangan) akan dihapus.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => router.delete(`${BASE}/records/${r.id}`, { preserveScroll: true }),
        });

    const terbuka = abnormalities.filter((a) => a.status !== 'Closed').length;

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title={`Checksheet Preventif · ${checksheet.nama_equipment}`} />

            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="flex items-center gap-3 px-3 py-3 sm:px-5 2xl:px-8">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            aria-label="Buka menu"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/20"
                        >
                            ☰
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                                {checksheet.nama_equipment}
                            </h1>
                            <p className="truncate text-xs text-blue-200/80">
                                {checksheet.divisi}
                                {checksheet.nomor_dokumen ? ` · ${checksheet.nomor_dokumen}` : ''}
                            </p>
                        </div>
                        <Link
                            href={BASE}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                        >
                            <IconBack />
                            Kembali
                        </Link>
                    </div>
                </header>

                <main className="space-y-4 px-3 py-4 sm:px-5 2xl:px-8">
                    {!checksheet.preventif_mesin_id && (
                        <p className="rounded-2xl bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-700">
                            Belum terhubung ke item Schedule Preventif, jadi abnormality dan ACT otomatis belum aktif.
                            Hubungkan lewat tombol Edit di halaman Daftar.
                        </p>
                    )}

                    {/* HEADER FORM + PERIODE */}
                    <section className={`${card} px-5 py-4`}>
                        <div className="mb-4 flex flex-wrap items-center gap-2.5">
                            <select
                                value={bulan}
                                onChange={(e) => ganti({ bulan: Number(e.target.value) })}
                                className={selectClass}
                            >
                                {BULAN.map((b, i) => (
                                    <option key={b} value={i + 1}>
                                        {b}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={tahun}
                                onChange={(e) => ganti({ tahun: Number(e.target.value) })}
                                className={selectClass}
                            >
                                {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {record && <RecordHeader key={`${record.id}-${tanggalAktif}`} record={record} auto={headerOtomatis} />}
                    </section>

                    {/* PILIH TANGGAL ABNORMALITY + TOMBOL CLOSED */}
                    {checksheet.preventif_mesin_id && (
                        <section className={`${card} px-5 py-4`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Tanggal Abnormality</h2>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Kondisi OK / NG dan Keterangan di tabel berlaku untuk tanggal yang dipilih. Tiap
                                        tanggal punya isian dan tombol Closed sendiri.
                                    </p>
                                </div>

                                {tanggalAktifInfo && (
                                    <div className="flex items-center gap-2">
                                        {tanggalAktifInfo.status === 'Closed' ? (
                                            <button
                                                type="button"
                                                onClick={() => ubahStatusTanggal(false)}
                                                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >
                                                Buka lagi
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => ubahStatusTanggal(true)}
                                                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700"
                                            >
                                                <IconCheck />
                                                Tandai Closed · {tanggalAktifInfo.tanggal_format}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {tanggalList.length === 0 && (
                                    <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                        Belum ada abnormality pada {BULAN[bulan - 1]} {tahun}.
                                    </p>
                                )}

                                {tanggalList.map((t) => {
                                    const dipilih = t.tanggal === tanggalAktif;

                                    return (
                                        <button
                                            key={t.tanggal}
                                            type="button"
                                            onClick={() => ganti({ tanggal: t.tanggal })}
                                            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                                STATUS_STYLE[t.status]
                                            } ${dipilih ? 'ring-4 ring-blue-200' : 'opacity-80 hover:opacity-100'}`}
                                        >
                                            {t.tanggal_format}
                                            <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold">
                                                {t.status} · {t.jumlah}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* TABEL INSPECTION POINT */}
                    <section className={`overflow-hidden ${card}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px]">
                                {AKSI.map((a) => (
                                    <span key={a.key} className={`rounded-md border px-2 py-0.5 font-semibold ${a.warna}`}>
                                        {a.label}
                                    </span>
                                ))}
                                <span className="text-slate-500">
                                    Kolom kuning = abnormality belum Closed, hijau = sudah Closed. Klik header tanggal
                                    untuk memilih, lalu isi Kondisi OK / NG.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setItemModal({})}
                                className="cursor-pointer rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            >
                                + Inspection point
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead className="text-white">
                                    <tr className="bg-[#0b1a4d] text-xs font-semibold">
                                        <th rowSpan={3} className="sticky left-0 z-30 w-[44px] min-w-[44px] border-b border-r border-white/10 bg-[#0b1a4d] px-3 py-2">No</th>
                                        <th rowSpan={3} className="sticky left-[44px] z-30 min-w-[220px] border-b border-r border-white/10 bg-[#0b1a4d] px-3 py-2 text-left">Inspection Point</th>
                                        <th rowSpan={3} className="min-w-[150px] border-b border-r border-white/10 px-3 py-2 text-left">Standar</th>
                                        <th colSpan={jumlahHari} className="border-b border-white/10 px-3 py-2">
                                            ACTION · {BULAN[bulan - 1]} {tahun}
                                        </th>
                                        <th rowSpan={3} className="min-w-[130px] border-b border-l border-r border-white/10 px-3 py-2">
                                            Kondisi
                                            {tanggalAktifInfo && (
                                                <span className="mt-0.5 block text-[10px] font-medium text-blue-200">
                                                    {tanggalAktifInfo.tanggal_format}
                                                </span>
                                            )}
                                        </th>
                                        <th rowSpan={3} className="min-w-[180px] border-b border-r border-white/10 px-3 py-2 text-left">Keterangan</th>
                                        <th rowSpan={3} className="border-b border-white/10 px-3 py-2" />
                                    </tr>
                                    <tr className="bg-[#16307a] text-[11px] font-semibold text-blue-100">
                                        {minggu.map((w) => (
                                            <th key={w.nomor} colSpan={w.colSpan} className="border-b border-r border-white/10 px-2 py-1.5">
                                                Week {w.nomor}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="bg-[#0b1a4d] text-[11px] font-semibold">
                                        {hari.map((d) => {
                                            const st = statusTgl(d);
                                            const dipilih = tanggalStr(d) === tanggalAktif;

                                            return (
                                                <th
                                                    key={d}
                                                    onClick={st ? () => ganti({ tanggal: tanggalStr(d) }) : undefined}
                                                    title={st ? `Abnormality ${st} · klik untuk memilih` : undefined}
                                                    className={`min-w-[92px] border-b border-r border-white/10 px-2 py-2 ${
                                                        st ? 'cursor-pointer' : ''
                                                    } ${
                                                        st === 'Closed'
                                                            ? 'bg-emerald-600 text-white'
                                                            : st
                                                              ? 'bg-amber-500 text-white'
                                                              : akhirPekan(d)
                                                                ? 'bg-[#2a1f4d] text-rose-200'
                                                                : 'text-white/90'
                                                    } ${dipilih ? 'ring-2 ring-inset ring-white' : ''}`}
                                                >
                                                    {d}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {checksheet.items.length === 0 && (
                                        <tr>
                                            <td colSpan={jumlahHari + 6} className="px-6 py-12 text-center text-slate-400">
                                                Belum ada inspection point. Klik <b>+ Inspection point</b>.
                                            </td>
                                        </tr>
                                    )}

                                    {checksheet.items.map((item) => {
                                        const kondisi = kondisiLokal?.[`i${item.id}`]?.kondisi ?? '';

                                        return (
                                            <tr key={item.id} className="group">
                                                <td className="sticky left-0 z-20 border-b border-r border-slate-100 bg-white px-3 py-2 text-center font-medium text-slate-500 group-hover:bg-blue-50">
                                                    {item.no}
                                                </td>
                                                <td className="sticky left-[44px] z-20 border-b border-r border-slate-100 bg-white px-3 py-2 font-medium text-slate-800 group-hover:bg-blue-50">
                                                    {item.inspection_point}
                                                </td>
                                                <td className="border-b border-r border-slate-100 px-3 py-2 text-xs text-slate-600 group-hover:bg-blue-50/50">
                                                    {item.standar || '-'}
                                                </td>

                                                {hari.map((d) => {
                                                    const nilai = aksiLokal[`${item.id}-${tanggalStr(d)}`] ?? '';
                                                    const st = statusTgl(d);

                                                    return (
                                                        <td
                                                            key={d}
                                                            className={`border-b border-r border-slate-100 px-1 py-1.5 text-center ${
                                                                st === 'Closed'
                                                                    ? 'bg-emerald-50/60'
                                                                    : st
                                                                      ? 'bg-amber-50'
                                                                      : akhirPekan(d)
                                                                        ? 'bg-rose-50/40'
                                                                        : ''
                                                            }`}
                                                        >
                                                            <select
                                                                value={nilai}
                                                                disabled={!record}
                                                                onChange={(e) => pilihAksi(item, d, e.target.value)}
                                                                title={`${item.inspection_point} · tanggal ${d}`}
                                                                className={`h-7 w-[84px] cursor-pointer rounded-md border px-1 text-[11px] font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                    nilai
                                                                        ? AKSI_WARNA[nilai]
                                                                        : st && st !== 'Closed'
                                                                          ? 'border-amber-400 bg-white text-amber-400'
                                                                          : 'border-slate-200 bg-white text-slate-300 hover:border-blue-300'
                                                                }`}
                                                            >
                                                                <option value="" className="text-slate-700">—</option>
                                                                {AKSI.map((a) => (
                                                                    <option key={a.key} value={a.key} className="text-slate-700">
                                                                        {a.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    );
                                                })}

                                                <td className="border-b border-l border-r border-slate-100 px-2 py-2 text-center">
                                                    <KondisiRadio
                                                        name={`kondisi-${item.id}`}
                                                        value={kondisi}
                                                        disabled={!record || !tanggalAktif}
                                                        onPilih={(v) => pilihKondisi(item, v)}
                                                    />
                                                </td>

                                                <td className="border-b border-r border-slate-100 px-1 py-1">
                                                    {record && (
                                                        <KeteranganInput
                                                            key={`${item.id}-${tanggalAktif}`}
                                                            recordId={record.id}
                                                            itemId={item.id}
                                                            tanggal={tanggalAktif}
                                                            value={kondisiLokal?.[`i${item.id}`]?.keterangan}
                                                        />
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap border-b border-slate-100 px-2 py-2">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <IconBtn title="Edit" tone="slate" onClick={() => setItemModal({ item })}>
                                                            <IconPencil />
                                                        </IconBtn>
                                                        <IconBtn title="Hapus" tone="red" onClick={() => hapusItem(item)}>
                                                            <IconTrash />
                                                        </IconBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* RIWAYAT PENGISIAN */}
                    <Riwayat
                        checksheetId={checksheet.id}
                        riwayat={riwayat}
                        bulan={bulan}
                        tahun={tahun}
                        onLihat={(r) => ganti({ bulan: r.bulan, tahun: r.tahun })}
                        onHapus={hapusRiwayat}
                        onImport={() => setShowImport(true)}
                    />

                    {/* ABNORMALITY */}
                    {checksheet.preventif_mesin_id && (
                        <section className={`${card} px-5 py-4`}>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-sm font-bold text-slate-900">Abnormality</h2>
                                {terbuka > 0 && (
                                    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
                                        {terbuka} belum Closed
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Dari Check Sheet Prediktif. Status diubah manual lewat tombol <b>Tandai Closed</b> pada
                                tanggal abnormality. Ada catatan kendala (mis. terkendala produksi) = Progress.
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Abnormality hanya muncul di sini kalau di Check Sheet Prediktif kolom{' '}
                                <b>Item Preventif Terkait</b> sudah diisi dengan item{' '}
                                <b>{checksheet.nama_equipment}</b>.
                            </p>

                            <div className="mt-4 space-y-3">
                                {abnormalities.length === 0 && (
                                    <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-semibold text-emerald-600">
                                        Tidak ada abnormality untuk item ini di {BULAN[bulan - 1]} {tahun}.
                                    </p>
                                )}

                                {abnormalities.map((a) => (
                                    <AbnormalityCard
                                        key={a.id}
                                        checksheetId={checksheet.id}
                                        a={a}
                                        highlight={highlightAbnormality === a.id}
                                        aktif={a.tanggal === tanggalAktif}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {toast && (
                <div
                    className={`fixed right-5 top-5 z-[100] max-w-[360px] rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-2xl shadow-slate-950/25 ${
                        toast.error ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-700'
                    }`}
                >
                    {toast.pesan}
                </div>
            )}

            {itemModal && (
                <ItemModal
                    checksheetId={checksheet.id}
                    item={itemModal.item}
                    sembunyi={Boolean(confirm)}
                    onMinta={setConfirm}
                    onClose={() => setItemModal(null)}
                />
            )}

            {showImport && (
                <ImportBulanModal
                    checksheetId={checksheet.id}
                    bulanAwal={bulan}
                    tahunAwal={tahun}
                    sembunyi={Boolean(confirm)}
                    onMinta={setConfirm}
                    onClose={() => setShowImport(false)}
                />
            )}

            <ConfirmModal
                open={Boolean(confirm)}
                title={confirm?.title}
                message={confirm?.message}
                confirmLabel={confirm?.confirmLabel}
                tone={confirm?.tone}
                onConfirm={() => {
                    const fn = confirm?.onConfirm;
                    setConfirm(null);
                    fn?.();
                }}
                onCancel={() => setConfirm(null)}
            />
        </>
    );
}