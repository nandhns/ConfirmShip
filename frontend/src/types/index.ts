export type EmailStatus = 'no-mismatch' | 'mismatch' | 'review' | 'invoice' | 'general';

export interface EmailItem {
  id: string;
  subject: string;
  sender: string;
  receivedAgo: string;
  status: EmailStatus;
  statusLabel: string;
  shipmentId?: string;
  reviewId?: string;
}

export interface CompareField {
  label: string;
  si: string;
  bl: string;
  mismatch?: boolean;
}

export interface Shipment {
  id: string;
  reference: string;
  vessel: string;
  voyage: string;
  route: string;
  etaLabel: string;
  headline: string;
  detail: string;
  fields: CompareField[];
  summaryTitle: string;
  summaryLines: string[];
}

export type ReviewReason = 'review-required' | 'low-confidence';

export interface ReviewItem {
  id: string;
  reason: ReviewReason;
  reasonLabel: string;
  receivedAgo: string;
  title: string;
  shipmentRef: string;
  field: string;
  siValue: string;
  blValue: string;
  confidence?: number;
  aiReason: string;
  excerptNote: string;
  retryable?: boolean;
}