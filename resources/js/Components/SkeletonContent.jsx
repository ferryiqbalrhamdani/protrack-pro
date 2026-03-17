import React from 'react';

const SkeletonContent = () => {
    return (
        <div className="space-y-8 animate-pulse-slow pb-10">
            {/* Summary Widgets Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm h-32">
                        <div className="h-2 w-16 bg-slate-200 dark:bg-white/10 rounded-full mb-4 shimmer"></div>
                        <div className="h-8 w-24 bg-slate-100 dark:bg-white/5 rounded-xl shimmer"></div>
                    </div>
                ))}
            </div>

            {/* Filter Bar Skeleton */}
            <div className="bg-white dark:bg-white/5 p-4 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm h-20 flex items-center px-8 gap-4">
                <div className="flex-1 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl shimmer"></div>
                <div className="w-48 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl hidden md:block shimmer"></div>
                <div className="w-48 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl hidden md:block shimmer"></div>
                <div className="size-10 bg-slate-100 dark:bg-white/5 rounded-xl shimmer"></div>
            </div>

            {/* Table/Content Skeleton */}
            <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden p-8 space-y-6">
                <div className="flex justify-between pb-6 border-b border-slate-50 dark:border-white/5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-2 w-20 bg-slate-200 dark:bg-white/10 rounded-full shimmer"></div>
                    ))}
                </div>
                {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-white/5 last:border-none">
                        <div className="flex items-center gap-4">
                            <div className="size-10 bg-slate-100 dark:bg-white/5 rounded-xl shimmer"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-32 bg-slate-100 dark:bg-white/5 rounded-full shimmer"></div>
                                <div className="h-2 w-20 bg-slate-50 dark:bg-white/[0.02] rounded-full shimmer"></div>
                            </div>
                        </div>
                        <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded-full shimmer"></div>
                        <div className="h-2 w-32 bg-slate-100 dark:bg-white/5 rounded-full hidden lg:block shimmer"></div>
                        <div className="flex gap-2">
                            <div className="h-8 w-16 bg-slate-100 dark:bg-white/5 rounded-lg shimmer"></div>
                            <div className="h-8 w-16 bg-slate-100 dark:bg-white/5 rounded-lg shimmer"></div>
                        </div>
                    </div>
                ))}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .shimmer {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.05) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                .dark .shimmer {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.03) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    background-size: 200% 100%;
                }
                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
                .animate-pulse-slow {
                    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .85; }
                }
            `}} />
        </div>
    );
};

export default SkeletonContent;
