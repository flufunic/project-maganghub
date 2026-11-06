import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ProduksiLayout, { StatusBadge } from '../../Components/ProduksiLayout';
import RrfDetail from '../../Components/RrfDetail';

const inputCls =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const areaCls =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const lokal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString();
};

const hariIni = () => lokal().slice(0, 10);
const jamSekarang = () => lokal().slice(11, 16);

const fmtDurasi = (detik) => {
    if (detik == null) return '-';
    if (detik <= 0) return '0 menit';

    const j = Math.floor(detik / 3600);
    const m = Math.floor((detik % 3600) / 60);
    const s = detik % 60;

    return [j && `${j} jam`, m && `${m} menit`, s && `${s} detik`]
        .filter(Boolean)
        .join(' ');
};

/** Down time = jam stop line - serv. schedule. Kalau lebih awal, dihitung hari berikutnya. */
const hitungPreview = (servTanggal, servJam, stopJam, pembagi) => {
    if (!servTanggal || !servJam || !stopJam) return null;

    const serv = new Date(`${servTanggal}T${servJam}:00`);
    let stop = new Date(`${servTanggal}T${stopJam}:00`);

    if (Number.isNaN(serv.getTime()) || Number.isNaN(stop.getTime())) {
        return null;
    }

    let lewat = false;

    if (stop < serv) {
        stop = new Date(stop.getTime() + 24 * 60 * 60 * 1000);
        lewat = true;
    }

    const detik = Math.round((stop.getTime() - serv.getTime()) / 1000);

    return {
        detik,
        lewat,
        repair: Math.round(detik / Math.max(1, pembagi)),
    };
};

