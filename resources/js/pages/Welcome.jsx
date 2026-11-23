import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { printLaporanBulanan, printLaporanTahunan, printLaporanLengkap } from './monthlyPdf';
import IntroLoader from './IntroLoader';
import { KpiTile, setDivColors } from './DashKit';
import { AnnualDashboard, MonthlyDashboard } from './PreventifCharts';
import { CheckSheetDashboard } from './CheckSheetChart';
import { OverhaulDashboard } from './OverhaulChart';

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
const ICON_CALENDAR =
    'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z';
const ICON_PLAY = 'M8 5.5v13l11-6.5z';
const ICON_PAUSE = 'M9 5.5v13M15 5.5v13';
const ICON_DOWNLOAD = 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4';
const ICON_CHECK = 'M5 13l4 4L19 7';
const ICON_PENDING = 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z';
const ICON_TREND = 'M3 17l6-6 4 4 8-8M14 7h7v7';
const ICON_TABLE =
    'M3.5 10h17M9 4.5v15M15 4.5v15M5.5 4.5h13a2 2 0 012 2v11a2 2 0 01-2 2h-13a2 2 0 01-2-2v-11a2 2 0 012-2z';
const ICON_CLOSE = 'M6 6l12 12M18 6L6 18';

/* ------------------------------------------------------------------
| MENU + URUTAN SLIDE (berputar otomatis)
| Preventif tahunan -> Preventif bulanan -> Check Sheet -> Overhaul
------------------------------------------------------------------ */
const SECTIONS = [
    { id: 'preventif', label: 'Preventive', icon: ICON_CHART },
    { id: 'checksheet', label: 'Check Sheet', icon: ICON_SHEET },
    { id: 'overhaul', label: 'Overhaul', icon: ICON_GEAR },
];

const SLIDES = [
    { section: 'preventif', key: 'annual' },
    { section: 'preventif', key: 'monthly' },
    { section: 'checksheet', key: 'checksheet' },
    { section: 'overhaul', key: 'overhaul' },
];

const TONE = {
    indigo: '#4f46e5',
    blue: '#2563eb',
    amber: '#f59e0b',
    emerald: '#10b981',
    magenta: '#f0359b',
};

/* ------------------------------------------------------------------
| HELPER
------------------------------------------------------------------ */
const monthIndex = (year, month) => Number(year) * 12 + Number(month);

const YEARS = Array.from({ length: 2040 - 2020 + 1 }, (_, i) => 2020 + i);
const YEAR_OPTIONS = YEARS.map((year) => ({ value: year, label: year }));
const DURATION_OPTIONS = [6, 10, 15, 20, 30, 60, 120];
const BULAN_PER_TABEL = 12;

const statusText = (pct) =>
    pct >= 100 ? 'Target tercapai' : pct >= 75 ? 'Hampir tercapai' : 'Perlu dipercepat';

/* ------------------------------------------------------------------
| CSS HALAMAN
------------------------------------------------------------------ */
const DASHBOARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.dash-root {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.dash-root select option { background: #fff; color: #0f172a; }

@keyframes slideProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes pageFade {
    from { opacity: 0; transform: scale(0.992); }
    to { opacity: 1; transform: scale(1); }
}
@keyframes drawerUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
.page-fade { animation: pageFade 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.drawer-up { animation: drawerUp 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }

.dash-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.dash-scroll::-webkit-scrollbar-track { background: transparent; }
.dash-scroll::-webkit-scrollbar-thumb { background: rgba(143, 155, 209, 0.35); border-radius: 999px; }

@media (prefers-reduced-motion: reduce) {
    .page-fade, .drawer-up { animation: none !important; }
}
`;

/* ------------------------------------------------------------------
| JAM LIVE
------------------------------------------------------------------ */
function LiveClock() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);

        return () => clearInterval(id);
    }, []);

    return (
        <div className="hidden text-right xl:block">
            <p className="text-base font-extrabold leading-none tabular-nums text-white">
                {now.toLocaleTimeString('en-GB')}
            </p>
            <p className="mt-1 text-[10px] font-medium text-[#8f9bd1]">
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
| KOMPONEN KECIL
------------------------------------------------------------------ */
const selCls =
    'h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function Sel({ id, label, width, value, onChange, options }) {
    return (
        <div style={{ width }}>
            <label htmlFor={id} className="mb-0.5 block text-[9px] font-semibold text-sky-200/80">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={selCls}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function PrimaryBtn({ children, type = 'button', onClick }) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 text-[11px] font-bold text-white shadow-lg shadow-blue-950/40 ring-1 ring-white/20 transition hover:brightness-110 active:scale-95"
        >
            {children}
        </button>
    );
}

function GhostBtn({ children, onClick, title, active = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold transition active:scale-95 ${
                active
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-white/25 bg-white text-slate-700 hover:bg-blue-50'
            }`}
        >
            {children}
        </button>
    );
}

