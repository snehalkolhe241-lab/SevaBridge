import { getSupabase } from './supabase'
import type { PledgeDraft } from './validate'
import type {
  Campaign,
  CampaignCategory,
  CampaignItemNeed,
  CampaignMode,
  CampaignStatus,
  CampaignSummary,
  CampaignUpdate,
  ItemNeedProgress,
  PublicOrganization,
} from '../types'

const CAMPAIGN_COLUMNS =
  'id, organization_id, title, summary, description, category, campaign_mode, cover_image_url, money_goal, deadline, status, created_at, updated_at'
const ORG_COLUMNS = 'id, name, description, public_contact_email, logo_url, created_at'

export type ListedCampaign = {
  campaign: Campaign
  organization: PublicOrganization
  summary: CampaignSummary
}

export type DetailUpdate = Pick<CampaignUpdate, 'id' | 'campaign_id' | 'title' | 'body' | 'image_url' | 'published_at'>

export type PublicUpdate = {
  id: string
  campaign_id: string
  title: string
  published_at: string
  campaignTitle: string
}

type CampaignRow = Omit<Campaign, 'money_goal'> & {
  money_goal: number | string | null
  organization: PublicOrganization | PublicOrganization[] | null
}

function asNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function oneOrg(value: CampaignRow['organization']) {
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

function emptySummary(campaignId: string): CampaignSummary {
  return {
    campaign_id: campaignId,
    money_pledged: 0,
    money_received: 0,
    items_needed: 0,
    items_pledged: 0,
    items_received: 0,
  }
}

function mapCampaign(row: CampaignRow): Campaign {
  return { ...row, money_goal: row.money_goal == null ? null : asNumber(row.money_goal) }
}

async function summariesFor(ids: string[]) {
  const byId = new Map<string, CampaignSummary>()
  if (ids.length === 0) return byId
  const { data, error } = await getSupabase().rpc('campaign_public_summaries', { p_ids: ids })
  if (error) throw new Error(error.message)
  for (const row of data ?? []) {
    byId.set(row.campaign_id, {
      campaign_id: row.campaign_id,
      money_pledged: asNumber(row.money_pledged),
      money_received: asNumber(row.money_received),
      items_needed: asNumber(row.items_needed),
      items_pledged: asNumber(row.items_pledged),
      items_received: asNumber(row.items_received),
    })
  }
  return byId
}

export async function listPublicCampaigns(filter: {
  status: CampaignStatus
  category?: CampaignCategory
  mode?: CampaignMode
}) {
  let query = getSupabase()
    .from('campaigns')
    .select(`${CAMPAIGN_COLUMNS}, organization:organizations(${ORG_COLUMNS})`)
    .eq('status', filter.status)
    .order('created_at', { ascending: false })
  if (filter.category) query = query.eq('category', filter.category)
  if (filter.mode) query = query.eq('campaign_mode', filter.mode)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as CampaignRow[]
  const totals = await summariesFor(rows.map((row) => row.id))
  const listed: ListedCampaign[] = []
  for (const row of rows) {
    const organization = oneOrg(row.organization)
    if (!organization) continue
    listed.push({
      campaign: mapCampaign(row),
      organization,
      summary: totals.get(row.id) ?? emptySummary(row.id),
    })
  }
  return listed
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function listPublicUpdates(campaignIds: string[]) {
  const ids = campaignIds.filter((id) => UUID.test(id))
  if (ids.length === 0) return []
  const { data, error } = await getSupabase()
    .from('campaign_updates')
    .select('id, campaign_id, title, body, published_at')
    .in('campaign_id', ids)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(8)
  if (error) throw new Error(error.message)
  return (data ?? []) as { id: string; campaign_id: string; title: string; body: string; published_at: string }[]
}

export async function loadCampaignDetail(id: string) {
  if (!UUID.test(id)) return null
  const { data, error } = await getSupabase()
    .from('campaigns')
    .select(`${CAMPAIGN_COLUMNS}, organization:organizations(${ORG_COLUMNS})`)
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null

  const row = data as CampaignRow
  const organization = oneOrg(row.organization)
  if (!organization) return null

  const [needsResult, updatesResult, totals, progressResult] = await Promise.all([
    getSupabase()
      .from('campaign_item_needs')
      .select('id, campaign_id, item_name, description, quantity_needed, unit, created_at, updated_at')
      .eq('campaign_id', id)
      .order('created_at'),
    getSupabase()
      .from('campaign_updates')
      .select('id, campaign_id, title, body, image_url, published_at')
      .eq('campaign_id', id)
      .order('published_at', { ascending: false }),
    summariesFor([id]),
    getSupabase().rpc('item_need_public_progress', { p_campaign_id: id }),
  ])
  if (needsResult.error) throw new Error(needsResult.error.message)
  if (updatesResult.error) throw new Error(updatesResult.error.message)
  if (progressResult.error) throw new Error(progressResult.error.message)

  const progress: ItemNeedProgress[] = []
  for (const item of progressResult.data ?? []) {
    const row = item as { item_need_id: string; quantity_pledged: unknown; quantity_received: unknown }
    progress.push({
      item_need_id: row.item_need_id,
      quantity_pledged: asNumber(row.quantity_pledged),
      quantity_received: asNumber(row.quantity_received),
    })
  }

  return {
    campaign: mapCampaign(row),
    organization,
    summary: totals.get(id) ?? emptySummary(id),
    needs: (needsResult.data ?? []) as CampaignItemNeed[],
    updates: (updatesResult.data ?? []) as DetailUpdate[],
    progress,
  }
}

export async function listRecentUpdates() {
  const { data, error } = await getSupabase()
    .from('campaign_updates')
    .select('id, campaign_id, title, published_at, campaign:campaigns(title)')
    .order('published_at', { ascending: false })
    .limit(5)
  if (error) throw new Error(error.message)

  const updates: PublicUpdate[] = []
  for (const row of data ?? []) {
    const campaign = Array.isArray(row.campaign) ? row.campaign[0] : row.campaign
    if (!campaign || !row.published_at) continue
    updates.push({
      id: row.id,
      campaign_id: row.campaign_id,
      title: row.title,
      published_at: row.published_at,
      campaignTitle: campaign.title,
    })
  }
  return updates
}

/** Insert does not ask for the new row back. Anon cannot read commitments. */
export async function insertPledge(campaignId: string, draft: PledgeDraft) {
  if (draft.companyWebsite.trim()) return

  const contact = {
    campaign_id: campaignId,
    donor_name: draft.donorName.trim(),
    donor_email: draft.donorEmail.trim() || null,
    donor_phone: draft.donorPhone.trim() || null,
    message: draft.message.trim() || null,
  }
  const { error } =
    draft.commitmentType === 'money'
      ? await getSupabase().from('commitments').insert({
          ...contact,
          commitment_type: 'money',
          amount: Number(draft.amount),
          item_need_id: null,
          quantity: null,
        })
      : await getSupabase().from('commitments').insert({
          ...contact,
          commitment_type: 'item',
          amount: null,
          item_need_id: draft.itemNeedId,
          quantity: Number(draft.quantity),
        })
  if (error) throw new Error(error.message)
}
