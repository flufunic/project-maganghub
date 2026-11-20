import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Menu,
    FileText,
    Clock3,
    CheckCircle2,
    XCircle,
    Eye,
    Trash2,
    CalendarDays,
    Inbox,
    X,
    AlertTriangle,
    AlertCircle,
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
        label: 'Sudah Diperiksa',
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
            {pulse && <span className={`csi-ping absolute inline-flex h-full w-full rounded-full ${ping}`} />}
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
            className={`csi-rise group relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
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
                    <span className="csi-fade rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
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

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Index({ pengirimans = [] }) {
    const { flash, errors } = usePage().props;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filter, setFilter] = useState('semua');
    const [hapusItem, setHapusItem] = useState(null);
    const [menghapus, setMenghapus] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        }
    }, [flash]);

    useEffect(() => {
        if (errors?.pengiriman) {
            setToast({ type: 'error', message: errors.pengiriman });
        }
    }, [errors]);

    useEffect(() => {
        if (!toast) return undefined;

        const timer = setTimeout(() => setToast(null), 5000);

        return () => clearTimeout(timer);
    }, [toast]);

    // Esc menutup modal hapus
    useEffect(() => {
        if (!hapusItem) return undefined;

        const onKey = (e) => {
            if (e.key === 'Escape' && !menghapus) setHapusItem(null);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [hapusItem, menghapus]);

    const daftar = filter === 'semua' ? pengirimans : pengirimans.filter((p) => p.status === filter);

    const totalPengiriman = pengirimans.length;
    const totalMenunggu = pengirimans.filter((p) => p.status === 'menunggu').length;
    const totalDiperiksa = pengirimans.filter((p) => p.status === 'diperiksa').length;
    const totalDitolak = pengirimans.filter((p) => p.status === 'ditolak').length;

    const persen = (n) => (totalPengiriman > 0 ? `${(n / totalPengiriman) * 100}%` : '0%');

    const statCards = [
        {
            key: 'semua',
            label: 'Total Pengiriman',
            value: totalPengiriman,
            hint: 'Seluruh data yang dikirim',
            icon: FileText,
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
            hint: 'Belum diperiksa pimpinan',
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
            key: 'diperiksa',
            label: 'Sudah Diperiksa',
            value: totalDiperiksa,
            hint: 'Telah diperiksa pimpinan',
            icon: CheckCircle2,
            width: persen(totalDiperiksa),
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

    // Klik kartu yang sedang aktif -> kembali ke semua
    const pilihFilter = (nilai) => {
        setFilter((sekarang) => (sekarang === nilai || nilai === 'semua' ? 'semua' : nilai));
    };

    const konfirmasiHapus = () => {
        if (!hapusItem) return;

        setMenghapus(true);

        router.delete(`/pimpinan/check-sheet/${hapusItem.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setMenghapus(false);
                setHapusItem(null);
            },
        });
    };

    return (
        <>
            <Head title="Check Sheet Mingguan" />

            {/* SIDEBAR (di luar pembungkus agar posisi fixed tidak terkurung) */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <style>{`
                @keyframes csiRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes csiFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes csiPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
                @keyframes csiToast { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
                @keyframes csiFloat { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(28px,-22px,0) scale(1.08); } }
                @keyframes csiFloatReverse { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-28px,22px,0) scale(1.1); } }
                @keyframes csiLine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes csiPing { 0% { transform: scale(1); opacity: .6; } 80%, 100% { transform: scale(2.4); opacity: 0; } }
                @keyframes csiShrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }

                /* fill-mode "backwards": tidak ada transform tersisa setelah selesai */
                .csi-rise { animation: csiRise .6s cubic-bezier(.22,1,.36,1) backwards; }
                .csi-fade { animation: csiFade .25s ease-out both; }
                .csi-pop { animation: csiPop .35s cubic-bezier(.22,1,.36,1) both; }
                .csi-toast { animation: csiToast .4s cubic-bezier(.22,1,.36,1) both; }
                .csi-float { animation: csiFloat 14s ease-in-out infinite; }
                .csi-float-reverse { animation: csiFloatReverse 17s ease-in-out infinite; }
                .csi-line { background-size: 200% 100%; animation: csiLine 7s linear infinite; }
                .csi-ping { animation: csiPing 1.8s cubic-bezier(0,0,.2,1) infinite; }
                .csi-shrink { transform-origin: left; animation: csiShrink 5s linear forwards; }

                .csi-scroll::-webkit-scrollbar { height: 8px; }
                .csi-scroll::-webkit-scrollbar-track { background: transparent; }
                .csi-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }

                @media (prefers-reduced-motion: reduce) {
                    .csi-rise, .csi-fade, .csi-pop, .csi-toast, .csi-float, .csi-float-reverse,
                    .csi-line, .csi-ping, .csi-shrink { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-clip text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50" />
                    <div className="csi-float absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/25 blur-[110px]" />
                    <div className="csi-float-reverse absolute -right-32 top-[15%] h-[460px] w-[460px] rounded-full bg-indigo-300/20 blur-[120px]" />
                    <div className="csi-float absolute bottom-[-180px] left-[30%] h-[440px] w-[440px] rounded-full bg-sky-300/20 blur-[110px]" />
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
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
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
                            <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                Check Sheet Mingguan
                            </h1>
                            <p className="hidden truncate text-xs text-blue-100/60 sm:block">
                                Approval dan Monitoring Check Sheet
                            </p>
                        </div>
                    </div>

                    <div className="csi-line h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* CONTENT */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                    {/* JUDUL */}
                    <div className="csi-rise mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Data Check Sheet</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Data yang telah dikirim oleh Admin untuk diperiksa.
                            </p>
                        </div>

                        {totalMenunggu > 0 && (
                            <button
                                type="button"
                                onClick={() => setFilter('menunggu')}
                                className="inline-flex w-fit cursor-pointer items-center gap-2.5 rounded-full border border-amber-200 bg-amber-50 py-1.5 pl-3 pr-4 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                            >
                                <Dot cls="bg-amber-500" ping="bg-amber-400" pulse />
                                {totalMenunggu} data menunggu pemeriksaan
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
                        className="csi-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <CalendarDays className="h-5 w-5" strokeWidth={1.9} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {filter === 'semua' ? 'Riwayat Pengiriman' : STATUS[filter]?.label}
                                    </h3>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Daftar check sheet mingguan yang dikirim oleh Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {filter !== 'semua' && (
                                    <button
                                        type="button"
                                        onClick={() => setFilter('semua')}
                                        className="csi-fade inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                                    >
                                        <X className="h-3 w-3" />
                                        Reset filter
                                    </button>
                                )}

                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    {daftar.length} Data
                                </div>
                            </div>
                        </div>

                        {daftar.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    {totalPengiriman === 0 ? (
                                        <FileText className="h-8 w-8" strokeWidth={1.5} />
                                    ) : (
                                        <Inbox className="h-8 w-8" strokeWidth={1.5} />
                                    )}
                                </div>

                                <h3 className="font-semibold text-slate-700">Belum ada data</h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {filter === 'semua'
                                        ? 'Belum ada check sheet mingguan yang dikirim Admin.'
                                        : 'Tidak ada data pada kategori ini.'}
                                </p>
                            </div>
                        ) : (
                            <div className="csi-scroll overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/70">
                                            <th className={thClass}>Minggu</th>
                                            <th className={thClass}>Divisi</th>
                                            <th className={thClass}>Dikirim Oleh</th>
                                            <th className={thClass}>Waktu Pengiriman</th>
                                            <th className={thClass}>Status</th>
                                            <th className={`${thClass} text-center`}>Aksi</th>
                                        </tr>
                                    </thead>

                                    {/* key={filter}: animasi baris diulang tiap ganti filter */}
                                    <tbody key={filter} className="divide-y divide-slate-100">
                                        {daftar.map((item, index) => {
                                            const s = STATUS[item.status] ?? STATUS.menunggu;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
                                                    className="csi-rise group transition-colors duration-200 hover:bg-indigo-50/40"
                                                >
                                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                                        {item.label}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {item.divisi ? (
                                                            <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                                                {item.divisi}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-bold text-indigo-600">
                                                                {(item.dikirim_oleh || 'A').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-slate-600">
                                                                {item.dikirim_oleh || '-'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                        {item.dikirim_pada || '-'}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}
                                                        >
                                                            <Dot cls={s.dot} ping={s.ping} pulse={s.pulse} />
                                                            {s.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={`/pimpinan/check-sheet/${item.id}`}
                                                                title="Lihat data"
                                                                aria-label="Lihat data"
                                                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-300/50"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() => setHapusItem(item)}
                                                                title="Hapus data pengiriman"
                                                                aria-label="Hapus data pengiriman"
                                                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
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
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* TOAST */}
            {toast && (
                <div
                    key={toast.message}
                    role="status"
                    className={`csi-toast fixed right-5 top-5 z-[300] w-[340px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border bg-white shadow-2xl shadow-slate-950/15 ${
                        toast.type === 'error' ? 'border-rose-200' : 'border-emerald-200'
                    }`}
                >
                    <div className="flex items-start gap-3 p-4">
                        <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                toast.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            {toast.type === 'error' ? (
                                <AlertCircle className="h-5 w-5" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900">
                                {toast.type === 'error' ? 'Gagal' : 'Berhasil'}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-500">{toast.message}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            aria-label="Tutup"
                            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="h-[3px] bg-slate-100">
                        <div
                            className={`csi-shrink h-full ${toast.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`}
                        />
                    </div>
                </div>
            )}

            {/* MODAL HAPUS */}
            {hapusItem && (
                <div
                    className="csi-fade fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onClick={() => !menghapus && setHapusItem(null)}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        className="csi-pop w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pb-5 pt-8 text-center">
                            <div className="relative mx-auto h-14 w-14">
                                <span className="csi-ping absolute inset-0 rounded-2xl bg-rose-300/60" />
                                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-300/50">
                                    <AlertTriangle className="h-7 w-7" strokeWidth={2} />
                                </span>
                            </div>

                            <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                                Hapus data pengiriman?
                            </h3>

                            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                {hapusItem.divisi ? `${hapusItem.divisi} · ` : ''}
                                {hapusItem.label} akan dihapus dari daftar. Data check sheet aslinya tidak ikut
                                terhapus, dan Admin bisa mengirim ulang.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setHapusItem(null)}
                                disabled={menghapus}
                                autoFocus
                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={konfirmasiHapus}
                                disabled={menghapus}
                                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {menghapus ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}