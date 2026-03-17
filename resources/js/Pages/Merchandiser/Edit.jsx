import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import Modal from '@/Components/Modal';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, type = 'text', disabled = false, min, max, suffix, error }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                min={min}
                max={max}
                className={`w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-rose-500 ring-1 ring-rose-500/20' : ''}`}
            />
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{suffix}</span>}
        </div>
        {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>}
    </div>
);

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon, iconColor = 'blue', title, badge }) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className={`size-8 rounded-lg bg-${iconColor}-500/10 flex items-center justify-center text-${iconColor}-500`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{title}</h3>
        </div>
        {badge}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Edit({ project, merchandiser, vendors, canEdit, isReviewMode }) {
    const { auth } = usePage().props;
    const auth_user = auth?.user;

    const { data, setData, post, processing, errors } = useForm({
        ...merchandiser,
        _method: 'put',
        new_files: [],
        // Enforce numeric types for inputs that use them
        contract_item: Number(merchandiser.contract_item || 0),
        contract_ea: Number(merchandiser.contract_ea || 0),
        shipping_produksi_item: Number(merchandiser.shipping_produksi_item || 0),
        shipping_produksi_ea: Number(merchandiser.shipping_produksi_ea || 0),
        shipping_pengiriman_item: Number(merchandiser.shipping_pengiriman_item || 0),
        shipping_pengiriman_ea: Number(merchandiser.shipping_pengiriman_ea || 0),
        shipping_stok_item: Number(merchandiser.shipping_stok_item || 0),
        shipping_stok_ea: Number(merchandiser.shipping_stok_ea || 0),
        shipping_penerimaan_item: Number(merchandiser.shipping_penerimaan_item || 0),
        shipping_penerimaan_ea: Number(merchandiser.shipping_penerimaan_ea || 0),
    });

    const [activeTab, setActiveTab] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Filter vendors for select
    const vendorOptions = vendors.map(v => ({ value: v.id, label: v.name }));

    // Local states for PO management before submit
    const [showAddPo, setShowAddPo] = useState(false);
    const [newPo, setNewPo]       = useState({ vendor_id: '', supplier_name: '', po_number: '', item_count: 0, ea_count: 0 });
    const [editPoId, setEditPoId]   = useState(null);
    const [editPoData, setEditPoData] = useState({ vendor_id: '', supplier_name: '', po_number: '', item_count: 0, ea_count: 0 });
    const [invoiceFormPoId, setInvoiceFormPoId] = useState(null);
    const [editInvoiceId, setEditInvoiceId]   = useState(null);
    const [newInvoice, setNewInvoice]         = useState({ invoice_number: '', invoice_date: '', item_count: 0, ea_count: 0, status: 'Pending' });

    // File Management
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef(null);
    const [fileToDelete, setFileToDelete] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check each file size
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        const currentNewFilesSize = data.new_files.reduce((acc, file) => acc + file.size, 0);
        if (totalSize + currentNewFilesSize > 50 * 1024 * 1024) { // 50MB total limit
            setFileError('Total ukuran file melebihi kapasitas maksimal 50MB.');
            return;
        }

        setData('new_files', [...data.new_files, ...files]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFileError('');
    };

    const handleRemoveNewFile = (idx) => {
        const updatedFiles = [...data.new_files];
        updatedFiles.splice(idx, 1);
        setData('new_files', updatedFiles);
    };

    const handleDeleteFile = (fileId) => {
        setFileToDelete(fileId);
    };

    const confirmDeleteFile = () => {
        if (!fileToDelete) return;

        router.delete(route('merchandiser.file.delete', fileToDelete), { 
            preserveScroll: true,
            onSuccess: (page) => {
                setData('files', page.props.merchandiser.files);
                setFileToDelete(null);
            }
        });
    };

    // PO Calculations
    const totalPoItem = data.pos.reduce((s, p) => s + Number(p.item_count || 0), 0);
    const totalPoEa   = data.pos.reduce((s, p) => s + Number(p.ea_count || 0), 0);
    const tab1Item    = Number(data.contract_item);
    const tab1Ea      = Number(data.contract_ea);
    const poValid     = totalPoItem === tab1Item && totalPoEa === tab1Ea;

    // Progress calculation
    const progress = useMemo(() => {
        if (!tab1Ea || tab1Ea === 0) return 0;
        return Math.min(100, Math.round((Number(data.shipping_penerimaan_ea || 0) / tab1Ea) * 100));
    }, [data.shipping_penerimaan_ea, tab1Ea]);

    const tabs = [
        { label: 'Informasi Kontrak', icon: 'description' },
        { label: 'Purchase Order', icon: 'receipt_long' },
        { label: 'Shipping', icon: 'local_shipping' },
        { label: 'File Pendukung', icon: 'attach_file' },
    ];

    const statusOptions = [
        { id: 'Ongoing',   icon: 'autorenew', color: 'blue' },
        { id: 'Pending',   icon: 'pause',     color: 'amber' },
        { id: 'Completed', icon: 'verified',  color: 'emerald' },
    ];

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!canEdit) return;

        setIsSaving(true);
        post(route('merchandiser.update', project.hashed_id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (page) => {
                setData(data => ({
                    ...data,
                    files: page.props.merchandiser.files,
                    pos: page.props.merchandiser.pos,
                    new_files: []
                }));
            },
            onFinish: () => setIsSaving(false),
        });
    };

    // ── PO Logic ──
    const handleAddPo = () => {
        if (!newPo.po_number || !newPo.supplier_name) return;
        const po = { 
            ...newPo, 
            id: `new_${Date.now()}`, 
            invoices: [],
            item_count: Number(newPo.item_count || 0),
            ea_count: Number(newPo.ea_count || 0)
        };
        setData('pos', [...data.pos, po]);
        setNewPo({ vendor_id: '', supplier_name: '', po_number: '', item_count: 0, ea_count: 0 });
        setShowAddPo(false);
    };

    const handleDeletePo = (id) => setData('pos', data.pos.filter(p => p.id !== id));

    const openEditPo = (po) => {
        setEditPoId(po.id);
        setEditPoData({ ...po });
    };

    const handleSaveEditPo = () => {
        const preparedPo = {
            ...editPoData,
            item_count: Number(editPoData.item_count || 0),
            ea_count: Number(editPoData.ea_count || 0),
        };
        setData('pos', data.pos.map(p => p.id === editPoId ? { ...p, ...preparedPo } : p));
        setEditPoId(null);
    };

    const openInvoiceForm = (poId, inv = null) => {
        setInvoiceFormPoId(poId);
        if (inv) {
            setEditInvoiceId(inv.id);
            setNewInvoice({ ...inv });
        } else {
            setEditInvoiceId(null);
            setNewInvoice({ invoice_number: '', invoice_date: '', item_count: 0, ea_count: 0, status: 'Pending' });
        }
    };

    const handleSaveInvoice = (poId) => {
        if (!newInvoice.invoice_number) return;
        
        // Ensure numeric fields are numbers
        const preparedInvoice = {
            ...newInvoice,
            item_count: Number(newInvoice.item_count || 0),
            ea_count: Number(newInvoice.ea_count || 0),
        };

        setData('pos', data.pos.map(p => {
            if (p.id !== poId) return p;
            if (editInvoiceId) {
                return { ...p, invoices: p.invoices.map(i => i.id === editInvoiceId ? { ...i, ...preparedInvoice } : i) };
            }
            return { ...p, invoices: [...(p.invoices || []), { ...preparedInvoice, id: `new_${Date.now()}` }] };
        }));
        setInvoiceFormPoId(null);
        setEditInvoiceId(null);
        setNewInvoice({ invoice_number: '', invoice_date: '', item_count: 0, ea_count: 0, status: 'Pending' });
    };

    const handleDeleteInvoice = (poId, invId) => {
        setData('pos', data.pos.map(p => p.id === poId
            ? { ...p, invoices: p.invoices.filter(i => i.id !== invId) }
            : p
        ));
    };

    const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

    return (
        <AuthenticatedLayout
            stickySlot={
                <>
                    {/* Read-only Alert */}
                    {!canEdit && (
                        <div className={`border-b px-8 py-3 flex items-center justify-center gap-3 ${
                            project.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            project.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                            <span className="material-symbols-outlined shrink-0">
                                {project.status === 'Pending' ? 'pause_circle' : 
                                 project.status === 'Completed' ? 'verified' : 'lock'}
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                                {project.status === 'Pending' ? 'Data tidak bisa diubah karena status Project sedang Pending' :
                                 project.status === 'Completed' ? 'Mode Pratinjau: Project telah Selesai (Completed). Data tidak dapat diubah.' :
                                 `Mode Pratinjau: Hanya PIC yang ditunjuk atau Admin yang dapat mengubah data ini.`}
                            </p>
                        </div>
                    )}

                    {/* Sticky Header */}
                    <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('merchandiser')}
                                    className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Edit Merchandiser</h1>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                        {project.up_no}
                                        {project.status === 'Pending' && (
                                            <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[8px]">Project Pending</span>
                                        )}
                                        {project.status === 'Completed' && (
                                            <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px]">Project Selesai</span>
                                        )}
                                    </p>
                                </div>

                                {/* Status Toggle */}
                                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl ml-4">
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            disabled={!canEdit}
                                            onClick={() => setData('status', opt.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                data.status === opt.id
                                                    ? opt.color === 'blue'    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : opt.color === 'amber'   ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                            } disabled:opacity-50`}
                                        >
                                            <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                                            {opt.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex flex-col items-end gap-2 w-full lg:w-64">
                                <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Total Progress</span>
                                    <span className={progress === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)] ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        >
            <Head title={`Edit Merchandiser — ${project.name}`} />

            <div className="max-w-7xl mx-auto pt-6 pb-12 space-y-8 animate-reveal">

                {/* ── Informasi Project (read-only, always visible) ─────────── */}
                <SectionCard>
                    <SectionHeader
                        icon="info"
                        iconColor="emerald"
                        title="Informasi Project"
                        badge={
                            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Synced from Project</span>
                            </div>
                        }
                    />
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
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. UP</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white ml-1">{project.up_no}</p>
                        </div>
                        <div className="lg:col-span-2 space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIC</p>
                            <div className="flex items-center gap-2 ml-1">
                                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                    {project.pic?.split(' ').map(w => w[0]).join('').slice(0, 2) || '??'}
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-white">{project.pic}</p>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Project</label>
                            <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl w-fit min-w-[200px]">
                                <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                                    <span className="material-symbols-outlined text-lg">info</span>
                                </div>
                                <span className="font-black text-slate-700 dark:text-white uppercase tracking-widest text-[10px]">{project.status}</span>
                                {canEdit && (
                                    <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                                        Anda (PIC)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
                    {/* Tab Bar */}
                    <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto">
                        {tabs.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`flex items-center gap-2.5 px-8 py-5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                                    activeTab === i
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
                        {/* ═══════════ TAB 1: Informasi Kontrak ═══════════════ */}
                        {activeTab === 0 && (
                            <div className="space-y-8 animate-reveal">
                                {/* Info Kontrak */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <span className="material-symbols-outlined text-lg">account_balance</span>
                                        </div>
                                        <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Data Pembayaran</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                                        <InputField label="Atas Nama" value={data.account_name} onChange={e => setData('account_name', e.target.value)} disabled={!canEdit} error={errors.account_name} />
                                        <InputField label="Nama Bank" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} disabled={!canEdit} error={errors.bank_name} />
                                        <InputField label="Nomor Rekening" value={data.account_number} onChange={e => setData('account_number', e.target.value)} disabled={!canEdit} error={errors.account_number} />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-white/5" />

                                {/* Barang di Kontrak */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                                        </div>
                                        <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Barang di Kontrak</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
                                        <InputField
                                            label="Jumlah Item"
                                            type="text"
                                            value={data.contract_item !== null && data.contract_item !== '' ? fmt(data.contract_item) : ''}
                                            onChange={e => setData('contract_item', e.target.value.replace(/\./g, '').replace(/[^\d]/g, ''))}
                                            disabled={!canEdit}
                                            suffix="item"
                                            error={errors.contract_item}
                                        />
                                        <InputField
                                            label="Jumlah EA"
                                            type="text"
                                            value={data.contract_ea !== null && data.contract_ea !== '' ? fmt(data.contract_ea) : ''}
                                            onChange={e => setData('contract_ea', e.target.value.replace(/\./g, '').replace(/[^\d]/g, ''))}
                                            disabled={!canEdit}
                                            suffix="ea"
                                            error={errors.contract_ea}
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                {canEdit && (
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">{processing ? 'sync' : 'save'}</span>
                                            {processing ? 'Menyimpan...' : 'Simpan Informasi Kontrak'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══════════ TAB 2: Purchase Order ═════════════════ */}
                        {activeTab === 1 && (
                            <div className="space-y-8 animate-reveal">
                                {/* PO Quota Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Target Item', val: Number(data.contract_item || 0), color: 'slate' },
                                        { label: 'Total PO Item', val: totalPoItem, color: totalPoItem === Number(data.contract_item || 0) ? 'emerald' : totalPoItem > Number(data.contract_item || 0) ? 'rose' : 'amber' },
                                        { label: 'Target EA', val: Number(data.contract_ea || 0), color: 'slate' },
                                        { label: 'Total PO EA', val: totalPoEa, color: totalPoEa === Number(data.contract_ea || 0) ? 'emerald' : totalPoEa > Number(data.contract_ea || 0) ? 'rose' : 'amber' },
                                    ].map((s, i) => (
                                        <div key={i} className={`p-4 rounded-2xl bg-${s.color}-500/5 border border-${s.color}-500/10 dark:border-transparent text-center`}>
                                            <p className={`text-[9px] font-black text-${s.color}-500 uppercase tracking-widest`}>{s.label}</p>
                                            <p className={`text-2xl font-black text-${s.color === 'slate' ? 'slate-800 dark:text-white' : s.color + '-500'} mt-1`}>{fmt(s.val)}</p>
                                        </div>
                                    ))}
                                </div>
                                {!poValid && (
                                    <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                        <span className="material-symbols-outlined text-amber-500">warning</span>
                                        <p className="text-xs font-black text-amber-600 dark:text-amber-400">Total item dan EA pada PO harus sama dengan barang di kontrak (Tab 1).</p>
                                    </div>
                                )}

                                {/* PO List */}
                                <div className="space-y-6">
                                    {data.pos.map((po, idx) => (
                                        <div key={po.id} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[1.5rem]">
                                            {/* PO Header */}
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm">{po.po_number}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{po.supplier_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase">Item / EA</p>
                                                        <p className="text-sm font-black text-slate-800 dark:text-white">{fmt(po.item_count)} / {fmt(po.ea_count)}</p>
                                                    </div>
                                                    {canEdit && (
                                                        <>
                                                            <div className="relative group/t1">
                                                                <button
                                                                    onClick={() => openInvoiceForm(po.id)}
                                                                    className="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/10 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">note_add</span>
                                                                </button>
                                                                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/t1:opacity-100 group-hover/t1:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                                                                    Tambah Invoice
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                                </div>
                                                            </div>
                                                            <div className="relative group/t2">
                                                                <button
                                                                    onClick={() => openEditPo(po)}
                                                                    className="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">edit_square</span>
                                                                </button>
                                                                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/t2:opacity-100 group-hover/t2:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                                                                    Edit PO
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                                </div>
                                                            </div>
                                                            <div className="relative group/t3">
                                                                <button onClick={() => handleDeletePo(po.id)} className="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                </button>
                                                                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/t3:opacity-100 group-hover/t3:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-50">
                                                                    Hapus PO
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Edit PO Inline Form */}
                                            {editPoId === po.id && (
                                                <div className="px-6 pb-2">
                                                    <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-lg">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Edit PO</p>
                                                            <div className="relative group/tclpo">
                                                                <button onClick={() => setEditPoId(null)} className="size-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                                </button>
                                                                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/tclpo:opacity-100 group-hover/tclpo:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-50">
                                                                    Tutup
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5 pt-1.5 border-t border-transparent relative z-50">
                                                                    <SearchableSelect 
                                                                        label="Supplier *"
                                                                        options={vendorOptions}
                                                                        value={editPoData.vendor_id}
                                                                        onChange={(val) => {
                                                                            const v = vendors.find(x => x.id === val);
                                                                            setEditPoData(p => ({ ...p, vendor_id: val, supplier_name: v?.name || '' }));
                                                                        }}
                                                                        placeholder="Pilih Supplier"
                                                                    />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. PO</label>
                                                                <input type="text" value={editPoData.po_number} onChange={e => setEditPoData(p => ({ ...p, po_number: e.target.value }))} className="w-full px-4 py-[13px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 dark:text-white font-bold" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah Item</label>
                                                                <input type="text" value={editPoData.item_count ? fmt(editPoData.item_count) : ''} onChange={e => setEditPoData(p => ({ ...p, item_count: e.target.value.replace(/\./g, '').replace(/[^\d]/g, '') }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 dark:text-white font-bold" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah EA</label>
                                                                <input type="text" value={editPoData.ea_count ? fmt(editPoData.ea_count) : ''} onChange={e => setEditPoData(p => ({ ...p, ea_count: e.target.value.replace(/\./g, '').replace(/[^\d]/g, '') }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 dark:text-white font-bold" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditPoId(null)} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Batal</button>
                                                            <button onClick={handleSaveEditPo} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">Simpan PO</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Invoice List */}
                                            <div className="px-6 py-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice ({po.invoices?.length || 0})</p>
                                                </div>
                                                {(!po.invoices || po.invoices.length === 0) && invoiceFormPoId !== po.id ? (
                                                    <p className="text-xs font-bold text-slate-300 dark:text-white/20 italic">Belum ada invoice — klik <span className="material-symbols-outlined text-[12px] align-middle">note_add</span> untuk menambah</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {po.invoices?.map(inv => (
                                                            <div key={inv.id} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 group/inv">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="material-symbols-outlined text-slate-400 text-lg">receipt</span>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-700 dark:text-white">{inv.invoice_number}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400">{inv.invoice_date} · {fmt(inv.item_count)} item · {fmt(inv.ea_count)} EA</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                                    }`}>{inv.status}</span>
                                                                    {canEdit && (
                                                                        <>
                                                                            <div className="relative group/ti1">
                                                                                <button onClick={() => openInvoiceForm(po.id, inv)} className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                                 </button>
                                                                                 <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/ti1:opacity-100 group-hover/ti1:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                                                                                     Ubah Invoice
                                                                                     <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                                                                 </div>
                                                                            </div>
                                                                            <div className="relative group/ti2">
                                                                                 <button onClick={() => handleDeleteInvoice(po.id, inv.id)} className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                                                                     <span className="material-symbols-outlined text-sm">close</span>
                                                                                 </button>
                                                                                 <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/ti2:opacity-100 group-hover/ti2:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-50">
                                                                                     Hapus
                                                                                     <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                                                 </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Inline Invoice Form */}
                                                {invoiceFormPoId === po.id && (
                                                    <div className="mt-3 bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-2xl p-5 space-y-4 shadow-lg">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">
                                                                {editInvoiceId ? 'Ubah Invoice' : 'Invoice Baru'}
                                                            </p>
                                                            <div className="relative group/tclinv">
                                                                <button onClick={() => { setInvoiceFormPoId(null); setEditInvoiceId(null); }} className="size-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                                </button>
                                                                <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/tclinv:opacity-100 group-hover/tclinv:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-50">
                                                                    Tutup
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                            <div className="md:col-span-2 space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. Invoice</label>
                                                                <input type="text" value={newInvoice.invoice_number} onChange={e => setNewInvoice(p => ({ ...p, invoice_number: e.target.value }))} placeholder="INV/2024/001" className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tanggal</label>
                                                                <input type="date" value={newInvoice.invoice_date} onChange={e => setNewInvoice(p => ({ ...p, invoice_date: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah Item</label>
                                                                <input type="text" value={newInvoice.item_count ? fmt(newInvoice.item_count) : ''} onChange={e => setNewInvoice(p => ({ ...p, item_count: e.target.value.replace(/\./g, '').replace(/[^\d]/g, '') }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah EA</label>
                                                                <input type="text" value={newInvoice.ea_count ? fmt(newInvoice.ea_count) : ''} onChange={e => setNewInvoice(p => ({ ...p, ea_count: e.target.value.replace(/\./g, '').replace(/[^\d]/g, '') }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                                                                <select value={newInvoice.status} onChange={e => setNewInvoice(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm">
                                                                    <option>Pending</option>
                                                                    <option>Paid</option>
                                                                    <option>Overdue</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setInvoiceFormPoId(null); setEditInvoiceId(null); }} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-white/10">Batal</button>
                                                            <button onClick={() => handleSaveInvoice(po.id)} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Simpan Invoice</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add PO */}
                                {canEdit && (
                                    <div>
                                        {!showAddPo ? (
                                            <button
                                                onClick={() => setShowAddPo(true)}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-primary/40 hover:text-primary dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                                Tambah PO
                                            </button>
                                        ) : (
                                            <div className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-[1.5rem] p-6 space-y-5 shadow-lg">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">PO Baru</p>
                                                     <div className="relative group/tclose">
                                                        <button onClick={() => setShowAddPo(false)} className="size-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                                            <span className="material-symbols-outlined text-lg">close</span>
                                                        </button>
                                                        <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/tclose:opacity-100 group-hover/tclose:mb-3 transition-all duration-200 whitespace-nowrap shadow-xl shadow-rose-500/20 z-50">
                                                            Tutup
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
                                                        </div>
                                                     </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-50">
                                                    <div className="space-y-1.5">
                                                        <SearchableSelect 
                                                            label="Supplier *"
                                                            options={vendorOptions}
                                                            value={newPo.vendor_id}
                                                            onChange={(val) => {
                                                                const v = vendors.find(x => x.id === val);
                                                                setNewPo(p => ({ ...p, vendor_id: val, supplier_name: v?.name || '' }));
                                                            }}
                                                            placeholder="Pilih Supplier"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. PO</label>
                                                        <input type="text" value={newPo.po_number} onChange={e => setNewPo(p => ({ ...p, po_number: e.target.value }))} placeholder="PO/2024/001" className="w-full px-4 py-[13px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah Item <span className="text-slate-300 dark:text-white/20 font-bold normal-case">(maks. {fmt(data.contract_item)})</span></label>
                                                        <input type="text" value={newPo.item_count ? fmt(newPo.item_count) : ''} onChange={e => setNewPo(p => ({ ...p, item_count: e.target.value.replace(/\./g, '').replace(/[^\d]/g, '') }))} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jumlah EA <span className="text-slate-300 dark:text-white/20 font-bold normal-case">(maks. {fmt(data.contract_ea)})</span></label>
                                                        <input type="text" value={newPo.ea_count ? fmt(newPo.ea_count) : ''} onChange={e => setNewPo(p => ({ ...p, ea_count: e.target.value.replace(/\./g, '').replace(/[^\d]/g, '') }))} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 justify-end">
                                                    <button onClick={() => setShowAddPo(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10">Batal</button>
                                                    <button onClick={handleAddPo} className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Simpan PO</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Save Button */}
                                {canEdit && (
                                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">{processing ? 'sync' : 'save'}</span>
                                            {processing ? 'Menyimpan...' : 'Simpan Semua PO & Invoice'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══════════ TAB 3: Shipping ════════════════════════ */}
                        {activeTab === 2 && (
                            <div className="space-y-6 animate-reveal">
                                {/* Progress pill */}
                                <div className="flex items-center gap-4 px-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                            <span className="text-slate-400">Progress Penerimaan</span>
                                            <span className={progress === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Target: <span className="text-slate-700 dark:text-white font-black">{fmt(data.contract_ea)} EA</span></p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Produksi */}
                                    {[
                                        { key: 'produksi',   label: 'Produksi',         icon: 'factory',         color: 'violet',  hasEtd: true },
                                        { key: 'pengiriman', label: 'Pengiriman',        icon: 'local_shipping',  color: 'blue',    hasEtd: true },
                                        { key: 'stok',       label: 'Stok Tersedia',     icon: 'warehouse',       color: 'amber',   hasEtd: false },
                                        { key: 'penerimaan', label: 'Penerimaan',        icon: 'move_to_inbox',   color: 'emerald', hasEtd: false },
                                    ].map(sec => (
                                        <div key={sec.key} className={`bg-${sec.color}-500/5 border border-${sec.color}-500/10 dark:border-transparent rounded-[1.5rem] p-6 space-y-5`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-xl bg-${sec.color}-500/10 flex items-center justify-center text-${sec.color}-500`}>
                                                    <span className="material-symbols-outlined text-lg">{sec.icon}</span>
                                                </div>
                                                <h4 className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">{sec.label}</h4>
                                            </div>
                                            <div className={`grid gap-4 ${sec.hasEtd ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                                <InputField
                                                    label="Jumlah Item"
                                                    type="text"
                                                    value={data[`shipping_${sec.key}_item`] !== null && data[`shipping_${sec.key}_item`] !== '' ? fmt(data[`shipping_${sec.key}_item`]) : ''}
                                                    onChange={e => setData(`shipping_${sec.key}_item`, e.target.value.replace(/\./g, '').replace(/[^\d]/g, ''))}
                                                    disabled={!canEdit}
                                                    suffix="item"
                                                />
                                                <InputField
                                                    label="Jumlah EA"
                                                    type="text"
                                                    value={data[`shipping_${sec.key}_ea`] !== null && data[`shipping_${sec.key}_ea`] !== '' ? fmt(data[`shipping_${sec.key}_ea`]) : ''}
                                                    onChange={e => setData(`shipping_${sec.key}_ea`, e.target.value.replace(/\./g, '').replace(/[^\d]/g, ''))}
                                                    disabled={!canEdit}
                                                    suffix="ea"
                                                />
                                                {sec.hasEtd && (
                                                    <InputField
                                                        label="ETD"
                                                        type="date"
                                                        value={data[`shipping_${sec.key}_etd`] || ''}
                                                        onChange={e => setData(`shipping_${sec.key}_etd`, e.target.value)}
                                                        disabled={!canEdit}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Save Shipping */}
                                {canEdit && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">{processing ? 'sync' : 'save'}</span>
                                            {processing ? 'Menyimpan...' : 'Simpan Data Shipping'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══════════ TAB 4: File Pendukung ════════════════════ */}
                        {activeTab === 3 && (
                            <div className="space-y-6 animate-reveal">
                                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Upload File Pendukung</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1">Sifatnya opsional. Ukuran maksimal 5MB per file.</p>
                                        </div>
                                    </div>

                                    {canEdit && (
                                        <div className={`relative border-2 border-dashed rounded-2xl p-10 transition-all text-center group border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 cursor-pointer`}>
                                            <input 
                                                type="file" 
                                                multiple 
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-2xl">upload_file</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-700 dark:text-white">Klik atau seret file ke area ini</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, JPG, PNG, DOCX (Max 5MB per file)</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {errors.files && (
                                        <div className="flex items-center gap-3 px-5 py-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-reveal">
                                            <span className="material-symbols-outlined text-rose-500">error</span>
                                            <p className="text-xs font-black text-rose-600 dark:text-rose-400">{errors.files}</p>
                                        </div>
                                    )}

                                    {(data.files.length > 0 || data.new_files.length > 0) && (
                                        <div className="space-y-3 mt-6">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daftar File ({data.files.length + data.new_files.length})</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {data.new_files.map((file, idx) => (
                                                    <div key={`new-${idx}`} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-sm">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                                                <span className="material-symbols-outlined">upload_file</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-black text-slate-700 dark:text-white truncate">{file.name}</p>
                                                                <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB • Menunggu Disimpan
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemoveNewFile(idx)}
                                                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                                                                title="Batal Unggah"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {data.files.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                                                                <span className="material-symbols-outlined">description</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-black text-slate-700 dark:text-white truncate">{file.name || file.file_name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                    {file.size ? (typeof file.size === 'string' ? file.size : (file.size / 1024 / 1024).toFixed(2) + ' MB') : 'Server File'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {file.id && (
                                                                <div className="flex items-center gap-1">
                                                                    <a 
                                                                        href={file.url || `/storage/${file.file_path}`} 
                                                                        target="_blank"
                                                                        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                                        title="Lihat File"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                                                    </a>
                                                                    <a 
                                                                        href={file.url || `/storage/${file.file_path}`} 
                                                                        download={file.name || file.file_name}
                                                                        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                                        title="Unduh File"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {canEdit && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleDeleteFile(file.id)}
                                                                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {canEdit && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg">{processing ? 'sync' : 'save'}</span>
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions / Info */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10">
                            <span className="material-symbols-outlined text-slate-400">history</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengubah Terakhir</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-white">{merchandiser.last_modifier || 'Belum ada data'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus File */}
            <Modal show={fileToDelete !== null} onClose={() => setFileToDelete(null)} maxWidth="sm">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <span className="material-symbols-outlined text-3xl">delete_forever</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Hapus File?</h3>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">File yang dihapus tidak dapat dikembalikan lagi. Apakah Anda yakin?</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFileToDelete(null)}
                            className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteFile}
                            className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                        >
                            Hapus File
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
