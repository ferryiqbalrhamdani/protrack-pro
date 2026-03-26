import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ExportButton from '@/Components/ExportButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';

export default function Dashboard({ 
    queryParams = null, 
    recentActivities = [], 
    activityLogs = null, 
    dueProjects = [], 
    recentProjectsList = [],
    chartPoints = [],
    metrics = {
        totalBilling: 0,
        totalBillingGrowth: 0,
        activeProjects: 0,
        activeGrowth: 0,
        ongoingProjects: 0,
        ongoingGrowth: 0,
        completedProjects: 0,
        completedGrowth: 0,
        completedBillingPercentage: 0
    }
}) {
    const user = usePage().props.auth.user;
    const auth = usePage().props.auth;
    queryParams = queryParams || {};
    const appName = "Protrack Pro";

    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

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

    // Formatting Helpers
    const formattedMetrics = {
        totalBilling: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(metrics.totalBilling),
        activeProjects: metrics.activeProjects,
        ongoingProjects: metrics.ongoingProjects,
        completedProjects: metrics.completedProjects,
    };

    // Timeframe filter logic
    const handleTimeframeChange = (timeframe) => {
        router.get(route('dashboard'), { timeframe }, {
            preserveState: true,
            preserveScroll: true,
            only: ['activityLogs', 'recentActivities', 'queryParams'],
        });
    };

    // Auto-refresh (Real-time feel)
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                preserveScroll: true,
                only: ['dueProjects', 'metrics', 'recentActivities', 'recentProjectsList'],
            });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

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
        requestLocation();
    }, []);

    // Current Date logic
    const today = new Date();
    const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' });
    const dayNum = today.toLocaleDateString('id-ID', { day: '2-digit' });
    const monthShort = today.toLocaleDateString('id-ID', { month: 'short' });
    const yearNum = today.getFullYear();

    // Ensure chartPoints has defaults if not provided
    if (!chartPoints || chartPoints.length === 0) {
        chartPoints = [
            { month: 'Jan', val: 0 }, { month: 'Feb', val: 0 }, { month: 'Mar', val: 0 },
            { month: 'Apr', val: 0 }, { month: 'Mei', val: 0 }, { month: 'Jun', val: 0 },
            { month: 'Jul', val: 0 }, { month: 'Agu', val: 0 }, { month: 'Sep', val: 0 },
            { month: 'Okt', val: 0 }, { month: 'Nov', val: 0 }, { month: 'Des', val: 0 }
        ];
    }

    // Time formatter helper
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    };

    // Helper for SVG path
    const getPath = () => {
        let path = "M 0 400 "; 
        chartPoints.forEach((p, i) => {
            const x = (i / 11) * 1000;
            const y = 400 - (p.val * 4); 
            path += `L ${x} ${y} `;
        });
        return path;
    };

    function formatGrowth(val) {
        if (val === 0 || val === undefined) return { text: '0%', trend: 'neutral' };
        return { 
            text: val > 0 ? `+${val}%` : `${val}%`, 
            trend: val > 0 ? 'up' : 'down' 
        };
    }
    const activeGrowth = formatGrowth(metrics.activeGrowth);
    const ongoingGrowth = formatGrowth(metrics.ongoingGrowth);
    const completedGrowth = formatGrowth(metrics.completedGrowth);
    const billingGrowth = formatGrowth(metrics.totalBillingGrowth);

    const stats = [
        {
            label: "Total Proyek Aktif",
            value: formattedMetrics.activeProjects,
            desc: "Ongoing & Pending",
            icon: "stacks",
            iconClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
            trend: activeGrowth.trend,
            growth: activeGrowth.text,
        },
        {
            label: "Proyek Berjalan",
            value: formattedMetrics.ongoingProjects,
            desc: "Sedang Diproses",
            icon: "assignment",
            iconClass: "bg-blue-100/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            trend: ongoingGrowth.trend,
            growth: ongoingGrowth.text,
        },
        {
            label: "Proyek Selesai",
            value: formattedMetrics.completedProjects,
            desc: "Total Selesai",
            icon: "task_alt",
            iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
            trend: completedGrowth.trend,
            growth: completedGrowth.text,
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-8 pb-32 xl:pb-8">
                {/* Welcome & Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1 sm:space-y-2 text-left">
                        <h2 className="text-[28px] sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                            Halo, Selamat Datang kembali!
                        </h2>
                        <p className="text-[10px] sm:text-sm text-slate-400 font-black uppercase tracking-[0.2em]">
                            Semoga harimu menyenangkan, <span className="text-blue-600 dark:text-blue-400">{user.name}</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ExportButton 
                            onExportExcel={() => console.log('Exporting Dashboard to Excel...')}
                            onExportPdf={() => console.log('Exporting Dashboard to PDF...')}
                        />
                    </div>
                </div>

                {/* Weather & Date Top Widget */}
                <div className="flex flex-row items-stretch gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    {/* Date Block */}
                    <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-600/10 dark:to-indigo-500/5 border border-blue-500/20 dark:border-white/10 rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between shadow-xl shadow-blue-500/20 dark:shadow-none transition-all duration-500">
                        <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 w-fit mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none">{monthShort} {dayNum}</span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white tracking-tight capitalize leading-none mb-1">{dayName}</h4>
                            <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest opacity-80">{monthShort} {yearNum} • {appName}</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Sistem Online</span>
                        </div>
                    </div>

                    {/* Weather Block */}
                    <div className="flex flex-row items-center sm:items-stretch sm:flex-col justify-between flex-none w-[140px] sm:w-72 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2rem] p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
                        {weather.loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-[#0b1120]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2rem]">
                                <span className="material-symbols-outlined animate-spin text-slate-400">sync</span>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                            <div className="relative size-10 sm:size-12 flex items-center justify-center">
                                <span className={`material-symbols-outlined text-3xl sm:text-4xl ${weather.icon === 'wb_sunny' ? 'text-amber-400 animate-[spin_12s_linear_infinite]' : 'text-slate-400 dark:text-slate-300'} font-fill`}>
                                    {weather.icon}
                                </span>
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none">
                                    {weather.temp}{weather.temp !== '--' ? '°C' : ''}
                                </h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden sm:block truncate max-w-[120px]">
                                    {weather.desc}
                                </p>
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center sm:hidden leading-none max-w-[60px]">{weather.desc}</p>
                    </div>
                </div>

                {/* Main Billing Card */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col items-stretch gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/10 blur-[100px] -z-10 rounded-full group-hover:bg-blue-500/20 transition-colors" />
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-left">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Total Billing Protrack</p>
                                <h3 className="text-[32px] sm:text-4xl font-black text-slate-900 dark:text-white leading-none">{formattedMetrics.totalBilling}</h3>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className={`flex items-center gap-1 text-[10px] font-black ${billingGrowth.trend === 'down' ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'} px-2.5 py-1.5 rounded-xl`}>
                                        <span className="material-symbols-outlined text-sm font-black">{billingGrowth.trend === 'down' ? 'trending_down' : 'trending_up'}</span>
                                        <span>{billingGrowth.text}</span>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Akumulasi Seluruh Proyek</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto text-left sm:text-right">
                                <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 drop-shadow-sm">{metrics.completedBillingPercentage || 0}%</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Selesai Dibayar</p>
                            </div>
                        </div>

                        <div className="w-full h-3.5 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-100 dark:border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-[1.5s] ease-out-expo shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                style={{ width: `${metrics.completedBillingPercentage || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-white/[0.02] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none transition-transform group cursor-pointer last:col-span-2 lg:last:col-span-1">
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest line-clamp-1">{stat.label}</p>
                                <span className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-transform ${stat.iconClass}`}>
                                    <span className="material-symbols-outlined text-lg sm:text-2xl font-bold">{stat.icon}</span>
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 sm:gap-3">
                                <h3 className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.value}</h3>
                                {stat.trend !== 'neutral' ? (
                                    <span className={`text-[10px] sm:text-sm font-black ${stat.trend === 'down' ? 'text-rose-500' : 'text-emerald-500'}`}>{stat.growth}</span>
                                ) : (
                                    <span className="text-sm font-black text-slate-400">-</span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-2">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Main Viz & AI Sidebar */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Chart Container */}
                    <div className="xl:col-span-2 bg-white dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col h-full">
                        <div className="flex items-center justify-between mb-10 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Progress Trend</h3>
                                <p className="text-xs text-slate-500 font-medium">Monitoring performa pengerjaan proyek setiap bulan</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-primary shadow-lg shadow-primary/40"></span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Progress (%)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[250px] relative group mt-4">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest pb-10">
                                {[100, 75, 50, 25, 0].map(val => (
                                    <div key={val} className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 h-0 w-full relative">
                                        <span className="absolute -top-2 bg-white dark:bg-[#0b1120] px-1 w-10">{val}%</span>
                                    </div>
                                ))}
                            </div>
                            {/* SVG Chart */}
                            <div className="absolute inset-0 pt-0 pb-10 px-8">
                                <svg className="w-full h-full drop-shadow-[0_20px_20px_rgba(26,43,60,0.1)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 400">
                                    <path 
                                        d={getPath()} 
                                        fill="none" 
                                        stroke="#1a2b3c" 
                                        strokeLinecap="round" 
                                        strokeWidth="4"
                                        className="transition-all duration-1000 ease-out dark:stroke-slate-100"
                                    />
                                    {chartPoints.map((p, i) => {
                                        const x = (i / 11) * 1000;
                                        const y = 400 - (p.val * 4);
                                        return (
                                            <circle 
                                                key={i} 
                                                cx={x} 
                                                cy={y} 
                                                fill="#1a2b3c" 
                                                r="6" 
                                                className="dark:fill-slate-100 hover:r-8 transition-all cursor-crosshair group-hover:r-[7px]"
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                            {/* X Axis */}
                            <div className="absolute bottom-0 inset-x-0 flex justify-between px-8 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                {chartPoints.map(p => <span key={p.month}>{p.month}</span>)}
                            </div>
                        </div>
                    </div>
                    {/* Sidebar Container */}
                    <div className="flex flex-col gap-8">
                        {/* Recent Activities Widget */}
                        <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col group/activities">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Aktivitas Terbaru</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Log Sistem Terkini</p>
                                </div>
                                <select 
                                    className="bg-transparent border-none text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest focus:ring-0 cursor-pointer"
                                    value={queryParams.timeframe || 'month'}
                                    onChange={(e) => handleTimeframeChange(e.target.value)}
                                >
                                    <option value="day">Sehari</option>
                                    <option value="week">Seminggu</option>
                                    <option value="month">Sebulan</option>
                                    <option value="year">Setahun</option>
                                </select>
                            </div>
                            <div className="p-0 flex flex-col overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-6 space-y-4">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex gap-4 group/item">
                                                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform ${activity.color?.replace('text', 'bg').replace('500', '50')} dark:${activity.color?.replace('text', 'bg').replace('500', '500/10')} ${activity.color}`}>
                                                    <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                                        <span className="font-black text-slate-800 dark:text-slate-200">{activity.user?.name}</span> {activity.action} <span className="font-black text-slate-800 dark:text-slate-200">{activity.target_name}</span>
                                                    </p>
                                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{formatTime(activity.created_at)}</span>
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
                                <div className="px-6 pb-6">
                                    <button 
                                        onClick={() => setIsActivityModalOpen(true)}
                                        className="w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10"
                                    >
                                        Lihat Semua Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Terkini (Mobile Optimized) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Progress Terkini</h3>
                        <Link href={route('projects')} className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                            Semua <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {recentProjectsList.slice(0, 5).map((proj) => (
                            <div key={proj.id} className="bg-white dark:bg-white/[0.02] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-lg shadow-slate-200/30 dark:shadow-none space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-blue-600">
                                            <span className="material-symbols-outlined text-2xl font-black">router</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white line-clamp-1">{proj.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{proj.client} • {proj.pic}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-blue-600">{proj.progress}%</span>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">DONE</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-full h-2.5 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${proj.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2].map(i => (
                                                <div key={i} className="size-6 rounded-lg border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=U${i}&background=random`} className="size-full" alt="User" />
                                                </div>
                                            ))}
                                            <div className="size-6 rounded-lg border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                +3
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            DEADLINE: {new Date(proj.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop view table */}
                <div className="hidden lg:block space-y-8">
                    <div className="bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white italic">Recent Projects</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status Proyek Terbaru</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Detail</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PIC</th>
                                        <th className="px-8 py-5 text-[10px) font-black text-slate-400 uppercase tracking-[0.2em]">Tgl Kontrak / J.Tempo</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {recentProjectsList.map((proj, index) => (
                                        <tr 
                                            key={proj.id} 
                                            className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{proj.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{proj.id}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{proj.client}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                                                        <span className="material-symbols-outlined text-lg">person</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{proj.pic}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-[14px] text-slate-400">description</span>
                                                        {new Date(proj.contractDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                                        <span className="material-symbols-outlined text-[14px]">event</span>
                                                        {new Date(proj.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ${proj.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} 
                                                            style={{ width: `${proj.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-[10px] font-black ${proj.progress === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}`}>{proj.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                    proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' :
                                                    proj.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' :
                                                    proj.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' :
                                                    'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 ring-slate-200/50 dark:ring-white/10'
                                                }`}>
                                                    <span className={`material-symbols-outlined text-[13px] ${proj.status === 'Completed' ? 'font-fill' : ''}`}>
                                                        {proj.status === 'Completed' ? 'check_circle' :
                                                         proj.status === 'Ongoing' ? 'autorenew' :
                                                         proj.status === 'Pending' ? 'schedule' : 'block'}
                                                    </span>
                                                    {proj.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{formatTime(activity.created_at)}</span>
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
        </AuthenticatedLayout>
    );
}
