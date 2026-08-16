import { cn } from '@/client/lib/utils';
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'high' | 'medium' | 'low' | 'outline';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default', dot = false, ...props }) => {
  const variants = {
    default: 'bg-[#1E293B] text-slate-300 border-[#334155]',
    success: 'bg-[#064E3B]/60 text-[#34D399] border-[#059669]/40',
    warning: 'bg-[#78350F]/60 text-[#FBBF24] border-[#D97706]/40',
    danger: 'bg-[#7F1D1D]/60 text-[#F87171] border-[#DC2626]/40',
    critical: 'bg-[#991B1B]/80 text-[#FECACA] border-[#EF4444] font-bold uppercase tracking-wider',
    high: 'bg-[#7C2D12]/70 text-[#FDBA74] border-[#EA580C]/50 font-semibold',
    medium: 'bg-[#713F12]/70 text-[#FDE047] border-[#CA8A04]/50',
    low: 'bg-[#1E3A8A]/70 text-[#93C5FD] border-[#2563EB]/40',
    info: 'bg-[#1E3A8A]/50 text-[#60A5FA] border-[#3B82F6]/30',
    outline: 'bg-transparent text-slate-300 border-[#334155]',
  };

  const dots = {
    default: 'bg-slate-400',
    success: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
    critical: 'bg-[#EF4444] animate-pulse',
    high: 'bg-[#F97316]',
    medium: 'bg-[#EAB308]',
    low: 'bg-[#3B82F6]',
    info: 'bg-[#3B82F6]',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors font-mono',
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

