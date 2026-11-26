import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    ExternalLink,
    Eye,
    FilePlus2,
    FileSpreadsheet,
    Image as ImageIcon,
    MapPin,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldCheck,
    Wrench,
    X,
} from 'lucide-react';
import ProduksiLayout from '../../../Components/ProduksiLayout';

/* ------------------------------------------------------------------
| KONSTANTA & STYLE TOKEN
------------------------------------------------------------------ */
const STATUS_RRF = {
    draft: ['Menunggu Diisi', 'border-sky-200 bg-sky-50 text-sky-700'],
    revisi: ['Perlu Revisi', 'border-rose-200 bg-rose-50 text-rose-700'],
    menunggu_verifikasi: ['Menunggu Verifikasi', 'border-amber-200 bg-amber-50 text-amber-700'],
    terverifikasi: ['Completed', 'border-emerald-200 bg-emerald-50 text-emerald-700'],
};

const card =
    'rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]';

const TONES = {
    blue: { bar: 'from-blue-500 to-indigo-600', soft: 'bg-blue-50 text-blue-600', ring: 'ring-blue-300/70' },
    sky: { bar: 'from-sky-400 to-cyan-600', soft: 'bg-sky-50 text-sky-600', ring: 'ring-sky-300/70' },
    rose: { bar: 'from-rose-400 to-pink-600', soft: 'bg-rose-50 text-rose-600', ring: 'ring-rose-300/70' },
    amber: { bar: 'from-amber-400 to-orange-500', soft: 'bg-amber-50 text-amber-600', ring: 'ring-amber-300/70' },
    emerald: { bar: 'from-emerald-400 to-green-600', soft: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-300/70' },
};

const CONFIRM_TONES = {
    blue: { icon: 'bg-blue-50 text-blue-600 ring-blue-100', button: 'from-blue-600 to-indigo-600 shadow-blue-500/30', bar: 'from-blue-500 via-indigo-500 to-violet-500' },
    green: { icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100', button: 'from-emerald-500 to-green-600 shadow-emerald-500/30', bar: 'from-emerald-400 via-green-500 to-teal-500' },
    red: { icon: 'bg-rose-50 text-rose-600 ring-rose-100', button: 'from-rose-500 to-red-600 shadow-rose-500/30', bar: 'from-rose-400 via-red-500 to-orange-500' },
};

const delay = (ms) => ({ animationDelay: `${ms}ms` });
const kosong = (v) => v === null || v === undefined || v === '';

/* ------------------------------------------------------------------
| MODAL (PORTAL KE document.body)
| Penting: modal harus keluar dari wrapper layout. Wrapper layout punya
| animasi transform (rrf-rise), dan elemen `fixed` di dalam parent yang
| ber-transform akan "terkurung" mengikuti parent, bukan layar penuh.
------------------------------------------------------------------ */
function ModalPortal({ open, onClose, locked = false, z = 'z-[9999]', children }) {
    useEffect(() => {
        if (!open) return undefined;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape' && !locked) onClose?.();
        };
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, locked, onClose]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`qm-fade fixed inset-0 ${z} flex items-end justify-center overflow-y-auto bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5`}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !locked) onClose?.();
            }}
        >
            {children}
        </div>,
        document.body
    );
}

