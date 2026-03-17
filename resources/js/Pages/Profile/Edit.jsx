import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="space-y-8 animate-reveal pb-10">
                {/* Premium Profile Header Card */}
                <div className="bg-white dark:bg-black/40 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar with Edit Overlay */}
                        <div className="relative group/avatar">
                            <div className="size-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-xl">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a2b3c&color=fff&size=128`} 
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute -bottom-2 -right-2 size-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-slate-800">
                                <span className="material-symbols-outlined text-lg">photo_camera</span>
                            </button>
                        </div>

                        {/* User Info & Meta */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1 uppercase italic">
                                    {user.name}
                                </h2>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Senior Project Manager
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">badge</span>
                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">PR7842</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">corporate_fare</span>
                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Operations</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Jakarta, ID</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Info & Security) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information Card */}
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white italic uppercase tracking-tight">Personal Information</h3>
                                </div>
                                <span className="material-symbols-outlined text-slate-300">info</span>
                            </div>
                            <div className="p-8">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        </div>

                        {/* Security Settings Card */}
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">security</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white italic uppercase tracking-tight">Security Settings</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <UpdatePasswordForm />
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Preferences, Notifications, Danger Zone) */}
                    <div className="space-y-8">
                        {/* Account Preferences Card */}
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden p-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white italic uppercase tracking-tight mb-8">Account Preferences</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Display Language</label>
                                    <div className="relative group">
                                        <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl py-4 pl-5 pr-12 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white appearance-none cursor-pointer">
                                            <option>English (United States)</option>
                                            <option>Bahasa Indonesia</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none group-hover:translate-y-px transition-transform">expand_more</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Time Zone</label>
                                    <div className="relative group">
                                        <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl py-4 pl-5 pr-12 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white appearance-none cursor-pointer">
                                            <option>(GMT+07:00) Western Indonesia Time</option>
                                            <option>(GMT-06:00) Central Time</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none group-hover:translate-y-px transition-transform">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications Card */}
                        <div className="bg-white dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden p-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white italic uppercase tracking-tight mb-8">Notifications</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Email Notifications', active: true },
                                    { label: 'Desktop Alerts', active: false },
                                    { label: 'Project Updates', active: true },
                                    { label: 'Team Mentions', active: true },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                                        <button className={`w-12 h-6 rounded-full transition-colors relative ${item.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-white/5'}`}>
                                            <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${item.active ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Danger Zone Card */}
                        <div className="bg-red-50 dark:bg-red-500/5 rounded-[2.5rem] border border-red-100 dark:border-red-500/10 p-8 space-y-4">
                            <h3 className="text-sm font-black text-red-600 dark:text-red-500 uppercase tracking-widest">Danger Zone</h3>
                            <p className="text-[11px] font-bold text-red-500/60 leading-relaxed uppercase tracking-widest">
                                Once you deactivate your account, there is no going back. Please be certain.
                            </p>
                            <DeleteUserForm />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
