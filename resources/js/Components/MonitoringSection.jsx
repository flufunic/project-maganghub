import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

const MINGGU = [1, 2, 3, 4, 5];

// =========================================================
// ICONS
// =========================================================
const ICONS = {
    edit: { paths: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'] },
    trash: { paths: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v5M14 11v5'] },
    plus: { sw: 2, paths: ['M12 5v14M5 12h14'] },
    close: { sw: 2, paths: ['M6 6l12 12M18 6L6 18'] },
    save: {
        paths: [
            'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z',
            'M17 21v-8H7v8',
            'M7 3v5h8',
        ],
    },
};

const Icon = ({ type, className = 'h-4 w-4' }) => {
    const icon = ICONS[type];

    if (!icon) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={icon.sw ?? 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {icon.paths.map((d, i) => (
                <path key={i} d={d} />
            ))}
        </svg>
    );
};

const IconButton = ({ title, onClick, variant = 'blue', children }) => {
    const variants = {
        blue: 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100',
        red: 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100',
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

// =========================================================
// DIALOG KONFIRMASI (simpan / edit / hapus)
// dialog = { title, message, confirmLabel, tone, icon, onConfirm }
// =========================================================
const ConfirmDialog = ({ dialog, onCancel }) => {
    if (!dialog) return null;

    const isRed = dialog.tone === 'red';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/40"
            >
                <div className="px-5 pb-4 pt-5">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                isRed ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}
                        >
                            <Icon
                                type={dialog.icon ?? (isRed ? 'trash' : 'save')}
                                className="h-5 w-5"
                            />
                        </span>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900">
                                {dialog.title}
                            </h2>

                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                {dialog.message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={() => dialog.onConfirm?.()}
                        className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-white transition ${
                            isRed
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {dialog.confirmLabel ?? 'Ya'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// STYLE
// =========================================================
const glassCard =
    'border border-white/40 bg-white/[0.93] shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl';

const th =
    'whitespace-nowrap border-r border-white/10 bg-[#0a1a4d] px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-white';

const td = 'border-b border-r border-slate-100 px-2 py-2 text-center text-xs';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';

// =========================================================
// FORMAT
// =========================================================
const fmt3 = (n) =>
    Number(n ?? 0).toLocaleString('id-ID', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });

const fmtSolar = (n) =>
    Number(n ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 4 });

const dataMinggu = (item, week) =>
    item.weeks?.find((w) => Number(w.week) === week);

// =========================================================
// INPUT ANGKA RUNNING HOURS (dipakai kedua tabel)
// =========================================================
function RunningInput({ value, onSave }) {
    const [v, setV] = useState(value ?? '');

    useEffect(() => {
        setV(value ?? '');
    }, [value]);

    const simpan = () => {
        const n = v === '' ? null : Number(v);

        if (n !== null && Number.isNaN(n)) return;
        if (n === (value ?? null)) return;

        onSave(n);
    };

    return (
        <input
            type="number"
            step="any"
            min="0"
            max="168"
            value={v}
            placeholder="jam"
            onChange={(e) => setV(e.target.value)}
            onBlur={simpan}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="w-full min-w-[72px] rounded border border-slate-200 bg-white px-1 py-1 text-center text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
    );
}

// =========================================================
// SEL FOTO PER MINGGU
// =========================================================
function FotoCell({ base, item, week, bulan, tahun, notify, konfirmasi }) {
    const data = dataMinggu(item, week);

    const upload = (file) => {
        if (!file) return;

        router.post(
            `${base}/monitoring/${item.id}/foto`,
            { tahun, bulan, week, foto: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errs) =>
                    notify(Object.values(errs)[0] || 'Foto gagal diupload.', 'error'),
            }
        );
    };

    const hapus = () => {
        konfirmasi({
            title: 'Hapus foto?',
            message: `Apakah kamu yakin ingin menghapus foto Week ${week} untuk "${item.nama_item}"?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () =>
                router.delete(`${base}/monitoring/${item.id}/foto`, {
                    data: { tahun, bulan, week },
                    preserveScroll: true,
                    onSuccess: () => notify('Foto berhasil dihapus.'),
                    onError: () => notify('Foto gagal dihapus.', 'error'),
                }),
        });
    };

    return (
        <div className="mx-auto flex h-24 w-28 flex-col items-center justify-center gap-1">
            {data?.foto_url ? (
                <div className="relative">
                    <a href={data.foto_url} target="_blank" rel="noreferrer">
                        <img
                            src={data.foto_url}
                            alt={`Week ${week}`}
                            className="h-20 w-28 rounded-lg border border-slate-200 object-cover"
                        />
                    </a>

                    <button
                        type="button"
                        onClick={hapus}
                        title="Hapus foto"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow"
                    >
                        <Icon type="close" className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-[11px] font-semibold text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
                    <Icon type="plus" className="h-4 w-4" />
                    Upload foto
                    <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                            upload(e.target.files[0]);
                            e.target.value = '';
                        }}
                    />
                </label>
            )}
        </div>
    );
}

// =========================================================
// MODAL TAMBAH / EDIT ITEM
// kind = 'monitoring' (nama item saja) | 'bbm' (type, kapasitas, solar)
// kali60 = true  -> Pompa Hydrant (Solar L/menit, rumus x 60)
//          false -> Generator     (Solar L/jam)
// =========================================================
function ItemModal({ base, kind, item, kali60, onClose, notify, konfirmasi }) {
    const isBbm = kind === 'bbm';
    const url = isBbm ? `${base}/bbm-items` : `${base}/monitoring-items`;

    const satuanSolar = kali60 ? 'L/menit' : 'L/jam';
    const rumus = kali60
        ? 'Konsumsi (L) = Solar (L/menit) × Running Hours (jam) × 60'
        : 'Konsumsi (L) = Solar (L/jam) × Running Hours (jam)';

    const [form, setForm] = useState({
        nama_item: item?.nama_item ?? '',
        kapasitas: item?.kapasitas ?? '',
        solar_per_menit: item?.solar_per_menit ?? '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const kirim = () => {
        const payload = isBbm ? form : { nama_item: form.nama_item };

        const opts = {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                notify(item ? 'Item berhasil diperbarui.' : 'Item berhasil ditambahkan.');
                onClose();
            },
            onError: (errs) => {
                setErrors(errs);
                notify('Data gagal disimpan. Periksa kembali isian kamu.', 'error');
            },
        };

        if (item) {
            router.put(`${url}/${item.id}`, payload, opts);
        } else {
            router.post(url, payload, opts);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        konfirmasi({
            title: item ? 'Simpan perubahan?' : 'Simpan data?',
            message: item
                ? 'Apakah kamu yakin ingin menyimpan perubahan ini?'
                : 'Apakah kamu yakin ingin menyimpan data ini?',
            confirmLabel: 'Ya, Simpan',
            tone: 'blue',
            icon: item ? 'edit' : 'save',
            onConfirm: kirim,
        });
    };

    const Err = ({ k }) =>
        errors[k] ? (
            <p className="mt-1 text-xs font-medium text-red-500">{errors[k]}</p>
        ) : null;

    const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030a26]/60 p-4 backdrop-blur-md">
            <form
                onSubmit={submit}
                className="w-full max-w-md space-y-4 rounded-2xl border border-white/50 bg-white p-6 shadow-2xl"
            >
                <h3 className="text-base font-bold text-slate-900">
                    {item ? 'Edit' : 'Tambah'} {isBbm ? 'Item Bahan Bakar' : 'Item Running Hours'}
                </h3>

                <div>
                    <label className={label}>
                        {isBbm ? 'Type / Merk' : 'Item'} <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={inputClass}
                        value={form.nama_item}
                        onChange={(e) => set('nama_item', e.target.value)}
                        placeholder={
                            isBbm
                                ? 'Contoh: CATERPILLAR / CAT000C9ELX901028'
                                : 'Contoh: GENSET CATERPILLAR'
                        }
                    />
                    <Err k="nama_item" />
                </div>

                {isBbm && (
                    <>
                        <div>
                            <label className={label}>Kapasitas</label>
                            <input
                                className={inputClass}
                                value={form.kapasitas}
                                onChange={(e) => set('kapasitas', e.target.value)}
                                placeholder="Contoh: 300 Kva"
                            />
                            <Err k="kapasitas" />
                        </div>

                        <div>
                            <label className={label}>
                                Solar ({satuanSolar}) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                className={inputClass}
                                value={form.solar_per_menit}
                                onChange={(e) => set('solar_per_menit', e.target.value)}
                                placeholder="Contoh: 0.315"
                            />
                            <p className="mt-1 text-xs text-slate-400">{rumus}</p>
                            <Err k="solar_per_menit" />
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// =========================================================
// AKSI (icon edit + hapus)
// =========================================================
const AksiIcons = ({ onEdit, onDelete }) => (
    <div className="flex justify-center gap-1.5">
        <IconButton title="Edit" onClick={onEdit} variant="blue">
            <Icon type="edit" />
        </IconButton>
        <IconButton title="Hapus" onClick={onDelete} variant="red">
            <Icon type="trash" />
        </IconButton>
    </div>
);

// =========================================================
// MAIN
// =========================================================
export default function MonitoringSection({
    checkSheet,
    bulan,
    tahun,
    namaBulan,
    pakaiBbm,
    notify,
}) {
    const base = `/check-sheets/${checkSheet.id}`;
    const monItems = checkSheet.monitoring_items ?? [];
    const bbmItems = checkSheet.bbm_items ?? [];

    // Rumus konsumsi mengikuti jenis check sheet:
    // - Generator     : Solar (L/jam)   x Running Hours
    // - Pompa Hydrant : Solar (L/menit) x Running Hours x 60
    const kali60 = Boolean(checkSheet.bbm_kali_60);
    const satuanSolar = kali60 ? 'L/menit' : 'L/jam';

    // false = tutup, { kind, item } = buka (item null = tambah baru)
    const [modal, setModal] = useState(false);

    // Dialog konfirmasi: { title, message, confirmLabel, tone, icon, onConfirm }
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Tutup dialog dulu, baru jalankan aksinya
    const konfirmasi = (cfg) =>
        setConfirmDialog({
            ...cfg,
            onConfirm: () => {
                setConfirmDialog(null);
                cfg.onConfirm?.();
            },
        });

    // ---------- Tabel Running Hours ----------
    const simpanActual = (item, week, nilai) => {
        router.post(
            `${base}/monitoring/${item.id}/running`,
            { tahun, bulan, week, running_hours: nilai },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    notify('Running hours gagal disimpan (maks. 168 jam/minggu).', 'error'),
            }
        );
    };

    const hapusMon = (item) => {
        konfirmasi({
            title: 'Hapus item Running Hours?',
            message: `Apakah kamu yakin ingin menghapus ${item.nama_item}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () =>
                router.delete(`${base}/monitoring-items/${item.id}`, {
                    preserveScroll: true,
                    onSuccess: () => notify('Item berhasil dihapus.'),
                    onError: () => notify('Data gagal dihapus.', 'error'),
                }),
        });
    };

    // ---------- Tabel Konsumsi BBM (input sendiri) ----------
    const simpanBbmRunning = (item, week, nilai) => {
        router.post(
            `${base}/bbm/${item.id}/running`,
            { tahun, bulan, week, running_hours: nilai },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    notify('Running hours gagal disimpan (maks. 168 jam/minggu).', 'error'),
            }
        );
    };

    const hapusBbm = (item) => {
        konfirmasi({
            title: 'Hapus item Bahan Bakar?',
            message: `Apakah kamu yakin ingin menghapus ${item.nama_item}?`,
            confirmLabel: 'Ya, Hapus',
            tone: 'red',
            icon: 'trash',
            onConfirm: () =>
                router.delete(`${base}/bbm-items/${item.id}`, {
                    preserveScroll: true,
                    onSuccess: () => notify('Item berhasil dihapus.'),
                    onError: () => notify('Data gagal dihapus.', 'error'),
                }),
        });
    };

    const kosong = (span) => (
        <tr>
            <td colSpan={span} className="px-6 py-10 text-center text-sm text-slate-400">
                Belum ada item. Klik tombol Tambah untuk mulai.
            </td>
        </tr>
    );

    const TombolTambah = ({ onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-3 text-xs font-bold text-white hover:from-blue-700 hover:to-indigo-800"
        >
            <Icon type="plus" className="h-3.5 w-3.5" />
            Tambah
        </button>
    );

    return (
        <>
            {/* ================= TABEL: MONITORING RUNNING HOURS ================= */}
            <section className={`mb-4 overflow-hidden rounded-2xl ${glassCard}`}>
                <div className="flex flex-col gap-2 border-b border-slate-100 bg-blue-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <h2 className="text-sm font-bold text-slate-900">
                            Monitoring Running Hours {namaBulan} {tahun}
                        </h2>
                    </div>

                    <TombolTambah onClick={() => setModal({ kind: 'monitoring', item: null })} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr>
                                <th rowSpan={2} className={`${th} w-12`}>No</th>
                                <th rowSpan={2} className={`${th} min-w-[220px] text-left`}>Item</th>
                                <th colSpan={5} className={th}>Foto</th>
                                <th rowSpan={2} className={`${th} w-24`}>Aksi</th>
                            </tr>
                            <tr>
                                {MINGGU.map((n) => (
                                    <th key={n} className={`${th} min-w-[140px]`}>
                                        Week {n}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {monItems.length === 0
                                ? kosong(8)
                                : monItems.map((item) => (
                                      <React.Fragment key={item.id}>
                                          {/* baris foto */}
                                          <tr>
                                              <td rowSpan={2} className={`${td} font-bold text-slate-500`}>
                                                  {item.no}
                                              </td>

                                              <td className={`${td} text-left font-semibold text-slate-800`}>
                                                  {item.nama_item}
                                              </td>

                                              {MINGGU.map((n) => (
                                                  <td key={n} className={td}>
                                                      <FotoCell
                                                          base={base}
                                                          item={item}
                                                          week={n}
                                                          bulan={bulan}
                                                          tahun={tahun}
                                                          notify={notify}
                                                          konfirmasi={konfirmasi}
                                                      />
                                                  </td>
                                              ))}

                                              <td rowSpan={2} className={td}>
                                                  <AksiIcons
                                                      onEdit={() => setModal({ kind: 'monitoring', item })}
                                                      onDelete={() => hapusMon(item)}
                                                  />
                                              </td>
                                          </tr>

                                          {/* baris actual running */}
                                          <tr>
                                              <td className={`${td} bg-slate-50 text-left font-semibold text-slate-600`}>
                                                  Actual Running (jam)
                                              </td>

                                              {MINGGU.map((n) => (
                                                  <td key={n} className={`${td} bg-slate-50`}>
                                                      <RunningInput
                                                          value={dataMinggu(item, n)?.running_hours ?? null}
                                                          onSave={(nilai) => simpanActual(item, n, nilai)}
                                                      />
                                                  </td>
                                              ))}
                                          </tr>
                                      </React.Fragment>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ================= TABEL: MONITORING KONSUMSI BAHAN BAKAR ================= */}
            {pakaiBbm && (
                <section className={`mb-4 overflow-hidden rounded-2xl ${glassCard}`}>
                    <div className="flex flex-col gap-2 border-b border-slate-100 bg-amber-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <h2 className="text-sm font-bold text-slate-900">
                                Monitoring Konsumsi Bahan Bakar {namaBulan} {tahun}
                            </h2>
                            <span className="text-xs text-slate-400">
                                ·{' '}
                                {kali60
                                    ? 'Konsumsi (L) = Solar (L/menit) × Running Hours (jam) × 60'
                                    : 'Konsumsi (L) = Solar (L/jam) × Running Hours (jam)'}
                            </span>
                        </div>

                        <TombolTambah onClick={() => setModal({ kind: 'bbm', item: null })} />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr>
                                    <th className={`${th} w-12`}>No</th>
                                    <th className={`${th} min-w-[200px] text-left`}>Type / Merk</th>
                                    <th className={`${th} w-28`}>Kapasitas</th>
                                    <th colSpan={2} className={th}>Solar ({satuanSolar})</th>
                                    {MINGGU.map((n) => (
                                        <th key={n} className={`${th} min-w-[90px]`}>
                                            W{n}
                                        </th>
                                    ))}
                                    <th className={`${th} min-w-[130px]`}>Total</th>
                                    <th className={`${th} w-24`}>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bbmItems.length === 0
                                    ? kosong(13)
                                    : bbmItems.map((item) => {
                                          const r = item.ringkasan;

                                          return (
                                              <React.Fragment key={item.id}>
                                                  {/* baris Running Hours (input) */}
                                                  <tr>
                                                      <td rowSpan={2} className={`${td} font-bold text-slate-500`}>
                                                          {item.no}
                                                      </td>
                                                      <td rowSpan={2} className={`${td} text-left font-semibold text-slate-800`}>
                                                          {item.nama_item}
                                                      </td>
                                                      <td rowSpan={2} className={td}>
                                                          {item.kapasitas || '-'}
                                                      </td>
                                                      <td rowSpan={2} className={`${td} w-20 font-bold text-blue-700`}>
                                                          {fmtSolar(item.solar_per_menit)}
                                                      </td>

                                                      <td className={`${td} whitespace-nowrap bg-slate-50 font-semibold text-slate-600`}>
                                                          Running Hours
                                                      </td>

                                                      {MINGGU.map((n) => (
                                                          <td key={n} className={td}>
                                                              <RunningInput
                                                                  value={dataMinggu(item, n)?.running_hours ?? null}
                                                                  onSave={(nilai) => simpanBbmRunning(item, n, nilai)}
                                                              />
                                                          </td>
                                                      ))}

                                                      <td className={`${td} bg-slate-50 font-bold text-slate-800`}>
                                                          {fmt3(r?.total_running)} Hours
                                                      </td>

                                                      <td rowSpan={2} className={td}>
                                                          <AksiIcons
                                                              onEdit={() => setModal({ kind: 'bbm', item })}
                                                              onDelete={() => hapusBbm(item)}
                                                          />
                                                      </td>
                                                  </tr>

                                                  {/* baris Konsumsi Solar (otomatis) */}
                                                  <tr>
                                                      <td className={`${td} whitespace-nowrap bg-amber-50/60 font-semibold text-slate-600`}>
                                                          Konsumsi Solar
                                                      </td>

                                                      {MINGGU.map((n) => (
                                                          <td key={n} className={`${td} bg-amber-50/60 font-semibold text-amber-700`}>
                                                              {fmt3(r?.per_minggu?.[n]?.konsumsi)}
                                                          </td>
                                                      ))}

                                                      <td className={`${td} bg-amber-50 font-bold text-amber-700`}>
                                                          {fmt3(r?.total_konsumsi)} / Liter
                                                      </td>
                                                  </tr>
                                              </React.Fragment>
                                          );
                                      })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {modal !== false && (
                <ItemModal
                    base={base}
                    kind={modal.kind}
                    item={modal.item}
                    kali60={kali60}
                    onClose={() => setModal(false)}
                    notify={notify}
                    konfirmasi={konfirmasi}
                />
            )}

            {/* DIALOG KONFIRMASI (simpan / edit / hapus) */}
            <ConfirmDialog
                dialog={confirmDialog}
                onCancel={() => setConfirmDialog(null)}
            />
        </>
    );
}