/* ------------------------------------------------------------------
| MODAL KONFIRMASI
------------------------------------------------------------------ */
function ConfirmationModal({
    open,
    title,
    description,
    children,
    confirmText = 'Ya, lanjutkan',
    cancelText = 'Batal',
    tone = 'blue',
    loading = false,
    icon: Icon = AlertCircle,
    onConfirm,
    onCancel,
}) {
    const t = CONFIRM_TONES[tone] ?? CONFIRM_TONES.blue;

    return (
        <ModalPortal open={open} onClose={onCancel} locked={loading} z="z-[10000]">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                className="qm-pop relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30 sm:rounded-3xl"
            >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.bar}`} />

                <div className="px-7 pb-5 pt-9 text-center">
                    <div className={`qm-icon-pop mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ring-8 ${t.icon}`}>
                        <Icon className="h-8 w-8" />
                    </div>

                    <h3 id="confirmation-title" className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                        {title}
                    </h3>

                    {description && (
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
                    )}

                    {children && <div className="mt-4 text-left">{children}</div>}
                </div>

                <div className="flex gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`group relative flex-1 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r px-4 py-3 text-xs font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${t.button}`}
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                        <span className="relative inline-flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Memproses...
                                </>
                            ) : (
                                confirmText
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </ModalPortal>
    );
}

/* ------------------------------------------------------------------
| KOMPONEN KECIL
------------------------------------------------------------------ */
function DetailField({ label, value, wide = false }) {
    return (
        <div
            className={`rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 transition-colors hover:border-blue-100 hover:bg-blue-50/40 ${
                wide ? 'sm:col-span-2' : ''
            }`}
        >
            <p className="text-[11px] font-medium text-slate-400">{label}</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-[13px] font-semibold leading-5 text-slate-700">
                {kosong(value) ? '-' : value}
            </p>
        </div>
    );
}

function SectionHeading({ color = 'bg-blue-600', children, icon: Icon }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : <span className={`h-4 w-1 rounded-full ${color}`} />}
            <h3 className="text-xs font-bold tracking-wide text-slate-500">{children}</h3>
        </div>
    );
}

function AlertBanner({ tone = 'success', children, onClose }) {
    const ok = tone === 'success';
    const Icon = ok ? CheckCircle2 : AlertCircle;

    return (
        <div
            role="status"
            className={`qm-slide-down relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 pl-5 shadow-sm ${
                ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
        >
            <span className={`absolute inset-y-0 left-0 w-1 ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">{children}</p>
            <button
                type="button"
                onClick={onClose}
                aria-label="Tutup pesan"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-60 transition hover:bg-black/5 hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------
| MODAL DETAIL REPAIR
------------------------------------------------------------------ */
function DetailModal({ repair, statusLabel, statusClass, formatStatus, urlExport, onClose }) {
    const [foto, setFoto] = useState(null);

    if (!repair) return null;

    const grup = [
        {
            judul: 'Mesin & lokasi',
            warna: 'bg-blue-600',
            data: [
                ['Lokasi', repair.location],
                ['Mesin', repair.machine],
                ['Nomor Mesin', repair.machine_no],
                ['Asset Number', repair.asset_no],
                ['Kelas Mesin', repair.machine_class],
                ['Divisi', repair.division_pelapor],
                ['Jenis Permintaan', repair.jenis_permintaan],
            ],
        },
        {
            judul: 'Waktu pengerjaan',
            warna: 'bg-cyan-500',
            data: [
                ['Tanggal Perbaikan', repair.repair_date],
                ['Mulai Permintaan', repair.req_start_at],
                ['Selesai Permintaan', repair.req_finish_at],
                ['Durasi (menit)', repair.req_duration_minutes],
                ['Waktu Diperbaiki', repair.repaired_at],
                ['Shift', repair.shift_kerja],
            ],
        },
        {
            judul: 'Personel',
            warna: 'bg-violet-500',
            data: [
                ['Pemohon', repair.requested_by],
                ['Pengaju', repair.submitted_by_frm],
                ['Supervisor', repair.supervisor],
                ['Teknisi MTC', repair.mtc_name],
                ['Judge', repair.judge],
            ],
        },
        {
            judul: 'Part',
            warna: 'bg-amber-500',
            data: [
                ['Part', repair.part_name],
                ['Model Part', repair.part_model_type],
            ],
        },
    ];

    const uraian = [
        ['Permasalahan', repair.problem],
        ['Aktivitas Permintaan', repair.request_activity],
        ['Counter Measure', repair.counter_measure],
        ['Deskripsi Kelas', repair.machine_class_description],
        ['Analisa', repair.analisa],
        ['Perbaikan', repair.perbaikan],
    ];

    const bisaExport = repair.has_rrf && repair.rrf_local_status === 'terverifikasi';

    return (
        <>
            <ModalPortal open onClose={onClose} locked={!!foto}>
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="detail-title"
                    className="qm-pop relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[90vh] sm:rounded-3xl"
                >
                    <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

                    {/* HEADER */}
                    <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/70 px-5 pb-4 pt-6 sm:px-7">
                        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-blue-200/40 blur-3xl" />

                        <div className="relative flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                    <Wrench className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <h2 id="detail-title" className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                                        {repair.machine ?? 'Detail Repair QMOS'}
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        QMOS-{repair.qmos_repair_id}
                                        {repair.rrf_no ? ` / ${repair.rrf_no}` : ''}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Tutup detail"
                                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition duration-300 hover:rotate-90 hover:bg-slate-100 hover:text-slate-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="relative mt-4 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${statusClass}`}>
                                RRF: {statusLabel}
                            </span>
                            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                                QMOS: {formatStatus(repair.status)}
                            </span>
                            {repair.machine_class && (
                                <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                    Class {repair.machine_class}
                                </span>
                            )}
                            {repair.location && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                                    <MapPin className="h-3 w-3 text-slate-400" /> {repair.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="qm-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                        <div className="space-y-6">
                            {grup.map((g) => (
                                <section key={g.judul}>
                                    <SectionHeading color={g.warna}>{g.judul}</SectionHeading>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                        {g.data.map(([label, value]) => (
                                            <DetailField key={label} label={label} value={value} />
                                        ))}
                                    </div>
                                </section>
                            ))}

                            <section>
                                <SectionHeading color="bg-rose-500">Deskripsi dan tindakan</SectionHeading>
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                    {uraian.map(([label, value]) => (
                                        <DetailField key={label} label={label} value={value} wide />
                                    ))}
                                </div>
                            </section>

                            {['before', 'after'].map((tipe) => {
                                const fotos = (repair.photos ?? []).filter((f) => f.tipe === tipe);
                                if (!fotos.length) return null;

                                return (
                                    <section key={tipe}>
                                        <SectionHeading icon={ImageIcon}>
                                            Foto {tipe === 'before' ? 'sebelum perbaikan' : 'sesudah perbaikan'}
                                        </SectionHeading>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                            {fotos.map((f, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setFoto(f.url)}
                                                    className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left"
                                                >
                                                    <img
                                                        src={f.url}
                                                        alt={`Foto ${tipe}`}
                                                        className="h-32 w-full object-cover transition duration-500 group-hover:scale-110"
                                                    />
                                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-2.5 pb-2 pt-6 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                                        Perbesar foto
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-7">
                        <div>
                            {bisaExport && (
                                <a
                                    href={urlExport(repair.rrf_id)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                >
                                    <FileSpreadsheet className="h-4 w-4" /> Export Excel
                                </a>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[.98]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </ModalPortal>

            {/* LIGHTBOX FOTO */}
            <ModalPortal open={!!foto} onClose={() => setFoto(null)} z="z-[10001]">
                <div className="qm-pop relative flex max-h-full w-full max-w-5xl items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setFoto(null)}
                        aria-label="Tutup foto"
                        className="absolute right-6 top-6 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {foto && <img src={foto} alt="Foto repair" className="max-h-[88vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" />}
                </div>
            </ModalPortal>
        </>
    );
}

/* ------------------------------------------------------------------
| HALAMAN
------------------------------------------------------------------ */
export default function Index({ repairs = {}, filters = {}, canCreateRrf = false, role = null, ringkasanRrf = {} }) {
    const isPimpinan = role === 'pimpinan';
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusRrf, setStatusRrf] = useState(filters.status_rrf ?? '');
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [confirmRepair, setConfirmRepair] = useState(null);
    const [creatingRrf, setCreatingRrf] = useState(false);
    const [ditutup, setDitutup] = useState([]);
    const { flash = {}, errors = {} } = usePage().props;

    const pesanSukses = flash.success;
    const pesanError = flash.error || errors.repair;

    // Pesan sukses hilang sendiri setelah 6 detik
    useEffect(() => {
        if (!pesanSukses || ditutup.includes(pesanSukses)) return undefined;
        const timer = setTimeout(() => setDitutup((d) => [...d, pesanSukses]), 6000);
        return () => clearTimeout(timer);
    }, [pesanSukses, ditutup]);

    const tutupPesan = (pesan) => setDitutup((d) => [...d, pesan]);

    const urlExportRrf = (rrfId) => `/mtc/rrf/${rrfId}/export`;

    const kirimFilter = (s, st) =>
        router.get('/mtc/rrf/repair-mtc', { search: s, status_rrf: st }, { preserveState: true, preserveScroll: true, replace: true });

    const pilihKartu = (status) => {
        setStatusRrf(status);
        kirimFilter(search, status);
    };

    const cariData = (event) => {
        event.preventDefault();
        kirimFilter(search, statusRrf);
    };

    const resetPencarian = () => {
        setSearch('');
        kirimFilter('', statusRrf);
    };

    const sinkronisasi = () => {
        if (loading) return;
        router.post('/mtc/rrf/repair-mtc/sync', {}, {
            preserveScroll: true,
            onStart: () => setLoading(true),
            onSuccess: (page) => console.log('FLASH:', page.props.flash),
            onError: (err) => console.log('ERROR:', err),
            onFinish: () => setLoading(false),
        });
    };

    const formatStatus = (status) =>
        !status ? '-' : String(status).replaceAll('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

    const tampilStatus = (repair) => {
        if (repair.rrf_local_status && STATUS_RRF[repair.rrf_local_status]) return STATUS_RRF[repair.rrf_local_status];
        const selesai = repair.status?.toLowerCase() === 'completed';
        return [
            formatStatus(repair.status),
            selesai ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700',
        ];
    };

    const buatRrf = (repair) => {
        if (repair.has_rrf || !canCreateRrf || creatingRrf) return;
        setConfirmRepair(repair);
    };

    const konfirmasiBuatRrf = () => {
        if (!confirmRepair || creatingRrf) return;
        router.post(`/mtc/rrf/repair-mtc/${confirmRepair.id}/buat-rrf`, {}, {
            preserveScroll: true,
            onStart: () => setCreatingRrf(true),
            onFinish: () => {
                setCreatingRrf(false);
                setConfirmRepair(null);
            },
        });
    };

    const bukaHalaman = (url) => url && router.get(url, {}, { preserveState: true, preserveScroll: true });

    const kartuRingkasan = isPimpinan
        ? [
              { kode: '', judul: 'Semua data', jumlah: ringkasanRrf.semua ?? 0, icon: ClipboardList, color: 'blue', helper: 'Total repair' },
              { kode: 'menunggu_verifikasi', judul: 'Menunggu verifikasi', jumlah: ringkasanRrf.menungguVerifikasi ?? 0, icon: ShieldCheck, color: 'amber', helper: 'Perlu tindakan' },
              { kode: 'terverifikasi', judul: 'Completed', jumlah: ringkasanRrf.completed ?? 0, icon: CheckCircle2, color: 'emerald', helper: 'Sudah selesai' },
          ]
        : [
              { kode: '', judul: 'Semua data', jumlah: ringkasanRrf.semua ?? 0, icon: ClipboardList, color: 'blue', helper: 'Total repair' },
              { kode: 'draft', judul: 'Menunggu lengkapi RRF', jumlah: ringkasanRrf.menungguDiisi ?? 0, icon: Clock3, color: 'sky', helper: 'Belum dilengkapi' },
              { kode: 'revisi', judul: 'Perlu revisi', jumlah: ringkasanRrf.revisi ?? 0, icon: RotateCcw, color: 'rose', helper: 'Perlu diperbaiki' },
              { kode: 'menunggu_verifikasi', judul: 'Menunggu verifikasi', jumlah: ringkasanRrf.menungguVerifikasi ?? 0, icon: ShieldCheck, color: 'amber', helper: 'Menunggu pimpinan' },
              { kode: 'terverifikasi', judul: 'Completed', jumlah: ringkasanRrf.completed ?? 0, icon: CheckCircle2, color: 'emerald', helper: 'Sudah selesai' },
          ];

    const judulHalaman = isPimpinan ? 'Verifikasi Repair QMOS' : 'Data Repair QMOS';
    const kolom = ['ID QMOS', 'Tanggal', 'Divisi', 'Lokasi', 'Mesin', 'Class', 'Permasalahan', 'Jadwal', 'Status', 'Aksi'];
    const [selLabel, selClass] = selected ? tampilStatus(selected) : ['', ''];

    return (
        <ProduksiLayout>
            <Head title={judulHalaman} />

            <style>{`
                @keyframes qmRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes qmFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes qmPop { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes qmSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes qmIconPop { 0% { transform: scale(.5) rotate(-12deg); opacity: 0; } 60% { transform: scale(1.12) rotate(4deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
                @keyframes qmShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

                .qm-rise { animation: qmRise .65s cubic-bezier(.22,1,.36,1) backwards; }
                .qm-fade { animation: qmFade .22s ease-out both; }
                .qm-pop { animation: qmPop .38s cubic-bezier(.22,1,.36,1) both; }
                .qm-slide-down { animation: qmSlideDown .35s cubic-bezier(.22,1,.36,1) both; }
                .qm-icon-pop { animation: qmIconPop .5s .1s cubic-bezier(.22,1,.36,1) both; }
                .qm-shimmer { background-size: 200% 100%; animation: qmShimmer 6s linear infinite; }

                .qm-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .qm-scroll::-webkit-scrollbar-track { background: transparent; }
                .qm-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                .qm-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

                @media (prefers-reduced-motion: reduce) {
                    .qm-rise, .qm-fade, .qm-pop, .qm-slide-down, .qm-icon-pop, .qm-shimmer { animation: none !important; }
                }
            `}</style>

            <div className="space-y-4 pb-2">
                {/* HEADER HALAMAN */}
                <section className={`qm-rise relative overflow-hidden px-4 py-4 sm:px-5 ${card}`}>
                    <div className="qm-shimmer absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 via-cyan-400 to-blue-500" />

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
                                    isPimpinan
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                                }`}
                            >
                                {isPimpinan ? <ShieldCheck className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg font-bold tracking-tight text-slate-900">{judulHalaman}</h1>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                        Maintenance
                                    </span>
                                </div>
                                <p className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">
                                    {isPimpinan
                                        ? 'Pantau antrean repair dan verifikasi RRF yang sudah diajukan.'
                                        : 'Kelola permintaan perbaikan yang terhubung dari QMOS.'}
                                </p>
                            </div>
                        </div>

                        {/* TOMBOL SINKRONKAN API */}
                        {canCreateRrf && (
                            <button
                                type="button"
                                onClick={sinkronisasi}
                                disabled={loading}
                                className="group relative inline-flex h-10 cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />
                                <RefreshCw className={`relative h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="relative">{loading ? 'Menyinkronkan...' : 'Sinkronkan API'}</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* ALERT */}
                {((pesanSukses && !ditutup.includes(pesanSukses)) || (pesanError && !ditutup.includes(pesanError))) && (
                    <div className="space-y-2">
                        {pesanSukses && !ditutup.includes(pesanSukses) && (
                            <AlertBanner tone="success" onClose={() => tutupPesan(pesanSukses)}>
                                {pesanSukses}
                            </AlertBanner>
                        )}
                        {pesanError && !ditutup.includes(pesanError) && (
                            <AlertBanner tone="error" onClose={() => tutupPesan(pesanError)}>
                                {pesanError}
                            </AlertBanner>
                        )}
                    </div>
                )}

                {/* KARTU RINGKASAN = FILTER */}
                <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${isPimpinan ? 'xl:grid-cols-3' : 'xl:grid-cols-5'}`}>
                    {kartuRingkasan.map((kartu, index) => {
                        const Icon = kartu.icon;
                        const tone = TONES[kartu.color];
                        const aktif = statusRrf === kartu.kode;

                        return (
                            <button
                                key={kartu.judul}
                                type="button"
                                onClick={() => pilihKartu(kartu.kode)}
                                style={delay(index * 70)}
                                title={`Tampilkan: ${kartu.judul}`}
                                className={`qm-rise group relative cursor-pointer overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${card} ${
                                    aktif ? `ring-2 ${tone.ring}` : ''
                                }`}
                            >
                                <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${tone.bar}`} />

                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-500">{kartu.judul}</p>
                                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                                            {Number(kartu.jumlah).toLocaleString('id-ID')}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-400">{kartu.helper}</p>
                                    </div>

                                    <span
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${tone.soft}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </span>
                                </div>

                                <div className="mt-3 flex h-4 items-center">
                                    {aktif ? (
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                            Filter aktif
                                        </span>
                                    ) : (
                                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* PANEL TABEL */}
                <section style={delay(260)} className={`qm-rise overflow-hidden ${card}`}>
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold tracking-tight text-slate-900">
                                    {isPimpinan ? 'Antrean verifikasi' : 'Antrean repair dari QMOS'}
                                </h2>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                    {Number(repairs.total ?? 0).toLocaleString('id-ID')} data
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                {isPimpinan
                                    ? 'Data yang menunggu verifikasi tampil paling atas.'
                                    : 'Data repair yang tersimpan lewat sinkronisasi QMOS.'}
                            </p>
                        </div>

                        <form onSubmit={cariData} className="flex w-full gap-2 sm:max-w-[380px]">
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari mesin, lokasi, divisi..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={resetPencarian}
                                        aria-label="Hapus pencarian"
                                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#102b63] px-4 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 active:translate-y-0"
                            >
                                <Search className="h-3.5 w-3.5" /> Cari
                            </button>
                        </form>
                    </div>

                    <div className="qm-scroll overflow-x-auto">
                        <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-sm">
                            <thead>
                                <tr className="bg-[#0b1a4d]">
                                    {kolom.map((judul) => (
                                        <th
                                            key={judul}
                                            className={`whitespace-nowrap border-b border-r border-white/10 bg-gradient-to-b from-[#0b1a4d] to-[#10266b] px-4 py-3.5 text-xs font-semibold text-white/90 first:pl-5 last:border-r-0 last:pr-5 ${
                                                judul === 'Aksi' ? 'text-center' : 'text-left'
                                            }`}
                                        >
                                            {judul}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {!repairs.data?.length ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <ClipboardList className="h-7 w-7" />
                                                </div>
                                                <p className="font-semibold text-slate-700">Belum ada data repair</p>
                                                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-400">
                                                    {statusRrf
                                                        ? 'Tidak ada data dengan status yang dipilih. Coba pilih kartu lain.'
                                                        : isPimpinan
                                                        ? 'Belum ada RRF dari Maintenance yang perlu diverifikasi.'
                                                        : canCreateRrf
                                                        ? 'Klik Sinkronkan API untuk mengambil data terbaru dari QMOS.'
                                                        : 'Belum ada data repair yang tersimpan.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    repairs.data.map((repair, index) => {
                                        const [labelStatus, kelasStatus] = tampilStatus(repair);
                                        const perluVerifikasi = isPimpinan && repair.rrf_local_status === 'menunggu_verifikasi';
                                        const bisaExport = repair.has_rrf && repair.rrf_local_status === 'terverifikasi';

                                        return (
                                            <tr
                                                key={repair.id}
                                                className={`transition-colors duration-200 hover:bg-blue-50/50 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                }`}
                                            >
                                                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3.5 pl-5">
                                                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                                                        QMOS-{repair.qmos_repair_id}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                    {repair.repair_date ?? '-'}
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5 text-xs font-semibold text-slate-700">
                                                    {repair.division_pelapor ?? '-'}
                                                </td>

                                                <td className="max-w-[160px] border-b border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                    <span className="inline-flex items-start gap-1.5">
                                                        <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                                                        <span>{repair.location ?? '-'}</span>
                                                    </span>
                                                </td>

                                                <td className="max-w-[220px] border-b border-slate-100 px-4 py-3.5">
                                                    <p className="text-xs font-semibold leading-4 text-slate-800">{repair.machine ?? '-'}</p>
                                                    <p className="mt-1 text-[11px] text-slate-400">{repair.machine_no ?? repair.asset_no ?? '-'}</p>
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5">
                                                    <span className="inline-flex whitespace-nowrap rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                                                        {repair.machine_class ?? '-'}
                                                    </span>
                                                </td>

                                                <td className="max-w-[210px] border-b border-slate-100 px-4 py-3.5 text-xs leading-4 text-slate-600">
                                                    <p className="line-clamp-2">{repair.problem ?? '-'}</p>
                                                </td>

                                                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3.5 text-xs text-slate-600">
                                                    {repair.req_start_at ?? '-'}
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5">
                                                    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${kelasStatus}`}>
                                                        {labelStatus}
                                                    </span>
                                                </td>

                                                <td className="border-b border-slate-100 px-4 py-3.5 pr-5">
                                                    <div className="flex min-w-max items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelected(repair)}
                                                            title="Detail repair"
                                                            aria-label="Detail repair"
                                                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/30 active:translate-y-0"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {repair.has_rrf ? (
                                                            <Link
                                                                href={`/mtc/rrf/${repair.rrf_id}`}
                                                                title={perluVerifikasi ? 'Verifikasi RRF' : 'Lihat RRF'}
                                                                aria-label={perluVerifikasi ? 'Verifikasi RRF' : 'Lihat RRF'}
                                                                className={
                                                                    perluVerifikasi
                                                                        ? 'inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 text-[11px] font-semibold text-white shadow-sm shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
                                                                        : 'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-500/30'
                                                                }
                                                            >
                                                                {perluVerifikasi ? (
                                                                    <>
                                                                        <ShieldCheck className="h-3.5 w-3.5" /> Verifikasi
                                                                    </>
                                                                ) : (
                                                                    <ExternalLink className="h-4 w-4" />
                                                                )}
                                                            </Link>
                                                        ) : canCreateRrf ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => buatRrf(repair)}
                                                                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                                                            >
                                                                <FilePlus2 className="h-3.5 w-3.5" /> Buat RRF
                                                            </button>
                                                        ) : (
                                                            <span className="px-1 text-[11px] font-medium text-slate-400">Belum dibuat</span>
                                                        )}

                                                        {bisaExport && (
                                                            <a
                                                                href={urlExportRrf(repair.rrf_id)}
                                                                title="Export Excel"
                                                                aria-label="Export Excel"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                                                            >
                                                                <FileSpreadsheet className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-xs text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-700">{repairs.from ?? 0}–{repairs.to ?? 0}</span> dari{' '}
                            <span className="font-semibold text-slate-700">{Number(repairs.total ?? 0).toLocaleString('id-ID')}</span> data
                        </p>

                        <div className="flex flex-wrap items-center gap-1">
                            {repairs.links?.map((link, index) => {
                                const isPrev = index === 0;
                                const isNext = index === repairs.links.length - 1;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => bukaHalaman(link.url)}
                                        aria-label={isPrev ? 'Halaman sebelumnya' : isNext ? 'Halaman selanjutnya' : `Halaman ${link.label}`}
                                        className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
                                            link.active
                                                ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30'
                                                : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                        }`}
                                    >
                                        {isPrev ? (
                                            <ChevronLeft className="h-4 w-4" />
                                        ) : isNext ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {/* MODAL DETAIL: di-portal ke body agar benar-benar pop up layar penuh */}
            {selected && (
                <DetailModal
                    repair={selected}
                    statusLabel={selLabel}
                    statusClass={selClass}
                    formatStatus={formatStatus}
                    urlExport={urlExportRrf}
                    onClose={() => setSelected(null)}
                />
            )}

            {/* MODAL KONFIRMASI BUAT RRF */}
            <ConfirmationModal
                open={!!confirmRepair}
                title="Buat Repair Request Form?"
                description="Data repair ini akan dijadikan RRF baru untuk dilengkapi tim Maintenance."
                confirmText="Ya, Buat RRF"
                tone="blue"
                icon={FilePlus2}
                loading={creatingRrf}
                onCancel={() => setConfirmRepair(null)}
                onConfirm={konfirmasiBuatRrf}
            >
                {confirmRepair && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                                QMOS-{confirmRepair.qmos_repair_id}
                            </span>
                            <span className="truncate text-[11px] text-slate-400">{confirmRepair.location ?? '-'}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{confirmRepair.machine ?? '-'}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{confirmRepair.problem ?? '-'}</p>
                    </div>
                )}
            </ConfirmationModal>
        </ProduksiLayout>
    );
}