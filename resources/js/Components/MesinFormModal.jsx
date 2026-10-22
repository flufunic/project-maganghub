import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ------------------------------------------------------------------
| KONSTANTA
------------------------------------------------------------------ */
const NEW_OPTION = '__new__';
const EMPTY = {};

/* ------------------------------------------------------------------
| ICON
------------------------------------------------------------------ */
const PATHS = {
    close: 'M6 6l12 12M18 6L6 18',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    check: 'M5 13l4 4L19 7',
    chevron: 'M6 9l6 6 6-6',
    cog: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.34 1.88l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.88-.34 1.7 1.7 0 00-1.03 1.56V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.88.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.88 1.7 1.7 0 00-1.56-1.03H3a2 2 0 110-4h.09a1.7 1.7 0 001.56-1.11 1.7 1.7 0 00-.34-1.88l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.88.34H9a1.7 1.7 0 001.03-1.56V3a2 2 0 114 0v.09a1.7 1.7 0 001.03 1.56 1.7 1.7 0 001.88-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.88V9a1.7 1.7 0 001.56 1.03H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.51 1z',
    question: 'M9.1 9a3 3 0 115.8 1c-.5 1.2-1.9 1.6-2.4 2.5-.2.3-.2.7-.2 1M12 17.5h.01',
    alert: 'M12 8v5M12 16.5h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3l-7.9-13.6a2 2 0 00-3.4 0z',
};

function Icon({ name, className = 'h-4 w-4', sw = 2 }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d={PATHS[name]} />
        </svg>
    );
}

/* ------------------------------------------------------------------
| STYLE TOKENS
------------------------------------------------------------------ */
const fieldBase =
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4';
const fieldOk = 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100';
const fieldErr = 'border-red-300 focus:border-red-500 focus:ring-red-100';

const fieldClass = (hasError) => `${fieldBase} ${hasError ? fieldErr : fieldOk}`;

