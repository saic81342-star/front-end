import api from './client'

const data = (promise) => promise.then((res) => res.data)

// ---------- auth ----------
export const authApi = {
  login: (email, password) => data(api.post('/api/auth/login', { email, password })),
  register: (form) => data(api.post('/api/auth/register', form)),
  me: () => data(api.get('/api/auth/me')),
  logout: () => data(api.post('/api/auth/logout')),
}

// ---------- public jobs ----------
export const jobsApi = {
  search: (params) => data(api.get('/api/jobs', { params })),
  get: (id) => data(api.get(`/api/jobs/${id}`)),
  apply: (id, coverLetter) => data(api.post(`/api/jobs/${id}/apply`, { coverLetter })),
  stats: () => data(api.get('/api/stats')),
}

// ---------- job seeker ----------
export const seekerApi = {
  profile: () => data(api.get('/api/seeker/profile')),
  updateProfile: (form) => data(api.put('/api/seeker/profile', form)),
  applications: () => data(api.get('/api/seeker/applications')),
  withdraw: (id) => data(api.patch(`/api/seeker/applications/${id}/withdraw`)),
  recommendations: () => data(api.get('/api/seeker/recommendations')),
}

// ---------- employer ----------
export const employerApi = {
  dashboard: () => data(api.get('/api/employer/dashboard')),
  company: () => data(api.get('/api/employer/company')),
  updateCompany: (form) => data(api.put('/api/employer/company', form)),
  jobs: () => data(api.get('/api/employer/jobs')),
  createJob: (form) => data(api.post('/api/employer/jobs', form)),
  updateJob: (id, form) => data(api.put(`/api/employer/jobs/${id}`, form)),
  setJobStatus: (id, status) => data(api.patch(`/api/employer/jobs/${id}/status`, { status })),
  deleteJob: (id) => data(api.delete(`/api/employer/jobs/${id}`)),
  applicants: (jobId) => data(api.get(`/api/employer/jobs/${jobId}/applications`)),
  updateApplication: (id, body) => data(api.patch(`/api/employer/applications/${id}`, body)),
}

// ---------- admin ----------
export const adminApi = {
  stats: () => data(api.get('/api/admin/stats')),
  users: () => data(api.get('/api/admin/users')),
  setActive: (id, active) => data(api.patch(`/api/admin/users/${id}/active`, { active })),
  jobs: () => data(api.get('/api/admin/jobs')),
  deleteJob: (id) => data(api.delete(`/api/admin/jobs/${id}`)),
}
