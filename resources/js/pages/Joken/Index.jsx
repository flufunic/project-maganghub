import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------
| ICON  (UI saja, tidak ada logic)
------------------------------------------------------------------ */
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
    eye: {
        circle: { cx: 12, cy: 12, r: 3 },
        paths: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'],
    },
    search: { sw: 2, circle: { cx: 11, cy: 11, r: 6.5 }, paths: ['M20 20l-4-4'] },
    back: { sw: 2, paths: ['M19 12H5M11 6l-6 6 6 6'] },
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    download: { sw: 2, paths: ['M12 3v12m0 0 4-4m-4 4-4-4', 'M5 21h14'] },
    upload: { sw: 2, paths: ['M12 16V4m0 0 4 4m-4-4-4 4', 'M5 20h14'] },
    copy: {
        paths: [
            'M8 8h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2z',
            'M4 16V6a2 2 0 012-2h10',
        ],
    },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    clipboard: {
        rect: { x: 5, y: 4, width: 14, height: 17, rx: 2 },
        paths: ['M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4'],
    },
    layers: { paths: ['M12 3l9 5-9 5-9-5 9-5z', 'M3 13l9 5 9-5'] },
    image: {
        rect: { x: 3, y: 4, width: 18, height: 16, rx: 2 },
        paths: ['M3 16l5-5 4 4 3-3 6 6', 'M9 9h.01'],
    },
};

function Icon({ type, className = 'h-4 w-4' }) {
    const icon = ICONS[type];

    if (!icon) {
        return null;
    }

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
            {icon.rect && <rect {...icon.rect} />}
            {icon.circle && <circle {...icon.circle} />}
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

const btnPrimary =
    'group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const btnGhost =
    'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0';

const btnExcel =
    'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-0';

/* Kilau yang lewat saat tombol utama di-hover */
function Shine() {
    return (
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
    );
}

const delay = (ms) => ({ animationDelay: `${ms}ms` });

/* Toast */
function Toast({ tone = 'emerald', title, message, onClose, icon }) {
    const tones = {
        emerald: { bar: 'from-emerald-400 to-green-600', ico: 'bg-emerald-50 text-emerald-600' },
        amber: { bar: 'from-amber-400 to-orange-500', ico: 'bg-amber-50 text-amber-600' },
    };
    const t = tones[tone];

    return (
        <div
            role="status"
            aria-live="polite"
            className="idx-slide fixed right-5 top-5 z-[100] flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25 print:hidden"
        >
            <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${t.bar}`} />

            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.ico}`}>
                <Icon type={icon} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                aria-label="Tutup"
            >
                <Icon type="close" className="h-4 w-4" />
            </button>
        </div>
    );
}

const STYLES = `
    @keyframes idxRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes idxSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes idxFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
    @keyframes idxFloatReverse { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
    @keyframes idxShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
    @keyframes idxSpin { to { transform: rotate(360deg); } }

    .idx-rise { animation: idxRise .7s cubic-bezier(.22,1,.36,1) both; }
    .idx-fade { animation: idxFade .25s ease-out both; }
    .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
    .idx-slide { animation: idxSlide .45s cubic-bezier(.22,1,.36,1) both; }
    .idx-float { animation: idxFloat 14s ease-in-out infinite; }
    .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
    .idx-shimmer { background-size: 200% 100%; animation: idxShimmer 6s linear infinite; }
    .idx-spin { animation: idxSpin .8s linear infinite; }

    .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
    .idx-scroll::-webkit-scrollbar-track { background: transparent; }
    .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
    .idx-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

    @media (prefers-reduced-motion: reduce) {
        .idx-rise, .idx-fade, .idx-pop, .idx-slide, .idx-float,
        .idx-float-reverse, .idx-shimmer, .idx-spin { animation: none !important; }
    }
`;

