import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// =========================================================
// ICONS  (UI saja, tidak ada logic)
// =========================================================

const ICONS = {
    back: { sw: 2, paths: ['m15 18-6-6 6-6'] },
    down: { sw: 2, paths: ['m6 9 6 6 6-6'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    minus: { sw: 2, paths: ['M5 12h14'] },
    alert: {
        sw: 2,
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 3.5 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z',
        ],
    },
    help: {
        sw: 2,
        paths: [
            'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
            'M9.1 9.2a3 3 0 0 1 5.8 1c0 2-2.9 2.5-2.9 4.3',
            'M12 17.5h.01',
        ],
    },
    save: {
        sw: 2,
        paths: [
            'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z',
            'M17 21v-8H7v8',
            'M7 3v5h8',
        ],
    },
    edit: {
        paths: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z'],
    },
    list: { paths: ['M6 4.5h12M6 8.5h12M6 12.5h8M6 16.5h10'] },
    calendar: {
        paths: [
            'M5.5 4.5h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z',
            'M8 2.75v3.5M16 2.75v3.5M3.5 9.5h17',
        ],
    },
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
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
};

// =========================================================
// STYLE TOKENS
// =========================================================

// cursor-pointer: kursor jadi jari saat diarahkan ke input / select / textarea
const inputBase =
    'w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:shadow-md focus:shadow-blue-500/10 focus:ring-4 focus:ring-blue-500/10';

const SATUAN = [
    { value: 'hari', label: 'Hari' },
    { value: 'minggu', label: 'Minggu' },
    { value: 'bulan', label: 'Bulan' },
    { value: 'tahun', label: 'Tahun' },
];

const delay = (ms) => ({ animationDelay: `${ms}ms` });

// =========================================================
// SMALL COMPONENTS
// =========================================================

const Field = ({ label, required = false, badge, error, hint, children, className = '' }) => (
    <div className={className}>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            {label}

            {required && <span className="text-red-500">*</span>}

            {badge && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    {badge}
                </span>
            )}
        </label>

        {children}

        {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}

        {[error].flat().filter(Boolean).map((message, index) => (
            <p key={index} className="fm-fade mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                <Icon type="alert" className="h-3.5 w-3.5 shrink-0" />
                {message}
            </p>
        ))}
    </div>
);

// Bagian form dengan ikon + judul
const Section = ({ icon, title, desc, ms = 0, children }) => (
    <section className="fm-rise" style={delay(ms)}>
        <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                <Icon type={icon} className="h-[18px] w-[18px]" />
            </span>

            <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-800">{title}</h2>
                <p className="text-xs text-slate-400">{desc}</p>
            </div>
        </div>

        <div className="space-y-5">{children}</div>
    </section>
);

