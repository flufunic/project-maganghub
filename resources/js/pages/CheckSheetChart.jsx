import React from 'react';

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
    Sewing: {
        gradient: 'linear-gradient(180deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)',
        solid: '#ea580c',
        text: '#ffffff',
    },
};

const FALLBACK = {
    gradient: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)',
    solid: '#94a3b8',
    text: '#0f172a',
};

export const warna = (divisi) => WARNA_DIVISI[divisi] ?? FALLBACK;

/* ------------------------------------------------------------------
| DEFINISI 3 SLIDE GRAFIK
| key = nama field di data bulanan (laporan[].xxx)
------------------------------------------------------------------ */
export const CHARTS = [
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
export function BarChart({ config, laporan, divisi, animated }) {
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
        <div className="dashboard-scrollbar overflow-x-auto pb-1">
            <div className="dashboard-chart-enter relative h-[330px]" style={{ minWidth: '900px' }}>
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
