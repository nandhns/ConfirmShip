import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  ChevronRightIcon,
  CpuIcon,
  GlobeIcon,
  InfoIcon,
  MoonIcon,
  ShieldIcon } from
'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';

export function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader title="Settings" backTo="/home" />

      <div className="px-5 pt-4">
        <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Account</h2>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-hair bg-white px-4 py-3.5 text-left shadow-card transition-colors duration-150 hover:bg-slate-50">
          
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-800 text-[14px] font-bold text-white">
            JD
          </span>
          <span className="min-w-0">
            <span className="block text-[14.5px] font-bold text-navy-900">Jordan Doe</span>
            <span className="block text-[12px] text-muted">Operations Manager · Seafreight Ops</span>
          </span>
          <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
        </button>

        <h2 className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-muted">
          App preferences
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-slate-50">
              
              <BellIcon className="h-[18px] w-[18px] shrink-0 text-navy-800" />
              <span className="text-[13.5px] font-semibold text-ink">Notifications</span>
              <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted">
                Mismatches only
                <ChevronRightIcon className="h-4 w-4 text-slate-300" />
              </span>
            </button>
          </li>
          <li className="flex items-center gap-3 border-t border-hair px-4 py-3.5">
            <MoonIcon className="h-[18px] w-[18px] shrink-0 text-navy-800" />
            <span className="text-[13.5px] font-semibold text-ink">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              aria-label="Dark mode"
              onClick={() => setDarkMode((v) => !v)}
              className={`ml-auto flex h-6 w-11 items-center rounded-full px-0.5 transition-colors duration-150 ${
              darkMode ? 'bg-navy-900' : 'bg-slate-200'}`
              }>
              
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-out ${
                darkMode ? 'translate-x-5' : 'translate-x-0'}`
                } />
              
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 border-t border-hair px-4 py-3.5 text-left transition-colors duration-150 hover:bg-slate-50">
              
              <GlobeIcon className="h-[18px] w-[18px] shrink-0 text-navy-800" />
              <span className="text-[13.5px] font-semibold text-ink">Language</span>
              <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted">
                English
                <ChevronRightIcon className="h-4 w-4 text-slate-300" />
              </span>
            </button>
          </li>
        </ul>

        <h2 className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-muted">AI & system</h2>
        <ul className="overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
          {[
          { Icon: CpuIcon, label: 'Model version', value: 'v1.2.0' },
          { Icon: ShieldIcon, label: 'Data privacy', value: 'View policy' },
          { Icon: InfoIcon, label: 'About ShipSure AI', value: 'Learn more' }].
          map((row, i) =>
          <li key={row.label}>
              <button
              type="button"
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-slate-50 ${
              i > 0 ? 'border-t border-hair' : ''}`
              }>
              
                <row.Icon className="h-[18px] w-[18px] shrink-0 text-navy-800" />
                <span className="text-[13.5px] font-semibold text-ink">{row.label}</span>
                <span className="ml-auto text-[12px] text-muted">{row.value}</span>
              </button>
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-2 mt-5 w-full rounded-2xl bg-danger-soft py-3.5 text-[14px] font-bold text-danger transition-colors duration-150 hover:bg-danger/10">
          
          Log out
        </button>
      </div>
    </div>);

}