import React from 'react';
import { useParams } from 'react-router-dom';
import { FileTextIcon, OctagonAlertIcon, ShipIcon, TriangleAlertIcon } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { getShipment } from '../data/shipments';

export function ShipmentCompare() {
  const { id } = useParams();
  const shipment = getShipment(id);
  const hasMismatch = shipment.fields.some((f) => f.mismatch);

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader
        title={`Shipment ${shipment.id}`}
        subtitle="Document comparison result"
        backTo="/inbox"
        trailing={
        <span
          className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
          hasMismatch ? 'bg-danger text-white' : 'bg-good-soft text-good'}`
          }>
          
            {hasMismatch ? 'Action required' : 'Cleared'}
          </span>
        } />
      

      <div className="px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-hair bg-white px-4 py-3 shadow-card">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
            <ShipIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-ink">
              {shipment.vessel} · {shipment.voyage}
            </p>
            <p className="mt-0.5 truncate text-[11.5px] text-muted">
              {shipment.route} · {shipment.etaLabel}
            </p>
          </div>
        </div>

        <div
          className={`mt-3 flex gap-3 rounded-2xl border px-4 py-3 ${
          hasMismatch ? 'border-danger/20 bg-danger-soft' : 'border-good/20 bg-good-soft'}`
          }>
          
          <TriangleAlertIcon
            className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${hasMismatch ? 'text-danger' : 'text-good'}`} />
          
          <div>
            <p className={`text-[13.5px] font-bold ${hasMismatch ? 'text-danger' : 'text-good'}`}>
              {shipment.headline}
            </p>
            <p className="mt-0.5 text-[12px] leading-4 text-slate-600">{shipment.detail}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {(['si', 'bl'] as const).map((side) =>
          <div key={side} className="overflow-hidden rounded-2xl border border-hair bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-hair px-3 py-2.5">
                <FileTextIcon className="h-4 w-4 shrink-0 text-navy-700" />
                <span className="text-[12px] font-bold leading-4 text-navy-900">
                  {side === 'si' ? 'Shipping Instruction (SI)' : 'Bill of Lading (BL)'}
                </span>
              </div>
              <dl>
                {shipment.fields.map((field) =>
              <div
                key={`${side}-${field.label}`}
                className={`border-b border-hair px-3 py-2.5 last:border-b-0 ${
                field.mismatch ? 'bg-danger-soft' : ''}`
                }>
                
                    <dt
                  className={`text-[10.5px] font-medium ${
                  field.mismatch ? 'text-danger' : 'text-muted'}`
                  }>
                  
                      {field.label}
                    </dt>
                    <dd
                  className={`mt-0.5 text-[12.5px] font-semibold leading-4 ${
                  field.mismatch ? 'text-danger' : 'text-ink'}`
                  }>
                  
                      {side === 'si' ? field.si : field.bl}
                    </dd>
                  </div>
              )}
              </dl>
            </div>
          )}
        </div>

        <div
          className={`mt-4 flex gap-3 rounded-2xl border px-4 py-3.5 ${
          hasMismatch ? 'border-danger/20 bg-danger-soft' : 'border-hair bg-white shadow-card'}`
          }>
          
          <OctagonAlertIcon
            className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${hasMismatch ? 'text-danger' : 'text-good'}`} />
          
          <div>
            <p className={`text-[13px] font-bold ${hasMismatch ? 'text-danger' : 'text-navy-900'}`}>
              {shipment.summaryTitle}
            </p>
            {shipment.summaryLines.map((line) =>
            <p key={line} className="mt-0.5 text-[12px] leading-4 text-slate-600">
                {line}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-2xl bg-navy-900 py-3.5 text-[14.5px] font-bold text-white transition-transform duration-150 ease-out active:scale-[0.99]">
          
          View full report
        </button>
      </div>
    </div>);

}