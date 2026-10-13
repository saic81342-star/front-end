export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

export const WORK_MODES = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
}

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  HIRED: 'Hired',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
}

export const ROLES = {
  JOB_SEEKER: 'Job seeker',
  EMPLOYER: 'Employer',
  ADMIN: 'Admin',
}

/** 600000 -> "6 LPA", 450000 -> "4.5 LPA" */
function lpa(value) {
  const l = value / 100000
  return `${Number.isInteger(l) ? l : l.toFixed(1)}`
}

export function formatSalary(min, max) {
  if (min && max) return `₹${lpa(min)}–${lpa(max)} LPA`
  if (min) return `From ₹${lpa(min)} LPA`
  if (max) return `Up to ₹${lpa(max)} LPA`
  return 'Not disclosed'
}

export function formatExperience(years) {
  if (years === null || years === undefined) return 'Any experience'
  if (years === 0) return 'Freshers welcome'
  return `${years}+ yr${years === 1 ? '' : 's'} experience`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "3 days ago", "today" */
export function timeAgo(value) {
  if (!value) return ''
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return formatDate(value)
}

export function daysLeft(deadline) {
  if (!deadline) return null
  const end = new Date(`${deadline}T23:59:59`)
  return Math.ceil((end.getTime() - Date.now()) / 86400000)
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
