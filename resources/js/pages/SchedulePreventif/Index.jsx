import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    edit: {
        paths: [
            'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
            'M15 5l4 4',
        ],
    },
    trash: {
        paths: [
            'M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5',
            'M10 11v5.5M14 11v5.5',
        ],
    },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    calendar: {
        paths: [
            'M5.5 4.5h13a2 2 0 012 2v12a2 2 0 01-2 2h-13a2 2 0 01-2-2v-12a2 2 0 012-2z',
            'M8 2.5v4M16 2.5v4M3.5 9h17',
            'M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01',
        ],
    },
    tag: {
        paths: [
            'M3.5 12.5V5A1.5 1.5 0 015 3.5h7.5l8 8a1.5 1.5 0 010 2.1l-6.9 6.9a1.5 1.5 0 01-2.1 0l-8-8z',
            'M8 8h.01',
        ],
    },
    pin: {
        paths: [
            'M12 21s-6.5-5.2-6.5-10.5a6.5 6.5 0 0113 0C18.5 15.8 12 21 12 21z',
            'M12 12.5a2 2 0 100-4 2 2 0 000 4z',
        ],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];
    if (!icon) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS (sama dengan halaman Preventif Mesin)
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// 48 kolom: [bulan, minggu]
const WEEKS = MONTHS_SHORT.flatMap((_, m) => [1, 2, 3, 4].map((w) => [m + 1, w]));

// kolom kiri yang menempel: [Baris] [Plan/Act]
const COL_BARIS = { left: 0, width: 150 };
const COL_JENIS = { left: 150, width: 60 };
const COL_TOTAL = { left: 0, width: 210 };
const stickyCol = (c) => ({ position: 'sticky', left: c.left, width: c.width, minWidth: c.width, maxWidth: c.width });

const parseKodes = (text) =>
    text.split(/[\s,;]+/).map((x) => x.trim().toUpperCase()).filter(Boolean);

// Warna tiap kode otomatis & tetap: kode yang sama selalu berwarna sama.
// A=1 ... Z=26, AA=27, ... lalu hue digeser sudut emas (137.5°) agar kode berdekatan tetap beda warna.
const kodeKeAngka = (kode) =>
    [...String(kode)].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);

function warnaKode(kode) {
    const hue = Math.round((kodeKeAngka(kode) * 137.508) % 360);

    return {
        bg: `hsl(${hue} 85% 91%)`,
        fg: `hsl(${hue} 65% 25%)`,
        border: `hsl(${hue} 65% 68%)`,
        solid: `hsl(${hue} 65% 42%)`,
    };
}

function KodePill({ kode, aktif = false, onClick, title }) {
    const w = warnaKode(kode);
    const Tag = onClick ? 'button' : 'span';

    const style = aktif
        ? { backgroundColor: w.solid, borderColor: w.solid, color: '#fff' }
        : { backgroundColor: w.bg, borderColor: w.border, color: w.fg };

    const ukuran = onClick
        ? 'cursor-pointer px-2.5 py-1 text-xs transition hover:brightness-95'
        : 'px-1.5 py-0.5 text-[11px]';

    return (
        <Tag
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            title={title}
            style={style}
            className={`inline-flex min-w-[24px] items-center justify-center rounded-md border font-extrabold leading-none ${ukuran}`}
        >
            {kode}
        </Tag>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
        </label>
    );
}

function ModalShell({ title, subtitle, onClose, footer, children }) {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">{title}</h2>
                        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    {footer}
                </div>
            </div>
        </div>
    );
}

const emptyZona = { id: null, no: '', zona: '', nama_line: '', jumlah_mesin: 1 };

