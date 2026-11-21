import React from 'react';
import { C, Panel, Legend, XYChart, DonutChart, HBars, divColor, fmt } from './DashKit';

const GRID = 'grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-12 xl:grid-rows-2';

/* ------------------------------------------------------------------
| PREVENTIVE - PERIODE (tahunan)
| ACT bertumpuk per divisi + garis Plan | donut komposisi | capaian per divisi
------------------------------------------------------------------ */
export function AnnualDashboard({ report, stackDivisi, annualDetail = [], animated }) {
    const spansYears = report.some((i) => i.tahun !== report[0].tahun);

    const cats = report.map((i) => ({
        label: String(i.nama_bulan || '').slice(0, 3),
        sub: spansYears ? String(i.tahun) : '',
    }));

    const divs = stackDivisi.filter((d) =>
        report.some((i) => Number(i.act_per_divisi?.[d] || 0) > 0)
    );

    const series = [
        ...divs.map((d) => ({
            name: d,
            type: 'bar',
            color: divColor(d, stackDivisi.indexOf(d)),
            values: report.map((i) => Number(i.act_per_divisi?.[d] || 0)),
        })),
        {
            name: 'Plan',
            type: 'line',
            color: C.magenta,
            values: report.map((i) => Number(i.plan || 0)),
        },
    ];

    const share = divs.map((d) => ({
        label: d,
        color: divColor(d, stackDivisi.indexOf(d)),
        value: report.reduce((a, i) => a + Number(i.act_per_divisi?.[d] || 0), 0),
    }));

    // capaian per divisi dari rincian item
    const agg = {};

    annualDetail.forEach((it) => {
        const k = it.divisi || '-';

        agg[k] = agg[k] || { act: 0, jadwal: 0 };
        agg[k].act += Number(it.total_act || 0);
        agg[k].jadwal += Number(it.total_jadwal || 0);
    });

    const rows = Object.entries(agg).map(([d, v]) => {
        const pct = v.jadwal > 0 ? (v.act / v.jadwal) * 100 : 0;

        return {
            label: d,
            text: `${fmt(pct, 0)}%`,
            segments: [{ value: pct, color: divColor(d, stackDivisi.indexOf(d)), name: 'Capaian' }],
            tipRows: [
                { color: divColor(d, stackDivisi.indexOf(d)), label: 'ACT', value: fmt(v.act) },
                { label: 'Jadwal', value: fmt(v.jadwal) },
                { label: 'Capaian', value: `${fmt(pct, 1)}%`, strong: true },
            ],
        };
    });

    return (
        <div className={GRID}>
            <Panel
                title="ACT per Divisi dan Plan"
                className="xl:col-span-8 xl:row-span-2"
                right={
                    <Legend
                        items={[
                            ...divs.map((d) => ({
                                label: d,
                                color: divColor(d, stackDivisi.indexOf(d)),
                            })),
                            { label: 'Plan', color: C.magenta, line: true },
                        ]}
                    />
                }
            >
                <XYChart
                    cats={cats}
                    series={series}
                    stack
                    segLabels
                    lineLabels
                    animated={animated}
                />
            </Panel>

            <Panel title="Komposisi ACT" className="xl:col-span-4">
                <DonutChart data={share} animated={animated} centerSub="Total ACT" />
            </Panel>

            <Panel title="Capaian per Divisi" className="xl:col-span-4">
                <HBars rows={rows} animated={animated} max={100} />
            </Panel>
        </div>
    );
}

/* ------------------------------------------------------------------
| PREVENTIVE - BULANAN
| ACT vs Plan per divisi | donut ACT vs Plan | item terbanyak yang belum
------------------------------------------------------------------ */
export function MonthlyDashboard({ divisiReport, detail = [], totalAct, totalPlan, animated }) {
    const cats = divisiReport.map((d) => ({ label: d.divisi }));

    const series = [
        {
            name: 'ACT (sudah)',
            type: 'bar',
            color: C.cyan,
            values: divisiReport.map((d) => Number(d.act || 0)),
        },
        {
            name: 'Plan (belum)',
            type: 'bar',
            color: C.orange,
            values: divisiReport.map((d) => Number(d.plan || 0)),
        },
    ];

    const total = totalAct + totalPlan;
    const pct = total > 0 ? (totalAct / total) * 100 : 0;

    const top = [...detail]
        .sort((a, b) => Number(b.plan || 0) - Number(a.plan || 0))
        .slice(0, 6);

    const rows = top.map((it) => ({
        label: `${it.divisi} · ${it.item_preventif || '-'}`,
        text: `${it.act}/${it.total_jadwal}`,
        segments: [
            { value: Number(it.act || 0), color: C.cyan, name: 'Sudah' },
            { value: Number(it.plan || 0), color: C.orange, name: 'Belum' },
        ],
    }));

    return (
        <div className={GRID}>
            <Panel
                title="ACT vs Plan per Divisi"
                className="xl:col-span-8 xl:row-span-2"
                right={
                    <Legend
                        items={[
                            { label: 'ACT', color: C.cyan },
                            { label: 'Plan', color: C.orange },
                        ]}
                    />
                }
            >
                <XYChart cats={cats} series={series} labels="bars" animated={animated} maxBar={30} />
            </Panel>

            <Panel title="Persentase ACT" className="xl:col-span-4">
                <DonutChart
                    animated={animated}
                    centerValue={`${fmt(pct, 1)}%`}
                    centerSub="ACT"
                    data={[
                        { label: 'Sudah (ACT)', value: totalAct, color: C.cyan },
                        { label: 'Belum (Plan)', value: totalPlan, color: C.orange },
                    ]}
                />
            </Panel>

            <Panel title="Item Belum Dikerjakan" className="xl:col-span-4">
                <HBars rows={rows} animated={animated} />
            </Panel>
        </div>
    );
}
