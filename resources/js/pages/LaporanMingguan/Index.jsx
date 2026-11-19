import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';

import {
    ArrowLeft,
    AlertTriangle,
    X,
    Save,
    Send,
    Trash2,
    CheckCircle2,
    Menu,
    UploadCloud,
    ExternalLink,
    Download,
    Plus,
    ClipboardList,
    Clock,
    TrendingUp,
} from 'lucide-react';

/* =====================================================
   KOMPONEN UMUM (animasi, latar, header, toast, modal)
===================================================== */

const STATUS = {
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    menunggu: { label: 'Menunggu pimpinan', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    diperiksa: { label: 'Sedang diperiksa', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    disetujui: { label: 'Disetujui', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    ditolak: { label: 'Ditolak', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
};

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const thClass =
    'border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap';

const tdClass =
    'border-b border-slate-100 px-4 py-3 align-middle text-sm text-slate-700';

const delay = (ms) => ({ animationDelay: `${ms}ms` });

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.cls}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
        </span>
    );
}

function Styles() {
    return (
        <style>{`
            @keyframes lpRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes lpFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes lpPop { from { opacity: 0; transform: translateY(14px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes lpSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slideIn { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes lpDrop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes lpPing { 0% { transform: scale(.9); opacity: .7; } 100% { transform: scale(1.6); opacity: 0; } }
            @keyframes lpShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
            @keyframes lpFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
            @keyframes lpFloatRev { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
            @keyframes lpSpin { to { transform: rotate(360deg); } }
            @keyframes lpBar { from { width: 0; } }

            .lp-rise { opacity: 0; animation: lpRise .65s cubic-bezier(.22,1,.36,1) forwards; }
            .lp-fade { animation: lpFade .25s ease-out both; }
            .lp-pop { animation: lpPop .4s cubic-bezier(.22,1,.36,1) both; }
            .lp-slide { animation: lpSlide .45s cubic-bezier(.22,1,.36,1) both; }
            .lp-drop { animation: lpDrop .25s ease-out both; }
            .lp-ping { animation: lpPing 1.8s ease-out infinite; }
            .lp-shimmer { background-size: 200% 100%; animation: lpShimmer 6s linear infinite; }
            .lp-float { animation: lpFloat 14s ease-in-out infinite; }
            .lp-float-rev { animation: lpFloatRev 17s ease-in-out infinite; }
            .lp-spin { animation: lpSpin .8s linear infinite; }
            .lp-bar { animation: lpBar 1s cubic-bezier(.22,1,.36,1) both; }

            .lp-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
            .lp-scroll::-webkit-scrollbar-track { background: transparent; }
            .lp-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }

            @media (prefers-reduced-motion: reduce) {
                .lp-rise { opacity: 1; animation: none; }
                .lp-fade, .lp-pop, .lp-slide, .lp-drop, .lp-ping, .lp-shimmer,
                .lp-float, .lp-float-rev, .lp-bar { animation: none !important; }
            }
        `}</style>
    );
}

function Background() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="lp-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
            <div className="lp-float-rev absolute right-[-100px] top-[10%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
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
    );
}

function TopBar({ onMenu, title, subtitle }) {
    return (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
            <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-5 2xl:px-8">
                <button
                    type="button"
                    onClick={onMenu}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                    title="Menu"
                    aria-label="Buka menu"
                >
                    <Menu size={20} />
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="truncate text-xs text-blue-200/80">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="lp-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
        </header>
    );
}

function Toast({ message, onClose }) {
    return (
        <div className="lp-slide fixed right-5 top-5 z-[200] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">Berhasil</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
                title="Tutup"
            >
                <X size={16} />
            </button>
        </div>
    );
}

