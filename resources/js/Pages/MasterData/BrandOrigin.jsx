import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function BrandOrigin({ brandOrigins, filters }) {
    const { data: brandOriginData, links } = brandOrigins;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Certification Management State
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [activeBrandForCert, setActiveBrandForCert] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    const certForm = useForm({
        name: '',
    });

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (brand) => {
        setModalMode('edit');
        setSelectedBrand(brand);
        setData({
            name: brand.name,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('master.data.brand-origin.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            put(route('master.data.brand-origin.update', selectedBrand.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const confirmDelete = (brand) => {
        setSelectedBrand(brand);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        destroy(route('master.data.brand-origin.destroy', selectedBrand.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    // Certification Logic
    const openCertModal = (brand) => {
        setActiveBrandForCert(brand);
        certForm.reset();
        setIsCertModalOpen(true);
    };

    const handleAddCert = (e) => {
        e.preventDefault();
        certForm.post(route('master.data.brand-origin.certification.store', activeBrandForCert.id), {
            onSuccess: () => {
                certForm.reset();
                // We need to update activeBrandForCert with new data if we want immediate UI update in modal
                // But Inertia will reload the page data so brandOriginData will be fresh.
                // We find the updated brand in the new data
            },
        });
    };

    const handleDeleteCert = (certId) => {
        certForm.delete(route('master.data.brand-origin.certification.destroy', certId), {
            onSuccess: () => {
            },
        });
    };

    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (!isFirstRender) {
            const timeoutId = setTimeout(() => {
                router.get(route('master.data.brand-origin'), { search: searchQuery }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }, 300);
            return () => clearTimeout(timeoutId);
        }
        setIsFirstRender(false);
    }, [searchQuery]);

    const filteredBrands = brandOriginData;

    // Get current version of active brand from fresh data
    const currentActiveBrand = activeBrandForCert ? brandOriginData.find(b => b.id === activeBrandForCert.id) : null;

    return (
        <AuthenticatedLayout>
            <Head title="Asal Brand & Sertifikasi" />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
                <div className="flex flex-col items-start w-full">
                    <Link href={route('master.data.index')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 group/back">
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover/back:-translate-x-1">arrow_back</span>
                        Kembali ke Master Data
                    </Link>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Asal Brand & Sertifikasi</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola asal brand produk dan daftar sertifikasi pendukungnya.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">search</span>
                    <input 
                        type="text" 
                        placeholder="Cari asal brand..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-sm dark:text-white"
                    />
                </div>
                
                <button 
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Asal Brand
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Asal Brand</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Jumlah Sertifikasi</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Daftar Sertifikasi</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap text-right border-b border-slate-100 dark:border-white/5">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredBrands.map((brand, i) => (
                                <tr key={brand.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade" style={{ animationDelay: `${i * 50 + 100}ms` }}>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                                                <span className="material-symbols-outlined">branding_watermark</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{brand.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                            {brand.certifications?.length || 0} Sertifikasi
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1.5 max-w-md">
                                            {brand.certifications?.slice(0, 3).map(cert => (
                                                <span key={cert.id} className="inline-flex items-center px-2 py-0.5 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-md border border-rose-100 dark:border-rose-500/10 whitespace-nowrap">
                                                    {cert.name}
                                                </span>
                                            ))}
                                            {(brand.certifications?.length > 3) && (
                                                <span className="text-[10px] font-bold text-slate-400">+{brand.certifications.length - 3} lainnya</span>
                                            )}
                                            {(!brand.certifications || brand.certifications.length === 0) && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="relative group/tooltip">
                                                <button 
                                                    onClick={() => openCertModal(brand)}
                                                    className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-500/20"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">verified</span>
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                    Kelola Sertifikasi
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                </div>
                                            </div>
                                            <div className="relative group/tooltip">
                                                <button 
                                                    onClick={() => openEditModal(brand)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                    Edit Data
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                </div>
                                            </div>
                                            <div className="relative group/tooltip">
                                                <button 
                                                    onClick={() => confirmDelete(brand)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                    Hapus Data
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredBrands.length === 0 && (
                        <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-white/[0.01]">
                            <span className="material-symbols-outlined text-7xl text-slate-200 dark:text-slate-700 mb-4 animate-bounce">search_off</span>
                            <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Asal brand tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Menampilkan <span className="text-slate-700 dark:text-slate-200">{brandOrigins.from || 0}</span> hingga <span className="text-slate-700 dark:text-slate-200">{brandOrigins.to || 0}</span> dari <span className="text-slate-700 dark:text-slate-200">{brandOrigins.total}</span> entri
                    </span>
                    <Pagination links={brandOrigins.links} />
                </div>
            </div>

            {/* Brand Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl" premium={true}>
                <form onSubmit={submit} className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
                                <span className="material-symbols-outlined text-2xl font-fill">branding_watermark</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                    {modalMode === 'create' ? 'Tambah Asal Brand' : 'Edit Asal Brand'}
                                </h2>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Informasi Master Data</p>
                            </div>
                        </div>
                        <button type="button" onClick={closeModal} className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <InputLabel htmlFor="brand_name" value="Nama Negara / Asal Brand" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                            <TextInput
                                id="brand_name"
                                value={data.name}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20"
                                placeholder="Contoh: Indonesia, Jerman, Jepang"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-end gap-3 rounded-b-[2.5rem]">
                        <SecondaryButton onClick={closeModal} disabled={processing} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="rounded-xl px-8 py-3 bg-rose-500 hover:bg-rose-600 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 border-none text-white">
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Certification Management Modal */}
            <Modal show={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} maxWidth="2xl" premium={true}>
                <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                                <span className="material-symbols-outlined text-2xl font-fill">verified</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Kelola Sertifikasi</h2>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Brand: {currentActiveBrand?.name}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsCertModalOpen(false)} className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Add Certification Form */}
                        <form onSubmit={handleAddCert} className="flex gap-3 mb-8">
                            <div className="flex-1">
                                <TextInput
                                    value={certForm.data.name}
                                    placeholder="Tambah sertifikasi baru (e.g. SNI, TKDN, ISO)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20"
                                    onChange={(e) => certForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={certForm.errors.name} />
                            </div>
                            <PrimaryButton 
                                disabled={certForm.processing}
                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 border-none text-white whitespace-nowrap"
                            >
                                {certForm.processing ? '...' : 'Tambah'}
                            </PrimaryButton>
                        </form>

                        {/* Certifications List */}
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daftar Sertifikasi Aktif</h4>
                            {currentActiveBrand?.certifications?.map(cert => (
                                <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{cert.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteCert(cert.id)}
                                        disabled={certForm.processing}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                            {(!currentActiveBrand?.certifications || currentActiveBrand.certifications.length === 0) && (
                                <div className="py-8 text-center bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada sertifikasi terdaftar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Brand Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
                    <div className="size-20 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">delete_forever</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Hapus Asal Brand?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 px-4">
                        Menghapus <strong>{selectedBrand?.name}</strong>? Tindakan ini akan menghapus semua sertifikasi terkait.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} disabled={processing} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20">
                            Ya, Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up-fade {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
