import React from 'react';

export default function DashboardPrintView({ metrics, chartPoints, recentProjectsList, dueProjects = [], year, stats, formattedMetrics, billingGrowth }) {
    // Helper to format date to Indonesian style: 19 Februari 2026
    const formatDateIndo = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    return (
        <div className="bg-white text-slate-900 font-sans printable-content" style={{ width: '293mm', boxSizing: 'border-box' }}>
            {/* PAGE 1: Summary & Charts - Forced h-[190mm] to prevent overflow */}
            <div className="p-8 h-[195mm] flex flex-col box-border overflow-hidden bg-white mb-2" style={{ breakAfter: 'page' }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-blue-600 pb-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-blue-900 leading-none">Operational Dashboard Report</h1>
                        <p className="text-md font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Protrack Pro Industrial Intelligence • {year === 'All' ? 'Semua Tahun' : `Tahun Anggaran ${year}`}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Generated On</p>
                        <p className="text-lg font-bold text-slate-800 leading-tight mt-1">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Total Billing</p>
                        <h3 className="text-lg font-black text-blue-700 leading-tight mb-1">{formattedMetrics.totalBilling}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Growth: <span className={billingGrowth.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>{billingGrowth.text}</span></p>
                    </div>
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{stat.label}</p>
                            <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{stat.value}</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6 mb-4 flex-grow overflow-hidden">
                    {/* Trend Chart (Fixed Height Logic) */}
                    <div className="col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                        <h3 className="text-lg font-black mb-8 flex items-center gap-2 leading-none text-slate-800">
                            <span className="size-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                            Project Progress Trend (%)
                        </h3>
                        <div className="flex-grow flex items-end justify-between px-6 pb-8 border-b border-l border-slate-200 relative min-h-[200px]">
                            {/* Y-axis labels */}
                            <div className="absolute -left-10 inset-y-0 flex flex-col justify-between text-[9px] font-black text-slate-300 py-1">
                                <span>100</span>
                                <span>75</span>
                                <span>50</span>
                                <span>25</span>
                                <span>0</span>
                            </div>
                            {chartPoints.map((p, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end" style={{ width: `${100 / 12}%` }}>
                                    <div 
                                        className="w-[70%] bg-blue-600 rounded-t-sm relative"
                                        style={{ height: `${p.val}%`, minHeight: p.val > 0 ? '3px' : '0px' }}
                                    >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600">{p.val}%</span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">{p.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Billing Progress Ring */}
                    <div className="bg-blue-600 p-6 rounded-[2rem] text-white flex flex-col justify-center items-center text-center overflow-hidden shadow-lg shadow-blue-600/20">
                        <div className="size-28 rounded-full border-[12px] border-white/10 flex items-center justify-center mb-6 bg-white/5 shadow-inner">
                             <h2 className="text-4xl font-black">{metrics.completedBillingPercentage}%</h2>
                        </div>
                        <h4 className="text-md font-black uppercase tracking-[0.2em] leading-tight">Payment Completion</h4>
                        <p className="text-[10px] opacity-60 mt-3 max-w-[180px] leading-relaxed">Percentage of value from projects.</p>
                    </div>
                </div>

                {/* Footer P1 */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    <p>© {new Date().getFullYear()} PROTRACK PRO INDUSTRIAL SYSTEM</p>
                    <p>PAGE 01 • OVERVIEW</p>
                </div>
            </div>

            {/* PAGE 2: Detailed Project Lists - Forced h-[190mm] */}
            <div className="p-8 h-[195mm] flex flex-col box-border overflow-hidden bg-[#fafafa]">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Detailed Project Audit</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">Data Filtered For: Year {year === 'All' ? new Date().getFullYear() : year}</p>
                </div>

                <div className="space-y-4 flex-grow overflow-hidden">
                    {/* Recent Projects Table */}
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 flex justify-between items-center border-b border-slate-100 bg-white">
                            <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 italic">Recent Projects</h3>
                            <span className="inline-block text-[9px] font-black px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase leading-none">Top {recentProjectsList.length} Items</span>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#fafafa]">
                                <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pl-8 pr-3 py-4">UP No</th>
                                    <th className="px-3 py-4">Project Name</th>
                                    <th className="px-3 py-4 text-center">Client</th>
                                    <th className="px-3 py-4 text-center">Progress</th>
                                    <th className="pl-3 pr-8 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentProjectsList.slice(0, 7).map((p, i) => (
                                    <tr key={i} className="text-[9px] font-bold text-slate-700">
                                        <td className="pl-8 pr-3 py-4 text-blue-600 font-black">{p.id}</td>
                                        <td className="px-3 py-4 max-w-[250px] leading-tight font-black text-slate-800 uppercase tracking-tighter truncate">{p.name}</td>
                                        <td className="px-3 py-4 text-slate-500 text-center text-[8px] truncate max-w-[120px]">{p.client || '-'}</td>
                                        <td className="px-3 py-4 text-center">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600" style={{ width: `${p.progress}%` }}></div>
                                                </div>
                                                <span className="text-[8px] font-black text-slate-400">{p.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="pl-3 pr-8 py-4">
                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center justify-center px-4 h-6 bg-slate-100 text-slate-600 rounded-lg uppercase text-[8px] font-black border border-slate-200 leading-none">
                                                    {p.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Proyek Jatuh Tempo */}
                    <div className="bg-[#fffefe] rounded-[1.5rem] border border-red-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 flex justify-between items-center border-b border-red-50 bg-red-50/20">
                            <h3 className="text-lg font-black uppercase tracking-widest text-[#b91c1c] italic flex items-center gap-2">
                                <span className="size-5 bg-red-500 text-white rounded flex items-center justify-center text-xs not-italic font-bold">!</span>
                                Proyek Jatuh Tempo
                            </h3>
                            <span className="inline-block text-[9px] font-black px-4 py-1.5 bg-red-100 text-red-700 rounded-full border border-red-200 uppercase tracking-tighter leading-none">Urgent Deadlines</span>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-red-50/10">
                                <tr className="text-[8px] font-black text-red-300 uppercase tracking-widest border-b border-red-50">
                                    <th className="pl-8 pr-3 py-4">UP No</th>
                                    <th className="px-3 py-4">Project Name</th>
                                    <th className="px-3 py-4 text-center">Due Date</th>
                                    <th className="pl-3 pr-8 py-4 text-center">Warning Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-50">
                                {dueProjects.length > 0 ? dueProjects.slice(0, 4).map((p, i) => (
                                    <tr key={i} className="text-[9px] font-bold text-slate-700">
                                        <td className="pl-8 pr-3 py-4 text-blue-600 font-extrabold">{p.up_no}</td>
                                        <td className="px-3 py-4 max-w-[300px] leading-tight font-black text-slate-800 uppercase truncate">{p.name}</td>
                                        <td className="px-3 py-4 text-center text-slate-500 text-[8px]">{formatDateIndo(p.due)}</td>
                                        <td className="pl-3 pr-8 py-4">
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex items-center justify-center px-4 h-6 rounded-lg uppercase text-[8px] font-black border leading-none ${
                                                    p.status === 'Urgent' ? 'bg-red-500 text-white border-red-600' : 'bg-amber-100 text-amber-700 border-amber-200'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-slate-300 font-extrabold uppercase text-[9px] tracking-widest italic">Tidak ada proyek mendesak</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer P2 */}
                <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    <p>© {new Date().getFullYear()} PROTRACK PRO INDUSTRIAL SYSTEM</p>
                    <p>PAGE 02 • DETAILED AUDIT</p>
                </div>
            </div>
        </div>
    );
}
