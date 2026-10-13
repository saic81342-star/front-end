import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { ErrorBox } from '../components/Status'
import { homeFor, useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    role: params.get('role') === 'EMPLOYER' ? 'EMPLOYER' : 'JOB_SEEKER',
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirm: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const isEmployer = form.role === 'EMPLOYER'

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const { confirm: _confirm, ...body } = form
      if (!isEmployer) body.companyName = null
      const user = await register(body)
      navigate(user.role === 'JOB_SEEKER' ? '/seeker/profile' : homeFor(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card wide" onSubmit={onSubmit}>
        <h1>Create your account</h1>

        <div className="role-switch" role="radiogroup" aria-label="Account type">
          {[
            ['JOB_SEEKER', 'I want a job', 'Search and apply for jobs'],
            ['EMPLOYER', 'I want to hire', 'Post jobs and review applicants'],
          ].map(([value, title, sub]) => (
            <button
              type="button"
              key={value}
              role="radio"
              aria-checked={form.role === value}
              className={form.role === value ? 'active' : ''}
              onClick={() => setForm((f) => ({ ...f, role: value }))}
            >
              <strong>{title}</strong>
              <small>{sub}</small>
            </button>
          ))}
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Full name</span>
            <input required maxLength={100} value={form.fullName} onChange={set('fullName')} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input maxLength={20} value={form.phone} onChange={set('phone')} />
          </label>
          <label className="field span-2">
            <span>Email</span>
            <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
          </label>
          {isEmployer && (
            <label className="field span-2">
              <span>Company / organisation name</span>
              <input required maxLength={150} value={form.companyName} onChange={set('companyName')} />
            </label>
          )}
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
            />
          </label>
        </div>

        <ErrorBox message={error} />
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating account…' : isEmployer ? 'Register organisation' : 'Create account'}
        </button>
        <p className="center muted">
          Already registered?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}
