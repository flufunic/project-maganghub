/* ------------------------------------------------------------------
| EXPORT PDF LAPORAN BULANAN & PERIODE (TAHUNAN)
| Tanpa library: membangun dokumen HTML khusus cetak di iframe
| tersembunyi, lalu memanggil print() -> pilih "Simpan sebagai PDF".
------------------------------------------------------------------ */

const esc = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/* ------------------------------------------------------------------
| WARNA DIVISI (sama dengan Welcome.jsx)
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

const getWarna = (divisi, index) =>
    WARNA_DIVISI[divisi] ?? WARNA_CADANGAN[index % WARNA_CADANGAN.length];

/* ------------------------------------------------------------------
| BAGIAN LAPORAN BULANAN
------------------------------------------------------------------ */
const buildBarChart = (divisiReport) => {
    const max = Math.max(
        1,
        ...divisiReport.flatMap((d) => [Number(d.act || 0), Number(d.plan || 0)])
    );

    const ticks = [0, 1, 2, 3, 4]
        .map((i) => {
            const value = Math.round((max * i) / 4);
            return `
                <div class="grid-line" style="bottom:${i * 25}%"></div>
                <span class="y-label" style="bottom:${i * 25}%">${value}</span>`;
        })
        .join('');

    const bar = (value, cls) => {
        const pct = value > 0 ? Math.max((value / max) * 100, 3) : 0;
        return `
            <div class="bar-wrap">
                ${
                    value > 0
                        ? `<span class="bar-value ${cls}-text" style="bottom:calc(${pct}% + 3px)">${value}</span>`
                        : ''
                }
                <div class="bar ${cls}" style="height:${pct}%"></div>
            </div>`;
    };

    const groups = divisiReport
        .map(
            (d) => `
            <div class="group">
                <div class="group-bars">
                    ${bar(Number(d.act || 0), 'act')}
                    ${bar(Number(d.plan || 0), 'plan')}
                </div>
                <div class="group-label">${esc(d.divisi)}</div>
            </div>`
        )
        .join('');

    return `
        <div class="chart">
            <div class="plot">
                ${ticks}
                <div class="groups">${groups}</div>
            </div>
        </div>
        <div class="legend">
            <span><i class="dot act"></i>ACT</span>
            <span><i class="dot plan"></i>Plan</span>
        </div>`;
};

const buildPie = ({ totalAct, totalPlan, totalJadwal }) => {
    const total = totalAct + totalPlan;
    const actPct = total > 0 ? (totalAct / total) * 100 : 0;
    const planPct = total > 0 ? (totalPlan / total) * 100 : 0;

    return `
        <div class="pie-box">
            <div class="pie" style="background:conic-gradient(#2563eb 0% ${actPct}%, #f59e0b ${actPct}% 100%)">
                <div class="pie-hole">
                    <b>${Math.round(actPct)}%</b>
                    <small>ACT</small>
                </div>
            </div>
            <div class="pie-info">
                <div class="stat stat-act">
                    <div><b>ACT</b><small>Sudah preventif</small></div>
                    <div class="num"><b>${totalAct}</b><small>${actPct.toFixed(1)}%</small></div>
                </div>
                <div class="stat stat-plan">
                    <div><b>Plan</b><small>Belum preventif</small></div>
                    <div class="num"><b>${totalPlan}</b><small>${planPct.toFixed(1)}%</small></div>
                </div>
                <div class="stat-total">
                    <span>Total jadwal</span><b>${totalJadwal}</b>
                </div>
            </div>
        </div>`;
};

