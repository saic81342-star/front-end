import { useState } from 'react'
import { errorMessage } from '../../api/client'
import { seekerApi } from '../../api/services'
import { ErrorBox, Loading, SuccessBox } from '../../components/Status'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../utils/useApi'

const EMPTY = {
  fullName: '',
  phone: '',
  headline: '',
  skills: '',
  experienceYears: '',
  education: '',
  location: '',
  resumeUrl: '',
  about: '',
}

function toForm(p) {
  const form = { ...EMPTY }
  for (const key of Object.keys(EMPTY)) form[key] = p[key] ?? ''
  form.skills = (p.skills || []).join(', ')
  return form
}

export default function Profile() {
  const profile = useApi(() => seekerApi.profile())
  if (profile.loading) return <Loading text="Loading profile…" />
  if (profile.error) {
    return (
      <div className="container page">
        <ErrorBox message={profile.error} onRetry={profile.reload} />
      </div>
    )
  }
  return <ProfileForm initial={profile.data} />
}

function ProfileForm({ initial }) {
  const { updateUser } = useAuth()
  const [form, setForm] = useState(() => toForm(initial))
  const [completeness, setCompleteness] = useState(initial.completeness)
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
      const body = { ...form, experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears) }
      const p = await seekerApi.updateProfile(body)
      setForm(toForm(p))
      setCompleteness(p.completeness)
      updateUser({ fullName: p.fullName, phone: p.phone })
      setSaved('Profile saved.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <div className="page-head">
        <h1>My profile</h1>
        <p className="muted">Employers see this when you apply. Skills are used to recommend jobs to you.</p>
      </div>

      <div className="meter" aria-label={`Profile ${completeness}% complete`}>
        <div style={{ width: `${completeness}%` }} />
        <span>{completeness}% complete</span>
      </div>

      <form className="card form-card" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Full name</span>
            <input required maxLength={100} value={form.fullName} onChange={set('fullName')} />
          </label>
          <label className="field">
            <span>Email</span>
            <input value={initial.email} disabled />
          </label>
          <label className="field">
            <span>Phone</span>
            <input maxLength={20} value={form.phone} onChange={set('phone')} />
          </label>
          <label className="field">
            <span>City</span>
            <input maxLength={100} placeholder="e.g. Hyderabad" value={form.location} onChange={set('location')} />
          </label>
          <label className="field span-2">
            <span>Headline</span>
            <input
              maxLength={150}
              placeholder="e.g. Final-year B.Tech CSE student | Java developer"
              value={form.headline}
              onChange={set('headline')}
            />
          </label>
          <label className="field span-2">
            <span>Skills (separate with commas)</span>
            <input
              maxLength={500}
              placeholder="Java, Spring Boot, MySQL, React"
              value={form.skills}
              onChange={set('skills')}
            />
          </label>
          <label className="field">
            <span>Experience (years)</span>
            <input type="number" min={0} max={50} value={form.experienceYears} onChange={set('experienceYears')} />
          </label>
          <label className="field">
            <span>Education</span>
            <input
              maxLength={255}
              placeholder="B.Tech CSE, XYZ University (2026)"
              value={form.education}
              onChange={set('education')}
            />
          </label>
          <label className="field span-2">
            <span>Resume link</span>
            <input
              type="url"
              maxLength={500}
              placeholder="https://drive.google.com/…"
              value={form.resumeUrl}
              onChange={set('resumeUrl')}
            />
          </label>
          <label className="field span-2">
            <span>About me</span>
            <textarea rows={5} maxLength={2000} value={form.about} onChange={set('about')} />
          </label>
        </div>
        <ErrorBox message={error} />
        <SuccessBox message={saved} />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
