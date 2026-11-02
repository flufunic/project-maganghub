import { Link } from '@inertiajs/react';
import { Icon, PageShell, glassCard, btnPrimary, btnSoft } from '@/Components/Joken/ui';

const IDENTITAS_KIRI = [['line', 'Line'], ['model', 'Model'], ['pic', 'PIC'], ['no_line', 'No Line']];
const IDENTITAS_KANAN = [
    ['supplier', 'Supplier'], ['part_name', 'Part Name'],
    ['part_number', 'Part Number'], ['mfg_location', 'MFG. Location'],
];

export default function Show({ joken }) {
    const kolom = joken.kolom ?? [];

    return (
        <PageShell title={`Joken ${joken.no_registrasi}`} heading={`Joken · ${joken.no_registrasi}`} backHref="/joken">
            <div className={`overflow-hidden rounded-2xl ${glassCard} print:rounded-none print:border-0 print:shadow-none`}>
                <div className="bg-white p-4">
                    <div className="mb-3 flex justify-end gap-2 print:hidden">
                        <button type="button" onClick={() => window.print()} className={btnSoft}>
                            <Icon type="print" className="h-4 w-4" />
                            Cetak
                        </button>
                        <Link href={`/joken/${joken.id}/edit`} className={btnPrimary}>
                            <Icon type="edit" className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>

                    {/* JUDUL & NO REGISTRASI */}
                    <table className="mb-3 w-full border-collapse border border-slate-400 text-sm">
                        <tbody>
                            <tr>
                                <td className="border border-slate-400 px-4 py-4 text-center text-2xl font-bold text-slate-800">
                                    {joken.judul}
                                </td>
                                <td className="w-72 border border-slate-400 px-3 py-2 align-top">
                                    <p className="text-[11px] text-slate-500">No. Registrasi:</p>
                                    <p className="font-bold text-slate-800">{joken.no_registrasi}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* IDENTITAS */}
                    <div className="mb-4 grid gap-3 text-xs md:grid-cols-2">
                        {[IDENTITAS_KIRI, IDENTITAS_KANAN].map((grup, gi) => (
                            <table key={gi} className="w-full border-collapse border border-slate-300">
                                <tbody>
                                    {grup.map(([key, label]) => (
                                        <tr key={key}>
                                            <th className="w-36 border border-slate-300 bg-slate-50 px-3 py-1.5 text-left font-semibold text-slate-600">{label}</th>
                                            <td className="border border-slate-300 px-3 py-1.5 text-slate-800">{joken[key]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ))}
                    </div>

                    {/* DETAIL STANDARISASI */}
                    <h2 className="mb-2 text-sm font-extrabold text-slate-800">Detail Standarisasi</h2>

                    <div className="overflow-x-auto rounded-xl border border-slate-300 print:overflow-visible print:rounded-none">
                        <table className="w-full border-collapse text-center text-xs">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th rowSpan={2} className="border border-slate-300 px-2 py-2">QCPC</th>
                                    <th rowSpan={2} className="min-w-[180px] border border-slate-300 px-2 py-2">PROSES</th>
                                    <th rowSpan={2} className="border border-slate-300 px-2 py-2">MODEL MATERIAL</th>
                                    <th rowSpan={2} className="border border-slate-300 px-2 py-2">TYPE MESIN</th>
                                    {kolom.map((k, i) => (
                                        <th key={k.uid} className="border border-slate-300 px-2 py-1 font-extrabold">{i + 1}</th>
                                    ))}
                                </tr>
                                <tr className="bg-slate-100">
                                    {kolom.map((k) => (
                                        <th key={k.uid} className="border border-slate-300 px-1 py-2 font-semibold text-slate-700">
                                            <div
                                                className="mx-auto"
                                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', minHeight: 120, whiteSpace: 'normal' }}
                                            >
                                                {k.label}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {joken.rows.map((r) => (
                                    <tr key={r.id}>
                                        <td className="border border-slate-300 px-2 py-2">{r.qcpc}</td>
                                        <td className="whitespace-pre-line border border-slate-300 px-2 py-2 text-left">{r.proses}</td>
                                        <td className="border border-slate-300 px-2 py-2">{r.model_material}</td>
                                        <td className="border border-slate-300 px-2 py-2">{r.type_mesin}</td>

                                        {kolom.map((k) => {
                                            const v = r.nilai?.[k.uid];

                                            return (
                                                <td key={k.uid} className="border border-slate-300 px-2 py-2">
                                                    {k.type === 'image' ? (
                                                        v && (
                                                            <a href={`/storage/${v}`} target="_blank" rel="noreferrer">
                                                                <img src={`/storage/${v}`} alt="" className="mx-auto h-16 rounded border border-slate-200 object-cover" />
                                                            </a>
                                                        )
                                                    ) : (
                                                        v
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}