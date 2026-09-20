import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { getReview } from '../data/reviews';

export function HumanReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = getReview(id);
  const critical = item.reason === 'low-confidence';

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader
        title="Human review"
        backTo="/review"
        trailing={
        <span
          className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
          critical ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn'}`
          }>
          
            {item.reasonLabel}
          </span>
        } />
      

      <div className="px-5 pt-4">
        <h2 className="text-[20px] font-bold tracking-tight text-navy-900">
          {critical ? 'Low extraction confidence' : 'Missing evidence'}
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          AI confidence below the automatic-processing threshold for {item.shipmentRef}.
        </p>

        <dl className="mt-4 overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
          {[
          { term: 'Field', value: item.field },
          { term: 'SI value', value: item.siValue },
          { term: critical ? 'Invoice value' : 'BL value', value: item.blValue },
          { term: 'Reason', value: item.aiReason }].
          map((row, i) =>
          <div
            key={row.term}
            className={`flex gap-4 px-4 py-3 ${i > 0 ? 'border-t border-hair' : ''}`}>
            
              <dt className="w-[86px] shrink-0 text-[12.5px] text-muted">{row.term}</dt>
              <dd className="text-[12.5px] font-semibold leading-5 text-ink">{row.value}</dd>
            </div>
          )}
        </dl>

        <p className="mb-2 mt-5 text-[12.5px] font-semibold text-muted">Document excerpt</p>
        <div className="relative overflow-hidden rounded-2xl border border-hair bg-white p-3 shadow-card">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                {[100, 76, 88, 64, 92, 70].map((w, i) =>
                <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                {[82, 95, 58, 74].map((w, i) =>
                <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
                )}
                <div className="h-6 rounded bg-slate-300/70" />
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {[96, 90, 45].map((w, i) =>
              <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Zoom document excerpt"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white transition-transform duration-150 ease-out active:scale-95">
            
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11.5px] text-muted">{item.excerptNote}</p>

        <button
          type="button"
          onClick={() => navigate('/review')}
          className="mt-5 w-full rounded-2xl bg-navy-900 py-3.5 text-[14.5px] font-bold text-white transition-transform duration-150 ease-out active:scale-[0.99]">
          
          Confirm / correct value
        </button>
        <button
          type="button"
          onClick={() => navigate('/review')}
          className="mb-2 mt-3 w-full rounded-2xl border border-hair bg-white py-3.5 text-[14.5px] font-bold text-navy-900 transition-colors duration-150 hover:bg-slate-50">
          
          Close
        </button>
      </div>
    </div>);

}