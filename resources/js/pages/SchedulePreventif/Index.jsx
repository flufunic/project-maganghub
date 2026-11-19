import Sidebar from '@/Components/Sidebar';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

/* ------------------------------------------------------------------
| ICON
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
    menu: { sw: 2, paths: ['M4 6h16M4 12h16M4 18h16'] },
    calendar: {
        paths: [
            'M5.5 4.5h13a2 2 0 012 2v12a2 2 0 01-2 2h-13a2 2 0 01-2-2v-12a2 2 0 012-2z',
            'M8 2.5v4M16 2.5v4M3.5 9h17',
            'M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01',
        ],
    },
    tag: {
        paths: [
            'M3.5 12.5V5A1.5 1.5 0 015 3.5h7.5l8 8a1.5 1.5 0 010 2.1l-6.9 6.9a1.5 1.5 0 01-2.1 0l-8-8z',
            'M8 8h.01',
        ],
    },
    pin: {
        paths: [
            'M12 21s-6.5-5.2-6.5-10.5a6.5 6.5 0 0113 0C18.5 15.8 12 21 12 21z',
            'M12 12.5a2 2 0 100-4 2 2 0 000 4z',
        ],
    },
    check: { sw: 2.6, paths: ['M5 12.5l4.5 4.5L19 7.5'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    alert: {
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 4.5L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z',
        ],
    },
    help: { sw: 2, paths: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2M12 16.5h.01'] },
    inbox: { paths: ['M3.5 13.5l2.4-7.2A2 2 0 017.8 5h8.4a2 2 0 011.9 1.3l2.4 7.2', 'M3.5 13.5V18a2 2 0 002 2h13a2 2 0 002-2v-4.5h-5l-1 2h-5l-1-2h-5z'] },
    chart: { sw: 2, paths: ['M4 19V5M4 19h16', 'M8 15v-3M12 15V8M16 15v-5'] },
    download: { sw: 2, paths: ['M12 3v12m0 0 4-4m-4 4-4-4', 'M5 21h14'] },
};

function Icon({ type, className = 'h-4 w-4' }) {
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

/* ------------------------------------------------------------------
| STYLE TOKENS (sama dengan halaman Preventif Mesin)
------------------------------------------------------------------ */
const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const selectClass =
    'h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

const btnPrimary =
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const btnGhost =
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[.98]';

const btnDanger =
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[.98] disabled:opacity-60';

// tombol kecil di toolbar (gaya "Tambah" di Preventif Mesin)
const btnToolbar =
    'group relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const iconBtn = (tone) =>
    ({
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/30',
        red: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-500/30',
    })[tone] +
    ' inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0';

const thNavy =
    'border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3 text-xs font-semibold whitespace-nowrap text-white';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// 48 kolom: [bulan, minggu]
const WEEKS = MONTHS_SHORT.flatMap((_, m) => [1, 2, 3, 4].map((w) => [m + 1, w]));

// kolom kiri yang menempel saat scroll ke samping: [Nama Line] [Plan/Act]
const COL_BARIS = { left: 0, width: 170 };
const COL_JENIS = { left: 170, width: 64 };
const COL_TOTAL = { left: 0, width: 234 };
const stickyCol = (c) => ({ position: 'sticky', left: c.left, width: c.width, minWidth: c.width, maxWidth: c.width });

// garis pemisah awal tiap bulan
const awalBulan = (w) => (w === 1 ? 'border-l border-l-slate-300' : '');
const awalBulanGelap = (w) => (w === 1 ? 'border-l border-l-white/25' : '');

const parseKodes = (text) =>
    text.split(/[\s,;]+/).map((x) => x.trim().toUpperCase()).filter(Boolean);

// Jumlah kode yang tampil langsung di sel. Sisanya masuk tombol "+N".
const MAKS_PILL = 1;

// Arsiran garis biru muda (samar) untuk sel Act.
const ARSIRAN_ACT =
    'repeating-linear-gradient(45deg, #93c5fd 0, #93c5fd 1.5px, #eff6ff 1.5px, #eff6ff 8px)';

// Warna tiap kode otomatis & tetap: kode yang sama selalu berwarna sama.
const kodeKeAngka = (kode) =>
    [...String(kode)].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);

function warnaKode(kode) {
    const hue = Math.round((kodeKeAngka(kode) * 137.508) % 360);

    return {
        bg: `hsl(${hue} 85% 92%)`,
        fg: `hsl(${hue} 65% 26%)`,
        border: `hsl(${hue} 65% 72%)`,
        solid: `hsl(${hue} 65% 42%)`,
    };
}

function KodePill({ kode, aktif = false, onClick, title }) {
    const w = warnaKode(kode);
    const Tag = onClick ? 'button' : 'span';

    const style = aktif
        ? { backgroundColor: w.solid, borderColor: w.solid, color: '#fff' }
        : { backgroundColor: w.bg, borderColor: w.border, color: w.fg };

    const ukuran = onClick
        ? 'cursor-pointer px-2.5 py-1 text-xs transition duration-150 hover:-translate-y-0.5 hover:shadow-sm active:scale-95'
        : 'idx-pill px-1.5 py-0.5 text-[11px]';

    return (
        <Tag
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            title={title}
            style={style}
            className={`inline-flex shrink-0 min-w-[24px] items-center justify-center rounded-md border font-extrabold leading-none ${ukuran}`}
        >
            {kode}
        </Tag>
    );
}

// Isi sel jadwal: tampilkan MAKS_PILL kode saja, sisanya jadi tombol "+N"
function KodeCell({ entries, namaItem, onLihatSemua }) {
    const tampil = entries.slice(0, MAKS_PILL);
    const sisa = entries.length - tampil.length;

    if (entries.length === 0) {
        return (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-300 opacity-0 transition duration-200 group-hover:opacity-100">
                <Icon type="plus" className="h-3.5 w-3.5" />
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-1">
            {tampil.map((e) => (
                <KodePill key={e.kode} kode={e.kode} title={namaItem[e.kode]} />
            ))}

            {sisa > 0 && (
                <button
                    type="button"
                    title={`Lihat semua kode: ${entries.map((e) => e.kode).join(', ')}`}
                    onClick={(ev) => {
                        ev.stopPropagation(); // jangan ikut membuka modal edit Plan
                        onLihatSemua();
                    }}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-extrabold leading-none text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                >
                    +{sisa}
                </button>
            )}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
            {children}
            {error && <span className="idx-shake mt-1.5 block text-xs font-medium text-red-500">{error}</span>}
        </label>
    );
}

// Label kecil + kontrol (untuk toolbar)
function MiniField({ label, children }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400">{label}</span>
            {children}
        </label>
    );
}

