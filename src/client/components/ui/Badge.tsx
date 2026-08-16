import { cn } from '@/client/lib/utils';
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'high' | 'medium' | 'low' | 'outline';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default', dot = false, ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    critical: 'bg-red-100 text-red-800 border-red-200 font-bold uppercase tracking-wider',
    high: 'bg-orange-50 text-orange-700 border-orange-200 font-semibold',
    medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    outline: 'bg-transparent text-slate-600 border-slate-200',
  };

  const dots = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    critical: 'bg-red-500 animate-pulse',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
    info: 'bg-indigo-500',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors font-sans',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full inline-block', dots[variant])} />}
      {children}
    </span>
  );
};


