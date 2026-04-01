import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="bg-white dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-white min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <Head title="Masuk | Protrack Pro" />

            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-grid-pattern dark:bg-grid-pattern-dark [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-accent/10 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50" />

            <div className="w-full max-w-md animate-reveal relative">
                {/* Header/Logo */}
                <header className="flex flex-col items-center gap-3 mb-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 transition-transform hover:scale-110">
                        <span className="material-symbols-outlined text-2xl font-bold">
                            monitoring
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Protrack <span className="text-indigo-600 dark:text-indigo-400 tracking-normal not-italic px-1.5 bg-indigo-500/10 rounded-md">Pro</span></h1>
                    </div>
                </header>

                {/* Login Card */}
                <div className="bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/10 rounded-2xl transition-colors pointer-events-none" />
                    
                    {/* Welcome Text */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Selamat Datang Kembali</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Masukkan kredensial perusahaan Anda untuk mengakses dashboard.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm font-medium text-green-600 dark:text-green-400 text-center animate-reveal">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={submit}>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="login">Email atau Username</label>
                            <div className="relative group/input">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                                </div>
                                <input 
                                    className={`block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 text-slate-900 text-base placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 transition-all ${errors.login ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500' : ''}`}
                                    id="login" 
                                    name="login" 
                                    value={data.login}
                                    autoComplete="username"
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="nama@perusahaan.com / nama_pengguna" 
                                    type="text"
                                    required
                                />
                            </div>
                            <InputError message={errors.login} className="mt-2 ml-1" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="password">Kata Sandi</label>
                                {canResetPassword && (
                                    <Link 
                                        href={route('password.request')}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-white transition-colors"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <div className="relative group/input">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <input 
                                    className={`block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-12 text-slate-900 text-base placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 transition-all ${errors.password ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500' : ''}`}
                                    id="password" 
                                    name="password" 
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••" 
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2 ml-1" />
                        </div>

                        <div className="flex items-center space-x-2 ml-1">
                            <input 
                                className="h-5 w-5 rounded-lg border-slate-300 text-primary focus:ring-primary bg-white dark:bg-slate-800 transition-all cursor-pointer" 
                                id="remember" 
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 select-none cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors" htmlFor="remember">
                                Ingat perangkat ini selama 30 hari
                            </label>
                        </div>

                        <button 
                            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2" 
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memverifikasi...
                                </span>
                            ) : (
                                'Masuk ke Dashboard'
                            )}
                        </button>
                    </form>
                </div>

                {/* Security Footer */}
                <div className="mt-12 space-y-8 animate-reveal [animation-delay:200ms] opacity-0">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-5 backdrop-blur-md shadow-sm">
                        <div className="size-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <span className="material-symbols-outlined font-bold">verified_user</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Catatan Keamanan</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Sistem ini terbatas untuk internal. Akses tidak sah akan diproses secara hukum.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <button className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">contact_support</span>
                            Bantuan Teknis
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">v2.4.0-stable</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Status Decoration */}
            <div className="absolute top-10 right-10 flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 px-4 py-2 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-lg animate-reveal [animation-delay:400ms] opacity-0">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">Sistem Aktif</span>
            </div>
        </div>
    );
}
