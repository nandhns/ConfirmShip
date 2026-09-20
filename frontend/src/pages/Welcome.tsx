import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoLockup } from '../components/Logo';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative h-full w-full overflow-hidden bg-navy-950">
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-navy-900" />
      <svg
        className="absolute bottom-[26%] left-1/2 h-64 w-[420px] -translate-x-1/2 opacity-90"
        viewBox="0 0 420 260"
        aria-hidden="true">
        
        <rect x="120" y="120" width="180" height="46" rx="6" fill="#123a66" />
        <rect x="140" y="96" width="140" height="26" rx="4" fill="#17406f" />
        <rect x="160" y="78" width="100" height="20" rx="4" fill="#1f5490" />
        <rect x="186" y="46" width="14" height="34" rx="3" fill="#0f3057" />
        {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4, 5].map((col) =>
        <rect
          key={`${row}-${col}`}
          x={150 + col * 21}
          y={84 + row * 9}
          width="17"
          height="7"
          rx="1.5"
          fill={['#1f5490', '#e11d48', '#2a6bb0', '#d7dee8'][(row + col) % 4]}
          opacity="0.85" />

        )
        )}
        <path d="M100 166c40 10 180 10 220 0l-26 30H126z" fill="#0b2545" />
        <path
          d="M40 206c34 0 34-10 68-10s34 10 68 10 34-10 68-10 34 10 68 10 34-10 68-10"
          fill="none"
          stroke="#1f5490"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.6" />
        
        <path
          d="M10 226c34 0 34-10 68-10s34 10 68 10 34-10 68-10 34 10 68 10 34-10 68-10"
          fill="none"
          stroke="#17406f"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.5" />
        
      </svg>

      <div className="relative flex h-full flex-col px-7 pb-10 pt-16">
        <div className="flex justify-center">
          <LogoLockup light />
        </div>
        <p className="mt-10 text-center text-[16px] font-medium leading-6 text-white/85">
          AI-powered verification
          <br />
          for shipping documents
        </p>

        <div className="mt-auto">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full rounded-2xl bg-white py-3.5 text-[15px] font-bold text-navy-900 transition-transform duration-150 ease-out active:scale-[0.98]">
            
            Sign In
          </button>
        </div>
      </div>
    </div>);

}