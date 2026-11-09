import React, { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const DURASI = 4000; // ms

const GAYA = {
    success: {
        wadah: 'border-emerald-200 bg-white',
        ikon: 'bg-emerald-100 text-emerald-600',
        judul: 'Berhasil',
        bar: 'bg-emerald-500',
        Ikon: CheckCircle2,
    },
    error: {
        wadah: 'border-red-200 bg-white',
        ikon: 'bg-red-100 text-red-600',
        judul: 'Gagal',
        bar: 'bg-red-500',
        Ikon: AlertCircle,
    },
};

export default function FlashToast() {
    const { flash } = usePage().props;
    const [items, setItems] = useState([]);
    const terakhir = useRef(null);

    const tutup = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

    useEffect(() => {
        // Jangan proses flash yang sama dua kali
        if (!flash || terakhir.current === flash) {
            return;
        }

        terakhir.current = flash;

        const baru = [];

        if (flash.success) {
            baru.push({ type: 'success', pesan: flash.success });
        }

        if (flash.error) {
            baru.push({ type: 'error', pesan: flash.error });
        }

        if (baru.length === 0) {
            return;
        }

        const dengan = baru.map((b) => ({
            ...b,
            id: `${Date.now()}-${Math.random()}`,
        }));

        setItems((prev) => [...prev, ...dengan]);

        dengan.forEach((b) => setTimeout(() => tutup(b.id), DURASI));
    }, [flash]);

    return (
        <>
            <style>{`
                @keyframes toastMasuk {
                    from { opacity: 0; transform: translateX(32px) scale(.97); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes toastBar {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>

            <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[min(360px,calc(100vw-32px))] flex-col gap-3">
                {items.map((t) => {
                    const g = GAYA[t.type];
                    const Ikon = g.Ikon;

                    return (
                        <div
                            key={t.id}
                            role="status"
                            className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl shadow-slate-950/25 ${g.wadah}`}
                            style={{ animation: 'toastMasuk .35s ease-out both' }}
                        >
                            <div className="flex items-start gap-3 px-4 py-3.5">
                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${g.ikon}`}
                                >
                                    <Ikon className="h-5 w-5" strokeWidth={2} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-extrabold text-slate-800">
                                        {g.judul}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                        {t.pesan}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => tutup(t.id)}
                                    aria-label="Tutup"
                                    className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div
                                className={`h-1 origin-left ${g.bar}`}
                                style={{
                                    animation: `toastBar ${DURASI}ms linear forwards`,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
}