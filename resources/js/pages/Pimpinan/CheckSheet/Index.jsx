import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Pimpinan/Sidebar';

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    diperiksa: {
        label: 'Sudah Diperiksa',
        cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'border-red-200 bg-red-50 text-red-700',
    },
};

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'menunggu', label: 'Menunggu' },
    { key: 'diperiksa', label: 'Diperiksa' },
    { key: 'ditolak', label: 'Ditolak' },
];

function Icon({ type, className = 'h-6 w-6' }) {
    const common = {
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    };

    if (type === 'clock') {
        return (
            <svg viewBox="0 0 24 24" className={className} {...common} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </svg>
        );
    }

    if (type === 'check') {
        return (
            <svg viewBox="0 0 24 24" className={className} {...common} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className={className} {...common} aria-hidden="true">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
            <path d="M14 3v5h5" />
        </svg>
    );
}

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
        if (!toast) return;

        const timer = setTimeout(() => setToast(null), 5000);

        return () => clearTimeout(timer);
    }, [toast]);

    const hitung = (key) =>
        key === 'semua'
            ? pengirimans.length
            : pengirimans.filter((p) => p.status === key).length;

    const daftar =
        filter === 'semua'
            ? pengirimans
            : pengirimans.filter((p) => p.status === filter);

    const totalPengiriman = pengirimans.length;
    const totalMenunggu = pengirimans.filter((p) => p.status === 'menunggu').length;
    const totalDiperiksa = pengirimans.filter((p) => p.status === 'diperiksa').length;

    const statCards = [
        {
            key: 'semua',
            label: 'Total Pengiriman',
            value: totalPengiriman,
            hint: 'Seluruh data yang dikirim',
            icon: 'document',
            border: 'border-blue-100',
            accent: 'from-blue-400 to-blue-600',
            iconBox: 'bg-blue-50 text-blue-600',
            valueClass: 'text-slate-800',
            track: 'bg-blue-50',
            bar: 'bg-blue-500',
            width: '100%',
        },
        {
            key: 'menunggu',
            label: 'Menunggu Diperiksa',
            value: totalMenunggu,
            hint: 'Belum diperiksa pimpinan',
            icon: 'clock',
            border: 'border-amber-100',
            accent: 'from-amber-400 to-orange-500',
            iconBox: 'bg-amber-50 text-amber-600',
            valueClass: 'text-amber-600',
            track: 'bg-amber-50',
            bar: 'bg-amber-400',
            width: totalPengiriman > 0 ? `${(totalMenunggu / totalPengiriman) * 100}%` : '0%',
        },
        {
            key: 'diperiksa',
            label: 'Sudah Diperiksa',
            value: totalDiperiksa,
            hint: 'Telah diperiksa pimpinan',
            icon: 'check',
            border: 'border-emerald-100',
            accent: 'from-emerald-400 to-green-600',
            iconBox: 'bg-emerald-50 text-emerald-600',
            valueClass: 'text-emerald-600',
            track: 'bg-emerald-50',
            bar: 'bg-emerald-500',
            width: totalPengiriman > 0 ? `${(totalDiperiksa / totalPengiriman) * 100}%` : '0%',
        },
    ];

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

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <style>{`
                    @keyframes checkSheetFloat {
                        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                        50% { transform: translate3d(24px, -24px, 0) scale(1.06); }
                    }
                    .checksheet-float { animation: checkSheetFloat 16s ease-in-out infinite; }
                    @media (prefers-reduced-motion: reduce) {
                        .checksheet-float { animation: none !important; }
                    }
                `}</style>
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />
                    <div className="checksheet-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="checksheet-float absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="checksheet-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                            aria-label="Buka menu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white">Check Sheet Mingguan</h1>
                            <p className="hidden text-xs text-white/65 sm:block">
                                Approval dan Monitoring Check Sheet
                            </p>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-white">Data Check Sheet</h2>
                        <p className="mt-0.5 text-sm text-blue-100/90">
                            Data yang telah dikirim oleh Admin untuk diperiksa.
                        </p>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                        {statCards.map((card) => {
                            const aktif = filter === card.key;

                            return (
                                <button
                                    key={card.key}
                                    type="button"
                                    onClick={() => pilihFilter(card.key)}
                                    aria-pressed={aktif}
                                    className={`relative cursor-pointer overflow-hidden rounded-2xl border bg-white/[0.93] p-5 text-left shadow-[0_16px_45px_rgba(2,6,23,0.30)] backdrop-blur-2xl transition hover:bg-white ${card.border} ${
                                        aktif ? 'ring-2 ring-white' : ''
                                    }`}
                                >
                                    <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${card.accent}`} />
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                            <p className={`mt-2 text-3xl font-bold ${card.valueClass}`}>{card.value}</p>
                                            <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
                                        </div>
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBox}`}>
                                            <Icon type={card.icon} className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className={`mt-4 h-1.5 overflow-hidden rounded-full ${card.track}`}>
                                        <div className={`h-full rounded-full ${card.bar}`} style={{ width: card.width }} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* <div className="mb-5 flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-semibold text-white/70">Filter:</span>
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                                    filter === f.key
                                        ? 'border-white bg-white text-blue-700'
                                        : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {f.label} ({hitung(f.key)})
                            </button>
                        ))}
                    </div> */}

                    <div className={`overflow-hidden rounded-3xl ${glassCard}`}>
                        {daftar.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <h3 className="font-semibold text-slate-700">Belum ada data</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {filter === 'semua'
                                        ? 'Belum ada check sheet mingguan yang dikirim Admin.'
                                        : 'Tidak ada data pada kategori ini.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-left text-xs font-bold text-slate-500">
                                            <th className="px-6 py-4">Minggu</th>
                                            <th className="px-6 py-4">Divisi</th>
                                            <th className="px-6 py-4">Dikirim Oleh</th>
                                            <th className="px-6 py-4">Waktu Pengiriman</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/60">
                                        {daftar.map((item) => {
                                            const s = STATUS[item.status] ?? STATUS.menunggu;

                                            return (
                                                <tr key={item.id} className="transition-colors hover:bg-blue-50/60">
                                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                                        {item.label}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-blue-700">
                                                        {item.divisi || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {item.dikirim_oleh || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {item.dikirim_pada || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${s.cls}`}>
                                                            {s.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={`/pimpinan/check-sheet/${item.id}`}
                                                                className="inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-800"
                                                            >
                                                                Lihat Data
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() => setHapusItem(item)}
                                                                title="Hapus data pengiriman"
                                                                className="cursor-pointer rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                            >
                                                                Hapus
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

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="px-6 py-4 text-center text-xs font-medium text-white/70">
                        © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                    </div>
                </footer>
            </div>

            {/* TOAST */}
            {toast && (
                <div
                    className={`fixed right-5 top-5 z-[300] w-[340px] max-w-[calc(100vw-2.5rem)] rounded-xl border bg-white p-4 shadow-2xl ${
                        toast.type === 'error' ? 'border-red-200' : 'border-emerald-200'
                    }`}
                >
                    <p className="text-sm font-bold text-slate-800">
                        {toast.type === 'error' ? 'Gagal' : 'Berhasil'}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{toast.message}</p>
                </div>
            )}

            {/* MODAL HAPUS */}
            {hapusItem && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md"
                    onClick={() => !menghapus && setHapusItem(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

                        <div className="bg-gradient-to-br from-red-50 via-white to-white px-6 pb-5 pt-8 text-center">
                            <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                Hapus data pengiriman?
                            </h3>

                            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                {hapusItem.divisi ? `${hapusItem.divisi} · ` : ''}
                                {hapusItem.label} akan dihapus dari daftar. Data check sheet
                                aslinya tidak ikut terhapus, dan Admin bisa mengirim ulang.
                            </p>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5">
                            <button
                                type="button"
                                onClick={() => setHapusItem(null)}
                                disabled={menghapus}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={konfirmasiHapus}
                                disabled={menghapus}
                                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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