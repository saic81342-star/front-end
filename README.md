# Job Portal - Frontend (React + CSS)

```bash
npm install
npm run dev      # http://localhost:5173  (backend must run on http://localhost:8080)
npm run build    # production files in dist/
npm run lint
```

During development `vite.config.js` forwards `/api` to the Spring Boot backend.
For a backend hosted elsewhere, build with `VITE_API_BASE_URL=https://your-api.example.com`.

```
src/
├── api/          axios client (adds the login token) and one function per REST endpoint
├── context/      AuthContext - logged-in user, login/register/logout
├── components/   Navbar, JobCard, StatusBadge, ApplicationProgress, ProtectedRoute, ...
├── pages/        Home, Jobs, JobDetails, Login, Register
│   ├── seeker/   SeekerDashboard (application tracking), Profile, Recommendations
│   ├── employer/ EmployerDashboard, EmployerJobs, JobForm, Applicants, CompanyProfile
│   └── admin/    AdminDashboard
├── utils/        formatting helpers and the useApi data-loading hook
└── index.css     all styles (plain CSS, responsive)
```
