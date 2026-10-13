import { useState } from 'react'
import { errorMessage } from '../../api/client'
import { employerApi } from '../../api/services'
import { ErrorBox, Loading, SuccessBox } from '../../components/Status'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../utils/useApi'

export default function CompanyProfile() {
  const company = useApi(() => employerApi.company())
  if (company.loading) return <Loading />
  if (company.error) {
    return (
      <div className="container page">
        <ErrorBox message={company.error} onRetry={company.reload} />
      </div>
    )
  }
  return <CompanyForm initial={company.data} />
}

function CompanyForm({ initial }) {
  const { updateUser } = useAuth()
  const [form, setForm] = useState({
    name: initial.name || '',
    industry: initial.industry || '',
    location: initial.location || '',
    website: initial.website || '',
    description: initial.description || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const c = await employerApi.updateCompany(form)
      updateUser({ companyName: c.name })
      setSaved('Company details saved. They appear on all of your job posts.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <div className="page-head">
        <h1>Company profile</h1>
        <p className="muted">Job seekers see these details on every job you post.</p>
      </div>
      <form className="card form-card" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="field span-2">
            <span>Company name *</span>
            <input required maxLength={150} value={form.name} onChange={set('name')} />
          </label>
          <label className="field">
            <span>Industry</span>
            <input maxLength={100} placeholder="e.g. Information Technology" value={form.industry} onChange={set('industry')} />
          </label>
          <label className="field">
            <span>Head office</span>
            <input maxLength={100} placeholder="e.g. Hyderabad" value={form.location} onChange={set('location')} />
          </label>
          <label className="field span-2">
            <span>Website</span>
            <input type="url" maxLength={255} placeholder="https://" value={form.website} onChange={set('website')} />
          </label>
          <label className="field span-2">
            <span>About the company</span>
            <textarea rows={6} maxLength={2000} value={form.description} onChange={set('description')} />
          </label>
        </div>
        <p className="muted small">
          Recruiter: {initial.ownerName} ({initial.ownerEmail})
        </p>
        <ErrorBox message={error} />
        <SuccessBox message={saved} />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save company'}
        </button>
      </form>
    </div>
  )
}
