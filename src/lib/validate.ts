import type { CampaignCategory, CampaignMode, CampaignStatus, CommitmentType } from '../types'

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

export type NeedDraft = {
  id?: string
  item_name: string
  description: string
  quantity_needed: string
  unit: string
}

export type CampaignDraft = {
  title: string
  summary: string
  description: string
  category: CampaignCategory
  campaign_mode: CampaignMode
  cover_image_url: string
  money_goal: string
  deadline: string
  needs: NeedDraft[]
}

function needIsBlank(need: NeedDraft) {
  return !need.id && !need.item_name.trim() && !need.description.trim() && !need.quantity_needed.trim() && !need.unit.trim()
}

export function validateCampaign(draft: CampaignDraft, publishing: boolean) {
  const errors: Record<string, string> = {}
  const title = draft.title.trim()
  const summary = draft.summary.trim()
  const description = draft.description.trim()
  if (title.length < 1 || title.length > 120) errors.title = 'Enter a title (up to 120 characters).'
  if (summary.length < 1 || summary.length > 160) errors.summary = 'Enter a summary (up to 160 characters).'
  if (description.length < 1 || description.length > 5000) errors.description = 'Enter the campaign story (up to 5000 characters).'
  if (draft.cover_image_url.trim().length > 500) errors.cover_image_url = 'The image address is too long.'
  if (draft.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(draft.deadline)) errors.deadline = 'Enter a valid date.'

  if (draft.campaign_mode === 'items') {
    // goal is cleared on save
  } else if (!/^\d+(\.\d{1,2})?$/.test(draft.money_goal.trim()) || Number(draft.money_goal) <= 0 || Number(draft.money_goal) >= 1e10) {
    errors.money_goal = 'Enter a goal in rupees, with up to 2 decimal places.'
  }

  const needs = draft.needs.filter((need) => !needIsBlank(need))
  if (publishing && draft.campaign_mode !== 'money' && needs.length === 0) {
    errors.needs = 'Add at least one item before publishing.'
  }
  draft.needs.forEach((need, index) => {
    if (needIsBlank(need)) return
    if (need.item_name.trim().length < 1 || need.item_name.trim().length > 120) {
      errors[`need-${index}-item_name`] = 'Enter the item name.'
    }
    if (!/^[1-9]\d*$/.test(need.quantity_needed.trim())) {
      errors[`need-${index}-quantity_needed`] = 'Enter a whole number greater than zero.'
    }
    if (need.unit.trim().length < 1 || need.unit.trim().length > 40) {
      errors[`need-${index}-unit`] = 'Enter a unit, such as pieces.'
    }
    if (need.description.trim().length > 500) errors[`need-${index}-description`] = 'Keep the item note under 500 characters.'
  })
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
  const campaignOk = validateCampaign(
    {
      title: 'Notebooks',
      summary: 'A short sample summary.',
      description: 'The longer story of the sample campaign.',
      category: 'education',
      campaign_mode: 'items',
      cover_image_url: '',
      money_goal: '',
      deadline: '',
      needs: [{ item_name: 'Notebooks', description: '', quantity_needed: '40', unit: 'pieces' }],
    },
    true,
  )
  const campaignBad = validateCampaign(
    {
      title: '',
      summary: '',
      description: '',
      category: 'education',
      campaign_mode: 'money',
      cover_image_url: '',
      money_goal: '',
      deadline: '',
      needs: [],
    },
    true,
  )
  if (Object.keys(campaignOk).length > 0 || !campaignBad.title || !campaignBad.money_goal) {
    throw new Error('Campaign validation self-check failed')
  }
}

selfCheck()
