import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';
import useMediaQuery from '@/Hooks/useMediaQuery';
import useSessionFilter from '@/Hooks/useSessionFilter';

export default function ProjectReport({ projects, companies = [], queryParams = null }) {
    const { auth } = usePage().props;
    const isMobile = useMediaQuery('(max-width: 767px)');
    const auth_user = auth?.user;

    queryParams = queryParams || {};
    const data = projects.data || [];
    const pagination = projects;

    const [search, setSearch] = useSessionFilter('ProjectReport_search', queryParams.search || '');
    const [statusFilter, setStatusFilter] = useSessionFilter('ProjectReport_status', queryParams.status || 'All');
    const [companyFilter, setCompanyFilter] = useSessionFilter('ProjectReport_company', queryParams.company || 'All');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [dateRange, setDateRange] = useSessionFilter('ProjectReport_dateRange', { 
        start: queryParams.start_date || '', 
        end: queryParams.end_date || '' 
    });
    const [viewMode, setViewMode] = useSessionFilter('ProjectReport_viewMode', 'table');

    // On mobile, always show card view
    const effectiveViewMode = isMobile ? 'grid' : viewMode;
    
    const [sortBy, setSortBy] = useState(queryParams.tableSortColumn || 'created_at');
    const [sortDir, setSortDir] = useState(queryParams.tableSortDirection || 'desc');
    const [isTableLoading, setIsTableLoading] = useState(false);
    const isInitialMount = useRef(true);


    // Filter Logic (Server-side)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'All') params.status = statusFilter;
            if (companyFilter !== 'All') params.company = companyFilter;
            if (dateRange.start) params.start_date = dateRange.start;
            if (dateRange.end) params.end_date = dateRange.end;
            if (sortBy) params.sort_by = sortBy;
            if (sortDir) params.sort_dir = sortDir;

            const hasChanged = 
                search !== (queryParams.search || '') ||
                statusFilter !== (queryParams.status || 'All') ||
                companyFilter !== (queryParams.company || 'All') ||
                dateRange.start !== (queryParams.start_date || '') ||
                dateRange.end !== (queryParams.end_date || '') ||
                sortBy !== (queryParams.sort_by || 'created_at') ||
                sortDir !== (queryParams.sort_dir || 'desc');

            if (hasChanged) {
                router.get(route('reports.project'), params, {
                    preserveState: true,
                    replace: true,
                    onBefore: () => setIsTableLoading(true),
                    onFinish: () => setIsTableLoading(false),
                });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, companyFilter, dateRange, sortBy, sortDir]);

    const companyOptions = [
        { label: 'Semua Perusahaan', value: 'All' },
        ...companies
    ];

    return (
        <AuthenticatedLayout
            stickySlot={
                <div className="sticky top-0 z-40 hidden xl:block w-full backdrop-blur-md bg-white/90 dark:bg-[#0b1120]/90 border-b border-slate-200 dark:border-white/5 transition-all transition-all duration-300">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href={route('reports')}
                                        className="size-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-white/5"
                                    >
                                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                                    </Link>
                                    <div>
                                        <h1 className="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase italic tracking-tight">Project Report</h1>
                                        <p className="hidden md:block text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                            Monitoring & Analisis Progress Fisik
                                        </p>
                                    </div>
                                </div>

                                {/* Export Button - Mobile Only (Right) */}
                                <button className="md:hidden size-9 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center active:scale-90 transition-all">
                                    <span className="material-symbols-outlined text-xl">export_notes</span>
                                </button>
                            </div>

                            <div className="flex items-center w-full lg:w-auto gap-2 lg:gap-3">
                                <div className="relative group flex-grow lg:w-80">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors text-lg">search</span>
                                    <input 
                                        type="text" 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari project atau client..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-slate-600 dark:text-slate-200 placeholder:text-slate-400 uppercase tracking-widest"
                                    />
                                </div>

                                <div className="relative">
                                    <button 
                                        onClick={() => setShowMoreFilters(!showMoreFilters)}
                                        className={`size-10 lg:w-auto lg:px-4 lg:py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all border ${
                                            showMoreFilters 
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                            : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg leading-none">filter_alt</span>
                                        <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest leading-none">Filter</span>
                                    </button>

                                    {/* Filter Popover (Desktop) */}
                                    {showMoreFilters && !isMobile && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#141720] border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 animate-reveal">
                                            <div className="fixed inset-0 z-40" onClick={() => setShowMoreFilters(false)} />
                                            <div className="relative z-50">
                                                {/* Header */}
                                                <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/5 rounded-t-[2rem]">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                <span className="material-symbols-outlined text-lg">tune</span>
                                                            </div>
                                                            <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Filter Lanjutan</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowMoreFilters(false)}
                                                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">close</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Filters Content */}
                                                <div className="px-6 py-5 space-y-6">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perusahaan</label>
                                                            <SearchableSelect
                                                                options={companyOptions}
                                                                value={companyFilter}
                                                                onChange={(val) => setCompanyFilter(val)}
                                                                className="rounded-xl border-slate-100 dark:border-white/10 text-[10px] font-bold"
                                                            />
                                                        </div>
                                                    </div>

                                                {/* Footer */}
                                                <div className="px-6 pb-6 mt-2">
                                                    <button 
                                                        onClick={() => {
                                                            setSearch('');
                                                            setStatusFilter('All');
                                                            setCompanyFilter('All');
                                                            setDateRange({ start: '', end: '' });
                                                            setShowMoreFilters(false);
                                                        }}
                                                        className="w-full py-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                                                    >
                                                        Reset Filter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button className="hidden lg:flex px-5 py-2.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all items-center gap-2 leading-none">
                                    <span className="material-symbols-outlined text-lg leading-none">export_notes</span>
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Project Report" />

            {/* Mobile Filter Modal */}
            {isMobile && (
                <Modal show={showMoreFilters} onClose={() => setShowMoreFilters(false)} maxWidth="md" premium={true}>
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">tune</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">Filter Report</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Sesuaikan tampilan data laporan</p>
                            </div>
                        </div>

                        <div className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Perusahaan</label>
                                <SearchableSelect
                                    options={companyOptions}
                                    value={companyFilter}
                                    onChange={(val) => setCompanyFilter(val)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 mt-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 rounded-b-[2.5rem] flex flex-col gap-3">
                        <button 
                            onClick={() => setShowMoreFilters(false)}
                            className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Terapkan Filter
                        </button>
                        <button 
                            onClick={() => {
                                setStatusFilter('All');
                                setCompanyFilter('All');
                                setDateRange({ start: '', end: '' });
                                setShowMoreFilters(false);
                            }}
                            className="w-full py-4 bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 active:scale-95 transition-all"
                        >
                            Reset Semua
                        </button>
                    </div>
                </Modal>
            )}

            <div className="relative px-4 sm:px-6 lg:px-8 py-6">
                {/* Mobile Header Only */}
                <div className="xl:hidden flex flex-col gap-6 mb-8 animate-reveal">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link 
                                href={route('reports')}
                                className="size-10 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/10 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-xl">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-tight">Project Report</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Monitoring Progress Fisik</p>
                            </div>
                        </div>
                        <button className="size-10 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-xl">export_notes</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input 
                                type="text" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari project..."
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-slate-600 dark:text-slate-200 placeholder:text-slate-400 uppercase tracking-widest"
                            />
                        </div>
                        <button 
                            onClick={() => setShowMoreFilters(true)}
                            className="size-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">filter_alt</span>
                        </button>
                    </div>
                </div>

                {/* Data View Controls */}
                <div className="flex justify-between items-center mb-6 px-1 lg:px-2">
                    <p className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
                        Menampilkan <span className="text-slate-800 dark:text-white font-black mx-1">{data?.length || 0}</span> dari <span className="text-slate-800 dark:text-white font-black mx-1">{pagination.total || 0}</span> Report
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest sm:hidden">
                        <span className="text-slate-800 dark:text-white font-black mr-1">{pagination.total || 0}</span> Report
                    </p>
                    
                    {/* View Mode Toggle — Desktop only */}
                    <div className="hidden md:flex flex-shrink-0 items-center gap-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-1 rounded-2xl h-[48px] shadow-sm">
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`w-12 h-full rounded-xl flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 shadow-sm ring-1 ring-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            title="Tampilan Tabel"
                        >
                            <span className={`material-symbols-outlined text-[22px] ${viewMode === 'table' ? 'font-fill' : ''}`}>table_rows</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`w-12 h-full rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 shadow-sm ring-1 ring-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            title="Tampilan Kartu"
                        >
                            <span className={`material-symbols-outlined text-[22px] ${viewMode === 'grid' ? 'font-fill' : ''}`}>grid_view</span>
                        </button>
                    </div>
                </div>

                {/* ─── TABLE VIEW (desktop only) ─── */}
                {effectiveViewMode === 'table' && (
                    <div className="bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden ring-1 ring-slate-100/50 dark:ring-white/5 whitespace-nowrap">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                            Project &amp; Client
                                        </th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                            No. Kontrak &amp; UP
                                        </th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">
                                            PIC
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
                                    {data.length > 0 ? (
                                        data.map((row, i) => (
                                            <tr 
                                                key={i} 
                                                className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors animate-slide-up-fade"
                                                style={{ animationDelay: `${i * 30}ms` }}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm flex-shrink-0">
                                                            {row.proj.substring(0,2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="relative group/name">
                                                                <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors uppercase italic tracking-tight max-w-[220px] truncate">{row.proj}</p>
                                                                {/* Tooltip for long names */}
                                                                <div className="absolute left-0 bottom-full mb-2 z-[200] hidden group-hover/name:block pointer-events-none">
                                                                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-2 rounded-xl shadow-xl max-w-[320px] whitespace-normal leading-relaxed">
                                                                        {row.proj}
                                                                        <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[180px]">{row.client}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="size-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                            <span className="material-symbols-outlined text-lg">description</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">{row.no}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">{row.up || '-'}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* PIC */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="size-8 rounded-full bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400 font-bold text-[10px] shadow-sm">
                                                            {row.pic?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{row.pic}</span>
                                                    </div>
                                                </td>


                                                
                                                <td className="px-6 py-5 w-48">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
                                                        <span className={`text-[10px] font-black ${
                                                            row.c === 'emerald' ? 'text-emerald-500' :
                                                            row.c === 'amber' ? 'text-amber-500' :
                                                            row.c === 'rose' ? 'text-rose-500' :
                                                            'text-blue-500'
                                                        }`}>{row.prog}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${
                                                            row.c === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/20' :
                                                            row.c === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-500/20' :
                                                            row.c === 'rose' ? 'bg-gradient-to-r from-rose-400 to-rose-600 shadow-rose-500/20' :
                                                            'bg-gradient-to-r from-blue-400 to-blue-600 shadow-blue-500/20'
                                                        } shadow-lg`} style={{ width: `${row.prog}%` }}></div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${
                                                        row.c === 'emerald' ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100/50 dark:border-emerald-500/20' :
                                                        row.c === 'amber' ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-100/50 dark:border-amber-500/20' :
                                                        row.c === 'rose' ? 'bg-rose-50/50 dark:bg-rose-500/10 border-rose-100/50 dark:border-rose-500/20' :
                                                        'bg-blue-50/50 dark:bg-blue-500/10 border-blue-100/50 dark:border-blue-500/20'
                                                    }`}>
                                                        <div className={`size-1.5 rounded-full animate-pulse ${
                                                            row.c === 'emerald' ? 'bg-emerald-500' :
                                                            row.c === 'amber' ? 'bg-amber-500' :
                                                            row.c === 'rose' ? 'bg-rose-500' :
                                                            'bg-blue-500'
                                                        }`}></div>
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${
                                                            row.c === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                                                            row.c === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                                                            row.c === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                                                            'text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                            {row.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Link
                                                        href={route('reports.project.detail', { hashedId: row.hashed_id })}
                                                        className="size-9 inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-xl italic font-bold">arrow_forward</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="size-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tidak Ada Data Laporan</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer — Table */}
                        <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-white/[0.01] rounded-b-[3rem]">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">
                                Showing <span className="font-black text-slate-900 dark:text-white">{pagination.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{pagination.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total || 0}</span> results
                            </p>
                            <Pagination links={pagination.links} />
                        </div>
                    </div>
                )}

                {/* ─── CARD / GRID VIEW ─── */}
                {effectiveViewMode === 'grid' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <div 
                                        key={index}
                                        className="bg-white dark:bg-[#141720] rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-slide-up-fade flex flex-col gap-5"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Header: Project name, client, status */}
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-12 flex-shrink-0 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 font-black text-sm uppercase italic tracking-tighter shadow-inner ring-1 ring-slate-100 dark:ring-white/5">
                                                    {row.proj.substring(0,2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight uppercase italic tracking-tighter line-clamp-2">{row.proj}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{row.client}</p>
                                                </div>
                                            </div>
                                            <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-inset shadow-sm ${
                                                row.c === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                row.c === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                row.c === 'rose' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20' :
                                                'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20'
                                            }`}>
                                                {row.status}
                                            </div>
                                        </div>

                                        {/* Details: No. Kontrak & PIC */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                            {/* No. Kontrak */}
                                            <div className="space-y-1 overflow-hidden">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">No. Kontrak</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight truncate">{row.no}</p>
                                            </div>
                                            {/* PIC */}
                                            <div className="space-y-1 border-l border-slate-50 dark:border-white/5 pl-4 overflow-hidden">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PIC</p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="size-5 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary text-[8px] font-black">
                                                        {row.pic?.charAt(0) || '?'}
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{row.pic}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tanggal Kontrak & Due Date */}
                                        <div className="flex justify-between items-center bg-slate-50/80 dark:bg-white/[0.02] px-4 py-3 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Tgl Kontrak</span>
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    {row.contractDate ? new Date(row.contractDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                            <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                                            <div className="flex flex-col gap-0.5 text-right">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</span>
                                                <p className="text-[11px] font-black text-amber-500">
                                                    {row.dueDate ? new Date(row.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-2 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress Fisik</span>
                                                <span className={`text-xs font-black ${
                                                    row.c === 'emerald' ? 'text-emerald-500' :
                                                    row.c === 'amber' ? 'text-amber-500' :
                                                    row.c === 'rose' ? 'text-rose-500' :
                                                    'text-blue-500'
                                                }`}>{row.prog}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                <div className={`h-full rounded-full ${
                                                    row.c === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                                    row.c === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                                    row.c === 'rose' ? 'bg-gradient-to-r from-rose-400 to-rose-600' :
                                                    'bg-gradient-to-r from-blue-400 to-blue-600'
                                                } shadow-sm transition-all duration-700`} style={{ width: `${row.prog}%` }} />
                                            </div>
                                        </div>

                                        {/* Tombol Lihat Detail */}
                                        <Link
                                            href={route('reports.project.detail', { hashedId: row.hashed_id })}
                                            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400 hover:bg-primary hover:text-white dark:hover:bg-blue-500 dark:hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 group/btn active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[16px] group-hover/btn:rotate-12 transition-transform">open_in_new</span>
                                            Lihat Detail
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center gap-4 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                                    <div className="size-20 rounded-[2rem] bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-200 dark:text-white/10">
                                        <span className="material-symbols-outlined text-5xl italic font-black">inventory_2</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Report Trace</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer — Card */}
                        <div className="mt-10 px-6 py-6 md:px-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-white/[0.01] rounded-[2.5rem] md:rounded-[3rem]">
                            <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">
                                Showing <span className="font-black text-slate-900 dark:text-white">{pagination.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{pagination.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total || 0}</span> results
                            </p>
                            <div className="scale-90 md:scale-100">
                                <Pagination links={pagination.links} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes reveal {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-reveal { animation: reveal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes slide-up-fade {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up-fade { animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
            `}} />
        </AuthenticatedLayout>
    );
}
