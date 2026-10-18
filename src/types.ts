export type CampaignCategory = 'education' | 'essentials' | 'healthcare' | 'community'
export type CampaignMode = 'items' | 'money' | 'both'
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived'
export type CommitmentType = 'item' | 'money'
export type CommitmentStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  education: 'Education',
  essentials: 'Food & Essentials',
  healthcare: 'Healthcare',
  community: 'Community Development',
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

export const COMMITMENT_STATUS_LABELS: Record<CommitmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  fulfilled: 'Received',
  cancelled: 'Cancelled',
}

export const CAMPAIGN_MODE_LABELS: Record<CampaignMode, string> = {
  items: 'Items',
  money: 'Money',
  both: 'Items and money',
}

/** Columns the browser may read. `owner_user_id` is not one of them. */
export type PublicOrganization = {
  id: string
  name: string
  description: string | null
  public_contact_email: string | null
  logo_url: string | null
  created_at: string
}

export type CampaignSummary = {
  campaign_id: string
  money_pledged: number
  money_received: number
  items_needed: number
  items_pledged: number
  items_received: number
}

export type ItemNeedProgress = {
  item_need_id: string
  quantity_pledged: number
  quantity_received: number
}

export type Organization = {
  id: string
  owner_user_id: string
  name: string
  description: string | null
  public_contact_email: string | null
  logo_url: string | null
  created_at: string
}

export type Campaign = {
  id: string
  organization_id: string
  title: string
  summary: string
  description: string
  category: CampaignCategory
  campaign_mode: CampaignMode
  cover_image_url: string | null
  money_goal: number | null
  deadline: string | null
  status: CampaignStatus
  created_at: string
  updated_at: string
}

export type CampaignItemNeed = {
  id: string
  campaign_id: string
  item_name: string
  description: string | null
  quantity_needed: number
  unit: string
  created_at: string
  updated_at: string
}

export type Commitment = {
  id: string
  campaign_id: string
  commitment_type: CommitmentType
  item_need_id: string | null
  donor_name: string
  donor_email: string | null
  donor_phone: string | null
  amount: number | null
  quantity: number | null
  message: string | null
  status: CommitmentStatus
  created_at: string
  updated_at: string
  fulfilled_at: string | null
}

export type CampaignUpdate = {
  id: string
  campaign_id: string
  title: string
  body: string
  image_url: string | null
  created_by: string
  created_at: string
  published_at: string | null
}
