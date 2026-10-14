import ConfirmModal from '@/Components/ConfirmModal';
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// =========================================================
// ICONS  (UI saja, tidak ada logic)
// =========================================================

const ICONS = {
    back: { sw: 2, paths: ['m15 18-6-6 6-6'] },
    down: { sw: 2, paths: ['m6 9 6 6 6-6'] },
    alert: {
        sw: 2,
        paths: [
            'M12 9v4',
            'M12 17h.01',
            'M10.3 3.5 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z',
        ],
    },
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

// cursor-pointer: kursor jadi jari saat diarahkan ke input / select / textarea
const inputBase =
    'w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100';

// =========================================================
// SMALL COMPONENTS
// =========================================================

const Field = ({ label, required = false, badge, error, hint, children }) => (
    <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
            {label}

            {required && <span className="text-red-500">*</span>}

            {badge && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-blue-600">
                    {badge}
                </span>
            )}
        </label>

        {children}

        {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}

        {[error].flat().filter(Boolean).map((message, index) => (
            <p key={index} className="mt-1.5 text-xs font-medium text-red-500">
                {message}
            </p>
        ))}
    </div>
);

const SelectWrap = ({ children }) => (
    <div className="relative">
        {children}

        <Icon
            type="down"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
    </div>
);

export default function Create({ nextNo }) {
    const [alert, setAlert] = useState('');
    const [confirmSave, setConfirmSave] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        divisi: '',
        no_item: '',
        item_preventif: '',
        periode_nilai: '',
        periode_satuan: '',
        tanggal_plan_awal: '',
        jumlah_dilakukan: 1,
    });

    // =========================
    // SUBMIT -> validasi, lalu tampilkan konfirmasi
    // =========================
    const submit = (e) => {
        e.preventDefault();

        if (!data.divisi) {
            setAlert('Divisi wajib diisi.');
            return;
        }

        if (!data.item_preventif.trim()) {
            setAlert('Item Preventif wajib diisi.');
            return;
        }

        if (
            data.jumlah_dilakukan === '' ||
            data.jumlah_dilakukan === null ||
            Number(data.jumlah_dilakukan) < 1
        ) {
            setAlert('Jumlah Dilakukan minimal 1.');
            return;
        }

        setAlert('');
        setConfirmSave(true);
    };

    // =========================
    // SIMPAN (setelah user klik "Ya, Simpan")
    // =========================
    const doSave = () => {
        post('/preventif-mesin', {
            preserveScroll: true,
            onFinish: () => setConfirmSave(false),
        });
    };

    // =========================
    // DIVISI
    // =========================
    const handleDivisiChange = (e) => {
        const divisi = e.target.value;

        setData({
            ...data,
            divisi,
            no_item: divisi ? nextNo[divisi] : '',
        });
    };

    return (
        <>
            <Head title="Tambah Preventif Mesin" />

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
                            href="/preventif-mesin"
                            title="Kembali"
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                        >
                            <Icon type="back" className="h-4 w-4" />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold tracking-tight text-white">
                                Tambah Preventif Mesin
                            </h1>

                            <p className="text-xs text-white/60">
                                Preventif Mesin / Tambah Data
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
                        {/* ALERT */}
                        {alert && (
                            <div
                                role="alert"
                                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                <Icon type="alert" className="mt-0.5 h-4 w-4 shrink-0" />

                                <p className="font-medium">{alert}</p>
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* DIVISI */}
                            <Field label="Divisi" required error={errors.divisi}>
                                <SelectWrap>
                                    <select
                                        value={data.divisi}
                                        onChange={handleDivisiChange}
                                        className={`${inputBase} appearance-none pr-10 font-medium`}
                                    >
                                        <option value="">Pilih Divisi</option>
                                        <option value="Sewing">Sewing</option>
                                        <option value="Headrest">Headrest</option>
                                        <option value="Utility">Utility</option>
                                        <option value="Saidan">Saidan</option>
                                    </select>
                                </SelectWrap>
                            </Field>

                            {/* NO ITEM */}
                            <Field label="No Item" badge="Otomatis" error={errors.no_item}>
                                <input
                                    type="text"
                                    value={data.no_item}
                                    readOnly
                                    placeholder="Otomatis"
                                    className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-bold text-blue-700 outline-none"
                                />
                            </Field>
                        </div>

                        {/* ITEM PREVENTIF */}
                        <Field
                            label="Item Preventif"
                            required
                            error={errors.item_preventif}
                        >
                            <textarea
                                value={data.item_preventif}
                                onChange={(e) =>
                                    setData('item_preventif', e.target.value)
                                }
                                rows="4"
                                placeholder="Contoh: Pemeriksaan kondisi belt, pelumasan bearing, pengecekan baut, dan sebagainya."
                                className={`${inputBase} resize-none leading-relaxed`}
                            />
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* PERIODE */}
                            <Field
                                label="Periode"
                                error={[errors.periode_nilai, errors.periode_satuan]}
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={data.periode_nilai}
                                        onChange={(e) =>
                                            setData('periode_nilai', e.target.value)
                                        }
                                        placeholder="Nilai"
                                        className={`${inputBase} w-1/2`}
                                    />

                                    <div className="relative w-1/2">
                                        <select
                                            value={data.periode_satuan}
                                            onChange={(e) =>
                                                setData('periode_satuan', e.target.value)
                                            }
                                            className={`${inputBase} appearance-none pr-9`}
                                        >
                                            <option value="">Satuan</option>
                                            <option value="hari">Hari</option>
                                            <option value="minggu">Minggu</option>
                                            <option value="bulan">Bulan</option>
                                            <option value="tahun">Tahun</option>
                                        </select>

                                        <Icon
                                            type="down"
                                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        />
                                    </div>
                                </div>
                            </Field>

                            {/* TANGGAL PLAN AWAL */}
                            <Field
                                label="Tanggal Plan Awal"
                                error={errors.tanggal_plan_awal}
                            >
                                <input
                                    type="date"
                                    value={data.tanggal_plan_awal}
                                    onChange={(e) =>
                                        setData('tanggal_plan_awal', e.target.value)
                                    }
                                    className={inputBase}
                                />
                            </Field>

                            {/* JUMLAH DILAKUKAN */}
                            <Field
                                label="Jumlah Dilakukan"
                                error={errors.jumlah_dilakukan}
                                hint="Jumlah hari berturut-turut dalam satu periode."
                            >
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={data.jumlah_dilakukan}
                                    onChange={(e) =>
                                        setData('jumlah_dilakukan', e.target.value)
                                    }
                                    placeholder="Contoh: 2"
                                    className={inputBase}
                                />
                            </Field>
                        </div>

                        {/* TOMBOL */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <Link
                                href="/preventif-mesin"
                                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-7 text-sm font-semibold text-white shadow-md shadow-blue-300/50 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                            © {new Date().getFullYear()} Emma Sarkilla · Schedule Preventif Mesin
                        </p>
                    </div>
                </footer>
            </div>

            {/* KONFIRMASI SIMPAN */}
            <ConfirmModal
                open={confirmSave}
                title="Simpan data?"
                message="Apakah kamu yakin ingin menyimpan data preventif ini?"
                confirmLabel="Ya, Simpan"
                tone="blue"
                loading={processing}
                onConfirm={doSave}
                onCancel={() => setConfirmSave(false)}
            />
        </>
    );
}
