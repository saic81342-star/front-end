import { Link } from 'react-router-dom'
import { seekerApi } from '../../api/services'
import JobCard from '../../components/JobCard'
import { Empty, ErrorBox, Loading } from '../../components/Status'
import { useApi } from '../../utils/useApi'

export default function Recommendations() {
  const recs = useApi(() => seekerApi.recommendations())

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Recommended for you</h1>
        <p className="muted">
          Open jobs ranked by how many of the required skills are in your profile. Jobs in your city or remote get a
          small boost; jobs you already applied to are hidden.
        </p>
      </div>
      {recs.loading && <Loading text="Finding matching jobs…" />}
      <ErrorBox message={recs.error} onRetry={recs.reload} />
      {recs.data && recs.data.length === 0 && (
        <Empty title="No recommendations yet">
          Add your skills to your{' '}
          <Link to="/seeker/profile" className="link">
            profile
          </Link>{' '}
          and we will match you with open jobs. You can also{' '}
          <Link to="/jobs" className="link">
            browse all jobs
          </Link>
          .
        </Empty>
      )}
      <div className="job-grid">{recs.data?.map((job) => <JobCard key={job.id} job={job} />)}</div>
    </div>
  )
}