function Field({ label, error, hint, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            {children}

            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}

            {error && (
                <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}

function Panel({ judul, catatan, tone = 'blue', children }) {
    const { errors } = usePage().props;

    const warna =
        tone === 'amber'
            ? 'border-amber-200 bg-amber-50/95'
            : 'border-blue-200 bg-blue-50/95';

    const garis = tone === 'amber' ? 'border-amber-200' : 'border-blue-200';
    const judulWarna = tone === 'amber' ? 'text-amber-900' : 'text-blue-900';
    const catatanWarna = tone === 'amber' ? 'text-amber-800' : 'text-blue-800';

    return (
        <section
            className={`overflow-hidden rounded-2xl border shadow-lg shadow-blue-950/5 ${warna}`}
        >
            <div className={`border-b px-5 py-4 ${garis}`}>
                <h2
                    className={`text-sm font-extrabold uppercase tracking-wide ${judulWarna}`}
                >
                    {judul}
                </h2>

                {catatan && (
                    <p className={`mt-1 text-xs leading-relaxed ${catatanWarna}`}>
                        {catatan}
                    </p>
                )}

                {errors.aksi && (
                    <p className="mt-2 text-sm font-medium text-red-700">
                        {errors.aksi}
                    </p>
                )}
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
}

function Info({ children }) {
    return (
        <div className="rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm font-medium text-slate-600">
            {children}
        </div>
    );
}

/* ---------- RRF dikembalikan Pimpinan: alasan tampil di atas form ---------- */
function DikembalikanInfo({ info }) {
    return (
        <section className="rounded-2xl border-2 border-red-300 bg-red-50/95 p-5 shadow-lg shadow-red-950/5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-red-800">
                Dikembalikan oleh Pimpinan
            </h2>

            <p className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed text-red-900">
                {info.catatan || 'Tidak ada catatan.'}
            </p>

            <p className="mt-2 text-xs text-red-700">
                Oleh {info.oleh ?? '-'} · {info.waktu ?? '-'}. Perbaiki data penanganan
                di bawah, lalu kirim ulang ke Pimpinan.
            </p>
        </section>
    );
}

/* ---------- disetujui: terima atau tolak ---------- */
function KeputusanPanel({ rrf }) {
    const terima = useForm({});
    const tolak = useForm({ catatan: '' });
    const [konfirmasi, setKonfirmasi] = useState(null);

    const bisaTolak = tolak.data.catatan.trim().length >= 5;
    const proses = terima.processing || tolak.processing;

    const kirim = () => {
        if (konfirmasi === 'terima') {
            terima.post(`/mtc/rrf/${rrf.id}/terima`, {
                preserveScroll: true,
                onError: () => setKonfirmasi(null),
            });
        } else {
            tolak.post(`/mtc/rrf/${rrf.id}/tolak`, {
                preserveScroll: true,
                onError: () => setKonfirmasi(null),
            });
        }
    };

    return (
        <Panel
            tone="amber"
            judul="Menunggu keputusan Maintenance"
            catatan="Periksa data permintaan di atas. Kalau diterima, Anda melengkapi data penanganan di langkah berikutnya. Kalau ditolak, RRF dikembalikan ke produksi beserta alasannya."
        >
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Alasan penolakan{' '}
                <span className="font-normal text-slate-500">
                    (wajib diisi kalau menolak)
                </span>
            </label>

            <textarea
                rows={3}
                value={tolak.data.catatan}
                onChange={(e) => tolak.setData('catatan', e.target.value)}
                placeholder="Contoh: Foto kurang jelas, mohon sertakan foto bagian mesin yang bermasalah."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {tolak.errors.catatan && (
                <p className="mt-1 text-xs font-medium text-red-600">
                    {tolak.errors.catatan}
                </p>
            )}

            {konfirmasi === null ? (
                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setKonfirmasi('terima')}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        ✓ Terima RRF
                    </button>

                    <button
                        type="button"
                        onClick={() => setKonfirmasi('tolak')}
                        disabled={!bisaTolak}
                        title={
                            bisaTolak
                                ? ''
                                : 'Isi alasan penolakan minimal 5 karakter.'
                        }
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ✕ Tolak RRF
                    </button>
                </div>
            ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-slate-800">
                        {konfirmasi === 'terima'
                            ? 'Yakin menerima RRF ini?'
                            : 'Yakin menolak RRF ini?'}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {konfirmasi === 'terima'
                            ? 'Status berubah menjadi Diterima MTC, lalu Anda mengisi data penanganan.'
                            : 'RRF dikembalikan ke produksi dan keluar dari daftar Maintenance.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={proses}
                            onClick={kirim}
                            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                konfirmasi === 'terima'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {proses ? 'Memproses...' : 'Ya, lanjutkan'}
                        </button>

                        <button
                            type="button"
                            disabled={proses}
                            onClick={() => setKonfirmasi(null)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </Panel>
    );
}

/* ---------- form penanganan Admin ----------
   mode "mulai": status diterima, tombol "Simpan & mulai perbaikan"
   mode "ubah" : status dikerjakan, bisa disimpan berkali-kali, lalu dikirim ke Pimpinan */
const barisPart = (p) => ({
    part_name: p?.part_name ?? '',
    model_type: p?.model_type ?? '',
    maker: p?.maker ?? '',
    qty: p?.qty ?? 1,
    other: p?.other ?? '',
});

function PenangananForm({ rrf, penanganan, shiftOptions, pembagi, mode }) {
    const ubah = mode === 'ubah';

    const awalParts = (penanganan.parts ?? []).map(barisPart);

    while (awalParts.length < 3) {
        awalParts.push(barisPart());
    }

    const { data, setData, post, transform, processing, errors } = useForm({
        pic_nama: penanganan.pic_nama ?? '',
        shift_kerja: penanganan.shift_kerja ?? '',
        serv_tanggal: penanganan.serv_tanggal || hariIni(),
        serv_jam: penanganan.serv_jam || jamSekarang(),
        stop_line_jam: penanganan.stop_line_jam ?? '',
        cause: penanganan.cause ?? '',
        counter_measure: penanganan.counter_measure ?? '',
        remark: penanganan.remark ?? '',
        parts: awalParts,
        fotos: [],
        hapus_foto_ids: [],
        kirim_catatan: '',
    });

    const [konfirmasi, setKonfirmasi] = useState(false);

    const fotoLama = penanganan.foto_after ?? [];
    const fotoTersisa = fotoLama.filter(
        (f) => !data.hapus_foto_ids.includes(f.id)
    ).length;
    const kuota = Math.max(0, 5 - fotoTersisa);

    const preview = ubah
        ? hitungPreview(
              data.serv_tanggal,
              data.serv_jam,
              data.stop_line_jam,
              pembagi
          )
        : null;

    const ubahPart = (i, field, value) => {
        setData(
            'parts',
            data.parts.map((p, idx) =>
                idx === i ? { ...p, [field]: value } : p
            )
        );
    };

    const tambahPart = () => {
        if (data.parts.length < 10) {
            setData('parts', [...data.parts, barisPart()]);
        }
    };

    const hapusPart = (i) => {
        if (data.parts.length > 1) {
            setData(
                'parts',
                data.parts.filter((_, idx) => idx !== i)
            );
        }
    };

    const tandaiHapusFoto = (id) => {
        setData(
            'hapus_foto_ids',
            data.hapus_foto_ids.includes(id)
                ? data.hapus_foto_ids.filter((x) => x !== id)
                : [...data.hapus_foto_ids, id]
        );
    };

    const url =
        mode === 'mulai'
            ? `/mtc/rrf/${rrf.id}/mulai`
            : `/mtc/rrf/${rrf.id}/penanganan`;

    const kirimForm = (kirim) => {
        transform((d) => ({ ...d, kirim }));

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setKonfirmasi(false),
        });
    };

    const submit = (e) => {
        e.preventDefault();
        kirimForm(false);
    };

    const errorLain = Object.entries(errors).filter(
        ([k]) =>
            k.startsWith('parts') ||
            k.startsWith('fotos') ||
            k.startsWith('hapus_foto')
    );

    return (
        <Panel
            judul="Data penanganan Maintenance"
            catatan={
                ubah
                    ? 'Data bisa diubah kapan saja selama RRF masih dikerjakan. Klik "Simpan perubahan" untuk menyimpan, lalu "Simpan & kirim ke Pimpinan" kalau perbaikan sudah selesai.'
                    : 'Lengkapi PIC MTC, shift, jadwal servis, cause, dan lainnya. Setelah disimpan, status berubah menjadi Sedang dikerjakan.'
            }
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="PIC MTC" error={errors.pic_nama}>
                        <input
                            value={data.pic_nama}
                            onChange={(e) => setData('pic_nama', e.target.value)}
                            placeholder="Nama teknisi yang menangani"
                            className={inputCls}
                        />
                    </Field>

                    <Field label="Shift" error={errors.shift_kerja}>
                        <select
                            value={data.shift_kerja}
                            onChange={(e) => setData('shift_kerja', e.target.value)}
                            className={inputCls}
                        >
                            <option value="">Pilih shift</option>
                            {shiftOptions.map((o) => (
                                <option key={o} value={o}>
                                    {o}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Serv. schedule: Date" error={errors.serv_tanggal}>
                        <input
                            type="date"
                            value={data.serv_tanggal}
                            onChange={(e) => setData('serv_tanggal', e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    <Field
                        label="Serv. schedule: Time"
                        error={errors.serv_jam}
                        hint="Jam ini dipakai untuk menghitung down time."
                    >
                        <input
                            type="time"
                            value={data.serv_jam}
                            onChange={(e) => setData('serv_jam', e.target.value)}
                            className={inputCls}
                        />
                    </Field>
                </div>

                {ubah && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field
                            label="Stop line (jam)"
                            error={errors.stop_line_jam}
                            hint="Wajib diisi sebelum dikirim ke Pimpinan. Contoh: 12:00"
                        >
                            <input
                                type="time"
                                value={data.stop_line_jam}
                                onChange={(e) => setData('stop_line_jam', e.target.value)}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Down time (otomatis)">
                            <input
                                readOnly
                                value={preview ? fmtDurasi(preview.detik) : '-'}
                                className={`${inputCls} bg-slate-100 text-slate-600`}
                            />
                        </Field>

                        <Field label={`Time repair (÷ ${pembagi})`}>
                            <input
                                readOnly
                                value={preview ? fmtDurasi(preview.repair) : '-'}
                                className={`${inputCls} bg-slate-100 text-slate-600`}
                            />
                        </Field>
                    </div>
                )}

                {preview?.lewat && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                        Jam stop line lebih awal dari serv. schedule, jadi dihitung
                        melewati tengah malam (hari berikutnya). Periksa lagi kalau ini
                        salah ketik.
                    </p>
                )}

                <Field label="2. Cause (penyebab)" error={errors.cause}>
                    <textarea
                        rows={3}
                        value={data.cause}
                        onChange={(e) => setData('cause', e.target.value)}
                        className={areaCls}
                    />
                </Field>

                <Field
                    label="3. Request activity & counter measure"
                    error={errors.counter_measure}
                    hint="Terisi dari permintaan produksi, silakan ubah atau tambahkan tindakan yang dilakukan."
                >
                    <textarea
                        rows={3}
                        value={data.counter_measure}
                        onChange={(e) => setData('counter_measure', e.target.value)}
                        className={areaCls}
                    />
                </Field>

                <Field label="4. Remark (opsional)" error={errors.remark}>
                    <textarea
                        rows={2}
                        value={data.remark}
                        onChange={(e) => setData('remark', e.target.value)}
                        className={areaCls}
                    />
                </Field>

                <div className="rounded-xl border border-blue-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-700">
                            Part yang dipakai (koreksi kalau berbeda dari permintaan)
                        </p>

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
                            <div key={i} className="grid grid-cols-2 gap-2 md:grid-cols-6">
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
                </div>

                {/* FOTO AFTER */}
                <div>
                    <p className="mb-1.5 text-sm font-semibold text-slate-700">
                        5. Picture / foto after (jika terjadi perubahan)
                    </p>

                    {fotoLama.length > 0 && (
                        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
                                            alt="Foto after"
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
                        disabled={kuota === 0}
                        onChange={(e) =>
                            setData('fotos', Array.from(e.target.files).slice(0, kuota))
                        }
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-50"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                        Maksimal 5 foto per RRF, masing-masing 5 MB. Sisa kuota untuk
                        foto baru: {kuota}.
                    </p>

                    {data.fotos.length > 0 && (
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                            {data.fotos.map((f, i) => (
                                <li key={i}>{f.name}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {errorLain.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorLain.map(([k, msg]) => (
                            <p key={k}>{msg}</p>
                        ))}
                    </div>
                )}

                {/* TOMBOL */}
                {!ubah ? (
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan & mulai perbaikan'}
                    </button>
                ) : (
                    <div className="border-t border-blue-200 pt-4">
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl border border-blue-300 bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60"
                            >
                                {processing && !konfirmasi
                                    ? 'Menyimpan...'
                                    : 'Simpan perubahan'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setKonfirmasi(true)}
                                disabled={processing || !data.stop_line_jam}
                                title={
                                    data.stop_line_jam
                                        ? ''
                                        : 'Isi jam stop line dulu sebelum mengirim ke Pimpinan.'
                                }
                                className="rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Simpan &amp; kirim ke Pimpinan
                            </button>
                        </div>

                        {konfirmasi && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-sm font-bold text-slate-800">
                                    Yakin menyimpan dan mengirim RRF ini ke Pimpinan?
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Status berubah menjadi Selesai, menunggu verifikasi.
                                    Setelah dikirim, data tidak bisa diubah kecuali
                                    dikembalikan oleh Pimpinan.
                                </p>

                                <label className="mb-1.5 mt-3 block text-sm font-semibold text-slate-700">
                                    Catatan untuk Pimpinan{' '}
                                    <span className="font-normal text-slate-500">
                                        (opsional)
                                    </span>
                                </label>

                                <textarea
                                    rows={2}
                                    value={data.kirim_catatan}
                                    onChange={(e) =>
                                        setData('kirim_catatan', e.target.value)
                                    }
                                    placeholder="Contoh: Mesin sudah normal, sudah diuji produksi 30 menit."
                                    className={areaCls}
                                />

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => kirimForm(true)}
                                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? 'Mengirim...' : 'Ya, simpan & kirim'}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => setKonfirmasi(false)}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </Panel>
    );
}

/* ---------- selesai: Pimpinan memverifikasi ---------- */
function VerifikasiPanel({ rrf, verifikasi }) {
    const { data, setData, post, processing, errors } = useForm({ catatan: '' });
    const [konfirmasi, setKonfirmasi] = useState(null); // 'close' | 'kembalikan' | null

    const bisaKembalikan = data.catatan.trim().length >= 5;

    const kirim = () => {
        post(`/mtc/rrf/${rrf.id}/${konfirmasi}`, {
            preserveScroll: true,
            onFinish: () => setKonfirmasi(null),
        });
    };

    const ringkas = [
        ['Down time', rrf.downtime],
        ['Time repair', rrf.time_repair],
        ['PIC MTC', rrf.pic],
        ['Shift', rrf.shift],
    ];

    return (
        <Panel
            tone="amber"
            judul="Menunggu verifikasi Anda"
            catatan={`Dikirim oleh ${verifikasi.dikirim_oleh ?? 'Maintenance'} pada ${verifikasi.dikirim_pada ?? '-'}. Periksa bagian Penanganan maintenance dan foto after di bawah sebelum memutuskan.`}
        >
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ringkas.map(([label, nilai]) => (
                    <div
                        key={label}
                        className="rounded-xl border border-amber-200 bg-white px-3 py-2"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {label}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {nilai || '-'}
                        </p>
                    </div>
                ))}
            </div>

            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Catatan{' '}
                <span className="font-normal text-slate-500">
                    (wajib diisi kalau mengembalikan ke Maintenance)
                </span>
            </label>

            <textarea
                rows={3}
                value={data.catatan}
                onChange={(e) => setData('catatan', e.target.value)}
                placeholder="Contoh: Foto after belum menunjukkan bagian yang diganti, mohon dilengkapi."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.catatan && (
                <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.catatan}
                </p>
            )}

            {konfirmasi === null ? (
                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setKonfirmasi('close')}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        ✓ Verifikasi &amp; Close
                    </button>

                    <button
                        type="button"
                        onClick={() => setKonfirmasi('kembalikan')}
                        disabled={!bisaKembalikan}
                        title={
                            bisaKembalikan
                                ? ''
                                : 'Isi alasan minimal 5 karakter untuk mengembalikan.'
                        }
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ↩ Kembalikan ke Maintenance
                    </button>
                </div>
            ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-slate-800">
                        {konfirmasi === 'close'
                            ? 'Yakin memverifikasi dan menutup RRF ini?'
                            : 'Yakin mengembalikan RRF ini ke Maintenance?'}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {konfirmasi === 'close'
                            ? 'Status berubah menjadi Closed dan tidak bisa dibuka kembali.'
                            : 'Status kembali menjadi Sedang dikerjakan. Admin Maintenance bisa mengedit datanya lagi, lalu mengirim ulang.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={kirim}
                            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                konfirmasi === 'close'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {processing ? 'Memproses...' : 'Ya, lanjutkan'}
                        </button>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => setKonfirmasi(null)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </Panel>
    );
}

/* ---------- riwayat mesin ---------- */
function RiwayatMesin({ rrf, pembagi, riwayat }) {
    const sebelumnya = pembagi - 1;

    return (
        <section className="rounded-2xl border border-white/40 bg-white/[0.93] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.18)]">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                Riwayat mesin ini
            </h2>

            <p className="mt-1 text-xs text-slate-500">
                {rrf.mesin}:{' '}
                {sebelumnya === 0
                    ? 'belum pernah ada RRF yang selesai, jadi pembagi time repair 1.'
                    : `${sebelumnya} RRF sebelumnya sudah selesai, jadi pembagi time repair ${pembagi}.`}
            </p>

            {riwayat.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {riwayat.map((r) => (
                        <li
                            key={r.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                        >
                            <Link
                                href={`/mtc/rrf/${r.id}`}
                                className="font-bold text-blue-700 hover:underline"
                            >
                                {r.rrf_no}
                            </Link>

                            <span className="text-xs text-slate-500">
                                {r.tanggal} · down time {r.downtime ?? '-'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {sebelumnya > riwayat.length && (
                <p className="mt-2 text-xs text-slate-400">
                    Menampilkan {riwayat.length} terbaru dari {sebelumnya} RRF.
                </p>
            )}
        </section>
    );
}

export default function MtcShow({
    rrf,
    shiftOptions = [],
    bisaAksi,
    bisaVerifikasi = false,
    penanganan = null,
    dikembalikan = null,
    verifikasi = {},
    pembagi = 1,
    riwayatMesin = [],
}) {
    const belumSelesai = ['disetujui', 'diterima', 'dikerjakan'].includes(rrf.status);

    // Form dibuat ulang setiap data tersimpan berubah, supaya isiannya selalu sesuai database
    const kunciForm = JSON.stringify(penanganan);

    const sisip = (
        <>
            {rrf.status === 'dikerjakan' && dikembalikan && (
                <DikembalikanInfo info={dikembalikan} />
            )}

            {bisaAksi && rrf.status === 'disetujui' && (
                <KeputusanPanel rrf={rrf} />
            )}

            {bisaAksi && rrf.status === 'diterima' && penanganan && (
                <PenangananForm
                    key={kunciForm}
                    mode="mulai"
                    rrf={rrf}
                    penanganan={penanganan}
                    shiftOptions={shiftOptions}
                    pembagi={pembagi}
                />
            )}

            {bisaAksi && rrf.status === 'dikerjakan' && penanganan && (
                <PenangananForm
                    key={kunciForm}
                    mode="ubah"
                    rrf={rrf}
                    penanganan={penanganan}
                    shiftOptions={shiftOptions}
                    pembagi={pembagi}
                />
            )}

            {rrf.status === 'selesai' && !bisaVerifikasi && (
                <Info>
                    Sudah dikirim ke Pimpinan oleh {verifikasi.dikirim_oleh ?? '-'} pada{' '}
                    {verifikasi.dikirim_pada ?? '-'}. Menunggu verifikasi Pimpinan.
                </Info>
            )}

            {bisaVerifikasi && (
                <VerifikasiPanel rrf={rrf} verifikasi={verifikasi} />
            )}

            {rrf.status === 'closed' && (
                <Info>
                    RRF sudah di-close
                    {verifikasi.closed_oleh ? ` oleh ${verifikasi.closed_oleh}` : ''}
                    {verifikasi.closed_pada ? ` pada ${verifikasi.closed_pada}` : ''}.
                </Info>
            )}

            {!bisaAksi && belumSelesai && (
                <Info>
                    Anda hanya bisa melihat RRF ini. Penanganan dilakukan oleh Admin
                    Maintenance.
                </Info>
            )}

            {belumSelesai && (
                <RiwayatMesin
                    rrf={rrf}
                    pembagi={pembagi}
                    riwayat={riwayatMesin}
                />
            )}
        </>
    );

    return (
        <ProduksiLayout>
            <Head title={rrf.rrf_no} />

            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Link
                        href="/mtc/rrf"
                        className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-lg transition hover:bg-white/20"
                    >
                        ← Kembali ke daftar
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600" />

                        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                            {rrf.rrf_no}
                        </h1>
                    </div>
                </div>

                <div className="pt-1">
                    <StatusBadge status={rrf.status} label={rrf.status_label} />
                </div>
            </div>

            <RrfDetail rrf={rrf} sisip={sisip} />
        </ProduksiLayout>
    );
}