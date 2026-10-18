import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CampaignCard } from '../../components/CampaignCard'
import { EmptyState } from '../../components/EmptyState'
import { formatInr } from '../../lib/format'
import { loadOwnOrganization, loadOwnerCampaigns, metricsFor, type OwnerCampaign, type OwnerMetrics } from '../../lib/ngoCampaigns'

const emptyMetrics: OwnerMetrics = {
  activeCampaigns: 0,
  pendingCommitments: 0,
  moneyReceived: 0,
  itemsReceived: 0,
}

export function DashboardPage() {
  const [name, setName] = useState('')
  const [campaigns, setCampaigns] = useState<OwnerCampaign[] | null>(null)
  const [metrics, setMetrics] = useState<OwnerMetrics>(emptyMetrics)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    loadOwnOrganization()
      .then(async (org) => {
        if (!active) return
        if (!org) {
          setCampaigns([])
          return
        }
        setName(org.name)
        const loaded = await loadOwnerCampaigns(org.id)
        if (!active) return
        setCampaigns(loaded.campaigns)
        setMetrics(metricsFor(loaded.campaigns, loaded.pending))
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'The dashboard could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  const figures = [
    ['Active campaigns', String(metrics.activeCampaigns)],
    ['Pending commitments', String(metrics.pendingCommitments)],
    ['Money received', formatInr(metrics.moneyReceived)],
    ['Items received', String(metrics.itemsReceived)],
  ]

  return (
    <div className="stack">
      <div className="page-heading">
        <h1>{name ? name : 'Your campaigns'}</h1>
        <Link className="btn btn-primary" to="/ngo/campaigns/new">
          New campaign
        </Link>
      </div>
      <dl className="metrics">
        {figures.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{campaigns === null ? '—' : value}</dd>
          </div>
        ))}
      </dl>
      {error ? (
        <EmptyState title="The dashboard could not be loaded">{error}</EmptyState>
      ) : campaigns === null ? (
        <p role="status">Loading campaigns…</p>
      ) : campaigns.length === 0 ? (
        <EmptyState title="No campaigns yet">
          {name
            ? 'Create a campaign, then publish it when it should appear on the public site.'
            : 'This account is not linked to an organisation.'}
        </EmptyState>
      ) : (
        <div className="card-grid">
          {campaigns.map((row) => (
            <CampaignCard
              key={row.campaign.id}
              campaign={row.campaign}
              organizationName={name}
              summary={row.summary}
              to={`/ngo/campaigns/${row.campaign.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
