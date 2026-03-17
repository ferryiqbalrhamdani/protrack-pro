import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function MasterDataIndex() {
    const { permissions, is_admin } = usePage().props.auth;

    const hasPermission = (permission_name) => {
        if (is_admin) return true;
        return permissions.includes(permission_name);
    }
    const masterDataMenus = [
        { 
            title: 'Data Perusahaan', 
            description: 'Kelola informasi Perusahaan klien dan grup perusahaan.',
            icon: 'corporate_fare', 
            href: route('master.data.company'),
            color: 'blue',
            permission: 'view_master_company'
        },
        { 
            title: 'Data Instansi', 
            description: 'Kelola daftar Instansi pemerintah atau swasta terkait proyek.',
            icon: 'account_balance', 
            href: route('master.data.agency'),
            color: 'emerald',
            permission: 'view_master_agency'
        },
        { 
            title: 'Data Vendor', 
            description: 'Kelola daftar Vendor, sub-kontraktor, dan relasi penyedia barang/jasa.',
            icon: 'store', 
            href: route('master.data.vendor'),
            color: 'amber',
            permission: 'view_master_vendor'
        },
        { 
            title: 'Jenis Lelang', 
            description: 'Kelola kategori jenis pelelangan proyek (Lelang, Penunjukan Langsung).',
            icon: 'gavel', 
            href: route('master.data.auction-type'),
            color: 'blue',
            permission: 'view_master_auction_type'
        },
        { 
            title: 'Jenis Anggaran', 
            description: 'Kelola jenis sumber pendanaan anggaran (APBN, APBD, Swasta).',
            icon: 'payments', 
            href: route('master.data.budget-type'),
            color: 'emerald',
            permission: 'view_master_budget_type'
        },
        { 
            title: 'Asal Brand & Sertifikasi', 
            description: 'Kelola asal brand produk dan sertifikasi pendukung yang terkait.',
            icon: 'branding_watermark', 
            href: route('master.data.brand-origin'),
            color: 'rose',
            permission: 'view_master_brand_origin'
        },
        { 
            title: 'Data Pengguna', 
            description: 'Atur hak akses, peran (roles), dan data pengguna aplikasi.',
            icon: 'group', 
            href: route('master.data.user'),
            color: 'purple',
            permission: 'manage_users_roles'
        },
        { 
            title: 'Role & Permission', 
            description: 'Kelola peran pengguna dan konfigurasi hak akses spesifik (Permissions).',
            icon: 'admin_panel_settings', 
            href: route('master.data.role'),
            color: 'rose',
            permission: 'manage_users_roles'
        },
    ].filter(item => !item.permission || hasPermission(item.permission));

    const getColorClasses = (color) => {
        const classes = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
            rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        };
        return classes[color] || classes.blue;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Master Data</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data fundamental untuk operasional Protrack Pro</p>
                    </div>
                </div>
            }
        >
            <Head title="Master Data" />

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Master Data</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Kelola data fundamental untuk operasional Protrack Pro.</p>
                </div>
            </div>

            {/* Grid Layout for Menus */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {masterDataMenus.map((menu, index) => (
                    <div 
                        key={index}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:border-white/10 group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`size-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${getColorClasses(menu.color)}`}>
                                <span className="material-symbols-outlined text-[32px]">{menu.icon}</span>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">{menu.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 flex-1 leading-relaxed">
                                {menu.description}
                            </p>
                            
                            <Link 
                                href={menu.href}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-[1.25rem] font-bold text-sm transition-all group/btn"
                            >
                                Kelola Data
                                <span className="material-symbols-outlined text-[18px] transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            
        </AuthenticatedLayout>
    );
}
