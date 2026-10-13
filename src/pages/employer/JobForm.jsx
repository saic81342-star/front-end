import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '../../api/client'
import { jobsApi, employerApi } from '../../api/services'
import { ErrorBox, Loading } from '../../components/Status'
import { JOB_TYPES, WORK_MODES } from '../../utils/format'
import { useApi } from '../../utils/useApi'

const EMPTY = {
  title: '',
  description: '',
  location: '',
  jobType: 'FULL_TIME',
  workMode: 'ONSITE',
  salaryMin: '',
  salaryMax: '',
  minExperience: '',
  skills: '',
  openings: 1,
  deadline: '',
}

/** Post a new job (/employer/jobs/new) or edit one (/employer/jobs/:id/edit). */
export default function JobForm() {
  const { id } = useParams()
  const existing = useApi(() => (id ? jobsApi.get(id) : Promise.resolve(null)), [id])

  if (existing.loading) return <Loading />
  if (existing.error) {
    return (
      <div className="container page">
        <ErrorBox message={existing.error} onRetry={existing.reload} />
      </div>
    )
  }
  return <JobFormInner key={id || 'new'} job={existing.data} />
}

function toForm(job) {
  if (!job) return EMPTY
  const form = { ...EMPTY }
  for (const key of Object.keys(EMPTY)) form[key] = job[key] ?? ''
  form.skills = (job.skills || []).join(', ')
  return form
}

function JobFormInner({ job }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => toForm(job))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  const num = (v) => (v === '' || v === null ? null : Number(v))

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = {
      ...form,
      salaryMin: num(form.salaryMin),
      salaryMax: num(form.salaryMax),
      minExperience: num(form.minExperience),
      openings: num(form.openings) || 1,
      deadline: form.deadline || null,
    }
    try {
      if (job) await employerApi.updateJob(job.id, body)
      else await employerApi.createJob(body)
      navigate('/employer/jobs')
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <Link to="/employer/jobs" className="link back">
        ← My jobs
      </Link>
      <div className="page-head">
        <h1>{job ? 'Edit job' : 'Post a new job'}</h1>
        <p className="muted">Clear titles and skill lists help the right candidates find you.</p>
      </div>

      <form className="card form-card" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="field span-2">
            <span>Job title *</span>
            <input required maxLength={150} placeholder="e.g. Java Backend Developer" value={form.title} onChange={set('title')} />
          </label>
          <label className="field">
            <span>Location *</span>
            <input required maxLength={100} placeholder="e.g. Hyderabad" value={form.location} onChange={set('location')} />
          </label>
          <label className="field">
            <span>Openings</span>
            <input type="number" min={1} max={1000} value={form.openings} onChange={set('openings')} />
          </label>
          <label className="field">
            <span>Job type *</span>
            <select value={form.jobType} onChange={set('jobType')}>
              {Object.entries(JOB_TYPES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Work mode *</span>
            <select value={form.workMode} onChange={set('workMode')}>
              {Object.entries(WORK_MODES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Minimum salary (₹ per year)</span>
            <input type="number" min={0} step={10000} placeholder="600000" value={form.salaryMin} onChange={set('salaryMin')} />
          </label>
          <label className="field">
            <span>Maximum salary (₹ per year)</span>
            <input type="number" min={0} step={10000} placeholder="1000000" value={form.salaryMax} onChange={set('salaryMax')} />
          </label>
          <label className="field">
            <span>Minimum experience (years)</span>
            <input type="number" min={0} max={40} placeholder="0 for freshers" value={form.minExperience} onChange={set('minExperience')} />
          </label>
          <label className="field">
            <span>Application deadline</span>
            <input type="date" min={job ? undefined : today} value={form.deadline} onChange={set('deadline')} />
          </label>
          <label className="field span-2">
            <span>Required skills (separate with commas)</span>
            <input maxLength={500} placeholder="Java, Spring Boot, MySQL" value={form.skills} onChange={set('skills')} />
          </label>
          <label className="field span-2">
            <span>Job description *</span>
            <textarea
              required
              rows={8}
              maxLength={5000}
              placeholder="Responsibilities, requirements, benefits…"
              value={form.description}
              onChange={set('description')}
            />
          </label>
        </div>
        <ErrorBox message={error} />
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : job ? 'Save changes' : 'Publish job'}
          </button>
          <Link to="/employer/jobs" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
