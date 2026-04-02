import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const ModuleModal = ({ isOpen, onClose, module }) => {
    if (!isOpen || !module) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#161d31] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-reveal">
                <div className="absolute top-0 right-0 p-6 flex gap-4">
                     <button onClick={onClose} className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined !text-xl">close</span>
                    </button>
                </div>

                <div className="p-10 lg:p-14">
                    <div className={`size-16 rounded-2xl ${module.color} flex items-center justify-center mb-8`}>
                        <span className="material-symbols-outlined !text-4xl text-white">{module.icon}</span>
                    </div>

                    <h3 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">{module.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl font-medium mb-10 leading-relaxed">
                        {module.description}
                    </p>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Cara Penggunaan</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {module.usage.map((step, idx) => (
                                <div key={idx} className="flex gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group hover:border-indigo-500/30 transition-colors">
                                    <div className="shrink-0 size-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-bold">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 border-t border-slate-200 dark:border-white/10 flex justify-center">
                    <button onClick={onClose} className="h-14 px-12 bg-slate-900 text-white dark:bg-white dark:text-black rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-none">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

const LegalModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const content = {
        privacy: {
            title: 'Kebijakan Privasi',
            sections: [
                {
                    h: 'Pengumpulan Informasi',
                    p: 'Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat menggunakan layanan Protrack Pro, termasuk detail proyek, lampiran kontrak, dan data operasional.'
                },
                {
                    h: 'Penggunaan Data',
                    p: 'Informasi yang dikumpulkan digunakan secara eksklusif untuk memetakan progres proyek, manajemen vendor, dan pelaporan internal ekosistem Tim Proyek.'
                },
                {
                    h: 'Keamanan Data',
                    p: 'Kami menerapkan standar keamanan enkripsi tingkat tinggi untuk melindungi data Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.'
                }
            ]
        },
        terms: {
            title: 'Ketentuan Layanan',
            sections: [
                {
                    h: 'Penggunaan Layanan',
                    p: 'Dengan mengakses Protrack Pro, Anda setuju untuk menggunakan platform ini hanya untuk tujuan bisnis yang sah dan sesuai dengan otorisasi hak akses Anda.'
                },
                {
                    h: 'Tanggung Jawab Akun',
                    p: 'Anda bertanggung jawab penuh untuk menjaga kerahasiaan informasi login Anda dan atas semua aktivitas yang terjadi di bawah akun Anda.'
                },
                {
                    h: 'Kepemilikan Intelektual',
                    p: 'Seluruh kode, desain, dan struktur data dalam platform ini adalah milik eksklusif Tim Proyek dan dilindungi oleh undang-undang hak cipta.'
                }
            ]
        }
    }[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#161d31] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-reveal">
                <div className="p-10 lg:p-14">
                    <h3 className="text-3xl font-black mb-8 tracking-tight text-slate-900 dark:text-white">{content.title}</h3>
                    <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                        {content.sections.map((sec, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">{sec.h}</h4>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{sec.p}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 border-t border-slate-200 dark:border-white/10 flex justify-end">
                    <button onClick={onClose} className="h-12 px-8 rounded-xl font-black text-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        Selesai Membaca
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function LandingPage({ auth }) {
    const [isDark, setIsDark] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedLegal, setSelectedLegal] = useState(null);
    const [mockTab, setMockTab] = useState('dashboard');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const theme = savedTheme || 'dark';
        setIsDark(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');

        const handleScroll = () => setScrolled(window.scrollY > 20);
        
        // Network Status Management
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            observer.disconnect();
        };
    }, []);

    const toggleDarkMode = () => {
        const newTheme = !isDark ? 'dark' : 'light';
        setIsDark(!isDark);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const modules = [
        {
            id: 'contract',
            title: 'Contract Management',
            icon: 'description',
            color: 'bg-indigo-600',
            description: 'Kelola aspek legalitas proyek, nomor kontrak, jangka waktu, dan monitoring surat jaminan (Jamlak, Jamuka, Jamwar).',
            usage: [
                'Pilih proyek aktif yang membutuhkan pendaftaran kontrak.',
                'Isi detail jaminan & unggah scan dokumen kontrak asli.',
                'Update progres tahapan administrasi kontrak hingga mencapai 100%.'
            ]
        },
        {
            id: 'merchandiser',
            title: 'Operational Assets',
            icon: 'inventory_2',
            color: 'bg-violet-600',
            description: 'Manajemen pengadaan barang dari vendor, Purchase Order (PO), Invoice, dan stok operasional lapangan secara real-time.',
            usage: [
                'Buat Purchase Order (PO) untuk vendor atau supplier terkait.',
                'Catat invoice dan update status pembayaran tagihan.',
                'Monitoring selisih antara barang yang dipesan dengan barang yang telah tiba di site.'
            ]
        },
        {
            id: 'shipping',
            title: 'Shipping Control',
            icon: 'local_shipping',
            color: 'bg-sky-600',
            description: 'Pengaturan logistik dan pengiriman barang dari vendor/gudang ke lokasi proyek dengan pelacakan BA Anname/Inname.',
            usage: [
                'Tentukan tanggal pengiriman dan mode pengiriman (Lengkap atau Bertahap).',
                'Input nomor resi dan unggah surat jalan pengiriman barang.',
                'Input nomor Berita Acara (BA) jika barang sudah diterima dan diverifikasi di lokasi.'
            ]
        },
        {
            id: 'billing',
            title: 'Billing Integrity',
            icon: 'account_balance',
            color: 'bg-emerald-600',
            description: 'Modul finansial untuk pemantauan tagihan termin, Berita Acara Serah Terima (BAST), dan kelengkapan dokumen keuangan.',
            usage: [
                'Input data nomor dan tanggal BAST (Berita Acara Serah Terima).',
                'Tentukan jenis termin penagihan (DP, Termin Progres, atau Pelunasan).',
                'Monitoring status kelengkapan dokumen penagihan dan verifikasi pembayaran masuk.'
            ]
        },
        {
            id: 'report',
            title: 'Enterprise Reporting',
            icon: 'analytics',
            color: 'bg-amber-500',
            description: 'Pusat data real-time yang menyajikan statistik performa proyek, log aktivitas tim, dan evaluasi anggaran tahunan secara visual.',
            usage: [
                'Akses modul Dashboard atau menu Reports.',
                'Gunakan filter tahun atau kategori untuk melihat grafik performa tertentu.',
                'Cetak laporan detail proyek untuk kebutuhan evaluasi internal atau stakeholder.'
            ]
        }
    ];

    return (
        <>
            <Head title="Protrack Pro | Enterprise Project Integrity" />
            <div className="bg-slate-50 dark:bg-[#0c1120] font-sans text-slate-900 dark:text-slate-100 antialiased transition-colors duration-700 selection:bg-indigo-600/30">
                
                {/* Dynamic Background */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 dark:bg-violet-600/5 blur-[140px] rounded-full animate-pulse-slow [animation-delay:2s]" />
                    <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark opacity-[0.15] dark:opacity-[0.03]" />
                </div>

                {/* Minimalist Header */}
                <header className={`fixed top-0 left-0 w-full z-[80] transition-all duration-500 border-b ${scrolled ? 'bg-white/70 dark:bg-[#0c1120]/70 backdrop-blur-2xl py-3 border-slate-200/50 dark:border-white/[0.05] shadow-lg' : 'bg-transparent py-5 border-transparent'}`}>
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                        <Link href="/" className={`flex items-center gap-3.5 group cursor-pointer transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className="relative size-10 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl overflow-hidden shadow-2xl transition-all group-hover:scale-110 active:scale-95">
                                <span className="material-symbols-outlined !text-2xl z-10">analytics</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black tracking-tight leading-none">Protrack Pro</h2>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-500 dark:text-indigo-400 opacity-80 mt-1">Enterprise System</span>
                            </div>
                        </Link>
                        
                        <nav className="hidden lg:flex items-center gap-10">
                            {['Fitur', 'Cara Kerja'].map((item) => (
                                <a 
                                    key={item}
                                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                                    className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all hover:-translate-y-0.5"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 lg:gap-5">
                            <button onClick={toggleDarkMode} className="hidden sm:flex p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined !text-2xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
                            </button>
                            <Link
                                href={auth.user ? route('dashboard') : route('login')}
                                className={`hidden sm:inline-flex h-11 px-7 items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/10 dark:shadow-none ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                {auth.user ? 'Ke Dashboard' : 'Member Area'}
                            </Link>
                            
                            {/* Mobile Menu Toggle */}
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden size-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                            >
                                <span className="material-symbols-outlined !text-2xl">{isMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                </header>

                <main className="relative overflow-x-hidden">
                    
                    {/* Hero Section */}
                    <section className="relative pt-40 pb-20 lg:pt-64 lg:pb-52 px-6">
                        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-10 animate-fade-in-up">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                TIM PROYEK PROJECT ECOSYSTEM 2.0
                            </div>
                            
                            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-8 lg:mb-10 leading-[1] lg:leading-[0.95] animate-reveal">
                                Precise Project <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 dark:from-white dark:via-indigo-200 dark:to-slate-500">Lifecycle Control.</span>
                            </h1>
                            
                            <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium animate-reveal [animation-delay:200ms]">
                                Platform pemantauan terpadu untuk efisiensi kontrak, akurasi logistik, dan transparansi billing di setiap fase proyek NexaGroup.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-reveal [animation-delay:400ms]">
                                <Link
                                    href={route('login')}
                                    className="group relative w-full sm:w-auto h-14 px-10 inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40"
                                >
                                    Mulai Pantau Proyek
                                    <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </Link>
                                <a
                                    href="#fitur"
                                    className="w-full sm:w-auto h-14 px-10 inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 font-black transition-all"
                                >
                                    Eksplorasi Modul
                                </a>
                            </div>

                            {/* Realistic Dashboard Mockup */}
                            <div className="mt-24 relative w-full max-w-6xl mx-auto group animate-reveal [animation-delay:600ms]">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-[#0c1120] z-10 pointer-events-none" />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-indigo-500/20 blur-[80px] -z-10" />
                                
                                <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#161d31]/80 backdrop-blur-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden border-t-white/20 dark:border-t-white/5 transition-all duration-700 group-hover:shadow-[0_60px_120px_-30px_rgba(79,70,229,0.2)]">
                                    {/* Mockup Internal Header */}
                                    <div className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#161d31] relative z-20">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg">
                                                <span className="material-symbols-outlined !text-xl">dashboard_customize</span>
                                            </div>
                                            <span className="text-sm font-black tracking-tight">PROTRACK <span className="text-indigo-600">PRO</span></span>
                                        </div>

                                        <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8">
                                            <div 
                                                onClick={() => setMockTab('dashboard')}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all ${mockTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                                            >
                                                <span className="material-symbols-outlined !text-sm">grid_view</span> Dashboard
                                            </div>
                                            <div 
                                                onClick={() => setMockTab('reports')}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all ${mockTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                                            >
                                                <span className="material-symbols-outlined !text-sm">analytics</span> Reports
                                            </div>
                                        </nav>
                                        
                                        <div className="flex items-center gap-4 lg:gap-6 text-slate-400">
                                            <div className="hidden lg:flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5">
                                                <span className="material-symbols-outlined !text-sm text-slate-400">search</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ctrl+K</span>
                                            </div>
                                            <div className="relative">
                                                <span className="material-symbols-outlined !text-2xl">notifications</span>
                                                <div className="absolute top-0 right-0 size-1.5 bg-red-500 border border-white dark:border-[#161d31] rounded-full" />
                                            </div>
                                            <span className="hidden lg:inline material-symbols-outlined">settings</span>
                                            <div className="hidden lg:block size-8 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0">
                                                <img src="https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff" alt="User" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 lg:p-12 space-y-10 bg-[#f8fafc] dark:bg-[#0c1120] overflow-y-auto max-h-[700px] custom-scrollbar pb-32 lg:pb-12">
                                        {mockTab === 'dashboard' ? (
                                            <div className="animate-reveal space-y-10">
                                                <div className="flex flex-col justify-start items-start gap-6">
                                                    <div>
                                                        <h4 className="text-3xl lg:text-4xl font-black tracking-tight mb-2 leading-tight">Halo, Selamat Datang kembali!</h4>
                                                        <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">SEMOGA HARIMU MENYENANGKAN, <span className="text-indigo-600 uppercase tracking-widest">BENY</span>.</p>
                                                    </div>
                                                    <div className="h-14 lg:h-12 px-10 lg:px-6 bg-[#1a2b3c] text-white rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 cursor-pointer hover:scale-[1.02] transition-transform w-full sm:w-auto justify-center">
                                                        <span className="material-symbols-outlined !text-xl">upload</span> EXPORT <span className="material-symbols-outlined !text-sm">expand_more</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-6">
                                                    {/* Date Card */}
                                                    <div className="h-36 relative rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden flex items-center px-8 shadow-2xl shadow-indigo-500/20">
                                                        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
                                                        <div className="flex items-center gap-6 relative z-10 w-full mb-2">
                                                            <div className="size-16 lg:size-20 bg-white/10 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border border-white/20 shrink-0">
                                                                <span className="text-[9px] font-black uppercase text-white/60">MAR</span>
                                                                <span className="text-xl lg:text-2xl font-black text-white">30</span>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xl lg:text-2xl font-black text-white mb-0.5 leading-none">Senin</h5>
                                                                <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">MAR 2026 • PROTRACK PRO</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Weather Card */}
                                                    <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-5">
                                                            <span className="material-symbols-outlined !text-5xl text-slate-300">cloud</span>
                                                            <div className="text-left">
                                                                <div className="text-2xl lg:text-3xl font-black tracking-tight">30°C</div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">BERAWAN</div>
                                                            </div>
                                                        </div>
                                                        <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 flex items-center justify-center shadow-sm">
                                                            <span className="material-symbols-outlined !text-xl">explore</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Billing Card Section */}
                                                <div className="p-8 lg:p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5 relative overflow-hidden group/card shadow-xl shadow-indigo-500/5">
                                                    <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/5 -skew-x-12 translate-x-1/2" />
                                                    <div className="flex flex-col gap-6 mb-10 relative z-10">
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">TOTAL BILLING PROTRACK</h5>
                                                            <div className="flex flex-col gap-3">
                                                                <h6 className="text-3xl lg:text-6xl font-black tracking-tight">Rp 4.144.959.000</h6>
                                                                <div className="w-fit px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined !text-base font-black">trending_up</span> 0%
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-5xl font-black text-indigo-600 mb-2">0%</div>
                                                        </div>
                                                    </div>
                                                    <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
                                                        <div className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,1)]" style={{ width: '90%' }} />
                                                    </div>
                                                </div>

                                                {/* Stats Row */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {[
                                                        { label: 'TOTAL PROJECT', val: '10', sub: 'UNIT PROJECTS', icon: 'layers', color: 'indigo' },
                                                        { label: 'PROYEK BERJALAN', val: '7', sub: 'SEDANG DIPROSES', icon: 'assignment', color: 'blue' },
                                                        { label: 'PROYEK SELESAI', val: '3', sub: 'TOTAL SELESAI', icon: 'check_circle', color: 'emerald' },
                                                    ].map((s, i) => (
                                                        <div key={i} className="p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex items-center justify-between">
                                                            <div>
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-6">{s.label}</span>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-4xl font-black">{s.val}</span>
                                                                    <span className="text-xs font-black text-slate-300">•</span>
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 block">{s.sub}</span>
                                                            </div>
                                                            <div className={`size-14 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500 shadow-xl shadow-${s.color}-500/10`}>
                                                                <span className="material-symbols-outlined !text-3xl">{s.icon}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Chart & Logs Section */}
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                    <div className="lg:col-span-2 p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                        <div className="flex justify-between items-center mb-10">
                                                            <h5 className="text-xs font-black uppercase tracking-widest">Trend Progres Project</h5>
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-2.5 bg-slate-800 rounded-full" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AVG. PROGRES (%)</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-64 relative flex flex-col justify-between pt-4">
                                                            {[100, 75, 50, 25, 0].map(v => (
                                                                <div key={v} className="flex items-center gap-4">
                                                                    <span className="text-[10px] font-black text-slate-300 w-8">{v}%</span>
                                                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                                                </div>
                                                            ))}
                                                            <div className="absolute inset-0 flex items-end justify-between px-10 pt-8 pb-4">
                                                                {[
                                                                    { m: 'JAN', h: '20%' }, { m: 'FEB', h: '35%' }, { m: 'MAR', h: '90%' }, 
                                                                    { m: 'APR', h: '60%' }, { m: 'MEI', h: '45%' }, { m: 'JUN', h: '70%' }, 
                                                                    { m: 'JUL', h: '55%' }, { m: 'AGU', h: '80%' }, { m: 'SEP', h: '65%' }, 
                                                                    { m: 'OKT', h: '50%' }, { m: 'NOV', h: '75%' }, { m: 'DES', h: '85%' }
                                                                ].map((d, i) => (
                                                                    <div key={i} className="flex flex-col items-center gap-4 group">
                                                                        <div className="w-1.5 bg-slate-800/10 rounded-full relative h-[140px] flex items-end">
                                                                            <div 
                                                                                className="w-full bg-slate-800 rounded-full transition-all duration-1000 group-hover:bg-indigo-600" 
                                                                                style={{ height: d.h }} 
                                                                            />
                                                                        </div>
                                                                        <span className="text-[9px] font-black text-slate-400">{d.m}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                        <div className="flex justify-between items-center mb-8">
                                                            <h5 className="text-xs font-black uppercase tracking-widest">AKTIVITAS SISTEM</h5>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">LOG TERBARU</div>
                                                        </div>
                                                        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                                            {[
                                                                { admin: 'super admin', action: 'memperbarui data proyek', target: 'PEMBANGUNAN TOWER BTS 4G', time: '10:45' },
                                                                { admin: 'super admin', action: 'mengunggah dokumen billing', target: 'PO PROCUREMENT ZONA 1', time: '09:12' },
                                                                { admin: 'super admin', action: 'validasi Berita Acara', target: 'PENGADAAN CORE SWITCH', time: 'Kemarin' },
                                                                { admin: 'super admin', action: 'mencetak laporan bulanan', target: 'REKAPITULASI Q1 2026', time: 'Kemarin' },
                                                            ].map((log, i) => (
                                                                <div key={i} className="flex gap-4 group cursor-default">
                                                                    <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                                        <span className="material-symbols-outlined !text-xl">history_edu</span>
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <p className="text-[11px] font-bold leading-tight">
                                                                            <span className="text-indigo-600">{log.admin}</span> {log.action} <span className="text-slate-500">{log.target}</span>
                                                                        </p>
                                                                        <span className="text-[9px] font-black text-slate-300 uppercase">{log.time}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-8 h-12 w-full bg-slate-900 text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors cursor-pointer">
                                                            LIHAT SEMUA LOG
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Jatuh Tempo Section */}
                                                <div className="p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                    <div className="flex items-center justify-between mb-10">
                                                        <div>
                                                            <h5 className="text-xs font-black uppercase tracking-widest mb-2">PROYEK JATUH TEMPO</h5>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEADLINE DALAM 30 HARI</p>
                                                        </div>
                                                        <div className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                                            <div className="size-1.5 bg-rose-500 rounded-full animate-pulse" />
                                                            URGENT MONITORING
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {[
                                                            { name: 'MAINTENANCE FIBER OPTIC ZONE SURABAYA', up: 'UP-2026-001', date: '15 APR 2026', status: 'DANGER', color: 'rose' },
                                                            { name: 'PENGADAAN MODUL TRANSCEIVER 10G', up: 'UP-2026-042', date: '28 APR 2026', status: 'WARNING', color: 'amber' },
                                                        ].map((p, i) => (
                                                            <div key={i} className="p-6 bg-[#fcfcfc] dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/30 transition-colors">
                                                                <div className={`size-12 rounded-2xl bg-${p.color}-500/10 flex items-center justify-center text-${p.color}-500`}>
                                                                    <span className="material-symbols-outlined">alarm</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h6 className="text-[11px] font-black uppercase tracking-wide group-hover:text-indigo-600 transition-colors">{p.name}</h6>
                                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-1">
                                                                        <span className="material-symbols-outlined !text-sm">fingerprint</span> {p.up}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-[11px] font-black mb-2">{p.date}</div>
                                                                    <div className={`px-4 py-1.5 bg-${p.color}-500/10 text-${p.color}-500 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2`}>
                                                                        <span className="material-symbols-outlined !text-[120%]">error</span> {p.status}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-reveal space-y-10">
                                                {/* Reports Header */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-4xl font-black tracking-tighter mb-2">Pusat Laporan</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-0.5 bg-indigo-600 rounded-full" />
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ANALISIS & REKAPITULASI DATA</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="h-12 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-6 text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm">
                                                            Semua Data <span className="material-symbols-outlined !text-xs">expand_more</span>
                                                        </div>
                                                        <div className="h-12 px-6 bg-slate-900 text-white rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 cursor-pointer hover:bg-slate-800 transition-colors">
                                                            <span className="material-symbols-outlined !text-sm">analytics</span> EXPORT SEMUA
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Charts Row */}
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                    <div className="lg:col-span-2 p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                        <div className="flex justify-between items-center mb-10">
                                                            <div>
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest mb-1">STATISTIK BULANAN</h5>
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">JUMLAH PROJECT KESELURUHAN</p>
                                                            </div>
                                                            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[8px] font-black uppercase flex items-center gap-2">
                                                                <div className="size-1.5 bg-indigo-500 rounded-full" /> PROYEK BARU
                                                            </div>
                                                        </div>
                                                        <div className="h-48 flex items-end justify-between px-4 pb-8 border-b border-slate-100 dark:border-white/5">
                                                            {[10, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2].map((h, i) => (
                                                                <div key={i} className="flex flex-col items-center gap-2 group">
                                                                    <div 
                                                                        className={`w-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex items-end h-32`}
                                                                    >
                                                                        <div className="w-full bg-indigo-600 rounded-full" style={{ height: `${h * 10}%` }} />
                                                                    </div>
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase">{['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'][i]}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest mb-1 text-center">STATUS PROJECT</h5>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-12 text-center">DISTRIBUSI REAL-TIME</p>
                                                        <div className="relative size-40 mx-auto mb-10">
                                                            <svg className="w-full h-full -rotate-90">
                                                                <circle cx="80" cy="80" r="70" className="stroke-slate-100 dark:stroke-white/5 fill-none" strokeWidth="12" />
                                                                <circle cx="80" cy="80" r="70" className="stroke-indigo-600 fill-none" strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 - (440 * 0.7)} strokeLinecap="round" />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-4xl font-black">10</span>
                                                                <span className="text-[8px] font-black text-slate-400 uppercase">TOTAL CASES</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {[
                                                                { l: 'ONGOING', c: 'indigo', val: 7 },
                                                                { l: 'COMPLETED', c: 'emerald', val: 3 },
                                                                { l: 'PENDING', c: 'amber', val: 0 },
                                                            ].map(s => (
                                                                <div key={s.l} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`size-1.5 bg-${s.c}-500 rounded-full`} />
                                                                        <span className="text-[9px] font-black uppercase text-slate-400">{s.l}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-black">{s.val}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Value Tracking */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                        <div className="flex justify-between items-start mb-10">
                                                            <div>
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest mb-1">NILAI KONTRAK PER PERUSAHAAN</h5>
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AKUMULASI NILAI PROYEK</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">TOTAL NILAI</span>
                                                                <span className="text-xl font-black">Rp 10,0 Miliar</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                                                <span>PT. TIM PROYEK ECOSYSTEM</span>
                                                                <span className="text-indigo-600">100%</span>
                                                            </div>
                                                            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5">
                                                        <div className="flex justify-between items-center mb-10">
                                                            <h5 className="text-[10px] font-black uppercase tracking-widest">PROYEK JATUH TEMPO</h5>
                                                            <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[8px] font-black flex items-center gap-2">
                                                                <div className="size-1 bg-rose-500 rounded-full" /> LIVE MONITORING
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                                <span className="material-symbols-outlined !text-xl">priority_high</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h6 className="text-[10px] font-black mb-0.5">MAINTENANCE FIBER OPTIC...</h6>
                                                                <p className="text-[8px] font-medium text-slate-400">UP-2026-001 • PROTRACK SYSTEM</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[9px] font-black block">15 APR 2026</span>
                                                                <span className="text-[8px] font-black text-emerald-500 uppercase">SAFE</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Module Efficiency Grid */}
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                    {['KONTRAK', 'MERCHANDISER', 'PENAGIHAN', 'PENGIRIMAN'].map((m, i) => (
                                                        <div key={m} className="p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-8">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`size-12 rounded-2xl bg-${['indigo','blue','rose','emerald'][i]}-500/10 flex items-center justify-center text-${['indigo','blue','rose','emerald'][i]}-500 shadow-xl shadow-${['indigo','blue','rose','emerald'][i]}-500/5`}>
                                                                    <span className="material-symbols-outlined">{['description', 'inventory_2', 'payments', 'local_shipping'][i]}</span>
                                                                </div>
                                                                <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[7px] font-black tracking-widest uppercase">SELENGKAPNYA</div>
                                                            </div>
                                                            <div>
                                                                <h6 className="text-[11px] font-black tracking-widest mb-1">{m}</h6>
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FASE {i+1}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[9px] font-bold">
                                                                    <span className="text-indigo-600">ONGOING</span> <span>7 Proj</span>
                                                                </div>
                                                                <div className="flex justify-between text-[9px] font-bold">
                                                                    <span className="text-emerald-600">COMPLETE</span> <span>3 Proj</span>
                                                                </div>
                                                            </div>
                                                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                                                <span className="text-[9px] font-black text-slate-300 uppercase">EFFICIENCY</span>
                                                                <span className="text-lg font-black text-indigo-600 opacity-20">0%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Financial Metrics Row */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    {[
                                                        { l: 'TOTAL NILAI PROYEK', val: 'Rp 10,0', sub: 'Miliar', c: 'indigo' },
                                                        { l: 'AKUMULASI DP', val: 'Rp 2,0', sub: 'Miliar', c: 'emerald' },
                                                        { l: 'PEMBAYARAN LANGSUNG', val: 'Rp 0', sub: 'Project', c: 'amber' },
                                                        { l: 'TAGIHAN TERMIN', val: 'Rp 0', sub: 'Project', c: 'rose' }
                                                    ].map((f, i) => (
                                                        <div key={i} className="p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                                                            <div className={`size-10 rounded-xl bg-${f.c}-500/10 flex items-center justify-center text-${f.c}-500 mb-6`}>
                                                                <span className="material-symbols-outlined">{['account_balance_wallet', 'payments', 'verified_user', 'description'][i]}</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">{f.l}</span>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-black">{f.val}</span>
                                                                <span className="text-[10px] font-black text-slate-300 uppercase">{f.sub}</span>
                                                            </div>
                                                            <div className="mt-4 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                                <div className={`h-full bg-${f.c}-500 rounded-full`} style={{ width: i === 0 ? '100%' : i === 1 ? '20%' : '0%' }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action Banners */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="p-10 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5 relative group cursor-pointer overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-500/5 -skew-x-12 translate-x-1/2" />
                                                        <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-10">
                                                            <span className="material-symbols-outlined !text-3xl">work_history</span>
                                                        </div>
                                                        <h5 className="text-2xl font-black tracking-tight mb-2">Laporan Project</h5>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">24 LAPORAN TERSEDIA</p>
                                                        <div className="flex items-center gap-3 text-indigo-600 group-hover:gap-6 transition-all duration-300 transform">
                                                            <span className="text-xs font-black uppercase tracking-widest">Lihat Detail</span>
                                                            <span className="material-symbols-outlined">arrow_forward</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer">
                                                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] font-black text-white flex items-center gap-2">
                                                            <div className="size-1.5 bg-white rounded-full animate-pulse" /> AI READY
                                                        </div>
                                                        <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-10">
                                                            <span className="material-symbols-outlined !text-3xl">auto_awesome</span>
                                                        </div>
                                                        <h5 className="text-2xl font-black text-white tracking-tight mb-2">AI Summarize</h5>
                                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-10 leading-relaxed">HASILKAN INSIGHT & RINGKASAN OTOMATIS PERFORMA PROJECT SECARA KESELURUHAN DENGAN AI</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-white uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">Generate Now</span>
                                                            <div className="size-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg">
                                                                <span className="material-symbols-outlined !text-sm">bolt</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mockup Internal Bottom Navigation (Mobile Only) */}
                                    <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-[30]">
                                        <div className="bg-white dark:bg-[#161d31] rounded-[2rem] p-3 flex items-center justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-white/5">
                                            {[
                                                { id: 'dashboard', label: 'DASHBOARD', icon: 'grid_view' },
                                                { id: 'reports', label: 'REPORTS', icon: 'bar_chart' },
                                                { id: 'profile', label: 'PROFILE', icon: 'person' },
                                            ].map((item) => (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => setMockTab(item.id)}
                                                    className="flex-1 flex flex-col items-center gap-1.5 py-1 transition-all cursor-pointer"
                                                >
                                                    <div className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${mockTab === item.id ? 'bg-slate-100 dark:bg-white/5 text-indigo-600' : 'text-slate-400'}`}>
                                                        <span className="material-symbols-outlined !text-xl">{item.icon}</span>
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${mockTab === item.id ? 'text-indigo-600' : 'text-slate-300'}`}>{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features (Bento Grid) */}
                    <section id="fitur" className="py-24 lg:py-40 px-6 reveal-on-scroll">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-20 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                <div className="max-w-2xl">
                                    <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight leading-none">Modular & Integrated.</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl font-medium tracking-tight">Satu platform untuk semua kebutuhan operasional proyek Anda.</p>
                                </div>
                                <div className="hidden lg:block h-px flex-1 bg-slate-200 dark:bg-white/10 mx-10 mb-5" />
                                <div className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-2 group cursor-pointer" onClick={() => setSelectedModule(modules[4])}>
                                    Lihat Semua Modul <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Contract Module */}
                                <div 
                                    onClick={() => setSelectedModule(modules[0])}
                                    className="md:col-span-2 p-8 lg:p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161d31] group hover:border-indigo-500/50 transition-all overflow-hidden relative cursor-pointer"
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="size-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-500/10">
                                            <span className="material-symbols-outlined !text-4xl text-indigo-500">description</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl lg:text-3xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">Contract Management</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-4">Penyimpanan kontrak terpusat dan monitoring surat jaminan proyek.</p>
                                            <span className="text-xs font-black text-indigo-500/50 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Pelajari Selengkapnya <span className="material-symbols-outlined !text-xs font-black">arrow_forward</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Merchandising Module */}
                                <div 
                                    onClick={() => setSelectedModule(modules[1])}
                                    className="md:col-span-2 p-8 lg:p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161d31] group hover:border-violet-500/50 transition-all relative overflow-hidden cursor-pointer"
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="size-14 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-violet-500/10">
                                            <span className="material-symbols-outlined !text-4xl text-violet-500">inventory_2</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl lg:text-3xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">Operational Assets</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-4">Pengadaan barang dari vendor dan monitoring stok harian lapangan.</p>
                                            <span className="text-xs font-black text-violet-500/50 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Pelajari Selengkapnya <span className="material-symbols-outlined !text-xs font-black">arrow_forward</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Module */}
                                <div 
                                    onClick={() => setSelectedModule(modules[2])}
                                    className="md:col-span-2 p-8 lg:p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161d31] group hover:border-sky-500/50 transition-all relative overflow-hidden cursor-pointer"
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="size-14 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-sky-500/10">
                                            <span className="material-symbols-outlined !text-4xl text-sky-500">local_shipping</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl lg:text-3xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">Shipping Control</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-4">Pantau status logistik dan validasi Berita Acara (BA) pengiriman.</p>
                                            <span className="text-xs font-black text-sky-500/50 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Pelajari Selengkapnya <span className="material-symbols-outlined !text-xs font-black">arrow_forward</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Finance Module */}
                                <div 
                                    onClick={() => setSelectedModule(modules[3])}
                                    className="md:col-span-2 p-8 lg:p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161d31] group hover:border-emerald-500/50 transition-all relative overflow-hidden cursor-pointer"
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="size-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-emerald-500/10">
                                            <span className="material-symbols-outlined !text-4xl text-emerald-500">account_balance</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl lg:text-3xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Billing Integrity</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-4">Manajemen termin pembayaran dan monitoring status BAST.</p>
                                            <span className="text-xs font-black text-emerald-500/50 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Pelajari Selengkapnya <span className="material-symbols-outlined !text-xs font-black">arrow_forward</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How it Works / Lifecycle */}
                    <section id="cara-kerja" className="py-24 lg:py-40 border-y border-slate-200 dark:border-white/5 bg-slate-100/30 dark:bg-white/[0.01] reveal-on-scroll">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="max-w-3xl mb-24">
                                <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-sm">System Workflow</span>
                                <h2 className="text-4xl lg:text-7xl font-black mt-4 tracking-tighter leading-[1] lg:leading-[0.9]">End-to-End <br className="hidden sm:block" />Visibility.</h2>
                            </div>

                            <div className="relative">
                                {/* Vertical Progress Line */}
                                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 -translate-x-1/2" />
                                
                                <div className="space-y-16 lg:space-y-32 relative">
                                    {[
                                        { 
                                            icon: 'create_new_folder', 
                                            title: 'Project Initiation', 
                                            desc: 'Pendaftaran proyek dengan UP Number unik, penentuan vendor, budget type, dan legalitas kontrak utama.',
                                            align: 'right'
                                        },
                                        { 
                                            icon: 'settings_accessibility', 
                                            title: 'Operational Execution', 
                                            desc: 'Tim operasional melakukan input logistik dan merchandiser. Sistem melakukan validasi silang terhadap scope kontrak.',
                                            align: 'left'
                                        },
                                        { 
                                            icon: 'analytics', 
                                            title: 'Dashboard & Reporting', 
                                            desc: 'Stakeholder mendapatkan visibilitas instan melalui report otomatis yang siap dicetak untuk evaluasi berkala.',
                                            align: 'right'
                                        }
                                    ].map((step, idx) => (
                                        <div key={idx} className={`relative flex flex-col lg:flex-row items-center gap-10 lg:gap-20 ${step.align === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                                            <div className="lg:w-1/2 text-center lg:text-left">
                                                <div className={`inline-flex items-center justify-center size-20 rounded-[2rem] bg-indigo-600 text-white shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500`}>
                                                    <span className="material-symbols-outlined !text-4xl">{step.icon}</span>
                                                </div>
                                                <h3 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight">{step.title}</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">{step.desc}</p>
                                            </div>
                                            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-2xl relative group overflow-hidden h-[300px] lg:h-[340px] perspective-1000">
                                                {/* Background Decorative Mesh */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
                                                <div className="absolute -top-24 -right-24 size-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-1000" />
                                                
                                                {/* Scanning Animation Line */}
                                                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent top-0 animate-scan pointer-events-none" />

                                                {/* Layered 3D Icon Effect */}
                                                <div className="relative size-32 lg:size-48 flex items-center justify-center">
                                                    <span className="material-symbols-outlined !text-[100px] lg:!text-[160px] text-slate-100 dark:text-white/[0.02] absolute transform scale-125 group-hover:scale-150 transition-transform duration-1000 select-none">
                                                        {step.icon}
                                                    </span>
                                                    <div className="size-20 lg:size-24 rounded-2xl lg:rounded-3xl bg-indigo-600/10 backdrop-blur-md border border-indigo-500/20 flex items-center justify-center text-indigo-600 shadow-2xl transform translate-z-10 group-hover:scale-110 transition-transform duration-700">
                                                        <span className="material-symbols-outlined !text-3xl lg:!text-4xl">{step.icon}</span>
                                                    </div>
                                                    
                                                    {/* Orbiting Dots */}
                                                    <div className="absolute inset-0 border border-indigo-500/10 rounded-full animate-spin-slow" />
                                                    <div className="absolute -top-1 left-1/2 size-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                                </div>

                                                {/* Phase Badge */}
                                                <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 px-5 lg:px-6 py-2 bg-slate-900 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl">
                                                    <div className="size-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                                    <span className="text-[9px] lg:text-[10px] font-black text-white dark:text-indigo-400 uppercase tracking-widest leading-none">PHASE 0{idx+1}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Protrack AI Insight */}
                    <section id="ai-insight" className="py-24 lg:py-40 relative overflow-hidden reveal-on-scroll">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
                        
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                                <div className="max-w-3xl">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                        <div className="size-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                        Ultra-Fast AI Insight
                                    </span>
                                    <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[1] lg:leading-none mb-6">AI Protrack <br />Annual Analysis.</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-xl">Hasilkan ringkasan performa tahunan secara instan dengan teknologi Neural Engine yang memetakan setiap detail operasional proyek Anda.</p>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="h-16 px-10 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
                                        Mulai Analisis Tahunan
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                {/* Main AI Dashboard Card */}
                                <div className="rounded-[4rem] bg-gradient-to-br from-[#805cf3] to-[#d643ee] p-12 lg:p-24 relative overflow-hidden shadow-2xl shadow-purple-500/30">
                                    {/* AI Ready Badge from Image */}
                                    <div className="absolute top-10 right-10 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-3">
                                        <div className="size-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">AI READY</span>
                                    </div>

                                    <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2 -z-10" />
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                                        {/* Left: AI Content */}
                                        <div className="space-y-12">
                                            <div className="space-y-4">
                                                <h3 className="text-4xl font-black text-white tracking-tight">Intelligence Summarize</h3>
                                                <p className="text-white/70 text-lg font-medium leading-relaxed">Sistem AI kami menganalisis ribuan data point dari Kontrak, Merchandiser, hingga Billing untuk menyajikan insight strategis bagi manajemen.</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                                {[
                                                    { label: 'Neural Accuracy', val: '99.8%', desc: 'Presisi Analisis Data' },
                                                    { label: 'Summarize Speed', val: '< 2.0s', desc: 'Performa Tahunan' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all group/stat">
                                                        <span className="text-[9px] lg:text-[10px] font-black text-white/60 uppercase tracking-widest block mb-4">{stat.label}</span>
                                                        <div className="text-3xl lg:text-4xl font-black text-white mb-2">{stat.val}</div>
                                                        <span className="text-[9px] lg:text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.desc}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-6">
                                                {[
                                                    { icon: 'trending_up', title: 'Trend Prediction', desc: 'Prediksi alokasi budget dan performa vendor tahun depan.' },
                                                    { icon: 'description', title: 'Automated BAST Summary', desc: 'Ringkasan otomatis lampiran Berita Acara yang kompleks.' },
                                                    { icon: 'psychology', title: 'Risk Sentiment', desc: 'Identifikasi awal potensi keterlambatan proyek operasional.' }
                                                ].map((feat, i) => (
                                                    <div key={i} className="flex gap-6 group/feat">
                                                        <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover/feat:bg-white group-hover/feat:text-[#805cf3] transition-all duration-300">
                                                            <span className="material-symbols-outlined">{feat.icon}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-1">{feat.title}</h4>
                                                            <p className="text-white/40 text-xs font-medium">{feat.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: AI Visualizer */}
                                        <div className="relative aspect-square flex items-center justify-center">
                                            {/* Pulsing Neural Rings */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="size-[300px] border border-indigo-500/10 rounded-full animate-ping [animation-duration:3s]" />
                                                <div className="absolute size-[400px] border border-indigo-500/5 rounded-full animate-ping [animation-duration:4s]" />
                                            </div>

                                            {/* AI Core */}
                                            <div className="relative size-56 lg:size-64 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-full flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_150px_rgba(255,255,255,0.2)] transition-shadow duration-1000 shrink-0">
                                                <div className="absolute inset-4 border border-white/20 rounded-full animate-spin-slow" />
                                                <div className="absolute inset-8 border border-white/10 rounded-full animate-spin-slow [animation-direction:reverse]" />
                                                
                                                <span className="material-symbols-outlined !text-6xl lg:!text-7xl text-white mb-4 animate-pulse">auto_awesome</span>
                                                <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1 opacity-70">AI CORE ACTIVE</div>
                                                <div className="text-3xl lg:text-4xl font-black text-white px-8">Neural Insight.</div>
                                            </div>

                                            {/* Stats Indicators Around Core */}
                                            {[
                                                { label: 'Processing', val: '100K+', top: '0%', right: '0%' },
                                                { label: 'Security', val: 'AES-256', bottom: '0%', right: '0%' },
                                                { label: 'Precision', val: '99%', bottom: '0%', left: '0%' },
                                            ].map((node, i) => (
                                                <div 
                                                    key={i} 
                                                    className="hidden sm:block absolute p-4 px-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl animate-reveal"
                                                    style={{ top: node.top, right: node.right, left: node.left, bottom: node.bottom }}
                                                >
                                                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest block mb-1">{node.label}</span>
                                                    <span className="text-xl font-black text-white">{node.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Final CTA */}
                    <section className="py-24 lg:py-48 px-6 text-center">
                        <div className="max-w-4xl mx-auto rounded-[2.5rem] lg:rounded-[3.5rem] bg-slate-900 text-white p-10 lg:p-24 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent -z-10" />
                            <div className="absolute -bottom-24 -right-24 size-96 bg-violet-500/20 blur-[100px] rounded-full" />
                            
                            <h2 className="text-4xl lg:text-7xl font-black mb-10 tracking-tight leading-[1] lg:leading-none">Ready for <br className="hidden sm:block" />Better Insight?</h2>
                            <p className="text-indigo-100/60 text-lg lg:text-xl mb-14 max-w-xl mx-auto font-medium">Platform profesional untuk tim profesional. Akses dashboard Anda sekarang.</p>
                            
                            <Link
                                href={route('login')}
                                className="h-14 lg:h-16 px-10 lg:px-12 inline-flex items-center justify-center rounded-2xl bg-white text-black font-black hover:scale-105 active:scale-95 transition-all shadow-xl w-full sm:w-auto"
                            >
                                Masuk ke Portal
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="py-20 px-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c1120] relative z-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-10 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-xl">
                                        <span className="material-symbols-outlined !text-xl">analytics</span>
                                    </div>
                                    <h2 className="text-2xl font-black">Protrack Pro</h2>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium leading-relaxed">Solusi monitoring proyek enterprise kelas dunia untuk ekosistem Tim Proyek Indonesia.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full lg:w-auto">
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Products</h4>
                                    <ul className="text-sm font-bold text-slate-600 dark:text-slate-400 space-y-4">
                                        <li><div onClick={() => setSelectedModule(modules[0])} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">Contracts Management</div></li>
                                        <li><div onClick={() => setSelectedModule(modules[4])} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">Enterprise Reports</div></li>
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Legal Documents</h4>
                                    <ul className="text-sm font-bold text-slate-600 dark:text-slate-400 space-y-4">
                                        <li><button onClick={() => setSelectedLegal('privacy')} className="hover:text-indigo-600 dark:hover:text-white transition-colors text-left block w-full">Privacy Policy</button></li>
                                        <li><button onClick={() => setSelectedLegal('terms')} className="hover:text-indigo-600 dark:hover:text-white transition-colors text-left block w-full">Terms of Service</button></li>
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Developer</h4>
                                    <div className="space-y-4">
                                        <a href="mailto:rhamdani128@gmail.com" className="flex items-center gap-4 group">
                                            <div className="size-10 shrink-0 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                                <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors !text-xl">mail</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                                <span className="text-[11px] font-black group-hover:text-indigo-500 transition-colors">rhamdani128@gmail.com</span>
                                            </div>
                                        </a>
                                        <a href="https://github.com/ferryiqbalrhamdani" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                                            <div className="size-10 shrink-0 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                                <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors !text-xl">code</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Github</span>
                                                <span className="text-[11px] font-black group-hover:text-indigo-500 transition-colors">Ferry Iqbal Rhamdani</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-slate-200 dark:border-white/5">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">© {new Date().getFullYear()} Protrack Pro System. Powered by Tim Proyek Intelligence.</p>
                            <div className="flex items-center gap-8 text-slate-400 contrast-125">
                                <div className="flex items-center gap-3">
                                    <div className={`size-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>{isOnline ? 'Network Stable' : 'Connection Lost'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Mobile Navigation Drawer */}
            <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
                <div className={`absolute right-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#161d31] border-l border-slate-200 dark:border-white/10 transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 space-y-8 h-full flex flex-col relative pt-24">
                        {/* Close button inside drawer */}
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-6 right-6 size-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                        >
                            <span className="material-symbols-outlined !text-2xl">close</span>
                        </button>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Navigasi</span>
                            <div className="flex flex-col gap-4">
                                {['Fitur', 'Cara Kerja'].map((item) => (
                                    <a 
                                        key={item}
                                        href={`#${item.toLowerCase().replace(' ', '-')}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-2xl font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Pengaturan</span>
                            <button 
                                onClick={toggleDarkMode}
                                className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-between font-bold text-slate-900 dark:text-white"
                            >
                                Tampilan {isDark ? 'Gelap' : 'Terang'}
                                <span className={`material-symbols-outlined ${isDark ? 'text-indigo-400' : 'text-amber-500'}`}>{isDark ? 'dark_mode' : 'light_mode'}</span>
                            </button>
                        </div>
                        <div className="mt-auto">
                            <Link
                                href={auth.user ? route('dashboard') : route('login')}
                                className="w-full h-14 flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-500/20"
                            >
                                {auth.user ? 'Ke Dashboard' : 'Member Area'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <ModuleModal 
                isOpen={!!selectedModule} 
                onClose={() => setSelectedModule(null)} 
                module={selectedModule} 
            />

            <LegalModal
                isOpen={!!selectedLegal}
                onClose={() => setSelectedLegal(null)}
                type={selectedLegal}
            />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes reveal {
                    0% { opacity: 0; transform: translateY(30px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                .animate-reveal {
                    animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
                .animate-fade-in-up {
                    animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .bg-grid-pattern {
                    background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
                    background-size: 32px 32px;
                }
                .bg-grid-pattern-dark {
                    background-image: radial-gradient(circle, #ffffff08 1px, transparent 1px);
                    background-size: 32px 32px;
                }
                .reveal-on-scroll {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    pointer-events: none;
                }
                .reveal-on-scroll.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #6366f1;
                    border-radius: 10px;
                }
            ` }} />
        </>
    );
}
