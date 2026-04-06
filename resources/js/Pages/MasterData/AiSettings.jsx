import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function AiSettings({ settings }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [testingId, setTestingId] = useState(null); // tracks which row is being tested
    const [isCustomMode, setIsCustomMode] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        provider: '',
        api_key: '',
        model: '',
        is_active: false,
    });

    const openModal = (setting = null) => {
        if (setting) {
            setEditData(setting);
            const isCustom = !Object.values(providersConfig).flat().includes(setting.model);
            setIsCustomMode(isCustom);
            setData({
                provider: setting.provider,
                api_key: setting.api_key,
                model: setting.model,
                is_active: !!setting.is_active,
            });
        } else {
            setEditData(null);
            setIsCustomMode(false);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        setIsCustomMode(false);
        reset();
    };

    const providersConfig = {
        'Groq': [
            'llama-3.3-70b-versatile',
            'llama-3.1-70b-versatile',
            'mixtral-8x7b-32768',
            'llama3-8b-8192',
        ],
        'Gemini': [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp',
        ],
        'OpenRouter': [
            'openai/gpt-4o-mini',
            'anthropic/claude-3.5-sonnet',
            'deepseek/deepseek-chat',
            'google/gemini-flash-1.5',
            'meta-llama/llama-3.3-70b-instruct',
        ],
        'GitHub Models': [
            'gpt-4o',
            'gpt-4o-mini',
            'phi-3-medium-128k-instruct',
            'Llama-3.3-70B-Instruct',
            'Mistral-large-2407',
        ]
    };

    const handleProviderChange = (e) => {
        const val = e.target.value;
        const defaultModel = providersConfig[val]?.[0] || '';
        setIsCustomMode(false);
        setData(d => ({ ...d, provider: val, model: defaultModel }));
    };

    const handleModelChange = (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            setIsCustomMode(true);
            setData('model', '');
        } else {
            setIsCustomMode(false);
            setData('model', val);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editData) {
            put(route('master.data.ai-setting.update', editData.id), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Konfigurasi AI berhasil diperbarui');
                },
            });
        } else {
            post(route('master.data.ai-setting.store'), {
                onSuccess: () => {
                    closeModal();
                    toast.success('Konfigurasi AI berhasil ditambahkan');
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus konfigurasi ini?')) {
            destroy(route('master.data.ai-setting.destroy', id), {
                onSuccess: () => toast.success('Konfigurasi AI berhasil dihapus'),
            });
        }
    };

    const toggleActive = (setting) => {
        put(route('master.data.ai-setting.update', setting.id), {
            data: { ...setting, is_active: !setting.is_active },
            onSuccess: () => toast.success('Status aktif berhasil diubah'),
        });
    };

    const handleTestConnection = async (setting) => {
        setTestingId(setting.id);
        const toastId = `test-${setting.id}`;
        toast.loading(`Menguji koneksi ${setting.provider}...`, { id: toastId });
        try {
            const res = await axios.post(route('master.data.ai-setting.test', setting.id));
            if (res.data.success) {
                toast.success(res.data.message, { id: toastId, duration: 5000 });
            } else {
                toast.error(res.data.message, { id: toastId, duration: 6000 });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menghubungi server.';
            toast.error(msg, { id: toastId, duration: 6000 });
        } finally {
            setTestingId(null);
        }
    };

    const { permissions, is_admin } = usePage().props.auth;
    const hasPermission = (permission_name) => is_admin || permissions.includes(permission_name);
    const canManageAi = hasPermission('manage_ai_configuration');

    return (
        <AuthenticatedLayout>
            <Head title="Konfigurasi AI" />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Konfigurasi AI</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-tight">Kelola API Provider dan API Key untuk AI Auditor.</p>
                </div>
                {canManageAi && (
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-bold text-sm transition-all shadow-lg shadow-blue-500/25 group"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">add</span>
                        Tambah Provider
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">Provider</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">Model</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">API Key</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {settings.map((setting) => (
                                <tr key={setting.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-xl flex items-center justify-center font-black text-xs ${
                                                setting.provider === 'Groq' ? 'bg-orange-500/10 text-orange-500' : 
                                                setting.provider === 'Gemini' ? 'bg-blue-500/10 text-blue-500' :
                                                setting.provider === 'OpenRouter' ? 'bg-purple-500/10 text-purple-500' :
                                                'bg-slate-500/10 text-slate-500'
                                            }`}>
                                                {setting.provider.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{setting.provider}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{setting.model}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <code className="text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md text-slate-400 font-mono">
                                            {setting.api_key.substring(0, 8)}...{setting.api_key.substring(setting.api_key.length - 4)}
                                        </code>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            {setting.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Test Connection — available to everyone */}
                                            <button
                                                onClick={() => handleTestConnection(setting)}
                                                disabled={testingId === setting.id}
                                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-wait"
                                                title="Test Koneksi"
                                            >
                                                {testingId === setting.id ? (
                                                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-xl">wifi_tethering</span>
                                                )}
                                            </button>

                                            {canManageAi ? (
                                                <>
                                                    <button
                                                        onClick={() => openModal(setting)}
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(setting.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Hapus"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">delete</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Akses Terbatas</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {settings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <span className="material-symbols-outlined text-6xl mb-4">smart_toy</span>
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Belum ada konfigurasi AI</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                {editData ? 'Edit Konfigurasi' : 'Tambah Konfigurasi'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi parameter API Provider</p>
                        </div>
                        <button type="button" onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Provider</label>
                            <select
                                value={data.provider}
                                onChange={handleProviderChange}
                                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                required
                            >
                                <option value="" disabled>Pilih Provider</option>
                                <option value="Groq">Groq (Llama 3.3)</option>
                                <option value="Gemini">Gemini API (Google)</option>
                                <option value="OpenRouter">OpenRouter</option>
                                <option value="GitHub Models">GitHub Models</option>
                            </select>
                            {errors.provider && <p className="mt-1 text-xs text-red-500">{errors.provider}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Model Name</label>
                            <select
                                value={isCustomMode ? 'custom' : data.model}
                                onChange={handleModelChange}
                                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                required
                            >
                                <option value="" disabled>Pilih Model</option>
                                {data.provider && providersConfig[data.provider]?.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                                {data.provider && <option value="custom">-- Masukkan Nama Model Custom --</option>}
                            </select>
                            {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
                        </div>

                        {isCustomMode && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Custom Model Name</label>
                                <input
                                    type="text"
                                    value={data.model}
                                    onChange={e => setData('model', e.target.value)}
                                    placeholder="e.g. gpt-4-turbo"
                                    className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all border border-blue-500/20"
                                    required
                                />
                                <p className="mt-1 text-[9px] text-slate-400 italic px-1">Gunakan nama model sesuai dokumentasi API provider</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">API Key</label>
                            <input
                                type="password"
                                value={data.api_key}
                                onChange={e => setData('api_key', e.target.value)}
                                placeholder="Masukkan API Key"
                                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                required
                            />
                            {errors.api_key && <p className="mt-1 text-xs text-red-500">{errors.api_key}</p>}
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="size-5 rounded-lg border-blue-500/20 text-blue-600 focus:ring-blue-500/20 bg-white dark:bg-white/10"
                            />
                            <label htmlFor="is_active" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                                Setel sebagai provider aktif (Default)
                            </label>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25"
                        >
                            {processing ? 'Menyimpan...' : (editData ? 'Simpan Perubahan' : 'Tambah Provider')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
