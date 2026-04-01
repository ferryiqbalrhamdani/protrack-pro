import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SearchableSelect from '@/Components/SearchableSelect';
import { motion, animate, useInView } from 'framer-motion';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import { useRef } from 'react';

const CountingNumber = ({ value }) => {
    const nodeRef = useRef(null);
    const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!isInView) return;
        
        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (val) => {
                if (nodeRef.current) {
                    nodeRef.current.textContent = val.toLocaleString('id-ID', { maximumFractionDigits: 2 });
                }
            }
        });
        return () => controls.stop();
    }, [value, isInView]);

    return <span ref={nodeRef}>0</span>;
};

export default function Index({ 
    monthlyStats = [],
    statusStats = { total: 0, ongoing: 0, completed: 0, pending: 0 },
    companyContractValues = [],
    moduleStats = {
        contract: { ongoing: 0, completed: 0, pending: 0 },
        merchandiser: { ongoing: 0, completed: 0, pending: 0 },
        billing: { ongoing: 0, completed: 0, pending: 0 },
        shipping: { ongoing: 0, completed: 0, pending: 0 },
    },
    moduleData = {
        contract: [], merchandiser: [], billing: [], shipping: []
    },
    dueProjects = [],
    financialStats = { total_nilai: 0, akumulasi_dp: 0, pembayaran_langsung: 0, tagihan_termin: 0 },
    recentActivities = [],
    activityLogs = null,
    availableYears = []
}) {
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeModuleModal, setActiveModuleModal] = useState(null);
    const [isModuleModalClosing, setIsModuleModalClosing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    
    const { queryParams } = usePage().props;
    const yearNum = new Date().getFullYear();
    const [year, setYear] = useState(queryParams?.year || 'All');

    // Weather State
    const [weather, setWeather] = useState({
        temp: '--',
        desc: 'Memuat Cuaca...',
        icon: 'wb_cloudy',
        customIcon: null,
        location: 'Mencari lokasi...',
        loading: true,
        error: false
    });

    // Current Date logic
    const today = new Date();
    const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' });
    const dayNum = String(today.getDate()).padStart(2, '0');
    const monthShort = today.toLocaleDateString('id-ID', { month: 'short' });

    // Export Handler
    const handleExport = () => {
        // Implement global export here
        console.log("Global export triggered for year:", year);
    };

    // URL Persistence Implementation
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = { ...queryParams };
            if (year !== 'All') {
                params.year = year;
            } else {
                delete params.year;
            }

            const url = new URL(window.location.href);
            const currentYearInUrl = url.searchParams.get('year') || 'All';
            
            if (year !== currentYearInUrl) {
                router.get(route('reports'), params, {
                    preserveState: true,
                    replace: true
                });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [year]);

    // Auto-refresh (Real-time feel)
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                preserveScroll: true,
                preserveState: true,
                only: ['dueProjects', 'recentActivities', 'activityLogs', 'financialStats', 'moduleStats', 'statusStats'],
            });
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, []);

    // Intelligent Rupiah Scale Formatter
    const formatRupiahScale = (value) => {
        if (!value || value === 0) return 'Rp 0';
        
        const num = Math.abs(value);
        if (num >= 1000000000000) {
            return `Rp ${(num / 1000000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Triliun`;
        } else if (num >= 1000000000) {
            return `Rp ${(num / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Miliar`;
        } else if (num >= 1000000) {
            return `Rp ${(num / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Juta`;
        } else if (num >= 1000) {
            return `Rp ${(num / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ribu`;
        }
        return `Rp ${num.toLocaleString('id-ID')}`;
    };

    const formatValueAndUnit = (value) => {
        if (!value || value === 0) return { val: 0, unit: '' };
        const num = Math.abs(value);
        if (num >= 1000000000000) return { val: num / 1000000000000, unit: 'Triliun' };
        if (num >= 1000000000) return { val: num / 1000000000, unit: 'Miliar' };
        if (num >= 1000000) return { val: num / 1000000, unit: 'Juta' };
        if (num >= 1000) return { val: num / 1000, unit: 'Ribu' };
        return { val: num, unit: '' };
    };

    // Weather & Location Logic
    const fetchWeather = async (lat, lon, fallbackName = null) => {
        try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weatherData = await weatherRes.json();
            
            let locationName = fallbackName || 'Lokasi Anda';
            if (!fallbackName) {
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
                    const geoData = await geoRes.json();
                    locationName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || 'Lokasi Terdeteksi';
                } catch (e) {
                    console.error("Geocoding error", e);
                }
            }

            if (weatherData.current_weather) {
                const code = weatherData.current_weather.weathercode;
                let desc = 'Cerah';
                let icon = 'wb_sunny';
                let customIcon = null;

                if (code === 0) { desc = 'Cerah'; icon = 'wb_sunny'; }
                else if (code === 1 || code === 2 || code === 3) { desc = 'Berawan'; icon = 'wb_cloudy'; customIcon = 'cloud'; }
                else if (code === 45 || code === 48) { desc = 'Berkabut'; icon = 'foggy'; }
                else if (code >= 51 && code <= 57) { desc = 'Gerimis'; icon = 'weather_mix'; }
                else if (code >= 61 && code <= 67) { desc = 'Hujan'; icon = 'rainy'; }
                else if (code >= 71 && code <= 77) { desc = 'Bersalju'; icon = 'ac_unit'; }
                else if (code >= 80 && code <= 82) { desc = 'Hujan Deras'; icon = 'thunderstorm'; }
                else if (code >= 85 && code <= 86) { desc = 'Badai Salju'; icon = 'severe_cold'; }
                else if (code >= 95 && code <= 99) { desc = 'Badai Petir'; icon = 'thunderstorm'; }

                setWeather({
                    temp: Math.round(weatherData.current_weather.temperature),
                    desc,
                    icon,
                    customIcon,
                    location: locationName,
                    loading: false,
                    error: false
                });
            }
        } catch (error) {
            console.error("Error fetching weather:", error);
            setWeather(prev => ({ ...prev, desc: 'Gagal memuat', loading: false, error: true }));
        }
    };

    const fetchWeatherByIP = async () => {
        try {
            const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
                fetchWeather(ipData.latitude, ipData.longitude, ipData.city || 'Lokasi Terdeteksi');
            } else {
                throw new Error("Invalid IP geo data");
            }
        } catch (e) {
            console.error("IP Geolocation error:", e);
            setWeather(prev => ({ 
                ...prev, 
                desc: 'Akses Lokasi Diblokir', 
                location: 'Izinkan akses di ikon setelan situs Anda',
                loading: false, 
                error: true 
            }));
        }
    };

    const requestLocation = () => {
        setWeather(prev => ({ ...prev, loading: true, desc: 'Mencari lokasi...', error: false }));
        
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Geolocation error (will try IP):", error);
                    fetchWeatherByIP();
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            fetchWeatherByIP();
        }
    };

    useEffect(() => {
        // Fetch weather on mount
        requestLocation();
    }, []);

    const handleCloseModuleModal = () => {
        setIsModuleModalClosing(true);
        setTimeout(() => {
            setActiveModuleModal(null);
            setIsModuleModalClosing(false);
        }, 300); // Wait for exit animation to finish
    };
    
    const reportCategories = [
        { id: 'project', title: 'Laporan Project', icon: 'business_center', count: '24', color: 'blue' },
    ];
    const recentReports = [
        { name: 'Rekap Kontrak Q1 2024', date: '10 Mar 2024', size: '2.4 MB', type: 'PDF' },
        { name: 'Monitoring Pengiriman Mingguan', date: '08 Mar 2024', size: '1.2 MB', type: 'Excel' },
        { name: 'Evaluasi Vendor Pelabuhan', date: '05 Mar 2024', size: '840 KB', type: 'PDF' },
    ];

    // Lifecycle widgets dynamically fed from moduleStats
    const lifecycleWidgets = [
        { 
            title: 'Siklus Kontrak', 
            icon: 'contract', 
            color: 'blue', 
            gradient: 'from-blue-600 to-indigo-600 dark:from-blue-500/20 dark:to-indigo-500/20',
            bgLight: 'bg-blue-50',
            stats: { 
                ongoing: moduleStats?.contract?.ongoing || 0, 
                completed: moduleStats?.contract?.completed || 0, 
                pending: moduleStats?.contract?.pending || 0 
            } 
        },
        { 
            title: 'Siklus Merchandiser', 
            icon: 'shopping_bag', 
            color: 'emerald', 
            gradient: 'from-emerald-600 to-teal-600 dark:from-emerald-500/20 dark:to-teal-500/20',
            bgLight: 'bg-emerald-50',
            stats: { 
                ongoing: moduleStats?.merchandiser?.ongoing || 0, 
                completed: moduleStats?.merchandiser?.completed || 0, 
                pending: moduleStats?.merchandiser?.pending || 0 
            } 
        },
        { 
            title: 'Siklus Penagihan', 
            icon: 'receipt_long', 
            color: 'amber', 
            gradient: 'from-amber-500 to-orange-600 dark:from-amber-500/20 dark:to-orange-500/20',
            bgLight: 'bg-amber-50',
            stats: { 
                ongoing: moduleStats?.billing?.ongoing || 0, 
                completed: moduleStats?.billing?.completed || 0, 
                pending: moduleStats?.billing?.pending || 0 
            } 
        },
        { 
            title: 'Siklus Pengiriman', 
            icon: 'local_shipping', 
            color: 'rose', 
            gradient: 'from-rose-500 to-pink-600 dark:from-rose-500/20 dark:to-pink-500/20',
            bgLight: 'bg-rose-50',
            stats: { 
                ongoing: moduleStats?.shipping?.ongoing || 0, 
                completed: moduleStats?.shipping?.completed || 0, 
                pending: moduleStats?.shipping?.pending || 0 
            } 
        },
    ];

    // Data corresponding to selected widget
    const getModuleDataForModal = (modalInfo) => {
        if (!modalInfo) return [];
        if (modalInfo.title === 'Kontrak') return moduleData.contract || [];
        if (modalInfo.title === 'Merchandiser') return moduleData.merchandiser || [];
        if (modalInfo.title === 'Penagihan') return moduleData.billing || [];
        if (modalInfo.title === 'Pengiriman') return moduleData.shipping || [];
        return [];
    };

    const filteredModuleData = getModuleDataForModal(activeModuleModal);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredModuleData.length / itemsPerPage);
    const paginatedData = filteredModuleData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const yearOptions = [
        { label: 'Semua Data', value: 'All' },
        ...(availableYears?.map(y => ({ label: String(y), value: String(y) })) || [])
    ];

    // Due Projects is now provided by props `dueProjects`

    // Helper to calculate visual urgency based on deadline
    const getDueStatus = (dueDateStr) => {
        if (!dueDateStr || dueDateStr === 'No Date') return { label: 'Unknown', color: 'slate', bg: 'bg-slate-500/10', text: 'text-slate-600', icons: '?', level: 3 };

        const today = new Date();
        const dueDate = new Date(dueDateStr);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 30) return { label: 'Urgent', color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-600', icons: '!!!', level: 0 };
        if (diffDays <= 60) return { label: 'Near Due', color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-600', icons: '!!', level: 1 };
        return { label: 'Safe', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icons: '!', level: 2 };
    };

    const sortedDueProjects = [...dueProjects]
        .map(p => ({ ...p, statusObj: getDueStatus(p.due_date) }))
        .sort((a, b) => a.statusObj.level - b.statusObj.level || new Date(a.due_date) - new Date(b.due_date));

    // Mock Data for New Widgets (Due Projects)
    const totalContractValue = companyContractValues.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <AuthenticatedLayout>
            <Head title="Laporan" />

            <div className="space-y-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-3 text-center lg:text-left">
                            Pusat Laporan
                        </h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
                            Analisis & Rekapitulasi Data
                        </p>
                    </div>

                    <div className="flex justify-center items-center gap-3">
                        <div className="w-48">
                            <SearchableSelect 
                                options={yearOptions}
                                value={year}
                                onChange={(val) => setYear(val)}
                                placeholder="Pilih Periode"
                            />
                        </div>
                        <button className="px-6 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 h-[54px]">
                            <span className="material-symbols-outlined text-lg font-fill">export_notes</span>
                            Export Semua
                        </button>
                    </div>
                </div>

                {/* Weather & Date Top Widget */}
                <div className="flex flex-col md:flex-row items-stretch gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    {/* Date Block */}
                    <div className="flex-1 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-500/10 dark:via-blue-600/10 dark:to-indigo-500/5 border border-indigo-500/20 dark:border-white/10 rounded-[2rem] p-6 flex items-center justify-between shadow-xl shadow-indigo-500/20 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/30">
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/20 shadow-inner">
                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-80">{monthShort}</span>
                                <span className="text-2xl font-black leading-none mt-0.5">{dayNum}</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white tracking-tight capitalize">{dayName}</h4>
                                <p className="text-[10px] font-bold text-indigo-100 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-80">{monthShort} {yearNum} • Protrack System</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black text-indigo-200 dark:text-slate-500 uppercase tracking-widest mb-1 opacity-60">Status Operasional</span>
                            <div className="flex items-center gap-2 bg-emerald-500/30 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-400/40 dark:border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                                <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-[0.1em]">Sistem Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Weather Block */}
                    <div className="flex-none md:w-72 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none relative allow-tooltip-overflow">
                        {weather.loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-[#0b1120]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                                <span className="material-symbols-outlined animate-spin text-slate-400">sync</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="relative size-12 flex items-center justify-center">
                                <span className={`material-symbols-outlined text-4xl ${weather.icon === 'wb_sunny' ? 'text-amber-400 animate-[spin_12s_linear_infinite]' : 'text-slate-400 dark:text-slate-300'} font-fill`}>
                                    {weather.icon}
                                </span>
                                {weather.customIcon && (
                                    <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-2xl text-slate-400 dark:text-slate-500">
                                        {weather.customIcon}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                    {weather.temp}{weather.temp !== '--' ? '°C' : ''}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[120px]" title={weather.desc}>
                                    {weather.desc}
                                </p>
                            </div>
                        </div>
                        <div 
                            onClick={requestLocation}
                            className={`size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer premium-tooltip shrink-0 ${
                                weather.error 
                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                                : 'bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-blue-500 group-hover:text-white'
                            }`}
                            data-tooltip={weather.location}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {weather.error ? 'location_off' : 'my_location'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart: Project Trends */}
                    <div className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-5 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Statistik Bulanan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Jumlah Project {year === 'All' ? 'Keseluruhan' : year}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                                    <span className="size-2 rounded-full bg-blue-500"></span>
                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">Proyek Baru</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Chart Container with Horizontal Scroll on Mobile */}
                        <div className="relative overflow-x-auto no-scrollbar pb-2 touch-pan-x">
                            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-4 bg-slate-50/30 dark:bg-white/[0.01] rounded-3xl min-w-[600px] md:min-w-0">
                                {monthlyStats.map((d, i) => {
                                    const maxVal = Math.max(...monthlyStats.map(s => s.v), 1);
                                    const heightPercent = (d.v / maxVal) * 100;
                                    return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                                        <div className="relative w-full h-48 flex items-end justify-center">
                                            {/* Background Slot (Track) - Visible Gray */}
                                            <div className="absolute inset-x-0 bottom-0 w-6 md:w-8 mx-auto h-full bg-slate-200 dark:bg-white/10 rounded-full" />
                                            
                                            {/* The Bar - Using Solid Blue Hex */}
                                            <motion.div 
                                                className="relative w-6 md:w-8 bg-[#3b82f6] rounded-full shadow-xl shadow-blue-500/20 flex items-start justify-center pt-2"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ duration: 1, delay: i * 0.05, ease: 'easeOut' }}
                                            >
                                                {/* Reflection highlight */}
                                                {heightPercent > 10 && <div className="w-1.5 h-[30%] bg-white/30 rounded-full" />}
                                                
                                                {/* Hover Value - Desktop only for touch safety */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none hidden md:block">
                                                    {d.v}
                                                </div>
                                                
                                                {/* Always show value on mobile for accessibility if bar is high enough */}
                                                <div className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-500">
                                                    {d.v > 0 && d.v}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.m}</span>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Scroll Hint */}
                        <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                            <span className="material-symbols-outlined text-sm animate-[bounce-x_2s_infinite]">keyboard_double_arrow_right</span>
                            Geser untuk melihat data bulanan
                        </div>
                    </div>

                    {/* Donut Chart: Status Distribution */}
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 min-h-[400px]">
                        <div className="mb-8 font-display">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Status Project</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Distribusi Real-time</p>
                        </div>

                        <div className="relative w-52 h-52 mx-auto mb-8 flex items-center justify-center">
                            {/* SVG Donut with robust sizing */}
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 origin-center z-10 relative">
                                {(() => {
                                    const circ = 251.2;
                                    const total = Math.max(statusStats.total, 1);
                                    const onP = (statusStats.ongoing / total) * circ;
                                    const comP = (statusStats.completed / total) * circ;
                                    const penP = (statusStats.pending / total) * circ;
                                    return (
                                        <>
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-white/5" />
                                            {statusStats.ongoing > 0 && (
                                                <motion.circle 
                                                    cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" 
                                                    initial={{ strokeDasharray: `0 ${circ}`, strokeDashoffset: 0 }}
                                                    animate={{ strokeDasharray: `${onP} ${circ}`, strokeDashoffset: 0 }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                    strokeLinecap="round"
                                                />
                                            )}
                                            {statusStats.completed > 0 && (
                                                <motion.circle 
                                                    cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" 
                                                    initial={{ strokeDasharray: `0 ${circ}`, strokeDashoffset: -onP }}
                                                    animate={{ strokeDasharray: `${comP} ${circ}`, strokeDashoffset: -onP }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                                    strokeLinecap="round"
                                                />
                                            )}
                                            {statusStats.pending > 0 && (
                                                <motion.circle 
                                                    cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="8" 
                                                    initial={{ strokeDasharray: `0 ${circ}`, strokeDashoffset: -(onP + comP) }}
                                                    animate={{ strokeDasharray: `${penP} ${circ}`, strokeDashoffset: -(onP + comP) }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                                                    strokeLinecap="round"
                                                />
                                            )}
                                        </>
                                    );
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                <motion.span 
                                    key={statusStats.total}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-4xl font-black text-slate-800 dark:text-white"
                                >
                                    {statusStats.total}
                                </motion.span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Cases</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'Ongoing', color: '#3b82f6', val: statusStats.ongoing },
                                { label: 'Completed', color: '#10b981', val: statusStats.completed },
                                { label: 'Pending', color: '#f59e0b', val: statusStats.pending },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3.5 h-3.5 rounded-full shadow-lg transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-500">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* New Widgets: Contract Value & Due Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contract Value per Company */}
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Nilai Kontrak per Perusahaan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Akumulasi Nilai Proyek</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Nilai</p>
                                <p className="text-lg font-black text-primary dark:text-blue-400 leading-none">{formatRupiahScale(totalContractValue)}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                            {companyContractValues.map((comp, idx) => {
                                const maxValue = Math.max(...companyContractValues.map(c => c.value), 1);
                                const p = (comp.value / maxValue) * 100;
                                return (
                                    <motion.div 
                                        key={idx} 
                                        className="group"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    >
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">{comp.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">{formatRupiahScale(comp.value)}</p>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-500">{Math.round(p)}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${p}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1 + 0.3, ease: 'easeOut' }}
                                                style={{ backgroundColor: comp.color, boxShadow: `0 0 15px ${comp.color}40` }}
                                            ></motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Scroll indicator for Nilai Kontrak */}
                        {companyContractValues.length > 5 && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                                className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 py-2 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 opacity-70"
                            >
                                <span className="material-symbols-outlined text-[14px] animate-bounce">expand_more</span>
                                Scroll untuk melihat {companyContractValues.length - 5} data lainnya
                            </motion.div>
                        )}
                    </div>

                    {/* Due Projects List */}
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Proyek Jatuh Tempo</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Monitoring Deadline Terdekat</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
                                <span className="size-2 rounded-full bg-rose-500 animate-pulse"></span>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Monitoring</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                            {sortedDueProjects.length > 0 ? (
                                sortedDueProjects.map((proj, idx) => {
                                    const status = proj.statusObj;
                                    return (
                                    <motion.div 
                                        layout
                                        key={proj.id || idx} 
                                        className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/10 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all group rounded-[2rem]"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-xl ${status.bg} flex items-center justify-center ${status.text} shadow-sm transition-transform group-hover:scale-110`}>
                                                <div className="flex flex-row -space-x-1 items-center justify-center">
                                                    {status.icons.split('').map((_, i) => (
                                                        <span key={i} className="material-symbols-outlined font-black text-[14px]">priority_high</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 line-clamp-1 max-w-[150px]">{proj.name}</p>
                                                <p className="text-[10px] flex items-center gap-1 font-bold text-slate-400 mt-0.5">
                                                    <span className="material-symbols-outlined text-[10px] text-slate-400">description</span>
                                                    {proj.contract_no}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-[10px] font-black text-slate-700 dark:text-white mb-1 uppercase tracking-tighter">{proj.due_date}</p>
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.text} text-[8px] font-black uppercase tracking-widest border border-current/30`}>
                                                <span className="size-1 rounded-full bg-current"></span>
                                                {status.label}
                                            </div>
                                        </div>
                                    </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">assignment_turned_in</span>
                                    <p className="text-xs font-bold text-slate-400">Tidak ada proyek tertunda</p>
                                </div>
                            )}
                        </div>

                        {dueProjects.length > 5 && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                                className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 py-2 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 opacity-70"
                            >
                                <span className="material-symbols-outlined text-[14px] animate-bounce">expand_more</span>
                                Scroll untuk melihat {dueProjects.length - 5} data lainnya
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Full Lifecycle Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            title: 'Kontrak', sub: 'Fase 1', icon: 'description', color: 'amber', href: route('contracts'), 
                            stats: moduleStats.contract 
                        },
                        { 
                            title: 'Merchandiser', sub: 'Fase 2', icon: 'storefront', color: 'blue', href: route('merchandiser'), 
                            stats: moduleStats.merchandiser 
                        },
                        { 
                            title: 'Penagihan', sub: 'Fase 3', icon: 'payments', color: 'rose', href: route('billing'), 
                            stats: moduleStats.billing 
                        },
                        { 
                            title: 'Pengiriman', sub: 'Fase 4', icon: 'local_shipping', color: 'emerald', href: route('shipping'), 
                            stats: moduleStats.shipping 
                        },
                    ].map((mod, idx) => {
                        const totalStats = mod.stats.ongoing + mod.stats.pending + mod.stats.completed;
                        const efficiency = totalStats > 0 ? Math.round((mod.stats.completed / totalStats) * 100) : 0;
                        const statData = [
                            { label: 'Ongoing', val: mod.stats.ongoing, c: 'blue' },
                            { label: 'Pending', val: mod.stats.pending, c: 'amber' },
                            { label: 'Complete', val: mod.stats.completed, c: 'emerald' }
                        ];

                        return (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                            key={idx} 
                            className="bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-8 group hover:shadow-2xl hover:shadow-primary/5 transition-all"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-xl bg-${mod.color}-500/10 dark:bg-white/10 flex items-center justify-center text-${mod.color}-500 dark:text-white shadow-lg shadow-${mod.color}-500/10`}>
                                        <span className="material-symbols-outlined font-fill text-xl">{mod.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">{mod.title}</h3>
                                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">{mod.sub}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setActiveModuleModal(mod);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 rounded-full border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[8px] font-black uppercase tracking-widest transition-all
                                        ${mod.color === 'amber' ? 'text-amber-600 hover:bg-amber-500 hover:border-amber-500 hover:text-white' : ''}
                                        ${mod.color === 'blue' ? 'text-blue-600 hover:bg-blue-500 hover:border-blue-500 hover:text-white' : ''}
                                        ${mod.color === 'rose' ? 'text-rose-600 hover:bg-rose-500 hover:border-rose-500 hover:text-white' : ''}
                                        ${mod.color === 'emerald' ? 'text-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white' : ''}
                                        dark:text-slate-400 dark:hover:text-white
                                    `}
                                >
                                    Selengkapnya
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {statData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-1.5 rounded-full bg-${s.c}-500 dark:ring-4 ring-${s.c}-500/20`}></div>
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100"><CountingNumber value={s.val} /></span>
                                            <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">Proj</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5">
                                <div className="flex items-center justify-between text-[10px] font-black">
                                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest">Efficiency</span>
                                    <span className={`text-${mod.color}-500`}><CountingNumber value={efficiency} />%</span>
                                </div>
                                <div className="mt-2 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className={`h-full bg-${mod.color}-500 rounded-full`} 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${efficiency}%` }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 1.2, delay: idx * 0.1 + 0.3, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>

                {/* Financial Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Nilai Proyek', valueDetails: formatValueAndUnit(financialStats.total_nilai), diff: '+12%', icon: 'account_balance_wallet', color: 'blue', percent: 100 },
                        { label: 'Akumulasi DP', valueDetails: formatValueAndUnit(financialStats.akumulasi_dp), diff: '+5%', icon: 'payments', color: 'emerald', percent: financialStats.total_nilai > 0 ? (financialStats.akumulasi_dp / financialStats.total_nilai) * 100 : 0 },
                        { label: 'Akumulasi Pembayaran Langsung', valueDetails: formatValueAndUnit(financialStats.pembayaran_langsung), diff: '0%', icon: 'verified', color: 'amber', percent: financialStats.total_nilai > 0 ? (financialStats.pembayaran_langsung / financialStats.total_nilai) * 100 : 0 },
                        { label: 'Tagihan Termin', valueDetails: formatValueAndUnit(financialStats.tagihan_termin), diff: '+18%', icon: 'receipt_long', color: 'rose', percent: financialStats.total_nilai > 0 ? (financialStats.tagihan_termin / financialStats.total_nilai) * 100 : 0 },
                    ].map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                            key={i} 
                            className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 group hover:scale-[1.02] transition-all hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`size-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 shadow-lg shadow-${stat.color}-500/5`}>
                                    <span className="material-symbols-outlined font-fill">{stat.icon}</span>
                                </div>
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                                    Rp <CountingNumber value={stat.valueDetails.val} />
                                </span>
                                <span className="text-xs font-bold text-slate-400">{stat.valueDetails.unit}</span>
                            </div>
                            <div className="mt-6 flex items-center justify-between text-[10px] font-black mb-1">
                                <span className="text-slate-400">Proporsi Persentase</span>
                                <span className={`text-${stat.color}-500`}>{Math.round(stat.percent)}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className={`h-full bg-${stat.color}-500`}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${stat.percent}%` }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 1.2, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {reportCategories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={cat.id === 'project' ? route('reports.project', { year: year }) : '#'}
                            className="col-span-12 md:col-span-6 lg:col-span-6 group relative bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className={`size-14 rounded-2xl bg-${cat.color}-500/10 flex items-center justify-center text-${cat.color}-500 mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                                <span className="material-symbols-outlined text-3xl font-fill">{cat.icon}</span>
                            </div>
                            
                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{cat.title}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.count} Laporan Tersedia</p>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-between relative z-10">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${cat.color}-500`}>Lihat Detail</span>
                                <div className={`size-8 rounded-full bg-${cat.color}-500/5 flex items-center justify-center text-${cat.color}-500 group-hover:bg-${cat.color}-500 group-hover:text-white transition-all`}>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </div>
                            </div>

                            {/* Decorative background icon */}
                            <span className="absolute -top-4 -right-4 material-symbols-outlined text-8xl text-slate-50 dark:text-white/[0.01] pointer-events-none transition-transform group-hover:rotate-12 group-hover:scale-110 z-0 opacity-50">
                                {cat.icon}
                            </span>
                        </Link>
                    ))}

                    {/* AI Summarize Widget */}
                    <div 
                        onClick={() => {
                            setIsAiModalOpen(true);
                            setIsGenerating(true);
                            setTimeout(() => setIsGenerating(false), 3000);
                        }}
                        className="col-span-12 md:col-span-6 lg:col-span-6 group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                <span className="material-symbols-outlined text-3xl font-fill">auto_awesome</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                                <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Ready</span>
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-2 leading-tight">AI Summarize</h3>
                            <p className="text-[10px] font-medium text-white/80 uppercase tracking-widest">
                                Hasilkan insight & ringkasan otomatis performa project secara keseluruhan dengan AI
                            </p>
                        </div>
                        
                        <div className="mt-8 flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Generate Now</span>
                            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-purple-600 transition-all shadow-inner backdrop-blur-md">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                            </div>
                        </div>

                        {/* Decorative background icon */}
                        <span className="absolute -top-4 -right-4 material-symbols-outlined text-9xl text-white/10 pointer-events-none transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 z-0">
                            psychiatry
                        </span>
                    </div>
                </div>

                {/* Recent Activities List (Mirrored from Dashboard) */}
                <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[3rem] p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="size-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-blue-400">
                            <span className="material-symbols-outlined text-2xl">history</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Aktivitas Terbaru</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Log aktivitas sistem</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {recentActivities && recentActivities.length > 0 ? (
                            recentActivities.map((activity, i) => (
                                <div key={activity.id || i} className="flex gap-4 group/item animate-slide-up-fade" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform ${activity.color?.replace('text', 'bg').replace('500', '50') || 'bg-slate-50'} dark:${activity.color?.replace('text', 'bg').replace('500', '500/10') || 'bg-white/5'} ${activity.color || 'text-slate-500'}`}>
                                        <span className="material-symbols-outlined text-[20px]">{activity.icon || 'history'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 justify-center">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            <span className="font-black text-slate-800 dark:text-slate-200">{activity.user?.name}</span> {activity.action} <span className="font-black text-slate-800 dark:text-slate-200">{activity.target_name}</span>
                                        </p>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">{new Date(activity.created_at).toLocaleString('id-ID', {day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center opacity-30">
                                <span className="material-symbols-outlined text-4xl mb-2">history</span>
                                <p className="text-[10px] font-black uppercase tracking-widest">Belum ada aktivitas</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                        <button 
                            onClick={() => setIsActivityModalOpen(true)}
                            className="w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10"
                        >
                            Lihat Semua Log
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Summary Modal */}
            {isAiModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 w-screen h-screen" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 w-full h-full bg-slate-900/70 backdrop-blur-xl transition-opacity z-0"
                        onClick={() => setIsAiModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-purple-500/20 flex flex-col animate-in fade-in zoom-in-95 duration-300 pointer-events-auto">
                        
                        {/* Shimmer Edge Effect */}
                        <div className="absolute inset-0 rounded-[2.5rem] p-[1px] bg-gradient-to-b from-purple-500/50 via-transparent to-transparent pointer-events-none"></div>

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 relative bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-t-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                    <span className="material-symbols-outlined text-2xl font-fill">temp_preferences_custom</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        Protrack AI Insight
                                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20">Beta</span>
                                    </h2>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Ringkasan Performa Project Tahunan</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAiModalOpen(false)}
                                className="size-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar relative flex-1">
                            {isGenerating ? (
                                /* Generating State */
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative size-24 mb-8">
                                        <div className="absolute inset-0 border-4 border-slate-100 dark:border-white/5 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-purple-500">
                                            <span className="material-symbols-outlined text-4xl animate-pulse">auto_awesome</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">AI sedang menganalisis data...</h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center max-w-md">
                                        Memproses ribuan titik data dari seluruh kontrak, penagihan, dan pengiriman Anda tahun ini untuk menemukan insight berharga.
                                    </p>
                                    
                                    <div className="mt-8 w-64 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            ) : (
                                /* Generated Content */
                                <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                    
                                    {/* Executive Summary */}
                                    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-purple-500/10 rounded-3xl p-6 sm:p-8">
                                        <div className="flex items-start gap-4 mb-4">
                                            <span className="material-symbols-outlined text-purple-500 mt-1">format_quote</span>
                                            <div>
                                                <h3 className="text-sm font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-2">Executive Summary</h3>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                    Tahun 2024 menunjukkan performa yang sangat positif dengan peningkatan total nilai proyek sebesar <span className="text-emerald-500 font-bold">+12%</span> dibanding tahun sebelumnya. Sektor <span className="font-bold text-slate-900 dark:text-white">Konstruksi & Infrastruktur</span> menjadi penyumbang pendapatan terbesar. Namun, terdapat potensi bottleneck pada fase <span className="font-bold text-amber-500">Penagihan (Billing)</span> yang rata-rata mengalami delay 4 hari dari target.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Insights Grid */}
                                    <div>
                                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">lightbulb</span>
                                            Key Insights
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { icon: 'trending_up', color: 'emerald', title: 'Pertumbuhan Kontrak', desc: 'Volume kontrak baru meningkat signifikan di Q1 dan Q2, didorong oleh ekspansi klien korporat.' },
                                                { icon: 'speed', color: 'blue', title: 'Efisiensi Merchandiser', desc: 'Fase persiapan barang / merchandiser menjadi yang paling efisien dengan success rate 92%.' },
                                                { icon: 'warning', color: 'amber', title: 'Isu Penagihan Termin', desc: 'Terdapat 18% tagihan yang melewati jatuh tempo, mayoritas dari klien sektor retail.' },
                                                { icon: 'local_shipping', color: 'indigo', title: 'Performa Pengiriman', desc: 'SLA pengiriman terjaga di angka 95%. Ekspedisi mitra B menunjukkan konsistensi terbaik.' },
                                            ].map((insight, idx) => (
                                                <div key={idx} className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex gap-4 hover:shadow-lg transition-shadow">
                                                    <div className={`size-10 rounded-xl flex-shrink-0 bg-${insight.color}-500/10 text-${insight.color}-500 flex items-center justify-center`}>
                                                        <span className="material-symbols-outlined">{insight.icon}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1">{insight.title}</h4>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{insight.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actionable Recommendations */}
                                    <div>
                                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">task_alt</span>
                                            Rekomendasi AI
                                        </h3>
                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl p-2 space-y-1">
                                            {[
                                                'Otomatisasi reminder H-3 sebelum jatuh tempo invoice untuk menekan angka keterlambatan pembayaran.',
                                                'Fokuskan tim sales pada penawaran upselling layanan pengiriman kilat ke klien korporat.',
                                                'Evaluasi ulang kontrak dengan Ekspedisi Mitra C karena tingginya angka delay pengiriman di luar pulau.'
                                            ].map((rec, i) => (
                                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                                                    <div className="size-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                </div>
                            )}
                        </div>
                        
                        {/* Footer (Actions) */}
                        {!isGenerating && (
                            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between rounded-b-[2.5rem]">
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    AI Insight dihasilkan berdasarkan data per 10 Mar 2024
                                </p>
                                <div className="flex gap-3">
                                    <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">share</span>
                                        Bagikan
                                    </button>
                                    <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 text-xs font-black transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">download</span>
                                        Unduh Laporan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            , document.body)}

            {/* Module Detail Modal */}
            {activeModuleModal && typeof document !== 'undefined' && createPortal(
                <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 w-screen h-screen ${isModuleModalClosing ? 'pointer-events-none' : ''}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    {/* Backdrop */}
                    <div 
                        className={`absolute inset-0 w-full h-full bg-slate-900/70 backdrop-blur-xl transition-all duration-300 z-0 ${isModuleModalClosing ? 'opacity-0' : 'opacity-100'}`}
                    ></div>

                    {/* Modal Content */}
                    <div className={`relative z-10 w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto border border-slate-100 dark:border-white/10 transform-gpu
                        ${isModuleModalClosing ? 'animate-[modal-pop-out_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]' : 'animate-[modal-pop_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]'}
                    `}>
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 relative bg-slate-50/50 dark:bg-white/[0.02] rounded-t-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl bg-${activeModuleModal.color}-500/10 flex items-center justify-center text-${activeModuleModal.color}-500 shadow-lg shadow-${activeModuleModal.color}-500/10`}>
                                    <span className="material-symbols-outlined text-2xl font-fill">{activeModuleModal.icon}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        Data {activeModuleModal.title}
                                    </h2>
                                    {(() => {
                                        const t = activeModuleModal.stats.ongoing + activeModuleModal.stats.pending + activeModuleModal.stats.completed;
                                        const eff = t > 0 ? Math.round((activeModuleModal.stats.completed / t) * 100) : 0;
                                        return (
                                            <div className="flex items-center gap-3 mt-1.5 hidden sm:flex">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{activeModuleModal.sub}</p>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 md:w-32 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div className={`h-full bg-${activeModuleModal.color}-500 rounded-full`} 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${eff}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-black tracking-widest text-${activeModuleModal.color}-500`}><CountingNumber value={eff} />%</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest sm:hidden">{activeModuleModal.sub}</p>
                                </div>
                            </div>
                            <div className="relative group/tooltip">
                                <button 
                                    onClick={handleCloseModuleModal}
                                    className="size-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 dark:bg-white/5 dark:hover:bg-red-500/10 text-slate-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                                {/* Tooltip Center Above */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-black tracking-widest uppercase rounded-xl opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all pointer-events-none z-50 whitespace-nowrap shadow-lg">
                                    Tutup Modal
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body - Table List */}
                        <div className="p-0 sm:p-0 overflow-y-auto relative flex-1 custom-scrollbar max-h-[60vh]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 sticky top-0 z-[20] hidden md:table-row backdrop-blur-xl">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Project</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">No. Kontrak / UP</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            {activeModuleModal?.title === 'Merchandiser' ? 'PIC' : 'PIC / Handler'}
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tenggat Waktu</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Progress</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {paginatedData.map((row, i) => (
                                        <tr 
                                            key={i} 
                                            className={`group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] flex flex-col md:table-row transition-colors ${isModuleModalClosing ? 'animate-[slide-down-fade_0.3s_ease-in_both]' : 'animate-[slide-up-fade_0.5s_ease-out_both]'}`}
                                            style={{ animationDelay: isModuleModalClosing ? `${(4 - i) * 30}ms` : `${i * 100 + 150}ms` }}
                                        >
                                            {/* Mobile View Wrapper */}
                                            <td className="px-6 py-4 md:py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 whitespace-nowrap shrink-0 font-bold text-xs`}>
                                                        {row.proj.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div className="w-full">
                                                        <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{row.proj}</p>
                                                        <p className="text-xs font-bold text-slate-500 mt-0.5">{row.client}</p>
                                                        
                                                        <div className="mt-4 md:hidden flex flex-col gap-2 border-t border-slate-100 dark:border-white/5 pt-3">
                                                            <div className="flex flex-col gap-2 mb-2 pb-2 border-b border-slate-50 dark:border-white/5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-[8px]">
                                                                        {row.pic.charAt(0)}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">PIC: {row.pic}</span>
                                                                </div>
                                                                {activeModuleModal?.title !== 'Merchandiser' && row.handle && row.handle !== '-' && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[8px]">
                                                                            {row.handle.charAt(0)}
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Handler: {row.handle}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                                                                    ['Complete', 'Completed'].includes(row.status) ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' :
                                                                    row.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' :
                                                                    'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20'
                                                                }`}>
                                                                    <div className={`size-1.5 rounded-full ${
                                                                        ['Complete', 'Completed'].includes(row.status) ? 'bg-emerald-500' :
                                                                        row.status === 'Pending' ? 'bg-amber-500' :
                                                                        'bg-blue-500'
                                                                    }`}></div>
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                                        ['Complete', 'Completed'].includes(row.status) ? 'text-emerald-600 dark:text-emerald-400' :
                                                                        row.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' :
                                                                        'text-blue-600 dark:text-blue-400'
                                                                    }`}>
                                                                        {row.status}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300"><CountingNumber value={row.prog || 0} />%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div className={`h-full rounded-full ${
                                                                    ['Complete', 'Completed'].includes(row.status) ? 'bg-emerald-500' :
                                                                    row.status === 'Pending' ? 'bg-amber-500' :
                                                                    'bg-blue-500'
                                                                }`} 
                                                                initial={{ width: 0 }}
                                                                whileInView={{ width: `${row.prog || 0}%` }}
                                                                viewport={{ once: true }}
                                                                transition={{ duration: 1 }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-2 md:py-5 hidden md:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px] text-slate-400">description</span>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">{row.no}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.up}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-2 md:py-5 hidden md:table-cell">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2" title="Project PIC">
                                                        <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-[8px]">
                                                            {row.pic.charAt(0)}
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{row.pic}</span>
                                                    </div>
                                                    {activeModuleModal?.title !== 'Merchandiser' && row.handle && row.handle !== '-' && (
                                                        <div className="flex items-center gap-2" title="Module Handler">
                                                            <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[8px]">
                                                                {row.handle.charAt(0)}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{row.handle}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-2 md:py-5 hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-500">{row.date}</span>
                                                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 w-max px-2 py-0.5 rounded-md">
                                                        <span className="material-symbols-outlined text-[14px] text-amber-500">event</span>
                                                        {row.due}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-2 md:py-5 hidden md:table-cell w-48">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200"><CountingNumber value={row.prog || 0} />%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div className={`h-full rounded-full ${
                                                        ['Complete', 'Completed'].includes(row.status) ? 'bg-emerald-500' :
                                                        row.status === 'Pending' ? 'bg-amber-500' :
                                                        'bg-blue-500'
                                                    }`} 
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${row.prog || 0}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1 }}
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-6 py-2 md:py-5 hidden md:table-cell w-32 md:text-right">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                                                    ['Complete', 'Completed'].includes(row.status) ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' :
                                                    row.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' :
                                                    'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20'
                                                }`}>
                                                    <div className={`size-1.5 rounded-full animate-pulse ${
                                                        ['Complete', 'Completed'].includes(row.status) ? 'bg-emerald-500' :
                                                        row.status === 'Pending' ? 'bg-amber-500' :
                                                        'bg-blue-500'
                                                    }`}></div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                        ['Complete', 'Completed'].includes(row.status) ? 'text-emerald-600 dark:text-emerald-400' :
                                                        row.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">
                                Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredModuleData.length)} dari {filteredModuleData.length} data
                            </span>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 mx-auto sm:mx-0">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`size-7 rounded-xl text-[10px] font-black transition-all ${
                                            currentPage === i + 1
                                            ? `bg-${activeModuleModal?.color || 'blue'}-500 text-white shadow-md shadow-${activeModuleModal?.color || 'blue'}-500/20 md:scale-110`
                                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Activity Log Modal */}
            <Modal show={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} maxWidth="2xl">
                <div className="flex flex-col h-full max-h-[80vh]">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl font-bold">history</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Semua Aktivitas</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Log Sistem Protrack Pro</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsActivityModalOpen(false)}
                                className="size-10 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="space-y-6">
                            {activityLogs?.data.map((activity) => (
                                <div key={activity.id} className="flex gap-4 group">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform ${activity.color?.replace('text', 'bg').replace('500', '50')} dark:bg-white/5 ${activity.color}`}>
                                        <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            <span className="font-black text-slate-800 dark:text-slate-200">{activity.user?.name}</span> {activity.action} <span className="font-black text-slate-800 dark:text-slate-200">{activity.target_name}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{new Date(activity.created_at).toLocaleString('id-ID', {day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
                                            <span className="size-1 rounded-full bg-slate-200 dark:bg-white/10"></span>
                                            <span className="text-[10px] font-black text-primary/60 dark:text-blue-400/60 uppercase tracking-widest">{activity.model_type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-center">
                        <Pagination links={activityLogs?.links || []} />
                    </div>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                ::selection {
                    background-color: rgb(59 130 246 / 0.2);
                    color: inherit;
                }
                .dark ::selection {
                    background-color: rgb(59 130 246 / 0.4);
                    color: white;
                }
                
                .bg-rose-500\/10 { background-color: rgb(244 63 94 / 0.1); }
                .text-rose-500 { color: rgb(244 63 94); }
                .bg-rose-500\/5 { background-color: rgb(244 63 94 / 0.05); }
                .group:hover .group-hover\\:bg-rose-500 { background-color: rgb(244 63 94); }
                
                .bg-emerald-500\/10 { background-color: rgb(16 185 129 / 0.1); }
                .text-emerald-500 { color: rgb(16 185 129); }
                .bg-emerald-500\/5 { background-color: rgb(16 185 129 / 0.05); }
                .group:hover .group-hover\\:bg-emerald-500 { background-color: rgb(16 185 129); }
                
                .bg-amber-500\/10 { background-color: rgb(245 158 11 / 0.1); }
                .text-amber-500 { color: rgb(245 158 11); }
                .bg-amber-500\/5 { background-color: rgb(245 158 11 / 0.05); }
                .group:hover .group-hover\\:bg-amber-500 { background-color: rgb(245 158 11); }

                .bg-blue-500\/10 { background-color: rgb(59 130 246 / 0.1); }
                .text-blue-500 { color: rgb(59 130 246); }
                .bg-blue-500\/5 { background-color: rgb(59 130 246 / 0.05); }
                .group:hover .group-hover\\:bg-blue-500 { background-color: rgb(59 130 246); }

                .bg-indigo-500\/10 { background-color: rgb(99 102 241 / 0.1); }
                .text-indigo-500 { color: rgb(99 102 241); }

                @keyframes progress {
                    0% { width: 0%; transform: translateX(-100%); }
                    50% { width: 40%; transform: translateX(50%); }
                    100% { width: 100%; transform: translateX(200%); }
                }
                
                @keyframes modal-pop {
                    0% { opacity: 0; transform: scale(0.95) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }

                @keyframes modal-pop-out {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.95) translateY(-20px); }
                }

                @keyframes slide-up-fade {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes slide-down-fade {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(10px); }
                }

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
