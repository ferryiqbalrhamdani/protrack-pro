import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function User({ users = [], roles = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        roles: [],
    });

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingUserId(null);
        setData({ name: '', username: '', email: '', password: '', roles: [] });
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setEditingUserId(user.id);
        clearErrors();
        setData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '',
            roles: user.roles.map(r => r.name),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('master.data.user.update', editingUserId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setData({ name: '', username: '', email: '', password: '', roles: [] });
                    reset();
                },
                onError: () => {
                    toast.error('Terdapat kesalahan input');
                }
            });
        } else {
            post(route('master.data.user.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setData({ name: '', username: '', email: '', password: '', roles: [] });
                    reset();
                },
                onError: () => {
                    toast.error('Terdapat kesalahan input');
                }
            });
        }
    };

    const handleDelete = (id, username) => {
        if (username === 'admin') {
            toast.error('User admin tidak dapat dihapus');
            return;
        }
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            destroy(route('master.data.user.destroy', id));
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.roles.some(role => role.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleRole = (roleName) => {
        const currentRoles = data.roles || [];
        if (currentRoles.includes(roleName)) {
            setData('roles', currentRoles.filter(r => r !== roleName));
        } else {
            setData('roles', [...currentRoles, roleName]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Pengguna" />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
                <div className="flex flex-col items-start w-full">
                    <Link href={route('master.data.index')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 group/back">
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover/back:-translate-x-1">arrow_back</span>
                        Kembali ke Master Data
                    </Link>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Data Pengguna</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola hak akses dan peran (role) pengguna sistem.</p>
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
                        placeholder="Cari pengguna, email, atau role..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 shadow-sm dark:text-white"
                    />
                </div>
                
                <button 
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold text-sm hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Pengguna
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Pengguna</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Kontak</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Role Akses</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-100 dark:border-white/5">Dibuat Pada</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap text-right border-b border-slate-100 dark:border-white/5">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredUsers.map((user, i) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group animate-slide-up-fade" style={{ animationDelay: `${i * 50 + 100}ms` }}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all border border-slate-100 dark:border-white/10">
                                                <img 
                                                    alt="Profile" 
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=a855f7&color=fff&bold=true`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{user.name}</span>
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">@{user.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl w-max border border-slate-100 dark:border-white/5">
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                                            {user.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                                            {user.username === 'admin' ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300 shadow-sm shadow-purple-500/5">Semua Role(Admin)</span>
                                            ) : (
                                                user.roles.length > 0 ? user.roles.map((role, idx) => (
                                                    <span key={idx} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                        role.name === 'Super Admin' 
                                                        ? 'bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300 shadow-purple-500/5' 
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 shadow-slate-500/5'
                                                    }`}>
                                                        {role.name}
                                                    </span>
                                                )) : (
                                                    <span className="text-xs italic text-slate-400">Belum ada role</span>
                                                )
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="relative group/tooltip">
                                                <button onClick={() => openEditModal(user)} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all border border-transparent hover:border-purple-100 dark:hover:border-purple-500/20">
                                                    <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                    Edit Pengguna / Role
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                </div>
                                            </div>
                                            <div className="relative group/tooltip">
                                                <button onClick={() => handleDelete(user.id, user.username)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-10 shadow-xl">
                                                    Hapus Pengguna
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                        <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-white/[0.01]">
                            <span className="material-symbols-outlined text-7xl text-slate-200 dark:text-slate-700 mb-4 animate-bounce">search_off</span>
                            <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pengguna tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer - Simplified */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Menampilkan <span className="text-slate-700 dark:text-slate-200">{filteredUsers.length}</span> entri
                    </span>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl" premium={true}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Premium Modal Header */}
                    <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-lg shadow-purple-500/10">
                                <span className="material-symbols-outlined text-2xl font-fill">{isEditMode ? 'manage_accounts' : 'person_add'}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                    {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                </h2>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Manajemen Pengguna & Akses</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <InputLabel htmlFor="name" value="Nama Lengkap" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                                <TextInput
                                    id="name"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="Contoh: Ahmad Sulaiman"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <InputLabel htmlFor="username" value="Username" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                                <TextInput
                                    id="username"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="ahmad.s"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <InputLabel htmlFor="email" value="Alamat Email" className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="ahmad@example.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <InputLabel htmlFor="password" value={isEditMode ? "Password (Kosongkan jika tidak ingin mengubah)" : "Password"} className="text-[10px] uppercase tracking-widest font-black text-slate-400" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required={!isEditMode}
                                />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Hak Akses (Role)</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {roles.map((role) => (
                                        <label key={role.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-500/20 group">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                checked={data.roles.includes(role.name)}
                                                onChange={() => toggleRole(role.name)}
                                            />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{role.name}</span>
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
                        <PrimaryButton type="submit" disabled={processing} className="rounded-xl px-8 py-3 bg-purple-500 hover:bg-purple-600 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 border-none text-white">
                            {isEditMode ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                        </PrimaryButton>
                    </div>
                </form>
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
