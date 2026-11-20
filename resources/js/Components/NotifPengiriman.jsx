import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const SEEN_KEY = 'cs_notif_seen';
const POLL_MS = 60000;

function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        bell: (
            <>
                <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 003.4 0" />
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
    };

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
                    0%, 100% { transform: rotate(0deg); }
                    15%, 45%, 75% { transform: rotate(10deg); }
                    30%, 60%, 90% { transform: rotate(-10deg); }
                }

                @keyframes notif-ping {
                    0% { transform: scale(1); opacity: .6; }
                    80%, 100% { transform: scale(1.9); opacity: 0; }
                }

                @keyframes dropdown-enter {
                    from { opacity: 0; transform: translateY(-6px) scale(.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes item-enter {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bell-shaking {
                    transform-origin: top center;
                    animation: bell-shake 1s ease-in-out 3;
                }

                .notif-ping { animation: notif-ping 1.8s ease-out infinite; }

                .notif-dropdown {
                    animation: dropdown-enter .22s cubic-bezier(.22,1,.36,1) both;
                    transform-origin: top right;
                }

                .notif-item {
                    animation: item-enter .3s cubic-bezier(.22,1,.36,1) both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .bell-shaking,
                    .notif-ping,
                    .notif-dropdown,
                    .notif-item {
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
                    className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white outline-none transition-all duration-200 hover:bg-white/20 active:scale-95 focus-visible:ring-4 focus-visible:ring-white/30 ${
                        open ? 'bg-white/20' : 'bg-white/10'
                    }`}
                >
                    <Icon
                        name="bell"
                        className={`h-5 w-5 ${
                            jumlah > 0 && !open ? 'bell-shaking' : ''
                        }`}
                    />

                    {jumlah > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px]">
                            <span
                                className={`notif-ping absolute inset-0 rounded-full ${
                                    adaDitolak ? 'bg-red-400' : 'bg-emerald-400'
                                }`}
                            />
                            <span
                                className={`relative flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-[#071735] ${
                                    adaDitolak ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                            >
                                {jumlah > 9 ? '9+' : jumlah}
                            </span>
                        </span>
                    )}
                </button>

                {/* Dropdown notifikasi */}
                {open && (
                    <div className="notif-dropdown absolute right-0 top-full z-50 mt-2.5 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200">
                        {/* Header (polos, tanpa blok warna) */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900">
                                    Status pengiriman
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Hasil pemeriksaan pimpinan, 7 hari terakhir
                                </p>
                            </div>

                            {jumlah > 0 && (
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        adaDitolak
                                            ? 'bg-red-50 text-red-600'
                                            : 'bg-emerald-50 text-emerald-600'
                                    }`}
                                >
                                    {jumlah} baru
                                </span>
                            )}
                        </div>

                        {/* Isi */}
                        {items.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Icon name="bell" className="h-5 w-5" />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    Belum ada hasil pemeriksaan
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Hasil pemeriksaan pimpinan akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            <ul className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto">
                                {items.map((it, i) => {
                                    const ditolak = it.status === 'ditolak';
                                    const baru = Number(it.ts) > seen;

                                    return (
                                        <li
                                            key={it.id}
                                            className="notif-item"
                                            style={{
                                                animationDelay: `${Math.min(i, 6) * 35}ms`,
                                            }}
                                        >
                                            <Link
                                                href={`/check-sheet-pengiriman?bulan=${it.bulan}&tahun=${it.tahun}`}
                                                onClick={() => setOpen(false)}
                                                className="group flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <span
                                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
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
                                                        <p className="truncate text-sm font-bold text-slate-800">
                                                            {it.divisi}
                                                        </p>

                                                        <span
                                                            className={`shrink-0 text-[11px] font-semibold ${
                                                                ditolak
                                                                    ? 'text-red-600'
                                                                    : 'text-emerald-600'
                                                            }`}
                                                        >
                                                            {ditolak
                                                                ? 'Ditolak'
                                                                : 'Diterima'}
                                                        </span>

                                                        {baru && (
                                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                                        )}
                                                    </div>

                                                    <p className="mt-0.5 text-xs text-slate-500">
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
                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                            <span className="text-[11px] text-slate-400">
                                Diperbarui tiap 1 menit
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
