import { EmailItem } from '../types';

export const emails: EmailItem[] = [
{
  id: 'em-1',
  subject: 'Please verify BL against SI — Shipment 4821',
  sender: 'ops@seafreight.example',
  receivedAgo: '2 min ago',
  status: 'no-mismatch',
  statusLabel: 'No mismatch',
  shipmentId: '4821'
},
{
  id: 'em-2',
  subject: 'Urgent: Draft BL verification required',
  sender: 'shipping@acme.example',
  receivedAgo: '4 min ago',
  status: 'mismatch',
  statusLabel: '1 mismatch',
  shipmentId: '4821'
},
{
  id: 'em-3',
  subject: 'Check attached shipping docs',
  sender: 'logistics@global.example',
  receivedAgo: '7 min ago',
  status: 'review',
  statusLabel: 'Review',
  reviewId: 'rv-1'
},
{
  id: 'em-4',
  subject: 'Invoice #39281 question',
  sender: 'finance@client.example',
  receivedAgo: '9 min ago',
  status: 'invoice',
  statusLabel: 'Invoice',
  reviewId: 'rv-2'
},
{
  id: 'em-5',
  subject: 'Weekly operations update',
  sender: 'management@company.example',
  receivedAgo: '12 min ago',
  status: 'general',
  statusLabel: 'General'
}];


export const inboxFilters = [
{ id: 'all', label: 'All', count: 10 },
{ id: 'no-mismatch', label: 'No issues', count: 7 },
{ id: 'mismatch', label: 'Mismatch', count: 1 },
{ id: 'review', label: 'Review', count: 1 }] as
const;