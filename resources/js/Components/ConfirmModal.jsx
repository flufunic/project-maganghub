import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------
| ICON  (UI saja)
------------------------------------------------------------------ */
const ICONS = {
    alert: {
        sw: 1.8,
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    info: { sw: 1.8, circle: { cx: 12, cy: 12, r: 9 }, paths: ['M12 11v5', 'M12 8h.01'] },
    check: { sw: 2.4, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
};

function Icon({ type, className = 'h-5 w-5' }) {
    const icon = ICONS[type];

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.circle && <circle {...icon.circle} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| WARNA PER TONE
------------------------------------------------------------------ */
const TONES = {
    red: {
        icon: 'alert',
        box: 'from-red-50 to-rose-100 text-red-600',
        btn: 'from-red-600 to-rose-600 shadow-red-500/30',
    },
    blue: {
        icon: 'info',
        box: 'from-blue-50 to-indigo-100 text-blue-600',
        btn: 'from-blue-600 to-indigo-600 shadow-blue-500/30',
    },
    amber: {
        icon: 'alert',
        box: 'from-amber-50 to-orange-100 text-amber-600',
        btn: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    },
    emerald: {
        icon: 'check',
        box: 'from-emerald-50 to-green-100 text-emerald-600',
        btn: 'from-emerald-500 to-green-600 shadow-emerald-500/30',
    },
};

TONES.green = TONES.emerald;

const STYLES = `
    @keyframes cmFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cmPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes cmIcon { 0% { transform: scale(.5); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
    @keyframes cmSpin { to { transform: rotate(360deg); } }

    .cm-fade { animation: cmFade .25s ease-out both; }
    .cm-pop { animation: cmPop .4s cubic-bezier(.22,1,.36,1) both; }
    .cm-icon { animation: cmIcon .5s .1s cubic-bezier(.22,1,.36,1) both; }
    .cm-spin { animation: cmSpin .8s linear infinite; }

    @media (prefers-reduced-motion: reduce) {
        .cm-fade, .cm-pop, .cm-icon, .cm-spin { animation: none !important; }
    }
`;

/* ------------------------------------------------------------------
| CONFIRM MODAL
| Props sama dengan versi lama:
| open, title, message, confirmLabel, tone, onConfirm, onCancel
| Tambahan opsional: cancelLabel, loading
------------------------------------------------------------------ */
export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Ya',
    cancelLabel = 'Batal',
    tone = 'blue',
    loading = false,
    onConfirm,
    onCancel,
}) {
    const [busy, setBusy] = useState(false);

    // reset tombol tiap dialog dibuka / diganti
    useEffect(() => {
        setBusy(false);
    }, [open, title]);

    // ESC menutup + kunci scroll halaman saat dialog terbuka
    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onCancel]);

    if (!open) return null;

    const t = TONES[tone] ?? TONES.blue;
    const sibuk = busy || loading;
    const bahaya = tone === 'red';

    const konfirmasi = () => {
        if (sibuk) return;
        setBusy(true);
        onConfirm?.();
    };

    return (
        <>
            <style>{STYLES}</style>

            <div
                className="cm-fade fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget && !sibuk) onCancel?.();
                }}
            >
                <div
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-message"
                    className="cm-pop w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
                >
                    {/* HEADER */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div
                                className={`cm-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.box}`}
                            >
                                <Icon type={t.icon} />
                            </div>

                            <h2 id="confirm-title" className="text-base font-bold text-slate-900">
                                {title}
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={sibuk}
                            aria-label="Tutup"
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Icon type="close" className="h-4 w-4" />
                        </button>
                    </div>

                    {/* ISI */}
                    <div className="px-6 py-5">
                        <p id="confirm-message" className="text-sm leading-relaxed text-slate-600">
                            {message}
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={sibuk}
                            autoFocus={bahaya}
                            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>

                        <button
                            type="button"
                            onClick={konfirmasi}
                            disabled={sibuk}
                            autoFocus={!bahaya}
                            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${t.btn}`}
                        >
                            {sibuk && (
                                <span className="cm-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                            )}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
