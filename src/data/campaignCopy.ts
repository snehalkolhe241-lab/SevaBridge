/** Public wording for the prototype rows. Keys are the titles stored in Supabase today. */

export const prototypeOrgName = 'Pune Community Learning Foundation'
const storedOrgName = 'SevaBridge Demo Collective'
const previousOrgName = 'Setu Community Collective'

type Copy = {
  title: string
  summary: string
  description: string
  image: string
}

export const campaignCopy: Record<string, Copy> = {
  'Notebooks for the evening study centre': {
    title: 'Learning supplies for an evening centre in Pune',
    summary: 'The Kothrud evening centre needs 80 ruled notebooks and 150 pencils for children who study there.',
    description:
      'The evening centre in Kothrud, Pune, runs a free study hour on weekdays. It needs 80 ruled notebooks and 150 pencils. Items are collected in person.',
    image: '/images/cause-education.jpg',
  },
  'Demo: notebooks for an after-school class': {
    title: 'Notebooks for an after-school class in Nagpur',
    summary: 'An after-school class in Nagpur is asking for 40 notebooks and 100 pencils.',
    description:
      'An after-school class in Nagpur needs 40 notebooks and 100 pencils. Items are handed over in person.',
    image: '/images/supplies.jpg',
  },
  'Demo: water bottles for a workshop': {
    title: 'Water bottles for a Saturday class in Pune',
    summary: 'A Saturday class in Pune is asking for 12 reusable water bottles.',
    description:
      'A Saturday class in Pune meets in a community room and needs 12 reusable water bottles. Bottles are handed over in person.',
    image: '/images/bottle.jpg',
  },
  'Demo: rice purchase fund': {
    title: 'A week of meals for a community kitchen',
    summary: 'A kitchen in Pune is raising ₹25,000 for rice, dal and fuel for one week of meals.',
    description:
      'A community kitchen in Pune serves a weekday lunch. The goal is ₹25,000 for rice, dal, oil and cooking fuel for about a week. Money is handed over in person.',
    image: '/images/meals.jpg',
  },
  'Rice for the weekly community kitchen': {
    title: 'Rice and dal for the Hadapsar weekly kitchen',
    summary: 'The weekly kitchen in Hadapsar, Pune, has an ₹18,000 goal for rice, dal and oil.',
    description:
      'The weekly kitchen in Hadapsar, Pune, cooks one large meal each week. This campaign covers rice, dal and oil, with a goal of ₹18,000. Money is handed over in person.',
    image: '/images/dal.jpg',
  },
  'Demo draft: neighbourhood clinic day': {
    title: 'Essential supplies for a rural health camp',
    summary: 'A health day near Pune would ask for hygiene kits and basic supplies.',
    description:
      'A health day in a village near Pune would ask for hygiene kits and basic supplies. This campaign is still a draft.',
    image: '/images/cause-healthcare.jpg',
  },
  'Repair the neighbourhood reading room': {
    title: 'Restoring a neighbourhood reading room in Pune',
    summary: 'The reading room needs 8 tarpaulin sheets before the rains and ₹15,000 for repairs.',
    description:
      'The neighbourhood reading room is in Pune. The roof leaks, so the request is 8 tarpaulin sheets and ₹15,000 for patching and mats. Collection is arranged in person.',
    image: '/images/library.jpg',
  },
}

export const updateCopy: Record<string, { title: string; body: string }> = {
  'Demo update: campaign opened': {
    title: 'The after-school class list is open',
    body: 'The after-school class in Nagpur is open for notebook and pencil pledges. Handover is arranged in person.',
  },
  'Demo update: first notebooks received': {
    title: 'Two notebooks marked received',
    body: 'Two notebooks were marked received after the handover.',
  },
}

export function presentOrgName(name: string) {
  if (name === storedOrgName || name === previousOrgName) return prototypeOrgName
  return name
}

export function presentCampaign<T extends { title: string; summary: string; description: string; cover_image_url: string | null }>(
  campaign: T,
): T {
  const copy = campaignCopy[campaign.title]
  if (!copy) return campaign
  return {
    ...campaign,
    title: copy.title,
    summary: copy.summary,
    description: copy.description,
    cover_image_url: copy.image,
  }
}

export function presentUpdate<T extends { title: string; body: string }>(update: T): T {
  const copy = updateCopy[update.title]
  if (!copy) return update
  return { ...update, title: copy.title, body: copy.body }
}
