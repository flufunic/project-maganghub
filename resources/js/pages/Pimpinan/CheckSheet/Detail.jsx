import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    User,
    Clock3,
    Check,
    X,
    ChevronDown,
    Circle,
    StickyNote,
    Percent,
    ListChecks,
    AlertTriangle,
    ShieldAlert,
    Layers,
    Droplets,
    Gauge,
} from 'lucide-react';

/* ------------------------------------------------------------------
| STATUS & WARNA
------------------------------------------------------------------ */
const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'bg-amber-50 text-amber-700 ring-amber-200',
        dot: 'bg-amber-500',
        ping: 'bg-amber-400',
        pulse: true,
    },
    diperiksa: {
        label: 'Sudah Diperiksa',
        cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        dot: 'bg-emerald-500',
        ping: 'bg-emerald-400',
        pulse: false,
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'bg-rose-50 text-rose-700 ring-rose-200',
        dot: 'bg-rose-500',
        ping: 'bg-rose-400',
        pulse: false,
    },
};

// warna persentase: hijau >= 90, kuning >= 60, merah di bawahnya
const warnaPersen = (p) => {
    if (p === null || p === undefined) return 'text-slate-400';
    if (p >= 90) return 'text-emerald-600';
    if (p >= 60) return 'text-amber-600';

    return 'text-rose-600';
};

const barPersen = (p) => {
    if (p === null || p === undefined) return 'bg-slate-300';
    if (p >= 90) return 'bg-emerald-500';
    if (p >= 60) return 'bg-amber-500';

    return 'bg-rose-500';
};

const teksPersen = (p) => (p === null || p === undefined ? '-' : `${p}%`);

const thCls =
    'border border-slate-200 bg-slate-50 px-2 py-2 text-center text-[11px] font-bold text-slate-600';
const tdCls = 'border border-slate-200 px-2 py-2 align-middle text-sm text-slate-700';

/*
| Abnormality milik sebuah check sheet (dan line-nya kalau sheet dipecah per line).
| Dicocokkan lewat divisi + nama check sheet + nama line.
*/
const abnormalityMilik = (a, divisi, sheet) =>
    a.divisi === divisi.nama && a.check_sheet === sheet.nama && (!sheet.line || a.line === sheet.line);

/* ------------------------------------------------------------------
| HOOK: angka naik pelan-pelan
------------------------------------------------------------------ */
function useCountUp(target, duration = 800) {
    const [value, setValue] = useState(0);
    const prev = useRef(0);

    useEffect(() => {
        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (reduce || prev.current === target) {
            setValue(target);
            prev.current = target;
            return undefined;
        }

        const from = prev.current;
        let raf;
        let start;

        const tick = (t) => {
            if (start === undefined) start = t;

            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);

            setValue(Math.round(from + (target - from) * eased));

            if (p < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                prev.current = target;
            }
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return value;
}

/* Angka yang naik; kalau bukan angka (misal persen null) tampil apa adanya */
function Angka({ value, suffix = '', fallback = '-' }) {
    const n = typeof value === 'number' ? value : 0;
    const tampil = useCountUp(n);

    if (typeof value !== 'number') return <>{fallback}</>;

    return (
        <>
            {tampil}
            {suffix}
        </>
    );
}

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */
function Dot({ cls, ping, pulse }) {
    return (
        <span className="relative flex h-2 w-2">
            {pulse && <span className={`csd-ping absolute inline-flex h-full w-full rounded-full ${ping}`} />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${cls}`} />
        </span>
    );
}

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.cls}`}
        >
            <Dot cls={status.dot} ping={status.ping} pulse={status.pulse} />
            {status.label}
        </span>
    );
}

function Meta({ icon: Ico, label, children }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Ico className="h-4 w-4" strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">{children}</p>
            </div>
        </div>
    );
}

function Tile({ icon: Ico, label, tone, index, children }) {
    return (
        <div
            style={{ animationDelay: `${120 + index * 70}ms` }}
            className="csd-rise rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.icon}`}>
                <Ico className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </div>

            <p className={`mt-3 text-2xl font-bold tabular-nums tracking-tight ${tone.value}`}>{children}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
        </div>
    );
}

function Pil({ cls, children }) {
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>
            {children}
        </span>
    );
}

