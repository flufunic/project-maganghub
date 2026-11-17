
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    Image as ImageIcon,
    RotateCcw,
    Save,
    Send,
    User,
    Wrench,
    X,
    CalendarDays,
    ChevronDown,
} from 'lucide-react';

import ProduksiLayout from '../../../Components/ProduksiLayout';

const MAKS_FOTO = 5;
const MAKS_UKURAN = 5 * 1024 * 1024;

const STATUS = {
    draft: {
        label: 'Draft',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    menunggu_verifikasi: {
        label: 'Menunggu Verifikasi',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    revisi: {
        label: 'Perlu Revisi',
        color: 'bg-red-50 text-red-700 border-red-200',
    },
    terverifikasi: {
        label: 'Terverifikasi',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
};

const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100';

const readonlyCls =
    'w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700';

/* ---------- MODAL KONFIRMASI ---------- */

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
    if (!open || typeof document === 'undefined') return null;

    const toneStyle = {
        blue: {
            icon: 'bg-blue-100 text-blue-700',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
        green: {
            icon: 'bg-emerald-100 text-emerald-700',
            button: 'bg-emerald-600 hover:bg-emerald-700',
        },
        red: {
            icon: 'bg-red-100 text-red-700',
            button: 'bg-red-600 hover:bg-red-700',
        },
    }[tone] ?? {
        icon: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700',
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/25 p-3"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onCancel();
            }}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="px-5 pb-4 pt-5">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${toneStyle.icon}`}>
                        <Icon className="h-6 w-6" />
                    </div>

                    <h3
                        id="confirmation-title"
                        className="mt-3 text-center text-base font-extrabold text-slate-800"
                    >
                        {title}
                    </h3>

                    {description && (
                        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex justify-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${toneStyle.button}`}
                    >
                        {loading ? 'Memproses...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
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

const Card = ({ children, className = '' }) => (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, title, description }) => (
    <div className="mb-3 flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
            {description && (
                <p className="mt-0.5 text-xs text-slate-400">{description}</p>
            )}
        </div>
    </div>
);

const Field = ({ label, error, hint, required, children }) => (
    <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-600">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {label}
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-slate-800">
            {value || '-'}
        </p>
    </div>
);

/* ---------- ZONA FOTO ---------- */

function FotoZone({
    judul,
    lama,
    hapusIds,
    onToggleHapus,
    baru,
    onChange,
    disabled,
    error,
}) {
    const inputRef = useRef(null);
    const [pesan, setPesan] = useState('');
    const [hover, setHover] = useState(false);
    const [kursorDiZona, setKursorDiZona] = useState(false);

    const onPaste = (e) => {
        if (disabled) return;

        const files = Array.from(e.clipboardData?.items ?? [])
            .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
            .map((i) => {
                const f = i.getAsFile();
                const ext = f.type.split('/')[1] || 'png';

                return new File(
                    [f],
                    `paste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`,
                    { type: f.type }
                );
            });

        if (files.length) {
            e.preventDefault();
            tambah(files);
        }
    };

    useEffect(() => {
        if (!kursorDiZona || disabled) return undefined;

        window.addEventListener('paste', onPaste);

        return () => window.removeEventListener('paste', onPaste);
    }, [kursorDiZona, disabled]);

    const aktifLama = lama.filter((f) => !hapusIds.includes(f.id)).length;
    const kuota = Math.max(0, MAKS_FOTO - aktifLama - baru.length);

    const previews = useMemo(
        () => baru.map((f) => URL.createObjectURL(f)),
        [baru]
    );

    useEffect(
        () => () => previews.forEach((u) => URL.revokeObjectURL(u)),
        [previews]
    );

    const tambah = (daftar) => {
        const semua = Array.from(daftar);
        const gambar = semua.filter((f) => f.type.startsWith('image/'));
        const ukuranOk = gambar.filter((f) => f.size <= MAKS_UKURAN);
        const dipakai = ukuranOk.slice(0, kuota);

        const info = [];

        if (gambar.length !== semua.length) {
            info.push('Hanya file gambar yang diterima.');
        }

        if (ukuranOk.length !== gambar.length) {
            info.push('Maksimal 5 MB per foto.');
        }

        if (ukuranOk.length > kuota) {
            info.push(`Kuota tersisa ${kuota} foto.`);
        }

        setPesan(info.join(' '));

        if (dipakai.length) {
            onChange([...baru, ...dipakai]);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setHover(false);

        if (!disabled) tambah(e.dataTransfer.files);
    };

    return (
        <div>
            <h4 className="mb-2 text-xs font-extrabold uppercase text-slate-700">
                {judul}
            </h4>

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
                    className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center outline-none transition ${
                        hover
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 bg-slate-50 hover:border-blue-400 focus:border-blue-400 focus:bg-blue-50/50'
                    } ${kuota === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <ImageIcon className="h-7 w-7 text-slate-300" />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                        Drag & drop, klik untuk pilih, atau tempel (Ctrl+V)
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                        Sisa kuota: {kuota} dari {MAKS_FOTO} foto
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

            {pesan && (
                <p className="mt-1 text-xs font-medium text-amber-700">{pesan}</p>
            )}

            {error && (
                <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
            )}

            {(lama.length > 0 || baru.length > 0) && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                    {lama.map((f) => {
                        const dihapus = hapusIds.includes(f.id);

                        return (
                            <div
                                key={f.id}
                                className={`rounded-xl border p-2 ${
                                    dihapus
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-slate-200 bg-white'
                                }`}
                            >
                                <a href={f.url} target="_blank" rel="noreferrer">
                                    <img
                                        src={f.url}
                                        alt={judul}
                                        className={`h-28 w-full rounded-lg object-cover ${
                                            dihapus ? 'opacity-40' : ''
                                        }`}
                                    />
                                </a>

                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => onToggleHapus(f.id)}
                                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        {dihapus ? 'Batal hapus' : 'Hapus foto'}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {baru.map((f, i) => (
                        <div
                            key={`${f.name}-${i}`}
                            className="rounded-xl border border-blue-200 bg-blue-50/40 p-2"
                        >
                            <img
                                src={previews[i]}
                                alt={f.name}
                                className="h-28 w-full rounded-lg object-cover"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    onChange(baru.filter((_, idx) => idx !== i))
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Buang (belum tersimpan)
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {disabled && lama.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">
                    Belum ada foto.
                </p>
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

function FormMaintenance({
    rrf,
    repair,
    parts,
    photos,
    shiftOptions,
    canEdit,
}) {
    const awalParts = parts.map(barisPart);

    while (awalParts.length < 3) {
        awalParts.push(barisPart());
    }

    const counterAwal =
        rrf.counter_measure ??
        [repair.request_activity, repair.counter_measure]
            .filter(Boolean)
            .join('\n');

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

    const menit = hitungMenit(
        rrf.req_start_raw,
        data.serv_tanggal,
        data.serv_jam
    );

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

        if (canEdit && !form.processing) {
            setConfirmAction('save');
        }
    };

    const kirimKePimpinan = () => {
        if (!lengkap || form.processing) return;
        setConfirmAction('send');
    };

    const ubahPart = (i, field, value) =>
        setData(
            'parts',
            data.parts.map((p, idx) =>
                idx === i ? { ...p, [field]: value } : p
            )
        );

    const toggleHapus = (id) =>
        setData(
            'hapus_foto_ids',
            data.hapus_foto_ids.includes(id)
                ? data.hapus_foto_ids.filter((x) => x !== id)
                : [...data.hapus_foto_ids, id]
        );

    const fotoLama = (tipe) => photos.filter((p) => p.tipe === tipe);

    const errorLain = Object.entries(errors).filter(([k]) =>
        /^(parts|fotos|hapus|aksi)/.test(k)
    );

    return (
        <form onSubmit={submit} className="space-y-4">
            {/* SERV SCHEDULE & DURATION */}
            <Card>
                <SectionTitle
                    icon={CalendarDays}
                    title="Serv. Schedule & Duration"
                    description="Down time dihitung otomatis dari Serv. schedule dikurangi Mulai Permintaan."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field
                        label="Serv. schedule: Date"
                        required
                        error={errors.serv_tanggal}
                    >
                        <input
                            type="date"
                            value={data.serv_tanggal}
                            onChange={(e) =>
                                setData('serv_tanggal', e.target.value)
                            }
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field
                        label="Serv. schedule: Time"
                        required
                        error={errors.serv_jam}
                    >
                        <input
                            type="time"
                            value={data.serv_jam}
                            onChange={(e) =>
                                setData('serv_jam', e.target.value)
                            }
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field label="Mulai Permintaan (dari QMOS)">
                        <input
                            readOnly
                            value={repair.req_start_at ?? '-'}
                            className={readonlyCls}
                        />
                    </Field>

                    <Field label="Down time (otomatis)">
                        <input
                            readOnly
                            value={fmtMenit(menit)}
                            className={readonlyCls}
                        />
                    </Field>

                    <Field
                        label="Stop line (otomatis)"
                        hint="Sama dengan down time."
                    >
                        <input
                            readOnly
                            value={fmtMenit(menit)}
                            className={readonlyCls}
                        />
                    </Field>

                    <Field
                        label="Time repair (otomatis)"
                        hint="Sama dengan down time."
                    >
                        <input
                            readOnly
                            value={fmtMenit(menit)}
                            className={readonlyCls}
                        />
                    </Field>
                </div>

                {menit === null && (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                        Data QMOS tidak punya Mulai Permintaan, jadi down time
                        tidak bisa dihitung.
                    </p>
                )}
            </Card>

            {/* MAN & SHIFT */}
            <Card>
                <SectionTitle
                    icon={User}
                    title="Man & Shift"
                    description="Penanggung jawab pekerjaan Maintenance."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label="Man (PIC MTC)"
                        required
                        error={errors.pic_nama}
                    >
                        <input
                            value={data.pic_nama}
                            onChange={(e) =>
                                setData('pic_nama', e.target.value)
                            }
                            placeholder="Nama teknisi yang menangani"
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field
                        label="Shift"
                        required
                        error={errors.shift_kerja}
                    >
                        <select
                            value={data.shift_kerja}
                            onChange={(e) =>
                                setData('shift_kerja', e.target.value)
                            }
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
                    title="Detail Penanganan"
                    description="Cause dan Remark wajib diisi sebelum dikirim ke Pimpinan."
                />

                <div className="space-y-4">
                    <Field
                        label="2. Cause (penyebab)"
                        required
                        error={errors.cause}
                    >
                        <textarea
                            rows={3}
                            value={data.cause}
                            onChange={(e) =>
                                setData('cause', e.target.value)
                            }
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
                            onChange={(e) =>
                                setData('counter_measure', e.target.value)
                            }
                            disabled={!canEdit}
                            className={inputCls}
                        />
                    </Field>

                    <Field
                        label="4. Remark"
                        required
                        error={errors.remark}
                    >
                        <textarea
                            rows={2}
                            value={data.remark}
                            onChange={(e) =>
                                setData('remark', e.target.value)
                            }
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
                    title="Part yang Dipakai"
                    description="Terisi dari permintaan produksi. Koreksi kalau berbeda."
                />

                <div className="space-y-2">
                    {data.parts.map((p, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-2 gap-2 md:grid-cols-6"
                        >
                            <input
                                placeholder="Part name"
                                value={p.part_name}
                                onChange={(e) =>
                                    ubahPart(i, 'part_name', e.target.value)
                                }
                                disabled={!canEdit}
                                className={`${inputCls} col-span-2`}
                            />

                            <input
                                placeholder="Model / type"
                                value={p.model_type}
                                onChange={(e) =>
                                    ubahPart(i, 'model_type', e.target.value)
                                }
                                disabled={!canEdit}
                                className={inputCls}
                            />

                            <input
                                placeholder="Maker"
                                value={p.maker}
                                onChange={(e) =>
                                    ubahPart(i, 'maker', e.target.value)
                                }
                                disabled={!canEdit}
                                className={inputCls}
                            />

                            <input
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={p.qty}
                                onChange={(e) =>
                                    ubahPart(i, 'qty', e.target.value)
                                }
                                disabled={!canEdit}
                                className={inputCls}
                            />

                            <input
                                placeholder="Other"
                                value={p.other}
                                onChange={(e) =>
                                    ubahPart(i, 'other', e.target.value)
                                }
                                disabled={!canEdit}
                                className={inputCls}
                            />
                        </div>
                    ))}
                </div>

                {canEdit && data.parts.length < 10 && (
                    <button
                        type="button"
                        onClick={() =>
                            setData('parts', [...data.parts, barisPart()])
                        }
                        className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Tambah baris
                    </button>
                )}
            </Card>

            {/* FOTO */}
            <Card>
                <SectionTitle
                    icon={ImageIcon}
                    title="5. Picture (jika terjadi perubahan)"
                    description="Drag & drop, klik untuk memilih file, atau arahkan kursor ke kotak lalu tekan Ctrl+V untuk menempel gambar."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorLain.map(([k, msg]) => (
                        <p key={k}>{msg}</p>
                    ))}
                </div>
            )}

            {canEdit && (
                <Card className="flex flex-wrap items-center justify-end gap-3">
                    {!lengkap && (
                        <p className="mr-auto text-xs text-slate-500">
                            Untuk mengirim, isi dulu Man, Shift, Cause, dan
                            Remark.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Menyimpan...' : 'Simpan Draft'}
                    </button>

                    <button
                        type="button"
                        onClick={kirimKePimpinan}
                        disabled={form.processing || !lengkap}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Send className="h-4 w-4" />
                        Simpan & Kirim ke Pimpinan
                    </button>
                </Card>
            )}

            <ConfirmationModal
                open={!!confirmAction}
                title={
                    confirmAction === 'save'
                        ? 'Apakah yakin menyimpan?'
                        : 'Apakah yakin untuk kirim?'
                }
                description={
                    confirmAction === 'save'
                        ? 'Perubahan pada formulir RRF akan disimpan sebagai draft. RRF belum dikirim kepada Pimpinan.'
                        : 'RRF akan disimpan dan dikirim kepada Pimpinan Maintenance untuk proses verifikasi.'
                }
                confirmText={
                    confirmAction === 'save'
                        ? 'Ya, Simpan Draft'
                        : 'Ya, Kirim RRF'
                }
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

        router.post(
            `/mtc/rrf/${rrf.id}/kembalikan`,
            { catatan: alasan.trim() },
            opsi
        );
    };

    return (
        <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-sm font-extrabold text-slate-800">
                            Verifikasi RRF
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Periksa hasil penanganan sebelum memberikan
                            keputusan.
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    Menunggu keputusan
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => setBukaKembali((value) => !value)}
                    disabled={proses}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RotateCcw className="h-4 w-4" />
                    {bukaKembali
                        ? 'Tutup Form Revisi'
                        : 'Kembalikan untuk Revisi'}
                </button>

                <button
                    type="button"
                    onClick={verifikasi}
                    disabled={proses}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Check className="h-4 w-4" />
                    {proses ? 'Memproses...' : 'Verifikasi RRF'}
                </button>
            </div>

            {bukaKembali && (
                <form
                    onSubmit={kembalikan}
                    className="mt-2.5 space-y-2.5 rounded-lg border border-red-200 bg-red-50/70 p-3"
                >
                    <div>
                        <p className="text-xs font-bold text-red-800">
                            Alasan pengembalian
                        </p>
                        <p className="mt-0.5 text-[11px] text-red-700/80">
                            Jelaskan bagian yang perlu diperbaiki oleh Admin
                            Maintenance.
                        </p>
                    </div>

                    <Field
                        label="Alasan revisi"
                        required
                        error={errorAlasan || errors.catatan}
                    >
                        <textarea
                            rows={2}
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
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={proses}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Lanjutkan Revisi
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal
                open={!!confirmAction}
                title={
                    confirmAction === 'verify'
                        ? 'Konfirmasi Verifikasi'
                        : 'Konfirmasi Pengembalian'
                }
                description={
                    confirmAction === 'verify'
                        ? 'RRF akan disetujui dan statusnya berubah menjadi terverifikasi.'
                        : 'RRF akan dikembalikan kepada Admin Maintenance untuk diperbaiki sesuai alasan yang diberikan.'
                }
                confirmText={
                    confirmAction === 'verify'
                        ? 'Ya, Verifikasi'
                        : 'Ya, Kembalikan'
                }
                tone={confirmAction === 'verify' ? 'green' : 'red'}
                icon={
                    confirmAction === 'verify' ? CheckCircle2 : RotateCcw
                }
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

    const warna = {
        sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        failed: 'border-red-200 bg-red-50 text-red-700',
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
    }[rrf.callback_status] ?? 'border-slate-200 bg-slate-100 text-slate-600';

    const label = {
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
                title="Pengiriman Hasil ke QMOS"
                description="Hasil verifikasi dikirim ke QMOS dengan status Completed."
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span
                        className={`inline-flex rounded-full border px-4 py-2 text-xs font-extrabold ${warna}`}
                    >
                        {label}
                    </span>

                    {rrf.callback_sent_at && (
                        <p className="mt-2 text-xs text-slate-500">
                            Terkirim: {rrf.callback_sent_at}
                        </p>
                    )}

                    {rrf.callback_error && (
                        <p className="mt-2 max-w-xl break-words text-xs text-red-600">
                            {rrf.callback_error}
                        </p>
                    )}
                </div>

                {rrf.callback_status !== 'sent' && (
                    <button
                        type="button"
                        onClick={kirimUlang}
                        disabled={proses}
                        className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
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
        <Card className="!p-0 overflow-hidden">
            <button
                type="button"
                onClick={() => setTerbuka((value) => !value)}
                aria-expanded={terbuka}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Clock3 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-800">
                            Riwayat Proses RRF
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Catatan perubahan status dan keputusan.
                        </p>
                    </div>

                    <span className="ml-1 shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        {statusLogs.length}
                    </span>
                </div>

                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        terbuka ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {terbuka && (
                <div className="border-t border-slate-100 px-4 py-4">
                    {statusLogs.length > 0 ? (
                        <div className="space-y-3">
                            {statusLogs.map((log, index) => (
                                <div
                                    key={log.id}
                                    className="relative border-l-2 border-blue-200 pb-2 pl-5 last:border-l-0 last:pb-0"
                                >
                                    <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-extrabold capitalize text-slate-800">
                                            {log.status_baru?.replaceAll('_', ' ') ?? '-'}
                                        </p>

                                        <span className="text-[10px] font-medium text-slate-400">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[11px] text-slate-500">
                                        {log.user?.name ?? 'Sistem'} • {log.created_at ?? '-'}
                                    </p>

                                    {log.catatan && (
                                        <p className="mt-2 whitespace-pre-line rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
                                            {log.catatan}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-3 text-center text-xs text-slate-400">
                            Belum ada riwayat proses.
                        </p>
                    )}
                </div>
            )}
        </Card>
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

    const catatanRevisi = [...approvals]
        .reverse()
        .find((a) => a.status === 'ditolak');

    return (
        <ProduksiLayout>
            <Head title={`Detail RRF ${rrf.rrf_no ?? ''}`} />

            <div className="space-y-4">
                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-lg">
                            <ClipboardList className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-lg font-extrabold text-white">
                                Repair Request Form
                            </h1>
                            <p className="text-xs text-blue-100/70">
                                {rrf.rrf_no ?? `RRF-${rrf.id}`} • Rev. {rrf.rev ?? 0}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={isAdmin ? '/mtc/rrf/repair-mtc' : '/mtc/rrf'}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                {/* FLASH */}
                {flash.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* STATUS */}
                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Status RRF
                            </p>

                            <span
                                className={`mt-2 inline-flex items-center rounded-full border px-4 py-2 text-xs font-extrabold ${statusConfig.color}`}
                            >
                                {statusConfig.label}
                            </span>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-slate-400">Dibuat pada</p>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                                {rrf.created_at ?? '-'}
                            </p>
                        </div>
                    </div>

                    {status === 'revisi' && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-xs font-extrabold">
                                    RRF dikembalikan Pimpinan, perlu diperbaiki
                                </p>
                            </div>

                            <p className="mt-1 whitespace-pre-line text-xs text-red-700">
                                {catatanRevisi?.catatan ??
                                    'Lihat catatan pada riwayat proses di bawah.'}
                            </p>
                        </div>
                    )}
                </Card>

                {/* DATA QMOS */}
                <Card>
                    <SectionTitle
                        icon={Wrench}
                        title="Informasi dari Produksi (QMOS)"
                        description="Data referensi dari sistem QMOS, tidak bisa diubah."
                    />

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                            label="ID QMOS"
                            value={
                                repair.qmos_repair_id
                                    ? `QMOS-${repair.qmos_repair_id}`
                                    : '-'
                            }
                        />

                        <InfoItem label="Location" value={repair.location} />
                        <InfoItem label="Machine" value={repair.machine} />

                        <InfoItem
                            label="Nomor mesin"
                            value={repair.machine_no ?? repair.asset_no}
                        />

                        <InfoItem
                            label="Division pelapor"
                            value={repair.division_pelapor}
                        />

                        <InfoItem
                            label="Jenis permintaan"
                            value={repair.jenis_permintaan}
                        />

                        <InfoItem label="Class" value={repair.machine_class} />
                        <InfoItem label="Requested by" value={repair.requested_by} />

                        <InfoItem
                            label="Supervisor (Pimpinan MTC)"
                            value={repair.supervisor}
                        />

                        <InfoItem
                            label="Mulai permintaan"
                            value={repair.req_start_at}
                        />

                        <InfoItem
                            label="Selesai permintaan (Serv. schedule)"
                            value={repair.req_finish_at}
                        />

                        <InfoItem
                            label="Dikirim FRM"
                            value={repair.submitted_by_frm}
                        />
                    </div>

                    <div className="mt-2.5 space-y-2.5">
                        <InfoItem label="1. Problem" value={repair.problem} />
                        <InfoItem
                            label="Request activity"
                            value={repair.request_activity}
                        />
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

                {/* RIWAYAT PROSES - ACCORDION */}
                <HistoryAccordion statusLogs={statusLogs} />
            </div>
        </ProduksiLayout>
    );
}
