import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import TableSkeleton from '@/Components/TableSkeleton';
import { usePage } from '@inertiajs/react';
import useSessionFilter from '@/Hooks/useSessionFilter';

// Dummy data reused from Project data with merchandiser fields added
const DUMMY_MERCHANDISER = [
    { id: 1, name: 'Modern Office Hub', upNo: 'UP-2023-001', budgetType: 'APBN', pic: 'Alex Rivera', progres: 65, status: 'Ongoing', barangDikontrak: 120, barangDiterima: 78 },
    { id: 2, name: 'Logistics Upgrade', upNo: 'UP-2023-002', budgetType: 'APBD', pic: 'Sarah Chen', progres: 100, status: 'Completed', barangDikontrak: 85, barangDiterima: 85 },
    { id: 3, name: 'Retail Chain Sync', upNo: 'UP-2023-003', budgetType: 'Mandiri', pic: 'Michael Scott', progres: 20, status: 'Pending', barangDikontrak: 0, barangDiterima: 0 },
    { id: 4, name: 'Smart Factory Integration', upNo: 'UP-2024-001', budgetType: 'APBN', pic: 'Jane Doe', progres: 45, status: 'Ongoing', barangDikontrak: 200, barangDiterima: 90 },
    { id: 5, name: 'Green Energy Park', upNo: 'UP-2024-002', budgetType: 'APBN', pic: 'Alex Rivera', progres: 10, status: 'Ongoing', barangDikontrak: 0, barangDiterima: 0 },
    { id: 6, name: 'Urban Mall Revamp', upNo: 'UP-2024-003', budgetType: 'APBD', pic: 'Sarah Chen', progres: 0, status: 'Pending', barangDikontrak: 0, barangDiterima: 0 },
    { id: 7, name: 'Data Center Expansion', upNo: 'UP-2024-004', budgetType: 'Mandiri', pic: 'Michael Scott', progres: 85, status: 'Ongoing', barangDikontrak: 350, barangDiterima: 298 },
    { id: 8, name: 'Solar Farm Project', upNo: 'UP-2024-005', budgetType: 'APBN', pic: 'Alex Rivera', progres: 100, status: 'Completed', barangDikontrak: 500, barangDiterima: 500 },
];

