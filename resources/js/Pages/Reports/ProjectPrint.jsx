import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ProjectPrint({ project }) {
    // Automatically trigger print dialog when component mounts
    useEffect(() => {
        // Use a slight delay to ensure fonts and styles are loaded
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const DataItem = ({ label, value }) => (
        <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-sm font-semibold text-gray-900">{value || '-'}</div>
        </div>
    );

    return (
        <>
            <Head title={`Print - Project ${project.proj}`} />
            
            {/* 
                We use a specific class pattern here optimized for @media print.
                The w-[210mm] and min-h-[297mm] forces an exact A4 proportion on screen,
                and @media print styles ensure it fits the paper exactly without headers/footers.
            */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0; size: A4 landscape; }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print { display: none !important; }
                    .page-break { page-break-before: always; }
                    .avoid-break { page-break-inside: avoid; }
                    .watermark {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) rotate(-35deg) !important;
                        z-index: 9999 !important;
                        pointer-events: none !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                body { background-color: #f1f5f9; }
            `}} />

            {/* Floating Print Button for Screen View */}
            <button 
                onClick={() => window.print()}
                className="no-print fixed bottom-8 right-8 bg-slate-900 text-white rounded-full p-4 shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center z-50 group"
                title="Cetak Dokumen"
            >
                <span className="material-symbols-outlined text-[24px]">print</span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-2 font-bold text-sm">
                    Cetak
                </span>
            </button>

            {/* A4 Landscape Container */}
            <div className="max-w-[297mm] mx-auto bg-white sm:my-8 shadow-xl print:shadow-none print:m-0 print:w-full print:max-w-none relative overflow-hidden">

                {/* Status Watermark */}
                {(() => {
                    const s = project.status?.toLowerCase();
                    let label, iconText, textColor;
                    if (s === 'completed' || s === 'selesai') {
                        label = 'COMPLETED';
                        iconText = 'task_alt';
                        textColor = 'rgba(16,185,129,0.15)';
                    } else if (s === 'pending') {
                        label = 'PENDING';
                        iconText = 'hourglass_empty';
                        textColor = 'rgba(245,158,11,0.15)';
                    } else {
                        label = 'ONGOING';
                        iconText = 'bolt';
                        textColor = 'rgba(59,130,246,0.15)';
                    }
                    return (
                        <div
                            className="watermark"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-35deg)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: textColor,
                                userSelect: 'none',
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                                zIndex: 0,
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '10rem', color: textColor }}
                            >
                                {iconText}
                            </span>
                            <span style={{ fontSize: '5rem', fontWeight: 900, letterSpacing: '0.3em', color: textColor }}>
                                {label}
                            </span>
                        </div>
                    );
                })()}
                
                {/* Header Section */}
                <div className="border-b-4 border-slate-900 p-8 pt-12 avoid-break">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">LAPORAN PROYEK</h1>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">{project.proj}</p>
                                {project.up && project.up !== '-' && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <p className="text-sm font-bold text-purple-600 tracking-widest uppercase bg-purple-50 px-2 rounded">UP: {project.up}</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block border-2 border-slate-900 px-4 py-1.5 mb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-900">STATUS: {project.status}</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg mt-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h2>
                        <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                </div>

                {/* 1. Informasi Utama */}
                <div className="p-8 avoid-break border-b border-gray-100">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 pb-2 mb-6">Informasi Utama & Legalitas</h3>
                    
                    <div className="grid grid-cols-3 gap-6">
                        <DataItem label="Perusahaan" value={project.company} />
                        <DataItem label="Instansi" value={project.institution} />
                        <DataItem label="Vendor Pelaksana" value={project.vendors.join(', ')} />
                        
                        <DataItem label="Jenis Lelang" value={project.auctionType} />
                        <DataItem label="Jenis Anggaran" value={project.budgetType} />
                        <DataItem label="Tahun Anggaran" value={project.budgetYear} />
                        
                        <DataItem label="Status Bebas Pajak" value={project.taxFree} />
                        <DataItem label="Sistem Pembayaran" value={project.paymentTerm} />
                        <DataItem label="Garansi Unit" value={project.warranty} />
                    </div>
                </div>

                {/* 2. Kontrak & Finansial */}
                <div className="p-8 avoid-break border-b border-gray-100">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 pb-2 mb-6">Kontrak & Finansial</h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-blue-50/50 p-6 rounded-lg border border-blue-100 mb-6">
                        <DataItem label="Nomor Kontrak" value={project.contractNo} />
                        <DataItem label="Tanggal Kontrak" value={project.contractDate} />
                        <DataItem label="Tenggat Waktu" value={project.dueDate} />
                        <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Nilai Kontrak</div>
                            <div className="text-base font-black text-emerald-600">{project.value}</div>
                        </div>
                    </div>

                    {(!project.paymentTerm || project.paymentTerm === 'Termin Berjangka') && project.installments?.length > 0 ? (
                        <>
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Rincian Pembagian Termin</h4>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-y border-slate-200">
                                        <th className="text-left font-bold text-gray-600 py-3 px-4 uppercase text-[10px] tracking-widest">Termin</th>
                                        <th className="text-right font-bold text-gray-600 py-3 px-4 uppercase text-[10px] tracking-widest">Persentase</th>
                                        <th className="text-right font-bold text-gray-600 py-3 px-4 uppercase text-[10px] tracking-widest">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.installments.map((inst, index) => (
                                        <tr key={inst.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td className="py-3 px-4 border-b border-slate-100 font-semibold">{inst.name}</td>
                                            <td className="text-right py-3 px-4 border-b border-slate-100">{inst.percentage}%</td>
                                            <td className="text-right py-3 px-4 border-b border-slate-100 font-bold text-emerald-600">{inst.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : project.paymentTerm === 'DP 20%' ? (
                        <>
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Rincian Pembayaran DP</h4>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-y border-slate-200">
                                        <th className="text-left font-bold text-gray-600 py-3 px-4 uppercase text-[10px] tracking-widest">Keterangan</th>
                                        <th className="text-right font-bold text-gray-600 py-3 px-4 uppercase text-[10px] tracking-widest">Persentase</th>
                                        <th className="text-right font-bold text-gray-600 py-3 px-4 uppercase text-[10px] tracking-widest">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="py-3 px-4 border-b border-slate-100 font-semibold">Down Payment (DP)</td>
                                        <td className="text-right py-3 px-4 border-b border-slate-100">20%</td>
                                        <td className="text-right py-3 px-4 border-b border-slate-100 font-bold text-blue-600">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((parseInt(project.value.replace(/[^0-9]/g, '')) || 0) * 0.2)}
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-50">
                                        <td className="py-3 px-4 border-b border-slate-100 font-semibold">Sisa Pembayaran</td>
                                        <td className="text-right py-3 px-4 border-b border-slate-100">80%</td>
                                        <td className="text-right py-3 px-4 border-b border-slate-100 font-bold text-emerald-600">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((parseInt(project.value.replace(/[^0-9]/g, '')) || 0) * 0.8)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <>
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Metode Pembayaran</h4>
                            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Jenis Pembayaran</p>
                                    <p className="text-lg font-black text-purple-800">{project.paymentTerm || 'Pembayaran Langsung (Pelunasan)'}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm">Nilai kontrak dibayarkan sekaligus tanpa DP atau termin pendahuluan.</p>
                                </div>
                                <div className="text-right border-l border-purple-200 pl-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Dibayarkan</p>
                                    <p className="text-2xl font-black text-emerald-600">{project.value}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Detail Modul - Page Break for clean layout */}
                <div className="p-8 page-break">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 pb-2 mb-8">Detail Relasi Modul</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Kontrak Module Summary */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden avoid-break">
                            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex justify-between">
                                    <span>Modul Kontrak</span>
                                    <span className="text-blue-600">Handler: {project.relations.contract.userHandle}</span>
                                </h4>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-xs text-gray-500 font-bold">JAMLAK</span>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold block">{project.relations.contract.jamlak}</span>
                                            {project.relations.contract.jamlak !== '-' && (
                                                <span className="text-[10px] text-blue-600 font-bold">Rp {new Intl.NumberFormat('id-ID').format(project.relations.contract.jamlakValue || 0)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-xs text-gray-500 font-bold">JAMUK</span>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold block">{project.relations.contract.jamuk}</span>
                                            {project.relations.contract.jamuk !== '-' && (
                                                <span className="text-[10px] text-emerald-600 font-bold">Rp {new Intl.NumberFormat('id-ID').format(project.relations.contract.jamukValue || 0)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-xs text-gray-500 font-bold">JAMWAR</span>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold block">{project.relations.contract.jamwar}</span>
                                            {project.relations.contract.jamwar !== '-' && (
                                                <span className="text-[10px] text-amber-600 font-bold">Rp {new Intl.NumberFormat('id-ID').format(project.relations.contract.jamwarValue || 0)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {project.relations.contract.stages && project.relations.contract.stages.length > 0 && (
                                    <div className="mb-6">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tahapan Kontrak</div>
                                        <table className="w-full text-xs text-left border-collapse border border-gray-200">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="py-1 px-2 border border-gray-200 w-8 text-center text-[9px] uppercase">No</th>
                                                    <th className="py-1 px-2 border border-gray-200 text-[9px] uppercase">Nama Tahapan</th>
                                                    <th className="py-1 px-2 border border-gray-200 w-16 text-center text-[9px] uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {project.relations.contract.stages.map((stage) => (
                                                    <tr key={stage.id}>
                                                        <td className="py-1.5 px-2 border border-gray-200 text-center text-gray-500">{stage.id}</td>
                                                        <td className="py-1.5 px-2 border border-gray-200 font-semibold">{stage.name}</td>
                                                        <td className="py-1.5 px-2 border border-gray-200 text-center">
                                                            {stage.completed ? (
                                                                <span className="text-emerald-600 font-black text-[10px]">✓</span>
                                                            ) : (
                                                                <span className="text-gray-300 font-black text-[10px]">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dokumen Terkait</div>
                                <div className="text-xs font-semibold space-y-1">
                                    {project.relations.contract.files && project.relations.contract.files.length > 0 ? (
                                        project.relations.contract.files.map((f, i) => (
                                            <div key={i} className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[14px] text-blue-500">description</span>
                                                <span className="truncate">{f.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-gray-400 italic">Belum ada dokumen</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Merchandiser Module Summary */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden avoid-break">
                            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex justify-between">
                                    <span>Modul Merchandiser</span>
                                    <span className="text-amber-600">PIC: {project.relations.merchandiser.userPIC}</span>
                                </h4>
                            </div>
                            <div className="p-6">
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-4">
                                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">Data Pembayaran</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span className="text-gray-600">Atas Nama:</span><span className="font-bold">{project.relations.merchandiser.paymentName}</span>
                                        <span className="text-gray-600">Bank:</span><span className="font-bold">{project.relations.merchandiser.paymentBank}</span>
                                        <span className="text-gray-600">No. Rek:</span><span className="font-bold">{project.relations.merchandiser.paymentAccount}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Items Kontrak</div>
                                        <div className="text-sm font-black">{new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.contractItems)} <span className="text-[10px] font-normal text-gray-400">({new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.contractEA)} EA)</span></div>
                                     </div>
                                     <div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Items Diterima</div>
                                        <div className="text-sm font-black text-emerald-600">{new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.receivedItems)} <span className="text-[10px] font-normal text-gray-400">({new Intl.NumberFormat('id-ID').format(project.relations.merchandiser.receivedEA)} EA)</span></div>
                                     </div>
                                </div>
                                {project.relations.merchandiser.pos && project.relations.merchandiser.pos.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">Purchase Orders & Invoices</div>
                                        <div className="space-y-3">
                                            {project.relations.merchandiser.pos.map((po) => (
                                                <div key={po.id} className="bg-gray-50 rounded p-3 border border-gray-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-bold text-xs">PO #{po.po_number}</span>
                                                            <span className="text-[10px] text-gray-500 block">{po.vendor_name || '-'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-semibold">{new Intl.NumberFormat('id-ID').format(po.items)} <span className="text-[9px] text-gray-400">Items</span></span>
                                                            <span className="text-[10px] text-gray-400 block">({new Intl.NumberFormat('id-ID').format(po.ea)} EA)</span>
                                                        </div>
                                                    </div>
                                                    {po.invoices && po.invoices.length > 0 && (
                                                        <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                                                            {po.invoices.map(inv => (
                                                                <div key={inv.id} className="flex justify-between items-center text-[10px]">
                                                                    <span className="font-medium">{inv.invoice_number}</span>
                                                                    <div className="flex gap-2">
                                                                        <span className="text-gray-500">{inv.date}</span>
                                                                        <span className={`font-bold uppercase px-1 rounded ${inv.status === 'Paid' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-50'}`}>{inv.status}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dokumen Terkait</div>
                                    <div className="text-xs font-semibold space-y-1">
                                        {project.relations.merchandiser.files && project.relations.merchandiser.files.length > 0 ? (
                                            project.relations.merchandiser.files.map((f, i) => (
                                                <div key={i} className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[14px] text-amber-500">description</span>
                                                    <span className="truncate">{f.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-gray-400 italic">Belum ada dokumen</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Module Summary */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden avoid-break">
                            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex justify-between">
                                    <span>Modul Penagihan</span>
                                    <span className="text-emerald-600">Handler: {project.relations.billing.userHandle}</span>
                                </h4>
                            </div>
                            <div className="p-6">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Data BAST</div>
                                <div className="text-xs space-y-2 mb-4">
                                    {project.relations.billing.basts.map(bast => (
                                        <div key={bast.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <span className="font-semibold">{bast.no}</span>
                                            <span className="text-gray-500">{bast.date}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status Penagihan</div>
                                <div className="text-xs space-y-2">
                                     {project.relations.billing.stages.map(stage => (
                                         <div key={stage.id} className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-1">
                                             <span className="font-medium">{stage.name}</span>
                                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${stage.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                 {stage.completed ? 'Selesai' : 'Tertunda'}
                                             </span>
                                         </div>
                                     ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dokumen Terkait</div>
                                    <div className="text-xs font-semibold space-y-1">
                                        {project.relations.billing.files && project.relations.billing.files.length > 0 ? (
                                            project.relations.billing.files.map((f, i) => (
                                                <div key={i} className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[14px] text-emerald-500">description</span>
                                                    <span className="truncate">{f.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-gray-400 italic">Belum ada dokumen</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Module Summary */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden avoid-break">
                            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex justify-between">
                                    <span>Modul Pengiriman</span>
                                    <span className="text-purple-600">Handler: {project.relations.shipping.userHandle}</span>
                                </h4>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                     <div className="text-xs">
                                         <span className="text-gray-500 font-bold uppercase tracking-wider block text-[10px] mb-1">Jenis</span>
                                         <span className="font-semibold bg-gray-100 px-2 py-1 rounded">{project.relations.shipping.type}</span>
                                     </div>
                                     <div className="text-xs text-right">
                                         <span className="text-gray-500 font-bold uppercase tracking-wider block text-[10px] mb-1">Tanggal Mulai</span>
                                         <span className="font-semibold">{project.relations.shipping.date}</span>
                                     </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">BA Anname</div>
                                        <div className="text-[11px] space-y-1">
                                            {project.relations.shipping.baAnnames.map(ba => (
                                                <div key={ba.id} className="font-medium text-gray-700">{ba.no}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">BA Inname</div>
                                        <div className="text-[11px] space-y-1">
                                            {project.relations.shipping.baInnames.length > 0 ? project.relations.shipping.baInnames.map(ba => (
                                                <div key={ba.id} className="font-medium text-gray-700">{ba.no}</div>
                                            )) : <span className="text-gray-400 italic">Belum ada</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dokumen Terkait</div>
                                    <div className="text-xs font-semibold space-y-1">
                                        {project.relations.shipping.files && project.relations.shipping.files.length > 0 ? (
                                            project.relations.shipping.files.map((f, i) => (
                                                <div key={i} className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[14px] text-purple-500">description</span>
                                                    <span className="truncate">{f.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-gray-400 italic">Belum ada dokumen</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 pt-0 mt-8 avoid-break">
                    <div className="border-t border-slate-300 pt-4 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Protrack Pro - Sistem Manajemen Pembatalan</span>
                        <span>Halaman Laporan Project</span>
                    </div>
                </div>

            </div>
        </>
    );
}
