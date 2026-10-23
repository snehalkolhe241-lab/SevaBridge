import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { ProgressBar } from '../../components/ProgressBar'
import { formatDate, formatInr } from '../../lib/format'
import { presentCampaign, presentOrgName, presentUpdate } from '../../data/campaignCopy'
import { loadCampaignDetail, type DetailUpdate } from '../../lib/publicCampaigns'
import { CAMPAIGN_STATUS_LABELS, CATEGORY_LABELS, type ItemNeedProgress } from '../../types'
import { Badge } from '../../components/Badge'
import { PledgeForm } from './PledgeForm'

type Detail = NonNullable<Awaited<ReturnType<typeof loadCampaignDetail>>>

const FALLBACK = '/fallback-cover.svg'

export function CampaignDetail() {
  const { id = '' } = useParams()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')
  const [cover, setCover] = useState(FALLBACK)

  const refresh = useCallback(() => {
    loadCampaignDetail(id)
      .then((row) => {
        if (row) setDetail(row)
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'This campaign could not be loaded.')
      })
  }, [id])

  useEffect(() => {
    let active = true
    setDetail(null)
    setMissing(false)
    setError('')
    loadCampaignDetail(id)
      .then((row) => {
        if (!active) return
        setDetail(row)
        setMissing(!row)
        setCover((row ? presentCampaign(row.campaign).cover_image_url : null) || FALLBACK)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'This campaign could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return (
      <div className="wrap page">
        <EmptyState title="This campaign could not be loaded">{error}</EmptyState>
      </div>
    )
  }
  if (missing) {
    return (
      <div className="wrap page">
        <EmptyState title="Campaign not found">
          This link does not match a public campaign. Draft campaigns stay private.
        </EmptyState>
      </div>
    )
  }
  if (!detail) {
    return (
      <div className="wrap page">
        <p role="status">Loading campaign…</p>
      </div>
    )
  }

  const campaign = presentCampaign(detail.campaign)
  const organization = { ...detail.organization, name: presentOrgName(detail.organization.name) }
  const { summary, needs, progress } = detail
  const updates = detail.updates.map(presentUpdate)
  const progressByNeed = new Map(progress.map((item) => [item.item_need_id, item]))
  const open = campaign.status === 'active'
  const showMoney = campaign.campaign_mode !== 'items'
  const showItems = campaign.campaign_mode !== 'money'

  return (
    <div className="wrap page stack">
      <Link className="back-link" to="/campaigns">
        Campaigns
      </Link>
      <img
        className="cover"
        src={cover}
        alt=""
        onError={() => {
          if (cover !== FALLBACK) setCover(FALLBACK)
        }}
      />
      <div className="card-meta">
        <Badge>{CATEGORY_LABELS[campaign.category]}</Badge>
        <Badge tone={open ? 'success' : 'neutral'}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
      </div>
      <div>
        <h1>{campaign.title}</h1>
        <p className="lede">
          {organization.name}
          {organization.public_contact_email ? ` · ${organization.public_contact_email}` : ''}
        </p>
      </div>
      <div className="detail-grid">
        <div className="stack">
          <p>{campaign.summary}</p>
          <p className="story">{campaign.description}</p>
          {showMoney ? (
            <section className="panel stack">
              <h2>Money</h2>
              <dl className="metrics">
                <div>
                  <dt>Pledged</dt>
                  <dd>{formatInr(summary.money_pledged)}</dd>
                </div>
                <div>
                  <dt>Received</dt>
                  <dd>{formatInr(summary.money_received)}</dd>
                </div>
              </dl>
              {campaign.money_goal && campaign.money_goal > 0 ? (
                <ProgressBar
                  label={`Received ${formatInr(summary.money_received)} of ${formatInr(campaign.money_goal)}`}
                  value={(summary.money_received / campaign.money_goal) * 100}
                />
              ) : null}
              <p className="form-note">Pledged is a promise. Received is what the organisation has confirmed offline.</p>
            </section>
          ) : null}
          {showItems && needs.length > 0 ? (
            <section className="stack">
              <h2>Items</h2>
              <ul className="need-list">
                {needs.map((need) => (
                  <NeedRow key={need.id} need={need} progress={progressByNeed.get(need.id)} />
                ))}
              </ul>
            </section>
          ) : null}
          <section className="stack">
            <h2>Updates</h2>
            {updates.length === 0 ? (
              <EmptyState title="No updates yet">The organisation has not published an update.</EmptyState>
            ) : (
              <ul className="update-list">
                {updates.map((update) => (
                  <UpdateItem key={update.id} update={update} />
                ))}
              </ul>
            )}
          </section>
        </div>
        {open ? (
          <PledgeForm campaign={campaign} needs={needs} onRecorded={refresh} />
        ) : (
          <section className="panel stack">
            <h2>Pledges are closed</h2>
            <p>This campaign is {CAMPAIGN_STATUS_LABELS[campaign.status].toLowerCase()}. New pledges are not accepted.</p>
          </section>
        )}
      </div>
    </div>
  )
}

function NeedRow({
  need,
  progress,
}: {
  need: Detail['needs'][number]
  progress: ItemNeedProgress | undefined
}) {
  const pledged = progress?.quantity_pledged ?? 0
  const received = progress?.quantity_received ?? 0
  return (
    <li className="panel stack">
      <h3>{need.item_name}</h3>
      {need.description ? <p className="muted">{need.description}</p> : null}
      <p>
        Needed {need.quantity_needed} {need.unit}. Pledged {pledged}. Received {received}.
      </p>
      {need.quantity_needed > 0 ? (
        <ProgressBar
          label={`Received ${received} of ${need.quantity_needed} ${need.unit}`}
          value={(received / need.quantity_needed) * 100}
        />
      ) : null}
    </li>
  )
}

function UpdateItem({ update }: { update: DetailUpdate }) {
  return (
    <li className="panel stack">
      <h3>{update.title}</h3>
      {update.published_at ? <p className="muted">{formatDate(update.published_at)}</p> : null}
      <p>{update.body}</p>
      {update.image_url ? <img className="update-image" src={update.image_url} alt="" /> : null}
    </li>
  )
}
