import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    User,
    Clock3,
    CheckCircle2,
    Download,
    Eye,
    Check,
    X,
    ImageOff,
    ZoomIn,
    Target,
    History,
} from 'lucide-react';

/* ------------------------------------------------------------------
| STATUS
------------------------------------------------------------------ */
const STATUS = {
    menunggu: {
        label: 'Menunggu Diperiksa',
        cls: 'bg-amber-50 text-amber-700 ring-amber-200',
        dot: 'bg-amber-500',
        ping: 'bg-amber-400',
        pulse: true,
    },
    diperiksa: {
        label: 'Sedang Diperiksa',
        cls: 'bg-sky-50 text-sky-700 ring-sky-200',
        dot: 'bg-sky-500',
        ping: 'bg-sky-400',
        pulse: true,
    },
    disetujui: {
        label: 'Disetujui',
        cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        dot: 'bg-emerald-500',
        ping: 'bg-emerald-400',
        pulse: false,
    },
    ditolak: {
        label: 'Ditolak',
        cls: 'bg-rose-50 text-rose-700 ring-rose-200',
        dot: 'bg-rose-500',
        ping: 'bg-rose-400',
        pulse: false,
    },
};

const warnaPersen = (p) => (p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-rose-500');

const thClass = 'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500';
const thCenter = 'px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500';
const tdClass = 'px-4 py-3.5 align-top text-sm text-slate-700';

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */
function Dot({ cls, ping, pulse }) {
    return (
        <span className="relative flex h-2 w-2">
            {pulse && <span className={`dtl-ping absolute inline-flex h-full w-full rounded-full ${ping}`} />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${cls}`} />
        </span>
    );
}

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.cls}`}
        >
            <Dot cls={status.dot} ping={status.ping} pulse={status.pulse} />
            {status.label}
        </span>
    );
}

/* Teks panjang: tampilkan apa adanya (termasuk baris baru) */
function Teks({ children }) {
    if (!children || !String(children).trim()) {
        return <span className="text-slate-300">-</span>;
    }

    return (
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{children}</p>
    );
}

function Foto({ url, label }) {
    if (!url) {
        return (
            <div className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <ImageOff className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-[10px]">Tidak ada foto</span>
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Buka foto ${label ?? ''}`}
            className="group relative block h-24 w-32 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
        >
            <img
                src={url}
                alt={label ?? 'foto'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition-all duration-300 group-hover:bg-slate-950/40 group-hover:opacity-100">
                <ZoomIn className="h-5 w-5" />
            </span>
        </a>
    );
}

function Meta({ icon: Ico, label, children }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Ico className="h-4 w-4" strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">{children}</p>
            </div>
        </div>
    );
}

function Section({ no, title, subtitle, delay = 0, children }) {
    return (
        <section
            style={{ animationDelay: `${delay}ms` }}
            className="dtl-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-300/40">
                    {no}
                </span>

                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>

            {children}
        </section>
    );
}

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Detail({
    laporan,
    bagian1 = [],
    bagian2 = [],
    bagian3 = [],
    revisis = [],
    flash,
}) {
    const [showSetujuiModal, setShowSetujuiModal] = useState(false);
    const [showTolakModal, setShowTolakModal] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const status = STATUS[laporan.status] ?? STATUS.menunggu;
    const bisaDiputuskan = ['menunggu', 'diperiksa'].includes(laporan.status);

    const totalJumlah = bagian1.reduce((a, r) => a + r.jumlah, 0);
    const totalSudah = bagian1.reduce((a, r) => a + r.sudah, 0);
    const totalBelum = bagian1.reduce((a, r) => a + r.belum, 0);
    const totalPersen = totalJumlah > 0 ? Math.round((totalSudah / totalJumlah) * 100) : 0;

    const tutupTolak = () => {
        setShowTolakModal(false);
        setAlasanPenolakan('');
    };

    // Tutup modal dengan tombol Esc
    useEffect(() => {
        if (!showSetujuiModal && !showTolakModal) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !isSubmitting) {
                setShowSetujuiModal(false);
                setShowTolakModal(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showSetujuiModal, showTolakModal, isSubmitting]);

    const kirimAksi = (aksi, data = {}, selesai) => {
        setIsSubmitting(true);

        router.post(`/pimpinan/laporan/${laporan.id}/${aksi}`, data, {
            preserveScroll: true,
            onSuccess: selesai,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const periksa = () => kirimAksi('periksa');

    const setujui = () => kirimAksi('setujui', {}, () => setShowSetujuiModal(false));

    const tolak = () => {
        if (!alasanPenolakan.trim()) return;

        kirimAksi('tolak', { alasan_penolakan: alasanPenolakan }, tutupTolak);
    };

    return (
        <>
            <Head title={`Report Mingguan W${laporan.week}`} />

            <style>{`
                @keyframes dtlRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes dtlFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes dtlPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
                @keyframes dtlFloat { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(28px,-22px,0) scale(1.08); } }
                @keyframes dtlFloatReverse { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-28px,22px,0) scale(1.1); } }
                @keyframes dtlLine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes dtlPing { 0% { transform: scale(1); opacity: .6; } 80%, 100% { transform: scale(2.4); opacity: 0; } }
                @keyframes dtlBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                @keyframes dtlSpin { to { transform: rotate(360deg); } }

                /* fill-mode "backwards": tidak ada transform tersisa setelah selesai */
                .dtl-rise { animation: dtlRise .6s cubic-bezier(.22,1,.36,1) backwards; }
                .dtl-fade { animation: dtlFade .25s ease-out both; }
                .dtl-pop { animation: dtlPop .35s cubic-bezier(.22,1,.36,1) both; }
                .dtl-float { animation: dtlFloat 14s ease-in-out infinite; }
                .dtl-float-reverse { animation: dtlFloatReverse 17s ease-in-out infinite; }
                .dtl-line { background-size: 200% 100%; animation: dtlLine 7s linear infinite; }
                .dtl-ping { animation: dtlPing 1.8s cubic-bezier(0,0,.2,1) infinite; }
                .dtl-bar { transform-origin: left; animation: dtlBar .9s cubic-bezier(.22,1,.36,1) backwards; }
                .dtl-spin { animation: dtlSpin .8s linear infinite; }

                .dtl-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .dtl-scroll::-webkit-scrollbar-track { background: transparent; }
                .dtl-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }

                @media (prefers-reduced-motion: reduce) {
                    .dtl-rise, .dtl-fade, .dtl-pop, .dtl-float, .dtl-float-reverse,
                    .dtl-line, .dtl-ping, .dtl-bar, .dtl-spin { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-clip text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50" />
                    <div className="dtl-float absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/25 blur-[110px]" />
                    <div className="dtl-float-reverse absolute -right-32 top-[15%] h-[460px] w-[460px] rounded-full bg-indigo-300/20 blur-[120px]" />
                    <div className="dtl-float absolute bottom-[-180px] left-[30%] h-[440px] w-[440px] rounded-full bg-sky-300/20 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                        }}
                    />
                </div>

                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link
                                href="/pimpinan"
                                title="Kembali ke Dashboard"
                                aria-label="Kembali ke Dashboard"
                                className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
                            >
                                <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            </Link>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    Detail Report Mingguan
                                </h1>
                                <p className="hidden truncate text-xs text-blue-100/60 sm:block">
                                    Pemeriksaan report preventif mingguan
                                </p>
                            </div>
                        </div>

                        <div className="hidden shrink-0 rounded-full bg-white px-1 py-1 sm:block">
                            <StatusPill status={status} />
                        </div>
                    </div>

                    <div className="dtl-line h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* CONTENT */}
                <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
                    {flash?.success && (
                        <div className="dtl-pop flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {/* INFO + STATUS + AKSI */}
                    <div className="dtl-rise overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                        Week {laporan.week}
                                    </h2>
                                    <StatusPill status={status} />
                                </div>

                                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                    <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
                                    {laporan.periode}
                                </p>
                            </div>

                            {/* AKSI */}
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={`/laporan-mingguan/export?bulan=${laporan.bulan}&tahun=${laporan.tahun}&week=${laporan.week}`}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
                                >
                                    <Download className="h-4 w-4" />
                                    Export Excel
                                </a>

                                {laporan.status === 'menunggu' && (
                                    <button
                                        type="button"
                                        onClick={periksa}
                                        disabled={isSubmitting}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Tandai Sedang Diperiksa
                                    </button>
                                )}

                                {bisaDiputuskan && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowSetujuiModal(true)}
                                            disabled={isSubmitting}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            <Check className="h-4 w-4" strokeWidth={2.5} />
                                            Setujui
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowTolakModal(true)}
                                            disabled={isSubmitting}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            <X className="h-4 w-4" strokeWidth={2.5} />
                                            Tolak
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* META */}
                        <div className="grid gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
                            <Meta icon={User} label="Dikirim Oleh">
                                {laporan.dikirim_oleh || '-'}
                            </Meta>

                            <Meta icon={Clock3} label="Waktu Pengiriman">
                                {laporan.dikirim_pada || '-'}
                            </Meta>

                            {laporan.status === 'disetujui' && (
                                <Meta icon={CheckCircle2} label="Disetujui">
                                    {laporan.disetujui_oleh || '-'}
                                    {laporan.disetujui_pada && (
                                        <span className="block text-xs font-medium text-slate-500">
                                            {laporan.disetujui_pada}
                                        </span>
                                    )}
                                </Meta>
                            )}

                            {bagian1.length > 0 && (
                                <Meta icon={Target} label="Pencapaian">
                                    {totalSudah}/{totalJumlah} item · {totalPersen}%
                                </Meta>
                            )}
                        </div>

                        {/* Info revisi dari admin */}
                        {revisis.length > 0 && bisaDiputuskan && (
                            <div className="border-t border-violet-100 bg-violet-50/80 px-5 py-2.5 sm:px-6">
                                <p className="text-xs text-violet-700">
                                    <span className="font-bold">{revisis.length} perubahan</span> dilakukan Admin
                                    setelah report dikirim. Lihat riwayat revisi di bagian bawah halaman.
                                </p>
                            </div>
                        )}

                        {/* Alasan penolakan */}
                        {laporan.status === 'ditolak' && (
                            <div className="border-t border-rose-100 bg-rose-50/80 px-5 py-3 sm:px-6">
                                <p className="text-xs font-bold text-rose-700">Alasan Penolakan</p>
                                <p className="mt-0.5 text-sm leading-relaxed text-rose-600">
                                    {laporan.alasan_penolakan || '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* BAGIAN 1 */}
                    <Section
                        no="1"
                        title="Pencapaian Preventif"
                        subtitle="Angka dibekukan saat report dikirim oleh Admin."
                        delay={80}
                    >
                        {bagian1.length > 0 && (
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-600">Pencapaian keseluruhan</span>
                                    <span className="font-bold tabular-nums text-slate-800">
                                        {totalSudah}/{totalJumlah} item · {totalPersen}%
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`dtl-bar h-full rounded-full ${warnaPersen(totalPersen)}`}
                                        style={{ width: `${totalPersen}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="dtl-scroll overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/70">
                                        <th className={thCenter}>No</th>
                                        <th className={thClass}>Mesin</th>
                                        <th className={thCenter}>Jumlah Item</th>
                                        <th className={thCenter}>Sudah Preventif</th>
                                        <th className={thCenter}>Belum Preventif</th>
                                        <th className={thCenter}>Presentase</th>
                                        <th className={thClass}>Komentar</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {bagian1.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className={`${tdClass} py-10 text-center text-slate-400`}>
                                                Tidak ada Plan preventif di week ini.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian1.map((r, i) => (
                                        <tr key={r.no} className="transition-colors hover:bg-indigo-50/40">
                                            <td className={`${tdClass} text-center text-slate-400`}>{i + 1}</td>
                                            <td className={`${tdClass} font-semibold text-slate-800`}>{r.mesin}</td>
                                            <td className={`${tdClass} text-center tabular-nums`}>{r.jumlah}</td>
                                            <td className={`${tdClass} text-center tabular-nums text-emerald-600`}>
                                                {r.sudah}
                                            </td>
                                            <td className={`${tdClass} text-center tabular-nums text-rose-600`}>
                                                {r.belum}
                                            </td>
                                            <td className={`${tdClass} min-w-[110px]`}>
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="text-xs font-bold tabular-nums text-slate-700">
                                                        {r.persen}%
                                                    </span>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className={`dtl-bar h-full rounded-full ${warnaPersen(
                                                                r.persen
                                                            )}`}
                                                            style={{ width: `${r.persen}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`${tdClass} min-w-[220px]`}>
                                                <Teks>{r.komentar}</Teks>
                                            </td>
                                        </tr>
                                    ))}

                                    {bagian1.length > 0 && (
                                        <tr className="bg-slate-50 font-bold">
                                            <td className={tdClass} />
                                            <td className={`${tdClass} text-xs uppercase tracking-wide`}>Total Item</td>
                                            <td className={`${tdClass} text-center tabular-nums`}>{totalJumlah}</td>
                                            <td className={`${tdClass} text-center tabular-nums text-emerald-600`}>
                                                {totalSudah}
                                            </td>
                                            <td className={`${tdClass} text-center tabular-nums text-rose-600`}>
                                                {totalBelum}
                                            </td>
                                            <td className={`${tdClass} text-center tabular-nums`}>{totalPersen}%</td>
                                            <td className={tdClass} />
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* BAGIAN 2 */}
                    <Section no="2" title="Laporan Preventif" delay={140}>
                        <div className="dtl-scroll overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/70">
                                        <th className={thCenter}>No</th>
                                        <th className={thClass}>Mesin</th>
                                        <th className={thClass}>Aktivitas / Problem</th>
                                        <th className={thClass}>Penanggulangan</th>
                                        <th className={thCenter}>Foto Before</th>
                                        <th className={thCenter}>Foto After</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {bagian2.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={`${tdClass} py-10 text-center text-slate-400`}>
                                                Tidak ada item preventif pada report ini.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian2.map((it, i) => (
                                        <tr key={it.id} className="transition-colors hover:bg-indigo-50/40">
                                            <td className={`${tdClass} text-center text-slate-400`}>{i + 1}</td>
                                            <td className={`${tdClass} min-w-[200px] font-semibold text-slate-800`}>
                                                {it.mesin}
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.aktivitas}</Teks>
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.penanggulangan}</Teks>
                                            </td>
                                            <td className={tdClass}>
                                                <div className="flex justify-center">
                                                    <Foto url={it.foto_before_url} label="before" />
                                                </div>
                                            </td>
                                            <td className={tdClass}>
                                                <div className="flex justify-center">
                                                    <Foto url={it.foto_after_url} label="after" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* BAGIAN 3 */}
                    <Section no="3" title="Laporan Temuan Preventif & Tambahan Pekerjaan" delay={200}>
                        <div className="dtl-scroll overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/70">
                                        <th className={thCenter}>No</th>
                                        <th className={thClass}>Mesin</th>
                                        <th className={thClass}>Aktivitas / Problem</th>
                                        <th className={thClass}>Penanggulangan</th>
                                        <th className={thCenter}>Foto</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {bagian3.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className={`${tdClass} py-10 text-center text-slate-400`}>
                                                Tidak ada temuan.
                                            </td>
                                        </tr>
                                    )}

                                    {bagian3.map((it, i) => (
                                        <tr key={it.id} className="transition-colors hover:bg-indigo-50/40">
                                            <td className={`${tdClass} text-center text-slate-400`}>{i + 1}</td>
                                            <td className={`${tdClass} min-w-[200px] font-semibold text-slate-800`}>
                                                <Teks>{it.mesin}</Teks>
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.aktivitas}</Teks>
                                            </td>
                                            <td className={`${tdClass} min-w-[240px]`}>
                                                <Teks>{it.penanggulangan}</Teks>
                                            </td>
                                            <td className={tdClass}>
                                                <div className="flex justify-center">
                                                    <Foto url={it.foto_before_url} label="temuan" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* RIWAYAT REVISI */}
                    {revisis.length > 0 && (
                        <section
                            style={{ animationDelay: '260ms' }}
                            className="dtl-rise overflow-hidden rounded-2xl border border-violet-200/70 bg-white shadow-sm"
                        >
                            <div className="flex items-center gap-3 border-b border-violet-100 bg-violet-50/60 px-5 py-4 sm:px-6">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                    <History className="h-4 w-4" strokeWidth={2} />
                                </span>

                                <div>
                                    <h3 className="font-bold text-slate-900">Revisi dari Admin</h3>
                                    <p className="text-xs text-slate-500">
                                        Perubahan yang dilakukan setelah report dikirim.
                                    </p>
                                </div>
                            </div>

                            <ul className="dtl-scroll max-h-80 overflow-y-auto px-5 py-4 sm:px-6">
                                {revisis.map((r, i) => (
                                    <li key={r.id} className="relative flex gap-3 pb-4 last:pb-0">
                                        {i !== revisis.length - 1 && (
                                            <span className="absolute left-[5px] top-3 h-full w-px bg-violet-100" />
                                        )}

                                        <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-violet-400 bg-white" />

                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{r.keterangan}</p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                {r.oleh} · {r.waktu}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-3 sm:px-6">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Sistem Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* MODAL SETUJUI */}
            {showSetujuiModal && (
                <div
                    className="dtl-fade fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onClick={() => !isSubmitting && setShowSetujuiModal(false)}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        className="dtl-pop w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pb-5 pt-8 text-center">
                            <div className="relative mx-auto h-14 w-14">
                                <span className="dtl-ping absolute inset-0 rounded-2xl bg-emerald-300/60" />
                                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-300/50">
                                    <Check className="h-7 w-7" strokeWidth={2.5} />
                                </span>
                            </div>

                            <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                                Setujui Report Ini?
                            </h3>

                            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                                Report Week {laporan.week} akan disetujui dan Admin tidak bisa mengubahnya lagi.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowSetujuiModal(false)}
                                disabled={isSubmitting}
                                autoFocus
                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={setujui}
                                disabled={isSubmitting}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {isSubmitting && (
                                    <span className="dtl-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                )}
                                {isSubmitting ? 'Memproses...' : 'Ya, Setujui'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TOLAK */}
            {showTolakModal && (
                <div
                    className="dtl-fade fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onClick={() => !isSubmitting && tutupTolak()}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="dtl-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white px-6 py-5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                                <X className="h-5 w-5" strokeWidth={2.5} />
                            </span>

                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                    Tolak Report Mingguan
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Silakan masukkan alasan penolakan report ini.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <label htmlFor="alasan-penolakan" className="text-sm font-semibold text-slate-700">
                                Alasan Penolakan
                            </label>

                            <textarea
                                id="alasan-penolakan"
                                value={alasanPenolakan}
                                onChange={(e) => setAlasanPenolakan(e.target.value)}
                                rows={5}
                                autoFocus
                                placeholder="Contoh: Foto after pada item ke-3 belum sesuai..."
                                className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Alasan ini akan terlihat oleh Admin, lalu report dikembalikan untuk direvisi.
                            </p>

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={tutupTolak}
                                    disabled={isSubmitting}
                                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={tolak}
                                    disabled={isSubmitting || !alasanPenolakan.trim()}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {isSubmitting && (
                                        <span className="dtl-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                    )}
                                    {isSubmitting ? 'Mengirim...' : 'Tolak Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}