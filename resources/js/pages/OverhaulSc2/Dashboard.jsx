import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

/* ------------------------------------------------------------------
| ICON (header & halaman)
------------------------------------------------------------------ */
const ICONS = {
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    table: {
        rect: { x: 3.5, y: 4.5, width: 17, height: 15, rx: 2 },
        paths: ['M3.5 10h17M9 4.5v15M15 4.5v15'],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];
    if (!icon) return null;

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
            {icon.rect && <rect {...icon.rect} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| ICON (sidebar) - sama seperti di Welcome.jsx
------------------------------------------------------------------ */
function SideIcon({ d, className = 'h-5 w-5', strokeWidth = 1.8 }) {
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
const ICON_CLOSE = 'M6 18L18 6M6 6l12 12';

/* ------------------------------------------------------------------
| MENU SIDEBAR (samakan dengan Welcome.jsx)
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
        active: true, // halaman ini
    },
    {
        href: '/check-sheets',
        title: 'Dashboard Check Sheet',
        subtitle: 'Monitoring Check Sheet',
        icon: ICON_SHEET,
        active: false,
    },
];

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const COLOR_ACT = '#f97316'; // orange-500
const COLOR_PLAN = '#2563eb'; // blue-600
const COLOR_PLAN_LIGHT = '#38bdf8'; // sky-400

/* ------------------------------------------------------------------
| SKALA SUMBU Y
| Cari batas atas yang "bulat" supaya garis grid rapi (5, 10, 20, 50, ...)
------------------------------------------------------------------ */
function niceScale(maxValue, ticks = 5) {
    if (maxValue <= 0) {
        return { max: ticks, step: 1 };
    }

    const rawStep = maxValue / ticks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;

    let niceStep;
    if (residual <= 1) niceStep = 1;
    else if (residual <= 2) niceStep = 2;
    else if (residual <= 5) niceStep = 5;
    else niceStep = 10;

    const step = Math.max(1, niceStep * magnitude);

    return { max: Math.ceil(maxValue / step) * step, step };
}

/* ------------------------------------------------------------------
| GRAFIK TAHUNAN
| Act  = batang (hijau)
| Plan = garis + titik (biru)
------------------------------------------------------------------ */
function YearlyChart({ data }) {
    const W = 900;
    const H = 310;
    const pad = { top: 24, right: 20, bottom: 38, left: 44 };

    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;

    const maxValue = Math.max(0, ...data.map((d) => Math.max(d.plan, d.act)));
    const { max: yMax, step } = niceScale(maxValue);

    const slot = innerW / data.length;
    const barW = Math.min(34, slot * 0.5);

    const xCenter = (i) => pad.left + slot * i + slot / 2;
    const yPos = (v) => pad.top + innerH - (v / yMax) * innerH;

    const gridValues = [];
    for (let v = 0; v <= yMax; v += step) gridValues.push(v);

    const linePoints = data
        .map((d, i) => `${xCenter(i)},${yPos(d.plan)}`)
        .join(' ');

    const kosong = maxValue === 0;

    return (
        <div>
            {/* LEGENDA */}
            <div className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                    <span
                        className="h-3 w-3 rounded-sm border border-orange-300/70"
                        style={{ background: 'linear-gradient(180deg, #fed7aa 0%, #fb923c 48%, #ea580c 100%)' }}
                    />
                    Act (batang)
                </span>

                <span className="inline-flex items-center gap-1.5">
                    <span className="relative inline-block h-3 w-6">
                        <span
                            className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2"
                            style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 55%, #4338ca 100%)' }}
                        />
                        <span
                            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white"
                            style={{ borderColor: COLOR_PLAN }}
                        />
                    </span>
                    Plan (garis)
                </span>
            </div>

            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-auto w-full"
                role="img"
                aria-label="Grafik overhaul per bulan: Act sebagai batang, Plan sebagai garis"
            >
                <defs>
                    {/* Gradasi batang: oranye terang di atas, lebih pekat di bawah */}
                    <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="35%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    {/* Gradasi garis Plan: biru muda ke biru tua */}
                    <linearGradient id="planGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#4338ca" />
                    </linearGradient>
                    <linearGradient id="actLegendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="45%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    <filter id="planGlow" x="-20%" y="-40%" width="140%" height="180%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* GRID + SUMBU Y */}
                {gridValues.map((v) => (
                    <g key={v}>
                        <line
                            x1={pad.left}
                            x2={W - pad.right}
                            y1={yPos(v)}
                            y2={yPos(v)}
                            stroke={v === 0 ? '#94a3b8' : '#e2e8f0'}
                            strokeWidth={v === 0 ? 1.2 : 1}
                            strokeDasharray={v === 0 ? undefined : '4 4'}
                        />
                        <text
                            x={pad.left - 8}
                            y={yPos(v) + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="#64748b"
                        >
                            {v}
                        </text>
                    </g>
                ))}

                {/* BATANG ACT */}
                {data.map((d, i) => {
                    const h = (d.act / yMax) * innerH;

                    return (
                        <g key={`bar-${d.bulan}`}>
                            <title>{`${d.nama_bulan}: Act ${d.act}, Plan ${d.plan}`}</title>

                            {d.act > 0 && (
                                <rect
                                    x={xCenter(i) - barW / 2}
                                    y={yPos(d.act)}
                                    width={barW}
                                    height={h}
                                    rx="4"
                                    fill="url(#actGradient)"
                                    opacity="1"
                                    stroke="#f97316"
                                    strokeOpacity="0.28"
                                    strokeWidth="0.8"
                                    className="idx-bar"
                                    style={{
                                        transformOrigin: `${xCenter(i)}px ${yPos(d.act) + h}px`,
                                        animationDelay: `${i * 45}ms`,
                                    }}
                                />
                            )}
                        </g>
                    );
                })}

                {/* GARIS PLAN */}
                {!kosong && (
                    <>
                        {/* Lapisan tipis di bawah garis untuk efek glow yang lembut */}
                        <polyline
                            points={linePoints}
                            fill="none"
                            stroke="#60a5fa"
                            strokeOpacity="0.22"
                            strokeWidth="7"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        <polyline
                            points={linePoints}
                            fill="none"
                            stroke="url(#planGradient)"
                            strokeWidth="3.2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className="idx-plan-line"
                            filter="url(#planGlow)"
                        />
                    </>
                )}

                {/* TITIK PLAN + ANGKA */}
                {data.map((d, i) => (
                    <g key={`dot-${d.bulan}`}>
                        <circle
                            cx={xCenter(i)}
                            cy={yPos(d.plan)}
                            r="4.5"
                            fill="#fff"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                        />

                        {d.plan > 0 && (
                            <text
                                x={xCenter(i)}
                                y={yPos(d.plan) - 10}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill={COLOR_PLAN}
                                stroke="#fff"
                                strokeWidth="3"
                                paintOrder="stroke"
                            >
                                {d.plan}
                            </text>
                        )}

                        {/* Angka Act di dalam batang (kalau cukup tinggi) */}
                        {d.act > 0 && (
                            <text
                                x={xCenter(i)}
                                y={
                                    (d.act / yMax) * innerH > 22
                                        ? yPos(d.act) + 16
                                        : yPos(d.act) - 6
                                }
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill={
                                    (d.act / yMax) * innerH > 22
                                        ? '#fff'
                                        : COLOR_ACT
                                }
                            >
                                {d.act}
                            </text>
                        )}
                    </g>
                ))}

                {/* LABEL BULAN */}
                {data.map((d, i) => (
                    <text
                        key={`lbl-${d.bulan}`}
                        x={xCenter(i)}
                        y={H - pad.bottom + 22}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill="#475569"
                    >
                        {MONTHS_SHORT[i]}
                    </text>
                ))}

                {kosong && (
                    <text
                        x={W / 2}
                        y={H / 2}
                        textAnchor="middle"
                        fontSize="14"
                        fill="#94a3b8"
                    >
                        Belum ada jadwal yang dicentang pada tahun ini
                    </text>
                )}
            </svg>
        </div>
    );
}

/* ------------------------------------------------------------------
| KARTU RINGKASAN
------------------------------------------------------------------ */
function StatCard({ label, value, hint, tone = 'blue' }) {
    const tones = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        violet: 'text-violet-600 bg-violet-50',
    };

    return (
        <div className={`rounded-2xl p-4 ${glassCard}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900">
                {value}
            </p>

            {hint && (
                <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]}`}
                >
                    {hint}
                </span>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Dashboard({
    tahun,
    bulanan = [],
    totalPlan = 0,
    totalAct = 0,
    persentaseAct = 0,
    jumlahMesin = 0,
}) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedYear, setSelectedYear] = useState(Number(tahun));

    // Tombol "Lihat Schedule" & link Login hanya relevan sesuai status login.
    // Kalau auth.user tidak dikirim lewat shared props, dianggap belum login.
    const isLoggedIn = Boolean(usePage().props?.auth?.user);

    const changeYear = (year) => {
        setSelectedYear(year);

        router.get(
            '/overhaul-dashboard', // route publik (sebelumnya salah: /overhaul-sc2/dashboard)
            { tahun: year },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const persenBulan = (d) =>
        d.plan > 0 ? `${Math.round((d.act / d.plan) * 100)}%` : '-';

    const closeSidebar = () => setShowSidebar(false);

    return (
        <>
            <Head title="Dashboard Overhaul Mesin SC2" />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes idxBarRise {
                    from { opacity: .25; transform: scaleY(0.04); }
                    to { opacity: .92; transform: scaleY(1); }
                }
                @keyframes idxLineDraw {
                    from { stroke-dasharray: 1200; stroke-dashoffset: 1200; opacity: .25; }
                    to { stroke-dasharray: 1200; stroke-dashoffset: 0; opacity: 1; }
                }
                .idx-gradient { background-size: 250% 250%; animation: idxGradient 20s ease infinite; }
                .idx-rise { animation: idxRise 0.55s ease-out both; }
                .idx-bar {
                    transform-box: view-box;
                    transform-origin: center bottom;
                    animation: idxBarRise 0.85s cubic-bezier(.2,.75,.25,1) both;
                    filter: drop-shadow(0 2px 2px rgba(234,88,12,.12));
                }
                .idx-plan-line { animation: idxLineDraw 1.25s ease-out both; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100,116,139,0.4);
                    border-radius: 999px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient, .idx-rise, .idx-bar, .idx-plan-line { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20 overflow-hidden">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />
                    <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
                    <div className="absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
                    <div className="absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-50 border-b border-white/20 bg-[#061540]/50 shadow-[0_8px_30px_rgba(2,6,23,0.20)] backdrop-blur-2xl">
                    <div className="mx-auto flex h-[68px] max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            aria-label="Buka menu"
                            className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg"
                        >
                            <Icon type="menu" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        </button>

                        <div className="mx-4 hidden h-8 w-px bg-white/20 sm:block" />

                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 rounded-xl bg-cyan-300/40 blur-xl" />
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-gradient-to-br from-blue-500 to-blue-800 shadow-xl">
                                    <SideIcon d={ICON_BRAND} className="h-5 w-5 text-white" />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                                        Schedule Overhaul
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

                {/* ---------------- SIDEBAR (sama seperti Welcome.jsx) ---------------- */}
                <div
                    className={`fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-[3px] transition-all duration-300 ${
                        showSidebar
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                    onClick={closeSidebar}
                />

                <aside
                    className={`fixed left-0 top-0 z-[70] flex h-full w-[300px] flex-col border-r border-white/15 bg-gradient-to-b from-[#061540]/95 via-[#0b2a78]/90 to-[#061540]/95 shadow-[20px_0_60px_rgba(2,6,23,0.40)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
                        showSidebar ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg">
                            <SideIcon d={ICON_BRAND} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-sm font-bold text-white">
                                Maintenance System
                            </h2>
                            <p className="mt-0.5 text-[11px] text-white/55">Menu navigasi</p>
                        </div>

                        <button
                            type="button"
                            onClick={closeSidebar}
                            aria-label="Tutup menu"
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                        >
                            <SideIcon d={ICON_CLOSE} className="h-4 w-4" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-5">
                        <p className="mb-2 px-3 text-[11px] font-semibold text-white/45">
                            Dashboard
                        </p>

                        {MENUS.map((menu) => (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                onClick={closeSidebar}
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
                                    <SideIcon d={menu.icon} className="h-5 w-5" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">{menu.title}</p>
                                    <p className="mt-0.5 truncate text-[11px] text-white/55">
                                        {menu.subtitle}
                                    </p>
                                </div>

                                <SideIcon
                                    d={ICON_CHEVRON}
                                    className={`h-4 w-4 transition-all duration-300 ${
                                        menu.active
                                            ? 'text-white'
                                            : 'text-white/30 group-hover:translate-x-0.5 group-hover:text-white'
                                    }`}
                                />
                            </Link>
                        ))}

                        {!isLoggedIn && (
                            <>
                                <div className="my-5 border-t border-white/10" />

                                <p className="mb-2 px-3 text-[11px] font-semibold text-white/45">
                                    Akses
                                </p>

                                <Link
                                    href="/login"
                                    onClick={closeSidebar}
                                    className="group flex items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-white/75 transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80 transition group-hover:bg-white/20 group-hover:text-white">
                                        <SideIcon d={ICON_LOGIN} className="h-5 w-5" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold">Login</p>
                                        <p className="mt-0.5 text-[11px] text-white/55">
                                            Masuk ke sistem administrasi
                                        </p>
                                    </div>

                                    <SideIcon
                                        d={ICON_CHEVRON}
                                        className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white"
                                    />
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="border-t border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-center text-[11px] font-medium text-white/50">
                            © {new Date().getFullYear()} Emma Sarkilla
                        </p>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-2 sm:px-6">
                    {/* TOOLBAR */}
                    <div className={`idx-rise mb-2 overflow-hidden rounded-2xl ${glassCard}`}>
                        <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold tracking-tight text-slate-900">
                                    Overhaul Tahun {selectedYear}
                                </h2>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Rekap Januari - Desember dari {jumlahMesin} data mesin.
                                    Plan dan Act dihitung dari kotak yang dicentang di schedule.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Tahun
                                    </span>

                                    <select
                                        value={selectedYear}
                                        onChange={(e) => changeYear(Number(e.target.value))}
                                        className={selectClass}
                                    >
                                        {Array.from({ length: 31 }, (_, i) => 2020 + i).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {/* Hanya tampil kalau sudah login (halaman schedule butuh login) */}
                                {isLoggedIn && (
                                    <Link
                                        href={`/overhaul-sc2?tahun=${selectedYear}`}
                                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        <Icon type="table" className="h-4 w-4" />
                                        Lihat Schedule
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                    </div>

                    {/* GRAFIK */}
                    <div
                        style={{ animationDelay: '80ms' }}
                        className={`idx-rise mb-2 rounded-2xl p-3 sm:p-3.5 ${glassCard}`}
                    >
                        <h3 className="mb-0.5 text-sm font-bold text-slate-900">
                            Plan vs Act per Bulan
                        </h3>

                        <YearlyChart key={selectedYear + "-" + bulanan.map((d) => `${d.plan}-${d.act}`).join("-")} data={bulanan} />
                    </div>

                    {/* TABEL RINCIAN */}
                    <div
                        style={{ animationDelay: '140ms' }}
                        className={`idx-rise overflow-hidden rounded-2xl ${glassCard}`}
                    >
                        <div className="idx-scroll overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0 text-sm">
                                <thead className="text-white">
                                    <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900">
                                        {['Bulan', 'Plan', 'Act', 'Pencapaian'].map((h, i) => (
                                            <th
                                                key={h}
                                                className={`border-b border-r border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap last:border-r-0 ${
                                                    i === 0 ? 'text-left' : 'text-center'
                                                }`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {bulanan.map((d) => (
                                        <tr
                                            key={d.bulan}
                                            className="transition-colors hover:bg-blue-50/50"
                                        >
                                            <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-700">
                                                {d.nama_bulan}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-2.5 text-center font-bold text-blue-600">
                                                {d.plan}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-2.5 text-center font-bold text-emerald-600">
                                                {d.act}
                                            </td>
                                            <td className="border-b border-slate-100 px-4 py-2.5 text-center text-slate-600">
                                                {persenBulan(d)}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="bg-slate-50">
                                        <td className="px-4 py-3 font-extrabold text-slate-800">
                                            Total {selectedYear}
                                        </td>
                                        <td className="px-4 py-3 text-center font-extrabold text-blue-700">
                                            {totalPlan}
                                        </td>
                                        <td className="px-4 py-3 text-center font-extrabold text-emerald-700">
                                            {totalAct}
                                        </td>
                                        <td className="px-4 py-3 text-center font-extrabold text-slate-700">
                                            {persentaseAct}%
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-[1400px] items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Dashboard Overhaul Mesin SC2
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