// Cangkang modal: backdrop blur + animasi pop + ring berdenyut pada ikon
function ModalCard({ z = 'z-[100]', maxW = 'max-w-sm', icon: IconCmp, tone, title, children, onClose, closeDisabled }) {
    const tones = {
        blue: { ring: 'bg-blue-400/40', icon: 'bg-blue-50 text-blue-600' },
        indigo: { ring: 'bg-indigo-400/40', icon: 'bg-indigo-50 text-indigo-600' },
        red: { ring: 'bg-red-400/40', icon: 'bg-red-50 text-red-600' },
    };
    const t = tones[tone] ?? tones.blue;

    return (
        <div className={`lp-fade fixed inset-0 ${z} flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm`}>
            <div className={`lp-pop relative w-full ${maxW} overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30`}>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={closeDisabled}
                    className="absolute right-3 top-3 cursor-pointer rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>

                <div className="px-6 pb-6 pt-8 text-center">
                    <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                        <span className={`lp-ping absolute inset-0 rounded-full ${t.ring}`} />
                        <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${t.icon}`}>
                            <IconCmp size={28} />
                        </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>

                    {children}
                </div>
            </div>
        </div>
    );
}

const btnCancel =
    'h-11 flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

const btnConfirmBase =
    'group relative flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const btnTone = {
    blue: 'from-blue-600 to-indigo-600 shadow-blue-500/30',
    indigo: 'from-indigo-600 to-violet-600 shadow-indigo-500/30',
    red: 'from-red-500 to-rose-600 shadow-red-500/30',
};

const Shine = () => (
    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
);

const Spinner = () => (
    <span className="lp-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
);

/* =====================================================
   TEXTAREA
===================================================== */

function TeksSel({ value, onSave, disabled, rows = 3, placeholder }) {
    const [teks, setTeks] = useState(value ?? '');

    useEffect(() => {
        setTeks(value ?? '');
    }, [value]);

    return (
        <textarea
            value={teks}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setTeks(e.target.value)}
            onBlur={() => {
                if ((value ?? '') !== teks) onSave(teks);
            }}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        />
    );
}

/* =====================================================
   KOMPONEN FOTO
===================================================== */

function FotoSel({ url, itemId, jenis, disabled, label }) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorUpload, setErrorUpload] = useState('');
    const [fileTerakhir, setFileTerakhir] = useState(null);
    const [modalHapus, setModalHapus] = useState(false);

    const maksimalUkuran = 10 * 1024 * 1024;

    // =====================================================
    // VALIDASI FILE
    // =====================================================

    const validasiFile = (file) => {
        if (!file) {
            setErrorUpload('Silakan pilih foto terlebih dahulu.');
            return false;
        }

        const ekstensiValid = /\.(jpg|jpeg|png)$/i.test(file.name);

        const formatValid = [
            'image/jpeg',
            'image/png',
        ].includes(file.type);

        if (!formatValid && !ekstensiValid) {
            setErrorUpload('Format foto harus JPG, JPEG, atau PNG.');
            return false;
        }

        if (file.size === 0) {
            setErrorUpload('File foto kosong atau tidak dapat dibaca.');
            return false;
        }

        if (file.size > maksimalUkuran) {
            setErrorUpload(
                `Ukuran foto ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maksimal 10 MB.`
            );
            return false;
        }

        return true;
    };

    // =====================================================
    // UPLOAD FOTO
    // =====================================================

    const upload = (file) => {
        if (!file || disabled || uploading || deleting) return;

        setErrorUpload('');

        if (!validasiFile(file)) return;

        setFileTerakhir(file);
        setUploading(true);

        router.post(
            `/laporan-mingguan/item/${itemId}/foto`,
            {
                jenis,
                foto: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    setErrorUpload('');
                    setFileTerakhir(null);
                },

                onError: (errors) => {
                    setErrorUpload(
                        errors?.foto ||
                        errors?.message ||
                        'Foto gagal diupload. Silakan coba upload ulang.'
                    );
                },

                onFinish: () => {
                    setUploading(false);
                },
            }
        );
    };

    // =====================================================
    // PILIH FOTO
    // =====================================================

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            upload(file);
        }

        // Supaya file yang sama bisa dipilih kembali
        e.target.value = '';
    };

    // =====================================================
    // DRAG AND DROP
    // =====================================================

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!disabled && !uploading && !deleting) {
            setDragActive(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setDragActive(false);

        if (disabled || uploading || deleting) return;

        const file = e.dataTransfer.files?.[0];

        if (file) {
            upload(file);
        }
    };

    // =====================================================
    // COPY PASTE FOTO DARI CLIPBOARD
    // =====================================================

    const handlePaste = (e) => {
        if (disabled || uploading || deleting) return;

        const items = e.clipboardData?.items;

        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();

                const file = item.getAsFile();

                if (!file) continue;

                // Buat nama file untuk foto dari clipboard
                const ekstensi = file.type === 'image/png'
                    ? 'png'
                    : 'jpg';

                const fotoClipboard = new File(
                    [file],
                    `foto-clipboard-${Date.now()}.${ekstensi}`,
                    { type: file.type }
                );

                upload(fotoClipboard);
                return;
            }
        }
    };

    // =====================================================
    // UPLOAD ULANG
    // =====================================================

    const cobaUploadLagi = () => {
        if (!fileTerakhir || uploading || deleting) return;

        upload(fileTerakhir);
    };

    // =====================================================
    // HAPUS FOTO
    // =====================================================

    const hapusFoto = () => {
        if (deleting || uploading) return;

        setDeleting(true);
        setErrorUpload('');

        router.delete(
            `/laporan-mingguan/item/${itemId}/foto`,
            {
                data: { jenis },
                preserveScroll: true,

                onSuccess: () => {
                    setModalHapus(false);
                    setFileTerakhir(null);
                    setErrorUpload('');
                },

                onError: (errors) => {
                    setErrorUpload(
                        errors?.foto ||
                        errors?.error ||
                        errors?.message ||
                        'Foto gagal dihapus. Silakan coba lagi.'
                    );
                },

                onFinish: () => {
                    setDeleting(false);
                },
            }
        );
    };

    // =====================================================
    // TAMPILAN
    // =====================================================

    return (
        <>
            <div className="flex min-w-[180px] flex-col items-center gap-2.5">

                {label && (
                    <span className="text-[11px] font-semibold text-slate-400">
                        {label}
                    </span>
                )}

                {/* AREA FOTO DAN DRAG DROP */}
                <div
                    tabIndex={disabled ? -1 : 0}
                    onPaste={handlePaste}
                    onDragEnter={handleDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group relative flex h-32 w-40 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-violet-500/20 ${
                        dragActive
                            ? 'scale-[1.03] border-violet-500 bg-violet-50'
                            : url
                                ? 'border-transparent bg-slate-100'
                                : 'border-slate-200 bg-slate-50'
                    } ${
                        disabled
                            ? 'opacity-70'
                            : 'hover:border-violet-300'
                    }`}
                >
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex h-full w-full items-center justify-center"
                        >
                            <img
                                src={url}
                                alt={label || 'Foto dokumentasi'}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />

                            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition-all duration-200 group-hover:bg-slate-950/40 group-hover:opacity-100">
                                <ExternalLink size={20} />
                            </span>
                        </a>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 px-2 text-slate-400">
                            <UploadCloud size={28} strokeWidth={1.5} />

                            <span className="text-center text-[10px] leading-snug text-slate-400">
                                Drag & Drop atau Ctrl + V
                            </span>
                        </div>
                    )}

                    {/* INDIKATOR DRAG */}
                    {dragActive && !disabled && (
                        <div className="lp-fade absolute inset-0 flex items-center justify-center bg-violet-600/90">
                            <span className="px-2 text-center text-xs font-bold text-white">
                                Lepaskan foto di sini
                            </span>
                        </div>
                    )}

                    {/* INDIKATOR PROSES */}
                    {(uploading || deleting) && (
                        <div className="lp-fade absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                            <div className="lp-spin h-6 w-6 rounded-full border-2 border-violet-200 border-t-violet-600" />

                            <span className="mt-2 text-[11px] font-semibold text-violet-700">
                                {uploading
                                    ? 'Mengupload foto...'
                                    : 'Menghapus foto...'}
                            </span>
                        </div>
                    )}
                </div>

                {/* TOMBOL PILIH / GANTI + HAPUS */}
                {!disabled && (
                    <div className="flex items-center gap-1.5">
                        <label
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition-all duration-200 ${
                                uploading || deleting
                                    ? 'pointer-events-none bg-slate-400'
                                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-500/25 hover:-translate-y-0.5 hover:shadow-md'
                            }`}
                        >
                            <UploadCloud size={13} />

                            {uploading
                                ? 'Sedang Upload...'
                                : url
                                    ? 'Ganti Foto'
                                    : 'Pilih Foto'}

                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                disabled={uploading || deleting}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>

                        {url && (
                            <button
                                type="button"
                                onClick={() => setModalHapus(true)}
                                disabled={uploading || deleting}
                                title="Hapus foto"
                                className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                )}

                {/* KETERANGAN FORMAT */}
                {!disabled && (
                    <span className="text-center text-[10px] text-slate-400">
                        JPG / JPEG / PNG · Maks. 10 MB
                    </span>
                )}

                {/* PESAN ERROR */}
                {errorUpload && (
                    <div className="lp-drop w-full rounded-xl border border-red-200 bg-red-50 p-2.5 text-center">
                        <p className="text-[11px] font-medium text-red-600">
                            {errorUpload}
                        </p>

                        {fileTerakhir && (
                            <button
                                type="button"
                                onClick={cobaUploadLagi}
                                disabled={uploading || deleting}
                                className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                ↻ Coba Upload Lagi
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL KONFIRMASI HAPUS FOTO */}
            {modalHapus && (
                <ModalCard
                    z="z-[150]"
                    icon={Trash2}
                    tone="red"
                    title="Hapus Foto?"
                    onClose={() => setModalHapus(false)}
                    closeDisabled={deleting}
                >
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Foto {label || 'dokumentasi'} ini akan dihapus secara permanen.
                        Apakah kamu yakin ingin melanjutkan?
                    </p>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setModalHapus(false)}
                            disabled={deleting}
                            className={btnCancel}
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={hapusFoto}
                            disabled={deleting}
                            className={`${btnConfirmBase} ${btnTone.red}`}
                        >
                            <Shine />

                            {deleting ? (
                                <span className="relative flex items-center gap-2">
                                    <Spinner />
                                    Menghapus...
                                </span>
                            ) : (
                                <span className="relative">Ya, Hapus</span>
                            )}
                        </button>
                    </div>
                </ModalCard>
            )}
        </>
    );
}

/* Kartu bagian laporan dengan nomor */
function Bagian({ nomor, judul, aksi, ms = 0, children }) {
    return (
        <section className={`lp-rise overflow-hidden ${card}`} style={delay(ms)}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/25">
                        {nomor}
                    </span>

                    <h3 className="text-sm font-bold text-slate-900">{judul}</h3>
                </div>

                {aksi}
            </div>

            <div className="lp-scroll overflow-x-auto">{children}</div>
        </section>
    );
}

/* =====================================================
   HALAMAN INDEX
===================================================== */

export default function Index({
    tahun,
    bulan,
    week,
    daftarWeek,
    namaBulan,
    rentangLabel,
    laporan,
    bagian1,
    bagian2,
    bagian3,
    revisis,
    bisaPersetujuan,
    flash,
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [modalAksi, setModalAksi] = useState(null);
    const [alasanTolak, setAlasanTolak] = useState('');
    const [prosesAksi, setProsesAksi] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const status = STATUS[laporan.status] ?? STATUS.draft;
    const terkunci = laporan.status === 'disetujui';

    // =====================================================
    // NOTIFIKASI TOAST
    // =====================================================

    useEffect(() => {
        if (!flash?.success) return;

        setShowToast(true);

        const timer = setTimeout(() => {
            setShowToast(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, [flash?.success]);

    // =====================================================
    // NAVIGASI DAN SIMPAN DATA
    // =====================================================

    const pindah = (next) =>
        router.get(
            '/laporan-mingguan/form',
            { bulan, tahun, week, ...next },
            { preserveScroll: true }
        );

    const simpanItem = (id, field, value) =>
        router.put(
            `/laporan-mingguan/item/${id}`,
            { [field]: value },
            { preserveScroll: true }
        );

    const post = (url, data = {}) =>
        router.post(url, data, { preserveScroll: true });

    // =====================================================
    // JALANKAN AKSI MODAL
    // =====================================================

    const jalankanAksi = () => {
        if (!modalAksi || prosesAksi) return;

        if (modalAksi.type === 'tolak' && !alasanTolak.trim()) {
            return;
        }

        setProsesAksi(true);

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                setModalAksi(null);
                setAlasanTolak('');
            },

            onFinish: () => setProsesAksi(false),
        };

        switch (modalAksi.type) {
            case 'simpan':
                router.post(
                    `/laporan-mingguan/${laporan.id}/simpan`,
                    {},
                    options
                );
                break;

            case 'kirim':
                router.post(
                    `/laporan-mingguan/${laporan.id}/kirim`,
                    {},
                    options
                );
                break;

            case 'tolak':
                router.post(
                    `/laporan-mingguan/${laporan.id}/tolak`,
                    { alasan: alasanTolak.trim() },
                    options
                );
                break;

            case 'hapusBaris':
                router.delete(
                    `/laporan-mingguan/item/${modalAksi.itemId}`,
                    options
                );
                break;

            default:
                setProsesAksi(false);
        }
    };

    const tolak = () => {
        setAlasanTolak('');
        setModalAksi({ type: 'tolak' });
    };

    // =====================================================
    // TOTAL PENCAPAIAN
    // =====================================================

    const totalJumlah = bagian1.reduce((a, r) => a + r.jumlah, 0);
    const totalSudah = bagian1.reduce((a, r) => a + r.sudah, 0);
    const totalBelum = bagian1.reduce((a, r) => a + r.belum, 0);

    const totalPersen =
        totalJumlah > 0
            ? Math.round((totalSudah / totalJumlah) * 100)
            : 0;

    // Kartu ringkasan (hanya tampilan, memakai total di atas)
    const stats = [
        {
            label: 'Jumlah item',
            value: totalJumlah,
            icon: ClipboardList,
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Sudah preventif',
            value: totalSudah,
            icon: CheckCircle2,
            tone: 'from-emerald-500 to-green-600',
            soft: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Belum preventif',
            value: totalBelum,
            icon: Clock,
            tone: 'from-amber-500 to-orange-500',
            soft: 'bg-amber-50 text-amber-600',
        },
    ];

    // Konfigurasi modal aksi
    const konfigurasi = {
        simpan: {
            icon: Save,
            tone: 'blue',
            judul: 'Simpan Draft?',
            deskripsi:
                'Apakah kamu yakin ingin menyimpan laporan ini sebagai draft?',
            aksi: 'Ya, Simpan',
        },

        kirim: {
            icon: Send,
            tone: 'indigo',
            judul: 'Kirim Laporan?',
            deskripsi:
                'Laporan akan dikirim ke pimpinan untuk diperiksa. Pastikan data sudah benar.',
            aksi: 'Ya, Kirim',
        },

        tolak: {
            icon: AlertTriangle,
            tone: 'red',
            judul: 'Tolak Laporan?',
            deskripsi: 'Masukkan alasan penolakan laporan ini.',
            aksi: 'Ya, Tolak',
        },

        hapusBaris: {
            icon: Trash2,
            tone: 'red',
            judul: 'Hapus Baris?',
            deskripsi:
                'Apakah kamu yakin ingin menghapus baris temuan ini?',
            aksi: 'Ya, Hapus',
        },
    };

    const config = modalAksi ? konfigurasi[modalAksi.type] : null;

    const tutupModalAksi = () => {
        setModalAksi(null);
        setAlasanTolak('');
    };

    return (
        <>
            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <Head title="Report Mingguan Preventif" />

            <Styles />

            {/* TOAST NOTIFICATION */}
            {showToast && flash?.success && (
                <Toast
                    message={flash.success}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
                <Background />

                <TopBar
                    onMenu={() => setShowSidebar(true)}
                    title="Report Mingguan Preventif"
                    subtitle={`Week ${week} · ${rentangLabel}`}
                />

                <main className="w-full space-y-4 px-3 py-4 sm:px-5 2xl:px-8">

                    {/* NAVIGASI KEMBALI */}
                    <div className="lp-rise">
                        <Link
                            href="/laporan-mingguan"
                            className="group inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:text-blue-600"
                        >
                            <ArrowLeft
                                size={15}
                                className="transition-transform duration-200 group-hover:-translate-x-0.5"
                            />
                            Kembali ke Riwayat
                        </Link>
                    </div>

                    {/* TOOLBAR */}
                    <div className={`lp-rise p-5 ${card}`} style={delay(60)}>
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                        Week {week} · {rentangLabel}
                                    </h2>

                                    <StatusPill status={status} />
                                </div>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Hanya hari Senin-Jumat yang dihitung.
                                    {laporan.dikirim_pada &&
                                        ` Dikirim ${laporan.dikirim_pada}.`}
                                    {laporan.disetujui_pada &&
                                        ` Disetujui ${laporan.disetujui_pada}.`}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                                <select
                                    value={bulan}
                                    onChange={(e) =>
                                        pindah({
                                            bulan: Number(e.target.value),
                                            week: undefined,
                                        })
                                    }
                                    className={selectClass}
                                >
                                    {Object.entries(namaBulan).map(
                                        ([n, nama]) => (
                                            <option key={n} value={n}>
                                                {nama}
                                            </option>
                                        )
                                    )}
                                </select>

                                <select
                                    value={tahun}
                                    onChange={(e) =>
                                        pindah({
                                            tahun: Number(e.target.value),
                                            week: undefined,
                                        })
                                    }
                                    className={selectClass}
                                >
                                    {Array.from(
                                        { length: 16 },
                                        (_, i) => 2020 + i
                                    ).map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={week}
                                    onChange={(e) =>
                                        pindah({
                                            week: Number(e.target.value),
                                        })
                                    }
                                    className={selectClass}
                                >
                                    {daftarWeek.map((w) => (
                                        <option key={w} value={w}>
                                            Week {w}
                                        </option>
                                    ))}
                                </select>

                                <a
                                    href={`/laporan-mingguan/export?bulan=${bulan}&tahun=${tahun}&week=${week}`}
                                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-0"
                                >
                                    <Download size={14} />
                                    Export Excel
                                </a>

                                {['draft', 'ditolak'].includes(laporan.status) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalAksi({ type: 'simpan' })
                                        }
                                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0"
                                    >
                                        <Save size={14} />
                                        Simpan Draft
                                    </button>
                                )}

                                {['draft', 'ditolak'].includes(laporan.status) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalAksi({ type: 'kirim' })
                                        }
                                        className="group relative inline-flex h-9 cursor-pointer items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0"
                                    >
                                        <Shine />
                                        <Send size={14} className="relative" />
                                        <span className="relative">
                                            {laporan.status === 'ditolak'
                                                ? 'Kirim Ulang'
                                                : 'Kirim ke Pimpinan'}
                                        </span>
                                    </button>
                                )}

                                {bisaPersetujuan &&
                                    ['menunggu', 'diperiksa'].includes(laporan.status) && (
                                        <>
                                            {laporan.status === 'menunggu' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        post(
                                                            `/laporan-mingguan/${laporan.id}/periksa`
                                                        )
                                                    }
                                                    className="h-9 cursor-pointer rounded-lg bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 active:translate-y-0"
                                                >
                                                    Periksa
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    post(
                                                        `/laporan-mingguan/${laporan.id}/setujui`
                                                    )
                                                }
                                                className="h-9 cursor-pointer rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0"
                                            >
                                                Setujui
                                            </button>

                                            <button
                                                type="button"
                                                onClick={tolak}
                                                className="h-9 cursor-pointer rounded-lg bg-red-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-red-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0"
                                            >
                                                Tolak
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>

                        {laporan.status === 'ditolak' && (
                            <p className="lp-drop mt-4 rounded-xl border border-red-100 border-l-4 border-l-red-400 bg-red-50 px-4 py-2.5 text-xs leading-relaxed text-red-700">
                                <span className="font-bold">
                                    Ditolak pimpinan:
                                </span>{' '}
                                {laporan.alasan_penolakan || '-'}
                            </p>
                        )}

                        {terkunci && (
                            <p className="lp-drop mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">
                                <CheckCircle2 size={15} />
                                Laporan sudah disetujui dan tidak bisa diubah.
                            </p>
                        )}
                    </div>

                    {/* RINGKASAN */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((item, i) => {
                            const StatIcon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    style={delay(120 + i * 70)}
                                    className={`lp-rise group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card}`}
                                >
                                    <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.tone}`} />

                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">
                                                {item.label}
                                            </p>
                                            <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                                                {item.value}
                                            </p>
                                        </div>

                                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${item.soft}`}>
                                            <StatIcon size={20} />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* PENCAPAIAN */}
                        <div
                            style={delay(120 + stats.length * 70)}
                            className={`lp-rise group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card}`}
                        >
                            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-600" />

                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Pencapaian
                                    </p>
                                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                                        {totalPersen}%
                                    </p>
                                </div>

                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                                    <TrendingUp size={20} />
                                </span>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="lp-bar h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                    style={{ width: `${totalPersen}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 1 */}
                    <Bagian nomor="1" judul="Pencapaian Preventif" ms={200}>
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr>
                                    {[
                                        'No',
                                        'Mesin',
                                        'Jumlah Item',
                                        'Item Sudah Preventif',
                                        'Item Belum Preventif',
                                        'Presentase',
                                        'Komentar',
                                    ].map((h) => (
                                        <th key={h} className={thClass}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {bagian1.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className={`${tdClass} py-10 text-center text-slate-400`}
                                        >
                                            Tidak ada Plan preventif di week ini.
                                        </td>
                                    </tr>
                                )}

                                {bagian1.map((r, i) => (
                                    <tr key={r.no} className="transition-colors hover:bg-blue-50/40">
                                        <td className={`${tdClass} text-center text-slate-400`}>
                                            {i + 1}
                                        </td>

                                        <td className={`${tdClass} font-medium text-slate-800`}>
                                            {r.mesin}
                                        </td>

                                        <td className={`${tdClass} text-center`}>
                                            {r.jumlah}
                                        </td>

                                        <td className={`${tdClass} text-center font-semibold text-emerald-600`}>
                                            {r.sudah}
                                        </td>

                                        <td className={`${tdClass} text-center font-semibold text-amber-600`}>
                                            {r.belum}
                                        </td>

                                        <td className={`${tdClass} min-w-[130px]`}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="lp-bar h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                                        style={{ width: `${Math.min(100, Number(r.persen) || 0)}%` }}
                                                    />
                                                </div>

                                                <span className="w-10 text-right text-xs font-semibold text-slate-700">
                                                    {r.persen}%
                                                </span>
                                            </div>
                                        </td>

                                        <td className={`${tdClass} min-w-[220px]`}>
                                            {r.item_id && (
                                                <TeksSel
                                                    value={r.komentar}
                                                    rows={2}
                                                    disabled={terkunci}
                                                    onSave={(v) =>
                                                        simpanItem(
                                                            r.item_id,
                                                            'komentar',
                                                            v
                                                        )
                                                    }
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="bg-slate-50/80 font-bold">
                                    <td className={tdClass} />

                                    <td className={`${tdClass} text-slate-800`}>
                                        TOTAL ITEM
                                    </td>

                                    <td className={`${tdClass} text-center`}>
                                        {totalJumlah}
                                    </td>

                                    <td className={`${tdClass} text-center text-emerald-600`}>
                                        {totalSudah}
                                    </td>

                                    <td className={`${tdClass} text-center text-amber-600`}>
                                        {totalBelum}
                                    </td>

                                    <td className={`${tdClass} text-center`}>
                                        {totalPersen}%
                                    </td>

                                    <td className={tdClass} />
                                </tr>
                            </tbody>
                        </table>
                    </Bagian>

                    {/* BAGIAN 2 */}
                    <Bagian nomor="2" judul="Laporan Preventif" ms={260}>
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr>
                                    {[
                                        'No',
                                        'Mesin',
                                        'Aktivitas / Problem',
                                        'Penanggulangan',
                                        'Foto Before',
                                        'Foto After',
                                    ].map((h) => (
                                        <th key={h} className={thClass}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {bagian2.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`${tdClass} py-10 text-center text-slate-400`}
                                        >
                                            Belum ada item preventif di week ini.
                                        </td>
                                    </tr>
                                )}

                                {bagian2.map((it, i) => (
                                    <tr key={it.id} className="transition-colors hover:bg-blue-50/30">
                                        <td className={`${tdClass} text-center text-slate-400`}>
                                            {i + 1}
                                        </td>

                                        <td className={`${tdClass} min-w-[200px] font-medium text-slate-800`}>
                                            {it.mesin}
                                        </td>

                                        <td className={`${tdClass} min-w-[240px]`}>
                                            <TeksSel
                                                value={it.aktivitas}
                                                disabled={terkunci}
                                                onSave={(v) =>
                                                    simpanItem(
                                                        it.id,
                                                        'aktivitas',
                                                        v
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className={`${tdClass} min-w-[240px]`}>
                                            <TeksSel
                                                value={it.penanggulangan}
                                                disabled={terkunci}
                                                onSave={(v) =>
                                                    simpanItem(
                                                        it.id,
                                                        'penanggulangan',
                                                        v
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className={tdClass}>
                                            <FotoSel
                                                url={it.foto_before_url}
                                                itemId={it.id}
                                                jenis="before"
                                                disabled={terkunci}
                                                label="Before"
                                            />
                                        </td>

                                        <td className={tdClass}>
                                            <FotoSel
                                                url={it.foto_after_url}
                                                itemId={it.id}
                                                jenis="after"
                                                disabled={terkunci}
                                                label="After"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Bagian>

                    {/* BAGIAN 3 */}
                    <Bagian
                        nomor="3"
                        judul="Laporan Temuan Preventif & Tambahan Pekerjaan"
                        ms={320}
                        aksi={
                            !terkunci && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        post(
                                            `/laporan-mingguan/${laporan.id}/temuan`
                                        )
                                    }
                                    className="group relative inline-flex h-8 cursor-pointer items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                                >
                                    <Shine />
                                    <Plus size={14} className="relative transition-transform duration-300 group-hover:rotate-90" />
                                    <span className="relative">Tambah baris</span>
                                </button>
                            )
                        }
                    >
                        <table className="w-full border-separate border-spacing-0">
                            <thead>
                                <tr>
                                    {[
                                        'No',
                                        'Mesin',
                                        'Aktivitas / Problem',
                                        'Penanggulangan',
                                        'Foto',
                                        '',
                                    ].map((h, i) => (
                                        <th key={i} className={thClass}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {bagian3.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`${tdClass} py-10 text-center text-slate-400`}
                                        >
                                            Belum ada temuan.
                                        </td>
                                    </tr>
                                )}

                                {bagian3.map((it, i) => (
                                    <tr key={it.id} className="transition-colors hover:bg-blue-50/30">
                                        <td className={`${tdClass} text-center text-slate-400`}>
                                            {i + 1}
                                        </td>

                                        <td className={`${tdClass} min-w-[200px]`}>
                                            <TeksSel
                                                value={it.mesin}
                                                rows={2}
                                                disabled={terkunci}
                                                onSave={(v) =>
                                                    simpanItem(
                                                        it.id,
                                                        'mesin',
                                                        v
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className={`${tdClass} min-w-[240px]`}>
                                            <TeksSel
                                                value={it.aktivitas}
                                                disabled={terkunci}
                                                onSave={(v) =>
                                                    simpanItem(
                                                        it.id,
                                                        'aktivitas',
                                                        v
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className={`${tdClass} min-w-[240px]`}>
                                            <TeksSel
                                                value={it.penanggulangan}
                                                disabled={terkunci}
                                                onSave={(v) =>
                                                    simpanItem(
                                                        it.id,
                                                        'penanggulangan',
                                                        v
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className={tdClass}>
                                            <FotoSel
                                                url={it.foto_before_url}
                                                itemId={it.id}
                                                jenis="before"
                                                disabled={terkunci}
                                            />
                                        </td>

                                        <td className={`${tdClass} text-center`}>
                                            {!terkunci && (
                                                <button
                                                    type="button"
                                                    title="Hapus baris"
                                                    onClick={() =>
                                                        setModalAksi({
                                                            type: 'hapusBaris',
                                                            itemId: it.id,
                                                        })
                                                    }
                                                    className="mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-500/30 active:translate-y-0"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Bagian>

                    {/* RIWAYAT REVISI */}
                    {revisis.length > 0 && (
                        <section className={`lp-rise p-5 ${card}`} style={delay(380)}>
                            <h3 className="mb-3 text-sm font-bold text-slate-900">
                                Riwayat revisi setelah dikirim
                            </h3>

                            <ul className="space-y-2.5 border-l-2 border-slate-100 pl-4">
                                {revisis.map((r) => (
                                    <li key={r.id} className="relative text-xs text-slate-600">
                                        <span className="absolute -left-[22px] top-1 h-2 w-2 rounded-full bg-blue-400 ring-4 ring-white" />

                                        <span className="font-semibold text-slate-400">
                                            {r.waktu}
                                        </span>{' '}
                                        · {r.keterangan}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </main>
            </div>

            {/* =====================================================
                MODAL AKSI HALAMAN
            ===================================================== */}

            {modalAksi && config && (
                <ModalCard
                    icon={config.icon}
                    tone={config.tone}
                    title={config.judul}
                    maxW="max-w-md"
                    onClose={tutupModalAksi}
                    closeDisabled={prosesAksi}
                >
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        {config.deskripsi}
                    </p>

                    {modalAksi.type === 'tolak' && (
                        <textarea
                            value={alasanTolak}
                            onChange={(e) =>
                                setAlasanTolak(e.target.value)
                            }
                            rows={3}
                            autoFocus
                            placeholder="Tuliskan alasan penolakan..."
                            className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                        />
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            disabled={prosesAksi}
                            onClick={tutupModalAksi}
                            className={btnCancel}
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            disabled={
                                prosesAksi ||
                                (modalAksi.type === 'tolak' &&
                                    !alasanTolak.trim())
                            }
                            onClick={jalankanAksi}
                            className={`${btnConfirmBase} ${btnTone[config.tone]}`}
                        >
                            <Shine />

                            {prosesAksi ? (
                                <span className="relative flex items-center gap-2">
                                    <Spinner />
                                    Memproses...
                                </span>
                            ) : (
                                <span className="relative">{config.aksi}</span>
                            )}
                        </button>
                    </div>
                </ModalCard>
            )}
        </>
    );
}
