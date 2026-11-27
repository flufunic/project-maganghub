import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AppFooter,
    cardClass,
    CheckboxField,
    ConfigFields,
    ConfirmDialog,
    Field,
    FormStyles,
    Icon,
    inputBase,
    primaryButton,
    secondaryButton,
} from '@/Components/CheckSheetFormParts';

const BACK_URL = '/master/divisi';

export default function Create({ divisis = [], lines = [], line = null }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        divisi_id: line?.divisi_id ?? '',
        line_ids: line ? [line.id] : [],
        nomor_dokumen: '',
        nama_checksheet: '',
        pakai_actual: false,
        pakai_plan_act: false,
        pakai_monitoring: false,
        pakai_bbm: false,
        bbm_kali_60: false,
        pakai_pelumasan: false,
    });

    const lineTersedia = useMemo(
        () => lines.filter((l) => Number(l.divisi_id) === Number(data.divisi_id)),
        [lines, data.divisi_id]
    );

    const gantiDivisi = (value) =>
        setData({ ...data, divisi_id: value, line_ids: [] });

    const toggleLine = (id) =>
        setData(
            'line_ids',
            data.line_ids.includes(id)
                ? data.line_ids.filter((x) => x !== id)
                : [...data.line_ids, id]
        );

    const semuaTerpilih =
        lineTersedia.length > 0 && lineTersedia.every((l) => data.line_ids.includes(l.id));

    const toggleSemua = () =>
        setData('line_ids', semuaTerpilih ? [] : lineTersedia.map((l) => l.id));

    const submit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const konfirmasiSimpan = () => {
        post('/check-sheets', {
            onError: () => setShowConfirm(false),
            onFinish: () => setShowConfirm(false),
        });
    };

    return (
        <>
            <Head title="Tambah Check Sheet" />
            <FormStyles />

            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[100px]" />
                    <div className="absolute -bottom-48 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-200/30 blur-[100px]" />
                </div>

                <header className="relative z-10 border-b border-white/10 bg-[#071735] shadow-lg shadow-slate-950/10">
                    <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <Link
                            href={BACK_URL}
                            title="Kembali"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                        >
                            <Icon type="back" className="h-5 w-5" />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold tracking-wide text-white sm:text-base">
                                Tambah Check Sheet
                            </h1>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200 sm:text-xs">
                                {line
                                    ? `${line.divisi?.nama_divisi ?? 'Divisi'} / ${line.nama_line}`
                                    : 'Master Data / Tambah Check Sheet'}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="page-enter">
                        <div className="mb-6">
                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                Buat Check Sheet Baru
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                                Setiap line / mesin punya check sheet sendiri. Centang beberapa line
                                sekaligus untuk membuat check sheet yang sama di tiap line.
                            </p>
                        </div>

                        <form onSubmit={submit} className={`${cardClass} overflow-hidden`}>
                            <div className="border-b border-slate-100 px-5 py-6 sm:px-8 lg:px-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon type="file" className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Informasi Dokumen</h3>
                                        <p className="mt-0.5 text-[11px] text-slate-400">Identitas utama check sheet</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                                    <Field label="Divisi" error={errors.divisi_id}>
                                        <div className="relative">
                                            <select
                                                value={data.divisi_id}
                                                onChange={(e) => gantiDivisi(e.target.value)}
                                                disabled={!!line}
                                                className={`${inputBase} appearance-none pr-10`}
                                            >
                                                <option value="">Pilih Divisi</option>
                                                {divisis.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.nama_divisi}
                                                    </option>
                                                ))}
                                            </select>
                                            <Icon
                                                type="down"
                                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                            />
                                        </div>
                                    </Field>

                                    <div className="hidden md:block" />

                                    <Field label="Nomor Dokumen" error={errors.nomor_dokumen}>
                                        <input
                                            type="text"
                                            value={data.nomor_dokumen}
                                            onChange={(e) => setData('nomor_dokumen', e.target.value)}
                                            placeholder="Contoh: CS-001"
                                            className={inputBase}
                                        />
                                    </Field>

                                    <Field label="Nama Check Sheet" error={errors.nama_checksheet}>
                                        <input
                                            type="text"
                                            value={data.nama_checksheet}
                                            onChange={(e) => setData('nama_checksheet', e.target.value)}
                                            placeholder="Contoh: Check Sheet Preventif Mesin"
                                            className={inputBase}
                                        />
                                    </Field>
                                </div>

                                {/* PILIH LINE (boleh banyak) */}
                                <div className="mt-6">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-bold tracking-wide text-slate-700">
                                            Line / Mesin <span className="text-red-500">*</span>
                                            {data.line_ids.length > 0 && (
                                                <span className="ml-2 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                                    {data.line_ids.length} dipilih
                                                </span>
                                            )}
                                        </label>

                                        {lineTersedia.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={toggleSemua}
                                                className="cursor-pointer text-[11px] font-bold text-blue-600 hover:text-blue-800"
                                            >
                                                {semuaTerpilih ? 'Batal pilih semua' : 'Pilih semua'}
                                            </button>
                                        )}
                                    </div>

                                    {!data.divisi_id ? (
                                        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
                                            Pilih divisi dulu untuk menampilkan daftar line.
                                        </p>
                                    ) : lineTersedia.length === 0 ? (
                                        <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-5 text-center text-xs text-amber-700">
                                            Divisi ini belum punya line. Tambahkan line di Master Data.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {lineTersedia.map((l) => {
                                                const aktif = data.line_ids.includes(l.id);

                                                return (
                                                    <label
                                                        key={l.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-semibold transition ${
                                                            aktif
                                                                ? 'border-blue-300 bg-blue-50/70 text-blue-800'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={aktif}
                                                            onChange={() => toggleLine(l.id)}
                                                            className="h-4 w-4 cursor-pointer accent-blue-600"
                                                        />
                                                        <span className="min-w-0">
                                                            <span className="block truncate">{l.nama_line}</span>
                                                            <span className="block font-mono text-[10px] font-normal text-slate-400">
                                                                {l.kode}
                                                            </span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {errors.line_ids && (
                                        <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.line_ids}</p>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-6 sm:px-8 lg:px-10">
                                <div className="mb-5 flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Icon type="settings" className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Konfigurasi Check Sheet</h3>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Pilih fitur tambahan sesuai kebutuhan
                                        </p>
                                    </div>
                                </div>

                                <ConfigFields data={data} setData={setData} errors={errors} />
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                                <p className="text-[10px] text-slate-400">
                                    <span className="text-red-500">*</span> Wajib diisi
                                </p>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <Link href={BACK_URL} className={secondaryButton}>
                                        Batal
                                    </Link>

                                    <button type="submit" disabled={processing} className={primaryButton}>
                                        <Icon type="save" className="h-4 w-4" />
                                        Simpan Check Sheet
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>

                <AppFooter />
            </div>

            <ConfirmDialog
                open={showConfirm}
                title="Simpan Check Sheet?"
                message={`Akan dibuat ${data.line_ids.length} check sheet (1 untuk tiap line yang dipilih). Lanjutkan?`}
                confirmLabel="Ya, Simpan"
                processing={processing}
                onCancel={() => setShowConfirm(false)}
                onConfirm={konfirmasiSimpan}
            />
        </>
    );
}