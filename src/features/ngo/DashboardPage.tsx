import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'

const metrics = ['Active campaigns', 'Pending commitments', 'Money received', 'Items received']

export function DashboardPage() {
  return (
    <div className="stack">
      <div className="page-heading">
        <h1>Your campaigns</h1>
        <Link className="btn btn-primary" to="/ngo/campaigns/new">
          New campaign
        </Link>
      </div>
      <dl className="metrics">
        {metrics.map((label) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              —<span className="sr-only"> not loaded</span>
            </dd>
          </div>
        ))}
      </dl>
      <EmptyState title="No campaigns yet">
        Counts and campaign cards appear after your organisation’s records are loaded.
      </EmptyState>
    </div>
  )
}
