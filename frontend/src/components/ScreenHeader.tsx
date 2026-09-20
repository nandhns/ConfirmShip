import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  backTo?: string;
  trailing?: ReactNode;
}

export function ScreenHeader({ title, subtitle, back = true, backTo, trailing }: ScreenHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-hair bg-white/95 px-5 pb-3 pt-2 backdrop-blur">
      <div className="flex items-center gap-2">
        {back &&
        <button
          type="button"
          onClick={() => backTo ? navigate(backTo) : navigate(-1)}
          aria-label="Go back"
          className="-ml-2 rounded-full p-1.5 text-navy-900 transition-colors duration-150 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-600">
          
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        }
        <h1 className="text-[21px] font-bold tracking-tight text-navy-900">{title}</h1>
        {trailing && <div className="ml-auto">{trailing}</div>}
      </div>
      {subtitle && <p className="mt-0.5 pl-1 text-[12.5px] text-muted">{subtitle}</p>}
    </header>);

}