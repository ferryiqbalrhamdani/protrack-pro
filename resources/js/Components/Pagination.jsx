import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            {links.map((link, i) => {
                const label = String(link.label || '');
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

                const commonClasses = `
                    size-8 md:size-10 rounded-lg md:rounded-xl flex items-center justify-center 
                    text-[10px] md:text-xs font-black transition-all duration-300
                `;

                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className={`
                                ${commonClasses}
                                ${link.active 
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105 md:scale-110 z-10' 
                                    : 'bg-transparent text-slate-300 cursor-not-allowed opacity-50'}
                            `}
                        >
                            {isIcon ? (
                                <span className="material-symbols-outlined text-lg md:text-xl">{iconName}</span>
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
                            ${commonClasses}
                            ${link.active 
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105 md:scale-110 z-10' 
                                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'}
                        `}
                    >
                        {isIcon ? (
                            <span className="material-symbols-outlined text-lg md:text-xl">{iconName}</span>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: cleanLabel }} />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
