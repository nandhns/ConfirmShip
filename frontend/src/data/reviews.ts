import { ReviewItem } from '../types';

export const reviews: ReviewItem[] = [
{
  id: 'rv-1',
  reason: 'review-required',
  reasonLabel: 'Review required',
  receivedAgo: '7 min ago',
  title: 'Check attached shipping docs',
  shipmentRef: 'Shipment 4821',
  field: 'Notify party',
  siValue: 'Global Logistics Ltd',
  blValue: 'Unable to reliably extract',
  aiReason: 'The relevant BL area is unreadable or ambiguous — the scan is skewed across the notify party block.',
  excerptNote: 'Bill of Lading, page 1 — notify party block'
},
{
  id: 'rv-2',
  reason: 'low-confidence',
  reasonLabel: 'Low confidence',
  receivedAgo: '12 min ago',
  title: 'Verify invoice details',
  shipmentRef: 'Shipment 3902',
  field: 'Invoice amount',
  siValue: 'USD 48,320.00',
  blValue: 'USD 48,820.00',
  confidence: 72,
  aiReason: 'Two digits in the invoice total are partially obscured by a stamp, so extraction fell below the 85% threshold.',
  excerptNote: 'Commercial invoice #39281 — totals section'
}];


export const getReview = (id?: string): ReviewItem =>
reviews.find((r) => r.id === id) ?? reviews[0];