import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import useSessionFilter from '@/Hooks/useSessionFilter';
import SearchableSelect from '@/Components/SearchableSelect';
import ExportButton from '@/Components/ExportButton';
import TableSkeleton from '@/Components/TableSkeleton';
import Pagination from '@/Components/Pagination';



const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }).format(value);
};

export default function Index({ projects, queryParams = null }) {
    const { auth } = usePage().props;
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

                            {/* More Filters Popover */}
                            {showMoreFilters && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreFilters(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#141720] border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 animate-reveal">
                                        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/5 rounded-t-[2rem]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400">
                                                        <span className="material-symbols-outlined text-lg">tune</span>
                                                    </div>
                                                    <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Filter Lanjutan</h4>
                                                </div>
                                                <div className="relative group/tooltip">
                                                    <button
                                                        onClick={() => setShowMoreFilters(false)}
                                                        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                    <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:mb-3 transition-all duration-300 shadow-xl z-[100] whitespace-nowrap pointer-events-none">
                                                        Tutup Filter
                                                        <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Data Saya Toggle */}
                                            <button
                                                onClick={() => {setMyDataFilter(!myDataFilter); setCurrentPage(1);}}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                    myDataFilter
                                                    ? 'bg-primary/5 border-primary/20 dark:bg-blue-500/10 dark:border-blue-500/20'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-9 rounded-xl flex items-center justify-center transition-all ${myDataFilter ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                                                        <span className="material-symbols-outlined text-lg">person_pin</span>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className={`text-xs font-black uppercase tracking-wider ${myDataFilter ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>Data Saya</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Filter berdasar Handle</p>
                                                    </div>
                                                </div>
                                                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${myDataFilter ? 'border-primary bg-primary' : 'border-slate-300 dark:border-white/10'}`}>
                                                    {myDataFilter && <span className="material-symbols-outlined text-white text-xs font-bold font-fill">check</span>}
                                                </div>
                                            </button>

                                            {/* Date Range Filters */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rentang Tanggal Kontrak</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">calendar_month</span>
                                                        <input 
                                                            type="date"
                                                            value={dateRange.start}
                                                            onChange={(e) => {setDateRange({...dateRange, start: e.target.value}); setCurrentPage(1);}}
                                                            className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none dark:[color-scheme:dark]"
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">event_busy</span>
                                                        <input 
                                                            type="date"
                                                            value={dateRange.end}
                                                            onChange={(e) => {setDateRange({...dateRange, end: e.target.value}); setCurrentPage(1);}}
                                                            className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none dark:[color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reset Filters */}
                                            <button 
                                                onClick={() => {
                                                    setSearch('');
                                                    setStatusFilter('Semua Status');
                                                    setCompanyFilter('Semua Perusahaan');
                                                    setMyDataFilter(false);
                                                    setDateRange({start: '', end: ''});
                                                    setCurrentPage(1);
                                                    setShowMoreFilters(false);
                                                }}
                                                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                Reset Semua Filter
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-transparent md:bg-white dark:md:bg-white/5 md:rounded-[3rem] md:border border-slate-100 dark:border-white/5 md:shadow-xl overflow-hidden">
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
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{project.name}</span>
                                                        <div className="flex gap-3 items-center">
                                                            <span className="text-[11px] font-bold text-slate-400"><span className="text-slate-300">UP:</span> {project.upNo}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
                                                            <span className="text-[11px] font-bold text-slate-400"><span className="text-slate-300">KT:</span> {project.no_kontrak || '-'}</span>
                                                        </div>
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
                                data.map((project, index) => (
                                     <div 
                                        key={project.id} 
                                        className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group animate-slide-up-fade"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                project.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' :
                                                project.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                'bg-slate-100 text-slate-500 dark:bg-white/5 ring-slate-200/50'
                                            }`}>
                                                {project.status || 'Ongoing'}
                                            </div>
                                            <Link href={project.hashed_id ? route('billing.edit', project.hashed_id) : '#'} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400">
                                                <span className="material-symbols-outlined text-lg">edit_square</span>
                                            </Link>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-[11px] font-black text-slate-800 dark:text-white line-clamp-2 leading-tight uppercase italic tracking-tight">{project.name}</h4>
                                            <div className="flex flex-col gap-2 mt-1.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">No. UP</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight">{project.upNo || '-'}</span>
                                                </div>
                                                <div className="flex flex-col pt-2 border-t border-slate-50 dark:border-white/5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">No. Kontrak</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight break-all">{project.no_kontrak || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Progres</span>
                                                <span className={project.progres === 100 ? 'text-emerald-500' : 'text-primary'}>{project.progres || 0}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-700 ${project.progres === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${project.progres || 0}%` }} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-50 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">business</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{project.company || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">person</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                                    {project.pic?.name || project.pic || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Tidak ada data ditemukan</div>
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
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
            `}} />
        </AuthenticatedLayout>
    );
}
