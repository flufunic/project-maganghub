import React, { useEffect, useState } from 'react';

/* ------------------------------------------------------------------
| INTRO LOADER (biru tua)
| Siluet pekerja + helm + linggis di tengah, dikelilingi mesin.
| Scene digambar dua kali (setengah kiri & kanan) lalu keduanya
| bergeser terbuka -> tidak ada garis tengah, pekerja "terbelah"
| dan halaman muncul dari baliknya.
|
| Atur durasi (ms):
------------------------------------------------------------------ */
const WORK_MS = 3000; // lama scene tampil
const OPEN_MS = 1100; // lama panel membuka

/* ---------------- RODA GIGI ---------------- */
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

function Gear({ x, y, r, teeth, dur, dir = 1, fill = '#0c1832', stroke = '#263f78' }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <g
                className="ig"
                style={{
                    animationDuration: `${dur}s`,
                    animationDirection: dir > 0 ? 'normal' : 'reverse',
                }}
            >
                <path d={gearPath(r, r * 0.88, teeth)} fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
                <circle r={r * 0.72} fill="none" stroke={stroke} strokeWidth="2" opacity="0.8" />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <circle
                        key={deg}
                        cx={Math.cos((deg * Math.PI) / 180) * r * 0.46}
                        cy={Math.sin((deg * Math.PI) / 180) * r * 0.46}
                        r={r * 0.13}
                        fill="#030a1c"
                        stroke={stroke}
                        strokeWidth="2"
                    />
                ))}
                <circle r={r * 0.2} fill="#060f24" stroke="#3a5698" strokeWidth="3" />
                <circle r={r * 0.06} fill="#7f98cc" />
            </g>
        </g>
    );
}

function Piston({ x, delay = 0 }) {
    return (
        <g>
            <g className="ip" style={{ animationDelay: `${delay}s` }}>
                <rect x={x - 12} y="170" width="24" height="170" fill="#10204a" stroke="#2f4a88" strokeWidth="2" />
                <rect x={x - 46} y="150" width="92" height="34" rx="6" fill="#0d1a36" stroke="#3a5698" strokeWidth="3" />
                <rect x={x - 30} y="190" width="60" height="8" fill="#1a2d5a" />
            </g>
            <rect x={x - 48} y="320" width="96" height="490" fill="#09132a" stroke="#263f78" strokeWidth="3" />
            {[360, 440, 520, 600, 680, 760].map((yy) => (
                <rect key={yy} x={x - 54} y={yy} width="108" height="12" fill="#12234a" stroke="#2c4580" strokeWidth="2" />
            ))}
        </g>
    );
}

function Gauge({ x, y, delay = 0 }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <circle r="38" fill="#081226" stroke="#4863a3" strokeWidth="5" />
            <circle r="30" fill="#0f1d3d" stroke="#1a2d5a" strokeWidth="2" />
            <g className="ineedle" style={{ animationDelay: `${delay}s` }}>
                <line x1="0" y1="4" x2="0" y2="-24" stroke="#dbe6ff" strokeWidth="3" strokeLinecap="round" />
            </g>
            <circle r="4" fill="#c9d8f7" />
        </g>
    );
}

function Steam({ x, y }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            {[0, 0.9, 1.8].map((d) => (
                <circle key={d} className="isteam" r="26" fill="#a9bfe8" style={{ animationDelay: `${d}s` }} />
            ))}
        </g>
    );
}

