import { useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { adminApi } from '../../api/services'
import { ErrorBox, Loading } from '../../components/Status'
import { useAuth } from '../../context/AuthContext'
import { APPLICATION_STATUS, formatDate, ROLES } from '../../utils/format'
import { useApi } from '../../utils/useApi'

/** Admin: platform numbers, user accounts and job moderation. */
export default function AdminDashboard() {
  const { user: me } = useAuth()
  const stats = useApi(() => adminApi.stats())
  const users = useApi(() => adminApi.users())
  const jobs = useApi(() => adminApi.jobs())
  const [tab, setTab] = useState('users')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [error, setError] = useState('')

  const toggleActive = async (u) => {
    setError('')
    try {
      const updated = await adminApi.setActive(u.id, !u.active)
      users.setData((list) => list.map((x) => (x.id === updated.id ? updated : x)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const deleteJob = async (j) => {
    if (!window.confirm(`Delete "${j.title}" by ${j.companyName}? Its applications are deleted too.`)) return
    setError('')
    try {
      await adminApi.deleteJob(j.id)
      jobs.setData((list) => list.filter((x) => x.id !== j.id))
      stats.reload()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const s = stats.data
  const shownUsers = (users.data || []).filter((u) => roleFilter === 'ALL' || u.role === roleFilter)

  return (
    <div className="container page">
      <div className="page-head">
        <p className="eyebrow dark">Admin dashboard</p>
        <h1>Platform overview</h1>
      </div>

      {stats.loading && <Loading />}
      <ErrorBox message={stats.error} onRetry={stats.reload} />
      {s && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span>Job seekers</span>
              <strong>{s.jobSeekers}</strong>
            </div>
            <div className="stat">
              <span>Employers / companies</span>
              <strong>
                {s.employers} / {s.companies}
              </strong>
            </div>
            <div className="stat">
              <span>Jobs (open)</span>
              <strong>
                {s.totalJobs} <small>({s.openJobs})</small>
              </strong>
            </div>
            <div className="stat">
              <span>Applications</span>
              <strong>{s.totalApplications}</strong>
            </div>
          </div>
          <div className="pill-row">
            {Object.entries(s.applicationsByStatus).map(([k, v]) => (
              <span key={k} className={`badge status-${k.toLowerCase()}`}>
                {APPLICATION_STATUS[k]}: {v}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users ({users.data?.length ?? '…'})
        </button>
        <button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>
          Jobs ({jobs.data?.length ?? '…'})
        </button>
      </div>

      <ErrorBox message={error} />

      {tab === 'users' && (
        <>
          <div className="inline-filter">
            <label>
              Show{' '}
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">All roles</option>
                {Object.entries(ROLES).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {users.loading && <Loading />}
          <ErrorBox message={users.error} onRetry={users.reload} />
          {users.data && (
            <div className="table-wrap card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {shownUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.fullName}</strong>
                        <div className="muted small">
                          {u.email}
                          {u.companyName && ` · ${u.companyName}`}
                        </div>
                      </td>
                      <td>{ROLES[u.role]}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <span className={`badge ${u.active ? 'status-open' : 'status-closed'}`}>
                          {u.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="actions">
                        {u.role !== 'ADMIN' && u.id !== me.id && (
                          <button className={`btn btn-ghost btn-sm ${u.active ? 'danger' : ''}`} onClick={() => toggleActive(u)}>
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'jobs' && (
        <>
          {jobs.loading && <Loading />}
          <ErrorBox message={jobs.error} onRetry={jobs.reload} />
          {jobs.data && (
            <div className="table-wrap card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Company</th>
                    <th>Posted</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {jobs.data.map((j) => (
                    <tr key={j.id}>
                      <td>
                        <Link to={`/jobs/${j.id}`} className="strong-link">
                          {j.title}
                        </Link>
                        <div className="muted small">{j.location}</div>
                      </td>
                      <td>{j.companyName}</td>
                      <td>{formatDate(j.postedAt)}</td>
                      <td>{j.applicationCount}</td>
                      <td>
                        <span className={`badge ${j.acceptingApplications ? 'status-open' : 'status-closed'}`}>
                          {j.acceptingApplications ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="btn btn-ghost btn-sm danger" onClick={() => deleteJob(j)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
