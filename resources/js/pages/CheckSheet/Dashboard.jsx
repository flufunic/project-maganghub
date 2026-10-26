import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON (sama dengan halaman dashboard Preventive Maintenance)
------------------------------------------------------------------ */
function Icon({ d, className = 'h-5 w-5', strokeWidth = 1.8 }) {
    const paths = Array.isArray(d) ? d : [d];

    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            {paths.map((path, i) => (
                <path
                    key={i}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={strokeWidth}
                    d={path}
                />
            ))}
        </svg>
    );
}

const ICON_BRAND = [
    'M10.5 3.75h3a1.5 1.5 0 011.5 1.5v.75h1.5a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0116.5 21h-9a2.25 2.25 0 01-2.25-2.25V8.25A2.25 2.25 0 017.5 6h1.5v-.75a1.5 1.5 0 011.5-1.5z',
    'M9 10.5h6M9 14h4.5M9 17.5h2.5',
];
const ICON_CHART = 'M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8';
const ICON_SHEET = [
    'M8 4.5h8A2.5 2.5 0 0118.5 7v13A2.5 2.5 0 0116 22.5H8A2.5 2.5 0 015.5 20V7A2.5 2.5 0 018 4.5z',
    'M9 2.5h6M9 9h6M9 12.5h6M9 16h4',
];
const ICON_GEAR = [
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
];
const ICON_LOGIN = [
    'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15',
    'M12 12h7.5m0 0l-3-3m3 3l-3 3',
];
const ICON_CHEVRON = 'M9 5l7 7-7 7';
const ICON_MENU = 'M4 7h16M4 12h16M4 17h16';
const ICON_CLOSE = 'M6 18L18 6M6 6l12 12';
const ICON_PLAY = 'M8 5.5v13l11-6.5z';
const ICON_PAUSE = 'M9 5.5v13M15 5.5v13';

/* ------------------------------------------------------------------
| WARNA PER DIVISI (sama dengan dashboard Preventive Maintenance)
| text = warna angka di dalam segmen batang
------------------------------------------------------------------ */
const WARNA_DIVISI = {
    Headrest: {
        gradient: 'linear-gradient(180deg, #e9d5ff 0%, #c084fc 55%, #9333ea 100%)',
        solid: '#c084fc',
        text: '#3b0764',
    },
    Saidan: {
        gradient: 'linear-gradient(180deg, #bbf7d0 0%, #86efac 55%, #4ade80 100%)',
        solid: '#86efac',
        text: '#14532d',
    },
    Utility: {
        gradient: 'linear-gradient(180deg, #60a5fa 0%, #1e3a8a 100%)',
        solid: '#1e3a8a',
        text: '#ffffff',
    },
};

const FALLBACK = {
    gradient: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)',
    solid: '#94a3b8',
    text: '#0f172a',
};

const warna = (divisi) => WARNA_DIVISI[divisi] ?? FALLBACK;

const YEARS = Array.from({ length: 2040 - 2020 + 1 }, (_, i) => 2020 + i);

const DURATION_OPTIONS = [6, 10, 15, 20, 30, 60, 120];

const glassCard =
    'border border-white/60 bg-white/[0.88] shadow-[0_24px_70px_rgba(7,26,77,0.28)] backdrop-blur-2xl';

const selectBlue =
    'h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm outline-none transition-all hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';

/* ------------------------------------------------------------------
| MENU SIDEBAR (semua halaman publik, tidak perlu login)
------------------------------------------------------------------ */
const MENUS = [
    {
        href: '/',
        title: 'Dashboard Mesin',
        subtitle: 'Preventive Maintenance',
        icon: ICON_CHART,
        active: false,
    },
    {
        href: '/overhaul-dashboard',
        title: 'Dashboard Overhaul',
        subtitle: 'Monitoring Overhaul SC2',
        icon: ICON_GEAR,
        active: false,
    },
    {
        href: '/check-sheet-dashboard',
        title: 'Dashboard Check Sheet',
        subtitle: 'Monitoring Check Sheet',
        icon: ICON_SHEET,
        active: true,
    },
];

