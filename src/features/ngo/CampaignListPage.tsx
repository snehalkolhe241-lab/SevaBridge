import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'

export function CampaignListPage() {
  return (
    <div className="stack">
      <div className="page-heading">
        <h1>Campaigns</h1>
        <Link className="btn btn-primary" to="/ngo/campaigns/new">
          New campaign
        </Link>
      </div>
      <EmptyState title="No campaigns yet">
        Draft, active, completed, and archived campaigns will be listed here.
      </EmptyState>
    </div>
  )
}
