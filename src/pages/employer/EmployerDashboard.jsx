import { Link } from 'react-router-dom'
import { employerApi } from '../../api/services'
import { ErrorBox, Loading } from '../../components/Status'
import StatusBadge from '../../components/StatusBadge'
import { APPLICATION_STATUS, formatDate } from '../../utils/format'
import { useApi } from '../../utils/useApi'

export default function EmployerDashboard() {
  const dash = useApi(() => employerApi.dashboard())

  if (dash.loading) return <Loading text="Loading dashboard…" />
  if (dash.error) {
    return (
      <div className="container page">
        <ErrorBox message={dash.error} onRetry={dash.reload} />
      </div>
    )
  }

  const d = dash.data
  const pipeline = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED']
  const maxCount = Math.max(1, ...pipeline.map((s) => d.applicationsByStatus[s] || 0))

  return (
    <div className="container page">
      <div className="page-head row">
        <div>
          <p className="eyebrow dark">Employer dashboard</p>
          <h1>{d.company.name}</h1>
          <p className="muted">{[d.company.industry, d.company.location].filter(Boolean).join(' · ')}</p>
        </div>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          + Post a job
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span>Jobs posted</span>
          <strong>{d.totalJobs}</strong>
        </div>
        <div className="stat">
          <span>Open jobs</span>
          <strong>{d.openJobs}</strong>
        </div>
        <div className="stat">
          <span>Applications received</span>
          <strong>{d.totalApplications}</strong>
        </div>
        <div className="stat">
          <span>Hired</span>
          <strong>{d.applicationsByStatus.HIRED || 0}</strong>
        </div>
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Hiring pipeline</h2>
          <div className="bars">
            {pipeline.map((s) => (
              <div key={s} className="bar-row">
                <span>{APPLICATION_STATUS[s]}</span>
                <div className="bar">
                  <div
                    className={`bar-fill status-${s.toLowerCase()}`}
                    style={{ width: `${((d.applicationsByStatus[s] || 0) / maxCount) * 100}%` }}
                  />
                </div>
                <strong>{d.applicationsByStatus[s] || 0}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <h2>Recent applicants</h2>
            <Link to="/employer/jobs" className="link">
              All jobs →
            </Link>
          </div>
          {d.recentApplications.length === 0 ? (
            <p className="muted">No applications yet. Share your job posts to start receiving applicants.</p>
          ) : (
            <ul className="list">
              {d.recentApplications.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.applicant.fullName}</strong>
                    <span className="muted small">
                      {' '}
                      for{' '}
                      <Link to={`/employer/jobs/${a.jobId}/applications`} className="link">
                        {a.jobTitle}
                      </Link>{' '}
                      · {formatDate(a.appliedAt)}
                    </span>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
