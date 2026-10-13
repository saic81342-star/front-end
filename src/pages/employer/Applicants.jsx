import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { employerApi, jobsApi } from '../../api/services'
import { Empty, ErrorBox, Loading } from '../../components/Status'
import StatusBadge from '../../components/StatusBadge'
import { APPLICATION_STATUS, formatDate, formatDateTime } from '../../utils/format'
import { useApi } from '../../utils/useApi'

const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED']

/** Review everyone who applied for one job and move them through the hiring stages. */
export default function Applicants() {
  const { id } = useParams()
  const job = useApi(() => jobsApi.get(id), [id])
  const apps = useApi(() => employerApi.applicants(id), [id])
  const [filter, setFilter] = useState('ALL')

  const list = apps.data || []
  const shown = filter === 'ALL' ? list : list.filter((a) => a.status === filter)

  const replace = (updated) => apps.setData((d) => d.map((a) => (a.id === updated.id ? updated : a)))

  return (
    <div className="container page">
      <Link to="/employer/jobs" className="link back">
        ← My jobs
      </Link>
      <div className="page-head">
        <h1>Applicants{job.data ? ` · ${job.data.title}` : ''}</h1>
        <p className="muted">Sorted by skill match. Update a status and the applicant sees it on their dashboard.</p>
      </div>

      <div className="tabs">
        <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>
          All ({list.length})
        </button>
        {[...STAGES, 'WITHDRAWN'].map((s) => (
          <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
            {APPLICATION_STATUS[s]} ({list.filter((a) => a.status === s).length})
          </button>
        ))}
      </div>

      {apps.loading && <Loading text="Loading applicants…" />}
      <ErrorBox message={apps.error} onRetry={apps.reload} />
      {apps.data && shown.length === 0 && (
        <Empty title={list.length ? 'No applicants in this stage' : 'No applications yet'} />
      )}

      <div className="stack">
        {shown.map((a) => (
          <ApplicantCard key={a.id} app={a} onUpdated={replace} />
        ))}
      </div>
    </div>
  )
}

function ApplicantCard({ app, onUpdated }) {
  const p = app.applicant
  const [status, setStatus] = useState(app.status === 'WITHDRAWN' ? 'APPLIED' : app.status)
  const [note, setNote] = useState(app.employerNote || '')
  const [interviewAt, setInterviewAt] = useState(app.interviewAt ? app.interviewAt.slice(0, 16) : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await employerApi.updateApplication(app.id, {
        status,
        employerNote: note,
        interviewAt: interviewAt ? `${interviewAt}:00` : null,
      })
      onUpdated(updated)
      setOpen(false)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card applicant">
      <div className="applicant-head">
        <div>
          <h3>{p.fullName}</h3>
          <p className="muted">{p.headline || 'No headline yet'}</p>
          <p className="small">
            <a href={`mailto:${p.email}`}>{p.email}</a>
            {p.phone && ` · ${p.phone}`}
            {p.location && ` · ${p.location}`}
          </p>
        </div>
        <div className="applicant-side">
          <span className="match" title="Share of the job's required skills this applicant has">
            {p.matchScore}% skill match
          </span>
          <StatusBadge status={app.status} />
        </div>
      </div>

      <dl className="applicant-facts">
        <div>
          <dt>Experience</dt>
          <dd>{p.experienceYears != null ? `${p.experienceYears} yr${p.experienceYears === 1 ? '' : 's'}` : '—'}</dd>
        </div>
        <div>
          <dt>Education</dt>
          <dd>{p.education || '—'}</dd>
        </div>
        <div>
          <dt>Applied</dt>
          <dd>{formatDate(app.appliedAt)}</dd>
        </div>
        <div>
          <dt>Resume</dt>
          <dd>
            {p.resumeUrl ? (
              <a href={p.resumeUrl} target="_blank" rel="noreferrer">
                Open resume ↗
              </a>
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>

      {p.skills.length > 0 && (
        <div className="chips">
          {p.skills.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      )}

      {app.coverLetter && (
        <blockquote className="note">
          <span>Cover letter</span>
          {app.coverLetter}
        </blockquote>
      )}
      {app.interviewAt && <p className="small">Interview: {formatDateTime(app.interviewAt)}</p>}

      {app.status === 'WITHDRAWN' ? (
        <p className="muted small">The applicant withdrew this application.</p>
      ) : app.status === 'HIRED' || app.status === 'REJECTED' ? (
        <p className="muted small">This application is closed ({APPLICATION_STATUS[app.status].toLowerCase()}).</p>
      ) : !open ? (
        <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
          Update status
        </button>
      ) : (
        <form className="update-form" onSubmit={save}>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS[s]}
                </option>
              ))}
            </select>
          </label>
          {status === 'INTERVIEW' && (
            <label className="field">
              <span>Interview date &amp; time</span>
              <input type="datetime-local" required value={interviewAt} onChange={(e) => setInterviewAt(e.target.value)} />
            </label>
          )}
          <label className="field span-2">
            <span>Message to applicant (optional)</span>
            <textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <ErrorBox message={error} />
          <div className="form-actions span-2">
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  )
}
