import axios from 'axios'

const TOKEN_KEY = 'jobportal_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (private mode): the session just will not survive a refresh
  }
}

// In development Vite forwards /api to http://localhost:8080 (see vite.config.js).
// For a separately hosted backend set VITE_API_BASE_URL, e.g. https://my-api.onrender.com
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
})

// Send the login token with every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Let the app know when the session is no longer valid.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && getToken()) {
      setToken(null)
      window.dispatchEvent(new Event('jobportal:logout'))
    }
    return Promise.reject(error)
  },
)

/** Turns any request error into one readable sentence. */
export function errorMessage(error) {
  const data = error?.response?.data
  if (data?.message) {
    return data.details?.length ? `${data.message}: ${data.details.join('; ')}` : data.message
  }
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  if (error?.request && !error?.response) {
    return 'Cannot reach the server. Is the Spring Boot backend running on port 8080?'
  }
  return error?.message || 'Something went wrong.'
}

export default api
