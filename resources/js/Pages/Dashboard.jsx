import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ExportButton from '@/Components/ExportButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import useSessionFilter from '@/Hooks/useSessionFilter';
import useMediaQuery from '@/Hooks/useMediaQuery';

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
    const [isDueProjectsModalOpen, setIsDueProjectsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useSessionFilter('DashboardRecent_viewMode', 'table');
    const isMobile = useMediaQuery('(max-width: 767px)');

    // On mobile always show card view
    const effectiveViewMode = isMobile ? 'grid' : viewMode;

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
                                <p className="text-[10px] font-bold text-indigo-100 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-80">{monthShort} {yearNum} • {appName}</p>
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

                {/* Main Billing Card */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-white/[0.02] p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col items-stretch gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/10 blur-[100px] -z-10 rounded-full group-hover:bg-blue-500/20 transition-colors" />
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-left">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Total Billing Protrack</p>
                                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none break-words">{formattedMetrics.totalBilling}</h3>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className={`flex items-center gap-1 text-[10px] font-black ${billingGrowth.trend === 'down' ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10' } px-2.5 py-1.5 rounded-xl`}>
                                        <span className="material-symbols-outlined text-sm font-black">{billingGrowth.trend === 'down' ? 'trending_down' : 'trending_up'}</span>
                                        <span>{billingGrowth.text}</span>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Akumulasi Seluruh Proyek</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto text-left sm:text-right">
                                <span className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 drop-shadow-sm">{metrics.completedBillingPercentage || 0}%</span>
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

                {/* Main Viz & Due Projects Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Chart Container */}
                    <div className="xl:col-span-2 bg-white dark:bg-white/[0.03] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 shrink-0">
                            <div>
                                <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">Trend Progres Project</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoring performa pengerjaan proyek setiap bulan</p>
                            </div>
                            <div className="flex items-center gap-2 bg-primary/5 dark:bg-blue-500/10 px-3 py-2 rounded-xl border border-primary/10 dark:border-blue-500/20 shrink-0 self-start sm:self-auto">
                                <span className="size-2.5 rounded-full bg-primary dark:bg-blue-400 shadow-lg shadow-primary/40"></span>
                                <span className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">Avg. Progres (%)</span>
                                <span className="text-[10px] font-black text-primary dark:bg-blue-400 uppercase tracking-widest">Avg. Progres (%)</span>
                            </div>
                        </div>

                        {/* Chart Area — fixed height, responsive */}
                        <div className="relative w-full h-[220px] sm:h-[280px] group">
                            {/* Y-Axis labels + dashed grid lines */}
                            <div className="absolute inset-0 pb-7 pl-12 flex flex-col justify-between pointer-events-none">
                                {[100, 75, 50, 25, 0].map(val => (
                                    <div key={val} className="h-0 w-full relative flex items-center">
                                        <span className="absolute -top-2.5 left-0 text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 w-10 text-right pr-2">
                                            {val}%
                                        </span>
                                        <div className="absolute left-10 right-0 border-t border-dashed border-slate-100 dark:border-white/[0.06]" />
                                    </div>
                                ))}
                            </div>

                            {/* SVG Chart */}
                            <div className="absolute inset-0 pb-7 pl-12 pr-2">
                                <svg
                                    className="w-full h-full overflow-visible"
                                    preserveAspectRatio="none"
                                    viewBox="0 0 1000 400"
                                >
                                    <defs>
                                        <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Gradient fill under line */}
                                    <path
                                        d={`${getPath()} L 1000 400 L 0 400 Z`}
                                        fill="url(#chartAreaGrad)"
                                    />

                                    {/* Chart line — uses currentColor so dark mode via className works */}
                                    <path
                                        d={getPath()}
                                        fill="none"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="stroke-primary dark:stroke-blue-400 transition-all duration-1000"
                                    />

                                    {/* Data points */}
                                    {chartPoints.map((p, i) => {
                                        const x = (i / 11) * 1000;
                                        const y = 400 - (p.val * 4);
                                        return (
                                            <g key={i}>
                                                <circle
                                                    cx={x} cy={y} r="5"
                                                    strokeWidth="2.5"
                                                    className="fill-white dark:fill-[#101827] stroke-primary dark:stroke-blue-400 cursor-crosshair transition-all"
                                                />
                                                <text
                                                    x={x} y={y - 14}
                                                    textAnchor="middle"
                                                    fontSize="30"
                                                    fontWeight="900"
                                                    className="fill-primary dark:fill-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {p.val}%
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* X-axis month labels */}
                            <div className="absolute bottom-0 inset-x-0 pl-12 pr-2 flex justify-between">
                                {chartPoints.map(p => (
                                    <span key={p.month} className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                        <span className="sm:hidden">{p.month.charAt(0)}</span>
                                        <span className="hidden sm:inline">{p.month}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Footer: Min / Avg / Max stats */}
                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 grid grid-cols-3 gap-3">
                            {[
                                { label: 'Tertinggi', value: `${Math.max(...chartPoints.map(p => p.val))}%`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
                                { label: 'Rata‑rata',  value: `${Math.round(chartPoints.reduce((a, b) => a + b.val, 0) / chartPoints.length)}%`, color: 'text-primary dark:text-blue-400', bg: 'bg-primary/5 dark:bg-blue-500/10', border: 'border-primary/10 dark:border-blue-500/20' },
                                { label: 'Terendah',  value: `${Math.min(...chartPoints.map(p => p.val))}%`, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' },
                            ].map(s => (
                                <div key={s.label} className={`text-center py-3 rounded-2xl border ${s.bg} ${s.border}`}>
                                    <p className={`text-sm sm:text-lg font-black ${s.color}`}>{s.value}</p>
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activities Widget (Moved to Sidebar) */}
                    <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col group/activities">
                        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Aktivitas Sistem</h3>
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
                                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform ${activity.color?.replace('text', 'bg').replace('500', '50')} dark:bg-white/5 ${activity.color}`}>
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
                            <div className="px-6 pb-6 mt-auto">
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

                {/* Bottom Row: Proyek Jatuh Tempo (Synchronized with Reports) */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
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
                        
                        <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
                             {(() => {
                                // Match exactly with Reports/Index.jsx helper
                                const getDueStatus = (dueDateStr) => {
                                    // Handle both field names (due from controller map, due_date from raw)
                                    const dateStr = dueDateStr || 'No Date';
                                    if (dateStr === 'No Date') return { label: 'Unknown', color: 'slate', bg: 'bg-slate-500/10', text: 'text-slate-600', icons: '?', level: 3 };

                                    const today = new Date();
                                    const dueDate = new Date(dateStr);
                                    const diffTime = dueDate - today;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    
                                    if (diffDays <= 30) return { label: 'Urgent', color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-600', icons: '!!!', level: 0 };
                                    if (diffDays <= 60) return { label: 'Near Due', color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-600', icons: '!!', level: 1 };
                                    return { label: 'Safe', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icons: '!', level: 2 };
                                };

                                const sortedDueProjects = [...dueProjects]
                                    .map(p => ({ ...p, statusObj: getDueStatus(p.due || p.due_date) }))
                                    .sort((a, b) => a.statusObj.level - b.statusObj.level || new Date(a.due || a.due_date) - new Date(b.due || b.due_date));

                                return sortedDueProjects.length > 0 ? (
                                    sortedDueProjects.map((proj, idx) => {
                                        const status = proj.statusObj;
                                        return (
                                            <div 
                                                key={proj.id || idx} 
                                                className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/10 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all group rounded-[2rem]"
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
                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 line-clamp-1 max-w-[180px] sm:max-w-[350px]">{proj.name}</p>
                                                        <p className="text-[10px] flex items-center gap-1 font-bold text-slate-400 mt-0.5">
                                                            <span className="material-symbols-outlined text-[10px] text-slate-400">fingerprint</span>
                                                            No. UP: {proj.up_no || proj.id || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="text-[10px] font-black text-slate-700 dark:text-white mb-1 uppercase tracking-tighter">
                                                        {proj.due || proj.due_date}
                                                    </p>
                                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.text} text-[8px] font-black uppercase tracking-widest border border-current/30`}>
                                                        <span className="size-1 rounded-full bg-current"></span>
                                                        {status.label}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">assignment_turned_in</span>
                                        <p className="text-xs font-bold text-slate-400">Tidak ada proyek tertunda</p>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="mt-8 px-2">
                             <button
                                onClick={() => setIsDueProjectsModalOpen(true)}
                                className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-[0.2em] border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center gap-2"
                            >
                                Lihat Semua Project
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Projects Header */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 lg:px-2 mb-6 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white italic">Recent Projects</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status Proyek Terbaru</p>
                        </div>
                        
                        {/* View Mode Toggle — Desktop only */}
                        <div className="hidden md:flex flex-shrink-0 items-center gap-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-1 rounded-2xl h-[48px] shadow-sm">
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`w-12 h-full rounded-xl flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 shadow-sm ring-1 ring-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                title="Tampilan Tabel"
                            >
                                <span className={`material-symbols-outlined text-[22px] ${viewMode === 'table' ? 'font-fill' : ''}`}>table_rows</span>
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`w-12 h-full rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 shadow-sm ring-1 ring-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                title="Tampilan Kartu"
                            >
                                <span className={`material-symbols-outlined text-[22px] ${viewMode === 'grid' ? 'font-fill' : ''}`}>grid_view</span>
                            </button>
                        </div>
                    </div>

                    {/* ─── CARD / GRID VIEW ─── */}
                    {effectiveViewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {recentProjectsList.map((proj) => (
                            <div 
                                key={proj.id}
                                className="bg-white dark:bg-white/[0.02] rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-6"
                            >
                                {/* Header: Name & ID */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <h4 className="font-black text-slate-800 dark:text-white leading-tight truncate" title={proj.name}>{proj.name}</h4>
                                        <p className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-widest mt-1">UP: {proj.id}</p>
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 ${
                                        proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' :
                                        proj.status === 'Ongoing'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20' :
                                        proj.status === 'Pending'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20' :
                                        'bg-slate-100 text-slate-500 ring-1 ring-slate-200/50 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10'
                                    }`}>
                                        <span className={`material-symbols-outlined text-[12px] ${proj.status === 'Completed' ? 'font-fill' : ''}`}>
                                            {proj.status === 'Completed' ? 'check_circle' :
                                             proj.status === 'Ongoing' ? 'autorenew' :
                                             proj.status === 'Pending' ? 'schedule' : 'block'}
                                        </span>
                                        {proj.status}
                                    </div>
                                </div>

                                {/* Details: Client & PIC (2 columns) */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-[8px]">Client</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{proj.client}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-[8px]">PIC</p>
                                        <div className="flex items-center gap-2">
                                            <div className="size-5 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-[14px]">person</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{proj.pic}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* No. Kontrak (Full width) */}
                                <div className="pb-4 border-b border-slate-50 dark:border-white/5">
                                    <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Kontrak</p>
                                        <p className="text-[11px] font-black text-slate-600 dark:text-slate-200 truncate">{proj.contract_no || '-'}</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Project Progress</span>
                                        <span className={proj.progress === 100 ? 'text-emerald-500' : 'text-primary dark:text-blue-400'}>{proj.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner uppercase tracking-widest transition-all duration-1000">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${proj.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} 
                                            style={{ width: `${proj.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01] p-3 rounded-2xl border border-slate-100/50 dark:border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Contract Date</span>
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{new Date(proj.contractDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                                    <div className="flex flex-col gap-0.5 text-right">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</span>
                                        <p className="text-[10px] font-black text-rose-500">{new Date(proj.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {/* ─── TABLE VIEW (desktop only) ─── */}
                    {effectiveViewMode === 'table' && (
                        <div className="bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[1100px] text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Detail</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No. Kontrak</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PIC</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tgl Kontrak / J.Tempo</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {recentProjectsList.map((proj) => (
                                            <tr 
                                                key={proj.id} 
                                                className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="premium-tooltip max-w-[200px] xl:max-w-[320px]" data-tooltip={proj.name}>
                                                        <div className="font-bold text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate">{proj.name}</div>
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {proj.id}</div>
                                                </td>
                                                <td className="px-8 py-6 min-w-[180px]">
                                                    <div className="premium-tooltip max-w-[160px]" data-tooltip={proj.contract_no || '-'}>
                                                        <div className="text-sm font-bold text-slate-600 dark:text-white truncate">
                                                            {proj.contract_no || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="premium-tooltip max-w-[150px]" data-tooltip={proj.client}>
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 truncate block">{proj.client}</span>
                                                    </div>
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
                    )}
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

            {/* Due Projects Modal */}
            <Modal 
                show={isDueProjectsModalOpen} 
                onClose={() => setIsDueProjectsModalOpen(false)}
                maxWidth="2xl"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Semua Proyek Jatuh Tempo</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring Deadline Terdekat</p>
                        </div>
                        <button 
                            onClick={() => setIsDueProjectsModalOpen(false)}
                            className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                        {(() => {
                            const getDueStatus = (dueDateStr) => {
                                const dateStr = dueDateStr || 'No Date';
                                if (dateStr === 'No Date') return { label: 'Unknown', color: 'slate', bg: 'bg-slate-500/10', text: 'text-slate-600', icons: '?', level: 3 };
                                const today = new Date();
                                const dueDate = new Date(dateStr);
                                const diffTime = dueDate - today;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (diffDays <= 30) return { label: 'Urgent', color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-600', icons: '!!!', level: 0 };
                                if (diffDays <= 60) return { label: 'Near Due', color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-600', icons: '!!', level: 1 };
                                return { label: 'Safe', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icons: '!', level: 2 };
                            };

                            const sortedDueProjectsAll = [...dueProjects]
                                .map(p => ({ ...p, statusObj: getDueStatus(p.due || p.due_date) }))
                                .sort((a, b) => a.statusObj.level - b.statusObj.level || new Date(a.due || a.due_date) - new Date(b.due || b.due_date));

                            return sortedDueProjectsAll.map((proj, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-12 rounded-xl ${proj.statusObj.bg} flex items-center justify-center ${proj.statusObj.text} shadow-sm`}>
                                            <div className="flex flex-row -space-x-1 items-center justify-center">
                                                {proj.statusObj.icons.split('').map((_, i) => (
                                                    <span key={i} className="material-symbols-outlined font-black text-[18px]">priority_high</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{proj.name}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">fingerprint</span>
                                                No. UP: {proj.up_no || proj.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-xs font-black text-slate-700 dark:text-white mb-1.5 uppercase tracking-tighter">{proj.due || proj.due_date}</p>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${proj.statusObj.bg} ${proj.statusObj.text} text-[10px] font-black uppercase tracking-widest border border-current/30`}>
                                            <span className="size-1.5 rounded-full bg-current animate-pulse"></span>
                                            {proj.statusObj.label}
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
