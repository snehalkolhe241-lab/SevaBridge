import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { presentCampaign, presentOrgName } from '../../data/campaignCopy'
import {
  causes,
  fallbackCover,
  faqs,
  landingImages,
  sampleCampaigns,
  sampleOrganisations,
  steps,
  trustPoints,
  type SampleCampaign,
} from '../../data/landingPageMockData'
import { formatInr } from '../../lib/format'
import { listPublicCampaigns, type ListedCampaign } from '../../lib/publicCampaigns'
import { CAMPAIGN_MODE_LABELS, CATEGORY_LABELS, type Campaign, type CampaignSummary } from '../../types'

const FALLBACK = landingImages.fallback
const HERO_MS = 5500
const heroSlides = [
  {
    src: landingImages.hero,
    alt: 'Illustrative photograph of children drawing together. Not a SevaBridge campaign.',
  },
  {
    src: landingImages.rice,
    alt: 'Illustrative photograph of uncooked rice. Not a SevaBridge campaign.',
  },
  {
    src: landingImages.healthcare,
    alt: 'Illustrative photograph of a first-aid kit and stethoscope. Not a SevaBridge campaign.',
  },
  {
    src: landingImages.library,
    alt: 'Illustrative photograph of library shelves. Not a SevaBridge campaign.',
  },
]
const marqueeMessages = [
  'Small acts. Meaningful impact.',
  'Support community needs.',
  'Pledge essential items.',
  'Coordinate offline handovers.',
]

function stepSlide(index: number, delta: number, count: number) {
  return (index + delta + count) % count
}

function inr(value: number) {
  return formatInr(value).replace(/\.00$/, '')
}

function askLine(campaign: Campaign, summary: CampaignSummary) {
  const parts: string[] = []
  if (campaign.campaign_mode !== 'items') {
    parts.push(campaign.money_goal != null ? `Money goal ${inr(campaign.money_goal)}` : 'Money pledges accepted')
  }
  if (campaign.campaign_mode !== 'money') {
    parts.push(summary.items_needed > 0 ? `${summary.items_needed} items requested` : 'Items requested')
  }
  return parts.join(' · ')
}

function recordLine(campaign: Campaign, summary: CampaignSummary) {
  const parts: string[] = []
  if (campaign.campaign_mode !== 'items') {
    parts.push(`Pledged ${inr(summary.money_pledged)}. Received ${inr(summary.money_received)}`)
  }
  if (campaign.campaign_mode !== 'money') {
    parts.push(`Items pledged ${summary.items_pledged}. Received ${summary.items_received}`)
  }
  return parts.join('. ')
}

function initials(name: string) {
  return name
    .split(' ')
    .filter((part) => part.length > 2)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [current, setCurrent] = useState(src)
  useEffect(() => setCurrent(src), [src])
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK)
      }}
    />
  )
}

function CampaignShowcase({
  href,
  image,
  category,
  mode,
  title,
  summary,
  organisation,
  ask,
  record,
}: {
  href: string
  image: string
  category: string
  mode: string
  title: string
  summary: string
  organisation: string
  ask: string
  record: string | null
}) {
  return (
    <Link className="showcase" to={href} aria-label={`View campaign: ${title}`}>
      <Photo src={image} alt={`Illustrative photograph for ${title}`} />
      <div className="showcase-body">
        <p className="showcase-kicker">
          {category} · {mode}
        </p>
        <h3>{title}</h3>
        <p className="showcase-summary">{summary}</p>
        <p className="showcase-org">{organisation}</p>
        <p className="showcase-ask">{ask}</p>
        {record ? <p className="showcase-record">{record}</p> : null}
        <span className="showcase-action">View campaign</span>
      </div>
    </Link>
  )
}

function SampleGrid({ rows }: { rows: SampleCampaign[] }) {
  return (
    <div className="showcase-grid">
      {rows.map((row) => (
        <CampaignShowcase
          key={row.title}
          href="/campaigns"
          image={row.image}
          category={row.category}
          mode={row.mode}
          title={row.title}
          summary={row.summary}
          organisation="Sample — not a live listing"
          ask={row.ask}
          record={null}
        />
      ))}
    </div>
  )
}

