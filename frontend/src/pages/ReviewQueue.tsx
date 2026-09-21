import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, CircleAlertIcon, ClockIcon } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { fetchReviewItems } from '../api/emails';
import { ReviewItem } from '../types';

const filters = [
{ id: 'all', label: 'All' },
{ id: 'review-required', label: 'Document' },
{ id: 'low-confidence', label: 'Low confidence' }];


export function ReviewQueue() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviewItems()
      .then(setReviews)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load reviews');
      })
      .finally(() => setLoading(false));
  }, []);

  const visible = reviews.filter((review) =>
    filter === 'all' || review.reason === filter
  );

  const count = (id: string) =>
  id === 'all' ? reviews.length : reviews.filter((r) => r.reason === id).length;

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader title="Review Queue" backTo="/home" />

      <div className="px-5 pt-3">
        <div className="flex gap-2 overflow-x-auto pb-1 screen-scroll">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-150 ${
                active ?
                'bg-navy-900 text-white' :
                'border border-hair bg-white text-slate-600 hover:border-slate-300'}`
                }>
                
                {f.label} ({count(f.id)})
              </button>);

          })}
        </div>

        {loading && (
          <p className="mt-5 text-center text-sm text-muted">Loading reviews...</p>
        )}
        {error && (
          <p className="mt-5 text-center text-sm text-danger">{error}</p>
        )}
        {!loading && !error && (
        <ul className="mt-3 space-y-3">
          {visible.map((item) => {
            const critical = item.reason === 'low-confidence';
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/review/${item.id}`)}
                  className={`flex w-full gap-3 rounded-2xl border px-4 py-3.5 text-left shadow-card transition-colors duration-150 ${
                  critical ?
                  'border-danger/20 bg-danger-soft/60 hover:bg-danger-soft' :
                  'border-warn/25 bg-warn-soft/60 hover:bg-warn-soft'}`
                  }>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${
                        critical ? 'bg-danger' : 'bg-warn'}`
                        }>
                        
                        <CircleAlertIcon className="h-3 w-3" />
                        {item.reasonLabel}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[11px] text-muted">
                        <ClockIcon className="h-3 w-3" />
                        {item.receivedAgo}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[15px] font-bold tracking-tight text-navy-900">{item.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{item.shipmentRef}</p>
                    <dl className="mt-2.5 space-y-1 border-t border-white/70 pt-2.5 text-[12px]">
                      <div className="flex gap-2">
                        <dt className="w-[74px] shrink-0 text-muted">Field</dt>
                        <dd className="font-semibold text-ink">{item.field}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-[74px] shrink-0 text-muted">SI</dt>
                        <dd className="font-semibold text-ink">{item.siValue}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-[74px] shrink-0 text-muted">{critical ? 'Invoice' : 'BL'}</dt>
                        <dd className="font-semibold text-ink">{item.blValue}</dd>
                      </div>
                      {item.confidence !== undefined &&
                      <div className="flex gap-2">
                          <dt className="w-[74px] shrink-0 text-muted">Confidence</dt>
                          <dd className="font-semibold text-danger">{item.confidence}%</dd>
                        </div>
                      }
                    </dl>
                  </div>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 self-center text-slate-400" />
                </button>
              </li>);

          })}
        </ul>
        )}

        <p className="mt-5 text-center text-[11.5px] text-muted">
          Items clear automatically once confidence exceeds 85%.
        </p>
      </div>
    </div>);

}