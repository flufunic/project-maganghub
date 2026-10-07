import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

// =========================================================
// ICONS
// =========================================================

const IconButton = ({
    title,
    onClick,
    variant = 'blue',
    children,
}) => {
    const variants = {
        blue: 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-200 hover:bg-blue-600 hover:text-white',
        red: 'border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-600 hover:text-white',
        slate: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800',
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const EditIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20h9"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        />
    </svg>
);

const DeleteIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 6h18"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 6V4h8v2"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 6l-1 14H6L5 6"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 11v5M14 11v5"
        />
    </svg>
);

const PlusIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 5v14M5 12h14"
        />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 12H5"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 19l-7-7 7-7"
        />
    </svg>
);

const ClipboardIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
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
            strokeLinejoin="round"
            d="M9 4.5V3h6v1.5"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9h6M9 13h6M9 17h4"
        />
    </svg>
);

const AlertIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.3 3.6L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z"
        />
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
    </svg>
);

const ExcelIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 2v6h6"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 13l2 2-2 2M12 13l2 2-2 2"
        />
    </svg>
);

const CheckIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12l4 4L19 6"
        />
    </svg>
);

const CalendarIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
    >
        <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="2"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 2v4M8 2v4M3 10h18"
        />
    </svg>
);

// =========================================================
// FORM FIELD
// =========================================================

const Field = ({
    label,
    children,
    error,
    required = false,
    className = '',
}) => (
    <div className={className}>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            {label}
            {required && (
                <span className="ml-1 text-red-500">*</span>
            )}
        </label>

        {children}

        {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
                {error}
            </p>
        )}
    </div>
);

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50';

const selectClass = inputClass;

// =========================================================
// MODAL
// =========================================================

