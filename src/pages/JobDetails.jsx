import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { jobsApi } from '../api/services'
import Icon from '../components/Icon'
import { ErrorBox, Loading, SuccessBox } from '../components/Status'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import {
  daysLeft,
  formatDate,
  formatExperience,
  formatSalary,
  initials,
  JOB_TYPES,
  timeAgo,
  WORK_MODES,
} from '../utils/format'
import { useApi } from '../utils/useApi'

export default function JobDetails() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const job = useApi(() => jobsApi.get(id), [id, user?.id])
  const [coverLetter, setCoverLetter] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  if (job.loading) return <Loading text="Loading job…" />
  if (job.error) {
    return (
      <div className="container page">
        <ErrorBox message={job.error} onRetry={job.reload} />
        <Link to="/jobs" className="link">
          ← Back to jobs
        </Link>
      </div>
    )
  }

  const j = job.data
  const left = daysLeft(j.deadline)
  const applied = j.myApplicationStatus && j.myApplicationStatus !== 'WITHDRAWN'

  const onApply = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await jobsApi.apply(j.id, coverLetter)
      setDone('Application sent! You can follow its progress under My applications.')
      job.setData((d) => ({ ...d, myApplicationStatus: 'APPLIED' }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container page">
      <Link to="/jobs" className="link back">
        ← Back to jobs
      </Link>

      <div className="detail-layout">
        <article className="card detail-main">
          <div className="detail-head">
            <span className="company-logo lg" aria-hidden="true">
              {initials(j.companyName)}
            </span>
            <div>
              <h1>{j.title}</h1>
              <p className="muted">
                {j.companyName} · {j.location} · posted {timeAgo(j.postedAt)}
              </p>
            </div>
          </div>

          <div className="facts">
            <div>
              <Icon name="briefcase" />
              <span>Job type</span>
              <strong>{JOB_TYPES[j.jobType]}</strong>
            </div>
            <div>
              <Icon name="home" />
              <span>Work mode</span>
              <strong>{WORK_MODES[j.workMode]}</strong>
            </div>
            <div>
              <Icon name="money" />
              <span>Salary</span>
              <strong>{formatSalary(j.salaryMin, j.salaryMax)}</strong>
            </div>
            <div>
              <Icon name="cap" />
              <span>Experience</span>
              <strong>{formatExperience(j.minExperience)}</strong>
            </div>
            <div>
              <Icon name="users" />
              <span>Openings</span>
              <strong>{j.openings ?? 1}</strong>
            </div>
            <div>
              <Icon name="calendar" />
              <span>Apply by</span>
              <strong>{formatDate(j.deadline)}</strong>
            </div>
          </div>

          <h2>About the role</h2>
          <p className="prewrap">{j.description}</p>

          {j.skills.length > 0 && (
            <>
              <h2>Skills required</h2>
              <div className="chips">
                {j.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          <h2>About {j.companyName}</h2>
          <p className="muted">
            {[j.companyIndustry, j.companyLocation].filter(Boolean).join(' · ')}
            {j.companyWebsite && (
              <>
                {' · '}
                <a href={j.companyWebsite} target="_blank" rel="noreferrer">
                  {j.companyWebsite.replace(/^https?:\/\//, '')}
                </a>
              </>
            )}
          </p>
          {j.companyDescription && <p>{j.companyDescription}</p>}
        </article>

        <aside className="card detail-side">
          {!j.acceptingApplications ? (
            <>
              <h3>Applications closed</h3>
              <p className="muted">This job is no longer accepting applications.</p>
              {j.myApplicationStatus && (
                <p>
                  Your status: <StatusBadge status={j.myApplicationStatus} />
                </p>
              )}
            </>
          ) : !user ? (
            <>
              <h3>Interested?</h3>
              <p className="muted">Log in as a job seeker to apply for this job.</p>
              <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary btn-block">
                Log in to apply
              </Link>
              <Link to="/register?role=JOB_SEEKER" className="btn btn-ghost btn-block">
                Create an account
              </Link>
            </>
          ) : user.role !== 'JOB_SEEKER' ? (
            <>
              <h3>Job seekers only</h3>
              <p className="muted">You are logged in as {user.role === 'EMPLOYER' ? 'an employer' : 'an admin'}.</p>
            </>
          ) : applied ? (
            <>
              <h3>You applied for this job</h3>
              <p>
                Current status: <StatusBadge status={j.myApplicationStatus} />
              </p>
              <SuccessBox message={done} />
              <Link to="/seeker" className="btn btn-outline btn-block">
                Track my applications
              </Link>
            </>
          ) : (
            <form onSubmit={onApply}>
              <h3>Apply for this job</h3>
              {left !== null && (
                <p className="muted small">
                  <Icon name="clock" /> {left === 0 ? 'Last day to apply' : `${left} days left to apply`}
                </p>
              )}
              <label className="field">
                <span>Cover letter (optional)</span>
                <textarea
                  rows={7}
                  maxLength={3000}
                  placeholder="Tell the employer why you are a good fit…"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </label>
              <p className="muted small">
                Your profile and resume link are shared with the employer.{' '}
                <Link to="/seeker/profile" className="link">
                  Check profile
                </Link>
              </p>
              <ErrorBox message={error} />
              <button className="btn btn-primary btn-block" disabled={sending}>
                {sending ? 'Sending…' : 'Submit application'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}
