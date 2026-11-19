import Sidebar from '@/Components/Sidebar';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

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

const IDENTITAS_PRODUKSI = [
    ['line', 'Line'],
    ['model', 'Model'],
    ['pic', 'PIC'],
    ['no_line', 'No Line'],
];

const IDENTITAS_PART = [
    ['supplier', 'Supplier'],
    ['part_name', 'Part Name'],
    ['part_number', 'Part Number'],
    ['mfg_location', 'MFG. Location'],
];

const MAKS_KOLOM = 50;
const MAKS_MB = 4;
const MAKS_FOTO = 2; // maksimal foto per sel. Samakan dengan MAKS_FOTO di JokenController.php

const KOSONG = []; // referensi tetap, supaya preview foto tidak dibuat ulang tiap render

// Nilai foto bisa string lama (1 foto), array (banyak foto), atau kosong
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

let seq = 0;
const newUid = (prefix) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

const barisKosong = () => ({
    uid: newUid('r'),
    qcpc: '',
    proses: '',
    model_material: '',
    type_mesin: '',
    values: {},
    files: {},
});

const kolomKosong = () => ({ uid: newUid('c'), label: '', type: 'text' });

/* input di dalam tabel: tampil seperti teks, garis muncul saat fokus */
const tblInput =
    'w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-300 hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

/* tombol aksi kecil */
const aksiBtn =
    'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 active:scale-90';
const aksiHapus = `${aksiBtn} bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`;
const aksiSalin = `${aksiBtn} bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white`;
const aksiHapusGelap = `${aksiBtn} bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white`;

const thBase =
    'sticky top-0 z-20 border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-3 py-3 text-left text-xs font-semibold whitespace-nowrap text-white';

/* label + kontrol + pesan error */
function Field({ label, error, children }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">{label}</span>
            {children}
            {error && <span className="text-[11px] font-medium text-red-500">{error}</span>}
        </label>
    );
}

