import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

// =========================================================
// KOMPONEN KECIL
// =========================================================

const IconButton = ({
    title,
    onClick,
    variant = 'blue',
    children,
}) => {
    const variants = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white',
        red: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
        slate: 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800',
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-3.33.999.999-3.33a4.5 4.5 0 011.13-1.897L16.862 4.487z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 7.125L16.875 4.5"
        />
    </svg>
);

const DeleteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-4 w-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 7.5h12"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 7.5V5.25A1.25 1.25 0 0111 4h2a1.25 1.25 0 011.25 1.25V7.5"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 7.5v11.25A1.25 1.25 0 009.5 20h5a1.25 1.25 0 001.25-1.25V7.5"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 11v5.25M13.5 11v5.25"
        />
    </svg>
);

const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
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
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-5 w-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
    </svg>
);

const ClipboardIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-5 w-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5.25h6M9.75 3.75h4.5A1.5 1.5 0 0115.75 5.25v.75h.75A2.25 2.25 0 0118.75 8.25v11.25A2.25 2.25 0 0116.5 21.75h-9A2.25 2.25 0 015.25 19.5V8.25A2.25 2.25 0 017.5 6h.75v-.75a1.5 1.5 0 011.5-1.5z"
        />
    </svg>
);

const AlertIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-5 w-5"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3h.007v.008H12V15.75z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.29 3.86L2.82 17.25a1.875 1.875 0 001.64 2.812h15.08a1.875 1.875 0 001.64-2.812L13.71 3.86a1.875 1.875 0 00-3.42 0z"
        />
    </svg>
);

const ModalIcon = ({ type }) => {
    if (type === 'alert') {
        return (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <AlertIcon />
            </div>
        );
    }

    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <ClipboardIcon />
        </div>
    );
};

