import Sidebar from '@/Components/Sidebar';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const ICONS = {
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    edit: {
        paths: [
            'M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487z',
            'M15 5l4 4',
        ],
    },
    trash: {
        paths: [
            'M4.5 7.5h15M9.75 3.75h4.5l1.5 3.75h-7.5l1.5-3.75zM6.75 7.5v11.25A1.5 1.5 0 008.25 20.25h7.5a1.5 1.5 0 001.5-1.5V7.5',
            'M10 11v5.5M14 11v5.5',
        ],
    },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    eye: {
        paths: [
            'M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z',
            'M12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
        ],
    },
    back: { sw: 2, paths: ['M15 18l-6-6 6-6'] },
    print: {
        paths: [
            'M6 9V3.5h12V9',
            'M6 18H4.5a1 1 0 01-1-1v-6.5a1 1 0 011-1h15a1 1 0 011 1V17a1 1 0 01-1 1H18',
            'M6 14h12v6.5H6z',
        ],
    },
    upload: { sw: 2, paths: ['M12 16V4M7 9l5-5 5 5', 'M4 16v3.5h16V16'] },
    search: { sw: 2, paths: ['M21 21l-4.35-4.35', 'M11 18a7 7 0 100-14 7 7 0 000 14z'] },
    copy: {
        paths: [
            'M9 9h10.5v10.5H9z',
            'M5.5 15H4.5V4.5H15v1',
        ],
    },
};

export function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];
    if (!icon) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

export const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

export const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50';

export const cellInput =
    'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

export const btnPrimary =
    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60';

export const btnSoft =
    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100';

export function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
        </label>
    );
}

/* Kerangka halaman: sidebar + header + background + footer + toast sukses */
export function PageShell({ title, heading, backHref, children }) {
    const { flash } = usePage().props;
    const [showSidebar, setShowSidebar] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (flash?.success) setToast(flash.success);
    }, [flash]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(''), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title={title} />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8] print:hidden" />

                <header className="sticky top-0 z-40 border-b border-white/15 bg-[#030a26]/45 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-2xl print:hidden">
                    <div className="mx-auto flex w-full max-w-[1800px] items-center gap-3 px-4 py-2.5 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowSidebar(true)}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                            title="Menu"
                        >
                            <Icon type="menu" className="h-5 w-5" />
                        </button>

                        {backHref && (
                            <Link
                                href={backHref}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                                title="Kembali"
                            >
                                <Icon type="back" className="h-5 w-5" />
                            </Link>
                        )}

                        <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                            {heading ?? title}
                        </h1>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-4 sm:px-6 print:max-w-none print:p-0">
                    {children}
                </main>

                <footer className="mt-auto border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl print:hidden">
                    <div className="mx-auto flex max-w-[1800px] items-center justify-center px-6 py-3">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Joken Mesin Sewing
                        </p>
                    </div>
                </footer>
            </div>

            {toast && (
                <div className="fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/40 print:hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-100">
                        <span className="font-bold text-emerald-600">✓</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">Berhasil</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{toast}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToast('')}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}