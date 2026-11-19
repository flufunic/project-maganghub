import Sidebar from '@/Components/Sidebar';
import { Head, Link, usePage } from '@inertiajs/react';
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

const IDENTITAS = [
    {
        judul: 'Identitas Produksi',
        fields: [['line', 'Line'], ['model', 'Model'], ['pic', 'PIC'], ['no_line', 'No Line']],
    },
    {
        judul: 'Identitas Part',
        fields: [
            ['supplier', 'Supplier'],
            ['part_name', 'Part Name'],
            ['part_number', 'Part Number'],
            ['mfg_location', 'MFG. Location'],
        ],
    },
];

// Garis tipis di dalam tabel
const garis = 'border-b border-r border-slate-200 last:border-r-0';

// Header tabel: navy seperti halaman lain
const th = 'border-b border-r border-white/10 bg-[#0b1a4d] px-4 py-3 text-xs font-semibold text-white last:border-r-0 print:px-2 print:py-2';
const td = `${garis} px-4 py-4 text-slate-700 print:px-2 print:py-2`;

// Lebar kolom parameter: pakai ketentuan kolom (k.lebar / k.width) kalau ada.
// Default 150px, kolom foto 200px supaya 2 foto muat berdampingan.
const LEBAR_DEFAULT = 150;
const LEBAR_FOTO = 200;
const lebarMin = (k) => ({
    minWidth: Number(k.lebar ?? k.width) || (k.type === 'image' ? LEBAR_FOTO : LEBAR_DEFAULT),
});

// Isi sel dibatasi lebarnya, jadi teks panjang turun ke baris ke-2 (bukan memanjang terus).
const ISI_MAX = 'mx-auto max-w-[200px] break-words leading-snug';

// Nilai foto bisa string lama (1 foto) atau array (banyak foto)
const fotoList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

function SectionTitle({ children, extra }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">{children}</h2>
            {extra}
        </div>
    );
}

