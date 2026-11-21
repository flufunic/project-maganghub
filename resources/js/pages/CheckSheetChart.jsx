import React from 'react';
import { Panel, Legend, XYChart, DonutChart, HBars, divColor, fmt } from './DashKit';

/* ------------------------------------------------------------------
| CHECK SHEET: 5 grafik dalam satu layar
| Terisi (tumpuk) | Persentase (garis) | Abnormality (tumpuk)
| Komposisi (donut) | Rata-rata pengisian (batang horizontal)
------------------------------------------------------------------ */
export function CheckSheetDashboard({ laporan = [], divisi = [], total = {}, animated }) {
    const cats = laporan.map((m) => ({ label: String(m.nama_bulan || '').slice(0, 3) }));
    const col = (d) => divColor(d, divisi.indexOf(d));

    const make = (key, type) =>
        divisi.map((d) => ({
            name: d,
            type,
            color: col(d),
            values: laporan.map((m) => m[key]?.[d] ?? null),
        }));

    const legend = <Legend items={divisi.map((d) => ({ label: d, color: col(d) }))} />;

    const share = divisi.map((d) => ({
        label: d,
        color: col(d),
        value: Number(total?.[d]?.centang || 0),
    }));

    const rows = divisi.map((d) => {
        const p = total?.[d]?.persen;
        const v = p === null || p === undefined ? 0 : Number(p);

        return {
            label: d,
            text: `${fmt(v, 1)}%`,
            segments: [{ value: v, color: col(d), name: 'Rata-rata' }],
            tipRows: [
                { color: col(d), label: 'Pengisian', value: `${fmt(v, 1)}%` },
                { label: 'Terisi', value: fmt(total?.[d]?.centang || 0) },
                { label: 'Abnormality', value: fmt(total?.[d]?.abnormality || 0) },
            ],
        };
    });

    const maxPct = Math.max(1, ...rows.map((r) => r.segments[0].value)) * 1.1;

    return (
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-12 xl:grid-rows-2">
            <Panel title="Check Sheet Terisi" right={legend} className="xl:col-span-7">
                <XYChart
                    cats={cats}
                    series={make('centang', 'bar')}
                    stack
                    segLabels
                    labels="totals"
                    animated={animated}
                />
            </Panel>

            <Panel title="Persentase Pengisian" right={legend} className="xl:col-span-5">
                <XYChart
                    cats={cats}
                    series={make('persen', 'line')}
                    suffix="%"
                    animated={animated}
                />
            </Panel>

            <Panel title="Abnormality" right={legend} className="xl:col-span-5">
                <XYChart
                    cats={cats}
                    series={make('abnormality', 'bar')}
                    stack
                    labels="totals"
                    animated={animated}
                />
            </Panel>

            <Panel title="Komposisi Terisi" className="xl:col-span-3">
                <DonutChart data={share} animated={animated} centerSub="Total terisi" />
            </Panel>

            <Panel title="Rata-rata Pengisian" className="xl:col-span-4">
                <HBars rows={rows} animated={animated} max={maxPct} />
            </Panel>
        </div>
    );
}
