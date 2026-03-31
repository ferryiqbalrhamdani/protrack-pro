import { useState, useRef, useEffect } from 'react';

export default function ExportButton({ onExportExcel, onExportPdf, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-center items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all group active:scale-95"
            >
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                Export
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl animate-reveal p-2 z-[100] backdrop-blur-xl">
                    <button 
                        onClick={() => {
                            onExportExcel?.();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors group"
                    >
                        <span className="material-symbols-outlined text-lg text-emerald-500 group-hover:scale-110 transition-transform">description</span>
                        Excel (.xlsx)
                    </button>
                    <button 
                        onClick={() => {
                            onExportPdf?.();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors group"
                    >
                        <span className="material-symbols-outlined text-lg text-red-500 group-hover:scale-110 transition-transform">picture_as_pdf</span>
                        PDF Document
                    </button>
                </div>
            )}
        </div>
    );
}
