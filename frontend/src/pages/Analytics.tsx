import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRightIcon, SparklesIcon } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { AccuracyChart } from '../components/AccuracyChart';
import { accuracySeries } from '../data/analytics';
import { fetchEmails } from '../api/emails';
import { EmailItem } from '../types';

const ranges = ['7D', '30D', '90D'];
const R = 34;
const C = 2 * Math.PI * R;

export function Analytics() {
  const [range, setRange] = useState('7D');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails()
      .then(setEmails)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const mismatch = emails.filter((email) => email.status === 'mismatch').length;
    const review = emails.filter((email) => email.status === 'review').length;
    const noMismatch = emails.filter((email) => email.status === 'no-mismatch').length;
    const documentChecks = noMismatch + mismatch + review;
    const resolvedChecks = noMismatch + mismatch;
    const accuracy = resolvedChecks === 0 ? 0 : Math.round(noMismatch / resolvedChecks * 100);
    const totalIssues = mismatch + review;

    return {
      mismatch,
      review,
      noMismatch,
      documentChecks,
      accuracy,
      totalIssues,
      issueBreakdown: [
        { label: 'Mismatch', count: mismatch, color: '#e11d48' },
        { label: 'Review', count: review, color: '#f59e0b' },
        { label: 'Low confidence', count: 0, color: '#1f5490' },
        { label: 'Other', count: Math.max(emails.length - totalIssues, 0), color: '#cbd5e1' },
      ].map((issue) => ({
        ...issue,
        share: emails.length === 0 ? 0 : Math.round(issue.count / emails.length * 100),
      })),
    };
  }, [emails]);

  const data = accuracySeries[range].map((point) => ({
    ...point,
    value: stats.accuracy,
  }));
  const total = stats.totalIssues;
  const issueBreakdown = stats.issueBreakdown;
  const throughput = [
    { label: 'Emails processed', value: loading ? '...' : String(emails.length), delta: 'Current inbox' },
    { label: 'Documents checked', value: loading ? '...' : String(stats.documentChecks), delta: 'Current inbox' },
    { label: 'Avg. check time', value: 'N/A', delta: 'Not tracked' },
  ];

  let offset = 0;

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader title="Analytics" backTo="/home" />

      <div className="px-5 pt-3">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-200/60 p-1">
          {ranges.map((r) =>
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`rounded-lg py-1.5 text-[12.5px] font-semibold transition-colors duration-150 ${
            range === r ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-900'}`
            }>
            
              {r}
            </button>
          )}
        </div>

        <section className="mt-3 rounded-2xl border border-hair bg-white p-4 shadow-card">
          <h2 className="text-[13.5px] font-semibold text-muted">Verification accuracy</h2>
          <p className="mt-1 text-[36px] font-bold leading-none tracking-tight text-navy-900">
            {data[data.length - 1].value}%
          </p>
          <p className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-good">
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
            {loading ? '...' : 'Live'}
            <span className="font-medium text-muted">current processed emails</span>
          </p>
          <div className="mt-3">
            <AccuracyChart data={data} />
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-hair bg-white p-4 shadow-card">
          <h2 className="text-[13.5px] font-bold text-navy-900">Issue breakdown</h2>
          <div className="mt-3 flex items-center gap-5">
            <div className="relative h-[92px] w-[92px] shrink-0">
              <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
                {issueBreakdown.map((slice) => {
                  const len = slice.share / 100 * C;
                  const dash = `${len} ${C - len}`;
                  const el =
                  <circle
                    key={slice.label}
                    cx="46"
                    cy="46"
                    r={R}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="11"
                    strokeDasharray={dash}
                    strokeDashoffset={-offset} />;


                  offset += len;
                  return el;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[20px] font-bold leading-none text-navy-900">{total}</span>
                <span className="mt-0.5 text-[9.5px] text-muted">total issues</span>
              </div>
            </div>
            <ul className="flex-1 space-y-2">
              {issueBreakdown.map((slice) =>
              <li key={slice.label} className="flex items-center gap-2 text-[12px]">
                  <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }} />
                
                  <span className="text-slate-600">{slice.label}</span>
                  <span className="ml-auto font-semibold text-ink">
                    {slice.share}% ({slice.count})
                  </span>
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="mt-3 overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
          <h2 className="border-b border-hair px-4 py-3 text-[13.5px] font-bold text-navy-900">
            Throughput
          </h2>
          <ul>
            {throughput.map((row, i) =>
            <li
              key={row.label}
              className={`flex items-baseline gap-3 px-4 py-3 ${i > 0 ? 'border-t border-hair' : ''}`}>
              
                <span className="text-[12.5px] text-slate-600">{row.label}</span>
                <span className="ml-auto text-[15px] font-bold text-navy-900">{row.value}</span>
                <span className="w-[130px] text-right text-[11px] text-muted">{row.delta}</span>
              </li>
            )}
          </ul>
        </section>

        <div className="mt-3 flex gap-3 rounded-2xl border border-navy-600/15 bg-navy-600/5 px-4 py-3.5">
          <SparklesIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-navy-600" />
          <div>
            <p className="text-[13px] font-bold text-navy-900">Insight</p>
            <p className="mt-0.5 text-[12px] leading-4 text-slate-600">
              Container count mismatches are 50% lower than last week, mostly on the Port Klang → Singapore
              lane.
            </p>
          </div>
        </div>
      </div>
    </div>);

}