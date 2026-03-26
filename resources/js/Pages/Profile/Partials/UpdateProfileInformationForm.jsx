import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdateProfileInformation({ className = '' }) {
    const user = usePage().props.auth.user;
    const photoInput = useRef();
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        username: user.username || '',
        email: user.email || '',
        profile_photo: null,
    });

    const selectNewPhoto = () => {
        photoInput.current.click();
    };

    const updatePhotoPreview = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('profile_photo', file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* Profile Photo */}
            <div className="flex items-center gap-8">
                <div className="relative group/avatar cursor-pointer" onClick={selectNewPhoto}>
                    <div className="size-24 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-xl">
                        <img
                            src={photoPreview || user.profile_photo_url}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                    </div>
                    <input
                        type="file"
                        ref={photoInput}
                        onChange={updatePhotoPreview}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={selectNewPhoto}
                        className="text-sm font-black text-primary dark:text-blue-400 uppercase tracking-widest hover:underline"
                    >
                        Ubah Foto
                    </button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JPG, PNG. Max 2MB</p>
                    {errors.profile_photo && <InputError message={errors.profile_photo} />}
                </div>
            </div>

            {/* Name, Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="name">Nama Lengkap</label>
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

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="username">Username</label>
                    <TextInput
                        id="username"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        required
                    />
                    <InputError message={errors.username} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1" htmlFor="email">Email <span className="text-slate-300 dark:text-slate-600">(Opsional)</span></label>
                    <TextInput
                        id="email"
                        type="email"
                        className="w-full !py-4 !px-6 !bg-slate-50 dark:!bg-white/5 !border-slate-100 dark:!border-white/5 !rounded-2xl !text-sm !font-bold focus:!ring-2 focus:!ring-primary/20 outline-none transition-all dark:!text-white"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        placeholder="contoh@email.com"
                    />
                    <InputError message={errors.email} />
                </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
                <button
                    type="submit"
                    className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                    disabled={processing}
                >
                    Simpan Perubahan
                </button>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Berhasil Disimpan
                    </p>
                </Transition>
            </div>
        </form>
    );
}
