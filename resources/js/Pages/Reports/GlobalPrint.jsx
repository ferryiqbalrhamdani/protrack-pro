import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function GlobalPrint({ 
    year,
    monthlyStats = [],
    statusStats = { total: 0, ongoing: 0, completed: 0, pending: 0 },
    companyContractValues = [],
    moduleStats = {
        contract: { ongoing: 0, completed: 0, pending: 0 },
        merchandiser: { ongoing: 0, completed: 0, pending: 0 },
        billing: { ongoing: 0, completed: 0, pending: 0 },
        shipping: { ongoing: 0, completed: 0, pending: 0 },
    },
    financialStats = { total_nilai: 0, akumulasi_dp: 0, pembayaran_langsung: 0, tagihan_termin: 0 },
    dueProjects = []
}) {
    // Automatically trigger print dialog when component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const DataRow = ({ label, value, colorClass = "text-slate-900" }) => (
        <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 font-display">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-black ${colorClass}`}>{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
            <Head title={`Report Summary - ${year}`} />
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 1.5cm; size: A4 portrait; }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print { display: none !important; }
                    .page-break { page-break-before: always; break-before: page; padding-top: 1cm !important; }
                    .avoid-break { page-break-inside: avoid; break-inside: avoid; }
                }
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}} />

            {/* Floating Print Button */}
            <button 
                onClick={() => window.print()}
                className="no-print fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center z-50 group font-display"
                title="Cetak Laporan"
            >
                <span className="material-symbols-outlined text-[24px]">print</span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-2 font-bold text-sm">
                    Cetak Laporan
                </span>
            </button>

            {/* A4 Portrait Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:m-0 font-display min-h-[297mm] flex flex-col">
                
                {/* Header */}
                <div className="p-10 border-b-4 border-slate-900 bg-slate-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-2xl font-fill">analytics</span>
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                    Protrack Pro <span className="text-blue-600">Reports</span>
                                </h1>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">RINGKASAN LAPORAN TAHUNAN</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Periode Laporan • Tahun {year === 'All' ? 'Keseluruhan' : year}</p>
                        </div>
                        <div className="text-right">
                            <div className="inline-block border-2 border-slate-900 px-4 py-2 mb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">CONFIDENTIAL REPORT</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-10 space-y-10">
                    
                    {/* Section 1: Executive Overview */}
                    <div className="grid grid-cols-2 gap-8 avoid-break">
                        <div>
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 border-b border-blue-100 pb-2">Status Distribusi Proyek</h3>
                            <div className="space-y-1">
                                <DataRow label="Total Seluruh Proyek" value={statusStats.total} colorClass="text-slate-900 text-lg" />
                                <DataRow label="Proyek Berjalan (Ongoing)" value={statusStats.ongoing} colorClass="text-blue-600" />
                                <DataRow label="Proyek Selesai (Completed)" value={statusStats.completed} colorClass="text-emerald-600" />
                                <DataRow label="Proyek Tertunda (Pending)" value={statusStats.pending} colorClass="text-amber-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 border-b border-blue-100 pb-2">Ringkasan Finansial</h3>
                            <div className="space-y-1">
                                <DataRow label="Total Nilai Kontrak" value={formatCurrency(financialStats.total_nilai)} colorClass="text-slate-900" />
                                <DataRow label="Akumulasi DP" value={formatCurrency(financialStats.akumulasi_dp)} colorClass="text-indigo-600" />
                                <DataRow label="Tagihan Termin" value={formatCurrency(financialStats.tagihan_termin)} colorClass="text-emerald-600" />
                                <DataRow label="Pembayaran Langsung" value={formatCurrency(financialStats.pembayaran_langsung)} colorClass="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Module Lifecycle Stats */}
                    <div className="avoid-break">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-blue-100 pb-2">Statistik Siklus Hidup Modul</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { name: 'Kontrak', stats: moduleStats.contract, color: 'blue' },
                                { name: 'Merchandiser', stats: moduleStats.merchandiser, color: 'emerald' },
                                { name: 'Penagihan', stats: moduleStats.billing, color: 'amber' },
                                { name: 'Pengiriman', stats: moduleStats.shipping, color: 'rose' },
                            ].map((m) => (
                                <div key={m.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">{m.name}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold">ONGOING</span>
                                            <span className="font-black text-slate-800">{m.stats.ongoing}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold">COMPLETED</span>
                                            <span className="font-black text-slate-800">{m.stats.completed}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-500 font-bold">PENDING</span>
                                            <span className="font-black text-slate-800">{m.stats.pending}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Monthly Trends */}
                    <div className="avoid-break">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-blue-100 pb-2">Tren Proyek Bulanan</h3>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 overflow-hidden">
                            <div className="flex items-end justify-between h-32 gap-2">
                                {monthlyStats.map((s, i) => {
                                    const maxVal = Math.max(...monthlyStats.map(m => m.v), 1);
                                    const height = (s.v / maxVal) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-t-lg relative" style={{ height: '100px' }}>
                                                <div 
                                                    className="absolute bottom-0 inset-x-0 bg-blue-600 rounded-t-lg transition-all duration-1000"
                                                    style={{ height: `${height}%` }}
                                                >
                                                    {s.v > 0 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-700">{s.v}</span>}
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{s.m}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Project Listing */}
                    <div className="page-break">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-blue-100 pb-2">Daftar Proyek Mendekati Tenggat Waktu</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-widest rounded-tl-xl">Proyek</th>
                                    <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-widest">No. Kontrak</th>
                                    <th className="py-3 px-4 text-center text-[9px] font-black uppercase tracking-widest">Progress</th>
                                    <th className="py-3 px-4 text-right text-[9px] font-black uppercase tracking-widest rounded-tr-xl">Deadline</th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px]">
                                {dueProjects.length > 0 ? dueProjects.slice(0, 15).map((p, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-black text-slate-800 line-clamp-1">{p.name}</td>
                                        <td className="py-3 px-4 font-bold text-slate-500 uppercase tracking-tighter">{p.contract_no}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${p.progress}%` }}></div>
                                                </div>
                                                <span className="font-black text-slate-700">{p.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-black text-rose-600">{p.due_date}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center text-slate-400 font-bold italic">Tidak ada proyek aktif untuk ditampilkan</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {dueProjects.length > 15 && (
                            <p className="mt-4 text-[8px] font-bold text-slate-400 italic">* Menampilkan 15 proyek teratas berdasarkan urgensi tenggat waktu.</p>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-10 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        <div>
                            PROTRACK PRO INDUSTRIAL ANALYTICS ENGINE
                        </div>
                        <div className="flex items-center gap-4">
                            <span>SISTEM TERAUTENTIKASI</span>
                            <span className="w-px h-3 bg-slate-300"></span>
                            <span>PROTRACK © {new Date().getFullYear()}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
