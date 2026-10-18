import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'

export function CampaignWorkspace() {
  const { id } = useParams()
  return (
    <div className="stack">
      <div className="page-heading">
        <h1>Campaign workspace</h1>
        <Link className="btn btn-secondary" to={`/ngo/campaigns/${id}/edit`}>
          Edit campaign
        </Link>
      </div>
      <EmptyState title="Nothing loaded for this campaign">
        Overview, commitments, item needs, and updates will be managed here.
      </EmptyState>
    </div>
  )
}
