import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ErrorPage({ status }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Halaman Tidak Ditemukan',
        403: '403: Akses Ditolak',
    }[status] || 'Error';

    const description = {
        503: 'Maaf, kami sedang melakukan pemeliharaan rutin. Silakan coba beberapa saat lagi.',
        500: 'Maaf, terjadi kesalahan pada server kami. Silakan coba kembali nanti.',
        404: 'Maaf, halaman yang Anda tuju tidak dapat ditemukan atau telah dipindahkan.',
        403: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.',
    }[status] || 'Terjadi kesalahan sistem yang tidak diketahui.';

    const illustration = {
        503: 'engineering',
        500: 'cloud_off',
        404: 'travel_explore',
        403: 'lock',
    }[status] || 'error';

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 relative overflow-hidden font-display selection:bg-primary/20">
            <Head title={title} />
            
            {/* Background glowing elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="max-w-2xl w-full text-center relative z-10"
            >
                {/* 3D-like Floating Icon Container */}
                <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.6, duration: 1 }}
                    className="size-48 mx-auto bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl shadow-primary/20 dark:shadow-none flex items-center justify-center mb-10 border border-slate-100 dark:border-white/5 relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <motion.span 
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="material-symbols-outlined text-[90px] text-primary relative z-10"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 48" }}
                    >
                        {illustration}
                    </motion.span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-8xl md:text-9xl font-black text-slate-800 dark:text-white tracking-tighter mb-4 drop-shadow-sm flex items-center justify-center gap-2">
                        {status.toString().split('').map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1), type: 'spring' }}
                                className="inline-block bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-400"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </h1>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400 mb-12 max-w-lg mx-auto leading-relaxed"
                >
                    {description}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-sm tracking-widest uppercase hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 group"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                        Kembali ke Beranda
                    </Link>
                </motion.div>
            </motion.div>

            {/* Decorative Orbs */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: ["0%", "100%", "0%"],
                        x: ["0%", "50%", "-50%", "0%"],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${['rgba(99,102,241,0.15)', 'rgba(236,72,153,0.15)', 'rgba(56,189,248,0.15)'][i % 3]} 0%, transparent 70%)`,
                        width: Math.random() * 400 + 200,
                        height: Math.random() * 400 + 200,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                />
            ))}
        </div>
    );
}