const buildTable = (detail) => {
    if (!detail.length) {
        return `<p class="empty">Tidak ada jadwal preventif pada bulan yang dipilih.</p>`;
    }

    // Kelompokkan per divisi (urutan kemunculan pertama dipertahankan)
    const order = [];
    const groups = {};
    detail.forEach((item) => {
        const key = item.divisi || '-';
        if (!groups[key]) {
            groups[key] = [];
            order.push(key);
        }
        groups[key].push(item);
    });

    // Catatan: sengaja TIDAK pakai rowspan. Di mode cetak, rowspan membuat
    // browser menganggap satu grup divisi tak boleh terpotong, sehingga
    // seluruh tabel loncat ke halaman 2. Sebagai gantinya, sel Divisi digabung
    // secara visual (nama hanya di baris pertama, tanpa garis di antara baris).
    let no = 0;
    const rows = order
        .map((key) => {
            const list = groups[key];

            return list
                .map((item, i) => {
                    no += 1;
                    const isFirst = i === 0;
                    const isLast = i === list.length - 1;

                    return `
            <tr class="${isFirst ? 'group-start' : ''}">
                <td class="c muted">${no}</td>
                <td class="divisi ${isLast ? 'divisi-last' : ''}">${isFirst ? esc(key) : ''}</td>
                <td>${esc(item.item_preventif || '-')}</td>
                <td class="c">${esc(item.total_jadwal)}</td>
                <td class="c blue">${esc(item.act)}</td>
                <td class="c amber">${esc(item.plan)}</td>
            </tr>`;
                })
                .join('');
        })
        .join('');

    return `
        <table>
            <thead>
                <tr>
                    <th class="c">No</th>
                    <th>Divisi</th>
                    <th>Item Preventif</th>
                    <th class="c">Jumlah Item</th>
                    <th class="c">Sudah Preventif</th>
                    <th class="c">Belum Preventif</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
};

/* ------------------------------------------------------------------
| BAGIAN LAPORAN PERIODE (TAHUNAN)
------------------------------------------------------------------ */
const buildAnnualChart = (annualReport, stackDivisi) => {
    const max = Math.max(
        1,
        ...annualReport.flatMap((r) => [Number(r.act || 0), Number(r.plan || 0)])
    );

    const n = annualReport.length;
    const spansYears = annualReport.some((r) => r.tahun !== annualReport[0].tahun);

    const ticks = [0, 1, 2, 3, 4]
        .map((i) => {
            const value = Math.round((max * i) / 4);
            return `
                <div class="grid-line" style="bottom:${i * 25}%"></div>
                <span class="y-label" style="bottom:${i * 25}%">${value}</span>`;
        })
        .join('');

    // Batang ACT bertumpuk per divisi
    const groups = annualReport
        .map((r) => {
            const act = Number(r.act || 0);
            const actPct = act > 0 ? Math.max((act / max) * 100, 3) : 0;

            const segments = stackDivisi
                .map((divisi, i) => ({
                    divisi,
                    value: Number(r.act_per_divisi?.[divisi] || 0),
                    warna: getWarna(divisi, i),
                }))
                .filter((s) => s.value > 0);

            const segHtml = segments
                .map(
                    (s) => `
                        <div class="seg" style="flex-grow:${s.value};background:${s.warna.bg};color:${s.warna.text}">
                            ${s.value}
                        </div>`
                )
                .join('');

            const total =
                segments.length > 1 && act > 0
                    ? `<span class="stack-total" style="bottom:calc(${actPct}% + 3px)">${act}</span>`
                    : '';

            return `
            <div class="group">
                ${
                    act > 0
                        ? `<div class="stack" style="height:${actPct}%">${segHtml}</div>${total}`
                        : ''
                }
                <div class="group-label">
                    ${esc(String(r.nama_bulan || '').slice(0, 3))}
                    ${spansYears ? `<small>${esc(r.tahun)}</small>` : ''}
                </div>
            </div>`;
        })
        .join('');

    // Garis Plan
    const points = annualReport.map((r, i) => {
        const x = n === 1 ? 50 : ((i + 0.5) / n) * 100;
        const y = 100 - (Number(r.plan || 0) / max) * 100;
        return { x, y, plan: Number(r.plan || 0) };
    });

    const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

    const dots = points
        .map(
            (p) => `
            <span class="plan-dot" style="left:${p.x}%;top:${p.y}%"></span>
            ${
                p.plan > 0
                    ? `<span class="plan-label" style="left:${p.x}%;top:${p.y}%">${p.plan}</span>`
                    : ''
            }`
        )
        .join('');

    const legendDivisi = stackDivisi
        .map(
            (divisi, i) =>
                `<span><i class="sq" style="background:${getWarna(divisi, i).bg}"></i>ACT ${esc(divisi)}</span>`
        )
        .join('');

    return `
        <div class="chart">
            <div class="plot plot-annual">
                ${ticks}
                <div class="groups">${groups}</div>
                <div class="plan-layer">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline points="${polyline}" fill="none" stroke="#f97316" stroke-width="2.5"
                            vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    ${dots}
                </div>
            </div>
        </div>
        <div class="legend">
            ${legendDivisi}
            <span><i class="line"></i>Plan</span>
        </div>`;
};

const buildAnnualSummary = (annualReport) => {
    const rows = annualReport
        .map((r) => {
            const act = Number(r.act || 0);
            const plan = Number(r.plan || 0);
            const pct = plan > 0 ? ((act / plan) * 100).toFixed(1) : '0.0';

            return `
            <tr>
                <td>${esc(r.nama_bulan)} ${esc(r.tahun)}</td>
                <td class="c">${plan}</td>
                <td class="c blue">${act}</td>
                <td class="c amber">${Math.max(plan - act, 0)}</td>
                <td class="c">${pct}%</td>
            </tr>`;
        })
        .join('');

    const totalAct = annualReport.reduce((s, r) => s + Number(r.act || 0), 0);
    const totalPlan = annualReport.reduce((s, r) => s + Number(r.plan || 0), 0);
    const totalPct = totalPlan > 0 ? ((totalAct / totalPlan) * 100).toFixed(1) : '0.0';

    return `
        <table>
            <thead>
                <tr>
                    <th>Bulan</th>
                    <th class="c">Total Jadwal (Plan)</th>
                    <th class="c">ACT</th>
                    <th class="c">Belum Preventif</th>
                    <th class="c">% ACT</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr>
                    <td><b>Total</b></td>
                    <td class="c"><b>${totalPlan}</b></td>
                    <td class="c blue"><b>${totalAct}</b></td>
                    <td class="c amber"><b>${Math.max(totalPlan - totalAct, 0)}</b></td>
                    <td class="c"><b>${totalPct}%</b></td>
                </tr>
            </tfoot>
        </table>`;
};

const buildAnnualDetail = (annualReport, annualDetail) => {
    if (!annualDetail.length) {
        return `<p class="empty">Tidak ada rincian item pada periode yang dipilih.</p>`;
    }

    // Maksimal 12 bulan per tabel supaya muat di halaman landscape
    const PER_TABEL = 12;
    const chunks = [];
    for (let i = 0; i < annualReport.length; i += PER_TABEL) {
        chunks.push(annualReport.slice(i, i + PER_TABEL));
    }

    return chunks
        .map((bulanList, chunkIndex) => {
            const isLastChunk = chunkIndex === chunks.length - 1;

            const head = bulanList
                .map(
                    (b) =>
                        `<th class="c m">${esc(String(b.nama_bulan || '').slice(0, 3))}<br><small>${esc(b.tahun)}</small></th>`
                )
                .join('');

            let lastDivisi = null;

            const rows = annualDetail
                .map((item, i) => {
                    const isFirst = item.divisi !== lastDivisi;
                    lastDivisi = item.divisi;

                    const cells = bulanList
                        .map((b) => {
                            const d = item.bulan?.[`${b.tahun}-${b.bulan}`];

                            if (!d) {
                                return `<td class="c muted m">-</td>`;
                            }

                            const full = Number(d.act) >= Number(d.jadwal);
                            const none = Number(d.act) === 0;
                            const cls = full ? 'ok' : none ? 'amber' : 'blue';

                            return `<td class="c m ${cls}">${esc(d.act)}/${esc(d.jadwal)}</td>`;
                        })
                        .join('');

                    const totalCell = isLastChunk
                        ? `<td class="c"><b>${esc(item.total_act)}/${esc(item.total_jadwal)}</b></td>`
                        : '';

                    return `
                <tr class="${isFirst ? 'group-start' : ''}">
                    <td class="c muted">${i + 1}</td>
                    <td class="divisi-cell">${isFirst ? esc(item.divisi) : ''}</td>
                    <td>${esc(item.item_preventif || '-')}</td>
                    ${cells}
                    ${totalCell}
                </tr>`;
                })
                .join('');

            return `
            <table class="annual-detail">
                <thead>
                    <tr>
                        <th class="c">No</th>
                        <th>Divisi</th>
                        <th>Item Preventif</th>
                        ${head}
                        ${isLastChunk ? '<th class="c">Total</th>' : ''}
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`;
        })
        .join('<div class="spacer"></div>');
};

/* ------------------------------------------------------------------
| STYLE
------------------------------------------------------------------ */
const STYLE = `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        color: #0f172a; font-size: 11px;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    header { border-bottom: 3px solid #1447b8; padding-bottom: 8px; margin-bottom: 14px; }
    header small { color: #1447b8; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; font-size: 9px; }
    header h1 { margin: 2px 0 0; font-size: 20px; }
    header p { margin: 2px 0 0; color: #64748b; }

    h2 { font-size: 13px; margin: 0 0 8px; break-after: avoid; page-break-after: avoid; }
    section { margin-bottom: 16px; }
    .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; break-inside: avoid; }
    .spacer { height: 14px; }
    .page-break { break-before: page; page-break-before: always; }

    /* BAR CHART */
    .chart { padding-left: 34px; }
    .plot { position: relative; height: 180px; margin-bottom: 28px; border-bottom: 1px solid #94a3b8; }
    .grid-line { position: absolute; left: 0; right: 0; border-top: 1px dashed #cbd5e1; }
    .y-label { position: absolute; left: -34px; width: 28px; text-align: right; transform: translateY(50%); font-size: 9px; color: #64748b; }
    .groups { position: absolute; inset: 0; display: flex; }
    .group { flex: 1; position: relative; }
    .group-bars { position: absolute; inset: 0; display: flex; justify-content: center; align-items: flex-end; gap: 6px; }
    .bar-wrap { position: relative; width: 26px; height: 100%; }
    .bar { position: absolute; bottom: 0; left: 0; right: 0; border-radius: 6px 6px 0 0; }
    .bar.act { background: linear-gradient(to top, #1d4ed8, #38bdf8); }
    .bar.plan { background: linear-gradient(to top, #f59e0b, #fde047); }
    .bar-value { position: absolute; left: 50%; transform: translateX(-50%); font-weight: 800; font-size: 10px; white-space: nowrap; }
    .act-text { color: #1d4ed8; }
    .plan-text { color: #d97706; }
    .group-label { position: absolute; top: calc(100% + 6px); left: 0; right: 0; text-align: center; font-weight: 700; font-size: 10px; color: #475569; }
    .group-label small { display: block; font-weight: 600; color: #94a3b8; font-size: 9px; }
    .legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; font-weight: 600; color: #475569; }
    .legend span { display: inline-flex; align-items: center; }
    .dot { display: inline-block; width: 12px; height: 8px; border-radius: 4px; margin-right: 6px; }
    .dot.act { background: #2563eb; }
    .dot.plan { background: #f59e0b; }
    .sq { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
    .line { display: inline-block; width: 20px; border-top: 3px solid #f97316; margin-right: 6px; }

    /* PERIOD CHART */
    .plot-annual { height: 230px; }
    .stack { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 70%; max-width: 38px; display: flex; flex-direction: column-reverse; border-radius: 6px 6px 0 0; overflow: hidden; }
    .seg { flex-basis: 0; min-height: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; line-height: 1; border-top: 1px solid rgba(255,255,255,.5); overflow: hidden; }
    .seg:first-child { border-top: 0; }
    .stack-total { position: absolute; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 800; color: #334155; white-space: nowrap; }
    .plan-layer { position: absolute; inset: 0; pointer-events: none; }
    .plan-layer svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .plan-dot { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: #fff; border: 2.5px solid #f97316; transform: translate(-50%, -50%); }
    .plan-label { position: absolute; transform: translate(-50%, -22px); font-size: 10px; font-weight: 800; color: #ea580c; background: #fff; border: 1px solid #ffedd5; border-radius: 4px; padding: 0 3px; white-space: nowrap; }

    /* PIE */
    .pie-box { display: flex; align-items: center; gap: 24px; }
    .pie { width: 110px; height: 110px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .pie-hole { width: 74px; height: 74px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .pie-hole b { font-size: 18px; }
    .pie-hole small { font-size: 9px; color: #64748b; font-weight: 600; }
    .pie-info { flex: 1; }
    .stat { display: flex; justify-content: space-between; align-items: center; border-radius: 10px; padding: 7px 12px; margin-bottom: 6px; }
    .stat small { display: block; color: #64748b; font-size: 9px; }
    .stat b { font-size: 12px; }
    .stat .num { text-align: right; }
    .stat .num b { font-size: 16px; }
    .stat-act { background: #eff6ff; border: 1px solid #dbeafe; }
    .stat-act .num b { color: #2563eb; }
    .stat-plan { background: #fffbeb; border: 1px solid #fef3c7; }
    .stat-plan .num b { color: #d97706; }
    .stat-total { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; color: #64748b; font-weight: 600; }
    .stat-total b { color: #0f172a; }

    /* TABLE */
    table { width: 100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th { background: #f1f5f9; color: #475569; font-size: 10px; text-align: left; padding: 7px 8px; border-bottom: 1px solid #cbd5e1; }
    td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tbody tr:nth-child(even) td { background: #f8fafc; }
    tfoot td { background: #f1f5f9; border-top: 2px solid #cbd5e1; }
    .c { text-align: center; }
    .muted { color: #94a3b8; }
    td.blue { color: #2563eb; font-weight: 700; }
    td.amber { color: #d97706; font-weight: 700; }
    td.ok { color: #16a34a; font-weight: 700; }
    th.c:nth-child(5) { color: #2563eb; }
    th.c:nth-child(6) { color: #d97706; }
    td.divisi { font-weight: 700; color: #1e3a8a; background: #eff6ff !important; vertical-align: top; border-right: 1px solid #dbeafe; border-bottom: 0; }
    td.divisi-last { border-bottom: 1px solid #cbd5e1; }
    tr.group-start td { border-top: 2px solid #cbd5e1; }
    .empty { text-align: center; color: #64748b; padding: 24px 0; }

    /* TABEL DETAIL PERIODE */
    table.annual-detail th, table.annual-detail td { padding: 5px 6px; font-size: 10px; }
    table.annual-detail th.m, table.annual-detail td.m { padding-left: 2px; padding-right: 2px; }
    table.annual-detail th small { font-weight: 600; color: #94a3b8; font-size: 8px; }
    td.divisi-cell { font-weight: 700; color: #1e3a8a; background: #eff6ff !important; border-right: 1px solid #dbeafe; }

    footer { margin-top: 14px; padding-top: 6px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 9px; display: flex; justify-content: space-between; }
`;

/* ------------------------------------------------------------------
| CETAK (iframe tersembunyi)
------------------------------------------------------------------ */
const printHtml = ({ html, judulFile }) => {
    // iframe tersembunyi (tidak kena popup blocker)
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Nama file default saat "Simpan sebagai PDF" diambil dari title halaman
    const originalTitle = document.title;
    document.title = judulFile;

    const cleanup = () => {
        document.title = originalTitle;
        setTimeout(() => iframe.remove(), 500);
    };

    iframe.contentWindow.addEventListener('afterprint', cleanup);

    // beri waktu render sebentar sebelum dialog cetak dibuka
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 250);
};

const waktuCetak = () =>
    new Date().toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    });

const footerHtml = () => `
    <footer>
        <span>Dicetak: ${esc(waktuCetak())}</span>
        <span>© ${new Date().getFullYear()} Emma Sarkilla</span>
    </footer>`;

/* ------------------------------------------------------------------
| PDF LAPORAN BULANAN
------------------------------------------------------------------ */
export function printLaporanBulanan({
    namaBulan,
    tahun,
    divisiReport = [],
    detail = [],
    totalAct = 0,
    totalPlan = 0,
    totalJadwal = 0,
}) {
    const periode = `${namaBulan} ${tahun}`;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <title>Laporan Preventive Maintenance - ${esc(periode)}</title>
    <style>
        @page { size: A4 portrait; margin: 14mm; }
        ${STYLE}
    </style>
</head>
<body>
    <header>
        <small>Maintenance Monitoring System</small>
        <h1>Laporan Preventive Maintenance</h1>
        <p>Periode: <b>${esc(periode)}</b></p>
    </header>

    <section class="card">
        <h2>ACT vs Plan per Divisi</h2>
        ${
            divisiReport.length > 0
                ? buildBarChart(divisiReport)
                : '<p class="empty">Tidak ada jadwal preventif pada bulan yang dipilih.</p>'
        }
    </section>

    <section class="card">
        <h2>Persentase ACT vs Plan</h2>
        ${buildPie({ totalAct, totalPlan, totalJadwal })}
    </section>

    <section>
        <h2>Detail Preventive Maintenance (${detail.length} item)</h2>
        ${buildTable(detail)}
    </section>

    ${footerHtml()}
</body>
</html>`;

    printHtml({ html, judulFile: `Laporan PM - ${periode}` });
}

/* ------------------------------------------------------------------
| PDF LAPORAN PERIODE (TAHUNAN)
------------------------------------------------------------------ */
export function printLaporanTahunan({
    annualReport = [],
    daftarDivisi = [],
    annualDetail = [],
}) {
    const awal = annualReport[0];
    const akhir = annualReport[annualReport.length - 1];

    const periode = awal
        ? awal.bulan === akhir.bulan && awal.tahun === akhir.tahun
            ? `${awal.nama_bulan} ${awal.tahun}`
            : `${awal.nama_bulan} ${awal.tahun} - ${akhir.nama_bulan} ${akhir.tahun}`
        : '-';

    // Daftar divisi untuk tumpukan batang (fallback dari data bila kosong)
    const stackDivisi =
        daftarDivisi.length > 0
            ? daftarDivisi
            : Array.from(
                  new Set(
                      annualReport.flatMap((r) => Object.keys(r.act_per_divisi ?? {}))
                  )
              );

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <title>Laporan Periode Preventive Maintenance - ${esc(periode)}</title>
    <style>
        @page { size: A4 landscape; margin: 12mm; }
        ${STYLE}
    </style>
</head>
<body>
    <header>
        <small>Maintenance Monitoring System</small>
        <h1>Laporan Periode Preventive Maintenance</h1>
        <p>Periode: <b>${esc(periode)}</b></p>
    </header>

    <section class="card">
        <h2>Laporan ACT &amp; Plan per Periode</h2>
        ${
            annualReport.length > 0
                ? buildAnnualChart(annualReport, stackDivisi)
                : '<p class="empty">Tidak ada data pada periode yang dipilih.</p>'
        }
    </section>

    ${
        annualReport.length > 0
            ? `<section>
        <h2>Ringkasan per Bulan</h2>
        ${buildAnnualSummary(annualReport)}
    </section>`
            : ''
    }

    <section class="page-break">
        <h2>Rincian Item per Bulan <small style="font-weight:500;color:#64748b">(ACT / Jadwal)</small></h2>
        ${buildAnnualDetail(annualReport, annualDetail)}
    </section>

    ${footerHtml()}
</body>
</html>`;

    printHtml({ html, judulFile: `Laporan Periode PM - ${periode}` });
}