import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import MesinFormModal from '@/Components/MesinFormModal';
import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DokumenModal from '@/Components/DokumenModal';



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
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4'],
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
            {icon.rect && <rect {...icon.rect} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50';

function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </span>
            {children}
        </label>
    );
}

/* ------------------------------------------------------------------
| PENANDA JADWAL
| Plan  : dicentang -> lingkaran (cincin biru)
| Act   : dicentang -> lingkaran penuh dengan tanda centang (hijau)
| Kosong: titik kecil abu-abu
------------------------------------------------------------------ */
function ScheduleMark({ type, checked, onToggle, title }) {
    const isPlan = type === 'plan';

    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            title={title}
            onClick={onToggle}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
        >
            {!checked && <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}

            {checked && isPlan && (
                <span className="h-[18px] w-[18px] rounded-full border-[2.5px] border-blue-600" />
            )}

            {checked && !isPlan && (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-emerald-600 text-white">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-2.5 w-2.5"
                        aria-hidden="true"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                </span>
            )}
        </button>
    );
}

/* ------------------------------------------------------------------
| KONSTANTA
------------------------------------------------------------------ */
const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const MONTHS_FULL = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKS = [1, 2, 3, 4];
const WEEK_LABEL = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
const ITEMS = ['plan', 'act'];


// Contoh: 1200000 + shot -> "1.200.000 shot"
const formatStandar = (mesin) => {
    if (mesin.standar === null || mesin.standar === undefined || mesin.standar === '') {
        return '-';
    }

    const number = Number(mesin.standar);
    const angka = Number.isNaN(number) ? mesin.standar : number.toLocaleString('id-ID');

    return mesin.satuan ? `${angka} ${mesin.satuan}` : angka;
};

