import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ProduksiLayout from '../../Components/ProduksiLayout';
import KonfirmasiDialog from '../../Components/KonfirmasiDialog';

const partKosong = () => ({
    part_name: '',
    model_type: '',
    maker: '',
    qty: 1,
    other: '',
});

const inputCls =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const areaCls =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const cardCls =
    'rounded-2xl border border-white/40 bg-white/[0.93] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.18)] backdrop-blur-2xl';

const judulCls = 'text-sm font-extrabold uppercase tracking-wide text-slate-700';

function Field({ label, error, hint, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {label}
            </label>
            {children}
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

export default function Create({
    rrf = null,
    divisiDefault,
    saranDivisi = [],
    classes = [],
    saranLokasi = [],
    saranMesin = [],
}) {
    const edit = Boolean(rrf);
    const menunggu = edit && rrf.status === 'diajukan'; // masih menunggu SPV
    const fotoLama = rrf?.foto_before ?? [];

    const [konfirmasi, setKonfirmasi] = useState(false);

    const awalParts = (rrf?.parts ?? []).map((p) => ({
        part_name: p.part_name ?? '',
        model_type: p.model_type ?? '',
        maker: p.maker ?? '',
        qty: p.qty ?? 1,
        other: p.other ?? '',
    }));
    while (awalParts.length < 3) awalParts.push(partKosong());

    const { data, setData, post, processing, errors } = useForm({
        _method: edit ? 'put' : 'post',
        rrf_no: '',
        divisi_pelapor: rrf?.divisi_pelapor ?? divisiDefault ?? '',
        lokasi: rrf?.lokasi ?? '',
        nama_mesin: rrf?.nama_mesin ?? '',
        rrf_class_id: rrf?.rrf_class_id ?? '',
        jenis_permintaan: rrf?.jenis_permintaan ?? 'troubleshooting',
        req_tanggal: rrf?.req_tanggal ?? '',
        req_jam: rrf?.req_jam ?? '',
        problem: rrf?.problem ?? '',
        request_activity: rrf?.request_activity ?? '',
        parts: awalParts,
        fotos: [],
        hapus_foto_ids: [],
    });

    const kelasDipilih = classes.find(
        (c) => String(c.id) === String(data.rrf_class_id)
    );

    const fotoTersisa = fotoLama.filter(
        (f) => !data.hapus_foto_ids.includes(f.id)
    ).length;
    const kuotaFoto = Math.max(0, 5 - fotoTersisa);

    /* teks yang menyesuaikan status */
    const judul = !edit
        ? 'Buat RRF'
        : menunggu
          ? `Edit ${rrf.rrf_no}`
          : `Perbaiki ${rrf.rrf_no}`;

    const keterangan = !edit
        ? 'Satu RRF untuk satu mesin. Nomor RRF dibuat otomatis setelah disimpan.'
        : menunggu
          ? 'RRF ini masih menunggu keputusan SPV, jadi datanya masih bisa diubah. Nomor RRF tidak berubah.'
          : 'Perbaiki data sesuai catatan SPV, lalu ajukan ulang.';

    const labelTombol = !edit
        ? 'Ajukan RRF'
        : menunggu
          ? 'Simpan perubahan'
          : 'Ajukan ulang RRF';

    /* part */
    const ubahPart = (i, field, nilai) =>
        setData(
            'parts',
            data.parts.map((p, idx) => (idx === i ? { ...p, [field]: nilai } : p))
        );

    const tambahPart = () => {
        if (data.parts.length < 10) setData('parts', [...data.parts, partKosong()]);
    };

    const hapusPart = (i) => {
        if (data.parts.length > 1) {
            setData('parts', data.parts.filter((_, idx) => idx !== i));
        }
    };

    /* foto */
    const tandaiHapusFoto = (id) => {
        setData(
            'hapus_foto_ids',
            data.hapus_foto_ids.includes(id)
                ? data.hapus_foto_ids.filter((x) => x !== id)
                : [...data.hapus_foto_ids, id]
        );
    };

    const pilihFoto = (e) => {
        setData('fotos', Array.from(e.target.files).slice(0, kuotaFoto));
    };

    /* kirim */
    const kirim = () => {
        post(edit ? `/rrf/${rrf.id}` : '/rrf', {
            forceFormData: true,
            onFinish: () => setKonfirmasi(false),
        });
    };

    const submit = (e) => {
        e.preventDefault();

        // Mode edit: minta konfirmasi dulu. Mode buat: langsung kirim.
        if (edit) {
            setKonfirmasi(true);
            return;
        }

        kirim();
    };

    const errorLain = Object.entries(errors).filter(
        ([k]) => k.startsWith('parts') || k.startsWith('fotos') || k === 'status'
    );

    return (
        <ProduksiLayout>
            <Head title={judul} />
            <Link
                href="/rrf"
                className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-lg transition hover:bg-white/20"
            >
                <span>←</span>
                Kembali ke daftar
            </Link>
            <div className="mb-5">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600" />
                    <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                        {judul}
                    </h1>
                </div>
                <p className="mt-1 pl-3 text-xs text-blue-100/70 sm:text-sm">
                    {keterangan}
                </p>
            </div>

            {edit && rrf.penolakan && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/95 p-5">
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-red-800">
                        Alasan penolakan
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm font-medium text-red-900">
                        {rrf.penolakan.catatan}
                    </p>
                    <p className="mt-2 text-xs text-red-700">
                        Oleh {rrf.penolakan.oleh ?? '-'} · {rrf.penolakan.waktu}
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* IDENTITAS */}
                <section className={`${cardCls} space-y-4`}>
                    <h2 className={judulCls}>Identitas</h2>
                    {!edit && (
                        <Field
                            label="No. RRF"
                            error={errors.rrf_no}
                            hint="Wajib diisi, contoh: RRF/HR/2026/0005. Nomor tidak boleh sama dengan RRF lain yang masih ada."
                        >
                            <input
                                value={data.rrf_no}
                                onChange={(e) => setData('rrf_no', e.target.value)}
                                placeholder="RRF/HR/2026/0005"
                                maxLength={100}
                                required
                                className={inputCls}
                            />
                        </Field>
                    )}
                    <Field
                        label="Division pelapor"
                        error={errors.divisi_pelapor}
                        hint="Terisi dari akun Anda, bisa diubah atau diketik sendiri. Antrean approval tetap mengikuti divisi akun."
                    >
                        <input
                            list="saran-divisi"
                            value={data.divisi_pelapor}
                            onChange={(e) => setData('divisi_pelapor', e.target.value)}
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
                        hint="Contoh: Line Sewing HR. Saran muncul dari yang pernah diisi."
                    >
                        <input
                            list="saran-lokasi"
                            value={data.lokasi}
                            onChange={(e) => setData('lokasi', e.target.value)}
                            placeholder="Ketik lokasi / line"
                            className={inputCls}
                        />
                        <datalist id="saran-lokasi">
                            {saranLokasi.map((s) => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </Field>

                    <Field
                        label="Machine"
                        error={errors.nama_mesin}
                        hint="Contoh: Sewing HR No.9. Pilih dari saran kalau mesinnya pernah diisi, supaya riwayat perbaikannya terhitung."
                    >
                        <input
                            list="saran-mesin"
                            value={data.nama_mesin}
                            onChange={(e) => setData('nama_mesin', e.target.value)}
                            placeholder="Ketik nama mesin"
                            className={inputCls}
                        />
                        <datalist id="saran-mesin">
                            {saranMesin.map((s) => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </Field>
                </section>

                {/* DATA PERMINTAAN */}
                <section className={`${cardCls} space-y-4`}>
                    <h2 className={judulCls}>Data permintaan</h2>

                    <Field label="Jenis permintaan" error={errors.jenis_permintaan}>
                        <div className="flex flex-wrap gap-3">
                            {[
                                ['terencana', 'Perbaikan terencana'],
                                ['troubleshooting', 'Perbaikan troubleshooting'],
                            ].map(([nilai, label]) => (
                                <label
                                    key={nilai}
                                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                                        data.jenis_permintaan === nilai
                                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                                            : 'border-slate-300 bg-white text-slate-700'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="jenis_permintaan"
                                        value={nilai}
                                        checked={data.jenis_permintaan === nilai}
                                        onChange={(e) =>
                                            setData('jenis_permintaan', e.target.value)
                                        }
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
                            onChange={(e) => setData('rrf_class_id', e.target.value)}
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

                    <div>
                        <p className="mb-1.5 text-sm font-semibold text-slate-700">
                            Req. schedule (opsional)
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Date" error={errors.req_tanggal}>
                                <input
                                    type="date"
                                    value={data.req_tanggal}
                                    onChange={(e) => setData('req_tanggal', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Time" error={errors.req_jam}>
                                <input
                                    type="time"
                                    value={data.req_jam}
                                    onChange={(e) => setData('req_jam', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Isi tanggal dan jam bersamaan kalau Anda meminta perbaikan pada
                            waktu tertentu.
                        </p>
                    </div>

                    <Field label="1. Problem" error={errors.problem}>
                        <textarea
                            rows={4}
                            value={data.problem}
                            onChange={(e) => setData('problem', e.target.value)}
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
                            onChange={(e) => setData('request_activity', e.target.value)}
                            className={areaCls}
                        />
                    </Field>
                </section>

                {/* PART */}
                <section className={cardCls}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className={judulCls}>Part yang diminta (opsional)</h2>
                        <button
                            type="button"
                            onClick={tambahPart}
                            disabled={data.parts.length >= 10}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Tambah baris
                        </button>
                    </div>

                    <div className="space-y-3">
                        {data.parts.map((p, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-6"
                            >
                                <input
                                    placeholder="Part name"
                                    value={p.part_name}
                                    onChange={(e) => ubahPart(i, 'part_name', e.target.value)}
                                    className={`${inputCls} col-span-2`}
                                />
                                <input
                                    placeholder="Model / type"
                                    value={p.model_type}
                                    onChange={(e) => ubahPart(i, 'model_type', e.target.value)}
                                    className={inputCls}
                                />
                                <input
                                    placeholder="Maker"
                                    value={p.maker}
                                    onChange={(e) => ubahPart(i, 'maker', e.target.value)}
                                    className={inputCls}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    value={p.qty}
                                    onChange={(e) => ubahPart(i, 'qty', e.target.value)}
                                    className={inputCls}
                                />
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Other"
                                        value={p.other}
                                        onChange={(e) => ubahPart(i, 'other', e.target.value)}
                                        className={inputCls}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => hapusPart(i)}
                                        disabled={data.parts.length <= 1}
                                        aria-label="Hapus baris part"
                                        className="h-11 shrink-0 rounded-xl border border-slate-300 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        Baris yang Part name-nya kosong tidak disimpan.
                    </p>
                </section>

                {/* FOTO */}
                <section className={cardCls}>
                    <h2 className={`${judulCls} mb-3`}>Foto before (opsional)</h2>

                    {edit && fotoLama.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {fotoLama.map((f) => {
                                const dihapus = data.hapus_foto_ids.includes(f.id);

                                return (
                                    <div
                                        key={f.id}
                                        className={`rounded-xl border p-2 ${
                                            dihapus
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        <img
                                            src={f.url}
                                            alt="Foto before"
                                            className={`h-28 w-full rounded-lg object-cover ${
                                                dihapus ? 'opacity-40' : ''
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => tandaiHapusFoto(f.id)}
                                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                        >
                                            {dihapus ? 'Batal hapus' : 'Hapus foto'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={kuotaFoto === 0}
                        onChange={pilihFoto}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-50"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        Maksimal 5 foto per RRF, masing-masing 5 MB.
                        {edit && ` Sisa kuota untuk foto baru: ${kuotaFoto}.`}
                    </p>

                    {data.fotos.length > 0 && (
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                            {data.fotos.map((f, i) => (
                                <li key={i}>{f.name}</li>
                            ))}
                        </ul>
                    )}
                </section>

                {errorLain.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorLain.map(([k, msg]) => (
                            <p key={k}>{msg}</p>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3">
                    <Link
                        href={edit ? `/rrf/${rrf.id}` : '/rrf'}
                        className="rounded-xl border border-white/30 bg-white/90 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-white"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan...' : labelTombol}
                    </button>
                </div>
            </form>

            {/* KONFIRMASI SIMPAN (mode edit) */}
            <KonfirmasiDialog
                open={konfirmasi}
                title={menunggu ? 'Simpan perubahan?' : 'Ajukan ulang RRF?'}
                message={
                    menunggu
                        ? `Apakah kamu yakin ingin menyimpan perubahan RRF ${rrf?.rrf_no}? RRF tetap menunggu keputusan SPV.`
                        : `Apakah kamu yakin ingin mengajukan ulang RRF ${rrf?.rrf_no} ke SPV?`
                }
                confirmLabel={menunggu ? 'Ya, Simpan' : 'Ya, Ajukan Ulang'}
                tone="blue"
                processing={processing}
                onCancel={() => setKonfirmasi(false)}
                onConfirm={kirim}
            />
        </ProduksiLayout>
    );
}