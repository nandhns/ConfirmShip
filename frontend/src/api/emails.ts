import { EmailItem } from '../types';

export interface BackendEmail {
  email_id: string;
  from: string;
  subject: string;
  body: string;
  attachments: string[];
}

function toEmailItem(email: BackendEmail): EmailItem {
  return {
    id: email.email_id,
    subject: email.subject,
    sender: email.from,
    receivedAgo: 'Just now',
    status: 'general',
    statusLabel: 'Unprocessed',
  };
}

export async function fetchEmails(): Promise<EmailItem[]> {
  const response = await fetch('/api/emails');

  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.status}`);
  }

  const data: BackendEmail[] = await response.json();
  return data.map(toEmailItem);
}