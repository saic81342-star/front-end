import { useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { employerApi } from '../../api/services'
import { Empty, ErrorBox, Loading } from '../../components/Status'
import { formatDate, JOB_TYPES } from '../../utils/format'
import { useApi } from '../../utils/useApi'

export default function EmployerJobs() {
  const jobs = useApi(() => employerApi.jobs())
  const [error, setError] = useState('')

  const toggle = async (job) => {
    setError('')
    try {
      const updated = await employerApi.setJobStatus(job.id, job.status === 'OPEN' ? 'CLOSED' : 'OPEN')
      jobs.setData((list) => list.map((j) => (j.id === updated.id ? updated : j)))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}" and all of its ${job.applicationCount} application(s)?`)) return
    setError('')
    try {
      await employerApi.deleteJob(job.id)
      jobs.setData((list) => list.filter((j) => j.id !== job.id))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="container page">
      <div className="page-head row">
        <div>
          <h1>My job postings</h1>
          <p className="muted">Open, close, edit or delete your vacancies and review who applied.</p>
        </div>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          + Post a job
        </Link>
      </div>

      <ErrorBox message={error || jobs.error} onRetry={jobs.error ? jobs.reload : undefined} />
      {jobs.loading && <Loading />}
      {jobs.data && jobs.data.length === 0 && (
        <Empty title="You have not posted any jobs yet">
          <Link to="/employer/jobs/new" className="link">
            Post your first job →
          </Link>
        </Empty>
      )}

      {jobs.data && jobs.data.length > 0 && (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Deadline</th>
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
                    <div className="muted small">
                      {j.location} · posted {formatDate(j.postedAt)}
                    </div>
                  </td>
                  <td>{JOB_TYPES[j.jobType]}</td>
                  <td>{formatDate(j.deadline)}</td>
                  <td>
                    <Link to={`/employer/jobs/${j.id}/applications`} className="btn btn-outline btn-sm">
                      {j.applicationCount} view
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${j.acceptingApplications ? 'status-open' : 'status-closed'}`}>
                      {j.status === 'OPEN' && !j.acceptingApplications ? 'Expired' : j.status === 'OPEN' ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/employer/jobs/${j.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle(j)}>
                      {j.status === 'OPEN' ? 'Close' : 'Reopen'}
                    </button>
                    <button className="btn btn-ghost btn-sm danger" onClick={() => remove(j)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
