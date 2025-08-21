export const LAYER_CATEGORIES = {
  'Emergency Services': [
    'fire', 'ems', 'emergency', 'eoc', 'police', 'law enforcement', '911'
  ],
  'Healthcare': [
    'hospital', 'medical', 'health', 'nursing', 'veterans', 'clinic'
  ],
  'Education': [
    'school', 'college', 'university', 'education', 'campus'
  ],
  'Energy': [
    'power', 'electric', 'energy', 'transmission', 'gas', 'oil', 'petroleum', 
    'pipeline', 'refinery', 'lng', 'fuel', 'hydrocarbon'
  ],
  'Transportation': [
    'airport', 'port', 'rail', 'road', 'bridge', 'tunnel', 'transit'
  ],
  'Communications': [
    'tower', 'antenna', 'cellular', 'broadcast', 'microwave', 'radio', 
    'telecommunications', 'paging', 'broadband'
  ],
  'Government': [
    'federal', 'state', 'military', 'dod', 'coast guard', 'uscg', 'government'
  ],
  'Critical Facilities': [
    'prison', 'detention', 'child care', 'mobile home'
  ],
  'Maritime': [
    'maritime', 'marine', 'vessel', 'waterway', 'navigation', 'dgps'
  ],
  'Utilities': [
    'water', 'sewer', 'waste', 'utility'
  ],
  'Boundaries': [
    'border', 'boundary', 'zone', 'district', 'region', 'area', 'territory'
  ],
  'Other': []
}

export function categorizeLayer(layerName: string): string {
  const lowerName = layerName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(LAYER_CATEGORIES)) {
    if (category === 'Other') continue
    
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category
      }
    }
  }
  
  return 'Other'
}

export interface LayerStatus {
  name: string
  category: string
  serviceUrl: string | null
  status: 'working' | 'failed' | 'untested' | 'restricted'
  lastTested: Date | null
  errorMessage?: string
  agency?: string
  requiresDUA?: boolean
  requiresGII?: boolean
}