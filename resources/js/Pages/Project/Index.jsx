import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSessionFilter from '@/Hooks/useSessionFilter';
import SearchableSelect from '@/Components/SearchableSelect';
import ExportButton from '@/Components/ExportButton';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TableSkeleton from '@/Components/TableSkeleton';
import Pagination from '@/Components/Pagination';

export default function Index({ projects, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'All');
    const [companyFilter, setCompanyFilter] = useState(filters?.company || 'All');
    const [dateRange, setDateRange] = useState({ 
        start: filters?.start_date || '', 
        end: filters?.end_date || '' 
    });
    
    // Sorting State
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters?.sort_dir || 'desc');
    
    const [activeActionId, setActiveActionId] = useState(null);
    const [activeActionPos, setActiveActionPos] = useState({ top: 0, left: 0 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const isInitialMount = useRef(true);

    // Filter & Sort Logic (Server-side)
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
                search !== (filters?.search || '') ||
                statusFilter !== (filters?.status || 'All') ||
                companyFilter !== (filters?.company || 'All') ||
                dateRange.start !== (filters?.start_date || '') ||
                dateRange.end !== (filters?.end_date || '') ||
                sortBy !== (filters?.sort_by || 'created_at') ||
                sortDir !== (filters?.sort_dir || 'desc');

            if (hasChanged) {
                router.get(route('projects'), params, {
                    preserveState: true,
                    replace: true,
                    onBefore: () => setIsTableLoading(true),
                    onFinish: () => setIsTableLoading(false),
                });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, companyFilter, dateRange, sortBy, sortDir]);

    const handleSort = (key) => {
        if (sortBy === key) {
            if (sortDir === 'asc') {
                setSortDir('desc');
            } else {
                // Reset to default
                setSortBy('created_at');
                setSortDir('desc');
            }
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
    };

    const confirmDelete = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
        setActiveActionId(null);
    };

    const handleDelete = () => {
        if (projectToDelete) {
            router.delete(route('projects.destroy', projectToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                },
            });
        }
    };

    const companies = [
        { label: 'Semua Perusahaan', value: 'All' },
        // Ideally companies should be passed as a prop for the filter
        // But for now we can extract from data if available or keep dummy if not crucial
        ...(projects.data || []).map(p => ({ label: p.company?.name, value: p.company?.id })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
    ];
    const statuses = [
        { label: 'Semua Status', value: 'All' },
        { label: 'Ongoing', value: 'Ongoing' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Completed', value: 'Completed' }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Projects" />

            <div className="">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-3">Project Management</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                            Monitoring & Kontrol Pengadaan
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ExportButton 
                            onExportExcel={() => console.log('Exporting Projects to Excel...')}
                            onExportPdf={() => console.log('Exporting Projects to PDF...')}
                        />
                        <Link 
                            href={route('projects.create')}
                            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all group active:scale-95"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
                            Input Proyek Baru
                        </Link>
                    </div>
                </div>

                {/* Summary Pills */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                    <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center size-12 bg-primary/10 dark:bg-blue-400/10 rounded-xl">
                            <span className="material-symbols-outlined text-2xl text-primary dark:text-blue-400">folder_open</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Project</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                {projects.total?.toLocaleString('id-ID') || 0}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center size-12 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl">
                            <span className="material-symbols-outlined text-2xl text-emerald-500">payments</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Nilai Kontrak</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(projects.data?.reduce((sum, p) => sum + (parseFloat(p.contract_value) || 0), 0) || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="relative z-50 bg-slate-50 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] p-6 mb-8 border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input 
                                type="text"
                                placeholder="Pencarian"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-bold placeholder:text-slate-400 dark:text-white"
                            />
                        </div>

                        {/* Status Filter */}
                        <SearchableSelect 
                            options={statuses}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            placeholder="Semua Status"
                        />

                        {/* Company Filter */}
                        <SearchableSelect 
                            options={companies}
                            value={companyFilter}
                            onChange={(val) => setCompanyFilter(val)}
                            placeholder="Semua Perusahaan"
                        />

                        {/* Filter Lanjutan Button */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowMoreFilters(!showMoreFilters)}
                                className={`w-full h-full px-6 py-4 flex items-center justify-center rounded-2xl transition-all border ${
                                    showMoreFilters 
                                    ? 'bg-primary/10 border-primary/30 text-primary dark:text-blue-400' 
                                    : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <span className="material-symbols-outlined font-bold mr-2 text-[20px]">tune</span>
                                <span className="text-xs font-black uppercase tracking-widest">Filter Lanjutan</span>
                                {(dateRange.start || dateRange.end) && (
                                    <span className="ml-2 size-2 rounded-full bg-primary dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                )}
                            </button>

                            {/* Advanced Filter Popover */}
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
                                                <button
                                                    onClick={() => setShowMoreFilters(false)}
                                                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-6 py-5 space-y-6">
                                            {/* Date Range */}
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Range Tanggal Jatuh Tempo</label>
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

                {/* Table Section */}
                <div className="bg-transparent md:bg-white dark:md:bg-white/5 md:rounded-[3rem] md:border border-slate-100 dark:border-white/5 md:shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        {/* Desktop Table View */}
                        <table className="hidden md:table w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
                                    <th 
                                        onClick={() => handleSort('progress')}
                                        className="pl-8 pr-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                            Progres
                                            <span className={`material-symbols-outlined text-sm transition-all ${sortBy === 'progress' ? 'text-primary scale-110' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                                                {sortBy === 'progress' && sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                            </span>
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                            Status
                                            <span className={`material-symbols-outlined text-sm transition-all ${sortBy === 'status' ? 'text-primary scale-110' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                                                {sortBy === 'status' && sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">Project & No. UP</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">Perusahaan</th>
                                    <th 
                                        onClick={() => handleSort('contract_value')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                            Nilai Kontrak
                                            <span className={`material-symbols-outlined text-sm transition-all ${sortBy === 'contract_value' ? 'text-primary scale-110' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                                                {sortBy === 'contract_value' && sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap">PIC</th>
                                    <th 
                                        onClick={() => handleSort('contract_date')}
                                        className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 whitespace-nowrap group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                            Tanggal Kontrak
                                            <span className={`material-symbols-outlined text-sm transition-all ${sortBy === 'contract_date' ? 'text-primary scale-110' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                                                {sortBy === 'contract_date' && sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {isTableLoading ? (
                                        <TableSkeleton columns={8} rows={10} />
                                    ) : (projects.data || []).length > 0 ? (
                                        (projects.data || []).map((project, index) => (
                                            <tr 
                                                key={project.id} 
                                                className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade ${
                                                    activeActionId === project.id ? 'relative z-50' : ''
                                                }`}
                                                style={{ animationDelay: `${index * 100 + 150}ms` }}
                                            >
                                                {/* Progres */}
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2 min-w-[120px]">
                                                        <div className="flex justify-between items-center text-[10px] font-black">
                                                            <span className="text-slate-400 uppercase tracking-widest">Progress</span>
                                                            <span className={project.progress === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{project.progress || 0}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-700 ${project.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                                style={{ width: `${project.progress || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                        project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20 shadow-lg shadow-emerald-500/5' :
                                                        project.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20 shadow-lg shadow-blue-500/5' :
                                                        project.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20 shadow-lg shadow-amber-500/5' :
                                                        'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 ring-slate-200/50 dark:ring-white/10'
                                                    }`}>
                                                        <span className={`material-symbols-outlined text-[13px] ${
                                                            project.status === 'Completed' ? 'font-fill' : ''
                                                        }`}>
                                                            {project.status === 'Completed' ? 'verified' :
                                                             project.status === 'Ongoing' ? 'sync' :
                                                             project.status === 'Pending' ? 'pause' :
                                                             'block'}
                                                        </span>
                                                        {project.status}
                                                    </div>
                                                </td>
                                                {/* Project Name & No. UP */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                                                            {project.name.split(' ').slice(0, 4).join(' ')}{project.name.split(' ').length > 4 ? '...' : ''}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-400 mt-1">{project.up_no}</span>
                                                    </div>
                                                </td>
                                                {/* Company */}
                                                <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{project.company?.name}</td>
                                                {/* Nilai Kontrak */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(project.contract_value)}</span>
                                                </td>
                                                {/* PIC */}
                                                <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{project.pic?.name}</td>
                                                {/* Tanggal Kontrak */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                            {project.contract_date ? new Date(project.contract_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit">
                                                            <span className="material-symbols-outlined text-[14px] text-amber-500">calendar_month</span>
                                                            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                                {project.due_date ? new Date(project.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Aksi */}
                                                <td className="px-6 py-6 text-right whitespace-nowrap">
                                                    <button 
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const dropdownHeight = 160; // Estimated height
                                                            const spaceBelow = window.innerHeight - rect.bottom;
                                                            
                                                            let topPos = rect.bottom + window.scrollY;
                                                            // If near bottom, open upwards
                                                            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                                                                topPos = rect.top + window.scrollY - dropdownHeight - 8;
                                                            }
                                                            
                                                            setActiveActionPos({ 
                                                                top: topPos, 
                                                                left: rect.left + window.scrollX - 145 // Adjust for width
                                                            });
                                                            setActiveActionId(activeActionId === project.id ? null : project.id);
                                                        }}
                                                        className={`p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors outline-none ${activeActionId === project.id ? 'text-primary' : 'text-slate-400'}`}
                                                    >
                                                        <span className="material-symbols-outlined">more_horiz</span>
                                                    </button>
                                                    
                                                    {activeActionId === project.id && createPortal(
                                                        <>
                                                            <div className="fixed inset-0 z-[9998]" onClick={() => setActiveActionId(null)}></div>
                                                            <div 
                                                                style={{ 
                                                                    position: 'absolute',
                                                                    top: `${activeActionPos.top + 8}px`,
                                                                    left: `${activeActionPos.left}px`,
                                                                }}
                                                                className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-2 z-[9999] animate-reveal-down text-left"
                                                            >
                                                                <Link 
                                                                    href={route('projects')} 
                                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg text-blue-400">visibility</span>
                                                                    Lihat Detail
                                                                </Link>
                                                                <Link 
                                                                    href={route('projects.edit', project.id)}
                                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg text-emerald-400">edit</span>
                                                                    Ubah Data
                                                                </Link>
                                                                <hr className="my-1 border-slate-100 dark:border-white/5" />
                                                                <button 
                                                                    onClick={() => confirmDelete(project)}
                                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-bold text-red-500 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </>,
                                                        document.body
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-8 py-20 text-center">
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
                                        <div className="space-y-2">
                                            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full w-full"></div>
                                            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full w-2/3"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (projects.data || []).length > 0 ? (
                                (projects.data || []).map((project, index) => (
                                    <div 
                                        key={project.id} 
                                        className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group animate-slide-up-fade"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Status Badge - Top Right */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                project.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' :
                                                project.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                'bg-slate-100 text-slate-500 dark:bg-white/5 ring-slate-200/50'
                                            }`}>
                                                {project.status}
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setActiveActionPos({ 
                                                        top: rect.bottom + window.scrollY, 
                                                        left: rect.left + window.scrollX - 145
                                                    });
                                                    setActiveActionId(activeActionId === project.id ? null : project.id);
                                                }}
                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">more_horiz</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-[11px] font-black text-slate-800 dark:text-white line-clamp-2 leading-tight uppercase italic tracking-tight">
                                                {project.name}
                                            </h4>
                                            <div className="flex flex-col gap-2 mt-1.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">No. UP</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight">{project.up_no || '-'}</span>
                                                </div>
                                                <div className="flex flex-col pt-2 border-t border-slate-50 dark:border-white/5">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">No. Kontrak</span>
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight break-all">{project.contract_no || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Progres</span>
                                                <span className={project.progress === 100 ? 'text-emerald-500' : 'text-primary'}>{project.progress || 0}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-700 ${project.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${project.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metas */}
                                        <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-50 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">business</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{project.company?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">payments</span>
                                                <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(project.contract_value)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[10px] text-slate-300">calendar_today</span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                                    {project.due_date ? new Date(project.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
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
                                        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">
                                            Showing <span className="font-black text-slate-900 dark:text-white">{projects.from || 0}</span> to <span className="font-black text-slate-900 dark:text-white">{projects.to || 0}</span> of <span className="font-black text-slate-900 dark:text-white">{projects.total || 0}</span> items
                                        </p>
                                        
                                        <Pagination links={projects.links} />
                                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-8">
                    <div className="flex items-center justify-center size-20 bg-red-500/10 rounded-full mx-auto mb-6">
                        <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
                    </div>
                    
                    <div className="text-center space-y-3">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase italic">Konfirmasi Hapus</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Apakah anda yakin ingin menghapus project <span className="text-slate-900 dark:text-white">{projectToDelete?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-10">
                        <SecondaryButton 
                            className="flex-1 justify-center py-4 rounded-2xl !text-[10px] !font-black !uppercase !tracking-[0.2em]" 
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <DangerButton 
                            className="flex-1 justify-center py-4 rounded-2xl shadow-xl shadow-red-500/20 !text-[10px] !font-black !uppercase !tracking-[0.2em]"
                            onClick={handleDelete}
                        >
                            Hapus Project
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes reveal-down {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-reveal-down {
                    animation: reveal-down 0.2s cubic-bezier(0, 0, 0.2, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                .dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.01); }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
                
                /* Keep header visible and styled during horizontal scroll */
                thead { position: sticky; top: 0; z-index: 20; }
                th { background-clip: padding-box; }
            `}} />
        </AuthenticatedLayout>
    );
}
