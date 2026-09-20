import { Shipment } from '../types';

export const shipments: Shipment[] = [
{
  id: '4821',
  reference: 'MSCU 774 2310',
  vessel: 'MSC Anastasia',
  voyage: 'Voy. 214W',
  route: 'Port Klang → Singapore',
  etaLabel: 'ETA 24 Apr, 07:30',
  headline: '1 field mismatch detected',
  detail: 'Container count does not match between SI and BL.',
  fields: [
  { label: 'Shipper', si: 'ABC Manufacturing Sdn Bhd', bl: 'ABC Manufacturing Sdn Bhd' },
  { label: 'Consignee', si: 'XYZ Trading Pte Ltd', bl: 'XYZ Trading Pte Ltd' },
  { label: 'Notify party', si: 'DEF Logistics', bl: 'DEF Logistics' },
  { label: 'Port of loading', si: 'Port Klang (MYPKG)', bl: 'Port Klang (MYPKG)' },
  { label: 'Port of discharge', si: 'Singapore (SGSIN)', bl: 'Singapore (SGSIN)' },
  { label: 'Container count', si: '3', bl: '4', mismatch: true },
  { label: 'Gross weight', si: '22,000 kg', bl: '22,000 kg' },
  { label: 'Freight terms', si: 'Freight prepaid', bl: 'Freight prepaid' }],

  summaryTitle: 'Container count mismatch',
  summaryLines: [
  'SI = 3 · BL = 4',
  'Other six required fields match after normalization.']

},
{
  id: '3902',
  reference: 'HLCU 118 9042',
  vessel: 'Hapag Hamburg Bay',
  voyage: 'Voy. 087E',
  route: 'Tanjung Pelepas → Rotterdam',
  etaLabel: 'ETA 09 May, 14:10',
  headline: 'No field mismatches detected',
  detail: 'All eight required fields match after normalization.',
  fields: [
  { label: 'Shipper', si: 'Orion Chemicals Bhd', bl: 'Orion Chemicals Bhd' },
  { label: 'Consignee', si: 'Rotterdam Bulk BV', bl: 'Rotterdam Bulk BV' },
  { label: 'Notify party', si: 'Global Logistics Ltd', bl: 'Global Logistics Ltd' },
  { label: 'Port of loading', si: 'Tanjung Pelepas (MYTPP)', bl: 'Tanjung Pelepas (MYTPP)' },
  { label: 'Port of discharge', si: 'Rotterdam (NLRTM)', bl: 'Rotterdam (NLRTM)' },
  { label: 'Container count', si: '12', bl: '12' },
  { label: 'Gross weight', si: '184,400 kg', bl: '184,400 kg' },
  { label: 'Freight terms', si: 'Freight collect', bl: 'Freight collect' }],

  summaryTitle: 'Verification passed',
  summaryLines: [
  'Invoice amount still pending manual confirmation.',
  'Document set released to booking desk.']

}];


export const getShipment = (id?: string): Shipment =>
shipments.find((s) => s.id === id) ?? shipments[0];