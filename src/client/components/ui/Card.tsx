import { cn } from '@/client/lib/utils';
import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'ox-card p-5 transition-all bg-[#0B111E] border border-[#172338] rounded-2xl shadow-lg text-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return <div className={cn('flex flex-col space-y-1 mb-4', className)} {...props}>{children}</div>;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return <h3 className={cn('text-sm font-semibold text-slate-100 flex items-center gap-2 tracking-tight', className)} {...props}>{children}</h3>;
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
  return <p className={cn('text-xs text-slate-400 font-normal leading-relaxed', className)} {...props}>{children}</p>;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return <div className={cn('space-y-3', className)} {...props}>{children}</div>;
};
