import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import QRCode from 'qrcode';
import {
    ArrowLeft,
    Check,
    CheckCheck,
    Copy,
    Download,
    Layers,
    Maximize2,
    Printer,
    QrCode,
    Search,
    SearchX,
    X,
} from 'lucide-react';

const NAVY = '#0a1a4d';

const getOrigin = () => (typeof window !== 'undefined' ? window.location.origin : '');

/* "CHECK SHEET PREDIKTIF MAINTENANCE (...) Eq. Tank material M C Headrest"
   -> "Checksheet Prediktif Mesin Tank material M C Headrest" */
const namaPendek = (nama = '') => {
    const m = nama.match(/\bEq\.?\s*(.+)$/i);
    if (!m) return nama;

    const prefix = /prediktif/i.test(nama) ? 'Checksheet Prediktif' : 'Checksheet';
    return `${prefix} Mesin ${m[1].trim()}`;
};

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

/* ------------------------------------------------------------------
| QR bergaya: titik bulat + pojok rounded + badge di tengah
------------------------------------------------------------------ */
function StyledQr({ value, label = 'FJI' }) {
    const { n, dots, finders } = useMemo(() => {
        const qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
        const n = qr.modules.size;
        const data = qr.modules.data;
        const center = n / 2;
        const clear = n * 0.12;

        const inFinder = (r, c) =>
            (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

        const dots = [];
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!data[r * n + c] || inFinder(r, c)) continue;
                const dx = c + 0.5 - center;
                const dy = r + 0.5 - center;
                if (Math.sqrt(dx * dx + dy * dy) < clear + 0.8) continue;
                dots.push([c + 0.5, r + 0.5]);
            }
        }

        return { n, dots, finders: [[0, 0], [n - 7, 0], [0, n - 7]] };
    }, [value]);

    const m = 1;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`${-m} ${-m} ${n + m * 2} ${n + m * 2}`}
            className="h-full w-full"
            shapeRendering="geometricPrecision"
        >
            <rect x={-m} y={-m} width={n + m * 2} height={n + m * 2} fill="#fff" />

            {dots.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={0.47} fill={NAVY} />
            ))}

            {finders.map(([x, y], i) => (
                <g key={i}>
                    <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={2}
                        fill="none" stroke={NAVY} strokeWidth={1} />
                    <rect x={x + 2} y={y + 2} width={3} height={3} rx={1.1} fill={NAVY} />
                </g>
            ))}

            <circle cx={n / 2} cy={n / 2} r={n * 0.12} fill={NAVY} />
            <text
                x={n / 2}
                y={n / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={n * 0.075}
                fontWeight="800"
                fill="#fff"
                fontFamily="Arial, sans-serif"
            >
                {label}
            </text>
        </svg>
    );
}

function ScanFrame({ children, className = '' }) {
    const corner = 'absolute h-4 w-4 border-blue-500 transition-all duration-300 print:hidden';
    return (
        <div className={`relative ${className}`}>
            <span className={`${corner} left-0 top-0 rounded-tl-lg border-l-[3px] border-t-[3px]`} />
            <span className={`${corner} right-0 top-0 rounded-tr-lg border-r-[3px] border-t-[3px]`} />
            <span className={`${corner} bottom-0 left-0 rounded-bl-lg border-b-[3px] border-l-[3px]`} />
            <span className={`${corner} bottom-0 right-0 rounded-br-lg border-b-[3px] border-r-[3px]`} />
            {children}
        </div>
    );
}

