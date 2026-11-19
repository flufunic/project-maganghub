import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

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
    attach: {
        paths: [
            'M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32',
        ],
    },
    file: {
        paths: [
            'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z',
            'M14 3v5h5',
        ],
    },
    upload: { sw: 2, paths: ['M12 16V4m0 0 4 4m-4-4-4 4', 'M5 20h14'] },
    calendar: {
        rect: { x: 3.75, y: 4.5, width: 16.5, height: 16, rx: 2 },
        paths: ['M8 2.75v3.5M16 2.75v3.5M3.75 9h16.5'],
    },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4'],
    },
    bell: {
        paths: ['M15 17h5l-1.5-2v-4a6.5 6.5 0 00-13 0v4L4 17h5', 'M10 20h4'],
    },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    download: { sw: 2, paths: ['M12 3v12m0 0 4-4m-4 4-4-4', 'M5 21h14'] },
    send: { sw: 2, paths: ['M22 2 11 13', 'm22 2-7 20-4-9-9-4Z'] },
    approve: {
        sw: 2,
        paths: [
            'M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z',
        ],
    },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    schedule: {
        rect: { x: 3.5, y: 4.5, width: 17, height: 16, rx: 2 },
        paths: [
            'M8 2.5v4M16 2.5v4M3.5 9h17',
            'M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01',
        ],
    },
    list: { paths: ['M6 4.5h12M6 8.5h12M6 12.5h8M6 16.5h10'] },
    clock: { paths: ['M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'] },
    arrow: { sw: 2, paths: ['M5 12h14M13 6l6 6-6 6'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    copy: {
        paths: [
            'M8 8h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2z',
            'M4 16V6a2 2 0 012-2h10',
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
function ModalShell({ z = 'z-[90]', maxW = 'max-w-lg', children }) {
    return (
        <div
            className={`idx-fade fixed inset-0 ${z} flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm`}
        >
            <div
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
        <div className="idx-slide fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25">
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

const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

/* Warna & teks per jenis notifikasi jadwal / abnormality */
const NOTIF_STYLE = {
    abnormality: {
        bar: 'bg-red-400',
        icon: 'bg-red-50 text-red-600',
        teks: 'text-red-600',
        judul: 'Perlu Pengecekan Lebih Lanjut',
        label: 'Abnormality',
        iconType: 'alert',
    },
    terlambat: {
        bar: 'bg-amber-400',
        icon: 'bg-amber-50 text-amber-600',
        teks: 'text-amber-600',
        judul: 'Pengecekan Belum Dilakukan',
        label: 'Perlu perhatian',
        iconType: 'alert',
    },
    besok: {
        bar: 'bg-blue-400',
        icon: 'bg-blue-50 text-blue-600',
        teks: 'text-blue-600',
        judul: 'Pengecekan Besok',
        label: 'Besok',
        iconType: 'schedule',
    },
};

export default function Index({
    preventifMesins,
    flash,
    bulan,
    tahun,
    status,
    totalDotAll = 0,
    totalHotAll = 0,
    totalDotAct = 0,
    totalHotAct = 0,
    totalDotPlan = 0,
    totalHotPlan = 0,
    notifikasi = [],
}) {
    // =========================
    // BULAN CHECKLIST
    // =========================
    const { component, version } = usePage();

    const [selectedMonth, setSelectedMonth] = useState(Number(bulan) - 1);
    const [selectedYear, setSelectedYear] = useState(Number(tahun));

    const jumlahHari = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const tanggal = Array.from({ length: jumlahHari }, (_, index) => index + 1);

    // Pembagian kalender menjadi Week 1-5, masing-masing 7 tanggal.
    const weeks = Array.from(
        { length: Math.ceil(jumlahHari / 7) },
        (_, index) => ({
            number: index + 1,
            start: index * 7 + 1,
            end: Math.min((index + 1) * 7, jumlahHari),
            colSpan: Math.min(7, jumlahHari - index * 7),
        })
    );

    const getTanggalChecklist = (day) => {
        return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isTanggalPlan = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);

        return preventif.tanggal_plan?.includes(tanggalChecklist);
    };

    const formatJam = (value) => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return '-';
        }

        return `${number} jam`;
    };

    // =========================
    // STATE
    // =========================
    const [statusFilter, setStatusFilter] = useState(status ?? 'all');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showCatatan, setShowCatatan] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [catatan, setCatatan] = useState('');

    // Dialog konfirmasi umum: { title, message, confirmLabel, tone, onConfirm }
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Fokus dari klik notifikasi
    const [highlight, setHighlight] = useState(null);
    const [searching, setSearching] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // =========================
    // STATE EDIT BULANAN
    // =========================
    const [showBulanan, setShowBulanan] = useState(false);
    const [selectedBulanan, setSelectedBulanan] = useState(null);
    const [savingBulanan, setSavingBulanan] = useState(false);

    // Opsi "samakan dengan bulan sebelumnya"
    const [samakan, setSamakan] = useState(false);
    const [copyLoading, setCopyLoading] = useState(false);
    const [copyInfo, setCopyInfo] = useState(null); // { type: 'ok' | 'error', text }
    const [backupBulanan, setBackupBulanan] = useState(null);

    // Samakan SEMUA item dengan bulan sebelumnya: { phase, done, total } | null
    const [bulk, setBulk] = useState(null);
    const bulkCancelRef = useRef(false);
    const [formBulanan, setFormBulanan] = useState({
        item_preventif: '',
        durasi: '',
        total_durasi: '',
        dot: '',
        hot: '',
    });

    // =========================
    // STATE EDIT PLAN BULANAN
    // =========================
    const [showPlanEditor, setShowPlanEditor] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [draftPlanDates, setDraftPlanDates] = useState([]);
    const [savingPlan, setSavingPlan] = useState(false);

    // =========================
    // SUCCESS TOAST
    // =========================
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!showSuccess) {
            return;
        }

        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [showSuccess]);

    useEffect(() => {
        if (!warningMessage) {
            return;
        }

        const timer = setTimeout(() => setWarningMessage(''), 5000);

        return () => clearTimeout(timer);
    }, [warningMessage]);

    // =========================
    // CEK CHECKLIST
    // =========================
    const isChecked = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);

        return (
            preventif.checklists?.some((checklist) => {
                const tanggal = String(checklist.tanggal).substring(0, 10);

                return (
                    tanggal === tanggalChecklist && Boolean(checklist.status)
                );
            }) ?? false
        );
    };

    const getChecklist = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);

        return preventif.checklists?.find((checklist) => {
            const tanggal = String(checklist.tanggal).substring(0, 10);

            return tanggal === tanggalChecklist;
        });
    };

    // ACT = ada checklist yang dicentang di bulan yang sedang ditampilkan
    const getStatus = (preventif) => {
        const prefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

        const adaAct = (preventif.checklists ?? []).some((checklist) => {
            const tgl = String(checklist.tanggal).substring(0, 10);

            return tgl.startsWith(prefix) && Boolean(checklist.status);
        });

        return adaAct ? 'ACT' : 'Plan';
    };

    const filteredPreventifMesins = preventifMesins.data;

    // =========================
    // TOTAL DOT / HOT MENGIKUTI FILTER STATUS
    // =========================
    const totalsByStatus = {
        all: { dot: totalDotAll, hot: totalHotAll, label: 'Semua' },
        ACT: { dot: totalDotAct, hot: totalHotAct, label: 'ACT' },
        Plan: { dot: totalDotPlan, hot: totalHotPlan, label: 'Plan' },
    };

    const activeTotals = totalsByStatus[statusFilter] ?? totalsByStatus.all;

    // =========================
    // ROWSPAN DIVISI
    // =========================
    const getRowSpan = (data, index) => {
        const currentDivisi = data[index].divisi;

        if (index > 0 && data[index - 1].divisi === currentDivisi) {
            return 0;
        }

        let count = 1;

        for (let i = index + 1; i < data.length; i++) {
            if (data[i].divisi === currentDivisi) {
                count++;
            } else {
                break;
            }
        }

        return count;
    };

    // =========================
    // CHECKLIST ON / OFF
    // =========================
    const toggleChecklist = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);
        const checked = isChecked(preventif, day);

        router.post(
            `/preventif-mesin/${preventif.no}/checklist`,
            {
                tanggal: tanggalChecklist,
                status: !checked,
            },
            {
                preserveScroll: true,
            }
        );
    };

    // =========================
    // EDIT PLAN BULANAN
    // =========================
    const openPlanEditor = (preventif) => {
        setSelectedPlan(preventif);
        setDraftPlanDates([...(preventif.tanggal_plan ?? [])]);
        setShowPlanEditor(true);
    };

    const closePlanEditor = () => {
        if (savingPlan) return;
        setShowPlanEditor(false);
        setSelectedPlan(null);
        setDraftPlanDates([]);
    };

    const toggleDraftPlanDate = (day) => {
        const date = getTanggalChecklist(day);

        setDraftPlanDates((current) =>
            current.includes(date)
                ? current.filter((item) => item !== date)
                : [...current, date].sort()
        );
    };

    const savePlan = () => {
        if (!selectedPlan) return;

        setSavingPlan(true);

        router.put(
            `/preventif-mesin/${selectedPlan.no}/plan`,
            {
                bulan: selectedMonth + 1,
                tahun: selectedYear,
                tanggal_plan: [...draftPlanDates].sort(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPlanEditor(false);
                    setSelectedPlan(null);
                    setDraftPlanDates([]);
                },
                onFinish: () => setSavingPlan(false),
            }
        );
    };

    // =========================
    // MODAL CATATAN
    // =========================
    const openCatatan = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);
        const checklist = getChecklist(preventif, day);

        setSelectedChecklist({
            preventif,
            tanggal: tanggalChecklist,
            day,
        });

        setCatatan(checklist?.catatan || '');
        setShowCatatan(true);
    };

    const closeCatatan = () => {
        setShowCatatan(false);
        setSelectedChecklist(null);
        setCatatan('');
    };

    const saveCatatan = () => {
        if (!selectedChecklist) {
            return;
        }

        const { preventif, tanggal, day } = selectedChecklist;

        const checked = isChecked(preventif, day);

        router.post(
            `/preventif-mesin/${preventif.no}/checklist`,
            {
                tanggal,
                status: checked,
                catatan,
            },
            {
                preserveScroll: true,
                onSuccess: () => closeCatatan(),
            }
        );
    };

    // =========================
    // MODAL EDIT BULANAN
    // =========================
    const openBulanan = (preventif) => {
        setSelectedBulanan(preventif);
        setSamakan(false);
        setCopyLoading(false);
        setCopyInfo(null);
        setBackupBulanan(null);

        setFormBulanan({
            item_preventif: preventif.item_preventif ?? '',
            durasi: preventif.durasi ?? '',
            total_durasi: preventif.total_durasi ?? '',
            dot: preventif.dot ?? '',
            hot: preventif.hot ?? '',
        });

        setShowBulanan(true);
    };

    const closeBulanan = () => {
        setShowBulanan(false);
        setSelectedBulanan(null);
        setSavingBulanan(false);
        setSamakan(false);
        setCopyLoading(false);
        setCopyInfo(null);
        setBackupBulanan(null);
    };

    const submitBulanan = (payload) => {
        if (!selectedBulanan) {
            return;
        }

        setSavingBulanan(true);

        router.put(
            `/preventif-mesin/${selectedBulanan.no}/bulanan`,
            {
                ...payload,
                bulan: selectedMonth + 1,
                tahun: selectedYear,
            },
            {
                preserveScroll: true,
                onSuccess: () => closeBulanan(),
                onFinish: () => setSavingBulanan(false),
            }
        );
    };

    // =========================
    // SAMAKAN DENGAN BULAN SEBELUMNYA
    // Mengambil Durasi, Total Durasi, DOT, HOT item ini dari bulan sebelumnya
    // =========================
    const bulanLaluIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const tahunBulanLalu = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const labelBulanLalu = `${months[bulanLaluIndex]} ${tahunBulanLalu}`;

    const ambilDataPeriode = async (month, year, pageNumber) => {
        const query = new URLSearchParams({
            bulan: String(month + 1),
            tahun: String(year),
            status: 'all',
            page: String(pageNumber),
        });

        const response = await fetch(`/preventif-mesin?${query.toString()}`, {
            credentials: 'same-origin',
            headers: {
                Accept: 'text/html, application/xhtml+xml',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Inertia': 'true',
                'X-Inertia-Version': version ?? '',
                'X-Inertia-Partial-Component': component,
                'X-Inertia-Partial-Data': 'preventifMesins',
            },
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }

        const json = await response.json();

        return json.props?.preventifMesins;
    };

    const toggleSamakan = async () => {
        if (copyLoading || !selectedBulanan) {
            return;
        }

        // Matikan: kembalikan nilai yang tadi diisi manual
        if (samakan) {
            if (backupBulanan) {
                setFormBulanan(backupBulanan);
            }

            setSamakan(false);
            setCopyInfo(null);
            setBackupBulanan(null);

            return;
        }

        setCopyLoading(true);
        setCopyInfo(null);

        try {
            const target = { no: selectedBulanan.no };
            const halamanAwal = preventifMesins.current_page ?? 1;

            const first = await ambilDataPeriode(bulanLaluIndex, tahunBulanLalu, halamanAwal);

            let row = findRowIn(first?.data, target);

            for (let p = 1; !row && p <= (first?.last_page ?? 1); p++) {
                if (p === halamanAwal) {
                    continue;
                }

                const data = await ambilDataPeriode(bulanLaluIndex, tahunBulanLalu, p);

                row = findRowIn(data?.data, target);
            }

            if (!row) {
                setCopyInfo({
                    type: 'error',
                    text: `Data ${labelBulanLalu} untuk item ini tidak ditemukan.`,
                });

                return;
            }

            const nilai = {
                durasi: row.durasi ?? '',
                total_durasi: row.total_durasi ?? '',
                dot: row.dot ?? '',
                hot: row.hot ?? '',
            };

            const semuaKosong = Object.values(nilai).every(
                (v) => v === '' || v === null
            );

            if (semuaKosong) {
                setCopyInfo({
                    type: 'error',
                    text: `${labelBulanLalu} belum punya nilai Durasi, DOT, atau HOT.`,
                });

                return;
            }

            setBackupBulanan(formBulanan);
            setFormBulanan({ ...formBulanan, ...nilai });
            setSamakan(true);
            setCopyInfo({
                type: 'ok',
                text: `Nilai diambil dari ${labelBulanLalu}. Klik Simpan untuk menerapkan.`,
            });
        } catch (error) {
            setCopyInfo({
                type: 'error',
                text: 'Gagal mengambil data bulan sebelumnya. Coba lagi.',
            });
        } finally {
            setCopyLoading(false);
        }
    };

    // =========================
    // SAMAKAN SEMUA ITEM DENGAN BULAN SEBELUMNYA
    // =========================
    const ambilSemuaItem = async (month, year) => {
        const first = await ambilDataPeriode(month, year, 1);
        const rows = [...(first?.data ?? [])];
        const last = first?.last_page ?? 1;

        if (last > 1) {
            const rest = await Promise.all(
                Array.from({ length: last - 1 }, (_, i) =>
                    ambilDataPeriode(month, year, i + 2)
                )
            );

            rest.forEach((page) => rows.push(...(page?.data ?? [])));
        }

        return rows;
    };

    // Kirim satu item; resolve true kalau berhasil
    const putBulanan = (no, payload) =>
        new Promise((resolve) => {
            let ok = true;

            router.put(`/preventif-mesin/${no}/bulanan`, payload, {
                preserveScroll: true,
                preserveState: true,
                only: ['errors'],
                onError: () => {
                    ok = false;
                },
                onFinish: () => resolve(ok),
            });
        });

    const samakanSemuaItem = async () => {
        if (bulk) {
            return;
        }

        bulkCancelRef.current = false;
        setBulk({ phase: 'Mengambil data...', done: 0, total: 0 });

        try {
            const [bulanIni, bulanLalu] = await Promise.all([
                ambilSemuaItem(selectedMonth, selectedYear),
                ambilSemuaItem(bulanLaluIndex, tahunBulanLalu),
            ]);

            const peta = new Map(bulanLalu.map((row) => [String(row.no), row]));

            const antrean = bulanIni
                .map((row) => {
                    const prev = peta.get(String(row.no));

                    if (!prev) {
                        return null;
                    }

                    const nilai = {
                        durasi: prev.durasi ?? '',
                        total_durasi: prev.total_durasi ?? '',
                        dot: prev.dot ?? '',
                        hot: prev.hot ?? '',
                    };

                    const kosong = Object.values(nilai).every(
                        (v) => v === '' || v === null
                    );

                    return kosong ? null : { row, nilai };
                })
                .filter(Boolean);

            if (antrean.length === 0) {
                setBulk(null);
                setWarningMessage(
                    `Tidak ada item yang bisa disamakan. ${labelBulanLalu} belum punya nilai Durasi, DOT, atau HOT.`
                );

                return;
            }

            let berhasil = 0;
            let gagal = 0;

            for (let i = 0; i < antrean.length; i++) {
                if (bulkCancelRef.current) {
                    break;
                }

                setBulk({
                    phase: 'Menyamakan item...',
                    done: i,
                    total: antrean.length,
                });

                const { row, nilai } = antrean[i];

                const ok = await putBulanan(row.no, {
                    item_preventif: row.item_preventif ?? '',
                    ...nilai,
                    bulan: selectedMonth + 1,
                    tahun: selectedYear,
                });

                if (ok) {
                    berhasil++;
                } else {
                    gagal++;
                }
            }

            const dibatalkan = bulkCancelRef.current;

            setBulk({
                phase: 'Memuat ulang tabel...',
                done: berhasil + gagal,
                total: antrean.length,
            });

            await new Promise((resolve) =>
                router.reload({
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: resolve,
                })
            );

            setBulk(null);

            if (gagal > 0) {
                setWarningMessage(
                    `${berhasil} item berhasil, ${gagal} item gagal disamakan dengan ${labelBulanLalu}.`
                );
            } else {
                setSuccessMessage(
                    dibatalkan
                        ? `Dibatalkan. ${berhasil} dari ${antrean.length} item sudah disamakan dengan ${labelBulanLalu}.`
                        : `${berhasil} item berhasil disamakan dengan ${labelBulanLalu}.`
                );
                setShowSuccess(true);
            }
        } catch (error) {
            setBulk(null);
            setWarningMessage('Gagal menyamakan data dengan bulan sebelumnya. Coba lagi.');
        }
    };

    const konfirmasiSamakanSemua = () => {
        setConfirmDialog({
            title: 'Samakan semua item dengan bulan sebelumnya?',
            message: `Durasi, Total Durasi, DOT & HOT semua item di ${months[selectedMonth]} ${selectedYear} akan diisi sama seperti ${labelBulanLalu}. Nilai yang sudah ada akan ditimpa.`,
            confirmLabel: 'Ya, Samakan Semua',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                samakanSemuaItem();
            },
        });
    };

    const saveBulanan = () => {
        setConfirmDialog({
            title: 'Simpan perubahan?',
            message: 'Apakah kamu yakin ingin menyimpan data ini?',
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                submitBulanan(formBulanan);
            },
        });
    };

    const resetBulanan = () => {
        setConfirmDialog({
            title: 'Kosongkan data bulan ini?',
            message: `Semua data ${months[selectedMonth]} ${selectedYear} untuk item ini akan dihapus.`,
            confirmLabel: 'Ya, Kosongkan',
            tone: 'red',
            onConfirm: () => {
                setConfirmDialog(null);
                submitBulanan({
                    item_preventif: '',
                    durasi: '',
                    total_durasi: '',
                    dot: '',
                    hot: '',
                });
            },
        });
    };

    // =========================
    // KONFIRMASI HAPUS
    // =========================
    const confirmDelete = (preventif) => {
        setConfirmDialog({
            title: 'Hapus data?',
            message: `Apakah kamu yakin ingin menghapus ${preventif.item_preventif}`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/preventif-mesin/${preventif.no}`, {
                    preserveScroll: true,
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    // =========================
    // FILTER / PERIODE
    // =========================
    const visitPeriode = (month, year, nextStatus) => {
        router.get(
            '/preventif-mesin',
            {
                bulan: month + 1,
                tahun: year,
                status: nextStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // =========================
    // FOKUS KE DATA DARI NOTIFIKASI
    // Otomatis pindah bulan/tahun + mencari ke semua halaman pagination
    // =========================
    const findRowIn = (data, target) => {
        return (data ?? []).find((item) => {
            if (target.no !== null && target.no !== undefined) {
                return String(item.no) === String(target.no);
            }

            return (
                String(item.no_item) === String(target.no_item) &&
                String(item.divisi) === String(target.divisi)
            );
        });
    };

    const visitPage = (month, year, nextStatus, pageNumber) => {
        return new Promise((resolve) => {
            router.get(
                '/preventif-mesin',
                {
                    bulan: month + 1,
                    tahun: year,
                    status: nextStatus,
                    page: pageNumber,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onSuccess: (page) => resolve(page.props),
                    onError: () => resolve(null),
                    onCancel: () => resolve(null),
                }
            );
        });
    };

    const handleNotifClick = async (notif) => {
        setShowNotifications(false);

        if (searching) {
            return;
        }

        const [year, month, day] = String(notif.tanggal)
            .substring(0, 10)
            .split('-')
            .map(Number);

        if (!year || !month || !day) {
            return;
        }

        const target = {
            no: notif.no ?? notif.preventif_no ?? null,
            no_item: notif.no_item,
            divisi: notif.divisi,
        };

        const bedaPeriode =
            month - 1 !== selectedMonth ||
            year !== selectedYear ||
            statusFilter !== 'all';

        // 1) Periode sama: cek dulu di halaman yang sedang tampil
        if (!bedaPeriode) {
            const row = findRowIn(preventifMesins.data, target);

            if (row) {
                setHighlight({ no: row.no, day });
                return;
            }
        }

        // 2) Belum ketemu: cari ke halaman lain
        setSearching(true);
        setSelectedMonth(month - 1);
        setSelectedYear(year);
        setStatusFilter('all');

        const sudahDicek = new Set();

        if (!bedaPeriode) {
            sudahDicek.add(preventifMesins.current_page ?? 1);
        }

        let lastPage = bedaPeriode ? 1 : preventifMesins.last_page ?? 1;
        let found = null;

        for (let p = 1; p <= lastPage; p++) {
            if (sudahDicek.has(p)) {
                continue;
            }

            const props = await visitPage(month - 1, year, 'all', p);

            if (!props) {
                break;
            }

            sudahDicek.add(p);
            lastPage = props.preventifMesins?.last_page ?? lastPage;

            const row = findRowIn(props.preventifMesins?.data, target);

            if (row) {
                found = row;
                break;
            }
        }

        setSearching(false);

        if (found) {
            setTimeout(() => setHighlight({ no: found.no, day }), 150);
        } else {
            setWarningMessage(
                `Data No. ${target.no_item} (${target.divisi}) tidak ditemukan di bulan ${months[month - 1]} ${year}.`
            );
        }
    };

    // Scroll ke kotak tanggal + hilangkan sorotan setelah 5 detik
    useEffect(() => {
        if (!highlight) {
            return;
        }

        const scrollTimer = setTimeout(() => {
            const cell = document.getElementById(
                `cell-${highlight.no}-${highlight.day}`
            );

            cell?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }, 150);

        const clearTimer = setTimeout(() => setHighlight(null), 5000);

        return () => {
            clearTimeout(scrollTimer);
            clearTimeout(clearTimer);
        };
    }, [highlight]);

    // =========================
    // HITUNG NOTIFIKASI
    // =========================
    const jumlahAbnormality = notifikasi.filter(
        (item) => item.tipe === 'abnormality'
    ).length;

    const jumlahJadwal = notifikasi.length - jumlahAbnormality;

    const totalNotif = notifikasi.length;

    const bulananFields = [
        { name: 'durasi', label: 'Durasi' },
        { name: 'total_durasi', label: 'Total Durasi' },
        { name: 'dot', label: 'DOT' },
        { name: 'hot', label: 'HOT' },
    ];

    // Kartu ringkasan (hanya tampilan, memakai data yang sudah ada)
    const stats = [
        {
            label: 'Total item',
            value: preventifMesins.total,
            hint: `${months[selectedMonth]} ${selectedYear}`,
            icon: 'list',
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: `DOT · ${activeTotals.label}`,
            value: formatJam(activeTotals.dot),
            hint: 'Downtime terjadwal',
            icon: 'clock',
            tone: 'from-violet-500 to-purple-600',
            soft: 'bg-violet-50 text-violet-600',
        },
        {
            label: `HOT · ${activeTotals.label}`,
            value: formatJam(activeTotals.hot),
            hint: 'Jam kerja preventif',
            icon: 'clock',
            tone: 'from-cyan-500 to-sky-600',
            soft: 'bg-cyan-50 text-cyan-600',
        },
        {
            label: 'Perlu perhatian',
            value: totalNotif,
            hint: `${jumlahAbnormality} abnormality · ${jumlahJadwal} jadwal`,
            icon: 'bell',
            tone: totalNotif > 0 ? 'from-rose-500 to-red-600' : 'from-emerald-500 to-green-600',
            soft: totalNotif > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
        },
    ];

    const delay = (ms) => ({ animationDelay: `${ms}ms` });

    return (
        <>
            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
            <Head title="Data Preventif Mesin" />

            <style>{`
                @keyframes idxRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes idxDrop { from { opacity: 0; transform: translateY(-8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
                @keyframes idxFloatReverse { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
                @keyframes idxShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes idxCheck { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.18); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes idxWiggle { 0%,100% { transform: rotate(0); } 15% { transform: rotate(14deg); } 30% { transform: rotate(-12deg); } 45% { transform: rotate(8deg); } 60% { transform: rotate(-6deg); } 75% { transform: rotate(0); } }
                @keyframes idxPing { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(2.2); opacity: 0; } }
                @keyframes idxPulse {
                    0%,100% { box-shadow: inset 0 0 0 2px rgba(245,158,11,.95), 0 0 0 0 rgba(245,158,11,.55); }
                    50% { box-shadow: inset 0 0 0 2px rgba(245,158,11,.95), 0 0 0 7px rgba(245,158,11,0); }
                }
                @keyframes idxSpin { to { transform: rotate(360deg); } }

                .idx-rise { animation: idxRise .7s cubic-bezier(.22,1,.36,1) both; }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-slide { animation: idxSlide .45s cubic-bezier(.22,1,.36,1) both; }
                .idx-drop { animation: idxDrop .22s ease-out both; transform-origin: top right; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-shimmer { background-size: 200% 100%; animation: idxShimmer 6s linear infinite; }
                .idx-check { animation: idxCheck .35s cubic-bezier(.22,1,.36,1) both; }
                .idx-wiggle { animation: idxWiggle 1.6s ease-in-out infinite; transform-origin: 50% 10%; }
                .idx-ping { animation: idxPing 1.8s ease-out infinite; }
                .idx-pulse { animation: idxPulse 1.2s ease-in-out infinite; }
                .idx-spin { animation: idxSpin .8s linear infinite; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                .idx-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

                @media (prefers-reduced-motion: reduce) {
                    .idx-rise, .idx-fade, .idx-pop, .idx-slide, .idx-drop,
                    .idx-float, .idx-float-reverse, .idx-shimmer, .idx-check,
                    .idx-wiggle, .idx-ping, .idx-pulse { animation: none !important; }
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
                            backgroundImage:
                                'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
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
                        <div className="flex items-center justify-between gap-4">
                            {/* LEFT */}
                            <div className="flex min-w-0 items-center gap-3">
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
                                        Schedule Preventif Mesin
                                    </h1>
                                    <p className="truncate text-xs text-blue-200/80">
                                        {months[selectedMonth]} {selectedYear}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="relative flex shrink-0 items-center">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNotifications(!showNotifications)
                                        }
                                        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 text-white transition-all duration-200 active:scale-95 ${
                                            totalNotif > 0
                                                ? 'bg-white/20 hover:bg-white/30'
                                                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                                        }`}
                                        title="Notifikasi"
                                        aria-label="Notifikasi"
                                    >
                                        <Icon
                                            type="bell"
                                            className={`h-5 w-5 ${
                                                totalNotif > 0
                                                    ? 'idx-wiggle drop-shadow-[0_0_6px_rgba(147,197,253,0.8)]'
                                                    : ''
                                            }`}
                                        />

                                        {totalNotif > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center">
                                                <span className="idx-ping absolute inset-0 rounded-full bg-red-500/70" />
                                                <span className="relative flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#0b1d57] bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[9px] font-extrabold text-white shadow-md">
                                                    {totalNotif > 99 ? '99+' : totalNotif}
                                                </span>
                                            </span>
                                        )}
                                    </button>

                                    {/* =================================================
                                        DROPDOWN NOTIFIKASI
                                    ================================================== */}
                                    {showNotifications && (
                                        <div className="idx-drop absolute right-0 top-12 z-[80] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/30">
                                            {/* HEADER */}
                                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                        <Icon type="bell" className="h-4 w-4" />
                                                    </span>

                                                    <div>
                                                        <h3 className="text-sm font-bold leading-tight text-slate-800">
                                                            Notifikasi
                                                        </h3>

                                                        <p className="text-[11px] leading-tight text-slate-400">
                                                            Jadwal & aktivitas preventif
                                                        </p>
                                                    </div>
                                                </div>

                                                {totalNotif > 0 && (
                                                    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-[11px] font-semibold">
                                                        {jumlahAbnormality > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-red-500">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                {jumlahAbnormality} abnormality
                                                            </span>
                                                        )}

                                                        {jumlahJadwal > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-amber-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                {jumlahJadwal} jadwal
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ISI */}
                                            <div className="idx-scroll max-h-[420px] overflow-y-auto">
                                                {notifikasi.map((notif, index) => {
                                                    const abnormal = notif.tipe === 'abnormality';
                                                    const gaya =
                                                        NOTIF_STYLE[notif.tipe] ?? NOTIF_STYLE.besok;

                                                    return (
                                                        <div
                                                            key={`${notif.tipe}-${notif.tanggal}-${notif.no_item}-${index}`}
                                                            role="button"
                                                            tabIndex={0}
                                                            title="Klik untuk melihat data"
                                                            onClick={() => handleNotifClick(notif)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    handleNotifClick(notif);
                                                                }
                                                            }}
                                                            className="idx-rise group/notif relative cursor-pointer border-b border-slate-100 bg-white px-4 py-3 pl-5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
                                                            style={delay(Math.min(index, 6) * 40)}
                                                        >
                                                            <span
                                                                className={`absolute left-0 top-0 h-full w-1 ${gaya.bar}`}
                                                            />

                                                            <div className="flex items-start gap-3">
                                                                <span
                                                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${gaya.icon}`}
                                                                >
                                                                    <Icon
                                                                        type={gaya.iconType}
                                                                        className="h-4 w-4"
                                                                    />
                                                                </span>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-baseline justify-between gap-2">
                                                                        <p className="text-xs font-bold text-slate-800">
                                                                            {gaya.judul}
                                                                        </p>

                                                                        <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                                                                            {notif.divisi}
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                                                        {notif.pesan}
                                                                    </p>

                                                                    {abnormal && (
                                                                        <>
                                                                            <p className="mt-2 border-l-2 border-red-200 pl-2.5 text-[11px] leading-relaxed text-slate-600">
                                                                                <span className="font-bold text-red-500">
                                                                                    Item:
                                                                                </span>{' '}
                                                                                {notif.item_preventif}
                                                                                <br />
                                                                                <span className="font-bold text-red-500">
                                                                                    Abnormality:
                                                                                </span>{' '}
                                                                                {notif.abnormality}
                                                                            </p>

                                                                            {notif.url && (
                                                                                <Link
                                                                                    href={notif.url}
                                                                                    onClick={(e) =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                    className="mt-1.5 inline-block text-[11px] font-semibold text-blue-600 hover:underline"
                                                                                >
                                                                                    Buka checksheet →
                                                                                </Link>
                                                                            )}
                                                                        </>
                                                                    )}

                                                                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                                                                        <span className="font-medium text-slate-400">
                                                                            No. {notif.no_item}
                                                                            <span className="mx-1.5 text-slate-300">
                                                                                ·
                                                                            </span>
                                                                            <span
                                                                                className={`font-semibold ${gaya.teks}`}
                                                                            >
                                                                                {gaya.label}
                                                                            </span>
                                                                        </span>

                                                                        <Icon
                                                                            type="arrow"
                                                                            className="h-3.5 w-3.5 text-slate-300 transition-all duration-200 group-hover/notif:translate-x-0.5 group-hover/notif:text-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* EMPTY STATE */}
                                                {notifikasi.length === 0 && (
                                                    <div className="flex flex-col items-center px-6 py-10 text-center">
                                                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                                                            <Icon type="check" className="h-6 w-6" />
                                                        </span>

                                                        <p className="text-sm font-bold text-slate-700">
                                                            Semua aman
                                                        </p>

                                                        <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-slate-400">
                                                            Belum ada jadwal atau aktivitas yang perlu diperhatikan.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* FOOTER */}
                                            {totalNotif > 0 && (
                                                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                    <span className="text-[11px] font-medium text-slate-400">
                                                        Klik notifikasi untuk membuka datanya
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                <div
                                    className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.tone}`}
                                />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900">
                                            {item.value}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                            {item.hint}
                                        </p>
                                    </div>

                                    <span
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${item.soft}`}
                                    >
                                        <Icon type={item.icon} className="h-5 w-5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOOLBAR */}
                    <div
                        style={delay(280)}
                        className={`idx-rise mb-4 ${card}`}
                    >
                        <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
                            {/* LEFT - INFO */}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                        Checklist {months[selectedMonth]} {selectedYear}
                                    </h2>

                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {preventifMesins.total} data
                                    </span>

                                    {jumlahAbnormality > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="idx-ping absolute inset-0 rounded-full bg-red-500" />
                                                <span className="relative h-1.5 w-1.5 rounded-full bg-red-500" />
                                            </span>
                                            {jumlahAbnormality} abnormality terbuka
                                        </span>
                                    )}
                                </div>

                                {/* LEGENDA */}
                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-4 w-4 rounded-full border-2 border-blue-400 bg-blue-50" />
                                        Jadwal plan
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
                                <Field label="Status">
                                    <div className="inline-flex h-9 items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                                        {[
                                            { value: 'all', label: 'Semua' },
                                            { value: 'ACT', label: 'ACT' },
                                            { value: 'Plan', label: 'Plan' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter(opt.value);
                                                    visitPeriode(
                                                        selectedMonth,
                                                        selectedYear,
                                                        opt.value
                                                    );
                                                }}
                                                className={`h-8 cursor-pointer rounded-md px-3 text-xs font-semibold transition-all duration-200 ${
                                                    statusFilter === opt.value
                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                <Field label="Bulan">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            const month = Number(e.target.value);

                                            setSelectedMonth(month);
                                            visitPeriode(
                                                month,
                                                selectedYear,
                                                statusFilter
                                            );
                                        }}
                                        className={selectClass}
                                    >
                                        {months.map((month, index) => (
                                            <option key={index} value={index}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Tahun">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            const year = Number(e.target.value);

                                            setSelectedYear(year);
                                            visitPeriode(
                                                selectedMonth,
                                                year,
                                                statusFilter
                                            );
                                        }}
                                        className={selectClass}
                                    >
                                        {Array.from(
                                            { length: 16 },
                                            (_, index) => 2020 + index
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <button
                                    type="button"
                                    onClick={konfirmasiSamakanSemua}
                                    disabled={Boolean(bulk)}
                                    title={`Samakan Durasi, Total Durasi, DOT & HOT semua item dengan ${labelBulanLalu}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3.5 text-xs font-semibold text-violet-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                >
                                    <Icon type="copy" className="h-4 w-4" />
                                    Samakan bulan lalu
                                </button>

                                <a
                                    href={`/preventif-mesin/export?bulan=${selectedMonth + 1}&tahun=${selectedYear}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-0"
                                >
                                    <Icon type="download" className="h-4 w-4" />
                                    Excel
                                </a>

                                <Link
                                    href="/preventif-mesin/create"
                                    className="group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                                >
                                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                    <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                    <span className="relative">Tambah</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div
                        style={delay(360)}
                        className={`idx-rise overflow-hidden ${card}`}
                    >
                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead className="text-white">
                                    {/* HEADER UTAMA */}
                                    <tr className="bg-[#0b1a4d]">
                                        {[
                                            'Divisi',
                                            'No',
                                            'Item Preventif',
                                            'Periode',
                                            'Durasi',
                                            'Total Durasi',
                                            'DOT',
                                            'HOT',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                rowSpan="3"
                                                className={`border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3 text-xs font-semibold whitespace-nowrap ${
                                                    header === 'Item Preventif'
                                                        ? 'min-w-[300px] text-left'
                                                        : 'text-center'
                                                }`}
                                            >
                                                {header}
                                            </th>
                                        ))}

                                        <th
                                            rowSpan="3"
                                            className="border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3 text-center text-xs font-semibold whitespace-nowrap"
                                        >
                                            Status
                                        </th>

                                        <th
                                            colSpan={jumlahHari}
                                            className="border-b border-white/10 bg-[#0b1a4d] px-4 py-2 text-center"
                                        >
                                            <span className="text-xs font-semibold tracking-wide text-white">
                                                Jadwal Checklist · {months[selectedMonth]} {selectedYear}
                                            </span>
                                        </th>

                                        <th
                                            rowSpan="3"
                                            className="w-[120px] min-w-[120px] border-b border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-3 py-3 text-center text-xs font-semibold whitespace-nowrap"
                                        >
                                            Aksi
                                        </th>
                                    </tr>

                                    {/* HEADER MINGGU */}
                                    <tr className="bg-[#13285f]">
                                        {weeks.map((week) => (
                                            <th
                                                key={week.number}
                                                colSpan={week.colSpan}
                                                className="border-b border-r border-white/10 bg-[#16307a] px-2 py-1.5 text-center text-[11px] font-semibold text-blue-100"
                                            >
                                                Week {week.number}
                                            </th>
                                        ))}
                                    </tr>

                                    {/* HEADER TANGGAL */}
                                    <tr className="bg-[#0b1a4d]">
                                        {tanggal.map((day) => (
                                            <th
                                                key={day}
                                                className="min-w-[50px] border-b border-r border-white/10 bg-[#0b1a4d] px-2 py-2 text-center text-[11px] font-semibold text-white/90"
                                            >
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredPreventifMesins.length > 0 ? (
                                        <>
                                            {filteredPreventifMesins.map(
                                                (preventif, index) => {
                                                    const rowSpan = getRowSpan(
                                                        filteredPreventifMesins,
                                                        index
                                                    );
                                                    const rowHighlighted = highlight?.no === preventif.no;
                                                    const adaAbnormality =
                                                        (preventif.abnormalitas_terbuka?.length ?? 0) > 0;
                                                    const planManual = Boolean(preventif.punya_plan_manual);

                                                    return (
                                                        <React.Fragment key={preventif.no}>
                                                            {/* BARIS PLAN */}
                                                            <tr
                                                                id={`row-${preventif.no}`}
                                                                className={`group transition-colors duration-300 ${
                                                                    rowHighlighted
                                                                        ? 'bg-amber-100/70'
                                                                        : adaAbnormality
                                                                        ? 'bg-red-50/40'
                                                                        : 'hover:bg-blue-50/40'
                                                                }`}
                                                            >
                                                                {rowSpan > 0 && (
                                                                    <td
                                                                        rowSpan={rowSpan * 2}
                                                                        className="border-b border-r border-slate-100 bg-slate-50/80 px-4 py-3 text-center align-middle font-semibold text-slate-700"
                                                                    >
                                                                        {preventif.divisi}
                                                                    </td>
                                                                )}

                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle font-medium text-slate-500">
                                                                    {preventif.no_item}
                                                                </td>

                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 align-middle text-slate-700">
                                                                    <div className="max-w-[360px] whitespace-normal leading-relaxed">
                                                                        <span className="font-medium text-slate-800">
                                                                            {preventif.item_preventif}
                                                                        </span>

                                                                        {preventif.item_preventif_master &&
                                                                            preventif.item_preventif !== preventif.item_preventif_master && (
                                                                                <span className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 align-middle text-[10px] font-semibold text-violet-600">
                                                                                    Khusus bulan ini
                                                                                </span>
                                                                            )}

                                                                        {adaAbnormality && (
                                                                            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                                                                                <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                                                                                    <Icon type="alert" className="h-3.5 w-3.5" />
                                                                                    Perlu pengecekan lebih lanjut
                                                                                </p>
                                                                                <ul className="mt-1 space-y-1.5">
                                                                                    {preventif.abnormalitas_terbuka.map((a) => (
                                                                                        <li key={a.id} className="text-[11px] leading-relaxed text-slate-600">
                                                                                            <span className="font-semibold text-slate-700">{a.tanggal_format}</span>
                                                                                            {a.mesin ? ` · ${a.mesin}` : ''}
                                                                                            {' — '}{a.abnormality}{' '}
                                                                                            <Link href={a.url} className="font-semibold text-blue-600 hover:underline">
                                                                                                Lihat checksheet
                                                                                            </Link>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle whitespace-nowrap text-slate-600">
                                                                    {preventif.periode_nilai !== null && preventif.periode_nilai !== undefined && preventif.periode_nilai !== ''
                                                                        ? `${parseFloat(preventif.periode_nilai)} ${preventif.periode_satuan || ''}`
                                                                        : '-'}
                                                                </td>
                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle whitespace-nowrap text-slate-600">
                                                                    {formatJam(preventif.durasi)}
                                                                </td>
                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle whitespace-nowrap text-slate-600">
                                                                    {formatJam(preventif.total_durasi)}
                                                                </td>
                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle whitespace-nowrap text-slate-600">
                                                                    {formatJam(preventif.dot)}
                                                                </td>
                                                                <td rowSpan={2} className="border-b border-r border-slate-100 px-4 py-3 text-center align-middle whitespace-nowrap text-slate-600">
                                                                    {formatJam(preventif.hot)}
                                                                </td>

                                                                <td className="border-b border-r border-slate-100 px-3 py-2 text-center align-middle">
                                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600">
                                                                        PLAN
                                                                    </span>
                                                                </td>

                                                                {tanggal.map((day) => {
                                                                    const plan = isTanggalPlan(preventif, day);
                                                                    const cellHighlighted = rowHighlighted && highlight?.day === day;

                                                                    return (
                                                                        <td
                                                                            key={`plan-${day}`}
                                                                            id={`plan-cell-${preventif.no}-${day}`}
                                                                            className={`border-b border-r border-slate-100 px-1.5 py-2 text-center ${
                                                                                cellHighlighted ? 'bg-amber-100' : plan ? 'bg-blue-50/50' : ''
                                                                            }`}
                                                                        >
                                                                            <div
                                                                                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                                                                                    plan
                                                                                        ? 'border-blue-300 bg-blue-50 text-blue-500'
                                                                                        : 'border-slate-200 bg-white text-transparent'
                                                                                }`}
                                                                                title={plan ? 'Plan' : 'Tidak ada Plan'}
                                                                            >
                                                                                {plan ? (
                                                                                    <span className="text-lg font-bold leading-none">○</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}

                                                                <td
                                                                    rowSpan={2}
                                                                    className="w-[120px] min-w-[120px] border-b border-slate-100 px-3 py-3 align-middle"
                                                                >
                                                                    <div className="mx-auto grid w-full grid-cols-2 place-items-center gap-2">
                                                                        {/* EDIT PLAN */}
                                                                        <button
                                                                            type="button"
                                                                            title={`Edit Plan ${months[selectedMonth]} ${selectedYear}`}
                                                                            onClick={() => openPlanEditor(preventif)}
                                                                            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0"
                                                                        >
                                                                            <Icon type="calendar" className="h-4 w-4" />
                                                                        </button>

                                                                        {/* EDIT DURASI */}
                                                                        <button
                                                                            type="button"
                                                                            title={`Isi durasi, DOT & HOT ${months[selectedMonth]} ${selectedYear}`}
                                                                            onClick={() => openBulanan(preventif)}
                                                                            className="relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:text-white hover:shadow-md hover:shadow-violet-500/30 active:translate-y-0"
                                                                        >
                                                                            <Icon type="clock" className="h-4 w-4" />

                                                                            {preventif.punya_data_bulanan && (
                                                                                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-500" />
                                                                            )}
                                                                        </button>

                                                                        {/* EDIT DATA */}
                                                                        <Link
                                                                            href={`/preventif-mesin/${preventif.no}/edit`}
                                                                            title="Edit data"
                                                                            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:text-white hover:shadow-md hover:shadow-slate-500/30 active:translate-y-0"
                                                                        >
                                                                            <Icon type="edit" className="h-4 w-4" />
                                                                        </Link>

                                                                        {/* HAPUS DATA */}
                                                                        <button
                                                                            type="button"
                                                                            title="Hapus data"
                                                                            onClick={() => confirmDelete(preventif)}
                                                                            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-500/30 active:translate-y-0"
                                                                        >
                                                                            <Icon type="trash" className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                            {/* BARIS ACT */}
                                                            <tr className={`transition-colors duration-300 ${rowHighlighted ? 'bg-amber-50/70' : 'hover:bg-emerald-50/30'}`}>
                                                                <td className="border-b border-r border-slate-200 px-3 py-2 text-center align-middle">
                                                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600">
                                                                        ACT
                                                                    </span>
                                                                </td>
                                                                {tanggal.map((day) => {
                                                                    const checked = isChecked(preventif, day);
                                                                    const checklist = getChecklist(preventif, day);
                                                                    const hasCatatan = Boolean(checklist?.catatan && String(checklist.catatan).trim() !== '');
                                                                    const cellHighlighted = rowHighlighted && highlight?.day === day;

                                                                    return (
                                                                        <td
                                                                            key={`act-${day}`}
                                                                            id={`cell-${preventif.no}-${day}`}
                                                                            className={`border-b border-r border-slate-200 px-1.5 py-1.5 text-center transition-colors ${
                                                                                cellHighlighted ? 'idx-pulse !bg-amber-200' : checked ? 'bg-emerald-50/70' : ''
                                                                            }`}
                                                                        >
                                                                            <div className="flex flex-col items-center gap-0.5">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => toggleChecklist(preventif, day)}
                                                                                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 active:scale-90 ${
                                                                                        checked
                                                                                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-sm shadow-emerald-500/30'
                                                                                            : 'border-slate-200 bg-white text-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                                                                                    }`}
                                                                                    title={checked ? 'Klik untuk membatalkan ACT' : 'Klik untuk menandai ACT'}
                                                                                >
                                                                                    {checked && <Icon type="check" className="idx-check h-4 w-4" />}
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openCatatan(preventif, day)}
                                                                                    className={`relative cursor-pointer rounded p-0.5 transition hover:scale-110 ${hasCatatan ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}
                                                                                    title={hasCatatan ? 'Lihat catatan' : 'Tambah catatan'}
                                                                                >
                                                                                    <Icon type="note" className="h-3.5 w-3.5" />
                                                                                    {hasCatatan && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-red-500" />}
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        </React.Fragment>
                                                    );
                                                }
                                            )}

                                            {/* TOTAL */}
                                            <tr className="bg-[#0b1a4d]">
                                                <td
                                                    colSpan={6}
                                                    className="border-r border-white/10 px-4 py-3 text-center"
                                                >
                                                    <div className="flex flex-col items-center leading-none">
                                                        <span className="text-[10px] font-medium tracking-wide text-blue-200">
                                                            Rekapitulasi {months[selectedMonth]} {selectedYear}
                                                        </span>

                                                        <span className="mt-1 text-xs font-bold text-white">
                                                            Total Preventif Mesin · {activeTotals.label}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-[10px] font-semibold text-blue-200">
                                                            DOT
                                                        </span>

                                                        <span className="mt-1 text-xs font-bold text-white">
                                                            {formatJam(activeTotals.dot)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-[10px] font-semibold text-indigo-200">
                                                            HOT
                                                        </span>

                                                        <span className="mt-1 text-xs font-bold text-white">
                                                            {formatJam(activeTotals.hot)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Kolom Status + semua kolom tanggal */}
                                                <td colSpan={jumlahHari + 1} />

                                                <td className="border-white/10"></td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={10 + jumlahHari}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                        <Icon
                                                            type="clipboard"
                                                            className="h-7 w-7 text-slate-400"
                                                        />
                                                    </div>

                                                    <p className="font-semibold text-slate-700">
                                                        Tidak ada data
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Belum ada data dengan status yang dipilih.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {filteredPreventifMesins.length > 0 &&
                            preventifMesins.links &&
                            preventifMesins.links.length > 3 && (
                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                                    <p className="text-sm text-slate-500">
                                        Menampilkan{' '}
                                        <span className="font-semibold text-slate-700">
                                            {preventifMesins.from}
                                        </span>{' '}
                                        -{' '}
                                        <span className="font-semibold text-slate-700">
                                            {preventifMesins.to}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-semibold text-slate-700">
                                            {preventifMesins.total}
                                        </span>{' '}
                                        data
                                    </p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {preventifMesins.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                                className={`min-w-[36px] cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200 ${
                                                    link.active
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:text-blue-600 hover:ring-blue-300'
                                                } ${
                                                    !link.url
                                                        ? 'pointer-events-none opacity-40'
                                                        : ''
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif Mesin
                        </p>
                    </div>
                </footer>
            </div>

            {/* PROGRESS SAMAKAN SEMUA */}
            {bulk && (
                <div className="idx-slide fixed bottom-5 right-5 z-[100] w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-violet-100 bg-white p-4 shadow-2xl shadow-slate-950/25">
                    <div className="flex items-center gap-3">
                        <span className="idx-spin h-5 w-5 shrink-0 rounded-full border-2 border-violet-200 border-t-violet-600" />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800">
                                Samakan dengan {labelBulanLalu}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {bulk.phase}
                                {bulk.total > 0 && ` ${bulk.done}/${bulk.total}`}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                            style={{
                                width: bulk.total > 0 ? `${Math.round((bulk.done / bulk.total) * 100)}%` : '8%',
                            }}
                        />
                    </div>

                    {bulk.phase === 'Menyamakan item...' && (
                        <div className="mt-3 flex items-center justify-between gap-2">
                            <p className="text-[11px] text-slate-400">
                                Item yang sudah diproses tidak dibatalkan otomatis.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    bulkCancelRef.current = true;
                                    setBulk({ ...bulk, phase: 'Menghentikan...' });
                                }}
                                className="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                                Batalkan
                            </button>
                        </div>
                    )}
                </div>
            )}

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

            {/* TOAST MENCARI DATA */}
            {searching && (
                <div className="idx-slide fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-2xl shadow-slate-950/25">
                    <span className="idx-spin h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-600" />

                    <p className="text-sm font-semibold text-slate-700">
                        Mencari data...
                    </p>
                </div>
            )}

            {/* WARNING TOAST */}
            {warningMessage && (
                <Toast
                    tone="amber"
                    icon="alert"
                    title="Perhatian"
                    message={warningMessage}
                    onClose={() => setWarningMessage('')}
                />
            )}

            {/* MODAL EDIT PLAN BULANAN */}
            {showPlanEditor && selectedPlan && (
                <ModalShell z="z-[95]" maxW="max-w-2xl">
                    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                                <Icon type="calendar" className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Edit Jadwal Plan Bulanan</h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {selectedPlan.item_preventif} · {months[selectedMonth]} {selectedYear}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={closePlanEditor} aria-label="Tutup" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            <Icon type="close" className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="px-6 py-5">
                        <p className="mb-4 text-xs font-medium text-slate-500">
                            Klik tanggal untuk menambah atau menghapus Plan.
                        </p>

                        <div className="grid grid-cols-7 gap-2">
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName) => (
                                <div key={dayName} className="py-1 text-center text-[11px] font-semibold text-slate-400">{dayName}</div>
                            ))}
                            {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }, (_, index) => (
                                <div key={`empty-${index}`} />
                            ))}
                            {tanggal.map((day) => {
                                const date = getTanggalChecklist(day);
                                const active = draftPlanDates.includes(date);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDraftPlanDate(day)}
                                        className={`flex min-h-12 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 ${
                                            active
                                                ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                    >
                                        <span>{day}</span>
                                        {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-white/90" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                            <span className="text-xs text-slate-500">Jumlah tanggal Plan dipilih</span>
                            <span className="text-sm font-bold text-slate-800">{draftPlanDates.length} hari</span>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-400">
                            Perubahan hanya berlaku untuk {months[selectedMonth]} {selectedYear}. Jadwal otomatis pada bulan lain tidak berubah. Jika semua tanggal dihapus, bulan ini tidak memiliki Plan.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button type="button" onClick={closePlanEditor} disabled={savingPlan} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50">Batal</button>
                        <button type="button" onClick={savePlan} disabled={savingPlan} className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
                            {savingPlan ? 'Menyimpan...' : 'Simpan Plan'}
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* MODAL EDIT BULANAN */}
            {showBulanan && selectedBulanan && (
                <ModalShell>
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 text-violet-600">
                                    <Icon type="clock" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Item, Durasi, DOT &amp; HOT Bulanan
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Periode{' '}
                                        <span className="font-semibold text-slate-700">
                                            {months[selectedMonth]} {selectedYear}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeBulanan}
                                aria-label="Tutup"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <Icon type="close" className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-5">
                        <div className="mb-4">
                            <p className="text-xs text-slate-400">
                                Nama item master:{' '}
                                <span className="font-medium text-slate-500">
                                    {selectedBulanan.item_preventif_master ??
                                        selectedBulanan.item_preventif}
                                </span>
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={samakan}
                            onClick={toggleSamakan}
                            disabled={copyLoading || savingBulanan}
                            className={`mb-4 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                                samakan
                                    ? 'border-violet-300 bg-violet-50'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-slate-700">
                                    Samakan dengan bulan sebelumnya
                                </span>
                                <span
                                    className={`mt-0.5 block text-xs leading-relaxed ${
                                        copyInfo?.type === 'error'
                                            ? 'text-red-500'
                                            : copyInfo?.type === 'ok'
                                            ? 'text-violet-600'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {copyLoading
                                        ? `Mengambil data ${labelBulanLalu}...`
                                        : copyInfo?.text ?? `Isi otomatis Durasi, Total Durasi, DOT & HOT dari ${labelBulanLalu}`}
                                </span>
                            </span>

                            {copyLoading ? (
                                <span className="idx-spin h-5 w-5 shrink-0 rounded-full border-2 border-violet-200 border-t-violet-600" />
                            ) : (
                                <span
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                                        samakan ? 'bg-violet-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                                            samakan ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </span>
                            )}
                        </button>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {bulananFields.map((field) => (
                                <div key={field.name}>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        {field.label}{' '}
                                        <span className="text-xs font-medium text-slate-400">
                                            (jam)
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formBulanan[field.name]}
                                        onChange={(e) =>
                                            setFormBulanan({
                                                ...formBulanan,
                                                [field.name]: e.target.value,
                                            })
                                        }
                                        placeholder="0"
                                        readOnly={samakan || copyLoading}
                                        className={`${inputClass} focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 ${
                                            samakan ? 'cursor-not-allowed border-violet-200 bg-violet-50/60 text-violet-700' : ''
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-xs leading-relaxed text-slate-400">
                            Nilai ini hanya berlaku untuk {months[selectedMonth]}{' '}
                            {selectedYear}. Bulan lain tidak ikut berubah.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={closeBulanan}
                            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={saveBulanan}
                            disabled={savingBulanan}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {savingBulanan ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* MODAL CATATAN */}
            {showCatatan && selectedChecklist && (
                <ModalShell>
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                                    <Icon type="note" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Catatan Checklist
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {selectedChecklist.day} {months[selectedMonth]}{' '}
                                        {selectedYear}
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
                            {selectedChecklist.preventif.item_preventif}
                        </p>
                    </div>

                    <div className="px-6 py-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Catatan
                        </label>

                        <textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            rows="5"
                            placeholder="Tulis catatan untuk checklist ini..."
                            className={`${inputClass} resize-none py-3 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10`}
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
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            Simpan Catatan
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* DIALOG KONFIRMASI */}
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