export default function Index({ mesins = [], satuans = [], tahun, flash }) {
    // =========================
    // STATE
    // =========================
    const [selectedYear, setSelectedYear] = useState(Number(tahun));
    const [showSidebar, setShowSidebar] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Modal catatan
    const [catatanModal, setCatatanModal] = useState(null);
    const [catatan, setCatatan] = useState('');

    // Modal form mesin (tambah / edit)
    const [showForm, setShowForm] = useState(false);
    const [editingMesin, setEditingMesin] = useState(null); // null = mode tambah
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [dokumenMesinId, setDokumenMesinId] = useState(null);

    // Dialog konfirmasi hapus
    const [confirmDialog, setConfirmDialog] = useState(null);

    // =========================
    // TOAST
    // =========================
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 4000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    // =========================
    // HELPER DATA JADWAL
    // =========================
    const findSchedule = (mesin, item, bulan, minggu) =>
        mesin.schedules?.find(
            (s) =>
                s.item === item &&
                Number(s.bulan) === bulan &&
                Number(s.minggu) === minggu
        );

    // Rowspan grup (No + Mesin digabung per mesin, tiap baris data = 2 baris: Plan + Act)
    const getGroupRowSpan = (data, index) => {
        const current = data[index].mesin;

        if (index > 0 && data[index - 1].mesin === current) return 0;

        let count = 1;
        for (let i = index + 1; i < data.length; i++) {
            if (data[i].mesin === current) count++;
            else break;
        }

        return count * 2;
    };

    // Nomor urut otomatis per mesin (1, 2, 3, ...) mengikuti urutan tampil,
    // jadi kalau ada mesin dihapus nomor di bawahnya langsung naik.
    const nomorMesin = new Map();
    mesins.forEach((m) => {
        if (!nomorMesin.has(m.mesin)) nomorMesin.set(m.mesin, nomorMesin.size + 1);
    });

    // =========================
    // PERIODE
    // =========================
    const changeYear = (year) => {
        setSelectedYear(year);

        router.get(
            '/overhaul-sc2',
            { tahun: year },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };


    // =========================
    // CHECKBOX
    // =========================
    const toggleCheck = (mesin, item, bulan, minggu) => {
        const current = findSchedule(mesin, item, bulan, minggu);

        router.post(
            `/overhaul-sc2/${mesin.id}/schedule`,
            {
                item,
                tahun: selectedYear,
                bulan,
                minggu,
                checked: !(current?.checked ?? false),
            },
            { preserveScroll: true }
        );
    };

    // =========================
    // CATATAN
    // =========================
    const openCatatan = (mesin, item, bulan, minggu) => {
        const current = findSchedule(mesin, item, bulan, minggu);

        setCatatanModal({ mesin, item, bulan, minggu });
        setCatatan(current?.catatan ?? '');
    };

    const closeCatatan = () => {
        setCatatanModal(null);
        setCatatan('');
    };

    const saveCatatan = () => {
        if (!catatanModal) return;

        const { mesin, item, bulan, minggu } = catatanModal;

        router.post(
            `/overhaul-sc2/${mesin.id}/schedule`,
            { item, tahun: selectedYear, bulan, minggu, catatan },
            { preserveScroll: true, onSuccess: () => closeCatatan() }
        );
    };

    // =========================
    // FORM MESIN (TAMBAH / EDIT)
    // =========================
    const openCreate = () => {
        setEditingMesin(null);
        setErrors({});
        setShowForm(true);
    };

    const openEdit = (mesin) => {
        setEditingMesin(mesin);
        setErrors({});
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingMesin(null);
        setErrors({});
        setSaving(false);
    };

    // Dipanggil oleh MesinFormModal setelah user menekan "Ya, simpan"
    const submitForm = (payload) => {
        setErrors({});
        setSaving(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => closeForm(),
            onError: (errs) => setErrors(errs),
            onFinish: () => setSaving(false),
        };

        if (editingMesin) {
            router.post(`/overhaul-sc2/${editingMesin.id}`, { ...payload, _method: 'put' }, options);
        } else {
            router.post('/overhaul-sc2', payload, options);
        }
    };

    // Hapus SATU MESIN beserta semua datanya (dipanggil dari dropdown di form)
    const deleteMesinOption = (nama) => {
        setErrors({});

        router.delete('/overhaul-sc2-opsi/mesin', {
            data: { mesin: nama },
            preserveScroll: true,
            preserveState: true,
            onError: (errs) => setErrors(errs),
        });
    };

    // Hapus satuan dari pilihan (server menolak kalau masih dipakai)
    const deleteSatuanOption = (nama) => {
        setErrors({});

        router.delete('/overhaul-sc2-opsi/satuan', {
            data: { satuan: nama },
            preserveScroll: true,
            preserveState: true,
            onError: (errs) => setErrors(errs),
        });
    };

    const confirmDelete = (mesin) => {
        setConfirmDialog({
            title: 'Hapus data?',
            message: `Apakah kamu yakin ingin menghapus ${mesin.nama}? Data akan disembunyikan dari daftar, tapi tetap tersimpan di database.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/overhaul-sc2/${mesin.id}`, {
                    preserveScroll: true,
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Schedule Overhaul Mesin SC2" />

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

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100,116,139,0.4);
                    border-radius: 999px;
                }
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
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                Schedule Overhaul Mesin SC2
                            </h1>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-4 sm:px-6">
                    {/* TOOLBAR */}
                    <div className={`idx-rise mb-3 overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-bold tracking-tight text-slate-900">
                                        Schedule Overhaul {selectedYear}
                                    </h2>

                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                                        {mesins.length} data
                                    </span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-3.5 w-3.5 rounded-full border-[2.5px] border-blue-600" />
                                        Plan
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-3.5 w-3.5 rounded-full bg-emerald-600" />
                                        Act
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span>📝</span> Catatan
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                                <Field label="Tahun">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => changeYear(Number(e.target.value))}
                                        className={selectClass}
                                    >
                                        {Array.from({ length: 31 }, (_, i) => 2020 + i).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <a
                                    href={`/overhaul-sc2/export?tahun=${selectedYear}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                                    title={`Export Schedule Overhaul tahun ${selectedYear} ke Excel`}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                                        <path d="M5 17v3h14v-3" />
                                    </svg>
                                    Export Excel
                                </a>

                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                                >
                                    <Icon type="plus" className="h-4 w-4" />
                                    Tambah
                                </button>
                            </div>
                        </div>

                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </div>

                    {/* TABLE */}
                    <div
                        style={{ animationDelay: '100ms' }}
                        className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead className="text-white">
                                    {/* BARIS 1: kolom tetap + TAHUN */}
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900">
                                        {['No', 'Mesin', 'Nama', 'Total Mesin', 'Standar','Dokumen', 'Item'].map(
                                            (header) => (
                                                <th
                                                    key={header}
                                                    rowSpan="3"
                                                    className={`border-b border-r border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap first:border-l ${
                                                        header === 'Nama'
                                                            ? 'min-w-[220px] text-left'
                                                            : 'text-center'
                                                    }`}
                                                >
                                                    {header}
                                                </th>
                                            )
                                        )}

                                        <th
                                            colSpan={48}
                                            className="border-b border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-center"
                                        >
                                            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-white">
                                                {selectedYear}
                                            </span>
                                        </th>

                                        <th
                                            rowSpan="3"
                                            className="border-b border-white/10 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                                        >
                                            Aksi
                                        </th>
                                    </tr>

                                    {/* BARIS 2: BULAN */}
                                    <tr className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900">
                                        {MONTHS.map((month, index) => (
                                            <th
                                                key={month}
                                                colSpan={4}
                                                title={MONTHS_FULL[index]}
                                                className="border-b border-r border-white/10 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wider"
                                            >
                                                {month}-{String(selectedYear).slice(2)}
                                            </th>
                                        ))}
                                    </tr>

                                    {/* BARIS 3: MINGGU I - IV */}
                                    <tr className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900">
                                        {MONTHS.map((month) =>
                                            WEEKS.map((week) => (
                                                <th
                                                    key={`${month}-${week}`}
                                                    className="min-w-[44px] border-b border-r border-white/10 px-1 py-1.5 text-center text-[10px] font-semibold text-blue-100"
                                                >
                                                    {WEEK_LABEL[week]}
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {mesins.length > 0 ? (
                                        mesins.map((mesin, index) => {
                                            const groupSpan = getGroupRowSpan(mesins, index);

                                            return (
                                                <React.Fragment key={mesin.id}>
                                                    {ITEMS.map((item, itemIndex) => {
                                                        const isPlan = item === 'plan';

                                                        return (
                                                            <tr
                                                                key={item}
                                                                className="group transition-colors hover:bg-blue-50/40"
                                                            >
                                                                {/* NO + MESIN: digabung per mesin */}
                                                                {itemIndex === 0 && groupSpan > 0 && (
                                                                    <>
                                                                        <td
                                                                            rowSpan={groupSpan}
                                                                            className="border border-slate-200 bg-slate-50 px-4 py-3 text-center align-middle font-bold text-slate-700"
                                                                        >
                                                                            {nomorMesin.get(mesin.mesin)}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={groupSpan}
                                                                            className="border border-slate-200 bg-slate-50 px-4 py-3 text-center align-middle font-bold uppercase text-slate-700"
                                                                        >
                                                                            {mesin.mesin}
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {/* NAMA, TOTAL, STANDAR (per data, gabung Plan+Act) */}
                                                                {/* NAMA, TOTAL, STANDAR, DOKUMEN (per data, gabung Plan+Act) */}
                                                                {itemIndex === 0 && (
                                                                    <>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border border-slate-200 px-4 py-3 text-center font-medium text-slate-700"
                                                                        >
                                                                            {mesin.nama}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border border-slate-200 px-4 py-3 text-center text-slate-600"
                                                                        >
                                                                            {mesin.total_mesin}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600"
                                                                        >
                                                                            {formatStandar(mesin)}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border border-slate-200 px-3 py-3 text-center"
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                title="Lihat / unggah dokumen"
                                                                                onClick={() => setDokumenMesinId(mesin.id)}
                                                                                className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                                                                    (mesin.dokumens?.length ?? 0) > 0
                                                                                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                                                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                                                                }`}
                                                                            >
                                                                                <span>Lihat Dokumen</span>
                                                                                <span
                                                                                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold leading-none ${
                                                                                        (mesin.dokumens?.length ?? 0) > 0
                                                                                            ? 'bg-blue-600 text-white'
                                                                                            : 'bg-slate-200 text-slate-500'
                                                                                    }`}
                                                                                >
                                                                                    {mesin.dokumens?.length ?? 0}
                                                                                </span>
                                                                            </button>
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {/* ITEM */}
                                                                <td className="border border-slate-200 px-3 py-2 text-center">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                                            isPlan
                                                                                ? 'bg-blue-50 text-blue-700'
                                                                                : 'bg-emerald-50 text-emerald-700'
                                                                        }`}
                                                                    >
                                                                        {isPlan ? 'Plan' : 'Act'}
                                                                    </span>
                                                                </td>

                                                                {/* 12 BULAN x 4 MINGGU */}
                                                                {MONTHS.map((_, monthIndex) =>
                                                                    WEEKS.map((week) => {
                                                                        const bulan = monthIndex + 1;
                                                                        const schedule = findSchedule(
                                                                            mesin,
                                                                            item,
                                                                            bulan,
                                                                            week
                                                                        );
                                                                        const checked = Boolean(schedule?.checked);
                                                                        const hasCatatan = Boolean(
                                                                            schedule?.catatan &&
                                                                                String(schedule.catatan).trim() !== ''
                                                                        );

                                                                        return (
                                                                            <td
                                                                                key={`${bulan}-${week}`}
                                                                                className={`border border-slate-200 px-1 py-1.5 text-center transition-colors ${
                                                                                    checked
                                                                                        ? isPlan
                                                                                            ? 'bg-blue-50'
                                                                                            : 'bg-emerald-50'
                                                                                        : 'bg-white'
                                                                                }`}
                                                                            >
                                                                                <div className="flex flex-col items-center gap-1">
                                                                                    <ScheduleMark
                                                                                        type={item}
                                                                                        checked={checked}
                                                                                        onToggle={() =>
                                                                                            toggleCheck(
                                                                                                mesin,
                                                                                                item,
                                                                                                bulan,
                                                                                                week
                                                                                            )
                                                                                        }
                                                                                        title={`${
                                                                                            isPlan ? 'Plan' : 'Act'
                                                                                        } ${MONTHS_FULL[monthIndex]} minggu ${week}`}
                                                                                    />

                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            openCatatan(
                                                                                                mesin,
                                                                                                item,
                                                                                                bulan,
                                                                                                week
                                                                                            )
                                                                                        }
                                                                                        title={
                                                                                            hasCatatan
                                                                                                ? 'Lihat catatan'
                                                                                                : 'Tambah catatan'
                                                                                        }
                                                                                        className={`relative cursor-pointer text-xs transition hover:scale-110 ${
                                                                                            hasCatatan
                                                                                                ? 'text-blue-600'
                                                                                                : 'text-slate-300 hover:text-slate-500'
                                                                                        }`}
                                                                                    >
                                                                                        📝
                                                                                        {hasCatatan && (
                                                                                            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-red-500" />
                                                                                        )}
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        );
                                                                    })
                                                                )}

                                        
                                                                {/* AKSI */}
                                                                {itemIndex === 0 && (
                                                                    <td
                                                                        rowSpan={2}
                                                                        className="border border-slate-200 px-3 py-3"
                                                                    >
                                                                        <div className="flex items-center justify-center gap-1.5">
                                                                            <button
                                                                                type="button"
                                                                                title="Edit data"
                                                                                onClick={() => openEdit(mesin)}
                                                                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
                                                                            >
                                                                                <Icon type="edit" className="h-4 w-4" />
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                title="Hapus data"
                                                                                onClick={() => confirmDelete(mesin)}
                                                                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md"
                                                                            >
                                                                                <Icon type="trash" className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={56} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                        <Icon type="clipboard" className="h-7 w-7 text-slate-400" />
                                                    </div>
                                                    <p className="font-semibold text-slate-700">Tidak ada data</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Klik tombol Tambah untuk menambahkan mesin.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Schedule Overhaul Mesin SC2
                        </p>
                    </div>
                </footer>
            </div>

            {/* SUCCESS TOAST */}
            {showSuccess && (
                <div className="fixed right-5 top-5 z-[110] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{successMessage}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSuccess(false)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* MODAL CATATAN */}
            {catatanModal && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 shadow-sm">
                                        📝
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">Catatan Overhaul</h2>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {MONTHS_FULL[catatanModal.bulan - 1]} {selectedYear} · Minggu{' '}
                                            {catatanModal.minggu} ·{' '}
                                            <span className="font-semibold uppercase">{catatanModal.item}</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeCatatan}
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                {catatanModal.mesin.nama}
                            </p>
                        </div>

                        <div className="px-6 py-5">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Catatan</label>

                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                rows="5"
                                placeholder="Tulis catatan untuk minggu ini..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeCatatan}
                                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={saveCatatan}
                                className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg"
                            >
                                Simpan Catatan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL FORM MESIN (TAMBAH / EDIT) */}
            {showForm && (
                <MesinFormModal
                    key={editingMesin?.id ?? 'new'}
                    mesin={editingMesin}
                    mesins={mesins}
                    satuans={satuans}
                    serverErrors={errors}
                    saving={saving}
                    onClose={closeForm}
                    onSubmit={submitForm}
                    onDeleteMesin={deleteMesinOption}
                    onDeleteSatuan={deleteSatuanOption}
                />
            )}

            {dokumenMesinId && mesins.find((m) => m.id === dokumenMesinId) && (
                <DokumenModal
                    mesin={mesins.find((m) => m.id === dokumenMesinId)}
                    onClose={() => setDokumenMesinId(null)}
                />
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