/* ------------------------------------------------------------------
| DEFINISI 3 SLIDE GRAFIK
| key = nama field di data bulanan (laporan[].xxx)
------------------------------------------------------------------ */
const CHARTS = [
    {
        key: 'centang',
        tab: 'Terisi',
        tag: 'Grafik 1',
        title: 'Jumlah Check Sheet Terisi',
        desc: 'Jumlah centang yang sudah diisi per bulan.',
        suffix: '',
    },
    {
        key: 'persen',
        tab: 'Persentase',
        tag: 'Grafik 2',
        title: 'Persentase Pengisian',
        desc: 'Centang terisi dibanding target (jumlah item × hari × line).',
        suffix: '%',
    },
    {
        key: 'abnormality',
        tab: 'Abnormality',
        tag: 'Grafik 3',
        title: 'Jumlah Abnormality',
        desc: 'Temuan abnormality yang tercatat per bulan.',
        suffix: '',
    },
];

/* ------------------------------------------------------------------
| GRAFIK BATANG TUMPUK (1 batang per bulan, ditumpuk per divisi)
| Divisi pertama di paling bawah.
------------------------------------------------------------------ */
function BarChart({ config, laporan, divisi, animated }) {
    const { key, suffix = '' } = config;

    const nilai = (m, d) => {
        const v = m[key]?.[d];

        return v === null || v === undefined ? null : Number(v);
    };

    const totalBulan = (m) => divisi.reduce((sum, d) => sum + (nilai(m, d) ?? 0), 0);

    // Skala Y mengikuti total tumpukan tertinggi, dibulatkan ke kelipatan 4
    // supaya label sumbu Y selalu bilangan bulat.
    const rawMax = Math.max(1, ...laporan.map(totalBulan));
    const maxValue = Math.max(4, Math.ceil(rawMax / 4) * 4);

    const adaData = laporan.some((m) => totalBulan(m) > 0);

    return (
        <div className="csd-scroll overflow-x-auto pb-1">
            <div
                className="csd-chart-enter relative h-[330px]"
                style={{ minWidth: '900px' }}
            >
                <div className="absolute inset-0 flex">
                    {/* SUMBU Y */}
                    <div className="flex w-12 shrink-0 flex-col justify-between pb-[34px] pr-2 pt-6 text-right text-[10px] font-semibold tabular-nums text-slate-500">
                        {[4, 3, 2, 1, 0].map((v) => (
                            <span key={v}>
                                {Math.round((maxValue * v) / 4)}
                                {suffix}
                            </span>
                        ))}
                    </div>

                    <div className="relative flex-1">
                        {/* GRID */}
                        <div className="absolute inset-x-0 bottom-9 top-7 flex flex-col justify-between">
                            {[0, 1, 2, 3, 4].map((line) => (
                                <div key={line} className="border-t border-dashed border-slate-300/70" />
                            ))}
                        </div>

                        {/* BATANG TUMPUK */}
                        <div className="absolute inset-x-0 bottom-9 top-7 flex px-2">
                            {laporan.map((m, mi) => {
                                const total = totalBulan(m);
                                const ada = total > 0;
                                const height = ada ? Math.max((total / maxValue) * 100, 3) : 0;

                                return (
                                    <div
                                        key={m.bulan}
                                        className="flex h-full flex-1 items-end justify-center"
                                    >
                                        <div
                                            className="relative flex h-full w-[44px] items-end justify-center"
                                            title={`${m.nama_bulan} · Total: ${total}${suffix}`}
                                        >
                                            {/* TOTAL DI ATAS BATANG */}
                                            {ada && (
                                                <span
                                                    className="absolute z-10 whitespace-nowrap text-[10px] font-extrabold text-slate-800 transition-all duration-500"
                                                    style={{
                                                        bottom: animated
                                                            ? `min(calc(${height}% + 3px), calc(100% - 14px))`
                                                            : '0px',
                                                        opacity: animated ? 1 : 0,
                                                        transitionDelay: `${mi * 50 + 300}ms`,
                                                    }}
                                                >
                                                    {total}
                                                    {suffix}
                                                </span>
                                            )}

                                            {/* TUMPUKAN DIVISI (divisi pertama paling bawah) */}
                                            <div
                                                className="flex w-full flex-col-reverse overflow-hidden rounded-t-md transition-all duration-700 ease-out"
                                                style={{
                                                    height: animated ? `${height}%` : '0%',
                                                    transitionDelay: `${mi * 50}ms`,
                                                }}
                                            >
                                                {divisi.map((d) => {
                                                    const value = nilai(m, d) ?? 0;

                                                    if (value <= 0) return null;

                                                    // Angka hanya ditampilkan jika segmen cukup tinggi
                                                    const muatLabel = value / maxValue >= 0.07;

                                                    return (
                                                        <div
                                                            key={d}
                                                            title={`${d} · ${m.nama_bulan}: ${value}${suffix}`}
                                                            className="flex items-center justify-center border-t border-white/40 first:border-t-0"
                                                            style={{
                                                                height: `${(value / total) * 100}%`,
                                                                background: warna(d).gradient,
                                                            }}
                                                        >
                                                            {muatLabel && (
                                                                <span
                                                                    className="text-[9px] font-extrabold leading-none"
                                                                    style={{ color: warna(d).text }}
                                                                >
                                                                    {value}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* BASELINE */}
                        <div className="absolute inset-x-0 bottom-9 border-b border-slate-300" />

                        {/* LABEL BULAN */}
                        <div className="absolute inset-x-0 bottom-0 flex h-8 items-start px-2">
                            {laporan.map((m) => (
                                <div key={m.bulan} className="flex-1 text-center">
                                    <span className="text-[11px] font-bold text-slate-600">
                                        {m.nama_bulan}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {!adaData && (
                            <div className="absolute inset-x-0 bottom-9 top-7 flex items-center justify-center">
                                <p className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                                    Belum ada data pada tahun ini
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
| PAGE
------------------------------------------------------------------ */
export default function Dashboard({ tahun, divisi = [], laporan = [], total = {} }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(Number(tahun));
    const [pageLoaded, setPageLoaded] = useState(false);

    const [activeSlide, setActiveSlide] = useState(0); // index di CHARTS
    const [slideDuration, setSlideDuration] = useState(10);
    const [isPlaying, setIsPlaying] = useState(true);

    const [animated, setAnimated] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    const config = CHARTS[activeSlide];

    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 100);

        return () => clearTimeout(timer);
    }, []);

    // Ganti slide otomatis. Timer dibuat ulang setiap slide berganti
    // (termasuk saat tab diklik manual), jadi hitungan mulai dari awal.
    useEffect(() => {
        if (!isPlaying) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setActiveSlide((current) => (current + 1) % CHARTS.length);
        }, Number(slideDuration) * 1000);

        return () => clearTimeout(timer);
    }, [isPlaying, activeSlide, slideDuration]);

    // Setiap slide / tahun berganti, animasi grafik diputar ulang.
    useEffect(() => {
        setAnimated(false);
        setAnimationKey((key) => key + 1);
        const timer = setTimeout(() => setAnimated(true), 140);

        return () => clearTimeout(timer);
    }, [activeSlide, tahun]);

    const changeYear = (year) => {
        setSelectedYear(year);

        router.get(
            '/check-sheet-dashboard',
            { tahun: year },
            { preserveScroll: true, preserveState: true }
        );
    };

    // Total setahun untuk legenda grafik (kecil, di samping nama divisi)
    const totalLabel = (key, d) => {
        const v = total[d]?.[key];

        if (v === null || v === undefined) return '-';

        return key === 'persen' ? `${v}%` : v;
    };

    const enter = (visible) =>
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0';

    const renderMenuItem = (menu) => (
        <Link
            key={menu.href}
            href={menu.href}
            onClick={() => setSidebarOpen(false)}
            className={`group mb-1.5 flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
                menu.active
                    ? 'border-white/20 bg-white/20 text-white shadow-lg shadow-black/10'
                    : 'border-transparent text-white/75 hover:border-white/10 hover:bg-white/10 hover:text-white'
            }`}
        >
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                    menu.active
                        ? 'bg-white text-blue-700 shadow-md'
                        : 'bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white'
                }`}
            >
                <Icon d={menu.icon} className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{menu.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/55">{menu.subtitle}</p>
            </div>

            <Icon
                d={ICON_CHEVRON}
                className={`h-4 w-4 transition-all duration-300 ${
                    menu.active
                        ? 'text-white'
                        : 'text-white/30 group-hover:translate-x-0.5 group-hover:text-white'
                }`}
            />
        </Link>
    );

    return (
        <>
            <Head title="Dashboard Check Sheet" />

            <style>{`
                @keyframes csdGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes csdProgress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                @keyframes csdChartEnter {
                    from { opacity: 0; transform: translateY(14px) scale(0.99); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .csd-gradient { background-size: 250% 250%; animation: csdGradient 18s ease infinite; }
                .csd-chart-enter {
                    animation: csdChartEnter 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
                    transform-origin: center bottom;
                }
                .csd-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                .csd-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                select#csd_tahun, select#csd_tahun option,
                select#csd_durasi, select#csd_durasi option { cursor: pointer; }
                @media (prefers-reduced-motion: reduce) {
                    .csd-gradient, .csd-chart-enter { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-900">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="csd-gradient absolute inset-0 bg-gradient-to-br from-[#061540] via-[#1447b8] to-[#3bb4f2]" />
                    <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-cyan-300/25 blur-[90px]" />
                    <div className="absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-400/25 blur-[100px]" />
                    <div className="absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-300/20 blur-[100px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-50 border-b border-white/20 bg-[#061540]/50 shadow-[0_8px_30px_rgba(2,6,23,0.20)] backdrop-blur-2xl">
                    <div className="mx-auto flex h-[68px] max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Buka menu"
                            className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg"
                        >
                            <Icon
                                d={ICON_MENU}
                                className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                            />
                        </button>

                        <div className="mx-4 hidden h-8 w-px bg-white/20 sm:block" />

                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 rounded-xl bg-cyan-300/40 blur-xl" />
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-gradient-to-br from-blue-500 to-blue-800 shadow-xl">
                                    <Icon d={ICON_BRAND} className="h-5 w-5 text-white" />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                                        Check Sheet Prediktif
                                    </h1>

                                    <span className="hidden rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white sm:inline-flex">
                                        Dashboard
                                    </span>
                                </div>

                                <p className="mt-0.5 truncate text-[11px] font-medium text-white/65">
                                    Maintenance Monitoring System
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* SIDEBAR */}
                <div
                    className={`fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-[3px] transition-all duration-300 ${
                        sidebarOpen
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                />

                <aside
                    className={`fixed left-0 top-0 z-[70] flex h-full w-[300px] flex-col border-r border-white/15 bg-gradient-to-b from-[#061540]/95 via-[#0b2a78]/90 to-[#061540]/95 shadow-[20px_0_60px_rgba(2,6,23,0.40)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg">
                            <Icon d={ICON_BRAND} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-sm font-bold text-white">
                                Maintenance System
                            </h2>
                            <p className="mt-0.5 text-[11px] text-white/55">Menu navigasi</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup menu"
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                        >
                            <Icon d={ICON_CLOSE} className="h-4 w-4" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="csd-scroll flex-1 overflow-y-auto px-3 py-5">
                        <p className="mb-2 px-3 text-[11px] font-semibold text-white/45">
                            Dashboard
                        </p>

                        {MENUS.map(renderMenuItem)}

                        <div className="my-5 border-t border-white/10" />

                        <p className="mb-2 px-3 text-[11px] font-semibold text-white/45">Akses</p>

                        <Link
                            href="/login"
                            onClick={() => setSidebarOpen(false)}
                            className="group flex items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-white/75 transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80 transition group-hover:bg-white/20 group-hover:text-white">
                                <Icon d={ICON_LOGIN} className="h-5 w-5" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold">Login</p>
                                <p className="mt-0.5 text-[11px] text-white/55">
                                    Masuk ke sistem administrasi
                                </p>
                            </div>

                            <Icon
                                d={ICON_CHEVRON}
                                className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white"
                            />
                        </Link>
                    </div>

                    <div className="border-t border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-center text-[11px] font-medium text-white/50">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-5 lg:px-6">
                    {/* SATU CARD: judul + kontrol slide + filter tahun + grafik */}
                    <div
                        style={{ transitionDelay: '200ms' }}
                        className={`overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                            pageLoaded
                        )}`}
                    >
                        {/* ========== KONTROL ========== */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 bg-white/70 px-3 py-2.5 sm:px-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    Dashboard Analytics
                                </p>
                                <h2 className="text-sm font-extrabold text-slate-900">
                                    Laporan Check Sheet Januari – Desember {tahun}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                                {/* TAB */}
                                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                                    {CHARTS.map((c, index) => (
                                        <button
                                            key={c.key}
                                            type="button"
                                            onClick={() => setActiveSlide(index)}
                                            className={`cursor-pointer rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                                                activeSlide === index
                                                    ? 'bg-white text-blue-700 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {c.tab}
                                        </button>
                                    ))}
                                </div>

                                {/* PUTAR / JEDA */}
                                <button
                                    type="button"
                                    onClick={() => setIsPlaying((current) => !current)}
                                    title={
                                        isPlaying
                                            ? 'Jeda pergantian otomatis'
                                            : 'Putar pergantian otomatis'
                                    }
                                    className={`flex h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold transition ${
                                        isPlaying
                                            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    }`}
                                >
                                    <Icon
                                        d={isPlaying ? ICON_PAUSE : ICON_PLAY}
                                        strokeWidth={2.2}
                                        className="h-3.5 w-3.5"
                                    />
                                    {isPlaying ? 'Jeda' : 'Putar'}
                                </button>

                                {/* DURASI */}
                                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                                    <span className="whitespace-nowrap text-[10px] font-semibold text-slate-500">
                                        Durasi
                                    </span>
                                    <select
                                        id="csd_durasi"
                                        value={slideDuration}
                                        onChange={(event) =>
                                            setSlideDuration(Number(event.target.value))
                                        }
                                        className="cursor-pointer border-0 bg-transparent p-0 pr-5 text-[11px] font-bold text-slate-700 outline-none focus:ring-0"
                                    >
                                        {DURATION_OPTIONS.map((seconds) => (
                                            <option key={seconds} value={seconds}>
                                                {seconds} detik
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {/* TAHUN */}
                                <div style={{ width: 80 }}>
                                    <label
                                        htmlFor="csd_tahun"
                                        className="mb-0.5 block text-[9px] font-semibold text-slate-500"
                                    >
                                        Tahun
                                    </label>
                                    <select
                                        id="csd_tahun"
                                        value={selectedYear}
                                        onChange={(e) => changeYear(Number(e.target.value))}
                                        className={selectBlue}
                                    >
                                        {YEARS.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* GARIS PROGRES PERGANTIAN SLIDE */}
                        <div className="h-0.5 overflow-hidden bg-slate-200/60">
                            {isPlaying && (
                                <div
                                    key={`${activeSlide}-${slideDuration}`}
                                    className="h-full origin-left bg-blue-500"
                                    style={{
                                        animation: `csdProgress ${slideDuration}s linear forwards`,
                                    }}
                                />
                            )}
                        </div>

                        {/* ========== SLIDE AKTIF ========== */}
                        <section key={`${config.key}-${animationKey}`}>
                            <div className="bg-gradient-to-r from-blue-50/80 via-white/40 to-white/40 px-4 py-2.5 sm:px-5">
                                <p className="text-[11px] font-semibold text-slate-500">
                                    {config.tag} dari {CHARTS.length}
                                </p>
                                <h3 className="text-base font-extrabold tracking-tight text-slate-900">
                                    {config.title}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">{config.desc}</p>
                            </div>

                            <div className="px-3 pb-2 pt-3 sm:px-4">
                                <BarChart
                                    config={config}
                                    laporan={laporan}
                                    divisi={divisi}
                                    animated={animated}
                                />

                                {/* LEGENDA + TOTAL SETAHUN */}
                                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-slate-200/70 px-3 py-2">
                                    {divisi.map((d) => (
                                        <div key={d} className="flex items-center gap-2">
                                            <span
                                                className="h-3 w-3 rounded-[4px]"
                                                style={{ backgroundColor: warna(d).solid }}
                                            />
                                            <span className="text-xs font-semibold text-slate-600">
                                                {d}
                                            </span>
                                            <span className="text-xs font-extrabold text-slate-800">
                                                {totalLabel(config.key, d)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/20 bg-[#061540]/50 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-[1600px] items-center justify-center px-5 text-center text-xs font-medium text-white/75 sm:px-6 lg:px-8">
                        © {new Date().getFullYear()} Emma Sarkilla · Maintenance Monitoring System
                    </div>
                </footer>
            </div>
        </>
    );
}
