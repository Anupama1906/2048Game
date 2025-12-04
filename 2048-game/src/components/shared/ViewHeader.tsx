// src/components/shared/ViewHeader.tsx
import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface ViewHeaderProps {
    onBack: () => void;
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    rightContent?: React.ReactNode;
    sticky?: boolean;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
    onBack,
    title,
    subtitle,
    icon: Icon,
    iconColor = 'text-indigo-600 dark:text-indigo-400',
    rightContent,
    sticky = true
}) => {
    return (
        <div className={`flex items-center justify-between mb-6 pt-6 ${sticky ? 'sticky top-0 z-10 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent pb-4' : ''
            }`}>
            <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow text-slate-600 dark:text-slate-300 font-bold active:scale-95"
            >
                <ChevronRight className="rotate-180" size={20} />
                <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={`bg-${iconColor.split('-')[1]}-100 dark:bg-${iconColor.split('-')[1]}-900/30 p-2 rounded-lg`}>
                        <Icon size={24} className={iconColor} />
                    </div>
                )}
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {rightContent || <div className="w-24" />}
        </div>
    );
};