const Modal = ({
    title,
    description,
    icon = 'default',
    onClose,
    children,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 px-6 py-5 sm:px-7">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                icon === 'alert'
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200'
                                    : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                            }`}
                        >
                            {icon === 'alert' ? (
                                <AlertIcon />
                            ) : (
                                <ClipboardIcon />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-extrabold text-slate-900">
                                {title}
                            </h3>

                            {description && (
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl leading-none text-slate-400 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-6 sm:p-7">
                    {children}
                </div>
            </div>
        </div>
    );
};

// =========================================================
// MAIN
// =========================================================

export default function Show({
    checkSheet,
    bulan,
    tahun,
    tanggal,
}) {
    // =====================================================
    // STATE
    // =====================================================

    const [editingItem, setEditingItem] = useState(null);
    const [editingAbnormality, setEditingAbnormality] =
        useState(null);

    const [showAddItemModal, setShowAddItemModal] =
        useState(false);

    const [
        showAddAbnormalityModal,
        setShowAddAbnormalityModal,
    ] = useState(false);

    const [shiftFilter, setShiftFilter] = useState('all');

    // =====================================================
    // FORM - ADD ITEM
    // =====================================================

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        no: '',
        inspection_point: '',
        condition: '',
        method: '',
        shift: '',
    });

    // =====================================================
    // FORM - EDIT ITEM
    // =====================================================

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: processingEdit,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        no: '',
        inspection_point: '',
        condition: '',
        method: '',
        shift: '',
    });

    // =====================================================
    // FORM - ADD ABNORMALITY
    // =====================================================

    const {
        data: abnormalityData,
        setData: setAbnormalityData,
        post: postAbnormality,
        processing: processingAbnormality,
        errors: abnormalityErrors,
        reset: resetAbnormality,
    } = useForm({
        tanggal: '',
        abnormality: '',
        countermeasure: '',
        status: 'Open',
        pic: '',
    });

    // =====================================================
    // FORM - EDIT ABNORMALITY
    // =====================================================

    const {
        data: editAbnormalityData,
        setData: setEditAbnormalityData,
        put: putEditAbnormality,
        processing: processingEditAbnormality,
        errors: editAbnormalityErrors,
        reset: resetEditAbnormality,
    } = useForm({
        tanggal: '',
        abnormality: '',
        countermeasure: '',
        status: 'Open',
        pic: '',
    });

    // =====================================================
    // MONTH
    // =====================================================

    const namaBulan = [
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

    // =====================================================
    // PERIOD
    // =====================================================

    const ubahPeriode = (bulanBaru, tahunBaru) => {
        router.get(
            `/check-sheets/${checkSheet.id}`,
            {
                bulan: bulanBaru,
                tahun: tahunBaru,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // =====================================================
    // CHECKLIST
    // =====================================================

    const toggleChecklist = (item, tanggalLengkap) => {
        const checklist = item.checklists?.find(
            (checklist) =>
                checklist.tanggal === tanggalLengkap
        );

        const statusBaru = checklist
            ? !checklist.status
            : true;

        router.post(
            `/check-sheets/${checkSheet.id}/checklist`,
            {
                check_sheet_item_id: item.id,
                tanggal: tanggalLengkap,
                status: statusBaru,
            },
            {
                preserveScroll: true,
            }
        );
    };

    // =====================================================
    // ADD ITEM
    // =====================================================

    const submit = (e) => {
        e.preventDefault();

        post(`/check-sheets/${checkSheet.id}/items`, {
            onSuccess: () => {
                reset();
                setShowAddItemModal(false);
            },
        });
    };

    // =====================================================
    // EDIT ITEM
    // =====================================================

    const submitEdit = (e) => {
        e.preventDefault();

        putEdit(
            `/check-sheets/${checkSheet.id}/items/${editingItem.id}`,
            {
                onSuccess: () => {
                    setEditingItem(null);
                    resetEdit();
                },
            }
        );
    };

    // =====================================================
    // ADD ABNORMALITY
    // =====================================================

    const submitAbnormality = (e) => {
        e.preventDefault();

        postAbnormality(
            `/check-sheets/${checkSheet.id}/abnormalities`,
            {
                onSuccess: () => {
                    resetAbnormality();
                    setShowAddAbnormalityModal(false);
                },
            }
        );
    };

    // =====================================================
    // EDIT ABNORMALITY
    // =====================================================

    const submitEditAbnormality = (e) => {
        e.preventDefault();

        putEditAbnormality(
            `/check-sheets/${checkSheet.id}/abnormalities/${editingAbnormality.id}`,
            {
                onSuccess: () => {
                    setEditingAbnormality(null);
                    resetEditAbnormality();
                },
            }
        );
    };

    // =====================================================
    // FILTER
    // =====================================================

    const filteredItems = checkSheet.items.filter((item) => {
        if (shiftFilter === 'all') return true;

        return item.shift === shiftFilter;
    });

    // =====================================================
    // EDIT ITEM
    // =====================================================

    const bukaEditItem = (item) => {
        setEditingItem(item);

        setEditData({
            no: item.no,
            inspection_point: item.inspection_point,
            condition: item.condition ?? '',
            method: item.method ?? '',
            shift: item.shift,
        });
    };

    // =====================================================
    // EDIT ABNORMALITY
    // =====================================================

    const bukaEditAbnormality = (abnormality) => {
        setEditingAbnormality(abnormality);

        setEditAbnormalityData({
            tanggal: abnormality.tanggal,
            abnormality: abnormality.abnormality,
            countermeasure:
                abnormality.countermeasure ?? '',
            status: abnormality.status,
            pic: abnormality.pic ?? '',
        });
    };

    // =====================================================
    // DELETE ITEM
    // =====================================================

    const hapusItem = (item) => {
        if (
            confirm(
                'Yakin ingin menghapus Inspection Point ini? Checklist yang terkait juga akan terhapus.'
            )
        ) {
            router.delete(
                `/check-sheets/${checkSheet.id}/items/${item.id}`,
                {
                    preserveScroll: true,
                }
            );
        }
    };

    // =====================================================
    // DELETE ABNORMALITY
    // =====================================================

    const hapusAbnormality = (abnormality) => {
        if (
            confirm(
                'Yakin ingin menghapus abnormality ini?'
            )
        ) {
            router.delete(
                `/check-sheets/${checkSheet.id}/abnormalities/${abnormality.id}`,
                {
                    preserveScroll: true,
                }
            );
        }
    };

    // =====================================================
    // HELPERS
    // =====================================================

    const formatTanggal = (value) => {
        if (!value) return '-';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusClass = (status) => {
        if (status === 'Closed') {
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        }

        if (status === 'Progress') {
            return 'border-amber-200 bg-amber-50 text-amber-700';
        }

        return 'border-red-200 bg-red-50 text-red-700';
    };

    const getStatusDot = (status) => {
        if (status === 'Closed') {
            return 'bg-emerald-500';
        }

        if (status === 'Progress') {
            return 'bg-amber-500';
        }

        return 'bg-red-500';
    };

    const getTanggalValue = (itemTanggal) => {
        if (itemTanggal && typeof itemTanggal === 'object') {
            return itemTanggal.tanggal;
        }

        return itemTanggal;
    };

    const getTanggalLengkap = (itemTanggal, bulan, tahun) => {
        if (itemTanggal && typeof itemTanggal === 'object') {
            return itemTanggal.tanggal_lengkap;
        }

        return `${tahun}-${String(bulan).padStart(2, '0')}-${String(
            itemTanggal
        ).padStart(2, '0')}`;
    };

    const getChecklist = (item, tanggalLengkap) => {
        return item.checklists?.find((checklist) => {
            const tanggalChecklist = String(checklist.tanggal).substring(
                0,
                10
            );

            return tanggalChecklist === tanggalLengkap;
        });
    };

    return (
        <>
            <Head
                title={`${checkSheet.nama_checksheet} - Check Sheet`}
            />

            <div className="min-h-screen bg-slate-50 text-slate-800">
                {/* =================================================
                    HEADER
                ================================================== */}

                <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />
                    <div className="pointer-events-none absolute right-1/3 top-10 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />

                    <div className="relative mx-auto max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
                        {/* Breadcrumb */}
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-blue-200">
                            <Link
                                href="/check-sheets"
                                className="transition hover:text-white"
                            >
                                Check Sheet Prediktif
                            </Link>

                            <span className="text-blue-400">
                                /
                            </span>

                            <span className="max-w-[280px] truncate text-white/90">
                                {checkSheet.nama_checksheet}
                            </span>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-500 text-white shadow-xl shadow-blue-950/30">
                                    <ClipboardIcon />
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                            {checkSheet.nama_checksheet}
                                        </h1>

                                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100 backdrop-blur-sm">
                                            Check Sheet
                                        </span>
                                    </div>

                                    <p className="max-w-3xl text-sm leading-6 text-blue-100/80">
                                        Kelola inspection point,
                                        checklist harian, dan
                                        abnormality dalam satu
                                        halaman.
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                            {checkSheet.divisi?.nama_divisi ??
                                                '-'}
                                        </span>

                                        <span className="text-blue-300">
                                            •
                                        </span>

                                        <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                            {checkSheet.nomor_dokumen ??
                                                '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/check-sheets"
                                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                            >
                                <ArrowLeftIcon />
                                Kembali
                            </Link>
                        </div>
                    </div>

                    <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />
                </header>

                {/* =================================================
                    MAIN
                ================================================== */}

                <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
                    {/* =================================================
                        INFO CARD
                    ================================================== */}

                    <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 px-6 py-5 sm:px-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200">
                                    <ClipboardIcon />
                                </div>

                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900">
                                        Informasi Check Sheet
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Detail dokumen yang sedang
                                        dikelola.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-7">
                            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                                    Divisi
                                </p>

                                <p className="mt-2 text-base font-extrabold text-slate-900">
                                    {checkSheet.divisi?.nama_divisi ??
                                        '-'}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-500">
                                    Nama Check Sheet
                                </p>

                                <p className="mt-2 text-base font-extrabold text-slate-900">
                                    {checkSheet.nama_checksheet}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-500">
                                    Nomor Dokumen
                                </p>

                                <p className="mt-2 text-base font-extrabold text-slate-900">
                                    {checkSheet.nomor_dokumen}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        PERIOD TOOLBAR
                    ================================================== */}

                    <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/50 shadow-xl shadow-slate-200/40">
                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                        <div className="flex flex-col gap-5 p-6 sm:p-7 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200">
                                        <CalendarIcon />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900">
                                            Periode Checklist
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Pilih periode dan shift
                                            yang ingin ditampilkan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                {/* BULAN */}
                                <div className="min-w-[170px]">
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Bulan
                                    </label>

                                    <select
                                        value={bulan}
                                        onChange={(e) =>
                                            ubahPeriode(
                                                e.target.value,
                                                tahun
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        {namaBulan.map(
                                            (nama, index) => (
                                                <option
                                                    key={nama}
                                                    value={index + 1}
                                                >
                                                    {nama}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* TAHUN */}
                                <div className="min-w-[120px]">
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Tahun
                                    </label>

                                    <select
                                        value={tahun}
                                        onChange={(e) =>
                                            ubahPeriode(
                                                bulan,
                                                e.target.value
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        {Array.from(
                                            {
                                                length: 7,
                                            },
                                            (_, index) =>
                                                new Date().getFullYear() -
                                                3 +
                                                index
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

                                {/* SHIFT */}
                                <div className="min-w-[150px]">
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Shift
                                    </label>

                                    <select
                                        value={shiftFilter}
                                        onChange={(e) =>
                                            setShiftFilter(
                                                e.target.value
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        <option value="all">
                                            Semua Shift
                                        </option>
                                        <option value="A">
                                            Shift A
                                        </option>
                                        <option value="B">
                                            Shift B
                                        </option>
                                    </select>
                                </div>

                                {/* EXPORT */}
                                <div className="flex items-end">
                                    <a
                                        href={`/check-sheets/${checkSheet.id}/export-excel?bulan=${bulan}&tahun=${tahun}`}
                                        className="inline-flex h-[43px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl"
                                    >
                                        <ExcelIcon />
                                        Export Excel
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        INSPECTION POINT
                    ================================================== */}

                    <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-5 sm:px-7">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
                                        <ClipboardIcon />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900">
                                            Inspection Point
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Kelola titik pemeriksaan dan
                                            checklist harian.
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600">
                                        {filteredItems.length}{' '}
                                        Item
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddItemModal(true)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700 hover:shadow-xl"
                                >
                                    <PlusIcon />
                                    Tambah Inspection Point
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-[1200px] w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 text-white">
                                        <th className="sticky left-0 z-20 w-16 border-r border-white/10 px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                                            No
                                        </th>

                                        <th className="sticky left-16 z-20 min-w-[230px] border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            Inspection Point
                                        </th>

                                        <th className="min-w-[170px] border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            Condition
                                        </th>

                                        <th className="min-w-[180px] border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            Method
                                        </th>

                                        <th className="w-28 border-r border-white/10 px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                                            Shift
                                        </th>

                                        <th className="w-24 border-r border-white/10 px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                                            Aksi
                                        </th>

                                        {tanggal.map((itemTanggal, index) => {
                                            const tanggalValue = getTanggalValue(itemTanggal);
                                            const tanggalLengkap = getTanggalLengkap(
                                                itemTanggal,
                                                bulan,
                                                tahun
                                            );

                                            return (
                                                <th
                                                    key={tanggalLengkap || index}
                                                    className="w-12 min-w-12 border-r border-white/10 px-1 py-4 text-center text-[10px] font-bold"
                                                >
                                                    {tanggalValue}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    6 +
                                                    tanggal.length
                                                }
                                                className="px-6 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                        <ClipboardIcon />
                                                    </div>

                                                    <p className="font-bold text-slate-700">
                                                        Belum ada
                                                        Inspection
                                                        Point
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Tambahkan
                                                        inspection point
                                                        untuk mulai
                                                        menggunakan
                                                        checklist.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map(
                                            (item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className="group border-b border-slate-100 last:border-b-0 hover:bg-blue-50/40"
                                                >
                                                    <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-3 py-3 text-center text-sm font-bold text-slate-500 group-hover:bg-blue-50/40">
                                                        {item.no ??
                                                            index +
                                                                1}
                                                    </td>

                                                    <td className="sticky left-16 z-10 border-r border-slate-100 bg-white px-4 py-3 group-hover:bg-blue-50/40">
                                                        <div className="font-semibold text-slate-800">
                                                            {
                                                                item.inspection_point
                                                            }
                                                        </div>
                                                    </td>

                                                    <td className="border-r border-slate-100 px-4 py-3 text-sm text-slate-600">
                                                        {item.condition ||
                                                            '-'}
                                                    </td>

                                                    <td className="border-r border-slate-100 px-4 py-3 text-sm text-slate-600">
                                                        {item.method ||
                                                            '-'}
                                                    </td>

                                                    <td className="border-r border-slate-100 px-4 py-3 text-center">
                                                        <span className="inline-flex rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                                                            {item.shift ||
                                                                '-'}
                                                        </span>
                                                    </td>

                                                    <td className="border-r border-slate-100 px-2 py-3">
                                                        <div className="flex justify-center gap-1.5">
                                                            <IconButton
                                                                title="Edit"
                                                                onClick={() =>
                                                                    bukaEditItem(
                                                                        item
                                                                    )
                                                                }
                                                                variant="blue"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>

                                                            <IconButton
                                                                title="Hapus"
                                                                onClick={() =>
                                                                    hapusItem(
                                                                        item
                                                                    )
                                                                }
                                                                variant="red"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </div>
                                                    </td>

                                                    {tanggal.map((itemTanggal, index) => {
                                                        const tanggalLengkap = getTanggalLengkap(
                                                            itemTanggal,
                                                            bulan,
                                                            tahun
                                                        );

                                                        const checklist = getChecklist(
                                                            item,
                                                            tanggalLengkap
                                                        );

                                                        const checked = Boolean(checklist?.status);

                                                        return (
                                                            <td
                                                                key={tanggalLengkap || index}
                                                                className="border-r border-slate-100 px-1 py-2 text-center"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleChecklist(
                                                                            item,
                                                                            tanggalLengkap
                                                                        )
                                                                    }
                                                                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200 ${
                                                                        checked
                                                                            ? 'border-emerald-200 bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-100 hover:from-emerald-500 hover:to-teal-600'
                                                                            : 'border-slate-200 bg-slate-50 text-transparent hover:border-blue-300 hover:bg-blue-50'
                                                                    }`}
                                                                >
                                                                    {checked && <CheckIcon />}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* =================================================
                        ABNORMALITY
                    ================================================== */}

                    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-amber-50/40 to-orange-50/40 px-6 py-5 sm:px-7">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200">
                                        <AlertIcon />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900">
                                            Abnormality
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Catat abnormality,
                                            countermeasure, status,
                                            dan PIC.
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                                        {
                                            checkSheet
                                                .abnormalities
                                                ?.length
                                        }{' '}
                                        Data
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddAbnormalityModal(
                                            true
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
                                >
                                    <PlusIcon />
                                    Tambah Abnormality
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-800 via-indigo-800 to-violet-800 text-white">
                                        <th className="w-36 border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            Tanggal
                                        </th>

                                        <th className="min-w-[230px] border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            Abnormality
                                        </th>

                                        <th className="min-w-[260px] border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            Countermeasure
                                        </th>

                                        <th className="w-32 border-r border-white/10 px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                                            Status
                                        </th>

                                        <th className="w-40 border-r border-white/10 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider">
                                            PIC
                                        </th>

                                        <th className="w-24 px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {!checkSheet.abnormalities ||
                                    checkSheet.abnormalities
                                        .length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                                        <AlertIcon />
                                                    </div>

                                                    <p className="font-bold text-slate-700">
                                                        Belum ada
                                                        abnormality
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Tambahkan data
                                                        abnormality jika
                                                        ditemukan kondisi
                                                        tidak normal.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        checkSheet.abnormalities.map(
                                            (abnormality) => (
                                                <tr
                                                    key={
                                                        abnormality.id
                                                    }
                                                    className="group border-b border-slate-100 last:border-b-0 hover:bg-amber-50/30"
                                                >
                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                        {formatTanggal(
                                                            abnormality.tanggal
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                                                        {abnormality.abnormality ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm leading-6 text-slate-600">
                                                        {abnormality.countermeasure ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${getStatusClass(
                                                                abnormality.status
                                                            )}`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                                                    abnormality.status
                                                                )}`}
                                                            />

                                                            {
                                                                abnormality.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                                                        {abnormality.pic ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-3 py-4">
                                                        <div className="flex justify-center gap-1.5">
                                                            <IconButton
                                                                title="Edit"
                                                                onClick={() =>
                                                                    bukaEditAbnormality(
                                                                        abnormality
                                                                    )
                                                                }
                                                                variant="blue"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>

                                                            <IconButton
                                                                title="Hapus"
                                                                onClick={() =>
                                                                    hapusAbnormality(
                                                                        abnormality
                                                                    )
                                                                }
                                                                variant="red"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-center px-5 py-5 sm:px-6 lg:px-8">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
                MODAL - ADD ITEM
            ====================================================== */}

            {showAddItemModal && (
                <Modal
                    title="Tambah Inspection Point"
                    description="Tambahkan titik pemeriksaan baru ke dalam check sheet."
                    onClose={() =>
                        setShowAddItemModal(false)
                    }
                >
                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                                <h4 className="text-sm font-extrabold text-slate-800">
                                    Identitas Inspection Point
                                </h4>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="No"
                                required
                                error={errors.no}
                            >
                                <input
                                    type="number"
                                    value={data.no}
                                    onChange={(e) =>
                                        setData(
                                            'no',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Contoh: 1"
                                />
                            </Field>

                            <Field
                                label="Shift"
                                required
                                error={errors.shift}
                            >
                                <select
                                    value={data.shift}
                                    onChange={(e) =>
                                        setData(
                                            'shift',
                                            e.target.value
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="">
                                        Pilih Shift
                                    </option>
                                    <option value="A">
                                        Shift A
                                    </option>
                                    <option value="B">
                                        Shift B
                                    </option>
                                </select>
                            </Field>
                        </div>

                        <Field
                            label="Inspection Point"
                            required
                            error={errors.inspection_point}
                        >
                            <input
                                type="text"
                                value={data.inspection_point}
                                onChange={(e) =>
                                    setData(
                                        'inspection_point',
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                                placeholder="Masukkan titik pemeriksaan"
                            />
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Condition"
                                error={errors.condition}
                            >
                                <textarea
                                    value={data.condition}
                                    onChange={(e) =>
                                        setData(
                                            'condition',
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                    className={inputClass}
                                    placeholder="Kondisi normal yang diharapkan"
                                />
                            </Field>

                            <Field
                                label="Method"
                                error={errors.method}
                            >
                                <textarea
                                    value={data.method}
                                    onChange={(e) =>
                                        setData(
                                            'method',
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                    className={inputClass}
                                    placeholder="Metode pemeriksaan"
                                />
                            </Field>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddItemModal(false)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Data'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* =====================================================
                MODAL - EDIT ITEM
            ====================================================== */}

            {editingItem && (
                <Modal
                    title="Edit Inspection Point"
                    description="Perbarui informasi inspection point yang sudah tersimpan."
                    onClose={() => {
                        setEditingItem(null);
                        resetEdit();
                    }}
                >
                    <form
                        onSubmit={submitEdit}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-violet-50/50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />

                                <h4 className="text-sm font-extrabold text-slate-800">
                                    Perbarui Data
                                </h4>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="No"
                                required
                                error={editErrors.no}
                            >
                                <input
                                    type="number"
                                    value={editData.no}
                                    onChange={(e) =>
                                        setEditData(
                                            'no',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Shift"
                                required
                                error={editErrors.shift}
                            >
                                <select
                                    value={editData.shift}
                                    onChange={(e) =>
                                        setEditData(
                                            'shift',
                                            e.target.value
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="">
                                        Pilih Shift
                                    </option>
                                    <option value="A">
                                        Shift <A:link></A:link>
                                    </option>
                                    <option value="B">
                                        Shift B
                                    </option>
                                </select>
                            </Field>
                        </div>

                        <Field
                            label="Inspection Point"
                            required
                            error={editErrors.inspection_point}
                        >
                            <input
                                type="text"
                                value={
                                    editData.inspection_point
                                }
                                onChange={(e) =>
                                    setEditData(
                                        'inspection_point',
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Condition"
                                error={editErrors.condition}
                            >
                                <textarea
                                    value={editData.condition}
                                    onChange={(e) =>
                                        setEditData(
                                            'condition',
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Method"
                                error={editErrors.method}
                            >
                                <textarea
                                    value={editData.method}
                                    onChange={(e) =>
                                        setEditData(
                                            'method',
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingItem(null);
                                    resetEdit();
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={processingEdit}
                                className="rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processingEdit
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* =====================================================
                MODAL - ADD ABNORMALITY
            ====================================================== */}

            {showAddAbnormalityModal && (
                <Modal
                    title="Tambah Abnormality"
                    description="Catat kondisi abnormal yang ditemukan selama pemeriksaan."
                    icon="alert"
                    onClose={() =>
                        setShowAddAbnormalityModal(false)
                    }
                >
                    <form
                        onSubmit={submitAbnormality}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                                <h4 className="text-sm font-extrabold text-slate-800">
                                    Detail Abnormality
                                </h4>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Tanggal"
                                required
                                error={abnormalityErrors.tanggal}
                            >
                                <input
                                    type="date"
                                    value={
                                        abnormalityData.tanggal
                                    }
                                    onChange={(e) =>
                                        setAbnormalityData(
                                            'tanggal',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Status"
                                required
                                error={abnormalityErrors.status}
                            >
                                <select
                                    value={
                                        abnormalityData.status
                                    }
                                    onChange={(e) =>
                                        setAbnormalityData(
                                            'status',
                                            e.target.value
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="Open">
                                        Open
                                    </option>
                                    <option value="Progress">
                                        Progress
                                    </option>
                                    <option value="Closed">
                                        Closed
                                    </option>
                                </select>
                            </Field>
                        </div>

                        <Field
                            label="Abnormality"
                            required
                            error={
                                abnormalityErrors.abnormality
                            }
                        >
                            <textarea
                                value={
                                    abnormalityData.abnormality
                                }
                                onChange={(e) =>
                                    setAbnormalityData(
                                        'abnormality',
                                        e.target.value
                                    )
                                }
                                rows="4"
                                className={inputClass}
                                placeholder="Jelaskan kondisi abnormal yang ditemukan"
                            />
                        </Field>

                        <Field
                            label="Countermeasure"
                            error={
                                abnormalityErrors.countermeasure
                            }
                        >
                            <textarea
                                value={
                                    abnormalityData.countermeasure
                                }
                                onChange={(e) =>
                                    setAbnormalityData(
                                        'countermeasure',
                                        e.target.value
                                    )
                                }
                                rows="4"
                                className={inputClass}
                                placeholder="Tindakan perbaikan yang dilakukan"
                            />
                        </Field>

                        <Field
                            label="PIC"
                            error={abnormalityErrors.pic}
                        >
                            <input
                                type="text"
                                value={abnormalityData.pic}
                                onChange={(e) =>
                                    setAbnormalityData(
                                        'pic',
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                                placeholder="Nama PIC"
                            />
                        </Field>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddAbnormalityModal(
                                        false
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    processingAbnormality
                                }
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processingAbnormality
                                    ? 'Menyimpan...'
                                    : 'Simpan Data'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* =====================================================
                MODAL - EDIT ABNORMALITY
            ====================================================== */}

            {editingAbnormality && (
                <Modal
                    title="Edit Abnormality"
                    description="Perbarui data abnormality yang sudah tersimpan."
                    icon="alert"
                    onClose={() => {
                        setEditingAbnormality(null);
                        resetEditAbnormality();
                    }}
                >
                    <form
                        onSubmit={submitEditAbnormality}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/80 to-amber-50/50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />

                                <h4 className="text-sm font-extrabold text-slate-800">
                                    Perbarui Data Abnormality
                                </h4>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Tanggal"
                                required
                                error={
                                    editAbnormalityErrors.tanggal
                                }
                            >
                                <input
                                    type="date"
                                    value={
                                        editAbnormalityData.tanggal
                                    }
                                    onChange={(e) =>
                                        setEditAbnormalityData(
                                            'tanggal',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Status"
                                required
                                error={
                                    editAbnormalityErrors.status
                                }
                            >
                                <select
                                    value={
                                        editAbnormalityData.status
                                    }
                                    onChange={(e) =>
                                        setEditAbnormalityData(
                                            'status',
                                            e.target.value
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="Open">
                                        Open
                                    </option>
                                    <option value="Progress">
                                        Progress
                                    </option>
                                    <option value="Closed">
                                        Closed
                                    </option>
                                </select>
                            </Field>
                        </div>

                        <Field
                            label="Abnormality"
                            required
                            error={
                                editAbnormalityErrors.abnormality
                            }
                        >
                            <textarea
                                value={
                                    editAbnormalityData.abnormality
                                }
                                onChange={(e) =>
                                    setEditAbnormalityData(
                                        'abnormality',
                                        e.target.value
                                    )
                                }
                                rows="4"
                                className={inputClass}
                            />
                        </Field>

                        <Field
                            label="Countermeasure"
                            error={
                                editAbnormalityErrors.countermeasure
                            }
                        >
                            <textarea
                                value={
                                    editAbnormalityData.countermeasure
                                }
                                onChange={(e) =>
                                    setEditAbnormalityData(
                                        'countermeasure',
                                        e.target.value
                                    )
                                }
                                rows="4"
                                className={inputClass}
                            />
                        </Field>

                        <Field
                            label="PIC"
                            error={editAbnormalityErrors.pic}
                        >
                            <input
                                type="text"
                                value={
                                    editAbnormalityData.pic
                                }
                                onChange={(e) =>
                                    setEditAbnormalityData(
                                        'pic',
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingAbnormality(null);
                                    resetEditAbnormality();
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    processingEditAbnormality
                                }
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processingEditAbnormality
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}