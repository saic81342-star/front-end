const STEPS = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED']
const LABELS = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', HIRED: 'Hired' }

/** Application tracking: Applied → Shortlisted → Interview → Hired. */
export default function ApplicationProgress({ status }) {
  if (status === 'REJECTED' || status === 'WITHDRAWN') {
    return (
      <div className={`progress-ended ${status.toLowerCase()}`}>
        {status === 'REJECTED' ? 'This application was not selected.' : 'You withdrew this application.'}
      </div>
    )
  }
  const current = STEPS.indexOf(status)
  return (
    <ol className="progress" aria-label="Application progress">
      {STEPS.map((step, i) => (
        <li key={step} className={i < current ? 'done' : i === current ? 'current' : ''}>
          <span className="dot" aria-hidden="true" />
          <span className="label">{LABELS[step]}</span>
        </li>
      ))}
    </ol>
  )
}