export default function Show({ joken }) {
    const kolom = joken.kolom ?? [];
    const [preview, setPreview] = useState(null);

    // Esc menutup lightbox foto
    useEffect(() => {
        if (!preview) return;

        const onKey = (e) => {
            if (e.key === 'Escape') setPreview(null);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [preview]);

    return (
        <PageShell title={`Joken ${joken.no_registrasi}`} heading={`Joken · ${joken.no_registrasi}`} backHref="/joken">
            <style>{`
                @page { size: A3 landscape; margin: 8mm; }
                @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            `}</style>

            {/* ===== BANNER ===== */}
            <div className={`idx-rise relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-xl shadow-slate-950/20 print:rounded-none print:shadow-none`}>
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-blue-200/80">Dokumen standarisasi</p>
                        <h1 className="mt-0.5 truncate text-lg font-bold tracking-tight text-white sm:text-xl">{joken.judul}</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur">
                            <p className="text-[11px] font-medium text-blue-200/80">No. Registrasi</p>
                            <p className="text-sm font-bold leading-tight text-white">{joken.no_registrasi}</p>
                        </div>

                        <div className="flex items-center gap-2 print:hidden">
                            <a href={`/joken/${joken.id}/export`} className={btnExcel}>
                                <Icon type="download" className="h-4 w-4" />
                                Excel
                            </a>
                            <Link href={`/joken/${joken.id}/edit`} className={btnPrimary}>
                                <Shine />
                                <Icon type="edit" className="relative h-4 w-4" />
                                <span className="relative">Edit</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="idx-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
            </div>

            <div className="mt-4 space-y-4">
                {/* ===== IDENTITAS ===== */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {IDENTITAS.map((grup, gi) => (
                        <div key={grup.judul} style={delay(80 + gi * 80)} className={`idx-rise p-4 ${card}`}>
                            <SectionTitle>{grup.judul}</SectionTitle>

                            <div className="grid grid-cols-2 gap-3">
                                {grup.fields.map(([key, label]) => (
                                    <div
                                        key={key}
                                        className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50/40"
                                    >
                                        <p className="text-[11px] font-medium text-slate-400">{label}</p>
                                        <p className="mt-0.5 break-words text-sm font-bold text-slate-800">
                                            {joken[key] || <span className="font-normal text-slate-300">–</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== DETAIL STANDARISASI ===== */}
                <div style={delay(240)} className={`idx-rise p-4 ${card}`}>
                    <SectionTitle
                        extra={
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                {joken.rows.length} proses
                            </span>
                        }
                    >
                        Detail Standarisasi
                    </SectionTitle>

                    <div className="idx-scroll overflow-x-auto rounded-xl border border-slate-200 print:overflow-visible">
                        <table className="w-full border-separate border-spacing-0 text-center text-xs">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className={`${th} min-w-[90px] text-left`}>QCPC</th>
                                    <th rowSpan={2} className={`${th} min-w-[220px] text-left`}>Proses</th>
                                    <th rowSpan={2} className={`${th} min-w-[140px] text-left`}>Model Material</th>
                                    <th rowSpan={2} className={`${th} min-w-[120px] !border-r-2 !border-r-white/30 text-left`}>Type Mesin</th>

                                    {kolom.map((k, i) => (
                                        <th
                                            key={k.uid}
                                            style={lebarMin(k)}
                                            className={`${th} !border-b-0 !bg-[#13285f] !pb-0 !pt-3 !text-blue-200`}
                                        >
                                            {i + 1}
                                        </th>
                                    ))}
                                </tr>

                                <tr>
                                    {kolom.map((k) => (
                                        <th
                                            key={k.uid}
                                            style={lebarMin(k)}
                                            className={`${th} !bg-[#13285f] !pb-3 !pt-1.5 align-middle leading-tight`}
                                        >
                                            <div className="mx-auto max-w-[180px] break-words">{k.label}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {joken.rows.map((r) => (
                                    <tr key={r.id} className="transition-colors even:bg-slate-50/60 hover:bg-blue-50/50">
                                        <td className={`${td} text-left font-semibold`}>
                                            {r.qcpc || <span className="font-normal text-slate-300">–</span>}
                                        </td>
                                        <td className={`${td} whitespace-pre-line text-left`}>{r.proses}</td>
                                        <td className={`${td} text-left`}>{r.model_material}</td>
                                        <td className={`${td} !border-r-2 !border-r-slate-300 text-left`}>{r.type_mesin}</td>

                                        {kolom.map((k) => {
                                            const v = r.nilai?.[k.uid];

                                            return (
                                                <td key={k.uid} style={lebarMin(k)} className={td}>
                                                    {k.type === 'image' ? (
                                                        fotoList(v).length ? (
                                                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                                {fotoList(v).map((p) => (
                                                                    <button
                                                                        key={p}
                                                                        type="button"
                                                                        onClick={() => setPreview(`/storage/${p}`)}
                                                                        className="group block h-16 w-20 cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                                                                    >
                                                                        <img
                                                                            src={`/storage/${p}`}
                                                                            alt=""
                                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">–</span>
                                                        )
                                                    ) : v ? (
                                                        <div className={`${ISI_MAX} font-semibold text-slate-800`}>{v}</div>
                                                    ) : (
                                                        <span className="text-slate-300">–</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX FOTO */}
            {preview && (
                <div
                    className="idx-fade fixed inset-0 z-[120] flex cursor-zoom-out items-center justify-center bg-slate-950/70 p-6 backdrop-blur-md print:hidden"
                    onClick={() => setPreview(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreview(null)}
                        aria-label="Tutup"
                        className="absolute right-5 top-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/25"
                    >
                        <Icon type="close" className="h-5 w-5" />
                    </button>

                    <img
                        src={preview}
                        alt=""
                        onClick={(e) => e.stopPropagation()}
                        className="idx-pop max-h-full max-w-full cursor-default rounded-2xl border-4 border-white shadow-2xl"
                    />
                </div>
            )}
        </PageShell>
    );
}