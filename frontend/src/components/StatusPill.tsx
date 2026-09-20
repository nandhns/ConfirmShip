import React from 'react';
import { EmailStatus } from '../types';

const styles: Record<EmailStatus, string> = {
  'no-mismatch': 'bg-good-soft text-good border-good/20',
  mismatch: 'bg-danger-soft text-danger border-danger/20',
  review: 'bg-warn-soft text-warn border-warn/25',
  invoice: 'bg-slate-100 text-slate-600 border-slate-200',
  general: 'bg-slate-100 text-slate-600 border-slate-200'
};

interface StatusPillProps {
  status: EmailStatus;
  label: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}>
      
      {label}
    </span>);

}