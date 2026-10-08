import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

// =========================================================
// ICONS  (UI saja, tidak ada logic)
// =========================================================

const ICONS = {
    edit: { paths: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'] },
    trash: { paths: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v5M14 11v5'] },
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    back: { paths: ['M19 12H5', 'M12 19l-7-7 7-7'] },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5', 'M9 9h6M9 13h6M9 17h4'],
    },
    alert: {
        paths: [
            'M10.3 3.6L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z',
            'M12 9v4',
            'M12 17h.01',
        ],
    },
    excel: {
        paths: [
            'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
            'M14 2v6h6',
            'M8 13l2 2-2 2M12 13l2 2-2 2',
        ],
    },
    check: { sw: 2.5, paths: ['M5 12l4 4L19 6'] },
    calendar: {
        rect: { x: 3, y: 4, width: 18, height: 17, rx: 2 },
        paths: ['M16 2v4M8 2v4M3 10h18'],
    },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
};

const Icon = ({ type, className = 'h-4 w-4' }) => {
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
};

// =========================================================
// STYLE TOKENS
// =========================================================

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

const selectClass = inputClass;

const tableHead =
    'border-r border-white/10 px-4 py-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap';

// =========================================================
// SMALL COMPONENTS
// =========================================================

const IconButton = ({ title, onClick, variant = 'blue', children }) => {
    const variants = {
        blue: 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100',
        red: 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100',
        slate: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800',
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const Field = ({ label, children, error, required = false, className = '' }) => (
    <div className={className}>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {children}

        {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
    </div>
);

const SectionHead = ({ icon, tone, title, desc, badge, badgeTone, action }) => {
    const tones = {
        blue: 'from-blue-500 via-indigo-600 to-violet-600 shadow-indigo-300/50',
        amber: 'from-amber-400 to-orange-500 shadow-amber-300/50',
    };

    const badgeTones = {
        blue: 'border-blue-100 bg-blue-50 text-blue-600',
        amber: 'border-amber-100 bg-amber-50 text-amber-600',
    };

    return (
        <div
            className={`border-b border-slate-100 px-6 py-5 sm:px-7 ${
                tone === 'amber'
                    ? 'bg-gradient-to-r from-white via-amber-50/50 to-orange-50/50'
                    : 'bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/60'
            }`}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${tones[tone]}`}
                    >
                        <Icon type={icon} className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                    </div>

                    {badge !== undefined && (
                        <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-bold ${badgeTones[badgeTone]}`}
                        >
                            {badge}
                        </span>
                    )}
                </div>

                {action}
            </div>
        </div>
    );
};

const FormBanner = ({ text, tone = 'blue' }) => {
    const tones = {
        blue: ['border-blue-100 from-blue-50/80 to-indigo-50/50', 'bg-blue-500'],
        indigo: ['border-indigo-100 from-indigo-50/80 to-violet-50/50', 'bg-indigo-500'],
        amber: ['border-amber-100 from-amber-50/80 to-orange-50/50', 'bg-amber-500'],
        orange: ['border-orange-100 from-orange-50/80 to-amber-50/50', 'bg-orange-500'],
    };

    return (
        <div className={`rounded-2xl border bg-gradient-to-r p-4 ${tones[tone][0]}`}>
            <div className="flex items-center gap-3">
                <div className={`h-1.5 w-1.5 rounded-full ${tones[tone][1]}`} />
                <h4 className="text-sm font-bold text-slate-800">{text}</h4>
            </div>
        </div>
    );
};

const FormActions = ({ onCancel, processing, label, tone = 'blue' }) => (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
            Batal
        </button>

        <button
            type="submit"
            disabled={processing}
            className={`rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                tone === 'amber'
                    ? 'from-amber-500 to-orange-500 shadow-amber-300/50 hover:from-amber-600 hover:to-orange-600'
                    : 'from-blue-500 via-indigo-600 to-violet-600 shadow-indigo-300/50 hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700'
            }`}
        >
            {processing ? 'Menyimpan...' : label}
        </button>
    </div>
);

// Field form Inspection Point (dipakai add & edit)
const ItemFields = ({ data, setData, errors, withPlaceholder = false }) => (
    <>
        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="No" required error={errors.no}>
                <input
                    type="number"
                    value={data.no}
                    onChange={(e) => setData('no', e.target.value)}
                    className={inputClass}
                    placeholder={withPlaceholder ? 'Contoh: 1' : undefined}
                />
            </Field>

            <Field label="Shift" required error={errors.shift}>
                <select
                    value={data.shift}
                    onChange={(e) => setData('shift', e.target.value)}
                    className={selectClass}
                >
                    <option value="">Pilih Shift</option>
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                </select>
            </Field>
        </div>

        <Field label="Inspection Point" required error={errors.inspection_point}>
            <input
                type="text"
                value={data.inspection_point}
                onChange={(e) => setData('inspection_point', e.target.value)}
                className={inputClass}
                placeholder={withPlaceholder ? 'Masukkan titik pemeriksaan' : undefined}
            />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Condition" error={errors.condition}>
                <textarea
                    value={data.condition}
                    onChange={(e) => setData('condition', e.target.value)}
                    rows="4"
                    className={inputClass}
                    placeholder={withPlaceholder ? 'Kondisi normal yang diharapkan' : undefined}
                />
            </Field>

            <Field label="Method" error={errors.method}>
                <textarea
                    value={data.method}
                    onChange={(e) => setData('method', e.target.value)}
                    rows="4"
                    className={inputClass}
                    placeholder={withPlaceholder ? 'Metode pemeriksaan' : undefined}
                />
            </Field>
        </div>
    </>
);

// Field form Abnormality (dipakai add & edit)
const AbnormalityFields = ({ data, setData, errors, withPlaceholder = false }) => (
    <>
        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tanggal" required error={errors.tanggal}>
                <input
                    type="date"
                    value={data.tanggal}
                    onChange={(e) => setData('tanggal', e.target.value)}
                    className={inputClass}
                />
            </Field>

            <Field label="Status" required error={errors.status}>
                <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className={selectClass}
                >
                    <option value="Open">Open</option>
                    <option value="Progress">Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </Field>
        </div>

        <Field label="Abnormality" required error={errors.abnormality}>
            <textarea
                value={data.abnormality}
                onChange={(e) => setData('abnormality', e.target.value)}
                rows="4"
                className={inputClass}
                placeholder={withPlaceholder ? 'Jelaskan kondisi abnormal yang ditemukan' : undefined}
            />
        </Field>

        <Field label="Countermeasure" error={errors.countermeasure}>
            <textarea
                value={data.countermeasure}
                onChange={(e) => setData('countermeasure', e.target.value)}
                rows="4"
                className={inputClass}
                placeholder={withPlaceholder ? 'Tindakan perbaikan yang dilakukan' : undefined}
            />
        </Field>

        <Field label="PIC" error={errors.pic}>
            <input
                type="text"
                value={data.pic}
                onChange={(e) => setData('pic', e.target.value)}
                className={inputClass}
                placeholder={withPlaceholder ? 'Nama PIC' : undefined}
            />
        </Field>
    </>
);

// =========================================================
// MODAL
// =========================================================

const Modal = ({ title, description, icon = 'default', onClose, children }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#030a26]/60 p-4 backdrop-blur-md">
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
            >
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 px-6 py-5 sm:px-7">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
                                icon === 'alert'
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-300/50'
                                    : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 shadow-indigo-300/50'
                            }`}
                        >
                            <Icon
                                type={icon === 'alert' ? 'alert' : 'clipboard'}
                                className="h-6 w-6"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold tracking-tight text-slate-900">
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
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                            title="Tutup"
                        >
                            <Icon type="close" className="h-4 w-4" />
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

export default function Show({ checkSheet, bulan, tahun, tanggal }) {
    // =====================================================
    // STATE
    // =====================================================

    const [editingItem, setEditingItem] = useState(null);
    const [editingAbnormality, setEditingAbnormality] = useState(null);

    const [showAddItemModal, setShowAddItemModal] = useState(false);

    const [showAddAbnormalityModal, setShowAddAbnormalityModal] =
        useState(false);

    const [shiftFilter, setShiftFilter] = useState('all');

    // =====================================================
    // FORM - ADD ITEM
    // =====================================================

    const { data, setData, post, processing, errors, reset } = useForm({
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
            (checklist) => checklist.tanggal === tanggalLengkap
        );

        const statusBaru = checklist ? !checklist.status : true;

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

        putEdit(`/check-sheets/${checkSheet.id}/items/${editingItem.id}`, {
            onSuccess: () => {
                setEditingItem(null);
                resetEdit();
            },
        });
    };

    // =====================================================
    // ADD ABNORMALITY
    // =====================================================

    const submitAbnormality = (e) => {
        e.preventDefault();

        postAbnormality(`/check-sheets/${checkSheet.id}/abnormalities`, {
            onSuccess: () => {
                resetAbnormality();
                setShowAddAbnormalityModal(false);
            },
        });
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
            countermeasure: abnormality.countermeasure ?? '',
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
            router.delete(`/check-sheets/${checkSheet.id}/items/${item.id}`, {
                preserveScroll: true,
            });
        }
    };

    // =====================================================
    // DELETE ABNORMALITY
    // =====================================================

    const hapusAbnormality = (abnormality) => {
        if (confirm('Yakin ingin menghapus abnormality ini?')) {
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
            const tanggalChecklist = String(checklist.tanggal).substring(0, 10);

            return tanggalChecklist === tanggalLengkap;
        });
    };

    return (
        <>
            <Head title={`${checkSheet.nama_checksheet} - Check Sheet`} />

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

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-rise { animation: idxRise 0.7s ease-out both; }

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
                    .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-800">
                {/* =================================================
                    BACKGROUND
                ================================================== */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="idx-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="idx-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* =================================================
                    HEADER (TRANSPARAN)
                ================================================== */}
                <header className="border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
                        {/* Breadcrumb */}
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-blue-200/80">
                            <Link
                                href="/check-sheets"
                                className="transition hover:text-white"
                            >
                                Check Sheet Prediktif
                            </Link>

                            <span className="text-blue-300/60">/</span>

                            <span className="max-w-[280px] truncate text-white/90">
                                {checkSheet.nama_checksheet}
                            </span>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 rounded-2xl bg-blue-400/40 blur-xl" />

                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-lg">
                                        <Icon type="clipboard" className="h-7 w-7" />
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                            {checkSheet.nama_checksheet}
                                        </h1>

                                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100 backdrop-blur-sm">
                                            Check Sheet
                                        </span>
                                    </div>

                                    <p className="max-w-3xl text-sm leading-6 text-white/65">
                                        Kelola inspection point, checklist
                                        harian, dan abnormality dalam satu
                                        halaman.
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                            {checkSheet.divisi?.nama_divisi ?? '-'}
                                        </span>

                                        <span className="text-blue-300/60">•</span>

                                        <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 font-mono text-xs font-semibold text-white backdrop-blur-sm">
                                            {checkSheet.nomor_dokumen ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/check-sheets"
                                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25"
                            >
                                <Icon type="back" />
                                Kembali
                            </Link>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    MAIN
                ================================================== */}
                <main className="mx-auto w-full max-w-[1500px] flex-1 px-5 py-8 sm:px-6 lg:px-8">
                    {/* INFO CARD */}
                    <section
                        className={`idx-rise mb-6 overflow-hidden rounded-3xl ${glassCard}`}
                    >
                        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 px-6 py-5 sm:px-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-300/50">
                                    <Icon type="clipboard" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Informasi Check Sheet
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Detail dokumen yang sedang dikelola.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-7">
                            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-500">
                                    Divisi
                                </p>

                                <p className="mt-2 text-base font-bold text-slate-900">
                                    {checkSheet.divisi?.nama_divisi ?? '-'}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-500">
                                    Nama Check Sheet
                                </p>

                                <p className="mt-2 text-base font-bold text-slate-900">
                                    {checkSheet.nama_checksheet}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-500">
                                    Nomor Dokumen
                                </p>

                                <p className="mt-2 font-mono text-base font-bold text-slate-900">
                                    {checkSheet.nomor_dokumen}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* PERIOD TOOLBAR */}
                    <section
                        style={{ animationDelay: '100ms' }}
                        className={`idx-rise relative mb-6 overflow-hidden rounded-3xl ${glassCard}`}
                    >
                        <div className="flex flex-col gap-5 p-6 sm:p-7 xl:flex-row xl:items-end xl:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-300/50">
                                    <Icon type="calendar" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Periode Checklist
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Pilih periode dan shift yang ingin
                                        ditampilkan.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                {/* BULAN */}
                                <div className="min-w-[170px]">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Bulan
                                    </label>

                                    <select
                                        value={bulan}
                                        onChange={(e) =>
                                            ubahPeriode(e.target.value, tahun)
                                        }
                                        className={selectClass}
                                    >
                                        {namaBulan.map((nama, index) => (
                                            <option key={nama} value={index + 1}>
                                                {nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* TAHUN */}
                                <div className="min-w-[120px]">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Tahun
                                    </label>

                                    <select
                                        value={tahun}
                                        onChange={(e) =>
                                            ubahPeriode(bulan, e.target.value)
                                        }
                                        className={selectClass}
                                    >
                                        {Array.from(
                                            { length: 7 },
                                            (_, index) =>
                                                new Date().getFullYear() - 3 + index
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* SHIFT */}
                                <div className="min-w-[150px]">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                        Shift
                                    </label>

                                    <select
                                        value={shiftFilter}
                                        onChange={(e) =>
                                            setShiftFilter(e.target.value)
                                        }
                                        className={selectClass}
                                    >
                                        <option value="all">Semua Shift</option>
                                        <option value="A">Shift A</option>
                                        <option value="B">Shift B</option>
                                    </select>
                                </div>

                                {/* EXPORT */}
                                <div className="flex items-end">
                                    <a
                                        href={`/check-sheets/${checkSheet.id}/export-excel?bulan=${bulan}&tahun=${tahun}`}
                                        className="group inline-flex h-[43px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md"
                                    >
                                        <Icon type="excel" />
                                        Export Excel
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </section>

                    {/* INSPECTION POINT */}
                    <section
                        style={{ animationDelay: '200ms' }}
                        className={`idx-rise mb-6 overflow-hidden rounded-3xl ${glassCard}`}
                    >
                        <SectionHead
                            icon="clipboard"
                            tone="blue"
                            title="Inspection Point"
                            desc="Kelola titik pemeriksaan dan checklist harian."
                            badge={`${filteredItems.length} Item`}
                            badgeTone="blue"
                            action={
                                <button
                                    type="button"
                                    onClick={() => setShowAddItemModal(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg"
                                >
                                    <Icon type="plus" />
                                    Tambah Inspection Point
                                </button>
                            }
                        />

                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full min-w-[1200px] border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900 text-white">
                                        <th className={`sticky left-0 z-20 w-16 bg-[#0a1a4d] text-center ${tableHead}`}>
                                            No
                                        </th>

                                        <th className={`sticky left-16 z-20 min-w-[230px] bg-[#0b1f5c] text-left ${tableHead}`}>
                                            Inspection Point
                                        </th>

                                        <th className={`min-w-[170px] text-left ${tableHead}`}>
                                            Condition
                                        </th>

                                        <th className={`min-w-[180px] text-left ${tableHead}`}>
                                            Method
                                        </th>

                                        <th className={`w-28 text-center ${tableHead}`}>
                                            Shift
                                        </th>

                                        <th className={`w-24 text-center ${tableHead}`}>
                                            Aksi
                                        </th>

                                        {tanggal.map((itemTanggal, index) => {
                                            const tanggalValue =
                                                getTanggalValue(itemTanggal);
                                            const tanggalLengkap =
                                                getTanggalLengkap(
                                                    itemTanggal,
                                                    bulan,
                                                    tahun
                                                );

                                            return (
                                                <th
                                                    key={tanggalLengkap || index}
                                                    className="w-12 min-w-12 border-r border-white/10 px-1 py-4 text-center text-[11px] font-bold"
                                                >
                                                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                                                        {tanggalValue}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6 + tanggal.length}
                                                className="px-6 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                        <Icon type="clipboard" className="h-7 w-7" />
                                                    </div>

                                                    <p className="font-semibold text-slate-700">
                                                        Belum ada Inspection Point
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Tambahkan inspection point
                                                        untuk mulai menggunakan
                                                        checklist.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-blue-50/50"
                                            >
                                                <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-3 py-3 text-center text-sm font-bold text-slate-500 group-hover:bg-blue-50">
                                                    {item.no ?? index + 1}
                                                </td>

                                                <td className="sticky left-16 z-10 border-r border-slate-100 bg-white px-4 py-3 group-hover:bg-blue-50">
                                                    <div className="font-semibold text-slate-800">
                                                        {item.inspection_point}
                                                    </div>
                                                </td>

                                                <td className="border-r border-slate-100 px-4 py-3 text-sm text-slate-600">
                                                    {item.condition || '-'}
                                                </td>

                                                <td className="border-r border-slate-100 px-4 py-3 text-sm text-slate-600">
                                                    {item.method || '-'}
                                                </td>

                                                <td className="border-r border-slate-100 px-4 py-3 text-center">
                                                    <span className="inline-flex rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                                                        {item.shift || '-'}
                                                    </span>
                                                </td>

                                                <td className="border-r border-slate-100 px-2 py-3">
                                                    <div className="flex justify-center gap-1.5">
                                                        <IconButton
                                                            title="Edit"
                                                            onClick={() => bukaEditItem(item)}
                                                            variant="blue"
                                                        >
                                                            <Icon type="edit" />
                                                        </IconButton>

                                                        <IconButton
                                                            title="Hapus"
                                                            onClick={() => hapusItem(item)}
                                                            variant="red"
                                                        >
                                                            <Icon type="trash" />
                                                        </IconButton>
                                                    </div>
                                                </td>

                                                {tanggal.map((itemTanggal, index) => {
                                                    const tanggalLengkap =
                                                        getTanggalLengkap(
                                                            itemTanggal,
                                                            bulan,
                                                            tahun
                                                        );

                                                    const checklist = getChecklist(
                                                        item,
                                                        tanggalLengkap
                                                    );

                                                    const checked = Boolean(
                                                        checklist?.status
                                                    );

                                                    return (
                                                        <td
                                                            key={tanggalLengkap || index}
                                                            className={`border-r border-slate-100 px-1 py-2 text-center ${
                                                                checked ? 'bg-emerald-50/70' : ''
                                                            }`}
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
                                                                        ? 'border-emerald-300 bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200 hover:-translate-y-0.5 hover:from-emerald-500 hover:to-teal-600'
                                                                        : 'border-slate-200 bg-slate-50 text-transparent hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100'
                                                                }`}
                                                            >
                                                                {checked && <Icon type="check" />}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ABNORMALITY */}
                    <section
                        style={{ animationDelay: '300ms' }}
                        className={`idx-rise overflow-hidden rounded-3xl ${glassCard}`}
                    >
                        <SectionHead
                            icon="alert"
                            tone="amber"
                            title="Abnormality"
                            desc="Catat abnormality, countermeasure, status, dan PIC."
                            badge={`${checkSheet.abnormalities?.length} Data`}
                            badgeTone="amber"
                            action={
                                <button
                                    type="button"
                                    onClick={() => setShowAddAbnormalityModal(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
                                >
                                    <Icon type="plus" />
                                    Tambah Abnormality
                                </button>
                            }
                        />

                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-indigo-900 to-violet-900 text-white">
                                        <th className={`w-36 text-left ${tableHead}`}>
                                            Tanggal
                                        </th>

                                        <th className={`min-w-[230px] text-left ${tableHead}`}>
                                            Abnormality
                                        </th>

                                        <th className={`min-w-[260px] text-left ${tableHead}`}>
                                            Countermeasure
                                        </th>

                                        <th className={`w-32 text-center ${tableHead}`}>
                                            Status
                                        </th>

                                        <th className={`w-40 text-left ${tableHead}`}>
                                            PIC
                                        </th>

                                        <th className="w-24 px-3 py-4 text-center text-[11px] font-bold uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {!checkSheet.abnormalities ||
                                    checkSheet.abnormalities.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                                                        <Icon type="alert" className="h-7 w-7" />
                                                    </div>

                                                    <p className="font-semibold text-slate-700">
                                                        Belum ada abnormality
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Tambahkan data abnormality
                                                        jika ditemukan kondisi
                                                        tidak normal.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        checkSheet.abnormalities.map(
                                            (abnormality) => (
                                                <tr
                                                    key={abnormality.id}
                                                    className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-amber-50/40"
                                                >
                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                        {formatTanggal(abnormality.tanggal)}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                                                        {abnormality.abnormality || '-'}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm leading-6 text-slate-600">
                                                        {abnormality.countermeasure || '-'}
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-sm ${getStatusClass(
                                                                abnormality.status
                                                            )}`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                                                    abnormality.status
                                                                )}`}
                                                            />

                                                            {abnormality.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                                                        {abnormality.pic || '-'}
                                                    </td>

                                                    <td className="px-3 py-4">
                                                        <div className="flex justify-center gap-1.5">
                                                            <IconButton
                                                                title="Edit"
                                                                onClick={() =>
                                                                    bukaEditAbnormality(abnormality)
                                                                }
                                                                variant="blue"
                                                            >
                                                                <Icon type="edit" />
                                                            </IconButton>

                                                            <IconButton
                                                                title="Hapus"
                                                                onClick={() =>
                                                                    hapusAbnormality(abnormality)
                                                                }
                                                                variant="red"
                                                            >
                                                                <Icon type="trash" />
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
                    FOOTER (TRANSPARAN)
                ================================================== */}
                <footer className="mt-4 border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-[1500px] items-center justify-center px-5 py-4 sm:px-6 lg:px-8">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
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
                    onClose={() => setShowAddItemModal(false)}
                >
                    <form onSubmit={submit} className="space-y-6">
                        <FormBanner text="Identitas Inspection Point" tone="blue" />

                        <ItemFields
                            data={data}
                            setData={setData}
                            errors={errors}
                            withPlaceholder
                        />

                        <FormActions
                            onCancel={() => setShowAddItemModal(false)}
                            processing={processing}
                            label="Simpan Data"
                        />
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
                    <form onSubmit={submitEdit} className="space-y-6">
                        <FormBanner text="Perbarui Data" tone="indigo" />

                        <ItemFields
                            data={editData}
                            setData={setEditData}
                            errors={editErrors}
                        />

                        <FormActions
                            onCancel={() => {
                                setEditingItem(null);
                                resetEdit();
                            }}
                            processing={processingEdit}
                            label="Simpan Perubahan"
                        />
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
                    onClose={() => setShowAddAbnormalityModal(false)}
                >
                    <form onSubmit={submitAbnormality} className="space-y-6">
                        <FormBanner text="Detail Abnormality" tone="amber" />

                        <AbnormalityFields
                            data={abnormalityData}
                            setData={setAbnormalityData}
                            errors={abnormalityErrors}
                            withPlaceholder
                        />

                        <FormActions
                            onCancel={() => setShowAddAbnormalityModal(false)}
                            processing={processingAbnormality}
                            label="Simpan Data"
                            tone="amber"
                        />
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
                    <form onSubmit={submitEditAbnormality} className="space-y-6">
                        <FormBanner text="Perbarui Data Abnormality" tone="orange" />

                        <AbnormalityFields
                            data={editAbnormalityData}
                            setData={setEditAbnormalityData}
                            errors={editAbnormalityErrors}
                        />

                        <FormActions
                            onCancel={() => {
                                setEditingAbnormality(null);
                                resetEditAbnormality();
                            }}
                            processing={processingEditAbnormality}
                            label="Simpan Perubahan"
                            tone="amber"
                        />
                    </form>
                </Modal>
            )}
        </>
    );
}
