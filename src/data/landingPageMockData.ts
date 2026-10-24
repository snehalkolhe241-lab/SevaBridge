import type { CampaignCategory } from '../types'

/** Illustrative stock photographs. They are not records of SevaBridge campaigns. */
export const landingImages = {
  hero: '/images/hero.jpg',
  education: '/images/cause-education.jpg',
  essentials: '/images/cause-essentials.jpg',
  healthcare: '/images/cause-healthcare.jpg',
  community: '/images/cause-community.jpg',
  supplies: '/images/supplies.jpg',
  library: '/images/library.jpg',
  meals: '/images/meals.jpg',
  dal: '/images/dal.jpg',
  rice: '/images/rice.jpg',
  fallback: '/fallback-cover.svg',
}

const coverPool: Record<CampaignCategory, string[]> = {
  education: [landingImages.supplies, landingImages.education, landingImages.library],
  essentials: [landingImages.essentials, landingImages.meals, landingImages.rice],
  healthcare: [landingImages.healthcare],
  community: [landingImages.community, landingImages.library],
}

export function fallbackCover(category: CampaignCategory, index: number) {
  const pool = coverPool[category]
  return pool[index % pool.length]
}

export const causes: { category: CampaignCategory; image: string; text: string }[] = [
  { category: 'education', image: landingImages.education, text: 'Notebooks, pencils and study materials.' },
  { category: 'essentials', image: landingImages.essentials, text: 'Rice, dal and kitchen staples.' },
  { category: 'healthcare', image: landingImages.healthcare, text: 'Supplies for a community health day.' },
  { category: 'community', image: landingImages.community, text: 'Shared rooms and local repairs.' },
]

export const sampleOrganisations = [
  { name: 'Pune Community Learning Foundation', note: 'Community organisation in Pune' },
  { name: 'Kothrud Evening Centre', note: 'Sample education group' },
  { name: 'Hadapsar Weekly Kitchen', note: 'Sample community kitchen' },
  { name: 'Nagpur After-school Class', note: 'Sample learning group' },
]

export type SampleCampaign = {
  title: string
  summary: string
  category: string
  mode: string
  ask: string
  image: string
}

/** Shown only when live campaigns cannot be loaded. These are not open listings. */
export const sampleCampaigns: SampleCampaign[] = [
  {
    title: 'Learning supplies for an evening centre in Pune',
    summary: 'A stand-in card for notebooks and pencils. It does not open a live campaign.',
    category: 'Education',
    mode: 'Items',
    ask: 'Stand-in ask: notebooks and pencils',
    image: landingImages.education,
  },
  {
    title: 'A week of meals for a community kitchen',
    summary: 'A stand-in card for a food goal. No amount on this card has been pledged or received.',
    category: 'Food & Essentials',
    mode: 'Money',
    ask: 'Stand-in ask: a money goal for rice and dal',
    image: landingImages.meals,
  },
  {
    title: 'Supplies for a community health day',
    summary: 'A sample card for a one-day clinic. It is not a record of a real health camp.',
    category: 'Healthcare',
    mode: 'Items',
    ask: 'Sample ask: basic clinic supplies',
    image: landingImages.healthcare,
  },
  {
    title: 'Books for a neighbourhood reading room',
    summary: 'A sample card for a shared reading space. It is not a partner organisation.',
    category: 'Community Development',
    mode: 'Items and money',
    ask: 'Sample ask: books and a small repair fund',
    image: landingImages.library,
  },
  {
    title: 'Groceries for families nearby',
    summary: 'A sample card for staple food. Nothing on this card is a confirmed donation.',
    category: 'Food & Essentials',
    mode: 'Items',
    ask: 'Sample ask: rice, oil, and pulses',
    image: landingImages.essentials,
  },
]

export const steps = [
  {
    title: 'Discover a community campaign',
    text: 'Read what an organisation is asking for, in items, money, or both, and who will receive it.',
  },
  {
    title: 'Pledge money or essential items',
    text: 'Leave your name and a way to reach you. The pledge is a promise, not a payment.',
  },
  {
    title: 'Coordinate the offline handover',
    text: 'The organisation contacts you and agrees a place and time. Nothing is shipped through this site.',
  },
]

export const trustPoints = [
  {
    title: 'The ask is written down',
    text: 'Each campaign states the items or the money goal, who published it, and what the support is for.',
  },
  {
    title: 'Pledged and received stay separate',
    text: 'A pledge is an intention. Received is what the organisation later confirms after the handover.',
  },
  {
    title: 'No money moves on this site',
    text: 'SevaBridge does not take payment, hold funds, or show a transfer as complete.',
  },
  {
    title: 'Handover stays with the organisation',
    text: 'Goods and money are arranged offline. The public page does not show donor contact details.',
  },
]

export const faqs: [string, string][] = [
  ['Do I need an account to browse campaigns?', 'No. The home page and the campaign directory are public.'],
  [
    'Do I need an account to make a pledge?',
    'No. Leave your name and an email or phone number so the organisation can arrange the handover.',
  ],
  [
    'Does SevaBridge process online payments?',
    'No. A money pledge records an amount you intend to give. The organisation collects it offline.',
  ],
  [
    'How does offline item handover work?',
    'The organisation contacts you and you agree a place and time. Nothing is shipped through this site.',
  ],
  [
    'Does a pledge mean that the donation has been received?',
    'No. Pledged is a promise. Received is what the organisation later confirms.',
  ],
  [
    'How can an NGO manage its campaigns?',
    'An organisation signs in with an account that was created for it. There is no public registration.',
  ],
]
