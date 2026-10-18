import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatInr } from '../lib/format'
import {
  CAMPAIGN_MODE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CATEGORY_LABELS,
  type Campaign,
  type CampaignSummary,
} from '../types'
import { Badge } from './Badge'
import { ProgressBar } from './ProgressBar'

const FALLBACK = '/fallback-cover.svg'

export function CampaignCard({
  campaign,
  organizationName,
  summary,
  to,
}: {
  campaign: Campaign
  organizationName: string
  summary: CampaignSummary
  to?: string
}) {
  const [src, setSrc] = useState(campaign.cover_image_url || FALLBACK)
  const showMoney = campaign.campaign_mode !== 'items'
  const showItems = campaign.campaign_mode !== 'money'

  return (
    <article className="campaign-card">
      <Link to={to ?? `/campaigns/${campaign.id}`}>
        <img
          src={src}
          alt=""
          onError={() => {
            if (src !== FALLBACK) setSrc(FALLBACK)
          }}
        />
        <div className="campaign-card-body">
          <div className="card-meta">
            <Badge>{CATEGORY_LABELS[campaign.category]}</Badge>
            <Badge tone={campaign.status === 'active' ? 'success' : 'neutral'}>
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </Badge>
          </div>
          <h3>{campaign.title}</h3>
          <p className="muted">{organizationName}</p>
          <p className="summary">{campaign.summary}</p>
          <p className="muted">{CAMPAIGN_MODE_LABELS[campaign.campaign_mode]}</p>
          {showMoney ? <MoneyProgress campaign={campaign} summary={summary} /> : null}
          {showItems ? <ItemProgress summary={summary} /> : null}
          {to ? <span className="btn btn-secondary">Manage</span> : null}
        </div>
      </Link>
    </article>
  )
}

function MoneyProgress({ campaign, summary }: { campaign: Campaign; summary: CampaignSummary }) {
  const goal = campaign.money_goal ?? 0
  const label = `Received ${formatInr(summary.money_received)} of ${formatInr(goal)}. Pledged ${formatInr(summary.money_pledged)}.`
  if (goal <= 0) return <p className="muted">{label}</p>
  return <ProgressBar label={label} value={(summary.money_received / goal) * 100} />
}

function ItemProgress({ summary }: { summary: CampaignSummary }) {
  const label = `Received ${summary.items_received} of ${summary.items_needed} items. Pledged ${summary.items_pledged}.`
  if (summary.items_needed <= 0) return <p className="muted">{label}</p>
  return <ProgressBar label={label} value={(summary.items_received / summary.items_needed) * 100} />
}
