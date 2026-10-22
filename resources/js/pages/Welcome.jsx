import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON
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
const ICON_ARROW = 'M5 12h14m-7-7l7 7-7 7';
const ICON_MENU = 'M4 7h16M4 12h16M4 17h16';
const ICON_CLOSE = 'M6 18L18 6M6 6l12 12';
const ICON_CALENDAR =
    'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z';
const ICON_EMPTY =
    'M9 17v-2m3 2v-6m3 6v-9M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14';
const ICON_PLAY = 'M8 5.5v13l11-6.5z';
const ICON_PAUSE = 'M9 5.5v13M15 5.5v13';

/* ------------------------------------------------------------------
| TINGGI ISI SLIDE (tahunan & bulanan dibuat sama)
| Ubah angka ini kalau mau card lebih tinggi / pendek.
------------------------------------------------------------------ */
const SLIDE_BODY_H = 'xl:h-[400px]';

/* ------------------------------------------------------------------
| WARNA PER DIVISI (Period Report)
------------------------------------------------------------------ */
const WARNA_DIVISI = {
    Sewing: { bg: '#ea580c', text: '#ffffff' },
    Headrest: { bg: '#c084fc', text: '#3b0764' },
    Utility: { bg: '#1e3a8a', text: '#ffffff' },
    Saidan: { bg: '#86efac', text: '#14532d' },
    Lainnya: { bg: '#94a3b8', text: '#ffffff' },
};

const WARNA_CADANGAN = [
    { bg: '#fdba74', text: '#7c2d12' },
    { bg: '#fde047', text: '#713f12' },
    { bg: '#5eead4', text: '#134e4a' },
];

const getDivisiWarna = (divisi, index) =>
    WARNA_DIVISI[divisi] ?? WARNA_CADANGAN[index % WARNA_CADANGAN.length];

const getDivisiColor = (divisi, index) => getDivisiWarna(divisi, index).bg;

const getDivisiGradient = (divisi, index) => {
    const gradients = {
        Sewing: 'linear-gradient(180deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)',
        Headrest: 'linear-gradient(180deg, #e9d5ff 0%, #c084fc 55%, #9333ea 100%)',
        Utility: 'linear-gradient(180deg, #60a5fa 0%, #1e3a8a 100%)',
        Saidan: 'linear-gradient(180deg, #bbf7d0 0%, #86efac 55%, #4ade80 100%)',
        Lainnya: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)',
    };

    return gradients[divisi] ?? `linear-gradient(180deg, ${getDivisiColor(divisi, index)} 0%, ${getDivisiColor(divisi, index)} 100%)`;
};

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/60 bg-white/[0.88] shadow-[0_24px_70px_rgba(7,26,77,0.28)] backdrop-blur-2xl';

const glassInner =
    'border border-white/70 bg-white/[0.72] shadow-[0_10px_30px_rgba(7,26,77,0.10)] backdrop-blur-xl';

const selectBase =
    'h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm outline-none transition-all focus:ring-2';

const selectBlue = `${selectBase} hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/15`;
const selectIndigo = `${selectBase} hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/15`;

/* ------------------------------------------------------------------
| SMALL COMPONENTS
------------------------------------------------------------------ */
function Field({ id, label, width, children }) {
    return (
        <div style={{ width }}>
            <label
                htmlFor={id}
                className="mb-0.5 block text-[9px] font-semibold text-slate-500"
            >
                {label}
            </label>
            {children}
        </div>
    );
}

function ActionButton({ tone = 'blue', type = 'button', onClick }) {
    const gradient =
        tone === 'indigo'
            ? 'from-indigo-700 to-indigo-500 shadow-indigo-900/25'
            : 'from-blue-800 to-blue-500 shadow-blue-900/25';

    return (
        <button
            type={type}
            onClick={onClick}
            className={`group relative flex h-8 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg bg-gradient-to-r px-3 text-[11px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${gradient}`}
        >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Tampilkan</span>
            <Icon
                d={ICON_ARROW}
                strokeWidth={2}
                className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
        </button>
    );
}

function SectionTitle({ icon, tone, tag, title, description, children }) {
    const tones = {
        blue: 'bg-blue-100 text-blue-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        amber: 'bg-amber-100 text-amber-600',
        slate: 'bg-slate-100 text-slate-600',
    };

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}
                >
                    <Icon d={icon} className="h-5 w-5" />
                </span>

                <div>
                    <p className="text-[11px] font-semibold text-slate-500">{tag}</p>
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
            </div>

            {children}
        </div>
    );
}

