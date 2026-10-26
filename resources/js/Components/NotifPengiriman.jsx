import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const SEEN_KEY = 'cs_notif_seen';
const POLL_MS = 60000;

function BellIcon({ className = 'h-5 w-5' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 003.4 0" />
        </svg>
    );
}

const bacaSeen = () => {
    try {
        return Number(localStorage.getItem(SEEN_KEY)) || 0;
    } catch (e) {
        return 0;
    }
};

const simpanSeen = (ts) => {
    try {
        localStorage.setItem(SEEN_KEY, String(ts));
    } catch (e) {
        // abaikan kalau storage tidak tersedia
    }
};

export default function NotifPengiriman() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [seen, setSeen] = useState(bacaSeen());
    const wrapRef = useRef(null);

    const muat = useCallback(async () => {
        try {
            const res = await fetch('/check-sheet-pengiriman/notifikasi', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!res.ok) return;

            const data = await res.json();

            setItems(Array.isArray(data.items) ? data.items : []);
        } catch (e) {
            // gagal diam-diam, coba lagi di polling berikutnya
        }
    }, []);

    useEffect(() => {
        muat();

        const timer = setInterval(muat, POLL_MS);

        return () => clearInterval(timer);
    }, [muat]);

    // tutup dropdown kalau klik di luar atau tekan Esc
    useEffect(() => {
        if (!open) return;

        const onClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    // ditolak selalu dihitung (perlu tindak lanjut), diperiksa hanya yang baru
    const perluPerhatian = (it) => it.status === 'ditolak' || it.ts > seen;

    const jumlah = items.filter(perluPerhatian).length;
    const adaDitolak = items.some((it) => it.status === 'ditolak');

    const toggle = () => {
        const next = !open;

        setOpen(next);

        // saat dibuka, tandai semua sudah dilihat
        if (next && items.length > 0) {
            const terbaru = Math.max(...items.map((it) => it.ts));

            simpanSeen(terbaru);
            setSeen(terbaru);
        }
    };

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={toggle}
                title="Status pengiriman ke pimpinan"
                aria-label="Notifikasi status pengiriman"
                aria-expanded={open}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
            >
                <BellIcon />

                {jumlah > 0 && (
                    <span
                        className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#0a1a4d] px-1 text-[10px] font-bold text-white ${
                            adaDitolak ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                    >
                        {jumlah > 9 ? '9+' : jumlah}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/40">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3">
                        <p className="text-sm font-bold text-slate-800">Status Pengiriman</p>
                        <p className="text-[11px] text-slate-500">
                            Hasil pemeriksaan pimpinan (30 hari terakhir)
                        </p>
                    </div>

                    {items.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">
                            Belum ada hasil pemeriksaan.
                        </p>
                    ) : (
                        <ul className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto">
                            {items.map((it) => {
                                const ditolak = it.status === 'ditolak';

                                return (
                                    <li key={it.id}>
                                        <Link
                                            href={`/check-sheet-pengiriman?bulan=${it.bulan}&tahun=${it.tahun}`}
                                            onClick={() => setOpen(false)}
                                            className="flex gap-3 px-4 py-3 transition hover:bg-slate-50"
                                        >
                                            <span
                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                    ditolak
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'bg-emerald-50 text-emerald-600'
                                                }`}
                                            >
                                                {ditolak ? '!' : '✓'}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {it.divisi}
                                                    </p>

                                                    <span
                                                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                                            ditolak
                                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        }`}
                                                    >
                                                        {ditolak ? 'Ditolak' : 'Diterima'}
                                                    </span>

                                                    {perluPerhatian(it) && it.ts > seen && (
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                    )}
                                                </div>

                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {it.label}
                                                </p>

                                                {ditolak && (
                                                    <p className="mt-1 border-l-2 border-red-200 pl-2 text-xs leading-relaxed text-slate-600">
                                                        <span className="font-bold text-red-500">Alasan:</span>{' '}
                                                        {it.alasan_penolakan || '-'}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {it.waktu}
                                                    {ditolak && ' · klik untuk kirim ulang'}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
                        <Link
                            href="/check-sheet-pengiriman"
                            onClick={() => setOpen(false)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            Buka halaman pengiriman →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}