import { EmailItem, EmailStatus, ReviewItem } from '../types';

export interface BackendEmail {
  email_id: string;
  from: string;
  subject: string;
  body: string;
  attachments: string[];
}

export interface ProcessedEmail {
  email_id: string;
  classification: {
    category: 'BL_COMPARISON' | 'SI_REQUEST' | 'INVOICE_QUERY' | 'GENERAL' | 'SPAM';
    confidence: number;
    reason: string | null;
    is_uncertain: boolean;
    uncertainty_reason: string | null;
  };
  verification: {
    status: 'no_mismatch' | 'mismatch' | 'needs_review';
    has_defect: boolean;
    field_comparisons: FieldComparison[];
    defect_fields: string[];
    review_reason: string | null;
    review_details: string | null;
    retryable: boolean;
  };
}

export interface FieldComparison {
  field: string;
  si_value: string | number | null;
  bl_value: string | number | null;
  si_normalized: string | number | null;
  bl_normalized: string | number | null;
  matches: boolean;
  reason?: string | null;
  si_source?: string | null;
  bl_source?: string | null;
}

export interface ReviewRecord {
  email_id: string;
  status: string;
  reason: string | null;
  details: string | null;
  evidence: string[];
  attempts: number;
  audit_log: ReviewAuditEntry[];
}

export interface ReviewAuditEntry {
  action: 'correction';
  field: string;
  document: 'si' | 'bl';
  old_value: string | null;
  new_value: string;
  reviewer: string;
  comment: string | null;
  timestamp: string;
}

function mapStatus(processed: ProcessedEmail): EmailStatus {
  if (processed.classification.category === 'INVOICE_QUERY') {
    return 'invoice';
  }

  if (processed.verification.status === 'mismatch') {
    return 'mismatch';
  }

  if (processed.verification.status === 'needs_review') {
    return 'review';
  }

  if (processed.classification.category === 'GENERAL') {
    return 'general';
  }

  return 'no-mismatch';
}

function statusLabel(status: EmailStatus): string {
  switch (status) {
    case 'no-mismatch':
      return 'No mismatch';
    case 'mismatch':
      return 'Mismatch';
    case 'review':
      return 'Review';
    case 'invoice':
      return 'Invoice';
    default:
      return 'General';
  }
}

export function getInboxFilters(emails: EmailItem[]) {
  return [
    { id: 'all', label: 'All', count: emails.length },
    {
      id: 'no-mismatch',
      label: 'No issues',
      count: emails.filter((email) => email.status === 'no-mismatch').length,
    },
    {
      id: 'mismatch',
      label: 'Mismatch',
      count: emails.filter((email) => email.status === 'mismatch').length,
    },
    {
      id: 'review',
      label: 'Review',
      count: emails.filter((email) => email.status === 'review').length,
    },
  ] as const;
}

async function fetchProcessedEmails() {
  const [emailResponse, processedResponse] = await Promise.all([
    fetch('/api/emails'),
    fetch('/api/process/processed'),
  ]);

  if (!emailResponse.ok) {
    throw new Error(`Failed to fetch emails: ${emailResponse.status}`);
  }
  if (!processedResponse.ok) {
    throw new Error(`Failed to fetch processed emails: ${processedResponse.status}`);
  }

  const [emails, processedEmails] = await Promise.all([
    emailResponse.json() as Promise<BackendEmail[]>,
    processedResponse.json() as Promise<ProcessedEmail[]>,
  ]);
  const processedById = new Map(processedEmails.map((item) => [item.email_id, item]));

  return emails.flatMap((email) => {
    const processed = processedById.get(email.email_id);
    return processed ? [{ email, processed }] : [];
  });
}

function toEmailItem(
  email: BackendEmail,
  processed: ProcessedEmail
): EmailItem {
  const status = mapStatus(processed);

  return {
    id: email.email_id,
    subject: email.subject,
    sender: email.from,
    receivedAgo: 'Just now',
    status,
    statusLabel: statusLabel(status),
  };
}

export async function fetchEmails(): Promise<EmailItem[]> {
  const processedEmails = await fetchProcessedEmails();

  return processedEmails.map(({ email, processed }) =>
    toEmailItem(email, processed)
  );
}

export async function fetchReviewItems(): Promise<ReviewItem[]> {
  const processedEmails = await fetchProcessedEmails();

  return processedEmails.flatMap(({ email, processed }) => {
    const { classification, verification } = processed;
    if (verification.status !== 'needs_review' && verification.status !== 'mismatch') {
      return [];
    }

    const comparison = verification.field_comparisons[0];
    const lowConfidence = verification.review_reason === 'uncertain_extraction';
    const reason = verification.status === 'mismatch'
      ? 'mismatch'
      : lowConfidence ? 'low-confidence' : 'review-required';
    const field = comparison?.field ?? verification.review_reason ?? 'Document review';

    return [{
      id: email.email_id,
      reason,
      reasonLabel: lowConfidence ? 'Low confidence' : 'Review required',
      receivedAgo: 'Just now',
      title: email.subject,
      shipmentRef: email.email_id,
      field,
      siValue: String(comparison?.si_value ?? 'Missing'),
      blValue: String(comparison?.bl_value ?? 'Missing'),
      confidence: Math.round(classification.confidence * 100),
      aiReason:
        verification.review_details ??
        classification.reason ??
        'The email requires manual review.',
      excerptNote: email.attachments.join(' | ') || 'No attachments',
        retryable: verification.retryable,
    }];
  });
}

export async function fetchEmailDetail(
  emailId: string
): Promise<BackendEmail> {
  const response = await fetch(`/api/emails/${emailId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch email: ${response.status}`);
  }

  return response.json();
}

export async function fetchEmailProcessing(
  emailId: string
): Promise<ProcessedEmail> {
  const response = await fetch(`/api/process/${emailId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to process email: ${response.status}`);
  }

  return response.json();
}

export async function fetchReviewRecord(emailId: string): Promise<ReviewRecord | null> {
  const response = await fetch(`/api/process/reviews/${emailId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch review: ${response.status}`);
  return response.json();
}

export async function submitReviewCorrection(
  emailId: string,
  field: string,
  document: 'si' | 'bl',
  value: string,
  reviewer: string,
  comment?: string,
): Promise<ProcessedEmail> {
  const response = await fetch(`/api/process/reviews/${emailId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, document, value, reviewer, comment }),
  });
  if (!response.ok) throw new Error(`Failed to save correction: ${response.status}`);
  return response.json();
}

export async function retryEmail(emailId: string): Promise<ProcessedEmail> {
  const response = await fetch(`/api/process/${emailId}/retry`, { method: 'POST' });
  if (!response.ok) throw new Error(`Retry failed: ${response.status}`);
  return response.json();
}