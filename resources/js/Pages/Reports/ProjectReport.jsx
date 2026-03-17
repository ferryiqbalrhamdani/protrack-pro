import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function ProjectReport({ projects = [], queryParams = {} }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProjects = useMemo(() => {
        let sortableItems = [...projects];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Special handling for percentage/numbers
                if (sortConfig.key === 'prog') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }

                // Special handling for dates (Tenggat Waktu format e.g., "15 Ags 2024")
                if (sortConfig.key === 'due' || sortConfig.key === 'date') {
                    // Simple string comparison might suffice for this mock format if they are consistent,
                    // but ideally, we parse them to actual Dates. For mock simplicity, we use the string.
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [projects, sortConfig]);

    const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
    const paginatedData = sortedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reuse SortIcon from other files
    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) {
            return <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600 transition-colors">unfold_more</span>;
        }
        return (
            <span className="material-symbols-outlined text-[14px] text-primary dark:text-blue-400">
                {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            stickySlot={
                <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link 
                                href={route('reports', queryParams)}
                                className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Laporan Detail Project</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    Monitoring & Analisis Progress Fisik
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search bar in sticky header */}
                            <div className="relative group min-w-[240px]">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors text-xl">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Cari project atau client..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-slate-600 dark:text-slate-200 placeholder:text-slate-400 uppercase tracking-[0.2em]"
                                />
                            </div>
                            <button className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                Filter
                            </button>
                            <button className="px-5 py-2.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 leading-none">
                                <span className="material-symbols-outlined text-lg leading-none">export_notes</span>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Detail Project" />

            <div className="relative">

                {/* Table Section */}
                <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th 
                                        onClick={() => handleSort('proj')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Project
                                            <SortIcon column="proj" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">No. Kontrak / UP</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">PIC</th>
                                    <th 
                                        onClick={() => handleSort('due')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Tenggat Waktu
                                            <SortIcon column="due" />
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('prog')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Progress
                                            <SortIcon column="prog" />
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center justify-end gap-2">
                                            Status
                                            <SortIcon column="status" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {paginatedData.map((row, i) => (
                                    <tr 
                                        key={i} 
                                        className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors animate-slide-up-fade"
                                        style={{ animationDelay: `${i * 50 + 100}ms` }}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 whitespace-nowrap shrink-0 font-bold text-xs group-hover:bg-primary group-hover:text-white transition-all">
                                                    {row.proj.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors">{row.proj}</p>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{row.client}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px] text-slate-400">description</span>
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{row.no}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.up}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="size-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-[10px] ring-2 ring-white dark:ring-slate-800">
                                                    {row.pic.charAt(0)}
                                                </div>
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">{row.pic}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.date}</span>
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 w-max px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                                                    <span className="material-symbols-outlined text-[16px] text-amber-500">event</span>
                                                    {row.due}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5 w-56">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                                                <span className={`text-xs font-black ${
                                                    row.c === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                                                    row.c === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                                                    row.c === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                                                    'text-blue-600 dark:text-blue-400'
                                                }`}>{row.prog}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full shadow-lg ${
                                                    row.c === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                                    row.c === 'amber' ? 'bg-amber-500 shadow-amber-500/20' :
                                                    row.c === 'rose' ? 'bg-rose-500 shadow-rose-500/20' :
                                                    'bg-blue-500 shadow-blue-500/20'
                                                }`} style={{ width: `${row.prog}%` }}></div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${
                                                row.c === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/5' :
                                                row.c === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 shadow-amber-500/5' :
                                                row.c === 'rose' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 shadow-rose-500/5' :
                                                'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 shadow-blue-500/5'
                                            }`}>
                                                <div className={`size-1.5 rounded-full animate-pulse ${
                                                    row.c === 'emerald' ? 'bg-emerald-500' :
                                                    row.c === 'amber' ? 'bg-amber-500' :
                                                    row.c === 'rose' ? 'bg-rose-500' :
                                                    'bg-blue-500'
                                                }`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    row.c === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                                                    row.c === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                                                    row.c === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                                                    'text-blue-600 dark:text-blue-400'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right w-32">
                                            <div className="flex items-center justify-end">
                                                <Link
                                                    href={route('reports.project.detail', { hashedId: row.hashed_id })}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary dark:text-blue-400 transition-all border border-primary/10 group/btn"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Detail</span>
                                                    <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-0.5 transition-transform">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col items-center md:items-start gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Overview</span>
                            <p className="text-xs font-bold text-slate-500">
                                Menampilkan <span className="text-slate-800 dark:text-slate-200 font-black">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedProjects.length)}</span> dari <span className="text-slate-800 dark:text-slate-200 font-black">{sortedProjects.length}</span> project terdaftar
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="size-9 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-xl">chevron_left</span>
                            </button>
                            
                            <div className="flex items-center gap-1 px-2">
                                {[...Array(totalPages)].map((_, i) => {
                                    // Show first, last, and current page with neighbors logic
                                    if (
                                        i === 0 || 
                                        i === totalPages - 1 || 
                                        (i >= currentPage - 2 && i <= currentPage)
                                    ) {
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`size-9 rounded-xl text-xs font-black transition-all ${
                                                    currentPage === i + 1
                                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    }
                                    if (i === 1 || i === totalPages - 2) {
                                        return <span key={i} className="px-1 text-slate-300 dark:text-slate-600 font-black">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="size-9 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-xl">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up-fade {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
