import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------
| PALET (navy gelap + aksen magenta / cyan / oranye)
------------------------------------------------------------------ */
export const C = {
    bg: '#ffffff',
    panel: '#ffffff',
    line: '#e2e8f0',
    mute: '#64748b',
    cyan: '#2563eb', // biru (ACT / Plan)
    magenta: '#f59e0b', // amber (garis Plan)
    orange: '#f97316',
    green: '#10b981',
    violet: '#6366f1',
    yellow: '#fbbf24',
    blue: '#1d4ed8',
};

const DIV_COLOR = {
    Sewing: '#ea580c',
    Headrest: '#a855f7',
    Utility: '#1e3a8a',
    Saidan: '#10b981',
    Lainnya: '#94a3b8',
};
const DIV_FALLBACK = ['#2563eb', '#0ea5e9', '#f59e0b', '#6366f1'];

export const divColor = (d, i = 0) => DIV_COLOR[d] ?? DIV_FALLBACK[i % DIV_FALLBACK.length];

export const fmt = (v, max = 0, min = 0) =>
    Number(v || 0).toLocaleString('id-ID', {
        minimumFractionDigits: min,
        maximumFractionDigits: Math.max(max, min),
    });

/* ------------------------------------------------------------------
| ANGKA BERJALAN
------------------------------------------------------------------ */
export function useCountNum(value, run = true, duration = 1200, key = 0) {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        const to = Number(value) || 0;

        if (!run) {
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

            if (p < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [value, run, duration, key]);

    return shown;
}

export function CountUp({
    value,
    decimals = 0,
    suffix = '',
    start = true,
    replayKey = 0,
    duration = 1300,
    className = '',
}) {
    const shown = useCountNum(value, start, duration, replayKey);

    return (
        <span className={className}>
            {fmt(shown, decimals, decimals)}
            {suffix}
        </span>
    );
}

/* ------------------------------------------------------------------
| UKURAN ELEMEN + TOOLTIP
------------------------------------------------------------------ */
function useSize() {
    const ref = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    useLayoutEffect(() => {
        const el = ref.current;

        if (!el) return undefined;

        const ro = new ResizeObserver(([entry]) => {
            const r = entry.contentRect;

            setSize({ w: Math.round(r.width), h: Math.round(r.height) });
        });

        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    return [ref, size];
}

export function TipBox({ title, rows = [] }) {
    return (
        <div className="min-w-[132px] rounded-xl border border-[#2f3a8c] bg-[#0a0f30]/95 p-2.5 text-[11px] text-white shadow-2xl backdrop-blur-md">
            {title && <p className="mb-1.5 text-xs font-extrabold">{title}</p>}
            <div className="space-y-1">
                {rows.map((r, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between gap-4 ${
                            r.strong ? 'border-t border-white/10 pt-1 font-extrabold' : ''
                        }`}
                    >
                        <span className="flex items-center gap-1.5 text-slate-300">
                            {r.color && (
                                <span
                                    className="h-2 w-2 rounded-sm"
                                    style={{ background: r.color }}
                                />
                            )}
                            {r.label}
                        </span>
                        <span className="font-bold tabular-nums">{r.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* Wadah grafik: mengukur ukuran, menampilkan tooltip yang mengikuti kursor */
export function ChartBox({ children }) {
    const [ref, { w, h }] = useSize();
    const [tip, setTip] = useState(null);

    const show = (e, content) => {
        const r = ref.current?.getBoundingClientRect();

        if (!r) return;

        setTip({ x: e.clientX - r.left, y: e.clientY - r.top, content });
    };
    const hide = () => setTip(null);

    return (
        <div ref={ref} className="relative h-full w-full">
            {w > 0 && h > 0 && children({ w, h, show, hide })}

            {tip && (
                <div
                    className="pointer-events-none absolute z-30"
                    style={{
                        left: tip.x,
                        top: Math.min(Math.max(tip.y, 44), Math.max(h - 44, 44)),
                        transform:
                            tip.x > w * 0.58
                                ? 'translate(calc(-100% - 14px), -50%)'
                                : 'translate(14px, -50%)',
                    }}
                >
                    {tip.content}
                </div>
            )}
        </div>
    );
}

export function Empty({ text = 'Belum ada data' }) {
    return (
        <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-500">
            {text}
        </div>
    );
}

/* ------------------------------------------------------------------
| PANEL + LEGENDA
------------------------------------------------------------------ */
export function Panel({ title, right, className = '', children }) {
    return (
        <section
            className={`flex min-h-[260px] min-w-0 flex-col rounded-2xl border border-white/60 bg-white/95 shadow-[0_18px_50px_rgba(3,10,34,0.40)] xl:min-h-0 ${className}`}
        >
            <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3.5 pb-1 pt-2.5">
                <h3 className="text-[12.5px] font-bold text-slate-800">{title}</h3>
                {right}
            </header>

            <div className="relative min-h-0 flex-1">
                <div className="absolute inset-x-2.5 bottom-2.5 top-0.5">{children}</div>
            </div>
        </section>
    );
}

export function Legend({ items }) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
            {items.map((it) => (
                <span
                    key={it.label}
                    className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-600"
                >
                    {it.line ? (
                        <span
                            className="relative block h-0.5 w-4 rounded"
                            style={{ background: it.color }}
                        >
                            <span
                                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white"
                                style={{ borderColor: it.color }}
                            />
                        </span>
                    ) : (
                        <span
                            className="h-2.5 w-2.5 rounded-[3px]"
                            style={{ background: it.color }}
                        />
                    )}
                    {it.label}
                </span>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------
| KPI
------------------------------------------------------------------ */
function Ring({ pct = 0, color, run }) {
    const p = Math.min(Math.max(Number(pct) || 0, 0), 100);

    return (
        <div className="relative h-[46px] w-[46px] shrink-0">
            <svg viewBox="0 0 46 46" className="h-full w-full -rotate-90">
                <circle
                    cx="23"
                    cy="23"
                    r="18"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="5"
                />
                <circle
                    cx="23"
                    cy="23"
                    r="18"
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={run ? 100 - p : 100}
                    style={{
                        transition: 'stroke-dashoffset 1300ms cubic-bezier(.22,1,.36,1) 300ms',
                        opacity: p > 0 ? 1 : 0,
                    }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold tabular-nums text-slate-800">
                {fmt(p, 0)}%
            </span>
        </div>
    );
}

export function KpiTile({
    color,
    icon,
    label,
    value,
    decimals = 0,
    suffix = '',
    hint,
    progress = 0,
    ring = false,
    visible,
    replayKey,
    delay = 0,
}) {
    return (
        <div
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
        >
            <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/95 px-3.5 py-2.5 shadow-[0_18px_50px_rgba(3,10,34,0.40)]">
                <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />

                <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${color}26`, color }}
                >
                    {icon}
                </span>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-slate-500">{label}</p>
                    <p className="text-[26px] font-black leading-tight tabular-nums text-slate-900">
                        <CountUp
                            value={value}
                            decimals={decimals}
                            suffix={suffix}
                            start={visible}
                            replayKey={replayKey}
                        />
                    </p>
                    <p className="truncate text-[10px] text-slate-400">{hint}</p>
                </div>

                {ring && <Ring key={replayKey} pct={progress} color={color} run={visible} />}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
| SKALA SUMBU Y
------------------------------------------------------------------ */
function niceScale(maxValue, ticks = 4) {
    if (!(maxValue > 0)) return { max: ticks, step: 1 };

    const raw = maxValue / ticks;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const res = raw / mag;
    const ns = res <= 1 ? 1 : res <= 2 ? 2 : res <= 2.5 ? 2.5 : res <= 5 ? 5 : 10;
    const step = ns * mag;

    return { max: Math.ceil(maxValue / step - 1e-9) * step, step };
}

/* ------------------------------------------------------------------
| GRAFIK XY: batang (tumpuk / berdampingan) + garis, hover tooltip
| series: [{ name, type: 'bar' | 'line', color, values, area? }]
| cats:   [{ label, sub? }]
| labels: 'none' | 'totals' (total di atas tumpukan) | 'bars' (nilai tiap batang)
------------------------------------------------------------------ */
export function XYChart({
    cats,
    series,
    stack = false,
    suffix = '',
    animated,
    labels = 'none',
    lineLabels = false,
    segLabels = false,
    maxBar = 44,
}) {
    const uid = useId().replace(/:/g, '');
    const [hover, setHover] = useState(null);

    const bars = series.filter((s) => s.type !== 'line');
    const lines = series.filter((s) => s.type === 'line');

    const val = (s, i) => {
        const v = s.values[i];

        return v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v);
    };

    return (
        <ChartBox>
            {({ w, h, show, hide }) => {
                const hasSub = cats.some((c) => c.sub);
                const m = { l: 42, r: 14, t: 20, b: hasSub ? 38 : 26 };
                const iw = Math.max(10, w - m.l - m.r);
                const ih = Math.max(10, h - m.t - m.b);
                const n = Math.max(cats.length, 1);

                const totals = cats.map((_, i) =>
                    bars.reduce((a, s) => a + (val(s, i) || 0), 0)
                );

                let raw = 0;

                if (stack) {
                    raw = Math.max(0, ...totals);
                } else {
                    bars.forEach((s) =>
                        s.values.forEach((_, i) => {
                            raw = Math.max(raw, val(s, i) || 0);
                        })
                    );
                }

                lines.forEach((s) =>
                    s.values.forEach((_, i) => {
                        raw = Math.max(raw, val(s, i) || 0);
                    })
                );

                const { max: yMax, step } = niceScale(raw);
                const nt = Math.round(yMax / step);
                const dec = Number.isInteger(step) ? 0 : step < 0.1 ? 2 : 1;

                const slot = iw / n;
                const cx = (i) => m.l + slot * (i + 0.5);
                const y = (v) => m.t + ih - (v / yMax) * ih;
                const base = m.t + ih;
                const every = Math.max(1, Math.ceil(34 / slot));

                const gw = Math.min(slot * 0.7, stack ? maxBar : maxBar * bars.length * 0.75);
                const sw = gw / Math.max(bars.length, 1);

                const tipFor = (i) => {
                    const c = cats[i];
                    const rows = series
                        .map((s) => ({ s, v: val(s, i) }))
                        .filter(({ s, v }) => (s.type === 'line' ? true : (v || 0) > 0 || !stack))
                        .map(({ s, v }) => ({
                            color: s.color,
                            label: s.name,
                            value: v === null ? '-' : `${fmt(v, 1)}${suffix}`,
                        }));

                    if (stack && bars.length > 1) {
                        rows.push({
                            label: 'Total',
                            value: `${fmt(totals[i], 1)}${suffix}`,
                            strong: true,
                        });
                    }

                    return <TipBox title={`${c.label} ${c.sub || ''}`.trim()} rows={rows} />;
                };

                return (
                    <svg width={w} height={h} className="block overflow-visible">
                        <defs>
                            {bars.map((s, k) => (
                                <linearGradient
                                    key={k}
                                    id={`${uid}b${k}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor={s.color} />
                                    <stop offset="100%" stopColor={s.color} stopOpacity="0.55" />
                                </linearGradient>
                            ))}
                            {lines.map((s, k) => (
                                <linearGradient
                                    key={k}
                                    id={`${uid}a${k}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor={s.color} stopOpacity="0.38" />
                                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                                </linearGradient>
                            ))}
                        </defs>

                        {/* GRID + SUMBU Y */}
                        {Array.from({ length: nt + 1 }, (_, k) => {
                            const v = k * step;

                            return (
                                <g key={k}>
                                    <line
                                        x1={m.l}
                                        x2={w - m.r}
                                        y1={y(v)}
                                        y2={y(v)}
                                        stroke={k === 0 ? '#cbd5e1' : '#e2e8f0'}
                                        strokeDasharray={k === 0 ? undefined : '4 5'}
                                    />
                                    <text
                                        x={m.l - 8}
                                        y={y(v) + 3.5}
                                        textAnchor="end"
                                        fontSize="10"
                                        fontWeight="600"
                                        fill="#64748b"
                                    >
                                        {fmt(v, dec)}
                                        {suffix}
                                    </text>
                                </g>
                            );
                        })}

                        {/* SOROTAN KOLOM */}
                        {hover !== null && (
                            <rect
                                x={cx(hover) - slot / 2 + 2}
                                y={m.t - 6}
                                width={Math.max(slot - 4, 4)}
                                height={ih + 6}
                                rx="8"
                                fill="rgba(37,99,235,.08)"
                            />
                        )}

                        {/* BATANG */}
                        {cats.map((c, i) => {
                            const gStyle = {
                                transformBox: 'fill-box',
                                transformOrigin: '50% 100%',
                                transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                                transition: `transform 950ms cubic-bezier(.34,1.3,.64,1) ${i * 45}ms`,
                            };

                            if (stack) {
                                let acc = 0;

                                return (
                                    <g key={i} style={gStyle}>
                                        {bars.map((s, k) => {
                                            const v = val(s, i) || 0;

                                            if (v <= 0) return null;

                                            const y0 = y(acc);
                                            const y1 = y(acc + v);

                                            acc += v;

                                            const hh = Math.max(y0 - y1, 0);

                                            return (
                                                <g key={k}>
                                                    <rect
                                                        x={cx(i) - gw / 2}
                                                        y={y1}
                                                        width={gw}
                                                        height={hh}
                                                        rx="3"
                                                        fill={`url(#${uid}b${k})`}
                                                        stroke="rgba(255,255,255,.85)"
                                                        strokeWidth="1"
                                                    />
                                                    {segLabels && hh >= 15 && gw >= 22 && (
                                                        <text
                                                            x={cx(i)}
                                                            y={y1 + hh / 2 + 3}
                                                            textAnchor="middle"
                                                            fontSize="9.5"
                                                            fontWeight="800"
                                                            fill="#fff"
                                                            style={{ opacity: animated ? 1 : 0, transition: 'opacity 500ms 700ms' }}
                                                        >
                                                            {fmt(v, 1)}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })}
                                    </g>
                                );
                            }

                            return (
                                <g key={i} style={gStyle}>
                                    {bars.map((s, k) => {
                                        const v = val(s, i) || 0;

                                        if (v <= 0) return null;

                                        return (
                                            <rect
                                                key={k}
                                                x={cx(i) - gw / 2 + k * sw + 1}
                                                y={y(v)}
                                                width={Math.max(sw - 2, 2)}
                                                height={Math.max(base - y(v), 0)}
                                                rx="4"
                                                fill={`url(#${uid}b${k})`}
                                            />
                                        );
                                    })}
                                </g>
                            );
                        })}

                        {/* LABEL NILAI BATANG */}
                        {labels === 'totals' &&
                            stack &&
                            cats.map((_, i) =>
                                totals[i] > 0 ? (
                                    <text
                                        key={i}
                                        x={cx(i)}
                                        y={y(totals[i]) - 6}
                                        textAnchor="middle"
                                        fontSize="10.5"
                                        fontWeight="800"
                                        fill="#1e293b"
                                        style={{ opacity: animated ? 1 : 0, transition: `opacity 500ms ${600 + i * 45}ms` }}
                                    >
                                        {fmt(totals[i], 1)}
                                        {suffix}
                                    </text>
                                ) : null
                            )}

                        {labels === 'bars' &&
                            !stack &&
                            cats.map((_, i) =>
                                bars.map((s, k) => {
                                    const v = val(s, i) || 0;

                                    return v > 0 ? (
                                        <text
                                            key={`${i}-${k}`}
                                            x={cx(i) - gw / 2 + k * sw + sw / 2}
                                            y={y(v) - 6}
                                            textAnchor="middle"
                                            fontSize="10.5"
                                            fontWeight="800"
                                            fill={s.color}
                                            style={{ opacity: animated ? 1 : 0, transition: `opacity 500ms ${600 + i * 45}ms` }}
                                        >
                                            {fmt(v, 1)}
                                            {suffix}
                                        </text>
                                    ) : null;
                                })
                            )}

                        {/* GARIS */}
                        {lines.map((s, k) => {
                            let d = '';
                            let pen = false;
                            const pts = [];

                            cats.forEach((_, i) => {
                                const v = val(s, i);

                                if (v === null) {
                                    pen = false;

                                    return;
                                }

                                d += `${pen ? 'L' : 'M'}${cx(i)},${y(v)}`;
                                pen = true;
                                pts.push({ i, v });
                            });

                            if (!pts.length) return null;

                            const area = `M${cx(pts[0].i)},${base}${pts
                                .map((p) => `L${cx(p.i)},${y(p.v)}`)
                                .join('')}L${cx(pts[pts.length - 1].i)},${base}Z`;

                            const dash = {
                                strokeDasharray: 1,
                                strokeDashoffset: animated ? 0 : 1,
                                transition: 'stroke-dashoffset 1300ms cubic-bezier(.22,1,.36,1) 250ms',
                            };

                            return (
                                <g key={`l${k}`}>
                                    {s.area && (
                                        <path
                                            d={area}
                                            fill={`url(#${uid}a${k})`}
                                            style={{ opacity: animated ? 1 : 0, transition: 'opacity 900ms 700ms' }}
                                        />
                                    )}
                                    <path
                                        d={d}
                                        pathLength={1}
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth="7"
                                        strokeOpacity=".16"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        style={dash}
                                    />
                                    <path
                                        d={d}
                                        pathLength={1}
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth="2.6"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        style={dash}
                                    />

                                    {pts.map(({ i, v }) => (
                                        <g key={i}>
                                            <circle
                                                cx={cx(i)}
                                                cy={y(v)}
                                                r={hover === i ? 5.5 : 3.8}
                                                fill={C.bg}
                                                stroke={s.color}
                                                strokeWidth="2.3"
                                                style={{
                                                    transformBox: 'fill-box',
                                                    transformOrigin: 'center',
                                                    transform: animated ? 'scale(1)' : 'scale(0)',
                                                    transition: `transform 450ms cubic-bezier(.34,1.56,.64,1) ${500 + i * 60}ms, r 150ms`,
                                                }}
                                            />
                                            {lineLabels && (
                                                <text
                                                    x={cx(i)}
                                                    y={y(v) - 10}
                                                    textAnchor="middle"
                                                    fontSize="10.5"
                                                    fontWeight="800"
                                                    fill={s.color}
                                                    stroke={C.panel}
                                                    strokeWidth="3"
                                                    paintOrder="stroke"
                                                    style={{ opacity: animated ? 1 : 0, transition: `opacity 500ms ${700 + i * 60}ms` }}
                                                >
                                                    {fmt(v, 1)}
                                                    {suffix}
                                                </text>
                                            )}
                                        </g>
                                    ))}
                                </g>
                            );
                        })}

                        {/* LABEL X */}
                        {cats.map((c, i) =>
                            i % every === 0 ? (
                                <g key={i}>
                                    <text
                                        x={cx(i)}
                                        y={base + 16}
                                        textAnchor="middle"
                                        fontSize={slot < 30 ? 9 : 10.5}
                                        fontWeight="700"
                                        fill={hover === i ? C.cyan : '#475569'}
                                    >
                                        {c.label}
                                    </text>
                                    {c.sub && (
                                        <text
                                            x={cx(i)}
                                            y={base + 29}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fontWeight="600"
                                            fill="#94a3b8"
                                        >
                                            {c.sub}
                                        </text>
                                    )}
                                </g>
                            ) : null
                        )}

                        {raw <= 0 && (
                            <text
                                x={w / 2}
                                y={h / 2}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="600"
                                fill="#94a3b8"
                            >
                                Belum ada data
                            </text>
                        )}

                        {/* AREA HOVER */}
                        {cats.map((_, i) => (
                            <rect
                                key={i}
                                x={cx(i) - slot / 2}
                                y={m.t - 6}
                                width={slot}
                                height={ih + 6}
                                fill="transparent"
                                onMouseMove={(e) => {
                                    setHover(i);
                                    show(e, tipFor(i));
                                }}
                                onMouseLeave={() => {
                                    setHover(null);
                                    hide();
                                }}
                            />
                        ))}
                    </svg>
                );
            }}
        </ChartBox>
    );
}

/* ------------------------------------------------------------------
| DONUT
| data: [{ label, value, color }]
------------------------------------------------------------------ */
export function DonutChart({ data, animated, centerValue, centerSub, suffix = '' }) {
    const [hover, setHover] = useState(null);
    const total = data.reduce((a, d) => a + Number(d.value || 0), 0);

    return (
        <ChartBox>
            {({ w, h, show, hide }) => {
                const size = Math.min(w, h);
                const sw = Math.max(12, size * 0.15);
                const r = Math.max(10, size / 2 - sw / 2 - 6);
                const cx = w / 2;
                const cy = h / 2;
                const circ = 2 * Math.PI * r;
                const active = data.filter((d) => Number(d.value) > 0).length;
                const gap = active > 1 ? 2.5 : 0;
                let acc = 0;

                const hv = hover !== null ? data[hover] : null;

                return (
                    <svg width={w} height={h} className="block">
                        <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth={sw}
                        />

                        {total > 0 &&
                            data.map((d, i) => {
                                const v = Number(d.value || 0);

                                if (v <= 0) return null;

                                const len = (circ * v) / total;
                                const start = acc;

                                acc += len;

                                return (
                                    <circle
                                        key={i}
                                        cx={cx}
                                        cy={cy}
                                        r={r}
                                        fill="none"
                                        stroke={d.color}
                                        strokeWidth={hover === i ? sw + 7 : sw}
                                        strokeDasharray={`${animated ? Math.max(len - gap, 0.5) : 0} ${circ}`}
                                        strokeDashoffset={-start}
                                        transform={`rotate(-90 ${cx} ${cy})`}
                                        style={{
                                            transition: `stroke-dasharray 1100ms cubic-bezier(.22,1,.36,1) ${i * 120}ms, stroke-width 160ms`,
                                            filter: hover === i ? `drop-shadow(0 0 8px ${d.color}aa)` : 'none',
                                        }}
                                        onMouseMove={(e) => {
                                            setHover(i);
                                            show(
                                                e,
                                                <TipBox
                                                    title={d.label}
                                                    rows={[
                                                        {
                                                            color: d.color,
                                                            label: 'Nilai',
                                                            value: `${fmt(v, 1)}${suffix}`,
                                                        },
                                                        {
                                                            label: 'Porsi',
                                                            value: `${fmt((v / total) * 100, 1)}%`,
                                                        },
                                                    ]}
                                                />
                                            );
                                        }}
                                        onMouseLeave={() => {
                                            setHover(null);
                                            hide();
                                        }}
                                    />
                                );
                            })}

                        <text
                            x={cx}
                            y={cy + size * 0.05}
                            textAnchor="middle"
                            fontSize={Math.max(16, size * 0.17)}
                            fontWeight="900"
                            fill="#0f172a"
                        >
                            {hv ? fmt(hv.value, 1) : centerValue ?? fmt(total, 1)}
                        </text>
                        <text
                            x={cx}
                            y={cy + size * 0.05 + Math.max(13, size * 0.085)}
                            textAnchor="middle"
                            fontSize={Math.max(9.5, size * 0.07)}
                            fontWeight="600"
                            fill="#64748b"
                        >
                            {hv ? hv.label : centerSub}
                        </text>
                    </svg>
                );
            }}
        </ChartBox>
    );
}

/* ------------------------------------------------------------------
| GAUGE SETENGAH LINGKARAN
------------------------------------------------------------------ */
export function GaugeChart({ pct = 0, color = C.green, animated, label = 'Pencapaian' }) {
    const p = Math.min(Math.max(Number(pct) || 0, 0), 100);
    const shown = useCountNum(p, animated, 1300);

    return (
        <ChartBox>
            {({ w, h, show, hide }) => {
                const sw = Math.max(12, Math.min(w, h * 2) * 0.085);
                const r = Math.max(24, Math.min(w / 2 - sw, h - sw - 26));
                const cx = w / 2;
                const cy = (h + r) / 2;
                const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

                return (
                    <svg
                        width={w}
                        height={h}
                        className="block"
                        onMouseMove={(e) =>
                            show(
                                e,
                                <TipBox
                                    title={label}
                                    rows={[{ color, label: 'Capaian', value: `${fmt(p, 1)}%` }]}
                                />
                            )
                        }
                        onMouseLeave={hide}
                    >
                        <path
                            d={d}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth={sw}
                            strokeLinecap="round"
                        />
                        <path
                            d={d}
                            fill="none"
                            stroke={color}
                            strokeWidth={sw}
                            strokeLinecap="round"
                            pathLength={100}
                            strokeDasharray="100"
                            strokeDashoffset={animated ? 100 - p : 100}
                            style={{
                                transition: 'stroke-dashoffset 1300ms cubic-bezier(.22,1,.36,1)',
                                filter: `drop-shadow(0 0 8px ${color}99)`,
                                opacity: p > 0 ? 1 : 0,
                            }}
                        />
                        <text
                            x={cx}
                            y={cy - r * 0.1}
                            textAnchor="middle"
                            fontSize={Math.max(22, r * 0.52)}
                            fontWeight="900"
                            fill="#0f172a"
                        >
                            {fmt(shown, 1)}%
                        </text>
                        <text
                            x={cx - r}
                            y={cy + sw / 2 + 13}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill="#94a3b8"
                        >
                            0
                        </text>
                        <text
                            x={cx + r}
                            y={cy + sw / 2 + 13}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill="#94a3b8"
                        >
                            100
                        </text>
                    </svg>
                );
            }}
        </ChartBox>
    );
}

/* ------------------------------------------------------------------
| BATANG HORIZONTAL
| rows: [{ label, text, segments: [{ value, color, name }], tipRows? }]
------------------------------------------------------------------ */
export function HBars({ rows, animated, max }) {
    return (
        <ChartBox>
            {({ show, hide }) => {
                if (!rows.length) return <Empty />;

                const m =
                    max ??
                    Math.max(
                        1,
                        ...rows.map((r) => r.segments.reduce((a, s) => a + Number(s.value || 0), 0))
                    );

                return (
                    <div className="flex h-full flex-col justify-around gap-1">
                        {rows.map((r, i) => (
                            <div
                                key={`${r.label}-${i}`}
                                className="cursor-default rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-100"
                                onMouseMove={(e) =>
                                    show(
                                        e,
                                        <TipBox
                                            title={r.label}
                                            rows={
                                                r.tipRows ??
                                                r.segments.map((s) => ({
                                                    color: s.color,
                                                    label: s.name,
                                                    value: fmt(s.value, 1),
                                                }))
                                            }
                                        />
                                    )
                                }
                                onMouseLeave={hide}
                            >
                                <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
                                    <span className="truncate font-semibold text-slate-700">
                                        {r.label}
                                    </span>
                                    <span className="font-extrabold tabular-nums text-slate-900">
                                        {r.text}
                                    </span>
                                </div>

                                <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-200">
                                    {r.segments.map((s, j) => (
                                        <div
                                            key={j}
                                            className="h-full"
                                            style={{
                                                width: animated
                                                    ? `${Math.min(100, (Number(s.value || 0) / m) * 100)}%`
                                                    : '0%',
                                                background: s.color,
                                                transition: `width 950ms cubic-bezier(.22,1,.36,1) ${i * 70}ms`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }}
        </ChartBox>
    );
}
