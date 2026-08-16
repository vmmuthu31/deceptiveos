import { cn } from '@/client/lib/utils';
import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'ox-card p-5 transition-all bg-white border border-slate-200/80 rounded-2xl shadow-xs',
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
  return <h3 className={cn('text-base font-semibold text-slate-900 flex items-center gap-2 tracking-tight', className)} {...props}>{children}</h3>;
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
  return <p className={cn('text-xs text-slate-500 font-normal leading-relaxed', className)} {...props}>{children}</p>;
};


