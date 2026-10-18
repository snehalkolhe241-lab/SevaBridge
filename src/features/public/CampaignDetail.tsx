import { EmptyState } from '../../components/EmptyState'

export function CampaignDetail() {
  return (
    <div className="wrap page stack">
      <h1>Campaign</h1>
      <EmptyState title="This campaign is not loaded">
        Details, progress, and the pledge form will appear here after the database is connected.
      </EmptyState>
    </div>
  )
}
