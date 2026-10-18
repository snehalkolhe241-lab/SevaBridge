import { useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'

export function CampaignForm() {
  const { id } = useParams()
  return (
    <div className="stack">
      <h1>{id ? 'Edit campaign' : 'New campaign'}</h1>
      <EmptyState title="The form is not connected yet">
        Title, description, needs, and publish actions will be saved here in a later phase.
      </EmptyState>
    </div>
  )
}
