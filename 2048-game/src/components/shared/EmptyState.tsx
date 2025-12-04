// src/components/shared/EmptyState.tsx
import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Icon size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">{title}</p>
            <p className="text-sm">{description}</p>
        </div>
    );
};