/* ---------------- SCENE ---------------- */
function Scene({ id }) {
    return (
        <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            className="block h-full w-full"
            aria-hidden="true"
        >
            <defs>
                <radialGradient id={`${id}-glow`} cx="50%" cy="58%" r="46%">
                    <stop offset="0%" stopColor="#5b82c4" />
                    <stop offset="35%" stopColor="#2c4f94" />
                    <stop offset="70%" stopColor="#112a5c" />
                    <stop offset="100%" stopColor="#050b1a" />
                </radialGradient>
                <radialGradient id={`${id}-vig`} cx="50%" cy="50%" r="75%">
                    <stop offset="55%" stopColor="#010512" stopOpacity="0" />
                    <stop offset="100%" stopColor="#010512" stopOpacity="0.88" />
                </radialGradient>
            </defs>

            {/* LATAR */}
            <rect width="1600" height="900" fill="#050b1a" />
            <rect className="iflicker" width="1600" height="900" fill={`url(#${id}-glow)`} />

            {/* PIPA */}
            <g>
                <rect x="0" y="60" width="1600" height="50" fill="#0a1630" stroke="#263f78" strokeWidth="3" />
                {[120, 330, 540, 750, 960, 1170, 1380, 1560].map((px) => (
                    <rect key={px} x={px} y="50" width="16" height="70" fill="#12234a" stroke="#2f4a88" strokeWidth="2" />
                ))}
                <rect x="622" y="110" width="36" height="200" fill="#0a1630" stroke="#263f78" strokeWidth="3" />
                <rect x="942" y="110" width="36" height="200" fill="#0a1630" stroke="#263f78" strokeWidth="3" />
                <rect x="614" y="296" width="52" height="16" fill="#12234a" stroke="#2f4a88" strokeWidth="2" />
                <rect x="934" y="296" width="52" height="16" fill="#12234a" stroke="#2f4a88" strokeWidth="2" />
            </g>

            <Gauge x={640} y={190} />
            <Gauge x={960} y={190} delay={0.6} />

            {/* PISTON */}
            <Piston x={545} />
            <Piston x={1055} delay={0.7} />

            {/* RODA GIGI */}
            <Gear x={120} y={130} r={240} teeth={22} dur={70} dir={1} />
            <Gear x={400} y={250} r={115} teeth={11} dur={34} dir={-1} />
            <Gear x={150} y={830} r={270} teeth={24} dur={80} dir={-1} />
            <Gear x={480} y={860} r={110} teeth={11} dur={30} dir={1} />
            <Gear x={1480} y={110} r={250} teeth={22} dur={74} dir={-1} />
            <Gear x={1198} y={273} r={120} teeth={12} dur={36} dir={1} />
            <Gear x={1450} y={830} r={290} teeth={26} dur={86} dir={1} />
            <Gear x={1120} y={850} r={100} teeth={10} dur={28} dir={-1} />

            {/* LANTAI */}
            <rect x="0" y="800" width="1600" height="100" fill="#030814" />
            <rect x="0" y="798" width="1600" height="4" fill="#2f4a88" />

            {/* UAP */}
            <Steam x={640} y={796} />
            <Steam x={965} y={796} />

            {/* PEKERJA (siluet) */}
            <g className="iworker">
                {/* kaki + sepatu */}
                <path
                    d="M762 545 L838 545 L848 740 L864 800 L802 800 L802 650 L798 650 L798 800 L736 800 L752 740 Z"
                    fill="#010512"
                />
                {/* badan */}
                <path d="M738 410 Q800 382 862 410 L878 560 L722 560 Z" fill="#010512" />
                <rect x="786" y="376" width="28" height="30" fill="#010512" />
                {/* kepala */}
                <circle cx="800" cy="352" r="29" fill="#010512" />
                {/* helm */}
                <path d="M764 350 Q770 288 800 286 Q830 288 836 350 Z" fill="#010512" />
                <path d="M750 348 Q800 336 850 348 L856 358 L744 358 Z" fill="#010512" />
                <rect x="796" y="278" width="8" height="12" rx="2" fill="#010512" />
                <path d="M772 322 Q780 296 800 292" stroke="#9db8ee" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
                {/* tangan kiri: berkacak pinggang */}
                <path
                    d="M744 418 L716 500 L754 552"
                    stroke="#010512" strokeWidth="28" fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
                {/* tangan kanan + linggis */}
                <path
                    d="M858 418 L896 492 L884 548"
                    stroke="#010512" strokeWidth="28" fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                    d="M884 806 L884 452 Q884 418 852 414"
                    stroke="#010512" strokeWidth="12" fill="none" strokeLinecap="round"
                />
                <path d="M878 806 L890 806 L884 826 Z" fill="#010512" />
            </g>

            {/* PERCIKAN */}
            {[
                { x: 884, d: 0, dx: -40 },
                { x: 888, d: 0.5, dx: 50 },
                { x: 880, d: 1.0, dx: -70 },
                { x: 892, d: 1.5, dx: 30 },
                { x: 884, d: 2.0, dx: 80 },
            ].map((s, i) => (
                <circle
                    key={i}
                    className="ispark"
                    cx={s.x}
                    cy="800"
                    r="3"
                    fill="#e8f0ff"
                    style={{ animationDelay: `${s.d}s`, '--dx': `${s.dx}px` }}
                />
            ))}

            {/* VIGNETTE */}
            <rect width="1600" height="900" fill={`url(#${id}-vig)`} />
        </svg>
    );
}

