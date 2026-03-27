import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useState } from 'react';

export default function ForgotPassword() {
    const { data, setData, errors } = useForm({
        name: '',
        username: '',
    });

    const [processing, setProcessing] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const phoneNumber = '6282373246104'; // International format for 082373246104
        const message = `Halo Admin, saya lupa kata sandi Protrack Pro.\n\nNama Lengkap: ${data.name}\nUsername: ${data.username || '-'}\n\nMohon bantuannya untuk reset kata sandi saya.`;
        
        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(waUrl, '_blank');
        
        setTimeout(() => {
            setProcessing(false);
        }, 1000);
    };

    return (
        <div className="bg-white dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-white min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <Head title="Lupa Kata Sandi | Protrack Pro" />

            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-grid-pattern dark:bg-grid-pattern-dark [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-accent/10 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50" />

            <div className="w-full max-w-md animate-reveal relative">
                {/* Header/Logo */}
                <header className="flex flex-col items-center gap-3 mb-8 text-center text-primary">
                    <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-xl shadow-primary/20 transition-transform hover:scale-110">
                        <span className="material-symbols-outlined text-2xl font-bold">
                            monitoring
                        </span>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Protrack <span className="text-primary tracking-normal not-italic px-1.5 bg-primary/10 rounded-md">Pro</span></h1>
                    </div>
                </header>

                {/* Card */}
                <div className="bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/10 rounded-2xl transition-colors pointer-events-none" />
                    
                    {/* Info Text */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Lupa Kata Sandi?</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Silakan masukkan nama lengkap dan username Anda. Kami akan mengarahkan Anda ke WhatsApp Admin untuk bantuan reset kata sandi.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={submit}>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="name">Nama Lengkap</label>
                            <div className="relative group/input">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </div>
                                <input 
                                    className="block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 text-slate-900 text-base placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 transition-all"
                                    id="name" 
                                    name="name" 
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap" 
                                    type="text"
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2 ml-1" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="username">Username (Opsional)</label>
                            <div className="relative group/input">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                                </div>
                                <input 
                                    className="block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 text-slate-900 text-base placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 transition-all"
                                    id="username" 
                                    name="username" 
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Masukkan username jika ingat" 
                                    type="text"
                                />
                            </div>
                            <InputError message={errors.username} className="mt-2 ml-1" />
                        </div>

                        <button 
                            className="flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-base font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" 
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mengalihkan...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Kirim ke WhatsApp
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </span>
                            )}
                        </button>

                        <div className="text-center">
                            <Link 
                                href={route('login')}
                                className="text-sm font-bold text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Kembali ke Halaman Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
