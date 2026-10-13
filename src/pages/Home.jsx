import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobsApi } from '../api/services'
import Icon from '../components/Icon'
import JobCard from '../components/JobCard'
import { ErrorBox, Loading } from '../components/Status'
import { homeFor, useAuth } from '../context/AuthContext'
import { useApi } from '../utils/useApi'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const latest = useApi(() => jobsApi.search({ limit: 6 }))
  const stats = useApi(() => jobsApi.stats())

  const onSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/jobs?${params}`)
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Online Job Portal Management System</p>
          <h1>
            Find the right job.
            <br />
            <span>Hire the right people.</span>
          </h1>
          <p className="hero-sub">
            Job seekers search and apply in one place. Employers post vacancies and manage every applicant from a
            single dashboard.
          </p>

          <form className="search-bar" onSubmit={onSearch}>
            <label className="search-field">
              <Icon name="search" />
              <input
                placeholder="Job title, skill or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Keyword"
              />
            </label>
            <label className="search-field">
              <Icon name="pin" />
              <input
                placeholder="City or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Location"
              />
            </label>
            <button className="btn btn-accent">Search jobs</button>
          </form>

          {stats.data && (
            <div className="hero-stats">
              <div>
                <strong>{stats.data.openJobs}</strong>
                <span>open jobs</span>
              </div>
              <div>
                <strong>{stats.data.companies}</strong>
                <span>companies hiring</span>
              </div>
              <div>
                <strong>{stats.data.jobSeekers}</strong>
                <span>job seekers</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Latest openings</h2>
          <Link to="/jobs" className="link">
            See all jobs →
          </Link>
        </div>
        {latest.loading && <Loading text="Loading jobs…" />}
        <ErrorBox message={latest.error} onRetry={latest.reload} />
        {latest.data && latest.data.length === 0 && <p className="muted">No jobs posted yet.</p>}
        <div className="job-grid">{latest.data?.map((job) => <JobCard key={job.id} job={job} />)}</div>
      </section>

      <section className="container section">
        <div className="how-grid">
          <div className="how-card">
            <h3>For job seekers</h3>
            <ol>
              <li>Create your profile with skills and a resume link</li>
              <li>Search jobs or open your recommended matches</li>
              <li>Apply and track every stage: shortlisted, interview, hired</li>
            </ol>
            {!user && (
              <Link to="/register?role=JOB_SEEKER" className="btn btn-primary">
                I&apos;m looking for a job
              </Link>
            )}
          </div>
          <div className="how-card alt">
            <h3>For employers</h3>
            <ol>
              <li>Register your organisation</li>
              <li>Post vacancies with skills, salary and deadline</li>
              <li>Review applicants ranked by skill match and update their status</li>
            </ol>
            {!user && (
              <Link to="/register?role=EMPLOYER" className="btn btn-accent">
                I&apos;m hiring
              </Link>
            )}
          </div>
        </div>
        {user && (
          <p className="center">
            <Link to={homeFor(user.role)} className="btn btn-primary">
              Go to my dashboard
            </Link>
          </p>
        )}
      </section>
    </>
  )
}