function Legend({ items }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-slate-200/70 px-3 py-2">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                    {item.line ? (
                        <span className="relative block h-3 w-6">
                            <span
                                className={`absolute left-0 right-0 top-1.5 border-t-2 ${
                                    item.borderClass ?? 'border-amber-500'
                                }`}
                            />
                            <span
                                className={`absolute left-2 top-0.5 h-2 w-2 rounded-full ${
                                    item.dotClass ?? 'bg-amber-500'
                                }`}
                            />
                        </span>
                    ) : item.color ? (
                        <span
                            className="h-3 w-3 rounded-[4px]"
                            style={{ backgroundColor: item.color }}
                        />
                    ) : (
                        <span className={`h-2.5 w-5 rounded-full ${item.className}`} />
                    )}
                    <span className="text-xs font-semibold text-slate-600">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ title, text, className = '' }) {
    return (
        <div
            className={`m-5 flex h-[215px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 ${className}`}
        >
            <div className="text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Icon d={ICON_EMPTY} strokeWidth={2} className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{text}</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
| HELPER
------------------------------------------------------------------ */
const monthIndex = (year, month) => Number(year) * 12 + Number(month);

const YEARS = Array.from({ length: 2040 - 2020 + 1 }, (_, i) => 2020 + i);

const DURATION_OPTIONS = [6, 10, 15, 20, 30, 60, 120];

/* ------------------------------------------------------------------
| PAGE
------------------------------------------------------------------ */
export default function Welcome({
    bulan,
    tahun,
    detail = [],
    totalItem = 0,
    totalJadwal = 0,
    totalAct = 0,
    totalPlan = 0,
    persentaseAct = 0,
    divisiReport = [],
    annualReport = [],
    daftarDivisi = [],
    bulanMulai = 1,
    tahunMulai,
    bulanSelesai = 12,
    tahunSelesai,
    namaBulan = {},
}) {
    const [selectedMonth, setSelectedMonth] = useState(Number(bulan));
    const [selectedYear, setSelectedYear] = useState(Number(tahun));

    // Period report: bulan + tahun awal dan akhir
    const [selectedAnnualStartMonth, setSelectedAnnualStartMonth] =
        useState(Number(bulanMulai));
    const [selectedAnnualStartYear, setSelectedAnnualStartYear] =
        useState(Number(tahunMulai ?? tahun));
    const [selectedAnnualEndMonth, setSelectedAnnualEndMonth] =
        useState(Number(bulanSelesai));
    const [selectedAnnualEndYear, setSelectedAnnualEndYear] =
        useState(Number(tahunSelesai ?? tahun));

    const [pageLoaded, setPageLoaded] = useState(false);
    const [chartAnimated, setChartAnimated] = useState(false);
    const [chartAnimationKey, setChartAnimationKey] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState('annual');
    const [slideDuration, setSlideDuration] = useState(10);

    // Putar / jeda otomatis (diatur lewat tombol Jeda / Putar)
    const [isPlaying, setIsPlaying] = useState(true);

    const autoRunning = isPlaying;

    // Ganti slide otomatis. Timer dibuat ulang setiap slide berganti
    // (termasuk saat tab diklik manual), jadi hitungan mulai dari awal.
    useEffect(() => {
        if (!autoRunning) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setActiveSlide((current) =>
                current === 'annual' ? 'monthly' : 'annual'
            );
        }, Number(slideDuration) * 1000);

        return () => clearTimeout(timer);
    }, [autoRunning, activeSlide, slideDuration]);

    // Setiap slide berganti, reset status animasi dan remount grafik.
    // Dengan begitu animasi diputar ulang pada setiap interval slideshow,
    // bukan hanya ketika halaman pertama kali dibuka.
    useEffect(() => {
        setChartAnimated(false);
        setChartAnimationKey((key) => key + 1);
        const chartTimer = setTimeout(() => setChartAnimated(true), 140);
        return () => clearTimeout(chartTimer);
    }, [activeSlide]);

    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    /* ---------------- FILTER ---------------- */

    const sendFilter = () => {
        setChartAnimated(false);

        router.get(
            '/',
            {
                bulan: selectedMonth,
                tahun: selectedYear,
                bulan_mulai: selectedAnnualStartMonth,
                tahun_mulai: selectedAnnualStartYear,
                bulan_selesai: selectedAnnualEndMonth,
                tahun_selesai: selectedAnnualEndYear,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setTimeout(() => setChartAnimated(true), 350);
                },
            }
        );
    };

    const applyFilter = (event) => {
        event.preventDefault();
        sendFilter();
    };

    // Ubah awal periode. Kalau jadi lebih besar dari akhir, akhir ikut maju.
    const handleAnnualStartChange = (month, year) => {
        setSelectedAnnualStartMonth(month);
        setSelectedAnnualStartYear(year);

        if (
            monthIndex(year, month) >
            monthIndex(selectedAnnualEndYear, selectedAnnualEndMonth)
        ) {
            setSelectedAnnualEndMonth(month);
            setSelectedAnnualEndYear(year);
        }
    };

    // Ubah akhir periode. Tidak boleh lebih kecil dari awal.
    const handleAnnualEndChange = (month, year) => {
        if (
            monthIndex(year, month) <
            monthIndex(selectedAnnualStartYear, selectedAnnualStartMonth)
        ) {
            setSelectedAnnualEndMonth(selectedAnnualStartMonth);
            setSelectedAnnualEndYear(selectedAnnualStartYear);

            return;
        }

        setSelectedAnnualEndMonth(month);
        setSelectedAnnualEndYear(year);
    };

    const currentMonthName = namaBulan[selectedMonth] || 'Bulan';
    const monthOptions = Object.entries(namaBulan).map(([value, label]) => ({
        value: Number(value),
        label,
    }));

    /* ---------------- DATA ---------------- */

    const maxChartValue = Math.max(
        1,
        ...divisiReport.flatMap((item) => [
            Number(item.act || 0),
            Number(item.plan || 0),
        ])
    );

    const totalForPie = totalAct + totalPlan;
    const actPercentage = totalForPie > 0 ? (totalAct / totalForPie) * 100 : 0;
    const planPercentage = totalForPie > 0 ? (totalPlan / totalForPie) * 100 : 0;

    const pieStyle = {
        background: `conic-gradient(
            #2563eb 0% ${actPercentage}%,
            #f59e0b ${actPercentage}% 100%
        )`,
        transform: chartAnimated ? 'rotate(0deg)' : 'rotate(-90deg)',
    };

    const maxAnnualChartValue = Math.max(
        1,
        ...annualReport.flatMap((item) => [
            Number(item.act || 0),
            Number(item.plan || 0),
        ])
    );

    const periodSpansYears = annualReport.some(
        (item) => item.tahun !== annualReport[0].tahun
    );

    const annualPlanPoints = annualReport.map((item, index) => {
        const total = annualReport.length;
        const x = total === 1 ? 50 : ((index + 0.5) / total) * 100;
        const value = Number(item.plan || 0);
        const height = (value / maxAnnualChartValue) * 100;

        return { x, y: 100 - height };
    });

    const annualPlanLine = annualPlanPoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ');

    const stackDivisi =
        daftarDivisi.length > 0
            ? daftarDivisi
            : Array.from(
                  new Set(
                      annualReport.flatMap((item) =>
                          Object.keys(item.act_per_divisi ?? {})
                      )
                  )
              );

    /* ---------------- SIDEBAR ---------------- */

    const menus = [
        {
            href: '/',
            title: 'Dashboard Mesin',
            subtitle: 'Preventive Maintenance',
            icon: ICON_CHART,
            active: true,
        },
        {
            href: '/overhaul-dashboard',
            title: 'Dashboard Overhaul',
            subtitle: 'Monitoring Overhaul SC2',
            icon: ICON_GEAR,
            active: false,
        },
        {
            href: '/check-sheets',
            title: 'Dashboard Check Sheet',
            subtitle: 'Monitoring Check Sheet',
            icon: ICON_SHEET,
            active: false,
        },
    ];

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
                <p className="mt-0.5 truncate text-[11px] text-white/55">
                    {menu.subtitle}
                </p>
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

    /* ---------------- ENTRANCE ---------------- */

    const enter = (visible) =>
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0';

    return (
        <>
            <Head title="Preventive Maintenance" />

            <style>{`
                @keyframes dashboardGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes dashboardFloat {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(30px, -30px, 0) scale(1.08); }
                }
                @keyframes dashboardFloatReverse {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-35px, 25px, 0) scale(1.1); }
                }
                @keyframes slideProgress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                @keyframes chartEntrance {
                    from { opacity: 0; transform: translateY(14px) scale(0.99); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes chartLineDraw {
                    from { stroke-dashoffset: 1000; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes chartBarRise {
                    from { transform: scaleY(0); opacity: 0.25; }
                    to { transform: scaleY(1); opacity: 1; }
                }
                @keyframes chartLabelReveal {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dashboard-chart-enter {
                    animation: chartEntrance 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
                    transform-origin: center bottom;
                }
                .dashboard-plan-line {
                    stroke-dasharray: 1000;
                    transition: stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease;
                }
                .dashboard-chart-bar {
                    transform-box: fill-box;
                    transform-origin: center bottom;
                }
                .dashboard-chart-label {
                    animation: chartLabelReveal 450ms ease-out both;
                }

                .dashboard-gradient {
                    background-size: 250% 250%;
                    animation: dashboardGradient 18s ease infinite;
                }
                .dashboard-float { animation: dashboardFloat 14s ease-in-out infinite; }
                .dashboard-float-reverse { animation: dashboardFloatReverse 17s ease-in-out infinite; }

                .dashboard-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .dashboard-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .dashboard-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.35);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .dashboard-gradient,
                    .dashboard-float,
                    .dashboard-float-reverse,
                    .dashboard-chart-enter,
                    .dashboard-chart-label { animation: none !important; }
                    .dashboard-plan-line { transition: none !important; stroke-dashoffset: 0 !important; }
                    .dashboard-chart-bar { transform: none !important; }
                }

                /* Memunculkan kursor tangan pada pilihan bulan dan tahun */
                select#mulai_bulan,
                select#mulai_tahun,
                select#selesai_bulan,
                select#selesai_tahun,
                select#bulanan_bulan,
                select#bulanan_tahun {
                    cursor: pointer !important;
                }

                /* Kursor tangan saat pilihan dropdown dibuka */
                select#mulai_bulan option,
                select#mulai_tahun option,
                select#selesai_bulan option,
                select#selesai_tahun option,
                select#bulanan_bulan option,
                select#bulanan_tahun option {
                    cursor: pointer;
                }
            `}</style>

            <div className="relative min-h-screen overflow-x-hidden text-slate-900">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="dashboard-gradient absolute inset-0 bg-gradient-to-br from-[#061540] via-[#1447b8] to-[#3bb4f2]" />

                    <div className="dashboard-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-cyan-300/25 blur-[90px]" />
                    <div className="dashboard-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-400/25 blur-[100px]" />
                    <div className="dashboard-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-300/20 blur-[100px]" />
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
                                        Preventive Maintenance
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

                    <div className="dashboard-scrollbar flex-1 overflow-y-auto px-3 py-5">
                        <p className="mb-2 px-3 text-[11px] font-semibold text-white/45">
                            Dashboard
                        </p>

                        {menus.map(renderMenuItem)}

                        <div className="my-5 border-t border-white/10" />

                        <p className="mb-2 px-3 text-[11px] font-semibold text-white/45">
                            Akses
                        </p>

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
                <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6">
                    {/* ---------------- MAIN CARD ---------------- */}
                    <div
                        style={{ transitionDelay: '200ms' }}
                        className={`mb-5 overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                            pageLoaded
                        )}`}
                    >
                        {/* ========== KONTROL GRAFIK ========== */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 bg-white/70 px-3 py-2.5 sm:px-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                                    Dashboard Analytics
                                </p>
                                <h2 className="text-sm font-extrabold text-slate-900">
                                    Laporan ACT &amp; Plan per Periode
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* TAB */}
                                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSlide('annual')}
                                        className={`cursor-pointer rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                                            activeSlide === 'annual'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Tahunan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSlide('monthly')}
                                        className={`cursor-pointer rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                                            activeSlide === 'monthly'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Bulanan
                                    </button>
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
                            </div>
                        </div>

                        {/* GARIS PROGRES PERGANTIAN SLIDE */}
                        <div className="h-0.5 overflow-hidden bg-slate-200/60">
                            {autoRunning && (
                                <div
                                    key={`${activeSlide}-${slideDuration}`}
                                    className="h-full origin-left bg-blue-500"
                                    style={{
                                        animation: `slideProgress ${slideDuration}s linear forwards`,
                                    }}
                                />
                            )}
                        </div>

                        <div>
                            {/* ========== PERIOD REPORT ========== */}
                            {activeSlide === 'annual' && (
                                <section key={`annual-chart-${chartAnimationKey}`} className="min-w-0 overflow-hidden">
                                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/80 via-white/40 to-white/40 px-4 py-2.5 sm:px-5">
                                        <SectionTitle
                                            icon={ICON_CHART}
                                            tone="blue"
                                            tag="Period report"
                                            title="Rentang Periode"
                                            description="Pilih awal dan akhir laporan."
                                        >
                                            <form
                                                onSubmit={applyFilter}
                                                className="flex flex-wrap items-end gap-x-3 gap-y-2"
                                            >
                                                {/* DARI */}
                                                <div className="flex items-end gap-1.5">
                                                    <Field id="mulai_bulan" label="Dari bulan" width={104}>
                                                        <select
                                                            id="mulai_bulan"
                                                            value={selectedAnnualStartMonth}
                                                            onChange={(event) =>
                                                                handleAnnualStartChange(
                                                                    Number(event.target.value),
                                                                    selectedAnnualStartYear
                                                                )
                                                            }
                                                            className={selectBlue}
                                                        >
                                                            {monthOptions.map((month) => (
                                                                <option key={month.value} value={month.value}>
                                                                    {month.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>

                                                    <Field id="mulai_tahun" label="Tahun" width={74}>
                                                        <select
                                                            id="mulai_tahun"
                                                            value={selectedAnnualStartYear}
                                                            onChange={(event) =>
                                                                handleAnnualStartChange(
                                                                    selectedAnnualStartMonth,
                                                                    Number(event.target.value)
                                                                )
                                                            }
                                                            className={selectBlue}
                                                        >
                                                            {YEARS.map((year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                </div>

                                                {/* SAMPAI */}
                                                <div className="flex items-end gap-1.5">
                                                    <Field id="selesai_bulan" label="Sampai bulan" width={104}>
                                                        <select
                                                            id="selesai_bulan"
                                                            value={selectedAnnualEndMonth}
                                                            onChange={(event) =>
                                                                handleAnnualEndChange(
                                                                    Number(event.target.value),
                                                                    selectedAnnualEndYear
                                                                )
                                                            }
                                                            className={selectBlue}
                                                        >
                                                            {monthOptions.map((month) => (
                                                                <option key={month.value} value={month.value}>
                                                                    {month.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>

                                                    <Field id="selesai_tahun" label="Tahun" width={74}>
                                                        <select
                                                            id="selesai_tahun"
                                                            value={selectedAnnualEndYear}
                                                            onChange={(event) =>
                                                                handleAnnualEndChange(
                                                                    selectedAnnualEndMonth,
                                                                    Number(event.target.value)
                                                                )
                                                            }
                                                            className={selectBlue}
                                                        >
                                                            {YEARS.map((year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                </div>

                                                <ActionButton type="submit" />
                                            </form>
                                        </SectionTitle>
                                    </div>

                                    {/* PERIOD GRAPH */}
                                    {annualReport.length > 0 ? (
                                        <div className={`px-3 pb-2 pt-3 sm:px-4 ${SLIDE_BODY_H}`}>
                                            <div className="dashboard-scrollbar overflow-x-auto pb-1">
                                                <div
                                                    className="dashboard-chart-enter relative h-[330px] sm:h-[350px]"
                                                    style={{
                                                        minWidth: `${Math.max(600, annualReport.length * 65)}px`,
                                                    }}
                                                >
                                                    <div className="absolute inset-0 flex">
                                                        {/* Y AXIS */}
                                                        <div className="flex w-11 shrink-0 flex-col justify-between pb-[40px] pr-2 pt-6 text-right text-[10px] font-semibold tabular-nums text-slate-500">
                                                            {[4, 3, 2, 1, 0].map((value) => (
                                                                <span key={value}>
                                                                    {Math.round((maxAnnualChartValue * value) / 4)}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <div className="relative flex-1">
                                                            {/* GRID */}
                                                            <div className="absolute inset-x-0 bottom-11 top-7 flex flex-col justify-between">
                                                                {[0, 1, 2, 3, 4].map((line) => (
                                                                    <div
                                                                        key={line}
                                                                        className="border-t border-dashed border-slate-300/70"
                                                                    />
                                                                ))}
                                                            </div>

                                                            {/* BATANG ACT BERTUMPUK PER DIVISI */}
                                                            <div className="absolute inset-x-0 bottom-11 top-7 z-0 flex px-3">
                                                                {annualReport.map((item, index) => {
                                                                    const act = Number(item.act || 0);
                                                                    const plan = Number(item.plan || 0);

                                                                    const actHeight =
                                                                        (act / maxAnnualChartValue) * 100;

                                                                    const segments = stackDivisi
                                                                        .map((divisi, divisiIndex) => ({
                                                                            divisi,
                                                                            value: Number(
                                                                                item.act_per_divisi?.[divisi] || 0
                                                                            ),
                                                                            color: getDivisiColor(
                                                                                divisi,
                                                                                divisiIndex
                                                                            ),
                                                                            gradient: getDivisiGradient(
                                                                                divisi,
                                                                                divisiIndex
                                                                            ),
                                                                            textColor: getDivisiWarna(
                                                                                divisi,
                                                                                divisiIndex
                                                                            ).text,
                                                                        }))
                                                                        .filter((segment) => segment.value > 0);

                                                                    // Total ACT di atas batang hanya kalau batang
                                                                    // terdiri dari 2+ divisi. Kalau cuma satu divisi,
                                                                    // angkanya sudah ada di dalam batang (tidak dobel).
                                                                    const showTotalLabel =
                                                                        segments.length > 1 &&
                                                                        act > 0 &&
                                                                        ((plan - act) / maxAnnualChartValue) * 100 >= 20;

                                                                    return (
                                                                        <div
                                                                            key={`bar-${item.tahun}-${item.bulan}`}
                                                                            className="relative flex h-full flex-1 items-end justify-center"
                                                                        >
                                                                            {act > 0 && (
                                                                                <div
                                                                                    className="relative flex w-[38px] flex-col-reverse rounded-t-lg transition-all duration-700 ease-out hover:brightness-105"
                                                                                    style={{
                                                                                        height: chartAnimated
                                                                                            ? `${Math.max(actHeight, 3)}%`
                                                                                            : '0%',
                                                                                        transitionDelay: `${index * 60}ms`,
                                                                                    }}
                                                                                >
                                                                                    {segments.map((segment, segIndex) => {
                                                                                        const isTop =
                                                                                            segIndex === segments.length - 1;

                                                                                        return (
                                                                                            <div
                                                                                                key={segment.divisi}
                                                                                                title={`${segment.divisi}: ${segment.value}`}
                                                                                                className={`group relative flex min-h-0 items-center justify-center border-t border-white/45 first:border-t-0 ${
                                                                                                    isTop ? 'rounded-t-lg' : ''
                                                                                                }`}
                                                                                                style={{
                                                                                                    flexGrow: segment.value,
                                                                                                    flexBasis: 0,
                                                                                                    background: segment.gradient,
                                                                                                    boxShadow: isTop ? '0 5px 12px rgba(15, 23, 42, 0.12)' : 'none',
                                                                                                }}
                                                                                            >
                                                                                                <span
                                                                                                    className="text-[10px] font-extrabold leading-none transition-opacity duration-500"
                                                                                                    style={{
                                                                                                        color: segment.textColor,
                                                                                                        opacity: chartAnimated ? 1 : 0,
                                                                                                        transitionDelay: `${500 + index * 60}ms`,
                                                                                                    }}
                                                                                                >
                                                                                                    {segment.value}
                                                                                                </span>
                                                                                            </div>
                                                                                        );
                                                                                    })}

                                                                                    {showTotalLabel && (
                                                                                        <span
                                                                                            className="absolute left-1/2 whitespace-nowrap text-[11px] font-extrabold text-slate-700 transition-opacity duration-500"
                                                                                            style={{
                                                                                                bottom: 'calc(100% + 4px)',
                                                                                                transform: 'translateX(-50%)',
                                                                                                opacity: chartAnimated ? 1 : 0,
                                                                                                transitionDelay: `${600 + index * 60}ms`,
                                                                                            }}
                                                                                        >
                                                                                            {act}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* GARIS PLAN */}
                                                            <div className="pointer-events-none absolute inset-x-0 bottom-11 top-7 z-10 px-3">
                                                                <div className="relative h-full w-full">
                                                                    <svg
                                                                        className="absolute inset-0 h-full w-full overflow-visible"
                                                                        viewBox="0 0 100 100"
                                                                        preserveAspectRatio="none"
                                                                    >
                                                                        <defs>
                                                                            <linearGradient id="annualPlanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                                <stop offset="0%" stopColor="#fbbf24" />
                                                                                <stop offset="48%" stopColor="#f97316" />
                                                                                <stop offset="100%" stopColor="#ea580c" />
                                                                            </linearGradient>
                                                                            <filter id="annualPlanGlow" x="-20%" y="-30%" width="140%" height="160%">
                                                                                <feGaussianBlur stdDeviation="1.8" result="blur" />
                                                                                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.96 0 1 0 0 0.48 0 0 1 0 0.05 0 0 0 0.42 0" result="glow" />
                                                                                <feMerge>
                                                                                    <feMergeNode in="glow" />
                                                                                    <feMergeNode in="SourceGraphic" />
                                                                                </feMerge>
                                                                            </filter>
                                                                        </defs>
                                                                        <polyline
                                                                            points={annualPlanLine}
                                                                            fill="none"
                                                                            stroke="#fbbf24"
                                                                            strokeWidth="7"
                                                                            opacity={chartAnimated ? 0.18 : 0}
                                                                            vectorEffect="non-scaling-stroke"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                        <polyline
                                                                            points={annualPlanLine}
                                                                            fill="none"
                                                                            stroke="url(#annualPlanGradient)"
                                                                            strokeWidth="3"
                                                                            vectorEffect="non-scaling-stroke"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            filter="url(#annualPlanGlow)"
                                                                            className="dashboard-plan-line"
                                                                            style={{
                                                                                opacity: chartAnimated ? 1 : 0,
                                                                                strokeDashoffset: chartAnimated ? 0 : 1000,
                                                                            }}
                                                                        />
                                                                    </svg>

                                                                    {annualPlanPoints.map((point, index) => (
                                                                        <span
                                                                            key={`plan-dot-${index}`}
                                                                            className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-orange-500 bg-white shadow-[0_2px_10px_rgba(249,115,22,0.45)] transition-all duration-500"
                                                                            style={{
                                                                                left: `${point.x}%`,
                                                                                top: `${point.y}%`,
                                                                                opacity: chartAnimated ? 1 : 0,
                                                                                transform: chartAnimated
                                                                                    ? 'translate(-50%, -50%) scale(1)'
                                                                                    : 'translate(-50%, -50%) scale(0)',
                                                                                transitionDelay: `${600 + index * 70}ms`,
                                                                            }}
                                                                        />
                                                                    ))}

                                                                    {annualPlanPoints.map((point, index) => {
                                                                        const item = annualReport[index];
                                                                        const plan = Number(item.plan || 0);

                                                                        if (plan <= 0) return null;

                                                                        return (
                                                                            <span
                                                                                key={`plan-label-${item.tahun}-${item.bulan}`}
                                                                                className="absolute whitespace-nowrap rounded-md border border-orange-100 bg-white/95 px-1.5 py-0.5 text-[11px] font-extrabold text-orange-600 shadow-[0_3px_10px_rgba(249,115,22,0.12)] transition-all duration-500"
                                                                                style={{
                                                                                    left: `${point.x}%`,
                                                                                    top: `calc(${point.y}% - 32px)`,
                                                                                    opacity: chartAnimated ? 1 : 0,
                                                                                    transform: chartAnimated
                                                                                        ? 'translate(-50%, 0)'
                                                                                        : 'translate(-50%, 6px)',
                                                                                    transitionDelay: `${760 + index * 70}ms`,
                                                                                }}
                                                                            >
                                                                                {plan}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* BASELINE */}
                                                            <div className="absolute inset-x-0 bottom-11 z-10 border-b border-slate-300" />

                                                            {/* MONTH LABEL */}
                                                            <div className="absolute inset-x-0 bottom-0 flex h-9 items-start px-3">
                                                                {annualReport.map((item) => (
                                                                    <div
                                                                        key={`${item.tahun}-${item.bulan}`}
                                                                        className="flex-1 text-center"
                                                                    >
                                                                        <span className="text-[10px] font-bold text-slate-600">
                                                                            {item.nama_bulan}
                                                                        </span>

                                                                        {periodSpansYears && (
                                                                            <span className="block text-[10px] font-semibold text-slate-400">
                                                                                {item.tahun}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Legend
                                                items={[
                                                    ...stackDivisi.map((divisi, index) => ({
                                                        label: `ACT ${divisi}`,
                                                        color: getDivisiColor(divisi, index),
                                                    })),
                                                    { label: 'Plan', line: true, borderClass: 'border-orange-500', dotClass: 'bg-orange-500' },
                                                ]}
                                            />
                                        </div>
                                    ) : (
                                        <EmptyState
                                            title="Tidak ada data pada periode ini"
                                            text="Tidak ditemukan jadwal preventif pada periode yang dipilih."
                                        />
                                    )}
                                </section>
                            )}

                            {/* ========== MONTHLY REPORT ========== */}
                            {activeSlide === 'monthly' && (
                                <section key={`monthly-chart-${chartAnimationKey}`} className="min-w-0 overflow-hidden">
                                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-indigo-50/80 via-white/40 to-white/40 px-4 py-2.5 sm:px-5">
                                        <SectionTitle
                                            icon={ICON_CALENDAR}
                                            tone="indigo"
                                            tag="Monthly report"
                                            title={`Detail Laporan ${currentMonthName} ${selectedYear}`}
                                            description="Ringkasan kondisi preventive maintenance pada bulan yang dipilih."
                                        >
                                            <form
                                                onSubmit={applyFilter}
                                                className="flex flex-wrap items-end gap-1.5"
                                            >
                                                <Field id="bulanan_bulan" label="Bulan" width={104}>
                                                    <select
                                                        id="bulanan_bulan"
                                                        value={selectedMonth}
                                                        onChange={(event) =>
                                                            setSelectedMonth(Number(event.target.value))
                                                        }
                                                        className={selectIndigo}
                                                    >
                                                        {monthOptions.map((month) => (
                                                            <option key={month.value} value={month.value}>
                                                                {month.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <Field id="bulanan_tahun" label="Tahun" width={74}>
                                                    <select
                                                        id="bulanan_tahun"
                                                        value={selectedYear}
                                                        onChange={(event) =>
                                                            setSelectedYear(Number(event.target.value))
                                                        }
                                                        className={selectIndigo}
                                                    >
                                                        {YEARS.map((year) => (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <ActionButton type="submit" tone="indigo" />
                                            </form>
                                        </SectionTitle>
                                    </div>

                                    <div
                                        className={`grid grid-cols-1 gap-3 p-3 sm:p-4 xl:grid-cols-5 ${SLIDE_BODY_H}`}
                                    >
                                        {/* ---------- BAR CHART ---------- */}
                                        <section
                                            className={`flex min-h-0 flex-col overflow-hidden rounded-3xl xl:col-span-3 ${glassInner}`}
                                        >
                                            <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-2.5">
                                                <div>
                                                    <p className="text-[11px] font-semibold text-blue-600">
                                                        Performance
                                                    </p>
                                                    <h3 className="text-base font-extrabold text-slate-900">
                                                        ACT vs Plan per Divisi
                                                    </h3>
                                                </div>

                                                <div className="hidden rounded-xl bg-white px-3 py-1 text-right shadow-sm sm:block">
                                                    <p className="text-[10px] font-semibold text-slate-500">
                                                        Periode
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-800">
                                                        {currentMonthName} {selectedYear}
                                                    </p>
                                                </div>
                                            </div>

                                            {divisiReport.length > 0 ? (
                                                <>
                                                    <div className="min-h-[260px] flex-1 px-4 pb-1 pt-3">
                                                        <div className="dashboard-scrollbar h-full overflow-x-auto">
                                                            <div
                                                                className="dashboard-chart-enter relative h-full min-h-[240px]"
                                                                style={{
                                                                    minWidth: `${Math.max(
                                                                        600,
                                                                        divisiReport.length * 110
                                                                    )}px`,
                                                                }}
                                                            >
                                                                <div className="absolute inset-0 flex">
                                                                    {/* Y AXIS */}
                                                                    <div className="flex w-11 shrink-0 flex-col justify-between pb-[52px] pr-2 text-right text-[10px] font-medium text-slate-500">
                                                                        {[4, 3, 2, 1, 0].map((value) => (
                                                                            <span key={value}>
                                                                                {Math.round((maxChartValue * value) / 4)}
                                                                            </span>
                                                                        ))}
                                                                    </div>

                                                                    <div className="relative flex-1">
                                                                        {/* GRID */}
                                                                        <div className="absolute inset-x-0 bottom-[52px] top-2 flex flex-col justify-between">
                                                                            {[0, 1, 2, 3, 4].map((line) => (
                                                                                <div
                                                                                    key={line}
                                                                                    className="border-t border-dashed border-slate-300/80"
                                                                                />
                                                                            ))}
                                                                        </div>

                                                                        {/* BARS */}
                                                                        <div className="absolute inset-x-0 bottom-[52px] top-2 flex items-end justify-around gap-5 px-5">
                                                                            {divisiReport.map((item, index) => {
                                                                                const act = Number(item.act || 0);
                                                                                const plan = Number(item.plan || 0);

                                                                                const actHeight =
                                                                                    maxChartValue > 0
                                                                                        ? (act / maxChartValue) * 100
                                                                                        : 0;
                                                                                const planHeight =
                                                                                    maxChartValue > 0
                                                                                        ? (plan / maxChartValue) * 100
                                                                                        : 0;

                                                                                const visualActHeight =
                                                                                    act > 0 ? Math.max(actHeight, 3) : 0;
                                                                                const visualPlanHeight =
                                                                                    plan > 0 ? Math.max(planHeight, 3) : 0;

                                                                                return (
                                                                                    <div
                                                                                        key={item.divisi}
                                                                                        className="flex h-full min-w-[75px] flex-1 items-end justify-center gap-1.5"
                                                                                    >
                                                                                        {/* ACT */}
                                                                                        <div className="relative flex h-full w-8 items-end justify-center">
                                                                                            <span
                                                                                                className="absolute z-20 whitespace-nowrap text-[11px] font-extrabold text-blue-700 transition-all duration-500"
                                                                                                style={{
                                                                                                    bottom:
                                                                                                        chartAnimated && act > 0
                                                                                                            ? `min(calc(${visualActHeight}% + 6px), calc(100% - 16px))`
                                                                                                            : '0px',
                                                                                                    opacity:
                                                                                                        chartAnimated && act > 0 ? 1 : 0,
                                                                                                    transform: chartAnimated
                                                                                                        ? 'translateY(0)'
                                                                                                        : 'translateY(7px)',
                                                                                                    transitionDelay: `${index * 70}ms`,
                                                                                                }}
                                                                                            >
                                                                                                {act > 0 ? act : ''}
                                                                                            </span>

                                                                                            <div
                                                                                                className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 to-sky-400 shadow-[0_8px_18px_rgba(37,99,235,0.25)] transition-all duration-700 ease-out hover:from-blue-600 hover:to-cyan-300"
                                                                                                style={{
                                                                                                    height: chartAnimated
                                                                                                        ? `${visualActHeight}%`
                                                                                                        : '0%',
                                                                                                    transitionDelay: `${index * 80}ms`,
                                                                                                }}
                                                                                            />
                                                                                        </div>

                                                                                        {/* PLAN */}
                                                                                        <div className="relative flex h-full w-8 items-end justify-center">
                                                                                            <span
                                                                                                className="absolute z-20 whitespace-nowrap text-[11px] font-extrabold text-amber-600 transition-all duration-500"
                                                                                                style={{
                                                                                                    bottom:
                                                                                                        chartAnimated && plan > 0
                                                                                                            ? `min(calc(${visualPlanHeight}% + 6px), calc(100% - 16px))`
                                                                                                            : '0px',
                                                                                                    opacity:
                                                                                                        chartAnimated && plan > 0 ? 1 : 0,
                                                                                                    transform: chartAnimated
                                                                                                        ? 'translateY(0)'
                                                                                                        : 'translateY(7px)',
                                                                                                    transitionDelay: `${index * 70 + 120}ms`,
                                                                                                }}
                                                                                            >
                                                                                                {plan > 0 ? plan : ''}
                                                                                            </span>

                                                                                            <div
                                                                                                className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_8px_18px_rgba(245,158,11,0.25)] transition-all duration-700 ease-out hover:from-amber-400 hover:to-yellow-200"
                                                                                                style={{
                                                                                                    height: chartAnimated
                                                                                                        ? `${visualPlanHeight}%`
                                                                                                        : '0%',
                                                                                                    transitionDelay: `${index * 80 + 120}ms`,
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>

                                                                        {/* BASELINE */}
                                                                        <div className="absolute inset-x-0 bottom-[52px] border-b border-slate-300" />

                                                                        {/* DIVISI LABEL */}
                                                                        <div className="absolute inset-x-0 bottom-0 flex h-11 items-start justify-around gap-5 px-5">
                                                                            {divisiReport.map((item) => (
                                                                                <div
                                                                                    key={item.divisi}
                                                                                    className="min-w-[75px] flex-1 text-center"
                                                                                >
                                                                                    <span className="inline-block max-w-[90px] break-words text-[11px] font-bold leading-4 text-slate-600">
                                                                                        {item.divisi}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Legend
                                                        items={[
                                                            {
                                                                label: 'ACT',
                                                                className: 'bg-gradient-to-r from-blue-700 to-sky-400',
                                                            },
                                                            {
                                                                label: 'Plan',
                                                                className: 'bg-gradient-to-r from-amber-500 to-yellow-300',
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ) : (
                                                <EmptyState
                                                    title="Tidak ada jadwal preventif"
                                                    text="Tidak ditemukan jadwal pada bulan yang dipilih."
                                                />
                                            )}
                                        </section>

                                        {/* ---------- PIE CHART ---------- */}
                                        <section
                                            className={`flex min-h-0 flex-col overflow-hidden rounded-3xl xl:col-span-2 ${glassInner}`}
                                        >
                                            <div className="border-b border-slate-200/70 px-5 py-2.5">
                                                <p className="text-[11px] font-semibold text-amber-600">
                                                    Overview
                                                </p>
                                                <h3 className="text-base font-extrabold text-slate-900">
                                                    Persentase ACT vs Plan
                                                </h3>
                                            </div>

                                            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
                                                <div
                                                    className="h-28 w-28 shrink-0 rounded-full shadow-[0_15px_35px_rgba(15,23,42,0.20)] transition-transform duration-[1000ms] ease-out"
                                                    style={pieStyle}
                                                >
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_2px_10px_rgba(15,23,42,0.08)]">
                                                            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                                                {Math.round(actPercentage)}%
                                                            </span>
                                                            <span className="text-[10px] font-semibold text-slate-500">
                                                                ACT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full max-w-sm space-y-2">
                                                    <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)]" />
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">ACT</p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    Sudah preventif
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-lg font-extrabold leading-tight text-blue-600">
                                                                {totalAct}
                                                            </p>
                                                            <p className="text-[11px] font-semibold text-slate-500">
                                                                {actPercentage.toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]" />
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">Plan</p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    Belum preventif
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-lg font-extrabold leading-tight text-amber-600">
                                                                {totalPlan}
                                                            </p>
                                                            <p className="text-[11px] font-semibold text-slate-500">
                                                                {planPercentage.toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 text-sm">
                                                        <span className="font-medium text-slate-500">
                                                            Total jadwal
                                                        </span>
                                                        <span className="font-extrabold text-slate-800">
                                                            {totalJadwal}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* ---------------- DETAIL TABLE ---------------- */}
                    <section
                        style={{ transitionDelay: '300ms' }}
                        className={`overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                            pageLoaded
                        )}`}
                    >
                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-100/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                            <SectionTitle
                                icon={ICON_SHEET}
                                tone="slate"
                                tag="Detail report"
                                title="Detail Preventive Maintenance"
                                description={`Detail jadwal, ACT, dan Plan untuk ${currentMonthName} ${selectedYear}.`}
                            >
                                {detail.length > 0 && (
                                    <p className="text-xs font-medium text-slate-500">
                                        {detail.length} item preventif
                                    </p>
                                )}
                            </SectionTitle>
                        </div>

                        <div className="dashboard-scrollbar max-h-[420px] overflow-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="sticky top-0 z-10 bg-slate-50">
                                    <tr className="border-b border-slate-200/70 bg-slate-50">
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                                            No
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                                            Divisi
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                                            Item Preventif
                                        </th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                                            Jumlah Item
                                        </th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-blue-600">
                                            Sudah Preventif
                                        </th>
                                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-amber-600">
                                            Belum Preventif
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200/60">
                                    {detail.length > 0 ? (
                                        detail.map((item, index) => (
                                            <tr
                                                key={`${item.divisi}-${item.no_item}-${index}`}
                                                style={{
                                                    transitionDelay: `${Math.min(index * 40, 600)}ms`,
                                                }}
                                                className={`group transition-all duration-500 hover:bg-blue-50/70 ${
                                                    pageLoaded
                                                        ? 'translate-x-0 opacity-100'
                                                        : '-translate-x-4 opacity-0'
                                                }`}
                                            >
                                                <td className="px-5 py-3.5 text-center text-sm font-semibold text-slate-400">
                                                    {index + 1}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 transition-all group-hover:bg-white group-hover:shadow-sm">
                                                        {item.divisi || '-'}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                                                    {item.item_preventif || '-'}
                                                </td>

                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                                                        {item.total_jadwal}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
                                                        {item.act}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-600">
                                                        {item.plan}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 shadow-sm">
                                                        <Icon
                                                            d={ICON_EMPTY}
                                                            strokeWidth={2}
                                                            className="h-6 w-6 text-slate-400"
                                                        />
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Tidak ada jadwal preventif
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Tidak ditemukan data pada bulan yang dipilih.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {detail.length > 0 && (
                            <div className="border-t border-slate-200/70 bg-slate-50/70 px-5 py-3.5 sm:px-6">
                                <div className="flex flex-col gap-2 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Menampilkan{' '}
                                        <span className="font-bold text-slate-700">{detail.length}</span>{' '}
                                        item preventif
                                    </span>

                                    <span>
                                        Total{' '}
                                        <span className="font-bold text-slate-700">{totalJadwal}</span>{' '}
                                        jadwal
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="mt-6 border-t border-white/20 bg-[#061540]/50 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-[1600px] items-center justify-center px-5 text-center text-xs font-medium text-white/75 sm:px-6 lg:px-8">
                        © {new Date().getFullYear()} Emma Sarkilla · Maintenance Monitoring System
                    </div>
                </footer>
            </div>
        </>
    );
}
