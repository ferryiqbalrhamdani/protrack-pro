import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Edit({ contract, auth_user, canEdit }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: contract.name || '',
        no_kontrak: contract.no_kontrak || '',
        up_no: contract.up_no || '',
        tahun_anggaran: contract.tahun_anggaran || '',
        status: contract.status || 'Ongoing',
        pic_name: contract.pic?.name || '',
        jamlak: contract.jamlak || '',
        jamlak_nominal: contract.jamlak_nominal || 0,
        jamuka: contract.jamuka || '',
        jamuka_nominal: contract.jamuka_nominal || 0,
        jamwar: contract.jamwar || '',
        jamwar_nominal: contract.jamwar_nominal || 0,
        steps: contract.steps?.length > 0 ? contract.steps : [
            { name: 'Usul Pesanan', completed: false },
            { name: 'Sprinada', completed: false },
            { name: 'Prakualifikasi', completed: false },
            { name: 'SPH', completed: false },
            { name: 'No Kontrak', completed: false },
        ],
        files: [],
    });

    const [fileErrors, setFileErrors] = useState([]);
    const [activeTab, setActiveTab] = useState(1);

    const formatIDR = (value) => {
        if (value === '' || value === null || value === undefined) return '';
        const num = parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('id-ID', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
        }).format(num);
    };

    const [jamlakDisplay, setJamlakDisplay] = useState(formatIDR(contract.jamlak_nominal) || '');
    const [jamukaDisplay, setJamukaDisplay] = useState(formatIDR(contract.jamuka_nominal) || '');
    const [jamwarDisplay, setJamwarDisplay] = useState(formatIDR(contract.jamwar_nominal) || '');

    const handleNominalChange = (field, displaySetter, val) => {
        let clean = val.replace(/\./g, '');
        clean = clean.replace(/[^\d,]/g, '');
        const parts = clean.split(',');
        if (parts.length > 2) clean = parts[0] + ',' + parts.slice(1).join('');
        
        const numericPart = parts[0];
        const decimalPart = parts[1] !== undefined ? ',' + parts[1] : '';
        
        const formattedNumeric = numericPart 
            ? new Intl.NumberFormat('id-ID').format(numericPart) 
            : '';
            
        displaySetter(formattedNumeric + decimalPart);
        
        const numericValue = clean.replace(',', '.');
        const parsed = parseFloat(numericValue);
        setData(field, isNaN(parsed) ? 0 : parsed);
    };

    const progress = useMemo(() => {
        if (!data.steps.length) return 0;
        const completed = data.steps.filter(s => s.completed).length;
        return Math.round((completed / data.steps.length) * 100);
    }, [data.steps]);

    const handleAddStep = () => {
        setData('steps', [...data.steps, { name: '', completed: false }]);
    };

    const handleRemoveStep = (index) => {
        if (data.steps.length > 1) {
            const newSteps = [...data.steps];
            newSteps.splice(index, 1);
            setData('steps', newSteps);
        }
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...data.steps];
        newSteps[index][field] = value;
        setData('steps', newSteps);
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
            // Auto hide errors after 5 seconds
            setTimeout(() => setFileErrors([]), 5000);
        }

        setData('files', [...data.files, ...validFiles]);
    };

    const removeFile = (index) => {
        const newFiles = [...data.files];
        newFiles.splice(index, 1);
        setData('files', newFiles);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (!type) return 'insert_drive_file';
        if (type.includes('pdf')) return 'picture_as_pdf';
        if (type.includes('spreadsheet') || type.includes('excel')) return 'description';
        if (type.includes('image')) return 'image';
        return 'insert_drive_file';
    };

    const handleDeleteAttachment = (attachmentId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus file ini secara permanen?')) return;
        
        router.delete(route('contracts.attachment.destroy', attachmentId), {
            preserveScroll: true,
            onSuccess: () => {
                // Flash message will handle the feedback
            }
        });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canEdit) return;

        post(route('contracts.update', contract.hashed_id), {
            forceFormData: true,
            onSuccess: () => {
                // Success feedback is handled by flash messages and redirects
            },
        });
    };

    const statusOptions = [
        { id: 'Ongoing', icon: 'sync', color: 'blue' },
        { id: 'Pending', icon: 'pause', color: 'amber' },
        { id: 'Completed', icon: 'verified', color: 'emerald' },
    ];

    return (
        <AuthenticatedLayout
            backUrl={route('contracts')}
            backLabel={canEdit ? "Edit Kontrak" : "Pratinjau Kontrak"}
            isReviewMode={!canEdit}
            bottomStickySlot={
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/5 flex gap-3 mx-auto max-w-sm">
                    <Link 
                        href={route('contracts')}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 size-12 rounded-[1.25rem] bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Batal</span>
                    </Link>
                    {canEdit && (
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="flex-[2] flex flex-col items-center justify-center gap-1.5 size-12 rounded-[1.25rem] bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Simpan</span>
                        </button>
                    )}
                </div>
            }
            stickySlot={
                <>
                    {/* Read-only Alert for non-authorized users or specific project statuses */}
                    <div className="hidden xl:block">
                    {!canEdit && (
                        <div className={`border-b px-8 py-3 flex items-center justify-center gap-3 ${
                            contract.project_status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            contract.project_status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                            <span className="material-symbols-outlined shrink-0">
                                {contract.project_status === 'Pending' ? 'pause_circle' : 
                                 contract.project_status === 'Completed' ? 'verified' : 'lock'}
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                                {contract.project_status === 'Pending' ? 'Data tidak bisa diubah karena status Project sedang Pending' :
                                 contract.project_status === 'Completed' ? 'Mode Pratinjau: Project telah Selesai (Completed). Data tidak dapat diubah.' :
                                 `Mode Pratinjau: Hanya ${contract.handle?.name || 'User Berwenang'} yang dapat mengubah data ini.`}
                            </p>
                        </div>
                    )}

                    {/* Sticky Progress Header */}
                    <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Link 
                                    href={route('contracts')}
                                    className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                        {canEdit ? 'Edit Kontrak' : 'Pertinjauan Kontrak'}
                                    </h1>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                        {contract.up_no} 
                                        {contract.project_status === 'Pending' && (
                                            <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[8px]">Project Pending</span>
                                        )}
                                        {contract.project_status === 'Completed' && (
                                            <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px]">Project Selesai</span>
                                        )}
                                    </p>
                                </div>

                                {/* Status Toggle Buttons */}
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
                                    <span className="text-slate-400">Total Progress</span>
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
            <Head title={`Edit - ${contract.name}`} />

            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8 space-y-10 animate-reveal">
                
                {/* Mobile Status Switcher */}
                <div className="xl:hidden bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl p-2 shadow-sm flex gap-1">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => setData('status', opt.id)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all relative ${
                                data.status === opt.id
                                    ? opt.id === 'Ongoing' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
                                      opt.id === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                                      'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50/50 dark:bg-white/[0.01]'
                            } disabled:opacity-50`}
                        >
                            <span className={`material-symbols-outlined text-[22px] ${data.status === opt.id ? 'font-fill' : ''}`}>{opt.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{opt.id}</span>
                            
                            {data.status === opt.id && (
                                <motion.div 
                                    layoutId="activeStatusEdit"
                                    className="absolute -bottom-1 size-1 bg-white rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
                
                {/* Section 1: Project Information */}
                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] p-5 md:p-8 shadow-sm">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-5 md:gap-y-8 gap-x-12">
                        <div className="lg:col-span-3 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Pengadaan</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1 leading-relaxed">{contract.name}</p>
                        </div>
                        <div className="lg:col-span-3 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Kontrak</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{contract.no_kontrak || '—'}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Anggaran</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{contract.tahun_anggaran}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. UP</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{contract.up_no}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIC</p>
                            <div className="flex items-center gap-2 ml-1">
                                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                    {contract.pic?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '??'}
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-white">{contract.pic?.name || 'Belum Ditentukan'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
                    {/* Tab Bar */}
                    <div className="grid grid-cols-3 md:flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] z-10 relative">
                        {[
                            { id: 1, label: 'Nomor Jaminan', icon: 'shield' },
                            { id: 2, label: 'Kontrak Project (Steps)', icon: 'account_tree' },
                            { id: 3, label: 'Lampiran File', icon: 'upload_file' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 py-3 md:py-5 px-1 md:px-8 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-center transition-all border-b-2 ${
                                    activeTab === tab.id 
                                    ? 'border-primary text-primary dark:text-blue-400 bg-primary/5' 
                                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px] md:text-lg">{tab.icon}</span>
                                <span className="leading-tight">{tab.label.replace(' (Steps)', '').replace(' Projekt', '')}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-5 md:p-8">
                        {activeTab === 1 && (
                            <fieldset disabled={!canEdit} className="space-y-6 animate-reveal">
                                <div className="grid grid-cols-1 gap-8 animate-reveal">
                                    {/* JAMLAK SECTION */}
                                    <div className="bg-white dark:bg-white/[0.02] p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-5 md:space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <span className="material-symbols-outlined text-xl">verified_user</span>
                                            </div>
                                            <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Jaminan Pelaksanaan (JAMLAK)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor JAMLAK</label>
                                                <input 
                                                    type="text"
                                                    value={data.jamlak}
                                                    placeholder="Input Nomor..."
                                                    onChange={e => setData('jamlak', e.target.value)}
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white font-bold text-amber-600 dark:text-amber-400 disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nominal JAMLAK</label>
                                                <div className="relative group">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-black">Rp</span>
                                                    <input 
                                                        type="text"
                                                        value={jamlakDisplay}
                                                        placeholder="0"
                                                        onChange={e => handleNominalChange('jamlak_nominal', setJamlakDisplay, e.target.value)}
                                                        onBlur={() => setJamlakDisplay(formatIDR(data.jamlak_nominal) || '0')}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all dark:text-white font-black text-xl disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* JAMUKA SECTION */}
                                    <div className="bg-white dark:bg-white/[0.02] p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-5 md:space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined text-xl">payments</span>
                                            </div>
                                            <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Jaminan Uang Muka (JAMUKA)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor JAMUKA</label>
                                                <input 
                                                    type="text"
                                                    value={data.jamuka}
                                                    placeholder="Input Nomor..."
                                                    onChange={e => setData('jamuka', e.target.value)}
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-bold text-blue-600 dark:text-blue-400 disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nominal JAMUKA</label>
                                                <div className="relative group">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-black">Rp</span>
                                                    <input 
                                                        type="text"
                                                        value={jamukaDisplay}
                                                        placeholder="0"
                                                        onChange={e => handleNominalChange('jamuka_nominal', setJamukaDisplay, e.target.value)}
                                                        onBlur={() => setJamukaDisplay(formatIDR(data.jamuka_nominal) || '0')}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-black text-xl disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* JAMWAR SECTION */}
                                    <div className="bg-white dark:bg-white/[0.02] p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-5 md:space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <span className="material-symbols-outlined text-xl">handyman</span>
                                            </div>
                                            <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Jaminan Pemeliharaan (JAMWAR)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor JAMWAR</label>
                                                <input 
                                                    type="text"
                                                    value={data.jamwar}
                                                    placeholder="Input Nomor..."
                                                    onChange={e => setData('jamwar', e.target.value)}
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white font-bold text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nominal JAMWAR</label>
                                                <div className="relative group">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-black">Rp</span>
                                                    <input 
                                                        type="text"
                                                        value={jamwarDisplay}
                                                        placeholder="0"
                                                        onChange={e => handleNominalChange('jamwar_nominal', setJamwarDisplay, e.target.value)}
                                                        onBlur={() => setJamwarDisplay(formatIDR(data.jamwar_nominal) || '0')}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white font-black text-xl disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        )}

                        {activeTab === 2 && (
                            <fieldset disabled={!canEdit} className="space-y-6 animate-reveal">
                                <div className="flex items-center justify-between">
                                    {canEdit && (
                                        <button 
                                            type="button"
                                            onClick={handleAddStep}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Tambah Tahap
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Mobile Card Layout */}
                                    <div className="md:hidden space-y-4">
                                        {data.steps.map((step, index) => (
                                            <div key={index} className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl p-5 space-y-4 shadow-sm group animate-reveal">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/5">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tahapan</span>
                                                    </div>
                                                    {canEdit && (
                                                        <button 
                                                            type="button"
                                                            disabled={data.steps.length === 1}
                                                            onClick={() => handleRemoveStep(index)}
                                                            className="size-8 rounded-xl bg-rose-500/5 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Tahapan</label>
                                                        <input 
                                                            type="text"
                                                            value={step.name}
                                                            onChange={e => handleStepChange(index, 'name', e.target.value)}
                                                            placeholder="Nama Tahapan..."
                                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-50"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 dark:border-white/5 px-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai?</span>
                                                        <button 
                                                            type="button"
                                                            disabled={!canEdit}
                                                            onClick={() => handleStepChange(index, 'completed', !step.completed)}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all ${
                                                                step.completed 
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10'
                                                            } disabled:opacity-50 font-black text-[10px] uppercase tracking-widest`}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">
                                                                {step.completed ? 'check_circle' : 'circle'}
                                                            </span>
                                                            {step.completed ? 'SELESAI' : 'BELUM'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table Layout */}
                                    <div className="hidden md:block bg-white dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                                        <table className="w-full text-left border-separate border-spacing-0">
                                            <thead>
                                                <tr>
                                                    <th className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">No</th>
                                                    <th className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Tahapan</th>
                                                    <th className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Status</th>
                                                    <th className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.steps.map((step, index) => (
                                                    <tr key={index} className="group">
                                                        <td className={`px-8 py-5 group-hover:bg-slate-50/30 dark:group-hover:bg-white/[0.01] transition-colors border-b border-slate-50 dark:border-white/5 ${index === data.steps.length - 1 ? 'border-b-0' : ''}`}>
                                                            <span className="text-xs font-black text-slate-400">{index + 1}</span>
                                                        </td>
                                                        <td className={`px-6 py-5 group-hover:bg-slate-50/30 dark:group-hover:bg-white/[0.01] transition-colors border-b border-slate-50 dark:border-white/5 ${index === data.steps.length - 1 ? 'border-b-0' : ''}`}>
                                                            <input 
                                                                type="text"
                                                                value={step.name}
                                                                onChange={e => handleStepChange(index, 'name', e.target.value)}
                                                                placeholder="Nama Tahapan..."
                                                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-50"
                                                            />
                                                        </td>
                                                        <td className={`px-6 py-5 text-center group-hover:bg-slate-50/30 dark:group-hover:bg-white/[0.01] transition-colors border-b border-slate-50 dark:border-white/5 ${index === data.steps.length - 1 ? 'border-b-0' : ''}`}>
                                                            <button 
                                                                type="button"
                                                                disabled={!canEdit}
                                                                onClick={() => handleStepChange(index, 'completed', !step.completed)}
                                                                className={`size-8 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                                                    step.completed 
                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' 
                                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 hover:text-slate-400'
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                <span className="material-symbols-outlined text-lg font-black">
                                                                    {step.completed ? 'check' : 'close'}
                                                                </span>
                                                            </button>
                                                        </td>
                                                        <td className={`px-8 py-5 text-right group-hover:bg-slate-50/30 dark:group-hover:bg-white/[0.01] transition-colors border-b border-slate-50 dark:border-white/5 ${index === data.steps.length - 1 ? 'border-b-0' : ''}`}>
                                                            {canEdit && (
                                                                <div className="relative group/tooltip inline-block">
                                                                    <button 
                                                                        type="button"
                                                                        disabled={data.steps.length === 1}
                                                                        onClick={() => handleRemoveStep(index)}
                                                                        className="size-8 rounded-lg bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                                    </button>
                                                                    <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-1 transition-all duration-300 whitespace-nowrap shadow-xl shadow-rose-500/20 z-50">
                                                                        Hapus Tahapan
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
                                </div>
                            </fieldset>
                        )}

                        {activeTab === 3 && (
                            <fieldset disabled={!canEdit} className="space-y-6 animate-reveal">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maksimal 5MB per file</div>
                                </div>

                                {/* Error Alerts */}
                                {fileErrors.length > 0 && (
                                    <div className="space-y-2">
                                        {fileErrors.map((err, i) => (
                                            <div key={i} className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-headshake">
                                                <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">{err}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Dropzone */}
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

                                    {/* File List */}
                                    <div className="space-y-6">
                                        {/* Existing Files */}
                                        {contract.attachments?.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Terunggah</p>
                                                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                                    {contract.attachments.map((file, idx) => (
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
                                                {data.files.length === 0 ? (
                                                    <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl opacity-30">
                                                        <span className="material-symbols-outlined text-3xl text-slate-300">file_present</span>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Belum ada file baru</p>
                                                    </div>
                                                ) : (
                                                    data.files.map((file, idx) => (
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
                                                                onClick={() => removeFile(idx)}
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
                        )}
                    </div>
                </div>

                {/* Footer Actions (Hidden on Mobile due to sticky menu) */}
                <div className="hidden xl:flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10">
                            <span className="material-symbols-outlined text-slate-400">history</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengubah Terakhir</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-white">{contract.last_modifier?.name || 'Belum ada data'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('contracts')}
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
        </AuthenticatedLayout>
    );
}
