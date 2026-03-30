import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import SecondaryButton from '@/Components/SecondaryButton';

import Modal from '@/Components/Modal';

export default function Edit({ project, billing, auth_user, canEdit }) {
    // Props passed directly from BillingController
    const { data, setData, post, processing, errors } = useForm({
        ...billing,
        _method: 'put',
        new_files: [],
    });

    const [fileErrors, setFileErrors] = useState([]);
    const [activeTab, setActiveTab] = useState('bast');

    const progress = useMemo(() => {
        if (!data.billing_items.length) return 0;
        const completed = data.billing_items.filter(item => item.completed).length;
        return Math.round((completed / data.billing_items.length) * 100);
    }, [data.billing_items]);

    const handleAddBast = () => {
        setData('basts', [...data.basts, { no_bast: '', tgl_bast: '' }]);
    };

    const handleRemoveBast = (index) => {
        if (data.basts.length > 1) {
            const newBasts = [...data.basts];
            newBasts.splice(index, 1);
            setData('basts', newBasts);
        }
    };

    const handleBastChange = (index, field, value) => {
        const newBasts = [...data.basts];
        newBasts[index][field] = value;
        setData('basts', newBasts);
    };

    const handleAddBillingItem = () => {
        setData('billing_items', [...data.billing_items, { name: '', type: 'Pelunasan', completed: false }]);
    };

    const handleRemoveBillingItem = (index) => {
        if (data.billing_items.length > 1) {
            const newItems = [...data.billing_items];
            newItems.splice(index, 1);
            setData('billing_items', newItems);
        }
    };

    const handleBillingItemChange = (index, field, value) => {
        const newItems = [...data.billing_items];
        newItems[index][field] = value;
        setData('billing_items', newItems);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];

        let errors = [];
        let validFiles = [];

        selectedFiles.forEach(file => {
            if (file.size > MAX_SIZE) {
                errors.push(`${file.name}: Ukuran file melebihi 5MB.`);
            } else if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Tipe file tidak didukung (Gunakan PDF, Excel, atau Gambar).`);
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
        
        router.delete(route('billing.file.delete', attachmentId), {
            preserveScroll: true,
            onSuccess: () => {
                // Success feedback is handled by flash messages and redirects
            }
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) return 'picture_as_pdf';
        if (type.includes('spreadsheet') || type.includes('excel')) return 'description';
        if (type.includes('image')) return 'image';
        return 'insert_drive_file';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canEdit) return;

        post(route('billing.update', project.hashed_id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (page) => {
                setData(data => ({
                    ...data,
                    files: page.props.billing.files,
                    new_files: []
                }));
            }
        });
    };

    const statusOptions = [
        { id: 'Ongoing', icon: 'sync', color: 'blue' },
        { id: 'Pending', icon: 'pause', color: 'amber' },
        { id: 'Completed', icon: 'verified', color: 'emerald' },
    ];

    const typeOptions = ['Pelunasan', 'DP', 'Termin', '100%'];

    return (
        <AuthenticatedLayout
            backUrl={route('billing')}
            backLabel={canEdit ? "Edit Penagihan" : "Pratinjau Penagihan"}
            isReviewMode={!canEdit}
            stickySlot={
                <>
                    {/* Read-only Alert for non-authorized users */}
                    <div className="hidden xl:block">
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                                {project.project_status === 'Pending' ? 'Data tidak bisa diubah karena status Project sedang Pending' :
                                 project.project_status === 'Completed' ? 'Mode Pratinjau: Project telah Selesai (Completed). Data tidak dapat diubah.' :
                                 `Mode Pratinjau: Data ini sedang ditangani oleh user lain atau Anda tidak memiliki akses.`}
                            </p>
                        </div>
                    )}

                    <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Link 
                                    href={route('billing')}
                                    className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                        {canEdit ? 'Edit Penagihan' : 'Pertinjauan Penagihan'}
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
                                            disabled={!canEdit}
                                            onClick={() => setData('status', opt.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                data.status === opt.id
                                                    ? opt.id === 'Ongoing' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
                                                      opt.id === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                                                      'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                            } disabled:opacity-50`}
                                        >
                                            <span className={`material-symbols-outlined text-sm ${data.status === opt.id ? 'font-fill' : ''}`}>{opt.icon}</span>
                                            {opt.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 w-full lg:w-64">
                                <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Total Progress Penagihan</span>
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
                </div>
                </>
            }
        >
            <Head title={`Edit Penagihan - ${project.name}`} />

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

                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
                    {/* Tab Bar */}
                    <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto">
                        {[
                            { id: 'bast', label: 'Informasi BAST', icon: 'assignment_turned_in' },
                            { id: 'billing', label: 'Data Penagihan', icon: 'receipt_long' },
                            { id: 'attachments', label: 'Lampiran Penagihan', icon: 'upload_file' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-8 py-5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                                    activeTab === tab.id
                                    ? 'border-primary text-primary dark:text-blue-400 bg-primary/5'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* Tab Content */}
                        <div className="animate-reveal relative min-h-[300px]">
                    {/* Section 2: Data BAST */}
                    <div className={activeTab === 'bast' ? 'block animate-fade-in' : 'hidden'}>
                        <fieldset disabled={!canEdit} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        </div>
                        {canEdit && (
                            <button 
                                type="button"
                                onClick={handleAddBast}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all border border-amber-500/20"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Tambah BAST
                            </button>
                        )}
                    </div>

                    <div className="bg-white dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 rounded-tl-[2rem]">No</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. BAST</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal BAST</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24 rounded-tr-[2rem]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {data.basts.map((bast, index) => (
                                    <tr key={index} className="group hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-slate-400">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <input 
                                                type="text"
                                                value={bast.no_bast}
                                                onChange={e => handleBastChange(index, 'no_bast', e.target.value)}
                                                placeholder="Input Nomor BAST..."
                                                className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-blue-400 placeholder:text-slate-300 dark:placeholder:text-blue-900/40 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-blue-500/10 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <input 
                                                type="date"
                                                value={bast.tgl_bast}
                                                onChange={e => handleBastChange(index, 'tgl_bast', e.target.value)}
                                                className="px-4 py-2.5 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-blue-500/10 outline-none transition-all cursor-pointer dark:[color-scheme:dark]"
                                            />
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {canEdit && (
                                                <div className="relative group/tbast inline-block">
                                                    <button 
                                                        type="button"
                                                        disabled={data.basts.length === 1}
                                                        onClick={() => handleRemoveBast(index)}
                                                        className="size-8 rounded-lg flex items-center justify-center bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all disabled:opacity-30"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                    <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/tbast:opacity-100 group-hover/tbast:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-10">
                                                        Hapus BAST
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                        </fieldset>
                    </div>

                    {/* Section 3: Daftar Penagihan */}
                    <div className={activeTab === 'billing' ? 'block animate-fade-in' : 'hidden'}>
                        <fieldset disabled={!canEdit} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        </div>
                        {canEdit && (
                            <button 
                                type="button"
                                onClick={handleAddBillingItem}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Tambah Item
                            </button>
                        )}
                    </div>

                    <div className="bg-white dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 rounded-tl-[2rem]">No</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Penagihan</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Penagihan</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Selesai</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24 rounded-tr-[2rem]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {data.billing_items.map((item, index) => (
                                    <tr 
                                        key={index} 
                                        className="group hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors relative"
                                        style={{ zIndex: 10 + data.billing_items.length - index }}
                                    >
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-slate-400">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <input 
                                                type="text"
                                                value={item.name}
                                                required
                                                onChange={e => handleBillingItemChange(index, 'name', e.target.value)}
                                                placeholder="Nama Penagihan..."
                                                className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl text-sm font-bold text-slate-700 dark:text-blue-400 placeholder:text-slate-300 dark:placeholder:text-blue-900/40 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-blue-500/10 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="w-full">
                                                <SearchableSelect 
                                                    options={typeOptions}
                                                    value={item.type}
                                                    onChange={val => handleBillingItemChange(index, 'type', val)}
                                                    placeholder="Pilih Jenis..."
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button 
                                                type="button"
                                                disabled={!canEdit}
                                                onClick={() => handleBillingItemChange(index, 'completed', !item.completed)}
                                                className={`size-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                                    item.completed 
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                                    : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 opacity-80'
                                                } hover:scale-110 active:scale-95 disabled:opacity-50`}
                                            >
                                                <span className="material-symbols-outlined text-xl">
                                                    {item.completed ? 'check_circle' : 'cancel'}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {canEdit && (
                                                <div className="relative group/tbil inline-block">
                                                    <button 
                                                        type="button"
                                                        disabled={data.billing_items.length === 1}
                                                        onClick={() => handleRemoveBillingItem(index)}
                                                        className="size-8 rounded-lg flex items-center justify-center bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all disabled:opacity-30"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                    <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/tbil:opacity-100 group-hover/tbil:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-10">
                                                        Hapus Item
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                        </fieldset>
                    </div>

                    {/* Section 4: File Uploads */}
                    <div className={activeTab === 'attachments' ? 'block animate-fade-in' : 'hidden'}>
                        <fieldset disabled={!canEdit} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maksimal 5MB per file</div>
                    </div>

                    {/* Error Alerts */}
                    {(fileErrors.length > 0 || Object.keys(errors).filter(key => key.startsWith('new_files')).length > 0) && (
                        <div className="space-y-2">
                            {fileErrors.map((err, i) => (
                                <div key={i} className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-headshake">
                                    <span className="material-symbols-outlined text-rose-500 text-sm">error</span>
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{err}</span>
                                </div>
                            ))}
                            {Object.keys(errors).map((key, i) => (
                                key.startsWith('new_files') && (
                                    <div key={`backend-${i}`} className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-headshake">
                                        <span className="material-symbols-outlined text-rose-500 text-sm">error</span>
                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{errors[key]}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="relative group/upload">
                            <input 
                                type="file" 
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,.xlsx,.xls,image/*"
                            />
                            <div className="h-48 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 group-hover/upload:border-primary/50 group-hover/upload:bg-primary/5 transition-all">
                                <div className="size-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/upload:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Klik atau Tarik File ke Sini</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Excel, PDF, atau Gambar (Maks 5MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Existing Files */}
                            {billing.files?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Terunggah</p>
                                    <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {billing.files.map((file, idx) => (
                                            <div key={file.id} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between group/file animate-reveal">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                        <span className="material-symbols-outlined">{getFileIcon(file.type)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{file.name}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{formatFileSize(file.size)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a 
                                                        href={file.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                                                        title="Download/Lihat"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">download</span>
                                                    </a>
                                                    {canEdit && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleDeleteAttachment(file.id)}
                                                            className="size-8 rounded-lg text-rose-400 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover/file:opacity-100"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Files to be Uploaded */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Baru (Akan Diunggah)</p>
                                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {data.new_files.length === 0 ? (
                                        <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl opacity-30">
                                            <span className="material-symbols-outlined text-3xl text-slate-300">file_present</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Belum ada file baru</p>
                                        </div>
                                    ) : (
                                        data.new_files.map((file, idx) => (
                                            <div key={idx} className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between group/file animate-reveal">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined">{getFileIcon(file.type)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{file.name}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{formatFileSize(file.size)}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeNewFile(idx)}
                                                    className="size-8 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover/file:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                        </fieldset>
                    </div>
                </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10">
                            <span className="material-symbols-outlined text-slate-400">history</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengubah Terakhir</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-white">
                                {project.last_modifier || 'Belum ada data'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('billing')}
                            className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            {canEdit ? 'Batal' : 'Kembali'}
                        </Link>
                        {canEdit && (
                            <button 
                                type="submit"
                                disabled={processing}
                                className="px-10 py-4 bg-primary dark:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
            `}} />
        </AuthenticatedLayout>
    );
}