function FormField({ label, hint, error, children, className = '' }) {
    return (
        <div className={className}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                {hint && <span className="text-xs text-slate-400">{hint}</span>}
            </div>

            {children}

            {error && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section>
            <h3 className="mb-3 border-b border-slate-100 pb-2 text-xs font-semibold text-slate-500">
                {title}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </section>
    );
}

const formatAngka = (value) => {
    if (value === '' || value === null || value === undefined) return '-';
    const n = Number(value);
    return Number.isNaN(n) ? String(value) : n.toLocaleString('id-ID');
};

/* ------------------------------------------------------------------
| DROPDOWN MESIN (custom, supaya tiap pilihan bisa punya tombol hapus)
------------------------------------------------------------------ */
function MesinPicker({
    value,
    options,
    counts,
    protectedName,
    hasError,
    open,
    setOpen,
    onSelect,
    onNew,
    onDelete,
}) {
    const ref = useRef(null);

    // Klik di luar dropdown -> tutup
    useEffect(() => {
        if (!open) return;

        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, setOpen]);

    const label = value === NEW_OPTION ? 'Mesin baru' : value || 'Pilih mesin';
    const isPlaceholder = !value;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`${fieldClass(hasError)} flex cursor-pointer items-center justify-between gap-2 text-left`}
            >
                <span className={`truncate ${isPlaceholder ? 'text-slate-400' : ''}`}>{label}</span>
                <Icon
                    name="chevron"
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="mfm-pop absolute left-0 right-0 z-20 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
                >
                    {options.length === 0 && (
                        <li className="px-3 py-2 text-sm text-slate-400">Belum ada mesin.</li>
                    )}

                    {options.map((o) => {
                        const selected = value === o.mesin;
                        const canDelete = o.mesin !== protectedName;

                        return (
                            <li
                                key={o.mesin}
                                role="option"
                                aria-selected={selected}
                                className={`group flex items-center rounded-lg transition ${
                                    selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(o.mesin)}
                                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm"
                                >
                                    <span className="flex w-4 shrink-0 justify-center text-blue-600">
                                        {selected && <Icon name="check" className="h-4 w-4" sw={2.5} />}
                                    </span>
                                    <span className="truncate font-medium text-slate-700">{o.mesin}</span>
                                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                                        No. {o.no} · {counts[o.mesin] ?? 0} data
                                    </span>
                                </button>

                                {canDelete ? (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(o.mesin)}
                                        title={`Hapus mesin ${o.mesin}`}
                                        aria-label={`Hapus mesin ${o.mesin}`}
                                        className="mr-1.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Icon name="close" className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <span
                                        title="Sedang diedit, tidak bisa dihapus"
                                        className="mr-1.5 flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-slate-100 text-slate-300"
                                    >
                                        <Icon name="close" className="h-4 w-4" />
                                    </span>
                                )}
                            </li>
                        );
                    })}

                    <li className="mt-1 border-t border-slate-100 pt-1">
                        <button
                            type="button"
                            onClick={onNew}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            Tambah mesin baru
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------
| KOMPONEN UTAMA
|
| Props:
|  - mesin          : data yang diedit (null = mode tambah)
|  - mesins         : seluruh data (untuk opsi mesin + nomor otomatis)
|  - satuans        : daftar satuan dari database (array string)
|  - serverErrors   : error validasi dari Laravel
|  - saving         : status proses simpan
|  - onClose()      : tutup modal
|  - onSubmit(payload)    : dipanggil setelah user menekan "Ya, simpan"
|  - onDeleteMesin(nama)  : hapus mesin beserta seluruh datanya
|  - onDeleteSatuan(nama) : hapus satuan (hanya jika tidak dipakai)
|
| Render komponen ini secara kondisional ({showForm && <MesinFormModal />})
| supaya form selalu mulai dari state baru.
------------------------------------------------------------------ */
export default function MesinFormModal({
    mesin = null,
    mesins = [],
    satuans = [],
    serverErrors = EMPTY,
    saving = false,
    onClose,
    onSubmit,
    onDeleteMesin,
    onDeleteSatuan,
}) {
    const isEdit = Boolean(mesin);

    /* ---------- opsi dropdown ---------- */
    const opsiMesin = useMemo(() => {
        const map = new Map();

        // Nomor = urutan mesin (1, 2, 3, ...), sama dengan yang tampil di tabel
        mesins.forEach((m) => {
            if (!map.has(m.mesin)) map.set(m.mesin, map.size + 1);
        });

        return Array.from(map, ([nama, no]) => ({ mesin: nama, no }));
    }, [mesins]);

    // Jumlah data per mesin (ditampilkan di dropdown & dialog hapus)
    const countMesin = useMemo(() => {
        const counts = {};
        mesins.forEach((m) => {
            counts[m.mesin] = (counts[m.mesin] ?? 0) + 1;
        });
        return counts;
    }, [mesins]);

    // Jumlah data per satuan (satuan yang dipakai tidak boleh dihapus)
    const countSatuan = useMemo(() => {
        const counts = {};
        mesins.forEach((m) => {
            const s = String(m.satuan ?? '').trim().toLowerCase();
            if (s) counts[s] = (counts[s] ?? 0) + 1;
        });
        return counts;
    }, [mesins]);

    const opsiSatuan = useMemo(() => {
        const seen = new Set();
        const list = [];

        [...satuans, ...mesins.map((m) => m.satuan)].forEach((s) => {
            const value = String(s ?? '').trim().toLowerCase();

            if (value && !seen.has(value)) {
                seen.add(value);
                list.push(value);
            }
        });

        return list;
    }, [satuans, mesins]);

    /* ---------- state ---------- */
    const [form, setForm] = useState(() =>
        mesin
            ? {
                  mesin: mesin.mesin ?? '',
                  mesinBaru: '',
                  nama: mesin.nama ?? '',
                  total_mesin: mesin.total_mesin ?? 1,
                  standar: mesin.standar ?? '',
                  satuan: mesin.satuan ? String(mesin.satuan).toLowerCase() : '',
                  satuanBaru: '',
              }
            : {
                  // kalau belum ada mesin sama sekali, langsung mode input baru
                  mesin: opsiMesin.length > 0 ? '' : NEW_OPTION,
                  mesinBaru: '',
                  nama: '',
                  total_mesin: 1,
                  standar: '',
                  satuan: opsiSatuan.includes('jam') ? 'jam' : '',
                  satuanBaru: '',
              }
    );

    const [localErrors, setLocalErrors] = useState({});
    const [hiddenServer, setHiddenServer] = useState({});
    const [confirming, setConfirming] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [del, setDel] = useState(null); // { type: 'mesin' | 'satuan', value }

    // Error baru dari server -> tampilkan lagi
    useEffect(() => {
        setHiddenServer({});
    }, [serverErrors]);

    // Error server disembunyikan setelah field terkait diubah user
    const visibleServer = Object.fromEntries(
        Object.entries(serverErrors).filter(([key]) => !hiddenServer[key])
    );
    const errors = { ...visibleServer, ...localErrors };

    const patch = (changes) => {
        setForm((prev) => ({ ...prev, ...changes }));

        const keys = Object.keys(changes).map((k) =>
            k === 'mesinBaru' ? 'mesin' : k === 'satuanBaru' ? 'satuan' : k
        );

        setLocalErrors((prev) => {
            const next = { ...prev };
            keys.forEach((k) => delete next[k]);
            return next;
        });

        setHiddenServer((prev) => {
            const next = { ...prev };
            keys.forEach((k) => {
                next[k] = true;
            });
            return next;
        });
    };

    /* ---------- nilai turunan ---------- */
    const mesinFinal = (form.mesin === NEW_OPTION ? form.mesinBaru : form.mesin).trim();
    const satuanFinal = (form.satuan === NEW_OPTION ? form.satuanBaru : form.satuan)
        .trim()
        .toLowerCase();

    const mesinCocok = opsiMesin.find(
        (o) => o.mesin.toLowerCase() === mesinFinal.toLowerCase()
    );
    const nomorTerakhir = opsiMesin.length;
    const nomorOtomatis = !mesinFinal ? '-' : mesinCocok ? mesinCocok.no : nomorTerakhir + 1;
    const mesinIsBaru = Boolean(mesinFinal) && !mesinCocok;

    const standarLabel =
        form.standar === '' || form.standar === null
            ? '-'
            : `${formatAngka(form.standar)}${satuanFinal ? ` ${satuanFinal}` : ''}`;

    /* ---------- tombol Esc: tutup lapisan paling atas dulu ---------- */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape' || saving) return;

            if (del) setDel(null);
            else if (confirming) setConfirming(false);
            else if (menuOpen) setMenuOpen(false);
            else onClose();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [del, confirming, menuOpen, saving, onClose]);

    /* ---------- kunci scroll halaman saat modal terbuka ---------- */
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    /* ---------- validasi -> buka dialog konfirmasi simpan ---------- */
    const handleReview = (e) => {
        e.preventDefault();

        const found = {};

        if (!mesinFinal) {
            found.mesin =
                form.mesin === NEW_OPTION
                    ? 'Nama mesin baru wajib diisi.'
                    : 'Pilih mesin terlebih dulu.';
        }

        if (!form.nama.trim()) {
            found.nama = 'Nama wajib diisi.';
        }

        if (Number(form.total_mesin) < 1 || form.total_mesin === '') {
            found.total_mesin = 'Total mesin minimal 1.';
        }

        if (form.standar !== '' && form.standar !== null && !satuanFinal) {
            found.satuan =
                form.satuan === NEW_OPTION
                    ? 'Nama satuan baru wajib diisi.'
                    : 'Pilih satuan untuk standar.';
        }

        if (Object.keys(found).length > 0) {
            setLocalErrors(found);
            return;
        }

        setLocalErrors({});
        setConfirming(true);
    };

    const handleConfirm = () => {
        setConfirming(false);

        onSubmit({
            mesin: mesinFinal,
            nama: form.nama.trim(),
            total_mesin: form.total_mesin,
            standar: form.standar,
            satuan: satuanFinal,
        });
    };

    /* ---------- hapus opsi mesin / satuan ---------- */
    const handleDelete = () => {
        if (!del) return;

        if (del.type === 'mesin') {
            onDeleteMesin(del.value);
            if (form.mesin === del.value) patch({ mesin: '', mesinBaru: '' });
            setMenuOpen(false);
        } else {
            onDeleteSatuan(del.value);
            if (form.satuan === del.value) patch({ satuan: '', satuanBaru: '' });
        }

        setDel(null);
    };

    const delCount = del
        ? del.type === 'mesin'
            ? countMesin[del.value] ?? 0
            : countSatuan[del.value] ?? 0
        : 0;

    // Satuan yang masih dipakai tidak bisa dihapus
    const delBlocked = Boolean(del) && del.type === 'satuan' && delCount > 0;

    const stepTotal = (delta) => {
        const next = Math.max(1, (Number(form.total_mesin) || 1) + delta);
        patch({ total_mesin: next });
    };

    return (
        <>
            <style>{`
                @keyframes mfmFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes mfmPop {
                    from { opacity: 0; transform: translateY(14px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .mfm-fade { animation: mfmFade 0.2s ease-out both; }
                .mfm-pop { animation: mfmPop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .mfm-fade, .mfm-pop { animation: none !important; }
                }
            `}</style>

            {/* ===================== MODAL FORM ===================== */}
            <div
                className="mfm-fade fixed inset-0 z-[90] flex items-end justify-center bg-[#030a26]/60 backdrop-blur-md sm:items-center sm:px-4"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget && !saving) onClose();
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mfm-title"
            >
                <form
                    onSubmit={handleReview}
                    className="mfm-pop flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/50 sm:rounded-3xl"
                >
                    {/* HEADER */}
                    <div className="relative flex items-start gap-4 bg-gradient-to-br from-[#0a1a4d] via-blue-900 to-indigo-800 px-6 py-5 text-white">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                            <Icon name={isEdit ? 'cog' : 'plus'} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 id="mfm-title" className="text-lg font-bold leading-tight">
                                {isEdit ? 'Edit data mesin' : 'Tambah data mesin'}
                            </h2>
                            <p className="mt-0.5 text-sm text-blue-100/80">
                                {isEdit
                                    ? mesin.nama
                                    : 'Isi data master untuk jadwal overhaul SC2.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Tutup"
                            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
                        >
                            <Icon name="close" className="h-5 w-5" />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="space-y-6 overflow-y-auto px-6 py-6">
                        <Section title="Identitas mesin">
                            {/* MESIN */}
                            <FormField label="Mesin" error={errors.mesin} className="sm:col-span-2">
                                <MesinPicker
                                    value={form.mesin}
                                    options={opsiMesin}
                                    counts={countMesin}
                                    protectedName={isEdit ? mesin.mesin : null}
                                    hasError={Boolean(errors.mesin)}
                                    open={menuOpen}
                                    setOpen={setMenuOpen}
                                    onSelect={(nama) => {
                                        patch({ mesin: nama, mesinBaru: '' });
                                        setMenuOpen(false);
                                    }}
                                    onNew={() => {
                                        patch({ mesin: NEW_OPTION, mesinBaru: '' });
                                        setMenuOpen(false);
                                    }}
                                    onDelete={(nama) => setDel({ type: 'mesin', value: nama })}
                                />

                                {form.mesin === NEW_OPTION && (
                                    <input
                                        type="text"
                                        autoFocus
                                        value={form.mesinBaru}
                                        onChange={(e) => patch({ mesinBaru: e.target.value })}
                                        placeholder="Nama mesin baru, contoh: Robot Headrest"
                                        className={`${fieldClass(errors.mesin)} mt-2`}
                                    />
                                )}
                            </FormField>

                            {/* NOMOR OTOMATIS */}
                            <FormField label="Nomor" hint="Otomatis">
                                <div className="flex h-[42px] items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5">
                                    <span className="text-sm font-bold text-slate-700">
                                        {nomorOtomatis}
                                    </span>

                                    {mesinFinal && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                mesinIsBaru
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : 'bg-slate-200/70 text-slate-600'
                                            }`}
                                        >
                                            {mesinIsBaru ? 'Mesin baru' : 'Mesin yang sudah ada'}
                                        </span>
                                    )}
                                </div>
                            </FormField>

                            {/* TOTAL MESIN */}
                            <FormField label="Total mesin" error={errors.total_mesin}>
                                <div className="flex h-[42px] items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                                    <button
                                        type="button"
                                        onClick={() => stepTotal(-1)}
                                        aria-label="Kurangi"
                                        className="flex w-11 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                    >
                                        <Icon name="minus" />
                                    </button>

                                    <input
                                        type="number"
                                        min="1"
                                        value={form.total_mesin}
                                        onChange={(e) => patch({ total_mesin: e.target.value })}
                                        className="min-w-0 flex-1 border-x border-slate-200 bg-transparent text-center text-sm font-semibold text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => stepTotal(1)}
                                        aria-label="Tambah"
                                        className="flex w-11 cursor-pointer items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                    >
                                        <Icon name="plus" />
                                    </button>
                                </div>
                            </FormField>

                            {/* NAMA */}
                            <FormField label="Nama" error={errors.nama} className="sm:col-span-2">
                                <input
                                    type="text"
                                    value={form.nama}
                                    onChange={(e) => patch({ nama: e.target.value })}
                                    placeholder="Contoh: Mixing Head 1"
                                    className={fieldClass(errors.nama)}
                                />
                            </FormField>
                        </Section>

                        <Section title="Standar overhaul">
                            {/* STANDAR */}
                            <FormField label="Standar" hint="Opsional" error={errors.standar}>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={form.standar}
                                    onChange={(e) => patch({ standar: e.target.value })}
                                    placeholder="Contoh: 6000"
                                    className={fieldClass(errors.standar)}
                                />
                            </FormField>

                            {/* SATUAN (chip + tombol hapus) */}
                            <FormField label="Satuan" error={errors.satuan}>
                                <div className="flex flex-wrap gap-1.5">
                                    {opsiSatuan.map((s) => {
                                        const active = form.satuan === s;

                                        return (
                                            <span
                                                key={s}
                                                className={`inline-flex h-[34px] items-stretch overflow-hidden rounded-lg border text-sm font-semibold transition ${
                                                    active
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        patch({ satuan: active ? '' : s, satuanBaru: '' })
                                                    }
                                                    aria-pressed={active}
                                                    className={`inline-flex cursor-pointer items-center gap-1 pl-3 pr-2 transition ${
                                                        active ? '' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {active && (
                                                        <Icon name="check" className="h-3.5 w-3.5" sw={2.5} />
                                                    )}
                                                    {s}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDel({ type: 'satuan', value: s })}
                                                    title={`Hapus satuan ${s}`}
                                                    aria-label={`Hapus satuan ${s}`}
                                                    className={`flex w-7 cursor-pointer items-center justify-center transition ${
                                                        active
                                                            ? 'text-white/70 hover:bg-white/20 hover:text-white'
                                                            : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                                                    }`}
                                                >
                                                    <Icon name="close" className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            patch({
                                                satuan: form.satuan === NEW_OPTION ? '' : NEW_OPTION,
                                                satuanBaru: '',
                                            })
                                        }
                                        aria-pressed={form.satuan === NEW_OPTION}
                                        className={`inline-flex h-[34px] cursor-pointer items-center gap-1 rounded-lg border border-dashed px-3 text-sm font-semibold transition ${
                                            form.satuan === NEW_OPTION
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon name="plus" className="h-3.5 w-3.5" />
                                        Baru
                                    </button>
                                </div>

                                {form.satuan === NEW_OPTION && (
                                    <input
                                        type="text"
                                        autoFocus
                                        value={form.satuanBaru}
                                        onChange={(e) => patch({ satuanBaru: e.target.value })}
                                        placeholder="Contoh: cycle"
                                        className={`${fieldClass(errors.satuan)} mt-2`}
                                    />
                                )}
                            </FormField>

                            {/* PRATINJAU */}
                            <div className="flex items-center justify-between rounded-xl bg-blue-50/70 px-4 py-3 sm:col-span-2">
                                <span className="text-sm text-slate-500">Tampil di tabel sebagai</span>
                                <span className="text-sm font-bold text-blue-700">{standarLabel}</span>
                            </div>
                        </Section>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Simpan data'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ===================== DIALOG KONFIRMASI SIMPAN ===================== */}
            {confirming && (
                <div
                    className="mfm-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setConfirming(false);
                    }}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="mfm-confirm-title"
                >
                    <div className="mfm-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/50">
                        <div className="px-6 pb-4 pt-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
                                <Icon name="question" className="h-7 w-7" />
                            </div>

                            <h3 id="mfm-confirm-title" className="text-lg font-bold text-slate-900">
                                {isEdit ? 'Simpan perubahan?' : 'Simpan data ini?'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Pastikan data di bawah sudah benar.
                            </p>
                        </div>

                        <dl className="mx-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 text-sm">
                            {[
                                ['Mesin', `${mesinFinal} (No. ${nomorOtomatis})`],
                                ['Nama', form.nama.trim()],
                                ['Total mesin', form.total_mesin],
                                ['Standar', standarLabel],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                                    <dt className="text-slate-500">{label}</dt>
                                    <dd className="text-right font-semibold text-slate-800">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="flex gap-2 px-6 py-5">
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                Periksa lagi
                            </button>

                            <button
                                type="button"
                                autoFocus
                                onClick={handleConfirm}
                                className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800"
                            >
                                Ya, simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== DIALOG HAPUS MESIN / SATUAN ===================== */}
            {del && (
                <div
                    className="mfm-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setDel(null);
                    }}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="mfm-del-title"
                >
                    <div className="mfm-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/50">
                        <div className="px-6 pb-2 pt-6 text-center">
                            <div
                                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-8 ${
                                    delBlocked
                                        ? 'bg-amber-50 text-amber-600 ring-amber-50/50'
                                        : 'bg-red-50 text-red-600 ring-red-50/50'
                                }`}
                            >
                                <Icon name="alert" className="h-7 w-7" />
                            </div>

                            <h3 id="mfm-del-title" className="text-lg font-bold text-slate-900">
                                {delBlocked
                                    ? 'Satuan masih dipakai'
                                    : del.type === 'mesin'
                                    ? `Hapus mesin ${del.value}?`
                                    : `Hapus satuan ${del.value}?`}
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                {delBlocked && (
                                    <>
                                        Satuan <b className="text-slate-700">{del.value}</b> dipakai oleh{' '}
                                        {delCount} data. Ganti satuan data tersebut terlebih dulu, baru
                                        satuan ini bisa dihapus.
                                    </>
                                )}

                                {!delBlocked && del.type === 'mesin' && (
                                    <>
                                        Seluruh <b className="text-slate-700">{delCount} data</b> milik mesin
                                        ini beserta jadwal Plan dan Act-nya akan disembunyikan dari daftar. Data tetap tersimpan di database dan bisa dipulihkan.
                                    </>
                                )}

                                {!delBlocked && del.type === 'satuan' && (
                                    <>Satuan ini tidak dipakai data mana pun dan akan dihapus dari pilihan.</>
                                )}
                            </p>
                        </div>

                        <div className="flex gap-2 px-6 py-5">
                            {delBlocked ? (
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => setDel(null)}
                                    className="flex-1 cursor-pointer rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                                >
                                    Mengerti
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setDel(null)}
                                        className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="button"
                                        autoFocus
                                        onClick={handleDelete}
                                        className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-600 hover:to-rose-700"
                                    >
                                        Ya, hapus
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