export default function Index({ projects, summary, queryParams = null }) {
    queryParams = queryParams || {};
    const { auth } = usePage().props;
    const auth_user = auth?.user;
    
    // Using real data from backend
    const data = projects.data;
    const pagination = projects;

    const [search, setSearch] = useSessionFilter('Merchandiser_search', queryParams.search || '');
    const [statusFilter, setStatusFilter] = useSessionFilter('Merchandiser_status', queryParams.status || 'Semua Status');
    const [budgetFilter, setBudgetFilter] = useSessionFilter('Merchandiser_budget', queryParams.budget || 'Semua Anggaran');
    const [myDataFilter, setMyDataFilter] = useSessionFilter('Merchandiser_myData', queryParams.my_data === 'true');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [sortConfig, setSortConfig] = useSessionFilter('Merchandiser_sort', {
        key: queryParams.tableSortColumn || null,
        direction: queryParams.tableSortDirection || 'asc',
    });
    const [currentPage, setCurrentPage] = useState(projects.current_page);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const isInitialMount = useRef(true);

    const handleSort = (key) => {
        let direction = 'asc';
        let newKey = key;
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else newKey = null;
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

    const handleMyDataToggle = () => {
        setMyDataFilter(prev => !prev);
    };

    // URL Persistence & Server-side Fetching
    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        
        const timeout = setTimeout(() => {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'Semua Status') params.status = statusFilter;
            if (budgetFilter !== 'Semua Anggaran') params.budget = budgetFilter;
            if (myDataFilter) params.my_data = 'true';
            if (sortConfig.key) {
                params.tableSortColumn = sortConfig.key;
                params.tableSortDirection = sortConfig.direction;
            }
            if (currentPage > 1) params.page = currentPage;

            setIsTableLoading(true);
            router.get(route('merchandiser'), params, { 
                preserveState: true, 
                replace: true,
                onFinish: () => setIsTableLoading(false)
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, budgetFilter, myDataFilter, sortConfig, currentPage]);

    const statusConfig = {
        'Ongoing':   { bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', ring: 'ring-blue-500/20', icon: 'autorenew' },
        'Completed': { bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', ring: 'ring-emerald-500/20', icon: 'check_circle' },
        'Pending':   { bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', ring: 'ring-amber-500/20', icon: 'schedule' },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Merchandiser" />

            <div className="space-y-8 pb-10">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-3">
                            Merchandiser
                        </h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                            Monitoring Barang Dikontrak &amp; Diterima
                        </p>
                    </div>

                    {/* Summary Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                            <span className="material-symbols-outlined text-lg text-primary dark:text-blue-400">inventory_2</span>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Dikontrak</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                                    {(summary.total_dikontrak || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                            <span className="material-symbols-outlined text-lg text-emerald-500">verified</span>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Diterima</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                                    {(summary.total_diterima || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                            <span className="material-symbols-outlined text-lg text-amber-500">pending_actions</span>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Belum Diterima</p>
                                <p className="text-lg font-black text-amber-500 leading-tight">
                                    {(summary.total_belum_diterima || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="relative z-50 bg-white dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Pencarian"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-400 focus:bg-white dark:focus:bg-white/10"
                            />
                        </div>
                        {/* Status */}
                        <SearchableSelect
                            options={['Semua Status', 'Ongoing', 'Pending', 'Completed']}
                            value={statusFilter}
                            onChange={val => { setStatusFilter(val); setCurrentPage(1); }}
                            placeholder="Semua Status"
                        />
                        {/* Budget Type */}
                        <SearchableSelect
                            options={['Semua Anggaran', 'APBN', 'APBD', 'Mandiri']}
                            value={budgetFilter}
                            onChange={val => { setBudgetFilter(val); setCurrentPage(1); }}
                            placeholder="Semua Anggaran"
                        />

                        {/* Filter Lanjutan */}
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

                                        {/* Toggle */}
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
                                                    myDataFilter ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'
                                                }`}>
                                                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                                        myDataFilter ? 'left-6' : 'left-1'
                                                    }`} />
                                                </div>
                                            </button>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 pb-6">
                                            <button
                                                onClick={() => { setMyDataFilter(false); setCurrentPage(1); setShowMoreFilters(false); }}
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

                {/* Table */}
                <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-t-[3rem]">
                                    <th
                                        onClick={() => handleSort('progres')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">Progress <SortIcon column="progres" /></div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">Status <SortIcon column="status" /></div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        Project &amp; No. UP
                                    </th>
                                    <th
                                        onClick={() => handleSort('budget_type')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th"
                                    >
                                        <div className="flex items-center gap-2">Jenis Anggaran <SortIcon column="budget_type" /></div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">PIC</th>
                                    <th
                                        onClick={() => handleSort('merchandiser_barang_dikontrak')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th text-right"
                                    >
                                        <div className="flex items-center justify-end gap-2">Barang Dikontrak <SortIcon column="merchandiser_barang_dikontrak" /></div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('merchandiser_barang_diterima')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group/th text-right"
                                    >
                                        <div className="flex items-center justify-end gap-2">Barang Diterima <SortIcon column="merchandiser_barang_diterima" /></div>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                  {isTableLoading ? (
                                     <TableSkeleton columns={8} rows={8} />
                                 ) : data.length > 0 ? data.map((row, index) => {
                                     const sc = statusConfig[row.status] || statusConfig['Pending'];
                                     const barangDikontrak = Number(row.barang_dikontrak || 0);
                                     const barangDiterima = Number(row.barang_diterima || 0);
                                     const sisaBarang = barangDikontrak - barangDiterima;
                                     const isPIC = auth_user?.name === row.pic;
                                     const isReviewMode = row.status === 'Pending' || row.status === 'Completed';

                                     return (
                                         <tr 
                                             key={row.id} 
                                             className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade"
                                             style={{ animationDelay: `${index * 100 + 150}ms` }}
                                         >
                                             {/* Progress */}
                                             <td className="px-6 py-5 min-w-[160px]">
                                                 <div className="flex flex-col gap-1.5">
                                                     <div className="flex items-center justify-between text-[10px] font-black">
                                                         <span className="text-slate-400">Progress</span>
                                                         <span className={row.progres === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{row.progres}%</span>
                                                     </div>
                                                     <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                         <div
                                                             className={`h-full rounded-full transition-all duration-700 ${row.progres === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                             style={{ width: `${row.progres}%` }}
                                                         />
                                                     </div>
                                                 </div>
                                             </td>

                                             {/* Status */}
                                             <td className="px-6 py-5 whitespace-nowrap">
                                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${sc.bg} ${sc.text} ${sc.ring}`}>
                                                     <span className="material-symbols-outlined text-[12px]">{sc.icon}</span>
                                                     {row.status}
                                                 </span>
                                             </td>

                                             {/* Project & No. UP */}
                                             <td className="px-8 py-5 whitespace-nowrap">
                                                 <p className="font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{row.name}</p>
                                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{row.upNo}</p>
                                             </td>

                                             {/* Jenis Anggaran */}
                                             <td className="px-6 py-5 whitespace-nowrap">
                                                 <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                     row.budgetType === 'APBN' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' :
                                                     row.budgetType === 'APBD' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                                                     'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                 }`}>
                                                     {row.budgetType}
                                                 </span>
                                             </td>

                                             {/* PIC */}
                                             <td className="px-6 py-5 whitespace-nowrap">
                                                 <div className="flex items-center gap-2.5">
                                                     <div className="size-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                         {row.pic?.split(' ').map(w => w[0]).join('').slice(0, 2) || '??'}
                                                     </div>
                                                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {row.pic} {isPIC && <span className="text-[9px] text-primary">(Anda)</span>}
                                                     </span>
                                                 </div>
                                             </td>

                                             {/* Barang Dikontrak */}
                                             <td className="px-6 py-5 whitespace-nowrap text-right">
                                                 <p className="text-sm font-black text-slate-800 dark:text-white">
                                                     {barangDikontrak === 0
                                                         ? <span className="text-slate-300 dark:text-white/20 font-bold">—</span>
                                                         : barangDikontrak.toLocaleString('id-ID')}
                                                 </p>
                                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">unit</p>
                                             </td>

                                             {/* Barang Diterima */}
                                             <td className="px-6 py-5 whitespace-nowrap text-right">
                                                 <p className={`text-sm font-black ${
                                                     barangDiterima === 0 ? 'text-slate-300 dark:text-white/20' :
                                                     barangDiterima === barangDikontrak ? 'text-emerald-500' :
                                                     'text-slate-800 dark:text-white'
                                                 }`}>
                                                     {barangDiterima === 0 ? '—' : barangDiterima.toLocaleString('id-ID')}
                                                 </p>
                                                 {barangDikontrak > 0 && (
                                                     <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                                                         sisaBarang > 0 ? 'text-amber-500' : 'text-emerald-500'
                                                     }`}>
                                                         {sisaBarang > 0 ? `sisa ${sisaBarang.toLocaleString('id-ID')}` : 'lunas'}
                                                     </p>
                                                 )}
                                             </td>

                                             {/* Aksi */}
                                             <td className="px-8 py-5 whitespace-nowrap text-right">
                                                 <div className="relative inline-flex group/tooltip justify-center">
                                                     <Link
                                                         href={route('merchandiser.edit', row.hashed_id)}
                                                         className={`inline-flex size-10 items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent ${
                                                            isPIC && !isReviewMode
                                                            ? 'bg-primary/10 text-primary dark:text-blue-400 border-primary/20'
                                                            : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                                         }`}
                                                     >
                                                         <span className="material-symbols-outlined text-xl">
                                                            {isPIC && !isReviewMode ? 'edit_square' : 'visibility'}
                                                         </span>
                                                     </Link>
                                                     <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:mb-3 transition-all duration-300 shadow-xl z-[100] whitespace-nowrap pointer-events-none">
                                                         {isPIC && !isReviewMode ? 'Ubah Data' : 'Peninjauan'}
                                                         <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                     </div>
                                                 </div>
                                             </td>
                                         </tr>
                                     );
                                 }) : (
                                     <tr>
                                         <td colSpan="8" className="px-8 py-20 text-center">
                                             <div className="flex flex-col items-center gap-3">
                                                 <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-white/10">inventory_2</span>
                                                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</p>
                                             </div>
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] rounded-b-[3rem]">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Menampilkan <span className="font-black text-slate-900 dark:text-white">{Math.min((pagination.current_page - 1) * pagination.per_page + 1, pagination.total)}</span> — <span className="font-black text-slate-900 dark:text-white">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> dari <span className="font-black text-slate-900 dark:text-white">{pagination.total}</span> data
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={pagination.current_page === 1}
                                className="size-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`size-10 rounded-xl text-xs font-black transition-all ${
                                        page === pagination.current_page
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110'
                                        : 'text-slate-500 hover:text-primary'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={pagination.current_page === pagination.last_page || pagination.last_page === 0}
                                className="size-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                    </div>
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