// Pilihan divisi berupa kartu.
// Jika onAdd & onRemove diberikan, muncul tombol "Kelola divisi"
// untuk menambah / menghapus divisi.
const DivisiPicker = ({ divisis, value, onPick, onAdd, onRemove }) => {
    const [manage, setManage] = useState(false);
    const [nama, setNama] = useState('');
    const [adding, setAdding] = useState(false);

    const manageable = Boolean(onAdd && onRemove);

    const submitAdd = () => {
        const clean = nama.trim().replace(/\s+/g, ' ');

        if (!clean || adding) {
            return;
        }

        setAdding(true);

        onAdd(clean, {
            onSuccess: () => setNama(''),
            onFinish: () => setAdding(false),
        });
    };

    return (
        <div className="space-y-3">
            {manageable && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setManage((v) => !v)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            manage
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                    >
                        <Icon type={manage ? 'check' : 'edit'} className="h-3.5 w-3.5" />
                        {manage ? 'Selesai' : 'Kelola divisi'}
                    </button>
                </div>
            )}

            {divisis.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center text-xs text-slate-400">
                    Belum ada divisi.{' '}
                    {manageable ? 'Klik "Kelola divisi" untuk menambahkan.' : ''}
                </p>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Divisi">
                {divisis.map((item) => {
                    const active = value === item.nama;
                    const terpakai = (item.dipakai ?? 0) > 0;

                    return (
                        <div key={item.id} className="relative">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => onPick(item.nama)}
                                className={`group relative flex w-full cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                                    active
                                        ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600'
                                } ${manage ? 'pr-8' : ''}`}
                            >
                                {active && <Icon type="check" className="fm-pop h-3.5 w-3.5" />}
                                <span className="truncate">{item.nama}</span>
                            </button>

                            {manage && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(item)}
                                    disabled={terpakai}
                                    title={
                                        terpakai
                                            ? `Masih dipakai ${item.dipakai} item preventif`
                                            : `Hapus divisi ${item.nama}`
                                    }
                                    aria-label={`Hapus divisi ${item.nama}`}
                                    className="fm-pop absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                                >
                                    <Icon type="close" className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {manage && (
                <div className="fm-fade flex gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-2">
                    <input
                        type="text"
                        value={nama}
                        maxLength={50}
                        onChange={(e) => setNama(e.target.value)}
                        onKeyDown={(e) => {
                            // Enter jangan men-submit form utama
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitAdd();
                            }
                        }}
                        placeholder="Nama divisi baru, contoh: Press"
                        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                        type="button"
                        onClick={submitAdd}
                        disabled={adding || !nama.trim()}
                        className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Icon type="plus" className="h-4 w-4" />
                        {adding ? 'Menambah...' : 'Tambah'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Pilihan satuan periode (klik lagi untuk mengosongkan)
const SatuanPicker = ({ value, onPick }) => (
    <div className="grid h-[46px] grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
        {SATUAN.map((item) => {
            const active = value === item.value;

            return (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => onPick(active ? '' : item.value)}
                    className={`cursor-pointer rounded-lg text-xs font-semibold transition-all duration-200 ${
                        active
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {item.label}
                </button>
            );
        })}
    </div>
);

// Input angka dengan tombol - / +
const Stepper = ({ value, onChange, placeholder }) => {
    const angka = Number(value) || 0;

    return (
        <div className="flex h-[46px] items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:shadow-md focus-within:shadow-blue-500/10 focus-within:ring-4 focus-within:ring-blue-500/10 hover:border-slate-300">
            <button
                type="button"
                onClick={() => onChange(Math.max(1, angka - 1))}
                aria-label="Kurangi"
                className="flex w-12 shrink-0 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 active:bg-slate-100"
            >
                <Icon type="minus" className="h-4 w-4" />
            </button>

            <input
                type="number"
                min="1"
                step="1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-w-0 cursor-pointer border-x border-slate-100 bg-transparent text-center text-sm font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <button
                type="button"
                onClick={() => onChange(angka + 1)}
                aria-label="Tambah"
                className="flex w-12 shrink-0 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 active:bg-slate-100"
            >
                <Icon type="plus" className="h-4 w-4" />
            </button>
        </div>
    );
};

// Alert di dalam form (muncul dengan efek getar)
const FormAlert = ({ message, title = 'Data belum lengkap', onClose }) => {
    if (!message) {
        return null;
    }

    return (
        <div
            key={message}
            role="alert"
            className="fm-shake flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <Icon type="alert" className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-700">{title}</p>
                <p className="mt-0.5 text-sm leading-5 text-red-600">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-300 transition hover:bg-red-100 hover:text-red-500"
            >
                <Icon type="close" className="h-4 w-4" />
            </button>
        </div>
    );
};

// Dialog konfirmasi
const CONFIRM_TONES = {
    blue: {
        ring: 'bg-blue-400/40',
        icon: 'bg-blue-50 text-blue-600',
        button: 'from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/40',
        type: 'help',
    },
    amber: {
        ring: 'bg-amber-400/40',
        icon: 'bg-amber-50 text-amber-600',
        button: 'from-amber-500 to-orange-600 shadow-amber-500/30 hover:shadow-amber-500/40',
        type: 'alert',
    },
    red: {
        ring: 'bg-red-400/40',
        icon: 'bg-red-50 text-red-600',
        button: 'from-red-500 to-rose-600 shadow-red-500/30 hover:shadow-red-500/40',
        type: 'alert',
    },
};

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Ya',
    loadingLabel = 'Menyimpan...',
    tone = 'blue',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e) => {
            if (e.key === 'Escape' && !loading) {
                onCancel?.();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open, loading, onCancel]);

    if (!open) {
        return null;
    }

    const t = CONFIRM_TONES[tone] ?? CONFIRM_TONES.blue;

    return (
        <div
            className="fm-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onClick={() => !loading && onCancel?.()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="fm-confirm-title"
                onClick={(e) => e.stopPropagation()}
                className="fm-pop w-full max-w-sm overflow-hidden rounded-3xl border border-white/60 bg-white p-6 text-center shadow-2xl shadow-slate-950/30"
            >
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                    <span className={`fm-ping absolute inset-0 rounded-full ${t.ring}`} />
                    <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${t.icon}`}>
                        <Icon type={t.type} className="h-8 w-8" />
                    </span>
                </div>

                <h3 id="fm-confirm-title" className="text-lg font-bold tracking-tight text-slate-900">
                    {title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`group relative flex h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r px-4 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${t.button}`}
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />

                        {loading ? (
                            <span className="relative flex items-center gap-2">
                                <span className="fm-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                {loadingLabel}
                            </span>
                        ) : (
                            <span className="relative">{confirmLabel}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Kerangka halaman: latar, header, footer, animasi
const Shell = ({ title, subtitle, children }) => (
    <>
        <style>{`
            @keyframes fmRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fmFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fmPop { from { opacity: 0; transform: translateY(14px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes fmShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
            @keyframes fmPing { 0% { transform: scale(.9); opacity: .7; } 100% { transform: scale(1.6); opacity: 0; } }
            @keyframes fmShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
            @keyframes fmFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
            @keyframes fmFloatRev { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
            @keyframes fmSpin { to { transform: rotate(360deg); } }

            .fm-rise { opacity: 0; animation: fmRise .65s cubic-bezier(.22,1,.36,1) forwards; }
            .fm-fade { animation: fmFade .25s ease-out both; }
            .fm-pop { animation: fmPop .4s cubic-bezier(.22,1,.36,1) both; }
            .fm-shake { animation: fmShake .45s ease-in-out both; }
            .fm-ping { animation: fmPing 1.8s ease-out infinite; }
            .fm-shimmer { background-size: 200% 100%; animation: fmShimmer 6s linear infinite; }
            .fm-float { animation: fmFloat 14s ease-in-out infinite; }
            .fm-float-rev { animation: fmFloatRev 17s ease-in-out infinite; }
            .fm-spin { animation: fmSpin .8s linear infinite; }

            @media (prefers-reduced-motion: reduce) {
                .fm-rise { opacity: 1; animation: none; }
                .fm-fade, .fm-pop, .fm-shake, .fm-ping, .fm-shimmer, .fm-float, .fm-float-rev { animation: none !important; }
            }
        `}</style>

        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800">
            {/* BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="fm-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
                <div className="fm-float-rev absolute right-[-100px] top-[18%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
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

            {/* HEADER */}
            <header className="sticky top-0 z-30 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3.5 sm:px-6">
                    <Link
                        href="/preventif-mesin"
                        title="Kembali"
                        aria-label="Kembali"
                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                    >
                        <Icon type="back" className="h-5 w-5" />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                            {title}
                        </h1>
                        <p className="truncate text-xs text-blue-200/80">{subtitle}</p>
                    </div>
                </div>

                <div className="fm-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
            </header>

            {/* MAIN */}
            <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6">{children}</main>

            {/* FOOTER */}
            <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-center px-5 py-3">
                    <p className="text-xs font-medium text-slate-400">
                        © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif Mesin
                    </p>
                </div>
            </footer>
        </div>
    </>
);

const SubmitButton = ({ processing, icon, children }) => (
    <button
        type="submit"
        disabled={processing}
        className="group relative inline-flex h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />

        {processing ? (
            <span className="relative flex items-center gap-2">
                <span className="fm-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                Menyimpan...
            </span>
        ) : (
            <span className="relative flex items-center gap-2">
                <Icon type={icon} className="h-4 w-4" />
                {children}
            </span>
        )}
    </button>
);

const CancelLink = () => (
    <Link
        href="/preventif-mesin"
        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
    >
        Batal
    </Link>
);

const FormCard = ({ onSubmit, children }) => (
    <form
        onSubmit={onSubmit}
        className="fm-pop relative space-y-7 overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_60px_-15px_rgba(15,23,42,0.18)] sm:p-8"
    >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        {children}
    </form>
);

// =========================================================
// PAGE
// =========================================================

export default function Edit({ preventifMesin, divisis = [] }) {
    const [alert, setAlert] = useState('');
    const [confirmSave, setConfirmSave] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        divisi: preventifMesin.divisi ?? '',

        no_item:
            preventifMesin.no_item !== null &&
            preventifMesin.no_item !== undefined
                ? Number(preventifMesin.no_item)
                : '',

        item_preventif: preventifMesin.item_preventif ?? '',

        periode_nilai:
            preventifMesin.periode_nilai !== null &&
            preventifMesin.periode_nilai !== undefined
                ? Number(preventifMesin.periode_nilai)
                : '',

        periode_satuan: preventifMesin.periode_satuan ?? '',

        tanggal_plan_awal: preventifMesin.tanggal_plan_awal
            ? String(preventifMesin.tanggal_plan_awal).substring(0, 10)
            : '',

        // Jika data lama kosong, gunakan 1
        jumlah_dilakukan:
            preventifMesin.jumlah_dilakukan !== null &&
            preventifMesin.jumlah_dilakukan !== undefined &&
            preventifMesin.jumlah_dilakukan !== ''
                ? Number(preventifMesin.jumlah_dilakukan)
                : 1,
    });

    // Jika divisi item ini sudah tidak ada di daftar (misalnya sudah dihapus),
    // tetap tampilkan supaya tidak hilang dari pilihan.
    const daftarDivisi =
        data.divisi && !divisis.some((d) => d.nama === data.divisi)
            ? [...divisis, { id: `lama-${data.divisi}`, nama: data.divisi }]
            : divisis;

    // =========================
    // SUBMIT -> validasi, lalu tampilkan konfirmasi
    // =========================
    const submit = (e) => {
        e.preventDefault();

        if (!data.divisi) {
            setAlert('Divisi wajib diisi.');
            return;
        }

        if (!data.item_preventif.trim()) {
            setAlert('Item Preventif wajib diisi.');
            return;
        }

        if (
            data.jumlah_dilakukan === '' ||
            data.jumlah_dilakukan === null ||
            data.jumlah_dilakukan === undefined ||
            Number(data.jumlah_dilakukan) < 1
        ) {
            setAlert('Jumlah Dilakukan minimal 1.');
            return;
        }

        setAlert('');
        setConfirmSave(true);
    };

    // =========================
    // SIMPAN (setelah user klik "Ya, Simpan")
    // =========================
    const doSave = () => {
        put(`/preventif-mesin/${preventifMesin.no}`, {
            preserveScroll: true,
            onFinish: () => setConfirmSave(false),
        });
    };

    return (
        <>
            <Head title="Edit Preventif Mesin" />

            <Shell
                title="Edit Preventif Mesin"
                subtitle="Preventif Mesin / Edit Data"
            >
                <FormCard onSubmit={submit}>
                    <FormAlert message={alert} onClose={() => setAlert('')} />

                    {/* DATA ITEM */}
                    <Section
                        icon="list"
                        title="Data item"
                        desc="Ubah divisi atau isi item preventif."
                        ms={80}
                    >
                        <Field label="Divisi" required error={errors.divisi}>
                            <DivisiPicker
                                divisis={daftarDivisi}
                                value={data.divisi}
                                onPick={(nama) => setData('divisi', nama)}
                            />
                        </Field>

                        <Field label="No" badge="Otomatis" error={errors.no_item}>
                            <input
                                type="text"
                                value={data.no_item}
                                readOnly
                                className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold text-blue-700 outline-none"
                            />
                        </Field>

                        <Field
                            label="Item Preventif"
                            required
                            error={errors.item_preventif}
                        >
                            <textarea
                                value={data.item_preventif}
                                onChange={(e) => setData('item_preventif', e.target.value)}
                                rows="4"
                                className={`${inputBase} resize-none leading-relaxed`}
                            />
                        </Field>
                    </Section>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* JADWAL */}
                    <Section
                        icon="calendar"
                        title="Jadwal"
                        desc="Atur seberapa sering dan kapan mulai dikerjakan."
                        ms={160}
                    >
                        <Field
                            label="Periode"
                            error={[errors.periode_nilai, errors.periode_satuan]}
                        >
                            <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={data.periode_nilai}
                                    onChange={(e) => setData('periode_nilai', e.target.value)}
                                    placeholder="Nilai"
                                    className={`${inputBase} h-[46px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
                                />

                                <SatuanPicker
                                    value={data.periode_satuan}
                                    onPick={(value) => setData('periode_satuan', value)}
                                />
                            </div>
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Tanggal Plan Awal"
                                error={errors.tanggal_plan_awal}
                            >
                                <input
                                    type="date"
                                    value={data.tanggal_plan_awal}
                                    onChange={(e) => setData('tanggal_plan_awal', e.target.value)}
                                    className={`${inputBase} h-[46px]`}
                                />
                            </Field>

                            <Field
                                label="Jumlah Dilakukan"
                                error={errors.jumlah_dilakukan}
                                hint="Jumlah hari berturut-turut dalam satu periode."
                            >
                                <Stepper
                                    value={data.jumlah_dilakukan}
                                    onChange={(value) => setData('jumlah_dilakukan', value)}
                                    placeholder="Contoh: 2"
                                />
                            </Field>
                        </div>
                    </Section>

                    {/* TOMBOL */}
                    <div
                        className="fm-rise flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"
                        style={delay(240)}
                    >
                        <CancelLink />

                        <SubmitButton processing={processing} icon="edit">
                            Simpan Perubahan
                        </SubmitButton>
                    </div>
                </FormCard>
            </Shell>

            {/* KONFIRMASI SIMPAN PERUBAHAN */}
            <ConfirmDialog
                open={confirmSave}
                title="Simpan perubahan?"
                message="Apakah kamu yakin ingin menyimpan perubahan data ini?"
                confirmLabel="Ya, Simpan"
                tone="amber"
                loading={processing}
                onConfirm={doSave}
                onCancel={() => setConfirmSave(false)}
            />
        </>
    );
}