import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import toast from 'react-hot-toast';

export default function Create({ options = {} }) {
    const [activeTab, setActiveTab] = useState(1);
    const [isLaunching, setIsLaunching] = useState(false);
    const [contractValueInput, setContractValueInput] = useState('0');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1280);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    if (!options) return null;

    // Transform options for SearchableSelect
    const transformedOptions = {
        auctionType: (options.auctionType || []).map(o => ({ value: o.id, label: o.name })),
        institution: (options.institution || []).map(o => ({ value: o.id, label: o.name })),
        company: (options.company || []).map(o => ({ value: o.id, label: o.name })),
        budgetType: (options.budgetType || []).map(o => ({ value: o.id, label: o.name })),
        pic: (options.users || []).map(o => ({ value: o.id, label: o.name })),
        vendors: (options.vendors || []).map(o => ({ value: o.id, label: o.name })),
        budgetYear: Array.from({ length: 6 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return { value: year.toString(), label: year.toString() };
        }),
        brandOrigins: (options.brandOrigins || []).map(o => ({ value: o.id, label: o.name })),
    };

    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        // Tab 1
        name: '',
        up_no: '',
        auction_type_id: '',
        agency_id: '',
        company_id: '',
        budget_type_id: '',
        pic_id: '',
        budget_year: new Date().getFullYear().toString(),
        vendor_ids: [],
        description: '',
        
        // Tab 2
        tax_free: 'Tidak',
        tax_doc: null,
        brand_origin_id: '',
        certification_ids: [],
        payment_term: 'Tidak ada DP',
        warranty: 'Tidak',
        
        // Tab 3
        contract_no: '',
        contract_value: 0,
        contract_date: '',
        due_date: '',
        installments: [{ id: Date.now(), name: 'Termin 1', percentage: 0, value: 0 }]
    });

    const handleNext = () => {
        if (activeTab < 3) {
            // Strict Validation per Tab
            let stepErrors = {};
            if (activeTab === 1) {
                if (!data.name) stepErrors.name = 'Nama pengadaan wajib diisi';
                if (!data.up_no) stepErrors.up_no = 'Nomor UP wajib diisi';
                if (!data.auction_type_id) stepErrors.auction_type_id = 'Jenis lelang wajib diisi';
                if (!data.agency_id) stepErrors.agency_id = 'Instansi wajib diisi';
                if (!data.company_id) stepErrors.company_id = 'Perusahaan wajib diisi';
                if (!data.budget_type_id) stepErrors.budget_type_id = 'Jenis anggaran wajib diisi';
                if (!data.pic_id) stepErrors.pic_id = 'PIC wajib diisi';
                if (!data.budget_year) stepErrors.budget_year = 'Tahun anggaran wajib diisi';
                if (!data.vendor_ids || data.vendor_ids.length === 0) stepErrors.vendor_ids = 'Minimal pilih satu vendor';
            } else if (activeTab === 2) {
                if (data.tax_free === 'Iya' && !data.tax_doc) stepErrors.tax_doc = 'Jenis dokumen pajak wajib dipilih';
                if (!data.brand_origin_id) stepErrors.brand_origin_id = 'Asal brand wajib diisi';
            }

            if (Object.keys(stepErrors).length > 0) {
                clearErrors();
                Object.keys(stepErrors).forEach(key => setError(key, stepErrors[key]));
                toast.error('Mohon lengkapi data yang wajib diisi');
                return;
            }

            clearErrors();
            setActiveTab(activeTab + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (activeTab > 1) {
            setActiveTab(activeTab - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleInstallmentChange = (id, field, value) => {
        const newInstallments = data.installments.map(inst => {
            if (inst.id === id) {
                let updated = { ...inst, [field]: value };
                const numericValue = value === '' ? 0 : parseFloat(value) || 0;

                if (field === 'percentage') {
                    updated.value = Math.round((numericValue / 100) * data.contract_value);
                } else if (field === 'value') {
                    if (data.contract_value > 0) {
                        updated.percentage = parseFloat(((numericValue / data.contract_value) * 100).toFixed(2));
                    }
                }
                return updated;
            }
            return inst;
        });
        setData('installments', newInstallments);
    };

    const addInstallment = () => {
        const newId = Date.now();
        const nextNumber = data.installments.length + 1;
        setData('installments', [
            ...data.installments, 
            { id: newId, name: `Termin ${nextNumber}`, percentage: 0, value: 0 }
        ]);
    };

    const formatIDR = (value) => {
        if (value === '' || value === null || value === undefined) return '';
        const num = parseFloat(value.toString().replace(',', '.'));
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const handleContractValueChange = (val) => {
        let clean = val.replace(/\./g, '').replace(/[^\d,]/g, '');
        const parts = clean.split(',');
        if (parts.length > 2) clean = parts[0] + ',' + parts.slice(1).join('');
        
        const numericPart = parts[0];
        const decimalPart = parts[1] !== undefined ? ',' + parts[1] : '';
        
        const formattedNumeric = numericPart 
            ? new Intl.NumberFormat('id-ID').format(numericPart) 
            : '';
            
        setContractValueInput(formattedNumeric + decimalPart);
        
        const numericValue = clean.replace(',', '.');
        const parsed = parseFloat(numericValue);
        const finalValue = isNaN(parsed) ? 0 : parsed;
        
        // Update contract value and sync installments
        const updatedInstallments = data.installments.map(inst => ({
            ...inst,
            value: Math.round((inst.percentage / 100) * finalValue)
        }));
        
        setData(d => ({
            ...d,
            contract_value: finalValue,
            installments: updatedInstallments
        }));
    };

    const totalPercentage = data.installments.reduce((sum, inst) => sum + (parseFloat(inst.percentage) || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Tab 3 Validation
        let finalErrors = {};
        if (!data.contract_no) finalErrors.contract_no = 'Nomor kontrak wajib diisi';
        if (!data.contract_value || data.contract_value <= 0) finalErrors.contract_value = 'Nilai kontrak harus lebih dari 0';
        if (!data.contract_date) finalErrors.contract_date = 'Tanggal kontrak wajib diisi';
        if (!data.due_date) finalErrors.due_date = 'Tanggal jatuh tempo wajib diisi';

        if (data.payment_term === 'Termin Berjangka' && Math.round(totalPercentage) !== 100) {
            finalErrors.installments = 'Total persentase termin harus 100%';
            toast.error('Total persentase termin harus 100%');
        }

        if (Object.keys(finalErrors).length > 0) {
            clearErrors();
            Object.keys(finalErrors).forEach(key => setError(key, finalErrors[key]));
            if (!finalErrors.installments) toast.error('Mohon lengkapi data kontrak yang wajib diisi');
            return;
        }

        clearErrors();
        setIsLaunching(true);
        post(route('projects.store'), {
            onFinish: () => setIsLaunching(false),
            onSuccess: () => {
                // Flash message handled by layout
            }
        });
    };

    // Watch for tax_free change to reset tax_doc
    useEffect(() => {
        if (data.tax_free === 'Tidak' && data.tax_doc !== null) {
        setData('tax_doc', null);
        }
    }, [data.tax_free]);

    return (
        <AuthenticatedLayout 
            bottomStickySlot={
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-6 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/5">
                    <div className={`grid w-full gap-4 relative ${activeTab > 1 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {/* Kembali Button - Only rendered when Step > 1 */}
                        {activeTab > 1 && (
                            <button 
                                type="button"
                                onClick={handlePrev}
                                className="flex flex-col items-center gap-1.5 group transition-all animate-slide-right place-self-center"
                            >
                                <div className="size-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-active:scale-90 transition-all text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Kembali</span>
                            </button>
                        )}

                        {/* Step Indicator */}
                        <div className="flex flex-col items-center gap-1.5 place-self-center">
                            <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-base font-black text-primary">0{activeTab}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-none">Langkah</span>
                        </div>

                        {/* Lanjut / Simpan Button */}
                        <button 
                            type="button"
                            onClick={activeTab < 3 ? handleNext : handleSubmit}
                            disabled={processing}
                            className="flex flex-col items-center gap-1.5 group transition-all disabled:opacity-50 place-self-center"
                        >
                            <div className={`size-11 rounded-2xl flex items-center justify-center group-active:scale-95 transition-all ${
                                activeTab === 3 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-primary text-white shadow-lg shadow-primary/20'
                            }`}>
                                <span className="material-symbols-outlined text-[24px]">
                                    {activeTab === 3 ? 'rocket_launch' : 'arrow_forward'}
                                </span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${
                                activeTab === 3 ? 'text-emerald-500' : 'text-primary'
                            }`}>
                                {activeTab === 3 ? 'Simpan' : 'Lanjut'}
                            </span>
                        </button>
                    </div>
                </div>
            }
            backUrl={route('projects')}
            backLabel="Input Proyek"
            stickySlot={
                <div className="hidden xl:block sticky top-0 z-40 px-4 sm:px-8 py-4 bg-slate-50/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                    <div className="max-w-5xl mx-auto flex items-center gap-4">
                        <Link 
                            href={route('projects')}
                            className="size-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-all shadow-sm group"
                        >
                            <span className="material-symbols-outlined font-bold group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Input Proyek Baru</h2>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Lengkapi detail pengadaan untuk memulai</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="min-h-screen pb-32 xl:pb-20">
                <style>{`
                    @keyframes rocket-launch-center {
                        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                        30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                        100% { transform: translate(-50%, -150vh) scale(2.5); opacity: 0; }
                    }
                    @keyframes smoke-blast {
                        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                        30% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                        100% { transform: translate(-50%, 100vh) scale(5); opacity: 0; }
                    }
                    @keyframes bg-dim-dark {
                        0% { background: rgba(0,0,0,0); }
                        100% { background: rgba(0,0,0,0.92); }
                    }
                    @keyframes bg-dim-light {
                        0% { background: rgba(255,255,255,0); }
                        100% { background: rgba(255,255,255,0.92); }
                    }
                    @keyframes tab-fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-tab-content {
                        animation: tab-fade-in 0.4s ease-out forwards;
                    }
                    .launch-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        pointer-events: auto;
                        backdrop-filter: blur(12px);
                    }
                    .dark .launch-overlay {
                        background: rgba(0,0,0,0.92);
                        animation: bg-dim-dark 0.4s forwards;
                    }
                    :not(.dark) .launch-overlay {
                        background: rgba(248,250,252,0.92);
                        animation: bg-dim-light 0.4s forwards;
                    }
                    .full-screen-rocket {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        font-size: 160px !important;
                        filter: drop-shadow(0 0 50px rgba(59, 130, 246, 1));
                        animation: rocket-launch-center 1.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
                        z-index: 10;
                    }
                    .dark .full-screen-rocket { color: white; }
                    :not(.dark) .full-screen-rocket { color: #1d4ed8; }
                    .full-screen-smoke {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 300px;
                        height: 300px;
                        border-radius: 50%;
                        animation: smoke-blast 1.8s ease-out forwards;
                        z-index: 5;
                    }
                    .dark .full-screen-smoke { background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%); }
                    :not(.dark) .full-screen-smoke { background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0) 70%); }
                    .launch-text {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, 12rem);
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.8em;
                        font-size: 1.5rem;
                        font-style: italic;
                        text-align: center;
                        width: 100%;
                        animation: pulse 1s infinite;
                    }
                    .dark .launch-text { color: white; }
                    :not(.dark) .launch-text { color: #1e40af; }
                    
                    .glass-card {
                        background: rgba(255, 255, 255, 0.7);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    .dark .glass-card {
                        background: rgba(15, 23, 42, 0.6);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                `}</style>
                <Head title="Input Proyek Baru" />

                {/* Mobile Action Navbar - Top part remains for title & progress */}
                {isMobile && (
                    <div 
                        className="xl:hidden bg-white dark:bg-[#0b1120] backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-6 pt-4 pb-3 transition-all duration-300 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary font-black text-xl">add_circle</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-none mb-0.5">Input Proyek Baru</h1>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Simpan & Monitoring Pengadaan</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-1.5 px-0.5">
                            {[1, 2, 3].map((step) => (
                                <div 
                                    key={step}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                                        step <= activeTab ? 'bg-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-100 dark:bg-white/5'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {isLaunching && (
                    <div className="launch-overlay">
                        <span className="material-symbols-outlined full-screen-rocket">rocket_launch</span>
                        <div className="full-screen-smoke" />
                        <div className="full-screen-smoke" style={{ animationDelay: '0.1s', opacity: 0.5 }} />
                        <div className="full-screen-smoke" style={{ animationDelay: '0.2s', opacity: 0.3 }} />
                        <div className="launch-text">Blast Off!</div>
                    </div>
                )}

                <div className="max-w-5xl mx-auto space-y-6 pt-0 xl:pt-6 pb-32 xl:pb-0">
                    <div className="glass-card rounded-none xl:rounded-[2.5rem] shadow-none xl:shadow-2xl overflow-hidden border-0 xl:border">
                        {/* Tab Bar - Hidden on Mobile */}
                        <div className="hidden xl:flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto no-scrollbar">
                            {[
                                { id: 1, label: 'Info Proyek', icon: 'info' },
                                { id: 2, label: 'Legalitas & Detail', icon: 'gavel' },
                                { id: 3, label: 'Kontrak & Finansial', icon: 'payments' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        if (tab.id <= activeTab) {
                                            setActiveTab(tab.id);
                                        } else {
                                            handleNext();
                                        }
                                    }}
                                    className={`flex items-center gap-2.5 px-8 py-5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                                        activeTab === tab.id 
                                        ? 'border-primary text-primary dark:text-blue-400 bg-primary/5' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? 'font-fill' : ''}`}>
                                        {activeTab > tab.id ? 'check_circle' : tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="p-6 sm:p-12">
                        {activeTab === 1 && (
                            <div className="space-y-8 animate-tab-content">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    <div className="md:col-span-8 space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Nama Pengadaan *</label>
                                        <input 
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Masukkan nama atau judul pengadaan project"
                                            className={`w-full px-6 py-4 bg-slate-100/50 dark:bg-white/5 border ${errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-white/10'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-medium`}
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.name}</p>}
                                    </div>
                                    
                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">No UP * (Unique)</label>
                                        <input 
                                            type="text"
                                            value={data.up_no}
                                            onChange={(e) => setData('up_no', e.target.value)}
                                            placeholder="Contoh: UP-2023-001"
                                            className={`w-full px-6 py-4 bg-slate-100/50 dark:bg-white/5 border ${errors.up_no ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-white/10'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-black tracking-wider uppercase`}
                                        />
                                        {errors.up_no && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.up_no}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <SearchableSelect 
                                        label="Jenis Lelang *"
                                        options={transformedOptions.auctionType}
                                        value={data.auction_type_id}
                                        onChange={(val) => setData('auction_type_id', val)}
                                        placeholder="Cari atau pilih jenis lelang..."
                                        error={errors.auction_type_id}
                                    />
                                    <SearchableSelect 
                                        label="Instansi *"
                                        options={transformedOptions.institution}
                                        value={data.agency_id}
                                        onChange={(val) => setData('agency_id', val)}
                                        placeholder="Pilih Instansi"
                                        error={errors.agency_id}
                                    />
                                    <SearchableSelect 
                                        label="Perusahaan *"
                                        options={transformedOptions.company}
                                        value={data.company_id}
                                        onChange={(val) => setData('company_id', val)}
                                        placeholder="Pilih Perusahaan"
                                        error={errors.company_id}
                                    />
                                    <SearchableSelect 
                                        label="Jenis Anggaran *"
                                        options={transformedOptions.budgetType}
                                        value={data.budget_type_id}
                                        onChange={(val) => setData('budget_type_id', val)}
                                        placeholder="Pilih Jenis Anggaran"
                                        error={errors.budget_type_id}
                                    />
                                    <SearchableSelect 
                                        label="PIC (Person In Charge) *"
                                        options={transformedOptions.pic}
                                        value={data.pic_id}
                                        onChange={(val) => setData('pic_id', val)}
                                        placeholder="Pilih PIC"
                                        error={errors.pic_id}
                                    />
                                    <SearchableSelect 
                                        label="Tahun Anggaran *"
                                        options={transformedOptions.budgetYear}
                                        value={data.budget_year}
                                        onChange={(val) => setData('budget_year', val)}
                                        placeholder="Pilih Tahun"
                                        error={errors.budget_year}
                                    />
                                </div>

                                <div className="p-8 bg-slate-100/30 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-[2rem] space-y-6">
                                    <SearchableSelect 
                                        label="Pilih Vendor *"
                                        options={transformedOptions.vendors}
                                        value={data.vendor_ids}
                                        onChange={(vals) => setData('vendor_ids', vals)}
                                        placeholder="Cari dan tambah vendor..."
                                        multiple={true}
                                        error={errors.vendor_ids}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Deskripsi Tambahan</label>
                                        <textarea 
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Masukkan deskripsi tambahan atau catatan khusus untuk proyek ini..."
                                            rows="4"
                                            className="w-full px-6 py-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="space-y-12 animate-tab-content">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-xl">payments</span>
                                                Kebijakan Pajak
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['Iya', 'Tidak'].map(opt => (
                                                    <button 
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setData('tax_free', opt)}
                                                        className={`p-6 border-2 rounded-[1.5rem] flex flex-col items-center gap-4 transition-all group ${
                                                            data.tax_free === opt 
                                                            ? 'bg-primary/5 border-primary text-primary dark:text-blue-400 ring-8 ring-primary/5' 
                                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className={`size-12 rounded-full flex items-center justify-center transition-all ${
                                                            data.tax_free === opt ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-slate-200 dark:bg-white/10 group-hover:scale-105'
                                                        }`}>
                                                            <span className="material-symbols-outlined font-bold">
                                                                {opt === 'Iya' ? 'check' : 'close'}
                                                            </span>
                                                        </div>
                                                        <span className="font-black uppercase tracking-widest text-xs">Bebas Pajak: {opt}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {data.tax_free === 'Iya' && (
                                            <div className="p-8 bg-amber-500/5 dark:bg-amber-400/5 border-2 border-dashed border-amber-500/20 rounded-[2rem] space-y-6 animate-tab-content">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-amber-500 font-bold">description</span>
                                                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Wajib: Pilih Jenis Dokumen Pajak</p>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    {['SKTD', 'SKB'].map(doc => (
                                                        <label key={doc} className={`flex items-center gap-4 px-8 py-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                                                            data.tax_doc === doc 
                                                            ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20' 
                                                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-500/30'
                                                        }`}>
                                                            <input type="radio" name="tax_doc" value={doc} checked={data.tax_doc === doc} onChange={(e) => setData('tax_doc', e.target.value)} className="hidden" />
                                                            <span className={`material-symbols-outlined text-2xl ${data.tax_doc === doc ? 'font-fill' : ''}`}>
                                                                {data.tax_doc === doc ? 'check_circle' : 'circle'}
                                                            </span>
                                                            <span className="font-black tracking-[0.2em] text-sm">{doc}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.tax_doc && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.tax_doc}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                                            Asal Brand & Sertifikasi
                                        </h4>
                                        <div className="space-y-6">
                                            <SearchableSelect 
                                                label="Negara / Asal Brand *"
                                                options={transformedOptions.brandOrigins}
                                                value={data.brand_origin_id}
                                                onChange={(val) => {
                                                    setData(prev => ({ ...prev, brand_origin_id: val, certification_ids: [] }));
                                                }}
                                                placeholder="Pilih Asal Brand"
                                                error={errors.brand_origin_id}
                                            />
                                            
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Sertifikasi Produk Tersedia</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {(options.brandOrigins?.find(o => o.id === data.brand_origin_id)?.certifications || []).map(cert => (
                                                        <button 
                                                            key={cert.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const exists = data.certification_ids.includes(cert.id);
                                                                setData('certification_ids', exists 
                                                                    ? data.certification_ids.filter(id => id !== cert.id)
                                                                    : [...data.certification_ids, cert.id]
                                                                );
                                                            }}
                                                            className={`p-4 border-2 rounded-2xl flex items-center gap-4 transition-all group text-left ${
                                                                data.certification_ids.includes(cert.id) 
                                                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                                                                data.certification_ids.includes(cert.id) ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10 group-hover:scale-110'
                                                            }`}>
                                                                <span className="material-symbols-outlined text-sm font-bold">
                                                                    {data.certification_ids.includes(cert.id) ? 'check' : 'add'}
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-xs tracking-tight">{cert.name}</span>
                                                        </button>
                                                    ))}
                                                    {!data.brand_origin_id && (
                                                        <div className="col-span-full p-6 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 italic text-xs">
                                                            Pilih Asal Brand terlebih dahulu untuk melihat daftar sertifikasi
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-slate-200/50 dark:border-white/5 pt-12">
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-xl">credit_card</span>
                                            Payment Term
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {['Tidak ada DP', 'DP 20%', 'Termin Berjangka'].map(opt => (
                                                <label key={opt} className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                                                    data.payment_term === opt 
                                                    ? 'bg-primary/5 border-primary text-primary dark:text-blue-400' 
                                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                                                }`}>
                                                    <input type="radio" name="payment_term" checked={data.payment_term === opt} onChange={() => setData('payment_term', opt)} className="hidden" />
                                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                                        data.payment_term === opt ? 'bg-primary text-white scale-110' : 'bg-slate-100 dark:bg-white/10 font-bold'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-lg">
                                                            {opt === 'Tidak ada DP' ? 'wallet' : opt === 'DP 20%' ? 'percent' : 'calendar_month'}
                                                        </span>
                                                    </div>
                                                    <span className="font-black uppercase tracking-[0.1em] text-xs flex-1">{opt}</span>
                                                    <span className={`material-symbols-outlined transition-all ${data.payment_term === opt ? 'text-primary scale-110 font-fill' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                                                        {data.payment_term === opt ? 'radio_button_checked' : 'radio_button_unchecked'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                            Garansi Layanan
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {['Iya, Garansi Resmi', 'Tidak Ada Garansi'].map(opt => (
                                                <label key={opt} className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                                                    data.warranty === opt 
                                                    ? 'bg-primary/5 border-primary text-primary dark:text-blue-400' 
                                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                                                }`}>
                                                    <input type="radio" name="warranty" checked={data.warranty === opt} onChange={() => setData('warranty', opt)} className="hidden" />
                                                    <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                                        data.warranty === opt ? 'bg-primary text-white scale-110' : 'bg-slate-100 dark:bg-white/10'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-lg">
                                                            {opt === 'Iya, Garansi Resmi' ? 'verified' : 'cancel'}
                                                        </span>
                                                    </div>
                                                    <span className="font-black uppercase tracking-[0.1em] text-xs flex-1">{opt}</span>
                                                    <span className={`material-symbols-outlined transition-all ${data.warranty === opt ? 'text-primary scale-110 font-fill' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                                                        {data.warranty === opt ? 'radio_button_checked' : 'radio_button_unchecked'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div className="space-y-12 animate-tab-content">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Nomor Kontrak *</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">description</span>
                                            <input 
                                                type="text"
                                                value={data.contract_no}
                                                onChange={(e) => setData('contract_no', e.target.value)}
                                                placeholder="Cth: 001/CTR/ABC/2023"
                                                className={`w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border ${errors.contract_no ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-black tracking-widest uppercase`}
                                            />
                                        </div>
                                        {errors.contract_no && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.contract_no}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Nilai Kontrak (IDR) *</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-primary transition-colors">Rp</span>
                                            <input 
                                                type="text"
                                                value={contractValueInput}
                                                onChange={(e) => handleContractValueChange(e.target.value)}
                                                onBlur={() => setContractValueInput(formatIDR(data.contract_value) || '0')}
                                                placeholder="0"
                                                className={`w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border ${errors.contract_value ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-black text-lg sm:text-xl`}
                                            />
                                        </div>
                                        {errors.contract_value && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.contract_value}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Tanggal Kontrak *</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors font-bold">calendar_month</span>
                                            <input 
                                                type="date"
                                                value={data.contract_date}
                                                onChange={(e) => setData('contract_date', e.target.value)}
                                                className={`w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border ${errors.contract_date ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white cursor-pointer font-bold dark:[color-scheme:dark]`}
                                            />
                                        </div>
                                        {errors.contract_date && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.contract_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Tanggal Jatuh Tempo *</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-red-500 transition-colors font-bold">event_busy</span>
                                            <input 
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                className={`w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border ${errors.due_date ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all dark:text-white cursor-pointer font-bold dark:[color-scheme:dark]`}
                                            />
                                        </div>
                                        {errors.due_date && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{errors.due_date}</p>}
                                    </div>
                                </div>

                                <div className="space-y-8 bg-slate-50/50 dark:bg-white/[0.01] rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 p-4 sm:p-12 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                                <span className="material-symbols-outlined font-bold">payments</span>
                                            </div>
                                            Konfigurasi Termin Pembayaran
                                        </h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 mb-10">Atur rincian penagihan berdasarkan kesepakatan kontrak</p>
                                    </div>

                                    {data.payment_term === 'DP 20%' && (
                                        <div className="p-4 sm:p-10 bg-gradient-to-br from-primary/5 to-transparent dark:from-blue-400/5 backdrop-blur-sm rounded-[2rem] border-2 border-primary/20 border-dashed animate-tab-content flex flex-col items-center gap-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                                            <div className="text-center space-y-2">
                                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Down Payment Otomatis</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Sistem akan otomatis mengatur termin penagihan DP sebesar <span className="text-primary dark:text-blue-400 font-bold">20%</span> dari total nilai kontrak.</p>
                                            </div>
                                            <div className="px-4 sm:px-12 py-6 bg-white dark:bg-white/5 rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 group-hover:scale-105 transition-transform duration-500 w-full sm:w-auto">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Estimasi Nilai DP (20%)</p>
                                                <p className="text-xl sm:text-4xl font-black text-primary dark:text-blue-400 tracking-tighter tabular-nums text-center break-words leading-tight">Rp {formatIDR(data.contract_value * 0.2)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {data.payment_term === 'Termin Berjangka' && (
                                        <div className="space-y-8 animate-tab-content">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                    Daftar Termin Penagihan Aktif
                                                </p>
                                                <button 
                                                    type="button"
                                                    onClick={addInstallment}
                                                    className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                                                    Tambah Termin Baru
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {data.installments.map((inst, idx) => (
                                                    <div key={inst.id} className="relative transition-all group">
                                                        {/* Step Number Badge */}
                                                        <div className="absolute -left-2 top-0 z-10 size-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                                                            {idx + 1}
                                                        </div>

                                                        {/* Card Container */}
                                                        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-[2rem] p-4 sm:p-8 space-y-6 group-hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-black/40">
                                                            
                                                            {/* Row 1: Name & Delete */}
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1 space-y-2">
                                                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Label Penagihan</label>
                                                                    <input 
                                                                        type="text"
                                                                        value={inst.name}
                                                                        onChange={(e) => handleInstallmentChange(inst.id, 'name', e.target.value)}
                                                                        placeholder="Nama Termin (Contoh: Pelunasan)"
                                                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all shadow-inner placeholder:text-slate-400"
                                                                    />
                                                                </div>
                                                                {data.installments.length > 1 && (
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => setData('installments', data.installments.filter(i => i.id !== inst.id))}
                                                                        className="size-12 shrink-0 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                                                                    >
                                                                        <span className="material-symbols-outlined text-2xl font-fill">delete</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Row 2: Percent & Nominal */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Persen Penagihan</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="text"
                                                                            value={inst.percentage}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/,/g, '.').replace(/[^\d.]/g, '');
                                                                                handleInstallmentChange(inst.id, 'percentage', val);
                                                                            }}
                                                                            placeholder="0"
                                                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-base font-black dark:text-white outline-none text-center focus:border-primary transition-all shadow-inner"
                                                                        />
                                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">%</span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Estimasi Nominal</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rp</span>
                                                                        <input 
                                                                            type="text"
                                                                            value={inst.value === 0 ? '' : formatIDR(inst.value)}
                                                                            onChange={(e) => {
                                                                                const cleanValue = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, '');
                                                                                handleInstallmentChange(inst.id, 'value', cleanValue);
                                                                            }}
                                                                            placeholder="0"
                                                                            className="w-full pl-10 pr-5 py-4 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white outline-none focus:border-primary transition-all tabular-nums text-right shadow-inner"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden ${
                                                Math.round(totalPercentage) === 100 
                                                ? 'bg-emerald-500/5 border-emerald-500/30 ring-8 ring-emerald-500/5' 
                                                : 'bg-amber-500/5 border-amber-500/30'
                                            }`}>
                                                <div className="flex items-center gap-6 z-10">
                                                    <div className={`size-16 rounded-3xl flex items-center justify-center shadow-xl ${Math.round(totalPercentage) === 100 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>
                                                        <span className="material-symbols-outlined text-3xl font-bold animate-bounce-slow">
                                                            {Math.round(totalPercentage) === 100 ? 'verified' : 'priority_high'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Status Persentase</p>
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                            {Math.round(totalPercentage) === 100 ? 'Sempurna! Termin siap disimpan' : 'Wajib mencapai 100% dari total kontrak'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-10 z-10">
                                                    <div className={`text-5xl font-black tabular-nums transition-all ${Math.round(totalPercentage) === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {totalPercentage}% <span className="text-slate-300 text-2xl font-black">/ 100%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {data.payment_term === 'Tidak ada DP' && (
                                        <div className="p-12 text-center space-y-4 animate-tab-content">
                                            <div className="size-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-400">
                                                <span className="material-symbols-outlined text-4xl">info</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 font-medium italic">Metode pembayaran penuh saat serah terima barang/layanan selesai.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                    {/* Mobile Wizard Actions - Removed (Moved to top navbar) */}

                    {/* Desktop Actions */}
                    <div className="hidden xl:flex justify-end gap-4 px-12 pb-12">
                        {activeTab > 1 && (
                            <button 
                                type="button"
                                onClick={handlePrev}
                                className="px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                                <span className="material-symbols-outlined font-bold">arrow_back</span>
                                Kembali
                            </button>
                        )}
                        
                        {activeTab < 3 ? (
                            <button 
                                type="button"
                                onClick={handleNext}
                                className="px-10 py-5 bg-primary text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
                            >
                                Lanjut Ke Tahap Berikutnya
                                <span className="material-symbols-outlined font-bold">arrow_forward</span>
                            </button>
                        ) : (
                            <button 
                                type="submit"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-10 py-5 bg-emerald-500 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                {processing ? 'Sedang Memproses...' : 'Selesaikan & Simpan Proyek'}
                                <span className="material-symbols-outlined font-bold">rocket_launch</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
