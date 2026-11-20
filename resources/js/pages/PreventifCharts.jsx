import React, { useState } from 'react';

/* ------------------------------------------------------------------
| TINGGI ISI SLIDE (semua slide dibuat sama)
| Ubah angka ini kalau mau card lebih tinggi / pendek.
------------------------------------------------------------------ */
export const SLIDE_BODY_H = 'xl:h-[400px]';

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

    return (
        gradients[divisi] ??
        `linear-gradient(180deg, ${getDivisiColor(divisi, index)} 0%, ${getDivisiColor(divisi, index)} 100%)`
    );
};

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
                    ) : (
                        <span
                            className="h-3 w-3 rounded-[4px]"
                            style={{ backgroundColor: item.color }}
                        />
                    )}
                    <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------
| GRAFIK PERIODE (ACT bertumpuk per divisi + garis Plan)
------------------------------------------------------------------ */
export function AnnualChart({ report, stackDivisi, animated }) {
    const [hover, setHover] = useState(null);

    const maxValue = Math.max(
        1,
        ...report.flatMap((item) => [Number(item.act || 0), Number(item.plan || 0)])
    );

    const spansYears = report.some((item) => item.tahun !== report[0].tahun);

    const points = report.map((item, index) => {
        const total = report.length;
        const x = total === 1 ? 50 : ((index + 0.5) / total) * 100;
        const height = (Number(item.plan || 0) / maxValue) * 100;

        return { x, y: 100 - height };
    });

    const line = points.map((point) => `${point.x},${point.y}`).join(' ');

    // Garis oranye penuh sampai bulan terakhir yang sudah punya ACT
    const lastActIndex = report.reduce(
        (acc, item, i) => (Number(item.act || 0) > 0 ? i : acc),
        -1
    );
    const progressX = lastActIndex >= 0 ? points[lastActIndex].x : (points[0]?.x ?? 0);

    const hovered = hover !== null ? report[hover] : null;

    return (
        <div className={`px-3 pb-2 pt-3 sm:px-4 ${SLIDE_BODY_H}`}>
            <div className="dashboard-scrollbar overflow-x-auto pb-1">
                <div
                    className="dashboard-chart-enter relative h-[330px] sm:h-[350px]"
                    style={{ minWidth: `${Math.max(600, report.length * 65)}px` }}
                >
                    <div className="absolute inset-0 flex">
                        {/* Y AXIS */}
                        <div className="flex w-11 shrink-0 flex-col justify-between pb-[40px] pr-2 pt-6 text-right text-[10px] font-semibold tabular-nums text-slate-500">
                            {[4, 3, 2, 1, 0].map((value) => (
                                <span key={value}>{Math.round((maxValue * value) / 4)}</span>
                            ))}
                        </div>

                        <div className="relative flex-1">
                            {/* GRID */}
                            <div className="absolute inset-x-0 bottom-11 top-7 flex flex-col justify-between">
                                {[0, 1, 2, 3, 4].map((lineIndex) => (
                                    <div
                                        key={lineIndex}
                                        className="border-t border-dashed border-slate-300/70"
                                    />
                                ))}
                            </div>

                            {/* BATANG ACT BERTUMPUK PER DIVISI */}
                            <div className="absolute inset-x-0 bottom-11 top-7 z-0 flex px-3">
                                {report.map((item, index) => {
                                    const act = Number(item.act || 0);
                                    const plan = Number(item.plan || 0);
                                    const actHeight = (act / maxValue) * 100;

                                    const segments = stackDivisi
                                        .map((divisi, divisiIndex) => ({
                                            divisi,
                                            value: Number(item.act_per_divisi?.[divisi] || 0),
                                            gradient: getDivisiGradient(divisi, divisiIndex),
                                            textColor: getDivisiWarna(divisi, divisiIndex).text,
                                        }))
                                        .filter((segment) => segment.value > 0);

                                    // Total ACT di atas batang hanya kalau batang terdiri dari 2+ divisi
                                    const showTotalLabel =
                                        segments.length > 1 &&
                                        act > 0 &&
                                        ((plan - act) / maxValue) * 100 >= 20;

                                    return (
                                        <div
                                            key={`bar-${item.tahun}-${item.bulan}`}
                                            className="relative flex h-full flex-1 items-end justify-center"
                                            onMouseEnter={() => setHover(index)}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            <span
                                                className="absolute inset-x-0.5 inset-y-0 rounded-xl bg-blue-500/[0.08] transition-opacity duration-200"
                                                style={{ opacity: hover === index ? 1 : 0 }}
                                            />

                                            {act > 0 && (
                                                <div
                                                    className="relative flex w-[38px] flex-col-reverse rounded-t-lg transition-all duration-700 ease-out hover:brightness-110"
                                                    style={{
                                                        height: animated
                                                            ? `${Math.max(actHeight, 3)}%`
                                                            : '0%',
                                                        transitionDelay: `${index * 60}ms`,
                                                    }}
                                                >
                                                    {segments.map((segment, segIndex) => {
                                                        const isTop = segIndex === segments.length - 1;

                                                        return (
                                                            <div
                                                                key={segment.divisi}
                                                                title={`${segment.divisi}: ${segment.value}`}
                                                                className={`relative flex min-h-0 items-center justify-center border-t border-white/45 first:border-t-0 ${
                                                                    isTop ? 'rounded-t-lg' : ''
                                                                }`}
                                                                style={{
                                                                    flexGrow: segment.value,
                                                                    flexBasis: 0,
                                                                    background: segment.gradient,
                                                                    boxShadow: isTop
                                                                        ? '0 6px 16px rgba(15, 23, 42, 0.18)'
                                                                        : 'none',
                                                                }}
                                                            >
                                                                <span
                                                                    className="text-[10px] font-extrabold leading-none transition-opacity duration-500"
                                                                    style={{
                                                                        color: segment.textColor,
                                                                        opacity: animated ? 1 : 0,
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
                                                                opacity: animated ? 1 : 0,
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
                                        className="dashboard-plan-svg absolute inset-0 h-full w-full overflow-visible"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        style={{
                                            clipPath: animated
                                                ? 'inset(-15% -3% -15% 0%)'
                                                : 'inset(-15% 100% -15% 0%)',
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="annualPlanGradient"
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="0%"
                                            >
                                                <stop offset="0%" stopColor="#fbbf24" />
                                                <stop offset="48%" stopColor="#f97316" />
                                                <stop offset="100%" stopColor="#ea580c" />
                                            </linearGradient>

                                            <filter
                                                id="annualPlanGlow"
                                                x="-20%"
                                                y="-30%"
                                                width="140%"
                                                height="160%"
                                            >
                                                <feGaussianBlur stdDeviation="1.8" result="blur" />
                                                <feColorMatrix
                                                    in="blur"
                                                    type="matrix"
                                                    values="1 0 0 0 0.96 0 1 0 0 0.48 0 0 1 0 0.05 0 0 0 0.42 0"
                                                    result="glow"
                                                />
                                                <feMerge>
                                                    <feMergeNode in="glow" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>

                                            <clipPath id="annualPlanProgressClip">
                                                <rect
                                                    x="-5"
                                                    y="-30"
                                                    width={Math.max(progressX + 5, 0)}
                                                    height="160"
                                                />
                                            </clipPath>
                                        </defs>

                                        {/* dasar: seluruh garis Plan, pucat */}
                                        <polyline
                                            points={line}
                                            fill="none"
                                            stroke="#fdba74"
                                            strokeWidth="3"
                                            opacity="0.35"
                                            vectorEffect="non-scaling-stroke"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* pencapaian: oranye penuh sampai bulan terakhir yang punya ACT */}
                                        <g clipPath="url(#annualPlanProgressClip)">
                                            <polyline
                                                points={line}
                                                fill="none"
                                                stroke="#fbbf24"
                                                strokeWidth="7"
                                                opacity="0.18"
                                                vectorEffect="non-scaling-stroke"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <polyline
                                                points={line}
                                                fill="none"
                                                stroke="url(#annualPlanGradient)"
                                                strokeWidth="3"
                                                vectorEffect="non-scaling-stroke"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                filter="url(#annualPlanGlow)"
                                            />
                                        </g>
                                    </svg>

                                    {points.map((point, index) => (
                                        <span
                                            key={`plan-dot-${index}`}
                                            className="absolute h-3.5 w-3.5 transition-all duration-500"
                                            style={{
                                                left: `${point.x}%`,
                                                top: `${point.y}%`,
                                                opacity: animated ? 1 : 0,
                                                transform: animated
                                                    ? 'translate(-50%, -50%) scale(1)'
                                                    : 'translate(-50%, -50%) scale(0)',
                                                transitionDelay: `${600 + index * 70}ms`,
                                            }}
                                        >
                                            {index === lastActIndex && (
                                                <span className="absolute inset-0 animate-ping rounded-full bg-orange-400/60" />
                                            )}
                                            <span className="relative block h-full w-full rounded-full border-[3px] border-orange-500 bg-white shadow-[0_2px_10px_rgba(249,115,22,0.45)]" />
                                        </span>
                                    ))}

                                    {points.map((point, index) => {
                                        const item = report[index];
                                        const plan = Number(item.plan || 0);

                                        if (plan <= 0) return null;

                                        return (
                                            <span
                                                key={`plan-label-${item.tahun}-${item.bulan}`}
                                                className="absolute whitespace-nowrap rounded-md border border-orange-100 bg-white/95 px-1.5 py-0.5 text-[11px] font-extrabold text-orange-600 shadow-[0_3px_10px_rgba(249,115,22,0.12)] transition-all duration-500"
                                                style={{
                                                    left: `${point.x}%`,
                                                    top: `calc(${point.y}% - 32px)`,
                                                    opacity: animated ? 1 : 0,
                                                    transform: animated
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

                            {/* TOOLTIP */}
                            {hovered && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-11 top-7 z-20 px-3">
                                    <div className="relative h-full w-full">
                                        <div
                                            className="absolute top-1 w-44"
                                            style={{
                                                left: `${points[hover].x}%`,
                                                transform: `translateX(${
                                                    hover === 0
                                                        ? '-15%'
                                                        : hover === report.length - 1
                                                          ? '-85%'
                                                          : '-50%'
                                                })`,
                                            }}
                                        >
                                            <div className="tip-in rounded-xl border border-white/10 bg-slate-900/95 p-3 text-[11px] text-white shadow-2xl backdrop-blur-md">
                                                <p className="text-xs font-extrabold">
                                                    {hovered.nama_bulan} {hovered.tahun}
                                                </p>

                                                <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400">Plan</p>
                                                        <p className="text-sm font-extrabold text-orange-300">
                                                            {Number(hovered.plan || 0)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400">ACT</p>
                                                        <p className="text-sm font-extrabold text-sky-300">
                                                            {Number(hovered.act || 0)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400">% ACT</p>
                                                        <p className="text-sm font-extrabold text-emerald-300">
                                                            {Number(hovered.plan || 0) > 0
                                                                ? (
                                                                      (Number(hovered.act || 0) /
                                                                          Number(hovered.plan)) *
                                                                      100
                                                                  ).toFixed(0)
                                                                : 0}
                                                            %
                                                        </p>
                                                    </div>
                                                </div>

                                                {stackDivisi.some(
                                                    (divisi) =>
                                                        Number(hovered.act_per_divisi?.[divisi] || 0) > 0
                                                ) && (
                                                    <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                                                        {stackDivisi.map((divisi, divisiIndex) => {
                                                            const value = Number(
                                                                hovered.act_per_divisi?.[divisi] || 0
                                                            );

                                                            if (value <= 0) return null;

                                                            return (
                                                                <div
                                                                    key={divisi}
                                                                    className="flex items-center justify-between gap-2"
                                                                >
                                                                    <span className="flex items-center gap-1.5 text-slate-300">
                                                                        <span
                                                                            className="h-2 w-2 rounded-sm"
                                                                            style={{
                                                                                backgroundColor: getDivisiColor(
                                                                                    divisi,
                                                                                    divisiIndex
                                                                                ),
                                                                            }}
                                                                        />
                                                                        {divisi}
                                                                    </span>
                                                                    <span className="font-bold">{value}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BASELINE */}
                            <div className="absolute inset-x-0 bottom-11 z-10 border-b border-slate-300" />

                            {/* MONTH LABEL */}
                            <div className="absolute inset-x-0 bottom-0 flex h-9 items-start px-3">
                                {report.map((item, index) => (
                                    <div
                                        key={`${item.tahun}-${item.bulan}`}
                                        className="flex-1 text-center"
                                    >
                                        <span
                                            className={`text-[10px] font-bold transition-colors ${
                                                hover === index ? 'text-blue-700' : 'text-slate-600'
                                            }`}
                                        >
                                            {item.nama_bulan}
                                        </span>

                                        {spansYears && (
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
                    {
                        label: 'Plan',
                        line: true,
                        borderClass: 'border-orange-500',
                        dotClass: 'bg-orange-500',
                    },
                ]}
            />
        </div>
    );
}

/* ------------------------------------------------------------------
| GRAFIK BULANAN (ACT vs Plan per divisi)
------------------------------------------------------------------ */
export function MonthlyChart({ divisiReport, animated }) {
    const maxValue = Math.max(
        1,
        ...divisiReport.flatMap((item) => [Number(item.act || 0), Number(item.plan || 0)])
    );

    return (
        <>
            <div className="min-h-[260px] flex-1 px-4 pb-1 pt-3">
                <div className="dashboard-scrollbar h-full overflow-x-auto">
                    <div
                        className="dashboard-chart-enter relative h-full min-h-[240px]"
                        style={{ minWidth: `${Math.max(600, divisiReport.length * 110)}px` }}
                    >
                        <div className="absolute inset-0 flex">
                            {/* Y AXIS */}
                            <div className="flex w-11 shrink-0 flex-col justify-between pb-[52px] pr-2 text-right text-[10px] font-medium tabular-nums text-slate-500">
                                {[4, 3, 2, 1, 0].map((value) => (
                                    <span key={value}>{Math.round((maxValue * value) / 4)}</span>
                                ))}
                            </div>

                            <div className="relative flex-1">
                                {/* GRID */}
                                <div className="absolute inset-x-0 bottom-[52px] top-2 flex flex-col justify-between">
                                    {[0, 1, 2, 3, 4].map((lineIndex) => (
                                        <div
                                            key={lineIndex}
                                            className="border-t border-dashed border-slate-300/80"
                                        />
                                    ))}
                                </div>

                                {/* BARS */}
                                <div className="absolute inset-x-0 bottom-[52px] top-2 flex items-end justify-around gap-5 px-5">
                                    {divisiReport.map((item, index) => {
                                        const act = Number(item.act || 0);
                                        const plan = Number(item.plan || 0);

                                        const visualAct =
                                            act > 0 ? Math.max((act / maxValue) * 100, 3) : 0;
                                        const visualPlan =
                                            plan > 0 ? Math.max((plan / maxValue) * 100, 3) : 0;

                                        return (
                                            <div
                                                key={item.divisi}
                                                className="group flex h-full min-w-[75px] flex-1 items-end justify-center gap-1.5"
                                            >
                                                {/* ACT */}
                                                <div className="relative flex h-full w-8 items-end justify-center">
                                                    <span
                                                        className="absolute z-20 whitespace-nowrap text-[11px] font-extrabold text-blue-700 transition-all duration-500"
                                                        style={{
                                                            bottom:
                                                                animated && act > 0
                                                                    ? `min(calc(${visualAct}% + 6px), calc(100% - 16px))`
                                                                    : '0px',
                                                            opacity: animated && act > 0 ? 1 : 0,
                                                            transform: animated
                                                                ? 'translateY(0)'
                                                                : 'translateY(7px)',
                                                            transitionDelay: `${index * 70}ms`,
                                                        }}
                                                    >
                                                        {act > 0 ? act : ''}
                                                    </span>

                                                    <div
                                                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 to-sky-400 shadow-[0_8px_22px_rgba(37,99,235,0.35)] transition-all duration-700 ease-out group-hover:from-blue-600 group-hover:to-cyan-300"
                                                        style={{
                                                            height: animated ? `${visualAct}%` : '0%',
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
                                                                animated && plan > 0
                                                                    ? `min(calc(${visualPlan}% + 6px), calc(100% - 16px))`
                                                                    : '0px',
                                                            opacity: animated && plan > 0 ? 1 : 0,
                                                            transform: animated
                                                                ? 'translateY(0)'
                                                                : 'translateY(7px)',
                                                            transitionDelay: `${index * 70 + 120}ms`,
                                                        }}
                                                    >
                                                        {plan > 0 ? plan : ''}
                                                    </span>

                                                    <div
                                                        className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_8px_22px_rgba(245,158,11,0.35)] transition-all duration-700 ease-out group-hover:from-amber-400 group-hover:to-yellow-200"
                                                        style={{
                                                            height: animated ? `${visualPlan}%` : '0%',
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
                    { label: 'ACT (sudah preventif)', color: '#2563eb' },
                    { label: 'Plan (belum preventif)', color: '#f59e0b' },
                ]}
            />
        </>
    );
}
