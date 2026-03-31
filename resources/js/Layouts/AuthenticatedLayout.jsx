import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import SkeletonContent from '@/Components/SkeletonContent';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavigation from '@/Components/BottomNavigation';
import BottomSheet from '@/Components/BottomSheet';
import { useTheme } from '@/Components/ThemeProvider';

export default function AuthenticatedLayout({ header, children, stickySlot, bottomStickySlot, backUrl, backLabel, isReviewMode = false }) {
    const { user, permissions, is_admin } = usePage().props.auth;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { theme, setTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const defaultNotifications = usePage().props.auth.notifications || [];
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [isLoading, setIsLoading] = useState(false);
    const [isTopbarHidden, setIsTopbarHidden] = useState(false);
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    const mainRef = useRef(null);
    const lastScrollY = useRef(0);

    // Sync navbar notifications with Inertia shared props (after markAllRead, page navigations, etc.)
    useEffect(() => {
        setNotifications(defaultNotifications);
    }, [JSON.stringify(defaultNotifications)]);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchInputRef = useRef(null);
    const searchDebounceRef = useRef(null);
    const resultsContainerRef = useRef(null);

    const HISTORY_KEY = `protrack_search_history_${user?.id}`;
    const getSearchHistory = () => {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
    };
    const [searchHistory, setSearchHistory] = useState(getSearchHistory);

    const addToHistory = (item) => {
        const updated = [item, ...searchHistory.filter(h => h.url !== item.url)].slice(0, 8);
        setSearchHistory(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    };

    const removeFromHistory = (url) => {
        const updated = searchHistory.filter(h => h.url !== url);
        setSearchHistory(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

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

    // Auto-hide topbar on mobile scroll
    useEffect(() => {
        const mainEl = mainRef.current;
        if (!mainEl) return;

        const handleScroll = () => {
            // Only apply on mobile (< 1280px / xl breakpoint)
            if (window.innerWidth >= 1280) {
                setIsTopbarHidden(false);
                return;
            }
            const currentY = mainEl.scrollTop;
            if (currentY > lastScrollY.current && currentY > 60) {
                setIsTopbarHidden(true);
            } else {
                setIsTopbarHidden(false);
            }
            lastScrollY.current = currentY;
        };

        mainEl.addEventListener('scroll', handleScroll, { passive: true });
        return () => mainEl.removeEventListener('scroll', handleScroll);
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
        { name: 'Contract', icon: 'description', href: route('contracts'), active: route().current('contracts*'), permission: 'view_contracts' },
        { name: 'Merchandiser', icon: 'storefront', href: route('merchandiser'), active: route().current('merchandiser*'), permission: 'view_merchandiser' },
        { name: 'Billing', icon: 'payments', href: route('billing'), active: route().current('billing*'), permission: 'view_billing' },
        { name: 'Shipping', icon: 'local_shipping', href: route('shipping'), active: route().current('shipping*'), permission: 'view_shipping' },
        { name: 'Reports', icon: 'analytics', href: route('reports'), active: route().current('reports*'), permission: 'view_reports' },
        { name: 'Profile', icon: 'person', href: route('profile.edit'), active: route().current('profile.edit'), permission: true },
    ].filter(item => item.permission === true || hasPermission(item.permission));
    
    const canViewMasterData = hasPermission('view_master_data') || 
                            hasPermission('view_master_company') || 
                            hasPermission('view_master_agency') || 
                            hasPermission('view_master_vendor') || 
                            hasPermission('view_master_auction_type') || 
                            hasPermission('view_master_budget_type') || 
                            hasPermission('view_master_brand_origin') || 
                            hasPermission('manage_users_roles');

    // Mobile Navigation Logic
    const profileItem = navItems.find(i => i.name === 'Profile');
    const mainItems = navItems.filter(i => i.name !== 'Profile');
    
    const profileInMenu = mainItems.length > 3 || (mainItems.length === 2 && canViewMasterData);
    const showMenuButton = canViewMasterData || profileInMenu || mainItems.length > 3;
    
    let bottomNavDisplayItems = [];
    let bottomNavHiddenItems = [];
    
    if (showMenuButton) {
        if (!profileInMenu && profileItem) {
            bottomNavDisplayItems = [...mainItems.slice(0, 2), profileItem].filter(Boolean);
            bottomNavHiddenItems = mainItems.slice(2).filter(Boolean);
        } else {
            bottomNavDisplayItems = mainItems.slice(0, 3).filter(Boolean);
            bottomNavHiddenItems = [...mainItems.slice(3), profileItem].filter(Boolean);
        }
    } else {
        bottomNavDisplayItems = [...mainItems, profileItem].filter(Boolean);
        bottomNavHiddenItems = [];
    }

    const isMoreActive = bottomNavHiddenItems.some(item => item?.active) || 
                        (canViewMasterData && route().current('master.data.*'));



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
                    toast.success(notification.title + ': ' + notification.message);

                    // Play notification sound
                    try {
                        const audio = new Audio('/sounds/notification.wav');
                        audio.volume = 0.5;
                        audio.play().catch(() => {});
                    } catch(e) {}

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

    // Search debounced API call
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        setSelectedIndex(-1);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            fetch(route('api.search') + '?q=' + encodeURIComponent(searchQuery), {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(data => { setSearchResults(data.results || []); setIsSearching(false); })
            .catch(() => setIsSearching(false));
        }, 300);
        return () => clearTimeout(searchDebounceRef.current);
    }, [searchQuery]);

    // Ctrl+K / Cmd+K shortcut + ESC
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isSearchOpen]);

    // Reset search state when modal opens/closes
    useEffect(() => {
        if (isSearchOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedIndex(-1);
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isSearchOpen]);

    // Flatten results for keyboard navigation
    const flatResults = searchQuery.length >= 2 ? searchResults : [];
    const displayItems = searchQuery.length >= 2 ? flatResults : searchHistory;
    const totalItems = displayItems.length;

    const handleSearchKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, totalItems));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + totalItems) % Math.max(1, totalItems));
        } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < totalItems) {
            e.preventDefault();
            const item = displayItems[selectedIndex];
            if (item?.url) {
                addToHistory({ title: item.title, category: item.category || 'Riwayat', icon: item.icon || 'history', color: item.color || 'slate', url: item.url });
                setIsSearchOpen(false);
                router.visit(item.url);
            }
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && resultsContainerRef.current) {
            const el = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    const getColorClasses = (color) => {
        const map = {
            blue: 'bg-blue-500/10 text-blue-500', amber: 'bg-amber-500/10 text-amber-500',
            purple: 'bg-purple-500/10 text-purple-500', rose: 'bg-rose-500/10 text-rose-500',
            emerald: 'bg-emerald-500/10 text-emerald-500', teal: 'bg-teal-500/10 text-teal-500',
            sky: 'bg-sky-500/10 text-sky-500', indigo: 'bg-indigo-500/10 text-indigo-500',
            orange: 'bg-orange-500/10 text-orange-500', pink: 'bg-pink-500/10 text-pink-500',
            lime: 'bg-lime-500/10 text-lime-600', cyan: 'bg-cyan-500/10 text-cyan-500',
            slate: 'bg-slate-500/10 text-slate-500',
        };
        return map[color] || map.slate;
    };

    return (
        <div 
            className="h-screen flex flex-col bg-background-light dark:bg-background-dark font-display selection:bg-primary/10 selection:text-primary overflow-hidden"
            style={{ '--topbar-offset': isTopbarHidden ? '0px' : '80px' }}
        >
            <Toaster 
                position="top-right" 
                toastOptions={{
                    duration: 4000,
                    className: 'glass-toast',
                    style: {
                        borderRadius: '1.25rem',
                        padding: '12px 20px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: '#1e293b',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Header */}
            <div 
                className={`fixed xl:sticky top-0 left-0 right-0 z-[60] w-full transition-transform duration-300 xl:translate-y-0 ${isTopbarHidden ? '-translate-y-full xl:translate-y-0' : 'translate-y-0'}`}
            >
            <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/10 w-full h-20">
                {/* Mobile Review Mode Banner */}
                {isReviewMode && (
                    <div className="xl:hidden bg-amber-500 py-1.5 px-4 flex items-center justify-center gap-2 relative border-b border-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.2)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <span className="material-symbols-outlined text-white text-[14px] font-fill animate-pulse">visibility</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] relative z-10">Mode Peninjauan (Baca Saja)</span>
                    </div>
                )}
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Left Side: Logo */}
                    <div className="flex-1 min-w-0 flex items-center">
                        {backUrl ? (
                            <Link 
                                href={backUrl} 
                                className="xl:hidden flex items-center gap-3 overflow-hidden group"
                            >
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 group-hover:-translate-x-1 transition-transform text-2xl font-black">arrow_back</span>
                                <div className="flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-1.5 leading-none mb-0.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                            Kembali
                                        </span>
                                    </div>
                                    <h2 className="text-slate-900 dark:text-white font-black text-base uppercase tracking-tight truncate leading-none">
                                        {backLabel || 'Informasi Detail'}
                                    </h2>
                                </div>
                            </Link>
                        ) : null}

                        <Link href="/" className={`${backUrl ? 'hidden xl:flex' : 'flex'} items-center gap-2.5 sm:gap-3 group`}>
                            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                                <span className="material-symbols-outlined text-lg font-black">grid_view</span>
                            </div>
                            <h1 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base font-black leading-none tracking-tight uppercase italic flex items-center gap-1.5 truncate">
                                PROTRACK <span className="not-italic text-blue-600 font-black">PRO</span>
                            </h1>
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <nav className="hidden xl:flex items-center justify-center gap-1 flex-none">
                        {navItems.filter(item => item.name !== 'Profile').map((item) => (
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
                    <div className={`flex-1 flex items-center justify-end gap-2 sm:gap-4 ${backUrl ? 'xl:flex hidden' : 'flex'}`}>
                        <div className="hidden md:flex items-center">
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                            >
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-xl">search</span>
                                <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                                    Ctrl+K
                                </kbd>
                            </button>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <div className="relative" ref={notificationsRef}>
                                <button 
                                    onClick={() => {
                                        if (window.innerWidth < 1280) {
                                            router.visit(route('notifications.index'));
                                        } else {
                                            setIsNotificationsOpen(!isNotificationsOpen);
                                        }
                                    }}
                                    className={`p-2 rounded-lg transition-all relative group ${
                                        isNotificationsOpen 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >

                                    <span className={`material-symbols-outlined text-2xl transition-transform ${isNotificationsOpen ? 'scale-110 font-fill' : 'group-hover:scale-110'}`}>
                                        notifications
                                    </span>
                                    {notifications.filter(n => n.unread).length > 0 && (
                                        <span className="absolute top-1 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-white animate-pulse">
                                            {notifications.filter(n => n.unread).length > 99 ? '99+' : notifications.filter(n => n.unread).length}
                                        </span>
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
                                                                n.type === 'contract' ? 'bg-amber-500/10 text-amber-500' :
                                                                n.type === 'merchandiser' ? 'bg-purple-500/10 text-purple-500' :
                                                                n.type === 'billing' ? 'bg-rose-500/10 text-rose-500' :
                                                                n.type === 'shipping' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                'bg-slate-500/10 text-slate-500'
                                                            }`}>
                                                                <span className="material-symbols-outlined text-xl">
                                                                    {n.type === 'project' ? 'business_center' :
                                                                     n.type === 'contract' ? 'description' :
                                                                     n.type === 'merchandiser' ? 'storefront' :
                                                                     n.type === 'billing' ? 'payments' :
                                                                     n.type === 'shipping' ? 'local_shipping' :
                                                                     'notifications'}
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
                            
                            {/* Master Data Link (Gear Icon) - Only on Desktop */}
                            {canViewMasterData && (
                                <Link 
                                    href={route('master.data.index')}

                                    className={`hidden xl:flex p-2 rounded-xl transition-all group ${
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

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden xl:block mx-1"></div>

                        <div className="relative hidden xl:block" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 group outline-none"
                            >
                                <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 group-hover:ring-2 ring-primary/20 transition-all">
                                    <img 
                                        alt="Profile" 
                                        src={user.profile_photo_url}
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
                                            src={user.profile_photo_url}
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

                {/* Mobile Menu Toggle (Legacy - kept for XL transition but hidden on mobile) */}
                <button 
                    onClick={() => setIsBottomSheetOpen(true)}
                    className="xl:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg absolute right-4 top-1/2 -translate-y-1/2 hidden"
                >
                    <span className="material-symbols-outlined">menu_open</span>
                </button>
            </div>
        </header>
            </div>

            {/* Mobile Navigation Dropdown (Legacy - Disabled in favor of BottomNav) */}
            {false && showingNavigationDropdown && (
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

            <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pt-0 xl:pt-0 pb-32 xl:pb-8">
                {/* Mobile Header Placeholder - To prevent content from being hidden under fixed topbar */}
                <div className="xl:hidden h-20 w-full shrink-0" />
                
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

            {/* Floating Action Button (FAB) - Mobile Only */}
            {hasPermission('view_projects') && !route().current('projects.create') && !route().current('projects.edit') && (
                <div className="xl:hidden fixed bottom-32 right-6 z-[60]">
                    <Link
                        href={route('projects.create')}
                        className="size-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.5)] active:scale-95 transition-all outline-none"
                    >
                        <span className="material-symbols-outlined text-[32px] font-black">add</span>
                    </Link>
                </div>
            )}

            {/* Bottom Navigation - Mobile Only (Overrideable via bottomStickySlot) */}
            {bottomStickySlot ? (
                <div className="xl:hidden fixed bottom-5 left-4 right-4 z-[70] animate-tab-content">
                    {bottomStickySlot}
                </div>
            ) : (
                <BottomNavigation 
                    displayItems={bottomNavDisplayItems}
                    showMenuButton={showMenuButton}
                    profileInMenu={profileInMenu}
                    isMoreActive={isMoreActive}
                    onMoreClick={() => setIsBottomSheetOpen(true)} 
                />
            )}

            {/* Bottom Sheet Menu - Mobile Only (Hidden if custom bottom navbar provided) */}
            {!bottomStickySlot && (
                <BottomSheet 
                    isOpen={isBottomSheetOpen} 
                    onClose={() => setIsBottomSheetOpen(false)} 
                    hiddenItems={bottomNavHiddenItems}
                    user={user}
                    canViewMasterData={canViewMasterData}
                    theme={theme}
                    setTheme={setTheme}
                />
            )}




            {/* Global Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15%]">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl px-4 animate-reveal">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                            {/* Search Input */}
                            <div className="p-5 flex items-center gap-4">
                                {isSearching ? (
                                    <span className="material-symbols-outlined text-primary text-2xl animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-slate-400 text-2xl">search</span>
                                )}
                                <input 
                                    ref={searchInputRef}
                                    autoFocus 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium p-0 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                                    placeholder="Cari proyek, kontrak, vendor, instansi..." 
                                    type="text"
                                />
                                <div className="flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                                        ESC
                                    </kbd>
                                    <button 
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" 
                                        onClick={() => setIsSearchOpen(false)}
                                    >
                                        <span className="material-symbols-outlined text-slate-400 text-xl">close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Results Area */}
                            <div ref={resultsContainerRef} className="border-t border-slate-100 dark:border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {searchQuery.length >= 2 ? (
                                    <>
                                        {isSearching ? (
                                            <div className="p-8 flex flex-col items-center justify-center">
                                                <span className="material-symbols-outlined text-3xl text-primary animate-spin mb-2">progress_activity</span>
                                                <p className="text-xs font-bold text-slate-400">Mencari...</p>
                                            </div>
                                        ) : flatResults.length > 0 ? (
                                            <div className="py-2">
                                                {(() => {
                                                    let currentCategory = '';
                                                    let globalIdx = -1;
                                                    return flatResults.map((item, i) => {
                                                        globalIdx++;
                                                        const showHeader = item.category !== currentCategory;
                                                        currentCategory = item.category;
                                                        const idx = globalIdx;
                                                        return (
                                                            <div key={i}>
                                                                {showHeader && (
                                                                    <div className="px-6 pt-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                                        {item.category}
                                                                    </div>
                                                                )}
                                                                <button
                                                                    data-index={idx}
                                                                    onClick={() => {
                                                                        addToHistory({ title: item.title, category: item.category, icon: item.icon, color: item.color, url: item.url });
                                                                        setIsSearchOpen(false);
                                                                        router.visit(item.url);
                                                                    }}
                                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                                    className={`w-full flex items-center gap-4 px-6 py-3 transition-all text-left group ${
                                                                        selectedIndex === idx 
                                                                            ? 'bg-primary/10 dark:bg-primary/15' 
                                                                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                                                    }`}
                                                                >
                                                                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getColorClasses(item.color)}`}>
                                                                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.title}</div>
                                                                        {item.subtitle && <div className="text-xs text-slate-400 truncate">{item.subtitle}</div>}
                                                                    </div>
                                                                    {selectedIndex === idx && (
                                                                        <span className="material-symbols-outlined text-primary text-lg shrink-0">arrow_forward</span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                                <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                    <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Tidak Ditemukan</h4>
                                                <p className="text-xs text-slate-400">Coba kata kunci lain untuk "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Search History */
                                    <div className="py-2">
                                        {searchHistory.length > 0 ? (
                                            <>
                                                <div className="px-6 pt-3 pb-1 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pencarian Terakhir</span>
                                                    <button onClick={clearHistory} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors">Hapus Semua</button>
                                                </div>
                                                {searchHistory.map((item, i) => (
                                                    <div
                                                        key={item.url + i}
                                                        data-index={i}
                                                        className={`flex items-center gap-4 px-6 py-3 transition-all group ${
                                                            selectedIndex === i 
                                                                ? 'bg-primary/10 dark:bg-primary/15' 
                                                                : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <button
                                                            className="flex-1 flex items-center gap-4 text-left min-w-0"
                                                            onClick={() => { setIsSearchOpen(false); router.visit(item.url); }}
                                                            onMouseEnter={() => setSelectedIndex(i)}
                                                        >
                                                            <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${getColorClasses(item.color || 'slate')}`}>
                                                                <span className="material-symbols-outlined text-base">{item.icon || 'history'}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.title}</div>
                                                                <div className="text-[10px] text-slate-400">{item.category}</div>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => removeFromHistory(item.url)}
                                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-sm text-slate-400">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="p-10 flex flex-col items-center justify-center text-center opacity-50">
                                                <span className="material-symbols-outlined text-3xl mb-2 text-slate-400">manage_search</span>
                                                <p className="text-xs font-bold text-slate-500">Ketik minimal 2 karakter untuk mulai mencari</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider px-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">ESC</kbd> TUTUP</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">↑↓</kbd> NAVIGASI</span>
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">ENTER</kbd> PILIH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}} />
        </div>
    );
}
