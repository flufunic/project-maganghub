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
const ICON_LOGIN = [
    'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15',
    'M12 12h7.5m0 0l-3-3m3 3l-3 3',
];
const ICON_CHEVRON = 'M9 5l7 7-7 7';
const ICON_ARROW = 'M5 12h14m-7-7l7 7-7 7';
const ICON_MENU = 'M4 7h16M4 12h16M4 17h16';
const ICON_CLOSE = 'M6 18L18 6M6 6l12 12';
const ICON_PIE = ['M12 3a9 9 0 109 9h-9V3z', 'M14 3.34A9 9 0 0120.66 10H14V3.34z'];
const ICON_CALENDAR =
    'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z';
const ICON_EMPTY =
    'M9 17v-2m3 2v-6m3 6v-9M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14';

/* ------------------------------------------------------------------
| STYLE TOKENS
| (opacity memakai nilai yang aman untuk Tailwind v3 & v4)
------------------------------------------------------------------ */
const glassCard =
    'border border-white/60 bg-white/[0.88] shadow-[0_24px_70px_rgba(7,26,77,0.28)] backdrop-blur-2xl';

const glassInner =
    'border border-white/70 bg-white/[0.72] shadow-[0_10px_30px_rgba(7,26,77,0.10)] backdrop-blur-xl';

