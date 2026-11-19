
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
        // Abaikan jika storage tidak tersedia.
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
            // Coba kembali pada polling berikutnya.
        }
    }, []);

    useEffect(() => {
        muat();

        const timer = setInterval(muat, POLL_MS);

        return () => clearInterval(timer);
    }, [muat]);

    // Tutup dropdown saat klik di luar atau menekan Escape.
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

    // Notifikasi ditolak selalu dihitung.
    // Notifikasi diterima hanya dihitung jika belum dilihat.
    const perluPerhatian = (it) =>
        it.status === 'ditolak' || Number(it.ts) > seen;

    const jumlah = items.filter(perluPerhatian).length;
    const adaDitolak = items.some((it) => it.status === 'ditolak');

    const toggle = () => {
        const next = !open;
        setOpen(next);

        // Saat dropdown dibuka, tandai notifikasi terbaru sudah dilihat.
        if (next && items.length > 0) {
            const terbaru = Math.max(
                ...items.map((it) => Number(it.ts) || 0)
            );

            simpanSeen(terbaru);
            setSeen(terbaru);
        }
    };

    return (
        <>
            <style>{`
                @keyframes bell-shake {
                    0%, 100% {
                        transform: rotate(0deg);
                    }
                    10%, 30%, 50%, 70%, 90% {
                        transform: rotate(12deg);
                    }
                    20%, 40%, 60%, 80% {
                        transform: rotate(-12deg);
                    }
                }

                @keyframes notif-pulse {
                    0% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                    70% {
                        transform: scale(1.8);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1.8);
                        opacity: 0;
                    }
                }

                @keyframes dropdown-enter {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .bell-shaking {
                    transform-origin: top center;
                    animation: bell-shake 1.2s ease-in-out infinite;
                }

                .notif-pulse {
                    animation: notif-pulse 1.8s ease-out infinite;
                }

                .notif-dropdown {
                    animation: dropdown-enter 0.2s ease-out;
                    transform-origin: top right;
                }

                @media (prefers-reduced-motion: reduce) {
                    .bell-shaking,
                    .notif-pulse,
                    .notif-dropdown {
                        animation: none !important;
                    }
                }
            `}</style>

            <div ref={wrapRef} className="relative">
                {/* Tombol lonceng */}
                <button
                    type="button"
                    onClick={toggle}
                    title="Status pengiriman ke pimpinan"
                    aria-label="Notifikasi status pengiriman"
                    aria-expanded={open}
                    className={`
                        relative flex h-10 w-10 cursor-pointer
                        items-center justify-center rounded-xl
                        border border-white/20 bg-white/10
                        text-white shadow-sm
                        transition-all duration-200
                        hover:border-white/30 hover:bg-white/20
                        active:scale-95
                        ${open ? 'bg-white/25' : ''}
                    `}
                >
                    <span className="relative flex items-center justify-center">
                        <BellIcon
                            className={`h-[21px] w-[21px] ${
                                jumlah > 0 && !open ? 'bell-shaking' : ''
                            }`}
                        />

                        {jumlah > 0 && (
                            <span
                                className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${
                                    adaDitolak
                                        ? 'bg-red-400'
                                        : 'bg-emerald-400'
                                }`}
                            />
                        )}
                    </span>

                    {jumlah > 0 && (
                        <>
                            <span
                                className={`notif-pulse absolute -right-1 -top-1 h-5 w-5 rounded-full ${
                                    adaDitolak
                                        ? 'bg-red-400'
                                        : 'bg-emerald-400'
                                }`}
                            />

                            <span
                                className={`absolute -right-1.5 -top-1.5 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#0a1a4d] px-1 text-[10px] font-extrabold text-white shadow-sm ${
                                    adaDitolak
                                        ? 'bg-red-500'
                                        : 'bg-emerald-500'
                                }`}
                            >
                                {jumlah > 9 ? '9+' : jumlah}
                            </span>
                        </>
                    )}
                </button>

                {/* Dropdown notifikasi */}
                {open && (
                    <div className="notif-dropdown absolute right-0 top-full z-50 mt-3 w-[370px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-950/20">
                        {/* Header */}
                        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#0a1a4d] via-[#102d69] to-blue-700 px-4 py-4">
                            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
                            <div className="absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-blue-300/10" />

                            <div className="relative flex items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                                            <BellIcon className="h-4 w-4" />
                                        </div>

                                        <p className="text-sm font-bold text-white">
                                            Status Pengiriman
                                        </p>
                                    </div>

                                    <p className="mt-2 text-[11px] text-blue-100/80">
                                        Hasil pemeriksaan pimpinan · 30 hari terakhir
                                    </p>
                                </div>

                                {jumlah > 0 && (
                                    <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">
                                        {jumlah} perlu perhatian
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Isi */}
                        {items.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <BellIcon className="h-6 w-6" />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    Belum ada hasil pemeriksaan
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Hasil pemeriksaan pimpinan akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto">
                                {items.map((it) => {
                                    const ditolak = it.status === 'ditolak';
                                    const baru = Number(it.ts) > seen;

                                    return (
                                        <li key={it.id}>
                                            <Link
                                                href={`/check-sheet-pengiriman?bulan=${it.bulan}&tahun=${it.tahun}`}
                                                onClick={() => setOpen(false)}
                                                className="group flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <span
                                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                                                        ditolak
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-emerald-50 text-emerald-600'
                                                    }`}
                                                >
                                                    {ditolak ? '!' : '✓'}
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="max-w-[160px] truncate text-sm font-bold text-slate-800 group-hover:text-blue-700">
                                                            {it.divisi}
                                                        </p>

                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                                                ditolak
                                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            }`}
                                                        >
                                                            {ditolak
                                                                ? 'Ditolak'
                                                                : 'Diterima'}
                                                        </span>

                                                        {baru && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                        {it.label}
                                                    </p>

                                                    {ditolak && (
                                                        <div className="mt-2 rounded-lg border border-red-100 bg-red-50/70 px-2.5 py-2">
                                                            <p className="text-[11px] font-bold text-red-600">
                                                                Alasan Penolakan
                                                            </p>
                                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                                                {it.alasan_penolakan || '-'}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-2 flex items-center justify-between gap-2">
                                                        <p className="text-[10px] text-slate-400">
                                                            {it.waktu}
                                                        </p>

                                                        {ditolak && (
                                                            <span className="text-[10px] font-semibold text-red-500">
                                                                Kirim ulang →
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
                            <span className="text-[10px] text-slate-400">
                                Diperbarui otomatis setiap 1 menit
                            </span>

                            <Link
                                href="/check-sheet-pengiriman"
                                onClick={() => setOpen(false)}
                                className="text-xs font-bold text-blue-600 transition hover:text-blue-800"
                            >
                                Buka halaman →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
