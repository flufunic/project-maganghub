import { Head } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import QRCode from 'qrcode';

const NAVY = '#0a1a4d';

/* ------------------------------------------------------------------
| QR bergaya: titik bulat + pojok rounded + badge di tengah
------------------------------------------------------------------ */
function StyledQr({ value, label = 'FJI' }) {
    const { n, dots, finders } = useMemo(() => {
        const qr = QRCode.create(value, { errorCorrectionLevel: 'H' });
        const n = qr.modules.size;
        const data = qr.modules.data;
        const center = n / 2;
        const clear = n * 0.12; // radius area badge

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

        const finders = [
            [0, 0],
            [n - 7, 0],
            [0, n - 7],
        ];

        return { n, dots, finders };
    }, [value]);

    const m = 1; // margin dalam modul (quiet zone utama ada di padding kartu)

    return (
        <svg
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

/* ------------------------------------------------------------------
| UKURAN LABEL (mm). 4 kolom x 5 baris per A4 dengan jarak 6 mm.
------------------------------------------------------------------ */
const CARD_W = 44;
const CARD_H = 50;
const GAP = 6;
const QR = 34;

export default function PrintBarcodes({ machines = [] }) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 700);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <Head title="Print QR Mesin" />

            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    .no-print { display: none !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            <div className="no-print flex flex-wrap items-center gap-2 p-4">
                <button
                    onClick={() => (window.history.length > 1 ? window.history.back() : window.close())}
                    className="rounded border px-3 py-1.5 text-sm"
                >
                    ← Kembali
                </button>
                <button
                    onClick={() => window.print()}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
                >
                    Print / Save as PDF
                </button>
                <span className="text-sm text-slate-500">
                    {machines.length} label. Di dialog print: Scale 100%, pilih "Save as PDF" untuk 1 file.
                </span>
            </div>

            <div
                className="flex flex-wrap justify-center"
                style={{ gap: `${GAP}mm`, padding: '4mm' }}
            >
                {machines.map((m) => (
                    <div
                        key={m.id}
                        style={{
                            width: `${CARD_W}mm`,
                            height: `${CARD_H}mm`,
                            breakInside: 'avoid',
                            pageBreakInside: 'avoid',
                        }}
                        className="flex flex-col items-center justify-between rounded-[4mm] border border-dashed border-slate-400 bg-white p-[2mm]"
                    >
                        <div
                            className="w-full truncate text-center font-bold uppercase leading-none"
                            style={{ fontSize: '6.5pt', color: NAVY }}
                        >
                            {m.type?.nama_alat}
                        </div>

                        <div style={{ width: `${QR}mm`, height: `${QR}mm` }}>
                            <StyledQr value={m.barcode} />
                        </div>

                        <div
                            className="w-full text-center font-mono font-bold leading-none"
                            style={{ fontSize: '7pt', color: NAVY }}
                        >
                            {m.no_kontrol}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}