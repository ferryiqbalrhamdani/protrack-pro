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

export default function AuctionType({ auctionTypes, filters }) {
    const { data: auctionTypeData, links, meta } = auctionTypes;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedAuctionType, setSelectedAuctionType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        status: 'Active',
    });

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (type) => {
        setModalMode('edit');
        setSelectedAuctionType(type);
        setData({
            name: type.name,
            status: type.status,
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
            post(route('master.data.auction-type.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            put(route('master.data.auction-type.update', selectedAuctionType.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const confirmDelete = (type) => {
        setSelectedAuctionType(type);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        destroy(route('master.data.auction-type.destroy', selectedAuctionType.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (!isFirstRender) {
            const timeoutId = setTimeout(() => {
                router.get(route('master.data.auction-type'), { search: searchQuery }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }, 300);
            return () => clearTimeout(timeoutId);
        }
        setIsFirstRender(false);
    }, [searchQuery]);

    const filteredTypes = auctionTypeData;

    return (
        <AuthenticatedLayout>
            <Head title="Jenis Lelang" />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
                <div className="flex flex-col items-start w-full">
                    <Link href={route('master.data.index')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 group/back">
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover/back:-translate-x-1">arrow_back</span>
                        Kembali ke Master Data
                    </Link>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Jenis Lelang</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola kategori jenis pelelangan proyek sesuai regulasi.</p>
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
                        placeholder="Cari jenis lelang..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-sm dark:text-white"
                    />
                </div>
                
                <button 
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Jenis Lelang
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Jenis Pelelangan</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap text-right border-b border-slate-100 dark:border-white/5">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredTypes.map((type, i) => (
                                <tr key={type.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade" style={{ animationDelay: `${i * 50 + 100}ms` }}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                                                <span className="material-symbols-outlined">gavel</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{type.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                            type.status === 'Active' 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 shadow-emerald-500/5' 
                                            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 shadow-slate-500/5'
                                        }`}>
                                            <span className={`size-1.5 rounded-full ${type.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                            {type.status === 'Active' ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="relative group/tooltip">
                                                <button 
                                                    onClick={() => openEditModal(type)}
                                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20"
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
                                                    onClick={() => confirmDelete(type)}
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
                    
                    {filteredTypes.length === 0 && (
                        <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-white/[0.01]">
                            <span className="material-symbols-outlined text-7xl text-slate-200 dark:text-slate-700 mb-4 animate-bounce">search_off</span>
                            <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Jenis lelang tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Menampilkan <span className="text-slate-700 dark:text-slate-200">{auctionTypes.from || 0}</span> hingga <span className="text-slate-700 dark:text-slate-200">{auctionTypes.to || 0}</span> dari <span className="text-slate-700 dark:text-slate-200">{auctionTypes.total}</span> entri
                    </span>
                    <Pagination links={auctionTypes.links} />
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl" premium={true}>
                <form onSubmit={submit} className="flex flex-col h-full">
                    {/* Premium Modal Header */}
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
                                <span className="material-symbols-outlined text-2xl font-fill">gavel</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                    {modalMode === 'create' ? 'Tambah Jenis Lelang' : 'Edit Jenis Lelang'}
                                </h2>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Informasi Master Data</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={closeModal} 
                            className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <InputLabel htmlFor="name" value="Nama Jenis Lelang" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20"
                                placeholder="Contoh: Lelang Umum"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="status" value="Status" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                            <select
                                id="status"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 appearance-none pl-4 pr-10"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                required
                            >
                                <option value="Active">Aktif</option>
                                <option value="Inactive">Non-Aktif</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-end gap-3 rounded-b-[2.5rem]">
                        <SecondaryButton onClick={closeModal} disabled={processing} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="rounded-xl px-8 py-3 bg-blue-500 hover:bg-blue-600 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 border-none text-white">
                            {processing ? 'Menyimpan...' : (modalMode === 'create' ? 'Simpan Data' : 'Perbarui Data')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
                    <div className="size-20 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">delete_forever</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Hapus Data?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 px-4">
                        Apakah Anda yakin ingin menghapus <strong>{selectedAuctionType?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} disabled={processing} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20">
                            {processing ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
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
