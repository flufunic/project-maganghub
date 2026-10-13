import React from 'react';

const TONES = {
    blue: {
        icon: 'bg-blue-50 text-blue-600',
        button:
            'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-200',
        mark: '?',
    },
    red: {
        icon: 'bg-red-50 text-red-600',
        button:
            'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200',
        mark: '!',
    },
    amber: {
        icon: 'bg-amber-50 text-amber-600',
        button:
            'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200',
        mark: '!',
    },
};

export default function ConfirmModal({
    open,
    title = 'Konfirmasi',
    message,
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    tone = 'blue',
    loading = false,
    onConfirm,
    onCancel,
}) {
    if (!open) {
        return null;
    }

    const t = TONES[tone] ?? TONES.blue;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                <div className="flex items-start gap-3 px-5 pb-4 pt-5">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${t.icon}`}
                    >
                        {t.mark}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-md transition disabled:opacity-60 ${t.button}`}
                    >
                        {loading ? 'Memproses...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}