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
    notifikasiPengiriman = [],
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
    // NOTIFIKASI PENGIRIMAN
    // =========================
    const getNotifikasiPengiriman = (tanggal) => {
        return notifikasiPengiriman.find(
            (item) => item.tanggal === tanggal
        );
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
                <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto w-full max-w-[1800px] px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between gap-4">

                            {/* LEFT */}
                            <div className="flex min-w-0 items-center gap-3">

                                {/* HAMBURGER */}
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(true)}
                                    className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300"
                                    title="Menu"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>

                                {/* ICON */}
                                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-200 sm:flex">
                                    <Icon
                                        type="clipboard"
                                        className="h-6 w-6 text-white"
                                    />
                                </div>

                                {/* TITLE */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                            Schedule Preventif Mesin
                                        </h1>

                                        {/* <span className="hidden rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:inline-flex">
                                            Admin
                                        </span> */}
                                    </div>

                                    <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                                        Sistem pengelolaan dan monitoring preventif mesin
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="relative flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">

                                {/* NOTIFIKASI */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNotifications(!showNotifications)
                                        }
                                        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                                            notifikasi.length + jumlahPengirimanDitolak > 0
                                                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100 hover:bg-blue-100'
                                                : 'text-slate-500 hover:bg-white hover:text-blue-600'
                                        }`}
                                        title="Notifikasi"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className={`h-5 w-5 ${
                                                notifikasi.length + jumlahPengirimanDitolak > 0
                                                    ? 'animate-wiggle text-blue-600 drop-shadow-[0_0_6px_rgba(59,130,246,0.55)]'
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

                                        {(notifikasi.length + jumlahPengirimanDitolak) > 0 && (
                                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[9px] font-extrabold text-white shadow-md shadow-red-200">
                                                {(notifikasi.length + jumlahPengirimanDitolak) > 99
                                                    ? '99+'
                                                    : notifikasi.length + jumlahPengirimanDitolak}
                                            </span>
                                        )}
                                    </button>

                                    {/* DROPDOWN */}
                                    {showNotifications && (
                                        <div className="absolute right-0 top-12 z-[80] w-[400px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/20">

                                            {/* =========================
                                                HEADER NOTIFIKASI
                                            ========================== */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-5 pb-5 pt-5 text-white">

                                                {/* DECORATION */}
                                                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                                                <div className="absolute -bottom-10 left-16 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />

                                                <div className="relative">

                                                    {/* TITLE */}
                                                    <div className="flex items-start justify-between gap-3">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className="h-5 w-5"
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
                                                            </div>

                                                            <div>
                                                                <h3 className="text-sm font-bold tracking-tight">
                                                                    Notifikasi
                                                                </h3>

                                                                <p className="mt-0.5 text-[11px] text-blue-100">
                                                                    Informasi jadwal & aktivitas preventif
                                                                </p>
                                                            </div>

                                                        </div>

                                                        {/* JUMLAH */}
                                                        <div className="flex min-w-[52px] flex-col items-center rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 backdrop-blur-sm">
                                                            <span className="text-base font-extrabold leading-none">
                                                                {notifikasi.length + jumlahPengirimanDitolak}
                                                            </span>

                                                            <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-blue-100">
                                                                Notif
                                                            </span>
                                                        </div>

                                                    </div>

                                                    {/* SUMMARY */}
                                                    {(notifikasi.length + jumlahPengirimanDitolak) > 0 && (
                                                        <div className="mt-4 flex items-center gap-2">

                                                            {jumlahPengirimanDitolak > 0 && (
                                                                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-300/20 bg-red-500/20 px-2.5 py-1 text-[10px] font-bold text-red-100">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
                                                                    {jumlahPengirimanDitolak} Ditolak
                                                                </div>
                                                            )}

                                                            {notifikasi.length > 0 && (
                                                                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-blue-100">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                                                                    {notifikasi.length} Jadwal
                                                                </div>
                                                            )}

                                                        </div>
                                                    )}

                                                </div>
                                            </div>


                                            {/* =========================
                                                ISI NOTIFIKASI
                                            ========================== */}
                                            <div className="max-h-[430px] overflow-y-auto bg-slate-50/70">

                                                {/* =========================
                                                    PENGIRIMAN DITOLAK
                                                ========================== */}
                                                {notifikasiPengiriman
                                                    .filter((item) => item.status === 'ditolak')
                                                    .map((notif, index) => (
                                                        <div
                                                            key={`ditolak-${notif.tanggal}-${index}`}
                                                            className="border-b border-red-100 bg-gradient-to-r from-red-50 via-rose-50/60 to-white px-4 py-3.5 transition-all duration-200 hover:from-red-100/80 hover:via-rose-50 hover:to-white"
                                                        >
                                                            <div className="flex items-start gap-3">

                                                                {/* ICON */}
                                                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-200">
                                                                    <svg
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        className="h-4.5 w-4.5"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M6 6l12 12M18 6L6 18"
                                                                        />
                                                                    </svg>

                                                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[8px] font-bold text-white">
                                                                        !
                                                                    </span>
                                                                </div>

                                                                {/* CONTENT */}
                                                                <div className="min-w-0 flex-1">

                                                                    <div className="flex items-start justify-between gap-2">

                                                                        <div>
                                                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-red-600">
                                                                                Ditolak
                                                                            </span>

                                                                            <p className="mt-1 text-xs font-bold text-slate-800">
                                                                                Pengiriman Preventif
                                                                            </p>
                                                                        </div>

                                                                        <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[9px] font-semibold text-slate-400 shadow-sm ring-1 ring-red-100">
                                                                            {notif.tanggal_format}
                                                                        </span>

                                                                    </div>

                                                                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                                                                        Data preventif tanggal{' '}
                                                                        <span className="font-semibold text-slate-700">
                                                                            {notif.tanggal_format}
                                                                        </span>{' '}
                                                                        ditolak oleh pimpinan.
                                                                    </p>

                                                                    {/* ALASAN */}
                                                                    <div className="mt-2.5 rounded-xl border border-red-100 bg-white/80 px-3 py-2.5 shadow-sm">

                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-red-100 text-[9px] text-red-500">
                                                                                !
                                                                            </span>

                                                                            <p className="text-[9px] font-extrabold uppercase tracking-wider text-red-500">
                                                                                Alasan Penolakan
                                                                            </p>
                                                                        </div>

                                                                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                                                                            {notif.alasan_penolakan || '-'}
                                                                        </p>

                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}


                                                {/* =========================
                                                    NOTIFIKASI JADWAL
                                                ========================== */}
                                                {notifikasi.length > 0 &&
                                                    notifikasi.map((notif, index) => {

                                                        const terlambat = notif.tipe === 'terlambat';

                                                        return (
                                                            <div
                                                                key={`${notif.tanggal}-${notif.no_item}-${index}`}
                                                                className={`border-b px-4 py-3.5 transition-all duration-200 ${
                                                                    terlambat
                                                                        ? 'border-amber-100 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white hover:from-amber-100/70'
                                                                        : 'border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white hover:from-blue-100/60'
                                                                }`}
                                                            >

                                                                <div className="flex items-start gap-3">

                                                                    {/* ICON */}
                                                                    <div
                                                                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                                                                            terlambat
                                                                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'
                                                                                : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
                                                                        }`}
                                                                    >

                                                                        {terlambat ? (
                                                                            <svg
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth="1.8"
                                                                                className="h-5 w-5"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M12 9v4"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M12 17h.01"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z"
                                                                                />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth="1.8"
                                                                                className="h-5 w-5"
                                                                            >
                                                                                <rect
                                                                                    x="3.5"
                                                                                    y="4.5"
                                                                                    width="17"
                                                                                    height="16"
                                                                                    rx="2"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    d="M8 2.5v4M16 2.5v4M3.5 9h17"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"
                                                                                />
                                                                            </svg>
                                                                        )}

                                                                    </div>


                                                                    {/* CONTENT */}
                                                                    <div className="min-w-0 flex-1">

                                                                        <div className="flex items-start justify-between gap-2">

                                                                            <div className="min-w-0">

                                                                                <span
                                                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                                                                        terlambat
                                                                                            ? 'bg-amber-100 text-amber-700'
                                                                                            : 'bg-blue-100 text-blue-700'
                                                                                    }`}
                                                                                >
                                                                                    {terlambat
                                                                                        ? 'Perlu Perhatian'
                                                                                        : 'Besok'}
                                                                                </span>

                                                                                <p className="mt-1 text-xs font-bold text-slate-800">
                                                                                    {terlambat
                                                                                        ? 'Pengecekan Belum Dilakukan'
                                                                                        : 'Pengecekan Besok'}
                                                                                </p>

                                                                            </div>

                                                                            {/* DIVISI */}
                                                                            <span
                                                                                className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-bold ${
                                                                                    terlambat
                                                                                        ? 'bg-amber-100/80 text-amber-700'
                                                                                        : 'bg-blue-100/80 text-blue-700'
                                                                                }`}
                                                                            >
                                                                                {notif.divisi}
                                                                            </span>

                                                                        </div>


                                                                        {/* PESAN */}
                                                                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                                                                            {notif.pesan}
                                                                        </p>


                                                                        {/* NO ITEM */}
                                                                        <div className="mt-2.5 flex items-center gap-2">

                                                                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                                                                                <svg
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.8"
                                                                                    className="h-3 w-3"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M6 4.5h12M6 8.5h12M6 12.5h8M6 16.5h10"
                                                                                    />
                                                                                </svg>
                                                                            </span>

                                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                                No. {notif.no_item}
                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            </div>
                                                        );
                                                    })}


                                                {/* =========================
                                                    EMPTY STATE
                                                ========================== */}
                                                {notifikasi.length === 0 &&
                                                    jumlahPengirimanDitolak === 0 && (
                                                        <div className="flex flex-col items-center px-6 py-12 text-center">

                                                            <div className="relative mb-4">

                                                                <div className="absolute inset-0 rounded-3xl bg-blue-100 blur-xl" />

                                                                <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-500 shadow-sm ring-1 ring-blue-100">

                                                                    <svg
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.6"
                                                                        className="h-7 w-7"
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

                                                                </div>

                                                            </div>

                                                            <p className="text-sm font-bold text-slate-700">
                                                                Semua aman ✨
                                                            </p>

                                                            <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-slate-400">
                                                                Belum ada jadwal atau aktivitas yang perlu diperhatikan.
                                                            </p>

                                                        </div>
                                                    )}

                                            </div>

                                            {/* =========================
                                                FOOTER DROPDOWN
                                            ========================== */}
                                            {(notifikasi.length + jumlahPengirimanDitolak) > 0 && (
                                                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">

                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        Sistem Schedule Preventif
                                                    </span>

                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                        Sistem aktif
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

                {/* GREETING */}
                <div className="mx-auto max-w-[1800px] px-4 pt-6 sm:px-6">
                    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-6 py-5 shadow-lg shadow-blue-100">
                        
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-12 right-24 h-28 w-28 rounded-full bg-indigo-300/20 blur-2xl" />

                        <div className="relative flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Dashboard Admin
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                                    {greeting}, Admin! 👋
                                </h2>

                                <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                                    Kelola jadwal dan pantau aktivitas preventif mesin dengan mudah.
                                </p>
                            </div>

                            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm sm:flex">
                                ⚙️
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN */}
                <main className="mx-auto max-w-[1800px] px-6 py-7">

                    {/* TOOLBAR */}
                    <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">

                        <div className="flex flex-col gap-6 p-5 lg:p-6 xl:flex-row xl:items-center xl:justify-between">

                            {/* =========================
                                LEFT - INFO DATA
                            ========================= */}
                            <div className="flex min-w-0 items-center gap-4">

                                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                                    <div className="absolute inset-0 rounded-2xl bg-white/10" />

                                    <Icon
                                        type="calendar"
                                        className="relative h-6 w-6"
                                    />
                                </div>

                                <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                                            Data Preventif Mesin
                                        </h2>

                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            {preventifMesins.total} Data
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                        Jadwal checklist
                                        <span className="font-semibold text-slate-700">
                                            {' '}
                                            {months[selectedMonth]} {selectedYear}
                                        </span>
                                    </p>

                                </div>
                            </div>


                            {/* =========================
                                RIGHT - CONTROLS
                            ========================= */}
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

                                {/* =========================
                                    STATUS FILTER
                                ========================= */}
                                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner">

                                    {/* LABEL */}
                                    <div className="flex items-center gap-2 px-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                                            <Icon
                                                type="filter"
                                                className="h-3.5 w-3.5"
                                            />
                                        </div>

                                        <span className="hidden text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:block">
                                            Status
                                        </span>
                                    </div>

                                    {/* SEGMENTED CONTROL */}
                                    <div className="flex items-center gap-0.5 rounded-xl bg-white p-0.5 shadow-sm">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const status = 'all';

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
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                                                statusFilter === 'all'
                                                    ? 'bg-slate-800 text-white shadow-sm'
                                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                            }`}
                                        >
                                            Semua
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const status = 'ACT';

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
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                                                statusFilter === 'ACT'
                                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                                                    : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                        >
                                            ACT
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const status = 'Plan';

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
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                                                statusFilter === 'Plan'
                                                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                                                    : 'text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                                            }`}
                                        >
                                            Plan
                                        </button>

                                    </div>
                                </div>


                                {/* =========================
                                    PERIODE
                                ========================= */}
                                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner">

                                    {/* ICON */}
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm">
                                        <Icon
                                            type="calendar"
                                            className="h-4 w-4"
                                        />
                                    </div>

                                    {/* BULAN */}
                                    <div className="relative">
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
                                                        status: statusFilter,
                                                    },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true
                                                    }
                                                );
                                            }}
                                            className="cursor-pointer appearance-none bg-transparent py-2 pl-3 pr-7 text-xs font-bold text-slate-700 outline-none"
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

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m6 9 6 6 6-6"
                                            />
                                        </svg>
                                    </div>

                                    <div className="h-6 w-px bg-slate-200" />

                                    {/* TAHUN */}
                                    <div className="relative">
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
                                                        status: statusFilter,
                                                    },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true
                                                    }
                                                );
                                            }}
                                            className="cursor-pointer appearance-none bg-transparent py-2 pl-3 pr-7 text-xs font-bold text-slate-700 outline-none"
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

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m6 9 6 6 6-6"
                                            />
                                        </svg>
                                    </div>

                                </div>


                                {/* =========================
                                    ACTIONS
                                ========================= */}
                                <div className="flex items-center gap-2">

                                    {/* DOWNLOAD */}
                                    <a
                                        href={`/preventif-mesin/export?bulan=${selectedMonth + 1}&tahun=${selectedYear}`}
                                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 3v12m0 0 4-4m-4 4-4-4"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 21h14"
                                            />
                                        </svg>

                                        <span className="hidden sm:inline">
                                            Excel
                                        </span>
                                    </a>


                                    {/* TAMBAH */}
                                    <Link
                                        href="/preventif-mesin/create"
                                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-300"
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15">
                                            <Icon
                                                type="plus"
                                                className="h-3.5 w-3.5"
                                            />
                                        </span>

                                        <span className="hidden sm:inline">
                                            Tambah Data
                                        </span>
                                    </Link>

                                </div>

                            </div>
                        </div>

                        {/* ACCENT LINE */}
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                    </div>

                    {/* TABLE */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">

                                <thead className="text-white">
                                    {/* =========================
                                        HEADER UTAMA
                                    ========================== */}
                                    <tr className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800">

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
                                                className={`border-b border-r border-white/10 px-4 py-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap first:border-l ${
                                                    header === 'Item Preventif'
                                                        ? 'min-w-[300px] text-left'
                                                        : 'text-center'
                                                }`}
                                            >
                                                <div
                                                    className={`flex items-center gap-2 ${
                                                        header === 'Item Preventif'
                                                            ? 'justify-start'
                                                            : 'justify-center'
                                                    }`}
                                                >
                                                    {/* titik indikator */}
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_6px_rgba(147,197,253,0.8)]" />

                                                    {header}
                                                </div>
                                            </th>
                                        ))}

                                        {/* STATUS */}
                                        <th
                                            rowSpan="2"
                                            className="border-b border-r border-white/10 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.8)]" />
                                                Status
                                            </div>
                                        </th>

                                        {/* =========================
                                            BULAN
                                        ========================== */}
                                        <th
                                            colSpan={jumlahHari}
                                            className="border-b border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-center"
                                        >
                                            <div className="flex items-center justify-center gap-3">

                                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                                                    <Icon
                                                        type="calendar"
                                                        className="h-3.5 w-3.5 text-white"
                                                    />
                                                </span>

                                                <div className="flex flex-col items-center leading-none">
                                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
                                                        Jadwal Checklist
                                                    </span>

                                                    <span className="mt-1 text-sm font-extrabold tracking-wide text-white">
                                                        {months[selectedMonth].toUpperCase()} {selectedYear}
                                                    </span>
                                                </div>

                                            </div>
                                        </th>

                                        {/* AKSI */}
                                        <th
                                            rowSpan="2"
                                            className="border-b border-white/10 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_6px_rgba(196,181,253,0.8)]" />
                                                Aksi
                                            </div>
                                        </th>
                                    </tr>

                                    {/* =========================
                                        HEADER TANGGAL
                                    ========================== */}
                                    <tr className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800">
                                        {tanggal.map((day) => (
                                            <th
                                                key={day}
                                                className="min-w-[50px] border-b border-r border-white/10 px-2 py-2.5 text-center"
                                            >
                                                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/20">
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
                                                                                    className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-200 ${
                                                                                        !canChecklist
                                                                                            ? 'cursor-default border-slate-200 bg-slate-50 text-slate-300'
                                                                                            : checked
                                                                                            ? 'cursor-pointer border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200'
                                                                                            : 'cursor-pointer border-blue-200 bg-white text-blue-500 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100'
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
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
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
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md"
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
                                            <tr className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800">

                                                {/* TOTAL PREVENTIF */}
                                                <td
                                                    colSpan={6}
                                                    className="border-r border-white/10 px-4 py-4 text-center"
                                                >
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                                                            <Icon
                                                                type="clipboard"
                                                                className="h-4 w-4 text-blue-200"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col items-start leading-none">
                                                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                                                                Rekapitulasi
                                                            </span>

                                                            <span className="mt-1 text-xs font-extrabold text-white">
                                                                Total Preventif Mesin
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* TOTAL DOT */}
                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200">
                                                            DOT
                                                        </span>

                                                        <span className="mt-1 text-xs font-extrabold text-white">
                                                            {formatJam(totalDotAll)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* TOTAL HOT */}
                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                                                            HOT
                                                        </span>

                                                        <span className="mt-1 text-xs font-extrabold text-white">
                                                            {formatJam(totalHotAll)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* STATUS */}
                                                <td className="border-r border-white/10 px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-100 backdrop-blur-sm">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                                                        Kirim
                                                    </span>
                                                </td>

                                                {/* TOMBOL KIRIM PER TANGGAL */}
                                                {tanggal.map((day) => {
                                                    const tanggalKirim = getTanggalChecklist(day);

                                                    const notifPengiriman =
                                                        getNotifikasiPengiriman(tanggalKirim);

                                                    const ditolak =
                                                        notifPengiriman?.status === 'ditolak';

                                                    const diperiksa =
                                                        notifPengiriman?.status === 'diperiksa';

                                                    return (
                                                        <td
                                                            key={day}
                                                            className="border-r border-white/10 px-1 py-3 text-center"
                                                        >
                                                            <div className="relative inline-flex">

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        router.post(
                                                                            '/preventif-pengiriman',
                                                                            {
                                                                                tanggal: tanggalKirim,
                                                                            },
                                                                            {
                                                                                preserveScroll: true,
                                                                            }
                                                                        );
                                                                    }}
                                                                    title={
                                                                        ditolak
                                                                            ? `Ditolak: ${notifPengiriman.alasan_penolakan || 'Tidak ada alasan'}`
                                                                            : diperiksa
                                                                            ? `Sudah diperiksa ${tanggalKirim}`
                                                                            : `Kirim data ${tanggalKirim}`
                                                                    }
                                                                    className={`
                                                                        group inline-flex h-8 w-8
                                                                        items-center justify-center
                                                                        rounded-xl
                                                                        border
                                                                        text-white
                                                                        shadow-sm
                                                                        transition-all duration-200
                                                                        hover:-translate-y-0.5
                                                                        active:translate-y-0
                                                                        ${
                                                                            ditolak
                                                                                ? 'border-red-400/30 bg-red-500 shadow-red-900/20 hover:bg-red-400'
                                                                                : diperiksa
                                                                                ? 'border-emerald-400/30 bg-emerald-500 shadow-emerald-900/20 hover:bg-emerald-400'
                                                                                : 'border-blue-300/20 bg-blue-500 shadow-blue-900/20 hover:bg-blue-400'
                                                                        }
                                                                    `}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="
                                                                            h-4 w-4
                                                                            transition-transform duration-200
                                                                            group-hover:translate-x-0.5
                                                                            group-hover:-translate-y-0.5
                                                                        "
                                                                    >
                                                                        <path d="M22 2 11 13" />
                                                                        <path d="m22 2-7 20-4-9-9-4Z" />
                                                                    </svg>
                                                                </button>

                                                                {/* BADGE DITOLAK */}
                                                                {ditolak && (
                                                                    <span
                                                                        className="
                                                                            absolute -right-1.5 -top-1.5
                                                                            flex h-4 min-w-4
                                                                            items-center justify-center
                                                                            rounded-full
                                                                            border-2 border-slate-800
                                                                            bg-red-500
                                                                            px-1
                                                                            text-[8px]
                                                                            font-bold
                                                                            text-white
                                                                            shadow-sm
                                                                        "
                                                                    >
                                                                        !
                                                                    </span>
                                                                )}

                                                            </div>
                                                        </td>
                                                    );
                                                })}

                                                {/* KOLOM AKSI */}
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
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-100/50">

                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
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
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* MODAL CATATAN */}
            {showCatatan && selectedChecklist && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">

                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-900/20">

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
                                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                            >
                                Simpan Catatan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS */}
            {showDeleteModal && selectedPreventif && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">

                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-900/20">

                        <div className="px-6 pb-4 pt-6">
                            <div className="flex items-start justify-between">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-600 shadow-sm">
                                        <Icon
                                            type="trash"
                                            className="h-5 w-5"
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
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700 hover:shadow-lg"
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
            <footer className="mt-10 border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-[1800px] px-6 py-5 text-center">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} Sistem Schedule Preventif
                    </p>
                </div>
            </footer>
        </>
    );
}
