import { useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { seekerApi } from '../../api/services'
import ApplicationProgress from '../../components/ApplicationProgress'
import Icon from '../../components/Icon'
import { Empty, ErrorBox, Loading } from '../../components/Status'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatDateTime } from '../../utils/format'
import { useApi } from '../../utils/useApi'

const ACTIVE = ['APPLIED', 'SHORTLISTED', 'INTERVIEW']

/** Application tracking for job seekers. */
export default function SeekerDashboard() {
  const { user } = useAuth()
  const apps = useApi(() => seekerApi.applications())
  const profile = useApi(() => seekerApi.profile())
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')

  const list = apps.data || []
  const count = (pred) => list.filter(pred).length
  const shown = list.filter((a) =>
    filter === 'ALL' ? true : filter === 'ACTIVE' ? ACTIVE.includes(a.status) : a.status === filter,
  )

  const withdraw = async (app) => {
    if (!window.confirm(`Withdraw your application for "${app.jobTitle}"?`)) return
    setError('')
    try {
      const updated = await seekerApi.withdraw(app.id)
      apps.setData((d) => d.map((a) => (a.id === updated.id ? updated : a)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="container page">
      <div className="page-head row">
        <div>
          <h1>Hi, {user.fullName.split(' ')[0]}</h1>
          <p className="muted">Track every job you have applied for.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          Find more jobs
        </Link>
      </div>

      {profile.data && profile.data.completeness < 100 && (
        <div className="banner">
          <div>
            <strong>Your profile is {profile.data.completeness}% complete.</strong>
            <span className="muted">
              {' '}
              Employers see your profile when you apply, and your skills drive job recommendations.
            </span>
          </div>
          <Link to="/seeker/profile" className="btn btn-outline btn-sm">
            Complete profile
          </Link>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <span>Total applications</span>
          <strong>{list.length}</strong>
        </div>
        <div className="stat">
          <span>In progress</span>
          <strong>{count((a) => ACTIVE.includes(a.status))}</strong>
        </div>
        <div className="stat">
          <span>Interviews</span>
          <strong>{count((a) => a.status === 'INTERVIEW')}</strong>
        </div>
        <div className="stat">
          <span>Offers</span>
          <strong>{count((a) => a.status === 'HIRED')}</strong>
        </div>
      </div>

      <div className="tabs">
        {[
          ['ALL', 'All'],
          ['ACTIVE', 'In progress'],
          ['INTERVIEW', 'Interviews'],
          ['HIRED', 'Hired'],
          ['REJECTED', 'Not selected'],
          ['WITHDRAWN', 'Withdrawn'],
        ].map(([v, l]) => (
          <button key={v} className={filter === v ? 'active' : ''} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
      </div>

      <ErrorBox message={error || apps.error} onRetry={apps.error ? apps.reload : undefined} />
      {apps.loading && <Loading text="Loading your applications…" />}
      {apps.data && shown.length === 0 && (
        <Empty title={list.length ? 'Nothing in this list' : 'No applications yet'}>
          {list.length ? (
            'Try another tab.'
          ) : (
            <Link to="/seeker/recommendations" className="link">
              See jobs recommended for you →
            </Link>
          )}
        </Empty>
      )}

      <div className="stack">
        {shown.map((a) => (
          <article key={a.id} className="card app-card">
            <div className="app-card-head">
              <div>
                <h3>
                  <Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link>
                </h3>
                <p className="muted">
                  {a.companyName} · {a.jobLocation} · applied {formatDate(a.appliedAt)}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>

            <ApplicationProgress status={a.status} />

            {a.interviewAt && a.status === 'INTERVIEW' && (
              <p className="interview">
                <Icon name="calendar" /> Interview scheduled for <strong>{formatDateTime(a.interviewAt)}</strong>
              </p>
            )}
            {a.employerNote && (
              <blockquote className="note">
                <span>Message from employer</span>
                {a.employerNote}
              </blockquote>
            )}

            {ACTIVE.includes(a.status) && (
              <div className="app-card-actions">
                <span className="muted small">Last updated {formatDate(a.updatedAt)}</span>
                <button className="btn btn-ghost btn-sm danger" onClick={() => withdraw(a)}>
                  Withdraw
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
