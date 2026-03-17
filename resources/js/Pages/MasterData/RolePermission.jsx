import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function RolePermission({ roles = [], permissions = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        permissions: [],
    });

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingRoleId(null);
        setData({ name: '', permissions: [] });
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (role) => {
        setIsEditMode(true);
        setEditingRoleId(role.id);
        clearErrors();
        
        // Setup data for current role
        setData({
            name: role.name,
            permissions: role.name === 'Super Admin' 
                            ? permissions.map(p => p.name) 
                            : (role.permissions ? role.permissions.map(p => p.name) : []),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('master.data.role.update', editingRoleId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setData({ name: '', permissions: [] });
                    reset();
                },
                onError: () => {
                    toast.error('Terdapat kesalahan input');
                }
            });
        } else {
            post(route('master.data.role.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setData({ name: '', permissions: [] });
                    reset();
                },
                onError: () => {
                    toast.error('Terdapat kesalahan input');
                }
            });
        }
    };

    const openDeleteModal = (id, name) => {
        if (name === 'Super Admin') {
            toast.error('Role Super Admin tidak dapat dihapus');
            return;
        }
        setRoleToDelete({id, name});
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!roleToDelete) return;
        
        destroy(route('master.data.role.destroy', roleToDelete.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setRoleToDelete(null);
            },
            onError: () => toast.error('Gagal menghapus role'),
        });
    };

    const filteredRoles = roles.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const togglePermission = (permName) => {
        const currentPerms = data.permissions || [];
        if (currentPerms.includes(permName)) {
            setData('permissions', currentPerms.filter(p => p !== permName));
        } else {
            setData('permissions', [...currentPerms, permName]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Role & Permission" />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
                <div className="flex flex-col items-start w-full">
                    <Link href={route('master.data.index')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 group/back">
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover/back:-translate-x-1">arrow_back</span>
                        Kembali ke Master Data
                    </Link>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Role & Permission</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola peran pengguna dan konfigurasi hak akses sistem.</p>
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
                        placeholder="Cari role..." 
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
                    Tambah Role Baru
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Nama Role</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap text-right border-b border-slate-100 dark:border-white/5">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredRoles.map((role, i) => (
                                <tr key={role.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade" style={{ animationDelay: `${i * 50 + 100}ms` }}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                                                <span className="material-symbols-outlined">shield_person</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{role.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="relative group/tooltip">
                                                <button onClick={() => openEditModal(role)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                    Edit Role
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                </div>
                                            </div>
                                            {role.name !== 'Super Admin' && (
                                                <div className="relative group/tooltip">
                                                    <button onClick={() => openDeleteModal(role.id, role.name)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                        Hapus Role
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredRoles.length === 0 && (
                        <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-white/[0.01]">
                            <span className="material-symbols-outlined text-7xl text-slate-200 dark:text-slate-700 mb-4 animate-bounce">search_off</span>
                            <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Menampilkan <span className="text-slate-700 dark:text-slate-200">{filteredRoles.length}</span> entri
                    </span>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl" premium={true}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Premium Modal Header */}
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
                                <span className="material-symbols-outlined text-2xl font-fill">{isEditMode ? 'edit' : 'shield_person'}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                    {isEditMode ? 'Edit Role' : 'Tambah Role Baru'}
                                </h2>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Konfigurasi Peran & Otoritas</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)} 
                            className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8 overflow-y-auto no-scrollbar max-h-[60vh]">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <InputLabel htmlFor="role_name" value="Nama Role" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                                <TextInput
                                    id="role_name"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-rose-500/20"
                                    placeholder="Contoh: Admin Keuangan"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Daftar Hak Akses (Permissions)</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {permissions.map((perm) => (
                                        <label key={perm.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${data.permissions.includes(perm.name) ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                                checked={data.permissions.includes(perm.name)}
                                                onChange={() => togglePermission(perm.name)}
                                                disabled={isEditMode && data?.name === 'Super Admin'} // Protect Super Admin check
                                            />
                                            <span className={`text-xs font-bold ${data.permissions.includes(perm.name) ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {perm.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-end gap-3 rounded-b-[2.5rem]">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing} className="rounded-xl px-8 py-3 bg-rose-500 hover:bg-rose-600 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 border-none text-white">
                            {isEditMode ? 'Simpan Perubahan' : 'Simpan Role'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md" premium={true}>
                <div className="p-8 pb-6">
                    <div className="size-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 mb-6 mx-auto">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Hapus Role</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            Apakah Anda yakin ingin menghapus role <span className="font-bold text-slate-800 dark:text-slate-200">"{roleToDelete?.name}"</span>? Semua akses pengguna yang terhubung dengan role ini mungkin akan terdampak.
                        </p>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-center gap-3 rounded-b-[2.5rem]">
                    <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest flex-1 justify-center">
                        Batal
                    </SecondaryButton>
                    <button 
                        onClick={confirmDelete}
                        disabled={processing}
                        className="rounded-xl px-6 py-3 bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest flex-1 justify-center transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        Ya, Hapus Role
                    </button>
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
