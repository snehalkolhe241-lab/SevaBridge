import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { CATEGORY_LABELS, type CampaignCategory } from '../../types'

const categories = Object.keys(CATEGORY_LABELS) as CampaignCategory[]

export function LandingPage() {
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
        <img src="/fallback-cover.svg" alt="Placeholder for a campaign photograph" />
      </section>

      <section className="stack">
        <h2>Featured campaigns</h2>
        <EmptyState title="No campaigns published yet">
          Active campaigns will show here after an NGO publishes one.
        </EmptyState>
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

      <section>
        <h2>Latest updates</h2>
        <EmptyState title="No updates yet">
          Published campaign updates will be listed here.
        </EmptyState>
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
