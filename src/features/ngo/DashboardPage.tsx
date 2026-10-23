import { useEffect, useState } from 'react'
import { CampaignCard } from '../../components/CampaignCard'
import { EmptyState } from '../../components/EmptyState'
import { presentCampaign, presentOrgName } from '../../data/campaignCopy'
import { formatInr } from '../../lib/format'
import { loadOwnOrganization, loadOwnerCampaigns, metricsFor, type OwnerCampaign, type OwnerMetrics } from '../../lib/ngoCampaigns'

const emptyMetrics: OwnerMetrics = {
  activeCampaigns: 0,
  pendingCommitments: 0,
  confirmedCommitments: 0,
  fulfilledCommitments: 0,
  cancelledCommitments: 0,
  moneyPledged: 0,
  moneyReceived: 0,
  itemsPledged: 0,
  itemsReceived: 0,
}

function inr(value: number) {
  return formatInr(value).replace(/\.00$/, '')
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
        setName(presentOrgName(org.name))
        const loaded = await loadOwnerCampaigns(org.id)
        if (!active) return
        setCampaigns(loaded.campaigns)
        setMetrics(metricsFor(loaded.campaigns, loaded.counts))
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'The dashboard could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  const figures: { label: string; value: string; note: string }[] = [
    { label: 'Active campaigns', value: String(metrics.activeCampaigns), note: 'Published and open' },
    { label: 'Pending pledges', value: String(metrics.pendingCommitments), note: 'Not yet confirmed' },
    { label: 'Money pledged', value: inr(metrics.moneyPledged), note: 'Promised, not received' },
    { label: 'Money received', value: inr(metrics.moneyReceived), note: 'Confirmed after handover' },
    { label: 'Items pledged', value: String(metrics.itemsPledged), note: 'Promised, not received' },
    { label: 'Items received', value: String(metrics.itemsReceived), note: 'Confirmed after handover' },
  ]

  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <h1>{name ? name : 'Your campaigns'}</h1>
          <p className="form-note">A pledge is a promise. Received is what you confirm after the handover.</p>
        </div>
      </div>
      <dl className="metrics">
        {figures.map((figure) => (
          <div key={figure.label}>
            <dt>{figure.label}</dt>
            <dd>
              {campaigns === null ? '—' : figure.value}
              <span>{figure.note}</span>
            </dd>
          </div>
        ))}
      </dl>
      {campaigns !== null ? (
        <p className="form-note">
          Pledge status: {metrics.pendingCommitments} pending, {metrics.confirmedCommitments} confirmed,{' '}
          {metrics.fulfilledCommitments} received, {metrics.cancelledCommitments} cancelled.
        </p>
      ) : null}
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
        <div className="card-grid manage-grid">
          {campaigns.map((row) => (
            <CampaignCard
              key={row.campaign.id}
              campaign={presentCampaign(row.campaign)}
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