const Field = ({
    label,
    children,
    error,
    required = false,
    className = '',
}) => (
    <div className={className}>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
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

const Modal = ({
    title,
    description,
    icon = 'default',
    onClose,
    children,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <ModalIcon type={icon} />

                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    ×
                </button>
            </div>

            <div className="overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function Show({
    checkSheet,
    bulan,
    tahun,
    tanggal,
}) {
    const [editingItem, setEditingItem] = useState(null);
    const [editingAbnormality, setEditingAbnormality] =
        useState(null);

    const [showAddItemModal, setShowAddItemModal] =
        useState(false);

    const [showAddAbnormalityModal, setShowAddAbnormalityModal] =
        useState(false);

    const [shiftFilter, setShiftFilter] = useState('all');

    // =========================================================
    // FORM TAMBAH ITEM
    // =========================================================

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

    // =========================================================
    // FORM EDIT ITEM
    // =========================================================

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

    // =========================================================
    // FORM TAMBAH ABNORMALITY
    // =========================================================

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

    // =========================================================
    // FORM EDIT ABNORMALITY
    // =========================================================

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

    // =========================================================
    // DATA BULAN
    // =========================================================

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

    // =========================================================
    // FILTER PERIODE
    // =========================================================

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

    // =========================================================
    // CHECKLIST
    // =========================================================

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

    // =========================================================
    // TAMBAH ITEM
    // =========================================================

    const submit = (e) => {
        e.preventDefault();

        post(`/check-sheets/${checkSheet.id}/items`, {
            onSuccess: () => {
                reset();
                setShowAddItemModal(false);
            },
        });
    };

    // =========================================================
    // EDIT ITEM
    // =========================================================

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

    // =========================================================
    // TAMBAH ABNORMALITY
    // =========================================================

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

    // =========================================================
    // EDIT ABNORMALITY
    // =========================================================

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

    // =========================================================
    // FILTER ITEM SHIFT
    // =========================================================

    const filteredItems = checkSheet.items.filter((item) => {
        if (shiftFilter === 'all') {
            return true;
        }

        return item.shift === shiftFilter;
    });

    // =========================================================
    // OPEN EDIT ITEM
    // =========================================================

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

    // =========================================================
    // OPEN EDIT ABNORMALITY
    // =========================================================

    const bukaEditAbnormality = (abnormality) => {
        setEditingAbnormality(abnormality);

        setEditAbnormalityData({
            tanggal: abnormality.tanggal,
            abnormality: abnormality.abnormality,
            countermeasure: abnormality.countermeasure ?? '',
            status: abnormality.status,
            pic: abnormality.pic ?? '',
        });
    };

    // =========================================================
    // HAPUS ITEM
    // =========================================================

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

    // =========================================================
    // HAPUS ABNORMALITY
    // =========================================================

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

    return (
        <>
            <Head title={checkSheet.nama_checksheet} />

            <div className="min-h-screen bg-[#f6f8fb] text-slate-800">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                    <div className="mx-auto max-w-[1500px] px-5 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-3">
                                <Link
                                    href="/check-sheets"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                    title="Kembali"
                                >
                                    <ArrowLeftIcon />
                                </Link>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                            {checkSheet.nama_checksheet}
                                        </h1>

                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                                            Check Sheet
                                        </span>
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm">
                                        <span>
                                            {checkSheet.divisi?.nama_divisi ?? '-'}
                                        </span>

                                        <span className="text-slate-300">
                                            •
                                        </span>

                                        <span>
                                            {checkSheet.nomor_dokumen}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden items-center gap-2 sm:flex">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Periode
                                    </p>

                                    <p className="text-sm font-bold text-slate-700">
                                        {namaBulan[bulan - 1]} {tahun}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">

                    {/* =================================================
                        INFORMASI CHECK SHEET
                    ================================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <ClipboardIcon />
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Informasi Check Sheet
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Informasi dasar dokumen pemeriksaan
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                            <div className="px-5 py-4 sm:px-6">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Divisi
                                </p>

                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                    {checkSheet.divisi?.nama_divisi ?? '-'}
                                </p>
                            </div>

                            <div className="px-5 py-4 sm:px-6">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Nama Check Sheet
                                </p>

                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                    {checkSheet.nama_checksheet}
                                </p>
                            </div>

                            <div className="px-5 py-4 sm:px-6">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Nomor Dokumen
                                </p>

                                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                                    {checkSheet.nomor_dokumen}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        TOOLBAR PERIODE
                    ================================================== */}

                    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                            {/* JUDUL */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Periode Checklist
                                    </h2>
                                </div>

                                <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                                    Atur periode dan shift untuk melihat checklist harian.
                                </p>
                            </div>

                            {/* FILTER + EXCEL */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

                                {/* BULAN */}
                                <div className="w-full sm:w-40">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Bulan
                                    </label>

                                    <select
                                        value={bulan}
                                        onChange={(e) =>
                                            ubahPeriode(
                                                Number(e.target.value),
                                                tahun
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        {namaBulan.map((nama, index) => (
                                            <option
                                                key={index}
                                                value={index + 1}
                                            >
                                                {nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* TAHUN */}
                                <div className="w-full sm:w-28">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Tahun
                                    </label>

                                    <select
                                        value={tahun}
                                        onChange={(e) =>
                                            ubahPeriode(
                                                bulan,
                                                Number(e.target.value)
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        {[2025, 2026, 2027].map(
                                            (tahunOption) => (
                                                <option
                                                    key={tahunOption}
                                                    value={tahunOption}
                                                >
                                                    {tahunOption}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* SHIFT */}
                                <div className="w-full sm:w-40">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Shift
                                    </label>

                                    <select
                                        value={shiftFilter}
                                        onChange={(e) =>
                                            setShiftFilter(e.target.value)
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

                                {/* EXCEL */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        window.location.href = `/check-sheets/${checkSheet.id}/export-excel?bulan=${bulan}&tahun=${tahun}`
                                    }
                                    title="Download Excel"
                                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 3.75v11.25m0 0l-4.5-4.5m4.5 4.5l4.5-4.5"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5.25 19.5h13.5"
                                        />
                                    </svg>
                                </button>

                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        ITEM PEMERIKSAAN
                    ================================================== */}

                    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {/* HEADER */}

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <ClipboardIcon />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-slate-900">
                                                Item Pemeriksaan
                                            </h2>

                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                {filteredItems.length} item
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                            Daftar inspection point dan checklist harian.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setShowAddItemModal(true);
                                        }}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
                                    >
                                        <PlusIcon />
                                        Tambah Inspection Point
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max text-sm">

                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="sticky left-0 z-20 w-16 border-r border-slate-700 bg-slate-900 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide">
                                            No
                                        </th>

                                        <th className="min-w-[250px] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">
                                            Inspection Point
                                        </th>

                                        <th className="min-w-[190px] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">
                                            Condition
                                        </th>

                                        <th className="min-w-[130px] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">
                                            Method
                                        </th>

                                        <th className="min-w-[85px] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide">
                                            Shift
                                        </th>

                                        <th className="min-w-[110px] border-r border-slate-700 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide">
                                            Aksi
                                        </th>

                                        {tanggal.map((hari) => (
                                            <th
                                                key={hari.tanggal_lengkap}
                                                className="min-w-11 border-l border-slate-700 bg-slate-800 px-1 py-2.5 text-center"
                                            >
                                                <span className="block text-[10px] font-medium text-slate-400">
                                                    TGL
                                                </span>

                                                <span className="mt-0.5 block text-xs font-bold text-white">
                                                    {hari.tanggal}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {filteredItems.length > 0 ? (
                                        filteredItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="group transition hover:bg-blue-50/30"
                                            >

                                                {/* NO */}

                                                <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-3 py-3 text-center font-bold text-slate-600 group-hover:bg-blue-50/30">
                                                    {item.no}
                                                </td>

                                                {/* INSPECTION POINT */}

                                                <td className="max-w-[300px] px-4 py-3">
                                                    <p className="font-semibold leading-5 text-slate-800">
                                                        {item.inspection_point}
                                                    </p>
                                                </td>

                                                {/* CONDITION */}

                                                <td className="max-w-[230px] px-4 py-3">
                                                    <p className="leading-5 text-slate-600">
                                                        {item.condition ?? '-'}
                                                    </p>
                                                </td>

                                                {/* METHOD */}

                                                <td className="px-4 py-3">
                                                    <span className="text-slate-600">
                                                        {item.method ?? '-'}
                                                    </span>
                                                </td>

                                                {/* SHIFT */}

                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2 py-1 text-[11px] font-bold ${
                                                            item.shift === 'A'
                                                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                                                                : 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'
                                                        }`}
                                                    >
                                                        {item.shift}
                                                    </span>
                                                </td>

                                                {/* AKSI */}

                                                <td className="border-r border-slate-100 px-3 py-3">
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

                                                {/* CHECKLIST HARIAN */}

                                                {tanggal.map((hari) => {
                                                    const checklist =
                                                        item.checklists?.find(
                                                            (checklist) =>
                                                                checklist.tanggal ===
                                                                hari.tanggal_lengkap
                                                        );

                                                    const sudahChecklist =
                                                        checklist?.status ===
                                                        true;

                                                    return (
                                                        <td
                                                            key={
                                                                hari.tanggal_lengkap
                                                            }
                                                            className="border-l border-slate-100 px-1.5 py-2 text-center"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleChecklist(
                                                                        item,
                                                                        hari.tanggal_lengkap
                                                                    )
                                                                }
                                                                title={
                                                                    sudahChecklist
                                                                        ? 'Checklist selesai'
                                                                        : 'Tandai selesai'
                                                                }
                                                                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-150 ${
                                                                    sudahChecklist
                                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                                                        : 'border-slate-200 bg-white text-transparent hover:border-blue-400 hover:bg-blue-50'
                                                                }`}
                                                            >
                                                                ✓
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={
                                                    6 + tanggal.length
                                                }
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                        <ClipboardIcon />
                                                    </div>

                                                    <p className="mt-3 text-sm font-semibold text-slate-700">
                                                        Belum ada item pemeriksaan
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Tambahkan inspection point untuk mulai membuat checklist.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* =================================================
                        ABNORMALITY
                    ================================================== */}

                    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {/* HEADER */}

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                        <AlertIcon />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-slate-900">
                                                Abnormality
                                            </h2>

                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                {checkSheet.abnormalities?.length ?? 0} laporan
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                            Catatan kondisi abnormal yang ditemukan saat pemeriksaan.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        resetAbnormality();
                                        setShowAddAbnormalityModal(true);
                                    }}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
                                >
                                    <PlusIcon />
                                    Tambah Abnormality
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Tanggal
                                        </th>

                                        <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Abnormality
                                        </th>

                                        <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Countermeasure
                                        </th>

                                        <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            PIC
                                        </th>

                                        <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {checkSheet.abnormalities?.length > 0 ? (
                                        checkSheet.abnormalities.map(
                                            (abnormality) => (
                                                <tr
                                                    key={abnormality.id}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                                                        {abnormality.tanggal}
                                                    </td>

                                                    <td className="max-w-[300px] px-4 py-4">
                                                        <p className="font-semibold leading-5 text-slate-800">
                                                            {abnormality.abnormality}
                                                        </p>
                                                    </td>

                                                    <td className="max-w-[300px] px-4 py-4 text-slate-600">
                                                        {abnormality.countermeasure ??
                                                            '-'}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                                abnormality.status ===
                                                                'Open'
                                                                    ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                                                                    : abnormality.status ===
                                                                      'Progress'
                                                                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                                                                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                                            }`}
                                                        >
                                                            {abnormality.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-slate-600">
                                                        {abnormality.pic ??
                                                            '-'}
                                                    </td>

                                                    <td className="px-4 py-4">
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
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                        <AlertIcon />
                                                    </div>

                                                    <p className="mt-3 text-sm font-semibold text-slate-700">
                                                        Belum ada abnormality
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Catatan kondisi abnormal akan muncul di sini.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            {/* =========================================================
                MODAL TAMBAH ITEM
            ========================================================== */}

            {showAddItemModal && (
                <Modal
                    title="Tambah Inspection Point"
                    description="Tambahkan item pemeriksaan baru."
                    onClose={() => {
                        reset();
                        setShowAddItemModal(false);
                    }}
                >
                    <form onSubmit={submit} className="p-6">
                        <div className="grid gap-5 md:grid-cols-2">

                            <Field
                                label="No"
                                required
                                error={errors.no}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={data.no}
                                    onChange={(e) =>
                                        setData(
                                            'no',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Contoh: 1"
                                    className={inputClass}
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

                            <Field
                                label="Inspection Point"
                                required
                                error={errors.inspection_point}
                                className="md:col-span-2"
                            >
                                <textarea
                                    value={data.inspection_point}
                                    onChange={(e) =>
                                        setData(
                                            'inspection_point',
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    placeholder="Contoh: Periksa kondisi oli mesin"
                                    className={inputClass}
                                />
                            </Field>

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
                                    rows={3}
                                    placeholder="Contoh: Tidak bocor"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Method"
                                error={errors.method}
                            >
                                <input
                                    type="text"
                                    value={data.method}
                                    onChange={(e) =>
                                        setData(
                                            'method',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Contoh: Visual"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setShowAddItemModal(false);
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* =========================================================
                MODAL EDIT ITEM
            ========================================================== */}

            {editingItem && (
                <Modal
                    title="Edit Inspection Point"
                    description="Perbarui data item pemeriksaan."
                    onClose={() => {
                        setEditingItem(null);
                        resetEdit();
                    }}
                >
                    <form onSubmit={submitEdit} className="p-6">
                        <div className="grid gap-5 md:grid-cols-2">

                            <Field
                                label="No"
                                required
                                error={editErrors.no}
                            >
                                <input
                                    type="number"
                                    min="1"
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
                                        Shift A
                                    </option>

                                    <option value="B">
                                        Shift B
                                    </option>
                                </select>
                            </Field>

                            <Field
                                label="Inspection Point"
                                required
                                error={editErrors.inspection_point}
                                className="md:col-span-2"
                            >
                                <textarea
                                    value={
                                        editData.inspection_point
                                    }
                                    onChange={(e) =>
                                        setEditData(
                                            'inspection_point',
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    className={inputClass}
                                />
                            </Field>

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
                                    rows={3}
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Method"
                                error={editErrors.method}
                            >
                                <input
                                    type="text"
                                    value={editData.method}
                                    onChange={(e) =>
                                        setEditData(
                                            'method',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingItem(null);
                                    resetEdit();
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={processingEdit}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processingEdit
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* =========================================================
                MODAL TAMBAH ABNORMALITY
            ========================================================== */}

            {showAddAbnormalityModal && (
                <Modal
                    title="Tambah Abnormality"
                    description="Catat kondisi abnormal yang ditemukan."
                    icon="alert"
                    onClose={() => {
                        resetAbnormality();
                        setShowAddAbnormalityModal(false);
                    }}
                >
                    <form
                        onSubmit={submitAbnormality}
                        className="p-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">

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

                            <Field
                                label="Abnormality"
                                required
                                error={abnormalityErrors.abnormality}
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
                                    rows={3}
                                    placeholder="Contoh: Terdapat kebocoran oli"
                                    className={inputClass}
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
                                    rows={3}
                                    placeholder="Contoh: Mengganti seal oli"
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="PIC"
                                error={abnormalityErrors.pic}
                                className="md:col-span-2"
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
                                    placeholder="Contoh: Budi"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    resetAbnormality();
                                    setShowAddAbnormalityModal(
                                        false
                                    );
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={processingAbnormality}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processingAbnormality
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* =========================================================
                MODAL EDIT ABNORMALITY
            ========================================================== */}

            {editingAbnormality && (
                <Modal
                    title="Edit Abnormality"
                    description="Perbarui data abnormality."
                    icon="alert"
                    onClose={() => {
                        setEditingAbnormality(null);
                        resetEditAbnormality();
                    }}
                >
                    <form
                        onSubmit={submitEditAbnormality}
                        className="p-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">

                            <Field
                                label="Tanggal"
                                required
                                error={editAbnormalityErrors.tanggal}
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
                                error={editAbnormalityErrors.status}
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
                                    rows={3}
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
                                    rows={3}
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="PIC"
                                error={editAbnormalityErrors.pic}
                                className="md:col-span-2"
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
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingAbnormality(null);
                                    resetEditAbnormality();
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={processingEditAbnormality}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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