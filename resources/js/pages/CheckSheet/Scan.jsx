
import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import Sidebar from '@/Components/Sidebar';

const READER_ID = 'barcode-reader';

// QR berisi URL /s/KODE atau langsung KODE
const extractKode = (text) => {
    const value = String(text).trim();
    const match = value.match(/\/s\/([^/?#\s]+)/);

    return match ? decodeURIComponent(match[1]) : value;
};

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
function Icon({ type, className = 'h-5 w-5' }) {
    const paths = {
        menu: 'M4 6h16M4 12h16M4 18h16',
        scan: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3',
        camera: 'M14 5l1.5 2H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3.5L10 5h4z M12 16a3 3 0 100-6 3 3 0 000 6z',
        keyboard: 'M3 7h18v10H3z M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 13h.01M10 13h.01M13 13h.01M16 13h.01M9 15h6',
        file: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z M14 3v5h5',
        arrow: 'M7 17L17 7M7 7h10v10',
        check: 'M5 12.5l4.5 4.5L19 7.5',
        alert: 'M12 9v4M12 17h.01M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        close: 'M6 6l12 12M18 6L6 18',
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d={paths[type]} />
        </svg>
    );
}

export default function Scan({ notifikasi = [] }) {
    const { errors } = usePage().props;

    const [showSidebar, setShowSidebar] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [scanError, setScanError] = useState('');
    const [manualKode, setManualKode] = useState('');
    const [processing, setProcessing] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);

    const lockRef = useRef(false);
    const scannerRef = useRef(null);
    const unlockTimerRef = useRef(null);

    /* ------------------------------------------------------------------
    | SUBMIT KODE
    ------------------------------------------------------------------ */
    const submitKode = (kode) => {
        const normalizedKode = String(kode || '').trim().toUpperCase();

        if (lockRef.current || !normalizedKode) return;

        lockRef.current = true;
        setProcessing(true);
        setScanError('');

        router.post(
            '/check-sheets/scan',
            { kode: normalizedKode },
            {
                preserveScroll: true,

                onError: (errs) => {
                    setScanError(errs.kode || 'Barcode tidak valid.');
                },

                onFinish: () => {
                    setProcessing(false);

                    unlockTimerRef.current = setTimeout(() => {
                        lockRef.current = false;
                    }, 1500);
                },
            }
        );
    };

    /* ------------------------------------------------------------------
    | CAMERA SCANNER
    ------------------------------------------------------------------ */
    useEffect(() => {
        let cancelled = false;
        let started = false;

        const scanner = new Html5Qrcode(READER_ID, {
            verbose: false,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
            ],
        });

        scannerRef.current = scanner;

        const stopScanner = async () => {
            try {
                if (started || scanner.isScanning) {
                    await scanner.stop();
                }

                scanner.clear();
            } catch (error) {
                // Abaikan error ketika scanner sudah berhenti.
            }
        };

        const startScanner = async () => {
            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 180, height: 180 },
                        aspectRatio: 1,
                    },
                    (decodedText) => {
                        if (!lockRef.current) {
                            submitKode(extractKode(decodedText));
                        }
                    },
                    () => {}
                );

                started = true;

                if (cancelled) {
                    await stopScanner();
                    return;
                }

                setCameraReady(true);
                setCameraError('');
            } catch (error) {
                const message = String(error);

                if (!window.isSecureContext) {
                    setCameraError(
                        'Kamera tidak dapat digunakan karena halaman belum menggunakan HTTPS. Gunakan aplikasi Kamera bawaan HP atau ketik kode secara manual.'
                    );
                } else if (/Permission|NotAllowed/i.test(message)) {
                    setCameraError(
                        'Izin kamera ditolak. Aktifkan izin kamera melalui pengaturan browser.'
                    );
                } else {
                    setCameraError(
                        'Kamera tidak dapat dibuka. Pastikan kamera tidak sedang digunakan aplikasi lain.'
                    );
                }
            }
        };

        startScanner();

        return () => {
            cancelled = true;
            setCameraReady(false);
            stopScanner();

            if (unlockTimerRef.current) {
                clearTimeout(unlockTimerRef.current);
            }
        };
        // Scanner hanya diinisialisasi sekali saat halaman dibuka.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head title="Scan Barcode Check Sheet" />

            <Sidebar
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <style>{`
                @keyframes scanRise {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scanFloat {
                    0%, 100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(24px, -20px, 0);
                    }
                }

                @keyframes scanLine {
                    0%, 100% {
                        transform: translateY(-65px);
                        opacity: .3;
                    }
                    50% {
                        transform: translateY(65px);
                        opacity: 1;
                    }
                }

                @keyframes scanPulse {
                    0%, 100% {
                        opacity: .5;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.04);
                    }
                }

                .scan-rise {
                    animation: scanRise .55s cubic-bezier(.22,1,.36,1) both;
                }

                .scan-float {
                    animation: scanFloat 15s ease-in-out infinite;
                }

                .scan-line {
                    animation: scanLine 2.5s ease-in-out infinite;
                }

                .scan-pulse {
                    animation: scanPulse 2s ease-in-out infinite;
                }

                #barcode-reader {
                    width: 100% !important;
                    height: 210px !important;
                    min-height: 210px !important;
                    border: 0 !important;
                    overflow: hidden !important;
                    background: #020617 !important;
                }

                #barcode-reader__scan_region {
                    width: 100% !important;
                    height: 210px !important;
                    min-height: 210px !important;
                    overflow: hidden !important;
                }

                #barcode-reader video {
                    width: 100% !important;
                    height: 210px !important;
                    object-fit: cover !important;
                    border-radius: 0 !important;
                }

                #barcode-reader img {
                    display: none !important;
                }

                #barcode-reader__dashboard {
                    padding: 6px !important;
                    background: #0f172a !important;
                    color: white !important;
                }

                #barcode-reader__dashboard button,
                #barcode-reader__dashboard select {
                    border-radius: 7px !important;
                    padding: 4px 7px !important;
                    font-size: 10px !important;
                }

                #barcode-reader__status_span {
                    color: #cbd5e1 !important;
                    font-size: 10px !important;
                }

                @media (max-height: 700px) {
                    #barcode-reader,
                    #barcode-reader__scan_region {
                        height: 185px !important;
                        min-height: 185px !important;
                    }

                    #barcode-reader video {
                        height: 185px !important;
                    }
                }

                @media (max-height: 600px) {
                    #barcode-reader,
                    #barcode-reader__scan_region {
                        height: 155px !important;
                        min-height: 155px !important;
                    }

                    #barcode-reader video {
                        height: 155px !important;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .scan-rise,
                    .scan-float,
                    .scan-line,
                    .scan-pulse {
                        animation: none !important;
                    }
                }
            `}</style>

            <div className="relative flex h-dvh flex-col overflow-hidden bg-slate-50 text-slate-800">

                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50" />

                    <div className="scan-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/25 blur-[110px]" />

                    <div className="scan-float absolute -right-28 top-[15%] h-[440px] w-[440px] rounded-full bg-indigo-300/20 blur-[120px]" />

                    <div
                        className="absolute inset-0 opacity-[0.3]"
                        style={{
                            backgroundImage:
                                'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage:
                                'linear-gradient(to bottom, black, transparent 65%)',
                            WebkitMaskImage:
                                'linear-gradient(to bottom, black, transparent 65%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="shrink-0 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="w-full px-3 py-2 sm:px-5">
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                                title="Menu"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-4 w-4" />
                            </button>

                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-semibold tracking-tight text-white">
                                    Check Sheet Prediktif
                                </h1>
                                <p className="truncate text-[10px] text-blue-200/80">
                                    Scan barcode mesin
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[2px] bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300" />
                </header>

                {/* MAIN */}
                <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2">

                    <div className="scan-rise w-full max-w-[420px]">

                        {/* PAGE INTRO */}
                        <div className="mb-2 rounded-xl border border-slate-200/70 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                                    <Icon type="scan" className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <h2 className="text-sm font-bold tracking-tight text-slate-900">
                                            Scan Barcode Mesin
                                        </h2>

                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-600">
                                            CHECK SHEET
                                        </span>
                                    </div>

                                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                                        Arahkan kamera ke barcode yang terpasang pada mesin atau line.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CAMERA CARD */}
                        <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]">

                            {/* CARD HEADER */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">
                                        Pemindai Barcode
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-slate-400">
                                        QR Code dan Barcode 128
                                    </p>
                                </div>

                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${
                                    cameraReady
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : cameraError
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-blue-50 text-blue-600'
                                }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                        cameraReady
                                            ? 'bg-emerald-500'
                                            : cameraError
                                            ? 'bg-amber-500'
                                            : 'bg-blue-500 scan-pulse'
                                    }`} />
                                    {cameraReady
                                        ? 'Kamera aktif'
                                        : cameraError
                                        ? 'Kamera tidak aktif'
                                        : 'Menghubungkan...'}
                                </span>
                            </div>

                            {/* CAMERA AREA */}
                            <div className="relative overflow-hidden bg-slate-950">

                                <div
                                    id={READER_ID}
                                    className="h-[210px] w-full"
                                />

                                {/* OVERLAY PROCESSING */}
                                {processing && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/75 px-5 text-center backdrop-blur-sm">
                                        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                                            <Icon type="scan" className="h-5 w-5 scan-pulse" />
                                        </div>

                                        <p className="text-xs font-bold text-white">
                                            Memeriksa barcode...
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-300">
                                            Mohon tunggu sebentar
                                        </p>
                                    </div>
                                )}

                                {/* SCAN GUIDE */}
                                {!processing && cameraReady && (
                                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                                        <div className="relative h-40 w-40 max-w-[75%] rounded-xl border border-blue-300/60 shadow-[0_0_0_999px_rgba(2,6,23,0.18)]">
                                            <span className="absolute -left-px -top-px h-5 w-5 rounded-tl-lg border-l-[3px] border-t-[3px] border-blue-400" />
                                            <span className="absolute -right-px -top-px h-5 w-5 rounded-tr-lg border-r-[3px] border-t-[3px] border-blue-400" />
                                            <span className="absolute -bottom-px -left-px h-5 w-5 rounded-bl-lg border-b-[3px] border-l-[3px] border-blue-400" />
                                            <span className="absolute -bottom-px -right-px h-5 w-5 rounded-br-lg border-b-[3px] border-r-[3px] border-blue-400" />

                                            <div className="scan-line absolute inset-x-3 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,.9)]" />
                                        </div>
                                    </div>
                                )}

                                {!cameraReady && !cameraError && (
                                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 text-center">
                                        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                                            <Icon type="camera" className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-semibold text-white">
                                            Menyiapkan kamera
                                        </p>
                                        <p className="mt-1 text-[10px] text-slate-300">
                                            Mohon izinkan akses kamera pada browser
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* CAMERA DESCRIPTION */}
                            <div className="border-b border-slate-100 bg-slate-50/70 px-3 py-1.5 text-center">
                                <p className="text-[9px] text-slate-500">
                                    Posisikan barcode di dalam kotak pemindaian agar terbaca dengan jelas.
                                </p>
                            </div>

                            {/* FORM AREA */}
                            <div className="space-y-2.5 p-3">

                                {/* CAMERA ERROR */}
                                {cameraError && (
                                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
                                        <Icon
                                            type="alert"
                                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600"
                                        />
                                        <p className="text-[10px] leading-relaxed text-amber-800">
                                            {cameraError}
                                        </p>
                                    </div>
                                )}

                                {/* SCAN ERROR */}
                                {(scanError || errors?.kode) && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
                                        <Icon
                                            type="alert"
                                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-red-700">
                                                Barcode tidak dapat diproses
                                            </p>
                                            <p className="mt-0.5 text-[10px] leading-relaxed text-red-600">
                                                {scanError || errors.kode}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setScanError('')}
                                            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-red-400 hover:bg-red-100 hover:text-red-600"
                                            aria-label="Tutup pesan"
                                        >
                                            <Icon type="close" className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {/* MANUAL INPUT */}
                                <div>
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                                            <Icon type="keyboard" className="h-3.5 w-3.5" />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-800">
                                                Input Kode Manual
                                            </p>
                                            <p className="text-[9px] text-slate-400">
                                                Gunakan jika kamera tidak dapat digunakan
                                            </p>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            submitKode(manualKode);
                                        }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            value={manualKode}
                                            onChange={(e) => setManualKode(e.target.value)}
                                            placeholder="Contoh: CS-HEADREST-L1"
                                            autoComplete="off"
                                            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium uppercase text-slate-700 outline-none transition placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                                        />

                                        <button
                                            type="submit"
                                            disabled={!manualKode.trim() || processing}
                                            className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? (
                                                'Proses...'
                                            ) : (
                                                <>
                                                    Buka
                                                    <Icon type="arrow" className="h-3 w-3" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* DIVIDER */}
                                <div className="border-t border-slate-100" />

                                {/* FOOTER ACTION */}
                                <div className="flex items-center justify-between gap-2">
                                    {/* <div className="flex items-center gap-1.5 text-slate-400">
                                        <Icon type="file" className="h-3 w-3" />
                                        <span className="text-[9px]">
                                            Butuh barcode mesin baru?
                                        </span>
                                    </div> */}

                                    <Link
                                        href="/check-sheets-barcodes"
                                        className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-[10px] font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
                                    >
                                        <Icon type="file" className="h-3 w-3" />
                                        Cetak Barcode
                                        <Icon type="arrow" className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM INFO */}
                        <div className="mt-2 flex items-start gap-1.5 px-1">
                            <Icon
                                type="alert"
                                className="mt-0.5 h-3 w-3 shrink-0 text-slate-400"
                            />
                            <p className="text-[9px] leading-relaxed text-slate-400">
                                Pastikan barcode yang dipindai sesuai dengan mesin atau line yang akan diperiksa.
                            </p>
                        </div>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="shrink-0 border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-5 py-1.5">
                        <p className="text-[10px] font-medium text-slate-400">
                            © {new Date().getFullYear()} Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
