import React from 'react';

export const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const COLOR_ACT = '#f97316'; // orange-500
const COLOR_PLAN = '#2563eb'; // blue-600

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
| Act  = batang (oranye)
| Plan = garis + titik (biru)
------------------------------------------------------------------ */
export function YearlyChart({ data }) {
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

    const linePoints = data.map((d, i) => `${xCenter(i)},${yPos(d.plan)}`).join(' ');

    const kosong = maxValue === 0;

    return (
        <div>
            {/* LEGENDA */}
            <div className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                    <span
                        className="h-3 w-3 rounded-sm border border-orange-300/70"
                        style={{
                            background:
                                'linear-gradient(180deg, #fed7aa 0%, #fb923c 48%, #ea580c 100%)',
                        }}
                    />
                    Act (batang)
                </span>

                <span className="inline-flex items-center gap-1.5">
                    <span className="relative inline-block h-3 w-6">
                        <span
                            className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2"
                            style={{
                                background:
                                    'linear-gradient(90deg, #38bdf8 0%, #3b82f6 55%, #4338ca 100%)',
                            }}
                        />
                        <span
                            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white"
                            style={{ borderColor: COLOR_PLAN }}
                        />
                    </span>
                    Plan (garis)
                </span>
            </div>

            {/* max-w dijaga supaya tinggi grafik tetap muat di dalam slide */}
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mx-auto block h-auto w-full max-w-[880px]"
                role="img"
                aria-label="Grafik overhaul per bulan: Act sebagai batang, Plan sebagai garis"
            >
                <defs>
                    <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="35%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    <linearGradient id="planGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#4338ca" />
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
                                fill={(d.act / yMax) * innerH > 22 ? '#fff' : COLOR_ACT}
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
                    <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="14" fill="#94a3b8">
                        Belum ada jadwal yang dicentang pada tahun ini
                    </text>
                )}
            </svg>
        </div>
    );
}
