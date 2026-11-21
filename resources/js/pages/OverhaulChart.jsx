import React from 'react';
import { C, Panel, Legend, XYChart, GaugeChart } from './DashKit';

export const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/* ------------------------------------------------------------------
| OVERHAUL
| Act (batang) + Plan (garis) | gauge capaian | kumulatif Plan vs Act
------------------------------------------------------------------ */
export function OverhaulDashboard({ data = [], pct = 0, animated }) {
    const cats = data.map((d, i) => ({ label: MONTHS_SHORT[i] ?? String(d.nama_bulan).slice(0, 3) }));

    const plan = data.map((d) => Number(d.plan || 0));
    const act = data.map((d) => Number(d.act || 0));

    const cum = (arr) => {
        let s = 0;

        return arr.map((v) => (s += v));
    };

    return (
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-12 xl:grid-rows-2">
            <Panel
                title="Plan vs Act per Bulan"
                className="xl:col-span-8 xl:row-span-2"
                right={
                    <Legend
                        items={[
                            { label: 'Act', color: C.orange },
                            { label: 'Plan', color: C.cyan, line: true },
                        ]}
                    />
                }
            >
                <XYChart
                    cats={cats}
                    labels="bars"
                    lineLabels
                    animated={animated}
                    maxBar={40}
                    series={[
                        { name: 'Act', type: 'bar', color: C.orange, values: act },
                        { name: 'Plan', type: 'line', color: C.cyan, values: plan },
                    ]}
                />
            </Panel>

            <Panel title="Pencapaian" className="xl:col-span-4">
                <GaugeChart pct={pct} color={C.green} animated={animated} label="Pencapaian overhaul" />
            </Panel>

            <Panel
                title="Kumulatif"
                className="xl:col-span-4"
                right={
                    <Legend
                        items={[
                            { label: 'Act', color: C.orange, line: true },
                            { label: 'Plan', color: C.cyan, line: true },
                        ]}
                    />
                }
            >
                <XYChart
                    cats={cats}
                    animated={animated}
                    series={[
                        { name: 'Plan', type: 'line', color: C.cyan, values: cum(plan) },
                        { name: 'Act', type: 'line', color: C.orange, values: cum(act), area: true },
                    ]}
                />
            </Panel>
        </div>
    );
}
