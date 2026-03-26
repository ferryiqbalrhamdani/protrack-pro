import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ notifications, activeFilter }) {
    const [activeTab, setActiveTab] = useState(activeFilter || 'all');

    const notificationList = notifications.data || [];

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get(route('notifications.index'), { filter: tab }, { preserveState: true, preserveScroll: true });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.markAllRead'), {}, { preserveScroll: true });
    };

    const markAsRead = (id) => {
        router.post(route('notifications.markAsRead', id), {}, { preserveScroll: true });
    };

    const deleteNotification = (id) => {
        router.delete(route('notifications.destroy', id), { preserveScroll: true });
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'project': return { bg: 'bg-blue-500/10 text-blue-500', icon: 'business_center' };
            case 'billing': return { bg: 'bg-rose-500/10 text-rose-500', icon: 'payments' };
            case 'contract': return { bg: 'bg-amber-500/10 text-amber-500', icon: 'description' };
            case 'merchandiser': return { bg: 'bg-purple-500/10 text-purple-500', icon: 'storefront' };
            case 'shipping': return { bg: 'bg-emerald-500/10 text-emerald-500', icon: 'local_shipping' };
            default: return { bg: 'bg-slate-500/10 text-slate-500', icon: 'notifications' };
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Semua Notifikasi</h2>}
        >
            <Head title="Semua Notifikasi" />

            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 py-8 space-y-6 animate-reveal">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Pusat Notifikasi</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pemberitahuan penting terkait proyek dan aktivitas Anda.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/80">
                        <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => handleTabChange('all')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'all' 
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => handleTabChange('unread')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                    activeTab === 'unread' 
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                Belum Dibaca
                            </button>
                        </div>

                        <button 
                            onClick={markAllAsRead}
                            disabled={notificationList.filter(n => n.unread).length === 0}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">done_all</span>
                            Tandai Semua Dibaca
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50 min-h-[400px]">
                        {notificationList.length > 0 ? (
                            notificationList.map((notification) => {
                                const style = getTypeStyle(notification.type);
                                return (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 sm:p-6 transition-colors flex gap-4 group/item relative
                                            ${notification.unread ? 'bg-primary/5 dark:bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                                        `}
                                    >
                                        <div className={`mt-1 size-10 sm:size-12 rounded-2xl flex items-center justify-center shrink-0 ${style.bg}`}>
                                            <span className="material-symbols-outlined text-xl sm:text-2xl">{style.icon}</span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pr-16 sm:pr-24">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`text-sm sm:text-base ${notification.unread ? 'font-black text-slate-800 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-200'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    {notification.unread && (
                                                        <div className="size-2 rounded-full bg-primary shrink-0"></div>
                                                    )}
                                                </div>
                                                <p className={`text-xs sm:text-sm mb-2 ${notification.unread ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    <span>{notification.time}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons: Permanently Visible */}
                                            <div className="absolute right-4 sm:right-6 top-4 sm:top-6 flex items-center gap-2">
                                                {notification.unread && (
                                                    <div className="relative group/tip">
                                                        <button 
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors flex items-center justify-center"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">mark_email_read</span>
                                                        </button>
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Tandai Dibaca
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="relative group/tip">
                                                    <button 
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-colors flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                        Hapus
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-16 flex flex-col items-center justify-center text-center h-full">
                                <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">notifications_off</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tidak Ada Notifikasi</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                    {activeTab === 'unread' 
                                        ? "Hebat! Anda sudah membaca semua notifikasi yang ada." 
                                        : "Saat ini belum ada notifikasi yang masuk untuk Anda."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
