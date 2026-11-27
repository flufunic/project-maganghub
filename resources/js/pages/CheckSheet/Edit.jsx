import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AppFooter,
    cardClass,
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

export default function Edit({ checkSheet, line = null, divisi = null }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        nomor_dokumen: checkSheet.nomor_dokumen ?? '',
        nama_checksheet: checkSheet.nama_checksheet ?? '',
        pakai_actual: Boolean(checkSheet.pakai_actual),
        pakai_plan_act: Boolean(checkSheet.pakai_plan_act),
        pakai_monitoring: Boolean(checkSheet.pakai_monitoring),
        pakai_bbm: Boolean(checkSheet.pakai_bbm),
        bbm_kali_60: Boolean(checkSheet.bbm_kali_60),
        pakai_pelumasan: Boolean(checkSheet.pakai_pelumasan),
    });

    const submit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const konfirmasiEdit = () => {
        put(`/check-sheets/${checkSheet.id}`, {
            onError: () => setShowConfirm(false),
            onFinish: () => setShowConfirm(false),
        });
    };

    const readOnly = `${inputBase} cursor-not-allowed`;

    return (
        <>
            <Head title="Edit Check Sheet" />
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
                                Edit Check Sheet
                            </h1>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-blue-200 sm:text-xs">
                                {divisi?.nama_divisi ?? 'Divisi'} / {line?.nama_line ?? 'Line'}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="page-enter">
                        <div className="mb-6">
                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                                Edit Check Sheet
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                                Perbarui dokumen dan fitur check sheet ini. Divisi dan line tidak bisa diubah.
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
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Perbarui identitas utama check sheet
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                                    <Field label="Divisi" required={false}>
                                        <input value={divisi?.nama_divisi ?? '-'} readOnly className={readOnly} />
                                    </Field>

                                    <Field label="Line / Mesin" required={false}>
                                        <input value={line?.nama_line ?? '-'} readOnly className={readOnly} />
                                    </Field>

                                    <Field label="Nomor Dokumen" error={errors.nomor_dokumen}>
                                        <input
                                            type="text"
                                            value={data.nomor_dokumen}
                                            onChange={(e) => setData('nomor_dokumen', e.target.value)}
                                            className={inputBase}
                                        />
                                    </Field>

                                    <Field label="Nama Check Sheet" error={errors.nama_checksheet}>
                                        <input
                                            type="text"
                                            value={data.nama_checksheet}
                                            onChange={(e) => setData('nama_checksheet', e.target.value)}
                                            className={inputBase}
                                        />
                                    </Field>
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
                                            Data lama tidak terhapus jika sebuah fitur dimatikan
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
                                        <Icon type="edit" className="h-4 w-4" />
                                        Simpan Perubahan
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
                title="Simpan perubahan?"
                subtitle="Konfirmasi perubahan data"
                message="Apakah kamu yakin ingin menyimpan perubahan check sheet ini?"
                confirmLabel="Ya, Simpan"
                processing={processing}
                onCancel={() => setShowConfirm(false)}
                onConfirm={konfirmasiEdit}
            />
        </>
    );
}