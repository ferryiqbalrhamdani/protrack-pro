import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
            {links.map((link, i) => {
                const label = String(link.label || '');
                let displayLabel = label;
                let isIcon = false;
                let iconName = '';

                // Strip entities for cleaner label check
                const cleanLabel = label
                    .replace(/&laquo;/g, '')
                    .replace(/&raquo;/g, '')
                    .trim();

                if (label.includes('Previous')) {
                    isIcon = true;
                    iconName = 'chevron_left';
                } else if (label.includes('Next')) {
                    isIcon = true;
                    iconName = 'chevron_right';
                }

                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className={`
                                ${isIcon ? 'p-1.5' : 'size-8'} 
                                rounded-xl flex items-center justify-center font-black text-[10px] transition-all
                                ${link.active 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110 z-10' 
                                    : 'text-slate-400 opacity-50'}
                            `}
                        >
                            {isIcon ? (
                                <span className="material-symbols-outlined text-[16px]">{iconName}</span>
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: cleanLabel }} />
                            )}
                        </span>
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={`
                            ${isIcon ? 'p-1.5' : 'size-8'} 
                            rounded-xl flex items-center justify-center font-black text-[10px] transition-all
                            ${link.active 
                                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110 z-10' 
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {isIcon ? (
                            <span className="material-symbols-outlined text-[16px]">{iconName}</span>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: cleanLabel }} />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
