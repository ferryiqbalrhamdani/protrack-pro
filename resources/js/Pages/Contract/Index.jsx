import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import TableSkeleton from '@/Components/TableSkeleton';
import Modal from '@/Components/Modal';
import useSessionFilter from '@/Hooks/useSessionFilter';
import useMediaQuery from '@/Hooks/useMediaQuery';
import Pagination from '@/Components/Pagination';

import { motion } from 'framer-motion';

// Removed DUMMY_CONTRACTS as we now use real data from backend

export default function Index({ contracts, stats, queryParams, auth_user }) {
    const [search, setSearch] = useState(queryParams?.search || '');
    const [statusFilter, setStatusFilter] = useState(queryParams?.status || 'Semua Status');
    const [companyFilter, setCompanyFilter] = useState(queryParams?.company || 'Semua Perusahaan');
    const [myDataFilter, setMyDataFilter] = useState(queryParams?.my_data === 'true');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    
    // Server-side sorting
    const [sortBy, setSortBy] = useState(queryParams?.tableSortColumn || 'created_at');
    const [sortDir, setSortDir] = useState(queryParams?.tableSortDirection || 'desc');

    const SortIcon = ({ column }) => {
        const isSorted = sortBy === column;
        return (
            <span className={`material-symbols-outlined text-sm transition-all ${
                isSorted ? 'text-primary dark:text-blue-400 scale-110 font-bold' : 'text-slate-300 dark:text-slate-600 group-hover/th:text-slate-400'
            }`}>
                {isSorted && sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
        );
    };

    const [isTableLoading, setIsTableLoading] = useState(false);
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isInitialMount = useRef(true);

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
    };

    // Server-side Filter & Sort Effect
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'Semua Status') params.status = statusFilter;
            if (companyFilter !== 'Semua Perusahaan') params.company = companyFilter;
            if (myDataFilter) params.my_data = 'true';
            if (sortBy) params.tableSortColumn = sortBy;
            if (sortDir) params.tableSortDirection = sortDir;

            router.get(route('contracts'), params, {
                preserveState: true,
                replace: true,
                onBefore: () => setIsTableLoading(true),
                onFinish: () => setIsTableLoading(false),
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, companyFilter, myDataFilter, sortBy, sortDir]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleMyDataToggle = () => {
        setMyDataFilter(!myDataFilter);
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

                {/* Status Tabs - Quick Filter */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 touch-pan-x -mx-4 px-4 md:mx-0 md:px-0">
                    {[
                        { id: 'Semua Status', label: 'Semua', icon: 'apps', color: 'slate' },
                        { id: 'ONGOING', label: 'Ongoing', icon: 'autorenew', color: 'blue' },
                        { id: 'PENDING', label: 'Pending', icon: 'schedule', color: 'amber' },
                        { id: 'COMPLETED', label: 'Completed', icon: 'check_circle', color: 'emerald' }
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
                                onClick={() => handleStatusChange(tab.id)}
                                className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${colors[tab.color]}`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'font-fill' : ''}`}>{tab.icon}</span>
                                {tab.label}
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTabContract"
                                        className="size-1.5 rounded-full bg-white dark:bg-slate-900 ml-1"
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    />
                                )}
                            </button>
                        );
                    })}
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
                            }}
                            placeholder="Semua Status"
                        />

                        {/* Company Filter (Matching Projects) */}
                        <SearchableSelect 
                            options={['Semua Perusahaan', ...Array.from(new Set((contracts.data || []).map(c => c.company)))]}
                            value={companyFilter}
                            onChange={(val) => {
                                setCompanyFilter(val);
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

                                        <div className="px-6 py-5">
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
                                        </div>

                                        <div className="px-6 pb-6">
                                            <button
                                                onClick={() => { setMyDataFilter(false); setCurrentPage(1); setShowMoreFilters(false); }}
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

                                        <div className="space-y-6">
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

                <div className="bg-transparent md:bg-white dark:md:bg-white/5 md:rounded-[3rem] md:border border-slate-100 dark:border-white/5 md:shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="hidden md:table w-full text-left border-collapse">
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
                                    <TableSkeleton columns={8} rows={10} />
                                ) : (contracts.data || []).length > 0 ? (contracts.data || []).map((contract, index) => (
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
                                                    {contract.start_date ? new Date(contract.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit">
                                                    <span className="material-symbols-outlined text-[14px] text-amber-500">calendar_month</span>
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                        {contract.end_date ? new Date(contract.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
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
                            ) : (contracts.data || []).length > 0 ? (
                                (contracts.data || []).map((contract, index) => (
                                    <div 
                                        key={contract.id} 
                                        className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group animate-slide-up-fade"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Status Badge - Top Right */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                (contract.status === 'COMPLETED' || contract.status === 'Completed') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                (contract.status === 'ONGOING'   || contract.status === 'Ongoing')   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' :
                                                (contract.status === 'PENDING'   || contract.status === 'Pending')   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                'bg-slate-100 text-slate-500 dark:bg-white/5 ring-slate-200/50'
                                            }`}>
                                                {contract.status}
                                            </div>
                                            
                                            <Link 
                                                href={contract.hashed_id ? route('contracts.edit', contract.hashed_id) : '#'}
                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit_square</span>
                                            </Link>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-[11px] font-black text-slate-800 dark:text-white line-clamp-2 leading-tight uppercase italic tracking-tight">
                                                {contract.name}
                                            </h4>
                                            <div className="flex flex-col gap-2 mt-1.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">No. UP</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight">{contract.up_no || '-'}</span>
                                                </div>
                                                <div className="flex flex-col pt-2 border-t border-slate-50 dark:border-white/5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">No. Kontrak</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight break-all">{contract.no_kontrak || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Progres</span>
                                                <span className={contract.progress === 100 ? 'text-emerald-500' : 'text-primary'}>{contract.progress || 0}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-700 ${contract.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${contract.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metas */}
                                        <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-50 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">business</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{contract.company}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">person</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{contract.handle?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">calendar_today</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-truncate">
                                                    {contract.end_date ? new Date(contract.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    Tidak ada data ditemukan
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-0 md:px-8 py-8 md:py-6 border-t-0 md:border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-transparent md:bg-slate-50/50 dark:md:bg-white/[0.02] md:rounded-b-[3rem]">
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Showing <span className="font-black text-slate-900 dark:text-white">{contracts.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{contracts.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{contracts.total || 0}</span> contracts
                        </p>
                        
                        <Pagination links={contracts.links} />
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </AuthenticatedLayout>
    );
}
