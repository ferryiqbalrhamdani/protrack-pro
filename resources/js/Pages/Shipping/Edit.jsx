import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Edit({ project, shipping, auth_user, canEdit }) {
    const [activeTab, setActiveTab] = useState('shipping_info');
    const [fileErrors, setFileErrors] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        ...shipping,
        _method: 'put',
        new_files: [],
    });

    const progress = useMemo(() => {
        let total = 1; // shipping_date
        let filled = 0;
        
        if (data.shipping_date) filled++;
        
        // Count BA Anname
        data.ba_anname.forEach(row => {
            total += 2; 
            if (row.no) filled++;
            if (row.date) filled++;
        });
        
        // Count BA Inname
        data.ba_inname.forEach(row => {
            total += 2;
            if (row.no) filled++;
            if (row.date) filled++;
        });

        return Math.round((filled / total) * 100);
    }, [data.shipping_date, data.ba_anname, data.ba_inname]);

    const statusOptions = [
        { id: 'Ongoing', icon: 'sync', color: 'blue' },
        { id: 'Pending', icon: 'pause', color: 'amber' },
        { id: 'Completed', icon: 'verified', color: 'emerald' },
    ];

    const shippingTypeOptions = ['Lengkap', 'Bertahap'];

    // Handle Shipping Type Change - Reset BA rows if switched to Lengkap
    const handleShippingTypeChange = (val) => {
        setData(d => ({
            ...d,
            shipping_type: val,
            ba_anname: val === 'Lengkap' ? [{ no: '', date: '' }] : d.ba_anname,
            ba_inname: val === 'Lengkap' ? [{ no: '', date: '' }] : d.ba_inname,
        }));
    };

    const handleAddBARow = (field) => {
        if (data.shipping_type === 'Bertahap') {
            setData(field, [...data[field], { no: '', date: '' }]);
        }
    };

    const handleRemoveBARow = (field, index) => {
        if (data[field].length > 1) {
            const newRows = [...data[field]];
            newRows.splice(index, 1);
            setData(field, newRows);
        }
    };

    const handleBAChange = (field, index, subfield, value) => {
        const newRows = [...data[field]];
        newRows[index][subfield] = value;
        setData(field, newRows);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const errors = [];
        const validFiles = [];

        selectedFiles.forEach(file => {
            if (file.size > MAX_SIZE) {
                errors.push(`${file.name}: Ukuran file melebihi 5MB.`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setFileErrors(errors);
            setTimeout(() => setFileErrors([]), 5000);
        }

        setData('new_files', [...data.new_files, ...validFiles]);
    };

    const removeNewFile = (index) => {
        const newFiles = [...data.new_files];
        newFiles.splice(index, 1);
        setData('new_files', newFiles);
    };

    const handleDeleteAttachment = (attachmentId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus file ini secara permanen?')) return;
        
        router.delete(route('shipping.file.delete', attachmentId), {
            preserveScroll: true,
            onSuccess: () => {
                // Success feedback is handled by flash messages and redirects
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('shipping.update', project.hashed_id));
    };

    const getFileIcon = (type) => {
        if (!type) return 'description';
        if (type.includes('pdf')) return 'picture_as_pdf';
        if (type.includes('image')) return 'image';
        if (type.includes('spreadsheet') || type.includes('excel')) return 'table_view';
        return 'description';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout
            stickySlot={
                <>
                    {/* Read-only Alert for non-authorized users */}
                    {!canEdit && (
                        <div className={`border-b px-8 py-3 flex items-center justify-center gap-3 ${
                            project.project_status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            project.project_status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                            <span className="material-symbols-outlined shrink-0">
                                {project.project_status === 'Pending' ? 'pause_circle' : 
                                 project.project_status === 'Completed' ? 'verified' : 'lock'}
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                                <span>Mode Pratinjau:</span>
                                {project.project_status === 'Pending' || project.project_status === 'Completed' ? (
                                    <span className="opacity-90">Project ini berstatus {project.project_status}. Data tidak dapat diubah.</span>
                                ) : (
                                    <span className="opacity-90">Hanya PIC ({project.pic?.name}) atau Admin yang dapat mengubah data ini.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link 
                                href={route('shipping')}
                                className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                    {canEdit ? 'Edit Pengiriman' : 'Pertinjauan Pengiriman'}
                                </h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    {project.up_no}
                                    {project.project_status === 'Pending' && (
                                        <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[8px]">Project Pending</span>
                                    )}
                                    {project.project_status === 'Completed' && (
                                        <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px]">Project Selesai</span>
                                    )}
                                </p>
                            </div>

                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl ml-4">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => canEdit && setData('status', opt.id)}
                                        disabled={!canEdit}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            data.status === opt.id
                                                ? opt.id === 'Ongoing' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
                                                  opt.id === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                                                  'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                        } ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        <span className={`material-symbols-outlined text-sm ${data.status === opt.id ? 'font-fill' : ''}`}>{opt.icon}</span>
                                        {opt.id}
                                    </button>
                                ))}
                            </div>


                        </div>

                        <div className="flex flex-col items-end gap-2 w-full lg:w-64">
                            <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Total Progress Pengiriman</span>
                                <span className="text-primary dark:text-blue-400">{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    </div>
                </>
            }
        >
            <Head title={`${canEdit ? 'Edit' : 'Detail'} Pengiriman - ${project.name}`} />
            
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8 space-y-10 animate-reveal">
                
                {/* Section 1: Project Information */}
                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined text-xl">info</span>
                            </div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Informasi Project</h2>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Synced from Project</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-8 gap-x-12">
                        <div className="lg:col-span-3 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Pengadaan</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1 leading-relaxed">{project.name}</p>
                        </div>
                        <div className="lg:col-span-3 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Kontrak</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{project.contract_no || '—'}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Anggaran</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{project.budget_year}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. UP</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{project.up_no}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIC</p>
                            <div className="flex items-center gap-2 ml-1">
                                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                    {project.pic?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '??'}
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-white">{project.pic?.name || 'Belum Ditentukan'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Shipping Input Tabs */}
                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
                    {/* Tab Bar */}
                    <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto overflow-y-hidden custom-scrollbar">
                        {[
                            { id: 'shipping_info', label: 'Info Pengiriman', icon: 'local_shipping' },
                            { id: 'ba_documents', label: 'Dokumen BA', icon: 'assignment' },
                            { id: 'attachments', label: 'Lampiran', icon: 'upload_file' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-8 py-5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-white/5 text-primary dark:text-blue-400 border-primary dark:border-blue-400'
                                        : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.02]'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? 'font-fill' : ''}`}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* Tab 1: Info Pengiriman */}
                        {activeTab === 'shipping_info' && (
                            <div className="space-y-8 animate-reveal">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Pengiriman</label>
                                        <SearchableSelect 
                                            options={shippingTypeOptions}
                                            value={data.shipping_type}
                                            onChange={handleShippingTypeChange}
                                            placeholder="Pilih Jenis..."
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Pengiriman</label>
                                        <div className="relative group/input">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within/input:text-primary transition-colors">calendar_today</span>
                                            <input 
                                                type="date"
                                                value={data.shipping_date}
                                                onChange={e => setData('shipping_date', e.target.value)}
                                                disabled={!canEdit}
                                                className="w-full pl-12 pr-4 py-3 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-blue-500/10 outline-none transition-all dark:[color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Dokumen BA */}
                        {activeTab === 'ba_documents' && (
                            <div className="space-y-12 animate-reveal">
                                {/* BA Anname Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <span className="material-symbols-outlined text-lg">contract</span>
                                            </div>
                                            <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Berita Acara Anname</h3>
                                        </div>
                                        {canEdit && data.shipping_type === 'Bertahap' && (
                                            <button
                                                type="button"
                                                onClick={() => handleAddBARow('ba_anname')}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Tambah BA Anname
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-white/5">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 dark:bg-white/[0.02]">
                                                <tr className="border-b border-slate-100 dark:border-white/5">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">No</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. BA Anname</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal BA</th>
                                                    {data.shipping_type === 'Bertahap' && <th className="px-6 py-4 text-right w-24 border-b border-slate-100 dark:border-white/5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Aksi</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                                {data.ba_anname.map((row, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-5 text-xs font-black text-slate-400">{idx + 1}</td>
                                                        <td className="px-6 py-5">
                                                            <input 
                                                                type="text"
                                                                value={row.no}
                                                                onChange={e => handleBAChange('ba_anname', idx, 'no', e.target.value)}
                                                                placeholder="Input nomor..."
                                                                disabled={!canEdit}
                                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <input 
                                                                type="date"
                                                                value={row.date}
                                                                onChange={e => handleBAChange('ba_anname', idx, 'date', e.target.value)}
                                                                disabled={!canEdit}
                                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:[color-scheme:dark] disabled:opacity-50"
                                                            />
                                                        </td>
                                                        {canEdit && data.shipping_type === 'Bertahap' && (
                                                            <td className="px-6 py-5 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveBARow('ba_anname', idx)}
                                                                    className="size-9 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all group/btn relative"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                    <div className="absolute right-full mr-2 px-3 py-2 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-rose-500/20">
                                                                        Hapus Baris
                                                                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-rose-600"></div>
                                                                    </div>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* BA Inname Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <span className="material-symbols-outlined text-lg">fact_check</span>
                                            </div>
                                            <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Berita Acara Inname</h3>
                                        </div>
                                        {canEdit && data.shipping_type === 'Bertahap' && (
                                            <button
                                                type="button"
                                                onClick={() => handleAddBARow('ba_inname')}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Tambah BA Inname
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-white/5">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 dark:bg-white/[0.02]">
                                                <tr className="border-b border-slate-100 dark:border-white/5">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">No</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. BA Inname</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal BA</th>
                                                    {data.shipping_type === 'Bertahap' && <th className="px-6 py-4 text-right w-24 border-b border-slate-100 dark:border-white/5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Aksi</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                                {data.ba_inname.map((row, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-5 text-xs font-black text-slate-400">{idx + 1}</td>
                                                        <td className="px-6 py-5">
                                                            <input 
                                                                type="text"
                                                                value={row.no}
                                                                onChange={e => handleBAChange('ba_inname', idx, 'no', e.target.value)}
                                                                placeholder="Input nomor..."
                                                                disabled={!canEdit}
                                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <input 
                                                                type="date"
                                                                value={row.date}
                                                                onChange={e => handleBAChange('ba_inname', idx, 'date', e.target.value)}
                                                                disabled={!canEdit}
                                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:[color-scheme:dark] disabled:opacity-50"
                                                            />
                                                        </td>
                                                        {canEdit && data.shipping_type === 'Bertahap' && (
                                                            <td className="px-6 py-5 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveBARow('ba_inname', idx)}
                                                                    className="size-9 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all group/btn relative"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                    <div className="absolute right-full mr-2 px-3 py-2 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-rose-500/20">
                                                                        Hapus Baris
                                                                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-rose-600"></div>
                                                                    </div>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Lampiran */}
                        {activeTab === 'attachments' && (
                            <div className="space-y-8 animate-reveal">
                                {canEdit && (
                                    <div className="p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.01] flex flex-col items-center justify-center gap-6 relative group transition-all hover:bg-slate-100 dark:hover:bg-white/[0.02] hover:border-primary/30">
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2">Upload Lampiran Pengiriman</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Klik atau tarik file ke sini (Maks. 5MB per file)</p>
                                        </div>
                                    </div>
                                )}

                                {fileErrors.length > 0 && (
                                    <div className="space-y-2">
                                        {fileErrors.map((err, i) => (
                                            <div key={i} className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-reveal">
                                                <span className="material-symbols-outlined text-sm">error</span>
                                                {err}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Existing Files */}
                                    {data.files.map((file, idx) => (
                                        <div key={`existing-${file.id}`} className="flex items-center gap-4 p-4 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-2xl group/file hover:shadow-lg transition-all relative overflow-hidden">
                                            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-50"></div>
                                            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                <span className="material-symbols-outlined">{getFileIcon(file.type)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-700 dark:text-white truncate uppercase tracking-widest" title={file.name}>{file.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-1.5 py-0.5 bg-emerald-500/10 rounded-md">Tersimpan</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatFileSize(file.size)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition-all shrink-0">
                                                <a 
                                                    href={file.url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                                    title="Lihat File"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </a>
                                                <a 
                                                    href={file.url} 
                                                    download
                                                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                    title="Download File"
                                                >
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                </a>
                                                {canEdit && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteAttachment(file.id)}
                                                        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                        title="Hapus File"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* New Files */}
                                    {data.new_files.map((file, idx) => (
                                        <div key={`new-${idx}`} className="flex items-center gap-4 p-4 bg-white dark:bg-white/[0.03] border border-blue-200 dark:border-blue-500/30 rounded-2xl group/file hover:shadow-lg transition-all relative overflow-hidden">
                                            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                                <span className="material-symbols-outlined">{getFileIcon(file.type)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-700 dark:text-white truncate uppercase tracking-widest" title={file.name}>{file.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/10 rounded-md">Baru</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatFileSize(file.size)}</span>
                                                </div>
                                            </div>
                                            {canEdit && (
                                                <button 
                                                    type="button"
                                                    onClick={() => removeNewFile(idx)}
                                                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover/file:opacity-100 shrink-0"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Footer (Non-Sticky) */}
                <div className="mt-12 py-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
                    {/* Left: Last Modified Info */}
                    <div className="flex items-center gap-4">
                        <div className="size-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-xl">history</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengubah Terakhir</p>
                            <p className="text-xs font-black text-slate-700 dark:text-white mt-0.5">
                                {project.last_modifier || 'Belum ada modifikasi'}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-6">
                        <Link 
                            href={route('shipping')}
                            className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            {canEdit ? 'Batal' : 'Kembali'}
                        </Link>
                        {canEdit && (
                            <button 
                                type="submit"
                                disabled={processing}
                                className="px-10 py-5 bg-[#1e293b] dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
            `}} />
        </AuthenticatedLayout>
    );
}
