import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({
    preventifMesins,
    flash,
    bulan,
    tahun,
    status, 
    totalDotAll = 0,
    totalHotAll = 0,
    notifikasi = [],
}) {
    // =========================
    // BULAN CHECKLIST
    // =========================
    const [selectedMonth, setSelectedMonth] = useState(
        Number(bulan) - 1
    );

    const [selectedYear, setSelectedYear] = useState(
        Number(tahun)
    );

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

    const jumlahHari = new Date(
        selectedYear,
        selectedMonth + 1,
        0
    ).getDate();

    const tanggal = Array.from(
        { length: jumlahHari },
        (_, index) => index + 1
    );

    const getTanggalChecklist = (day) => {
        return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isTanggalPlan = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);

        return preventif.tanggal_plan?.includes(tanggalChecklist);
    };

    const jam = new Date().getHours();

    const greeting =
        jam >= 5 && jam < 11
            ? 'Selamat Pagi'
            : jam >= 11 && jam < 15
            ? 'Selamat Siang'
            : jam >= 15 && jam < 18
            ? 'Selamat Sore'
            : 'Selamat Malam';

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPreventif, setSelectedPreventif] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showCatatan, setShowCatatan] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [catatan, setCatatan] = useState('');

    // =========================
    // SUCCESS TOAST
    // =========================
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash?.success]);

    useEffect(() => {
        if (!showSuccess) {
            return;
        }

        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [showSuccess]);

    // =========================
    // CEK CHECKLIST
    // =========================
    const isChecked = (preventif, day) => {
        const tanggalChecklist = getTanggalChecklist(day);

        return (
            preventif.checklists?.some((checklist) => {
                const tanggal = String(checklist.tanggal).substring(0, 10);

                return (
                    tanggal === tanggalChecklist &&
                    Boolean(checklist.status)
                );
            }) ?? false
        );
    };
    const isAct = (preventif, day) => {
        const checklist = getChecklist(preventif, day);

        return checklist && Boolean(checklist.status);
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
    // =========================
    const getStatus = (preventif) => {
        const tanggalPlan = preventif.tanggal_plan ?? [];

        const adaAct = tanggalPlan.some((tanggal) => {
            const checklist = preventif.checklists?.find((item) => {
                const checklistTanggal = String(item.tanggal).substring(0, 10);

                return checklistTanggal === tanggal;
            });

            return checklist && Boolean(checklist.status);
        });

        return adaAct ? 'ACT' : 'Plan';
    };

    // =========================
    // FILTER STATUS
    // =========================
    const filteredPreventifMesins = preventifMesins.data;

    // =========================
    // ROWSPAN DIVISI
    // =========================
    const getRowSpan = (data, index) => {
        const currentDivisi = data[index].divisi;

        if (
            index > 0 &&
            data[index - 1].divisi === currentDivisi
        ) {
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

    // =========================
    // SIMPAN CATATAN
    // =========================
    const saveCatatan = () => {
        if (!selectedChecklist) {
            return;
        }

        const {
            preventif,
            tanggal,
            day,
        } = selectedChecklist;

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
                onSuccess: () => {
                    setShowCatatan(false);
                    setSelectedChecklist(null);
                    setCatatan('');
                },
            }
        );
    };

    // =========================
    // ICON
    // =========================
    const Icon = ({ type, className = 'h-4 w-4' }) => {
        if (type === 'plus') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={className}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14M5 12h14"
                    />
                </svg>
            );
        }

        if (type === 'edit') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 5l4 4"
                    />
                </svg>
            );
        }

        if (type === 'trash') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 11v5.5M14 11v5.5"
                    />
                </svg>
            );
        }

        if (type === 'arrow-left') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                </svg>
            );
        }

        if (type === 'logout') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 12H9m9 0l-3.75-3.75M18 12l-3.75 3.75"
                    />
                </svg>
            );
        }

        if (type === 'calendar') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <rect
                        x="3.75"
                        y="4.5"
                        width="16.5"
                        height="16"
                        rx="2"
                    />
                    <path
                        strokeLinecap="round"
                        d="M8 2.75v3.5M16 2.75v3.5M3.75 9h16.5"
                    />
                </svg>
            );
        }

        if (type === 'filter') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M7 12h10M10 18h4"
                    />
                </svg>
            );
        }

        if (type === 'clipboard') {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={className}
                >
                    <rect
                        x="5"
                        y="4"
                        width="14"
                        height="17"
                        rx="2"
                    />
                    <path
                        strokeLinecap="round"
                        d="M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4"
                    />
                </svg>
            );
        }

        return null;
    };

    return (
        <>

            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
            <Head title="Data Preventif Mesin" />

            <div className="min-h-screen bg-slate-50">

                {/* HEADER */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            {/* HAMBURGER */}
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600"
                                title="Menu"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-6 w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>

                            {/* ICON + JUDUL */}
                            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200 sm:h-12 sm:w-12 sm:rounded-2xl">
                                    <Icon
                                        type="clipboard"
                                        className="h-5 w-5 text-white sm:h-6 sm:w-6"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                        Schedule Preventif Mesin
                                    </h1>

                                    <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                                        Sistem pengelolaan dan monitoring preventif mesin
                                    </p>
                                </div>
                            </div>
                        </div>
                            <div className="flex w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:gap-2 md:w-auto">

                                {/* NOTIFIKASI */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNotifications(!showNotifications)
                                        }
                                        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600"
                                        title="Notifikasi"
                                    >
                                        {/* BELL */}
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className={`h-5 w-5 ${
                                                notifikasi.length > 0
                                                    ? 'animate-wiggle text-blue-600 drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]'
                                                    : ''
                                            }`}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 17h5l-1.5-2v-4a6.5 6.5 0 00-13 0v4L4 17h5"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M10 20h4"
                                            />
                                        </svg>

                                        {/* JUMLAH NOTIF */}
                                        {notifikasi.length > 0 && (
                                            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                                {notifikasi.length > 99
                                                    ? '99+'
                                                    : notifikasi.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* DROPDOWN */}
                                    {showNotifications && (
                                        <div className="absolute right-0 top-12 z-[80] w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                                            {/* HEADER NOTIF */}
                                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900">
                                                        Notifikasi
                                                    </h3>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        Jadwal preventif mesin
                                                    </p>
                                                </div>

                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                                    {notifikasi.length} Notif
                                                </span>
                                            </div>

                                            {/* ISI */}
                                            <div className="max-h-[400px] overflow-y-auto">

                                                {notifikasi.length > 0 ? (
                                                    notifikasi.map((notif, index) => (
                                                        <div
                                                            key={`${notif.tanggal}-${notif.no_item}-${index}`}
                                                            className="border-b border-slate-100 px-4 py-3 last:border-b-0"
                                                        >
                                                            <div className="flex items-start gap-3">

                                                                {/* ICON */}
                                                                <div
                                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                                        notif.tipe === 'terlambat'
                                                                            ? 'bg-red-50'
                                                                            : 'bg-amber-50'
                                                                    }`}
                                                                >
                                                                    {notif.tipe === 'terlambat' ? (
                                                                        <span className="text-base">
                                                                            ⚠️
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-base">
                                                                            🔔
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* TEXT */}
                                                                <div className="min-w-0 flex-1">

                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <p className="text-xs font-bold text-slate-800">
                                                                            {notif.tipe === 'terlambat'
                                                                                ? 'Pengecekan Belum Dilakukan'
                                                                                : 'Pengecekan Besok'}
                                                                        </p>

                                                                        <span className="shrink-0 text-[10px] font-medium text-slate-400">
                                                                            {notif.divisi}
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                                        {notif.pesan}
                                                                    </p>

                                                                    <p className="mt-1 text-[10px] font-medium text-slate-400">
                                                                        No. {notif.no_item}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center px-6 py-10 text-center">

                                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                                                            <span className="text-xl">
                                                                🔔
                                                            </span>
                                                        </div>

                                                        <p className="text-sm font-semibold text-slate-700">
                                                            Tidak ada notifikasi
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Belum ada jadwal atau pengecekan yang perlu diperhatikan.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* GREETING */}
                <div className="mx-auto max-w-[1800px] px-6 pt-5">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {greeting}, <span className="font-bold">Admin!</span> 👋
                    </h2>
                </div>

                {/* MAIN */}
                <main className="mx-auto max-w-[1800px] px-6 py-7">

                    {/* TOOLBAR */}
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Icon
                                        type="calendar"
                                        className="h-5 w-5"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-900">
                                            Data Preventif Mesin
                                        </h2>

                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                            {preventifMesins.total} Data
                                        </span>
                                    </div>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Jadwal checklist bulan {months[selectedMonth]} {selectedYear}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                                {/* FILTER */}
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                    <Icon
                                        type="filter"
                                        className="h-4 w-4 text-slate-400"
                                    />

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            const status = e.target.value;

                                            setStatusFilter(status);

                                            router.get(
                                                '/preventif-mesin',
                                                {
                                                    bulan: selectedMonth + 1,
                                                    tahun: selectedYear,
                                                    status: status,
                                                },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                }
                                            );
                                        }}
                                        className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                                    >
                                        <option value="all">Semua</option>
                                        <option value="ACT">ACT</option>
                                        <option value="Plan">Plan</option>
                                    </select>
                                </div>

                                {/* BULAN & TAHUN */}
                                <div className="flex items-center gap-2">

                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => {
                                            const month = Number(e.target.value);

                                            setSelectedMonth(month);

                                            router.get(
                                                '/preventif-mesin',
                                                {
                                                    bulan: month + 1,
                                                    tahun: selectedYear,
                                                    status: statusFilter,   // <- tambah
                                                },
                                                { preserveState: true, preserveScroll: true, replace: true }
                                            );
                                        }}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        {months.map((month, index) => (
                                            <option
                                                key={index}
                                                value={index}
                                            >
                                                {month}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            const year = Number(e.target.value);

                                            setSelectedYear(year);

                                            router.get(
                                                '/preventif-mesin',
                                                {
                                                    bulan: selectedMonth + 1,
                                                    tahun: year,
                                                    status: statusFilter,   // <- tambah
                                                },
                                                { preserveState: true, preserveScroll: true, replace: true }
                                            );
                                        }}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        {Array.from(
                                            { length: 16 },
                                            (_, index) => 2020 + index
                                        ).map((year) => (
                                            <option
                                                key={year}
                                                value={year}
                                            >
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* DOWNLOAD EXCEL */}
                                <a
                                    href={`/preventif-mesin/export?bulan=${selectedMonth + 1}&tahun=${selectedYear}`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    ↓ Download Excel
                                </a>

                                {/* TAMBAH */}
                                <Link
                                    href="/preventif-mesin/create"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 hover:shadow-md"
                                >
                                    <Icon
                                        type="plus"
                                        className="h-4 w-4"
                                    />

                                    Tambah Data
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">

                                <thead className="bg-slate-100/80 text-slate-700">

                                    <tr>
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
                                                className={`border-b border-r border-slate-200 px-4 py-3.5 font-semibold whitespace-nowrap first:border-l ${
                                                    header === 'Item Preventif'
                                                        ? 'min-w-[300px] text-left'
                                                        : 'text-center'
                                                }`}
                                            >
                                                {header}
                                            </th>
                                        ))}

                                        <th
                                            rowSpan="2"
                                            className="border border-slate-200 px-4 py-3.5 text-center font-semibold whitespace-nowrap"
                                        >
                                            Status
                                        </th>

                                        <th
                                            colSpan={jumlahHari}
                                            className="border-b border-r border-blue-100 bg-blue-50/80 px-4 py-3.5 text-center font-bold tracking-wide text-blue-700"
                                        >
                                            {months[selectedMonth].toUpperCase()} {selectedYear}
                                        </th>

                                        <th
                                            rowSpan="2"
                                            className="border border-slate-200 px-4 py-3.5 text-center font-semibold whitespace-nowrap"
                                        >
                                            Aksi
                                        </th>
                                    </tr>

                                    <tr>
                                        {tanggal.map((day) => (
                                            <th
                                                key={day}
                                                className="min-w-[50px] border-b border-r border-slate-200 px-2 py-3 text-center text-xs font-semibold text-slate-500"
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

                                                    const status =
                                                        getStatus(preventif);

                                                    return (
                                                        <tr
                                                            key={preventif.no}
                                                            className="group transition-colors hover:bg-blue-50/30"
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
                                                                {formatJam(
                                                                    preventif.durasi
                                                                )}
                                                            </td>

                                                            {/* TOTAL DURASI */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(
                                                                    preventif.total_durasi
                                                                )}
                                                            </td>

                                                            {/* DOT */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(
                                                                    preventif.dot
                                                                )}
                                                            </td>

                                                            {/* HOT */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap text-slate-600">
                                                                {formatJam(
                                                                    preventif.hot
                                                                )}
                                                            </td>

                                                            {/* STATUS */}
                                                            <td className="border border-slate-200 px-4 py-3 text-center whitespace-nowrap">
                                                                {status === 'ACT' ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                        ACT
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                        Plan
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* CHECKLIST */}
                                                            {tanggal.map((day) => {
                                                                const checked = isChecked(preventif, day);

                                                                const plan = isTanggalPlan(preventif, day);

                                                                // Checklist boleh dilakukan jika tanggal tersebut
                                                                // memang merupakan tanggal PLAN
                                                                const canChecklist = plan;

                                                                const checklist = getChecklist(preventif, day);

                                                                const hasCatatan =
                                                                    Boolean(
                                                                        checklist?.catatan &&
                                                                        String(
                                                                            checklist.catatan
                                                                        ).trim() !== ''
                                                                    );

                                                                return (
                                                                    <td
                                                                        key={day}
                                                                        className={`border border-slate-200 px-1.5 py-2 text-center transition-colors ${
                                                                            checked
                                                                                ? 'bg-emerald-50'
                                                                                : plan
                                                                                ? 'bg-blue-50/30'
                                                                                : 'bg-white'
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">

                                                                            {/* CHECKBOX */}
                                                                            <div className="flex items-center justify-center">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={!canChecklist}
                                                                                    onClick={() => {
                                                                                        if (canChecklist) {
                                                                                            toggleChecklist(
                                                                                                preventif,
                                                                                                day
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 shadow-sm transition-all ${
                                                                                        !canChecklist
                                                                                            ? 'cursor-default border-slate-300 bg-white'
                                                                                            : checked
                                                                                            ? 'cursor-pointer border-emerald-500 bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 hover:shadow-md'
                                                                                            : 'cursor-pointer border-blue-300 bg-white text-blue-500 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                                                                                    }`}
                                                                                    title={
                                                                                        !canChecklist
                                                                                            ? 'Tidak ada jadwal Plan'
                                                                                            : checked
                                                                                            ? 'Klik untuk membatalkan ACT'
                                                                                            : 'Klik untuk ACT / Closed'
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
                                                                            </div>

                                                                            {/* CATATAN */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openCatatan(
                                                                                        preventif,
                                                                                        day
                                                                                    )
                                                                                }
                                                                                className={`relative text-sm transition hover:scale-110 ${
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

                                                                    <Link
                                                                        href={`/preventif-mesin/${preventif.no}/edit`}
                                                                        title="Edit data"
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
                                                                    >
                                                                        <Icon
                                                                            type="edit"
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </Link>

                                                                    <button
                                                                        type="button"
                                                                        title="Hapus data"
                                                                        onClick={() => {
                                                                            setSelectedPreventif(
                                                                                preventif
                                                                            );
                                                                            setShowDeleteModal(
                                                                                true
                                                                            );
                                                                        }}
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100"
                                                                    >
                                                                        <Icon
                                                                            type="trash"
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}

                                            {/* TOTAL */}
                                           <tr className="bg-slate-100/80">

                                                <td
                                                    colSpan={6}
                                                    className="border border-slate-200 px-4 py-3.5 text-center font-bold text-slate-700"
                                                >
                                                    Total Preventif Mesin
                                                </td>

                                                <td className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                    {formatJam(totalDotAll)}
                                                </td>

                                                <td className="border border-slate-200 px-4 py-3 text-center font-bold text-slate-700">
                                                    {formatJam(totalHotAll)}
                                                </td>

                                                <td className="border border-slate-200 px-4 py-3"></td>

                                                {tanggal.map((day) => (
                                                    <td
                                                        key={day}
                                                        className="border border-slate-200 px-2 py-3"
                                                    />
                                                ))}

                                                <td className="border border-slate-200 px-3 py-3"></td>
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
                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
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
                                                className={`min-w-9 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            </div>

            {/* SUCCESS TOAST */}
            {showSuccess && (
                <div className="fixed right-6 top-6 z-[100] flex w-[360px] items-start gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-4 shadow-xl">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <span className="font-bold text-emerald-600">
                            ✓
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">
                            Berhasil
                        </p>

                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                            {successMessage}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSuccess(false)}
                        className="text-lg leading-none text-slate-300 transition hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* MODAL CATATAN */}
            {showCatatan && selectedChecklist && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        📝
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Catatan Checklist
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {selectedChecklist.day}{' '}
                                            {months[selectedMonth]} {selectedYear}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCatatan(false);
                                        setSelectedChecklist(null);
                                        setCatatan('');
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
                                onChange={(e) =>
                                    setCatatan(e.target.value)
                                }
                                rows="5"
                                placeholder="Tulis catatan untuk checklist ini..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowCatatan(false);
                                    setSelectedChecklist(null);
                                    setCatatan('');
                                }}
                                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={saveCatatan}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                Simpan Catatan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS */}
            {showDeleteModal && selectedPreventif && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="px-6 pb-4 pt-6">
                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                                        <Icon
                                            type="trash"
                                            className="h-5 w-5 text-red-600"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Hapus Data
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Konfirmasi penghapusan data
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedPreventif(null);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="px-6 pb-5">
                            <p className="text-sm leading-relaxed text-slate-600">
                                Apakah kamu yakin ingin menghapus data
                                berikut?
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPreventif(null);
                                }}
                                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    router.delete(
                                        `/preventif-mesin/${selectedPreventif.no}`,
                                        {
                                            preserveScroll: true,
                                            onFinish: () => {
                                                setShowDeleteModal(false);
                                                setSelectedPreventif(null);
                                            },
                                        }
                                    );
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                            >
                                <Icon
                                    type="trash"
                                    className="h-4 w-4"
                                />
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="mt-10 border-t border-slate-200 bg-white py-5">
                <div className="mx-auto max-w-[1800px] px-6 text-center text-sm text-slate-500">
                    © 2026 Emma Sarkilla
                </div>
            </footer>
        </>
    );
}