export default function Barcodes({ sheets = [] }) {
    const [query, setQuery] = useState('');
    const [divisi, setDivisi] = useState('all');
    const [lineFilter, setLineFilter] = useState('all');
    const [selected, setSelected] = useState(() => new Set(sheets.map((s) => s.id)));
    const [printOnly, setPrintOnly] = useState(null);
    const [preview, setPreview] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const qrRef = useRef(null);

    // Barcode = kode check sheet (1 mesin)
    const urlOf = (sheet) => `${getOrigin()}/s/${encodeURIComponent(sheet.kode)}`;

    /* ---------- derived ---------- */
    const divisiCounts = useMemo(() => {
        const map = new Map();
        sheets.forEach((s) => {
            const nama = s.divisi?.nama_divisi;
            if (nama) map.set(nama, (map.get(nama) ?? 0) + 1);
        });
        return map;
    }, [sheets]);

    const divisiList = useMemo(() => ['all', ...divisiCounts.keys()], [divisiCounts]);

    // daftar line mengikuti divisi yang dipilih
    const lineList = useMemo(() => {
        const set = new Set();
        sheets.forEach((s) => {
            if (divisi === 'all' || s.divisi?.nama_divisi === divisi) {
                if (s.line?.nama_line) set.add(s.line.nama_line);
            }
        });
        return ['all', ...set];
    }, [sheets, divisi]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sheets.filter((s) => {
            const okDivisi = divisi === 'all' || s.divisi?.nama_divisi === divisi;
            const okLine = lineFilter === 'all' || s.line?.nama_line === lineFilter;
            const okQuery =
                !q ||
                s.nama_checksheet?.toLowerCase().includes(q) ||
                namaPendek(s.nama_checksheet).toLowerCase().includes(q) ||
                s.line?.nama_line?.toLowerCase().includes(q) ||
                s.kode?.toLowerCase().includes(q) ||
                s.nomor_dokumen?.toLowerCase().includes(q) ||
                s.divisi?.nama_divisi?.toLowerCase().includes(q);
            return okDivisi && okLine && okQuery;
        });
    }, [sheets, query, divisi, lineFilter]);

    const selectedCount = useMemo(() => sheets.filter((s) => selected.has(s.id)).length, [sheets, selected]);
    const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

    const stats = [
        { label: 'Total mesin', value: sheets.length, hint: `${divisiCounts.size} divisi`, icon: Layers, bar: 'from-blue-500 to-indigo-600', soft: 'bg-blue-50 text-blue-600' },
        { label: 'Dipilih untuk cetak', value: selectedCount, hint: `dari ${sheets.length} barcode`, icon: CheckCheck, bar: 'from-emerald-400 to-green-600', soft: 'bg-emerald-50 text-emerald-600' },
        { label: 'Sedang ditampilkan', value: filtered.length, hint: divisi === 'all' ? 'Semua divisi' : divisi, icon: QrCode, bar: 'from-violet-500 to-purple-600', soft: 'bg-violet-50 text-violet-600' },
    ];

    /* ---------- actions ---------- */
    const showToast = (message, type = 'success') => {
        clearTimeout(toastTimer.current);
        setToast({ message, type, id: Date.now() });
        toastTimer.current = setTimeout(() => setToast(null), 2600);
    };

    const toggleOne = (id) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAllFiltered = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (allFilteredSelected) filtered.forEach((s) => next.delete(s.id));
            else filtered.forEach((s) => next.add(s.id));
            return next;
        });

    const gantiDivisi = (d) => {
        setDivisi(d);
        setLineFilter('all');
    };

    const copyLink = async (sheet) => {
        try {
            await navigator.clipboard.writeText(urlOf(sheet));
            showToast(`Link ${namaPendek(sheet.nama_checksheet)} disalin`);
        } catch {
            showToast('Gagal menyalin link', 'error');
        }
    };

    const downloadSvg = (sheet) => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;
        const source = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([source], { type: 'image/svg+xml' });
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = `qr-${sheet.kode}.svg`;
        a.click();
        URL.revokeObjectURL(href);
        showToast('QR berhasil diunduh');
    };

    const requestPrint = () => {
        if (selectedCount === 0) {
            showToast('Pilih minimal satu barcode untuk dicetak', 'error');
            return;
        }
        setConfirmOpen(true);
    };

    const doPrint = () => {
        setConfirmOpen(false);
        setPreview(null);
        setPrintOnly(null);
        setTimeout(() => window.print(), 250);
    };

    const printOne = (sheet) => {
        setPrintOnly(sheet.id);
        setPreview(null);
        setTimeout(() => window.print(), 250);
    };

    /* ---------- esc, scroll lock, afterprint ---------- */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setConfirmOpen(false);
                setPreview(null);
            }
        };
        const onAfterPrint = () => setPrintOnly(null);

        window.addEventListener('keydown', onKey);
        window.addEventListener('afterprint', onAfterPrint);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('afterprint', onAfterPrint);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = preview || confirmOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [preview, confirmOpen]);

    useEffect(() => () => clearTimeout(toastTimer.current), []);

    return (
        <>
            <Head title="Cetak Barcode Mesin" />

            <style>{`
                @keyframes bc-fade { from { opacity: 0 } to { opacity: 1 } }
                @keyframes bc-pop { from { opacity: 0; transform: translateY(18px) scale(.95) } to { opacity: 1; transform: none } }
                @keyframes bc-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
                @keyframes bc-icon { 0% { transform: scale(.5) rotate(-12deg); opacity: 0 } 60% { transform: scale(1.12) rotate(4deg) } 100% { transform: none; opacity: 1 } }
                @keyframes bc-toast { from { opacity: 0; transform: translate(-50%, 16px) scale(.96) } to { opacity: 1; transform: translate(-50%, 0) scale(1) } }
                @keyframes bc-bar { from { transform: scaleX(1) } to { transform: scaleX(0) } }
                @keyframes bc-float { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(28px,-22px,0) scale(1.08) } }
                @keyframes bc-float-rev { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(-30px,20px,0) scale(1.1) } }
                @keyframes bc-shimmer { 0% { background-position: 0% 50% } 100% { background-position: 200% 50% } }
                @keyframes bc-scan { 0%,100% { top: 6% } 50% { top: 90% } }

                .bc-fade { animation: bc-fade .22s ease-out both }
                .bc-pop { animation: bc-pop .38s cubic-bezier(.22,1,.36,1) both }
                .bc-rise { animation: bc-rise .55s cubic-bezier(.22,1,.36,1) backwards }
                .bc-icon { animation: bc-icon .5s .1s cubic-bezier(.22,1,.36,1) both }
                .bc-toast { animation: bc-toast .32s cubic-bezier(.22,1,.36,1) both }
                .bc-bar { transform-origin: left; animation: bc-bar 2.6s linear forwards }
                .bc-float { animation: bc-float 14s ease-in-out infinite }
                .bc-float-rev { animation: bc-float-rev 17s ease-in-out infinite }
                .bc-shimmer { background-size: 200% 100%; animation: bc-shimmer 6s linear infinite }
                .bc-scan { animation: bc-scan 2.8s ease-in-out infinite }

                @media (prefers-reduced-motion: reduce) {
                    .bc-fade, .bc-pop, .bc-rise, .bc-icon, .bc-toast, .bc-bar,
                    .bc-float, .bc-float-rev, .bc-shimmer, .bc-scan { animation: none !important }
                }
                @media print {
                    @page { margin: 10mm }
                    body { background: #fff !important }
                    * { -webkit-print-color-adjust: exact; print-color-adjust: exact }
                }
            `}</style>

            <div className="relative min-h-screen overflow-x-clip bg-slate-50 text-slate-800 print:bg-white">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
                    <div className="bc-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
                    <div className="bc-float-rev absolute right-[-100px] top-[10%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-30 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20 print:hidden">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link
                                href="/master/divisi"
                                aria-label="Kembali"
                                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            </Link>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">Barcode Mesin</h1>
                                <p className="truncate text-xs text-blue-200/80">1 QR permanen untuk tiap check sheet / mesin</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={requestPrint}
                            className="group relative inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1d57] shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[.97]"
                        >
                            <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-blue-200/60 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                            <Printer className="relative h-4 w-4" />
                            <span className="relative">Cetak</span>
                            <span className="relative rounded-md bg-blue-600 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white">
                                {selectedCount}
                            </span>
                        </button>
                    </div>

                    <div className="bc-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 print:max-w-none print:p-0">
                    {/* STAT */}
                    <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 print:hidden">
                        {stats.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.label}
                                    style={{ animationDelay: `${i * 70}ms` }}
                                    className={`bc-rise group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card}`}
                                >
                                    <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${s.bar}`} />
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-500">{s.label}</p>
                                            <p key={s.value} className="bc-pop mt-1.5 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
                                                {s.value}
                                            </p>
                                            <p className="mt-0.5 truncate text-[11px] text-slate-400">{s.hint}</p>
                                        </div>
                                        <span
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${s.soft}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    {/* TOOLBAR */}
                    <section style={{ animationDelay: '220ms' }} className={`bc-rise mb-5 space-y-4 p-4 sm:p-5 print:hidden ${card}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari mesin, line, kode, atau divisi..."
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        aria-label="Hapus pencarian"
                                        className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={toggleAllFiltered}
                                disabled={filtered.length === 0}
                                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                <CheckCheck className="h-4 w-4" />
                                {allFilteredSelected ? 'Batal pilih semua' : 'Pilih semua'}
                            </button>
                        </div>

                        {/* filter divisi */}
                        <div className="flex flex-wrap items-center gap-2">
                            {divisiList.map((d) => {
                                const active = divisi === d;
                                const jumlah = d === 'all' ? sheets.length : divisiCounts.get(d);
                                return (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => gantiDivisi(d)}
                                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-3.5 pr-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                                            active
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                        }`}
                                    >
                                        {d === 'all' ? 'Semua divisi' : d}
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                                                active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {jumlah}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* filter line (ikut divisi yang dipilih) */}
                        {lineList.length > 2 && (
                            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                                <span className="text-[11px] font-semibold text-slate-400">Line:</span>
                                {lineList.map((l) => {
                                    const active = lineFilter === l;
                                    return (
                                        <button
                                            key={l}
                                            type="button"
                                            onClick={() => setLineFilter(l)}
                                            className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition active:scale-95 ${
                                                active
                                                    ? 'bg-slate-800 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {l === 'all' ? 'Semua line' : l}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* GRID */}
                    {filtered.length === 0 ? (
                        <div className={`bc-pop flex flex-col items-center px-6 py-16 text-center print:hidden ${card}`}>
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <SearchX className="h-8 w-8" />
                            </div>
                            <p className="text-base font-bold text-slate-800">Mesin tidak ditemukan</p>
                            <p className="mt-1 text-sm text-slate-500">Coba kata kunci lain atau ganti filter.</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    setDivisi('all');
                                    setLineFilter('all');
                                }}
                                className="mt-5 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                            >
                                Reset filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-3">
                            {filtered.map((sheet, i) => {
                                const isSel = selected.has(sheet.id);
                                const dicetak = printOnly !== null ? printOnly === sheet.id : isSel;

                                return (
                                    <article
                                        key={sheet.id}
                                        style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                                        className={`bc-rise group relative flex break-inside-avoid flex-col items-center overflow-hidden rounded-2xl border bg-white px-5 pb-4 pt-6 text-center transition duration-300 print:rounded-xl print:border-2 print:border-slate-800 print:shadow-none ${
                                            isSel
                                                ? 'border-blue-300 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20 hover:-translate-y-1 hover:shadow-xl'
                                                : 'border-slate-200 opacity-70 shadow-sm hover:opacity-100'
                                        } ${dicetak ? '' : 'print:hidden'}`}
                                    >
                                        <span
                                            className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r transition-colors print:hidden ${
                                                isSel ? 'from-blue-500 via-indigo-500 to-cyan-400' : 'from-slate-200 to-slate-200'
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => toggleOne(sheet.id)}
                                            aria-label={isSel ? 'Batal pilih' : 'Pilih'}
                                            aria-pressed={isSel}
                                            className={`absolute left-3.5 top-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-2 transition active:scale-90 print:hidden ${
                                                isSel
                                                    ? 'border-blue-600 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/30'
                                                    : 'border-slate-300 bg-white text-transparent hover:border-blue-400'
                                            }`}
                                        >
                                            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                                        </button>

                                        {/* divisi / line */}
                                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 print:bg-transparent print:px-0 print:text-slate-600">
                                            {sheet.divisi?.nama_divisi ?? '-'} · {sheet.line?.nama_line ?? '-'}
                                        </span>

                                        {/* nama mesin = nama check sheet (versi pendek) */}
                                        <h2 className="mb-4 mt-2 text-lg font-extrabold leading-tight tracking-tight text-slate-900">
                                            {namaPendek(sheet.nama_checksheet)}
                                        </h2>

                                        <button
                                            type="button"
                                            onClick={() => setPreview(sheet)}
                                            aria-label={`Perbesar QR ${namaPendek(sheet.nama_checksheet)}`}
                                            className="group/qr relative cursor-zoom-in rounded-2xl bg-slate-50 p-4 transition duration-300 group-hover:scale-[1.03] print:cursor-auto print:bg-transparent print:p-1"
                                        >
                                            <ScanFrame>
                                                <div className="rounded-xl bg-white p-2.5 shadow-sm print:p-0 print:shadow-none">
                                                    <div className="h-[160px] w-[160px]">
                                                        <StyledQr value={urlOf(sheet)} />
                                                    </div>
                                                </div>
                                            </ScanFrame>

                                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/0 text-white opacity-0 transition duration-300 group-hover/qr:bg-slate-900/40 group-hover/qr:opacity-100 print:hidden">
                                                <Maximize2 className="h-6 w-6" />
                                            </span>
                                        </button>

                                        <p className="mt-3.5 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500 print:bg-transparent">
                                            {sheet.kode}
                                        </p>

                                        <div className="mt-3 flex w-full items-center justify-center gap-1.5 border-t border-slate-100 pt-3 print:hidden">
                                            <button
                                                type="button"
                                                onClick={() => copyLink(sheet)}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                                            >
                                                <Copy className="h-3.5 w-3.5" /> Salin link
                                            </button>
                                            <span className="h-4 w-px bg-slate-200" />
                                            <button
                                                type="button"
                                                onClick={() => setPreview(sheet)}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                                            >
                                                <Maximize2 className="h-3.5 w-3.5" /> Perbesar
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* PREVIEW MODAL */}
                {preview && (
                    <div
                        className="bc-fade fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-4 print:hidden"
                        onClick={() => setPreview(null)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bc-pop w-full max-w-sm overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1d57] via-[#12328a] to-indigo-600 px-6 pb-16 pt-6 text-white">
                                <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl" />
                                <button
                                    type="button"
                                    onClick={() => setPreview(null)}
                                    className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/15 transition duration-300 hover:rotate-90 hover:bg-white/25 active:scale-90"
                                    aria-label="Tutup"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <p className="relative text-xs font-semibold text-blue-200">
                                    {preview.divisi?.nama_divisi ?? '-'} · {preview.line?.nama_line ?? '-'}
                                </p>
                                <h3 className="relative mt-1 pr-10 text-xl font-extrabold leading-tight tracking-tight">
                                    {namaPendek(preview.nama_checksheet)}
                                </h3>
                            </div>

                            <div className="-mt-11 px-6 pb-6">
                                <div ref={qrRef} className="relative mx-auto w-fit overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
                                    <ScanFrame>
                                        <div className="p-1">
                                            <div className="h-[216px] w-[216px]">
                                                <StyledQr value={urlOf(preview)} />
                                            </div>
                                        </div>
                                    </ScanFrame>
                                    <span className="bc-scan pointer-events-none absolute inset-x-5 h-0.5 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
                                </div>

                                <p className="mt-4 text-center font-mono text-xs text-slate-500">{preview.kode}</p>
                                <p className="mt-1.5 break-all rounded-xl bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-500">
                                    {urlOf(preview)}
                                </p>

                                <div className="mt-5 grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => copyLink(preview)}
                                        className="inline-flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:translate-y-0 active:scale-95"
                                    >
                                        <Copy className="h-4 w-4" /> Salin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadSvg(preview)}
                                        className="inline-flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:translate-y-0 active:scale-95"
                                    >
                                        <Download className="h-4 w-4" /> Unduh
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => printOne(preview)}
                                        className="inline-flex cursor-pointer flex-col items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                    >
                                        <Printer className="h-4 w-4" /> Cetak
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONFIRM PRINT MODAL */}
                {confirmOpen && (
                    <div
                        className="bc-fade fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-4 print:hidden"
                        onClick={() => setConfirmOpen(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bc-pop relative w-full max-w-sm overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="bc-confirm-title"
                        >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                            <div className="px-7 pb-6 pt-9 text-center">
                                <div className="bc-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-100">
                                    <Printer className="h-8 w-8" />
                                </div>
                                <h3 id="bc-confirm-title" className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                                    Cetak barcode?
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    <b className="text-slate-800">{selectedCount} barcode mesin</b> akan dicetak. Pastikan printer sudah siap dan
                                    ukuran kertas sesuai.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setConfirmOpen(false)}
                                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[.98]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={doPrint}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98]"
                                >
                                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                    <span className="relative">Ya, cetak</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOAST */}
                {toast && (
                    <div
                        key={toast.id}
                        className="bc-toast fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-950/40 print:hidden"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-3 px-4 py-3">
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                    toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                            >
                                {toast.type === 'error' ? <X className="h-4 w-4" strokeWidth={3} /> : <Check className="h-4 w-4" strokeWidth={3} />}
                            </span>
                            <p className="text-sm font-semibold">{toast.message}</p>
                        </div>
                        <div className={`bc-bar h-0.5 ${toast.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                    </div>
                )}
            </div>
        </>
    );
}