export interface AccuracyPoint {
  label: string;
  value: number;
}

export const accuracySeries: Record<string, AccuracyPoint[]> = {
  '7D': [
  { label: 'Apr 21', value: 92 },
  { label: 'Apr 22', value: 93 },
  { label: 'Apr 23', value: 91 },
  { label: 'Apr 24', value: 94 },
  { label: 'Apr 25', value: 95 },
  { label: 'Apr 26', value: 96 },
  { label: 'Apr 27', value: 96 }],

  '30D': [
  { label: 'Mar 29', value: 88 },
  { label: 'Apr 3', value: 90 },
  { label: 'Apr 8', value: 89 },
  { label: 'Apr 13', value: 92 },
  { label: 'Apr 18', value: 93 },
  { label: 'Apr 23', value: 94 },
  { label: 'Apr 27', value: 96 }],

  '90D': [
  { label: 'Feb 1', value: 81 },
  { label: 'Feb 18', value: 84 },
  { label: 'Mar 6', value: 86 },
  { label: 'Mar 20', value: 89 },
  { label: 'Apr 4', value: 91 },
  { label: 'Apr 16', value: 94 },
  { label: 'Apr 27', value: 96 }]

};

export const accuracyDelta: Record<string, string> = {
  '7D': '4%',
  '30D': '8%',
  '90D': '15%'
};

export const issueBreakdown = [
{ label: 'Mismatch', count: 1, share: 10, color: '#e11d48' },
{ label: 'Review', count: 1, share: 10, color: '#f59e0b' },
{ label: 'Low confidence', count: 0, share: 0, color: '#1f5490' },
{ label: 'Other', count: 8, share: 80, color: '#cbd5e1' }];


export const throughput = [
{ label: 'Emails processed', value: '148', delta: '+12% vs last week' },
{ label: 'Documents checked', value: '96', delta: '+18% vs last week' },
{ label: 'Avg. check time', value: '41s', delta: '−9s vs last week' }];