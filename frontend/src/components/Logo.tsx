import React from 'react';

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = 'h-7 w-7' }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="ConfirmShip AI">
      <path
        d="M4 20.5c2.6 0 2.6-2.2 5.2-2.2s2.6 2.2 5.2 2.2 2.6-2.2 5.2-2.2 2.6 2.2 5.2 2.2c2 0 2.5-1.3 3.9-1.9"
        fill="none"
        stroke="#1f5490"
        strokeWidth="2.4"
        strokeLinecap="round" />
      
      <path
        d="M6 14.6c3.4-3.4 8.6-6 14.6-6.6 3 -0.3 5.6 0.2 7.4 1.4-4.9 0.2-9.6 1.9-13.4 4.7-2.5 1.9-5.4 2.2-8.6 0.5z"
        fill="#0b2545" />
      
      <path
        d="M9.5 9.4C12.6 7 16.6 5.4 21 5c-3.6 1.5-6.8 3.5-9.4 5.9-0.7 0.1-1.4 0-2.1-0.4z"
        fill="#e11d48" />
      
    </svg>);

}

export function LogoLockup({ light = false }: {light?: boolean;}) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={light ? 'h-9 w-9' : 'h-8 w-8'} />
      <div className="leading-none">
        <div
          className={`font-bold tracking-tight ${light ? 'text-[26px] text-white' : 'text-[17px] text-navy-900'}`}>
          
          ConfirmShip 
        </div>
        <div
          className={`mt-1 ${light ? 'text-[11px] text-white/70' : 'text-[9px] text-muted'} font-medium tracking-wide`}>
          
          Smarter Shipping. Safer Trade.
        </div>
      </div>
    </div>);

}