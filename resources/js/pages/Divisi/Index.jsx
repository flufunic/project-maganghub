import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Layers, QrCode, Pencil, Check, X } from 'lucide-react';

const card =
    'rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]';
const input =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100';
const btnPrimary =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60';

function BarisLine({ line }) {
    const hapus = () => {
        if (!confirm(`Hapus line "${line.nama_line}"?`)) return;
        router.delete(`/master/lines/${line.id}`, { preserveScroll: true });
    };

    return (
        <li className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{line.nama_line}</p>
                <p className="font-mono text-[11px] text-slate-400">{line.kode}</p>
            </div>
            <button
                type="button"
                onClick={hapus}
                title="Hapus line"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </li>
    );
}

function KartuDivisi({ divisi, lines }) {
    const [editNama, setEditNama] = useState(null);
    const tambah = useForm({ nama_line: '' });

    const tipe = lines.length && lines[0].per_mesin ? 'Per mesin' : 'Per divisi';

    const simpanNama = () => {
        router.put(
            `/master/divisi/${divisi.id}`,
            { nama_divisi: editNama },
            { preserveScroll: true, onSuccess: () => setEditNama(null) }
        );
    };

    const hapusDivisi = () => {
        if (!confirm(`Hapus divisi "${divisi.nama_divisi}" beserta semua line-nya?`)) return;
        router.delete(`/master/divisi/${divisi.id}`, { preserveScroll: true });
    };

    const submitLine = (e) => {
        e.preventDefault();
        tambah.post(`/master/divisi/${divisi.id}/lines`, {
            preserveScroll: true,
            onSuccess: () => tambah.reset(),
        });
    };

    return (
        <article className={`${card} p-5`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    {editNama === null ? (
                        <h3 className="truncate text-base font-extrabold text-slate-900">
                            {divisi.nama_divisi}
                        </h3>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                value={editNama}
                                onChange={(e) => setEditNama(e.target.value)}
                                className={input}
                                autoFocus
                            />
                            <button type="button" onClick={simpanNama} className="text-emerald-600">
                                <Check className="h-5 w-5" />
                            </button>
                            <button type="button" onClick={() => setEditNama(null)} className="text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {tipe} · {lines.length} line
                    </p>
                </div>

                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setEditNama(divisi.nama_divisi)}
                        title="Ubah nama"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={hapusDivisi}
                        title="Hapus divisi"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <ul className="mt-4 space-y-2">
                {lines.map((l) => (
                    <BarisLine key={l.id} line={l} />
                ))}
            </ul>

            <form onSubmit={submitLine} className="mt-4 flex gap-2">
                <input
                    value={tambah.data.nama_line}
                    onChange={(e) => tambah.setData('nama_line', e.target.value)}
                    placeholder="Tambah line / mesin..."
                    className={input}
                />
                <button type="submit" disabled={tambah.processing} className={btnPrimary}>
                    <Plus className="h-4 w-4" />
                </button>
            </form>
            {tambah.errors.nama_line && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">{tambah.errors.nama_line}</p>
            )}
        </article>
    );
}

export default function Index({ divisis = [], lines = [] }) {
    const { flash, errors } = usePage().props;

    const form = useForm({
        nama_divisi: '',
        per_mesin: true,
        daftar_line: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/master/divisi', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Master Divisi & Line" />

            <div className="min-h-screen bg-slate-100">
                <header className="bg-[#071735] shadow-lg">
                    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href="/check-sheets"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-sm font-bold text-white sm:text-base">Master Divisi & Line</h1>
                            <p className="text-[11px] text-blue-200">Tambah divisi baru untuk pabrik ini</p>
                        </div>
                        <Link
                            href="/check-sheets-barcodes"
                            className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#0b1d57]"
                        >
                            <QrCode className="h-4 w-4" /> Cetak Barcode
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
                    {flash?.success && (
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {flash.success}
                        </div>
                    )}
                    {errors?.hapus && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                            {errors.hapus}
                        </div>
                    )}

                    {/* FORM DIVISI BARU */}
                    <form onSubmit={submit} className={`${card} space-y-5 p-5 sm:p-6`}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Layers className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Tambah Divisi Baru</h2>
                                <p className="text-[11px] text-slate-400">
                                    Barcode tiap line dibuat otomatis
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-bold text-slate-700">Nama Divisi</label>
                                <input
                                    value={form.data.nama_divisi}
                                    onChange={(e) => form.setData('nama_divisi', e.target.value)}
                                    placeholder="Contoh: Packing"
                                    className={input}
                                />
                                {form.errors.nama_divisi && (
                                    <p className="mt-1.5 text-[11px] font-medium text-red-600">{form.errors.nama_divisi}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold text-slate-700">Tipe Check Sheet</label>
                                <select
                                    value={form.data.per_mesin ? '1' : '0'}
                                    onChange={(e) => form.setData('per_mesin', e.target.value === '1')}
                                    className={input}
                                >
                                    <option value="1">Per mesin (tiap mesin punya check sheet sendiri)</option>
                                    <option value="0">Per divisi (check sheet dipakai bersama semua line)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold text-slate-700">
                                Daftar {form.data.per_mesin ? 'Mesin' : 'Line'} (satu baris = satu barcode)
                            </label>
                            <textarea
                                rows={5}
                                value={form.data.daftar_line}
                                onChange={(e) => form.setData('daftar_line', e.target.value)}
                                placeholder={'Mesin 1\nMesin 2\nMesin 3'}
                                className={input}
                            />
                            {form.errors.daftar_line && (
                                <p className="mt-1.5 text-[11px] font-medium text-red-600">{form.errors.daftar_line}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={form.processing} className={btnPrimary}>
                                <Plus className="h-4 w-4" />
                                {form.processing ? 'Menyimpan...' : 'Simpan Divisi'}
                            </button>
                        </div>
                    </form>

                    {/* DAFTAR DIVISI */}
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {divisis.map((d) => (
                            <KartuDivisi
                                key={d.id}
                                divisi={d}
                                lines={lines.filter((l) => l.divisi_id === d.id)}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}