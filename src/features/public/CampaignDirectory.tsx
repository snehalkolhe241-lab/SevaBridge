import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CampaignCard } from '../../components/CampaignCard'
import { EmptyState } from '../../components/EmptyState'
import { listPublicCampaigns, type ListedCampaign } from '../../lib/publicCampaigns'
import {
  CAMPAIGN_MODE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CATEGORY_LABELS,
  type CampaignCategory,
  type CampaignMode,
  type CampaignStatus,
} from '../../types'

const categories = Object.keys(CATEGORY_LABELS) as CampaignCategory[]
const modes = Object.keys(CAMPAIGN_MODE_LABELS) as CampaignMode[]
const statuses = ['active', 'completed'] as const

function isCategory(value: string | null): value is CampaignCategory {
  return !!value && value in CATEGORY_LABELS
}

function isMode(value: string | null): value is CampaignMode {
  return !!value && value in CAMPAIGN_MODE_LABELS
}

function isStatus(value: string | null): value is CampaignStatus {
  return value === 'active' || value === 'completed'
}

export function CampaignDirectory() {
  const [params, setParams] = useSearchParams()
  const categoryParam = params.get('category')
  const modeParam = params.get('mode')
  const statusParam = params.get('status')
  const category = isCategory(categoryParam) ? categoryParam : null
  const mode = isMode(modeParam) ? modeParam : null
  const status: CampaignStatus = isStatus(statusParam) ? statusParam : 'active'
  const statusRejected = statusParam !== null && !isStatus(statusParam)
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const [rows, setRows] = useState<ListedCampaign[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setRows(null)
    setError('')
    if (statusRejected) {
      setRows([])
      return
    }
    listPublicCampaigns({
      status,
      category: category ?? undefined,
      mode: mode ?? undefined,
    })
      .then((listed) => {
        if (active) setRows(listed)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Campaigns could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [status, category, mode, statusRejected])

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || (key === 'status' && value === 'active')) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const visible = (rows ?? []).filter((row) => {
    if (!query) return true
    const haystack = `${row.campaign.title} ${row.campaign.summary} ${row.organization.name}`.toLowerCase()
    return haystack.includes(query)
  })
  const filtered = Boolean(query || category || mode || params.get('status'))

  return (
    <div className="wrap page stack">
      <div>
        <h1>Campaigns</h1>
        <p className="lede">Find a community need and open it to see how to help.</p>
      </div>
      <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label htmlFor="q">Search</label>
          <input
            id="q"
            value={params.get('q') ?? ''}
            onChange={(event) => setParam('q', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={category ?? ''}
            onChange={(event) => setParam('category', event.target.value)}
          >
            <option value="">All</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-mode">Mode</label>
          <select id="filter-mode" value={mode ?? ''} onChange={(event) => setParam('mode', event.target.value)}>
            <option value="">All</option>
            {modes.map((item) => (
              <option key={item} value={item}>
                {CAMPAIGN_MODE_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={status} onChange={(event) => setParam('status', event.target.value)}>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {CAMPAIGN_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
      </form>

      {error ? (
        <EmptyState title="Campaigns could not be loaded">{error}</EmptyState>
      ) : rows === null ? (
        <p role="status">Loading campaigns…</p>
      ) : visible.length === 0 ? (
        <EmptyState title={filtered ? 'No campaigns match these filters' : 'No campaigns published yet'}>
          {filtered ? (
            <button type="button" className="btn btn-secondary" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
          ) : (
            'Published campaigns will appear here after an NGO publishes one.'
          )}
        </EmptyState>
      ) : (
        <div className="card-grid">
          {visible.map((row) => (
            <CampaignCard
              key={row.campaign.id}
              campaign={row.campaign}
              organizationName={row.organization.name}
              summary={row.summary}
            />
          ))}
        </div>
      )}
    </div>
  )
}
