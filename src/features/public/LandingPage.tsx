import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CampaignCard } from '../../components/CampaignCard'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../lib/format'
import { listPublicCampaigns, listRecentUpdates, type ListedCampaign, type PublicUpdate } from '../../lib/publicCampaigns'
import { CATEGORY_LABELS, type CampaignCategory } from '../../types'

const categories = Object.keys(CATEGORY_LABELS) as CampaignCategory[]

export function LandingPage() {
  const [campaigns, setCampaigns] = useState<ListedCampaign[] | null>(null)
  const [updates, setUpdates] = useState<PublicUpdate[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([listPublicCampaigns({ status: 'active' }), listRecentUpdates()])
      .then(([rows, notes]) => {
        if (!active) return
        setCampaigns(rows.slice(0, 3))
        setUpdates(notes)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Campaigns could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="wrap page stack">
      <section className="hero">
        <div>
          <h1>Make support matter beyond the promise.</h1>
          <p className="lede">
            Discover what a community organisation needs, pledge items or money, and follow the update
            after the handover. SevaBridge does not collect money online.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/campaigns">
              Explore campaigns
            </Link>
            <Link className="btn btn-secondary" to="/ngo/login">
              For NGOs
            </Link>
          </div>
        </div>
        <img src="/fallback-cover.svg" alt="" />
      </section>

      <section className="stack">
        <h2>Featured campaigns</h2>
        {error ? (
          <EmptyState title="Campaigns could not be loaded">{error}</EmptyState>
        ) : campaigns === null ? (
          <p role="status">Loading campaigns…</p>
        ) : campaigns.length === 0 ? (
          <EmptyState title="No campaigns published yet">
            Active campaigns will show here after an NGO publishes one.
          </EmptyState>
        ) : (
          <div className="card-grid">
            {campaigns.map((row) => (
              <CampaignCard
                key={row.campaign.id}
                campaign={row.campaign}
                organizationName={row.organization.name}
                summary={row.summary}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Browse by need</h2>
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category}>
              <Link to={`/campaigns?category=${category}`}>{CATEGORY_LABELS[category]}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack">
        <h2>Latest updates</h2>
        {updates === null ? (
          <p role="status">Loading updates…</p>
        ) : updates.length === 0 ? (
          <EmptyState title="No updates yet">Published campaign updates will be listed here.</EmptyState>
        ) : (
          <ul className="update-list">
            {updates.map((update) => (
              <li key={update.id}>
                <Link to={`/campaigns/${update.campaign_id}`}>{update.title}</Link>
                <p className="muted">
                  {update.campaignTitle} · {formatDate(update.published_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="how-it-works">
        <h2>How it works</h2>
        <ol className="steps">
          <li>
            <h3>NGOs publish needs</h3>
            <p>An organisation describes the campaign and whether it needs items, money, or both.</p>
          </li>
          <li>
            <h3>People pledge support</h3>
            <p>A visitor records an item quantity or an amount. Nothing is paid through this site.</p>
          </li>
          <li>
            <h3>NGOs report what arrived</h3>
            <p>The organisation marks what was received offline and posts a progress update.</p>
          </li>
        </ol>
      </section>
    </div>
  )
}
