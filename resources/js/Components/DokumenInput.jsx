import React, { useRef } from 'react';
import { formatUkuran } from '@/Components/DokumenModal';

export default function DokumenInput({ files, onChange, error }) {
    const inputRef = useRef(null);

    const tambah = (e) => {
        const baru = Array.from(e.target.files ?? []);
        onChange([...files, ...baru]);
        if (inputRef.current) inputRef.current.value = '';
    };

    const buang = (index) => onChange(files.filter((_, i) => i !== index));

    return (
        <div className="flex flex-col gap-1">
            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={tambah}
                className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-600 hover:file:bg-blue-100"
            />

            {files.length > 0 && (
                <ul className="mt-1 space-y-1.5">
                    {files.map((f, i) => (
                        <li
                            key={`${f.name}-${i}`}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                        >
                            <span>📄</span>
                            <span className="min-w-0 flex-1 truncate text-slate-700">{f.name}</span>
                            <span className="text-slate-400">{formatUkuran(f.size)}</span>
                            <button
                                type="button"
                                onClick={() => buang(i)}
                                className="cursor-pointer text-base leading-none text-slate-400 hover:text-red-600"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>
    );
}