function Tabs({ items, active, onChange }) {
    return (
        <div className="flex items-center rounded-xl border border-white/15 bg-white/10 p-0.5">
            {items.map((t) => (
                <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange(t.id)}
                    className={`cursor-pointer rounded-[10px] px-3.5 py-1.5 text-[11px] font-bold transition ${
                        active === t.id
                            ? 'bg-white text-blue-700 shadow'
                            : 'text-white/70 hover:text-white'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}

function EmptyPanel({ text = 'Tidak ada data pada periode ini' }) {
    return (
        <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-white/40 bg-white/90 text-sm font-semibold text-slate-500">
            {text}
        </div>
    );
}

/* Tabel kecil untuk laci "Tabel" */
function DataTable({ groups, columns, rows, foot }) {
    return (
        <table className="w-full min-w-[560px] text-[12px]">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600">
                {groups && (
                    <tr>
                        {groups.map((g, i) => (
                            <th
                                key={i}
                                colSpan={g.span}
                                className="px-3 pt-2 text-center text-[11px] font-bold text-blue-700"
                            >
                                {g.label}
                            </th>
                        ))}
                    </tr>
                )}
                <tr>
                    {columns.map((c, i) => (
                        <th
                            key={i}
                            className={`px-3 py-2 font-semibold ${c.left ? 'text-left' : 'text-center'}`}
                        >
                            {c.label}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
                {rows.map((r, i) => (
                    <tr key={i} className="transition-colors hover:bg-blue-50">
                        {r.map((cell, j) => (
                            <td
                                key={j}
                                className={`px-3 py-1.5 text-slate-700 ${
                                    columns[j]?.left ? 'text-left' : 'text-center'
                                }`}
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>

            {foot && (
                <tfoot className="sticky bottom-0 bg-slate-100 font-extrabold text-slate-900">
                    <tr>
                        {foot.map((cell, j) => (
                            <td
                                key={j}
                                className={`px-3 py-2 ${columns[j]?.left ? 'text-left' : 'text-center'}`}
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            )}
        </table>
    );
}

const cellTone = (cell) => {
    if (!cell) return 'text-slate-300';

    const act = Number(cell.act);
    const jadwal = Number(cell.jadwal);

    if (act >= jadwal) return 'bg-emerald-50 text-emerald-600';
    if (act === 0) return 'bg-amber-50 text-amber-600';

    return 'bg-blue-50 text-blue-600';
};

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
    warnaDivisi = {},
    checkSheet = {
        tahun: new Date().getFullYear(),
        divisi: [],
        laporan: [],
        total: {},
    },
    overhaul = {
        tahun: new Date().getFullYear(),
        bulanan: [],
        totalPlan: 0,
        totalAct: 0,
        persentaseAct: 0,
        jumlahMesin: 0,
    },
}) {
    setDivColors(warnaDivisi);
    const isLoggedIn = Boolean(usePage().props?.auth?.user);

    const [selectedMonth, setSelectedMonth] = useState(Number(bulan));
    const [selectedYear, setSelectedYear] = useState(Number(tahun));

    const [selectedAnnualStartMonth, setSelectedAnnualStartMonth] = useState(Number(bulanMulai));
    const [selectedAnnualStartYear, setSelectedAnnualStartYear] = useState(
        Number(tahunMulai ?? tahun)
    );
    const [selectedAnnualEndMonth, setSelectedAnnualEndMonth] = useState(Number(bulanSelesai));
    const [selectedAnnualEndYear, setSelectedAnnualEndYear] = useState(
        Number(tahunSelesai ?? tahun)
    );

    const [csYear, setCsYear] = useState(Number(checkSheet.tahun));
    const [ohYear, setOhYear] = useState(Number(overhaul.tahun));

    const [introDone, setIntroDone] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [chartAnimated, setChartAnimated] = useState(false);
    const [chartAnimationKey, setChartAnimationKey] = useState(0);
    const [slideDuration, setSlideDuration] = useState(10);
    const [slideIndex, setSlideIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showTable, setShowTable] = useState(false);

    const slide = SLIDES[slideIndex];
    const section = slide.section;
    const activeSlide = slide.key; // 'annual' | 'monthly' | 'checksheet' | 'overhaul'

    // Slide berhenti berputar saat tabel dibuka
    const autoRunning = isPlaying && introDone && !showTable;

    const goToSection = (id) =>
        setSlideIndex(Math.max(0, SLIDES.findIndex((s) => s.section === id)));

    useEffect(() => {
        if (!autoRunning) return undefined;

        const timer = setTimeout(() => {
            setSlideIndex((current) => (current + 1) % SLIDES.length);
        }, Number(slideDuration) * 1000);

        return () => clearTimeout(timer);
    }, [autoRunning, slideIndex, slideDuration]);

    // Tiap slide berganti: reset animasi supaya grafik tumbuh lagi
    useEffect(() => {
        setChartAnimated(false);
        setChartAnimationKey((key) => key + 1);

        if (!introDone) return undefined;

        const chartTimer = setTimeout(() => setChartAnimated(true), 140);

        return () => clearTimeout(chartTimer);
    }, [slideIndex, introDone]);

    useEffect(() => {
        if (!introDone) return undefined;

        const timer = setTimeout(() => setPageLoaded(true), 100);

        return () => clearTimeout(timer);
    }, [introDone]);

    /* ---------------- FILTER ---------------- */
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

    const monthOptions = Object.entries(namaBulan).map(([value, label]) => ({
        value: Number(value),
        label,
    }));

    /* ---------------- PDF ---------------- */
    const downloadMonthlyPdf = () => {
        printLaporanBulanan({
            namaBulan: namaBulan[Number(bulan)] || 'Bulan',
            tahun,
            divisiReport,
            detail,
            totalAct,
            totalPlan,
            totalJadwal,
            warnaDivisi,
        });
    };

    const downloadAnnualPdf = () => {
        printLaporanTahunan({ annualReport, daftarDivisi, annualDetail, warnaDivisi });
    };

    // PDF gabungan. include: 'annual' | 'monthly' | 'checksheet' | 'overhaul'
    // Tanpa argumen = semua bagian dalam satu PDF.
    const downloadPdf = (include) =>
        printLaporanLengkap(
            {
                namaBulan: namaBulan[Number(bulan)] || 'Bulan',
                tahun,
                divisiReport,
                detail,
                totalAct,
                totalPlan,
                totalJadwal,
                annualReport,
                daftarDivisi,
                annualDetail,
                checkSheet,
                overhaul,
                warnaDivisi,
            },
            include
        );

    /* ---------------- DATA PREVENTIF ---------------- */
    const totalForPie = totalAct + totalPlan;
    const actPercentage = totalForPie > 0 ? (totalAct / totalForPie) * 100 : 0;

    const stackDivisi =
        daftarDivisi.length > 0
            ? daftarDivisi
            : Array.from(
                  new Set(annualReport.flatMap((item) => Object.keys(item.act_per_divisi ?? {})))
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

    const annualChunks = [];

    for (let i = 0; i < annualReport.length; i += BULAN_PER_TABEL) {
        annualChunks.push(annualReport.slice(i, i + BULAN_PER_TABEL));
    }

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

    /* ---------------- DATA OVERHAUL ---------------- */
    const ohBulanan = overhaul.bulanan ?? [];
    const ohPlan = Number(overhaul.totalPlan || 0);
    const ohAct = Number(overhaul.totalAct || 0);
    const ohPct = Number(overhaul.persentaseAct || 0);
    const ohBelum = Math.max(ohPlan - ohAct, 0);

    /* ---------------- KPI (ikut bagian aktif) ---------------- */
    const isAnnual = activeSlide === 'annual';
    const icon = (d) => <Icon d={d} className="h-5 w-5" strokeWidth={2} />;

    let kpiInfo;

    if (section === 'preventif') {
        const jadwal = isAnnual ? annualTotalPlan : totalJadwal;
        const act = isAnnual ? annualTotalAct : totalAct;
        const belum = isAnnual ? Math.max(annualTotalPlan - annualTotalAct, 0) : totalPlan;
        const pct = isAnnual ? Number(annualTotalPct) : actPercentage;

        kpiInfo = {
            title: 'Preventive Maintenance',
            period: isAnnual ? periodeLabel : `${namaBulan[Number(bulan)] || 'Bulan'} ${tahun}`,
            cards: [
                {
                    tone: 'indigo',
                    icon: icon(ICON_SHEET),
                    label: 'Total jadwal',
                    value: jadwal,
                    hint: isAnnual
                        ? `${annualReport.length} bulan`
                        : `${detail.length} item`,
                },
                {
                    tone: 'blue',
                    icon: icon(ICON_CHECK),
                    label: 'Sudah preventif',
                    value: act,
                    hint: `${pct.toFixed(1)}% dari jadwal`,
                    progress: pct,
                    ring: true,
                },
                {
                    tone: 'amber',
                    icon: icon(ICON_PENDING),
                    label: 'Belum preventif',
                    value: belum,
                    hint: 'Menunggu dikerjakan',
                    progress: jadwal > 0 ? (belum / jadwal) * 100 : 0,
                    ring: true,
                },
                {
                    tone: 'emerald',
                    icon: icon(ICON_TREND),
                    label: 'Pencapaian',
                    value: pct,
                    decimals: 1,
                    suffix: '%',
                    hint: statusText(pct),
                    progress: pct,
                    ring: true,
                },
            ],
        };
    } else if (section === 'checksheet') {
        kpiInfo = {
            title: 'Check Sheet Prediktif',
            period: `Januari - Desember ${csYear}`,
            cards: [
                {
                    tone: 'indigo',
                    icon: icon(ICON_SHEET),
                    label: 'Terisi',
                    value: csCentang,
                    hint: 'Total centang',
                },
                {
                    tone: 'blue',
                    icon: icon(ICON_CHECK),
                    label: 'Rata-rata pengisian',
                    value: csPersen,
                    decimals: 1,
                    suffix: '%',
                    hint: 'Seluruh divisi',
                    progress: csPersen,
                    ring: true,
                },
                {
                    tone: 'amber',
                    icon: icon(ICON_PENDING),
                    label: 'Abnormality',
                    value: csAbnormal,
                    hint: `${csBulanAbnormal} bulan ada temuan`,
                    progress: csLaporan.length > 0 ? (csBulanAbnormal / csLaporan.length) * 100 : 0,
                    ring: true,
                },
                {
                    tone: 'emerald',
                    icon: icon(ICON_TREND),
                    label: 'Divisi dipantau',
                    value: csDivisi.length,
                    hint: csDivisi.join(', ') || '-',
                },
            ],
        };
    } else {
        kpiInfo = {
            title: 'Overhaul Mesin SC2',
            period: `Januari - Desember ${ohYear}`,
            cards: [
                {
                    tone: 'indigo',
                    icon: icon(ICON_SHEET),
                    label: 'Total plan',
                    value: ohPlan,
                    hint: `${overhaul.jumlahMesin} data mesin`,
                },
                {
                    tone: 'blue',
                    icon: icon(ICON_CHECK),
                    label: 'Sudah overhaul',
                    value: ohAct,
                    hint: `${ohPct.toFixed(1)}% dari plan`,
                    progress: ohPct,
                    ring: true,
                },
                {
                    tone: 'amber',
                    icon: icon(ICON_PENDING),
                    label: 'Belum overhaul',
                    value: ohBelum,
                    hint: 'Menunggu dikerjakan',
                    progress: ohPlan > 0 ? (ohBelum / ohPlan) * 100 : 0,
                    ring: true,
                },
                {
                    tone: 'emerald',
                    icon: icon(ICON_TREND),
                    label: 'Pencapaian',
                    value: ohPct,
                    decimals: 1,
                    suffix: '%',
                    hint: statusText(ohPct),
                    progress: ohPct,
                    ring: true,
                },
            ],
        };
    }

    /* ---------------- ISI LACI TABEL ---------------- */
    const pctTxt = (act, plan) => (plan > 0 ? `${((act / plan) * 100).toFixed(1)}%` : '-');

    let drawer = null;

    if (activeSlide === 'annual') {
        drawer = (
            <div className="space-y-5">
                <DataTable
                    columns={[
                        { label: 'Bulan', left: true },
                        { label: 'Plan' },
                        { label: 'ACT' },
                        { label: 'Belum' },
                        { label: '% ACT' },
                    ]}
                    rows={annualReport.map((r) => [
                        `${r.nama_bulan} ${r.tahun}`,
                        Number(r.plan || 0),
                        Number(r.act || 0),
                        Math.max(Number(r.plan || 0) - Number(r.act || 0), 0),
                        pctTxt(Number(r.act || 0), Number(r.plan || 0)),
                    ])}
                    foot={[
                        'Total',
                        annualTotalPlan,
                        annualTotalAct,
                        Math.max(annualTotalPlan - annualTotalAct, 0),
                        `${annualTotalPct}%`,
                    ]}
                />

                {annualDetail.length > 0 &&
                    annualChunks.map((bulanList, ci) => {
                        const last = ci === annualChunks.length - 1;

                        return (
                            <DataTable
                                key={ci}
                                columns={[
                                    { label: 'Divisi', left: true },
                                    { label: 'Item', left: true },
                                    ...bulanList.map((b) => ({
                                        label: `${String(b.nama_bulan || '').slice(0, 3)} ${String(b.tahun).slice(2)}`,
                                    })),
                                    ...(last ? [{ label: 'Total' }] : []),
                                ]}
                                rows={annualDetail.map((it) => [
                                    it.divisi,
                                    it.item_preventif || '-',
                                    ...bulanList.map((b) => {
                                        const cell = it.bulan?.[`${b.tahun}-${b.bulan}`];

                                        return (
                                            <span
                                                key={`${b.tahun}-${b.bulan}`}
                                                title={cell ? `ACT ${cell.act} dari ${cell.jadwal}` : ''}
                                                className={`inline-flex min-w-[42px] justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${cellTone(cell)}`}
                                            >
                                                {cell ? `${cell.act}/${cell.jadwal}` : '-'}
                                            </span>
                                        );
                                    }),
                                    ...(last ? [`${it.total_act}/${it.total_jadwal}`] : []),
                                ])}
                            />
                        );
                    })}
            </div>
        );
    } else if (activeSlide === 'monthly') {
        drawer = (
            <DataTable
                columns={[
                    { label: 'Divisi', left: true },
                    { label: 'Item', left: true },
                    { label: 'Jadwal' },
                    { label: 'Sudah' },
                    { label: 'Belum' },
                ]}
                rows={detail.map((it) => [
                    it.divisi,
                    it.item_preventif || '-',
                    it.total_jadwal,
                    it.act,
                    it.plan,
                ])}
            />
        );
    } else if (activeSlide === 'checksheet') {
        const nd = csDivisi.length;
        const show = (v, suf = '') => (v === null || v === undefined ? '-' : `${v}${suf}`);

        drawer = (
            <DataTable
                groups={[
                    { label: '', span: 1 },
                    { label: 'Terisi', span: nd },
                    { label: 'Persentase', span: nd },
                    { label: 'Abnormality', span: nd },
                ]}
                columns={[
                    { label: 'Bulan', left: true },
                    ...csDivisi.map((d) => ({ label: d })),
                    ...csDivisi.map((d) => ({ label: d })),
                    ...csDivisi.map((d) => ({ label: d })),
                ]}
                rows={csLaporan.map((m) => [
                    m.nama_bulan,
                    ...csDivisi.map((d) => show(m.centang?.[d])),
                    ...csDivisi.map((d) => show(m.persen?.[d], '%')),
                    ...csDivisi.map((d) => show(m.abnormality?.[d])),
                ])}
                foot={[
                    `Total ${csYear}`,
                    ...csDivisi.map((d) => show(checkSheet.total?.[d]?.centang)),
                    ...csDivisi.map((d) => show(checkSheet.total?.[d]?.persen, '%')),
                    ...csDivisi.map((d) => show(checkSheet.total?.[d]?.abnormality)),
                ]}
            />
        );
    } else {
        drawer = (
            <DataTable
                columns={[
                    { label: 'Bulan', left: true },
                    { label: 'Plan' },
                    { label: 'Act' },
                    { label: 'Pencapaian' },
                ]}
                rows={ohBulanan.map((d) => [
                    d.nama_bulan,
                    d.plan,
                    d.act,
                    d.plan > 0 ? `${Math.round((d.act / d.plan) * 100)}%` : '-',
                ])}
                foot={[`Total ${ohYear}`, ohPlan, ohAct, `${overhaul.persentaseAct}%`]}
            />
        );
    }

    /* ---------------- RENDER ---------------- */
    return (
        <>
            <Head title="Maintenance Monitoring" />
            {!introDone && <IntroLoader onFinish={() => setIntroDone(true)} />}

            <style>{DASHBOARD_CSS}</style>

            <div className="dash-root relative isolate flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-[#030a22] via-[#0a1f5c] to-[#0e4a9a] text-slate-100 xl:h-screen xl:overflow-hidden">
                {/* LATAR */}
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-400/15 blur-[120px]" />
                    <div className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full bg-indigo-500/25 blur-[130px]" />
                </div>

                {/* HEADER */}
                <header className="relative z-40 shrink-0 border-b border-[#232b66]/80 bg-[#080d2b]/90 backdrop-blur-xl">
                    <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-lg shadow-blue-950/50">
                                <Icon d={ICON_BRAND} className="h-5 w-5" />
                            </span>
                            <h1 className="hidden truncate text-sm font-extrabold tracking-tight text-white md:block">
                                Maintenance Dashboard
                            </h1>
                        </div>

                        <nav
                            aria-label="Bagian dashboard"
                            className="dash-scroll ml-1 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/15 bg-white/10 p-1 md:ml-4"
                        >
                            {SECTIONS.map((s) => {
                                const active = section === s.id;

                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => goToSection(s.id)}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                            active
                                                ? 'bg-white text-blue-700 shadow'
                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon d={s.icon} className="h-4 w-4" strokeWidth={2} />
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="ml-auto flex items-center gap-2.5">
                            <GhostBtn
                                onClick={() => setIsPlaying((c) => !c)}
                                title={isPlaying ? 'Jeda pergantian otomatis' : 'Putar pergantian otomatis'}
                                active={!isPlaying}
                            >
                                <Icon
                                    d={isPlaying ? ICON_PAUSE : ICON_PLAY}
                                    strokeWidth={2.2}
                                    className="h-3.5 w-3.5"
                                />
                                <span className="hidden sm:inline">{isPlaying ? 'Jeda' : 'Putar'}</span>
                            </GhostBtn>

                            <select
                                value={slideDuration}
                                onChange={(e) => setSlideDuration(Number(e.target.value))}
                                title="Durasi tiap slide"
                                className="h-8 cursor-pointer rounded-lg border border-white/25 bg-white px-2 text-[11px] font-bold text-slate-700 outline-none hover:bg-blue-50"
                            >
                                {DURATION_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s} dtk
                                    </option>
                                ))}
                            </select>

                            <GhostBtn
                                onClick={() => downloadPdf()}
                                title="Unduh semua laporan (Preventif, Check Sheet, Overhaul)"
                            >
                                <Icon d={ICON_DOWNLOAD} className="h-3.5 w-3.5" strokeWidth={2} />
                                <span className="hidden sm:inline">PDF Semua</span>
                            </GhostBtn>

                            <LiveClock />

                            {!isLoggedIn && (
                                <Link
                                    href="/login"
                                    className="flex h-8 shrink-0 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                                >
                                    <Icon d={ICON_LOGIN} className="h-4 w-4" strokeWidth={2} />
                                    <span className="hidden sm:inline">Login</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* progres pergantian slide */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-white/5">
                        {autoRunning && (
                            <div
                                key={`${slideIndex}-${slideDuration}`}
                                className="h-full origin-left bg-gradient-to-r from-sky-400 via-blue-500 to-white"
                                style={{ animation: `slideProgress ${slideDuration}s linear forwards` }}
                            />
                        )}
                    </div>
                </header>

                {/* MAIN: satu layar, tanpa scroll di layar besar */}
                <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:px-5">
                    {/* BAR JUDUL + FILTER */}
                    <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-4 gap-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            {section === 'preventif' && (
                                <Tabs
                                    active={activeSlide}
                                    onChange={(id) =>
                                        setSlideIndex(Math.max(0, SLIDES.findIndex((s) => s.key === id)))
                                    }
                                    items={[
                                        { id: 'annual', label: 'Periode' },
                                        { id: 'monthly', label: 'Bulanan' },
                                    ]}
                                />
                            )}

                            <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
                                {kpiInfo.title}
                            </h2>

                            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white">
                                <Icon d={ICON_CALENDAR} className="h-3.5 w-3.5" strokeWidth={2} />
                                {kpiInfo.period}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-end gap-2">
                            {activeSlide === 'annual' && (
                                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-2">
                                    <Sel
                                        id="mulai_bulan"
                                        label="Dari"
                                        width={100}
                                        value={selectedAnnualStartMonth}
                                        options={monthOptions}
                                        onChange={(m) =>
                                            handleAnnualStartChange(m, selectedAnnualStartYear)
                                        }
                                    />
                                    <Sel
                                        id="mulai_tahun"
                                        label="Tahun"
                                        width={72}
                                        value={selectedAnnualStartYear}
                                        options={YEAR_OPTIONS}
                                        onChange={(y) =>
                                            handleAnnualStartChange(selectedAnnualStartMonth, y)
                                        }
                                    />
                                    <Sel
                                        id="selesai_bulan"
                                        label="Sampai"
                                        width={100}
                                        value={selectedAnnualEndMonth}
                                        options={monthOptions}
                                        onChange={(m) => handleAnnualEndChange(m, selectedAnnualEndYear)}
                                    />
                                    <Sel
                                        id="selesai_tahun"
                                        label="Tahun"
                                        width={72}
                                        value={selectedAnnualEndYear}
                                        options={YEAR_OPTIONS}
                                        onChange={(y) => handleAnnualEndChange(selectedAnnualEndMonth, y)}
                                    />
                                    <PrimaryBtn type="submit">Tampilkan</PrimaryBtn>
                                    <GhostBtn onClick={downloadAnnualPdf} title="Unduh PDF">
                                        <Icon d={ICON_DOWNLOAD} className="h-3.5 w-3.5" strokeWidth={2} />
                                        PDF
                                    </GhostBtn>
                                </form>
                            )}

                            {activeSlide === 'monthly' && (
                                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-2">
                                    <Sel
                                        id="bulanan_bulan"
                                        label="Bulan"
                                        width={100}
                                        value={selectedMonth}
                                        options={monthOptions}
                                        onChange={setSelectedMonth}
                                    />
                                    <Sel
                                        id="bulanan_tahun"
                                        label="Tahun"
                                        width={72}
                                        value={selectedYear}
                                        options={YEAR_OPTIONS}
                                        onChange={setSelectedYear}
                                    />
                                    <PrimaryBtn type="submit">Tampilkan</PrimaryBtn>
                                    <GhostBtn onClick={downloadMonthlyPdf} title="Unduh PDF">
                                        <Icon d={ICON_DOWNLOAD} className="h-3.5 w-3.5" strokeWidth={2} />
                                        PDF
                                    </GhostBtn>
                                </form>
                            )}

                            {activeSlide === 'checksheet' && (
                                <>
                                    <Sel
                                        id="cs_tahun"
                                        label="Tahun"
                                        width={78}
                                        value={csYear}
                                        options={YEAR_OPTIONS}
                                        onChange={(year) => {
                                            setCsYear(year);
                                            sendFilter({ tahun_checksheet: year });
                                        }}
                                    />
                                    <GhostBtn
                                        onClick={() => downloadPdf(['checksheet'])}
                                        title="Unduh PDF Check Sheet"
                                    >
                                        <Icon d={ICON_DOWNLOAD} className="h-3.5 w-3.5" strokeWidth={2} />
                                        PDF
                                    </GhostBtn>
                                </>
                            )}

                            {activeSlide === 'overhaul' && (
                                <>
                                    <Sel
                                        id="oh_tahun"
                                        label="Tahun"
                                        width={78}
                                        value={ohYear}
                                        options={YEAR_OPTIONS}
                                        onChange={(year) => {
                                            setOhYear(year);
                                            sendFilter({ tahun_overhaul: year });
                                        }}
                                    />
                                    <GhostBtn
                                        onClick={() => downloadPdf(['overhaul'])}
                                        title="Unduh PDF Overhaul"
                                    >
                                        <Icon d={ICON_DOWNLOAD} className="h-3.5 w-3.5" strokeWidth={2} />
                                        PDF
                                    </GhostBtn>
                                    {isLoggedIn && (
                                        <Link
                                            href={`/overhaul-sc2?tahun=${ohYear}`}
                                            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/25 bg-white px-3 text-[11px] font-bold text-slate-700 transition hover:bg-blue-50"
                                        >
                                            <Icon d={ICON_TABLE} className="h-3.5 w-3.5" strokeWidth={2} />
                                            Schedule
                                        </Link>
                                    )}
                                </>
                            )}

                            <GhostBtn onClick={() => setShowTable(true)} title="Lihat tabel rincian">
                                <Icon d={ICON_TABLE} className="h-3.5 w-3.5" strokeWidth={2} />
                                Tabel
                            </GhostBtn>
                        </div>
                    </div>

                    {/* KPI */}
                    <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
                        {kpiInfo.cards.map((card, i) => (
                            <KpiTile
                                key={`${activeSlide}-${card.label}`}
                                color={TONE[card.tone]}
                                icon={card.icon}
                                label={card.label}
                                value={card.value}
                                decimals={card.decimals}
                                suffix={card.suffix}
                                hint={card.hint}
                                progress={card.progress}
                                ring={card.ring}
                                visible={pageLoaded}
                                replayKey={chartAnimationKey}
                                delay={80 * (i + 1)}
                            />
                        ))}
                    </div>

                    {/* GRAFIK (mengisi sisa tinggi layar) */}
                    <div key={activeSlide} className="page-fade min-h-0 flex-1">
                        {activeSlide === 'annual' &&
                            (annualReport.length > 0 ? (
                                <AnnualDashboard
                                    report={annualReport}
                                    stackDivisi={stackDivisi}
                                    annualDetail={annualDetail}
                                    animated={chartAnimated}
                                />
                            ) : (
                                <EmptyPanel />
                            ))}

                        {activeSlide === 'monthly' &&
                            (divisiReport.length > 0 ? (
                                <MonthlyDashboard
                                    divisiReport={divisiReport}
                                    detail={detail}
                                    totalAct={totalAct}
                                    totalPlan={totalPlan}
                                    animated={chartAnimated}
                                />
                            ) : (
                                <EmptyPanel text="Tidak ada jadwal pada bulan ini" />
                            ))}

                        {activeSlide === 'checksheet' && (
                            <CheckSheetDashboard
                                laporan={csLaporan}
                                divisi={csDivisi}
                                total={checkSheet.total ?? {}}
                                animated={chartAnimated}
                            />
                        )}

                        {activeSlide === 'overhaul' && (
                            <OverhaulDashboard
                                data={ohBulanan}
                                pct={ohPct}
                                animated={chartAnimated}
                            />
                        )}
                    </div>
                </main>

                {/* LACI TABEL */}
                {showTable && (
                    <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-[2px]">
                        <button
                            type="button"
                            aria-label="Tutup tabel"
                            className="absolute inset-0 cursor-default"
                            onClick={() => setShowTable(false)}
                        />

                        <div className="drawer-up relative mx-auto flex max-h-[78vh] w-full max-w-[1600px] flex-col rounded-t-3xl border border-b-0 border-white/60 bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    {kpiInfo.title}
                                    <span className="ml-2 text-xs font-semibold text-slate-500">
                                        {kpiInfo.period}
                                    </span>
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => setShowTable(false)}
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-400 hover:text-blue-700"
                                >
                                    <Icon d={ICON_CLOSE} className="h-4 w-4" strokeWidth={2.2} />
                                </button>
                            </div>

                            <div className="dash-scroll overflow-auto p-4">{drawer}</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
