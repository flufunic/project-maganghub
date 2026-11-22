import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Menu,
    FileText,
    Undo2,
    AlertTriangle,
    Layers,
    Clock3,
    CheckCircle2,
    XCircle,
    CalendarDays,
    ChevronRight,
    Pencil,
    Inbox,
    X,
    Bell,
    BellOff,
} from 'lucide-react';
import Sidebar from '@/Components/Sidebar';

/* ------------------------------------------------------------------
| STATUS
------------------------------------------------------------------ */
const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'bg-amber-50 text-amber-700 ring-amber-200',
        dot: 'bg-amber-500',
        ping: 'bg-amber-400',
        pulse: true,
    },
    diperiksa: {
        label: 'Sedang Diperiksa',
        cls: 'bg-sky-50 text-sky-700 ring-sky-200',
        dot: 'bg-sky-500',
        ping: 'bg-sky-400',
        pulse: true,
    },
    disetujui: {
        label: 'Disetujui',
        cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        dot: 'bg-emerald-500',
        ping: 'bg-emerald-400',
        pulse: false,
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'bg-rose-50 text-rose-700 ring-rose-200',
        dot: 'bg-rose-500',
        ping: 'bg-rose-400',
        pulse: false,
    },
};

// "menunggu" mencakup yang masih menunggu dan yang sedang diperiksa
const cocokFilter = (item, filter) => {
    if (filter === 'semua') return true;
    if (filter === 'menunggu') return ['menunggu', 'diperiksa'].includes(item.status);

    return item.status === filter;
};

const warnaPersen = (p) => (p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-rose-500');

const thClass = 'px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500';

/* ------------------------------------------------------------------
| HOOK: angka naik pelan-pelan
------------------------------------------------------------------ */
function useCountUp(target, duration = 800) {
    const [value, setValue] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (reduce || prev.current === target) {
            setValue(target);
            prev.current = target;
            return undefined;
        }

        const from = prev.current;
        let raf;
        let start;

        const tick = (t) => {
            if (start === undefined) start = t;

            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);

            setValue(Math.round(from + (target - from) * eased));

            if (p < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                prev.current = target;
            }
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return value;
}

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */
function Dot({ cls, ping, pulse }) {
    return (
        <span className="relative flex h-2 w-2">
            {pulse && <span className={`pmp-ping absolute inline-flex h-full w-full rounded-full ${ping}`} />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${cls}`} />
        </span>
    );
}

function StatCard({ card, aktif, onClick, index }) {
    const angka = useCountUp(card.value);
    const [siap, setSiap] = useState(false);
    const Ico = card.icon;

    useEffect(() => {
        const id = requestAnimationFrame(() => setSiap(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <button
            type="button"
            title={card.hint}
            onClick={onClick}
            aria-pressed={aktif}
            style={{ animationDelay: `${index * 70}ms` }}
            className={`pmp-rise group relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                aktif ? `border-transparent ring-2 ${card.tone.ring}` : 'border-slate-200/80'
            }`}
        >
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.tone.icon}`}
                >
                    <Ico className="h-5 w-5" strokeWidth={1.9} />
                </div>

                {aktif && (
                    <span className="pmp-fade rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Aktif
                    </span>
                )}
            </div>

            <p className={`mt-3 text-3xl font-bold tabular-nums tracking-tight ${card.tone.value}`}>{angka}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">{card.label}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{card.hint}</p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out ${card.tone.bar}`}
                    style={{ width: siap ? card.width : '0%' }}
                />
            </div>
        </button>
    );
}

