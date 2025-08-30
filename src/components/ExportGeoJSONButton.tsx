'use client'

import { useState, useEffect } from 'react'
import { Layer } from '@/lib/search'

interface ExportGeoJSONButtonProps {
  layers: Layer[]
  viewRef: any
  className?: string
}

export default function ExportGeoJSONButton({ layers, viewRef, className = '' }: ExportGeoJSONButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [mapTitle, setMapTitle] = useState('')
  const [mapSummary, setMapSummary] = useState('')
  const [mapTags, setMapTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Auto-populate fields when dialog opens or layers change
  useEffect(() => {
    if (showDialog && layers.length > 0) {
      // Auto-populate title if not already set
      if (!mapTitle) {
        const primaryLayer = layers[0].name
        const additionalCount = layers.length > 1 ? ` and ${layers.length - 1} more` : ''
        setMapTitle(primaryLayer + additionalCount)
      }

      // Auto-populate summary if not already set
      if (!mapSummary) {
        const layerNames = layers.slice(0, 3).map(l => l.name).join('; ')
        const moreText = layers.length > 3 ? `; and ${layers.length - 3} more layers` : ''
        const agencies = Array.from(new Set(layers.map(l => l.agency))).join(', ')
        setMapSummary(`This map contains HIFLD infrastructure data including: ${layerNames}${moreText}. Data sources: ${agencies}.`)
      }

      // Auto-populate tags if not already set
      if (mapTags.length === 0) {
        const autoTags = new Set<string>(['HIFLD', 'Infrastructure'])
        
        // Add agency names as tags
        layers.forEach(layer => {
          if (layer.agency && layer.agency !== 'Unknown') {
            // Special handling for common agencies
            if (layer.agency.includes('Environmental Protection Agency')) {
              autoTags.add('Environmental Protection Agency')
            } else if (layer.agency.includes('US Army Corps of Engineers')) {
              autoTags.add('US Army Corps of Engineers')
            } else {
              autoTags.add(layer.agency)
            }
          }
        })

        // Add keywords from layer names
        const keywords = ['Fire', 'Hospital', 'School', 'Emergency', 'Police', 'Water', 'Power', 'Airport', 'EMS', 'EPA', 'Environmental', 'Regions']
        layers.forEach(layer => {
          keywords.forEach(keyword => {
            if (layer.name.toLowerCase().includes(keyword.toLowerCase())) {
              autoTags.add(keyword)
            }
          })
        })

        // Convert to array and set tags
        setMapTags(Array.from(autoTags).slice(0, 10))
      }
    }
  }, [showDialog, layers, mapTitle, mapSummary, mapTags.length])

  const handleAddTag = () => {
    if (tagInput.trim() && !mapTags.includes(tagInput.trim())) {
      setMapTags([...mapTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setMapTags(mapTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleExport = async () => {
    if (!viewRef || layers.length === 0) {
      alert('No layers to export')
      return
    }

    try {
      // Get current map extent
      const extent = viewRef.extent ? {
        xmin: viewRef.extent.xmin,
        ymin: viewRef.extent.ymin,
        xmax: viewRef.extent.xmax,
        ymax: viewRef.extent.ymax,
        spatialReference: {
          wkid: viewRef.extent.spatialReference?.wkid || 4326
        }
      } : null

      // Create a simple GeoJSON structure with layer references
      // This format is better for ArcGIS Online as it doesn't require fetching all features
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: extent ? [[
                [extent.xmin, extent.ymin],
                [extent.xmax, extent.ymin],
                [extent.xmax, extent.ymax],
                [extent.xmin, extent.ymax],
                [extent.xmin, extent.ymin]
              ]] : [[
                [-180, -90],
                [180, -90],
                [180, 90],
                [-180, 90],
                [-180, -90]
              ]]
            },
            properties: {
              title: mapTitle,
              summary: mapSummary,
              tags: mapTags.join(', '),
              layerCount: layers.length,
              layers: layers.map(l => ({
                name: l.name,
                agency: l.agency,
                url: l.serviceUrl,
                status: l.status
              }))
            }
          }
        ],
        metadata: {
          title: mapTitle,
          description: mapSummary,
          tags: mapTags
        }
      }

      // Create blob and download
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0]
      a.download = `HIFLD_GeoJSON_${date}.json`
      
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      // Show success message
      alert(`GeoJSON exported successfully!\n\nTo import to ArcGIS Online:\n1. Go to your ArcGIS Online Content page\n2. Click "New item" → "Your device"\n3. Choose the downloaded ${a.download} file\n4. IMPORTANT: Select Type: "GeoJSON" (NOT Web Map)\n5. The title, summary and tags will auto-populate from the file\n\nThis is a GeoJSON file with proper structure.`)
      
      // Close dialog
      setShowDialog(false)
    } catch (error) {
      console.error('Failed to export GeoJSON:', error)
      alert('Failed to export GeoJSON.')
    }
  }

  if (layers.length === 0) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${className}`}
        title="Export as GeoJSON (select 'GeoJSON' type in ArcGIS)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export GeoJSON
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Export GeoJSON for ArcGIS Online</h3>
            
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">
                This will create a GeoJSON file with proper structure for ArcGIS Online
              </p>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                <li>Includes required &apos;type&apos; field set to &quot;FeatureCollection&quot;</li>
                <li>Creates a bounding box feature with layer references</li>
                <li>Adds metadata for title, summary, and tags</li>
                <li>Compatible with ArcGIS Online import</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mapTitle}
                  onChange={(e) => setMapTitle(e.target.value)}
                  placeholder="Enter a title for your map"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={mapSummary}
                  onChange={(e) => setMapSummary(e.target.value)}
                  placeholder="This map contains HIFLD infrastructure data including..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {mapSummary.length}/2048 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {mapTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-green-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tags..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">GeoJSON will include:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Proper GeoJSON structure with &apos;type&apos;: &quot;FeatureCollection&quot;</li>
                  <li>✓ Map extent as a bounding box</li>
                  <li>✓ Metadata with title, summary, and tags</li>
                  <li>✓ References to all {layers.length} selected layers</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExport}
                disabled={!mapTitle.trim() || !mapSummary.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  !mapTitle.trim() || !mapSummary.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Download GeoJSON
              </button>
              <button
                onClick={() => {
                  setShowDialog(false)
                  setMapTitle('')
                  setMapSummary('')
                  setMapTags([])
                  setTagInput('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}