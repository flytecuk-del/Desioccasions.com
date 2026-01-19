export const OCCASION_LABELS: Record<string, string> = {
  diwali: 'Diwali',
  eid: 'Eid',
  navratri: 'Navratri',
  ramadan: 'Ramadan / Iftar',
  vaisakhi: 'Vaisakhi / Gurpurab',
  paryushan: 'Paryushan',
  vesak: 'Vesak',
  wedding: 'Wedding',
  engagement: 'Engagement',
  mehndi: 'Mehndi Night',
  sangeet: 'Sangeet',
  housewarming: 'Housewarming',
  community: 'Community Dinner',
  bhajan: 'Bhajan / Kirtan',
  christmas: 'Christmas',
  newyear: 'New Year'
}

export const DIETARY_LABELS: Record<string, string> = {
  veg: 'Vegetarian',
  nonveg: 'Non-veg',
  halal: 'Halal',
  hindu: 'Hindu-style',
  jain: 'Jain',
  sattvic: 'Sattvic',
  vegan: 'Vegan',
  glutenfree: 'Gluten-free'
}

export function labelOccasion(key: string) {
  return OCCASION_LABELS[key] || key
}

export function labelDiet(key: string) {
  return DIETARY_LABELS[key] || key
}
