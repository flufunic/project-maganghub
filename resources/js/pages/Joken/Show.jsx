import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Icon, PageShell, glassCard, btnPrimary, btnSoft } from '@/Components/Joken/ui';

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

// Garis tipis 1px, warnanya cukup jelas tapi tidak menyolok.
const garis = 'border-b border-r border-slate-300 last:border-r-0';

// Header: tebal (bold) dan lebih gelap supaya mudah dibaca.
const th = `${garis} bg-slate-100 px-4 py-3 text-[11px] font-bold text-slate-700 print:px-2 print:py-2`;
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

export default function Show({ joken }) {
    const kolom = joken.kolom ?? [];
    const [preview, setPreview] = useState(null);

    return (
        <PageShell title={`Joken ${joken.no_registrasi}`} heading={`Joken · ${joken.no_registrasi}`} backHref="/joken">
            <style>{`
                @page { size: A3 landscape; margin: 8mm; }
                @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            `}</style>

            <div className={`overflow-hidden rounded-2xl ${glassCard} print:rounded-none print:border-0 print:shadow-none`}>
                {/* ===== BANNER ===== */}
                <div className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-800 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/70">Dokumen Standarisasi</p>
                            <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">{joken.judul}</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-200/80">No. Registrasi</p>
                                <p className="text-sm font-extrabold leading-tight text-white">{joken.no_registrasi}</p>
                            </div>

                            <div className="flex items-center gap-1.5 print:hidden">
                                <a href={`/joken/${joken.id}/export`} className={btnSoft}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                                        <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                                    </svg>
                                    Excel
                                </a>
                                <Link href={`/joken/${joken.id}/edit`} className={btnPrimary}>
                                    <Icon type="edit" className="h-4 w-4" />
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 bg-slate-50/80 p-4 print:bg-white">
                    {/* ===== IDENTITAS ===== */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {IDENTITAS.map((grup) => (
                            <div key={grup.judul} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">{grup.judul}</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {grup.fields.map(([key, label]) => (
                                        <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
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
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Detail Standarisasi</h2>
                            <span className="text-[11px] font-semibold text-slate-400">{joken.rows.length} proses</span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-300 print:overflow-visible">
                            <table className="w-full border-separate border-spacing-0 text-center text-xs">
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className={`${th} min-w-[90px] text-left`}>QCPC</th>
                                        <th rowSpan={2} className={`${th} min-w-[220px] text-left`}>Proses</th>
                                        <th rowSpan={2} className={`${th} min-w-[140px] text-left`}>Model Material</th>
                                        <th rowSpan={2} className={`${th} min-w-[120px] !border-r-2 !border-r-slate-400 text-left`}>Type Mesin</th>

                                        {kolom.map((k, i) => (
                                            <th
                                                key={k.uid}
                                                style={lebarMin(k)}
                                                className={`${th} !border-b-0 !pb-0 !pt-3 !text-slate-500`}
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
                                                className={`${th} !pb-3 !pt-1.5 align-middle leading-tight`}
                                            >
                                                <div className="mx-auto max-w-[180px] break-words">{k.label}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {joken.rows.map((r) => (
                                        <tr key={r.id} className="transition-colors even:bg-slate-50/60 hover:bg-blue-50/60">
                                            <td className={`${td} text-left font-semibold`}>
                                                {r.qcpc || <span className="font-normal text-slate-300">–</span>}
                                            </td>
                                            <td className={`${td} whitespace-pre-line text-left`}>{r.proses}</td>
                                            <td className={`${td} text-left`}>{r.model_material}</td>
                                            <td className={`${td} !border-r-2 !border-r-slate-400 text-left`}>{r.type_mesin}</td>

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
                                                                            className="group block h-16 w-20 cursor-zoom-in overflow-hidden rounded-lg border border-slate-300"
                                                                        >
                                                                            <img src={`/storage/${p}`} alt="" className="h-full w-full object-cover transition group-hover:scale-110" />
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
            </div>

            {/* LIGHTBOX FOTO */}
            {preview && (
                <div
                    className="fixed inset-0 z-[120] flex cursor-zoom-out items-center justify-center bg-[#030a26]/80 p-6 backdrop-blur-md print:hidden"
                    onClick={() => setPreview(null)}
                >
                    <img src={preview} alt="" className="max-h-full max-w-full rounded-2xl border-4 border-white shadow-2xl" />
                </div>
            )}
        </PageShell>
    );
}