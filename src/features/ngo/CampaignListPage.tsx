import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Modal } from '../../components/Modal'
import { presentCampaign } from '../../data/campaignCopy'
import { loadOwnOrganization, loadOwnerCampaigns, updateCampaignStatus } from '../../lib/ngoCampaigns'
import { CAMPAIGN_STATUS_LABELS, type Campaign, type CampaignStatus } from '../../types'

type Action = {
  campaign: Campaign
  status: CampaignStatus
  label: string
  title: string
  body: string
}

function actionsFor(campaign: Campaign): Omit<Action, 'campaign'>[] {
  if (campaign.status === 'draft') {
    return [
      { status: 'active', label: 'Publish', title: 'Publish this campaign?', body: 'It will show on the public campaigns page.' },
      { status: 'archived', label: 'Archive', title: 'Archive this campaign?', body: 'It stays off the public site.' },
    ]
  }
  if (campaign.status === 'active') {
    return [
      { status: 'draft', label: 'Unpublish', title: 'Unpublish this campaign?', body: 'It will leave the public site and return to draft.' },
      { status: 'completed', label: 'Complete', title: 'Mark this campaign complete?', body: 'The page stays visible. New pledges will not be accepted.' },
      { status: 'archived', label: 'Archive', title: 'Archive this campaign?', body: 'It will be hidden from the public site.' },
    ]
  }
  if (campaign.status === 'completed') {
    return [{ status: 'archived', label: 'Archive', title: 'Archive this campaign?', body: 'It will be hidden from the public site.' }]
  }
  return [{ status: 'draft', label: 'Move to draft', title: 'Move this campaign back to draft?', body: 'It stays off the public site until you publish it.' }]
}

export function CampaignListPage() {
  const [rows, setRows] = useState<Campaign[] | null>(null)
  const [error, setError] = useState('')
  const [action, setAction] = useState<Action | null>(null)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  function load() {
    return loadOwnOrganization().then(async (org) => {
      if (!org) {
        setRows([])
        return
      }
      const loaded = await loadOwnerCampaigns(org.id)
      setRows(loaded.campaigns.map((row) => row.campaign))
    })
  }

  useEffect(() => {
    let active = true
    load().catch((reason: unknown) => {
      if (!active) return
      setError(reason instanceof Error ? reason.message : 'Campaigns could not be loaded.')
    })
    return () => {
      active = false
    }
  }, [])

  async function confirm() {
    if (!action) return
    setPending(true)
    setActionError('')
    try {
      await updateCampaignStatus(action.campaign.id, action.status)
      await load()
      setNotice(
        `${presentCampaign(action.campaign).title} is now ${CAMPAIGN_STATUS_LABELS[action.status].toLowerCase()}.`,
      )
      setAction(null)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'The status could not be changed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="stack">
      <div className="page-heading">
        <h1>Campaigns</h1>
      </div>
      {notice ? <p role="status">{notice}</p> : null}
      {error ? (
        <EmptyState title="Campaigns could not be loaded">{error}</EmptyState>
      ) : rows === null ? (
        <p role="status">Loading campaigns…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="No campaigns yet">Draft, active, completed, and archived campaigns will be listed here.</EmptyState>
      ) : (
        <ul className="need-list">
          {rows.map((campaign) => {
            const shown = presentCampaign(campaign)
            return (
            <li key={campaign.id} className="panel stack">
              <div className="page-heading">
                <h2>
                  <Link to={`/ngo/campaigns/${campaign.id}`}>{shown.title}</Link>
                </h2>
                <Badge tone={campaign.status === 'active' ? 'success' : 'neutral'}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
              </div>
              <p className="muted">{shown.summary}</p>
              <div className="ngo-actions">
                <Link className="btn btn-secondary" to={`/ngo/campaigns/${campaign.id}`}>
                  Open
                </Link>
                <Link className="btn btn-secondary" to={`/ngo/campaigns/${campaign.id}/edit`}>
                  Edit
                </Link>
                {actionsFor(campaign).map((item) => (
                  <Button
                    key={item.status}
                    variant="ghost"
                    onClick={() => {
                      setActionError('')
                      setAction({ ...item, campaign })
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </li>
            )
          })}
        </ul>
      )}
      <Modal
        open={action !== null}
        title={action?.title ?? 'Confirm'}
        onClose={() => {
          if (!pending) setAction(null)
        }}
      >
        <p>{action?.body}</p>
        {actionError ? <p className="field-error">{actionError}</p> : null}
        <Button onClick={confirm} disabled={pending}>
          {pending ? 'Saving…' : action?.label}
        </Button>
      </Modal>
    </div>
  )
}
