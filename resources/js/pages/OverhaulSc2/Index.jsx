import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import MesinFormModal from '@/Components/MesinFormModal';
import DokumenModal from '@/Components/DokumenModal';
import React, { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
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
    file: {
        paths: [
            'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z',
            'M14 3v5h5',
        ],
    },
    calendar: {
        rect: { x: 3.75, y: 4.5, width: 16.5, height: 16, rx: 2 },
        paths: ['M8 2.75v3.5M16 2.75v3.5M3.75 9h16.5'],
    },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4'],
    },
    list: { paths: ['M6 4.5h12M6 8.5h12M6 12.5h8M6 16.5h10'] },
    chart: { sw: 2, paths: ['M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6'] },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    download: { sw: 2, paths: ['M12 3v12m0 0 4-4m-4 4-4-4', 'M5 21h14'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    note: {
        paths: [
            'M7 3.75h10a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5V5.25A1.5 1.5 0 017 3.75z',
            'M9 8.5h6M9 12h6M9 15.5h3',
        ],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

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
const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white';

/* Label kecil + kontrol */
function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400">{label}</span>
            {children}
        </label>
    );
}

/* Cangkang modal: backdrop blur + animasi pop */
function ModalShell({ z = 'z-[90]', maxW = 'max-w-lg', onBackdrop, children }) {
    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onBackdrop?.();
            }}
            className={`idx-fade fixed inset-0 ${z} flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm`}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`idx-pop w-full ${maxW} overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30`}
            >
                {children}
            </div>
        </div>
    );
}

