import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            employee_id: 'PR7842', // Dummy for now
            department: 'Operations',
            position: 'Senior Project Manager',
            joined_date: '2021-03-12',
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <form onSubmit={submit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="name">Full Name</label>
                    <TextInput
                        id="name"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="email">Email Address</label>
                    <TextInput
                        id="email"
                        type="email"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Employee ID */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="employee_id">Employee ID</label>
                    <TextInput
                        id="employee_id"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.employee_id}
                        onChange={(e) => setData('employee_id', e.target.value)}
                        readOnly
                    />
                </div>

                {/* Department */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="department">Department</label>
                    <TextInput
                        id="department"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.department}
                        onChange={(e) => setData('department', e.target.value)}
                    />
                </div>

                {/* Position */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="position">Position</label>
                    <TextInput
                        id="position"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.position}
                        onChange={(e) => setData('position', e.target.value)}
                    />
                </div>

                {/* Joined Date */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="joined_date">Joined Date</label>
                    <TextInput
                        id="joined_date"
                        type="date"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white dark:[color-scheme:dark]"
                        value={data.joined_date}
                        onChange={(e) => setData('joined_date', e.target.value)}
                    />
                </div>
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
                        Your email address is unverified.
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="ml-2 underline hover:text-amber-900 transition-colors"
                        >
                            Click here to re-send.
                        </Link>
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="mt-2 text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            A new verification link has been sent.
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-6 pt-4">
                <PrimaryButton 
                    className="!px-10 !py-4 !bg-slate-900 dark:!bg-white dark:!text-slate-900 !rounded-2xl !font-black !uppercase !tracking-[0.2em] !text-[10px] shadow-xl hover:!-translate-y-1 transition-all active:scale-95" 
                    disabled={processing}
                >
                    Save Information
                </PrimaryButton>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                        Profile Updated Successfully
                    </p>
                </Transition>
            </div>
        </form>
    );
}
