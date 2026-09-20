import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BellIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  FileTextIcon,
  MailIcon,
  TriangleAlertIcon } from
'lucide-react';
import { LogoLockup } from '../components/Logo';
import { StatusPill } from '../components/StatusPill';
import { emails } from '../data/emails';

const metrics = [
{ label: 'Emails processed', value: '10', delta: '20%', up: true },
{ label: 'Document checks', value: '3', delta: '50%', up: true },
{ label: 'Mismatches', value: '1', delta: '1', up: true, bad: true },
{ label: 'Human review', value: '1', delta: '0', up: false }];


const activityIcon = {
  'no-mismatch': { Icon: CheckCircle2Icon, wrap: 'bg-good-soft text-good' },
  mismatch: { Icon: TriangleAlertIcon, wrap: 'bg-danger-soft text-danger' },
  review: { Icon: FileTextIcon, wrap: 'bg-warn-soft text-warn' },
  invoice: { Icon: FileTextIcon, wrap: 'bg-slate-100 text-slate-500' },
  general: { Icon: MailIcon, wrap: 'bg-slate-100 text-slate-500' }
} as const;

export function Home() {
  const navigate = useNavigate();
  const recent = emails.slice(0, 3);

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <div className="flex items-center justify-between px-5 pb-3 pt-2">
        <LogoLockup />
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-1.5 text-navy-800 transition-colors duration-150 hover:bg-white">
            
            <BellIcon className="h-[19px] w-[19px]" />
            <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-danger ring-2 ring-canvas" />
          </button>
          <Link
            to="/settings"
            aria-label="Account settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-[12px] font-bold text-white">
            
            JD
          </Link>
        </div>
      </div>

      <div className="px-5">
        <h1 className="text-[22px] font-bold tracking-tight text-navy-900">Good morning, Wazif 👋</h1>
        <p className="mt-1 text-[13px] text-muted">Here's what's happening with your shipments today.</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {metrics.map((m) =>
          <div key={m.label} className="rounded-2xl border border-hair bg-white p-3.5 shadow-card">
              <p className="text-[12px] font-medium leading-4 text-muted">{m.label}</p>
              <p className="mt-2 text-[26px] font-bold leading-none tracking-tight text-navy-900">
                {m.value}
              </p>
              <p
              className={`mt-2 flex items-center gap-1 text-[11.5px] font-semibold ${
              m.bad ? 'text-danger' : m.up ? 'text-good' : 'text-muted'}`
              }>
              
                {m.up ?
              <ArrowUpRightIcon className="h-3.5 w-3.5" /> :

              <ArrowDownRightIcon className="h-3.5 w-3.5" />
              }
                {m.delta}
              </p>
            </div>
          )}
        </div>

        <Link
          to="/analytics"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-hair bg-white px-4 py-3 shadow-card transition-colors duration-150 hover:border-slate-300">
          
          <span className="h-2 w-2 shrink-0 rounded-full bg-good" />
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-good">AI system operational</span>
            <span className="block text-[11.5px] text-muted">All checks running on model v1.2.0</span>
          </span>
          <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
        </Link>

        <div className="mb-2 mt-6 flex items-baseline justify-between">
          <h2 className="text-[16px] font-bold tracking-tight text-navy-900">Recent activity</h2>
          <Link to="/inbox" className="text-[12.5px] font-semibold text-navy-600 hover:underline">
            View all
          </Link>
        </div>

        <ul className="overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
          {recent.map((item, i) => {
            const { Icon, wrap } = activityIcon[item.status];
            return (
              <li key={item.id} className={i > 0 ? 'border-t border-hair' : ''}>
                <button
                  type="button"
                  onClick={() =>
                  item.reviewId ?
                  navigate(`/review/${item.reviewId}`) :
                  navigate(`/shipment/${item.shipmentId ?? '4821'}`)
                  }
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-50">
                  
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${wrap}`}>
                    <Icon className="h-[15px] w-[15px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-ink">{item.subject}</span>
                    <span className="mt-1 block text-[11.5px] text-muted">
                      {item.sender} · {item.receivedAgo}
                    </span>
                  </span>
                  <StatusPill status={item.status} label={item.statusLabel} />
                </button>
              </li>);

          })}
        </ul>
      </div>
    </div>);

}