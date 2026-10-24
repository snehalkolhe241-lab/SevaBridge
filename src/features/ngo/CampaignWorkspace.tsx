import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Field } from '../../components/Field'
import { ProgressBar } from '../../components/ProgressBar'
import { presentCampaign, presentUpdate } from '../../data/campaignCopy'
import { formatDate, formatInr } from '../../lib/format'
import {
  loadWorkspace,
  publishCampaignUpdate,
  updateCommitmentStatus,
  type OwnerPledge,
  type OwnerUpdate,
} from '../../lib/ngoCampaigns'
import { validateUpdate } from '../../lib/validate'
import {
  CAMPAIGN_STATUS_LABELS,
  COMMITMENT_STATUS_LABELS,
  type CommitmentStatus,
} from '../../types'

type Workspace = NonNullable<Awaited<ReturnType<typeof loadWorkspace>>>
type Tab = 'overview' | 'commitments' | 'needs' | 'updates'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'commitments', label: 'Commitments' },
  { id: 'needs', label: 'Needs' },
  { id: 'updates', label: 'Updates' },
]

const pledgeStatuses: CommitmentStatus[] = ['pending', 'confirmed', 'fulfilled', 'cancelled']

export function CampaignWorkspace() {
  const { id = '' } = useParams()
  const [tab, setTab] = useState<Tab>('overview')
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    return loadWorkspace(id).then((row) => {
      setWorkspace(row)
      setMissing(!row)
    })
  }, [id])

  useEffect(() => {
    let active = true
    setWorkspace(null)
    setMissing(false)
    setError('')
    load().catch((reason: unknown) => {
      if (!active) return
      setError(reason instanceof Error ? reason.message : 'This campaign could not be loaded.')
    })
    return () => {
      active = false
    }
  }, [load])

  if (error) return <EmptyState title="This campaign could not be loaded">{error}</EmptyState>
  if (missing) return <EmptyState title="Campaign not found">This campaign is not part of your organisation.</EmptyState>
  if (!workspace) return <p role="status">Loading campaign…</p>

  const shown = {
    ...workspace,
    campaign: presentCampaign(workspace.campaign),
    updates: workspace.updates.map(presentUpdate),
  }

  return (
    <div className="stack">
      <div className="page-heading">
        <h1>{shown.campaign.title}</h1>
        <Link className="btn btn-secondary" to={`/ngo/campaigns/${id}/edit`}>
          Edit campaign
        </Link>
      </div>
      <div className="tabs" role="tablist" aria-label="Campaign sections">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className="btn btn-ghost"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? <Overview workspace={shown} /> : null}
      {tab === 'commitments' ? <Commitments workspace={workspace} onChanged={load} /> : null}
      {tab === 'needs' ? <Needs workspace={workspace} /> : null}
      {tab === 'updates' ? <Updates campaignId={id} updates={shown.updates} onPosted={load} /> : null}
    </div>
  )
}

function Overview({ workspace }: { workspace: Workspace }) {
  const { campaign, summary } = workspace
  const showMoney = campaign.campaign_mode !== 'items'
  const showItems = campaign.campaign_mode !== 'money'
  const publicPage = campaign.status === 'active' || campaign.status === 'completed'
  return (
    <section className="panel stack" role="tabpanel">
      <Badge tone={campaign.status === 'active' ? 'success' : 'neutral'}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
      <p>{campaign.summary}</p>
      {showMoney ? (
        <>
          <p>
            Pledged {formatInr(summary.money_pledged)}. Received {formatInr(summary.money_received)}.
            {campaign.money_goal && campaign.money_goal > 0
              ? ` Remaining to goal ${formatInr(Math.max(campaign.money_goal - summary.money_received, 0))}.`
              : ''}
          </p>
          {campaign.money_goal && campaign.money_goal > 0 ? (
            <ProgressBar
              label={`Received ${formatInr(summary.money_received)} of ${formatInr(campaign.money_goal)}`}
              value={(summary.money_received / campaign.money_goal) * 100}
            />
          ) : null}
        </>
      ) : null}
      {showItems ? (
        <p>
          Items pledged {summary.items_pledged}. Items received {summary.items_received} of {summary.items_needed}. Remaining
          to receive {Math.max(summary.items_needed - summary.items_received, 0)}.
        </p>
      ) : null}
      <p className="form-note">Received means the organisation confirmed the handover. Pledged is still only a promise.</p>
      {publicPage ? <Link to={`/campaigns/${campaign.id}`}>View public page</Link> : null}
    </section>
  )
}

