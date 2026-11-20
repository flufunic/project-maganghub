import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { printLaporanBulanan, printLaporanTahunan } from './monthlyPdf';
import IntroLoader from './IntroLoader';
import { SLIDE_BODY_H, AnnualChart, MonthlyChart } from './PreventifCharts';
import { BarChart as CheckSheetBar, CHARTS as CS_CHARTS, warna as csWarna } from './CheckSheetChart';
import { YearlyChart } from './OverhaulChart';

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
const ICON_ARROW = 'M5 12h14m-7-7l7 7-7 7';
const ICON_CALENDAR =
    'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z';
const ICON_EMPTY =
    'M9 17v-2m3 2v-6m3 6v-9M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14';
const ICON_PLAY = 'M8 5.5v13l11-6.5z';
const ICON_PAUSE = 'M9 5.5v13M15 5.5v13';
const ICON_DOWNLOAD = 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4';
const ICON_CHECK = 'M5 13l4 4L19 7';
const ICON_PENDING = 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z';
const ICON_TREND = 'M3 17l6-6 4 4 8-8M14 7h7v7';
const ICON_TABLE = 'M3.5 10h17M9 4.5v15M15 4.5v15M5.5 4.5h13a2 2 0 012 2v11a2 2 0 01-2 2h-13a2 2 0 01-2-2v-11a2 2 0 012-2z';

/* ------------------------------------------------------------------
| MENU HEADER + URUTAN SLIDE (satu daftar, berputar otomatis)
| Preventif tahunan -> Preventif bulanan -> Check Sheet (3 grafik) -> Overhaul
------------------------------------------------------------------ */
const SECTIONS = [
    { id: 'preventif', label: 'Preventive', icon: ICON_CHART },
    { id: 'checksheet', label: 'Check Sheet', icon: ICON_SHEET },
    { id: 'overhaul', label: 'Overhaul', icon: ICON_GEAR },
];

const SLIDES = [
    { section: 'preventif', key: 'annual' },
    { section: 'preventif', key: 'monthly' },
    ...CS_CHARTS.map((c, i) => ({ section: 'checksheet', key: `cs-${i}`, chart: i })),
    { section: 'overhaul', key: 'overhaul' },
];

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const glassCard =
    'border border-white/60 bg-white/[0.9] shadow-[0_24px_70px_rgba(3,10,34,0.35)] backdrop-blur-2xl';

const glassInner =
    'border border-white/70 bg-white/[0.72] shadow-[0_10px_30px_rgba(7,26,77,0.10)] backdrop-blur-xl';

const selectBase =
    'h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm outline-none transition-all focus:ring-2';

const selectBlue = `${selectBase} hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/15`;
const selectIndigo = `${selectBase} hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/15`;

// Animasi masuk (dipakai di banyak tempat)
const enter = (visible) =>
    visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0';

/* ------------------------------------------------------------------
| HELPER
------------------------------------------------------------------ */
const monthIndex = (year, month) => Number(year) * 12 + Number(month);

const YEARS = Array.from({ length: 2040 - 2020 + 1 }, (_, i) => 2020 + i);
const YEAR_OPTIONS = YEARS.map((year) => ({ value: year, label: year }));

const DURATION_OPTIONS = [6, 10, 15, 20, 30, 60, 120];

// Maksimal bulan per tabel rincian periode (sama dengan PDF)
const BULAN_PER_TABEL = 12;

const pctColor = (pct) =>
    pct >= 100
        ? 'from-emerald-400 to-teal-500'
        : pct >= 50
          ? 'from-sky-400 to-blue-600'
          : 'from-amber-300 to-orange-500';

const statusText = (pct) =>
    pct >= 100 ? 'Target tercapai' : pct >= 75 ? 'Hampir tercapai' : 'Perlu dipercepat';

function gearPath(rOuter, rInner, teeth) {
    const step = (Math.PI * 2) / teeth;
    const pts = [];

    for (let i = 0; i < teeth; i++) {
        const a = i * step;
        [
            [a - step * 0.3, rInner],
            [a - step * 0.17, rOuter],
            [a + step * 0.17, rOuter],
            [a + step * 0.3, rInner],
        ].forEach(([ang, r]) =>
            pts.push(`${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`)
        );
    }

    return `M${pts.join('L')}Z`;
}

