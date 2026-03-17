import React from 'react';

const TableSkeleton = ({ columns = 8, rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-50 dark:border-white/5 animate-pulse-slow">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-6 whitespace-nowrap">
                            <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-full shimmer"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;
