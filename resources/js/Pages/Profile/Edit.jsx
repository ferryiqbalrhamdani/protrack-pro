import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

export default function Edit({ sessions = [], status }) {
    const user = usePage().props.auth.user;
    const [confirmingSessionId, setConfirmingSessionId] = useState(null);

    const { data, setData, delete: destroy, processing, errors, reset } = useForm({
        password: '',
    });

    const confirmLogout = (sessionId) => {
        setConfirmingSessionId(sessionId);
    };

    const logoutSession = (e) => {
        e.preventDefault();
        destroy(route('profile.sessions.destroy', { session: confirmingSessionId }), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingSessionId(null);
                reset();
            },
            onError: () => {
                // keep modal open on error
            },
        });
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'mobile': return 'smartphone';
            case 'tablet': return 'tablet';
            default: return 'desktop_windows';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="space-y-8 animate-reveal pb-10">
                {/* Status Notifications */}
                {status === 'profile-updated' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 animate-reveal">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Profil berhasil diperbarui!</p>
                    </div>
                )}
                {status === 'password-updated' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 animate-reveal">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Password berhasil diperbarui!</p>
                    </div>
                )}
                {status === 'session-destroyed' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 animate-reveal">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Sesi berhasil dihapus!</p>
                    </div>
                )}

                {/* Premium Profile Header Card */}
                <div className="bg-white dark:bg-black/40 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full" />

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="size-28 rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-xl">
                                <img
                                    src={user.profile_photo_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 size-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                                <span className="material-symbols-outlined text-white text-sm">check</span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                                    {user.name}
                                </h2>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    @{user.username || 'username'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                                {usePage().props.auth.roles?.map((role, i) => (
                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 dark:border-primary/20">
                                        <span className="material-symbols-outlined text-primary dark:text-blue-400 text-base">shield</span>
                                        <span className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">{role}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="material-symbols-outlined text-slate-400 text-base">devices</span>
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{sessions.length} Sesi Aktif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information Card */}
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Informasi Profil</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola nama, username, dan foto Anda</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <UpdateProfileInformationForm />
                            </div>
                        </div>

                        {/* Security Settings Card */}
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">security</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Keamanan</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola kata sandi akun Anda</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <UpdatePasswordForm />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Browser Sessions */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">devices</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Sesi Browser</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola sesi yang aktif & perangkat terhubung</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {sessions.length > 0 ? (
                                    sessions.map((session, index) => (
                                        <div
                                            key={session.id}
                                            className={`p-5 rounded-[1.5rem] border transition-all ${
                                                session.is_current_device
                                                    ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                                    session.is_current_device
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    <span className="material-symbols-outlined text-2xl">{getDeviceIcon(session.device_type)}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-black text-slate-800 dark:text-white truncate">{session.browser}</p>
                                                        {session.is_current_device && (
                                                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white rounded-full whitespace-nowrap">
                                                                Sesi Ini
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{session.os}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px] text-slate-400">language</span>
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">{session.ip_address}</span>
                                                        </div>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">{session.last_active}</span>
                                                        </div>
                                                    </div>

                                                    {!session.is_current_device && (
                                                        <button
                                                            onClick={() => confirmLogout(session.id)}
                                                            className="mt-3 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all border border-red-100 dark:border-red-500/20"
                                                        >
                                                            Keluarkan Sesi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">devices</span>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada data sesi</p>
                                    </div>
                                )}
                            </div>

                            {/* Session Count Footer */}
                            <div className="px-8 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sesi Aktif</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white">{sessions.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Confirmation Modal for Session Logout */}
            {confirmingSessionId && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl"
                        onClick={() => { setConfirmingSessionId(null); reset(); }}
                    />
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300 border border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-500 text-2xl">logout</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">Keluarkan Sesi</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">Masukkan password untuk konfirmasi</p>
                            </div>
                        </div>

                        <form onSubmit={logoutSession}>
                            <div className="space-y-2 mb-6">
                                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1">Password</label>
                                <TextInput
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-red-500/20 outline-none transition-all dark:!text-white"
                                    placeholder="Masukkan password Anda"
                                    autoFocus
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    disabled={processing}
                                >
                                    Keluarkan Sesi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setConfirmingSessionId(null); reset(); }}
                                    className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
