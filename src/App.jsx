import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import Applicants from './pages/employer/Applicants'
import CompanyProfile from './pages/employer/CompanyProfile'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import EmployerJobs from './pages/employer/EmployerJobs'
import JobForm from './pages/employer/JobForm'
import Home from './pages/Home'
import JobDetails from './pages/JobDetails'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import Profile from './pages/seeker/Profile'
import Recommendations from './pages/seeker/Recommendations'
import SeekerDashboard from './pages/seeker/SeekerDashboard'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute roles={['JOB_SEEKER']} />}>
            <Route path="/seeker" element={<SeekerDashboard />} />
            <Route path="/seeker/profile" element={<Profile />} />
            <Route path="/seeker/recommendations" element={<Recommendations />} />
          </Route>

          <Route element={<ProtectedRoute roles={['EMPLOYER']} />}>
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/jobs" element={<EmployerJobs />} />
            <Route path="/employer/jobs/new" element={<JobForm />} />
            <Route path="/employer/jobs/:id/edit" element={<JobForm />} />
            <Route path="/employer/jobs/:id/applications" element={<Applicants />} />
            <Route path="/employer/company" element={<CompanyProfile />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
