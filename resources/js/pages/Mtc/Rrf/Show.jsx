import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Clock3,
    FileText,
    Image as ImageIcon,
    Plus,
    RefreshCw,
    RotateCcw,
    Save,
    Send,
    Trash2,
    User,
    Wrench,
    X,
    CalendarDays,
} from 'lucide-react';

import ProduksiLayout from '../../../Components/ProduksiLayout';

const MAKS_FOTO = 5;
const MAKS_UKURAN = 5 * 1024 * 1024;

const STATUS = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    revisi: { label: 'Perlu Revisi', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    terverifikasi: { label: 'Terverifikasi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// Alur proses: Draft -> Menunggu Verifikasi -> Terverifikasi (revisi kembali ke tahap pertama)
const LANGKAH = ['Diisi Maintenance', 'Menunggu verifikasi', 'Terverifikasi'];
const POSISI_LANGKAH = { draft: 0, revisi: 0, menunggu_verifikasi: 1, terverifikasi: 2 };

const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const readonlyCls =
    'w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-700';

const cardCls =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const delay = (ms) => ({ animationDelay: `${ms}ms` });

/* ---------- MODAL (PORTAL KE document.body) ---------- */

function ModalPortal({ open, onClose, locked = false, z = 'z-[9999]', children }) {
    useEffect(() => {
        if (!open) return undefined;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape' && !locked) onClose?.();
        };
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, locked, onClose]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`rrf-fade fixed inset-0 ${z} flex items-end justify-center overflow-y-auto bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5`}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !locked) onClose?.();
            }}
        >
            {children}
        </div>,
        document.body
    );
}

const CONFIRM_TONES = {
    blue: {
        icon: 'bg-blue-50 text-blue-600 ring-blue-100',
        button: 'from-blue-600 to-indigo-600 shadow-blue-500/30',
        bar: 'from-blue-500 via-indigo-500 to-violet-500',
    },
    green: {
        icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        button: 'from-emerald-500 to-green-600 shadow-emerald-500/30',
        bar: 'from-emerald-400 via-green-500 to-teal-500',
    },
    red: {
        icon: 'bg-rose-50 text-rose-600 ring-rose-100',
        button: 'from-rose-500 to-red-600 shadow-rose-500/30',
        bar: 'from-rose-400 via-red-500 to-orange-500',
    },
};

function ConfirmationModal({
    open,
    title,
    description,
    confirmText = 'Ya, lanjutkan',
    cancelText = 'Batal',
    tone = 'blue',
    loading = false,
    icon: Icon = AlertCircle,
    onConfirm,
    onCancel,
}) {
    const t = CONFIRM_TONES[tone] ?? CONFIRM_TONES.blue;

    return (
        <ModalPortal open={open} onClose={onCancel} locked={loading} z="z-[10000]">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                className="rrf-pop relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
            >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.bar}`} />

                <div className="px-7 pb-6 pt-9 text-center">
                    <div className={`rrf-icon-pop mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ring-8 ${t.icon}`}>
                        <Icon className="h-8 w-8" />
                    </div>

                    <h3 id="confirmation-title" className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                        {title}
                    </h3>

                    {description && (
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
                    )}
                </div>

                <div className="flex gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`group relative flex-1 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r px-4 py-3 text-xs font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${t.button}`}
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                        <span className="relative inline-flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Memproses...
                                </>
                            ) : (
                                confirmText
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </ModalPortal>
    );
}

/* ---------- HELPER WAKTU ---------- */

const pad = (n) => String(n).padStart(2, '0');

const hariIni = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const jamSekarang = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Down time = serv. schedule - Mulai Permintaan (menit, minimal 0). */
const hitungMenit = (reqStart, tgl, jam) => {
    if (!reqStart || !tgl || !jam) return null;

    const a = new Date(`${reqStart.replace(' ', 'T')}:00`);
    const b = new Date(`${tgl}T${jam}:00`);

    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;

    return Math.max(0, Math.round((b - a) / 60000));
};

const fmtMenit = (m) => {
    if (m === null || m === undefined) return '-';
    if (m < 60) return `${m} menit`;

    return `${Math.floor(m / 60)} jam ${m % 60} menit`;
};

/* ---------- KOMPONEN KECIL ---------- */

const Card = ({ children, className = '', style }) => (
    <div style={style} className={`rrf-enter p-5 sm:p-6 ${cardCls} ${className}`}>
        {children}
    </div>
);

const SECTION_TONES = {
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
};

const SectionTitle = ({ icon: Icon, title, description, tone = 'blue' }) => (
    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${SECTION_TONES[tone]}`}>
            <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
        </div>
    </div>
);

