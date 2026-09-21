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

async function processEmail(email: BackendEmail): Promise<ProcessedEmail> {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    throw new Error(`Failed to process ${email.email_id}: ${response.status}`);
  }

  return response.json();
}

async function fetchProcessedEmails() {
  const response = await fetch('/api/emails');

  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.status}`);
  }

  const emails: BackendEmail[] = await response.json();
  return Promise.all(
    emails.map(async (email) => ({
      email,
      processed: await processEmail(email),
    }))
  );
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
    if (verification.status !== 'needs_review') {
      return [];
    }

    const comparison = verification.field_comparisons[0];
    const lowConfidence = verification.review_reason === 'uncertain_extraction';
    const reason = lowConfidence ? 'low-confidence' : 'review-required';
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