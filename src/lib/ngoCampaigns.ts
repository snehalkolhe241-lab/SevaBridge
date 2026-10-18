import { getSupabase } from './supabase'
import type { CampaignDraft, NeedDraft } from './validate'
import type {
  Campaign,
  CampaignItemNeed,
  CampaignStatus,
  CampaignSummary,
  PublicOrganization,
} from '../types'

const ORG_COLUMNS = 'id, name, description, public_contact_email, logo_url, created_at'
const CAMPAIGN_COLUMNS =
  'id, organization_id, title, summary, description, category, campaign_mode, cover_image_url, money_goal, deadline, status, created_at, updated_at'

export type OwnerMetrics = {
  activeCampaigns: number
  pendingCommitments: number
  moneyReceived: number
  itemsReceived: number
}

export type OwnerCampaign = {
  campaign: Campaign
  summary: CampaignSummary
}

type PledgeRow = {
  campaign_id: string
  commitment_type: 'item' | 'money'
  amount: number | string | null
  quantity: number | string | null
  status: string
}

function asNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function mapCampaign(row: Omit<Campaign, 'money_goal'> & { money_goal: number | string | null }): Campaign {
  return { ...row, money_goal: row.money_goal == null ? null : asNumber(row.money_goal) }
}

export async function loadOwnOrganization(): Promise<PublicOrganization | null> {
  const { data, error } = await getSupabase().from('organizations').select(ORG_COLUMNS)
  if (error) throw new Error(error.message)
  for (const org of data ?? []) {
    const { data: owns, error: ownsError } = await getSupabase().rpc('is_org_owner', { org_id: org.id })
    if (ownsError) throw new Error(ownsError.message)
    if (owns) return org as PublicOrganization
  }
  return null
}

export async function loadOwnerCampaigns(organizationId: string): Promise<{ campaigns: OwnerCampaign[]; pending: number }> {
  const { data, error } = await getSupabase()
    .from('campaigns')
    .select(CAMPAIGN_COLUMNS)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  const campaigns = (data ?? []).map((row) => mapCampaign(row))
  const ids = campaigns.map((campaign) => campaign.id)
  if (ids.length === 0) return { campaigns: [], pending: 0 }

  const [needsResult, pledgeResult] = await Promise.all([
    getSupabase().from('campaign_item_needs').select('campaign_id, quantity_needed').in('campaign_id', ids),
    getSupabase()
      .from('commitments')
      .select('campaign_id, commitment_type, amount, quantity, status')
      .in('campaign_id', ids),
  ])
  if (needsResult.error) throw new Error(needsResult.error.message)
  if (pledgeResult.error) throw new Error(pledgeResult.error.message)

  const needed = new Map<string, number>()
  for (const need of needsResult.data ?? []) {
    needed.set(need.campaign_id, (needed.get(need.campaign_id) ?? 0) + asNumber(need.quantity_needed))
  }

  const pledges = (pledgeResult.data ?? []) as PledgeRow[]
  return {
    campaigns: campaigns.map((campaign) => ({
      campaign,
      summary: summarize(campaign.id, needed.get(campaign.id) ?? 0, pledges),
    })),
    pending: pledges.filter((row) => row.status === 'pending').length,
  }
}

function summarize(campaignId: string, itemsNeeded: number, pledges: PledgeRow[]): CampaignSummary {
  const rows = pledges.filter((row) => row.campaign_id === campaignId && row.status !== 'cancelled')
  const received = rows.filter((row) => row.status === 'fulfilled')
  return {
    campaign_id: campaignId,
    money_pledged: rows.filter((row) => row.commitment_type === 'money').reduce((sum, row) => sum + asNumber(row.amount), 0),
    money_received: received.filter((row) => row.commitment_type === 'money').reduce((sum, row) => sum + asNumber(row.amount), 0),
    items_needed: itemsNeeded,
    items_pledged: rows.filter((row) => row.commitment_type === 'item').reduce((sum, row) => sum + asNumber(row.quantity), 0),
    items_received: received.filter((row) => row.commitment_type === 'item').reduce((sum, row) => sum + asNumber(row.quantity), 0),
  }
}

export function metricsFor(campaigns: OwnerCampaign[], pledgesPending: number): OwnerMetrics {
  return {
    activeCampaigns: campaigns.filter((row) => row.campaign.status === 'active').length,
    pendingCommitments: pledgesPending,
    moneyReceived: campaigns.reduce((sum, row) => sum + row.summary.money_received, 0),
    itemsReceived: campaigns.reduce((sum, row) => sum + row.summary.items_received, 0),
  }
}

export async function loadCampaignForEdit(id: string) {
  const { data, error } = await getSupabase().from('campaigns').select(CAMPAIGN_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const campaign = mapCampaign(data)
  const { data: needs, error: needsError } = await getSupabase()
    .from('campaign_item_needs')
    .select('id, campaign_id, item_name, description, quantity_needed, unit, created_at, updated_at')
    .eq('campaign_id', id)
    .order('created_at')
  if (needsError) throw new Error(needsError.message)
  return { campaign, needs: (needs ?? []) as CampaignItemNeed[] }
}

function campaignFields(draft: CampaignDraft, status: CampaignStatus) {
  return {
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    description: draft.description.trim(),
    category: draft.category,
    campaign_mode: draft.campaign_mode,
    cover_image_url: draft.cover_image_url.trim() || null,
    money_goal: draft.campaign_mode === 'items' ? null : Number(draft.money_goal),
    deadline: draft.deadline || null,
    status,
  }
}

function needRow(campaignId: string, need: NeedDraft) {
  return {
    campaign_id: campaignId,
    item_name: need.item_name.trim(),
    description: need.description.trim() || null,
    quantity_needed: Number(need.quantity_needed),
    unit: need.unit.trim(),
  }
}

export async function saveCampaign(input: {
  organizationId: string
  campaignId?: string
  draft: CampaignDraft
  status: CampaignStatus
  previousNeedIds: string[]
}) {
  const fields = campaignFields(input.draft, input.status)
  let campaignId = input.campaignId
  if (!campaignId) {
    const { data, error } = await getSupabase()
      .from('campaigns')
      .insert({ ...fields, organization_id: input.organizationId })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    if (typeof data.id !== 'string') throw new Error('The campaign could not be saved.')
    campaignId = data.id
  } else {
    const { error } = await getSupabase().from('campaigns').update(fields).eq('id', campaignId)
    if (error) throw new Error(error.message)
  }

  if (!campaignId) throw new Error('The campaign could not be saved.')
  const savedId = campaignId
  const kept = input.draft.needs.filter((need) => need.item_name.trim() || need.id)
  const keptIds = new Set(kept.map((need) => need.id).filter((id): id is string => Boolean(id)))
  for (const id of input.previousNeedIds) {
    if (keptIds.has(id)) continue
    const { error } = await getSupabase().from('campaign_item_needs').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
  for (const need of kept) {
    if (need.id) {
      const { error } = await getSupabase().from('campaign_item_needs').update(needRow(savedId, need)).eq('id', need.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await getSupabase().from('campaign_item_needs').insert(needRow(savedId, need))
      if (error) throw new Error(error.message)
    }
  }
  return savedId
}

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  const { error } = await getSupabase().from('campaigns').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}