/* ---------------- KOMPONEN UTAMA ---------------- */
export default function IntroLoader({ onFinish }) {
    const [opening, setOpening] = useState(false);

    useEffect(() => {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const work = reduce ? 300 : WORK_MS;
        const open = reduce ? 0 : OPEN_MS;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const t1 = setTimeout(() => setOpening(true), work);
        const t2 = setTimeout(() => {
            document.body.style.overflow = previous;
            onFinish?.();
        }, work + open + 60);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            document.body.style.overflow = previous;
        };
    }, [onFinish]);

    const slide = `transform ${OPEN_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`;

    return (
        <div className="fixed inset-0 z-[200] overflow-hidden bg-transparent" role="status" aria-label="Memuat dashboard">
            <style>{`
                @keyframes igSpin { to { transform: rotate(360deg); } }
                @keyframes igPiston {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(120px); }
                }
                @keyframes igNeedle {
                    0%, 100% { transform: rotate(-50deg); }
                    40% { transform: rotate(35deg); }
                    55% { transform: rotate(20deg); }
                    80% { transform: rotate(48deg); }
                }
                @keyframes igSteam {
                    0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
                    20% { opacity: 0.22; }
                    100% { transform: translate(14px, -260px) scale(2.6); opacity: 0; }
                }
                @keyframes igSpark {
                    0% { transform: translate(0, 0); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translate(var(--dx), -90px); opacity: 0; }
                }
                @keyframes igFlicker {
                    0%, 100% { opacity: 1; }
                    8% { opacity: 0.88; }
                    12% { opacity: 1; }
                    52% { opacity: 0.93; }
                    56% { opacity: 1; }
                }
                @keyframes igWorker {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(2.5px); }
                }
                @keyframes igIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes igBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

                .ig { transform-box: fill-box; transform-origin: center; animation: igSpin linear infinite; }
                .ip { animation: igPiston 1.6s ease-in-out infinite; }
                .ineedle { transform-box: view-box; transform-origin: 0 0; animation: igNeedle 3.4s ease-in-out infinite; }
                .isteam { animation: igSteam 2.7s ease-out infinite; opacity: 0; }
                .ispark { animation: igSpark 2.5s ease-out infinite; opacity: 0; }
                .iflicker { animation: igFlicker 3.2s steps(1, end) infinite; }
                .iworker { animation: igWorker 3.2s ease-in-out infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .ig, .ip, .ineedle, .isteam, .ispark, .iflicker, .iworker { animation: none !important; }
                }
            `}</style>

            {/* SETENGAH KIRI */}
            <div
                className="absolute inset-y-0 left-0 overflow-hidden bg-[#050b1a]"
                style={{
                    width: 'calc(50% + 1px)',
                    transform: opening ? 'translateX(-101%)' : 'translateX(0)',
                    transition: slide,
                    willChange: 'transform',
                }}
            >
                <div className="absolute left-0 top-0 h-full" style={{ width: '100vw' }}>
                    <Scene id="l" />
                </div>
            </div>

            {/* SETENGAH KANAN */}
            <div
                className="absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-[#050b1a]"
                style={{
                    transform: opening ? 'translateX(101%)' : 'translateX(0)',
                    transition: slide,
                    willChange: 'transform',
                }}
            >
                <div className="absolute right-0 top-0 h-full" style={{ width: '100vw' }}>
                    <Scene id="r" />
                </div>
            </div>

            {/* TEKS & PROGRES */}
            <div
                className="pointer-events-none absolute inset-x-0 bottom-[6vh] flex flex-col items-center px-6"
                style={{
                    opacity: opening ? 0 : 1,
                    transition: 'opacity 260ms ease-out',
                }}
            >
                <h2
                    className="text-center text-2xl font-black tracking-tight text-white sm:text-4xl"
                    style={{
                        animation: 'igIn 700ms 250ms ease-out both',
                        textShadow: '0 2px 18px rgba(0,0,0,0.9)',
                    }}
                >
                    Preventive Maintenance
                </h2>
                <p
                    className="mt-1 text-center text-sm font-medium text-white/60"
                    style={{ animation: 'igIn 700ms 380ms ease-out both' }}
                >
                    Menyiapkan dashboard…
                </p>
                <div
                    className="mt-4 h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-white/15"
                    style={{ animation: 'igIn 700ms 450ms ease-out both' }}
                >
                    <div
                        className="h-full origin-left rounded-full bg-white"
                        style={{ animation: `igBar ${WORK_MS}ms cubic-bezier(0.45, 0, 0.2, 1) forwards` }}
                    />
                </div>
            </div>
        </div>
    );
}
