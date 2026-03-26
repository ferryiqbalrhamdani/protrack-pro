import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Pagination from '@/Components/Pagination';

export default function ProjectReport({ projects, queryParams = null }) {
    queryParams = queryParams || {};
    const data = projects.data || [];
    const pagination = projects;
    const [isTableLoading, setIsTableLoading] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: queryParams.tableSortColumn || null, direction: queryParams.tableSortDirection || 'asc' });

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
                <div className="bg-transparent md:bg-white dark:md:bg-white/5 md:rounded-[3rem] md:border border-slate-100 dark:border-white/5 md:shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="hidden md:table w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                        Project & Client
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                        No. Kontrak & UP
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                        PIC
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                        Tanggal & Tempo
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                        Progress
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap text-right">
                                        Status
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {data.map((row, i) => (
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
                                                    <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{row.proj}</p>
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

                        {/* Mobile Card Grid View */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {isTableLoading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-white/5 rounded-[2rem] p-4 border border-slate-100 dark:border-white/5 animate-pulse">
                                        <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-lg w-3/4 mb-3"></div>
                                        <div className="h-3 bg-slate-50 dark:bg-white/5 rounded-lg w-1/2 mb-4"></div>
                                        <div className="space-y-2 pt-2">
                                            <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full w-full"></div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full w-2/3"></div>
                                        </div>
                                    </div>
                                ))
                            ) : data.length > 0 ? (
                                data.map((row, index) => (
                                    <div 
                                        key={row.id} 
                                        className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group animate-slide-up-fade"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                row.c === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                row.c === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                row.c === 'rose' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20' :
                                                'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20'
                                            }`}>
                                                {row.status}
                                            </div>
                                            <Link href={route('reports.project.detail', { hashedId: row.hashed_id })} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                            </Link>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <h4 className="text-[11px] font-black text-slate-800 dark:text-white line-clamp-2 leading-tight uppercase italic tracking-tight">{row.proj}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter line-clamp-1">{row.client}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Progres</span>
                                                <span className={`font-black ${row.c === 'emerald' ? 'text-emerald-500' : row.c === 'amber' ? 'text-amber-500' : row.c === 'rose' ? 'text-rose-500' : 'text-blue-500'}`}>{row.prog || 0}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-700 ${row.c === 'emerald' ? 'bg-emerald-500' : row.c === 'amber' ? 'bg-amber-500' : row.c === 'rose' ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${row.prog || 0}%` }} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-50 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">description</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{row.no}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">person</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{row.pic}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Tidak ada data laporan ditemukan</div>
                            )}
                        </div>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-0 md:px-8 py-8 md:py-6 border-t-0 md:border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-transparent md:bg-slate-50/50 dark:md:bg-white/[0.02] md:rounded-b-[3rem]">
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">
                            Showing <span className="font-black text-slate-900 dark:text-white">{pagination.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{pagination.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total || 0}</span> items
                        </p>
                        
                        <Pagination links={pagination.links} />
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
