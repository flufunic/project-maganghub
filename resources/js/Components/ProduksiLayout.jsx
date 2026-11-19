import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Bell, BellOff, FileText, Menu, X } from 'lucide-react';
import FlashToast from './FlashToast';
import SidebarMtcAdmin from './SidebarMtcAdmin';
import SidebarMtcPimpinan from './SidebarMtcPimpinan';

const BADGE = {
    diajukan: 'bg-amber-100 text-amber-800 border-amber-200',
    disetujui: 'bg-blue-100 text-blue-800 border-blue-200',
    ditolak: 'bg-red-100 text-red-800 border-red-200',
    diterima: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dikerjakan: 'bg-violet-100 text-violet-800 border-violet-200',
    selesai: 'bg-teal-100 text-teal-800 border-teal-200',
    closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export function StatusBadge({ status, label }) {
    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${
                BADGE[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
        >
            {label ?? status}
        </span>
    );
}

export default function ProduksiLayout({ children }) {
    const page = usePage();
    const { auth, rrfNotifications } = page.props;
    const user = auth?.user;

    const [notifikasiTerbuka, setNotifikasiTerbuka] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ========================================
    // ROLE MAINTENANCE
    // ========================================

    const isAdminMtc = user?.role === 'admin';
    const isPimpinanMtc = user?.role === 'pimpinan';
    const isMtc = isAdminMtc || isPimpinanMtc;

    const jumlahBelumDibaca = rrfNotifications?.jumlah_belum_dibaca ?? 0;
    const daftarNotifikasi = rrfNotifications?.daftar ?? [];
    const adaNotifikasi = jumlahBelumDibaca > 0;

    // ========================================
    // AUDIO NOTIFIKASI
    // ========================================

    const audioContextRef = useRef(null);
    const suaraAktifRef = useRef(false);
    const notifikasiMenungguRef = useRef(false);

    const idNotifikasiSebelumnya = useRef(
        new Set((rrfNotifications?.daftar ?? []).map((item) => item.id))
    );

    const pollingBerjalan = useRef(false);

    // Ding dong dua nada
    const putarSuaraNotifikasi = async () => {
        try {
            const context = audioContextRef.current;
            if (!context) return;

            if (context.state === 'suspended') {
                await context.resume();
            }

            if (context.state !== 'running') return;

            const bunyikanNada = (frekuensi, waktuMulai, durasi) => {
                const oscillator = context.createOscillator();
                const gain = context.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frekuensi, waktuMulai);

                gain.gain.setValueAtTime(0.001, waktuMulai);
                gain.gain.exponentialRampToValueAtTime(0.35, waktuMulai + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, waktuMulai + durasi);

                oscillator.connect(gain);
                gain.connect(context.destination);

                oscillator.start(waktuMulai);
                oscillator.stop(waktuMulai + durasi);
            };

            const sekarang = context.currentTime;

            bunyikanNada(880, sekarang, 0.45);
            bunyikanNada(659.25, sekarang + 0.5, 0.65);
        } catch (error) {
            console.error('Gagal memutar suara notifikasi:', error);
        }
    };

    // Browser hanya mengizinkan suara setelah ada interaksi pengguna.
    // Audio diaktifkan pada klik / tombol / sentuhan pertama.
    useEffect(() => {
        if (!isMtc) return undefined;

        const events = ['pointerdown', 'keydown', 'touchstart'];

        const lepas = () => events.forEach((e) => window.removeEventListener(e, aktifkanSuara));

        async function aktifkanSuara() {
            try {
                if (!audioContextRef.current) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (!AudioCtx) return;
                    audioContextRef.current = new AudioCtx();
                }

                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }

                suaraAktifRef.current = true;
                lepas();

                if (notifikasiMenungguRef.current) {
                    notifikasiMenungguRef.current = false;
                    putarSuaraNotifikasi();
                }
            } catch (error) {
                console.error('Gagal mengaktifkan audio:', error);
            }
        }

        events.forEach((e) => window.addEventListener(e, aktifkanSuara, { passive: true }));

        return lepas;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMtc]);

    // ========================================
    // POLLING NOTIFIKASI SETIAP 10 DETIK
    // ========================================

    useEffect(() => {
        if (!isMtc) return undefined;

        const cekNotifikasi = () => {
            if (pollingBerjalan.current) return;

            pollingBerjalan.current = true;

            router.reload({
                only: ['rrfNotifications'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    pollingBerjalan.current = false;
                },
            });
        };

        const interval = setInterval(cekNotifikasi, 10000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') cekNotifikasi();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            pollingBerjalan.current = false;
        };
    }, [isMtc]);

    // ========================================
    // DETEKSI NOTIFIKASI BARU
    // ========================================

    useEffect(() => {
        if (!isMtc) return;

        const daftarIDSekarang = new Set(daftarNotifikasi.map((item) => item.id));

        const adaNotifikasiBaru = daftarNotifikasi.some(
            (item) => !idNotifikasiSebelumnya.current.has(item.id)
        );

        idNotifikasiSebelumnya.current = daftarIDSekarang;

        if (!adaNotifikasiBaru) return;

        if (suaraAktifRef.current) {
            putarSuaraNotifikasi();
        } else {
            notifikasiMenungguRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rrfNotifications, isMtc]);

    // Esc menutup panel notifikasi
    useEffect(() => {
        if (!notifikasiTerbuka) return undefined;

        const onKey = (e) => e.key === 'Escape' && setNotifikasiTerbuka(false);
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [notifikasiTerbuka]);

    // ========================================
    // BACA NOTIFIKASI
    // ========================================

    const bacaNotifikasi = (notification) => {
        router.post(
            notification.read_url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setNotifikasiTerbuka(false),
            }
        );
    };

    return (
        <>
            {isAdminMtc && <SidebarMtcAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            {isPimpinanMtc && <SidebarMtcPimpinan open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

            <style>{`
                @keyframes rrfGradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes rrfFloat { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-25px,0) scale(1.08); } }
                @keyframes rrfFloatReverse { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-30px,25px,0) scale(1.1); } }
                @keyframes rrfFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes rrfRiseIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes rrfPopIn { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes rrfDrop { from { opacity: 0; transform: translateY(-8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes rrfSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes rrfIconPop { 0% { transform: scale(.5) rotate(-12deg); opacity: 0; } 60% { transform: scale(1.12) rotate(4deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
                @keyframes rrfShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes rrfBellShake {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30%, 50%, 70% { transform: rotate(12deg); }
                    20%, 40%, 60%, 80% { transform: rotate(-12deg); }
                    90% { transform: rotate(0deg); }
                }
                @keyframes rrfNotificationPulse { 0% { transform: scale(.8); opacity: .7; } 100% { transform: scale(1.65); opacity: 0; } }
                @keyframes rrfBadgePop { 0% { transform: scale(0); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
                @keyframes rrfBadgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }

                /*
                 * PENTING: pembungkus halaman hanya boleh fade (opacity).
                 * Animasi transform pada pembungkus membuat elemen "fixed" di dalamnya
                 * terkurung di pembungkus itu, bukan di layar penuh.
                 * fill-mode "backwards" juga memastikan tidak ada transform tersisa
                 * setelah animasi selesai, jadi hover:translate pada kartu tetap jalan.
                 */
                .rrf-rise { animation: rrfFadeIn .5s ease-out backwards; }

                /* Kelas animasi bersama untuk halaman RRF */
                .rrf-enter { animation: rrfRiseIn .65s cubic-bezier(.22,1,.36,1) backwards; }
                .rrf-fade { animation: rrfFadeIn .22s ease-out both; }
                .rrf-pop { animation: rrfPopIn .38s cubic-bezier(.22,1,.36,1) both; }
                .rrf-drop { animation: rrfDrop .22s cubic-bezier(.22,1,.36,1) both; transform-origin: top right; }
                .rrf-slide-down { animation: rrfSlideDown .35s cubic-bezier(.22,1,.36,1) both; }
                .rrf-icon-pop { animation: rrfIconPop .5s .1s cubic-bezier(.22,1,.36,1) both; }
                .rrf-shimmer { background-size: 200% 100%; animation: rrfShimmer 6s linear infinite; }

                .rrf-gradient { background-size: 250% 250%; animation: rrfGradient 20s ease infinite; }
                .rrf-float { animation: rrfFloat 14s ease-in-out infinite; }
                .rrf-float-reverse { animation: rrfFloatReverse 17s ease-in-out infinite; }
                .rrf-bell-shake { animation: rrfBellShake 1.1s ease-in-out infinite; transform-origin: 50% 15%; }
                .rrf-notification-pulse { animation: rrfNotificationPulse 1.8s ease-out infinite; }
                .rrf-badge-pop { animation: rrfBadgePop .45s ease-out both, rrfBadgePulse 1.5s ease-in-out .5s infinite; }

                .rrf-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .rrf-scroll::-webkit-scrollbar-track { background: transparent; }
                .rrf-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 999px; }
                .rrf-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,.55); }

                @media (prefers-reduced-motion: reduce) {
                    .rrf-gradient, .rrf-float, .rrf-float-reverse, .rrf-rise, .rrf-enter, .rrf-fade, .rrf-pop,
                    .rrf-drop, .rrf-slide-down, .rrf-icon-pop, .rrf-shimmer, .rrf-bell-shake,
                    .rrf-notification-pulse, .rrf-badge-pop { animation: none !important; }
                }
            `}</style>

            <FlashToast />

            <div className="relative flex min-h-screen flex-col overflow-x-clip text-slate-800">
                {/* BACKGROUND */}
                <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50" />
                    <div className="rrf-float absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/25 blur-[110px]" />
                    <div className="rrf-float-reverse absolute -right-32 top-[15%] h-[460px] w-[460px] rounded-full bg-indigo-300/20 blur-[120px]" />
                    <div className="rrf-float absolute bottom-[-180px] left-[30%] h-[440px] w-[440px] rounded-full bg-sky-300/20 blur-[110px]" />
                    <div
                        className="absolute inset-0 opacity-[0.3]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(100,116,139,.22) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                            maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 65%)',
                        }}
                    />
                </div>

                {/* HEADER (tanpa backdrop-blur agar elemen fixed di dalamnya tidak terkurung) */}
                <header className="sticky top-0 z-40 bg-gradient-to-r from-[#061033] via-[#0b1d57] to-[#12328a] shadow-lg shadow-slate-950/20">
                    <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        {/* BRAND */}
                        <div className="flex min-w-0 items-center gap-3">
                            {isMtc && (
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    aria-label="Buka menu"
                                    title="Buka menu"
                                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-95"
                                >
                                    <Menu className="h-5 w-5" strokeWidth={2} />
                                </button>
                            )}

                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                                    Repair Request Form
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            {/* NOTIFIKASI */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setNotifikasiTerbuka((prev) => !prev)}
                                    aria-label={`Notifikasi, ${jumlahBelumDibaca} belum dibaca`}
                                    aria-expanded={notifikasiTerbuka}
                                    title="Notifikasi"
                                    className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border bg-white/10 text-white transition-all duration-300 hover:bg-white/20 active:scale-95 ${
                                        adaNotifikasi
                                            ? 'border-blue-300/50 shadow-[0_0_18px_rgba(59,130,246,0.4)]'
                                            : 'border-white/15'
                                    }`}
                                >
                                    {adaNotifikasi && (
                                        <span className="rrf-notification-pulse pointer-events-none absolute inset-1 rounded-xl border border-blue-300/80 bg-blue-400/20" />
                                    )}

                                    <span className={`relative z-10 flex items-center justify-center ${adaNotifikasi ? 'rrf-bell-shake' : ''}`}>
                                        <Bell className={`h-5 w-5 ${adaNotifikasi ? 'text-blue-200' : 'text-white'}`} strokeWidth={1.8} />
                                    </span>

                                    {adaNotifikasi && (
                                        <span
                                            key={jumlahBelumDibaca}
                                            className="rrf-badge-pop absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0b1d57] bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-lg shadow-red-500/40"
                                        >
                                            {jumlahBelumDibaca > 99 ? '99+' : jumlahBelumDibaca}
                                        </span>
                                    )}
                                </button>

                                {notifikasiTerbuka && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Tutup notifikasi"
                                            className="fixed inset-0 z-40 cursor-default"
                                            onClick={() => setNotifikasiTerbuka(false)}
                                        />

                                        <div className="rrf-drop absolute right-0 z-50 mt-3 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
                                            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-3.5">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Notifikasi</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {adaNotifikasi ? `${jumlahBelumDibaca} belum dibaca` : 'Semua sudah dibaca'}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setNotifikasiTerbuka(false)}
                                                    aria-label="Tutup"
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="rrf-scroll max-h-[380px] overflow-y-auto">
                                                {daftarNotifikasi.length === 0 ? (
                                                    <div className="px-4 py-12 text-center">
                                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                            <BellOff className="h-6 w-6" strokeWidth={1.7} />
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-600">Belum ada notifikasi</p>
                                                        <p className="mt-1 text-xs text-slate-400">Notifikasi RRF akan muncul di sini.</p>
                                                    </div>
                                                ) : (
                                                    daftarNotifikasi.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => bacaNotifikasi(item)}
                                                            className={`relative flex w-full cursor-pointer gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-blue-50 ${
                                                                !item.dibaca ? 'bg-blue-50/60' : 'bg-white'
                                                            }`}
                                                        >
                                                            {!item.dibaca && <span className="absolute inset-y-0 left-0 w-[3px] bg-blue-500" />}

                                                            <div
                                                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                                    !item.dibaca ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                                                }`}
                                                            >
                                                                <FileText className="h-4 w-4" strokeWidth={1.8} />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className="text-xs font-bold text-slate-800">{item.judul}</p>
                                                                    {!item.dibaca && (
                                                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                                    )}
                                                                </div>

                                                                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.pesan}</p>

                                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                                    {item.rrf_no && (
                                                                        <span className="rounded-md bg-blue-100/70 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                                                            {item.rrf_no}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[11px] text-slate-400">{item.waktu}</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rrf-gradient h-[3px] bg-gradient-to-r from-blue-400 via-violet-400 via-cyan-300 to-blue-400" />
                </header>

                {/* MAIN */}
                <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <div className="rrf-rise">{children}</div>
                </main>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-center px-5 py-3 sm:px-6 lg:px-8">
                        <p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} Repair Request Form</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