function BellNotifikasi({ items = [], onLihatSemua }) {
    const [buka, setBuka] = useState(false);
    const jumlah = items.length;
    const ada = jumlah > 0;

    // Esc menutup panel
    useEffect(() => {
        if (!buka) return undefined;

        const onKey = (e) => e.key === 'Escape' && setBuka(false);
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [buka]);

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => setBuka((prev) => !prev)}
                aria-label={`Notifikasi, ${jumlah} report menunggu`}
                aria-expanded={buka}
                title="Notifikasi"
                className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border bg-white/10 text-white transition-all duration-300 hover:bg-white/20 active:scale-95 ${
                    ada ? 'border-blue-300/50 shadow-[0_0_18px_rgba(59,130,246,0.4)]' : 'border-white/15'
                }`}
            >
                {ada && (
                    <span className="pmp-notif-pulse pointer-events-none absolute inset-1 rounded-xl border border-blue-300/80 bg-blue-400/20" />
                )}

                <span className={`relative z-10 flex items-center justify-center ${ada ? 'pmp-bell-shake' : ''}`}>
                    <Bell className={`h-5 w-5 ${ada ? 'text-blue-200' : 'text-white'}`} strokeWidth={1.8} />
                </span>

                {ada && (
                    <span
                        key={jumlah}
                        className="pmp-badge-pop absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0b1d57] bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-lg shadow-red-500/40"
                    >
                        {jumlah > 99 ? '99+' : jumlah}
                    </span>
                )}
            </button>

            {buka && (
                <>
                    <button
                        type="button"
                        aria-label="Tutup notifikasi"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setBuka(false)}
                    />

                    <div className="pmp-drop absolute right-0 z-50 mt-3 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-3.5">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Notifikasi</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {ada ? `${jumlah} report menunggu pemeriksaan` : 'Tidak ada report baru'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setBuka(false)}
                                aria-label="Tutup"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="pmp-scroll max-h-[380px] overflow-y-auto">
                            {!ada ? (
                                <div className="px-4 py-12 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <BellOff className="h-6 w-6" strokeWidth={1.7} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">Belum ada notifikasi</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Report baru dari Admin akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/pimpinan/laporan/${item.id}`}
                                        className="relative flex w-full cursor-pointer gap-3 border-b border-slate-100 bg-blue-50/60 px-4 py-3.5 text-left transition-colors hover:bg-blue-50"
                                    >
                                        <span className="absolute inset-y-0 left-0 w-[3px] bg-blue-500" />

                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                            <FileText className="h-4 w-4" strokeWidth={1.8} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs font-bold text-slate-800">
                                                    Report mingguan baru masuk
                                                </p>
                                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                            </div>

                                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                                {item.dikirim_oleh || 'Admin'} mengirim report Week {item.week} (
                                                {item.periode}) untuk diperiksa.
                                            </p>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className="rounded-md bg-blue-100/70 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                                    W{item.week}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {item.dikirim_pada || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {ada && (
                            <button
                                type="button"
                                onClick={() => {
                                    setBuka(false);
                                    onLihatSemua?.();
                                }}
                                className="w-full cursor-pointer bg-slate-50 px-4 py-2.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                            >
                                Lihat semua di tabel
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Index({ user, laporans = [], flash }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // semua | menunggu | disetujui | ditolak
    const [filter, setFilter] = useState('semua');

    // Modal batalkan persetujuan
    const [itemBatal, setItemBatal] = useState(null);
    const [memproses, setMemproses] = useState(false);

    const namaUser = typeof user === 'string' ? user : user?.name;

    const total = laporans.length;
    const totalMenunggu = laporans.filter((i) => cocokFilter(i, 'menunggu')).length;
    const totalDisetujui = laporans.filter((i) => i.status === 'disetujui').length;
    const totalDitolak = laporans.filter((i) => i.status === 'ditolak').length;
    const laporanBaru = laporans.filter((i) => i.status === 'menunggu');

    const daftar = laporans.filter((item) => cocokFilter(item, filter));

    // Klik kartu yang sedang aktif -> kembali ke semua
    const pilihFilter = (nilai) => {
        setFilter((sekarang) => (sekarang === nilai || nilai === 'semua' ? 'semua' : nilai));
    };

    const tutupModal = () => {
        if (memproses) return;
        setItemBatal(null);
    };

    const konfirmasiBatal = () => {
        if (!itemBatal || memproses) return;

        router.post(
            `/pimpinan/laporan/${itemBatal.id}/batalkan`,
            {},
            {
                preserveScroll: true,
                onStart: () => setMemproses(true),
                onFinish: () => {
                    setMemproses(false);
                    setItemBatal(null);
                },
            }
        );
    };

    // Tutup modal dengan tombol Esc
    useEffect(() => {
        if (!itemBatal) return undefined;

        const onKey = (e) => {
            if (e.key === 'Escape' && !memproses) {
                setItemBatal(null);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [itemBatal, memproses]);

    // Cek report baru tiap 30 detik (hanya saat tab terlihat)
    useEffect(() => {
        const muat = () => {
            if (document.visibilityState !== 'visible' || memproses) return;
            router.reload({ only: ['laporans'], preserveScroll: true });
        };

        const id = setInterval(muat, 30000);
        document.addEventListener('visibilitychange', muat);

        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', muat);
        };
    }, [memproses]);

    const judulTabel =
        filter === 'menunggu'
            ? 'Menunggu Diperiksa'
            : filter === 'disetujui'
              ? 'Sudah Disetujui'
              : filter === 'ditolak'
                ? 'Ditolak'
                : 'Riwayat Report Mingguan';

    // ============================================
    // DATA KARTU STATISTIK
    // ============================================
    const persen = (n) => (total > 0 ? `${(n / total) * 100}%` : '0%');

    const statCards = [
        {
            key: 'semua',
            label: 'Total Report',
            value: total,
            hint: 'Seluruh report yang dikirim',
            icon: Layers,
            width: '100%',
            tone: {
                icon: 'bg-indigo-50 text-indigo-600',
                bar: 'bg-indigo-500',
                ring: 'ring-indigo-500/70',
                value: 'text-slate-900',
            },
        },
        {
            key: 'menunggu',
            label: 'Menunggu Diperiksa',
            value: totalMenunggu,
            hint: 'Perlu ditinjau pimpinan',
            icon: Clock3,
            width: persen(totalMenunggu),
            tone: {
                icon: 'bg-amber-50 text-amber-600',
                bar: 'bg-amber-500',
                ring: 'ring-amber-500/70',
                value: 'text-amber-600',
            },
        },
        {
            key: 'disetujui',
            label: 'Disetujui',
            value: totalDisetujui,
            hint: 'Telah disetujui pimpinan',
            icon: CheckCircle2,
            width: persen(totalDisetujui),
            tone: {
                icon: 'bg-emerald-50 text-emerald-600',
                bar: 'bg-emerald-500',
                ring: 'ring-emerald-500/70',
                value: 'text-emerald-600',
            },
        },
        {
            key: 'ditolak',
            label: 'Ditolak',
            value: totalDitolak,
            hint: 'Menunggu revisi admin',
            icon: XCircle,
            width: persen(totalDitolak),
            tone: {
                icon: 'bg-rose-50 text-rose-600',
                bar: 'bg-rose-500',
                ring: 'ring-rose-500/70',
                value: 'text-rose-600',
            },
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            {/* SIDEBAR (di luar pembungkus agar posisi fixed tidak terkurung) */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <style>{`
                @keyframes pmpRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes pmpFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pmpPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
                @keyframes pmpFloat { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(28px,-22px,0) scale(1.08); } }
                @keyframes pmpFloatReverse { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-28px,22px,0) scale(1.1); } }
                @keyframes pmpLine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes pmpPing { 0% { transform: scale(1); opacity: .6; } 80%, 100% { transform: scale(2.4); opacity: 0; } }
                @keyframes pmpBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                @keyframes pmpDrop { from { opacity: 0; transform: translateY(-8px) scale(.97); } to { opacity: 1; transform: none; } }
                @keyframes pmpBellShake {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30%, 50%, 70% { transform: rotate(12deg); }
                    20%, 40%, 60%, 80% { transform: rotate(-12deg); }
                    90% { transform: rotate(0deg); }
                }
                @keyframes pmpNotifPulse { 0% { transform: scale(.8); opacity: .7; } 100% { transform: scale(1.65); opacity: 0; } }
                @keyframes pmpBadgePop { 0% { transform: scale(0); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
                @keyframes pmpBadgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }

                .pmp-drop { animation: pmpDrop .22s cubic-bezier(.22,1,.36,1) both; transform-origin: top right; }
                .pmp-bell-shake { animation: pmpBellShake 1.1s ease-in-out infinite; transform-origin: 50% 15%; }
                .pmp-notif-pulse { animation: pmpNotifPulse 1.8s ease-out infinite; }
                .pmp-badge-pop { animation: pmpBadgePop .45s ease-out both, pmpBadgePulse 1.5s ease-in-out .5s infinite; }

                /* fill-mode "backwards": tidak ada transform tersisa setelah selesai */
                .pmp-rise { animation: pmpRise .6s cubic-bezier(.22,1,.36,1) backwards; }
                .pmp-fade { animation: pmpFade .25s ease-out both; }
                .pmp-pop { animation: pmpPop .35s cubic-bezier(.22,1,.36,1) both; }
                .pmp-float { animation: pmpFloat 14s ease-in-out infinite; }
                .pmp-float-reverse { animation: pmpFloatReverse 17s ease-in-out infinite; }
                .pmp-line { background-size: 200% 100%; animation: pmpLine 7s linear infinite; }
                .pmp-ping { animation: pmpPing 1.8s cubic-bezier(0,0,.2,1) infinite; }
                .pmp-bar { transform-origin: left; animation: pmpBar .8s cubic-bezier(.22,1,.36,1) backwards; }

                .pmp-scroll::-webkit-scrollbar { height: 8px; }
                .pmp-scroll::-webkit-scrollbar-track { background: transparent; }
                .pmp-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }

                @media (prefers-reduced-motion: reduce) {
                    .pmp-rise, .pmp-fade, .pmp-pop, .pmp-float, .pmp-float-reverse,
                    .pmp-line, .pmp-ping, .pmp-bar, .pmp-drop, .pmp-bell-shake,
                    .pmp-notif-pulse, .pmp-badge-pop { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-clip text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50" />
                    <div className="pmp-float absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/25 blur-[110px]" />
                    <div className="pmp-float-reverse absolute -right-32 top-[15%] h-[460px] w-[460px] rounded-full bg-indigo-300/20 blur-[120px]" />
                    <div className="pmp-float absolute bottom-[-180px] left-[30%] h-[440px] w-[440px] rounded-full bg-sky-300/20 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Buka menu"
                                title="Buka menu"
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
                            >
                                <Menu className="h-5 w-5" strokeWidth={2} />
                            </button>

                            <div className="min-w-0">
                                <h1 className="text-base font-semibold leading-tight tracking-tight text-white sm:text-lg">
                                    Schedule Preventif
                                </h1>
                                <p className="text-xs leading-tight text-blue-100/60">
                                    Approval Report Mingguan
                                </p>
                            </div>
                        </div>

                        <BellNotifikasi items={laporanBaru} onLihatSemua={() => setFilter('menunggu')} />
                    </div>

                    <div className="pmp-line h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* CONTENT */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                    {flash?.success && (
                        <div className="pmp-pop mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {/* JUDUL */}
                    <div className="pmp-rise mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Report Mingguan Preventif
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Report mingguan yang telah dikirim oleh Admin untuk diperiksa.
                            </p>
                        </div>

                        {totalMenunggu > 0 && (
                            <button
                                type="button"
                                onClick={() => setFilter('menunggu')}
                                className="inline-flex w-fit cursor-pointer items-center gap-2.5 rounded-full border border-amber-200 bg-amber-50 py-1.5 pl-3 pr-4 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                            >
                                <Dot cls="bg-amber-500" ping="bg-amber-400" pulse />
                                {totalMenunggu} report menunggu pemeriksaan
                            </button>
                        )}
                    </div>

                    {/* KARTU STATISTIK (klik untuk filter) */}
                    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        {statCards.map((card, i) => (
                            <StatCard
                                key={card.key}
                                card={card}
                                index={i}
                                aktif={filter === card.key}
                                onClick={() => pilihFilter(card.key)}
                            />
                        ))}
                    </div>

                    {/* TABEL */}
                    <div
                        style={{ animationDelay: '300ms' }}
                        className="pmp-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <CalendarDays className="h-5 w-5" strokeWidth={1.9} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">{judulTabel}</h3>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Daftar report mingguan yang dikirim oleh Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {filter !== 'semua' && (
                                    <button
                                        type="button"
                                        onClick={() => setFilter('semua')}
                                        className="pmp-fade inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                                    >
                                        <X className="h-3 w-3" />
                                        Reset filter
                                    </button>
                                )}

                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    {daftar.length} Report
                                </div>
                            </div>
                        </div>

                        {daftar.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    {total === 0 ? (
                                        <FileText className="h-8 w-8" strokeWidth={1.5} />
                                    ) : (
                                        <Inbox className="h-8 w-8" strokeWidth={1.5} />
                                    )}
                                </div>

                                <h3 className="font-semibold text-slate-700">Belum ada data</h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {filter === 'semua'
                                        ? 'Belum ada report mingguan yang dikirim oleh Admin.'
                                        : 'Tidak ada report pada kategori ini.'}
                                </p>
                            </div>
                        ) : (
                            <div className="pmp-scroll overflow-x-auto">
                                <table className="w-full min-w-[960px] text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/70">
                                            <th className={thClass}>No</th>
                                            <th className={thClass}>Periode</th>
                                            <th className={thClass}>Dikirim Oleh</th>
                                            <th className={thClass}>Waktu Pengiriman</th>
                                            <th className={thClass}>Pencapaian</th>
                                            <th className={thClass}>Status</th>
                                            <th className={`${thClass} text-center`}>Aksi</th>
                                        </tr>
                                    </thead>

                                    {/* key={filter}: animasi baris diulang tiap ganti filter */}
                                    <tbody key={filter} className="divide-y divide-slate-100">
                                        {daftar.map((item, index) => {
                                            const st = STATUS[item.status] ?? STATUS.menunggu;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
                                                    className="pmp-rise group transition-colors duration-200 hover:bg-indigo-50/40"
                                                >
                                                    {/* NO */}
                                                    <td className="px-5 py-4">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                                            {index + 1}
                                                        </span>
                                                    </td>

                                                    {/* PERIODE */}
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-900">Week {item.week}</p>
                                                        <p className="mt-0.5 text-xs text-slate-500">{item.periode}</p>
                                                    </td>

                                                    {/* DIKIRIM OLEH */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-bold text-indigo-600">
                                                                {(item.dikirim_oleh || 'A').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-slate-600">{item.dikirim_oleh || '-'}</span>
                                                        </div>
                                                    </td>

                                                    {/* WAKTU */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                        {item.dikirim_pada || '-'}
                                                    </td>

                                                    {/* PENCAPAIAN */}
                                                    <td className="min-w-[170px] px-5 py-4">
                                                        {item.ringkasan ? (
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="text-xs font-semibold text-slate-700">
                                                                    {item.ringkasan.sudah}/{item.ringkasan.jumlah} item ·{' '}
                                                                    {item.ringkasan.persen}%
                                                                </span>
                                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                                    <div
                                                                        className={`pmp-bar h-full rounded-full ${warnaPersen(
                                                                            item.ringkasan.persen
                                                                        )}`}
                                                                        style={{ width: `${item.ringkasan.persen}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>

                                                    {/* STATUS + REVISI */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col items-start gap-1.5">
                                                            <span
                                                                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${st.cls}`}
                                                            >
                                                                <Dot cls={st.dot} ping={st.ping} pulse={st.pulse} />
                                                                {st.label}
                                                            </span>

                                                            {item.jumlah_revisi > 0 && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
                                                                    <Pencil className="h-3 w-3" />
                                                                    Ada Revisi ({item.jumlah_revisi})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* AKSI */}
                                                    <td className="px-5 py-4 text-center">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <Link
                                                                href={`/pimpinan/laporan/${item.id}`}
                                                                className="group/btn inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-indigo-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-300/50"
                                                            >
                                                                Lihat Report
                                                                <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                                                            </Link>

                                                            {item.status === 'disetujui' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setItemBatal(item)}
                                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition-colors duration-200 hover:bg-rose-100"
                                                                >
                                                                    <Undo2 className="h-3 w-3" />
                                                                    Batalkan
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-3 sm:px-6">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* MODAL BATALKAN PERSETUJUAN */}
            {itemBatal && (
                <div
                    className="pmp-fade fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onClick={tutupModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="judul-modal-batal"
                >
                    <div
                        className="pmp-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pb-2 pt-7 text-center">
                            <div className="relative mx-auto mb-4 h-14 w-14">
                                <span className="pmp-ping absolute inset-0 rounded-2xl bg-rose-300/60" />
                                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-300/50">
                                    <AlertTriangle className="h-7 w-7" strokeWidth={2} />
                                </span>
                            </div>

                            <h3 id="judul-modal-batal" className="text-lg font-bold tracking-tight text-slate-900">
                                Batalkan Persetujuan?
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                Report{' '}
                                <span className="font-semibold text-slate-700">
                                    Week {itemBatal.week} · {itemBatal.periode}
                                </span>{' '}
                                akan dikembalikan ke Admin untuk direvisi, lalu harus dikirim ulang.
                            </p>

                            <p className="mt-2 text-xs text-slate-400">Isi report (teks dan foto) tidak dihapus.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 px-6 pb-6 pt-5">
                            <button
                                type="button"
                                onClick={tutupModal}
                                disabled={memproses}
                                autoFocus
                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Tidak, Kembali
                            </button>

                            <button
                                type="button"
                                onClick={konfirmasiBatal}
                                disabled={memproses}
                                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {memproses ? 'Memproses...' : 'Ya, Batalkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}