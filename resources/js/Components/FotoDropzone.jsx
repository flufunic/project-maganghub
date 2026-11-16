import React, { useEffect, useRef, useState } from 'react';

const MAKS_MB = 15;

/**
 * Area upload foto: klik, drag & drop, atau paste (Ctrl+V) dari clipboard.
 *
 * - Paste bekerja kalau kursor sedang di atas area ini (tidak perlu klik dulu)
 *   atau area ini sedang fokus.
 * - Tidak mengirim apa pun sendiri: file yang valid diserahkan ke `onFile(file)`,
 *   pengirimannya (router.post dst.) diatur komponen pemanggil.
 *
 * Props:
 *   onFile(file)   dipanggil saat ada foto valid
 *   onError(pesan) dipanggil saat file ditolak (bukan gambar / terlalu besar)
 *   disabled       matikan semua cara upload
 *   klik           true = klik area membuka pilih file (default true)
 */
export default function FotoDropzone({
    onFile,
    onError,
    disabled = false,
    klik = true,
    className = '',
    children,
}) {
    const areaRef = useRef(null);
    const inputRef = useRef(null);
    const hoverRef = useRef(false);
    const [drag, setDrag] = useState(false);

    const proses = (file) => {
        if (!file) {
            return;
        }

        if (!file.type?.startsWith('image/')) {
            onError?.('File harus berupa gambar (JPG / PNG).');
            return;
        }

        if (file.size > MAKS_MB * 1024 * 1024) {
            onError?.(`Ukuran foto maksimal ${MAKS_MB} MB.`);
            return;
        }

        onFile?.(file);
    };

    // Paste dari clipboard (screenshot / salin gambar)
    useEffect(() => {
        const handler = (e) => {
            if (disabled) {
                return;
            }

            const aktif =
                hoverRef.current ||
                (areaRef.current &&
                    areaRef.current.contains(document.activeElement));

            if (!aktif) {
                return;
            }

            const item = Array.from(e.clipboardData?.items ?? []).find(
                (i) => i.kind === 'file' && i.type.startsWith('image/')
            );

            if (!item) {
                return;
            }

            e.preventDefault();
            proses(item.getAsFile());
        };

        window.addEventListener('paste', handler);

        return () => window.removeEventListener('paste', handler);
    });

    return (
        <div
            ref={areaRef}
            tabIndex={disabled ? -1 : 0}
            title="Klik, drag & drop, atau Ctrl+V untuk menempel foto"
            onMouseEnter={() => (hoverRef.current = true)}
            onMouseLeave={() => (hoverRef.current = false)}
            onClick={() => {
                if (klik && !disabled) {
                    inputRef.current?.click();
                }
            }}
            onDragOver={(e) => {
                if (disabled) return;
                e.preventDefault();
                setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDrag(false);

                if (!disabled) {
                    proses(e.dataTransfer.files?.[0]);
                }
            }}
            className={`rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-blue-300 ${
                drag
                    ? 'border-2 border-dashed border-blue-400 bg-blue-50/70'
                    : 'border-2 border-dashed border-transparent'
            } ${disabled ? 'opacity-60' : klik ? 'cursor-pointer' : ''} ${className}`}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                    proses(e.target.files?.[0]);
                    e.target.value = ''; // supaya foto yang sama bisa dipilih lagi
                }}
            />

            {children}
        </div>
    );
}
