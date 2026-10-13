import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { ErrorBox } from '../components/Status'
import { homeFor, useAuth } from '../context/AuthContext'

const DEMO = [
  { label: 'Job seeker', email: 'ravi@gmail.com', password: 'Seeker@123' },
  { label: 'Employer', email: 'hr@techwave.com', password: 'Employer@123' },
  { label: 'Admin', email: 'admin@jobportal.com', password: 'Admin@123' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(email, password)
      navigate(location.state?.from || homeFor(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Log in to apply for jobs or manage your postings.</p>

        <label className="field">
          <span>Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <ErrorBox message={error} />
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p className="center muted">
          New here?{' '}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </p>

        <div className="demo-box">
          <p className="small">Demo accounts (click to fill):</p>
          <div className="demo-buttons">
            {DEMO.map((d) => (
              <button
                type="button"
                key={d.email}
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEmail(d.email)
                  setPassword(d.password)
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
