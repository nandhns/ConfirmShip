import React, { ReactNode } from 'react';
import { SignalHighIcon, WifiIcon, BatteryFullIcon } from 'lucide-react';

interface DeviceFrameProps {
  children: ReactNode;
  dark?: boolean;
}

export function DeviceFrame({ children, dark = false }: DeviceFrameProps) {
  return (
    <div className="flex min-h-full w-full justify-center bg-canvas px-4 py-6 sm:py-10">
      <div className="relative h-[844px] w-[390px] shrink-0 overflow-hidden rounded-[38px] border-[6px] border-navy-950 bg-white shadow-device">
        <div
          className={`flex h-[34px] items-center justify-between px-6 pt-1.5 text-[12px] font-semibold ${
          dark ? 'text-white' : 'text-navy-900'}`
          }>
          
          <span>9:41</span>
          <span className="flex items-center gap-1.5">
            <SignalHighIcon className="h-[15px] w-[15px]" strokeWidth={2.4} />
            <WifiIcon className="h-[15px] w-[15px]" strokeWidth={2.4} />
            <BatteryFullIcon className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-[34px]">{children}</div>
      </div>
    </div>);

}