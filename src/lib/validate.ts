import type { CampaignMode, CampaignStatus, CommitmentType } from '../types'

export type PledgeDraft = {
  commitmentType: CommitmentType
  donorName: string
  donorEmail: string
  donorPhone: string
  message: string
  amount: string
  quantity: string
  itemNeedId: string
  companyWebsite: string
}

export function validatePledge(
  draft: PledgeDraft,
  mode: CampaignMode,
  status: CampaignStatus,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (status !== 'active') {
    errors.status = 'This campaign is not accepting pledges.'
  }
  if (draft.commitmentType === 'item' && mode === 'money') {
    errors.commitmentType = 'This campaign accepts money pledges.'
  }
  if (draft.commitmentType === 'money' && mode === 'items') {
    errors.commitmentType = 'This campaign accepts item pledges.'
  }

  const name = draft.donorName.trim()
  if (name.length < 1 || name.length > 120) {
    errors.donorName = 'Enter your name (up to 120 characters).'
  }

  const email = draft.donorEmail.trim()
  const phone = draft.donorPhone.trim()
  if (!email && !phone) {
    errors.donorEmail = 'Enter an email or a phone number.'
  }
  if (email && (email.length < 3 || email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.donorEmail = 'Enter a valid email.'
  }
  if (phone && (phone.length < 7 || phone.length > 20)) {
    errors.donorPhone = 'Enter a phone number between 7 and 20 characters.'
  }

  const message = draft.message.trim()
  if (message.length > 500) {
    errors.message = 'Keep the message under 500 characters.'
  }

  if (draft.commitmentType === 'money') {
    if (!/^\d+(\.\d{1,2})?$/.test(draft.amount.trim())) {
      errors.amount = 'Enter an amount in rupees, with up to 2 decimal places.'
    } else {
      const amount = Number(draft.amount)
      if (amount <= 0 || amount >= 1e10) {
        errors.amount = 'Enter an amount greater than zero.'
      }
    }
  }

  if (draft.commitmentType === 'item') {
    if (!draft.itemNeedId) errors.itemNeedId = 'Choose an item this campaign asked for.'
    if (!/^[1-9]\d*$/.test(draft.quantity.trim())) {
      errors.quantity = 'Enter a whole number greater than zero.'
    }
  }

  return errors
}

function selfCheck() {
  const base: PledgeDraft = {
    commitmentType: 'money',
    donorName: 'Ada',
    donorEmail: 'ada@example.com',
    donorPhone: '',
    message: '',
    amount: '100',
    quantity: '',
    itemNeedId: '',
    companyWebsite: '',
  }
  const moneyOk = validatePledge(base, 'money', 'active')
  const missingContact = validatePledge({ ...base, donorEmail: '' }, 'money', 'active')
  const itemOk = validatePledge(
    { ...base, commitmentType: 'item', amount: '', quantity: '2', itemNeedId: 'need' },
    'items',
    'active',
  )
  const closed = validatePledge(base, 'money', 'completed')
  if (
    Object.keys(moneyOk).length > 0 ||
    !missingContact.donorEmail ||
    Object.keys(itemOk).length > 0 ||
    !closed.status
  ) {
    throw new Error('Pledge validation self-check failed')
  }
}

selfCheck()
