import { APPLICATION_STATUS } from '../utils/format'

export default function StatusBadge({ status }) {
  return <span className={`badge status-${status?.toLowerCase()}`}>{APPLICATION_STATUS[status] || status}</span>
}
