import React, { useEffect } from 'react';
import { AlertTriangle, Save } from 'lucide-react';

export default function KonfirmasiDialog({
    open,
    title,
    message,
    confirmLabel = 'Ya',
    tone = 'blue', // 'blue' | 'red'
    processing = false,
    error = '',
    onCancel,
    onConfirm,
}) {
    // Tombol Esc menutup dialog
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onKey = (e) => {
            if (e.key === 'Escape' && !processing) {
                onCancel?.();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open, processing, onCancel]);

    if (!open) {
        return null;
    }

    const merah = tone === 'red';
    const Ikon = merah ? AlertTriangle : Save;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !processing) {
                    onCancel?.();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/40"
            >
                <div className="px-5 pb-4 pt-5">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                merah ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}
                        >
                            <Ikon className="h-5 w-5" strokeWidth={1.75} />
                        </span>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900">{title}</h2>

                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                {message}
                            </p>

                            {error && (
                                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            merah ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {processing ? 'Memproses...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}