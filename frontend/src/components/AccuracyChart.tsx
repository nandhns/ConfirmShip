import React from 'react';
import { AccuracyPoint } from '../data/analytics';

interface AccuracyChartProps {
  data: AccuracyPoint[];
}

const W = 300;
const H = 96;
const MIN = 40;
const MAX = 100;

export function AccuracyChart({ data }: AccuracyChartProps) {
  const points = data.map((d, i) => ({
    x: i / (data.length - 1) * W,
    y: H - (d.value - MIN) / (MAX - MIN) * H
  }));

  const path = points.
  map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }).
  join(' ');

  return (
    <div className="flex gap-2">
      <div className="flex h-[96px] flex-col justify-between py-[1px] text-[9.5px] font-medium text-slate-400">
        {['100%', '80%', '60%', '40%'].map((t) =>
        <span key={t}>{t}</span>
        )}
      </div>
      <div className="flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[96px] w-full" role="img" aria-label="Verification accuracy trend">
          {[0, 1, 2, 3].map((i) =>
          <line
            key={i}
            x1="0"
            x2={W}
            y1={i * H / 3}
            y2={i * H / 3}
            stroke="#eef2f7"
            strokeWidth="1" />

          )}
          <path d={path} fill="none" stroke="#1f5490" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx={points[points.length - 1].x - 1.5} cy={points[points.length - 1].y} r="3" fill="#1f5490" />
        </svg>
        <div className="mt-1.5 flex justify-between text-[9.5px] font-medium text-slate-400">
          {data.map((d) =>
          <span key={d.label}>{d.label}</span>
          )}
        </div>
      </div>
    </div>);

}