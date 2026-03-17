import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className="space-y-6">
            <DangerButton 
                onClick={confirmUserDeletion}
                className="!px-10 !py-4 !bg-red-600 dark:!bg-red-500 !text-white !rounded-2xl !font-black !uppercase !tracking-[0.2em] !text-[10px] shadow-xl shadow-red-500/20 hover:!-translate-y-1 transition-all active:scale-95"
            >
                Deactivate Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-10 bg-white dark:bg-slate-900 rounded-[3rem]">
                    <div className="size-20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                        <span className="material-symbols-outlined text-4xl font-bold">warning</span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight text-center mb-4 italic">
                        Confirm Account Deactivation
                    </h2>

                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center leading-relaxed mb-8">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm.
                    </p>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="password">Confirmation Password</label>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                            isFocused
                            placeholder="Type your password..."
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="mt-10 flex flex-col md:flex-row gap-4">
                        <SecondaryButton 
                            onClick={closeModal}
                            className="flex-1 !py-4 !justify-center !rounded-2xl !text-[10px] !font-black !uppercase !tracking-[0.2em]"
                        >
                            Nevermind, Cancel
                        </SecondaryButton>

                        <DangerButton 
                            className="flex-1 !py-4 !justify-center !bg-red-600 dark:!bg-red-500 !text-white !rounded-2xl !font-black !uppercase !tracking-[0.2em] !text-[10px] shadow-xl shadow-red-500/20 hover:!-translate-y-1 transition-all active:scale-95" 
                            disabled={processing}
                        >
                            Yes, Deactivate
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
