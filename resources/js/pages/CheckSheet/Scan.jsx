import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import Sidebar from '@/Components/Sidebar';

const READER_ID = 'barcode-reader';
// QR berisi "http://server/s/KODE" atau langsung "KODE"
const extractKode = (text) => {
    const match = String(text).match(/\/s\/([^/?#\s]+)/);
    return match ? decodeURIComponent(match[1]) : String(text).trim();
};

export default function Scan({ notifikasi = [] }) {
    const { errors } = usePage().props;

    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [scanError, setScanError] = useState('');
    const [manualKode, setManualKode] = useState('');
    const [processing, setProcessing] = useState(false);

    // jumlah notifikasi (nanti dikirim dari controller)
    const totalNotif = notifikasi.length;

    // kunci supaya 1 barcode tidak terkirim berkali-kali
    const lockRef = useRef(false);

    const submitKode = (kode) => {
        if (lockRef.current || !kode) return;

        lockRef.current = true;
        setProcessing(true);
        setScanError('');

        router.post(
            '/check-sheets/scan',
            { kode },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setScanError(errors.kode || 'Barcode tidak valid.');
                },
                onFinish: () => {
                    setProcessing(false);
                    // jeda sebelum boleh scan lagi
                    setTimeout(() => {
                        lockRef.current = false;
                    }, 1500);
                },
            }
        );
    };

    useEffect(() => {
        let started = false;
        let cancelled = false;

        const scanner = new Html5Qrcode(READER_ID, {
            verbose: false,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
            ],
        });

        const stop = () =>
            scanner
                .stop()
                .then(() => scanner.clear())
                .catch(() => {});

        scanner
            .start(
                { facingMode: 'environment' }, // kamera belakang
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (decodedText) => submitKode(extractKode(decodedText)),
                () => {} // error per-frame (belum ada barcode), abaikan
            )
            .then(() => {
                started = true;
                if (cancelled) stop();
            })
            .catch((err) => {
                const text = String(err);

                if (!window.isSecureContext) {
                    setCameraError(
                        'Kamera di halaman ini tidak aktif karena alamat bukan HTTPS. ' +
                        'Scan barcode pakai aplikasi Kamera bawaan HP, atau ketik kode di bawah.'
                    );
                } else if (/Permission|NotAllowed/i.test(text)) {
                    setCameraError(
                        'Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser.'
                    );
                } else {
                    setCameraError('Kamera tidak bisa dibuka: ' + text);
                }
            });

        return () => {
            cancelled = true;
            if (started) stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Scan Barcode Check Sheet" />

            <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]">
                {/* HEADER: hamburger kiri, lonceng kanan */}
                <header className="relative z-40 border-b border-white/15 bg-[#030a26]/45 px-4 py-3 backdrop-blur-2xl sm:px-6">
                    <div className="flex w-full items-center justify-between gap-3">
                        {/* KIRI */}
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                                title="Menu"
                            >
                                ☰
                            </button>
                            <h1 className="truncate text-base font-bold text-white">
                                Check Sheet Prediktif
                            </h1>
                        </div>

                        {/* KANAN: LONCENG */}
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowNotifications(!showNotifications)}
                                title="Notifikasi"
                                className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 transition-all duration-200 ${
                                    totalNotif > 0
                                        ? 'bg-white/20 text-white hover:bg-white/30'
                                        : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
                                }`}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path d="M15 17h5l-1.5-2v-4a6.5 6.5 0 00-13 0v4L4 17h5" />
                                    <path d="M10 20h4" />
                                </svg>

                                {totalNotif > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#0a2260] bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[9px] font-extrabold text-white shadow-md">
                                        {totalNotif > 99 ? '99+' : totalNotif}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-12 z-[80] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/30">
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Notifikasi
                                        </h3>
                                    </div>

                                    <div className="flex flex-col items-center px-6 py-8 text-center">
                                        <p className="text-sm font-bold text-slate-700">
                                            Semua aman ✨
                                        </p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                            Belum ada notifikasi.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
                    <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/[0.93] shadow-2xl">
                        <div className="px-4 pb-3 pt-4 text-center">
                            <h2 className="text-lg font-bold text-slate-900">
                                Scan Barcode Mesin
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Arahkan kamera ke barcode yang tertempel di mesin / line.
                            </p>
                        </div>

                        {/* AREA KAMERA */}
                        <div className="relative bg-black">
                            <div id={READER_ID} className="w-full" />

                            {processing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                                    Memeriksa barcode...
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 px-4 py-4">
                            {cameraError && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    {cameraError}
                                </p>
                            )}

                            {scanError && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                                    {scanError}
                                </p>
                            )}

                            {errors?.kode && !scanError && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                                    {errors.kode}
                                </p>
                            )}

                            {/* INPUT MANUAL (cadangan) */}
                            <div className="border-t border-slate-200 pt-3">
                                <p className="mb-1.5 text-xs font-semibold text-slate-500">
                                    Kamera bermasalah? Ketik kode manual
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        value={manualKode}
                                        onChange={(e) => setManualKode(e.target.value)}
                                        placeholder="Contoh: CS-HEADREST-L1"
                                        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm uppercase focus:border-blue-500 focus:outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            submitKode(manualKode.trim().toUpperCase())
                                        }
                                        className="h-9 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 text-xs font-bold text-white"
                                    >
                                        Buka
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/check-sheets-barcodes"
                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                >
                                    Cetak Barcode
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}