function BarPersen({ persen }) {
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
                className={`csd-bar h-full rounded-full ${barPersen(persen)}`}
                style={{ width: `${persen ?? 0}%` }}
            />
        </div>
    );
}

function SubHeader({ icon: Ico, tone, children }) {
    return (
        <div className={`flex items-center gap-2.5 border-y px-5 py-2.5 ${tone.wrap}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tone.icon}`}>
                <Ico className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <h4 className="text-sm font-bold text-slate-800">{children}</h4>
        </div>
    );
}

const TONE_AMBER = { wrap: 'border-amber-100 bg-amber-50/60', icon: 'bg-amber-100 text-amber-600' };
const TONE_SKY = { wrap: 'border-sky-100 bg-sky-50/60', icon: 'bg-sky-100 text-sky-600' };

// Isi 1 sel (1 item x 1 hari)
function Sel({ sel, mode }) {
    if (!sel) {
        return <span className="text-slate-200">·</span>;
    }

    const catatan = sel.catatan ? (
        <span title={sel.catatan} className="ml-0.5 inline-flex cursor-help align-middle text-amber-500">
            <StickyNote className="h-3 w-3" />
        </span>
    ) : null;

    if (mode === 'actual') {
        return (
            <span className="font-bold text-slate-700">
                {sel.actual ?? '-'}
                {catatan}
            </span>
        );
    }

    if (mode === 'plan_act') {
        return (
            <span className="inline-flex flex-col items-center gap-0.5 leading-none">
                {sel.plan && <Circle className="h-3 w-3 text-sky-500" strokeWidth={2.5} />}
                {sel.status && <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />}
                {!sel.plan && !sel.status && <span className="text-slate-200">·</span>}
                {catatan}
            </span>
        );
    }

    return sel.status ? (
        <span className="inline-flex items-center justify-center text-emerald-600">
            <Check className="h-4 w-4" strokeWidth={3} />
            {catatan}
        </span>
    ) : (
        <span className="text-slate-200">·</span>
    );
}

