import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

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
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

/* Label kecil + kontrol (tanpa ikon dekoratif) */
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

export default function Index({
    preventifMesins,
    flash,
    bulan,
    tahun,
    status,
    // Total mengikuti filter status. Backend mengirim ketiganya (lihat catatan).
    totalDotAll = 0,
    totalHotAll = 0,
    totalDotAct = 0,
    totalHotAct = 0,
    totalDotPlan = 0,
    totalHotPlan = 0,
    notifikasi = [],
    notifikasiPengiriman = [],
}) {
    // =========================
    // BULAN CHECKLIST
    // =========================
    const [selectedMonth, setSelectedMonth] = useState(Number(bulan) - 1);
    const [selectedYear, setSelectedYear] = useState(Number(tahun));

    const jumlahHari = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const tanggal = Array.from({ length: jumlahHari }, (_, index) => index + 1);

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

    // Dialog konfirmasi umum (edit, hapus, simpan bulanan, dll)
    // bentuk: { title, message, confirmLabel, tone, onConfirm }
    const [confirmDialog, setConfirmDialog] = useState(null);

    // [BARU] Fokus dari klik notifikasi
    // highlight      : { no, day } baris + tanggal yang sedang disorot
    // searching      : sedang mencari data ke halaman lain
    // warningMessage : toast peringatan jika data tidak ditemukan di semua halaman
    const [highlight, setHighlight] = useState(null);
    const [searching, setSearching] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // =========================
    // STATE EDIT BULANAN
    // =========================
    const [showBulanan, setShowBulanan] = useState(false);
    const [selectedBulanan, setSelectedBulanan] = useState(null);
    const [savingBulanan, setSavingBulanan] = useState(false);
    const [formBulanan, setFormBulanan] = useState({
        item_preventif: '',
        durasi: '',
        total_durasi: '',
        dot: '',
        hot: '',
    });

    // =========================
    // NOTIFIKASI PENGIRIMAN
    // =========================
    const getNotifikasiPengiriman = (tanggal) => {
        return notifikasiPengiriman.find((item) => item.tanggal === tanggal);
    };

    const jumlahPengirimanDitolak = notifikasiPengiriman.filter(
        (item) => item.status === 'ditolak'
    ).length;

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

    // Auto-hide toast peringatan
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

    // =========================
    // AMBIL DATA CHECKLIST
    // =========================
    const getChecklist = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);

        return preventif.checklists?.find((checklist) => {
            const tanggal = String(checklist.tanggal).substring(0, 10);

            return tanggal === tanggalChecklist;
        });
    };

    // =========================
    // STATUS DATA
    // ACT = ada checklist yang dicentang di bulan yang sedang
    // ditampilkan, TIDAK harus di tanggal Plan.
    // =========================
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

    // Simpan -> konfirmasi dulu
    const saveBulanan = () => {
        setConfirmDialog({
            title: 'Simpan perubahan?',
            message: `Apakah kamu yakin ingin menyimpan data ini?`,
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                setConfirmDialog(null);
                submitBulanan(formBulanan);
            },
        });
    };

    // Kosongkan -> konfirmasi dulu
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
    // [BARU] FOKUS KE DATA DARI NOTIFIKASI
    // Otomatis pindah bulan/tahun + mencari ke semua halaman pagination
    // =========================

    // Cari baris pada sekumpulan data.
    // Prioritas: notif.no (id baris) -> fallback no_item + divisi.
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

    // Kunjungi 1 halaman tertentu dan kembalikan props barunya
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

    // Klik notifikasi jadwal
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
            // beri waktu React merender halaman baru
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

    const totalNotif = notifikasi.length + jumlahPengirimanDitolak;

    const bulananFields = [
        { name: 'durasi', label: 'Durasi' },
        { name: 'total_durasi', label: 'Total Durasi' },
        { name: 'dot', label: 'DOT' },
        { name: 'hot', label: 'HOT' },
    ];

    return (
        <>
            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
            <Head title="Data Preventif Mesin" />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes idxFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes idxPulse {
                    0%, 100% { box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.95), 0 0 0 0 rgba(245, 158, 11, 0.55); }
                    50% { box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.95), 0 0 0 7px rgba(245, 158, 11, 0); }
                }
                @keyframes idxSpin {
                    to { transform: rotate(360deg); }
                }

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }
                .idx-pulse { animation: idxPulse 1.2s ease-in-out infinite; }
                .idx-spin { animation: idxSpin 0.8s linear infinite; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient,
                    .idx-float,
                    .idx-float-reverse,
                    .idx-pulse,
                    .idx-rise { animation: none !important; }
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

                {/* =====================================================
                    HEADER (RINGKAS)
                ====================================================== */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-2.5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            {/* LEFT */}
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(true)}
                                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                                    title="Menu"
                                >
                                    <Icon type="menu" className="h-5 w-5" />
                                </button>

                                <div className="min-w-0">
                                    <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                                        Schedule Preventif Mesin
                                    </h1>
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
                                        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 transition-all duration-200 ${
                                            totalNotif > 0
                                                ? 'bg-white/20 text-white hover:bg-white/30'
                                                : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
                                        }`}
                                        title="Notifikasi"
                                    >
                                        <Icon
                                            type="bell"
                                            className={`h-5 w-5 ${
                                                totalNotif > 0
                                                    ? 'animate-wiggle drop-shadow-[0_0_6px_rgba(147,197,253,0.8)]'
                                                    : ''
                                            }`}
                                        />

                                        {totalNotif > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#0a2260] bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[9px] font-extrabold text-white shadow-md">
                                                {totalNotif > 99 ? '99+' : totalNotif}
                                            </span>
                                        )}
                                    </button>

                                    {/* =================================================
                                        DROPDOWN NOTIFIKASI (flat / tidak seperti tombol)
                                    ================================================== */}
                                    {showNotifications && (
                                        <div className="absolute right-0 top-12 z-[80] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/30">
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
                                                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                                                        {jumlahPengirimanDitolak > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-red-500">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                {jumlahPengirimanDitolak} ditolak
                                                            </span>
                                                        )}

                                                        {notifikasi.length > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-amber-600">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                {notifikasi.length} jadwal
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ISI */}
                                            <div className="idx-scroll max-h-[420px] overflow-y-auto">
                                                {/* PENGIRIMAN DITOLAK */}
                                                {notifikasiPengiriman
                                                    .filter((item) => item.status === 'ditolak')
                                                    .map((notif, index) => (
                                                        <div
                                                            key={`ditolak-${notif.tanggal}-${index}`}
                                                            className="relative border-b border-slate-100 bg-white px-4 py-3 pl-5"
                                                        >
                                                            <span className="absolute left-0 top-0 h-full w-1 bg-red-400" />

                                                            <div className="flex items-start gap-3">
                                                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                                                    <Icon type="close" className="h-4 w-4" />
                                                                </span>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-baseline justify-between gap-2">
                                                                        <p className="text-xs font-bold text-slate-800">
                                                                            Pengiriman Ditolak
                                                                        </p>

                                                                        <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                                                                            {notif.tanggal_format}
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                                                        Data preventif tanggal{' '}
                                                                        <span className="font-semibold text-slate-700">
                                                                            {notif.tanggal_format}
                                                                        </span>{' '}
                                                                        ditolak oleh pimpinan.
                                                                    </p>

                                                                    <p className="mt-2 border-l-2 border-red-200 pl-2.5 text-[11px] leading-relaxed text-slate-600">
                                                                        <span className="font-bold text-red-500">
                                                                            Alasan:
                                                                        </span>{' '}
                                                                        {notif.alasan_penolakan || '-'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                {/* NOTIFIKASI JADWAL (BISA DIKLIK) */}
                                                {notifikasi.length > 0 &&
                                                    notifikasi.map((notif, index) => {
                                                        const terlambat = notif.tipe === 'terlambat';

                                                        return (
                                                            <div
                                                                key={`${notif.tanggal}-${notif.no_item}-${index}`}
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
                                                                className="group/notif relative cursor-pointer border-b border-slate-100 bg-white px-4 py-3 pl-5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
                                                            >
                                                                <span
                                                                    className={`absolute left-0 top-0 h-full w-1 ${
                                                                        terlambat
                                                                            ? 'bg-amber-400'
                                                                            : 'bg-blue-400'
                                                                    }`}
                                                                />

                                                                <div className="flex items-start gap-3">
                                                                    <span
                                                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                                            terlambat
                                                                                ? 'bg-amber-50 text-amber-600'
                                                                                : 'bg-blue-50 text-blue-600'
                                                                        }`}
                                                                    >
                                                                        <Icon
                                                                            type={terlambat ? 'alert' : 'schedule'}
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </span>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-baseline justify-between gap-2">
                                                                            <p className="text-xs font-bold text-slate-800">
                                                                                {terlambat
                                                                                    ? 'Pengecekan Belum Dilakukan'
                                                                                    : 'Pengecekan Besok'}
                                                                            </p>

                                                                            <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                                                                                {notif.divisi}
                                                                            </span>
                                                                        </div>

                                                                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                                                                            {notif.pesan}
                                                                        </p>

                                                                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                                                                            <span className="font-medium text-slate-400">
                                                                                No. {notif.no_item}
                                                                                <span className="mx-1.5 text-slate-300">·</span>
                                                                                <span
                                                                                    className={`font-semibold ${
                                                                                        terlambat
                                                                                            ? 'text-amber-600'
                                                                                            : 'text-blue-600'
                                                                                    }`}
                                                                                >
                                                                                    {terlambat
                                                                                        ? 'Perlu perhatian'
                                                                                        : 'Besok'}
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
                                                {notifikasi.length === 0 &&
                                                    jumlahPengirimanDitolak === 0 && (
                                                        <div className="flex flex-col items-center px-6 py-10 text-center">
                                                            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                                                                <Icon type="bell" className="h-6 w-6" />
                                                            </span>

                                                            <p className="text-sm font-bold text-slate-700">
                                                                Semua aman ✨
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
                </header>

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-4 sm:px-6">
                    {/* TOOLBAR (RINGKAS) */}
                    <div
                        className={`idx-rise mb-3 overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
                            {/* LEFT - INFO */}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-bold tracking-tight text-slate-900">
                                        Checklist {months[selectedMonth]} {selectedYear}
                                    </h2>

                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                                        {preventifMesins.total} data
                                    </span>
                                </div>

                                {/* LEGENDA */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-md border-2 border-blue-200 text-[10px] font-bold leading-none text-blue-500">
                                            ○
                                        </span>
                                        Jadwal Plan
                                    </span>

                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-500 text-[10px] font-bold leading-none text-white">
                                            ✓
                                        </span>
                                        ACT (sudah dikerjakan)
                                    </span>

                                    <span className="inline-flex items-center gap-1.5">
                                        <span>📝</span>
                                        Catatan
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT - FILTER SEDERHANA */}
                            <div className="flex flex-wrap items-end gap-2">
                                <Field label="Status">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            const next = e.target.value;

                                            setStatusFilter(next);
                                            visitPeriode(
                                                selectedMonth,
                                                selectedYear,
                                                next
                                            );
                                        }}
                                        className={selectClass}
                                    >
                                        <option value="all">Semua status</option>
                                        <option value="ACT">ACT</option>
                                        <option value="Plan">Plan</option>
                                    </select>
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

                                <a
                                    href={`/preventif-mesin/export?bulan=${selectedMonth + 1}&tahun=${selectedYear}`}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <Icon type="download" className="h-4 w-4" />
                                    Excel
                                </a>

                                <Link
                                    href="/preventif-mesin/create"
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                                >
                                    <Icon type="plus" className="h-4 w-4" />
                                    Tambah
                                </Link>
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
                                    {/* HEADER UTAMA */}
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900">
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
                                                rowSpan="2"
                                                className={`border-b border-r border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap first:border-l ${
                                                    header === 'Item Preventif'
                                                        ? 'min-w-[300px] text-left'
                                                        : 'text-center'
                                                }`}
                                            >
                                                {header}
                                            </th>
                                        ))}

                                        {/* STATUS */}
                                        <th
                                            rowSpan="2"
                                            className="border-b border-r border-white/10 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                                        >
                                            Status
                                        </th>

                                        {/* BULAN */}
                                        <th
                                            colSpan={jumlahHari}
                                            className="border-b border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-center"
                                        >
                                            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-white">
                                                Jadwal Checklist ·{' '}
                                                {months[selectedMonth]} {selectedYear}
                                            </span>
                                        </th>

                                        {/* AKSI */}
                                        <th
                                            rowSpan="2"
                                            className="border-b border-white/10 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                                        >
                                            Aksi
                                        </th>
                                    </tr>

                                    {/* HEADER TANGGAL */}
                                    <tr className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900">
                                        {tanggal.map((day) => (
                                            <th
                                                key={day}
                                                className="min-w-[50px] border-b border-r border-white/10 px-2 py-2 text-center"
                                            >
                                                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold text-white ring-1 ring-white/10">
                                                    {day}
                                                </div>
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

                                                    const rowStatus =
                                                        getStatus(preventif);

                                                    const rowHighlighted =
                                                        highlight?.no === preventif.no;

                                                    return (
                                                        <tr
                                                            key={preventif.no}
                                                            id={`row-${preventif.no}`}
                                                            className={`group transition-colors duration-500 ${
                                                                rowHighlighted
                                                                    ? 'bg-amber-100/70'
                                                                    : 'hover:bg-blue-50/50'
                                                            }`}
                                                        >
                                                            {/* DIVISI */}
                                                            {rowSpan > 0 && (
                                                                <td
                                                                    rowSpan={rowSpan}
                                                                    className="border border-slate-200 bg-slate-50 px-4 py-3 text-center align-middle font-bold text-slate-700"
                                                                >
                                                                    {preventif.divisi}
                                                                </td>
                                                            )}

                                                            {/* NO */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center font-medium text-slate-600">
                                                                {preventif.no_item}
                                                            </td>

                                                            {/* ITEM */}
                                                            <td className="border border-slate-200 px-4 py-3 text-slate-700">
                                                                <div className="max-w-[360px] whitespace-normal leading-relaxed">
                                                                    <span className="font-medium text-slate-700">
                                                                        {preventif.item_preventif}
                                                                    </span>

                                                                    {preventif.item_preventif_master &&
                                                                        preventif.item_preventif !==
                                                                            preventif.item_preventif_master && (
                                                                            <span className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 align-middle text-[10px] font-bold text-violet-600">
                                                                                Khusus bulan ini
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </td>

                                                            {/* PERIODE */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {preventif.periode_nilai !== null &&
                                                                preventif.periode_nilai !== undefined &&
                                                                preventif.periode_nilai !== ''
                                                                    ? `${parseFloat(preventif.periode_nilai)} ${preventif.periode_satuan || ''}`
                                                                    : '-'}
                                                            </td>

                                                            {/* DURASI */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(preventif.durasi)}
                                                            </td>

                                                            {/* TOTAL DURASI */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(preventif.total_durasi)}
                                                            </td>

                                                            {/* DOT */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(preventif.dot)}
                                                            </td>

                                                            {/* HOT */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(preventif.hot)}
                                                            </td>

                                                            {/* STATUS */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap">
                                                                {rowStatus === 'ACT' ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)]" />
                                                                        ACT
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.7)]" />
                                                                        Plan
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* CHECKLIST */}
                                                            {tanggal.map((day) => {
                                                                const plan = isTanggalPlan(preventif, day);
                                                                const checked = isChecked(preventif, day);
                                                                const checklist = getChecklist(preventif, day);

                                                                const hasCatatan = Boolean(
                                                                    checklist?.catatan &&
                                                                        String(checklist.catatan).trim() !== ''
                                                                );

                                                                const cellHighlighted =
                                                                    rowHighlighted && highlight?.day === day;

                                                                return (
                                                                    <td
                                                                        key={day}
                                                                        id={`cell-${preventif.no}-${day}`}
                                                                        className={`border border-slate-200 px-1.5 py-2 text-center transition-colors ${
                                                                            cellHighlighted
                                                                                ? 'idx-pulse !bg-amber-200'
                                                                                : checked
                                                                                ? 'bg-emerald-50'
                                                                                : plan
                                                                                ? 'bg-blue-50/40'
                                                                                : 'bg-white'
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    toggleChecklist(preventif, day)
                                                                                }
                                                                                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-200 ${
                                                                                    checked
                                                                                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200 hover:-translate-y-0.5'
                                                                                        : plan
                                                                                        ? 'border-blue-200 bg-white text-blue-500 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50'
                                                                                        : 'border-slate-200 bg-white text-slate-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50'
                                                                                }`}
                                                                                title={
                                                                                    checked
                                                                                        ? 'Klik untuk membatalkan ACT'
                                                                                        : plan
                                                                                        ? 'Klik untuk ACT / Closed'
                                                                                        : 'Tidak ada jadwal Plan, tetap bisa diisi'
                                                                                }
                                                                            >
                                                                                {checked ? (
                                                                                    <span className="text-base font-bold leading-none">
                                                                                        ✓
                                                                                    </span>
                                                                                ) : plan ? (
                                                                                    <span className="text-lg font-bold leading-none">
                                                                                        ○
                                                                                    </span>
                                                                                ) : null}
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openCatatan(preventif, day)
                                                                                }
                                                                                className={`relative cursor-pointer text-sm transition hover:scale-110 ${
                                                                                    hasCatatan
                                                                                        ? 'text-blue-600'
                                                                                        : 'text-slate-400 hover:text-slate-600'
                                                                                }`}
                                                                                title={
                                                                                    hasCatatan
                                                                                        ? 'Lihat catatan'
                                                                                        : 'Tambah catatan'
                                                                                }
                                                                            >
                                                                                📝

                                                                                {hasCatatan && (
                                                                                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}

                                                            {/* AKSI */}
                                                            <td className="border border-slate-200 px-3 py-3">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    {/* EDIT BULANAN */}
                                                                    <button
                                                                        type="button"
                                                                        title={`Isi durasi, DOT & HOT ${months[selectedMonth]} ${selectedYear}`}
                                                                        onClick={() => openBulanan(preventif)}
                                                                        className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-100 hover:shadow-md"
                                                                    >
                                                                        <Icon type="clock" className="h-4 w-4" />

                                                                        {preventif.punya_data_bulanan && (
                                                                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-500" />
                                                                        )}
                                                                    </button>

                                                                    {/* EDIT */}
                                                                    <Link
                                                                        href={`/preventif-mesin/${preventif.no}/edit`}
                                                                        title="Edit data"
                                                                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
                                                                    >
                                                                        <Icon type="edit" className="h-4 w-4" />
                                                                    </Link>

                                                                    {/* HAPUS */}
                                                                    <button
                                                                        type="button"
                                                                        title="Hapus data"
                                                                        onClick={() => confirmDelete(preventif)}
                                                                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md"
                                                                    >
                                                                        <Icon type="trash" className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}

                                            {/* TOTAL */}
                                            <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900">
                                                {/* LABEL */}
                                                <td
                                                    colSpan={6}
                                                    className="border-r border-white/10 px-4 py-3 text-center"
                                                >
                                                    <div className="flex flex-col items-center leading-none">
                                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                                                            Rekapitulasi {months[selectedMonth]} {selectedYear}
                                                        </span>

                                                        <span className="mt-1 text-xs font-extrabold text-white">
                                                            Total Preventif Mesin · {activeTotals.label}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* TOTAL DOT (ikut filter status) */}
                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                                            DOT
                                                        </span>

                                                        <span className="mt-1 text-xs font-extrabold text-white">
                                                            {formatJam(activeTotals.dot)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* TOTAL HOT (ikut filter status) */}
                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                                                            HOT
                                                        </span>

                                                        <span className="mt-1 text-xs font-extrabold text-white">
                                                            {formatJam(activeTotals.hot)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* LABEL KIRIM */}
                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                                        Kirim
                                                    </span>
                                                </td>

                                                {/* TOMBOL KIRIM PER TANGGAL */}
                                                {tanggal.map((day) => {
                                                    const tanggalKirim = getTanggalChecklist(day);
                                                    const notifPengiriman = getNotifikasiPengiriman(tanggalKirim);
                                                    const ditolak = notifPengiriman?.status === 'ditolak';
                                                    const disetujui = ['diperiksa', 'disetujui', 'approved'].includes(
                                                        notifPengiriman?.status
                                                    );

                                                    return (
                                                        <td
                                                            key={day}
                                                            className="border-r border-white/10 px-1 py-3 text-center"
                                                        >
                                                            <div className="relative inline-flex">
                                                                <button
                                                                    type="button"
                                                                    disabled={disetujui}
                                                                    onClick={() => {
                                                                        if (disetujui) return;

                                                                        router.post(
                                                                            '/preventif-pengiriman',
                                                                            { tanggal: tanggalKirim },
                                                                            { preserveScroll: true }
                                                                        );
                                                                    }}
                                                                    title={
                                                                        ditolak
                                                                            ? `Ditolak: ${notifPengiriman.alasan_penolakan || 'Tidak ada alasan'}`
                                                                            : disetujui
                                                                            ? `Disetujui pimpinan (${tanggalKirim})`
                                                                            : `Kirim data ${tanggalKirim}`
                                                                    }
                                                                    className={`group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border text-white shadow-sm transition-all duration-200 disabled:cursor-default ${
                                                                        ditolak
                                                                            ? 'border-red-400/30 bg-red-500 shadow-red-900/20 hover:-translate-y-0.5 hover:bg-red-400'
                                                                            : disetujui
                                                                            ? 'border-emerald-300/40 bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-900/30 ring-2 ring-emerald-300/30'
                                                                            : 'border-blue-300/20 bg-blue-500 shadow-blue-900/20 hover:-translate-y-0.5 hover:bg-blue-400 active:translate-y-0'
                                                                    }`}
                                                                >
                                                                    {disetujui ? (
                                                                        <Icon
                                                                            type="approve"
                                                                            className="h-[18px] w-[18px]"
                                                                        />
                                                                    ) : (
                                                                        <Icon
                                                                            type="send"
                                                                            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                                                        />
                                                                    )}
                                                                </button>

                                                                {ditolak && (
                                                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-[#0a1a4d] bg-red-500 px-1 text-[8px] font-bold text-white shadow-sm">
                                                                        !
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}

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
                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-3">
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
                                                className={`min-w-[36px] cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600'
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
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif Mesin
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
                SUCCESS TOAST
            ====================================================== */}
            {showSuccess && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>

                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                            {successMessage}
                        </p>
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

            {/* =====================================================
                [BARU] TOAST MENCARI DATA
            ====================================================== */}
            {searching && (
                <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-2xl shadow-slate-950/40">
                    <span className="idx-spin h-5 w-5 rounded-full border-2 border-blue-200 border-t-blue-600" />

                    <p className="text-sm font-semibold text-slate-700">
                        Mencari data...
                    </p>
                </div>
            )}

            {/* =====================================================
                WARNING TOAST (data tidak ditemukan di semua halaman)
            ====================================================== */}
            {warningMessage && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-2xl shadow-slate-950/40">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-orange-500" />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600">
                        <Icon type="alert" className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">
                            Data tidak ditemukan
                        </p>

                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                            {warningMessage}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setWarningMessage('')}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* =====================================================
                MODAL EDIT BULANAN
            ====================================================== */}
            {showBulanan && selectedBulanan && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                        {/* HEADER */}
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 text-violet-600 shadow-sm">
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
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            </div>

                            {/* <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                {selectedBulanan.item_preventif}
                            </p> */}
                        </div>

                        {/* FORM */}
                        <div className="px-6 py-5">
                            <div className="mb-4">
                                {/* <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Item Preventif
                                </label>

                                <textarea
                                    rows="3"
                                    value={formBulanan.item_preventif}
                                    onChange={(e) =>
                                        setFormBulanan({
                                            ...formBulanan,
                                            item_preventif: e.target.value,
                                        })
                                    }
                                    placeholder="Isi jika pekerjaan bulan ini berbeda"
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                                /> */}

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Nama item master:{' '}
                                    <span className="font-medium text-slate-500">
                                        {selectedBulanan.item_preventif_master ??
                                            selectedBulanan.item_preventif}
                                    </span>
                                </p>
                            </div>

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
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                                        />
                                    </div>
                                ))}
                            </div>

                            <p className="mt-4 text-xs leading-relaxed text-slate-400">
                                Nilai ini hanya berlaku untuk {months[selectedMonth]}{' '}
                                {selectedYear}. Bulan lain tidak ikut berubah.
                            </p>
                        </div>


                        {/* FOOTER */}
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
                                className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingBulanan ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* =====================================================
                MODAL CATATAN
            ====================================================== */}
            {showCatatan && selectedChecklist && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 shadow-sm">
                                        📝
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
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
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
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
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

            {/* =====================================================
                DIALOG KONFIRMASI (hapus, simpan bulanan, dll)
            ====================================================== */}
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