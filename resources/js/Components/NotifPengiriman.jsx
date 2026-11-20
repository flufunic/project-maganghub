import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const SEEN_KEY = 'cs_notif_seen';
const POLL_MS = 60000;

function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8 }) {
    const paths = {
        bell: (
            <>
                <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 003.4 0" />
            </>
        ),
        bellOff: (
            <>
                <path d="M8.7 3A6 6 0 0118 8c0 2.6.4 4.6.9 6" />
                <path d="M17 17H3s3-2 3-9c0-.9.2-1.7.5-2.4" />
                <path d="M10.3 21a1.94 1.94 0 003.4 0" />
                <path d="M2 2l20 20" />
            </>
        ),
        check: <path d="M5 12l4 4L19 6" />,
        alert: (
            <>
                <path d="M12 8v5" />
                <path d="M12 16.5h.01" />
            </>
        ),
        arrow: <path d="M9 6l6 6-6 6" />,
        close: <path d="M18 6 6 18M6 6l12 12" />,
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {paths[name]}
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
        if (!open) return undefined;

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
    const adaNotifikasi = jumlah > 0;
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
                @keyframes npDrop {
                    from { opacity: 0; transform: translateY(-8px) scale(.97); }
                    to { opacity: 1; transform: none; }
                }

                @keyframes npItem {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: none; }
                }

                @keyframes npBellShake {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30%, 50%, 70% { transform: rotate(12deg); }
                    20%, 40%, 60%, 80% { transform: rotate(-12deg); }
                    90% { transform: rotate(0deg); }
                }

                @keyframes npPulse {
                    0% { transform: scale(.8); opacity: .7; }
                    100% { transform: scale(1.65); opacity: 0; }
                }

                @keyframes npBadgePop {
                    0% { transform: scale(0); }
                    60% { transform: scale(1.25); }
                    100% { transform: scale(1); }
                }

                @keyframes npBadgePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.12); }
                }

                .np-drop {
                    animation: npDrop .22s cubic-bezier(.22,1,.36,1) both;
                    transform-origin: top right;
                }

                .np-item {
                    animation: npItem .3s cubic-bezier(.22,1,.36,1) both;
                }

                /* Bergoyang selama ada notifikasi yang perlu perhatian */
                .np-bell-shake {
                    animation: npBellShake 1.1s ease-in-out infinite;
                    transform-origin: 50% 15%;
                }

                .np-pulse {
                    animation: npPulse 1.8s ease-out infinite;
                }

                .np-badge-pop {
                    animation: npBadgePop .45s ease-out both,
                               npBadgePulse 1.5s ease-in-out .5s infinite;
                }

                .np-scroll::-webkit-scrollbar { width: 8px; }
                .np-scroll::-webkit-scrollbar-track { background: transparent; }
                .np-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100,116,139,.35);
                    border-radius: 999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .np-drop,
                    .np-item,
                    .np-bell-shake,
                    .np-pulse,
                    .np-badge-pop {
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
                    aria-label={`Notifikasi status pengiriman, ${jumlah} perlu perhatian`}
                    aria-expanded={open}
                    className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border bg-white/10 text-white outline-none transition-all duration-300 hover:bg-white/20 active:scale-95 focus-visible:ring-4 focus-visible:ring-white/30 ${
                        adaNotifikasi
                            ? 'border-blue-300/50 shadow-[0_0_18px_rgba(59,130,246,0.4)]'
                            : 'border-white/15'
                    }`}
                >
                    {adaNotifikasi && (
                        <span className="np-pulse pointer-events-none absolute inset-1 rounded-xl border border-blue-300/80 bg-blue-400/20" />
                    )}

                    <span
                        className={`relative z-10 flex items-center justify-center ${
                            adaNotifikasi && !open ? 'np-bell-shake' : ''
                        }`}
                    >
                        <Icon
                            name="bell"
                            className={`h-5 w-5 ${
                                adaNotifikasi ? 'text-blue-200' : 'text-white'
                            }`}
                        />
                    </span>

                    {adaNotifikasi && (
                        <span
                            key={jumlah}
                            className={`np-badge-pop absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#071735] px-1 text-[10px] font-extrabold text-white shadow-lg ${
                                adaDitolak
                                    ? 'bg-red-500 shadow-red-500/40'
                                    : 'bg-emerald-500 shadow-emerald-500/40'
                            }`}
                        >
                            {jumlah > 9 ? '9+' : jumlah}
                        </span>
                    )}
                </button>

                {/* Dropdown notifikasi */}
                {open && (
                    <div className="np-drop absolute right-0 top-full z-50 mt-3 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-3.5">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900">
                                    Status pengiriman
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {adaNotifikasi
                                        ? `${jumlah} perlu perhatian`
                                        : 'Hasil pemeriksaan pimpinan, 7 hari terakhir'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Tutup"
                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <Icon name="close" className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Isi */}
                        {items.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <Icon
                                        name="bellOff"
                                        className="h-6 w-6"
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <p className="text-sm font-semibold text-slate-600">
                                    Belum ada hasil pemeriksaan
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Hasil pemeriksaan pimpinan akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            <ul className="np-scroll max-h-[380px] overflow-y-auto">
                                {items.map((it, i) => {
                                    const ditolak = it.status === 'ditolak';
                                    const baru = Number(it.ts) > seen;

                                    return (
                                        <li
                                            key={it.id}
                                            className="np-item"
                                            style={{
                                                animationDelay: `${Math.min(i, 6) * 35}ms`,
                                            }}
                                        >
                                            <Link
                                                href={`/check-sheet-pengiriman?bulan=${it.bulan}&tahun=${it.tahun}`}
                                                onClick={() => setOpen(false)}
                                                className={`group relative flex gap-3 border-b border-slate-100 px-4 py-3.5 transition-colors duration-150 hover:bg-blue-50 ${
                                                    baru ? 'bg-blue-50/60' : 'bg-white'
                                                }`}
                                            >
                                                {baru && (
                                                    <span className="absolute inset-y-0 left-0 w-[3px] bg-blue-500" />
                                                )}

                                                <span
                                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                        ditolak
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-emerald-50 text-emerald-600'
                                                    }`}
                                                >
                                                    <Icon
                                                        name={ditolak ? 'alert' : 'check'}
                                                        className="h-4 w-4"
                                                    />
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-xs font-bold text-slate-800">
                                                            {it.divisi}
                                                        </p>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                ditolak
                                                                    ? 'bg-red-50 text-red-600'
                                                                    : 'bg-emerald-50 text-emerald-600'
                                                            }`}
                                                        >
                                                            {ditolak
                                                                ? 'Ditolak'
                                                                : 'Diterima'}
                                                        </span>

                                                        {baru && (
                                                            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {it.label}
                                                    </p>

                                                    {ditolak && (
                                                        <p className="mt-1.5 border-l-2 border-red-300 pl-2 text-xs leading-relaxed text-slate-600">
                                                            {it.alasan_penolakan || '-'}
                                                        </p>
                                                    )}

                                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                                        <p className="text-[11px] text-slate-400">
                                                            {it.waktu}
                                                        </p>

                                                        {ditolak && (
                                                            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500 transition-colors group-hover:text-red-600">
                                                                Kirim ulang
                                                                <Icon
                                                                    name="arrow"
                                                                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                                                                />
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
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                            <p className="text-center text-[10px] text-slate-400">
                                Diperbarui tiap 1 menit
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}