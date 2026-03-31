import { Link } from '@inertiajs/react';

export default function BottomNavigation({ displayItems, showMenuButton, profileInMenu, isMoreActive, onMoreClick }) {

    const items = [...(displayItems || [])].filter(Boolean);
    const showMoreInFeed = showMenuButton && !profileInMenu;
    const showMoreAtEnd = showMenuButton && profileInMenu;

    return (
        <div className="xl:hidden fixed bottom-6 left-4 right-4 z-[70] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-2 sm:px-4 py-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/5">
            <div className="flex items-center w-full max-w-md mx-auto">
                {items.map((item, index) => {
                    const isLastItem = index === items.length - 1;
                    const injectMenuHere = showMoreInFeed && isLastItem;

                    return (
                        <div key={item.href || index} className="flex items-center justify-center flex-1 w-0 min-w-0">
                            {injectMenuHere ? (
                                <>
                                    <button
                                        onClick={onMoreClick}
                                        className={`flex flex-col items-center gap-1.5 px-2 py-1 group transition-all shrink-0 flex-1 ${
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
                                        <span className="text-[9px] font-black uppercase tracking-wider sm:tracking-widest leading-none">Menu</span>
                                    </button>
                                    <Link
                                        href={item.href || '#'}
                                        className={`flex flex-col items-center gap-1.5 px-2 py-1 group transition-all shrink-0 flex-1 ${
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
                                        <span className="text-[9px] font-black uppercase tracking-wider sm:tracking-widest leading-none truncate w-full text-center">{item.name}</span>
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={item.href || '#'}
                                    className={`flex flex-col items-center gap-1.5 px-2 py-1 group transition-all shrink-0 flex-1 w-full ${
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
                                    <span className="text-[9px] font-black uppercase tracking-wider sm:tracking-widest leading-none truncate w-full text-center">{item.name}</span>
                                </Link>
                            )}
                        </div>
                    );
                })}

                {showMoreAtEnd && (
                    <div className="flex items-center justify-center flex-1 w-0 min-w-0">
                        <button
                            onClick={onMoreClick}
                            className={`flex flex-col items-center gap-1.5 px-2 py-1 group transition-all shrink-0 flex-1 w-full ${
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
                            <span className="text-[9px] font-black uppercase tracking-wider sm:tracking-widest leading-none">Menu</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

}
