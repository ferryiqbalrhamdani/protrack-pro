import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = (currentTheme) => {
            root.classList.remove('light', 'dark');
            if (currentTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(currentTheme);
            }
        };
        applyTheme(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'light';
            return 'light';
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300">
            <Head title="Nomor Surat - AI Document Management" />

            {/* Premium Header */}
            <header className="fixed top-0 w-full z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 h-20 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="size-10 bg-[#10b981] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
                            <span className="material-symbols-outlined text-2xl font-bold">menu_book</span>
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight uppercase italic">
                            Nomor <span className="not-italic text-slate-400">Surat</span>
                        </h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">Fitur</a>
                        <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">Cara Kerja</a>
                        <a href="#contact" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">Kontak</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleThemeToggle}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
                        
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-6 py-2.5 bg-[#1a2b3c] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-xl hover:shadow-slate-900/30 transition-all active:scale-95"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="px-6 py-2.5 bg-[#1a2b3c] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-xl hover:shadow-slate-900/30 transition-all active:scale-95"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-20">
                {/* Section 1: Hero (Grayish bg-slate-50) */}
                <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 py-24 lg:py-40">
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center lg:text-left">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full mb-8">
                                <span className="size-2 bg-[#10b981] rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Next-Gen Document Management</span>
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8 italic">
                                Digitalisasi <span className="text-emerald-500 not-italic">Administrasi</span> Perusahaan Anda
                            </h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                                Platform internal manajemen nomor surat berbasis AI untuk mendigitalisasi administrasi persuratan perusahaan secara aman, cepat, dan efisien.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                                <Link 
                                    href={route('login')}
                                    className="w-full sm:w-auto px-10 py-5 bg-[#1a2b3c] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-900/40 hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    Mulai Sekarang
                                </Link>
                                <a 
                                    href="#features"
                                    className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                                >
                                    Pelajari Fitur
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Features (White bg-white) */}
                <section id="features" className="py-24 lg:py-32 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Fitur Utama</h3>
                            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Keunggulan <span className="not-italic text-slate-400">Nomor Surat</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Automasi AI', desc: 'Pembuatan nomor surat otomatis dengan validasi data cerdas untuk mencegah duplikasi.', icon: 'auto_awesome' },
                                { title: 'Arsip Digital', desc: 'Penyimpanan terpusat dengan sistem pencarian instan memudahkan akses data kapan saja.', icon: 'inventory_2' },
                                { title: 'Alur Persetujuan', desc: 'Sederhanakan birokrasi dengan sistem approval berjenjang yang transparan.', icon: 'task_alt' }
                            ].map((feature, i) => (
                                <div key={i} className="group p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 hover:border-emerald-500/20 hover:shadow-2xl transition-all text-center">
                                    <div className="size-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#10b981] shadow-sm mb-8 mx-auto group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">{feature.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 3: How it Works (Grayish bg-slate-50) */}
                <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <div className="lg:w-1/2">
                                <div className="space-y-12">
                                    {[
                                        { step: '01', title: 'Input Data Proyek', desc: 'Masukkan detail pengadaan atau proyek ke dalam sistem.' },
                                        { step: '02', title: 'Generate Nomor', desc: 'AI akan memproses dan memberikan nomor surat unik.' },
                                        { step: '03', title: 'Monitoring & Kontrol', desc: 'Pantau status dan progress pengerjaan secara real-time.' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-8 group">
                                            <div className="size-14 shrink-0 bg-[#1a2b3c] rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg group-hover:scale-110 transition-transform">
                                                {step.step}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic">{step.title}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="aspect-square bg-white dark:bg-white/5 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-2xl p-8 relative overflow-hidden flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[140px] text-emerald-500/20 animate-pulse">rocket_launch</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* EXACT MOCKUP FOOTER */}
            <footer className="bg-[#0b1120] text-white pt-20 pb-8 transition-colors">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                        {/* Column 1: Brand */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-[#10b981] rounded-lg flex items-center justify-center text-white shadow-lg">
                                    <span className="material-symbols-outlined text-2xl font-bold">menu_book</span>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Nomor Surat</h2>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                Platform internal manajemen nomor surat berbasis AI untuk mendigitalisasi administrasi persuratan perusahaan.
                            </p>
                        </div>

                        {/* Column 2: Navigasi */}
                        <div>
                            <h4 className="text-white font-bold mb-6 text-base tracking-wide uppercase">Navigasi</h4>
                            <ul className="space-y-4">
                                {['Tentang Kami', 'Fitur', 'Cara Kerja', 'Kontak'].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Legal */}
                        <div>
                            <h4 className="text-white font-bold mb-6 text-base tracking-wide uppercase">Legal</h4>
                            <ul className="space-y-4">
                                {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Keamanan'].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Hubungi Kami */}
                        <div>
                            <h4 className="text-white font-bold mb-6 text-base tracking-wide uppercase">Hubungi Kami</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="mailto:rhamdani128@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                                        <span className="material-symbols-outlined text-xl">mail</span>
                                        <span className="text-sm font-medium">rhamdani128@gmail.com</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+6282373246104" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                                        <span className="material-symbols-outlined text-xl">call</span>
                                        <span className="text-sm font-medium">+6282373246104</span>
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="https://github.com/ferryiqbalrhamdani" 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                                    >
                                        <svg className="size-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                        <span className="text-sm font-medium">GitHub</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-xs font-medium">
                            © 2026 Nomor Surat. Seluruh hak cipta dilindungi.
                        </p>
                        <a 
                            href="https://github.com/ferryiqbalrhamdani" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-white transition-colors text-xs font-semibold"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
