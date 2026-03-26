import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ProjectDetail({ project }) {
    // State for tabs
    const [activeDetailTab, setActiveDetailTab] = useState(1);
    
    // State for collapsible relation modules
    const [openModules, setOpenModules] = useState({
        contract: false,
        merchandiser: false, 
        billing: false,
        shipping: false
    });

    const toggleModule = (module) => {
        setOpenModules(prev => ({
            ...prev,
            [module]: !prev[module]
        }));
    };

    // Helper component for "Natural View" data points
    const DataPoint = ({ label, value, icon, fullWidth = false, color = "primary" }) => (
        <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''} group`}>
            <div className="flex items-center gap-2">
                {icon && <span className="material-symbols-outlined text-[14px] text-slate-400 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors opacity-60 group-hover:opacity-100">{icon}</span>}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
            </div>
            <div>
                <p className={`text-sm font-bold leading-relaxed ${
                    color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 
                    color === 'rose' ? 'text-rose-600 dark:text-rose-400' : 
                    color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                    'text-slate-800 dark:text-slate-200'
                }`}>
                    {value || 'N/A'}
                </p>
            </div>
        </div>
    );

    const tabs = [
        { id: 1, label: 'Info Proyek', icon: 'info' },
        { id: 2, label: 'Legalitas & Detail', icon: 'gavel' },
        { id: 3, label: 'Kontrak & Finansial', icon: 'payments' }
    ];

    return (
        <AuthenticatedLayout
            stickySlot={
                <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Link 
                                    href={route('reports.project')}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                                            Project {project.proj}
                                        </h1>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                            project.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                            project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Laporan Detail & Keterhubungan Modul</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                                <div className="flex flex-col items-end gap-2 w-full lg:w-64">
                                    <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Progress Project</span>
                                        <span className="text-primary dark:text-blue-400">{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <a 
                                        href={route('reports.project.print', { hashedId: project.id })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-5 rounded-2xl bg-white dark:bg-white/5 text-sm font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">print</span>
                                        Cetak
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Detail Project - ${project.name}`} />

            <div className="py-8">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    
                    {/* Information Section */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm overflow-hidden p-2">
                        <div className="flex justify-center sm:justify-start">
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-3xl m-4 w-fit">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveDetailTab(tab.id)}
                                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                            activeDetailTab === tab.id
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-sm ${activeDetailTab === tab.id ? 'font-fill' : ''}`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 pt-2">
                            {activeDetailTab === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12 animate-reveal">
                                    <DataPoint label="Nama Pengadaan" value={project.name} fullWidth />
                                    <DataPoint label="No. UP" value={project.up} color="blue" />
                                    <DataPoint label="Jenis Lelang" value={project.auctionType} />
                                    <DataPoint label="Instansi" value={project.institution} />
                                    <DataPoint label="Perusahaan" value={project.company} />
                                    <DataPoint label="Jenis Anggaran" value={project.budgetType} />
                                    <DataPoint label="Tahun Anggaran" value={project.budgetYear} />
                                    <div className="col-span-full space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendor Pelaksana</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {project.vendors.map((vendor, i) => (
                                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{vendor}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-full space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deskripsi Pekerjaan</p>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl p-5 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeDetailTab === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 animate-reveal">
                                    <DataPoint label="Status Bebas Pajak" value={project.taxFree} />
                                    <DataPoint label="Dokumen Pajak" value={project.taxDoc} />
                                    <DataPoint label="Asal Brand" value={project.brandOrigin} />
                                    <DataPoint label="Garansi Unit" value={project.warranty} />
                                    <div className="col-span-full space-y-4 pt-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sertifikasi Produk</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {project.certificates.map((cert, i) => (
                                                <div key={i} className="flex items-center gap-3 p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <span className="material-symbols-outlined text-sm font-fill">check_circle</span>
                                                    </div>
                                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{cert}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-full pt-4">
                                        <DataPoint label="Sistem Pembayaran (Payment Term)" value={project.paymentTerm} />
                                    </div>
                                </div>
                            )}

                            {activeDetailTab === 3 && (
                                <div className="space-y-12 animate-reveal">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
                                        <div className="lg:col-span-2">
                                            <DataPoint label="Nomor Kontrak" value={project.contractNo} />
                                        </div>
                                        <DataPoint label="Total Nilai Kontrak" value={project.value} color="emerald" />
                                        <DataPoint label="Tanggal Kontrak" value={project.contractDate} />
                                        <DataPoint label="Tenggat Waktu (Deadline)" value={project.dueDate} color="rose" />
                                    </div>

                                    {(!project.paymentTerm || project.paymentTerm === 'Termin Berjangka') && project.installments?.length > 0 ? (
                                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                                                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                    </div>
                                                    <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                                                        Rincian Pembagian Termin
                                                    </h4>
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full">
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase">Total: 100%</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {project.installments.map((inst, idx) => (
                                                    <div key={inst.id} className="relative p-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] group hover:border-slate-200 transition-all">
                                                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="space-y-4 pt-2">
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{inst.name}</p>
                                                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{inst.value}</p>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${inst.percentage}%` }}></div>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                                                                <span>Persentase</span>
                                                                <span>{inst.percentage}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : project.paymentTerm === 'DP 20%' ? (
                                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                            <div className="p-10 bg-gradient-to-br from-primary/5 to-transparent dark:from-blue-400/5 backdrop-blur-sm rounded-[2rem] border-2 border-primary/20 border-dashed animate-tab-content flex flex-col items-center gap-8 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                                                <div className="text-center space-y-2 z-10">
                                                    <div className="flex items-center justify-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <span className="material-symbols-outlined text-[20px]">percent</span>
                                                        </div>
                                                        <h4 className="text-[12px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">Rincian Pembayaran DP</h4>
                                                    </div>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Down Payment</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Sistem mencatat termin penagihan DP sebesar <span className="text-primary dark:text-blue-400 font-bold">20%</span> dari total nilai kontrak.</p>
                                                </div>
                                                <div className="px-12 py-6 bg-white dark:bg-white/5 rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 group-hover:scale-105 transition-transform duration-500 z-10 w-full max-w-md">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Nilai DP</p>
                                                    <p className="text-4xl font-black text-primary dark:text-blue-400 tracking-tighter tabular-nums text-center">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((parseInt(project.value.replace(/[^0-9]/g, '')) || 0) * 0.2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Metode Pembayaran</h4>
                                            </div>
                                            <div className="p-8 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:to-fuchsia-500/10 border border-purple-500/10 rounded-[2rem] shadow-sm relative overflow-hidden">
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-purple-600/70 dark:text-purple-400/70 uppercase tracking-widest mb-2">Jenis Pembayaran</p>
                                                        <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{project.paymentTerm || 'Pembayaran Langsung (Pelunasan / Tidak ada DP)'}</p>
                                                        <p className="text-xs font-medium text-slate-500 mt-2 max-w-md">Nilai kontrak dibayarkan sekaligus sesuai dengan metode pembayaran langsung.</p>
                                                    </div>
                                                    <div className="text-left md:text-right p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-500/20 shadow-sm">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dibayarkan</p>
                                                        <p className="text-2xl font-black text-emerald-500">{project.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Extended Relations Section (Full Width Stack) */}
                    <div className="space-y-8 pt-6">
                        <div className="flex items-center gap-3 px-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-[24px]">hub</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Relasi & Keterhubungan Modul</h3>
                        </div>
                        
                        <div className="flex flex-col gap-8 px-4">
                            {/* 1. CONTRACT MODULE */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                                <div 
                                    className="p-8 cursor-pointer group flex items-center justify-between"
                                    onClick={() => toggleModule('contract')}
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-4xl">draft</span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-center pr-6">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-800 dark:text-white tracking-tight text-xl">Modul Kontrak</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Handler: {project.relations.contract.userHandle || 'N/A'}</p>
                                                </div>
                                                <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-lg">{project.relations.contract.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ width: `${project.relations.contract.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-all ${openModules.contract ? 'rotate-180 text-primary dark:text-blue-400 bg-primary/5' : ''}`}>
                                        <span className="material-symbols-outlined text-3xl">expand_more</span>
                                    </div>
                                </div>
                                {openModules.contract && (
                                    <div className="px-10 pb-10 pt-2 animate-reveal">
                                        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                                {/* JAMLAK */}
                                                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group/jamlak relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[5rem] -z-10 group-hover/jamlak:scale-110 transition-transform"></div>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <span className="material-symbols-outlined text-lg">verified</span>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5">JAMLAK</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Jaminan Pelaksanaan</p>
                                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate pr-4">{project.relations.contract.jamlak !== '-' ? project.relations.contract.jamlak : 'BELUM ADA'}</p>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nilai Jaminan</p>
                                                        <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                                                            Rp {new Intl.NumberFormat('id-ID').format(project.relations.contract.jamlakValue || 0)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* JAMUK */}
                                                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group/jamuk relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[5rem] -z-10 group-hover/jamuk:scale-110 transition-transform"></div>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <span className="material-symbols-outlined text-lg">payments</span>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5">JAMUK</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Jaminan Uang Muka</p>
                                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate pr-4">{project.relations.contract.jamuk !== '-' ? project.relations.contract.jamuk : 'BELUM ADA'}</p>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nilai Jaminan</p>
                                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                            Rp {new Intl.NumberFormat('id-ID').format(project.relations.contract.jamukValue || 0)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* JAMWAR */}
                                                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group/jamwar relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[5rem] -z-10 group-hover/jamwar:scale-110 transition-transform"></div>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                            <span className="material-symbols-outlined text-lg">health_and_safety</span>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5">JAMWAR</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Jaminan Pemeliharaan</p>
                                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate pr-4">{project.relations.contract.jamwar !== '-' ? project.relations.contract.jamwar : 'BELUM ADA'}</p>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nilai Jaminan</p>
                                                        <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                                                            Rp {new Intl.NumberFormat('id-ID').format(project.relations.contract.jamwarValue || 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10 overflow-hidden mb-10 shadow-sm">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/10">
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Tahapan</th>
                                                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {project.relations.contract.stages && project.relations.contract.stages.length > 0 ? (
                                                            project.relations.contract.stages.map((stage) => (
                                                                <tr key={stage.id} className="border-b border-slate-50 dark:border-white/[0.02] last:border-0 hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                                                    <td className="px-8 py-6 text-sm font-black text-slate-400">{stage.id}</td>
                                                                    <td className="px-8 py-6 text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{stage.name}</td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex justify-center">
                                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                                                                                stage.completed 
                                                                                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                                                                : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 shadow-none'
                                                                            }`}>
                                                                                <span className="material-symbols-outlined text-[20px] font-bold">
                                                                                    {stage.completed ? 'check' : 'close'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3" className="px-8 py-10 text-center">
                                                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                                        <span className="material-symbols-outlined text-3xl opacity-20">draft</span>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data Tahapan</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {project.relations.contract.files && project.relations.contract.files.length > 0 && (
                                                <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
                                                    {project.relations.contract.files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-blue-500/20 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                                    <span className="material-symbols-outlined">description</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{file.name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400">Dokumen Kontrak / Jaminan</p>
                                                                </div>
                                                            </div>
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                                                                <span className="material-symbols-outlined text-sm">download</span>
                                                                Download
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. MERCHANDISER MODULE */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                                <div 
                                    className="p-8 cursor-pointer group flex items-center justify-between"
                                    onClick={() => toggleModule('merchandiser')}
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-center pr-6">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-800 dark:text-white tracking-tight text-xl">Modul Merchandiser</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PIC: {project.relations.merchandiser.userPIC || 'N/A'}</p>
                                                </div>
                                                <span className="text-[12px] font-black text-amber-500 uppercase tracking-[0.2em] bg-amber-500/10 px-3 py-1 rounded-lg">{project.relations.merchandiser.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)]" style={{ width: `${project.relations.merchandiser.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-all ${openModules.merchandiser ? 'rotate-180 text-amber-600 dark:text-amber-400 bg-amber-500/5' : ''}`}>
                                        <span className="material-symbols-outlined text-3xl">expand_more</span>
                                    </div>
                                </div>
                                {openModules.merchandiser && (
                                    <div className="px-10 pb-10 pt-2 animate-reveal">
                                        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                                                    <div className="md:col-span-3 pb-2 border-b border-slate-50 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                                <span className="material-symbols-outlined text-sm">payments</span>
                                                            </div>
                                                            <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Data Pembayaran</h5>
                                                        </div>
                                                    </div>
                                                    <DataPoint label="Atas Nama" value={project.relations.merchandiser.paymentName} />
                                                    <DataPoint label="Nama Bank" value={project.relations.merchandiser.paymentBank} />
                                                    <DataPoint label="Nomor Rekening" value={project.relations.merchandiser.paymentAccount} />
                                                </div>
                                                <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 space-y-4">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">contract</span> Barang di Kontrak
                                                    </p>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-2xl font-black text-slate-800 dark:text-white">{new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.contractItems)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Total Items</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-primary dark:text-blue-400">{new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.contractEA)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Total EA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05] rounded-3xl border border-emerald-500/10 space-y-4">
                                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">inventory</span> Barang di Terima
                                                    </p>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-2xl font-black text-slate-800 dark:text-white">{new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.receivedItems)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Total Items</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.receivedEA)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Total EA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {project.relations.merchandiser.pos && project.relations.merchandiser.pos.length > 0 && (
                                                    <div className="col-span-full space-y-4 pt-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                                <span className="material-symbols-outlined text-sm font-fill">receipt_long</span>
                                                            </div>
                                                            <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Data PO (Purchase Order) & Invoice</h5>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {project.relations.merchandiser.pos.map((po) => (
                                                                <div key={po.id} className="p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm hover:shadow-md transition-shadow group/po">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">PO #{po.po_number}</span>
                                                                        <span className="text-[10px] font-bold text-slate-400"><span className="text-amber-500 dark:text-amber-400 font-black">{new Intl.NumberFormat('id-ID').format(po.items)}</span> Items ({new Intl.NumberFormat('id-ID').format(po.ea)} EA)</span>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vendor</p>
                                                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{po.vendor_name || '-'}</p>
                                                                        </div>
                                                                        {po.invoices && po.invoices.length > 0 && (
                                                                            <div className="space-y-2 pt-3 border-t border-slate-50 dark:border-white/5">
                                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Invoices</p>
                                                                                {po.invoices.map(inv => (
                                                                                    <div key={inv.id} className="flex justify-between items-center px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                                                        <div>
                                                                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{inv.invoice_number}</p>
                                                                                            <p className="text-[8px] text-slate-400">{inv.date}</p>
                                                                                        </div>
                                                                                        <div className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                                                                                            inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-600'
                                                                                        }`}>
                                                                                            {inv.status}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {project.relations.merchandiser.files && project.relations.merchandiser.files.length > 0 && (
                                                    <div className="col-span-full pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
                                                        {project.relations.merchandiser.files.map((file, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-amber-500/20 transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                                        <span className="material-symbols-outlined">table_chart</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{file.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400">Data PO & Faktur</p>
                                                                    </div>
                                                                </div>
                                                                <a href={file.url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                                    Download
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. BILLING MODULE */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                                <div 
                                    className="p-8 cursor-pointer group flex items-center justify-between"
                                    onClick={() => toggleModule('billing')}
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-4xl">payments</span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-center pr-6">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-800 dark:text-white tracking-tight text-xl">Modul Penagihan</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Handler: {project.relations.billing.userHandle || 'N/A'}</p>
                                                </div>
                                                <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-lg">{project.relations.billing.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]" style={{ width: `${project.relations.billing.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-all ${openModules.billing ? 'rotate-180 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : ''}`}>
                                        <span className="material-symbols-outlined text-3xl">expand_more</span>
                                    </div>
                                </div>
                                {openModules.billing && (
                                    <div className="px-10 pb-10 pt-2 animate-reveal">
                                        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                                            
                                            {/* Multiple BAST Section */}
                                            <div className="mb-10 space-y-4">
                                                <div className="flex items-center gap-3 ml-4">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <span className="material-symbols-outlined text-sm font-fill">verified</span>
                                                    </div>
                                                    <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Data BAST (Berita Acara Serah Terima)</h5>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {project.relations.billing.basts && project.relations.billing.basts.length > 0 ? (
                                                        project.relations.billing.basts.map((bast) => (
                                                            <div key={bast.id} className="p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm hover:shadow-md transition-shadow group/bast">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">BAST #{bast.id}</span>
                                                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-sm group-hover/bast:text-emerald-500 transition-colors">description</span>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nomor BAST</p>
                                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{bast.no}</p>
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tanggal BAST</p>
                                                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{bast.date}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full p-8 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                                                            <span className="material-symbols-outlined text-3xl opacity-20">verified</span>
                                                            <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data BAST</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Detailed Billing Table (Natural View) */}
                                            <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10 overflow-hidden mb-10 shadow-sm">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/10">
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">No</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Penagihan</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Penagihan</th>
                                                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {project.relations.billing.stages && project.relations.billing.stages.length > 0 ? (
                                                            project.relations.billing.stages.map((stage) => (
                                                                <tr key={stage.id} className="border-b border-slate-50 dark:border-white/[0.02] last:border-0 hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                                                    <td className="px-8 py-6 text-sm font-black text-slate-400">{stage.id}</td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-2 h-2 rounded-full bg-blue-500/40"></div>
                                                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{stage.name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stage.type}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex justify-center">
                                                                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                                                                stage.completed 
                                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                            }`}>
                                                                                <span className="material-symbols-outlined text-[14px]">
                                                                                    {stage.completed ? 'check_circle' : 'pending'}
                                                                                </span>
                                                                                {stage.completed ? 'Selesai' : 'Tertunda'}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="px-8 py-10 text-center">
                                                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                                        <span className="material-symbols-outlined text-3xl opacity-20">receipt_long</span>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data Penagihan</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {project.relations.billing.files && project.relations.billing.files.length > 0 && (
                                                <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
                                                    {project.relations.billing.files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-emerald-500/20 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                                    <span className="material-symbols-outlined">description</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{file.name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400">Dokumen Penagihan / Invoice</p>
                                                                </div>
                                                            </div>
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                                                                <span className="material-symbols-outlined text-sm">download</span>
                                                                Download
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4. SHIPPING MODULE */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                                <div 
                                    className="p-8 cursor-pointer group flex items-center justify-between"
                                    onClick={() => toggleModule('shipping')}
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-4xl">local_shipping</span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-center pr-6">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-800 dark:text-white tracking-tight text-xl">Modul Pengiriman</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Handler: {project.relations.shipping.userHandle || 'N/A'}</p>
                                                </div>
                                                <span className="text-[12px] font-black text-purple-500 uppercase tracking-[0.2em] bg-purple-500/10 px-3 py-1 rounded-lg">{project.relations.shipping.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]" style={{ width: `${project.relations.shipping.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-all ${openModules.shipping ? 'rotate-180 text-purple-600 dark:text-purple-400 bg-purple-500/5' : ''}`}>
                                        <span className="material-symbols-outlined text-3xl">expand_more</span>
                                    </div>
                                </div>
                                {openModules.shipping && (
                                    <div className="px-10 pb-10 pt-2 animate-reveal">
                                        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-10">
                                                <DataPoint label="Jenis Pengiriman" value={project.relations.shipping.type} />
                                                <DataPoint label="Tanggal Awal Pengiriman" value={project.relations.shipping.date} />
                                            </div>
                                                
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                                                {/* BA Anname Section */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 ml-2">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <span className="material-symbols-outlined text-sm font-fill">assignment</span>
                                                        </div>
                                                        <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">BA Anname (Asal)</h5>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {project.relations.shipping.baAnnames && project.relations.shipping.baAnnames.length > 0 ? (
                                                            project.relations.shipping.baAnnames.map((ba) => (
                                                                <div key={ba.id} className="p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm flex items-center justify-between group/ba text-slate-800 dark:text-slate-200">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                                            <span className="text-[10px] font-black">{ba.id}</span>
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nomor BA</p>
                                                                            <p className="text-xs font-black">{ba.no}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right space-y-0.5">
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tanggal</p>
                                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{ba.date}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                                                                <span className="material-symbols-outlined text-3xl opacity-20">assignment</span>
                                                                <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data Anname</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* BA Inname Section */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 ml-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <span className="material-symbols-outlined text-sm font-fill">assignment_turned_in</span>
                                                        </div>
                                                        <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">BA Inname (Tujuan)</h5>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {project.relations.shipping.baInnames.length > 0 ? (
                                                            project.relations.shipping.baInnames.map((ba) => (
                                                                <div key={ba.id} className="p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm flex items-center justify-between group/ba text-slate-800 dark:text-slate-200">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                                            <span className="text-[10px] font-black">{ba.id}</span>
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nomor BA</p>
                                                                            <p className="text-xs font-black">{ba.no}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right space-y-0.5">
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tanggal</p>
                                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{ba.date}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                                                                <span className="material-symbols-outlined text-3xl opacity-20">inventory</span>
                                                                <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Data Inname</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                                
                                            {project.relations.shipping.files && project.relations.shipping.files.length > 0 && (
                                                <div className="col-span-full pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
                                                    {project.relations.shipping.files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-purple-500/20 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                                    <span className="material-symbols-outlined">local_shipping</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{file.name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400">Dokumen Surat Jalan / Shipping List</p>
                                                                </div>
                                                            </div>
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                                                                <span className="material-symbols-outlined text-sm">download</span>
                                                                Download
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
