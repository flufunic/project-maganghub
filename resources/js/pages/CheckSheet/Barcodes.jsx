import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

export default function Barcodes({ lines = [] }) {
    return (
        <>
            <Head title="Cetak Barcode Line" />

            <div className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
                <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between print:hidden">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/check-sheets"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            ← Kembali
                        </Link>
                        <h1 className="text-lg font-bold text-slate-800">
                            Barcode Line (Permanen)
                        </h1>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                    >
                        Cetak
                    </button>
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 print:max-w-none print:gap-3">
                    {lines.map((line) => (
                        <div
                            key={line.id}
                            className="flex break-inside-avoid flex-col items-center rounded-xl border-2 border-slate-800 bg-white p-4 text-center"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                {line.divisi?.nama_divisi}
                            </p>

                            <p className="mb-2 text-xl font-extrabold text-slate-900">
                                {line.nama_line}
                            </p>

                            <div className="bg-white p-2">
                                <QRCodeSVG
                                    value={`${window.location.origin}/s/${encodeURIComponent(line.kode)}`}
                                    size={160}
                                    level="M"
                                />
                            </div>

                            <p className="mt-2 font-mono text-[10px] text-slate-500">
                                {line.kode}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}