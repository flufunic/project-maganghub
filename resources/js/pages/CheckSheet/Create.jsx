import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// =========================================================
// ICONS
// =========================================================

const ICONS = {
    back: { sw: 2, paths: ['m15 18-6-6 6-6'] },
    down: { sw: 2, paths: ['m6 9 6 6 6-6'] },
    save: {
        sw: 2,
        paths: [
            'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z',
            'M17 21v-8H7v8',
            'M7 3v5h8',
        ],
    },
};

const Icon = ({ type, className = 'h-4 w-4' }) => {
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
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
};

// =========================================================
// STYLE TOKENS
// =========================================================

const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const inputBase =
    'w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70';

const labelClass =
    'mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600';

// =========================================================
// KOMPONEN KECIL
// =========================================================

const Field = ({ label, error, children }) => (
    <div>
        <label className={labelClass}>
            {label}
            <span className="ml-1 text-red-500">*</span>
        </label>

        {children}

        {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
    </div>
);

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel,
    processing,
    onCancel,
    onConfirm,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !processing) {
                    onCancel();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/40"
            >
                <div className="flex items-start gap-3 px-5 pb-4 pt-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Icon type="save" className="h-5 w-5" />
                    </span>

                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// PAGE
// =========================================================

export default function Create({ divisis, mesins = [], line }) {
    const [showConfirm, setShowConfirm] = useState(false);

    // Divisi otomatis terpilih sesuai line yang tadi di-scan.
    // line_id hanya diisi kalau barcode yang di-scan adalah barcode per mesin.
    const { data, setData, post, processing, errors } = useForm({
        divisi_id: line?.divisi_id ?? '',
        line_id: line?.per_mesin ? line.id : '',
        nomor_dokumen: '',
        nama_checksheet: '',
    });

    // Mesin yang tampil hanya milik divisi yang sedang dipilih
    const mesinTersedia = useMemo(
        () =>
            mesins.filter(
                (m) => Number(m.divisi_id) === Number(data.divisi_id)
            ),
        [mesins, data.divisi_id]
    );

    // Ganti divisi -> pilihan mesin direset
    const gantiDivisi = (value) => {
        setData({
            ...data,
            divisi_id: value,
            line_id: '',
        });
    };

    // Tujuan tombol kembali / batal: daftar line yang tadi di-scan
    const backUrl = line ? `/check-sheets/line/${line.kode}` : '/check-sheets';

    // Submit form -> tampilkan modal konfirmasi dulu
    const submit = (e) => {
        e.preventDefault();

        setShowConfirm(true);
    };

    // Setelah user klik "Ya, Simpan" -> kirim ke server
    const konfirmasiSimpan = () => {
        // Simpan pesan dulu: halaman Index akan menampilkannya sebagai toast
        try {
            sessionStorage.setItem(
                'checksheet_toast',
                'Check Sheet berhasil ditambahkan.'
            );
        } catch (e) {
            // abaikan jika storage tidak tersedia
        }

        post('/check-sheets', {
            onError: () => {
                // Gagal: batalkan pesan toast
                try {
                    sessionStorage.removeItem('checksheet_toast');
                } catch (e) {
                    // abaikan
                }

                setShowConfirm(false);
            },
            onFinish: () => setShowConfirm(false),
        });
    };

    return (
        <>
            <Head title="Tambah Check Sheet" />

            <style>{`
                @keyframes idxGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes idxRise {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .idx-gradient {
                    background-size: 250% 250%;
                    animation: idxGradient 20s ease infinite;
                }
                .idx-rise { animation: idxRise 0.6s ease-out both; }

                @media (prefers-reduced-motion: reduce) {
                    .idx-gradient,
                    .idx-rise { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                {/* BACKGROUND */}
                <div className="fixed inset-0 -z-20">
                    <div className="idx-gradient absolute inset-0 bg-gradient-to-br from-[#030a26] via-[#0a2260] to-[#1d4ed8]" />
                </div>

                {/* HEADER */}
                <header className="border-b border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-4 sm:px-6">
                        <Link
                            href={backUrl}
                            title="Kembali"
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                        >
                            <Icon type="back" className="h-4 w-4" />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold tracking-tight text-white">
                                Tambah Check Sheet
                            </h1>

                            <p className="text-xs text-white/60">
                                {line
                                    ? `${line.divisi?.nama_divisi} · ${line.nama_line}`
                                    : 'Check Sheet Prediktif / Tambah Data'}
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-6">
                    <form
                        onSubmit={submit}
                        className={`idx-rise space-y-5 rounded-3xl p-6 sm:p-8 ${glassCard}`}
                    >
                        <Field label="Divisi" error={errors.divisi_id}>
                            <div className="relative">
                                <select
                                    value={data.divisi_id}
                                    onChange={(e) => gantiDivisi(e.target.value)}
                                    // dikunci kalau datang dari line tertentu
                                    disabled={!!line}
                                    className={`${inputBase} appearance-none pr-10`}
                                >
                                    <option value="">Pilih Divisi</option>

                                    {divisis.map((divisi) => (
                                        <option key={divisi.id} value={divisi.id}>
                                            {divisi.nama_divisi}
                                        </option>
                                    ))}
                                </select>

                                <Icon
                                    type="down"
                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </Field>

                        {/* MESIN: hanya muncul untuk divisi per mesin (Utility / Saidan) */}
                        {mesinTersedia.length > 0 && (
                            <Field label="Mesin" error={errors.line_id}>
                                <div className="relative">
                                    <select
                                        value={data.line_id}
                                        onChange={(e) =>
                                            setData('line_id', e.target.value)
                                        }
                                        className={`${inputBase} appearance-none pr-10`}
                                    >
                                        <option value="">Pilih Mesin</option>

                                        {mesinTersedia.map((mesin) => (
                                            <option key={mesin.id} value={mesin.id}>
                                                {mesin.nama_line}
                                            </option>
                                        ))}
                                    </select>

                                    <Icon
                                        type="down"
                                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    />
                                </div>
                            </Field>
                        )}

                        <Field label="Nomor Dokumen" error={errors.nomor_dokumen}>
                            <input
                                type="text"
                                value={data.nomor_dokumen}
                                onChange={(e) =>
                                    setData('nomor_dokumen', e.target.value)
                                }
                                placeholder="Contoh: CS-001"
                                className={inputBase}
                            />
                        </Field>

                        <Field
                            label="Nama Check Sheet"
                            error={errors.nama_checksheet}
                        >
                            <input
                                type="text"
                                value={data.nama_checksheet}
                                onChange={(e) =>
                                    setData('nama_checksheet', e.target.value)
                                }
                                placeholder="Contoh: Check Sheet Preventif Mesin"
                                className={inputBase}
                            />
                        </Field>

                        {/* TOMBOL */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <Link
                                href={backUrl}
                                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-7 text-sm font-semibold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800"
                            >
                                <Icon type="save" className="h-4 w-4" />
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </main>

                {/* FOOTER */}
                <footer className="border-t border-white/15 bg-[#030a26]/45 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-2xl items-center justify-center px-5 py-3">
                        <p className="text-xs font-medium text-white/70">
                            © {new Date().getFullYear()} Emma Sarkilla · Check Sheet Prediktif
                        </p>
                    </div>
                </footer>
            </div>

            {/* MODAL KONFIRMASI SIMPAN */}
            <ConfirmDialog
                open={showConfirm}
                title="Simpan data?"
                message="Apakah kamu yakin ingin menyimpan check sheet ini?"
                confirmLabel="Ya, Simpan"
                processing={processing}
                onCancel={() => setShowConfirm(false)}
                onConfirm={konfirmasiSimpan}
            />
        </>
    );
}