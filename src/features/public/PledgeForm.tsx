import { useState, type FormEvent } from 'react'
import { insertPledge } from '../../lib/publicCampaigns'
import { validatePledge, type PledgeDraft } from '../../lib/validate'
import type { Campaign, CampaignItemNeed, CommitmentType } from '../../types'
import { Button } from '../../components/Button'
import { Field } from '../../components/Field'

const empty = (type: CommitmentType): PledgeDraft => ({
  commitmentType: type,
  donorName: '',
  donorEmail: '',
  donorPhone: '',
  message: '',
  amount: '',
  quantity: '',
  itemNeedId: '',
  companyWebsite: '',
})

export function PledgeForm({
  campaign,
  needs,
  onRecorded,
}: {
  campaign: Campaign
  needs: CampaignItemNeed[]
  onRecorded: () => void
}) {
  const initialType: CommitmentType = campaign.campaign_mode === 'money' ? 'money' : 'item'
  const [draft, setDraft] = useState<PledgeDraft>(() => empty(initialType))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  function set<K extends keyof PledgeDraft>(key: K, value: PledgeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validatePledge(draft, campaign.campaign_mode, campaign.status)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return
    setPending(true)
    try {
      await insertPledge(campaign.id, draft)
      setDone(true)
      if (!draft.companyWebsite.trim()) onRecorded()
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setFormError(
        /row-level security|permission denied/i.test(message)
          ? 'This campaign is not accepting pledges.'
          : 'The pledge could not be saved. Check the contact details, amount, and quantity.',
      )
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div className="panel stack" role="status">
        <h2>Pledge recorded</h2>
        <p>
          Your pledge was recorded as pending. Nothing is paid or handed over on this site. The
          organisation may contact you to arrange the handover.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setDraft(empty(initialType))
            setDone(false)
          }}
        >
          Record another pledge
        </Button>
      </div>
    )
  }

  return (
    <form className="panel stack" onSubmit={onSubmit} noValidate>
      <div>
        <h2>Record a pledge</h2>
        <p className="form-note">
          This does not transfer money or items online. The organisation may contact you to arrange
          handover.
        </p>
      </div>

      {campaign.campaign_mode === 'both' ? (
        <fieldset className="choice">
          <legend>What are you pledging?</legend>
          <label>
            <input
              type="radio"
              name="commitmentType"
              checked={draft.commitmentType === 'item'}
              onChange={() => set('commitmentType', 'item')}
            />
            Items
          </label>
          <label>
            <input
              type="radio"
              name="commitmentType"
              checked={draft.commitmentType === 'money'}
              onChange={() => set('commitmentType', 'money')}
            />
            Money
          </label>
        </fieldset>
      ) : null}

      {draft.commitmentType === 'item' ? (
        <>
          <div className="field">
            <label htmlFor="itemNeedId">Item</label>
            <select
              id="itemNeedId"
              value={draft.itemNeedId}
              onChange={(event) => set('itemNeedId', event.target.value)}
              aria-invalid={errors.itemNeedId ? true : undefined}
              aria-describedby={errors.itemNeedId ? 'itemNeedId-error' : undefined}
            >
              <option value="">Choose an item</option>
              {needs.map((need) => (
                <option key={need.id} value={need.id}>
                  {need.item_name} ({need.unit})
                </option>
              ))}
            </select>
            {errors.itemNeedId ? (
              <p id="itemNeedId-error" className="field-error">
                {errors.itemNeedId}
              </p>
            ) : null}
          </div>
          <Field
            label="Quantity"
            name="quantity"
            inputMode="numeric"
            value={draft.quantity}
            error={errors.quantity}
            onChange={(event) => set('quantity', event.target.value)}
          />
        </>
      ) : (
        <Field
          label="Amount (INR)"
          name="amount"
          inputMode="decimal"
          value={draft.amount}
          error={errors.amount}
          onChange={(event) => set('amount', event.target.value)}
        />
      )}

      <Field
        label="Your name"
        name="donorName"
        autoComplete="name"
        value={draft.donorName}
        error={errors.donorName}
        onChange={(event) => set('donorName', event.target.value)}
      />
      <Field
        label="Email"
        name="donorEmail"
        type="email"
        autoComplete="email"
        value={draft.donorEmail}
        error={errors.donorEmail}
        onChange={(event) => set('donorEmail', event.target.value)}
      />
      <Field
        label="Phone"
        name="donorPhone"
        type="tel"
        autoComplete="tel"
        value={draft.donorPhone}
        error={errors.donorPhone}
        onChange={(event) => set('donorPhone', event.target.value)}
      />
      <div className="field">
        <label htmlFor="message">Message (optional)</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={draft.message}
          onChange={(event) => set('message', event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message ? (
          <p id="message-error" className="field-error">
            {errors.message}
          </p>
        ) : null}
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={draft.companyWebsite}
          onChange={(event) => set('companyWebsite', event.target.value)}
        />
      </div>
      {formError ? <p className="field-error">{formError}</p> : null}
      {errors.status ? <p className="field-error">{errors.status}</p> : null}
      <Button type="submit" disabled={pending || (draft.commitmentType === 'item' && needs.length === 0)}>
        {pending ? 'Recording…' : 'Record pledge'}
      </Button>
    </form>
  )
}
