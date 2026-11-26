import React, { useMemo } from 'react';
import { useForm } from '@inertiajs/react';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

function Field({ label, error, children, className = '' }) {
    return (
        <label className={`flex flex-col gap-1.5 ${className}`}>
            <span className="text-xs font-semibold text-slate-600">{label}</span>
            {children}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </label>
    );
}

/**
 * Dipakai untuk Tambah (checksheet = null) dan Edit.
 * Nama equipment tidak diinput: otomatis mengikuti item Schedule Preventif yang dihubungkan.
 */
export default function PreventifChecksheetFormModal({
    checksheet = null,
    divisis = [],
    preventifOptions = [],
    defaultDivisi = '',
    onClose,
}) {
    const edit = Boolean(checksheet);

    const form = useForm({
        divisi: checksheet?.divisi ?? (defaultDivisi && defaultDivisi !== 'all' ? defaultDivisi : divisis[0] ?? ''),
        preventif_mesin_id: checksheet?.preventif_mesin_id ?? '',
        nomor_dokumen: checksheet?.nomor_dokumen ?? '',
    });

    const { data, setData, errors, processing } = form;

    const itemDivisi = useMemo(
        () => preventifOptions.filter((p) => p.divisi === data.divisi),
        [preventifOptions, data.divisi]
    );

    const terpilih = useMemo(
        () => preventifOptions.find((p) => String(p.no) === String(data.preventif_mesin_id)),
        [preventifOptions, data.preventif_mesin_id]
    );

    const submit = (e) => {
        e.preventDefault();

        const opsi = {
            preserveScroll: true,
            onSuccess: () => onClose(),
        };

        if (edit) {
            form.put(`/checksheet-preventif/${checksheet.id}`, opsi);
        } else {
            form.post('/checksheet-preventif', opsi);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
            <form
                onSubmit={submit}
                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30"
            >
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {edit ? 'Edit Checksheet Preventif' : 'Tambah Checksheet Preventif'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Pilih item Schedule Preventif, nama equipment terisi otomatis.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <Field label="Divisi" error={errors.divisi}>
                        <select
                            value={data.divisi}
                            onChange={(e) =>
                                setData((d) => ({ ...d, divisi: e.target.value, preventif_mesin_id: '' }))
                            }
                            className={inputClass}
                        >
                            {divisis.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Terhubung ke item Schedule Preventif" error={errors.preventif_mesin_id}>
                        <select
                            value={data.preventif_mesin_id ?? ''}
                            onChange={(e) => setData('preventif_mesin_id', e.target.value)}
                            className={inputClass}
                            required
                        >
                            <option value="">— Pilih item —</option>
                            {itemDivisi.map((p) => (
                                <option key={p.no} value={p.no}>
                                    {p.no_item}. {p.item_preventif}
                                </option>
                            ))}
                        </select>
                        <span className="text-[11px] text-slate-400">
                            Wajib dihubungkan agar notifikasi abnormality di Schedule Preventif bisa
                            dibuka di sini, dan ACT otomatis tercentang saat abnormality Closed.
                        </span>
                    </Field>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Nama Equipment</span>
                        <div
                            className={`min-h-[42px] rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm ${
                                terpilih ? 'font-semibold text-slate-800' : 'text-slate-400'
                            }`}
                        >
                            {terpilih?.item_preventif ?? 'Otomatis dari item yang dipilih'}
                        </div>
                    </div>

                    <Field label="No. Dokumen" error={errors.nomor_dokumen}>
                        <input
                            value={data.nomor_dokumen}
                            onChange={(e) => setData('nomor_dokumen', e.target.value)}
                            placeholder="Opsional"
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing || !data.preventif_mesin_id}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}