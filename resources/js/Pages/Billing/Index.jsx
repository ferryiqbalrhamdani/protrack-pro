import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import useSessionFilter from '@/Hooks/useSessionFilter';
import useMediaQuery from '@/Hooks/useMediaQuery';
import SearchableSelect from '@/Components/SearchableSelect';
import ExportButton from '@/Components/ExportButton';
import TableSkeleton from '@/Components/TableSkeleton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';



import { motion } from 'framer-motion';

const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }).format(value);
};

export default function Index({ projects, queryParams = null }) {
    const { auth } = usePage().props;
    const isMobile = useMediaQuery('(max-width: 767px)');
    const auth_user = auth?.user;
    queryParams = queryParams || {};
    
    // Using real data from backend
    const data = projects.data;
    const pagination = projects;
    const [search, setSearch] = useSessionFilter('Billing_search', queryParams.search || '');
    const [statusFilter, setStatusFilter] = useSessionFilter('Billing_status', queryParams.status || 'Semua Status');
    const [companyFilter, setCompanyFilter] = useSessionFilter('Billing_company', queryParams.company || 'Semua Perusahaan');
    
    // Normalize legacy 'All' values from session filter or query params
    useEffect(() => {
        if (statusFilter === 'All') setStatusFilter('Semua Status');
        if (companyFilter === 'All' || companyFilter === 'Pilih Perusahaan') setCompanyFilter('Semua Perusahaan');
    }, [statusFilter, companyFilter]);

    const [myDataFilter, setMyDataFilter] = useSessionFilter('Billing_myData', queryParams.my_data === 'true');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [viewMode, setViewMode] = useSessionFilter('BillingIndex_viewMode', 'table');
    const [dateRange, setDateRange] = useSessionFilter('Billing_dateRange', { 
        start: queryParams.start_date || '', 
        end: queryParams.end_date || '' 
    });
    const [sortConfig, setSortConfig] = useSessionFilter('Billing_sort', { 
        key: queryParams.tableSortColumn || null, 
        direction: queryParams.tableSortDirection || 'asc' 
    });
    const [currentPage, setCurrentPage] = useState(projects.current_page);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const isInitialMount = useRef(true);

    const handleMyDataToggle = () => {
        setMyDataFilter(!myDataFilter);
        setCurrentPage(1);
    };

    // Reset to page 1 when filters change (BUT NOT when sorting, and NOT on first mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setIsTableLoading(true);
        const timer = setTimeout(() => setIsTableLoading(false), 500); // Shorter local loading for better feel
        setCurrentPage(1);
        return () => clearTimeout(timer);
    }, [search, statusFilter, companyFilter, dateRange, sortConfig]);

    // URL Persistence Implementation
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = {};
            if (search) params.search = search;
            if (statusFilter && statusFilter !== 'Semua Status' && statusFilter !== 'All') params.status = statusFilter;
            if (companyFilter && companyFilter !== 'Semua Perusahaan' && companyFilter !== 'All' && companyFilter !== 'Pilih Perusahaan') params.company = companyFilter;
            if (myDataFilter) params.my_data = 'true';
            if (dateRange.start) params.start_date = dateRange.start;
            if (dateRange.end) params.end_date = dateRange.end;
            if (sortConfig.key) {
                params.tableSortColumn = sortConfig.key;
                params.tableSortDirection = sortConfig.direction;
            }
            if (currentPage > 1) params.page = currentPage;

            // Normalize URL: remove parameters that match defaults
            const url = new URL(window.location.href);
            const currentParams = Object.fromEntries(url.searchParams.entries());
            
            // Only compare relevant keys that we manage
            const relevantKeys = ['search', 'status', 'company', 'my_data', 'start_date', 'end_date', 'tableSortColumn', 'tableSortDirection', 'page'];
            const cleanedCurrentParams = {};
            relevantKeys.forEach(key => {
                if (currentParams[key]) cleanedCurrentParams[key] = currentParams[key];
            });

            const paramsChanged = JSON.stringify(params) !== JSON.stringify(cleanedCurrentParams);
            
            if (paramsChanged) {
                setIsTableLoading(true);
                router.get(route('billing'), params, {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsTableLoading(false)
                });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, companyFilter, myDataFilter, dateRange, sortConfig, currentPage]);

    const handleSort = (key) => {
        let direction = 'asc';
        let newKey = key;

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                newKey = null; // Click 3: Reset
            }
        }
        setSortConfig({ key: newKey, direction });
    };

    const SortIcon = ({ column }) => {
        const isActive = sortConfig.key === column;
        return (
            <span className={`material-symbols-outlined text-[16px] transition-all duration-300 ${
                isActive 
                ? 'text-primary dark:text-blue-400 opacity-100 scale-110' 
                : 'text-slate-400 dark:text-slate-600 opacity-30 group-hover/th:opacity-60'
            } ${isActive && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}>
                {isActive ? 'keyboard_arrow_up' : 'unfold_more'}
            </span>
        );
    };

    const companies = [
        'Semua Perusahaan',
        // Example mock array since backend doesn't aggregate companies currently
    ];
    const statuses = [
        'Semua Status', 'Ongoing', 'Completed', 'Pending'
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Penagihan" />

            <div className="">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-3">Manajemen Penagihan</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                            Monitoring Invoice & Pembayaran
                        </p>
                    </div>

                    {/* Summary Pills - Moved to Header and Right Aligned */}
                    <div className="flex flex-wrap items-center justify-end gap-4 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                        <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow whitespace-nowrap min-w-[200px]">
                            <div className="flex items-center justify-center size-12 bg-primary/10 dark:bg-blue-400/10 rounded-xl">
                                <span className="material-symbols-outlined text-2xl text-primary dark:text-blue-400">folder_open</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Project</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                    {(pagination.total || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow whitespace-nowrap min-w-[200px]">
                            <div className="flex items-center justify-center size-12 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl">
                                <span className="material-symbols-outlined text-2xl text-emerald-500">analytics</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion Rate</p>
                                <p className="text-2xl font-black text-emerald-500 tracking-tighter">
                                    {data.length > 0 
                                        ? Math.round(data.reduce((sum, p) => sum + (p.progres || 0), 0) / data.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Tabs - Quick Filter */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 touch-pan-x -mx-4 px-4 md:mx-0 md:px-0 mb-6">
                    {[
                        { id: 'Semua Status', label: 'Semua', icon: 'apps', color: 'slate' },
                        { id: 'Ongoing', label: 'Ongoing', icon: 'autorenew', color: 'blue' },
                        { id: 'Pending', label: 'Pending', icon: 'schedule', color: 'amber' },
                        { id: 'Completed', label: 'Completed', icon: 'check_circle', color: 'emerald' }
                    ].map((tab) => {
                        const isActive = statusFilter === tab.id;
                        const colors = {
                            slate: isActive ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-none' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5',
                            blue: isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/5',
                            amber: isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-slate-100 dark:border-white/5',
                            emerald: isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-white/5 text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-100 dark:border-white/5'
                        };
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                                className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${colors[tab.color]}`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'font-fill' : ''}`}>{tab.icon}</span>
                                {tab.label}
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTabBilling"
                                        className="size-1.5 rounded-full bg-white dark:bg-slate-900 ml-1"
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Filters Section */}
                <div className="relative z-50 bg-white dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] p-6 mb-10 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input 
                                type="text"
                                placeholder="Pencarian"
                                value={search}
                                onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-400 focus:bg-white dark:focus:bg-white/10"
                            />
                        </div>

                        {/* Status Filter */}
                        <SearchableSelect 
                            options={statuses}
                            value={statusFilter}
                            onChange={(val) => {setStatusFilter(val); setCurrentPage(1);}}
                            placeholder="Semua Status"
                        />

                        {/* Company Filter */}
                        <SearchableSelect 
                            options={companies}
                            value={companyFilter}
                            onChange={(val) => {setCompanyFilter(val); setCurrentPage(1);}}
                            placeholder="Semua Perusahaan"
                        />

                        {/* Advanced Filters Toggle */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowMoreFilters(!showMoreFilters)}
                                className={`w-full h-full px-6 py-4 flex items-center justify-center rounded-2xl transition-all border ${
                                    showMoreFilters 
                                    ? 'bg-primary/10 border-primary/30 text-primary dark:text-blue-400' 
                                    : 'bg-slate-50 dark:bg-white/5 border-transparent dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <span className="material-symbols-outlined font-bold mr-2 text-[20px]">tune</span>
                                <span className="text-xs font-black uppercase tracking-widest">Filter Lanjutan</span>
                                {(myDataFilter || dateRange.start || dateRange.end) && (
                                    <span className="ml-2 size-2 rounded-full bg-primary dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                )}
                            </button>

                            {/* Advanced Filter Popover (Desktop) */}
                            {showMoreFilters && !isMobile && (
                                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#141720] border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 animate-reveal">
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreFilters(false)} />
                                    <div className="relative z-50">
                                        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/5 rounded-t-[2rem]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400">
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

                                        <div className="px-6 py-5 space-y-6">
                                            {/* My Data Toggle */}
                                            <button
                                                onClick={handleMyDataToggle}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                    myDataFilter
                                                    ? 'bg-primary/5 border-primary/20 dark:bg-blue-500/10 dark:border-blue-500/20'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className={`size-9 rounded-xl flex items-center justify-center transition-all ${
                                                        myDataFilter ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-lg">person_pin</span>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-black uppercase tracking-wider ${
                                                            myDataFilter ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                                                        }`}>Data Saya</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Filter berdasarkan PIC saya</p>
                                                    </div>
                                                </div>
                                                <div className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                                                    myDataFilter ? 'bg-primary dark:bg-blue-500/50' : 'bg-slate-300 dark:bg-white/20'
                                                }`}>
                                                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all ${
                                                        myDataFilter ? 'left-6' : 'left-1'
                                                    }`} />
                                                </div>
                                            </button>

                                            {/* Date Range */}
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Range Tanggal BAST</label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">calendar_month</span>
                                                        <input 
                                                            type="date"
                                                            value={dateRange.start}
                                                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                                            className="w-full pl-9 pr-3 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[11px] font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none dark:[color-scheme:dark]"
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">event_busy</span>
                                                        <input 
                                                            type="date"
                                                            value={dateRange.end}
                                                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                                            className="w-full pl-9 pr-3 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[11px] font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none dark:[color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6">
                                            <button 
                                                onClick={() => {
                                                    setDateRange({ start: '', end: '' });
                                                    setMyDataFilter(false);
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

                            {/* Advanced Filter Modal (Mobile) */}
                            {isMobile && (
                                <Modal show={showMoreFilters} onClose={() => setShowMoreFilters(false)} maxWidth="md" premium={true}>
                                    <div className="p-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="size-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-2xl">tune</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">Filter Lanjutan</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Sesuaikan tampilan data</p>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Data Saya */}
                                            <button
                                                onClick={handleMyDataToggle}
                                                className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${
                                                    myDataFilter
                                                    ? 'bg-primary/5 border-primary/20 dark:bg-blue-500/10 dark:border-blue-500/20'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                                                        myDataFilter ? 'bg-primary text-white shadow-lg' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-xl">person_pin</span>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-black uppercase tracking-wider ${
                                                            myDataFilter ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                                                        }`}>Data Saya</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1">Filter berdasarkan handle saya</p>
                                                    </div>
                                                </div>
                                                <div className={`relative w-12 h-7 rounded-full transition-all flex-shrink-0 ${
                                                    myDataFilter ? 'bg-primary dark:bg-blue-500/50' : 'bg-slate-300 dark:bg-white/20'
                                                }`}>
                                                    <div className={`absolute top-1 size-5 rounded-full bg-white shadow-md transition-all ${
                                                        myDataFilter ? 'left-6' : 'left-1'
                                                    }`}></div>
                                                </div>
                                            </button>

                                            {/* Date Range */}
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Range Tanggal BAST</label>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dari Tanggal</span>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">calendar_month</span>
                                                            <input 
                                                                type="date"
                                                                value={dateRange.start}
                                                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none dark:[color-scheme:dark]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</span>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">event_busy</span>
                                                            <input 
                                                                type="date"
                                                                value={dateRange.end}
                                                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none dark:[color-scheme:dark]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 mt-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 rounded-b-[2rem] flex flex-col gap-3">
                                        <button 
                                            onClick={() => setShowMoreFilters(false)}
                                            className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            Terapkan Filter
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setDateRange({ start: '', end: '' });
                                                setMyDataFilter(false);
                                                setCurrentPage(1);
                                                setShowMoreFilters(false);
                                            }}
                                            className="w-full py-4 bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 active:scale-95 transition-all"
                                        >
                                            Reset Semua
                                        </button>
                                    </div>
                                </Modal>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data View Controls */}
                <div className="flex justify-between items-center mb-6 px-1 lg:px-2">
                    <p className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
                        Menampilkan <span className="text-slate-800 dark:text-white font-black mx-1">{data?.length || 0}</span> dari <span className="text-slate-800 dark:text-white font-black mx-1">{pagination.total || 0}</span> Penagihan
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest sm:hidden">
                        <span className="text-slate-800 dark:text-white font-black mr-1">{pagination.total || 0}</span> Penagihan
                    </p>
                    
                    {/* View Mode Toggle - Web Only */}
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

                {/* Table Container - Web Only (table view) */}
                <div className={`${viewMode === 'table' ? 'hidden md:block' : 'hidden'} bg-transparent md:bg-white dark:md:bg-white/5 md:rounded-[3rem] md:border border-slate-100 dark:border-white/5 md:shadow-xl overflow-hidden`}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="hidden md:table w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] rounded-t-[3rem]">
                                    <th 
                                        onClick={() => handleSort('progres')}
                                        className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Progres
                                            <SortIcon column="progres" />
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Status
                                            <SortIcon column="status" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">Project, No. UP & No. Kontrak</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">Perusahaan</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">PIC</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">Handle</th>
                                    <th 
                                        onClick={() => handleSort('contractDate')}
                                        className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Tanggal Kontrak
                                            <SortIcon column="contractDate" />
                                        </div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {isTableLoading ? (
                                        <TableSkeleton columns={8} rows={pagination.per_page} />
                                    ) : data.length > 0 ? (
                                        data.map((project, index) => (
                                            <tr 
                                                key={project.id} 
                                                className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade"
                                                style={{ animationDelay: `${index * 100 + 150}ms` }}
                                            >
                                                {/* Progres */}
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2 min-w-[120px]">
                                                        <div className="flex justify-between items-center text-[10px] font-black">
                                                            <span className="text-slate-400 uppercase tracking-widest">Progress</span>
                                                            <span className={project.progres === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{project.progres}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-700 ${project.progres === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                                style={{ width: `${project.progres}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                        project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                        project.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' :
                                                        project.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                        'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 ring-slate-200/50 dark:ring-white/10'
                                                    }`}>
                                                        <span className={`material-symbols-outlined text-[13px] ${
                                                            project.status === 'Completed' ? 'font-fill' : ''
                                                        }`}>
                                                            {project.status === 'Completed' ? 'check_circle' :
                                                             project.status === 'Ongoing'   ? 'autorenew' :
                                                             project.status === 'Pending'   ? 'schedule' :
                                                             'block'}
                                                        </span>
                                                        {project.status}
                                                    </div>
                                                </td>
                                                {/* Project Name & No. UP & No. Kontrak */}
                                                <td className="px-6 py-6">
                                                    <div className="relative group/name">
                                                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors max-w-[200px] truncate">{project.name}</span>
                                                        {/* Tooltip for long names */}
                                                        <div className="absolute left-0 bottom-full mb-2 z-[200] hidden group-hover/name:block pointer-events-none">
                                                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-2 rounded-xl shadow-xl max-w-[320px] whitespace-normal leading-relaxed">
                                                                {project.name}
                                                                <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 items-center mt-1.5">
                                                        <span className="text-[11px] font-bold text-slate-400"><span className="text-slate-300">UP:</span> {project.upNo}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
                                                        <span className="text-[11px] font-bold text-slate-400 max-w-[120px] truncate"><span className="text-slate-300">KT:</span> {project.no_kontrak || '-'}</span>
                                                    </div>
                                                </td>
                                                {/* Company */}
                                                <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{project.company}</td>
                                                {/* PIC */}
                                                <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{project.pic?.name}</td>
                                                {/* Handle */}
                                                <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {project.handle?.name || <span className="text-slate-300 dark:text-slate-600 text-2xl leading-none font-medium">-</span>}
                                                </td>
                                                {/* Tanggal Kontrak & Due */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                            {new Date(project.contractDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit">
                                                            <span className="material-symbols-outlined text-[14px] text-amber-500">calendar_month</span>
                                                            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                                {new Date(project.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Aksi */}
                                                <td className="px-8 py-6 whitespace-nowrap text-right">
                                                    <div className="relative inline-flex group/tooltip justify-center">
                                                        <Link 
                                                            href={route('billing.edit', project.hashed_id)}
                                                            className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-primary/20 group"
                                                        >
                                                            <span className="material-symbols-outlined text-2xl">edit_square</span>
                                                        </Link>
                                                        
                                                        {/* Tooltip Content */}
                                                        <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:mb-3 transition-all duration-300 shadow-xl z-[100] whitespace-nowrap pointer-events-none">
                                                            Edit Penagihan
                                                            <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-slate-400">Tidak ada pengadaan ditemukan</p>
                                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Gunakan kata kunci atau filter lain</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - inside table container */}
                    <div className="px-0 md:px-8 py-8 md:py-6 border-t-0 md:border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-transparent md:bg-slate-50/50 dark:md:bg-white/[0.02] md:rounded-b-[3rem]">
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">
                            Showing <span className="font-black text-slate-900 dark:text-white">{pagination.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{pagination.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total || 0}</span> items
                        </p>
                        <Pagination links={pagination.links} />
                    </div>
                </div>

                {/* Card Grid View - Mobile: always visible, Web: only when viewMode === 'grid' */}
                <div className={`${isMobile ? 'block' : viewMode === 'grid' ? 'hidden md:block' : 'hidden'} mt-4`}>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
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
                        data.map((project, index) => (
                            <div 
                                key={project.id} 
                                className="bg-white dark:bg-white/[0.02] rounded-[2rem] border border-slate-200 dark:border-white/5 p-4 md:p-6 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-4 md:space-y-6 relative overflow-hidden group animate-slide-up-fade"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start gap-2 md:gap-4">
                                    <div className="min-w-0">
                                        <h4 className="text-xs md:text-base font-black text-slate-800 dark:text-white leading-tight line-clamp-2">{project.name}</h4>
                                        <p className="text-[9px] md:text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest mt-1">UP: {project.upNo || project.id}</p>
                                    </div>
                                    <div className="flex items-start shrink-0">
                                        <div className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0 ${
                                            project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' :
                                            project.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20' :
                                            project.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20' :
                                            'bg-slate-100 text-slate-500 ring-1 ring-slate-200/50 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10'
                                        }`}>
                                            <span className={`material-symbols-outlined text-[11px] md:text-[14px] ${project.status === 'Completed' ? 'font-fill' : ''}`}>
                                                {project.status === 'Completed' ? 'check_circle' :
                                                 project.status === 'Ongoing' ? 'autorenew' :
                                                 project.status === 'Pending' ? 'schedule' : 'block'}
                                            </span>
                                            <span className="hidden sm:inline-block">{project.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details - Client, PIC, Handler */}
                                <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-50 dark:border-white/5">
                                    <div className="space-y-1 overflow-hidden">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">Client</p>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{project.company || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">PIC</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="size-4 md:size-5 rounded-md bg-slate-100 dark:bg-white/5 flex flex-shrink-0 items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined text-[12px] md:text-[14px]">person</span>
                                                </div>
                                                <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{project.pic?.name || project.pic || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">Handler</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="size-4 md:size-5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 flex flex-shrink-0 items-center justify-center text-indigo-400">
                                                    <span className="material-symbols-outlined text-[12px] md:text-[14px]">manage_accounts</span>
                                                </div>
                                                <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{project.handle?.name || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* No Kontrak Highlight */}
                                <div className="bg-slate-50 dark:bg-white/[0.02] px-3 py-2.5 md:p-4 rounded-[1rem] md:rounded-[1.25rem] border border-slate-100 dark:border-white/5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">No. Kontrak</p>
                                    <p className="text-[11px] md:text-sm font-black text-slate-800 dark:text-white truncate">{project.no_kontrak || '-'}</p>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Progress</span>
                                        <span className={project.progres === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{project.progres || 0}%</span>
                                    </div>
                                    <div className="h-1.5 md:h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${project.progres === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} 
                                            style={{ width: `${project.progres || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01] px-2 md:px-3 py-2 md:py-3 rounded-xl md:rounded-2xl border border-slate-100/50 dark:border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] md:tracking-[0.2em]">Tgl Kontrak</span>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                            {project.contractDate ? new Date(project.contractDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                    <div className="w-px h-5 bg-slate-200 dark:bg-white/10"></div>
                                    <div className="flex flex-col gap-0.5 text-right">
                                        <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] md:tracking-[0.2em]">Due Date</span>
                                        <p className="text-[9px] md:text-[10px] font-black text-amber-500">
                                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <Link 
                                        href={route('billing.edit', project.hashed_id)}
                                        className="flex items-center justify-center gap-1.5 py-2 md:py-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[13px] md:text-[14px]">edit</span>
                                        Update Penagihan
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-20 text-center flex flex-col items-center gap-4">
                            <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-4xl">inventory_2</span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tidak ada data ditemukan</p>
                        </div>
                    )}
                    </div>

                    {/* Card Pagination */}
                    <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">
                            Showing <span className="font-black text-slate-900 dark:text-white">{pagination.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{pagination.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{pagination.total || 0}</span> items
                        </p>
                        <Pagination links={pagination.links} />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </AuthenticatedLayout>
    );
}