/* Toast */
function Toast({ tone = 'emerald', title, message, onClose, icon }) {
    const tones = {
        emerald: { bar: 'from-emerald-400 to-green-600', ico: 'bg-emerald-50 text-emerald-600' },
        amber: { bar: 'from-amber-400 to-orange-500', ico: 'bg-amber-50 text-amber-600' },
    };
    const t = tones[tone];

    return (
        <div
            role="status"
            aria-live="polite"
            className="idx-slide fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25"
        >
            <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${t.bar}`} />

            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.ico}`}>
                <Icon type={icon} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                aria-label="Tutup"
            >
                <Icon type="close" className="h-4 w-4" />
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------
| PENANDA JADWAL
| Plan  : dicentang -> kotak biru dengan lingkaran
| Act   : dicentang -> kotak hijau dengan centang
| Kosong: kotak kosong
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
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-90 ${
                checked
                    ? isPlan
                        ? 'border-blue-300 bg-blue-50 text-blue-500'
                        : 'border-emerald-500 bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-sm shadow-emerald-500/30'
                    : isPlan
                    ? 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
            }`}
        >
            {checked && isPlan && <span className="idx-check text-lg font-bold leading-none">○</span>}
            {checked && !isPlan && <Icon type="check" className="idx-check h-4 w-4" />}
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

const delay = (ms) => ({ animationDelay: `${ms}ms` });

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
    const [savingCatatan, setSavingCatatan] = useState(false);

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

    // ESC menutup modal catatan
    useEffect(() => {
        if (!catatanModal) return;

        const onKey = (e) => {
            if (e.key === 'Escape') closeCatatan();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [catatanModal]);

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

    // Nomor urut otomatis per mesin mengikuti urutan tampil
    const nomorMesin = new Map();
    mesins.forEach((m) => {
        if (!nomorMesin.has(m.mesin)) nomorMesin.set(m.mesin, nomorMesin.size + 1);
    });

    // Ringkasan Plan vs Act (hanya tampilan)
    const totals = useMemo(() => {
        let plan = 0;
        let act = 0;

        mesins.forEach((m) =>
            m.schedules?.forEach((s) => {
                if (!s.checked) return;
                if (s.item === 'plan') plan++;
                if (s.item === 'act') act++;
            })
        );

        const percent = plan > 0 ? Math.min(100, Math.round((act / plan) * 100)) : 0;

        return { plan, act, percent };
    }, [mesins]);

    const jumlahMesin = nomorMesin.size;

    // Bulan berjalan (disorot kalau tahun yang dilihat = tahun ini)
    const currentMonth = new Date().getFullYear() === selectedYear ? new Date().getMonth() : -1;

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
        setSavingCatatan(false);
    };

    const saveCatatan = () => {
        if (!catatanModal || savingCatatan) return;

        const { mesin, item, bulan, minggu } = catatanModal;
        setSavingCatatan(true);

        router.post(
            `/overhaul-sc2/${mesin.id}/schedule`,
            { item, tahun: selectedYear, bulan, minggu, catatan },
            {
                preserveScroll: true,
                onSuccess: () => closeCatatan(),
                onFinish: () => setSavingCatatan(false),
            }
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

        // payload bisa berupa object biasa atau FormData
        const kirim = (extra = {}) => {
            if (payload instanceof FormData) {
                payload.set('tahun', selectedYear);
                Object.entries(extra).forEach(([k, v]) => payload.set(k, v));
                return payload;
            }

            return { ...payload, tahun: selectedYear, ...extra };
        };

        if (editingMesin) {
            router.post(`/overhaul-sc2/${editingMesin.id}`, kirim({ _method: 'put' }), options);
        } else {
            router.post('/overhaul-sc2', kirim(), options);
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

    const dokumenMesin = dokumenMesinId ? mesins.find((m) => m.id === dokumenMesinId) : null;

    // Kartu ringkasan
    const stats = [
        {
            label: 'Total data',
            value: mesins.length,
            hint: `${jumlahMesin} mesin · ${selectedYear}`,
            icon: 'list',
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Plan terjadwal',
            value: totals.plan,
            hint: 'Jumlah minggu direncanakan',
            icon: 'calendar',
            tone: 'from-violet-500 to-purple-600',
            soft: 'bg-violet-50 text-violet-600',
        },
        {
            label: 'ACT terlaksana',
            value: totals.act,
            hint: 'Jumlah minggu dikerjakan',
            icon: 'check',
            tone: 'from-emerald-500 to-green-600',
            soft: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Realisasi',
            value: `${totals.percent}%`,
            hint: `${totals.act} dari ${totals.plan} plan`,
            icon: 'chart',
            tone: 'from-cyan-500 to-sky-600',
            soft: 'bg-cyan-50 text-cyan-600',
            progress: totals.percent,
        },
    ];

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Schedule Overhaul Mesin SC2" />

            <style>{`
                @keyframes idxRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes idxFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
                @keyframes idxFloatReverse { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
                @keyframes idxShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes idxCheck { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.18); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes idxGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

                .idx-rise { animation: idxRise .7s cubic-bezier(.22,1,.36,1) both; }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-slide { animation: idxSlide .45s cubic-bezier(.22,1,.36,1) both; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-shimmer { background-size: 200% 100%; animation: idxShimmer 6s linear infinite; }
                .idx-check { animation: idxCheck .35s cubic-bezier(.22,1,.36,1) both; }
                .idx-grow { transform-origin: left; animation: idxGrow .9s .3s cubic-bezier(.22,1,.36,1) both; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                .idx-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

                @media (prefers-reduced-motion: reduce) {
                    .idx-rise, .idx-fade, .idx-pop, .idx-slide, .idx-float,
                    .idx-float-reverse, .idx-shimmer, .idx-check, .idx-grow { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800">
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

                {/* =====================================================
                    HEADER
                ====================================================== */}
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
                                    Schedule Overhaul Mesin SC2
                                </h1>
                                <p className="truncate text-xs text-blue-200/80">Tahun {selectedYear}</p>
                            </div>
                        </div>
                    </div>

                    {/* garis aksen bergerak */}
                    <div className="idx-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="w-full flex-1 px-3 py-4 sm:px-5 2xl:px-8">
                    {/* STAT CARDS */}
                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((item, i) => (
                            <div
                                key={item.label}
                                style={delay(i * 70)}
                                className={`idx-rise group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card}`}
                            >
                                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.tone}`} />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                        <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900">
                                            {item.value}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.hint}</p>
                                    </div>

                                    <span
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${item.soft}`}
                                    >
                                        <Icon type={item.icon} className="h-5 w-5" />
                                    </span>
                                </div>

                                {item.progress !== undefined && (
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            key={`${selectedYear}-${item.progress}`}
                                            style={{ width: `${item.progress}%` }}
                                            className="idx-grow h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* TOOLBAR */}
                    <div style={delay(280)} className={`idx-rise mb-4 ${card}`}>
                        <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
                            {/* LEFT - INFO */}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                        Schedule Overhaul {selectedYear}
                                    </h2>

                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {mesins.length} data
                                    </span>
                                </div>

                                {/* LEGENDA */}
                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-md border border-blue-300 bg-blue-50 text-[11px] font-bold leading-none text-blue-500">
                                            ○
                                        </span>
                                        Plan
                                    </span>

                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                                            <Icon type="check" className="h-3 w-3" />
                                        </span>
                                        ACT (sudah dikerjakan)
                                    </span>

                                    <span className="inline-flex items-center gap-1.5">
                                        <Icon type="note" className="h-4 w-4 text-slate-400" />
                                        Catatan
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT - FILTER */}
                            <div className="flex flex-wrap items-end gap-2.5">
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
                                    title={`Export Schedule Overhaul tahun ${selectedYear} ke Excel`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-0"
                                >
                                    <Icon type="download" className="h-4 w-4" />
                                    Excel
                                </a>

                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                                >
                                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                    <Icon
                                        type="plus"
                                        className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
                                    />
                                    <span className="relative">Tambah</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div style={delay(360)} className={`idx-rise overflow-hidden ${card}`}>
                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead className="text-white">
                                    {/* HEADER UTAMA */}
                                    <tr className="bg-[#0b1a4d]">
                                        {['No', 'Mesin', 'Nama', 'Total Mesin', 'Standar', 'Dokumen', 'Item'].map(
                                            (header) => (
                                                <th
                                                    key={header}
                                                    rowSpan="3"
                                                    className={`border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3 text-xs font-semibold whitespace-nowrap ${
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
                                            className="border-b border-white/10 bg-[#0b1a4d] px-4 py-2 text-center"
                                        >
                                            <span className="text-xs font-semibold tracking-wide text-white">
                                                Jadwal Overhaul · {selectedYear}
                                            </span>
                                        </th>

                                        <th
                                            rowSpan="3"
                                            className="w-[96px] min-w-[96px] border-b border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-3 py-3 text-center text-xs font-semibold whitespace-nowrap"
                                        >
                                            Aksi
                                        </th>
                                    </tr>

                                    {/* HEADER BULAN */}
                                    <tr className="bg-[#13285f]">
                                        {MONTHS.map((month, index) => (
                                            <th
                                                key={month}
                                                colSpan={4}
                                                title={MONTHS_FULL[index]}
                                                className={`border-b border-r border-white/10 px-2 py-1.5 text-center text-[11px] font-semibold ${
                                                    index === currentMonth
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-[#16307a] text-blue-100'
                                                }`}
                                            >
                                                {month}-{String(selectedYear).slice(2)}
                                            </th>
                                        ))}
                                    </tr>

                                    {/* HEADER MINGGU */}
                                    <tr className="bg-[#0b1a4d]">
                                        {MONTHS.map((month) =>
                                            WEEKS.map((week) => (
                                                <th
                                                    key={`${month}-${week}`}
                                                    className="min-w-[44px] border-b border-r border-white/10 bg-[#0b1a4d] px-1 py-2 text-center text-[11px] font-semibold text-white/90"
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
                                            const docCount = mesin.dokumens?.length ?? 0;

                                            return (
                                                <React.Fragment key={mesin.id}>
                                                    {ITEMS.map((item, itemIndex) => {
                                                        const isPlan = item === 'plan';
                                                        const rowLine = isPlan ? 'border-slate-100' : 'border-slate-200';

                                                        return (
                                                            <tr
                                                                key={item}
                                                                className={`transition-colors duration-300 ${
                                                                    isPlan
                                                                        ? 'hover:bg-blue-50/40'
                                                                        : 'hover:bg-emerald-50/30'
                                                                }`}
                                                            >
                                                                {/* NO + MESIN: digabung per mesin */}
                                                                {itemIndex === 0 && groupSpan > 0 && (
                                                                    <>
                                                                        <td
                                                                            rowSpan={groupSpan}
                                                                            className="border-b border-r border-slate-100 bg-slate-50/80 px-4 py-3 text-center align-middle font-medium text-slate-500"
                                                                        >
                                                                            {nomorMesin.get(mesin.mesin)}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={groupSpan}
                                                                            className="border-b border-r border-slate-100 bg-slate-50/80 px-4 py-3 text-center align-middle font-semibold uppercase text-slate-700"
                                                                        >
                                                                            {mesin.mesin}
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {/* NAMA, TOTAL, STANDAR, DOKUMEN (gabung Plan+Act) */}
                                                                {itemIndex === 0 && (
                                                                    <>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border-b border-r border-slate-100 px-4 py-3 text-left align-middle font-medium text-slate-800"
                                                                        >
                                                                            {mesin.nama}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle text-slate-600"
                                                                        >
                                                                            {mesin.total_mesin}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle whitespace-nowrap text-slate-600"
                                                                        >
                                                                            {formatStandar(mesin)}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={2}
                                                                            className="border-b border-r border-slate-100 px-3 py-3 text-center align-middle"
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                title="Lihat / unggah dokumen"
                                                                                onClick={() => setDokumenMesinId(mesin.id)}
                                                                                className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border py-1 pl-3 pr-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                                                                                    docCount > 0
                                                                                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                                                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                                                                }`}
                                                                            >
                                                                                <Icon type="file" className="h-3.5 w-3.5" />
                                                                                <span>Dokumen</span>
                                                                                <span
                                                                                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${
                                                                                        docCount > 0
                                                                                            ? 'bg-blue-600 text-white'
                                                                                            : 'bg-slate-200 text-slate-500'
                                                                                    }`}
                                                                                >
                                                                                    {docCount}
                                                                                </span>
                                                                            </button>
                                                                        </td>
                                                                    </>
                                                                )}

                                                                {/* ITEM */}
                                                                <td
                                                                    className={`border-b border-r ${rowLine} px-3 py-2 text-center align-middle`}
                                                                >
                                                                    <span
                                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                                                                            isPlan
                                                                                ? 'bg-blue-50 text-blue-600'
                                                                                : 'bg-emerald-50 text-emerald-600'
                                                                        }`}
                                                                    >
                                                                        {isPlan ? 'PLAN' : 'ACT'}
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
                                                                                className={`border-b border-r ${rowLine} px-1.5 py-1.5 text-center transition-colors ${
                                                                                    checked
                                                                                        ? isPlan
                                                                                            ? 'bg-blue-50/60'
                                                                                            : 'bg-emerald-50/70'
                                                                                        : monthIndex === currentMonth
                                                                                        ? 'bg-blue-50/30'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                <div className="flex flex-col items-center gap-0.5">
                                                                                    <ScheduleMark
                                                                                        type={item}
                                                                                        checked={checked}
                                                                                        onToggle={() =>
                                                                                            toggleCheck(mesin, item, bulan, week)
                                                                                        }
                                                                                        title={`${
                                                                                            isPlan ? 'Plan' : 'Act'
                                                                                        } ${MONTHS_FULL[monthIndex]} minggu ${week}`}
                                                                                    />

                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            openCatatan(mesin, item, bulan, week)
                                                                                        }
                                                                                        className={`relative cursor-pointer rounded p-0.5 transition hover:scale-110 ${
                                                                                            hasCatatan
                                                                                                ? 'text-blue-600'
                                                                                                : 'text-slate-300 hover:text-slate-500'
                                                                                        }`}
                                                                                        title={
                                                                                            hasCatatan
                                                                                                ? 'Lihat catatan'
                                                                                                : 'Tambah catatan'
                                                                                        }
                                                                                    >
                                                                                        <Icon type="note" className="h-3.5 w-3.5" />
                                                                                        {hasCatatan && (
                                                                                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-red-500" />
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
                                                                        className="w-[96px] min-w-[96px] border-b border-slate-100 px-3 py-3 align-middle"
                                                                    >
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                title="Edit data"
                                                                                onClick={() => openEdit(mesin)}
                                                                                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0"
                                                                            >
                                                                                <Icon type="edit" className="h-4 w-4" />
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                title="Hapus data"
                                                                                onClick={() => confirmDelete(mesin)}
                                                                                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-500/30 active:translate-y-0"
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
                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Schedule Overhaul Mesin SC2
                        </p>
                    </div>
                </footer>
            </div>

            {/* SUCCESS TOAST */}
            {showSuccess && (
                <Toast
                    tone="emerald"
                    icon="check"
                    title="Berhasil"
                    message={successMessage}
                    onClose={() => setShowSuccess(false)}
                />
            )}

            {/* MODAL CATATAN */}
            {catatanModal && (
                <ModalShell onBackdrop={closeCatatan}>
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                                    <Icon type="note" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Catatan Overhaul</h2>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {MONTHS_FULL[catatanModal.bulan - 1]} {selectedYear} · Minggu{' '}
                                        {WEEK_LABEL[catatanModal.minggu]} ·{' '}
                                        <span
                                            className={`font-semibold ${
                                                catatanModal.item === 'plan' ? 'text-blue-600' : 'text-emerald-600'
                                            }`}
                                        >
                                            {catatanModal.item === 'plan' ? 'Plan' : 'ACT'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeCatatan}
                                aria-label="Tutup"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <Icon type="close" className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            {catatanModal.mesin.nama}
                        </p>
                    </div>

                    <div className="px-6 py-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Catatan</label>

                        <textarea
                            autoFocus
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveCatatan();
                            }}
                            rows="5"
                            placeholder="Tulis catatan untuk minggu ini..."
                            className={`${inputClass} resize-none py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10`}
                        />

                        <p className="mt-1.5 text-[11px] text-slate-400">Ctrl + Enter untuk menyimpan</p>
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
                            disabled={savingCatatan}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {savingCatatan ? 'Menyimpan...' : 'Simpan Catatan'}
                        </button>
                    </div>
                </ModalShell>
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

            {dokumenMesin && (
                <DokumenModal
                    mesin={dokumenMesin}
                    tahun={selectedYear}
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
