import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import TableSkeleton from '@/Components/TableSkeleton';
import { router } from '@inertiajs/react';
import useSessionFilter from '@/Hooks/useSessionFilter';

const DUMMY_CONTRACTS = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: [
        'Modern Office Hub', 'SmartCity Grid V2', 'Metro Bridge Revamp', 'Oceania Logistics Hub',
        'Digital Banking Sync', 'Green Energy Park', 'Cloud Infrastructure', 'Urban Transit System',
        'Retail Chain Expansion', 'AgriTech Automation', 'Smart Port Logistics', 'Data Center Build',
        'Cyber Security Audit', 'Public Health Portal', 'Solar Array Install', 'Water Scarcity Plan'
    ][i % 16] + ` #${i + 1}`,
    category: ['CONSTRUCTION', 'TECHNOLOGY', 'GOVERNMENT', 'MARITIME', 'FINANCE', 'ENERGY'][i % 6],
    up_no: `UP/2024/${String(100 + i).padStart(4, '0')}`,
    company: ['PT. Bangun Jaya', 'Innova Systems', 'City Dev Group', 'Global Port Svcs', 'Nexus Corp', 'EcoEnergy Ltd'][i % 6],
    status: ['ONGOING', 'PENDING', 'COMPLETED', 'ONGOING', 'PENDING'][i % 5],
    progress: [65, 15, 100, 42, 0, 85, 30, 95][i % 8],
    pic: { 
        name: ['Sarah Miller', 'David Chen', 'Elena Rodriguez', 'Marcus Webb', 'James Wilson', 'Aria Gupta'][i % 6] 
    },
    handle: (i % 3 === 0) ? { 
        name: ['John Doe', 'Alex Smith', 'Sophia Lee', 'Michael Brown'][i % 4] 
    } : null,
    start_date: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    end_date: `2024-1${(i % 3) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

const DUMMY_STATS = {
    total_active: 42,
    completion_rate: 85,
    due_next_30_days: 12,
    avg_project_time: '4.2 Months',
};

export default function Index({ contracts: initialContracts, stats: initialStats, queryParams, auth_user }) {
    const [contracts, setContracts] = useState(initialContracts || DUMMY_CONTRACTS);
    const [stats, setStats] = useState(initialStats || DUMMY_STATS);
    const [search, setSearch] = useSessionFilter('Contract_search', queryParams?.search || '');
    const [statusFilter, setStatusFilter] = useSessionFilter('Contract_status', queryParams?.status || 'Semua Status');
    const [companyFilter, setCompanyFilter] = useSessionFilter('Contract_company', queryParams?.company || 'Semua Perusahaan');
    const [myDataFilter, setMyDataFilter] = useSessionFilter('Contract_myData', queryParams?.my_data === 'true');
    const [currentPage, setCurrentPage] = useSessionFilter('Contract_page', parseInt(queryParams?.page) || 1);
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const itemsPerPage = 5;
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [sortConfig, setSortConfig] = useSessionFilter('Contract_sort', { 
        key: queryParams?.tableSortColumn || null, 
        direction: queryParams?.tableSortDirection || 'asc' 
    });
    const [isTableLoading, setIsTableLoading] = useState(false);
    const isInitialMount = useRef(true);

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

    // Filter and Sort Logic
    const filteredAndSortedContracts = useMemo(() => {
        let result = [...contracts];

        // Search Filter
        if (search) {
            const lowSearch = search.toLowerCase();
            result = result.filter(c => 
                c.name.toLowerCase().includes(lowSearch) ||
                c.company.toLowerCase().includes(lowSearch) ||
                c.pic.name.toLowerCase().includes(lowSearch) ||
                c.up_no.toLowerCase().includes(lowSearch)
            );
        }

        // My Data Filter (Filter by Auth User Handle)
        if (myDataFilter && auth_user) {
            result = result.filter(c => c.handle?.name === auth_user.name);
        }

        // Status Filter
        if (statusFilter !== 'Semua Status') {
            result = result.filter(c => c.status === statusFilter);
        }

        // Company Filter
        if (companyFilter !== 'Semua Perusahaan') {
            result = result.filter(c => c.company === companyFilter);
        }

        // Column Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Handle nested objects or special types
                if (sortConfig.key === 'start_date') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [contracts, search, statusFilter, companyFilter, myDataFilter, sortConfig]);

    // Pagination Logic
    const totalItems = filteredAndSortedContracts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedContracts = filteredAndSortedContracts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change (BUT NOT when sorting, and NOT on first mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setIsTableLoading(true);
        const timer = setTimeout(() => setIsTableLoading(false), 500);
        setCurrentPage(1);
        return () => clearTimeout(timer);
    }, [search, statusFilter, companyFilter, sortConfig]);

    // URL Persistence Implementation
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'Semua Status') params.status = statusFilter;
            if (companyFilter !== 'Semua Perusahaan') params.company = companyFilter;
            if (myDataFilter) params.my_data = 'true';
            if (sortConfig.key) {
                params.tableSortColumn = sortConfig.key;
                params.tableSortDirection = sortConfig.direction;
            }
            if (currentPage > 1) params.page = currentPage;

            // Only navigate if the new params are actually different from the current URL
            const url = new URL(window.location.href);
            const currentParams = Object.fromEntries(url.searchParams.entries());
            
            const paramsChanged = JSON.stringify(params) !== JSON.stringify(currentParams);
            const hasQueryParams = queryParams && Object.keys(queryParams).length > 0;
            const hasNewParams = Object.keys(params).length > 0;

            if (paramsChanged && (hasNewParams || hasQueryParams)) {
                router.get(route('contracts'), params, {
                    preserveState: true,
                    replace: true
                });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, companyFilter, myDataFilter, sortConfig, currentPage]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleMyDataToggle = () => {
        setMyDataFilter(!myDataFilter);
        setCurrentPage(1);
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Contracts Management" />

            <div className="space-y-8 pb-10">
                {/* Summary Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">Total Active</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.total_active}</h3>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">Completion Rate</p>
                        <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">{stats.completion_rate}%</h3>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">Due Next 30 Days</p>
                        <h3 className="text-4xl font-black text-amber-500 tracking-tighter">{stats.due_next_30_days}</h3>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">Avg. Project Time</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.avg_project_time}</h3>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="relative z-50 bg-white dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative group lg:col-span-1">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input 
                                type="text"
                                placeholder="Pencarian"
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-400 focus:bg-white dark:focus:bg-white/10"
                            />
                        </div>

                        {/* Status Filter */}
                        <SearchableSelect 
                            options={['Semua Status', 'ONGOING', 'PENDING', 'COMPLETED']}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            placeholder="Semua Status"
                        />

                        {/* Company Filter (Matching Projects) */}
                        <SearchableSelect 
                            options={['Semua Perusahaan', ...Array.from(new Set(contracts.map(c => c.company)))]}
                            value={companyFilter}
                            onChange={(val) => {
                                setCompanyFilter(val);
                                setCurrentPage(1);
                            }}
                            placeholder="Semua Perusahaan"
                        />

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
                                {myDataFilter && (
                                    <span className="ml-2 size-2 rounded-full bg-primary dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                )}
                            </button>

                            {/* More Filters Popover */}
                            {showMoreFilters && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreFilters(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#141720] border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 animate-reveal">
                                        {/* Header */}
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

                                        {/* Toggle Options */}
                                        <div className="px-6 py-5 space-y-3">
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
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Filter berdasarkan handle saya</p>
                                                    </div>
                                                </div>
                                                {/* Toggle Switch */}
                                                <div className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                                                    myDataFilter ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'
                                                }`}>
                                                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                                        myDataFilter ? 'left-6' : 'left-1'
                                                    }`} />
                                                </div>
                                            </button>
                                        </div>

                                        {/* Footer - Reset only */}
                                        <div className="px-6 pb-6">
                                            <button 
                                                onClick={() => {
                                                    setMyDataFilter(false);
                                                    setCurrentPage(1);
                                                    setShowMoreFilters(false);
                                                }}
                                                className="w-full py-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                                            >
                                                Reset Filter
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contracts Table */}
                <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-t-[3rem]">
                                    <th 
                                        onClick={() => handleSort('progress')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Progress
                                            <SortIcon column="progress" />
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Status
                                            <SortIcon column="status" />
                                        </div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Project & No. Kontrak</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Nomor UP</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Company</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">PIC</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">Handle</th>
                                    <th 
                                        onClick={() => handleSort('start_date')}
                                        className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">
                                            Tanggal Kontrak
                                            <SortIcon column="start_date" />
                                        </div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {isTableLoading ? (
                                    <TableSkeleton columns={8} rows={itemsPerPage} />
                                ) : paginatedContracts.length > 0 ? paginatedContracts.map((contract, index) => (
                                    <tr 
                                        key={contract.id} 
                                        className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade"
                                        style={{ animationDelay: `${index * 100 + 150}ms` }}
                                    >
                                        {/* Progress */}
                                        <td className="px-6 py-6 min-w-[160px] whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            contract.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                                        }`}
                                                        style={{ width: `${contract.progress}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-black w-8 ${contract.progress === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}`}>{contract.progress}%</span>
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                    (contract.status === 'COMPLETED' || contract.status === 'Completed') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                    (contract.status === 'ONGOING'   || contract.status === 'Ongoing')   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' :
                                                    (contract.status === 'PENDING'   || contract.status === 'Pending')   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                    'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 ring-slate-200/50 dark:ring-white/10'
                                                }`}>
                                                    <span className={`material-symbols-outlined text-[13px] ${
                                                        (contract.status === 'COMPLETED' || contract.status === 'Completed') ? 'font-fill' : ''
                                                    }`}>
                                                        {(contract.status === 'COMPLETED' || contract.status === 'Completed') ? 'check_circle' :
                                                         (contract.status === 'ONGOING'   || contract.status === 'Ongoing')   ? 'autorenew' :
                                                         (contract.status === 'PENDING'   || contract.status === 'Pending')   ? 'schedule' :
                                                         'block'}
                                                    </span>
                                                    {contract.status}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Project Name & No. Kontrak */}
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div title={contract.name}>
                                                <p className="font-black text-slate-900 dark:text-white leading-tight">
                                                    {contract.name.length > 25 ? contract.name.substring(0, 25) + '...' : contract.name}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{contract.no_kontrak || '-'}</p>
                                            </div>
                                        </td>
                                        {/* Nomor UP */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{contract.up_no}</span>
                                        </td>
                                        {/* Company */}
                                        <td className="px-6 py-6 text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">{contract.company}</td>
                                        {/* PIC */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{contract.pic.name}</span>
                                        </td>
                                        {/* Handle */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            {contract.handle ? (
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{contract.handle.name}</span>
                                            ) : (
                                                <span className="text-slate-400 font-bold">-</span>
                                            )}
                                        </td>
                                        {/* Tanggal Kontrak */}
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    {new Date(contract.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit">
                                                    <span className="material-symbols-outlined text-[14px] text-amber-500">calendar_month</span>
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                        {new Date(contract.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Aksi */}
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="relative inline-flex group/tooltip justify-center">
                                                <Link 
                                                    href={route('contracts.edit', contract.hashed_id)}
                                                    className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-primary/20 group"
                                                >
                                                    <span className="material-symbols-outlined text-2xl">edit_square</span>
                                                </Link>
                                                
                                                {/* Tooltip Content - Shifted left to avoid edge clipping and increased z-index */}
                                                <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:mb-3 transition-all duration-300 shadow-xl z-[100] whitespace-nowrap pointer-events-none">
                                                    Edit Kontrak
                                                    <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
 : (
                                    <tr>
                                        <td colSpan="9" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-white/10">search_off</span>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No contracts found matching your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] rounded-b-[3rem]">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Showing <span className="font-black text-slate-900 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-black text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-black text-slate-900 dark:text-white">{totalItems}</span> contracts
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="size-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30" 
                                disabled={currentPage === 1}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            
                            {/* Smart Pagination */}
                            {(() => {
                                const pages = [];
                                if (totalPages <= 7) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    if (currentPage <= 4) {
                                        for (let i = 1; i <= 5; i++) pages.push(i);
                                        pages.push('...');
                                        pages.push(totalPages);
                                    } else if (currentPage >= totalPages - 3) {
                                        pages.push(1);
                                        pages.push('...');
                                        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        pages.push('...');
                                        pages.push(currentPage - 1);
                                        pages.push(currentPage);
                                        pages.push(currentPage + 1);
                                        pages.push('...');
                                        pages.push(totalPages);
                                    }
                                }
                                return pages.map((page, i) => (
                                    page === '...' ? (
                                        <span key={`dots-${i}`} className="size-10 flex items-center justify-center text-slate-400 font-black">...</span>
                                    ) : (
                                        <button 
                                            key={page} 
                                            onClick={() => setCurrentPage(page)}
                                            className={`size-10 rounded-xl text-xs font-black transition-all ${
                                                page === currentPage ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'text-slate-500 hover:text-primary'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ));
                            })()}

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="size-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30"
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
