import React, { useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export const formatUkuran = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function DokumenModal({ mesin, tahun, onClose }) {
    const inputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [hapusId, setHapusId] = useState(null);

    const dokumens = mesin.dokumens ?? [];

    const upload = () => {
        if (files.length === 0) return;

        setError('');
        setUploading(true);

        router.post(
            `/overhaul-sc2/${mesin.id}/dokumen`,
            { dokumen: files, tahun },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setFiles([]);
                    if (inputRef.current) inputRef.current.value = '';
                },
                onError: (errs) => setError(Object.values(errs)[0] ?? 'Gagal mengunggah dokumen.'),
                onFinish: () => setUploading(false),
            }
        );
    };

    const hapus = (id) => {
        router.delete(`/overhaul-dokumen/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setHapusId(null),
        });
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030a26]/60 px-4 backdrop-blur-md">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/40">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Dokumen Tahun {tahun}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{mesin.nama}</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        ×
                    </button>
                </div>

                {/* DAFTAR */}
                <div className="idx-scroll flex-1 overflow-y-auto px-6 py-4">
                    {dokumens.length === 0 ? (
                        <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                            Belum ada dokumen.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {dokumens.map((d) => (
                                <li
                                    key={d.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                                >
                                    <span className="text-lg">📄</span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-700" title={d.nama_asli}>
                                            {d.nama_asli}
                                        </p>
                                        <p className="text-[11px] text-slate-400">{formatUkuran(d.ukuran)}</p>
                                    </div>

                                    {hapusId === d.id ? (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => hapus(d.id)}
                                                className="cursor-pointer rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700"
                                            >
                                                Yakin hapus
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHapusId(null)}
                                                className="cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <a
                                                href={d.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 transition hover:bg-blue-100"
                                            >
                                                Lihat
                                            </a>
                                            <a
                                                href={d.download_url}
                                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100"
                                            >
                                                Unduh
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => setHapusId(d.id)}
                                                className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-100"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* UPLOAD */}
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                        className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-600 hover:file:bg-blue-100"
                    />

                    <p className="mt-1.5 text-[11px] text-slate-400">
                        Maksimal 10 file, masing-masing 100 MB. PDF, Word, Excel, PowerPoint, JPG, PNG.
                    </p>

                    {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}

                    <div className="mt-3 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                        >
                            Tutup
                        </button>

                        <button
                            type="button"
                            onClick={upload}
                            disabled={files.length === 0 || uploading}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {uploading ? 'Mengunggah...' : `Unggah${files.length ? ` (${files.length})` : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}