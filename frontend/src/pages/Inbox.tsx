import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, SearchIcon } from 'lucide-react';
import { fetchEmails, getInboxFilters } from '../api/emails';
import { StatusPill } from '../components/StatusPill';
import { EmailItem } from '../types';

export function Inbox() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmails = async () => {
      try {
        setLoading(true);
        setError(null);
        setEmails(await fetchEmails());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load emails');
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
  }, []);

  const visible = emails.filter((email) => {
    const matchesFilter = filter === 'all' || email.status === filter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      email.subject.toLowerCase().includes(q) ||
      email.sender.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
  const inboxFilters = getInboxFilters(emails);

  const open = (id: string) => {
    navigate(`/email/${id}`);
  };

  
  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <div className="sticky top-0 z-10 bg-canvas/95 px-5 pb-3 pt-2 backdrop-blur">
        <h1 className="text-[24px] font-bold tracking-tight text-navy-900">
          Inbox
        </h1>
        <div className="relative mt-3">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search emails or shipments..."
            aria-label="Search emails or shipments"
            className="w-full rounded-xl border border-hair bg-white py-2.5 pl-9 pr-3 text-[13px] text-ink placeholder:text-slate-400 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 screen-scroll">
          {inboxFilters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-150 ${
                  active
                    ? 'bg-navy-900 text-white'
                    : 'border border-hair bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.label} ({f.count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="rounded-2xl border border-hair bg-white px-5 py-12 text-center">
            <p className="text-[14px] font-semibold text-navy-900">
              Loading emails...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger/20 bg-danger-soft px-5 py-12 text-center">
            <p className="text-[14px] font-semibold text-danger">
              Could not load emails
            </p>
            <p className="mt-1 text-[12.5px] text-muted">{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <p className="text-[14px] font-semibold text-navy-900">
              No matching messages
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
            {visible.map((item, index) => (
              <li
                key={item.id}
                className={index > 0 ? 'border-t border-hair' : ''}
              >
                <button
                  type="button"
                  onClick={() => open(item.id)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 text-[14px] font-semibold leading-5 text-ink">
                        {item.subject}
                      </span>
                      <StatusPill
                        status={item.status}
                        label={item.statusLabel}
                      />
                    </span>
                    <span className="mt-1.5 block text-[11.5px] text-muted">
                      {item.sender} · {item.receivedAgo}
                    </span>
                  </span>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}