import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3Icon,
  BellIcon,
  HelpCircleIcon,
  HomeIcon,
  InboxIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  ShieldCheckIcon,
  XIcon } from
'lucide-react';
const items = [
{ to: '/home', label: 'Home', Icon: HomeIcon },
{ to: '/inbox', label: 'Inbox', Icon: InboxIcon },
{ to: '/review', label: 'Review', Icon: ShieldCheckIcon, badge: '99+' },
{ to: '/analytics', label: 'Reports', Icon: BarChart3Icon }];


const moreLinks = [
{ to: '/settings', label: 'Settings', description: 'Account, preferences, AI model', Icon: SettingsIcon },
{ to: '/analytics', label: 'Notifications', description: 'Alert rules and digests', Icon: BellIcon },
{ to: '/settings', label: 'Help & support', description: 'Docs, policies, contact ops', Icon: HelpCircleIcon }];


export function BottomNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <AnimatePresence>
        {open &&
        <>
            <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-20 bg-navy-950/40" />
          
            <motion.div
            role="dialog"
            aria-label="More"
            initial={{ y: 260, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 260, opacity: 0.6 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-white pb-[74px] pt-3 shadow-[0_-12px_40px_-20px_rgba(8,28,54,0.45)]">
            
              <div className="mx-auto h-1 w-10 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between px-5 pb-1 pt-3">
                <h2 className="text-[15px] font-bold text-navy-900">More</h2>
                <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-muted transition-colors duration-150 hover:bg-slate-100">
                
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <ul className="px-3 pb-2">
                {moreLinks.map((link) =>
              <li key={link.label}>
                    <button
                  type="button"
                  onClick={() => go(link.to)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-150 hover:bg-slate-50">
                  
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-navy-800">
                        <link.Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold text-ink">{link.label}</span>
                        <span className="block text-[11.5px] text-muted">{link.description}</span>
                      </span>
                    </button>
                  </li>
              )}
              </ul>
              <div className="px-5 pt-1">
                <button
                type="button"
                onClick={() => go('/')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-danger-soft py-2.5 text-[13.5px] font-semibold text-danger transition-colors duration-150 hover:bg-danger/10">
                
                  <LogOutIcon className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      <nav
        aria-label="Primary"
        className="absolute inset-x-0 bottom-0 z-40 flex h-[74px] items-start justify-around border-t border-hair bg-white/95 px-1 pt-2.5 backdrop-blur">
        
        {items.map(({ to, label, Icon, badge }) =>
        <NavLink
          key={label}
          to={to}
          className="group relative flex w-[19%] flex-col items-center gap-1 rounded-xl py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-600">
          
            {({ isActive }) =>
          <>
                <span className="relative">
                  <Icon
                className={`h-[21px] w-[21px] transition-colors duration-150 ${
                isActive ? 'text-navy-900' : 'text-slate-400'}`
                }
                strokeWidth={isActive ? 2.4 : 1.9} />
              
                  {badge ?
              <span className="absolute -right-2.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                      {badge}
                    </span> :
              null}
                </span>
                <span
              className={`text-[10.5px] font-semibold transition-colors duration-150 ${
              isActive ? 'text-navy-900' : 'text-slate-400'}`
              }>
              
                  {label}
                </span>
              </>
          }
          </NavLink>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-[19%] flex-col items-center gap-1 rounded-xl py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-600">
          
          <MoreHorizontalIcon
            className={`h-[21px] w-[21px] transition-colors duration-150 ${
            open ? 'text-navy-900' : 'text-slate-400'}`
            }
            strokeWidth={open ? 2.4 : 1.9} />
          
          <span
            className={`text-[10.5px] font-semibold transition-colors duration-150 ${
            open ? 'text-navy-900' : 'text-slate-400'}`
            }>
            
            More
          </span>
        </button>
      </nav>
    </>);

}