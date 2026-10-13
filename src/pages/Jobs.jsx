import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jobsApi } from '../api/services'
import JobCard from '../components/JobCard'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { JOB_TYPES, WORK_MODES } from '../utils/format'
import { useApi } from '../utils/useApi'

const FIELDS = ['keyword', 'location', 'jobType', 'workMode']

export default function Jobs() {
  const [params, setParams] = useSearchParams()
  const filters = Object.fromEntries(FIELDS.map((f) => [f, params.get(f) || '']))
  const [form, setForm] = useState(filters)
  const query = params.toString()

  const jobs = useApi(() => jobsApi.search(Object.fromEntries(new URLSearchParams(query))), [query])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const apply = (next) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v && v.trim()))
    setParams(clean)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    apply(form)
  }

  const onSelect = (field) => (e) => {
    const next = { ...form, [field]: e.target.value }
    setForm(next)
    apply(next)
  }

  const clear = () => {
    const empty = Object.fromEntries(FIELDS.map((f) => [f, '']))
    setForm(empty)
    setParams({})
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Find jobs</h1>
        <p className="muted">Search open positions by title, skill, company or location.</p>
      </div>

      <form className="filters card" onSubmit={onSubmit}>
        <input placeholder="Keyword (e.g. Java, React, Analyst)" value={form.keyword} onChange={update('keyword')} />
        <input placeholder="Location" value={form.location} onChange={update('location')} />
        <select value={form.jobType} onChange={onSelect('jobType')} aria-label="Job type">
          <option value="">All job types</option>
          {Object.entries(JOB_TYPES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select value={form.workMode} onChange={onSelect('workMode')} aria-label="Work mode">
          <option value="">Any work mode</option>
          {Object.entries(WORK_MODES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <div className="filter-actions">
          <button className="btn btn-primary">Search</button>
          <button type="button" className="btn btn-ghost" onClick={clear}>
            Clear
          </button>
        </div>
      </form>

      {jobs.loading && <Loading text="Searching jobs…" />}
      <ErrorBox message={jobs.error} onRetry={jobs.reload} />
      {jobs.data && (
        <>
          <p className="result-count">
            {jobs.data.length} job{jobs.data.length === 1 ? '' : 's'} found
          </p>
          {jobs.data.length === 0 ? (
            <Empty title="No jobs match your search">Try a different keyword or clear the filters.</Empty>
          ) : (
            <div className="job-grid">
              {jobs.data.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