const Field = ({ label, error, hint, required, children }) => (
    <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {children}
        {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50/40">
        <p className="text-[11px] font-medium text-slate-400">{label}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-[13px] font-semibold leading-5 text-slate-700">
            {value || '-'}
        </p>
    </div>
);

const AlertBox = ({ tone = 'error', icon: Icon = AlertCircle, title, children }) => {
    const warna =
        tone === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : tone === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-rose-200 bg-rose-50 text-rose-800';
    const garis = tone === 'success' ? 'bg-emerald-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-rose-500';

    return (
        <div className={`rrf-slide-down relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 pl-5 shadow-sm ${warna}`}>
            <span className={`absolute inset-y-0 left-0 w-1 ${garis}`} />
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 text-sm leading-relaxed">
                {title && <p className="font-bold">{title}</p>}
                <div className={title ? 'mt-0.5 whitespace-pre-line' : 'font-semibold'}>{children}</div>
            </div>
        </div>
    );
};

/* ---------- ZONA FOTO ---------- */

function FotoZone({ judul, lama, hapusIds, onToggleHapus, baru, onChange, disabled, error }) {
    const inputRef = useRef(null);
    const tambahRef = useRef(null);
    const [pesan, setPesan] = useState('');
    const [hover, setHover] = useState(false);
    const [kursorDiZona, setKursorDiZona] = useState(false);

    const aktifLama = lama.filter((f) => !hapusIds.includes(f.id)).length;
    const kuota = Math.max(0, MAKS_FOTO - aktifLama - baru.length);

    const tambah = (daftar) => {
        const semua = Array.from(daftar);
        const gambar = semua.filter((f) => f.type.startsWith('image/'));
        const ukuranOk = gambar.filter((f) => f.size <= MAKS_UKURAN);
        const dipakai = ukuranOk.slice(0, kuota);

        const info = [];

        if (gambar.length !== semua.length) info.push('Hanya file gambar yang diterima.');
        if (ukuranOk.length !== gambar.length) info.push('Maksimal 5 MB per foto.');
        if (ukuranOk.length > kuota) info.push(`Kuota tersisa ${kuota} foto.`);

        setPesan(info.join(' '));

        if (dipakai.length) onChange([...baru, ...dipakai]);
    };

    // Selalu menunjuk ke versi terbaru `tambah` agar paste tidak memakai state lama
    tambahRef.current = tambah;

    useEffect(() => {
        if (!kursorDiZona || disabled) return undefined;

        const onPaste = (e) => {
            const files = Array.from(e.clipboardData?.items ?? [])
                .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
                .map((i) => {
                    const f = i.getAsFile();
                    const ext = f.type.split('/')[1] || 'png';

                    return new File([f], `paste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`, {
                        type: f.type,
                    });
                });

            if (files.length) {
                e.preventDefault();
                tambahRef.current?.(files);
            }
        };

        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [kursorDiZona, disabled]);

    const previews = useMemo(() => baru.map((f) => URL.createObjectURL(f)), [baru]);

    useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

    const onDrop = (e) => {
        e.preventDefault();
        setHover(false);
        if (!disabled) tambah(e.dataTransfer.files);
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">{judul}</h4>
                <span className="text-[11px] text-slate-400">
                    {aktifLama + baru.length} / {MAKS_FOTO} foto
                </span>
            </div>

            {!disabled && (
                <div
                    onMouseEnter={() => setKursorDiZona(true)}
                    onMouseLeave={() => setKursorDiZona(false)}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setHover(true);
                    }}
                    onDragLeave={() => setHover(false)}
                    onDrop={onDrop}
                    onClick={() => kuota > 0 && inputRef.current?.click()}
                    className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center outline-none transition-all duration-200 ${
                        hover
                            ? 'scale-[1.01] border-blue-500 bg-blue-50'
                            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
                    } ${kuota === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <ImageIcon className="h-5 w-5" />
                    </span>

                    <p className="mt-2.5 text-xs font-semibold text-slate-600">
                        Seret foto ke sini, klik untuk memilih, atau tempel (Ctrl+V)
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                        Sisa kuota {kuota} foto, maksimal 5 MB per foto
                    </p>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            tambah(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </div>
            )}

            {pesan && <p className="mt-1.5 text-xs font-medium text-amber-700">{pesan}</p>}
            {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}

            {(lama.length > 0 || baru.length > 0) && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                    {lama.map((f) => {
                        const dihapus = hapusIds.includes(f.id);

                        return (
                            <div
                                key={f.id}
                                className={`rounded-xl border p-2 transition-colors ${
                                    dihapus ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'
                                }`}
                            >
                                <a href={f.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-lg">
                                    <img
                                        src={f.url}
                                        alt={judul}
                                        className={`h-28 w-full object-cover transition duration-500 group-hover:scale-110 ${
                                            dihapus ? 'opacity-40' : ''
                                        }`}
                                    />
                                </a>

                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => onToggleHapus(f.id)}
                                        className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        {dihapus ? (
                                            <>
                                                <RotateCcw className="h-3.5 w-3.5" /> Batal hapus
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-3.5 w-3.5" /> Hapus foto
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {baru.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="rounded-xl border border-blue-200 bg-blue-50/40 p-2">
                            <div className="relative overflow-hidden rounded-lg">
                                <img src={previews[i]} alt={f.name} className="h-28 w-full object-cover" />
                                <span className="absolute left-1.5 top-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                    Baru
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => onChange(baru.filter((_, idx) => idx !== i))}
                                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                <X className="h-3.5 w-3.5" /> Buang (belum tersimpan)
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {disabled && lama.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">Belum ada foto.</p>
            )}
        </div>
    );
}

/* ---------- FORM MAINTENANCE ---------- */

const barisPart = (p) => ({
    part_name: p?.part_name ?? '',
    model_type: p?.model_type ?? '',
    maker: p?.maker ?? '',
    qty: p?.qty ?? 1,
    other: p?.other ?? '',
});

function FormMaintenance({ rrf, repair, parts, photos, shiftOptions, canEdit }) {
    const awalParts = parts.map(barisPart);

    while (awalParts.length < 3) {
        awalParts.push(barisPart());
    }

    const counterAwal =
        rrf.counter_measure ?? [repair.request_activity, repair.counter_measure].filter(Boolean).join('\n');

    const form = useForm({
        serv_tanggal: rrf.serv_tanggal || hariIni(),
        serv_jam: rrf.serv_jam || jamSekarang(),
        pic_nama: rrf.pic_nama ?? '',
        shift_kerja: rrf.shift_kerja ?? '',
        cause: rrf.cause ?? '',
        counter_measure: counterAwal ?? '',
        remark: rrf.remark ?? '',
        parts: awalParts,
        fotos_before: [],
        fotos_after: [],
        hapus_foto_ids: [],
    });

    const { data, setData, errors } = form;
    const [confirmAction, setConfirmAction] = useState(null);

    const menit = hitungMenit(rrf.req_start_raw, data.serv_tanggal, data.serv_jam);

    const lengkap =
        data.pic_nama.trim() &&
        data.shift_kerja &&
        data.cause.trim() &&
        data.remark.trim() &&
        data.serv_tanggal &&
        data.serv_jam;

    const kirimForm = (kirim) => {
        form.transform((d) => ({
            ...d,
            kirim: kirim ? 1 : 0,
            _method: 'put',
        }));

        form.post(`/mtc/rrf/${rrf.id}/simpan`, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setConfirmAction(null),
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (canEdit && !form.processing) setConfirmAction('save');
    };

    const kirimKePimpinan = () => {
        if (!lengkap || form.processing) return;
        setConfirmAction('send');
    };

    const ubahPart = (i, field, value) =>
        setData(
            'parts',
            data.parts.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
        );

    const hapusBarisPart = (i) =>
        setData(
            'parts',
            data.parts.filter((_, idx) => idx !== i)
        );

    const toggleHapus = (id) =>
        setData(
            'hapus_foto_ids',
            data.hapus_foto_ids.includes(id)
                ? data.hapus_foto_ids.filter((x) => x !== id)
                : [...data.hapus_foto_ids, id]
        );

    const fotoLama = (tipe) => photos.filter((p) => p.tipe === tipe);

    const errorLain = Object.entries(errors).filter(([k]) => /^(parts|fotos|hapus|aksi)/.test(k));

    return (
        <form onSubmit={submit} className="space-y-4">
            {/* SERV SCHEDULE & DURATION */}
            <Card>
                <SectionTitle
                    icon={CalendarDays}
                    tone="cyan"
                    title="Serv. Schedule & Duration"
                    description="Down time dihitung otomatis dari Serv. schedule dikurangi Mulai Permintaan."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Serv. schedule: Date" required error={errors.serv_tanggal}>
                        <input
                            type="date"
                            value={data.serv_tanggal}
                            onChange={(e) => setData('serv_tanggal', e.target.value)}
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field label="Serv. schedule: Time" required error={errors.serv_jam}>
                        <input
                            type="time"
                            value={data.serv_jam}
                            onChange={(e) => setData('serv_jam', e.target.value)}
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field label="Mulai Permintaan (dari QMOS)">
                        <input readOnly value={repair.req_start_at ?? '-'} className={readonlyCls} />
                    </Field>

                    <Field label="Down time (otomatis)">
                        <input readOnly value={fmtMenit(menit)} className={readonlyCls} />
                    </Field>

                    <Field label="Stop line (otomatis)" hint="Sama dengan down time.">
                        <input readOnly value={fmtMenit(menit)} className={readonlyCls} />
                    </Field>

                    <Field label="Time repair (otomatis)" hint="Sama dengan down time.">
                        <input readOnly value={fmtMenit(menit)} className={readonlyCls} />
                    </Field>
                </div>

                {menit === null && (
                    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
                        Data QMOS tidak punya Mulai Permintaan, jadi down time tidak bisa dihitung.
                    </p>
                )}
            </Card>

            {/* MAN & SHIFT */}
            <Card>
                <SectionTitle
                    icon={User}
                    tone="violet"
                    title="Man & Shift"
                    description="Penanggung jawab pekerjaan Maintenance."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Man (PIC MTC)" required error={errors.pic_nama}>
                        <input
                            value={data.pic_nama}
                            onChange={(e) => setData('pic_nama', e.target.value)}
                            placeholder="Nama teknisi yang menangani"
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field label="Shift" required error={errors.shift_kerja}>
                        <select
                            value={data.shift_kerja}
                            onChange={(e) => setData('shift_kerja', e.target.value)}
                            disabled={!canEdit}
                            className={inputCls}
                        >
                            <option value="">Pilih shift</option>
                            {shiftOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
            </Card>

            {/* DETAIL PENANGANAN */}
            <Card>
                <SectionTitle
                    icon={FileText}
                    tone="blue"
                    title="Detail Penanganan"
                    description="Cause dan Remark wajib diisi sebelum dikirim ke Pimpinan."
                />

                <div className="space-y-4">
                    <Field label="2. Cause (penyebab)" required error={errors.cause}>
                        <textarea
                            rows={3}
                            value={data.cause}
                            onChange={(e) => setData('cause', e.target.value)}
                            placeholder="Jelaskan penyebab kerusakan mesin..."
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field
                        label="3. Request activity & counter measure"
                        error={errors.counter_measure}
                        hint="Terisi dari permintaan produksi (QMOS). Silakan ubah atau tambahkan tindakan yang dilakukan."
                    >
                        <textarea
                            rows={3}
                            value={data.counter_measure}
                            onChange={(e) => setData('counter_measure', e.target.value)}
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field label="4. Remark" required error={errors.remark}>
                        <textarea
                            rows={2}
                            value={data.remark}
                            onChange={(e) => setData('remark', e.target.value)}
                            placeholder="Catatan tambahan..."
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>
                </div>
            </Card>

            {/* PART */}
            <Card>
                <SectionTitle
                    icon={Wrench}
                    tone="amber"
                    title="Part yang Dipakai"
                    description="Terisi dari permintaan produksi. Koreksi kalau berbeda."
                />

                <div className="space-y-2.5">
                    {data.parts.map((p, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 md:grid-cols-6">
                                <input
                                    placeholder="Part name"
                                    value={p.part_name}
                                    onChange={(e) => ubahPart(i, 'part_name', e.target.value)}
                                    disabled={!canEdit}
                                    className={`${inputCls} col-span-2`}
                                />
                                <input
                                    placeholder="Model / type"
                                    value={p.model_type}
                                    onChange={(e) => ubahPart(i, 'model_type', e.target.value)}
                                    disabled={!canEdit}
                                    className={inputCls}
                                />
                                <input
                                    placeholder="Maker"
                                    value={p.maker}
                                    onChange={(e) => ubahPart(i, 'maker', e.target.value)}
                                    disabled={!canEdit}
                                    className={inputCls}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    value={p.qty}
                                    onChange={(e) => ubahPart(i, 'qty', e.target.value)}
                                    disabled={!canEdit}
                                    className={inputCls}
                                />
                                <input
                                    placeholder="Other"
                                    value={p.other}
                                    onChange={(e) => ubahPart(i, 'other', e.target.value)}
                                    disabled={!canEdit}
                                    className={inputCls}
                                />
                            </div>

                            {canEdit && data.parts.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => hapusBarisPart(i)}
                                    title="Hapus baris"
                                    aria-label="Hapus baris part"
                                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {canEdit && data.parts.length < 10 && (
                    <button
                        type="button"
                        onClick={() => setData('parts', [...data.parts, barisPart()])}
                        className="mt-3.5 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <Plus className="h-3.5 w-3.5" /> Tambah baris
                    </button>
                )}
            </Card>

            {/* FOTO */}
            <Card>
                <SectionTitle
                    icon={ImageIcon}
                    tone="emerald"
                    title="5. Picture (jika terjadi perubahan)"
                    description="Seret foto, klik untuk memilih file, atau arahkan kursor ke kotak lalu tekan Ctrl+V untuk menempel."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FotoZone
                        judul="Before"
                        lama={fotoLama('before')}
                        hapusIds={data.hapus_foto_ids}
                        onToggleHapus={toggleHapus}
                        baru={data.fotos_before}
                        onChange={(v) => setData('fotos_before', v)}
                        disabled={!canEdit}
                        error={errors.fotos_before}
                    />

                    <FotoZone
                        judul="After"
                        lama={fotoLama('after')}
                        hapusIds={data.hapus_foto_ids}
                        onToggleHapus={toggleHapus}
                        baru={data.fotos_after}
                        onChange={(v) => setData('fotos_after', v)}
                        disabled={!canEdit}
                        error={errors.fotos_after}
                    />
                </div>
            </Card>

            {errorLain.length > 0 && (
                <AlertBox tone="error" title="Periksa kembali isian Anda">
                    {errorLain.map(([k, msg]) => (
                        <p key={k}>{msg}</p>
                    ))}
                </AlertBox>
            )}

            {canEdit && (
                <div
                    className={`sticky bottom-3 z-30 flex flex-wrap items-center justify-end gap-3 border-slate-200 p-3.5 shadow-xl shadow-slate-900/10 ${cardCls}`}
                >
                    {!lengkap && (
                        <p className="mr-auto text-xs text-slate-500">
                            Untuk mengirim, isi dulu Man, Shift, Cause, dan Remark.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[.98] disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Menyimpan...' : 'Simpan Draft'}
                    </button>

                    <button
                        type="button"
                        onClick={kirimKePimpinan}
                        disabled={form.processing || !lengkap}
                        className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                        <Send className="relative h-4 w-4" />
                        <span className="relative">Simpan & Kirim ke Pimpinan</span>
                    </button>
                </div>
            )}

            <ConfirmationModal
                open={!!confirmAction}
                title={confirmAction === 'save' ? 'Simpan perubahan?' : 'Kirim RRF ke Pimpinan?'}
                description={
                    confirmAction === 'save'
                        ? 'Perubahan akan disimpan sebagai draft. RRF belum dikirim kepada Pimpinan.'
                        : 'RRF akan disimpan dan dikirim kepada Pimpinan Maintenance untuk diverifikasi.'
                }
                confirmText={confirmAction === 'save' ? 'Ya, Simpan Draft' : 'Ya, Kirim RRF'}
                tone={confirmAction === 'save' ? 'blue' : 'green'}
                icon={confirmAction === 'save' ? Save : Send}
                loading={form.processing}
                onCancel={() => setConfirmAction(null)}
                onConfirm={() => kirimForm(confirmAction === 'send')}
            />
        </form>
    );
}

/* ---------- PANEL VERIFIKASI PIMPINAN ---------- */

function VerifikasiPanel({ rrf }) {
    const { errors } = usePage().props;
    const [alasan, setAlasan] = useState('');
    const [errorAlasan, setErrorAlasan] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [bukaKembali, setBukaKembali] = useState(false);
    const [proses, setProses] = useState(false);

    const opsi = {
        preserveScroll: true,
        onStart: () => setProses(true),
        onFinish: () => {
            setProses(false);
            setConfirmAction(null);
        },
    };

    const verifikasi = () => {
        if (!proses) setConfirmAction('verify');
    };

    const kembalikan = (e) => {
        e.preventDefault();

        if (alasan.trim().length < 5) {
            setErrorAlasan('Alasan pengembalian minimal 5 karakter.');
            return;
        }

        setErrorAlasan('');

        if (!proses) setConfirmAction('revision');
    };

    const jalankanKonfirmasi = () => {
        if (proses || !confirmAction) return;

        if (confirmAction === 'verify') {
            router.post(`/mtc/rrf/${rrf.id}/verifikasi`, {}, opsi);
            return;
        }

        router.post(`/mtc/rrf/${rrf.id}/kembalikan`, { catatan: alasan.trim() }, opsi);
    };

    return (
        <Card className="relative overflow-hidden border-blue-200/70">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Verifikasi RRF</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Periksa hasil penanganan sebelum memberikan keputusan.</p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                    Menunggu keputusan
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => setBukaKembali((value) => !value)}
                    disabled={proses}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RotateCcw className="h-4 w-4" />
                    {bukaKembali ? 'Tutup form revisi' : 'Kembalikan untuk revisi'}
                </button>

                <button
                    type="button"
                    onClick={verifikasi}
                    disabled={proses}
                    className="group relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                    <Check className="relative h-4 w-4" />
                    <span className="relative">{proses ? 'Memproses...' : 'Verifikasi RRF'}</span>
                </button>
            </div>

            {bukaKembali && (
                <form
                    onSubmit={kembalikan}
                    className="rrf-slide-down mt-3 space-y-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4"
                >
                    <div>
                        <p className="text-xs font-bold text-rose-800">Alasan pengembalian</p>
                        <p className="mt-0.5 text-[11px] text-rose-700/80">
                            Jelaskan bagian yang perlu diperbaiki oleh Admin Maintenance.
                        </p>
                    </div>

                    <Field label="Alasan revisi" required error={errorAlasan || errors.catatan}>
                        <textarea
                            rows={3}
                            value={alasan}
                            onChange={(e) => {
                                setAlasan(e.target.value);
                                if (errorAlasan) setErrorAlasan('');
                            }}
                            placeholder="Tuliskan alasan pengembalian..."
                            className={inputCls}
                        />
                    </Field>

                    <div className="flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setBukaKembali(false);
                                setAlasan('');
                                setErrorAlasan('');
                            }}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={proses}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Lanjutkan revisi
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal
                open={!!confirmAction}
                title={confirmAction === 'verify' ? 'Verifikasi RRF ini?' : 'Kembalikan RRF untuk revisi?'}
                description={
                    confirmAction === 'verify'
                        ? 'RRF akan disetujui dan statusnya berubah menjadi terverifikasi.'
                        : 'RRF akan dikembalikan kepada Admin Maintenance untuk diperbaiki sesuai alasan yang Anda berikan.'
                }
                confirmText={confirmAction === 'verify' ? 'Ya, Verifikasi' : 'Ya, Kembalikan'}
                tone={confirmAction === 'verify' ? 'green' : 'red'}
                icon={confirmAction === 'verify' ? CheckCircle2 : RotateCcw}
                loading={proses}
                onCancel={() => setConfirmAction(null)}
                onConfirm={jalankanKonfirmasi}
            />
        </Card>
    );
}

/* ---------- PANEL CALLBACK QMOS ---------- */

function CallbackPanel({ rrf }) {
    const [proses, setProses] = useState(false);

    const warna =
        {
            sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            failed: 'border-rose-200 bg-rose-50 text-rose-700',
            pending: 'border-amber-200 bg-amber-50 text-amber-700',
        }[rrf.callback_status] ?? 'border-slate-200 bg-slate-100 text-slate-600';

    const label =
        {
            sent: 'Terkirim ke QMOS',
            failed: 'Gagal dikirim ke QMOS',
            pending: 'Menunggu dikirim',
        }[rrf.callback_status] ?? 'Belum dikirim';

    const kirimUlang = () =>
        router.post(
            `/mtc/rrf/${rrf.id}/callback-ulang`,
            {},
            {
                preserveScroll: true,
                onStart: () => setProses(true),
                onFinish: () => setProses(false),
            }
        );

    return (
        <Card>
            <SectionTitle
                icon={Send}
                tone="blue"
                title="Pengiriman Hasil ke QMOS"
                description="Hasil verifikasi dikirim ke QMOS dengan status Completed."
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span className={`inline-flex rounded-full border px-3.5 py-1.5 text-xs font-semibold ${warna}`}>{label}</span>

                    {rrf.callback_sent_at && <p className="mt-2 text-xs text-slate-500">Terkirim: {rrf.callback_sent_at}</p>}

                    {rrf.callback_error && (
                        <p className="mt-2 max-w-xl break-words text-xs text-rose-600">{rrf.callback_error}</p>
                    )}
                </div>

                {rrf.callback_status !== 'sent' && (
                    <button
                        type="button"
                        onClick={kirimUlang}
                        disabled={proses}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${proses ? 'animate-spin' : ''}`} />
                        {proses ? 'Mengirim...' : 'Kirim ulang ke QMOS'}
                    </button>
                )}
            </div>
        </Card>
    );
}

/* ---------- ACCORDION RIWAYAT PROSES ---------- */

function HistoryAccordion({ statusLogs = [] }) {
    const [terbuka, setTerbuka] = useState(false);

    return (
        <div className={`rrf-enter overflow-hidden ${cardCls}`}>
            <button
                type="button"
                onClick={() => setTerbuka((value) => !value)}
                aria-expanded={terbuka}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Clock3 className="h-[18px] w-[18px]" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">Riwayat Proses RRF</h3>
                        <p className="mt-0.5 text-xs text-slate-400">Catatan perubahan status dan keputusan.</p>
                    </div>

                    <span className="ml-1 shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        {statusLogs.length}
                    </span>
                </div>

                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${terbuka ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Buka/tutup halus lewat grid-rows */}
            <div className={`grid transition-all duration-300 ease-out ${terbuka ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-5 py-5">
                        {statusLogs.length > 0 ? (
                            <ol className="space-y-4">
                                {statusLogs.map((log, index) => (
                                    <li key={log.id} className="relative border-l-2 border-blue-100 pb-1 pl-6 last:border-l-transparent">
                                        <span className="absolute -left-[7px] top-0.5 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />

                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-xs font-bold capitalize text-slate-800">
                                                {log.status_baru?.replaceAll('_', ' ') ?? '-'}
                                            </p>
                                            <span className="text-[11px] text-slate-400">#{index + 1}</span>
                                        </div>

                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            {log.user?.name ?? 'Sistem'} · {log.created_at ?? '-'}
                                        </p>

                                        {log.catatan && (
                                            <p className="mt-2 whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                                                {log.catatan}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="py-3 text-center text-xs text-slate-400">Belum ada riwayat proses.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- STEPPER STATUS ---------- */

function StatusStepper({ status }) {
    const posisi = POSISI_LANGKAH[status] ?? 0;
    const revisi = status === 'revisi';

    return (
        <ol className="mt-5 flex items-center">
            {LANGKAH.map((nama, i) => {
                const selesai = i < posisi || (i === posisi && status === 'terverifikasi');
                const aktif = i === posisi && status !== 'terverifikasi';
                const bermasalah = aktif && revisi;

                return (
                    <li key={nama} className={`flex items-center ${i < LANGKAH.length - 1 ? 'flex-1' : ''}`}>
                        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                                    selesai
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : bermasalah
                                        ? 'border-rose-500 bg-rose-50 text-rose-600'
                                        : aktif
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-slate-200 bg-white text-slate-400'
                                }`}
                            >
                                {selesai ? <Check className="h-4 w-4" /> : bermasalah ? <RotateCcw className="h-3.5 w-3.5" /> : i + 1}
                            </span>

                            <span
                                className={`text-center text-[11px] font-semibold leading-tight sm:text-left sm:text-xs ${
                                    selesai || aktif ? 'text-slate-700' : 'text-slate-400'
                                }`}
                            >
                                {bermasalah ? 'Perlu revisi' : nama}
                            </span>
                        </div>

                        {i < LANGKAH.length - 1 && (
                            <span className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-100 sm:mx-4">
                                <span
                                    className={`block h-full rounded-full bg-emerald-500 transition-all duration-700 ${
                                        i < posisi ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/* ---------- HALAMAN DETAIL RRF ---------- */

export default function Show({
    role: roleProp,
    rrf,
    mtcRepair = null,
    parts = [],
    photos = [],
    approvals = [],
    statusLogs = [],
    shiftOptions = ['A', 'B', 'Non Shift'],
}) {
    const { auth, flash = {} } = usePage().props;

    const role = roleProp ?? auth?.user?.role;
    const isAdmin = role === 'admin';
    const isPimpinan = role === 'pimpinan';

    const repair = mtcRepair ?? {};
    const status = rrf.status ?? 'draft';

    const canEdit = isAdmin && ['draft', 'revisi'].includes(status);
    const canVerify = isPimpinan && status === 'menunggu_verifikasi';

    const statusConfig = STATUS[status] ?? {
        label: status,
        color: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    const catatanRevisi = [...approvals].reverse().find((a) => a.status === 'ditolak');

    return (
        <ProduksiLayout>
            <Head title={`Detail RRF ${rrf.rrf_no ?? ''}`} />

            <div className="space-y-4 pb-2">
                {/* HEADER */}
                <section className={`rrf-enter relative overflow-hidden px-4 py-4 sm:px-5 ${cardCls}`}>
                    <div className="rrf-shimmer absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 via-cyan-400 to-blue-500" />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                <ClipboardList className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">Repair Request Form</h1>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {rrf.rrf_no ?? `RRF-${rrf.id}`} · Rev. {rrf.rev ?? 0}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={isAdmin ? '/mtc/rrf/repair-mtc' : '/mtc/rrf'}
                            className="group inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            Kembali
                        </Link>
                    </div>
                </section>

                {/* FLASH */}
                {flash.success && (
                    <AlertBox tone="success" icon={CheckCircle2}>
                        {flash.success}
                    </AlertBox>
                )}

                {flash.error && <AlertBox tone="error">{flash.error}</AlertBox>}

                {/* STATUS */}
                <Card style={delay(60)}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-medium text-slate-400">Status RRF</p>

                            <span
                                className={`mt-1.5 inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold ${statusConfig.color}`}
                            >
                                {statusConfig.label}
                            </span>
                        </div>

                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-400">Dibuat pada</p>
                            <p className="mt-1.5 text-sm font-semibold text-slate-700">{rrf.created_at ?? '-'}</p>
                        </div>
                    </div>

                    <StatusStepper status={status} />

                    {status === 'revisi' && (
                        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5">
                            <div className="flex items-center gap-2 text-rose-700">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-xs font-bold">RRF dikembalikan Pimpinan, perlu diperbaiki</p>
                            </div>

                            <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-rose-700">
                                {catatanRevisi?.catatan ?? 'Lihat catatan pada riwayat proses di bawah.'}
                            </p>
                        </div>
                    )}
                </Card>

                {/* DATA QMOS */}
                <Card style={delay(120)}>
                    <SectionTitle
                        icon={Wrench}
                        tone="blue"
                        title="Informasi dari Produksi (QMOS)"
                        description="Data referensi dari sistem QMOS, tidak bisa diubah."
                    />

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem label="ID QMOS" value={repair.qmos_repair_id ? `QMOS-${repair.qmos_repair_id}` : '-'} />
                        <InfoItem label="Location" value={repair.location} />
                        <InfoItem label="Machine" value={repair.machine} />
                        <InfoItem label="Nomor mesin" value={repair.machine_no ?? repair.asset_no} />
                        <InfoItem label="Division pelapor" value={repair.division_pelapor} />
                        <InfoItem label="Jenis permintaan" value={repair.jenis_permintaan} />
                        <InfoItem label="Class" value={repair.machine_class} />
                        <InfoItem label="Requested by" value={repair.requested_by} />
                        <InfoItem label="Supervisor (Pimpinan MTC)" value={repair.supervisor} />
                        <InfoItem label="Mulai permintaan" value={repair.req_start_at} />
                        <InfoItem label="Selesai permintaan (Serv. schedule)" value={repair.req_finish_at} />
                        <InfoItem label="Dikirim FRM" value={repair.submitted_by_frm} />
                    </div>

                    <div className="mt-2.5 space-y-2.5">
                        <InfoItem label="1. Problem" value={repair.problem} />
                        <InfoItem label="Request activity" value={repair.request_activity} />
                    </div>
                </Card>

                {/* FORM MAINTENANCE */}
                <FormMaintenance
                    key={rrf.updated_at}
                    rrf={rrf}
                    repair={repair}
                    parts={parts}
                    photos={photos}
                    shiftOptions={shiftOptions}
                    canEdit={canEdit}
                />

                {/* VERIFIKASI PIMPINAN */}
                {canVerify && <VerifikasiPanel rrf={rrf} />}

                {/* CALLBACK QMOS */}
                {status === 'terverifikasi' && <CallbackPanel rrf={rrf} />}

                {/* RIWAYAT PROSES */}
                <HistoryAccordion statusLogs={statusLogs} />
            </div>
        </ProduksiLayout>
    );
}
