const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')

// Read and parse the CSV
const csvPath = path.join(__dirname, '..', 'public', 'HIFLD_Open_Crosswalk_Geoplatform.csv')
const csvContent = fs.readFileSync(csvPath, 'utf8')

const { data } = Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true
})

// Categories for grouping
const CATEGORIES = {
  'Emergency Services': ['fire', 'ems', 'emergency', 'eoc', 'police', 'law enforcement', '911'],
  'Healthcare': ['hospital', 'medical', 'health', 'nursing', 'veterans', 'clinic'],
  'Education': ['school', 'college', 'university', 'education', 'campus'],
  'Energy': ['power', 'electric', 'energy', 'transmission', 'gas', 'oil', 'petroleum', 'pipeline', 'refinery', 'lng', 'fuel', 'hydrocarbon'],
  'Transportation': ['airport', 'port', 'rail', 'road', 'bridge', 'tunnel', 'transit'],
  'Communications': ['tower', 'antenna', 'cellular', 'broadcast', 'microwave', 'radio', 'telecommunications', 'paging', 'broadband'],
  'Government': ['federal', 'state', 'military', 'dod', 'coast guard', 'uscg', 'government'],
  'Critical Facilities': ['prison', 'detention', 'child care', 'mobile home'],
  'Maritime': ['maritime', 'marine', 'vessel', 'waterway', 'navigation', 'dgps'],
  'Utilities': ['water', 'sewer', 'waste', 'utility'],
  'Boundaries': ['border', 'boundary', 'zone', 'district', 'region', 'area', 'territory']
}

function categorizeLayer(layerName) {
  const lowerName = layerName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category
      }
    }
  }
  
  return 'Other'
}

// Process the data
const processedData = data.map((row, index) => {
  const layerName = row['Layer Name'] || ''
  const serviceUrl = row['Open REST Service'] || null
  const status = row['Status'] || 'Active'
  const agency = row['Agency'] || ''
  const requiresDUA = row['DUA Required'] === 'Yes'
  const requiresGII = row['GII Access Required'] === 'Yes'
  
  return {
    id: index + 1,
    name: layerName,
    category: categorizeLayer(layerName),
    serviceUrl: serviceUrl && serviceUrl.trim() !== '' ? serviceUrl.trim() : null,
    status: status,
    agency: agency,
    requiresDUA: requiresDUA,
    requiresGII: requiresGII,
    testStatus: 'untested',
    lastTested: null
  }
}).filter(layer => layer.name) // Filter out empty rows

// Group by category
const groupedData = {}
for (const layer of processedData) {
  if (!groupedData[layer.category]) {
    groupedData[layer.category] = []
  }
  groupedData[layer.category].push(layer)
}

// Sort categories and layers within each category
const sortedCategories = Object.keys(groupedData).sort()
const finalData = {}
for (const category of sortedCategories) {
  finalData[category] = groupedData[category].sort((a, b) => a.name.localeCompare(b.name))
}

// Statistics
const stats = {
  totalLayers: processedData.length,
  withServiceUrl: processedData.filter(l => l.serviceUrl).length,
  requiresDUA: processedData.filter(l => l.requiresDUA).length,
  requiresGII: processedData.filter(l => l.requiresGII).length,
  migrated: processedData.filter(l => l.status === 'Migrated').length,
  byCategory: {}
}

for (const [category, layers] of Object.entries(finalData)) {
  stats.byCategory[category] = layers.length
}

// Write processed data
const outputPath = path.join(__dirname, '..', 'public', 'processed-layers.json')
fs.writeFileSync(outputPath, JSON.stringify({
  layers: processedData,
  categorized: finalData,
  stats: stats,
  lastProcessed: new Date().toISOString()
}, null, 2))

console.log('Data processing complete!')
console.log('Statistics:', stats)
console.log(`Output written to: ${outputPath}`)