/* ------------------------------------------------------------------
| PELUMASAN (opsi "Pakai tabel Pelumasan")
------------------------------------------------------------------ */
function TabelPelumasan({ data }) {
    return (
        <div>
            <SubHeader icon={Droplets} tone={TONE_AMBER}>
                Pelumasan
            </SubHeader>

            <div className="csd-scroll overflow-x-auto p-4">
                <table className="w-full min-w-[820px] border-collapse">
                    <thead>
                        <tr>
                            <th className={thCls} rowSpan={2}>No</th>
                            <th className={thCls} rowSpan={2}>Sub Mesin</th>
                            <th className={thCls} rowSpan={2}>Jenis Pelumasan</th>
                            <th className={thCls} rowSpan={2}>Qty</th>
                            <th className={thCls} rowSpan={2}>Method</th>
                            <th className={thCls} rowSpan={2}>Tools</th>
                            <th className={thCls} rowSpan={2}>Time (Min)</th>
                            <th className={thCls} colSpan={4}>Interval</th>
                            <th className={thCls} rowSpan={2}>PIC</th>
                        </tr>
                        <tr>
                            {['Day', 'Week', 'Month', 'Year'].map((x) => (
                                <th key={x} className={thCls}>{x}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={12} className={`${tdCls} py-6 text-center text-slate-400`}>
                                    Belum ada data pelumasan.
                                </td>
                            </tr>
                        )}

                        {data.map((l, i) => (
                            <tr key={l.id} className="transition-colors hover:bg-indigo-50/40">
                                <td className={`${tdCls} text-center text-slate-400`}>{i + 1}</td>
                                <td className={tdCls}>{l.sub_mesin}</td>
                                <td className={tdCls}>{l.jenis}</td>
                                <td className={tdCls}>{l.qty}</td>
                                <td className={tdCls}>{l.method}</td>
                                <td className={tdCls}>{l.tools}</td>
                                <td className={`${tdCls} text-center`}>{l.time}</td>
                                {['day', 'week', 'month', 'year'].map((k) => (
                                    <td key={k} className={`${tdCls} text-center font-bold text-indigo-600`}>
                                        {l.interval === k ? 'o' : ''}
                                    </td>
                                ))}
                                <td className={tdCls}>{l.pic}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
| MONITORING RUNNING HOURS / BBM (opsi "Pakai Monitoring Running Hours")
|
| Nama kolom tabel monitoring belum dipetakan, jadi semua field
| ditampilkan apa adanya. File gambar otomatis jadi thumbnail.
| Ganti dengan tabel khusus kalau nama kolomnya sudah pasti.
------------------------------------------------------------------ */
const SEMBUNYI = [
    'id',
    'check_sheet_id',
    'created_at',
    'updated_at',
    'deleted_at',
    'weeks',
    'monitoring_item_id',
    'bbm_item_id',
];

const isFoto = (v) => typeof v === 'string' && /\.(jpe?g|png|webp|gif)$/i.test(v);
const urlFoto = (v) => (v.startsWith('http') || v.startsWith('/') ? v : `/storage/${v}`);
const judulKolom = (k) => k.replace(/_/g, ' ');

function Nilai({ v }) {
    if (v === null || v === undefined || v === '') {
        return <span className="text-slate-300">-</span>;
    }

    if (isFoto(v)) {
        return (
            <a href={urlFoto(v)} target="_blank" rel="noopener noreferrer" className="inline-block">
                <img
                    src={urlFoto(v)}
                    alt="foto"
                    className="h-16 w-24 rounded-lg border border-slate-200 object-cover transition hover:opacity-90"
                />
            </a>
        );
    }

    return <span>{String(v)}</span>;
}

function BlokMonitoring({ judul, data }) {
    return (
        <div>
            <SubHeader icon={Gauge} tone={TONE_SKY}>
                {judul}
            </SubHeader>

            {data.length === 0 && <p className="px-5 py-4 text-sm text-slate-400">Belum ada data.</p>}

            {data.map((m, idx) => {
                const weeks = m.weeks ?? [];
                const kolomItem = Object.keys(m).filter((k) => !SEMBUNYI.includes(k));
                const kolomWeek = [...new Set(weeks.flatMap((w) => Object.keys(w)))].filter(
                    (k) => !SEMBUNYI.includes(k)
                );

                return (
                    <div key={m.id ?? idx} className="border-b border-slate-100 px-5 py-3 last:border-b-0">
                        <p className="text-sm font-semibold text-slate-800">
                            {kolomItem
                                .map((k) => m[k])
                                .filter((v) => v !== null && v !== '' && typeof v !== 'object')
                                .join(' · ')}
                        </p>

                        {weeks.length === 0 ? (
                            <p className="mt-1 text-xs text-slate-400">Tidak ada data pada week ini.</p>
                        ) : (
                            <div className="csd-scroll mt-2 overflow-x-auto">
                                <table className="w-full min-w-[480px] border-collapse">
                                    <thead>
                                        <tr>
                                            {kolomWeek.map((k) => (
                                                <th key={k} className={`${thCls} capitalize`}>
                                                    {judulKolom(k)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weeks.map((w, i) => (
                                            <tr key={w.id ?? i}>
                                                {kolomWeek.map((k) => (
                                                    <td key={k} className={`${tdCls} text-center`}>
                                                        <Nilai v={w[k]} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------
| ABNORMALITY (per check sheet)
| `tampilkanSheet` = true hanya untuk abnormality yang tidak punya
| check sheet pasangan (bagian "Abnormality Lainnya").
------------------------------------------------------------------ */
function TabelAbnormality({ list, tampilkanSheet = false }) {
    return (
        <div>
            <SubHeader icon={ShieldAlert} tone={TONE_AMBER}>
                Abnormality / Countermeasure ({list.length})
            </SubHeader>

            {list.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-400">Tidak ada abnormality pada minggu ini.</p>
            ) : (
                <div className="csd-scroll overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="bg-slate-50/70 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-3">Tanggal</th>
                                {tampilkanSheet && <th className="px-4 py-3">Check Sheet</th>}
                                <th className="px-4 py-3">Abnormality</th>
                                <th className="px-4 py-3">Countermeasure</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">PIC</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {list.map((a) => (
                                <tr key={a.id} className="align-top transition-colors hover:bg-indigo-50/40">
                                    <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-700">
                                        {a.tanggal_format}
                                    </td>

                                    {tampilkanSheet && (
                                        <td className="px-4 py-3 text-xs text-slate-600">
                                            <span className="font-semibold text-slate-800">{a.divisi}</span>
                                            <br />
                                            {a.check_sheet}
                                            {a.line && <span className="font-bold text-indigo-600"> · {a.line}</span>}
                                        </td>
                                    )}

                                    <td className="px-4 py-3 text-slate-800">
                                        {a.abnormality}
                                        {(a.preventif ?? []).map((p) => (
                                            <span
                                                key={p}
                                                className="mt-1 block w-fit rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100"
                                            >
                                                Preventif {p}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{a.countermeasure || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                                a.selesai ? 'text-emerald-700' : 'text-rose-700'
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    a.selesai ? 'bg-emerald-500' : 'bg-rose-500'
                                                }`}
                                            />
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{a.pic || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
| SATU BLOK CHECK SHEET (+ line), bisa dibuka / ditutup.
| Isinya berurutan: tabel harian, Pelumasan, Monitoring, BBM, Abnormality.
------------------------------------------------------------------ */
function SheetBlok({ sheet, hari, extra, abnormalities }) {
    const [buka, setBuka] = useState(false);

    const adaPelumasan = !!extra?.pakai_pelumasan;
    const adaMonitoring = !!extra?.pakai_monitoring;
    const adaBbm = adaMonitoring && !!extra?.pakai_bbm;
    const abnTerbuka = abnormalities.filter((a) => !a.selesai).length;

    return (
        <div className="border-t border-slate-100">
            <button
                type="button"
                onClick={() => setBuka((v) => !v)}
                aria-expanded={buka}
                className={`flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left outline-none transition-colors hover:bg-indigo-50/40 focus-visible:bg-indigo-50/60 ${
                    buka ? 'bg-indigo-50/40' : ''
                }`}
            >
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {sheet.nama}
                        {sheet.line && (
                            <span className="ml-2 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600">
                                {sheet.line}
                            </span>
                        )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                        {sheet.nomor_dokumen || '-'} · {sheet.items.length} item
                    </p>

                    {(adaPelumasan || adaMonitoring || abnormalities.length > 0) && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {adaPelumasan && <Pil cls="bg-amber-50 text-amber-700 ring-amber-200">Pelumasan</Pil>}
                            {adaMonitoring && <Pil cls="bg-sky-50 text-sky-700 ring-sky-200">Monitoring</Pil>}
                            {abnormalities.length > 0 && (
                                <Pil
                                    cls={
                                        abnTerbuka > 0
                                            ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    }
                                >
                                    Abnormality {abnormalities.length}
                                    {abnTerbuka > 0 && ` · ${abnTerbuka} belum selesai`}
                                </Pil>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                    <div className="hidden w-32 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs tabular-nums text-slate-500">
                            {sheet.terisi}/{sheet.target}
                        </span>
                        <BarPersen persen={sheet.persen} />
                    </div>

                    <span className={`w-14 text-right text-sm font-extrabold tabular-nums ${warnaPersen(sheet.persen)}`}>
                        {teksPersen(sheet.persen)}
                    </span>

                    <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                            buka ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {buka && (
                <div className="csd-slide border-t border-slate-100 bg-slate-50/40">
                    {/* TABEL HARIAN */}
                    <div className="csd-scroll overflow-x-auto p-4">
                        <table className="w-full min-w-[640px] border-collapse bg-white text-xs">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="w-10 border border-slate-200 px-2 py-2 text-center font-bold text-slate-600">
                                        No
                                    </th>
                                    <th className="min-w-[220px] border border-slate-200 px-3 py-2 text-left font-bold text-slate-600">
                                        Inspection Point
                                    </th>
                                    <th className="w-12 border border-slate-200 px-2 py-2 text-center font-bold text-slate-600">
                                        Shift
                                    </th>
                                    {hari.map((h) => (
                                        <th
                                            key={h.tanggal}
                                            className="w-14 border border-slate-200 bg-indigo-50 px-2 py-2 text-center font-bold text-indigo-700"
                                        >
                                            {h.nama}
                                            <br />
                                            <span className="text-[10px] font-semibold text-indigo-400">{h.tgl}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {sheet.items.map((item) => (
                                    <tr key={item.id} className="transition-colors hover:bg-indigo-50/40">
                                        <td className="border border-slate-200 px-2 py-1.5 text-center text-slate-400">
                                            {item.no}
                                        </td>
                                        <td className="border border-slate-200 px-3 py-1.5 font-medium text-slate-700">
                                            {item.inspection_point}
                                        </td>
                                        <td className="border border-slate-200 px-2 py-1.5 text-center font-bold text-indigo-600">
                                            {item.shift || '-'}
                                        </td>
                                        {item.sel.map((sel, i) => (
                                            <td
                                                key={i}
                                                className={`border border-slate-200 px-1 py-1.5 text-center ${
                                                    sel?.status ? 'bg-emerald-50/70' : ''
                                                }`}
                                            >
                                                <Sel sel={sel} mode={sheet.mode} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PELUMASAN */}
                    {adaPelumasan && <TabelPelumasan data={extra.pelumasan ?? []} />}

                    {/* MONITORING RUNNING HOURS */}
                    {adaMonitoring && <BlokMonitoring judul="Monitoring Running Hours" data={extra.monitoring ?? []} />}

                    {/* BBM */}
                    {adaBbm && <BlokMonitoring judul="BBM" data={extra.bbm ?? []} />}

                    {/* ABNORMALITY CHECK SHEET INI */}
                    <TabelAbnormality list={abnormalities} />
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Detail({ pengiriman, rekap, detail = [] }) {
    const [showTolak, setShowTolak] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPeriksa, setShowPeriksa] = useState(false);

    const { hari, divisis, abnormalities, ringkasan } = rekap;
    const s = STATUS[pengiriman.status] ?? STATUS.menunggu;

    // Abnormality yang tidak cocok dengan check sheet mana pun (jaring pengaman)
    const abnLainnya = abnormalities.filter(
        (a) => !divisis.some((d) => d.sheets.some((sheet) => abnormalityMilik(a, d, sheet)))
    );

    const tutupTolak = () => {
        setShowTolak(false);
        setAlasan('');
    };

    // Esc menutup modal
    useEffect(() => {
        if (!showPeriksa && !showTolak) return undefined;

        const onKey = (e) => {
            if (e.key !== 'Escape' || submitting) return;

            setShowPeriksa(false);
            setShowTolak(false);
            setAlasan('');
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showPeriksa, showTolak, submitting]);

    const periksa = () => {
        setShowPeriksa(true);
    };

    const konfirmasiPeriksa = () => {
        setSubmitting(true);

        router.post(
            `/pimpinan/check-sheet/${pengiriman.id}/periksa`,
            {},
            {
                onFinish: () => {
                    setSubmitting(false);
                    setShowPeriksa(false);
                },
            }
        );
    };

    const tolak = () => {
        if (!alasan.trim()) return;

        setSubmitting(true);

        router.post(
            `/pimpinan/check-sheet/${pengiriman.id}/tolak`,
            { alasan_penolakan: alasan },
            {
                onSuccess: () => {
                    setShowTolak(false);
                    setAlasan('');
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const tiles = [
        {
            label: 'Persentase Terisi',
            icon: Percent,
            tone: { icon: 'bg-indigo-50 text-indigo-600', value: warnaPersen(ringkasan.persen) },
            isi: <Angka value={ringkasan.persen} suffix="%" />,
        },
        {
            label: 'Centang Terisi',
            icon: ListChecks,
            tone: { icon: 'bg-sky-50 text-sky-600', value: 'text-slate-900' },
            isi: (
                <>
                    <Angka value={ringkasan.terisi} fallback="0" />
                    <span className="text-base font-semibold text-slate-400"> / {ringkasan.target}</span>
                </>
            ),
        },
        {
            label: 'Abnormality',
            icon: AlertTriangle,
            tone: {
                icon: 'bg-amber-50 text-amber-600',
                value: ringkasan.abnormality > 0 ? 'text-amber-600' : 'text-slate-900',
            },
            isi: <Angka value={ringkasan.abnormality} fallback="0" />,
        },
        {
            label: 'Abnormality Belum Selesai',
            icon: ShieldAlert,
            tone: {
                icon: ringkasan.abnormality_terbuka > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
                value: ringkasan.abnormality_terbuka > 0 ? 'text-rose-600' : 'text-emerald-600',
            },
            isi: <Angka value={ringkasan.abnormality_terbuka} fallback="0" />,
        },
    ];

    return (
        <>
            <Head title="Detail Check Sheet Mingguan" />

            <style>{`
                @keyframes csdRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes csdFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes csdPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
                @keyframes csdSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
                @keyframes csdFloat { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(28px,-22px,0) scale(1.08); } }
                @keyframes csdFloatReverse { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-28px,22px,0) scale(1.1); } }
                @keyframes csdLine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes csdPing { 0% { transform: scale(1); opacity: .6; } 80%, 100% { transform: scale(2.4); opacity: 0; } }
                @keyframes csdBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                @keyframes csdSpin { to { transform: rotate(360deg); } }

                /* fill-mode "backwards": tidak ada transform tersisa setelah selesai */
                .csd-rise { animation: csdRise .6s cubic-bezier(.22,1,.36,1) backwards; }
                .csd-fade { animation: csdFade .25s ease-out both; }
                .csd-pop { animation: csdPop .35s cubic-bezier(.22,1,.36,1) both; }
                .csd-slide { animation: csdSlide .3s cubic-bezier(.22,1,.36,1) backwards; }
                .csd-float { animation: csdFloat 14s ease-in-out infinite; }
                .csd-float-reverse { animation: csdFloatReverse 17s ease-in-out infinite; }
                .csd-line { background-size: 200% 100%; animation: csdLine 7s linear infinite; }
                .csd-ping { animation: csdPing 1.8s cubic-bezier(0,0,.2,1) infinite; }
                .csd-bar { transform-origin: left; animation: csdBar .9s cubic-bezier(.22,1,.36,1) backwards; }
                .csd-spin { animation: csdSpin .8s linear infinite; }

                .csd-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .csd-scroll::-webkit-scrollbar-track { background: transparent; }
                .csd-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }

                @media (prefers-reduced-motion: reduce) {
                    .csd-rise, .csd-fade, .csd-pop, .csd-slide, .csd-float, .csd-float-reverse,
                    .csd-line, .csd-ping, .csd-bar, .csd-spin { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-clip text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50" />
                    <div className="csd-float absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/25 blur-[110px]" />
                    <div className="csd-float-reverse absolute -right-32 top-[15%] h-[460px] w-[460px] rounded-full bg-indigo-300/20 blur-[120px]" />
                    <div className="csd-float absolute bottom-[-180px] left-[30%] h-[440px] w-[440px] rounded-full bg-sky-300/20 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link
                                href="/pimpinan/check-sheet"
                                title="Kembali"
                                aria-label="Kembali"
                                className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            </Link>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    Detail Check Sheet Mingguan
                                </h1>
                                <p className="hidden truncate text-xs text-blue-100/60 sm:block">
                                    {pengiriman.label}
                                </p>
                            </div>
                        </div>

                        <div className="hidden shrink-0 rounded-full bg-white p-1 sm:block">
                            <StatusPill status={s} />
                        </div>
                    </div>

                    <div className="csd-line h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* CONTENT */}
                <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
                    {/* INFO + AKSI */}
                    <div className="csd-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                        {pengiriman.label}
                                    </h2>
                                    <StatusPill status={s} />
                                </div>

                                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                    <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
                                    Pemeriksaan check sheet prediktif mingguan
                                </p>
                            </div>

                            {pengiriman.status === 'menunggu' && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={periksa}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        <Check className="h-4 w-4" strokeWidth={2.5} />
                                        Tandai Sudah Diperiksa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowTolak(true)}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        <X className="h-4 w-4" strokeWidth={2.5} />
                                        Tolak
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* META */}
                        <div className="grid gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                            <Meta icon={CalendarDays} label="Minggu">
                                {pengiriman.label}
                            </Meta>

                            <Meta icon={User} label="Dikirim Oleh">
                                {pengiriman.dikirim_oleh || '-'}
                            </Meta>

                            <Meta icon={Clock3} label="Waktu Kirim">
                                {pengiriman.dikirim_pada || '-'}
                            </Meta>
                        </div>

                        {pengiriman.status === 'ditolak' && (
                            <div className="border-t border-rose-100 bg-rose-50/80 px-5 py-3 sm:px-6">
                                <p className="text-xs font-bold text-rose-700">Alasan Penolakan</p>
                                <p className="mt-0.5 text-sm leading-relaxed text-rose-600">
                                    {pengiriman.alasan_penolakan || '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RINGKASAN */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        {tiles.map((t, i) => (
                            <Tile key={t.label} icon={t.icon} label={t.label} tone={t.tone} index={i}>
                                {t.isi}
                            </Tile>
                        ))}
                    </div>

                    {/* PER DIVISI -> PER CHECK SHEET */}
                    {divisis.length === 0 ? (
                        <div className="csd-rise rounded-2xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-sm">
                            <p className="font-semibold text-slate-700">Belum ada check sheet</p>
                        </div>
                    ) : (
                        divisis.map((d, i) => (
                            <section
                                key={d.nama}
                                style={{ animationDelay: `${300 + Math.min(i, 5) * 70}ms` }}
                                className="csd-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-indigo-300/40">
                                            <Layers className="h-5 w-5" strokeWidth={1.9} />
                                        </span>

                                        <div className="min-w-0">
                                            <h2 className="truncate font-bold text-slate-900">{d.nama}</h2>
                                            <p className="text-xs text-slate-500">
                                                {d.sheets.length} check sheet · {d.terisi}/{d.target} centang
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-4">
                                        <div className="hidden w-40 sm:block">
                                            <BarPersen persen={d.persen} />
                                        </div>
                                        <span
                                            className={`text-xl font-extrabold tabular-nums ${warnaPersen(d.persen)}`}
                                        >
                                            {teksPersen(d.persen)}
                                        </span>
                                    </div>
                                </div>

                                {d.sheets.map((sheet) => (
                                    <SheetBlok
                                        key={sheet.key}
                                        sheet={sheet}
                                        hari={hari}
                                        extra={detail.find((cs) => cs.nama_checksheet === sheet.nama)}
                                        abnormalities={abnormalities.filter((a) => abnormalityMilik(a, d, sheet))}
                                    />
                                ))}
                            </section>
                        ))
                    )}

                    {/* ABNORMALITY TANPA CHECK SHEET PASANGAN (jarang terjadi) */}
                    {abnLainnya.length > 0 && (
                        <section className="csd-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <TabelAbnormality list={abnLainnya} tampilkanSheet />
                        </section>
                    )}
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-3 sm:px-6">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* MODAL KONFIRMASI PERIKSA */}
            {showPeriksa && (
                <div
                    className="csd-fade fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onClick={() => !submitting && setShowPeriksa(false)}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        className="csd-pop w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pb-5 pt-8 text-center">
                            <div className="relative mx-auto h-14 w-14">
                                <span className="csd-ping absolute inset-0 rounded-2xl bg-emerald-300/60" />
                                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-300/50">
                                    <Check className="h-7 w-7" strokeWidth={2.5} />
                                </span>
                            </div>

                            <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                                Tandai Sudah Diperiksa?
                            </h3>

                            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                Check sheet {pengiriman.divisi ? `${pengiriman.divisi} · ` : ''}
                                {pengiriman.label} akan ditandai sudah diperiksa.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowPeriksa(false)}
                                disabled={submitting}
                                autoFocus
                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={konfirmasiPeriksa}
                                disabled={submitting}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {submitting && (
                                    <span className="csd-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                )}
                                {submitting ? 'Memproses...' : 'Ya, Sudah Diperiksa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TOLAK */}
            {showTolak && (
                <div
                    className="csd-fade fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onClick={() => !submitting && tutupTolak()}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="csd-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white px-6 py-5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                                <X className="h-5 w-5" strokeWidth={2.5} />
                            </span>

                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Tolak Check Sheet</h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Masukkan alasan penolakan. Admin akan melihatnya dan bisa mengirim ulang.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <label htmlFor="alasan-tolak" className="text-sm font-semibold text-slate-700">
                                Alasan Penolakan
                            </label>

                            <textarea
                                id="alasan-tolak"
                                value={alasan}
                                onChange={(e) => setAlasan(e.target.value)}
                                rows={5}
                                autoFocus
                                placeholder="Contoh: Check sheet Line 3 belum lengkap..."
                                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
                            />

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={tutupTolak}
                                    disabled={submitting}
                                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={tolak}
                                    disabled={submitting || !alasan.trim()}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {submitting && (
                                        <span className="csd-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                    )}
                                    {submitting ? 'Mengirim...' : 'Tolak Data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}