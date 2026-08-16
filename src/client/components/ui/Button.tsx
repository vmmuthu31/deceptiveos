import { cn } from '@/client/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-sm',
    secondary: 'bg-[#1E293B] hover:bg-[#28354D] text-slate-200 border border-[#334155]',
    danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-500/50 shadow-sm',
    ghost: 'bg-transparent hover:bg-[#1E293B] text-slate-300 hover:text-slate-100',
    outline: 'bg-transparent hover:bg-[#1E293B]/60 text-slate-200 border border-[#334155]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2 font-medium',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

