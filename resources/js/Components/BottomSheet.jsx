import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ isOpen, onClose, hiddenItems, user, canViewMasterData, theme, setTheme }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[90] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-t-[2.5rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t border-white/20 dark:border-white/10 max-h-[80vh] overflow-y-auto custom-scrollbar"
                    >
                        {/* Pull Handle */}
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8" />

                        <div className="space-y-8">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-[1.25rem] overflow-hidden border-2 border-slate-100 dark:border-white/10">
                                    <img src={user.profile_photo_url} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{user.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.username}</p>
                                </div>
                            </div>

                            {/* Theme Selector Grid */}
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl">
                                {[
                                    { id: 'light', icon: 'light_mode', label: 'Terang' },
                                    { id: 'dark', icon: 'dark_mode', label: 'Gelap' },
                                    { id: 'system', icon: 'settings_brightness', label: 'Sistem' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-[1.25rem] transition-all ${
                                            theme === t.id 
                                                ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10' 
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-xl ${theme === t.id ? 'font-fill' : ''}`}>{t.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {hiddenItems?.filter(Boolean).map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href || '#'}
                                    onClick={onClose}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${
                                        item.active 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[24px] ${item?.active ? 'font-fill' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center">{item.name}</span>
                                </Link>
                            ))}
                        </div>


                            {/* Additional Actions */}
                            <div className="pt-4 space-y-3">
                                {canViewMasterData && (
                                    <Link
                                        href={route('master.data.index')}
                                        onClick={onClose}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                                            route().current('master.data.index')
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined ${route().current('master.data.index') ? 'font-fill' : ''}`}>settings</span>
                                        <span className="text-xs font-black uppercase tracking-widest">Pengaturan Sistem</span>
                                    </Link>
                                )}
                                <Link
                                    href={route('profile.edit')}
                                    onClick={onClose}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                                        route().current('profile.edit')
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined ${route().current('profile.edit') ? 'font-fill' : ''}`}>account_circle</span>
                                    <span className="text-xs font-black uppercase tracking-widest">Pengaturan Profil</span>
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-rose-500 transition-colors text-left"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    <span className="text-xs font-black uppercase tracking-widest">Keluar Sesi</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