const selectBase =
    'h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all focus:ring-4';

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
                className="mb-1 block text-[10px] font-semibold text-slate-500"
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
            className={`group relative flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r px-4 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 ${gradient}`}
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
        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-slate-200/70 px-4 py-3">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                    {item.line ? (
                        <span className="relative block h-3 w-6">
                            <span className="absolute left-0 right-0 top-1.5 border-t-2 border-amber-500" />
                            <span className="absolute left-2 top-0.5 h-2 w-2 rounded-full bg-amber-500" />
                        </span>
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
    bulanMulai = 1,
    bulanSelesai = 12,
    namaBulan = {},
}) {
    const [selectedMonth, setSelectedMonth] = useState(Number(bulan));
    const [selectedYear, setSelectedYear] = useState(Number(tahun));
    const [selectedAnnualStartMonth, setSelectedAnnualStartMonth] =
        useState(Number(bulanMulai));
    const [selectedAnnualEndMonth, setSelectedAnnualEndMonth] =
        useState(Number(bulanSelesai));

    const [pageLoaded, setPageLoaded] = useState(false);
    const [chartAnimated, setChartAnimated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 100);
        const chartTimer = setTimeout(() => setChartAnimated(true), 350);

        return () => {
            clearTimeout(timer);
            clearTimeout(chartTimer);
        };
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
                bulan_selesai: selectedAnnualEndMonth,
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

    const currentMonthName = namaBulan[selectedMonth] || 'Bulan';
    const years = Array.from({ length: 2040 - 2020 + 1 }, (_, i) => 2020 + i);

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

    const annualChartPoints = annualReport.map((item, index) => {
        const total = annualReport.length;
        const x = total === 1 ? 50 : ((index + 0.5) / total) * 100;
        const plan = Number(item.plan || 0);
        const planHeight =
            maxAnnualChartValue > 0 ? (plan / maxAnnualChartValue) * 100 : 0;

        return { x, y: 100 - planHeight };
    });

    const annualLinePoints = annualChartPoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ');

    const annualAreaPoints =
        annualChartPoints.length > 0
            ? `${annualChartPoints[0].x},100 ${annualLinePoints} ${
                  annualChartPoints[annualChartPoints.length - 1].x
              },100`
            : '';

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
                    .dashboard-float-reverse { animation: none !important; }
                }
            `}</style>

            <div className="relative min-h-screen overflow-x-hidden text-slate-900">
                {/* =====================================================
                    BACKGROUND
                ====================================================== */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="dashboard-gradient absolute inset-0 bg-gradient-to-br from-[#061540] via-[#1447b8] to-[#3bb4f2]" />

                    <div className="dashboard-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-cyan-300/25 blur-[90px]" />
                    <div className="dashboard-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-400/25 blur-[100px]" />
                    <div className="dashboard-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-300/20 blur-[100px]" />
                </div>

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <header className="sticky top-0 z-50 border-b border-white/20 bg-[#061540]/50 shadow-[0_8px_30px_rgba(2,6,23,0.20)] backdrop-blur-2xl">
                    <div className="mx-auto flex h-[68px] max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Buka menu"
                            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg"
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

                {/* =====================================================
                    SIDEBAR
                ====================================================== */}
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
                    {/* HEADER */}
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
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                        >
                            <Icon d={ICON_CLOSE} className="h-4 w-4" strokeWidth={2} />
                        </button>
                    </div>

                    {/* MENU */}
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

                    {/* FOOTER */}
                    <div className="border-t border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-center text-[11px] font-medium text-white/50">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>
                    </div>
                </aside>

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6">
                    {/* ---------------- MAIN CARD ---------------- */}
                    <div
                        style={{ transitionDelay: '200ms' }}
                        className={`mb-5 overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                            pageLoaded
                        )}`}
                    >
                        {/* ========== PERIOD REPORT ========== */}
                        <section className="min-w-0 overflow-hidden border-b border-slate-200/70">
                            <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                                <SectionTitle
                                    icon={ICON_CHART}
                                    tone="blue"
                                    tag="Period report"
                                    title="ACT & Plan per Periode"
                                    description="Perbandingan progres preventif berdasarkan periode yang dipilih."
                                >
                                    <div className="flex flex-wrap items-end gap-2">
                                        <Field id="bulan_mulai" label="Dari bulan" width={118}>
                                            <select
                                                id="bulan_mulai"
                                                value={selectedAnnualStartMonth}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value);
                                                    setSelectedAnnualStartMonth(value);

                                                    if (value > selectedAnnualEndMonth) {
                                                        setSelectedAnnualEndMonth(value);
                                                    }
                                                }}
                                                className={selectBlue}
                                            >
                                                {Object.entries(namaBulan).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field id="bulan_selesai" label="Sampai bulan" width={118}>
                                            <select
                                                id="bulan_selesai"
                                                value={selectedAnnualEndMonth}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value);

                                                    if (value >= selectedAnnualStartMonth) {
                                                        setSelectedAnnualEndMonth(value);
                                                    }
                                                }}
                                                className={selectBlue}
                                            >
                                                {Object.entries(namaBulan)
                                                    .filter(
                                                        ([value]) =>
                                                            Number(value) >= selectedAnnualStartMonth
                                                    )
                                                    .map(([value, label]) => (
                                                        <option key={value} value={value}>
                                                            {label}
                                                        </option>
                                                    ))}
                                            </select>
                                        </Field>

                                        <Field id="tahun_period" label="Tahun" width={92}>
                                            <select
                                                id="tahun_period"
                                                value={selectedYear}
                                                onChange={(event) =>
                                                    setSelectedYear(Number(event.target.value))
                                                }
                                                className={selectBlue}
                                            >
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <ActionButton onClick={sendFilter} />
                                    </div>
                                </SectionTitle>
                            </div>

                            {/* RANGE INFO */}
                            <div className="px-5 pt-4 sm:px-6">
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
                                    <div>
                                        <p className="text-[11px] font-semibold text-blue-600">
                                            Periode laporan
                                        </p>
                                        <p className="mt-0.5 text-sm font-extrabold text-slate-800">
                                            {namaBulan[selectedAnnualStartMonth]} -{' '}
                                            {namaBulan[selectedAnnualEndMonth]} {selectedYear}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white px-3.5 py-1.5 text-center shadow-sm">
                                        <p className="text-base font-extrabold text-blue-700">
                                            {annualReport.length}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-500">
                                            Bulan
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PERIOD GRAPH */}
                            {annualReport.length > 0 ? (
                                <div className="p-4 sm:p-5">
                                    <div className="dashboard-scrollbar overflow-x-auto pb-1">
                                        <div
                                            className="relative h-[270px]"
                                            style={{
                                                minWidth: `${Math.max(800, annualReport.length * 90)}px`,
                                            }}
                                        >
                                            <div className="absolute inset-0 flex">
                                                {/* Y AXIS */}
                                                <div className="flex w-11 shrink-0 flex-col justify-between pt-8 pb-[49px] pr-2 text-right text-[10px] font-medium text-slate-500">
                                                    {[4, 3, 2, 1, 0].map((value) => (
                                                        <span key={value}>
                                                            {Math.round((maxAnnualChartValue * value) / 4)}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="relative flex-1">
                                                    {/* GRID */}
                                                    <div className="absolute inset-x-0 bottom-14 top-10 flex flex-col justify-between">
                                                        {[0, 1, 2, 3, 4].map((line) => (
                                                            <div
                                                                key={line}
                                                                className="border-t border-dashed border-slate-300/80"
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="absolute inset-x-0 bottom-14 top-10">
                                                        {/* ACT BARS */}
                                                        <div className="absolute inset-0 flex items-end px-5">
                                                            {annualReport.map((item, index) => {
                                                                const act = Number(item.act || 0);
                                                                const actHeight =
                                                                    maxAnnualChartValue > 0
                                                                        ? (act / maxAnnualChartValue) * 100
                                                                        : 0;
                                                                const visualActHeight =
                                                                    act > 0 ? Math.max(actHeight, 3) : 0;

                                                                return (
                                                                    <div
                                                                        key={item.bulan}
                                                                        className="relative flex h-full flex-1 items-end justify-center"
                                                                    >
                                                                        <span
                                                                            className="absolute z-20 whitespace-nowrap text-[11px] font-extrabold text-blue-700 transition-all duration-700"
                                                                            style={{
                                                                                bottom:
                                                                                    chartAnimated && act > 0
                                                                                        ? `min(calc(${visualActHeight}% + 7px), calc(100% - 16px))`
                                                                                        : '0px',
                                                                                opacity:
                                                                                    chartAnimated && act > 0 ? 1 : 0,
                                                                                transform: chartAnimated
                                                                                    ? 'translateY(0)'
                                                                                    : 'translateY(7px)',
                                                                                transitionDelay: `${index * 60}ms`,
                                                                            }}
                                                                        >
                                                                            {act > 0 ? act : ''}
                                                                        </span>

                                                                        <div
                                                                            className="w-9 rounded-t-xl bg-gradient-to-t from-blue-700 to-sky-400 shadow-[0_8px_18px_rgba(37,99,235,0.25)] transition-all duration-700 ease-out hover:from-blue-600 hover:to-cyan-300"
                                                                            style={{
                                                                                height: chartAnimated
                                                                                    ? `${visualActHeight}%`
                                                                                    : '0%',
                                                                                transitionDelay: `${index * 70}ms`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* PLAN LINE + DOTS (sejajar dengan bar ACT) */}
                                                        <div className="pointer-events-none absolute inset-0 z-10 px-5">
                                                            <div className="relative h-full w-full">
                                                                <svg
                                                                    className="absolute inset-0 h-full w-full overflow-visible"
                                                                    viewBox="0 0 100 100"
                                                                    preserveAspectRatio="none"
                                                                >
                                                                    <defs>
                                                                        <linearGradient
                                                                            id="planArea"
                                                                            x1="0"
                                                                            y1="0"
                                                                            x2="0"
                                                                            y2="1"
                                                                        >
                                                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                                                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                                                                        </linearGradient>
                                                                    </defs>

                                                                    <polygon
                                                                        points={annualAreaPoints}
                                                                        fill="url(#planArea)"
                                                                        className="transition-opacity duration-700"
                                                                        style={{ opacity: chartAnimated ? 1 : 0 }}
                                                                    />

                                                                    <polyline
                                                                        points={annualLinePoints}
                                                                        fill="none"
                                                                        stroke="#f59e0b"
                                                                        strokeWidth="2.5"
                                                                        vectorEffect="non-scaling-stroke"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="transition-opacity duration-500"
                                                                        style={{ opacity: chartAnimated ? 1 : 0 }}
                                                                    />
                                                                </svg>

                                                                {/* DOTS (HTML, supaya tetap bulat) */}
                                                                {annualChartPoints.map((point, index) => (
                                                                    <span
                                                                        key={`dot-${index}`}
                                                                        className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-amber-500 bg-white shadow-[0_2px_8px_rgba(245,158,11,0.5)] transition-all duration-500"
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

                                                                {/* PLAN VALUE */}
                                                                {annualChartPoints.map((point, index) => {
                                                                    const item = annualReport[index];
                                                                    const plan = Number(item.plan || 0);

                                                                    if (plan <= 0) return null;

                                                                    return (
                                                                        <span
                                                                            key={`plan-label-${item.bulan}`}
                                                                            className="absolute whitespace-nowrap rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-extrabold text-amber-600 shadow-sm transition-all duration-500"
                                                                            style={{
                                                                                left: `${point.x}%`,
                                                                                top: `calc(${point.y}% - 32px)`,
                                                                                opacity: chartAnimated ? 1 : 0,
                                                                                transform: chartAnimated
                                                                                    ? 'translate(-50%, 0)'
                                                                                    : 'translate(-50%, 6px)',
                                                                                transitionDelay: `${700 + index * 70}ms`,
                                                                            }}
                                                                        >
                                                                            {plan}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BASELINE */}
                                                    <div className="absolute inset-x-0 bottom-14 border-b border-slate-300" />

                                                    {/* MONTH LABEL */}
                                                    <div className="absolute inset-x-0 bottom-0 flex h-11 items-start px-5">
                                                        {annualReport.map((item) => (
                                                            <div key={item.bulan} className="flex-1 text-center">
                                                                <span className="text-[11px] font-bold text-slate-600">
                                                                    {item.nama_bulan}
                                                                </span>
                                                            </div>
                                                        ))}
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
                                            { label: 'Plan', line: true },
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

                        {/* ========== MONTHLY REPORT ========== */}
                        <section className="min-w-0 overflow-hidden">
                            <div className="border-b border-slate-200/70 bg-gradient-to-r from-indigo-50/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                                <SectionTitle
                                    icon={ICON_CALENDAR}
                                    tone="indigo"
                                    tag="Monthly report"
                                    title={`Detail Laporan ${currentMonthName} ${selectedYear}`}
                                    description="Ringkasan kondisi preventive maintenance pada bulan yang dipilih."
                                >
                                    <form
                                        onSubmit={applyFilter}
                                        className="flex flex-wrap items-end gap-2"
                                    >
                                        <Field id="bulan" label="Bulan" width={118}>
                                            <select
                                                id="bulan"
                                                value={selectedMonth}
                                                onChange={(event) =>
                                                    setSelectedMonth(Number(event.target.value))
                                                }
                                                className={selectIndigo}
                                            >
                                                {Object.entries(namaBulan).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field id="tahun" label="Tahun" width={92}>
                                            <select
                                                id="tahun"
                                                value={selectedYear}
                                                onChange={(event) =>
                                                    setSelectedYear(Number(event.target.value))
                                                }
                                                className={selectIndigo}
                                            >
                                                {years.map((year) => (
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

                            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 xl:grid-cols-5">
                                {/* ---------- BAR CHART ---------- */}
                                <section
                                    className={`overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 xl:col-span-3 ${glassInner}`}
                                >
                                    <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4">
                                        <div>
                                            <p className="text-[11px] font-semibold text-blue-600">
                                                Performance
                                            </p>
                                            <h3 className="text-base font-extrabold text-slate-900">
                                                ACT vs Plan per Divisi
                                            </h3>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Perbandingan jadwal yang sudah dan belum dilakukan.
                                            </p>
                                        </div>

                                        <div className="hidden rounded-xl bg-white px-3 py-1.5 text-right shadow-sm sm:block">
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
                                            <div className="px-4 pb-1 pt-3">
                                                <div className="dashboard-scrollbar overflow-x-auto">
                                                    <div
                                                        className="relative h-[240px]"
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
                                    className={`overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 xl:col-span-2 ${glassInner}`}
                                >
                                    <div className="border-b border-slate-200/70 px-5 py-4">
                                        <p className="text-[11px] font-semibold text-amber-600">
                                            Overview
                                        </p>
                                        <h3 className="text-base font-extrabold text-slate-900">
                                            Persentase ACT vs Plan
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Persentase seluruh jadwal preventif.
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-4 p-5">
                                        <div
                                            className="h-36 w-36 rounded-full shadow-[0_15px_35px_rgba(15,23,42,0.20)] transition-transform duration-[1000ms] ease-out"
                                            style={pieStyle}
                                        >
                                            <div className="flex h-full w-full items-center justify-center">
                                                <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_2px_10px_rgba(15,23,42,0.08)]">
                                                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                                                        {Math.round(actPercentage)}%
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-slate-500">
                                                        ACT
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full max-w-sm space-y-2.5">
                                            <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
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
                                                    <p className="text-lg font-extrabold text-blue-600">
                                                        {totalAct}
                                                    </p>
                                                    <p className="text-[11px] font-semibold text-slate-500">
                                                        {actPercentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
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
                                                    <p className="text-lg font-extrabold text-amber-600">
                                                        {totalPlan}
                                                    </p>
                                                    <p className="text-[11px] font-semibold text-slate-500">
                                                        {planPercentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-200/70 pt-3 text-sm">
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
                                    <div className="w-fit rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                        {detail.length} item preventif
                                    </div>
                                )}
                            </SectionTitle>
                        </div>

                        <div className="dashboard-scrollbar overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-slate-200/70 bg-slate-50/80">
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
                                        detail.map((item, index) => {
                                            return (
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
                                            );
                                        })
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

                {/* =====================================================
                    FOOTER
                ====================================================== */}
                <footer className="mt-6 border-t border-white/20 bg-[#061540]/50 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-[1600px] items-center justify-center px-5 text-center text-xs font-medium text-white/75 sm:px-6 lg:px-8">
                        © {new Date().getFullYear()} Emma Sarkilla · Maintenance Monitoring System
                    </div>
                </footer>
            </div>
        </>
    );
}