/* ------------------------------------------------------------------
| CSS HALAMAN
------------------------------------------------------------------ */
const DASHBOARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.dash-root {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}

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
@keyframes slideProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes chartEntrance {
    from { opacity: 0; transform: translateY(14px) scale(0.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes spinBorder { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes gearSpin { to { transform: rotate(360deg); } }
@keyframes gearSpinRev { to { transform: rotate(-360deg); } }
@keyframes ringSpin { to { transform: rotate(360deg); } }
@keyframes rowIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes tipIn {
    from { opacity: 0; transform: translateY(6px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes slideEnter {
    from { opacity: 0; transform: translateX(26px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
@keyframes hdrLine { to { background-position: 420px 0; } }
@keyframes gridDrift { to { background-position: 56px 56px, 56px 56px; } }

/* Grafik Overhaul */
@keyframes idxBarRise {
    from { opacity: .25; transform: scaleY(0.04); }
    to { opacity: .92; transform: scaleY(1); }
}
@keyframes idxLineDraw {
    from { stroke-dasharray: 1200; stroke-dashoffset: 1200; opacity: .25; }
    to { stroke-dasharray: 1200; stroke-dashoffset: 0; opacity: 1; }
}
.idx-bar {
    transform-box: view-box;
    transform-origin: center bottom;
    animation: idxBarRise 0.85s cubic-bezier(.2,.75,.25,1) both;
    filter: drop-shadow(0 2px 2px rgba(234,88,12,.12));
}
.idx-plan-line { animation: idxLineDraw 1.25s ease-out both; }

.dashboard-chart-enter {
    animation: chartEntrance 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: center bottom;
}
.dashboard-plan-svg { transition: clip-path 1400ms cubic-bezier(0.22, 1, 0.36, 1); }

.dashboard-gradient { background-size: 250% 250%; animation: dashboardGradient 18s ease infinite; }
.dashboard-float { animation: dashboardFloat 14s ease-in-out infinite; }
.dashboard-float-reverse { animation: dashboardFloatReverse 17s ease-in-out infinite; }

.dash-grid {
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(ellipse at 50% 25%, #000 15%, transparent 78%);
    mask-image: radial-gradient(ellipse at 50% 25%, #000 15%, transparent 78%);
    animation: gridDrift 30s linear infinite;
}

.spin-border { animation: spinBorder 7s linear infinite; }
.gear-spin { animation: gearSpin 90s linear infinite; }
.gear-spin-rev { animation: gearSpinRev 70s linear infinite; }
.donut-ticks { transform-box: fill-box; transform-origin: center; animation: ringSpin 40s linear infinite; }
.row-reveal { animation: rowIn 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.bar-grow { animation: barGrow 1100ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.tip-in { animation: tipIn 180ms ease-out both; }
.slide-enter { animation: slideEnter 650ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.float-y { animation: floatY 3.2s ease-in-out infinite; }
.hdr-line {
    background-image: linear-gradient(90deg, transparent, #38bdf8, #ffffff, #38bdf8, transparent);
    background-size: 420px 100%;
    background-repeat: repeat-x;
    animation: hdrLine 5s linear infinite;
}

/* Cahaya mengikuti kursor di atas card */
.spot { position: relative; }
.spot::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    transition: opacity 300ms;
    background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(56, 189, 248, 0.16), transparent 60%);
}
.spot:hover::before { opacity: 1; }

.dashboard-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.dashboard-scrollbar::-webkit-scrollbar-track { background: transparent; }
.dashboard-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.35);
    border-radius: 999px;
}

@media (prefers-reduced-motion: reduce) {
    .dashboard-gradient, .dashboard-float, .dashboard-float-reverse, .dashboard-chart-enter,
    .dash-grid, .spin-border, .gear-spin, .gear-spin-rev, .donut-ticks, .row-reveal,
    .bar-grow, .tip-in, .slide-enter, .float-y, .hdr-line, .idx-bar, .idx-plan-line { animation: none !important; }
    .dashboard-plan-svg { transition: none !important; }
}

/* Kursor tangan pada pilihan bulan dan tahun */
select#mulai_bulan, select#mulai_tahun, select#selesai_bulan,
select#selesai_tahun, select#bulanan_bulan, select#bulanan_tahun,
select#cs_tahun, select#oh_tahun { cursor: pointer !important; }
select#mulai_bulan option, select#mulai_tahun option, select#selesai_bulan option,
select#selesai_tahun option, select#bulanan_bulan option, select#bulanan_tahun option,
select#cs_tahun option, select#oh_tahun option { cursor: pointer; }
`;

/* ------------------------------------------------------------------
| ANGKA BERJALAN (count-up)
------------------------------------------------------------------ */
function CountUp({
    value,
    decimals = 0,
    suffix = '',
    start = true,
    replayKey = 0,
    duration = 1300,
    className = '',
}) {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        const to = Number(value) || 0;

        if (!start) {
            setShown(0);

            return undefined;
        }

        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setShown(to);

            return undefined;
        }

        let raf;
        const t0 = performance.now();

        const tick = (now) => {
            const p = Math.min(1, (now - t0) / duration);

            setShown(to * (1 - Math.pow(1 - p, 3)));

            if (p < 1) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [value, start, replayKey, duration]);

    return (
        <span className={className}>
            {shown.toLocaleString('id-ID', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </span>
    );
}

/* ------------------------------------------------------------------
| JAM LIVE (dipisah supaya halaman tidak render ulang tiap detik)
------------------------------------------------------------------ */
function LiveClock() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);

        return () => clearInterval(id);
    }, []);

    return (
        <div className="hidden text-right xl:block">
            <p className="text-lg font-extrabold leading-none tabular-nums text-white">
                {now.toLocaleTimeString('en-GB')}
            </p>
            <p className="mt-1 text-[11px] font-medium text-white/60">
                {now.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------
| LATAR BELAKANG
------------------------------------------------------------------ */
function Backdrop() {
    const gearBig = gearPath(200, 176, 18);
    const gearSmall = gearPath(200, 172, 14);

    return (
        <div className="fixed inset-0 -z-20 overflow-hidden">
            <div className="dashboard-gradient absolute inset-0 bg-gradient-to-br from-[#030a22] via-[#0a1f5c] to-[#0e4a9a]" />
            <div className="dash-grid absolute inset-0" />

            <div className="dashboard-float absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-[100px]" />
            <div className="dashboard-float-reverse absolute right-[-120px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[110px]" />
            <div className="dashboard-float absolute bottom-[-160px] left-[30%] h-[450px] w-[450px] rounded-full bg-sky-400/15 blur-[110px]" />

            <svg
                viewBox="-210 -210 420 420"
                className="gear-spin absolute -bottom-52 -left-44 h-[600px] w-[600px]"
                aria-hidden="true"
            >
                <path d={gearBig} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <circle r="120" fill="none" stroke="rgba(255,255,255,0.07)" />
                <circle r="30" fill="none" stroke="rgba(255,255,255,0.1)" />
            </svg>

            <svg
                viewBox="-210 -210 420 420"
                className="gear-spin-rev absolute -right-40 -top-44 h-[520px] w-[520px]"
                aria-hidden="true"
            >
                <path d={gearSmall} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                <circle r="110" fill="none" stroke="rgba(255,255,255,0.07)" />
                <circle r="28" fill="none" stroke="rgba(255,255,255,0.1)" />
            </svg>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,6,23,0.55)_100%)]" />
        </div>
    );
}

/* ------------------------------------------------------------------
| SMALL COMPONENTS
------------------------------------------------------------------ */
function Field({ id, label, width, children }) {
    return (
        <div style={{ width }}>
            <label htmlFor={id} className="mb-0.5 block text-[9px] font-semibold text-slate-500">
                {label}
            </label>
            {children}
        </div>
    );
}

function PeriodSelect({ id, label, width, value, onChange, options, tone = 'blue' }) {
    return (
        <Field id={id} label={label} width={width}>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className={tone === 'indigo' ? selectIndigo : selectBlue}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </Field>
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

function PdfButton({ tone = 'blue', onClick, title }) {
    const styles =
        tone === 'indigo'
            ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
            : 'border-blue-200 text-blue-700 hover:bg-blue-50';

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`group flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border bg-white px-3 text-[11px] font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${styles}`}
        >
            <Icon
                d={ICON_DOWNLOAD}
                strokeWidth={2}
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
            />
            PDF
        </button>
    );
}

function SectionTitle({ icon, tone, tag, title, description, children }) {
    const tones = {
        blue: 'from-sky-500 to-blue-700',
        indigo: 'from-indigo-500 to-violet-700',
        amber: 'from-amber-400 to-orange-600',
        slate: 'from-slate-600 to-slate-800',
    };

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tones[tone]}`}
                >
                    <Icon d={icon} className="h-5 w-5" strokeWidth={2} />
                </span>

                <div>
                    <p className="text-[11px] font-semibold text-slate-500">{tag}</p>
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
            </div>

            {children}
        </div>
    );
}

function EmptyState({ title, text }) {
    return (
        <div className="m-5 flex h-[215px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60">
            <div className="text-center">
                <div className="float-y mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Icon d={ICON_EMPTY} strokeWidth={2} className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{text}</p>
            </div>
        </div>
    );
}

function TableEmpty({ colSpan, title, text }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-5 py-14 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="float-y mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 shadow-sm">
                        <Icon d={ICON_EMPTY} strokeWidth={2} className="h-6 w-6 text-slate-400" />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{text}</p>
                </div>
            </td>
        </tr>
    );
}

/* Tab Tahunan / Bulanan dengan indikator yang meluncur (khusus Preventive) */
function SlideTabs({ active, onChange }) {
    const tabs = [
        { id: 'annual', label: 'Tahunan' },
        { id: 'monthly', label: 'Bulanan' },
    ];
    const index = Math.max(0, tabs.findIndex((tab) => tab.id === active));

    return (
        <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <span
                className="absolute inset-y-0.5 left-0.5 w-[88px] rounded-[10px] bg-white shadow-md ring-1 ring-blue-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ transform: `translateX(${index * 88}px)` }}
            />

            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={`relative z-10 w-[88px] cursor-pointer rounded-[10px] py-1.5 text-[11px] font-bold transition-colors ${
                        active === tab.id
                            ? 'text-blue-700'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

/* Kartu ringkasan (KPI) */
const KPI_TONES = {
    indigo: { chip: 'from-indigo-500 to-blue-700', glow: 'bg-indigo-400/30', bar: 'from-indigo-400 to-blue-500' },
    blue: { chip: 'from-sky-500 to-blue-700', glow: 'bg-sky-400/30', bar: 'from-sky-400 to-blue-600' },
    amber: { chip: 'from-amber-400 to-orange-600', glow: 'bg-amber-300/40', bar: 'from-amber-300 to-orange-500' },
    emerald: { chip: 'from-emerald-400 to-teal-600', glow: 'bg-emerald-300/40', bar: 'from-emerald-300 to-teal-500' },
};

function KpiCard({
    tone,
    icon,
    label,
    value,
    decimals = 0,
    suffix = '',
    hint,
    progress = 0,
    visible,
    replayKey,
    delay = 0,
}) {
    const t = KPI_TONES[tone];

    return (
        <div
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${enter(visible)}`}
        >
            <div className="spot group relative overflow-hidden rounded-3xl border border-white/60 bg-white/[0.92] p-4 shadow-[0_18px_50px_rgba(3,10,34,0.30)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(3,10,34,0.45)]">
                <span
                    className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150 ${t.glow}`}
                />
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                        <p className="mt-1 text-3xl font-black tabular-nums tracking-tight text-slate-900">
                            <CountUp
                                value={value}
                                decimals={decimals}
                                suffix={suffix}
                                start={visible}
                                replayKey={replayKey}
                            />
                        </p>
                    </div>

                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 ${t.chip}`}
                    >
                        <Icon d={icon} className="h-5 w-5" strokeWidth={2} />
                    </span>
                </div>

                <p className="relative mt-1 truncate text-[11px] font-medium text-slate-500">{hint}</p>

                <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                    {visible && (
                        <div
                            key={replayKey}
                            className={`bar-grow h-full origin-left rounded-full bg-gradient-to-r ${t.bar}`}
                            style={{
                                width: `${Math.min(100, Math.max(progress, 0))}%`,
                                animationDelay: `${delay + 250}ms`,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

/* Donut ACT vs Plan */
function Donut({ pct, hasData, animated, start, replayKey }) {
    const R = 54;
    const C = 2 * Math.PI * R;
    const arc = C * (Math.min(Math.max(pct, 0), 100) / 100);

    return (
        <div className="relative h-36 w-36 shrink-0">
            <svg
                viewBox="0 0 140 140"
                className="h-full w-full -rotate-90 drop-shadow-[0_10px_24px_rgba(37,99,235,0.35)]"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="donutAct" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="donutPlan" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>

                <circle
                    cx="70"
                    cy="70"
                    r="66"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="2 7"
                    opacity="0.55"
                    className="donut-ticks"
                />

                <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={hasData ? 'url(#donutPlan)' : '#e2e8f0'}
                    strokeWidth="16"
                />

                <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke="url(#donutAct)"
                    strokeWidth="16"
                    strokeDasharray={`${animated ? arc : 0} ${C}`}
                    style={{ transition: 'stroke-dasharray 1400ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_2px_10px_rgba(15,23,42,0.10)]">
                    <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900">
                        <CountUp value={pct} suffix="%" start={start} replayKey={replayKey} />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">ACT</span>
                </div>
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
    annualDetail = [],
    daftarDivisi = [],
    bulanMulai = 1,
    tahunMulai,
    bulanSelesai = 12,
    tahunSelesai,
    namaBulan = {},
    // Check Sheet: { tahun, divisi, laporan, total }
    checkSheet = {
        tahun: new Date().getFullYear(),
        divisi: [],
        laporan: [],
        total: {},
    },
    // Overhaul: { tahun, bulanan, totalPlan, totalAct, persentaseAct, jumlahMesin }
    overhaul = {
        tahun: new Date().getFullYear(),
        bulanan: [],
        totalPlan: 0,
        totalAct: 0,
        persentaseAct: 0,
        jumlahMesin: 0,
    },
}) {
    const isLoggedIn = Boolean(usePage().props?.auth?.user);

    const [selectedMonth, setSelectedMonth] = useState(Number(bulan));
    const [selectedYear, setSelectedYear] = useState(Number(tahun));

    // Period report: bulan + tahun awal dan akhir
    const [selectedAnnualStartMonth, setSelectedAnnualStartMonth] = useState(Number(bulanMulai));
    const [selectedAnnualStartYear, setSelectedAnnualStartYear] = useState(
        Number(tahunMulai ?? tahun)
    );
    const [selectedAnnualEndMonth, setSelectedAnnualEndMonth] = useState(Number(bulanSelesai));
    const [selectedAnnualEndYear, setSelectedAnnualEndYear] = useState(
        Number(tahunSelesai ?? tahun)
    );

    // Tahun untuk Check Sheet dan Overhaul
    const [csYear, setCsYear] = useState(Number(checkSheet.tahun));
    const [ohYear, setOhYear] = useState(Number(overhaul.tahun));

    const [introDone, setIntroDone] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [chartAnimated, setChartAnimated] = useState(false);
    const [chartAnimationKey, setChartAnimationKey] = useState(0);
    const [slideDuration, setSlideDuration] = useState(10);

    // Posisi slide di daftar SLIDES (semua halaman jadi satu putaran)
    const [slideIndex, setSlideIndex] = useState(0);

    // Putar / jeda otomatis (diatur lewat tombol Jeda / Putar)
    const [isPlaying, setIsPlaying] = useState(true);

    const slide = SLIDES[slideIndex];
    const section = slide.section; // 'preventif' | 'checksheet' | 'overhaul'
    const activeSlide = slide.key; // 'annual' | 'monthly' | 'cs-0' | 'cs-1' | 'cs-2' | 'overhaul'
    const csConfig = CS_CHARTS[slide.chart ?? 0];

    const autoRunning = isPlaying && introDone;

    const goToSection = (id) =>
        setSlideIndex(Math.max(0, SLIDES.findIndex((s) => s.section === id)));

    // Ganti slide otomatis (baru mulai setelah intro selesai).
    // Timer dibuat ulang setiap slide berganti, jadi hitungan mulai dari awal.
    // Setelah slide terakhir (Overhaul) otomatis kembali ke Preventive.
    useEffect(() => {
        if (!autoRunning) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSlideIndex((current) => (current + 1) % SLIDES.length);
        }, Number(slideDuration) * 1000);

        return () => clearTimeout(timer);
    }, [autoRunning, slideIndex, slideDuration]);

    // Setiap slide berganti (atau intro selesai), reset animasi dan remount grafik
    // supaya animasinya diputar ulang.
    useEffect(() => {
        setChartAnimated(false);
        setChartAnimationKey((key) => key + 1);

        if (!introDone) {
            return undefined;
        }

        const chartTimer = setTimeout(() => setChartAnimated(true), 140);

        return () => clearTimeout(chartTimer);
    }, [slideIndex, introDone]);

    useEffect(() => {
        if (!introDone) return undefined;

        const timer = setTimeout(() => setPageLoaded(true), 100);

        return () => clearTimeout(timer);
    }, [introDone]);

    // Cahaya yang mengikuti kursor di atas card bertanda .spot
    useEffect(() => {
        const onMove = (event) => {
            const el = event.target.closest?.('.spot');

            if (!el) return;

            const rect = el.getBoundingClientRect();

            el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            el.style.setProperty('--my', `${event.clientY - rect.top}px`);
        };

        document.addEventListener('pointermove', onMove, { passive: true });

        return () => document.removeEventListener('pointermove', onMove);
    }, []);

    /* ---------------- FILTER ---------------- */

    // Semua parameter dikirim sekaligus supaya filter satu bagian
    // tidak menghapus pilihan di bagian lain. `override` untuk nilai terbaru.
    const sendFilter = (override = {}) => {
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
                tahun_checksheet: csYear,
                tahun_overhaul: ohYear,
                ...override,
            },
            {
                preserveScroll: true,
                preserveState: true, // slideIndex tidak ke-reset
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

    /* ---------------- PDF ---------------- */

    // Pakai prop `bulan` & `tahun` (data yang benar-benar tampil),
    // bukan state dropdown yang mungkin belum di-"Tampilkan".
    const downloadMonthlyPdf = () => {
        printLaporanBulanan({
            namaBulan: namaBulan[Number(bulan)] || 'Bulan',
            tahun,
            divisiReport,
            detail,
            totalAct,
            totalPlan,
            totalJadwal,
        });
    };

    // Periode yang sedang tampil (annualReport), bukan isi dropdown.
    const downloadAnnualPdf = () => {
        printLaporanTahunan({ annualReport, daftarDivisi, annualDetail });
    };

    // Kelompokkan detail per divisi + tandai baris pertama tiap kelompok
    const groupedDetail = (() => {
        const order = [];
        const map = {};

        detail.forEach((item) => {
            const key = item.divisi || '-';

            if (!map[key]) {
                map[key] = [];
                order.push(key);
            }

            map[key].push(item);
        });

        return order.flatMap((key) =>
            map[key].map((item, i) => ({
                ...item,
                divisi: key,
                _first: i === 0,
                _span: map[key].length,
            }))
        );
    })();

    /* ---------------- DATA PREVENTIF ---------------- */

    const totalForPie = totalAct + totalPlan;
    const actPercentage = totalForPie > 0 ? (totalAct / totalForPie) * 100 : 0;
    const planPercentage = totalForPie > 0 ? (totalPlan / totalForPie) * 100 : 0;

    const stackDivisi =
        daftarDivisi.length > 0
            ? daftarDivisi
            : Array.from(
                  new Set(
                      annualReport.flatMap((item) => Object.keys(item.act_per_divisi ?? {}))
                  )
              );

    const periodeAwal = annualReport[0];
    const periodeAkhir = annualReport[annualReport.length - 1];

    const periodeLabel = periodeAwal
        ? periodeAwal.bulan === periodeAkhir.bulan && periodeAwal.tahun === periodeAkhir.tahun
            ? `${periodeAwal.nama_bulan} ${periodeAwal.tahun}`
            : `${periodeAwal.nama_bulan} ${periodeAwal.tahun} - ${periodeAkhir.nama_bulan} ${periodeAkhir.tahun}`
        : '-';

    const annualTotalAct = annualReport.reduce((sum, item) => sum + Number(item.act || 0), 0);
    const annualTotalPlan = annualReport.reduce((sum, item) => sum + Number(item.plan || 0), 0);
    const annualTotalPct =
        annualTotalPlan > 0 ? ((annualTotalAct / annualTotalPlan) * 100).toFixed(1) : '0.0';

    // Rincian item sudah diurutkan dari controller (divisi lalu no item).
    // Tandai baris pertama tiap divisi untuk sel Divisi yang digabung.
    const groupedAnnualDetail = annualDetail.map((item, i, arr) => {
        const first = i === 0 || arr[i - 1].divisi !== item.divisi;
        let span = 0;

        if (first) {
            for (let j = i; j < arr.length && arr[j].divisi === item.divisi; j++) {
                span++;
            }
        }

        return { ...item, _first: first, _span: span };
    });

    // Pecah bulan per BULAN_PER_TABEL supaya tabel tetap muat
    const annualChunks = [];

    for (let i = 0; i < annualReport.length; i += BULAN_PER_TABEL) {
        annualChunks.push(annualReport.slice(i, i + BULAN_PER_TABEL));
    }

    const cellClass = (cell) => {
        if (!cell) return 'text-slate-300';

        const act = Number(cell.act);
        const jadwal = Number(cell.jadwal);

        if (act >= jadwal) return 'bg-emerald-50 text-emerald-600';
        if (act === 0) return 'bg-amber-50 text-amber-600';

        return 'bg-blue-50 text-blue-600';
    };

    /* ---------------- DATA CHECK SHEET ---------------- */

    const csDivisi = checkSheet.divisi ?? [];
    const csLaporan = checkSheet.laporan ?? [];
    const csTotals = csDivisi.map((d) => checkSheet.total?.[d]).filter(Boolean);

    const csCentang = csTotals.reduce((sum, t) => sum + Number(t.centang || 0), 0);
    const csAbnormal = csTotals.reduce((sum, t) => sum + Number(t.abnormality || 0), 0);

    const csPersenList = csTotals
        .map((t) => t.persen)
        .filter((v) => v !== null && v !== undefined)
        .map(Number);
    const csPersen = csPersenList.length
        ? csPersenList.reduce((sum, v) => sum + v, 0) / csPersenList.length
        : 0;

    const csBulanAbnormal = csLaporan.filter((m) =>
        csDivisi.some((d) => Number(m.abnormality?.[d] || 0) > 0)
    ).length;

    const csCell = (m, d) => {
        const v = m[csConfig.key]?.[d];

        if (v === null || v === undefined) return '-';

        return csConfig.key === 'persen' ? `${v}%` : v;
    };

    const csTotalCell = (d) => {
        const v = checkSheet.total?.[d]?.[csConfig.key];

        if (v === null || v === undefined) return '-';

        return csConfig.key === 'persen' ? `${v}%` : v;
    };

    /* ---------------- DATA OVERHAUL ---------------- */

    const ohBulanan = overhaul.bulanan ?? [];
    const ohPlan = Number(overhaul.totalPlan || 0);
    const ohAct = Number(overhaul.totalAct || 0);
    const ohPct = Number(overhaul.persentaseAct || 0);
    const ohBelum = Math.max(ohPlan - ohAct, 0);

    const ohPersenBulan = (d) =>
        d.plan > 0 ? `${Math.round((d.act / d.plan) * 100)}%` : '-';

    /* ---------------- KPI (ikut bagian yang aktif) ---------------- */

    const isAnnual = activeSlide === 'annual';

    let kpiInfo;

    if (section === 'preventif') {
        const jadwal = isAnnual ? annualTotalPlan : totalJadwal;
        const act = isAnnual ? annualTotalAct : totalAct;
        const belum = isAnnual ? Math.max(annualTotalPlan - annualTotalAct, 0) : totalPlan;
        const pct = isAnnual ? Number(annualTotalPct) : actPercentage;

        kpiInfo = {
            tag: isAnnual ? 'Ringkasan periode' : 'Ringkasan bulanan',
            title: 'Performa Preventive Maintenance',
            period: isAnnual ? periodeLabel : `${namaBulan[Number(bulan)] || 'Bulan'} ${tahun}`,
            cards: [
                {
                    tone: 'indigo',
                    icon: ICON_SHEET,
                    label: 'Total jadwal',
                    value: jadwal,
                    hint: isAnnual
                        ? `${annualReport.length} bulan dalam periode`
                        : `${detail.length} item preventif`,
                    progress: 100,
                },
                {
                    tone: 'blue',
                    icon: ICON_CHECK,
                    label: 'Sudah preventif (ACT)',
                    value: act,
                    hint: `${pct.toFixed(1)}% dari total jadwal`,
                    progress: pct,
                },
                {
                    tone: 'amber',
                    icon: ICON_PENDING,
                    label: 'Belum preventif',
                    value: belum,
                    hint: 'Masih menunggu dikerjakan',
                    progress: jadwal > 0 ? (belum / jadwal) * 100 : 0,
                },
                {
                    tone: 'emerald',
                    icon: ICON_TREND,
                    label: 'Pencapaian',
                    value: pct,
                    decimals: 1,
                    suffix: '%',
                    hint: statusText(pct),
                    progress: pct,
                },
            ],
        };
    } else if (section === 'checksheet') {
        kpiInfo = {
            tag: 'Ringkasan tahunan',
            title: 'Performa Check Sheet Prediktif',
            period: `Januari - Desember ${csYear}`,
            cards: [
                {
                    tone: 'indigo',
                    icon: ICON_SHEET,
                    label: 'Check sheet terisi',
                    value: csCentang,
                    hint: 'Total centang dalam setahun',
                    progress: 100,
                },
                {
                    tone: 'blue',
                    icon: ICON_CHECK,
                    label: 'Rata-rata pengisian',
                    value: csPersen,
                    decimals: 1,
                    suffix: '%',
                    hint: 'Rata-rata seluruh divisi',
                    progress: csPersen,
                },
                {
                    tone: 'amber',
                    icon: ICON_PENDING,
                    label: 'Abnormality',
                    value: csAbnormal,
                    hint: `${csBulanAbnormal} bulan ada temuan`,
                    progress: csLaporan.length > 0 ? (csBulanAbnormal / csLaporan.length) * 100 : 0,
                },
                {
                    tone: 'emerald',
                    icon: ICON_TREND,
                    label: 'Divisi dipantau',
                    value: csDivisi.length,
                    hint: csDivisi.join(', ') || '-',
                    progress: 100,
                },
            ],
        };
    } else {
        kpiInfo = {
            tag: 'Ringkasan tahunan',
            title: 'Performa Overhaul Mesin SC2',
            period: `Januari - Desember ${ohYear}`,
            cards: [
                {
                    tone: 'indigo',
                    icon: ICON_SHEET,
                    label: 'Total plan',
                    value: ohPlan,
                    hint: `${overhaul.jumlahMesin} data mesin`,
                    progress: 100,
                },
                {
                    tone: 'blue',
                    icon: ICON_CHECK,
                    label: 'Sudah overhaul (Act)',
                    value: ohAct,
                    hint: `${ohPct.toFixed(1)}% dari total plan`,
                    progress: ohPct,
                },
                {
                    tone: 'amber',
                    icon: ICON_PENDING,
                    label: 'Belum overhaul',
                    value: ohBelum,
                    hint: 'Masih menunggu dikerjakan',
                    progress: ohPlan > 0 ? (ohBelum / ohPlan) * 100 : 0,
                },
                {
                    tone: 'emerald',
                    icon: ICON_TREND,
                    label: 'Pencapaian',
                    value: ohPct,
                    decimals: 1,
                    suffix: '%',
                    hint: statusText(ohPct),
                    progress: ohPct,
                },
            ],
        };
    }

    // Judul kecil di kontrol card utama
    const controlTitle =
        section === 'preventif'
            ? 'Laporan ACT & Plan per Periode'
            : section === 'checksheet'
              ? 'Laporan Check Sheet Prediktif'
              : 'Laporan Overhaul Mesin SC2';

    // Animasi baris tabel baru jalan setelah intro selesai
    const rowClass = pageLoaded ? 'row-reveal' : 'opacity-0';
    const rowDelay = (index, step = 30) => ({
        animationDelay: `${Math.min(index * step, 450)}ms`,
    });

    /* ---------------- RENDER ---------------- */

    return (
        <>
            <Head title="Maintenance Monitoring" />
            {!introDone && <IntroLoader onFinish={() => setIntroDone(true)} />}

            <style>{DASHBOARD_CSS}</style>

            <div className="dash-root relative min-h-screen overflow-x-hidden text-slate-900">
                <Backdrop />

                {/* HEADER (logo + menu bagian + login) */}
                <header className="sticky top-0 z-50 border-b border-white/15 bg-[#030a22]/55 shadow-[0_8px_30px_rgba(2,6,23,0.30)] backdrop-blur-2xl">
                    <div className="hdr-line pointer-events-none absolute inset-x-0 bottom-0 h-px" />

                    <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 animate-pulse rounded-xl bg-cyan-300/40 blur-xl" />
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-gradient-to-br from-sky-500 to-blue-800 shadow-xl">
                                    <Icon d={ICON_BRAND} className="h-5 w-5 text-white" />
                                </div>
                            </div>

                            <div className="hidden min-w-0 md:block">
                                <h1 className="truncate bg-gradient-to-r from-white to-sky-200 bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg">
                                    Dashboard Maintenance
                                </h1>

                                <p className="mt-0.5 truncate text-[11px] font-medium text-white/60">
                                    Maintenance Monitoring System
                                </p>
                            </div>
                        </div>

                        {/* MENU BAGIAN */}
                        <nav
                            aria-label="Bagian dashboard"
                            className="dashboard-scrollbar ml-1 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/15 bg-white/10 p-1 md:ml-4"
                        >
                            {SECTIONS.map((s) => {
                                const active = section === s.id;

                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => goToSection(s.id)}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all duration-300 ${
                                            active
                                                ? 'bg-white text-blue-700 shadow-md'
                                                : 'text-white/75 hover:bg-white/15 hover:text-white'
                                        }`}
                                    >
                                        <Icon d={s.icon} className="h-4 w-4" strokeWidth={2} />
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="ml-auto flex items-center gap-3">

                            <LiveClock />

                            {!isLoggedIn && (
                                <Link
                                    href="/login"
                                    className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg"
                                >
                                    <Icon d={ICON_LOGIN} className="h-4 w-4" strokeWidth={2} />
                                    <span className="hidden sm:inline">Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6">
                    {/* ---------------- JUDUL + KPI (ikut bagian aktif) ---------------- */}
                    <div
                        className={`mb-4 flex flex-wrap items-end justify-between gap-3 px-1 transition-all duration-700 ease-out ${enter(
                            pageLoaded
                        )}`}
                    >
                        <div key={section + kpiInfo.tag} className="tip-in">
                            <p className="text-xs font-semibold text-sky-200/80">{kpiInfo.tag}</p>
                            <h2 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                {kpiInfo.title}
                            </h2>
                        </div>

                        <div
                            key={kpiInfo.period}
                            className="tip-in flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-xl"
                        >
                            <Icon d={ICON_CALENDAR} className="h-4 w-4 text-sky-300" strokeWidth={2} />
                            {kpiInfo.period}
                        </div>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {kpiInfo.cards.map((card, i) => (
                            <KpiCard
                                key={card.label}
                                {...card}
                                visible={pageLoaded}
                                replayKey={chartAnimationKey}
                                delay={100 * (i + 1)}
                            />
                        ))}
                    </div>

                    {/* ---------------- MAIN CARD (border berputar) ---------------- */}
                    <div
                        style={{ transitionDelay: '500ms' }}
                        className={`relative mb-5 rounded-[30px] bg-white/20 p-[1.5px] transition-all duration-700 ease-out ${enter(
                            pageLoaded
                        )}`}
                    >
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
                            <div
                                className="spin-border absolute left-1/2 top-1/2 h-[260%] w-[260%]"
                                style={{
                                    background:
                                        'conic-gradient(from 0deg, transparent 0%, transparent 62%, #38bdf8 80%, #ffffff 90%, transparent 100%)',
                                }}
                            />
                        </div>

                        <div className={`relative overflow-hidden rounded-[28.5px] ${glassCard}`}>
                            {/* ========== KONTROL GRAFIK ========== */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 bg-white/70 px-3 py-2.5 sm:px-4">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                                    </span>

                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-blue-600">
                                            Dashboard Analytics
                                        </p>
                                        <h2 className="text-sm font-extrabold text-slate-900">
                                            {controlTitle}
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* TAB (menyesuaikan bagian aktif) */}
                                    {section === 'preventif' && (
                                        <SlideTabs
                                            active={activeSlide}
                                            onChange={(id) =>
                                                setSlideIndex(
                                                    Math.max(
                                                        0,
                                                        SLIDES.findIndex((s) => s.key === id)
                                                    )
                                                )
                                            }
                                        />
                                    )}

                                    {section === 'checksheet' && (
                                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                                            {CS_CHARTS.map((c, i) => (
                                                <button
                                                    key={c.key}
                                                    type="button"
                                                    onClick={() =>
                                                        setSlideIndex(
                                                            SLIDES.findIndex(
                                                                (s) =>
                                                                    s.section === 'checksheet' &&
                                                                    s.chart === i
                                                            )
                                                        )
                                                    }
                                                    className={`cursor-pointer rounded-[10px] px-3 py-1.5 text-[11px] font-bold transition ${
                                                        slide.chart === i
                                                            ? 'bg-white text-blue-700 shadow-md ring-1 ring-blue-100'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    {c.tab}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* PUTAR / JEDA */}
                                    <button
                                        type="button"
                                        onClick={() => setIsPlaying((current) => !current)}
                                        title={
                                            isPlaying
                                                ? 'Jeda pergantian otomatis'
                                                : 'Putar pergantian otomatis'
                                        }
                                        className={`flex h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
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
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 transition hover:border-blue-300">
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
                            <div className="h-[3px] overflow-hidden bg-slate-200/60">
                                {autoRunning && (
                                    <div
                                        key={`${slideIndex}-${slideDuration}`}
                                        className="h-full origin-left bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                                        style={{
                                            animation: `slideProgress ${slideDuration}s linear forwards`,
                                        }}
                                    />
                                )}
                            </div>

                            <div>
                                {/* ========== PERIOD REPORT ========== */}
                                {activeSlide === 'annual' && (
                                    <section
                                        key={`annual-chart-${chartAnimationKey}`}
                                        className="slide-enter min-w-0 overflow-hidden"
                                    >
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
                                                    <div className="flex items-end gap-1.5">
                                                        <PeriodSelect
                                                            id="mulai_bulan"
                                                            label="Dari bulan"
                                                            width={104}
                                                            value={selectedAnnualStartMonth}
                                                            options={monthOptions}
                                                            onChange={(month) =>
                                                                handleAnnualStartChange(
                                                                    month,
                                                                    selectedAnnualStartYear
                                                                )
                                                            }
                                                        />
                                                        <PeriodSelect
                                                            id="mulai_tahun"
                                                            label="Tahun"
                                                            width={74}
                                                            value={selectedAnnualStartYear}
                                                            options={YEAR_OPTIONS}
                                                            onChange={(year) =>
                                                                handleAnnualStartChange(
                                                                    selectedAnnualStartMonth,
                                                                    year
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-end gap-1.5">
                                                        <PeriodSelect
                                                            id="selesai_bulan"
                                                            label="Sampai bulan"
                                                            width={104}
                                                            value={selectedAnnualEndMonth}
                                                            options={monthOptions}
                                                            onChange={(month) =>
                                                                handleAnnualEndChange(
                                                                    month,
                                                                    selectedAnnualEndYear
                                                                )
                                                            }
                                                        />
                                                        <PeriodSelect
                                                            id="selesai_tahun"
                                                            label="Tahun"
                                                            width={74}
                                                            value={selectedAnnualEndYear}
                                                            options={YEAR_OPTIONS}
                                                            onChange={(year) =>
                                                                handleAnnualEndChange(
                                                                    selectedAnnualEndMonth,
                                                                    year
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <ActionButton type="submit" />

                                                    <PdfButton
                                                        tone="blue"
                                                        onClick={downloadAnnualPdf}
                                                        title="Unduh laporan periode sebagai PDF"
                                                    />
                                                </form>
                                            </SectionTitle>
                                        </div>

                                        {annualReport.length > 0 ? (
                                            <AnnualChart
                                                report={annualReport}
                                                stackDivisi={stackDivisi}
                                                animated={chartAnimated}
                                            />
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
                                    <section
                                        key={`monthly-chart-${chartAnimationKey}`}
                                        className="slide-enter min-w-0 overflow-hidden"
                                    >
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
                                                    <PeriodSelect
                                                        id="bulanan_bulan"
                                                        label="Bulan"
                                                        width={104}
                                                        tone="indigo"
                                                        value={selectedMonth}
                                                        options={monthOptions}
                                                        onChange={setSelectedMonth}
                                                    />
                                                    <PeriodSelect
                                                        id="bulanan_tahun"
                                                        label="Tahun"
                                                        width={74}
                                                        tone="indigo"
                                                        value={selectedYear}
                                                        options={YEAR_OPTIONS}
                                                        onChange={setSelectedYear}
                                                    />

                                                    <ActionButton type="submit" tone="indigo" />

                                                    <PdfButton
                                                        tone="indigo"
                                                        onClick={downloadMonthlyPdf}
                                                        title="Unduh laporan bulanan sebagai PDF"
                                                    />
                                                </form>
                                            </SectionTitle>
                                        </div>

                                        <div
                                            className={`grid grid-cols-1 gap-3 p-3 sm:p-4 xl:grid-cols-5 ${SLIDE_BODY_H}`}
                                        >
                                            {/* ---------- BAR CHART ---------- */}
                                            <section
                                                className={`spot flex min-h-0 flex-col overflow-hidden rounded-3xl xl:col-span-3 ${glassInner}`}
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
                                                    <MonthlyChart
                                                        divisiReport={divisiReport}
                                                        animated={chartAnimated}
                                                    />
                                                ) : (
                                                    <EmptyState
                                                        title="Tidak ada jadwal preventif"
                                                        text="Tidak ditemukan jadwal pada bulan yang dipilih."
                                                    />
                                                )}
                                            </section>

                                            {/* ---------- DONUT ---------- */}
                                            <section
                                                className={`spot flex min-h-0 flex-col overflow-hidden rounded-3xl xl:col-span-2 ${glassInner}`}
                                            >
                                                <div className="border-b border-slate-200/70 px-5 py-2.5">
                                                    <p className="text-[11px] font-semibold text-amber-600">
                                                        Overview
                                                    </p>
                                                    <h3 className="text-base font-extrabold text-slate-900">
                                                        Persentase ACT vs Plan
                                                    </h3>
                                                </div>

                                                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-3">
                                                    <Donut
                                                        pct={actPercentage}
                                                        hasData={totalForPie > 0}
                                                        animated={chartAnimated}
                                                        start={pageLoaded}
                                                        replayKey={chartAnimationKey}
                                                    />                                                    
                                                    <div className="grid w-full grid-cols-3 gap-2">
                                                        {/* ACT */}
                                                        <div className="flex flex-col justify-center rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center">
                                                            <span className="mx-auto mb-2 h-3 w-3 rounded-full bg-blue-600" />
                                                            <p className="text-xs font-bold text-slate-700">ACT</p>
                                                            <p className="mt-1 text-2xl font-extrabold text-blue-600">
                                                                {totalAct}
                                                            </p>
                                                            <p className="text-xs font-semibold text-slate-500">
                                                                {actPercentage.toFixed(1)}%
                                                            </p>
                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                Sudah preventif
                                                            </p>
                                                        </div>

                                                        {/* PLAN */}
                                                        <div className="flex flex-col justify-center rounded-2xl border border-amber-100 bg-amber-50 p-3 text-center">
                                                            <span className="mx-auto mb-2 h-3 w-3 rounded-full bg-amber-400" />
                                                            <p className="text-xs font-bold text-slate-700">PLAN</p>
                                                            <p className="mt-1 text-2xl font-extrabold text-amber-600">
                                                                {totalPlan}
                                                            </p>
                                                            <p className="text-xs font-semibold text-slate-500">
                                                                {planPercentage.toFixed(1)}%
                                                            </p>
                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                Belum preventif
                                                            </p>
                                                        </div>

                                                        {/* TOTAL */}
                                                        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-100 p-3 text-center">
                                                            <span className="mx-auto mb-2 h-3 w-3 rounded-full bg-slate-500" />
                                                            <p className="text-xs font-bold text-slate-700">TOTAL</p>
                                                            <p className="mt-1 text-2xl font-extrabold text-slate-900">
                                                                {totalJadwal}
                                                            </p>
                                                            <p className="text-xs font-semibold text-slate-500">
                                                                100%
                                                            </p>
                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                Total jadwal
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>
                                            </section>
                                        </div>
                                    </section>
                                )}

                                {/* ========== CHECK SHEET ========== */}
                                {section === 'checksheet' && (
                                    <section
                                        key={`cs-${chartAnimationKey}`}
                                        className="slide-enter min-w-0 overflow-hidden"
                                    >
                                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/80 via-white/40 to-white/40 px-4 py-2.5 sm:px-5">
                                            <SectionTitle
                                                icon={ICON_SHEET}
                                                tone="blue"
                                                tag={`${csConfig.tag} dari ${CS_CHARTS.length}`}
                                                title={csConfig.title}
                                                description={csConfig.desc}
                                            >
                                                <PeriodSelect
                                                    id="cs_tahun"
                                                    label="Tahun"
                                                    width={80}
                                                    value={csYear}
                                                    options={YEAR_OPTIONS}
                                                    onChange={(year) => {
                                                        setCsYear(year);
                                                        sendFilter({ tahun_checksheet: year });
                                                    }}
                                                />
                                            </SectionTitle>
                                        </div>

                                        <div className={`px-3 pb-2 pt-3 sm:px-4 ${SLIDE_BODY_H}`}>
                                            <CheckSheetBar
                                                config={csConfig}
                                                laporan={csLaporan}
                                                divisi={csDivisi}
                                                animated={chartAnimated}
                                            />

                                            {/* LEGENDA + TOTAL SETAHUN */}
                                            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-slate-200/70 px-3 py-2">
                                                {csDivisi.map((d) => (
                                                    <div key={d} className="flex items-center gap-2">
                                                        <span
                                                            className="h-3 w-3 rounded-[4px]"
                                                            style={{ backgroundColor: csWarna(d).solid }}
                                                        />
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {d}
                                                        </span>
                                                        <span className="text-xs font-extrabold text-slate-800">
                                                            {csTotalCell(d)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* ========== OVERHAUL ========== */}
                                {section === 'overhaul' && (
                                    <section
                                        key={`oh-${chartAnimationKey}`}
                                        className="slide-enter min-w-0 overflow-hidden"
                                    >
                                        <div className="border-b border-slate-200/70 bg-gradient-to-r from-amber-50/80 via-white/40 to-white/40 px-4 py-2.5 sm:px-5">
                                            <SectionTitle
                                                icon={ICON_GEAR}
                                                tone="amber"
                                                tag="Overhaul SC2"
                                                title={`Plan vs Act per Bulan ${ohYear}`}
                                                description={`Rekap Januari - Desember dari ${overhaul.jumlahMesin} data mesin. Plan dan Act dihitung dari kotak yang dicentang di schedule.`}
                                            >
                                                <div className="flex flex-wrap items-end gap-2">
                                                    <PeriodSelect
                                                        id="oh_tahun"
                                                        label="Tahun"
                                                        width={80}
                                                        value={ohYear}
                                                        options={YEAR_OPTIONS}
                                                        onChange={(year) => {
                                                            setOhYear(year);
                                                            sendFilter({ tahun_overhaul: year });
                                                        }}
                                                    />

                                                    {/* Halaman schedule butuh login */}
                                                    {isLoggedIn && (
                                                        <Link
                                                            href={`/overhaul-sc2?tahun=${ohYear}`}
                                                            className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                                                        >
                                                            <Icon
                                                                d={ICON_TABLE}
                                                                strokeWidth={2}
                                                                className="h-3.5 w-3.5"
                                                            />
                                                            Lihat Schedule
                                                        </Link>
                                                    )}
                                                </div>
                                            </SectionTitle>
                                        </div>

                                        <div className={`px-3 pb-3 pt-3 sm:px-4 ${SLIDE_BODY_H}`}>
                                            <YearlyChart
                                                key={
                                                    ohYear +
                                                    '-' +
                                                    ohBulanan.map((d) => `${d.plan}-${d.act}`).join('-')
                                                }
                                                data={ohBulanan}
                                            />
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                    | BAGIAN BAWAH: ikut slide yang aktif
                    | Preventif tahunan -> Ringkasan per Bulan + Rincian Item
                    | Preventif bulanan -> Detail Preventive Maintenance
                    | Check Sheet       -> Tabel nilai per bulan per divisi
                    | Overhaul          -> Tabel Plan / Act / Pencapaian
                    ===================================================== */}
                    {section === 'preventif' && activeSlide === 'annual' && (
                        <>
                            {/* ---------------- RINGKASAN PER BULAN ---------------- */}
                            <section
                                style={{ transitionDelay: '600ms' }}
                                className={`spot mb-5 overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                                    pageLoaded
                                )}`}
                            >
                                <div className="border-b border-slate-200/70 bg-gradient-to-r from-blue-50/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                                    <SectionTitle
                                        icon={ICON_CALENDAR}
                                        tone="blue"
                                        tag="Summary report"
                                        title="Ringkasan per Bulan"
                                        description={`Total jadwal (Plan), ACT, dan persentase ACT untuk ${periodeLabel}.`}
                                    >
                                        {annualReport.length > 0 && (
                                            <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                                {annualReport.length} bulan
                                            </p>
                                        )}
                                    </SectionTitle>
                                </div>

                                <div className="dashboard-scrollbar max-h-[420px] overflow-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="sticky top-0 z-10 bg-slate-50">
                                            <tr className="border-b border-slate-200/70 bg-slate-50">
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                                                    Bulan
                                                </th>
                                                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                                                    Total Jadwal (Plan)
                                                </th>
                                                <th className="px-5 py-3.5 text-center text-xs font-semibold text-blue-600">
                                                    ACT
                                                </th>
                                                <th className="px-5 py-3.5 text-center text-xs font-semibold text-amber-600">
                                                    Belum Preventif
                                                </th>
                                                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                                                    % ACT
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-200/60">
                                            {annualReport.length > 0 ? (
                                                annualReport.map((item, index) => {
                                                    const act = Number(item.act || 0);
                                                    const plan = Number(item.plan || 0);
                                                    const pctValue = plan > 0 ? (act / plan) * 100 : 0;

                                                    return (
                                                        <tr
                                                            key={`sum-${item.tahun}-${item.bulan}`}
                                                            style={rowDelay(index)}
                                                            className={`transition-colors hover:bg-blue-50/70 ${rowClass}`}
                                                        >
                                                            <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                                                                {item.nama_bulan} {item.tahun}
                                                            </td>

                                                            <td className="px-5 py-3 text-center">
                                                                <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                                                                    {plan}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-3 text-center">
                                                                <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
                                                                    {act}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-3 text-center">
                                                                <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-600">
                                                                    {Math.max(plan - act, 0)}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-3">
                                                                <div className="mx-auto flex w-40 items-center gap-2">
                                                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                                                        {pageLoaded && (
                                                                            <div
                                                                                className={`bar-grow h-full origin-left rounded-full bg-gradient-to-r ${pctColor(
                                                                                    pctValue
                                                                                )}`}
                                                                                style={{
                                                                                    width: `${Math.min(100, pctValue)}%`,
                                                                                    animationDelay: `${
                                                                                        200 + index * 40
                                                                                    }ms`,
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span className="w-14 text-right text-sm font-bold tabular-nums text-slate-700">
                                                                        {pctValue.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <TableEmpty
                                                    colSpan={5}
                                                    title="Tidak ada data pada periode ini"
                                                    text="Tidak ditemukan jadwal preventif pada periode yang dipilih."
                                                />
                                            )}
                                        </tbody>

                                        {annualReport.length > 0 && (
                                            <tfoot className="sticky bottom-0 bg-slate-100">
                                                <tr className="border-t-2 border-slate-300">
                                                    <td className="px-5 py-3 text-sm font-extrabold text-slate-800">
                                                        Total
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-extrabold text-slate-800">
                                                        {annualTotalPlan}
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-extrabold text-blue-600">
                                                        {annualTotalAct}
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-extrabold text-amber-600">
                                                        {Math.max(annualTotalPlan - annualTotalAct, 0)}
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-extrabold text-slate-800">
                                                        {annualTotalPct}%
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </section>

                            {/* ---------------- RINCIAN ITEM PER BULAN ---------------- */}
                            <section
                                style={{ transitionDelay: '700ms' }}
                                className={`spot overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                                    pageLoaded
                                )}`}
                            >
                                <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-100/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                                    <SectionTitle
                                        icon={ICON_SHEET}
                                        tone="slate"
                                        tag="Detail report"
                                        title="Rincian Item per Bulan"
                                        description={`ACT / Jadwal setiap item preventif untuk ${periodeLabel}.`}
                                    >
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold">
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <span className="h-2.5 w-2.5 rounded bg-emerald-400" />
                                                Selesai semua
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <span className="h-2.5 w-2.5 rounded bg-blue-400" />
                                                Sebagian
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <span className="h-2.5 w-2.5 rounded bg-amber-400" />
                                                Belum
                                            </span>
                                        </div>
                                    </SectionTitle>
                                </div>

                                <div className="dashboard-scrollbar max-h-[520px] overflow-auto">
                                    {groupedAnnualDetail.length > 0 ? (
                                        annualChunks.map((bulanList, chunkIndex) => {
                                            const isLastChunk = chunkIndex === annualChunks.length - 1;

                                            return (
                                                <table
                                                    key={`annual-detail-${chunkIndex}`}
                                                    className={`w-full ${
                                                        chunkIndex > 0 ? 'border-t-4 border-slate-200' : ''
                                                    }`}
                                                    style={{
                                                        minWidth: `${
                                                            380 +
                                                            bulanList.length * 66 +
                                                            (isLastChunk ? 80 : 0)
                                                        }px`,
                                                    }}
                                                >
                                                    <thead className="sticky top-0 z-10 bg-slate-50">
                                                        <tr className="border-b border-slate-200/70 bg-slate-50">
                                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                                                                No
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                                                Divisi
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                                                Item Preventif
                                                            </th>

                                                            {bulanList.map((b) => (
                                                                <th
                                                                    key={`head-${b.tahun}-${b.bulan}`}
                                                                    className="px-1.5 py-3 text-center text-xs font-semibold text-slate-500"
                                                                >
                                                                    {String(b.nama_bulan || '').slice(0, 3)}
                                                                    <span className="block text-[9px] font-semibold text-slate-400">
                                                                        {b.tahun}
                                                                    </span>
                                                                </th>
                                                            ))}

                                                            {isLastChunk && (
                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                                                                    Total
                                                                </th>
                                                            )}
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-slate-200/60">
                                                        {groupedAnnualDetail.map((item, index) => (
                                                            <tr
                                                                key={`${item.divisi}-${item.no_item}-${index}`}
                                                                style={rowDelay(index, 25)}
                                                                className={`transition-colors hover:bg-blue-50/70 ${
                                                                    item._first
                                                                        ? 'border-t-2 border-slate-200'
                                                                        : ''
                                                                } ${rowClass}`}
                                                            >
                                                                <td className="px-4 py-3 text-center text-sm font-semibold text-slate-400">
                                                                    {index + 1}
                                                                </td>

                                                                {item._first && (
                                                                    <td
                                                                        rowSpan={item._span}
                                                                        className="border-r border-blue-100 bg-blue-50/60 px-4 py-3 align-middle"
                                                                    >
                                                                        <span className="inline-flex rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-blue-800 shadow-sm">
                                                                            {item.divisi}
                                                                        </span>
                                                                    </td>
                                                                )}

                                                                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                                                    {item.item_preventif || '-'}
                                                                </td>

                                                                {bulanList.map((b) => {
                                                                    const cell =
                                                                        item.bulan?.[`${b.tahun}-${b.bulan}`];

                                                                    return (
                                                                        <td
                                                                            key={`cell-${b.tahun}-${b.bulan}`}
                                                                            className="px-1 py-2 text-center"
                                                                        >
                                                                            <span
                                                                                title={
                                                                                    cell
                                                                                        ? `${b.nama_bulan} ${b.tahun}: ACT ${cell.act} dari ${cell.jadwal}`
                                                                                        : 'Tidak ada jadwal'
                                                                                }
                                                                                className={`inline-flex min-w-[46px] items-center justify-center rounded-lg px-1.5 py-1 text-xs font-bold transition-transform duration-200 hover:scale-110 ${cellClass(
                                                                                    cell
                                                                                )}`}
                                                                            >
                                                                                {cell
                                                                                    ? `${cell.act}/${cell.jadwal}`
                                                                                    : '-'}
                                                                            </span>
                                                                        </td>
                                                                    );
                                                                })}

                                                                {isLastChunk && (
                                                                    <td className="px-4 py-3 text-center text-sm font-extrabold text-slate-800">
                                                                        {item.total_act}/{item.total_jadwal}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            );
                                        })
                                    ) : (
                                        <table className="w-full">
                                            <tbody>
                                                <TableEmpty
                                                    colSpan={4}
                                                    title="Tidak ada rincian item"
                                                    text="Tidak ditemukan item preventif pada periode yang dipilih."
                                                />
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {groupedAnnualDetail.length > 0 && (
                                    <div className="border-t border-slate-200/70 bg-slate-50/70 px-5 py-3.5 sm:px-6">
                                        <div className="flex flex-col gap-2 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                            <span>
                                                Menampilkan{' '}
                                                <span className="font-bold text-slate-700">
                                                    {groupedAnnualDetail.length}
                                                </span>{' '}
                                                item preventif
                                            </span>

                                            <span>
                                                Total{' '}
                                                <span className="font-bold text-slate-700">
                                                    {annualTotalPlan}
                                                </span>{' '}
                                                jadwal pada{' '}
                                                <span className="font-bold text-slate-700">
                                                    {annualReport.length}
                                                </span>{' '}
                                                bulan
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {/* ---------------- DETAIL TABLE (PREVENTIF BULANAN) ---------------- */}
                    {section === 'preventif' && activeSlide === 'monthly' && (
                        <section
                            style={{ transitionDelay: '600ms' }}
                            className={`spot overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
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
                                        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
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
                                        {groupedDetail.length > 0 ? (
                                            groupedDetail.map((item, index) => (
                                                <tr
                                                    key={`${item.divisi}-${item.no_item}-${index}`}
                                                    style={rowDelay(index, 40)}
                                                    className={`transition-colors hover:bg-blue-50/70 ${
                                                        item._first ? 'border-t-2 border-slate-200' : ''
                                                    } ${rowClass}`}
                                                >
                                                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-slate-400">
                                                        {index + 1}
                                                    </td>

                                                    {/* Divisi digabung (rowSpan) untuk baris berurutan yang sama */}
                                                    {item._first && (
                                                        <td
                                                            rowSpan={item._span}
                                                            className="border-r border-blue-100 bg-blue-50/60 px-5 py-3.5 align-middle"
                                                        >
                                                            <span className="inline-flex rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-blue-800 shadow-sm">
                                                                {item.divisi}
                                                            </span>
                                                        </td>
                                                    )}

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
                                            <TableEmpty
                                                colSpan={6}
                                                title="Tidak ada jadwal preventif"
                                                text="Tidak ditemukan data pada bulan yang dipilih."
                                            />
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
                    )}

                    {/* ---------------- TABEL CHECK SHEET (ikut grafik aktif) ---------------- */}
                    {section === 'checksheet' && (
                        <section
                            style={{ transitionDelay: '600ms' }}
                            className={`spot overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                                pageLoaded
                            )}`}
                        >
                            <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-100/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                                <SectionTitle
                                    icon={ICON_SHEET}
                                    tone="slate"
                                    tag="Detail report"
                                    title={`${csConfig.title} per Divisi`}
                                    description={`Nilai setiap divisi per bulan untuk tahun ${csYear}.`}
                                >
                                    <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                        {csDivisi.length} divisi
                                    </p>
                                </SectionTitle>
                            </div>

                            <div className="dashboard-scrollbar max-h-[420px] overflow-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead className="sticky top-0 z-10 bg-slate-50">
                                        <tr className="border-b border-slate-200/70 bg-slate-50">
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                                                Bulan
                                            </th>
                                            {csDivisi.map((d) => (
                                                <th
                                                    key={d}
                                                    className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500"
                                                >
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className="h-2.5 w-2.5 rounded"
                                                            style={{ backgroundColor: csWarna(d).solid }}
                                                        />
                                                        {d}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/60">
                                        {csLaporan.length > 0 ? (
                                            csLaporan.map((m, index) => (
                                                <tr
                                                    key={m.bulan}
                                                    style={rowDelay(index)}
                                                    className={`transition-colors hover:bg-blue-50/70 ${rowClass}`}
                                                >
                                                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                                                        {m.nama_bulan}
                                                    </td>
                                                    {csDivisi.map((d) => (
                                                        <td key={d} className="px-5 py-3 text-center">
                                                            <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                                                                {csCell(m, d)}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <TableEmpty
                                                colSpan={csDivisi.length + 1}
                                                title="Belum ada data check sheet"
                                                text="Tidak ditemukan data pada tahun yang dipilih."
                                            />
                                        )}
                                    </tbody>

                                    {csLaporan.length > 0 && (
                                        <tfoot className="sticky bottom-0 bg-slate-100">
                                            <tr className="border-t-2 border-slate-300">
                                                <td className="px-5 py-3 text-sm font-extrabold text-slate-800">
                                                    Total {csYear}
                                                </td>
                                                {csDivisi.map((d) => (
                                                    <td
                                                        key={d}
                                                        className="px-5 py-3 text-center text-sm font-extrabold text-slate-800"
                                                    >
                                                        {csTotalCell(d)}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </section>
                    )}

                    {/* ---------------- TABEL OVERHAUL ---------------- */}
                    {section === 'overhaul' && (
                        <section
                            style={{ transitionDelay: '600ms' }}
                            className={`spot overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${glassCard} ${enter(
                                pageLoaded
                            )}`}
                        >
                            <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-100/80 via-white/40 to-white/40 px-5 py-4 sm:px-6">
                                <SectionTitle
                                    icon={ICON_SHEET}
                                    tone="slate"
                                    tag="Detail report"
                                    title="Rincian Overhaul per Bulan"
                                    description={`Plan, Act, dan pencapaian overhaul tahun ${ohYear}.`}
                                >
                                    <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                        {overhaul.jumlahMesin} data mesin
                                    </p>
                                </SectionTitle>
                            </div>

                            <div className="dashboard-scrollbar max-h-[520px] overflow-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead className="sticky top-0 z-10 bg-slate-50">
                                        <tr className="border-b border-slate-200/70 bg-slate-50">
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                                                Bulan
                                            </th>
                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-blue-600">
                                                Plan
                                            </th>
                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-emerald-600">
                                                Act
                                            </th>
                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500">
                                                Pencapaian
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/60">
                                        {ohBulanan.length > 0 ? (
                                            ohBulanan.map((d, index) => (
                                                <tr
                                                    key={d.bulan}
                                                    style={rowDelay(index)}
                                                    className={`transition-colors hover:bg-blue-50/70 ${rowClass}`}
                                                >
                                                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                                                        {d.nama_bulan}
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
                                                            {d.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="inline-flex min-w-[44px] items-center justify-center rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600">
                                                            {d.act}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-bold tabular-nums text-slate-600">
                                                        {ohPersenBulan(d)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <TableEmpty
                                                colSpan={4}
                                                title="Belum ada data overhaul"
                                                text="Tidak ditemukan jadwal pada tahun yang dipilih."
                                            />
                                        )}
                                    </tbody>

                                    {ohBulanan.length > 0 && (
                                        <tfoot className="sticky bottom-0 bg-slate-100">
                                            <tr className="border-t-2 border-slate-300">
                                                <td className="px-5 py-3 text-sm font-extrabold text-slate-800">
                                                    Total {ohYear}
                                                </td>
                                                <td className="px-5 py-3 text-center text-sm font-extrabold text-blue-700">
                                                    {ohPlan}
                                                </td>
                                                <td className="px-5 py-3 text-center text-sm font-extrabold text-emerald-700">
                                                    {ohAct}
                                                </td>
                                                <td className="px-5 py-3 text-center text-sm font-extrabold text-slate-700">
                                                    {overhaul.persentaseAct}%
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </section>
                    )}
                </main>

                {/* FOOTER */}
                <footer className="mt-6 border-t border-white/15 bg-[#030a22]/55 backdrop-blur-2xl">
                    <div className="mx-auto flex min-h-[60px] max-w-[1600px] items-center justify-center px-5 text-center text-xs font-medium text-white/75 sm:px-6 lg:px-8">
                        © {new Date().getFullYear()} Emma Sarkilla · Maintenance Monitoring System
                    </div>
                </footer>
            </div>
        </>
    );
}
