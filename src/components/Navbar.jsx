import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initials, ROLES } from '../utils/format'

const LINKS = {
  GUEST: [{ to: '/jobs', label: 'Find jobs' }],
  JOB_SEEKER: [
    { to: '/jobs', label: 'Find jobs' },
    { to: '/seeker/recommendations', label: 'Recommended' },
    { to: '/seeker', label: 'My applications', end: true },
    { to: '/seeker/profile', label: 'Profile' },
  ],
  EMPLOYER: [
    { to: '/employer', label: 'Dashboard', end: true },
    { to: '/employer/jobs', label: 'My jobs', end: true },
    { to: '/employer/jobs/new', label: 'Post a job' },
    { to: '/employer/company', label: 'Company' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/jobs', label: 'Browse jobs' },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const links = LINKS[user?.role || 'GUEST']

  const onLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <rect x="3" y="8" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" fill="none" stroke="#fbbf24" strokeWidth="2.2" />
            </svg>
          </span>
          <span className="brand-text">
            Job<span>Portal</span>
          </span>
        </Link>

        <button className="nav-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <div className="nav-user">
              <span className="avatar" title={user.email}>
                {initials(user.fullName)}
              </span>
              <span className="nav-user-text">
                <strong>{user.fullName}</strong>
                <small>{user.companyName || ROLES[user.role]}</small>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