export function LandingPage() {
  const [campaigns, setCampaigns] = useState<ListedCampaign[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listPublicCampaigns({ status: 'active' })
      .then((rows) => {
        if (active) setCampaigns(rows.slice(0, 6))
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Campaigns could not be loaded.')
        setCampaigns([])
      })
    return () => {
      active = false
    }
  }, [])

  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setSlide((current) => stepSlide(current, 1, heroSlides.length)), HERO_MS)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <div className="landing">
      <section
        className="landing-hero"
        aria-roledescription="carousel"
        aria-label="Community photographs"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
        }}
      >
        <div className="landing-hero-slides">
          {heroSlides.map((item, index) => (
            <Photo
              key={item.src}
              className={index === slide ? 'landing-hero-photo is-active' : 'landing-hero-photo'}
              src={item.src}
              alt={index === slide ? item.alt : ''}
            />
          ))}
        </div>
        <div className="wrap landing-hero-copy">
          <h1>
            Small acts of support.
            <br />
            A stronger community.
          </h1>
          <p>
            Discover community campaigns and pledge essential items or money to support local needs. SevaBridge
            helps organisations coordinate pledges and offline handovers.
          </p>
          <div className="landing-hero-actions">
            <Link className="btn btn-primary" to="/campaigns">
              Explore campaigns
            </Link>
            <a className="btn btn-secondary" href="#how-it-works">
              How it works
            </a>
          </div>
        </div>
        <div className="landing-hero-controls">
          <button type="button" aria-label="Previous slide" onClick={() => setSlide((current) => stepSlide(current, -1, heroSlides.length))}>
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <div className="landing-hero-dots">
            {heroSlides.map((item, index) => (
              <button
                key={item.src}
                type="button"
                aria-label={`Show slide ${index + 1} of ${heroSlides.length}`}
                aria-current={index === slide ? true : undefined}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>
          <button type="button" aria-label="Next slide" onClick={() => setSlide((current) => stepSlide(current, 1, heroSlides.length))}>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </section>

      <div className="landing-marquee" role="region" aria-label="SevaBridge messages">
        <p className="sr-only">{marqueeMessages.join(' ')}</p>
        <div className="landing-marquee-track" aria-hidden="true">
          {[...marqueeMessages, ...marqueeMessages].map((text, index) => (
            <span key={`${text}-${index}`}>{text}</span>
          ))}
        </div>
      </div>

      <section id="causes" className="landing-band">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Find a cause</h2>
              <p>Open the directory for the kinds of needs organisations publish here.</p>
            </div>
          </div>
          <div className="cause-grid">
            {causes.map((cause) => (
              <Link key={cause.category} className="cause-tile" to={`/campaigns?category=${cause.category}`}>
                <Photo src={cause.image} alt={`Illustrative photograph for ${CATEGORY_LABELS[cause.category]}`} />
                <span>
                  <strong>{CATEGORY_LABELS[cause.category]}</strong>
                  {cause.text}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-band landing-band-white" aria-labelledby="featured-heading">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2 id="featured-heading">Campaigns that need your support</h2>
              <p>
                Discover campaigns making a difference in local communities. A pledge is a promise to hand over
                items or money offline. It is not a payment, and it is not counted as received until the
                organisation confirms the handover.
              </p>
            </div>
            <Link className="section-link" to="/campaigns">
              View all campaigns
            </Link>
          </div>
          <p className="landing-note">Sample listings for demonstration. Organisations named here are fictional.</p>
          {campaigns === null ? (
            <p role="status">Loading campaigns…</p>
          ) : error ? (
            <>
              <p className="landing-note" role="alert">
                Live campaigns could not be loaded. The cards below are samples and open the campaign directory.
                {` ${error}`}
              </p>
              <SampleGrid rows={sampleCampaigns} />
            </>
          ) : campaigns.length === 0 ? (
            <>
              <p className="landing-note">
                No campaigns are published yet. The cards below are samples and open the campaign directory.
              </p>
              <SampleGrid rows={sampleCampaigns} />
            </>
          ) : (
            <div className="showcase-grid">
              {campaigns.map((row, index) => {
                const campaign = presentCampaign(row.campaign)
                return (
                  <CampaignShowcase
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    image={campaign.cover_image_url || fallbackCover(campaign.category, index)}
                    category={CATEGORY_LABELS[campaign.category]}
                    mode={CAMPAIGN_MODE_LABELS[campaign.campaign_mode]}
                    title={campaign.title}
                    summary={campaign.summary}
                    organisation={presentOrgName(row.organization.name)}
                    ask={askLine(campaign, row.summary)}
                    record={recordLine(campaign, row.summary)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="landing-band">
        <div className="wrap landing-process">
          <Photo
            className="landing-process-photo"
            src={landingImages.meals}
            alt="Illustrative photograph of a community meal being served. Not a SevaBridge campaign."
          />
          <div>
            <h2>How SevaBridge works</h2>
            <p className="landing-intro">
              SevaBridge records pledges. It does not process payments or collect goods online.
            </p>
            <ol className="landing-steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="landing-band landing-band-white" aria-labelledby="orgs-heading">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2 id="orgs-heading">Community organisations</h2>
              <p>
                These names are sample labels. They are not partner organisations, and this is not a directory of
                verified NGOs.
              </p>
            </div>
          </div>
          <ul className="org-grid">
            {sampleOrganisations.map((org) => (
              <li key={org.name}>
                <span className="org-mark" aria-hidden="true">
                  {initials(org.name)}
                </span>
                <div>
                  <h3>{org.name}</h3>
                  <p>{org.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="for-ngos" className="landing-ngo">
        <div className="wrap landing-ngo-grid">
          <div>
            <h2>Publish what your community needs</h2>
            <p>
              An organisation with an account can publish a campaign, see incoming pledges, and mark what was
              received after the handover. Accounts are created for each organisation. There is no public sign-up.
            </p>
            <Link className="btn btn-primary" to="/ngo/login">
              NGO sign in
            </Link>
          </div>
          <Photo
            src={landingImages.library}
            alt="Illustrative photograph of a neighbourhood library. Not a SevaBridge campaign."
          />
        </div>
      </section>

      <section className="landing-band" aria-labelledby="trust-heading">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2 id="trust-heading">Pledged is not received</h2>
              <p>
                The public page is there so a visitor can see the ask and, later, what the organisation confirms.
                It is not a scoreboard.
              </p>
            </div>
          </div>
          <ul className="trust-grid">
            {trustPoints.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-band landing-band-white" aria-labelledby="faq-heading">
        <div className="wrap landing-faq-wrap">
          <h2 id="faq-heading">Questions</h2>
          <div className="landing-faq">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
