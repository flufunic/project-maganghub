import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

/* =========================
   ICONS (inline, tanpa library)
========================== */
const Icon = ({ children, className = 'h-5 w-5', sw = 1.8 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {children}
    </svg>
);

const UserIcon = (p) => (
    <Icon {...p}>
        <circle cx="12" cy="8" r="3.75" />
        <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </Icon>
);

const LockIcon = (p) => (
    <Icon {...p}>
        <rect width="14" height="10" x="5" y="11" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
);

const EyeIcon = (p) => (
    <Icon {...p}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);

const EyeOffIcon = (p) => (
    <Icon {...p}>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1" />
        <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Icon>
);

const AlertIcon = (p) => (
    <Icon {...p} sw={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5" />
        <path d="M12 16h.01" />
    </Icon>
);

const ArrowIcon = (p) => (
    <Icon {...p} sw={2}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </Icon>
);

const WrenchIcon = (p) => (
    <Icon {...p} sw={1.8}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3.6 17.1a1.9 1.9 0 0 0 2.7 2.7l5.7-5.7a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    </Icon>
);

/* =========================
   GEAR (dekorasi latar)
========================== */
function Gear({ className = '' }) {
    return (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="20" />
            <circle cx="50" cy="50" r="8" />
            {Array.from({ length: 10 }).map((_, i) => (
                <rect key={i} x="43" y="8" width="14" height="14" rx="2.5" transform={`rotate(${i * 36} 50 50)`} />
            ))}
        </svg>
    );
}

/* =========================
   INPUT FIELD
========================== */
function Field({ id, label, icon, right, ...props }) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
                {label}
            </label>

            <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition-colors duration-200 group-focus-within:text-blue-400">
                    {icon}
                </div>

                <input
                    id={id}
                    {...props}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/20 hover:bg-white/[0.06] focus:border-blue-400/70 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                />

                {right && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{right}</div>}
            </div>
        </div>
    );
}

