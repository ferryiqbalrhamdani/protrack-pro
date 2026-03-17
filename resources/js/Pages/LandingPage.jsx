import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function LandingPage({ auth }) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const theme = savedTheme || 'dark';
        setIsDark(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    const toggleDarkMode = () => {
        const newTheme = !isDark ? 'dark' : 'light';
        setIsDark(!isDark);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <>
            <Head title="Protrack Pro | The Enterprise Project System" />
            <div className="bg-white dark:bg-black font-sans text-slate-900 dark:text-slate-100 antialiased transition-colors duration-500 selection:bg-brand-accent selection:text-white">
                {/* Background Pattern */}
                <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-grid-pattern dark:bg-grid-pattern-dark [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                
                {/* Fixed Header */}
                <header className="fixed top-0 left-0 w-full z-50 border-b border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3 group pointer-events-auto">
                            <div className="size-8 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-lg transition-transform group-hover:scale-105 active:scale-95 shadow-lg">
                                <span className="material-symbols-outlined !text-xl font-bold">monitoring</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Protrack Pro</h2>
                        </div>
                        
                        <nav className="hidden md:flex items-center gap-8 animate-reveal [animation-delay:200ms] opacity-0">
                            {['Fitur', 'Cara Kerja', 'Bantuan'].map((item) => (
                                <a 
                                    key={item}
                                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-4 animate-reveal [animation-delay:400ms] opacity-0">
                            <Link
                                href={auth.user ? route('dashboard') : route('login')}
                                className="h-9 px-4 inline-flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-80 transition-opacity shadow-sm"
                            >
                                {auth.user ? 'Dashboard' : 'Login'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="relative pt-16">
                    {/* Radial Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-accent/20 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50 dark:opacity-30" />

                    {/* Hero Section */}
                    <section className="relative pt-24 pb-20 md:pt-48 md:pb-48 px-6 overflow-hidden">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold mb-8 animate-reveal [animation-delay:100ms] opacity-0">
                                <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
                                <span className="text-slate-600 dark:text-slate-300">New: Enterprise Project Ledger 2.0</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] animate-reveal [animation-delay:300ms] opacity-0">
                                The Enterprise Solution for <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-t from-slate-900 via-slate-700 to-slate-400 dark:from-white dark:via-slate-200 dark:to-slate-400">Project Monitoring.</span>
                            </h1>
                            
                            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-reveal [animation-delay:500ms] opacity-0">
                                Pusat kendali proyek internal untuk kolaborasi tim, pengelolaan aset digital, dan pemantauan anggaran secara real-time di seluruh divisi.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal [animation-delay:700ms] opacity-0">
                                <Link
                                    href={route('login')}
                                    className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl dark:shadow-white/5"
                                >
                                    Buka Dashboard
                                </Link>
                                <a
                                    href="#cara-kerja"
                                    className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all"
                                >
                                    Pelajari Selengkapnya
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section id="fitur" className="py-32 px-6 border-t border-slate-100 dark:border-white/5">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-20 text-center">
                                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Powerful Features.</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to ship projects faster and manage resources efficiently.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { icon: 'timer', title: 'Real-time Analytics', desc: 'Pantau progres proyek secara langsung dengan metrik yang akurat dan transparan.' },
                                    { icon: 'description', title: 'Secure Assets', desc: 'Kelola semua aset digital dan dokumen proyek dalam satu repositori terpusat.' },
                                    { icon: 'account_balance_wallet', title: 'Economic Integrity', desc: 'Monitor penggunaan anggaran dan biaya operasional proyek secara terperinci.' }
                                ].map((feat, i) => (
                                    <div key={i} className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                                        <div className="size-12 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-brand-accent font-bold">{feat.icon}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                                        <div className="absolute inset-0 border border-brand-accent/0 group-hover:border-brand-accent/20 rounded-2xl transition-colors pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Cara Kerja Section */}
                    <section id="cara-kerja" className="py-32 px-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent overflow-hidden">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">How it Works.</h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg">Tiga langkah mudah untuk mengoptimalkan manajemen proyek Anda.</p>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        {[
                                            { step: '01', title: 'SSO Authentication', desc: 'Masuk dengan kredensial perusahaan Anda melalui portal SSO NexaGroup yang aman.' },
                                            { step: '02', title: 'Project Centralization', desc: 'Buat atau pilih proyek yang ada dan akses dashboard multimedia serta laporan keuangan.' },
                                            { step: '03', title: 'Collaborate & Monitor', desc: 'Bagikan progres ke tim, kelola dokumen, dan pantau budget secara real-time.' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-6 group">
                                                <div className="shrink-0 flex flex-col items-center">
                                                    <div className="size-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-black">
                                                        {item.step}
                                                    </div>
                                                    {idx !== 2 && <div className="w-px h-full bg-slate-200 dark:bg-white/10 mt-4" />}
                                                </div>
                                                <div className="pb-8">
                                                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition-colors">{item.title}</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-accent/10 blur-[100px] -z-10 rounded-full" />
                                    <div className="p-4 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-2xl">
                                        <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center group">
                                            <span className="material-symbols-outlined !text-6xl text-slate-400 dark:text-white/20 group-hover:scale-110 transition-transform duration-700">automation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Modern Footer */}
                <footer id="bantuan" className="py-20 px-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-6 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded">
                                        <span className="material-symbols-outlined !text-sm">monitoring</span>
                                    </div>
                                    <h2 className="text-lg font-bold">Protrack Pro</h2>
                                </div>
                                <p className="text-sm text-slate-500 max-w-xs">Built for NexaGroup. Professional tools for professional teams.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase">Resources</h4>
                                    <ul className="text-sm text-slate-500 space-y-2">
                                        <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Documentation</a></li>
                                        <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Help Center</a></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase">Legal</h4>
                                    <ul className="text-sm text-slate-500 space-y-2">
                                        <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a></li>
                                        <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</a></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase">Theme</h4>
                                    <button 
                                        onClick={toggleDarkMode}
                                        className="h-8 px-3 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined !text-sm">
                                            {isDark ? 'light_mode' : 'dark_mode'}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-[0.1em]">{isDark ? 'Light' : 'Dark'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-200 dark:border-white/10">
                            <p className="text-xs text-slate-500">© 2024 Protrack Pro. All rights reserved. Member of NexaGroup Tech.</p>
                            <div className="flex items-center gap-4 text-slate-400 grayscale">
                                <span className="material-symbols-outlined text-sm">share</span>
                                <span className="material-symbols-outlined text-sm">language</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes reveal {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-reveal {
                    animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            ` }} />
        </>
    );
}