export default function Index({
    tahun,
    items = [],
    zonas = [],
    baris = [],
    plan = {},
    act = {},
    totals = {},
    flash,
}) {
    const [tab, setTab] = useState('jadwal');
    const [showSidebar, setShowSidebar] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // modal zona
    const [zonaForm, setZonaForm] = useState(null);
    const [zonaErrors, setZonaErrors] = useState({});

    // modal input kode (Plan)
    const [cell, setCell] = useState(null);
    const [cellError, setCellError] = useState('');
    const [saving, setSaving] = useState(false);

    // ubah nama baris & pesan galat
    const [namaForm, setNamaForm] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    /* ---------------- toast sukses ---------------- */
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(''), 5000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 4000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    /* ---------------- tahun ---------------- */
    const ubahTahun = (nilai) =>
        router.get(
            '/schedule-preventif',
            { tahun: nilai },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    /* ---------------- helper grid ---------------- */
    // plan / act: "baris-bulan-minggu" => [{ kode, n }]  (n = jumlah plan atau act kode itu di week tsb)
    const entriOf = (sumber, barisId, bulan, minggu) => sumber?.[`${barisId}-${bulan}-${minggu}`] ?? [];
    const barisLabel = (b, i) => (b.nama && b.nama.trim() !== '' ? b.nama : `Baris ${i + 1}`);
    const totalOf = (bulan, minggu, jenis) => totals?.[`${bulan}-${minggu}`]?.[jenis] ?? 0;
    const namaItem = Object.fromEntries(items.map((i) => [i.kode, i.item_preventif]));

    /* ---------------- ZONA: tambah / edit / hapus (tabel sendiri) ---------------- */
    const openZona = (zona = null) => {
        setZonaErrors({});
        setZonaForm(zona ? { ...zona, no: zona.no ?? '' } : { ...emptyZona });
    };

    const kirimZona = () => {
        const body = {
            no: zonaForm.no === '' ? null : zonaForm.no,
            zona: zonaForm.zona,
            nama_line: zonaForm.nama_line,
            jumlah_mesin: zonaForm.jumlah_mesin,
        };

        const opsi = {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onSuccess: () => setZonaForm(null),
            onError: (errors) => setZonaErrors(errors),
        };

        if (zonaForm.id) {
            router.put(`/schedule-preventif/zona/${zonaForm.id}`, body, opsi);
        } else {
            router.post('/schedule-preventif/zona', body, opsi);
        }
    };

    // Tambah zona langsung disimpan. Edit zona minta konfirmasi dulu.
    const saveZona = () => {
        if (!zonaForm.id) {
            kirimZona();
            return;
        }

        setConfirmDialog({
            title: 'Simpan perubahan?',
            message: `Apakah kamu yakin ingin menyimpan perubahan pada ${zonaForm.nama_line || 'zona ini'}?`,
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                kirimZona();
            },
        });
    };

    const confirmSaveZona = () => {
        const baru = !zonaForm.id;
        const nama = zonaForm.nama_line || 'zona ini';

        setConfirmDialog({
            title: baru ? 'Tambah zona?' : 'Simpan perubahan?',
            message: baru
                ? `Apakah kamu yakin ingin menambahkan ${nama}?`
                : `Apakah kamu yakin ingin menyimpan perubahan ${nama}?`,
            confirmLabel: baru ? 'Ya, Tambah' : 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                saveZona();
            },
        });
    };

    const confirmDeleteZona = (zona) => {
        setConfirmDialog({
            title: 'Hapus zona?',
            message: `Apakah kamu yakin ingin menghapus ${zona.nama_line}`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/schedule-preventif/zona/${zona.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    /* ---------------- PLAN: input kode per week ---------------- */
    const openCell = (b, i, bulan, minggu) => {
        setCellError('');
        setCell({
            barisId: b.id,
            label: barisLabel(b, i),
            bulan,
            minggu,
            text: entriOf(plan, b.id, bulan, minggu).map((e) => e.kode).join(', '),
        });
    };

    /* ---------------- BARIS PLAN/ACT: tambah / ubah nama / hapus (soft delete) ---------------- */
    const tambahBaris = () => {
        setConfirmDialog({
            title: 'Tambah baris?',
            message: `Apakah kamu yakin ingin menambah baris Plan/Act baru untuk tahun ${tahun}?`,
            confirmLabel: 'Ya, Tambah',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                submitTambahBaris();
            },
        });
    };

    const submitTambahBaris = () => {
        router.post(
            '/schedule-preventif/baris',
            { tahun },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onError: (errors) => setErrorMessage(Object.values(errors)[0] ?? 'Gagal menambah baris.'),
            }
        );
    };

    const saveNamaBaris = () => {
        router.put(
            `/schedule-preventif/baris/${namaForm.id}`,
            { nama: namaForm.nama },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => setNamaForm(null),
                onError: (errors) => setErrorMessage(Object.values(errors)[0] ?? 'Gagal menyimpan nama.'),
            }
        );
    };

    const confirmDeleteBaris = (b, i) => {
        setConfirmDialog({
            title: 'Hapus baris?',
            message: `Apakah kamu yakin ingin menghapus ${barisLabel(b, i)}`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/schedule-preventif/baris/${b.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onError: (errors) => setErrorMessage(Object.values(errors)[0] ?? 'Gagal menghapus baris.'),
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    const toggleKode = (kode) => {
        const set = new Set(parseKodes(cell.text));
        set.has(kode) ? set.delete(kode) : set.add(kode);
        setCell({ ...cell, text: [...set].join(', ') });
    };

    const saveCell = (kosongkan = false) => {
        router.post(
            '/schedule-preventif/cell',
            {
                tahun,
                baris_id: cell.barisId,
                bulan: cell.bulan,
                minggu: cell.minggu,
                kodes: kosongkan ? [] : parseKodes(cell.text),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => setCell(null),
                onError: (errors) => setCellError(Object.values(errors)[0] ?? 'Gagal menyimpan.'),
            }
        );
    };

    const terpilih = new Set(cell ? parseKodes(cell.text) : []);

    const totalMesin = zonas.reduce((n, z) => n + Number(z.jumlah_mesin || 0), 0);

    const tabs = [
        { key: 'jadwal', label: 'Jadwal', icon: 'calendar', count: null },
        { key: 'item', label: 'Kode & Item', icon: 'tag', count: items.length },
        { key: 'zona', label: 'Zona & Mesin', icon: 'pin', count: zonas.length },
    ];

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Schedule Preventif" />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-2.5 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                            title="Menu"
                        >
                            <Icon type="menu" className="h-5 w-5" />
                        </button>

                        <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                            Schedule Preventif Maintenance
                        </h1>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-4 sm:px-6">
                    <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                        {/* TAB (gaya map arsip) */}
                        <div className="flex items-end gap-1.5 border-b border-slate-300 bg-gradient-to-b from-slate-200 to-slate-100 px-4 pt-3">
                            {tabs.map(({ key, label, icon, count }) => {
                                const aktif = tab === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTab(key)}
                                        className={`relative flex cursor-pointer items-center gap-2 rounded-t-xl border border-b-0 px-5 text-sm font-bold transition-all duration-200 ${
                                            aktif
                                                ? '-mb-px border-slate-300 bg-white py-3 text-blue-700 shadow-[0_-3px_8px_rgba(15,23,42,0.08)]'
                                                : 'mb-0 border-slate-300/70 bg-slate-300/60 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                        }`}
                                    >
                                        {aktif && (
                                            <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-600" />
                                        )}

                                        <Icon type={icon} className="h-4 w-4" />
                                        {label}

                                        {count !== null && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                                    aktif ? 'bg-blue-100 text-blue-700' : 'bg-white/70 text-slate-500'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* =========================================================
                            TAB JADWAL  (hanya Plan & Act per week, tanpa zona)
                        ========================================================== */}
                        {tab === 'jadwal' && (
                            <div className="bg-white p-4">
                                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="text-[11px] leading-relaxed text-slate-500">
                                        <p>
                                            <b className="text-slate-700">Plan</b>: klik sel pada week yang dimaksud untuk mengisi kode item.{' '}
                                            <b className="text-slate-700">Act</b>: otomatis dari checklist ✓ di menu Preventif Mesin.
                                        </p>
                                        <p>W1 = tgl 1–7 · W2 = 8–14 · W3 = 15–21 · W4 = 22–akhir bulan. Angka Total = jumlah tanggal plan / act item di week itu menurut menu Preventif Mesin, dijumlahkan dari semua baris. Arahkan kursor ke kode untuk melihat nama itemnya.</p>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <button
                                            type="button"
                                            onClick={tambahBaris}
                                            disabled={saving}
                                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Icon type="plus" className="h-4 w-4" />
                                            Tambah baris
                                        </button>

                                        <label className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tahun</span>
                                            <select value={tahun} onChange={(e) => ubahTahun(Number(e.target.value))} className={selectClass}>
                                                {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200">
                                    <table className="border-separate border-spacing-0 whitespace-nowrap text-xs">
                                        <thead>
                                            <tr>
                                                <th
                                                    rowSpan={2}
                                                    style={{ ...stickyCol(COL_BARIS), top: 0, zIndex: 30 }}
                                                    className="border-b border-r border-white/10 bg-[#0a1a4d] px-3 py-2 text-center font-bold text-white"
                                                >
                                                    Baris
                                                </th>
                                                <th
                                                    rowSpan={2}
                                                    style={{ ...stickyCol(COL_JENIS), top: 0, zIndex: 30 }}
                                                    className="border-b border-r-2 border-white/10 bg-[#0a1a4d] px-2 py-2 text-center font-bold text-white"
                                                />

                                                {MONTHS_SHORT.map((m) => (
                                                    <th
                                                        key={m}
                                                        colSpan={4}
                                                        style={{ position: 'sticky', top: 0, height: 30, zIndex: 20 }}
                                                        className="border-b border-r border-white/10 bg-gradient-to-r from-blue-700 to-indigo-700 px-2 text-center font-bold text-white"
                                                    >
                                                        {m} {tahun}
                                                    </th>
                                                ))}
                                            </tr>

                                            <tr>
                                                {WEEKS.map(([m, w]) => (
                                                    <th
                                                        key={`${m}-${w}`}
                                                        style={{ position: 'sticky', top: 30, zIndex: 20 }}
                                                        className="min-w-[56px] border-b border-r border-white/10 bg-blue-900 px-2 py-1 text-center font-semibold text-blue-100"
                                                    >
                                                        W{w}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {baris.map((b, i) => (
                                                <React.Fragment key={b.id}>
                                                    {/* ---------- PLAN (klik untuk isi kode) ---------- */}
                                                    <tr>
                                                        <td
                                                            rowSpan={2}
                                                            style={{ ...stickyCol(COL_BARIS), zIndex: 10 }}
                                                            className="whitespace-normal border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-center align-middle"
                                                        >
                                                            <p className="break-words text-xs font-extrabold text-slate-700">{barisLabel(b, i)}</p>

                                                            <div className="mt-1.5 flex items-center justify-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    title="Ubah nama baris"
                                                                    onClick={() => setNamaForm({ id: b.id, nama: b.nama ?? '' })}
                                                                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                                >
                                                                    <Icon type="edit" className="h-3.5 w-3.5" />
                                                                </button>

                                                                {baris.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        title="Hapus baris"
                                                                        onClick={() => confirmDeleteBaris(b, i)}
                                                                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                                    >
                                                                        <Icon type="trash" className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td
                                                            style={{ ...stickyCol(COL_JENIS), zIndex: 10 }}
                                                            className="border-b border-r-2 border-r-blue-900 border-slate-200 bg-blue-50 px-2 py-3 text-center text-sm font-extrabold text-blue-700"
                                                        >
                                                            Plan
                                                        </td>

                                                        {WEEKS.map(([m, w]) => (
                                                            <td
                                                                key={`${m}-${w}`}
                                                                onClick={() => openCell(b, i, m, w)}
                                                                title={`Klik untuk mengisi kode Plan · ${MONTHS[m - 1]} W${w}`}
                                                                className="min-w-[56px] cursor-pointer whitespace-normal break-words border-b border-r border-slate-200 bg-blue-50/60 px-1 py-3 text-center text-[11px] font-bold text-blue-700 transition hover:bg-amber-100"
                                                            >
                                                                <div className="flex flex-wrap items-center justify-center gap-1">
                                                                    {entriOf(plan, b.id, m, w).map((e) => (
                                                                        <KodePill key={e.kode} kode={e.kode} title={namaItem[e.kode]} />
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    {/* ---------- ACT (otomatis) ---------- */}
                                                    <tr>
                                                        <td
                                                            style={{ ...stickyCol(COL_JENIS), zIndex: 10 }}
                                                            className="border-b border-r-2 border-r-blue-900 border-slate-300 bg-emerald-50 px-2 py-3 text-center text-sm font-extrabold text-emerald-700"
                                                        >
                                                            Act
                                                        </td>

                                                        {WEEKS.map(([m, w]) => (
                                                            <td
                                                                key={`${m}-${w}`}
                                                                title="Otomatis dari checklist Preventif Mesin"
                                                                className="min-w-[56px] whitespace-normal break-words border-b border-r border-slate-300 bg-emerald-50/60 px-1 py-3 text-center text-[11px] font-bold text-emerald-700"
                                                            >
                                                                <div className="flex flex-wrap items-center justify-center gap-1">
                                                                    {entriOf(act, b.id, m, w).map((e) => (
                                                                        <KodePill key={e.kode} kode={e.kode} title={namaItem[e.kode]} />
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </React.Fragment>
                                            ))}

                                            {/* ---------- TOTAL PER WEEK (semua baris) ---------- */}
                                            {[
                                                ['Total Plan', 'plan'],
                                                ['Total Act', 'act'],
                                            ].map(([label, jenis]) => (
                                                <tr key={label}>
                                                    <td
                                                        colSpan={2}
                                                        style={{ ...stickyCol(COL_TOTAL), zIndex: 10 }}
                                                        className="border-b border-r-2 border-r-blue-900 border-amber-200 bg-amber-100 px-3 py-2 text-center font-extrabold text-slate-800"
                                                    >
                                                        {label}
                                                    </td>

                                                    {WEEKS.map(([m, w]) => (
                                                        <td key={`${m}-${w}`} className="border-b border-r border-amber-200 bg-amber-50 px-1 py-2 text-center font-extrabold text-slate-800">
                                                            {totalOf(m, w, jenis)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}

                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    style={{ ...stickyCol(COL_TOTAL), zIndex: 10 }}
                                                    className="border-r-2 border-r-blue-900 bg-amber-100 px-3 py-2 text-center font-extrabold text-slate-800"
                                                >
                                                    Pencapaian
                                                </td>

                                                {WEEKS.map(([m, w]) => {
                                                    const p = totalOf(m, w, 'plan');
                                                    const a = totalOf(m, w, 'act');

                                                    return (
                                                        <td key={`${m}-${w}`} className="border-r border-amber-200 bg-amber-50 px-1 py-2 text-center font-bold text-slate-600">
                                                            {p > 0 ? `${Math.round((a / p) * 100)}%` : '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* =========================================================
                            TAB KODE & ITEM (diambil dari menu Preventif Mesin)
                        ========================================================== */}
                        {tab === 'item' && (
                            <div className="bg-white p-4">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs text-slate-500">
                                        Item diambil dari menu Preventif Mesin. Kode otomatis A–Z, lalu AA, AB, dan seterusnya. Tambah, edit, dan hapus item dilakukan di menu tersebut.
                                    </p>

                                    <Link
                                        href="/preventif-mesin/create"
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        <Icon type="plus" className="h-4 w-4" />
                                        Tambah item
                                    </Link>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full border-separate border-spacing-0 text-sm">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900 text-[11px] uppercase tracking-wider text-white">
                                                <th className="w-20 px-4 py-3 text-center font-bold">Kode</th>
                                                <th className="px-4 py-3 text-left font-bold">Item Preventif</th>
                                                <th className="w-32 px-4 py-3 text-center font-bold">Divisi</th>
                                                <th className="w-32 px-4 py-3 text-center font-bold">Frekuensi</th>
                                                <th className="w-24 px-4 py-3 text-center font-bold">Aksi</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {items.length === 0 && (
                                                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Belum ada item preventif.</td></tr>
                                            )}

                                            {items.map((item) => (
                                                <tr key={item.no} className="hover:bg-blue-50/50">
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center">
                                                        <KodePill kode={item.kode} />
                                                    </td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-slate-700">{item.item_preventif}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center text-slate-600">{item.divisi}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center text-slate-600">{item.frekuensi}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center">
                                                        <Link
                                                            href={`/preventif-mesin/${item.no}/edit`}
                                                            title="Edit di menu Preventif Mesin"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                        >
                                                            <Icon type="edit" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* =========================================================
                            TAB ZONA (tabel sendiri, tidak berhubungan dengan siapa pun)
                        ========================================================== */}
                        {tab === 'zona' && (
                            <div className="bg-white p-4">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs text-slate-500">Tabel zona berdiri sendiri, tidak terhubung ke jadwal, item, maupun tabel lain.</p>

                                    <button
                                        type="button"
                                        onClick={() => openZona()}
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                                    >
                                        <Icon type="plus" className="h-4 w-4" />
                                        Tambah zona
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full border-separate border-spacing-0 text-sm">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900 text-[11px] uppercase tracking-wider text-white">
                                                <th className="w-16 px-4 py-3 text-center font-bold">No</th>
                                                <th className="w-24 px-4 py-3 text-center font-bold">Daftar Mesin Zone</th>
                                                <th className="px-4 py-3 text-left font-bold">Nama Line</th>
                                                <th className="w-32 px-4 py-3 text-center font-bold">Jumlah Mesin</th>
                                                <th className="w-32 px-4 py-3 text-center font-bold">Aksi</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {zonas.length === 0 && (
                                                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Belum ada zona.</td></tr>
                                            )}

                                            {zonas.map((z) => (
                                                <tr key={z.id} className="hover:bg-blue-50/50">
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center text-slate-600">{z.no}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-700">{z.zona}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-slate-700">{z.nama_line}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5 text-center text-slate-600">{z.jumlah_mesin}</td>
                                                    <td className="border-b border-slate-200 px-4 py-2.5">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button type="button" title="Edit zona" onClick={() => openZona(z)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                                                                <Icon type="edit" />
                                                            </button>
                                                            <button type="button" title="Hapus zona" onClick={() => confirmDeleteZona(z)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100">
                                                                <Icon type="trash" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                        <tfoot>
                                            <tr className="bg-amber-50">
                                                <td colSpan={3} className="px-4 py-3 text-right text-sm font-extrabold text-slate-800">
                                                    Total Mesin
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm font-extrabold text-slate-800">{totalMesin}</td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* TOAST SUKSES */}
            {showSuccess && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{successMessage}</p>
                    </div>
                    <button type="button" onClick={() => setShowSuccess(false)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">×</button>
                </div>
            )}

            {/* TOAST GALAT */}
            {errorMessage && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-red-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-400 to-rose-600" />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-rose-100">
                        <span className="font-bold text-red-600">!</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Tidak bisa diproses</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{errorMessage}</p>
                    </div>
                    <button type="button" onClick={() => setErrorMessage('')} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">×</button>
                </div>
            )}

            {/* MODAL UBAH NAMA BARIS */}
            {namaForm && (
                <ModalShell
                    title="Ubah Nama Baris"
                    subtitle="Kosongkan untuk memakai nama otomatis (Baris 1, Baris 2, ...)"
                    onClose={() => setNamaForm(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setNamaForm(null)} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Batal</button>
                            <button type="button" onClick={saveNamaBaris} disabled={saving} className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <Field label="Nama baris">
                        <input
                            autoFocus
                            value={namaForm.nama}
                            onChange={(e) => setNamaForm({ ...namaForm, nama: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && saveNamaBaris()}
                            maxLength={100}
                            placeholder="contoh: Line Sewing 1"
                            className={inputClass}
                        />
                    </Field>
                </ModalShell>
            )}

            {/* MODAL ZONA */}
            {zonaForm && (
                <ModalShell
                    title={zonaForm.id ? 'Edit Zona' : 'Tambah Zona'}
                    onClose={() => setZonaForm(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setZonaForm(null)} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Batal</button>
                            <button type="button" onClick={confirmSaveZona} disabled={saving} className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="No" error={zonaErrors.no}>
                                <input type="number" min="1" value={zonaForm.no} onChange={(e) => setZonaForm({ ...zonaForm, no: e.target.value })} placeholder="otomatis" className={inputClass} />
                            </Field>
                            <div className="col-span-2">
                                <Field label="Zona" error={zonaErrors.zona}>
                                    <input value={zonaForm.zona} onChange={(e) => setZonaForm({ ...zonaForm, zona: e.target.value })} placeholder="contoh: 2 atau 3 & 4" className={inputClass} />
                                </Field>
                            </div>
                        </div>

                        <Field label="Nama line / mesin" error={zonaErrors.nama_line}>
                            <input value={zonaForm.nama_line} onChange={(e) => setZonaForm({ ...zonaForm, nama_line: e.target.value })} className={inputClass} />
                        </Field>

                        <Field label="Jumlah mesin" error={zonaErrors.jumlah_mesin}>
                            <input type="number" min="0" value={zonaForm.jumlah_mesin} onChange={(e) => setZonaForm({ ...zonaForm, jumlah_mesin: e.target.value })} className={inputClass} />
                        </Field>
                    </div>
                </ModalShell>
            )}

            {/* MODAL INPUT KODE PLAN */}
            {cell && (
                <ModalShell
                    title="Isi Kode Plan"
                    subtitle={`${cell.label} · ${MONTHS[cell.bulan - 1]} ${tahun} · Week ${cell.minggu}`}
                    onClose={() => setCell(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => saveCell(true)} disabled={saving} className="mr-auto cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60">Kosongkan</button>
                            <button type="button" onClick={() => setCell(null)} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Batal</button>
                            <button type="button" onClick={() => saveCell(false)} disabled={saving} className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <Field label="Kode item (pisahkan dengan koma)" error={cellError}>
                        <input
                            autoFocus
                            value={cell.text}
                            onChange={(e) => setCell({ ...cell, text: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(false)}
                            placeholder="contoh: A, C"
                            className={`${inputClass} uppercase`}
                        />
                    </Field>

                    <p className="mb-2 mt-3 text-xs text-slate-400">Atau klik kode di bawah:</p>

                    <div className="mb-4 flex flex-wrap gap-1.5">
                        {items.map((item) => (
                            <KodePill
                                key={item.no}
                                kode={item.kode}
                                title={item.item_preventif}
                                aktif={terpilih.has(item.kode)}
                                onClick={() => toggleKode(item.kode)}
                            />
                        ))}
                    </div>

                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        {items.length === 0 && 'Belum ada item. Tambahkan di menu Preventif Mesin.'}
                        {items.map((item) => (
                            <div key={item.no}>
                                <b className="text-slate-800">{item.kode}</b> = {item.item_preventif}{' '}
                                <span className="text-slate-400">({item.frekuensi})</span>
                            </div>
                        ))}
                    </div>
                </ModalShell>
            )}

            {/* DIALOG KONFIRMASI HAPUS */}
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
