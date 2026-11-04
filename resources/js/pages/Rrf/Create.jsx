import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ProduksiLayout from '../../Components/ProduksiLayout';

const MAKS_FOTO = 5;

const emptyPart = () => ({
    part_name: '',
    model_type: '',
    maker: '',
    qty: 1,
    other: '',
});

const inputCls =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const areaCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const cardCls =
    'rounded-2xl border border-white/40 bg-white/[0.93] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.18)] backdrop-blur-2xl';

function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            {children}

            {hint && (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {hint}
                </p>
            )}

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function SectionTitle({ children, description }) {
    return (
        <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                {children}
            </h2>

            {description && (
                <p className="mt-1 text-xs text-slate-400">{description}</p>
            )}
        </div>
    );
}

export default function Create({
    divisiDefault,
    saranDivisi = [],
    classes = [],
    saranLokasi = [],
    saranMesin = [],
    rrf = null,
}) {
    const edit = Boolean(rrf);

    const { data, setData, post, processing, errors } = useForm({
        ...(edit ? { _method: 'put', hapus_foto_ids: [] } : {}),
        divisi_pelapor: rrf?.divisi_pelapor ?? divisiDefault ?? '',
        lokasi: rrf?.lokasi ?? '',
        nama_mesin: rrf?.nama_mesin ?? '',
        rrf_class_id: rrf?.rrf_class_id ? String(rrf.rrf_class_id) : '',
        jenis_permintaan: rrf?.jenis_permintaan ?? 'troubleshooting',
        problem: rrf?.problem ?? '',
        request_activity: rrf?.request_activity ?? '',
        req_schedule_at: rrf?.req_schedule_at
            ? String(rrf.req_schedule_at).slice(0, 10)
            : '',
        parts: rrf?.parts?.length
            ? rrf.parts.map((p) => ({
                  part_name: p.part_name ?? '',
                  model_type: p.model_type ?? '',
                  maker: p.maker ?? '',
                  qty: p.qty ?? 1,
                  other: p.other ?? '',
              }))
            : [emptyPart(), emptyPart(), emptyPart()],
        fotos: [],
    });

    const kelasDipilih = classes.find(
        (c) => String(c.id) === String(data.rrf_class_id)
    );

    const fotoLama = rrf?.foto_before ?? [];
    const hapusIds = data.hapus_foto_ids ?? [];

    const fotoTersisa = fotoLama.filter(
        (f) => !hapusIds.includes(f.id)
    ).length;

    const slotFoto = Math.max(0, MAKS_FOTO - fotoTersisa);

    const toggleHapusFoto = (id) => {
        setData(
            'hapus_foto_ids',
            hapusIds.includes(id)
                ? hapusIds.filter((x) => x !== id)
                : [...hapusIds, id]
        );
    };

    const ubahPart = (index, field, value) => {
        setData(
            'parts',
            data.parts.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            )
        );
    };

    const tambahPart = () => {
        if (data.parts.length < 10) {
            setData('parts', [...data.parts, emptyPart()]);
        }
    };

    const hapusPart = (index) => {
        if (data.parts.length > 1) {
            setData(
                'parts',
                data.parts.filter((_, i) => i !== index)
            );
        }
    };

    const pilihFoto = (e) => {
        setData('fotos', Array.from(e.target.files).slice(0, slotFoto));
    };

    const submit = (e) => {
        e.preventDefault();

        const konfirmasi = window.confirm(
            edit
                ? 'Apakah kamu yakin ingin mengajukan ulang RRF ini?'
                : 'Apakah kamu yakin ingin mengajukan RRF ini?'
        );

        if (!konfirmasi) return;

        post(edit ? `/rrf/${rrf.id}` : '/rrf', {
            forceFormData: true,
        });
    };

    const errorLain = Object.entries(errors).filter(
        ([k]) =>
            k.startsWith('parts') ||
            k.startsWith('fotos') ||
            k === 'status'
    );

    return (
        <ProduksiLayout>
            <Head title={edit ? `Perbaiki ${rrf.rrf_no}` : 'Buat RRF'} />

            {/* HEADER HALAMAN */}
            <div className="mb-5">
                <Link
                    href={edit ? `/rrf/${rrf.id}` : '/rrf'}
                    className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-lg transition hover:bg-white/20"
                >
                    <span>←</span>
                    Kembali
                </Link>

                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600" />

                    <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                        {edit ? `Perbaiki RRF ${rrf.rrf_no}` : 'Buat RRF'}
                    </h1>
                </div>

                <p className="mt-1 pl-3 text-xs text-blue-100/70 sm:text-sm">
                    {edit
                        ? 'Perbaiki data sesuai catatan SPV, lalu ajukan ulang. Nomor RRF tidak berubah.'
                        : 'Lengkapi informasi permintaan perbaikan mesin. Nomor RRF dibuat otomatis setelah disimpan.'}
                </p>
            </div>

            {/* ALASAN PENOLAKAN */}
            {edit && rrf.penolakan && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/95 p-5 shadow-lg shadow-red-950/5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg font-bold text-red-700">
                            !
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-extrabold uppercase tracking-wide text-red-800">
                                Alasan penolakan
                            </p>

                            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-red-900">
                                {rrf.penolakan.catatan}
                            </p>

                            <p className="mt-2 text-xs text-red-700">
                                Oleh {rrf.penolakan.oleh ?? '-'} ·{' '}
                                {rrf.penolakan.waktu}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* IDENTITAS */}
                <section className={cardCls}>
                    <SectionTitle description="Informasi divisi dan mesin yang mengalami masalah.">
                        Identitas
                    </SectionTitle>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field
                            label="Division pelapor"
                            error={errors.divisi_pelapor}
                            hint="Terisi dari akun Anda, bisa diubah atau diketik sendiri. Antrean approval tetap mengikuti divisi akun."
                        >
                            <input
                                list="saran-divisi"
                                value={data.divisi_pelapor}
                                onChange={(e) =>
                                    setData('divisi_pelapor', e.target.value)
                                }
                                placeholder="Ketik divisi pelapor"
                                className={inputCls}
                            />

                            <datalist id="saran-divisi">
                                {saranDivisi.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </Field>

                        <Field
                            label="Location"
                            error={errors.lokasi}
                            hint="Contoh: Line Sewing HR. Saran muncul dari lokasi yang pernah diisi."
                        >
                            <input
                                list="saran-lokasi"
                                value={data.lokasi}
                                onChange={(e) =>
                                    setData('lokasi', e.target.value)
                                }
                                placeholder="Ketik lokasi / line"
                                className={inputCls}
                            />

                            <datalist id="saran-lokasi">
                                {saranLokasi.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </Field>

                        <div className="md:col-span-2">
                            <Field
                                label="Machine"
                                error={errors.nama_mesin}
                                hint="Contoh: Sewing HR No.9."
                            >
                                <input
                                    list="saran-mesin"
                                    value={data.nama_mesin}
                                    onChange={(e) =>
                                        setData('nama_mesin', e.target.value)
                                    }
                                    placeholder="Ketik nama mesin"
                                    className={inputCls}
                                />

                                <datalist id="saran-mesin">
                                    {saranMesin.map((s) => (
                                        <option key={s} value={s} />
                                    ))}
                                </datalist>
                            </Field>
                        </div>
                    </div>
                </section>

                {/* DATA PERMINTAAN */}
                <section className={cardCls}>
                    <SectionTitle description="Jelaskan jenis permintaan dan detail masalah yang terjadi.">
                        Data permintaan
                    </SectionTitle>

                    <div className="space-y-4">
                        <Field
                            label="Jenis permintaan"
                            error={errors.jenis_permintaan}
                        >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {[
                                    ['terencana', 'Perbaikan terencana'],
                                    [
                                        'troubleshooting',
                                        'Perbaikan troubleshooting',
                                    ],
                                ].map(([nilai, label]) => (
                                    <label
                                        key={nilai}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                            data.jenis_permintaan === nilai
                                                ? 'border-blue-400 bg-blue-50 text-blue-800 ring-2 ring-blue-500/10'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="jenis_permintaan"
                                            value={nilai}
                                            checked={
                                                data.jenis_permintaan === nilai
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'jenis_permintaan',
                                                    e.target.value
                                                )
                                            }
                                            className="h-4 w-4 accent-blue-600"
                                        />

                                        {label}
                                    </label>
                                ))}
                            </div>
                        </Field>

                        <Field
                            label="Class"
                            error={errors.rrf_class_id}
                            hint={
                                kelasDipilih
                                    ? `${kelasDipilih.nama}: ${kelasDipilih.deskripsi}`
                                    : 'Pilih class sesuai dampak masalah ke produksi.'
                            }
                        >
                            <select
                                value={data.rrf_class_id}
                                onChange={(e) =>
                                    setData('rrf_class_id', e.target.value)
                                }
                                className={inputCls}
                            >
                                <option value="">Pilih class</option>

                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.kode} - {c.nama}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="Req. schedule (opsional)"
                            error={errors.req_schedule_at}
                            hint="Isi jika Anda meminta perbaikan pada waktu tertentu."
                        >
                            <input
                                type="date"
                                value={data.req_schedule_at}
                                onChange={(e) => setData('req_schedule_at', e.target.value)}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="1. Problem" error={errors.problem}>
                            <textarea
                                rows={4}
                                value={data.problem}
                                onChange={(e) =>
                                    setData('problem', e.target.value)
                                }
                                placeholder="Jelaskan masalah yang terjadi, contoh: benang brudul"
                                className={areaCls}
                            />
                        </Field>

                        <Field
                            label="3. Request activity & counter measure (opsional)"
                            error={errors.request_activity}
                            hint="Tindakan yang Anda minta atau usulkan ke maintenance."
                        >
                            <textarea
                                rows={4}
                                value={data.request_activity}
                                onChange={(e) =>
                                    setData('request_activity', e.target.value)
                                }
                                placeholder="Tuliskan tindakan yang diharapkan..."
                                className={areaCls}
                            />
                        </Field>
                    </div>
                </section>

                {/* PART */}
                <section className={cardCls}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                                Part yang diminta
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Bagian ini opsional. Maksimal 10 baris part.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={tambahPart}
                            disabled={data.parts.length >= 10}
                            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="text-base">＋</span>
                            Tambah baris
                        </button>
                    </div>

                    <div className="space-y-3">
                        {data.parts.map((p, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500">
                                        PART {i + 1}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => hapusPart(i)}
                                        disabled={data.parts.length <= 1}
                                        aria-label="Hapus baris part"
                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Hapus
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                    <input
                                        placeholder="Part name"
                                        value={p.part_name}
                                        onChange={(e) =>
                                            ubahPart(
                                                i,
                                                'part_name',
                                                e.target.value
                                            )
                                        }
                                        className={`${inputCls} lg:col-span-2`}
                                    />

                                    <input
                                        placeholder="Model / type"
                                        value={p.model_type}
                                        onChange={(e) =>
                                            ubahPart(
                                                i,
                                                'model_type',
                                                e.target.value
                                            )
                                        }
                                        className={inputCls}
                                    />

                                    <input
                                        placeholder="Maker"
                                        value={p.maker}
                                        onChange={(e) =>
                                            ubahPart(i, 'maker', e.target.value)
                                        }
                                        className={inputCls}
                                    />

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={p.qty}
                                        onChange={(e) =>
                                            ubahPart(i, 'qty', e.target.value)
                                        }
                                        className={inputCls}
                                    />

                                    <div className="sm:col-span-2 lg:col-span-5">
                                        <input
                                            placeholder="Other"
                                            value={p.other}
                                            onChange={(e) =>
                                                ubahPart(
                                                    i,
                                                    'other',
                                                    e.target.value
                                                )
                                            }
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                        Baris yang Part name-nya kosong tidak disimpan.
                    </p>
                </section>

                {/* FOTO */}
                <section className={cardCls}>
                    <SectionTitle description="Lampirkan foto kondisi mesin atau bagian yang mengalami masalah.">
                        Foto before (opsional)
                    </SectionTitle>

                    {fotoLama.length > 0 && (
                        <div className="mb-5">
                            <p className="mb-3 text-xs text-slate-500">
                                Foto yang sudah ada. Klik Hapus untuk membuang,
                                atau klik kembali untuk membatalkan.
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {fotoLama.map((f) => {
                                    const dihapus = hapusIds.includes(f.id);

                                    return (
                                        <div
                                            key={f.id}
                                            className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2"
                                        >
                                            <img
                                                src={f.url}
                                                alt="Foto before"
                                                className={`h-32 w-full rounded-lg object-cover transition ${
                                                    dihapus
                                                        ? 'opacity-30'
                                                        : ''
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleHapusFoto(f.id)
                                                }
                                                className={`mt-2 w-full rounded-lg border px-2 py-2 text-xs font-bold transition ${
                                                    dihapus
                                                        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                        : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                            >
                                                {dihapus
                                                    ? 'Batalkan hapus'
                                                    : 'Hapus foto'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 transition hover:border-blue-300">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={slotFoto === 0}
                            onChange={pilihFoto}
                            className="block w-full cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <p className="mt-3 text-xs leading-relaxed text-slate-500">
                            {slotFoto === 0
                                ? `Sudah ${MAKS_FOTO} foto. Hapus salah satu foto lama jika ingin menambahkan foto baru.`
                                : `Maksimal ${MAKS_FOTO} foto per RRF (masing-masing 5 MB). Masih bisa menambahkan ${slotFoto} foto.`}
                        </p>
                    </div>

                    {data.fotos.length > 0 && (
                        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                            <p className="mb-2 text-xs font-bold text-blue-800">
                                Foto yang akan diunggah:
                            </p>

                            <ul className="space-y-1 text-xs text-slate-600">
                                {data.fotos.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-blue-600">●</span>
                                        {f.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* ERROR TAMBAHAN */}
                {errorLain.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700">
                        <p className="mb-2 font-bold">
                            Terdapat data yang perlu diperiksa:
                        </p>

                        {errorLain.map(([k, msg]) => (
                            <p key={k} className="mt-1">
                                • {msg}
                            </p>
                        ))}
                    </div>
                )}

                {/* TOMBOL AKSI */}
                <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg">
                    <Link
                        href={edit ? `/rrf/${rrf.id}` : '/rrf'}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
                    >
                        Batal
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:from-blue-600 hover:via-indigo-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing
                            ? 'Menyimpan...'
                            : edit
                              ? 'Ajukan ulang RRF'
                              : 'Ajukan RRF'}
                    </button>
                </div>
            </form>
        </ProduksiLayout>
    );
}