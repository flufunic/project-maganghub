import ConfirmModal from '@/Components/ConfirmModal';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Icon, PageShell, glassCard, btnPrimary } from '@/Components/Joken/ui';

export default function Index({ jokens, filters }) {
    const [q, setQ] = useState(filters?.q ?? '');
    const [confirmDialog, setConfirmDialog] = useState(null);

    const cari = (e) => {
        e.preventDefault();
        router.get('/joken', { q }, { preserveState: true, replace: true });
    };

    const hapus = (j) => {
        setConfirmDialog({
            title: 'Hapus joken?',
            message: `Apakah kamu yakin ingin menghapus joken ${j.no_registrasi}? Semua baris dan foto di dalamnya ikut terhapus.`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            onConfirm: () => {
                router.delete(`/joken/${j.id}`, {
                    preserveScroll: true,
                    onFinish: () => setConfirmDialog(null),
                });
            },
        });
    };

    return (
        <PageShell title="Joken Mesin Sewing">
            <div className={`overflow-hidden rounded-2xl ${glassCard}`}>
                <div className="bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <form onSubmit={cari} className="flex items-center gap-2">
                            <div className="relative">
                                <Icon type="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Cari no. registrasi, judul, model..."
                                    className="h-9 w-72 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <button type="submit" className="h-9 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100">
                                Cari
                            </button>
                        </form>

                        <Link href="/joken/create" className={btnPrimary}>
                            <Icon type="plus" className="h-4 w-4" />
                            Buat Joken
                        </Link>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#0a1a4d] via-blue-900 to-indigo-900 text-[11px] uppercase tracking-wider text-white">
                                    <th className="px-4 py-3 text-left font-bold">No. Registrasi</th>
                                    <th className="px-4 py-3 text-left font-bold">Judul</th>
                                    <th className="px-4 py-3 text-left font-bold">Line</th>
                                    <th className="px-4 py-3 text-left font-bold">Model</th>
                                    <th className="px-4 py-3 text-left font-bold">Part Name</th>
                                    <th className="w-28 px-4 py-3 text-center font-bold">Jml Proses</th>
                                    <th className="w-36 px-4 py-3 text-center font-bold">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {jokens.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                                            Belum ada data joken.
                                        </td>
                                    </tr>
                                )}

                                {jokens.data.map((j) => (
                                    <tr key={j.id} className="hover:bg-blue-50/50">
                                        <td className="border-b border-slate-200 px-4 py-2.5 font-semibold text-slate-700">{j.no_registrasi}</td>
                                        <td className="border-b border-slate-200 px-4 py-2.5 text-slate-700">{j.judul}</td>
                                        <td className="border-b border-slate-200 px-4 py-2.5 text-slate-600">{j.line}</td>
                                        <td className="border-b border-slate-200 px-4 py-2.5 text-slate-600">{j.model}</td>
                                        <td className="border-b border-slate-200 px-4 py-2.5 text-slate-600">{j.part_name}</td>
                                        <td className="border-b border-slate-200 px-4 py-2.5 text-center text-slate-600">{j.rows_count}</td>
                                        <td className="border-b border-slate-200 px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Link href={`/joken/${j.id}`} title="Lihat" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100">
                                                    <Icon type="eye" />
                                                </Link>
                                                <Link href={`/joken/${j.id}/edit`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                                                    <Icon type="edit" />
                                                </Link>
                                                <button type="button" title="Hapus" onClick={() => hapus(j)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100">
                                                    <Icon type="trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {jokens.links.length > 3 && (
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-1">
                            {jokens.links.map((l, i) =>
                                l.url ? (
                                    <Link
                                        key={i}
                                        href={l.url}
                                        preserveScroll
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                                            l.active
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                open={Boolean(confirmDialog)}
                title={confirmDialog?.title}
                message={confirmDialog?.message}
                confirmLabel={confirmDialog?.confirmLabel}
                tone={confirmDialog?.tone}
                onConfirm={() => confirmDialog?.onConfirm?.()}
                onCancel={() => setConfirmDialog(null)}
            />
        </PageShell>
    );
}