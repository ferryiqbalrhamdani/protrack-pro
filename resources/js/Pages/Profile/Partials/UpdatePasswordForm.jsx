import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <div className="space-y-8">
            {/* Password Row */}
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-6">
                    <div className="size-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">lock</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Password</h4>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Last changed 3 months ago</p>
                    </div>
                </div>
                <button 
                    onClick={() => document.getElementById('password-form-overlay').classList.toggle('hidden')}
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm"
                >
                    Change Password
                </button>
            </div>

            {/* Hidden Form Overlay / Modal Style */}
            <div id="password-form-overlay" className="hidden animate-reveal p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-8">
                <form onSubmit={updatePassword} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Current Password</label>
                            <TextInput
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="w-full !py-4 !px-6 !bg-white dark:!bg-slate-900 !border-slate-100 dark:!border-slate-800 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                                autoComplete="current-password"
                            />
                            <InputError message={errors.current_password} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">New Password</label>
                            <TextInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="w-full !py-4 !px-6 !bg-white dark:!bg-slate-900 !border-slate-100 dark:!border-slate-800 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Confirm Password</label>
                            <TextInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="w-full !py-4 !px-6 !bg-white dark:!bg-slate-900 !border-slate-100 dark:!border-slate-800 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <PrimaryButton 
                            className="!px-10 !py-4 !bg-slate-900 dark:!bg-white dark:!text-slate-900 !rounded-2xl !font-black !uppercase !tracking-[0.2em] !text-[10px] shadow-xl hover:!-translate-y-1 transition-all active:scale-95" 
                            disabled={processing}
                        >
                            Update Password
                        </PrimaryButton>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Saved Successfully</p>
                        </Transition>
                    </div>
                </form>
            </div>

            {/* 2FA Row */}
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-6">
                    <div className="size-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">verified_user</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Two-Factor Authentication</h4>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Add an extra layer of security to your account</p>
                    </div>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative shadow-lg shadow-primary/20">
                    <div className="absolute top-1 left-7 size-4 bg-white rounded-full transition-all" />
                </button>
            </div>
        </div>
    );
}