function Commitments({ workspace, onChanged }: { workspace: Workspace; onChanged: () => Promise<void> }) {
  const [saving, setSaving] = useState('')
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)
  const names = new Map(workspace.needs.map((need) => [need.id, need.item_name]))

  async function setStatus(pledge: OwnerPledge, status: CommitmentStatus) {
    const key = `${pledge.id}:${status}`
    setSaving(key)
    setRowError(null)
    try {
      await updateCommitmentStatus(pledge.id, status)
      await onChanged()
    } catch (reason) {
      setRowError({
        id: pledge.id,
        message: reason instanceof Error ? reason.message : 'The pledge status could not be changed.',
      })
    } finally {
      setSaving('')
    }
  }

  if (workspace.pledges.length === 0) {
    return (
      <div role="tabpanel">
        <EmptyState title="No pledges yet">Pledges from the public page will show here.</EmptyState>
      </div>
    )
  }

  return (
    <ul className="need-list" role="tabpanel">
      {workspace.pledges.map((pledge) => (
        <li key={pledge.id} className="panel stack">
          <div className="page-heading">
            <h2>{pledge.donor_name}</h2>
            <Badge>{COMMITMENT_STATUS_LABELS[pledge.status]}</Badge>
          </div>
          <p>
            {pledge.commitment_type === 'money'
              ? `Money · ${formatInr(pledge.amount ?? 0)}`
              : `Item · ${names.get(pledge.item_need_id ?? '') ?? 'Item'} · ${pledge.quantity ?? 0}`}
            {' · '}
            {formatDate(pledge.created_at)}
          </p>
          <p>
            {pledge.donor_email || 'No email'}
            {pledge.donor_phone ? ` · ${pledge.donor_phone}` : ''}
          </p>
          <div className="ngo-actions">
            {pledgeStatuses.map((status) => (
              <Button
                key={status}
                variant={status === pledge.status ? 'secondary' : 'ghost'}
                disabled={saving.startsWith(`${pledge.id}:`) || status === pledge.status}
                onClick={() => setStatus(pledge, status)}
              >
                {saving === `${pledge.id}:${status}` ? 'Saving…' : COMMITMENT_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
          {rowError?.id === pledge.id ? <p className="field-error">{rowError.message}</p> : null}
        </li>
      ))}
    </ul>
  )
}

function Needs({ workspace }: { workspace: Workspace }) {
  if (workspace.needs.length === 0) {
    return (
      <div role="tabpanel">
        <EmptyState title="No items listed">Add item needs from the edit page.</EmptyState>
      </div>
    )
  }
  return (
    <ul className="need-list" role="tabpanel">
      {workspace.needs.map((need) => (
        <li key={need.id} className="panel stack">
          <h2>{need.item_name}</h2>
          <p>
            {need.quantity_needed} {need.unit}
          </p>
          {need.description ? <p className="muted">{need.description}</p> : null}
        </li>
      ))}
    </ul>
  )
}

function Updates({
  campaignId,
  updates,
  onPosted,
}: {
  campaignId: string
  updates: OwnerUpdate[]
  onPosted: () => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const draft = { title, body, image_url: imageUrl }
    const next = validateUpdate(draft)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return
    setPending(true)
    try {
      await publishCampaignUpdate(campaignId, draft)
      setTitle('')
      setBody('')
      setImageUrl('')
      await onPosted()
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'The update could not be posted.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="stack" role="tabpanel">
      <form className="panel stack" onSubmit={onSubmit}>
        <h2>Post an update</h2>
        <p className="form-note">This appears on the public campaign page after you save it.</p>
        <Field label="Title" name="update-title" value={title} error={errors.title} onChange={(event) => setTitle(event.target.value)} />
        <div className="field">
          <label htmlFor="update-body">Update</label>
          <textarea id="update-body" rows={4} value={body} onChange={(event) => setBody(event.target.value)} />
          {errors.body ? <p className="field-error">{errors.body}</p> : null}
        </div>
        <Field
          label="Image address (optional)"
          name="update-image"
          value={imageUrl}
          error={errors.image_url}
          onChange={(event) => setImageUrl(event.target.value)}
        />
        {formError ? <p className="field-error">{formError}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? 'Posting…' : 'Post update'}
        </Button>
      </form>
      {updates.length === 0 ? (
        <EmptyState title="No updates yet">Posted updates are visible to visitors.</EmptyState>
      ) : (
        <ul className="need-list">
          {updates.map((update) => (
            <li key={update.id} className="panel stack">
              <h2>{update.title}</h2>
              {update.published_at ? <p className="muted">{formatDate(update.published_at)}</p> : null}
              <p>{update.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
