import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Field } from '../../components/Field'
import { loadCampaignForEdit, loadOwnOrganization, saveCampaign } from '../../lib/ngoCampaigns'
import { validateCampaign, type CampaignDraft, type NeedDraft } from '../../lib/validate'
import {
  CAMPAIGN_MODE_LABELS,
  CATEGORY_LABELS,
  type CampaignCategory,
  type CampaignMode,
  type CampaignStatus,
} from '../../types'

const categories = Object.keys(CATEGORY_LABELS) as CampaignCategory[]
const modes = Object.keys(CAMPAIGN_MODE_LABELS) as CampaignMode[]

function blankNeed(): NeedDraft {
  return { item_name: '', description: '', quantity_needed: '', unit: '' }
}

function emptyDraft(): CampaignDraft {
  return {
    title: '',
    summary: '',
    description: '',
    category: 'education',
    campaign_mode: 'items',
    cover_image_url: '',
    money_goal: '',
    deadline: '',
    needs: [blankNeed()],
  }
}

function saveMessage(message: string) {
  if (/foreign key|restrict/i.test(message)) return 'An item that already has pledges cannot be removed.'
  if (/money_goal/i.test(message)) return 'Enter a money goal greater than zero for this campaign.'
  return message
}

export function CampaignForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft)
  const [status, setStatus] = useState<CampaignStatus>('draft')
  const [previousNeedIds, setPreviousNeedIds] = useState<string[]>([])
  const [organizationId, setOrganizationId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(Boolean(id))
  const [pending, setPending] = useState<'draft' | 'publish' | 'save' | null>(null)
  const intent = useRef<'draft' | 'publish' | 'save'>('save')

  useEffect(() => {
    let active = true
    loadOwnOrganization()
      .then(async (org) => {
        if (!active) return
        if (!org) {
          setFormError('This account is not linked to an organisation.')
          setLoading(false)
          return
        }
        setOrganizationId(org.id)
        if (!id) {
          setLoading(false)
          return
        }
        const row = await loadCampaignForEdit(id)
        if (!active) return
        if (!row) {
          setMissing(true)
          setLoading(false)
          return
        }
        setStatus(row.campaign.status)
        setPreviousNeedIds(row.needs.map((need) => need.id))
        setDraft({
          title: row.campaign.title,
          summary: row.campaign.summary,
          description: row.campaign.description,
          category: row.campaign.category,
          campaign_mode: row.campaign.campaign_mode,
          cover_image_url: row.campaign.cover_image_url ?? '',
          money_goal: row.campaign.money_goal == null ? '' : String(row.campaign.money_goal),
          deadline: row.campaign.deadline ?? '',
          needs:
            row.needs.length > 0
              ? row.needs.map((need) => ({
                  id: need.id,
                  item_name: need.item_name,
                  description: need.description ?? '',
                  quantity_needed: String(need.quantity_needed),
                  unit: need.unit,
                }))
              : [blankNeed()],
        })
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setFormError(reason instanceof Error ? reason.message : 'The campaign could not be loaded.')
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  function set<K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function setNeed(index: number, key: keyof NeedDraft, value: string) {
    setDraft((current) => ({
      ...current,
      needs: current.needs.map((need, needIndex) => (needIndex === index ? { ...need, [key]: value } : need)),
    }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const chosen = intent.current
    const publishing = chosen === 'publish'
    const nextErrors = validateCampaign(draft, publishing)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0 || !organizationId) return
    const nextStatus: CampaignStatus = publishing ? 'active' : chosen === 'draft' ? 'draft' : status
    setPending(chosen)
    try {
      const savedId = await saveCampaign({
        organizationId,
        campaignId: id,
        draft,
        status: nextStatus,
        previousNeedIds,
      })
      if (nextStatus === 'active') {
        navigate(`/campaigns/${savedId}`)
        return
      }
      const row = await loadCampaignForEdit(savedId)
      if (row) {
        setStatus(row.campaign.status)
        setPreviousNeedIds(row.needs.map((need) => need.id))
        set(
          'needs',
          row.needs.map((need) => ({
            id: need.id,
            item_name: need.item_name,
            description: need.description ?? '',
            quantity_needed: String(need.quantity_needed),
            unit: need.unit,
          })),
        )
      }
      if (!id) navigate(`/ngo/campaigns/${savedId}/edit`, { replace: true })
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'The campaign could not be saved.'
      setFormError(saveMessage(message))
    } finally {
      setPending(null)
    }
  }

  if (missing) {
    return (
      <EmptyState title="Campaign not found">This campaign is not part of your organisation.</EmptyState>
    )
  }
  if (loading) return <p role="status">Loading campaign…</p>

  const showMoney = draft.campaign_mode !== 'items'
  const showItems = draft.campaign_mode !== 'money'
  const draftable = !id || status === 'draft'

  return (
    <form className="stack" onSubmit={onSubmit}>
      <h1>{id ? 'Edit campaign' : 'New campaign'}</h1>
      <p className="form-note">Save a draft to keep it private. Publish when visitors should be able to pledge.</p>
      <Field label="Title" name="title" value={draft.title} error={errors.title} onChange={(event) => set('title', event.target.value)} />
      <Field label="Summary" name="summary" value={draft.summary} error={errors.summary} onChange={(event) => set('summary', event.target.value)} />
      <div className="field">
        <label htmlFor="description">Story</label>
        <textarea id="description" rows={6} value={draft.description} onChange={(event) => set('description', event.target.value)} />
        {errors.description ? <p className="field-error">{errors.description}</p> : null}
      </div>
      <div className="filters">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={draft.category} onChange={(event) => set('category', event.target.value as CampaignCategory)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="campaign_mode">What can people pledge?</label>
          <select id="campaign_mode" value={draft.campaign_mode} onChange={(event) => set('campaign_mode', event.target.value as CampaignMode)}>
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {CAMPAIGN_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {showMoney ? (
        <Field
          label="Money goal (INR)"
          name="money_goal"
          inputMode="decimal"
          value={draft.money_goal}
          error={errors.money_goal}
          onChange={(event) => set('money_goal', event.target.value)}
        />
      ) : null}
      <Field
        label="Cover image address (optional)"
        name="cover_image_url"
        value={draft.cover_image_url}
        error={errors.cover_image_url}
        onChange={(event) => set('cover_image_url', event.target.value)}
      />
      <Field label="Deadline (optional)" name="deadline" type="date" value={draft.deadline} error={errors.deadline} onChange={(event) => set('deadline', event.target.value)} />
      {showItems ? (
        <section className="stack">
          <h2>Items needed</h2>
          {errors.needs ? <p className="field-error">{errors.needs}</p> : null}
          {draft.needs.map((need, index) => (
            <div key={need.id ?? index} className="panel stack">
              <Field
                label="Item"
                name={`need-${index}-item`}
                value={need.item_name}
                error={errors[`need-${index}-item_name`]}
                onChange={(event) => setNeed(index, 'item_name', event.target.value)}
              />
              <div className="filters">
                <Field
                  label="Quantity"
                  name={`need-${index}-qty`}
                  inputMode="numeric"
                  value={need.quantity_needed}
                  error={errors[`need-${index}-quantity_needed`]}
                  onChange={(event) => setNeed(index, 'quantity_needed', event.target.value)}
                />
                <Field
                  label="Unit"
                  name={`need-${index}-unit`}
                  placeholder="pieces"
                  value={need.unit}
                  error={errors[`need-${index}-unit`]}
                  onChange={(event) => setNeed(index, 'unit', event.target.value)}
                />
              </div>
              <Field
                label="Note (optional)"
                name={`need-${index}-note`}
                value={need.description}
                error={errors[`need-${index}-description`]}
                onChange={(event) => setNeed(index, 'description', event.target.value)}
              />
              {draft.needs.length > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => set('needs', draft.needs.filter((_, needIndex) => needIndex !== index))}
                >
                  Remove item
                </Button>
              ) : null}
            </div>
          ))}
          <Button variant="secondary" onClick={() => set('needs', [...draft.needs, blankNeed()])}>
            Add item
          </Button>
        </section>
      ) : null}
      {formError ? (
        <p className="field-error" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="ngo-actions">
        {draftable ? (
          <Button type="submit" variant="secondary" disabled={pending !== null} onClick={() => { intent.current = 'draft' }}>
            {pending === 'draft' ? 'Saving…' : 'Save draft'}
          </Button>
        ) : (
          <Button type="submit" variant="secondary" disabled={pending !== null} onClick={() => { intent.current = 'save' }}>
            {pending === 'save' ? 'Saving…' : 'Save changes'}
          </Button>
        )}
        <Button type="submit" disabled={pending !== null} onClick={() => { intent.current = 'publish' }}>
          {pending === 'publish' ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
