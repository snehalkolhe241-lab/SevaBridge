import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, formatInr } from '../lib/format'
import {
  CAMPAIGN_MODE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CATEGORY_LABELS,
  type Campaign,
  type CampaignSummary,
} from '../types'
import { Badge } from './Badge'

const FALLBACK = '/fallback-cover.svg'

function inr(value: number) {
  return formatInr(value).replace(/\.00$/, '')
}

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
  useEffect(() => {
    setSrc(campaign.cover_image_url || FALLBACK)
  }, [campaign.cover_image_url])
  const managing = Boolean(to)
  const showMoney = campaign.campaign_mode !== 'items'
  const hasItemFigures = summary.items_needed > 0 || summary.items_pledged > 0 || summary.items_received > 0
  const showItems = campaign.campaign_mode === 'items' || (campaign.campaign_mode === 'both' && hasItemFigures)

  return (
    <article className="campaign-card">
      <Link to={to ?? `/campaigns/${campaign.id}`}>
        <img
          src={src}
          alt={`Illustrative photograph for ${campaign.title}`}
          onError={() => {
            if (src !== FALLBACK) setSrc(FALLBACK)
          }}
        />
        <div className="campaign-card-body">
          <div className="card-meta">
            <span className="eyebrow">{CATEGORY_LABELS[campaign.category]}</span>
            <Badge>{CAMPAIGN_MODE_LABELS[campaign.campaign_mode]}</Badge>
            {managing || campaign.status !== 'active' ? (
              <Badge tone={campaign.status === 'active' ? 'success' : 'neutral'}>
                {CAMPAIGN_STATUS_LABELS[campaign.status]}
              </Badge>
            ) : null}
          </div>
          <h3>{campaign.title}</h3>
          <p className="byline">{organizationName}</p>
          {managing ? null : <p className="summary">{campaign.summary}</p>}
          {showMoney ? (
            <p className="card-progress">
              Received {inr(summary.money_received)}
              {campaign.money_goal ? ` of ${inr(campaign.money_goal)}` : ''}. Pledged {inr(summary.money_pledged)}.
            </p>
          ) : null}
          {showItems ? (
            <p className="card-progress">
              Received {summary.items_received} of {summary.items_needed} items. Pledged {summary.items_pledged}.
            </p>
          ) : null}
          {managing ? <p className="card-progress">Updated {formatDate(campaign.updated_at)}</p> : null}
          <span className="card-action">{managing ? 'Manage' : 'View campaign'}</span>
        </div>
      </Link>
    </article>
  )
}
