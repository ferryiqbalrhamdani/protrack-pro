import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SearchableSelect({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Pilih opsi...", 
    multiple = false,
    label = "",
    error = null,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const [dropdownCoords, setDropdownCoords] = useState({ top: 'auto', bottom: 'auto', left: 0, width: 0 });
    const NAVBAR_HEIGHT = 80; // Matching h-20 in AuthenticatedLayout

    // Normalize options to { label, value }
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                label: String(opt.label || opt.name || opt.text || opt.value || ''),
                value: opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : opt)
            };
        }
        return { label: String(opt), value: opt };
    });

    // Filter options based on search
    const filteredOptions = normalizedOptions.filter(opt => {
        const label = opt.label || '';
        return label.toLowerCase().includes(search.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target) && !event.target.closest('.searchable-select-portal')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropdownHeight = 350; // max reasonable height of dropdown
                
                if (spaceBelow >= dropdownHeight || spaceBelow > rect.top) {
                    let topPos = rect.bottom + 8;
                    // Ensure we don't overlap the navbar if trigger is scrolling under it
                    if (rect.top < NAVBAR_HEIGHT) {
                        topPos = Math.max(topPos, NAVBAR_HEIGHT);
                    }
                    
                    // If trigger is almost completely hidden behind navbar, close it
                    if (rect.bottom < NAVBAR_HEIGHT - 20) {
                        setIsOpen(false);
                        return;
                    }

                    setDropdownCoords({
                        top: topPos,
                        bottom: 'auto',
                        left: rect.left,
                        width: rect.width
                    });
                } else {
                    let bottomPos = window.innerHeight - rect.top + 8;
                    // If appearing above, we must stay below navbar
                    const maxTop = rect.top - 8;
                    if (maxTop < NAVBAR_HEIGHT) {
                        // If no space above navbar, force it below
                        setDropdownCoords({
                            top: rect.bottom + 8,
                            bottom: 'auto',
                            left: rect.left,
                            width: rect.width
                        });
                        return;
                    }

                    setDropdownCoords({
                        top: 'auto',
                        bottom: bottomPos,
                        left: rect.left,
                        width: rect.width
                    });
                }
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const toggleOption = (opt) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(opt.value)
                ? currentValues.filter(v => v !== opt.value)
                : [...currentValues, opt.value];
            onChange(newValue);
        } else {
            onChange(opt.value);
            setIsOpen(false);
            setSearch('');
        }
    };

    const isSelected = (opt) => {
        if (multiple) return Array.isArray(value) && value.includes(opt.value);
        return value === opt.value;
    };

    const getDisplayValue = () => {
        if (multiple) return null; // Handled separately
        const selected = normalizedOptions.find(opt => opt.value === value);
        return selected ? selected.label : null;
    };

    const displayValue = getDisplayValue();

    return (
        <div className="relative space-y-2" ref={containerRef}>
            {label && <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{label}</label>}
            
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border ${
                    error ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-white/10'
                } rounded-2xl ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                } transition-all flex items-center justify-between group ${
                    !disabled && isOpen ? (error ? 'ring-2 ring-red-500/20 border-red-500' : 'ring-2 ring-primary/20 border-primary/50') : (!disabled ? 'hover:border-slate-300 dark:hover:border-white/20' : '')
                }`}
            >
                <div className="flex flex-wrap gap-2 flex-1">
                    {multiple ? (
                        Array.isArray(value) && value.length > 0 ? (
                            value.map(v => {
                                const opt = normalizedOptions.find(o => o.value === v) || { label: v, value: v };
                                return (
                                    <span key={v} className="px-3 py-1 bg-primary/10 dark:bg-blue-400/10 text-primary dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 animate-reveal">
                                        {opt.label}
                                        <span 
                                            className="material-symbols-outlined text-xs cursor-pointer hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(opt);
                                            }}
                                        >
                                            close
                                        </span>
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">{placeholder}</span>
                        )
                    ) : (
                        <span className={`text-sm font-bold ${displayValue ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {displayValue || placeholder}
                        </span>
                    )}
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 ${error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'} ${isOpen ? 'rotate-180' : ''} ${isOpen && !error ? 'text-primary' : ''}`}>
                    expand_more
                </span>
            </div>

            {error && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">{error}</p>}

            {/* Dropdown Panel - via Portal */}
            {isOpen && createPortal(
                <div 
                    className="fixed z-50 bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl animate-reveal overflow-hidden backdrop-blur-xl searchable-select-portal"
                    style={{
                        top: dropdownCoords.top !== 'auto' ? `${dropdownCoords.top}px` : 'auto',
                        bottom: dropdownCoords.bottom !== 'auto' ? `${dropdownCoords.bottom}px` : 'auto',
                        left: `${dropdownCoords.left}px`,
                        width: `${dropdownCoords.width}px`
                    }}
                >
                    {/* Search Input */}
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
                            <input 
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari data..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div 
                                    key={String(opt.value)}
                                    onClick={() => toggleOption(opt)}
                                    className={`px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer transition-all group ${
                                        isSelected(opt) 
                                        ? 'bg-primary/10 text-primary dark:bg-blue-400/10 dark:text-blue-400' 
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <span className="text-sm font-bold">{opt.label}</span>
                                    {isSelected(opt) && (
                                        <span className="material-symbols-outlined text-lg font-bold animate-reveal">check_circle</span>
                                    )}
                                </div>
                            ))
                        ) : search ? (
                            <div 
                                onClick={() => toggleOption({ label: search, value: search })}
                                className="m-2 p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group"
                            >
                                <span className="material-symbols-outlined text-primary text-3xl mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Buat Opsi Baru</p>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">"{search}"</p>
                            </div>
                        ) : (
                            <div className="p-8 text-center space-y-2">
                                <span className="material-symbols-outlined text-slate-300 text-3xl">search_off</span>
                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Data tidak ditemukan</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer Info */}
                    <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {filteredOptions.length} Opsi Tersedia
                        </p>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
