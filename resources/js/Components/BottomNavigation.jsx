import { Link } from '@inertiajs/react';

export default function BottomNavigation({ displayItems, showMenuButton, profileInMenu, isMoreActive, onMoreClick }) {

    return (
        <div className="xl:hidden fixed bottom-6 left-4 right-4 z-[70] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/5">
            <div className="flex items-center justify-between gap-2 w-full max-w-md mx-auto">
                {displayItems?.filter(Boolean).map((item, index) => {
                    const isLastItem = index === (displayItems?.length || 0) - 1;
                    const showMenuBeforeProfile = showMenuButton && !profileInMenu && isLastItem;

                    if (!item) return null;

                    return (
                        <div key={item.name || index} className="flex items-center flex-1 justify-around">
                            {showMenuBeforeProfile && (
                                <button
                                    onClick={onMoreClick}
                                    className={`flex flex-col items-center gap-1.5 px-3 py-1 group transition-all shrink-0 ${
                                        isMoreActive 
                                        ? 'text-primary dark:text-blue-400' 
                                        : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                                    }`}
                                >
                                    <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${
                                        isMoreActive 
                                        ? 'bg-primary/10 scale-110 shadow-sm' 
                                        : 'group-hover:bg-slate-50 dark:group-hover:bg-white/5'
                                    }`}>
                                        <span className={`material-symbols-outlined text-[24px] ${isMoreActive ? 'font-fill' : ''}`}>menu_open</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
                                </button>
                            )}
                            <Link
                                href={item.href || '#'}
                                className={`flex flex-col items-center gap-1.5 px-3 py-1 group transition-all shrink-0 ${
                                    item.active 
                                    ? 'text-primary dark:text-blue-400' 
                                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                                }`}
                            >
                                <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${
                                    item.active 
                                    ? 'bg-primary/10 scale-110 shadow-sm' 
                                    : 'group-hover:bg-slate-50 dark:group-hover:bg-white/5'
                                }`}>
                                    <span className={`material-symbols-outlined text-[24px] ${item.active ? 'font-fill' : ''}`}>
                                        {item.icon}
                                    </span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                            </Link>
                        </div>
                    );
                })}

                {/* More Button - if no space was found for it in the loop (e.g. profile is in menu) */}
                {showMenuButton && profileInMenu && (
                    <button
                        onClick={onMoreClick}
                        className={`flex flex-col items-center gap-1.5 px-3 py-1 group transition-all shrink-0 flex-1 ${
                            isMoreActive 
                            ? 'text-primary dark:text-blue-400' 
                            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                        }`}
                    >
                        <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${
                            isMoreActive 
                            ? 'bg-primary/10 scale-110 shadow-sm' 
                            : 'group-hover:bg-slate-50 dark:group-hover:bg-white/5'
                        }`}>
                            <span className={`material-symbols-outlined text-[24px] ${isMoreActive ? 'font-fill' : ''}`}>menu_open</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
                    </button>
                )}
            </div>
        </div>
    );

}