/* =========================
   PAGE
========================== */
export default function Login() {
    const { data, setData, post, processing } = useForm({
        name: '',
        password: '',
    });

    const [alert, setAlert] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        if (!data.name.trim() && !data.password.trim()) {
            setAlert('Username dan password harus diisi.');
            return;
        }

        if (!data.name.trim()) {
            setAlert('Username harus diisi.');
            return;
        }

        if (!data.password.trim()) {
            setAlert('Password harus diisi.');
            return;
        }

        setAlert('');

        post('/login', {
            onFinish: () => {
                setTimeout(() => {
                    if (window.location.pathname === '/login') {
                        setAlert('Username atau password salah.');
                    }
                }, 100);
            },
        });
    };

    // spotlight mengikuti kursor pada card
    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    const rise = (i) => ({ animationDelay: `${120 + i * 80}ms` });

    return (
        <>
            <Head title="Login" />

            <style>{`
                @keyframes lg-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes lg-pop { from { opacity: 0; transform: translateY(24px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes lg-spin { to { transform: rotate(360deg); } }
                @keyframes lg-spin-rev { to { transform: rotate(-360deg); } }
                @keyframes lg-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.1); } }
                @keyframes lg-pulse-ring { 0% { transform: scale(.9); opacity: .6; } 100% { transform: scale(1.7); opacity: 0; } }
                @keyframes lg-shake {
                    0%,100% { transform: translateX(0); }
                    20% { transform: translateX(-6px); }
                    40% { transform: translateX(5px);  }
                    60% { transform: translateX(-3px); }
                    80% { transform: translateX(2px);  }
                }
                .lg-rise { opacity: 0; animation: lg-rise .65s cubic-bezier(.22,1,.36,1) forwards; }
                .lg-pop  { opacity: 0; animation: lg-pop .8s cubic-bezier(.22,1,.36,1) forwards; }
                @media (prefers-reduced-motion: reduce) {
                    .lg-rise, .lg-pop { opacity: 1; animation: none; }
                    [class*="animate-[lg-"] { animation: none !important; }
                }
            `}</style>

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-5 py-10">
                {/* =========================
                    BACKGROUND
                ========================== */}
                <div className="pointer-events-none absolute inset-0">
                    {/* aurora */}
                    <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] animate-[lg-drift_16s_ease-in-out_infinite] rounded-full bg-blue-600/25 blur-[110px]" />
                    <div className="absolute -bottom-48 -right-40 h-[36rem] w-[36rem] animate-[lg-drift_20s_ease-in-out_infinite_reverse] rounded-full bg-indigo-600/25 blur-[110px]" />
                    <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-[lg-drift_24s_ease-in-out_infinite] rounded-full bg-cyan-500/10 blur-[100px]" />

                    {/* grid */}
                    <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
                            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
                        }}
                    />

                    {/* gears */}
                    <Gear className="absolute -left-20 bottom-[8%] h-80 w-80 animate-[lg-spin_60s_linear_infinite] text-blue-300/[0.09] sm:h-[26rem] sm:w-[26rem]" />
                    <Gear className="absolute -right-16 top-[6%] h-64 w-64 animate-[lg-spin-rev_48s_linear_infinite] text-indigo-300/[0.09] sm:h-80 sm:w-80" />
                    <Gear className="absolute right-[14%] bottom-[10%] hidden h-28 w-28 animate-[lg-spin_24s_linear_infinite] text-cyan-300/[0.08] md:block" />
                </div>

                {/* =========================
                    CARD
                ========================== */}
                <div className="lg-pop relative z-10 w-full max-w-[26rem]">
                    {/* animated gradient border */}
                    <div className="relative overflow-hidden rounded-[1.75rem] p-px">
                        <div className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-[lg-spin_9s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(96,165,250,0.9)_60deg,transparent_140deg,transparent_200deg,rgba(129,140,248,0.8)_260deg,transparent_340deg)]" />

                        <div
                            onMouseMove={onMove}
                            className="group/card relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-[#0b1120]/95 p-7 backdrop-blur-xl sm:p-9"
                            style={{ '--mx': '50%', '--my': '0%' }}
                        >
                            {/* spotlight */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                                style={{
                                    background:
                                        'radial-gradient(320px circle at var(--mx) var(--my), rgba(96,165,250,0.12), transparent 60%)',
                                }}
                            />

                            <div className="relative">
                                {/* BRAND */}
                                <div className="lg-rise text-center" style={rise(0)}>
                                    <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                                        <span className="absolute inset-0 animate-[lg-pulse-ring_2.8s_ease-out_infinite] rounded-2xl bg-blue-500/40" />
                                        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/50 ring-1 ring-white/20">
                                            <WrenchIcon className="h-8 w-8" />
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-semibold tracking-tight text-white">Sistem Maintenance</h1>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Masukkan username dan password untuk masuk.
                                    </p>
                                </div>

                                {/* ALERT */}
                                {alert && (
                                    <div
                                        key={alert}
                                        role="alert"
                                        className="mt-6 animate-[lg-shake_.45s_ease-in-out] rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-red-300">Login gagal</p>
                                                <p className="mt-0.5 text-sm leading-5 text-red-200/80">{alert}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* FORM */}
                                <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
                                    <div className="lg-rise" style={rise(1)}>
                                        <Field
                                            id="username"
                                            label="Username"
                                            type="text"
                                            icon={<UserIcon />}
                                            value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                setAlert('');
                                            }}
                                            placeholder="Masukkan username"
                                            autoComplete="username"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="lg-rise" style={rise(2)}>
                                        <Field
                                            id="password"
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            icon={<LockIcon />}
                                            value={data.password}
                                            onChange={(e) => {
                                                setData('password', e.target.value);
                                                setAlert('');
                                            }}
                                            placeholder="Masukkan password"
                                            autoComplete="current-password"
                                            right={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                                                >
                                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            }
                                        />
                                    </div>

                                    <div className="lg-rise pt-1" style={rise(3)}>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/30 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                                        >
                                            <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[150%]" />

                                            {processing ? (
                                                <span className="relative flex items-center gap-2">
                                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                                    </svg>
                                                    Memproses...
                                                </span>
                                            ) : (
                                                <span className="relative flex items-center gap-2">
                                                    Masuk
                                                    <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <p className="lg-rise mt-6 text-center text-xs text-slate-500" style={rise(5)}>
                        © {new Date().getFullYear()} Emma Sarkilla
                    </p>
                </div>
            </div>
        </>
    );
}
