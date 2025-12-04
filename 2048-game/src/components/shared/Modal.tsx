// src/components/shared/Modal.tsx
import React from 'react';
import { X, type LucideIcon } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showCloseButton?: boolean;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon: Icon,
    iconColor = 'text-indigo-600 dark:text-indigo-400',
    children,
    maxWidth = 'md',
    showCloseButton = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ${maxWidthClasses[maxWidth]} w-full max-h-[80vh] flex flex-col animate-in zoom-in duration-200`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`p-3 bg-${iconColor.split('-')[1]}-100 dark:bg-${iconColor.split('-')[1]}-900/30 rounded-xl`}>
                                <Icon size={28} className={iconColor} />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                        >
                            <X size={24} className="text-slate-600 dark:text-slate-300" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};