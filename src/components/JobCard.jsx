import { Link } from 'react-router-dom'
import { daysLeft, formatExperience, formatSalary, initials, JOB_TYPES, timeAgo, WORK_MODES } from '../utils/format'
import Icon from './Icon'
import StatusBadge from './StatusBadge'

export default function JobCard({ job }) {
  const left = daysLeft(job.deadline)
  return (
    <article className="job-card">
      <div className="job-card-head">
        <span className="company-logo" aria-hidden="true">
          {initials(job.companyName)}
        </span>
        <div className="job-card-title">
          <h3>
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <p className="muted">{job.companyName}</p>
        </div>
        {job.matchScore != null && (
          <span className="match" title="How well your skills match this job">
            {job.matchScore}% match
          </span>
        )}
      </div>

      <ul className="job-meta">
        <li><Icon name="pin" /> {job.location}</li>
        <li><Icon name="briefcase" /> {JOB_TYPES[job.jobType]}</li>
        <li><Icon name="home" /> {WORK_MODES[job.workMode]}</li>
        <li><Icon name="money" /> {formatSalary(job.salaryMin, job.salaryMax)}</li>
        <li><Icon name="cap" /> {formatExperience(job.minExperience)}</li>
      </ul>

      {job.skills?.length > 0 && (
        <div className="chips">
          {job.skills.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="job-card-foot">
        <span className="muted small">
          Posted {timeAgo(job.postedAt)}
          {left !== null && left >= 0 && ` · ${left === 0 ? 'last day to apply' : `${left} days left`}`}
        </span>
        {job.myApplicationStatus && job.myApplicationStatus !== 'WITHDRAWN' ? (
          <StatusBadge status={job.myApplicationStatus} />
        ) : (
          <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">
            View &amp; apply
          </Link>
        )}
      </div>
    </article>
  )
}
