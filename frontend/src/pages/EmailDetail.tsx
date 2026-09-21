import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileTextIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  BackendEmail,
  fetchEmailDetail,
  fetchEmailProcessing,
  ProcessedEmail,
} from '../api/emails';

export function EmailDetail() {
  const { id } = useParams();
  const [email, setEmail] = useState<BackendEmail | null>(null);
  const [processed, setProcessed] = useState<ProcessedEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Email ID is missing');
      setLoading(false);
      return;
    }

    Promise.all([fetchEmailDetail(id), fetchEmailProcessing(id)])
      .then(([emailData, processedData]) => {
        setEmail(emailData);
        setProcessed(processedData);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : 'Unable to load email details'
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-5 text-sm text-muted">Loading email...</div>;
  }

  if (error || !email || !processed) {
    return (
      <div className="p-5 text-sm text-danger">
        {error ?? 'Email details are unavailable'}
      </div>
    );
  }

  const { classification, verification } = processed;
  const statusLabel =
    verification.status === 'no_mismatch'
      ? 'No mismatch'
      : verification.status === 'mismatch'
        ? 'Mismatch'
        : 'Needs review';
  const statusClass =
    verification.status === 'no_mismatch'
      ? 'bg-good-soft text-good'
      : verification.status === 'mismatch'
        ? 'bg-danger-soft text-danger'
        : 'bg-warn-soft text-warn';

  const isMismatch = verification.status === 'mismatch';

  return (
    <div className="screen-scroll h-full bg-canvas pb-[86px]">
      <ScreenHeader
        title={isMismatch ? 'Document comparison' : 'Email details'}
        subtitle={isMismatch ? 'Verification result' : undefined}
        backTo="/inbox"
        trailing={
          <span className={`max-w-[42%] truncate rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${statusClass}`}>
            {statusLabel}
          </span>
        }
      />

      <div className="px-5 pt-4">
        <div className="rounded-2xl border border-hair bg-white p-4 shadow-card">
          <p className="break-words text-[16px] font-bold text-navy-900">
            {email.subject}
          </p>

          <p className="mt-1 text-[12px] text-muted">
            From: {email.from}
          </p>

          <p className="mt-4 whitespace-pre-wrap break-words text-[13px] leading-5 text-ink">
            {email.body}
          </p>

          {isMismatch && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3">
              <TriangleAlertIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-danger" />
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-danger">
                  {verification.defect_fields.length} field mismatch{verification.defect_fields.length === 1 ? '' : 'es'} detected
                </p>
                <p className="mt-0.5 break-words text-[12px] leading-4 text-slate-600">
                  The SI and BL values differ after normalization.
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-hair pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-semibold text-muted">
                Processing result
              </p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] text-ink">
              Classified as <strong>{classification.category}</strong>
              {classification.reason ? `: ${classification.reason}` : ''}
            </p>
            <p className="mt-1 text-[11.5px] text-muted">
              Confidence: {Math.round(classification.confidence * 100)}%
            </p>
            {verification.review_reason && (
              <p className="mt-2 text-[12.5px] text-warn">
                Review reason: {verification.review_reason.replace(/_/g, ' ')}
              </p>
            )}
          </div>

          {verification.field_comparisons.length > 0 && (
            <div className="mt-5 border-t border-hair pt-4">
              <div className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 shrink-0 text-navy-700" />
                <p className="text-[12px] font-semibold text-muted">
                  {isMismatch ? 'Compared fields' : 'Document comparison'}
                </p>
              </div>
              <dl className="mt-2 divide-y divide-hair">
                {verification.field_comparisons.map((comparison) => (
                  <div key={comparison.field} className="grid min-w-0 grid-cols-1 gap-2 py-3 text-[12px] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3">
                    <dt className="min-w-0 break-words font-semibold text-ink">
                      {comparison.field}
                    </dt>
                    <dd className={comparison.matches ? 'min-w-0 break-words text-muted' : 'min-w-0 break-words font-semibold text-danger'}>
                      <span className="font-medium text-muted sm:hidden">SI: </span>
                      {comparison.si_value ?? 'Missing'}
                    </dd>
                    <dd className={comparison.matches ? 'min-w-0 break-words text-muted' : 'min-w-0 break-words font-semibold text-danger'}>
                      <span className="font-medium text-muted sm:hidden">BL: </span>
                      {comparison.bl_value ?? 'Missing'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {isMismatch && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3.5">
              <OctagonAlertIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-danger" />
              <div className="min-w-0">
                <p className="break-words text-[13px] font-bold text-danger">
                  Action required
                </p>
                <p className="mt-0.5 break-words text-[12px] leading-4 text-slate-600">
                  Review the highlighted fields before confirming the document set.
                </p>
              </div>
            </div>
          )}

          {email.attachments.length > 0 && (
            <div className="mt-5 border-t border-hair pt-4">
              <p className="text-[12px] font-semibold text-muted">
                Attachments
              </p>

              <ul className="mt-2 space-y-2">
                {email.attachments.map((attachment) => (
                  <li key={attachment} className="text-[12.5px] text-navy-700">
                    {attachment}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}