/* ------------------------------------------------------------------
| MODAL, KONFIRMASI & TOAST (semua inline di file ini)
------------------------------------------------------------------ */
function useEscape(aktif, handler) {
    useEffect(() => {
        if (!aktif) return;
        const onKey = (e) => e.key === 'Escape' && handler();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [aktif, handler]);
}

function ModalShell({ title, subtitle, icon = 'calendar', maxW = 'max-w-lg', onClose, footer, children }) {
    useEscape(true, onClose);

    return (
        <div
            className="idx-fade fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div role="dialog" aria-modal="true" className={`idx-pop w-full ${maxW} overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30`}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                            <Icon type={icon} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900">{title}</h2>
                            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:rotate-90 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <Icon type="close" className="h-4 w-4" />
                    </button>
                </div>

                <div className="idx-scroll max-h-[62vh] overflow-y-auto px-6 py-5">{children}</div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    {footer}
                </div>
            </div>
        </div>
    );
}

const TONE = {
    red: {
        icon: 'trash',
        wrap: 'from-red-50 to-rose-100 text-red-600 ring-red-50',
        btn: 'from-red-600 to-rose-600 shadow-red-500/30',
    },
    blue: {
        icon: 'help',
        wrap: 'from-blue-50 to-indigo-100 text-blue-600 ring-blue-50',
        btn: 'from-blue-600 to-indigo-600 shadow-blue-500/30',
    },
};

function ConfirmDialog({ dialog, onCancel }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => setLoading(false), [dialog]);
    useEscape(Boolean(dialog), onCancel);

    if (!dialog) return null;

    const t = TONE[dialog.tone] ?? TONE.blue;

    return (
        <div
            className="idx-fade fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
        >
            <div role="alertdialog" aria-modal="true" className="idx-pop w-full max-w-sm rounded-3xl border border-white/60 bg-white p-6 text-center shadow-2xl shadow-slate-950/30">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ring-8 ${t.wrap}`}>
                    <Icon type={t.icon} className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">{dialog.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{dialog.message}</p>

                <div className="mt-6 grid grid-cols-2 gap-2">
                    <button type="button" onClick={onCancel} className={`${btnGhost} border border-slate-200`}>
                        Batal
                    </button>
                    <button
                        type="button"
                        autoFocus
                        disabled={loading}
                        onClick={() => {
                            setLoading(true);
                            dialog.onConfirm?.();
                        }}
                        className={`${btnPrimary} ${t.btn}`}
                    >
                        {loading ? 'Memproses...' : dialog.confirmLabel ?? 'Ya'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const TOAST_TONE = {
    emerald: { bar: 'from-emerald-400 to-green-600', ico: 'bg-emerald-50 text-emerald-600', icon: 'check' },
    red: { bar: 'from-red-400 to-rose-600', ico: 'bg-red-50 text-red-600', icon: 'alert' },
};

function Toast({ tone = 'emerald', title, message, onClose }) {
    const t = TOAST_TONE[tone];

    return (
        <div className="idx-slide pointer-events-auto relative flex w-[360px] max-w-[calc(100vw-2.5rem)] items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/25">
            <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${t.bar}`} />

            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.ico}`}>
                <Icon type={t.icon} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
            >
                <Icon type="close" className="h-4 w-4" />
            </button>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Icon type="inbox" className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">{text}</p>
        </div>
    );
}

// Persentase pencapaian (versi gelap untuk baris rekap)
function Capai({ p, a }) {
    if (p <= 0) return <span className="text-white/30">-</span>;

    const nilai = Math.round((a / p) * 100);
    const warna =
        nilai >= 100
            ? 'bg-emerald-400/20 text-emerald-300'
            : nilai >= 50
            ? 'bg-amber-400/20 text-amber-300'
            : 'bg-rose-400/20 text-rose-300';

    return (
        <span className={`inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold ${warna}`}>
            {nilai}%
        </span>
    );
}

/* ------------------------------------------------------------------
| EXPORT EXCEL (tanpa library: Excel membaca tabel HTML + warna)
| Tata letak:
|  - Baris Plan: huruf kode berwarna (sama dengan di layar), 3 huruf per baris
|    lalu turun ke baris berikutnya di sel yang sama, tinggi baris menyesuaikan.
|  - Baris Act: sel biru + tanda ✓ (arsiran tidak bisa di Excel).
|  - Total Plan / Total Act / Pencapaian di bawah tabel.
|  - Keterangan Kode (kode, item, divisi, frekuensi) di bawah, supaya huruf
|    di jadwal bisa dibaca tanpa membuka aplikasi.
|  - Header & 2 kolom kiri dibekukan, orientasi landscape, muat 1 halaman lebar.
------------------------------------------------------------------ */
const hslKeHex = (h, s, l) => {
    const sat = s / 100;
    const lig = l / 100;
    const k = (n) => (n + h / 30) % 12;
    const a = sat * Math.min(lig, 1 - lig);
    const f = (n) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
};

const warnaKodeHex = (kode) => {
    const hue = Math.round((kodeKeAngka(kode) * 137.508) % 360);

    return { teks: hslKeHex(hue, 65, 30), bg: hslKeHex(hue, 85, 92), garis: hslKeHex(hue, 65, 72) };
};

const esc = (v) =>
    String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


function buatExcelHtml({ tahun, items, baris, plan, arsir, totals }) {
    const PER_BARIS = 3;

    const dasar =
        'text-align:center;vertical-align:middle;font-family:Calibri,Arial,sans-serif;';
    const garis = 'border:.5pt solid #cbd5e1;';

    const awal = (w) =>
        w === 1 ? 'border-left:1.5pt solid #64748b;' : '';

    const awalGelap = (w) =>
        w === 1 ? 'border-left:1.5pt solid #93c5fd;' : '';

    const nilaiTotal = (m, w, jenis) =>
        Number(totals?.[`${m}-${w}`]?.[jenis] ?? 0);

    // 2 kolom identitas + 48 kolom minggu
    const lebarKolom = 2 + WEEKS.length;

    const kolom = [
        '<col width="170">',
        '<col width="56">',
        ...WEEKS.map(() => '<col width="52">'),
    ].join('');

    const rows = [];

    /* =========================================================
       HEADER JADWAL
    ========================================================= */

    const bulanHead = MONTHS_SHORT.map(
        (m, i) => `
            <th colspan="4"
                style="${dasar}
                background:${i % 2 === 0 ? '#0b1a4d' : '#10266b'};
                color:#ffffff;
                font-weight:bold;
                font-size:11pt;
                border:.5pt solid #1e3a8a;
                ${awalGelap(1)}">
                ${m} ${tahun}
            </th>
        `
    ).join('');

    const mingguHead = WEEKS.map(
        ([, w]) => `
            <th style="${dasar}
                background:#16307a;
                color:#dbeafe;
                font-weight:bold;
                font-size:9pt;
                border:.5pt solid #1e3a8a;
                ${awalGelap(w)}">
                W${w}
            </th>
        `
    ).join('');

    rows.push(`
        <tr style="height:26pt">
            <th rowspan="2" style="${dasar}
                background:#0b1a4d;
                color:#ffffff;
                font-weight:bold;
                font-size:11pt;
                border:.5pt solid #1e3a8a;">
                Nama Line
            </th>

            <th rowspan="2" style="${dasar}
                background:#0b1a4d;
                color:#ffffff;
                font-weight:bold;
                border:.5pt solid #1e3a8a;">
                Jenis
            </th>

            ${bulanHead}
        </tr>
    `);

    rows.push(`
        <tr style="height:20pt">
            ${mingguHead}
        </tr>
    `);

    /* =========================================================
       ISI JADWAL: PLAN DAN ACT
    ========================================================= */

    baris.forEach((b) => {
        const kodePerWeek = WEEKS.map(([m, w]) =>
            plan?.[`${b.id}-${m}-${w}`] ?? []
        );

        // Cari jumlah baris kode terbanyak dalam satu baris jadwal
        const maksBaris = Math.max(
            1,
            ...kodePerWeek.map((entries) =>
                Math.ceil(entries.length / PER_BARIS)
            )
        );

        const tinggiPlan = Math.max(30, maksBaris * 20 + 8);

        const selPlan = kodePerWeek
            .map((entries, idx) => {
                const w = WEEKS[idx][1];

                // Kelompokkan kode: maksimal 3 kode per baris
                const kelompok = [];

                for (let i = 0; i < entries.length; i += PER_BARIS) {
                    kelompok.push(entries.slice(i, i + PER_BARIS));
                }

                const isi = kelompok
                    .map((kelompokKode) =>
                        kelompokKode
                            .map((e) => {
                                const warna = warnaKodeHex(e.kode);

                                return `
                                    <span style="
                                        display:inline-block;
                                        background:${warna.bg};
                                        color:${warna.teks};
                                        border:1px solid ${warna.garis};
                                        padding:2px 5px;
                                        margin:1px;
                                        font-weight:bold;
                                        font-size:9pt;">
                                        ${esc(e.kode)}
                                    </span>
                                `;
                            })
                            .join(' ')
                    )
                    .join('<br>');

                return `
                    <td style="${dasar}
                        font-size:9pt;
                        white-space:normal;
                        background:${entries.length ? '#eff6ff' : '#ffffff'};
                        ${garis}${awal(w)}">
                        ${isi}
                    </td>
                `;
            })
            .join('');

        // Baris PLAN
        rows.push(`
            <tr style="height:${tinggiPlan}pt">
                <td rowspan="2" style="${dasar}
                    ${garis}
                    background:#f8fafc;
                    font-weight:bold;
                    font-size:10pt;
                    white-space:normal;">
                    ${esc(b.label)}
                    ${
                        b.zona
                            ? `<br><span style="font-weight:normal;color:#64748b;font-size:9pt;">Zona ${esc(b.zona)}</span>`
                            : ''
                    }
                </td>

                <td style="${dasar}
                    ${garis}
                    background:#dbeafe;
                    color:#1d4ed8;
                    font-weight:bold;
                    font-size:9pt;">
                    PLAN
                </td>

                ${selPlan}
            </tr>
        `);

        // Baris ACT
        const selAct = WEEKS.map(([m, w]) => {
            const aktif = Boolean(arsir?.[`${b.id}-${m}-${w}`]);

            return `
                <td style="${dasar}
                    ${garis}
                    ${awal(w)}
                    background:${aktif ? '#93c5fd' : '#ffffff'};
                    color:#1e3a8a;
                    font-weight:bold;
                    font-size:11pt;">
                    ${aktif ? '✓' : ''}
                </td>
            `;
        }).join('');

        rows.push(`
            <tr style="height:24pt">
                <td style="${dasar}
                    ${garis}
                    background:#d1fae5;
                    color:#047857;
                    font-weight:bold;
                    font-size:9pt;">
                    ACT
                </td>

                ${selAct}
            </tr>
        `);
    });

    /* =========================================================
       TOTAL PLAN DAN TOTAL ACT
    ========================================================= */

    [
        ['Total Plan', 'plan'],
        ['Total Act', 'act'],
    ].forEach(([label, jenis]) => {
        const sel = WEEKS.map(([m, w]) => {
            const n = nilaiTotal(m, w, jenis);

            return `
                <td style="${dasar}
                    background:#0b1a4d;
                    color:${n > 0 ? '#ffffff' : '#64748b'};
                    font-weight:bold;
                    font-size:10pt;
                    border:.5pt solid #1e3a8a;
                    ${awalGelap(w)}">
                    ${n}
                </td>
            `;
        }).join('');

        rows.push(`
            <tr style="height:22pt">
                <td colspan="2" style="${dasar}
                    background:#0b1a4d;
                    color:#ffffff;
                    font-weight:bold;
                    font-size:10pt;
                    border:.5pt solid #1e3a8a;">
                    ${label}
                </td>

                ${sel}
            </tr>
        `);
    });

    /* =========================================================
       PENCAPAIAN
    ========================================================= */

    const selCapai = WEEKS.map(([m, w]) => {
        const p = nilaiTotal(m, w, 'plan');
        const a = nilaiTotal(m, w, 'act');

        const n = p > 0 ? Math.round((a / p) * 100) : null;

        const warna =
            n === null
                ? '#64748b'
                : n >= 100
                    ? '#6ee7b7'
                    : n >= 50
                        ? '#fcd34d'
                        : '#fda4af';

        return `
            <td style="${dasar}
                background:#0b1a4d;
                color:${warna};
                font-weight:bold;
                font-size:9pt;
                border:.5pt solid #1e3a8a;
                ${awalGelap(w)}">
                ${n === null ? '-' : `${n}%`}
            </td>
        `;
    }).join('');

    rows.push(`
        <tr style="height:22pt">
            <td colspan="2" style="${dasar}
                background:#0b1a4d;
                color:#ffffff;
                font-weight:bold;
                font-size:10pt;
                border:.5pt solid #1e3a8a;">
                Pencapaian
            </td>

            ${selCapai}
        </tr>
    `);

    /* =========================================================
       KETERANGAN KODE
       Tetap berada di sheet yang sama.
       Total lebar kolom = 50.
    ========================================================= */

    rows.push(`
        <tr style="height:18pt">
            <td colspan="${lebarKolom}"></td>
        </tr>
    `);

    rows.push(`
        <tr style="height:28pt">
            <td colspan="${lebarKolom}" style="
                font-family:Calibri,Arial,sans-serif;
                font-weight:bold;
                font-size:14pt;
                color:#1e3a8a;
                text-align:left;
                vertical-align:middle;">
                KETERANGAN KODE ITEM PREVENTIF
            </td>
        </tr>
    `);

    const kepala = (judul, span) => `
        <td colspan="${span}" style="${dasar}
            background:#0b1a4d;
            color:#ffffff;
            font-weight:bold;
            font-size:10pt;
            border:.5pt solid #1e3a8a;">
            ${judul}
        </td>
    `;

    // 1 + 30 + 9 + 10 = 50 kolom
    rows.push(`
        <tr style="height:24pt">
            ${kepala('Kode', 1)}
            ${kepala('Item Preventif', 30)}
            ${kepala('Divisi', 9)}
            ${kepala('Frekuensi', 10)}
        </tr>
    `);

    // Urutkan kode A, B, ... Z, AA, AB, dan seterusnya
    const itemsUrut = [...items].sort(
        (a, b) => kodeKeAngka(a.kode) - kodeKeAngka(b.kode)
    );

    itemsUrut.forEach((item) => {
        const c = warnaKodeHex(item.kode);

        rows.push(`
            <tr style="height:24pt">
                <td style="${dasar}
                    background:${c.bg};
                    color:${c.teks};
                    font-weight:bold;
                    font-size:10pt;
                    border:.5pt solid ${c.garis};">
                    ${esc(item.kode)}
                </td>

                <td colspan="30" style="
                    font-family:Calibri,Arial,sans-serif;
                    text-align:left;
                    vertical-align:middle;
                    white-space:normal;
                    font-size:10pt;
                    padding:4px 8px;
                    ${garis}">
                    ${esc(item.item_preventif)}
                </td>

                <td colspan="9" style="${dasar}
                    font-size:10pt;
                    ${garis}">
                    ${esc(item.divisi)}
                </td>

                <td colspan="10" style="${dasar}
                    font-size:10pt;
                    ${garis}">
                    ${esc(item.frekuensi)}
                </td>
            </tr>
        `);
    });

    /* =========================================================
       CATATAN
    ========================================================= */

    rows.push(`
        <tr style="height:14pt">
            <td colspan="${lebarKolom}"></td>
        </tr>
    `);

    rows.push(`
        <tr>
            <td colspan="${lebarKolom}" style="
                font-family:Calibri,Arial,sans-serif;
                font-size:9pt;
                color:#64748b;
                text-align:left;
                white-space:normal;">
                Keterangan:
                W1 = tanggal 1–7;
                W2 = tanggal 8–14;
                W3 = tanggal 15–21;
                W4 = tanggal 22–akhir bulan.
                Tanda ✓ menunjukkan sel ACT yang diarsir.
                Total Act dihitung berdasarkan checklist Preventif Mesin.
                Diekspor ${new Date().toLocaleDateString('id-ID', {
                    dateStyle: 'long',
                })}.
            </td>
        </tr>
    `);

    /* =========================================================
       HTML EXCEL
    ========================================================= */

    return `
        <html
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">

        <head>
            <meta charset="UTF-8">

            <!-- Pengaturan Excel -->
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Schedule ${tahun}</x:Name>

                            <x:WorksheetOptions>
                                <x:DoNotDisplayGridlines/>

                                <x:FreezePanes/>
                                <x:FrozenNoSplit/>

                                <x:SplitHorizontal>2</x:SplitHorizontal>
                                <x:TopRowBottomPane>2</x:TopRowBottomPane>

                                <x:SplitVertical>2</x:SplitVertical>
                                <x:LeftColumnRightPane>2</x:LeftColumnRightPane>

                                <x:ActivePane>0</x:ActivePane>

                                <x:Panes>
                                    <x:Pane><x:Number>3</x:Number></x:Pane>
                                    <x:Pane><x:Number>1</x:Number></x:Pane>
                                    <x:Pane><x:Number>2</x:Number></x:Pane>
                                    <x:Pane><x:Number>0</x:Number></x:Pane>
                                </x:Panes>

                                <x:Zoom>85</x:Zoom>
                                <x:FitToPage/>

                                <x:Print>
                                    <x:FitWidth>1</x:FitWidth>
                                    <x:FitHeight>0</x:FitHeight>
                                    <x:ValidPrinterInfo/>
                                </x:Print>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->

            <style>
                @page {
                    mso-page-orientation: landscape;
                    margin: .4in;
                }

                table {
                    border-collapse: collapse;
                    table-layout: fixed;
                }

                td, th {
                    mso-number-format: "\\@";
                }
            </style>
        </head>

        <body>
            <table cellspacing="0" cellpadding="2">
                ${kolom}
                ${rows.join('')}
            </table>
        </body>
        </html>
    `;
}


const emptyZona = { id: null, no: '', zona: '', nama_line: '', jumlah_mesin: 1 };
const ARSIR_KOSONG = {};

export default function Index({
    tahun,
    items = [],
    zonas = [],
    baris = [],
    plan = {},
    act = {},
    arsir = ARSIR_KOSONG,
    totals = {},
    flash,
}) {
    const [tab, setTab] = useState('jadwal');
    const [showSidebar, setShowSidebar] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // modal zona
    const [zonaForm, setZonaForm] = useState(null);
    const [zonaErrors, setZonaErrors] = useState({});

    // modal input kode (Plan)
    const [cell, setCell] = useState(null);
    const [cellError, setCellError] = useState('');
    const [saving, setSaving] = useState(false);

    // pop up daftar semua kode di satu sel
    const [lihatKode, setLihatKode] = useState(null);

    // modal tambah / ubah baris (pilih zona atau nama manual) & pesan galat
    const [barisForm, setBarisForm] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // status arsir Act (optimistic, biar klik langsung terasa)
    const [arsirLokal, setArsirLokal] = useState(arsir);

    useEffect(() => {
        setArsirLokal(arsir);
    }, [arsir]);

    /* ---------------- toast ---------------- */
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccess(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(''), 5000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    useEffect(() => {
        if (!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 4000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    /* ---------------- tahun ---------------- */
    const ubahTahun = (nilai) =>
        router.get(
            '/schedule-preventif',
            { tahun: nilai },
            { preserveState: true, preserveScroll: true, replace: true }
        );

    /* ---------------- helper grid ---------------- */
    // plan / act: "baris-bulan-minggu" => [{ kode, n }]
    const entriOf = (sumber, barisId, bulan, minggu) => sumber?.[`${barisId}-${bulan}-${minggu}`] ?? [];

    // Nama baris: Nama Line zona (kalau terhubung) > nama manual > "Baris N"
    const barisLabel = (b, i) => {
        if (b.nama_line && b.nama_line.trim() !== '') return b.nama_line;
        if (b.nama && b.nama.trim() !== '') return b.nama;
        return `Baris ${i + 1}`;
    };

    const totalOf = (bulan, minggu, jenis) => totals?.[`${bulan}-${minggu}`]?.[jenis] ?? 0;
    const namaItem = Object.fromEntries(items.map((i) => [i.kode, i.item_preventif]));

    // zona yang sudah dipakai baris lain (pada tahun yang tampil)
    const zonaDipakai = (zonaId, barisId) =>
        baris.some((b) => b.zona_id === zonaId && b.id !== barisId);

    // ringkasan setahun
    const sumPlan = WEEKS.reduce((n, [m, w]) => n + Number(totalOf(m, w, 'plan')), 0);
    const sumAct = WEEKS.reduce((n, [m, w]) => n + Number(totalOf(m, w, 'act')), 0);
    const sumCapai = sumPlan > 0 ? Math.round((sumAct / sumPlan) * 100) : 0;

    /* ---------------- ZONA: tambah / edit / hapus ---------------- */
    const openZona = (zona = null) => {
        setZonaErrors({});
        setZonaForm(zona ? { ...zona, no: zona.no ?? '' } : { ...emptyZona });
    };

    const kirimZona = () => {
        const body = {
            no: zonaForm.no === '' ? null : zonaForm.no,
            zona: zonaForm.zona,
            nama_line: zonaForm.nama_line,
            jumlah_mesin: zonaForm.jumlah_mesin,
        };

        const opsi = {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setSaving(true),
            onFinish: () => {
                setSaving(false);
                setConfirmDialog(null);
            },
            onSuccess: () => setZonaForm(null),
            onError: (errors) => setZonaErrors(errors),
        };

        if (zonaForm.id) {
            router.put(`/schedule-preventif/zona/${zonaForm.id}`, body, opsi);
        } else {
            router.post('/schedule-preventif/zona', body, opsi);
        }
    };

    // Satu kali konfirmasi (sebelumnya edit zona sempat meminta konfirmasi dua kali)
    const confirmSaveZona = () => {
        const baru = !zonaForm.id;
        const nama = zonaForm.nama_line || 'zona ini';

        setConfirmDialog({
            title: baru ? 'Tambah zona?' : 'Simpan perubahan?',
            message: baru
                ? `Apakah kamu yakin ingin menambahkan ${nama}?`
                : `Apakah kamu yakin ingin menyimpan perubahan ${nama}?`,
            confirmLabel: baru ? 'Ya, Tambah' : 'Ya, Simpan',
            tone: 'blue',
            onConfirm: kirimZona,
        });
    };

    const confirmDeleteZona = (zona) => {
        setConfirmDialog({
            title: 'Hapus zona?',
            message: `Apakah kamu yakin ingin menghapus ${zona.nama_line}? Baris jadwal yang memakai zona ini akan kembali bernama "Baris N", isian Plan-nya tetap aman.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/schedule-preventif/zona/${zona.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    /* ---------------- PLAN: input kode per week ---------------- */
    const openCell = (b, i, bulan, minggu) => {
        setCellError('');
        setCell({
            barisId: b.id,
            label: barisLabel(b, i),
            bulan,
            minggu,
            text: entriOf(plan, b.id, bulan, minggu).map((e) => e.kode).join(', '),
        });
    };

    /* ---------------- BARIS PLAN/ACT: tambah / ubah / hapus ---------------- */
    const openTambahBaris = () => {
        setBarisForm({ id: null, zona_id: '', nama: '' });
    };

    const openUbahBaris = (b) => {
        setBarisForm({ id: b.id, zona_id: b.zona_id ?? '', nama: b.nama ?? '' });
    };

    const saveBaris = () => {
        const body = {
            zona_id: barisForm.zona_id === '' ? null : Number(barisForm.zona_id),
            nama: barisForm.nama,
        };

        const opsi = {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onSuccess: () => setBarisForm(null),
            onError: (errors) => setErrorMessage(Object.values(errors)[0] ?? 'Gagal menyimpan baris.'),
        };

        if (barisForm.id) {
            router.put(`/schedule-preventif/baris/${barisForm.id}`, body, opsi);
        } else {
            router.post('/schedule-preventif/baris', { ...body, tahun }, opsi);
        }
    };

    const confirmDeleteBaris = (b, i) => {
        setConfirmDialog({
            title: 'Hapus baris?',
            message: `Apakah kamu yakin ingin menghapus ${barisLabel(b, i)}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/schedule-preventif/baris/${b.id}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onError: (errors) => setErrorMessage(Object.values(errors)[0] ?? 'Gagal menghapus baris.'),
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    const toggleKode = (kode) => {
        const set = new Set(parseKodes(cell.text));
        set.has(kode) ? set.delete(kode) : set.add(kode);
        setCell({ ...cell, text: [...set].join(', ') });
    };

    const saveCell = (kosongkan = false) => {
        router.post(
            '/schedule-preventif/cell',
            {
                tahun,
                baris_id: cell.barisId,
                bulan: cell.bulan,
                minggu: cell.minggu,
                kodes: kosongkan ? [] : parseKodes(cell.text),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => setCell(null),
                onError: (errors) => setCellError(Object.values(errors)[0] ?? 'Gagal menyimpan.'),
            }
        );
    };

    /* ---------------- ACT: klik sekali untuk arsir / hapus arsir ---------------- */
    const toggleArsir = async (barisId, bulan, minggu) => {
        const key = `${barisId}-${bulan}-${minggu}`;
        const aktifBaru = !arsirLokal[key];

        const setKey = (nilai) =>
            setArsirLokal((prev) => {
                const next = { ...prev };
                if (nilai) next[key] = true;
                else delete next[key];
                return next;
            });

        setKey(aktifBaru); // tampilan berubah langsung

        try {
            await axios.post('/schedule-preventif/arsir', {
                tahun,
                baris_id: barisId,
                bulan,
                minggu,
                aktif: aktifBaru,
            });
        } catch (e) {
            setKey(!aktifBaru); // gagal simpan: kembalikan
            setErrorMessage(e.response?.data?.message ?? 'Gagal menyimpan arsir.');
        }
    };

    /* ---------------- EXPORT EXCEL ---------------- */

    const exportExcel = () => {
        try {
            const html = buatExcelHtml({
                tahun,
                items,
                baris: baris.map((b, i) => ({
                    ...b,
                    label: barisLabel(b, i),
                })),
                plan,
                arsir: arsirLokal,
                totals,
            });

            const blob = new Blob(
                ['\ufeff', html],
                {
                    type: 'application/vnd.ms-excel;charset=utf-8',
                }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `Schedule-Preventif-${tahun}.xls`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

            setSuccessMessage(
                `Schedule Preventif ${tahun} berhasil diekspor ke Excel.`
            );

            setShowSuccess(true);
        } catch (error) {
            console.error('Export Excel error:', error);

            setErrorMessage(
                'Gagal membuat file Excel. Silakan coba lagi.'
            );
        }
    };


    const terpilih = new Set(cell ? parseKodes(cell.text) : []);

    const totalMesin = zonas.reduce((n, z) => n + Number(z.jumlah_mesin || 0), 0);

    const tabs = [
        { key: 'jadwal', label: 'Jadwal', icon: 'calendar', count: null },
        { key: 'item', label: 'Kode & Item', icon: 'tag', count: items.length },
        { key: 'zona', label: 'Zona & Mesin', icon: 'pin', count: zonas.length },
    ];
    const tabIndex = tabs.findIndex((t) => t.key === tab);

    // Kartu ringkasan (memakai data yang sudah ada)
    const stats = [
        {
            label: `Total Plan ${tahun}`,
            value: sumPlan,
            hint: 'Tanggal plan semua baris',
            icon: 'calendar',
            tone: 'from-blue-500 to-indigo-600',
            soft: 'bg-blue-50 text-blue-600',
        },
        {
            label: `Total Act ${tahun}`,
            value: sumAct,
            hint: 'Dari checklist Preventif Mesin',
            icon: 'check',
            tone: 'from-emerald-500 to-green-600',
            soft: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Pencapaian',
            value: `${sumCapai}%`,
            hint: 'Act dibanding Plan',
            icon: 'chart',
            tone: sumCapai >= 100 ? 'from-emerald-500 to-green-600' : 'from-violet-500 to-purple-600',
            soft: sumCapai >= 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600',
        },
        {
            label: 'Total Mesin',
            value: totalMesin,
            hint: `${zonas.length} zona · ${baris.length} baris jadwal`,
            icon: 'pin',
            tone: 'from-cyan-500 to-sky-600',
            soft: 'bg-cyan-50 text-cyan-600',
        },
    ];

    const delay = (ms) => ({ animationDelay: `${ms}ms` });

    // toolbar bersama tab Item & Zona
    const renderToolbar = ({ title, badge, desc, actions }) => (
        <div className={`idx-rise mb-4 ${card}`}>
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">{badge}</span>
                    </div>
                    <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-500">{desc}</p>
                </div>

                <div className="flex flex-wrap items-end gap-2.5">{actions}</div>
            </div>
        </div>
    );

    const shine =
        'pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]';

    return (
        <>
            <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
            <Head title="Schedule Preventif" />

            <style>{`
                @keyframes idxRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes idxFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes idxPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes idxSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes idxFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.08); } }
                @keyframes idxFloatReverse { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-34px,22px,0) scale(1.1); } }
                @keyframes idxShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes idxPill { 0% { transform: scale(.6); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
                @keyframes idxShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

                .idx-rise { animation: idxRise .7s cubic-bezier(.22,1,.36,1) both; }
                .idx-rise-fast { animation: idxRise .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-fade { animation: idxFade .25s ease-out both; }
                .idx-pop { animation: idxPop .4s cubic-bezier(.22,1,.36,1) both; }
                .idx-slide { animation: idxSlide .45s cubic-bezier(.22,1,.36,1) both; }
                .idx-float { animation: idxFloat 14s ease-in-out infinite; }
                .idx-float-reverse { animation: idxFloatReverse 17s ease-in-out infinite; }
                .idx-shimmer { background-size: 200% 100%; animation: idxShimmer 6s linear infinite; }
                .idx-pill { animation: idxPill .3s ease-out both; }
                .idx-shake { animation: idxShake .3s ease-in-out; }

                .idx-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .idx-scroll::-webkit-scrollbar-track { background: transparent; }
                .idx-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                .idx-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

                @media (prefers-reduced-motion: reduce) {
                    .idx-rise, .idx-rise-fast, .idx-fade, .idx-pop, .idx-slide,
                    .idx-float, .idx-float-reverse, .idx-shimmer, .idx-pill, .idx-shake { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
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
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="w-full px-3 py-3 sm:px-5 2xl:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSidebar(true)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                                title="Menu"
                                aria-label="Buka menu"
                            >
                                <Icon type="menu" className="h-5 w-5" />
                            </button>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    Schedule Preventif Maintenance
                                </h1>
                                <p className="truncate text-xs text-blue-200/80">Tahun {tahun}</p>
                            </div>
                        </div>
                    </div>

                    {/* garis aksen bergerak */}
                    <div className="idx-shimmer h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* full lebar: tidak ada max-width, jadi saat zoom in kartu tetap penuh kiri-kanan */}
                <main className="w-full flex-1 px-3 py-4 sm:px-5 2xl:px-8">
                    {/* TAB: segmented control dengan indikator bergeser */}
                    <div className="idx-rise-fast relative mb-4 grid w-full max-w-xl grid-cols-3 rounded-2xl bg-slate-200/70 p-1 shadow-inner">
                        <span
                            className="absolute bottom-1 left-1 top-1 rounded-xl bg-white shadow-md shadow-slate-900/10 transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
                            style={{ width: 'calc((100% - 0.5rem) / 3)', transform: `translateX(${tabIndex * 100}%)` }}
                        />

                        {tabs.map(({ key, label, icon, count }) => {
                            const aktif = tab === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTab(key)}
                                    className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                                        aktif ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Icon type={icon} className="h-4 w-4" />
                                    <span className="truncate">{label}</span>

                                    {count !== null && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors duration-200 ${
                                                aktif ? 'bg-blue-100 text-blue-600' : 'bg-white/70 text-slate-500'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div key={tab}>
                        {/* =========================================================
                            TAB JADWAL
                        ========================================================== */}
                        {tab === 'jadwal' && (
                            <>
                                {/* STAT CARDS */}
                                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

                                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${item.soft}`}>
                                                    <Icon type={item.icon} className="h-5 w-5" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* TOOLBAR */}
                                <div style={delay(280)} className={`idx-rise mb-4 ${card}`}>
                                    <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Jadwal Preventif {tahun}</h2>
                                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                                    {baris.length} baris
                                                </span>
                                            </div>

                                            {/* LEGENDA */}
                                            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="inline-flex h-4 min-w-[20px] items-center justify-center rounded-md border border-blue-300 bg-blue-100 px-1 text-[10px] font-extrabold text-blue-700">A</span>
                                                    Kode Plan (klik sel untuk isi)
                                                </span>

                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="h-4 w-6 rounded-md border border-blue-200" style={{ backgroundImage: ARSIRAN_ACT }} />
                                                    Act (klik sel untuk arsir)
                                                </span>

                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="inline-flex h-4 items-center justify-center rounded-md border border-slate-200 bg-white px-1 text-[10px] font-extrabold text-slate-500">+N</span>
                                                    Kode lainnya
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-end gap-2.5">
                                            <MiniField label="Tahun">
                                                <select value={tahun} onChange={(e) => ubahTahun(Number(e.target.value))} className={selectClass}>
                                                    {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </MiniField>

                                            <button
                                                type="button"
                                                onClick={exportExcel}
                                                disabled={baris.length === 0}
                                                title={`Unduh jadwal ${tahun} sebagai file Excel`}
                                                className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                            >
                                                <Icon type="download" className="h-4 w-4" />
                                                Excel
                                            </button>

                                            <button type="button" onClick={openTambahBaris} disabled={saving} className={btnToolbar}>
                                                <span className={shine} />
                                                <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                                <span className="relative">Tambah baris</span>
                                            </button>
                                        </div>
                                    </div>

                                    <details className="group/info border-t border-slate-100 px-5 py-2.5 text-xs leading-relaxed text-slate-500">
                                        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-slate-600 marker:hidden">
                                            <Icon type="help" className="h-4 w-4 text-blue-500" />
                                            Cara membaca jadwal
                                            <span className="ml-auto text-slate-400 transition-transform duration-200 group-open/info:rotate-180">⌄</span>
                                        </summary>

                                        <div className="mt-2 space-y-1.5 pb-1">
                                            <p>
                                                <b className="text-slate-700">Plan</b>: klik sel pada week yang dimaksud untuk mengisi kode item.{' '}
                                                <b className="text-slate-700">Act</b>: klik sel untuk memberi atau menghapus arsiran. Angka Total Act dihitung otomatis dari checklist ✓ di menu Preventif Mesin.
                                            </p>
                                            <p>
                                                W1 = tgl 1–7, W2 = 8–14, W3 = 15–21, W4 = 22–akhir bulan. Angka Total adalah jumlah tanggal plan / act item di week itu menurut menu Preventif Mesin, dijumlahkan dari semua baris. Arahkan kursor ke kode untuk melihat nama itemnya. Jika kode lebih dari satu, klik +N untuk melihat semuanya. Nama baris mengikuti Nama Line zona yang dipilih (ikon pensil).
                                            </p>
                                        </div>
                                    </details>
                                </div>

                                {/* TABEL: ukuran sel nyaman dibaca. Layar sempit = scroll ke samping (kolom kiri tetap menempel),
                                    layar lebar / zoom out = tabel melebar memenuhi card */}
                                <div style={delay(360)} className={`idx-rise overflow-hidden ${card}`}>
                                    <div className="idx-scroll overflow-x-auto">
                                        <table className="w-full border-separate border-spacing-0 whitespace-nowrap text-xs">
                                            <thead>
                                                <tr>
                                                    <th rowSpan={2} style={{ ...stickyCol(COL_BARIS), zIndex: 30 }} className={`${thNavy} text-center`}>
                                                        Nama Line
                                                    </th>
                                                    <th rowSpan={2} style={{ ...stickyCol(COL_JENIS), zIndex: 30 }} className={`${thNavy} border-r-2 border-r-white/25 !px-2`} />

                                                    {MONTHS_SHORT.map((m, idx) => (
                                                        <th
                                                            key={m}
                                                            colSpan={4}
                                                            style={{ height: 32 }}
                                                            className={`border-b border-l border-r border-white/10 border-l-white/25 px-2 text-center text-xs font-semibold tracking-wide text-white ${
                                                                idx % 2 === 0 ? 'bg-[#0b1a4d]' : 'bg-[#10266b]'
                                                            }`}
                                                        >
                                                            {m} {tahun}
                                                        </th>
                                                    ))}
                                                </tr>

                                                <tr>
                                                    {WEEKS.map(([m, w]) => (
                                                        <th
                                                            key={`${m}-${w}`}
                                                            className={`min-w-[48px] border-b border-r border-white/10 ${awalBulanGelap(w)} bg-[#16307a] px-2 py-1.5 text-center text-[11px] font-semibold text-blue-100`}
                                                        >
                                                            W{w}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {baris.length === 0 && (
                                                    <tr>
                                                        <td colSpan={2 + WEEKS.length}>
                                                            <EmptyState text="Belum ada baris jadwal. Klik Tambah baris untuk memulai." />
                                                        </td>
                                                    </tr>
                                                )}

                                                {baris.map((b, i) => (
                                                    <React.Fragment key={b.id}>
                                                        {/* ---------- PLAN ---------- */}
                                                        <tr>
                                                            <td
                                                                rowSpan={2}
                                                                style={{ ...stickyCol(COL_BARIS), zIndex: 10 }}
                                                                className="whitespace-normal border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-center align-middle"
                                                            >
                                                                <p className="break-words text-xs font-bold text-slate-800">{barisLabel(b, i)}</p>

                                                                {b.zona && <p className="mt-0.5 text-[10px] font-medium text-slate-400">Zona {b.zona}</p>}

                                                                <div className="mt-2 flex items-center justify-center gap-1.5">
                                                                    <button type="button" title="Ubah zona / nama baris" onClick={() => openUbahBaris(b)} className={`${iconBtn('blue')} h-7 w-7`}>
                                                                        <Icon type="edit" className="h-3.5 w-3.5" />
                                                                    </button>

                                                                    {baris.length > 1 && (
                                                                        <button type="button" title="Hapus baris" onClick={() => confirmDeleteBaris(b, i)} className={`${iconBtn('red')} h-7 w-7`}>
                                                                            <Icon type="trash" className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td
                                                                style={{ ...stickyCol(COL_JENIS), zIndex: 10 }}
                                                                className="border-b border-r-2 border-slate-100 border-r-slate-300 bg-white px-2 py-3 text-center"
                                                            >
                                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600">PLAN</span>
                                                            </td>

                                                            {WEEKS.map(([m, w]) => (
                                                                <td
                                                                    key={`${m}-${w}`}
                                                                    onClick={() => openCell(b, i, m, w)}
                                                                    title={`Klik untuk mengisi kode Plan · ${MONTHS[m - 1]} W${w}`}
                                                                    className={`group min-w-[48px] cursor-pointer whitespace-normal break-words border-b border-r border-slate-100 ${awalBulan(w)} px-1 py-3 text-center text-[11px] font-bold transition-colors duration-150 hover:bg-blue-50`}
                                                                >
                                                                    <KodeCell
                                                                        entries={entriOf(plan, b.id, m, w)}
                                                                        namaItem={namaItem}
                                                                        onLihatSemua={() =>
                                                                            setLihatKode({
                                                                                jenis: 'Plan',
                                                                                label: barisLabel(b, i),
                                                                                bulan: m,
                                                                                minggu: w,
                                                                                entries: entriOf(plan, b.id, m, w),
                                                                                edit: () => openCell(b, i, m, w),
                                                                            })
                                                                        }
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>

                                                        {/* ---------- ACT ---------- */}
                                                        <tr>
                                                            <td
                                                                style={{ ...stickyCol(COL_JENIS), zIndex: 10 }}
                                                                className="border-b border-r-2 border-slate-200 border-r-slate-300 bg-white px-2 py-3 text-center"
                                                            >
                                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600">ACT</span>
                                                            </td>

                                                            {WEEKS.map(([m, w]) => {
                                                                const terarsir = Boolean(arsirLokal[`${b.id}-${m}-${w}`]);

                                                                return (
                                                                    <td
                                                                        key={`${m}-${w}`}
                                                                        onClick={() => toggleArsir(b.id, m, w)}
                                                                        title={terarsir ? 'Klik untuk hapus arsir' : 'Klik untuk memberi arsir'}
                                                                        style={terarsir ? { backgroundImage: ARSIRAN_ACT } : undefined}
                                                                        className={`min-w-[48px] cursor-pointer select-none border-b border-r border-slate-200 ${awalBulan(w)} px-1 py-3 transition-all duration-200 ${
                                                                            terarsir ? 'hover:brightness-95' : 'bg-white hover:bg-emerald-50/60'
                                                                        }`}
                                                                    />
                                                                );
                                                            })}
                                                        </tr>
                                                    </React.Fragment>
                                                ))}

                                                {/* ---------- REKAP PER WEEK ---------- */}
                                                {[
                                                    ['Total Plan', 'plan'],
                                                    ['Total Act', 'act'],
                                                ].map(([label, jenis]) => (
                                                    <tr key={label}>
                                                        <td
                                                            colSpan={2}
                                                            style={{ ...stickyCol(COL_TOTAL), zIndex: 10 }}
                                                            className="border-b border-r-2 border-white/10 border-r-white/25 bg-[#0b1a4d] px-3 py-2.5 text-center text-xs font-bold text-white"
                                                        >
                                                            {label}
                                                        </td>

                                                        {WEEKS.map(([m, w]) => {
                                                            const nilai = totalOf(m, w, jenis);

                                                            return (
                                                                <td
                                                                    key={`${m}-${w}`}
                                                                    className={`border-b border-r border-white/10 ${awalBulanGelap(w)} bg-[#0b1a4d] px-1 py-2.5 text-center text-xs font-bold ${
                                                                        nilai > 0 ? 'text-white' : 'text-white/30'
                                                                    }`}
                                                                >
                                                                    {nilai}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}

                                                <tr>
                                                    <td
                                                        colSpan={2}
                                                        style={{ ...stickyCol(COL_TOTAL), zIndex: 10 }}
                                                        className="border-r-2 border-white/10 border-r-white/25 bg-[#0b1a4d] px-3 py-2.5 text-center text-xs font-bold text-white"
                                                    >
                                                        Pencapaian
                                                    </td>

                                                    {WEEKS.map(([m, w]) => (
                                                        <td key={`${m}-${w}`} className={`border-r border-white/10 ${awalBulanGelap(w)} bg-[#0b1a4d] px-1 py-2.5 text-center`}>
                                                            <Capai p={totalOf(m, w, 'plan')} a={totalOf(m, w, 'act')} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* =========================================================
                            TAB KODE & ITEM
                        ========================================================== */}
                        {tab === 'item' && (
                            <>
                                {renderToolbar({
                                    title: 'Kode & Item',
                                    badge: `${items.length} item`,
                                    desc: 'Item diambil dari menu Preventif Mesin. Kode otomatis A–Z, lalu AA, AB, dan seterusnya. Tambah, edit, dan hapus item dilakukan di menu tersebut.',
                                    actions: (
                                        <Link href="/preventif-mesin/create" className={btnToolbar}>
                                            <span className={shine} />
                                            <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                            <span className="relative">Tambah item</span>
                                        </Link>
                                    ),
                                })}

                                <div style={delay(80)} className={`idx-rise overflow-hidden ${card}`}>
                                    <div className="idx-scroll overflow-x-auto">
                                        <table className="w-full border-separate border-spacing-0 text-sm">
                                            <thead>
                                                <tr>
                                                    <th className={`${thNavy} w-20 text-center`}>Kode</th>
                                                    <th className={`${thNavy} text-left`}>Item Preventif</th>
                                                    <th className={`${thNavy} w-32 text-center`}>Divisi</th>
                                                    <th className={`${thNavy} w-32 text-center`}>Frekuensi</th>
                                                    <th className={`${thNavy} w-24 text-center`}>Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {items.length === 0 && (
                                                    <tr><td colSpan={5}><EmptyState text="Belum ada item preventif." /></td></tr>
                                                )}

                                                {items.map((item, idx) => (
                                                    <tr
                                                        key={item.no}
                                                        style={{ animation: `idxRise .4s ease-out ${Math.min(idx, 12) * 30}ms both` }}
                                                        className="transition-colors duration-150 hover:bg-blue-50/40"
                                                    >
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 text-center"><KodePill kode={item.kode} /></td>
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 font-medium text-slate-700">{item.item_preventif}</td>
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-slate-600">{item.divisi}</td>
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-slate-600">{item.frekuensi}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-center">
                                                            <Link href={`/preventif-mesin/${item.no}/edit`} title="Edit di menu Preventif Mesin" className={`${iconBtn('blue')} h-8 w-8`}>
                                                                <Icon type="edit" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* =========================================================
                            TAB ZONA
                        ========================================================== */}
                        {tab === 'zona' && (
                            <>
                                {renderToolbar({
                                    title: 'Zona & Mesin',
                                    badge: `${totalMesin} mesin`,
                                    desc: 'Nama Line dipakai sebagai nama baris di tab Jadwal. Menghubungkannya dilakukan lewat ikon pensil pada baris jadwal.',
                                    actions: (
                                        <button type="button" onClick={() => openZona()} className={btnToolbar}>
                                            <span className={shine} />
                                            <Icon type="plus" className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                                            <span className="relative">Tambah zona</span>
                                        </button>
                                    ),
                                })}

                                <div style={delay(80)} className={`idx-rise overflow-hidden ${card}`}>
                                    <div className="idx-scroll overflow-x-auto">
                                        <table className="w-full border-separate border-spacing-0 text-sm">
                                            <thead>
                                                <tr>
                                                    <th className={`${thNavy} w-16 text-center`}>No</th>
                                                    <th className={`${thNavy} w-24 text-center`}>Zona</th>
                                                    <th className={`${thNavy} text-left`}>Nama Line</th>
                                                    <th className={`${thNavy} w-32 text-center`}>Jumlah Mesin</th>
                                                    <th className={`${thNavy} w-32 text-center`}>Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {zonas.length === 0 && (
                                                    <tr><td colSpan={5}><EmptyState text="Belum ada zona. Tambahkan zona pertama untuk mulai menyusun jadwal." /></td></tr>
                                                )}

                                                {zonas.map((z, idx) => (
                                                    <tr
                                                        key={z.id}
                                                        style={{ animation: `idxRise .4s ease-out ${Math.min(idx, 12) * 30}ms both` }}
                                                        className="transition-colors duration-150 hover:bg-blue-50/40"
                                                    >
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-slate-500">{z.no}</td>
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 text-center">
                                                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{z.zona}</span>
                                                        </td>
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 font-medium text-slate-700">{z.nama_line}</td>
                                                        <td className="border-b border-r border-slate-100 px-4 py-3 text-center text-slate-600">{z.jumlah_mesin}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button type="button" title="Edit zona" onClick={() => openZona(z)} className={`${iconBtn('blue')} h-8 w-8`}>
                                                                    <Icon type="edit" />
                                                                </button>
                                                                <button type="button" title="Hapus zona" onClick={() => confirmDeleteZona(z)} className={`${iconBtn('red')} h-8 w-8`}>
                                                                    <Icon type="trash" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                            <tfoot>
                                                <tr className="bg-[#0b1a4d]">
                                                    <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold text-white">Total Mesin</td>
                                                    <td className="px-4 py-3 text-center text-xs font-bold text-white">{totalMesin}</td>
                                                    <td />
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
                    <div className="flex w-full items-center justify-center px-6 py-3 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif
                        </p>
                    </div>
                </footer>
            </div>

            {/* TOAST (ditumpuk, tidak saling menimpa) */}
            <div className="pointer-events-none fixed right-5 top-5 z-[130] flex flex-col gap-3">
                {showSuccess && (
                    <Toast key={successMessage} tone="emerald" title="Berhasil" message={successMessage} onClose={() => setShowSuccess(false)} />
                )}

                {errorMessage && (
                    <Toast key={errorMessage} tone="red" title="Tidak bisa diproses" message={errorMessage} onClose={() => setErrorMessage('')} />
                )}
            </div>

            {/* MODAL TAMBAH / UBAH BARIS */}
            {barisForm && (
                <ModalShell
                    icon="calendar"
                    title={barisForm.id ? 'Ubah Baris' : 'Tambah Baris'}
                    subtitle={`Tahun ${tahun} · pilih zona supaya nama baris mengikuti Nama Line`}
                    onClose={() => setBarisForm(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setBarisForm(null)} className={btnGhost}>Batal</button>
                            <button type="button" onClick={saveBaris} disabled={saving} className={btnPrimary}>
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <Field label="Zona / Nama Line">
                            <select
                                autoFocus
                                value={barisForm.zona_id}
                                onChange={(e) => setBarisForm({ ...barisForm, zona_id: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">Tanpa zona (isi nama manual)</option>

                                {zonas.map((z) => {
                                    const dipakai = zonaDipakai(z.id, barisForm.id);

                                    return (
                                        <option key={z.id} value={z.id} disabled={dipakai}>
                                            {z.no}. {z.nama_line} (Zona {z.zona}){dipakai ? ' — sudah dipakai' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </Field>

                        {barisForm.zona_id === '' ? (
                            <div key="manual" className="idx-rise-fast">
                                <Field label="Nama baris (manual)">
                                    <input
                                        value={barisForm.nama}
                                        onChange={(e) => setBarisForm({ ...barisForm, nama: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && saveBaris()}
                                        maxLength={100}
                                        placeholder="Kosongkan untuk memakai Baris 1, Baris 2, ..."
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                        ) : (
                            <p key="info" className="idx-rise-fast flex gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-blue-700">
                                <Icon type="help" className="mt-0.5 h-4 w-4 shrink-0" />
                                Nama baris mengikuti Nama Line zona yang dipilih, dan ikut berubah kalau Nama Line diedit di tab Zona.
                            </p>
                        )}
                    </div>
                </ModalShell>
            )}

            {/* MODAL ZONA */}
            {zonaForm && (
                <ModalShell
                    icon="pin"
                    title={zonaForm.id ? 'Edit Zona' : 'Tambah Zona'}
                    subtitle="Nama Line dipakai sebagai nama baris di jadwal"
                    onClose={() => setZonaForm(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setZonaForm(null)} className={btnGhost}>Batal</button>
                            <button type="button" onClick={confirmSaveZona} disabled={saving} className={btnPrimary}>
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="No" error={zonaErrors.no}>
                                <input type="number" min="1" value={zonaForm.no} onChange={(e) => setZonaForm({ ...zonaForm, no: e.target.value })} placeholder="otomatis" className={inputClass} />
                            </Field>
                            <div className="col-span-2">
                                <Field label="Zona" error={zonaErrors.zona}>
                                    <input value={zonaForm.zona} onChange={(e) => setZonaForm({ ...zonaForm, zona: e.target.value })} placeholder="contoh: 2 atau 3 & 4" className={inputClass} />
                                </Field>
                            </div>
                        </div>

                        <Field label="Nama line / mesin" error={zonaErrors.nama_line}>
                            <input value={zonaForm.nama_line} onChange={(e) => setZonaForm({ ...zonaForm, nama_line: e.target.value })} className={inputClass} />
                        </Field>

                        <Field label="Jumlah mesin" error={zonaErrors.jumlah_mesin}>
                            <input type="number" min="0" value={zonaForm.jumlah_mesin} onChange={(e) => setZonaForm({ ...zonaForm, jumlah_mesin: e.target.value })} className={inputClass} />
                        </Field>
                    </div>
                </ModalShell>
            )}

            {/* MODAL INPUT KODE PLAN */}
            {cell && (
                <ModalShell
                    icon="tag"
                    maxW="max-w-xl"
                    title="Isi Kode Plan"
                    subtitle={`${cell.label} · ${MONTHS[cell.bulan - 1]} ${tahun} · Week ${cell.minggu}`}
                    onClose={() => setCell(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => saveCell(true)} disabled={saving} className={`${btnDanger} mr-auto`}>Kosongkan</button>
                            <button type="button" onClick={() => setCell(null)} className={btnGhost}>Batal</button>
                            <button type="button" onClick={() => saveCell(false)} disabled={saving} className={btnPrimary}>
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    }
                >
                    <Field label="Kode item (pisahkan dengan koma)" error={cellError}>
                        <input
                            autoFocus
                            value={cell.text}
                            onChange={(e) => setCell({ ...cell, text: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(false)}
                            placeholder="contoh: A, C"
                            className={`${inputClass} uppercase`}
                        />
                    </Field>

                    <p className="mb-2 mt-4 text-xs font-medium text-slate-400">Atau pilih kode di bawah</p>

                    <div className="mb-4 flex flex-wrap gap-1.5">
                        {items.map((item) => (
                            <KodePill
                                key={item.no}
                                kode={item.kode}
                                title={item.item_preventif}
                                aktif={terpilih.has(item.kode)}
                                onClick={() => toggleKode(item.kode)}
                            />
                        ))}
                    </div>

                    <div className="idx-scroll max-h-40 space-y-1.5 overflow-y-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                        {items.length === 0 && 'Belum ada item. Tambahkan di menu Preventif Mesin.'}
                        {items.map((item) => (
                            <div key={item.no}>
                                <b className="text-slate-800">{item.kode}</b> = {item.item_preventif}{' '}
                                <span className="text-slate-400">({item.frekuensi})</span>
                            </div>
                        ))}
                    </div>
                </ModalShell>
            )}

            {/* MODAL DAFTAR SEMUA KODE DI SATU SEL */}
            {lihatKode && (
                <ModalShell
                    icon="tag"
                    title={`Kode ${lihatKode.jenis}`}
                    subtitle={`${lihatKode.label} · ${MONTHS[lihatKode.bulan - 1]} ${tahun} · Week ${lihatKode.minggu} · ${lihatKode.entries.length} kode`}
                    onClose={() => setLihatKode(null)}
                    footer={
                        <>
                            {lihatKode.edit && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const edit = lihatKode.edit;
                                        setLihatKode(null);
                                        edit();
                                    }}
                                    className={`${btnGhost} mr-auto border border-slate-200`}
                                >
                                    <Icon type="edit" className="h-4 w-4" />
                                    Edit kode
                                </button>
                            )}

                            <button type="button" onClick={() => setLihatKode(null)} className={btnPrimary}>
                                Tutup
                            </button>
                        </>
                    }
                >
                    <ul className="space-y-2">
                        {lihatKode.entries.map((e, idx) => (
                            <li
                                key={e.kode}
                                style={{ animation: `idxRise .3s ease-out ${idx * 40}ms both` }}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition hover:border-slate-200 hover:bg-white"
                            >
                                <KodePill kode={e.kode} />

                                <span className="min-w-0 flex-1 text-sm text-slate-700">{namaItem[e.kode] ?? '-'}</span>
                            </li>
                        ))}
                    </ul>
                </ModalShell>
            )}

            {/* DIALOG KONFIRMASI (inline, tanpa ConfirmModal terpisah) */}
            <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
        </>
    );
}