/* ------------------------------------------------------------------
| PAGE SHELL: sidebar + header + background + footer + toast flash
------------------------------------------------------------------ */
function PageShell({ title, heading, backHref, children }) {
    const { flash } = usePage().props;
    const [showSidebar, setShowSidebar] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ tone: 'emerald', icon: 'check', title: 'Berhasil', message: flash.success });
        } else if (flash?.error) {
            setToast({ tone: 'amber', icon: 'alert', title: 'Perhatian', message: flash.error });
        }
    }, [flash]);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [toast]);

    const headerBtn =
        'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95';

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title={title} />
            <style>{STYLES}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800 print:bg-white">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
                    <div className="idx-float absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-[100px]" />
                    <div className="idx-float-reverse absolute right-[-100px] top-[8%] h-[440px] w-[440px] rounded-full bg-indigo-300/25 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 60%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20 print:hidden">
                    <div className="w-full px-3 py-3 sm:px-5 2xl:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className={headerBtn}
                                title="Menu"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            {backHref && (
                                <Link href={backHref} className={headerBtn} title="Kembali" aria-label="Kembali">
                                    <Icon type="back" className="h-5 w-5" />
                                </Link>
                            )}

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    {heading ?? title}
                                </h1>
                                <p className="truncate text-xs text-blue-200/80">Dokumen standarisasi joken</p>
                            </div>
                        </div>
                    </div>

                    <div className="idx-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                <main className="w-full flex-1 px-3 py-4 sm:px-5 2xl:px-8 print:p-0">{children}</main>

                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl print:hidden">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Joken Mesin
                        </p>
                    </div>
                </footer>
            </div>

            {toast && (
                <Toast
                    tone={toast.tone}
                    icon={toast.icon}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}

const aksiBtn =
    'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0';

const HEADERS = [
    ['No. Registrasi', 'text-left'],
    ['Judul', 'text-left'],
    ['Line', 'text-left'],
    ['Model', 'text-left'],
    ['Part Name', 'text-left'],
    ['Jml Proses', 'w-28 text-center'],
    ['Aksi', 'w-36 text-center'],
];

export default function Index({ jokens, filters }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [confirmDialog, setConfirmDialog] = useState(null);

    const cari = (e) => {
        e.preventDefault();
        router.get('/joken', { q }, { preserveState: true, replace: true });
    };

    const reset = () => {
        setQ('');
        router.get('/joken', {}, { preserveState: true, replace: true });
    };

    const tutup = () => setConfirmDialog(null);

    const hapus = (j) =>
        setConfirmDialog({
            title: 'Hapus joken?',
            message: `Apakah kamu yakin ingin menghapus joken ${j.no_registrasi}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => router.delete(`/joken/${j.id}`, { preserveScroll: true, onFinish: tutup }),
        });

    // Kartu ringkasan (hanya tampilan, memakai data yang sudah ada)
    const total = jokens.total ?? jokens.data.length;
    const totalProses = jokens.data.reduce((n, j) => n + Number(j.rows_count || 0), 0);
    const jumlahLine = new Set(jokens.data.map((j) => j.line).filter(Boolean)).size;

    const stats = [
        {
            label: 'Total joken',
            value: total,
            hint: filters?.q ? `Hasil cari "${filters.q}"` : 'Semua dokumen joken',
            icon: 'clipboard',
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Total proses',
            value: totalProses,
            hint: 'Pada halaman ini',
            icon: 'layers',
            tone: 'from-violet-500 to-purple-600',
            soft: 'bg-violet-50 text-violet-600',
        },
        {
            label: 'Line terdaftar',
            value: jumlahLine,
            hint: 'Pada halaman ini',
            icon: 'list',
            tone: 'from-cyan-500 to-sky-600',
            soft: 'bg-cyan-50 text-cyan-600',
        },
    ];

    return (
        <PageShell title="Joken Mesin">
            {/* STAT CARDS */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map((item, i) => (
                    <div
                        key={item.label}
                        style={delay(i * 70)}
                        className={`idx-rise group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card}`}
                    >
                        <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.tone}`} />

                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.hint}</p>
                            </div>

                            <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${item.soft}`}
                            >
                                <Icon type={item.icon} className="h-5 w-5" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* TOOLBAR */}
            <div style={delay(220)} className={`idx-rise mb-4 ${card}`}>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={cari} className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Icon
                                type="search"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari no. registrasi, judul, model..."
                                className="h-9 w-72 max-w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        <button type="submit" className={btnGhost}>
                            Cari
                        </button>

                        {filters?.q && (
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <Icon type="close" className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        )}
                    </form>

                    <Link href="/joken/create" className={btnPrimary}>
                        <Shine />
                        <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span className="relative">Buat Joken</span>
                    </Link>
                </div>
            </div>

            {/* TABLE */}
            <div style={delay(300)} className={`idx-rise overflow-hidden ${card}`}>
                <div className="idx-scroll overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="text-white">
                            <tr>
                                {HEADERS.map(([label, cls]) => (
                                    <th
                                        key={label}
                                        className={`border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3 text-xs font-semibold whitespace-nowrap last:border-r-0 ${cls}`}
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {jokens.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                <Icon type="clipboard" className="h-7 w-7 text-slate-400" />
                                            </div>
                                            <p className="font-semibold text-slate-700">
                                                {filters?.q ? 'Joken tidak ditemukan' : 'Belum ada data joken'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {filters?.q
                                                    ? 'Coba kata kunci lain atau reset pencarian.'
                                                    : 'Buat joken pertama untuk mulai.'}
                                            </p>
                                            {!filters?.q && (
                                                <Link href="/joken/create" className={`${btnPrimary} mt-5`}>
                                                    <Shine />
                                                    <Icon type="plus" className="relative h-4 w-4" />
                                                    <span className="relative">Buat Joken</span>
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {jokens.data.map((j) => (
                                <tr key={j.id} className="transition-colors duration-200 hover:bg-blue-50/40">
                                    <td className="border-b border-slate-100 px-4 py-3">
                                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                                            {j.no_registrasi}
                                        </span>
                                    </td>
                                    <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">{j.judul}</td>
                                    <td className="border-b border-slate-100 px-4 py-3 text-slate-600">{j.line}</td>
                                    <td className="border-b border-slate-100 px-4 py-3 text-slate-600">{j.model}</td>
                                    <td className="border-b border-slate-100 px-4 py-3 text-slate-600">{j.part_name}</td>
                                    <td className="border-b border-slate-100 px-4 py-3 text-center">
                                        <span className="inline-flex min-w-[28px] justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                                            {j.rows_count}
                                        </span>
                                    </td>
                                    <td className="border-b border-slate-100 px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/joken/${j.id}`}
                                                title="Lihat"
                                                className={`${aksiBtn} bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white hover:shadow-slate-500/30`}
                                            >
                                                <Icon type="eye" />
                                            </Link>
                                            <Link
                                                href={`/joken/${j.id}/edit`}
                                                title="Edit"
                                                className={`${aksiBtn} bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/30`}
                                            >
                                                <Icon type="edit" />
                                            </Link>
                                            <button
                                                type="button"
                                                title="Hapus"
                                                onClick={() => hapus(j)}
                                                className={`${aksiBtn} bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-500/30`}
                                            >
                                                <Icon type="trash" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {jokens.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                        <p className="text-sm text-slate-500">
                            {jokens.from ? (
                                <>
                                    Menampilkan <span className="font-semibold text-slate-700">{jokens.from}</span> -{' '}
                                    <span className="font-semibold text-slate-700">{jokens.to}</span> dari{' '}
                                    <span className="font-semibold text-slate-700">{jokens.total}</span> data
                                </>
                            ) : null}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                            {jokens.links.map((l, i) =>
                                l.url ? (
                                    <Link
                                        key={i}
                                        href={l.url}
                                        preserveScroll
                                        className={`min-w-[36px] rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200 ${
                                            l.active
                                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:text-blue-600 hover:ring-blue-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="min-w-[36px] rounded-lg px-3 py-2 text-center text-sm text-slate-300 opacity-60 ring-1 ring-slate-100"
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={Boolean(confirmDialog)}
                title={confirmDialog?.title}
                message={confirmDialog?.message}
                confirmLabel={confirmDialog?.confirmLabel}
                tone={confirmDialog?.tone}
                onConfirm={() => confirmDialog?.onConfirm?.()}
                onCancel={tutup}
            />
        </PageShell>
    );
}