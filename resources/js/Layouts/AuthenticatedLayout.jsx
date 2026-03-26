import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import SkeletonContent from '@/Components/SkeletonContent';
import { Toaster, toast } from 'react-hot-toast';

export default function AuthenticatedLayout({ header, children, stickySlot }) {
    const { user, permissions, is_admin } = usePage().props.auth;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const defaultNotifications = usePage().props.auth.notifications || [];
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [isLoading, setIsLoading] = useState(false);
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const start = (event) => {
            // Only show global skeleton if it's NOT a partial reload (preserveState: true)
            // or if it's a completely different page.
            if (!event.detail.visit.preserveState) {
                setIsLoading(true);
            }
        };
        const end = () => {
            // Add a tiny delay to ensure React has mounted the new content
            // before we hide the skeleton, preventing the "blink"
            setTimeout(() => setIsLoading(false), 1000);
        };

        const unregisterStart = router.on('start', start);
        const unregisterFinish = router.on('finish', end);
        const unregisterError = router.on('error', end);
        const unregisterCancel = router.on('cancel', end);

        return () => {
            unregisterStart();
            unregisterFinish();
            unregisterError();
            unregisterCancel();
        };
    }, []);

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

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') applyTheme('system');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Flash message listener
    const flash = usePage().props.flash;
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const hasPermission = (permission_name) => {
        if (is_admin) return true;
        return permissions.includes(permission_name);
    }

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', href: route('dashboard'), active: route().current('dashboard'), permission: 'view_dashboard' },
        { name: 'Project', icon: 'business_center', href: route('projects'), active: route().current('projects*'), permission: 'view_projects' },
        { name: 'Kontrak', icon: 'description', href: route('contracts'), active: route().current('contracts*'), permission: 'view_contracts' },
        { name: 'Merchandiser', icon: 'storefront', href: route('merchandiser'), active: route().current('merchandiser*'), permission: 'view_merchandiser' },
        { name: 'Penagihan', icon: 'payments', href: route('billing'), active: route().current('billing*'), permission: 'view_billing' },
        { name: 'Pengiriman', icon: 'local_shipping', href: route('shipping'), active: route().current('shipping*'), permission: 'view_shipping' },
        { name: 'Laporan', icon: 'analytics', href: route('reports'), active: route().current('reports*'), permission: 'view_reports' },
    ].filter(item => hasPermission(item.permission));

    useEffect(() => {
        // Request Browser Notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (window.Echo && user) {
            window.Echo.private(`App.Models.User.${user.id}`)
                .notification((notification) => {
                    const newNotif = {
                        id: notification.id,
                        ...notification,
                        unread: true,
                        time: 'Baru saja'
                    };
                    
                    setNotifications(prev => [newNotif, ...prev]);
                    toast.success(notification.title + ': ' + notification.message); // Fallback toast

                    // Trigger browser notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(notification.title, {
                            body: notification.message,
                        });
                    }
                });
        }

        return () => {
            if (window.Echo && user) {
                window.Echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [user]);

    const markAllRead = () => {
        router.post(route('notifications.markAllRead'), {}, {
            preserveScroll: true,
            onSuccess: () => setNotifications(notifications.map(n => ({...n, unread: false})))
        });
    }

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark font-display selection:bg-primary/10 selection:text-primary overflow-hidden">
            <Toaster position="top-center" toastOptions={{
                duration: 3000,
                style: {
                    borderRadius: '1.25rem',
                    background: 'rgba(16, 185, 129, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px 24px',
                },
                success: {
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10b981',
                    },
                },
            }} />
            {/* Header */}
            <header className="sticky top-0 z-[60] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Left Side: Logo */}
                    <div className="flex-1 flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-lg">analytics</span>
                            </div>
                            <h1 className="text-primary dark:text-slate-100 text-base font-bold leading-none hidden lg:block tracking-tight uppercase italic">Protrack <span className="not-italic text-slate-400">Pro</span></h1>
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <nav className="hidden xl:flex items-center justify-center gap-1 flex-none">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all group ${
                                    item.active 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${item.active ? 'text-white' : ''}`}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Tools */}
                    <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
                        <div className="hidden md:flex items-center">
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                            >
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-2xl">search</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <div className="relative" ref={notificationsRef}>
                                <button 
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`p-2 rounded-lg transition-all relative group ${
                                        isNotificationsOpen 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-2xl transition-transform ${isNotificationsOpen ? 'scale-110 font-fill' : 'group-hover:scale-110'}`}>
                                        notifications
                                    </span>
                                    {notifications.some(n => n.unread) && (
                                        <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark animate-pulse"></span>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl animate-reveal overflow-hidden z-[100] ring-1 ring-black/5 dark:ring-white/5">
                                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.03]">
                                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Notifikasi</h3>
                                            <button onClick={markAllRead} className="text-[10px] font-black text-primary dark:text-blue-400 hover:text-primary-dark dark:hover:text-blue-300 uppercase tracking-widest transition-colors">
                                                Tandai Semua Dibaca
                                            </button>
                                        </div>
                                        
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                <div className="divide-y divide-slate-50 dark:divide-white/5">
                                                    {notifications.map((n) => (
                                                        <div key={n.id} className={`p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/item ${n.unread ? 'bg-primary/5 dark:bg-primary/5' : ''}`}>
                                                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                                n.type === 'project' ? 'bg-blue-500/10 text-blue-500' :
                                                                n.type === 'billing' ? 'bg-rose-500/10 text-rose-500' :
                                                                'bg-emerald-500/10 text-emerald-500'
                                                            }`}>
                                                                <span className="material-symbols-outlined text-xl">
                                                                    {n.type === 'project' ? 'business_center' :
                                                                     n.type === 'billing' ? 'payments' :
                                                                     'description'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{n.title}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{n.time}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                                                            </div>
                                                            {n.unread && (
                                                                <div className="size-2 rounded-full bg-primary dark:bg-blue-400 shrink-0 mt-2"></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-10 flex flex-col items-center justify-center text-center opacity-40">
                                                    <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                                                    <p className="text-xs font-bold uppercase tracking-widest">Tidak ada notifikasi</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-100 dark:border-white/5 text-center">
                                            <Link 
                                                href={route('notifications.index')} 
                                                className="text-[11px] font-black text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors uppercase tracking-[0.2em]"
                                                onClick={() => setIsNotificationsOpen(false)}
                                            >
                                                Lihat Semua Aktivitas
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Master Data Link (Gear Icon) */}
                            {hasPermission('view_master_data') && (
                                <Link 
                                    href={route('master.data.index')}
                                    className={`p-2 rounded-xl transition-all group ${
                                        route().current('master.data.*')
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                                    }`}
                                    title="Master Data"
                                >
                                    <span className={`material-symbols-outlined transition-transform ${route().current('master.data.*') ? 'scale-110 font-fill text-white' : 'group-hover:scale-110'} text-2xl`}>
                                        settings
                                    </span>
                                </Link>
                            )}
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>

                        <div className="relative" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 group outline-none"
                            >
                                <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 group-hover:ring-2 ring-primary/20 transition-all">
                                    <img 
                                        alt="Profile" 
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a2b3c&color=fff`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl animate-reveal p-2 z-[100]">
                                <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-white/5 mb-2">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                                        <img 
                                            alt="Profile" 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a2b3c&color=fff`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{user.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.username || 'Admin'}</span>
                                    </div>
                                </div>

                                {/* Theme Selector Grid */}
                                <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-white/5 p-1 rounded-xl mb-2">
                                    {[
                                        { id: 'light', icon: 'light_mode', tip: 'Mode Terang' },
                                        { id: 'dark', icon: 'dark_mode', tip: 'Mode Gelap' },
                                        { id: 'system', icon: 'settings_brightness', tip: 'Sesuai tema perangkat' },
                                    ].map((t) => (
                                        <div key={t.id} className="relative group/tip">
                                            <button
                                                onClick={() => setTheme(t.id)}
                                                className={`w-full flex justify-center py-2 rounded-lg transition-all ${
                                                    theme === t.id 
                                                        ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10' 
                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-xl ${theme === t.id ? 'font-fill' : ''}`}>{t.icon}</span>
                                            </button>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                {t.tip}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="space-y-1">
                                    <Link 
                                        href={route('profile.edit')} 
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">account_circle</span>
                                        <span>Profile</span>
                                    </Link>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold text-red-500 transition-colors text-left"
                                    >
                                        <span className="material-symbols-outlined text-xl rotate-180">logout</span>
                                        <span>Keluar</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                    className="xl:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg absolute right-4 top-1/2 -translate-y-1/2"
                >
                    <span className="material-symbols-outlined">{showingNavigationDropdown ? 'close' : 'menu'}</span>
                </button>
            </div>
        </header>

            {/* Mobile Navigation */}
            {showingNavigationDropdown && (
                <div className="xl:hidden bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 p-4 animate-reveal">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name}
                                href={item.href} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                                    item.active 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className={`material-symbols-outlined ${item.active ? 'text-white' : ''}`}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {isLoading ? (
                    <SkeletonContent />
                ) : (
                    <>
                        {stickySlot}
                        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-reveal">
                            {children}
                        </div>
                    </>
                )}
            </main>

            {/* Global Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] animate-reveal">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 scale-up">
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                            <div className="p-6 flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-400 text-2xl">search</span>
                                <input 
                                    autoFocus 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-medium p-0 dark:text-white dark:placeholder:text-slate-600" 
                                    placeholder="Cari proyek, kontrak, atau pengiriman..." 
                                    type="text"
                                />
                                <button 
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" 
                                    onClick={() => setIsSearchOpen(false)}
                                >
                                    <span className="material-symbols-outlined text-slate-400">close</span>
                                </button>
                            </div>
                            <div className="border-t border-slate-100 dark:border-white/10 p-4 max-h-96 overflow-y-auto">
                                <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pencarian Terakhir</div>
                                {['Modern Office Hub', 'Logistics Upgrade', 'Retail Chain Sync'].map((item) => (
                                    <button 
                                        key={item}
                                        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                                    >
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">history</span>
                                        <span className="text-sm font-bold dark:text-slate-300">{item}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/5 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider">
                                <span>TEKAN ESC UNTUK MENUTUP</span>
                                <div className="flex gap-4">
                                    <span>ENTER UNTUK PILIH</span>
                                    <span>↑↓ UNTUK NAVIGASI</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
