import { cn } from '@/client/lib/utils';
import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-[#1E293B] bg-[#131B2E]">
    <table className={cn('w-full text-left text-xs text-slate-300', className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={cn('bg-[#0F1626] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={cn('divide-y divide-[#1E293B]/60 font-mono', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={cn('hover:bg-[#1B2640]/60 transition-colors cursor-pointer', className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={cn('px-4 py-3 font-semibold text-slate-300', className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td className={cn('px-4 py-3 align-middle text-slate-200', className)} {...props}>
    {children}
  </td>
);
