import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { CATEGORY_LABELS, type CampaignCategory } from '../../types'

function categoryLabel(value: string | null) {
  if (!value || !(value in CATEGORY_LABELS)) return null
  return CATEGORY_LABELS[value as CampaignCategory]
}

export function CampaignDirectory() {
  const [params] = useSearchParams()
  const category = categoryLabel(params.get('category'))

  return (
    <div className="wrap page stack">
      <div>
        <h1>Campaigns</h1>
        <p className="lede">Find a community need and open it to see how to help.</p>
      </div>
      <EmptyState title={category ? `No ${category} campaigns loaded` : 'No campaigns loaded'}>
        {category
          ? 'This filter is ready. Campaign records will appear after the database is connected.'
          : 'Published campaigns will appear here after the database is connected.'}
      </EmptyState>
    </div>
  )
}
