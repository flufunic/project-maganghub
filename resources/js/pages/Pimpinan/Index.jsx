import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/Pimpinan/Sidebar';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
------------------------------------------------------------------ */
const ICONS = {
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    document: {
        paths: [
            'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z',
            'M14 3v5h5',
        ],
    },
    undo: { sw: 2, paths: ['M3 10h10a5 5 0 0 1 0 10H9', 'M7 6 3 10l4 4'] },
    warning: {
        sw: 2,
        paths: ['M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z'],
    },
    plus: { paths: ['M12 6v12m6-6H6'] },
    clock: { paths: ['M12 7v5l3 2'], circle: true },
    check: { paths: ['m8 12 2.5 2.5L16 9'], circle: true },
    cross: { paths: ['m9 9 6 6m0-6-6 6'], circle: true },
    calendar: {
        paths: [
            'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
        ],
    },
    chevron: { sw: 2, paths: ['M9 5l7 7-7 7'] },
    x: { sw: 3, paths: ['M6 18 18 6M6 6l12 12'] },
    clockSmall: { sw: 3, paths: ['M12 7v5l3 2'], circle: true },
    tick: { sw: 3, paths: ['m5 13 4 4L19 7'] },
    revisi: {
        sw: 2,
        paths: [
            'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z',
        ],
    },
};

function Icon({ type, className = 'h-5 w-5', strokeWidth }) {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth ?? icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.circle && <circle cx="12" cy="12" r="9" />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const thClass =
    'px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500';

/* Badge status laporan */
const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'border-amber-200 bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
        icon: 'clockSmall',
    },
    diperiksa: {
        label: 'Sedang Diperiksa',
        cls: 'border-blue-200 bg-blue-50 text-blue-700',
        dot: 'bg-blue-500',
        icon: 'clockSmall',
    },
    disetujui: {
        label: 'Disetujui',
        cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-emerald-500',
        icon: 'tick',
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'border-red-200 bg-red-50 text-red-700',
        dot: 'bg-red-500',
        icon: 'x',
    },
};

// "menunggu" mencakup yang masih menunggu dan yang sedang diperiksa
const cocokFilter = (item, filter) => {
    if (filter === 'semua') return true;
    if (filter === 'menunggu') return ['menunggu', 'diperiksa'].includes(item.status);

    return item.status === filter;
};