/* ---------- kartu section ---------- */
function Section({ no, title, desc, action, delayMs = 0, children }) {
    return (
        <section style={delay(delayMs)} className={`idx-rise ${card}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/30">
                        {no}
                    </span>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
                        {desc && <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>}
                    </div>
                </div>
                {action}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

/* ---------- sel foto: banyak foto, preview, upload ---------- */
function ImageCell({ paths, files, onAdd, onRemovePath, onRemoveFile }) {
    // preview untuk file yang baru dipilih (belum tersimpan)
    const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

    useEffect(() => {
        return () => previews.forEach((u) => URL.revokeObjectURL(u));
    }, [previews]);

    const total = paths.length + files.length;
    const penuh = total >= MAKS_FOTO;

    const pilih = (e) => {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (picked.length) onAdd(picked);
    };

    const kotak = 'idx-pop relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border';
    const hapusBtn =
        'absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-600/90 text-white shadow transition hover:scale-110 hover:bg-red-700';

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
            {/* foto yang sudah tersimpan */}
            {paths.map((p) => (
                <div key={p} className={`${kotak} border-slate-200`}>
                    <img src={`/storage/${p}`} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => onRemovePath(p)} title="Hapus foto" className={hapusBtn}>
                        <Icon type="close" className="h-3 w-3" />
                    </button>
                </div>
            ))}

            {/* foto baru (belum tersimpan) */}
            {previews.map((src, i) => (
                <div key={`baru-${i}`} className={`${kotak} border-blue-300`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1 text-[9px] font-bold text-white">BARU</span>
                    <button type="button" onClick={() => onRemoveFile(i)} title="Hapus foto" className={hapusBtn}>
                        <Icon type="close" className="h-3 w-3" />
                    </button>
                </div>
            ))}

            {/* tombol upload, hilang kalau sudah penuh */}
            {!penuh && (
                <label className="relative flex h-20 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
                    <Icon type="upload" className="h-4 w-4" />
                    <span className="text-[11px] font-semibold">{total === 0 ? 'Upload foto' : 'Tambah foto'}</span>
                    <span className="text-[10px] text-slate-400">
                        {total}/{MAKS_FOTO}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={pilih} />
                </label>
            )}
        </div>
    );
}

export default function Form({ joken }) {
    const edit = Boolean(joken);

    /* ---------------- state ---------------- */
    const [head, setHead] = useState({
        judul: joken?.judul ?? 'JOKEN MESIN',
        no_registrasi: joken?.no_registrasi ?? '',
        line: joken?.line ?? '',
        model: joken?.model ?? '',
        pic: joken?.pic ?? '',
        no_line: joken?.no_line ?? '',
        supplier: joken?.supplier ?? '',
        part_name: joken?.part_name ?? '',
        part_number: joken?.part_number ?? '',
        mfg_location: joken?.mfg_location ?? '',
    });

    const [columns, setColumns] = useState(() =>
        joken?.kolom?.length ? joken.kolom : [kolomKosong()]
    );

    const [rows, setRows] = useState(() => {
        if (joken?.rows?.length) {
            return joken.rows.map((r) => ({
                uid: `r${r.id}`,
                qcpc: r.qcpc ?? '',
                proses: r.proses ?? '',
                model_material: r.model_material ?? '',
                type_mesin: r.type_mesin ?? '',
                values: { ...(r.nilai ?? {}) },
                files: {},
            }));
        }
        return [barisKosong()];
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const tutup = () => setConfirmDialog(null);

    /* ---------------- helper update ---------------- */
    const setRow = (ruid, patch) =>
        setRows((rs) => rs.map((r) => (r.uid === ruid ? { ...r, ...patch } : r)));

    const setValue = (ruid, cuid, v) =>
        setRows((rs) =>
            rs.map((r) => (r.uid === ruid ? { ...r, values: { ...r.values, [cuid]: v } } : r))
        );

    /* ---------------- foto (banyak per sel) ---------------- */
    const addFotos = (ruid, cuid, picked) => {
        const besar = picked.find((f) => f.size > MAKS_MB * 1024 * 1024);
        if (besar) {
            setErrors({ file: `Ukuran foto maksimal ${MAKS_MB} MB (${besar.name}).` });
            return;
        }

        const baris = rows.find((x) => x.uid === ruid);
        const sisa = MAKS_FOTO - asList(baris?.values[cuid]).length - (baris?.files[cuid]?.length ?? 0);

        if (sisa <= 0) {
            setErrors({ file: `Maksimal ${MAKS_FOTO} foto per sel.` });
            return;
        }

        setErrors(
            picked.length > sisa
                ? { file: `Maksimal ${MAKS_FOTO} foto per sel, hanya ${sisa} foto pertama yang ditambahkan.` }
                : {}
        );

        const diambil = picked.slice(0, sisa);
        setRows((rs) =>
            rs.map((r) =>
                r.uid === ruid
                    ? { ...r, files: { ...r.files, [cuid]: [...(r.files[cuid] ?? []), ...diambil] } }
                    : r
            )
        );
    };

    // hapus satu foto: { path } untuk foto yang sudah tersimpan, { index } untuk foto baru
    const hapusFoto = (ruid, cuid, { path, index }) =>
        setConfirmDialog({
            title: 'Hapus foto?',
            message: 'Apakah kamu yakin ingin menghapus foto ini?',
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setRows((rs) =>
                    rs.map((r) => {
                        if (r.uid !== ruid) return r;

                        if (path !== undefined) {
                            return {
                                ...r,
                                values: { ...r.values, [cuid]: asList(r.values[cuid]).filter((p) => p !== path) },
                            };
                        }

                        return {
                            ...r,
                            files: { ...r.files, [cuid]: (r.files[cuid] ?? []).filter((_, i) => i !== index) },
                        };
                    })
                );
                setErrors({});
                tutup();
            },
        });

    /* ---------------- kolom ---------------- */
    const addCol = () => {
        if (columns.length >= MAKS_KOLOM) {
            setErrors({ kolom: `Maksimal ${MAKS_KOLOM} kolom.` });
            return;
        }
        setErrors({});
        setColumns((cs) => [...cs, kolomKosong()]);
    };

    const setColLabel = (cuid, label) =>
        setColumns((cs) => cs.map((c) => (c.uid === cuid ? { ...c, label } : c)));

    const bersihkanKolom = (cuid) =>
        setRows((rs) =>
            rs.map((r) => {
                const values = { ...r.values };
                const files = { ...r.files };
                delete values[cuid];
                delete files[cuid];
                return { ...r, values, files };
            })
        );

    const changeColType = (col, type) => {
        if (type === col.type) return;
        setConfirmDialog({
            title: 'Ubah tipe kolom?',
            message: `Isi kolom "${col.label || 'tanpa nama'}" di semua baris akan dikosongkan karena tipenya berubah.`,
            confirmLabel: 'Ya, Ubah',
            tone: 'blue',
            onConfirm: () => {
                bersihkanKolom(col.uid);
                setColumns((cs) => cs.map((c) => (c.uid === col.uid ? { ...c, type } : c)));
                tutup();
            },
        });
    };

    const removeCol = (col, idx) => {
        if (columns.length <= 1) {
            setErrors({ kolom: 'Minimal harus ada 1 kolom.' });
            return;
        }
        setConfirmDialog({
            title: 'Hapus kolom?',
            message: `Apakah kamu yakin ingin menghapus kolom ${idx + 1}${col.label ? ` (${col.label})` : ''} beserta isinya di semua baris?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                bersihkanKolom(col.uid);
                setColumns((cs) => cs.filter((c) => c.uid !== col.uid));
                tutup();
            },
        });
    };

    /* ---------------- baris ---------------- */
    const addRow = () => setRows((rs) => [...rs, barisKosong()]);

    const duplicateRow = (r) =>
        setRows((rs) => {
            const i = rs.findIndex((x) => x.uid === r.uid);
            const salinan = { ...r, uid: newUid('r'), values: { ...r.values }, files: {} };
            // foto tidak ikut disalin
            columns.filter((c) => c.type === 'image').forEach((c) => (salinan.values[c.uid] = []));
            return [...rs.slice(0, i + 1), salinan, ...rs.slice(i + 1)];
        });

    const removeRow = (r, idx) => {
        if (rows.length <= 1) {
            setErrors({ baris: 'Minimal harus ada 1 baris.' });
            return;
        }
        setConfirmDialog({
            title: 'Hapus baris?',
            message: `Apakah kamu yakin ingin menghapus baris ${idx + 1}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                setRows((rs) => rs.filter((x) => x.uid !== r.uid));
                tutup();
            },
        });
    };

    /* ---------------- submit (dengan konfirmasi) ---------------- */
    const kirim = () => {
        const payload = {
            ...head,
            columns,
            rows: rows.map(({ uid, ...r }) => {
                const values = {};
                const files = {};

                columns.forEach((c) => {
                    if (c.type === 'image') {
                        const lama = asList(r.values[c.uid]); // path foto yang dipertahankan
                        const baru = r.files[c.uid] ?? []; // file yang baru dipilih
                        if (lama.length) values[c.uid] = lama;
                        if (baru.length) files[c.uid] = baru;
                    } else {
                        values[c.uid] = r.values[c.uid] ?? '';
                    }
                });

                return { ...r, values, files };
            }),
        };
        if (edit) payload._method = 'put'; // multipart tidak bisa PUT, jadi POST + _method

        router.post(edit ? `/joken/${joken.id}` : '/joken', payload, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onError: (errs) => {
                setErrors(errs);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (saving) return;

        const nomor = head.no_registrasi.trim();

        setConfirmDialog({
            title: edit ? 'Simpan perubahan?' : 'Simpan joken baru?',
            message: edit
                ? `Apakah kamu yakin ingin menyimpan perubahan pada joken ${nomor || joken.no_registrasi}?`
                : `Apakah kamu yakin ingin menyimpan joken${nomor ? ` ${nomor}` : ' ini'}?`,
            confirmLabel: edit ? 'Ya, Simpan Perubahan' : 'Ya, Simpan',
            tone: 'blue',
            onConfirm: () => {
                tutup();
                kirim();
            },
        });
    };

    const pesanError = Object.values(errors);

    return (
        <PageShell
            title={edit ? 'Edit Joken' : 'Buat Joken'}
            heading={edit ? `Edit Joken · ${joken.no_registrasi}` : 'Buat Joken Mesin'}
            backHref="/joken"
        >
            <form onSubmit={submit} className="space-y-4">
                {pesanError.length > 0 && (
                    <div className="idx-pop flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <Icon type="alert" className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="font-bold">Ada yang perlu diperbaiki</p>
                            <ul className="mt-1 list-inside list-disc space-y-0.5 text-[13px]">
                                {pesanError.slice(0, 8).map((m, i) => (
                                    <li key={i}>{m}</li>
                                ))}
                            </ul>
                            {pesanError.length > 8 && (
                                <p className="mt-1 text-xs">...dan {pesanError.length - 8} galat lainnya.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== 1. INFORMASI DOKUMEN ===== */}
                <Section no="1" title="Informasi Dokumen" desc="Judul dan nomor registrasi dokumen">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Field label="Judul" error={errors.judul}>
                                <input
                                    value={head.judul}
                                    onChange={(e) => setHead({ ...head, judul: e.target.value })}
                                    placeholder="contoh: JOKEN MESIN"
                                    className={`${inputClass} text-base font-bold`}
                                />
                            </Field>
                        </div>
                        <Field label="No. Registrasi" error={errors.no_registrasi}>
                            <input
                                value={head.no_registrasi}
                                onChange={(e) => setHead({ ...head, no_registrasi: e.target.value })}
                                placeholder="contoh: FJIK/SC2/MTC/000"
                                className={inputClass}
                            />
                        </Field>
                    </div>
                </Section>

                {/* ===== 2. IDENTITAS JOKEN ===== */}
                <Section no="2" title="Identitas Joken" desc="Data line, model, dan part" delayMs={80}>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {[
                            ['Produksi', IDENTITAS_PRODUKSI],
                            ['Part', IDENTITAS_PART],
                        ].map(([judul, grup]) => (
                            <div key={judul} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                                    <p className="text-xs font-bold text-slate-600">{judul}</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {grup.map(([key, label]) => (
                                        <Field key={key} label={label} error={errors[key]}>
                                            <input
                                                value={head[key]}
                                                onChange={(e) => setHead({ ...head, [key]: e.target.value })}
                                                className={`${inputClass} bg-white`}
                                            />
                                        </Field>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ===== 3. DETAIL STANDARISASI ===== */}
                <Section
                    no="3"
                    title="Detail Standarisasi"
                    desc={`${columns.length} kolom parameter · ${rows.length} baris`}
                    delayMs={160}
                    action={
                        <button type="button" onClick={addCol} className={btnGhost}>
                            <Icon type="plus" className="h-4 w-4" />
                            Tambah kolom
                        </button>
                    }
                >
                    <p className="mb-3 text-[11px] leading-relaxed text-slate-500">
                        Isi nama parameter di header tiap kolom. Kolom bertipe Foto bisa diisi sampai {MAKS_FOTO} foto per sel. Ikon biru untuk menduplikat baris, ikon merah untuk menghapus kolom atau baris.
                    </p>

                    {(errors.kolom || errors.baris || errors.file) && (
                        <p className="idx-pop mb-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                            <Icon type="alert" className="h-4 w-4 shrink-0" />
                            {errors.kolom || errors.baris || errors.file}
                        </p>
                    )}

                    <div className="idx-scroll max-h-[70vh] overflow-auto rounded-xl border border-slate-200">
                        <table className="border-separate border-spacing-0 text-xs">
                            <thead>
                                <tr className="align-top">
                                    <th className={`${thBase} left-0 z-30 w-20 text-center`}>No</th>
                                    <th className={`${thBase} min-w-[110px]`}>QCPC</th>
                                    <th className={`${thBase} min-w-[240px]`}>Proses</th>
                                    <th className={`${thBase} min-w-[150px]`}>Model Material</th>
                                    <th className={`${thBase} min-w-[130px] !border-r-2 !border-r-white/30`}>Type Mesin</th>

                                    {columns.map((c, idx) => (
                                        <th
                                            key={c.uid}
                                            className={`sticky top-0 z-20 border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-2 py-2 font-normal ${
                                                c.type === 'image' ? 'min-w-[230px]' : 'min-w-[170px]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-xs font-semibold text-blue-100">Parameter {idx + 1}</span>
                                                <button type="button" onClick={() => removeCol(c, idx)} title="Hapus kolom" className={aksiHapusGelap}>
                                                    <Icon type="trash" className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <input
                                                value={c.label}
                                                onChange={(e) => setColLabel(c.uid, e.target.value)}
                                                placeholder="Nama parameter"
                                                className={`mt-1.5 w-full rounded-lg border bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:ring-4 focus:ring-blue-400/30 ${
                                                    c.label.trim() === '' ? 'border-amber-400' : 'border-white/0'
                                                }`}
                                            />

                                            <select
                                                value={c.type}
                                                onChange={(e) => changeColType(c, e.target.value)}
                                                className="mt-1 w-full cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-[11px] font-medium text-blue-200 outline-none hover:text-white [&>option]:text-slate-800"
                                            >
                                                <option value="text">Tipe: Teks</option>
                                                <option value="image">Tipe: Foto</option>
                                            </select>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((r, ri) => (
                                    <tr key={r.uid} className="align-top transition-colors hover:bg-blue-50/30">
                                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-1.5 py-2 text-center">
                                            <span className="block text-xs font-bold text-slate-500">{ri + 1}</span>
                                            <div className="mt-1.5 flex justify-center gap-1">
                                                <button type="button" title="Duplikat baris" onClick={() => duplicateRow(r)} className={aksiSalin}>
                                                    <Icon type="copy" className="h-3.5 w-3.5" />
                                                </button>
                                                <button type="button" title="Hapus baris" onClick={() => removeRow(r, ri)} className={aksiHapus}>
                                                    <Icon type="trash" className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="border-b border-slate-100 p-1.5">
                                            <input value={r.qcpc} onChange={(e) => setRow(r.uid, { qcpc: e.target.value })} className={tblInput} />
                                        </td>
                                        <td className="border-b border-slate-100 p-1.5">
                                            <textarea rows={2} value={r.proses} onChange={(e) => setRow(r.uid, { proses: e.target.value })} className={tblInput} />
                                        </td>
                                        <td className="border-b border-slate-100 p-1.5">
                                            <input value={r.model_material} onChange={(e) => setRow(r.uid, { model_material: e.target.value })} className={tblInput} />
                                        </td>
                                        <td className="border-b border-r-2 border-slate-100 border-r-slate-300 p-1.5">
                                            <input value={r.type_mesin} onChange={(e) => setRow(r.uid, { type_mesin: e.target.value })} className={tblInput} />
                                        </td>

                                        {columns.map((c) => (
                                            <td key={c.uid} className="border-b border-slate-100 p-1.5 text-center">
                                                {c.type === 'image' ? (
                                                    <ImageCell
                                                        paths={asList(r.values[c.uid])}
                                                        files={r.files[c.uid] ?? KOSONG}
                                                        onAdd={(picked) => addFotos(r.uid, c.uid, picked)}
                                                        onRemovePath={(path) => hapusFoto(r.uid, c.uid, { path })}
                                                        onRemoveFile={(index) => hapusFoto(r.uid, c.uid, { index })}
                                                    />
                                                ) : (
                                                    <input
                                                        value={r.values[c.uid] ?? ''}
                                                        onChange={(e) => setValue(r.uid, c.uid, e.target.value)}
                                                        className={`${tblInput} text-center`}
                                                    />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        onClick={addRow}
                        className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Icon type="plus" className="h-4 w-4" />
                        Tambah baris
                    </button>
                </Section>

                {/* ===== TOMBOL ===== */}
                <div className="sticky bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl">
                    <p className="hidden pl-2 text-xs text-slate-500 sm:block">
                        {columns.length} kolom · {rows.length} baris
                    </p>

                    <div className="ml-auto flex items-center gap-2">
                        <Link href="/joken" className={btnGhost}>
                            Batal
                        </Link>
                        <button type="submit" disabled={saving} className={`${btnPrimary} h-10 px-5 text-sm`}>
                            <Shine />
                            {saving && (
                                <span className="idx-spin relative h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                            )}
                            <span className="relative">{saving ? 'Menyimpan...' : edit ? 'Simpan Perubahan' : 'Simpan'}</span>
                        </button>
                    </div>
                </div>
            </form>

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