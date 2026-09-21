import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCwIcon, SaveIcon } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  BackendEmail,
  fetchEmailDetail,
  fetchEmailProcessing,
  fetchReviewRecord,
  ProcessedEmail,
  ReviewRecord,
  retryEmail,
  submitReviewCorrection,
} from '../api/emails';

export function HumanReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState<BackendEmail | null>(null);
  const [processed, setProcessed] = useState<ProcessedEmail | null>(null);
  const [record, setRecord] = useState<ReviewRecord | null>(null);
  const [field, setField] = useState('');
  const [document, setDocument] = useState<'si' | 'bl'>('bl');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchEmailDetail(id), fetchEmailProcessing(id), fetchReviewRecord(id)])
      .then(([emailData, processedData, reviewData]) => {
        setEmail(emailData);
        setProcessed(processedData);
        setRecord(reviewData);
        const first = processedData.verification.field_comparisons[0];
        setField(first?.field ?? '');
        setValue(String(first?.bl_value ?? ''));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load review'));
  }, [id]);

  const selected = processed?.verification.field_comparisons.find((item) => item.field === field);

  async function saveCorrection() {
    if (!id || !field || !value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitReviewCorrection(id, field, document, value.trim());
      setProcessed(result);
      setMessage('Correction saved and report updated.');
      setRecord(await fetchReviewRecord(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save correction');
    } finally {
      setBusy(false);
    }
  }

  async function retryProcessing() {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      setProcessed(await retryEmail(id));
      setMessage('Processing retried successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retry processing');
    } finally {
      setBusy(false);
    }
  }

  if (error && !processed) return <div className="p-5 text-sm text-danger">{error}</div>;
  if (!email || !processed) return <div className="p-5 text-sm text-muted">Loading review...</div>;

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader title="Human review" backTo="/review" />
      <div className="px-5 pt-4">
        <h2 className="text-[20px] font-bold tracking-tight text-navy-900">{email.subject}</h2>
        <p className="mt-1 text-[13px] leading-5 text-muted">{processed.verification.review_details ?? 'Confirm the extracted evidence.'}</p>
        {error && <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}
        {message && <p className="mt-3 rounded-xl bg-good-soft p-3 text-sm text-good">{message}</p>}

        <div className="mt-4 rounded-2xl border border-hair bg-white p-4 shadow-card">
          <label className="block text-[12px] font-semibold text-muted">Field</label>
          <select value={field} onChange={(event) => setField(event.target.value)} className="mt-1 w-full rounded-lg border border-hair p-2 text-sm">
            {processed.verification.field_comparisons.map((item) => <option key={item.field} value={item.field}>{item.field}</option>)}
          </select>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
            <p>SI: <strong className="text-ink">{selected?.si_value ?? 'Missing'}</strong></p>
            <p>BL: <strong className="text-ink">{selected?.bl_value ?? 'Missing'}</strong></p>
          </div>
          <label className="mt-4 block text-[12px] font-semibold text-muted">Correct document</label>
          <select value={document} onChange={(event) => setDocument(event.target.value as 'si' | 'bl')} className="mt-1 w-full rounded-lg border border-hair p-2 text-sm">
            <option value="si">Shipping instruction</option>
            <option value="bl">Bill of lading</option>
          </select>
          <label className="mt-4 block text-[12px] font-semibold text-muted">Correct value</label>
          <input value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-lg border border-hair p-2 text-sm" />
          <button type="button" disabled={busy} onClick={saveCorrection} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-bold text-white disabled:opacity-50">
            <SaveIcon className="h-4 w-4" /> Save correction
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-hair bg-white p-4 shadow-card">
          <p className="text-[12px] font-semibold text-muted">Source evidence</p>
          <ul className="mt-2 space-y-1 text-[12px] text-ink">{(record?.evidence ?? email.attachments).map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="mt-2 text-[11px] text-muted">Processing attempts: {record?.attempts ?? 0}</p>
          {selected?.si_source && <p className="mt-2 break-words text-[11px] text-muted">{selected.si_source}</p>}
          {selected?.bl_source && <p className="mt-1 break-words text-[11px] text-muted">{selected.bl_source}</p>}
        </div>

        {processed.verification.retryable && (
          <button type="button" disabled={busy} onClick={retryProcessing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-warn/30 bg-warn-soft py-3 text-sm font-bold text-warn disabled:opacity-50">
            <RefreshCwIcon className="h-4 w-4" /> Retry processing
          </button>
        )}
        <button type="button" onClick={() => navigate('/review')} className="mt-3 w-full py-3 text-sm font-semibold text-muted">Close</button>
      </div>
    </div>
  );
}