export default function Index({ user, laporans = [], flash }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // semua | menunggu | disetujui | ditolak
    const [filter, setFilter] = useState('semua');

    // Modal batalkan persetujuan
    const [itemBatal, setItemBatal] = useState(null);
    const [memproses, setMemproses] = useState(false);

    const total = laporans.length;
    const totalMenunggu = laporans.filter((i) => cocokFilter(i, 'menunggu')).length;
    const totalDisetujui = laporans.filter((i) => i.status === 'disetujui').length;
    const totalDitolak = laporans.filter((i) => i.status === 'ditolak').length;

    const daftar = laporans.filter((item) => cocokFilter(item, filter));

    // Klik kartu yang sedang aktif -> kembali ke semua
    const pilihFilter = (nilai) => {
        setFilter((sekarang) =>
            sekarang === nilai || nilai === 'semua' ? 'semua' : nilai
        );
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
        if (!itemBatal) return;

        const onKey = (e) => {
            if (e.key === 'Escape' && !memproses) {
                setItemBatal(null);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [itemBatal, memproses]);

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
            icon: 'plus',
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
            hint: 'Perlu ditinjau pimpinan',
            icon: 'clock',
            border: 'border-amber-100',
            accent: 'from-amber-400 to-orange-500',
            iconBox: 'bg-amber-50 text-amber-600',
            valueClass: 'text-amber-600',
            track: 'bg-amber-50',
            bar: 'bg-amber-400',
            width: persen(totalMenunggu),
        },
        {
            key: 'disetujui',
            label: 'Disetujui',
            value: totalDisetujui,
            hint: 'Telah disetujui pimpinan',
            icon: 'check',
            border: 'border-emerald-100',
            accent: 'from-emerald-400 to-green-600',
            iconBox: 'bg-emerald-50 text-emerald-600',
            valueClass: 'text-emerald-600',
            track: 'bg-emerald-50',
            bar: 'bg-emerald-500',
            width: persen(totalDisetujui),
        },
        {
            key: 'ditolak',
            label: 'Ditolak',
            value: totalDitolak,
            hint: 'Menunggu revisi admin',
            icon: 'cross',
            border: 'border-red-100',
            accent: 'from-red-400 to-rose-600',
            iconBox: 'bg-red-50 text-red-600',
            valueClass: 'text-red-600',
            track: 'bg-red-50',
            bar: 'bg-red-500',
            width: persen(totalDitolak),
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            {/* SIDEBAR */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <style>{`
                @keyframes pmpGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes pmpFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes pmpFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }

                .pmp-gradient {
                    background-size: 250% 250%;
                    animation: pmpGradient 20s ease infinite;
                }
                .pmp-float { animation: pmpFloat 14s ease-in-out infinite; }
                .pmp-float-reverse { animation: pmpFloatReverse 17s ease-in-out infinite; }

                .pmp-scroll::-webkit-scrollbar { height: 8px; }
                .pmp-scroll::-webkit-scrollbar-track { background: transparent; }
                .pmp-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.4);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .pmp-gradient,
                    .pmp-float,
                    .pmp-float-reverse { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">

                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="pmp-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />

                    <div className="pmp-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="pmp-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="pmp-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition-colors duration-200 hover:bg-white/25"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white">
                                    Schedule Preventif
                                </h1>

                                <p className="hidden text-xs text-white/65 sm:block">
                                    Approval Report Mingguan Preventif
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">

                    {flash?.success && (
                        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {/* JUDUL DATA */}
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-white">
                            Report Mingguan Preventif
                        </h2>

                        <p className="mt-0.5 text-sm text-blue-100/90">
                            Report mingguan yang telah dikirim oleh Admin untuk diperiksa.
                        </p>
                    </div>

                    {/* STAT CARDS (bisa diklik untuk filter) */}
                    {/* STAT CARDS (kompak, bisa diklik untuk filter) */}
                    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {statCards.map((card) => {
                            const aktif = filter === card.key;

                            return (
                                <button
                                    key={card.key}
                                    type="button"
                                    title={card.hint}
                                    onClick={() => pilihFilter(card.key)}
                                    aria-pressed={aktif}
                                    className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border bg-white/[0.93] py-2.5 pl-4 pr-3 text-left shadow-[0_10px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl transition-colors duration-200 hover:bg-white ${card.border} ${
                                        aktif ? 'ring-2 ring-white' : ''
                                    }`}
                                >
                                    <div
                                        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${card.accent}`}
                                    />

                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBox}`}
                                    >
                                        <Icon type={card.icon} className="h-[18px] w-[18px]" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[11px] font-medium text-slate-500">
                                            {card.label}
                                        </p>

                                        <p className={`text-xl font-bold leading-tight ${card.valueClass}`}>
                                            {card.value}
                                        </p>
                                    </div>

                                    {/* progress tipis di dasar kartu */}
                                    <div className={`absolute inset-x-0 bottom-0 h-[3px] ${card.track}`}>
                                        <div
                                            className={`h-full ${card.bar}`}
                                            style={{ width: card.width }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>


                    {/* RIWAYAT REPORT */}
                    <div className={`overflow-hidden rounded-3xl ${glassCard}`}>

                        {/* TABLE HEADER */}
                        <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-gradient-to-r from-blue-50/70 via-white/40 to-white/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <Icon type="calendar" className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        {judulTabel}
                                    </h3>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Daftar report mingguan yang dikirim oleh Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {daftar.length} Report
                            </div>
                        </div>

                        {/* EMPTY STATE */}
                        {daftar.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                    <Icon type="document" className="h-8 w-8 text-slate-400" />
                                </div>

                                <h3 className="font-semibold text-slate-700">
                                    Belum ada data
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {filter === 'semua'
                                        ? 'Belum ada report mingguan yang dikirim oleh Admin.'
                                        : 'Tidak ada report pada kategori ini.'}
                                </p>
                            </div>
                        ) : (
                            /* TABLE */
                            <div className="pmp-scroll overflow-x-auto">
                                <table className="w-full min-w-[950px] text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80">
                                            <th className={thClass}>No</th>
                                            <th className={thClass}>Periode</th>
                                            <th className={thClass}>Dikirim Oleh</th>
                                            <th className={thClass}>Waktu Pengiriman</th>
                                            <th className={thClass}>Pencapaian</th>
                                            <th className={thClass}>Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/60">
                                        {daftar.map((item, index) => {
                                            const st = STATUS[item.status] ?? STATUS.menunggu;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="group transition-colors duration-200 hover:bg-blue-50/60"
                                                >
                                                    {/* NO */}
                                                    <td className="px-6 py-4">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                                                            {index + 1}
                                                        </span>
                                                    </td>

                                                    {/* PERIODE */}
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-slate-800">
                                                            Week {item.week}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {item.periode}
                                                        </p>
                                                    </td>

                                                    {/* DIKIRIM OLEH */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                                                {(item.dikirim_oleh || 'A')
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <span className="text-slate-600">
                                                                {item.dikirim_oleh || '-'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* WAKTU */}
                                                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                        {item.dikirim_pada || '-'}
                                                    </td>

                                                    {/* PENCAPAIAN */}
                                                    <td className="min-w-[160px] px-6 py-4">
                                                        {item.ringkasan ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-semibold text-slate-700">
                                                                    {item.ringkasan.sudah}/{item.ringkasan.jumlah} item · {item.ringkasan.persen}%
                                                                </span>
                                                                <div className="h-1.5 w-full rounded bg-slate-200">
                                                                    <div
                                                                        className="h-full rounded bg-emerald-500"
                                                                        style={{ width: `${item.ringkasan.persen}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>

                                                    {/* STATUS + REVISI */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-start gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${st.cls}`}
                                                            >
                                                                <span
                                                                    className={`flex h-4 w-4 items-center justify-center rounded-full text-white ${st.dot}`}
                                                                >
                                                                    <Icon type={st.icon} className="h-2.5 w-2.5" />
                                                                </span>
                                                                {st.label}
                                                            </span>

                                                            {/* BADGE REVISI (perubahan admin setelah dikirim) */}
                                                            {item.jumlah_revisi > 0 && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                                                    <Icon type="revisi" className="h-3.5 w-3.5" />
                                                                    Ada Revisi ({item.jumlah_revisi})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* AKSI */}
                                                    {/* AKSI */}
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <Link
                                                                href={`/pimpinan/laporan/${item.id}`}
                                                                className="group/btn inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-300/50 transition-all duration-200 hover:from-blue-700 hover:to-indigo-800"
                                                            >
                                                                Lihat Report
                                                                <Icon
                                                                    type="chevron"
                                                                    className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                                                                />
                                                            </Link>

                                                            {item.status === 'disetujui' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setItemBatal(item)}
                                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition-colors duration-200 hover:bg-red-100"
                                                                >
                                                                    <Icon type="undo" className="h-3 w-3" />
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
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-7xl items-center justify-center px-4 py-4 sm:px-6">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* =====================================================
                MODAL BATALKAN PERSETUJUAN
            ====================================================== */}
            {itemBatal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
                    onClick={tutupModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="judul-modal-batal"
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white shadow-[0_30px_90px_rgba(2,6,23,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pb-2 pt-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <Icon type="warning" className="h-7 w-7" />
                            </div>

                            <h3
                                id="judul-modal-batal"
                                className="text-lg font-bold text-slate-800"
                            >
                                Batalkan Persetujuan?
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                Report{' '}
                                <span className="font-semibold text-slate-700">
                                    Week {itemBatal.week} · {itemBatal.periode}
                                </span>{' '}
                                akan dikembalikan ke Admin untuk direvisi, lalu harus dikirim ulang.
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                                Isi report (teks dan foto) tidak dihapus.
                            </p>
                        </div>

                        <div className="flex gap-3 px-6 pb-6 pt-5">
                            <button
                                type="button"
                                onClick={tutupModal}
                                disabled={memproses}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Tidak, Kembali
                            </button>

                            <button
                                type="button"
                                onClick={konfirmasiBatal}
                                disabled={memproses}
                                className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-300/50 transition-all duration-200 hover:from-red-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
