'use client'

import { useState, useEffect } from 'react'
import { Layer } from '@/lib/search'

interface ExportMapButtonProps {
  layers: Layer[]
  viewRef: any
  className?: string
}

export default function ExportMapButton({ layers, viewRef, className = '' }: ExportMapButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [mapTitle, setMapTitle] = useState('')
  const [mapDescription, setMapDescription] = useState('')
  const [mapTags, setMapTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Auto-populate fields when dialog opens or layers change
  useEffect(() => {
    if (showDialog && layers.length > 0) {
      // Auto-populate title if not already set
      if (!mapTitle) {
        const primaryLayer = layers[0].name
        const additionalCount = layers.length > 1 ? ` + ${layers.length - 1} more` : ''
        setMapTitle(`HIFLD Map - ${primaryLayer}${additionalCount}`)
      }

      // Auto-populate description if not already set
      if (!mapDescription) {
        const layerNames = layers.slice(0, 3).map(l => l.name).join(', ')
        const moreText = layers.length > 3 ? `, and ${layers.length - 3} more layers` : ''
        setMapDescription(`This map contains HIFLD infrastructure data including - ${layerNames}${moreText}. Data sources are ${Array.from(new Set(layers.map(l => l.agency))).join(', ')}.`)
      }

      // Auto-populate tags if not already set
      if (mapTags.length === 0) {
        const autoTags = new Set<string>(['HIFLD', 'Infrastructure'])
        
        // Add agency names as tags
        layers.forEach(layer => {
          if (layer.agency && layer.agency !== 'Unknown') {
            autoTags.add(layer.agency)
          }
        })

        // Add keywords from layer names
        const keywords = ['Fire', 'Hospital', 'School', 'Emergency', 'Police', 'Water', 'Power', 'Airport', 'EMS']
        layers.forEach(layer => {
          keywords.forEach(keyword => {
            if (layer.name.toLowerCase().includes(keyword.toLowerCase())) {
              autoTags.add(keyword)
            }
          })
        })

        // Limit to 10 most relevant tags
        const tagArray = Array.from(autoTags)
        setMapTags(tagArray.slice(0, 10))
      }
    }
  }, [showDialog, layers, mapTitle, mapDescription, mapTags.length])

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
      // Get current map extent and center
      let initialExtent = null
      let center = null
      
      if (viewRef.extent) {
        const extent = viewRef.extent
        
        // Convert Web Mercator to geographic coordinates if needed
        if (extent.spatialReference?.wkid === 102100 || extent.spatialReference?.wkid === 3857) {
          // Simple conversion from Web Mercator to WGS84
          const xmin = (extent.xmin / 20037508.34) * 180
          const ymin = (Math.atan(Math.exp((extent.ymin / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90
          const xmax = (extent.xmax / 20037508.34) * 180
          const ymax = (Math.atan(Math.exp((extent.ymax / 20037508.34) * Math.PI)) * 360 / Math.PI) - 90
          
          initialExtent = { xmin, ymin, xmax, ymax }
          center = [(xmin + xmax) / 2, (ymin + ymax) / 2]
        } else {
          initialExtent = {
            xmin: extent.xmin,
            ymin: extent.ymin,
            xmax: extent.xmax,
            ymax: extent.ymax
          }
          center = viewRef.center ? [viewRef.center.longitude, viewRef.center.latitude] : 
                   [(extent.xmin + extent.xmax) / 2, (extent.ymin + extent.ymax) / 2]
        }
      }

      // Create ArcGIS Pro JSON format (different from Web Map JSON)
      const projectJson = {
        title: mapTitle,
        type: "Web Map",
        typeKeywords: [
          "ArcGIS Online",
          "Explorer Web Map",
          "Map",
          "Online Map",
          "Web Map"
        ],
        description: mapDescription,
        tags: mapTags,
        snippet: mapDescription.substring(0, 250),
        thumbnail: "thumbnail/ago_downloaded.png",
        documentation: null,
        extent: initialExtent ? [
          [initialExtent.xmin, initialExtent.ymin],
          [initialExtent.xmax, initialExtent.ymax]
        ] : [[-180, -90], [180, 90]],
        spatialReference: {
          wkid: 4326,
          latestWkid: 4326
        },
        accessInformation: null,
        licenseInfo: null,
        culture: "en-us",
        properties: null,
        url: null,
        proxyFilter: null,
        access: "public",
        size: -1,
        appCategories: [],
        industries: [],
        languages: [],
        largeThumbnail: null,
        banner: null,
        screenshots: [],
        listed: false,
        ownerFolder: null,
        protected: false,
        commentsEnabled: true,
        numComments: 0,
        numRatings: 0,
        avgRating: 0,
        numViews: 1,
        scoreCompleteness: 83,
        groupDesignations: null,
        text: JSON.stringify({
          operationalLayers: layers.map((layer, index) => ({
            id: `layer_${index}`,
            layerType: "ArcGISFeatureLayer",
            url: layer.serviceUrl,
            visibility: true,
            opacity: 1,
            title: layer.name,
            itemId: null,
            popupInfo: {
              title: layer.name,
              description: `Source: ${layer.agency}`
            }
          })),
          baseMap: {
            baseMapLayers: [{
              id: "defaultBasemap",
              layerType: "ArcGISTiledMapServiceLayer",
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
              visibility: true,
              opacity: 1,
              title: "World Street Map"
            }],
            title: "Basemap"
          },
          spatialReference: {
            wkid: 102100,
            latestWkid: 3857
          },
          authoringApp: "HIFLD Infrastructure Tool v2",
          authoringAppVersion: "2.0",
          version: "2.26"
        })
      }

      // Create blob and download
      const blob = new Blob([JSON.stringify(projectJson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0]
      a.download = `HIFLD_ArcGISProject_${date}.json`
      
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      // Show success message with clearer instructions
      alert(`ArcGIS Project JSON exported successfully!\n\nIMPORTANT: This file format may require:\n1. Importing through ArcGIS Pro (not ArcGIS Online)\n2. Using ArcGIS Assistant (ago-assistant.esri.com)\n3. Or creating a new Web Map manually and adding the layers\n\nFor best results, consider using the "Export GeoJSON" button instead.`)
      
      // Close dialog
      setShowDialog(false)
    } catch (error) {
      console.error('Failed to export map:', error)
      alert('Failed to export map configuration')
    }
  }

  if (layers.length === 0) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${className}`}
        title="Export as Web Map JSON (select 'Web Map' type in ArcGIS)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Web Map
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Export Web Map for ArcGIS</h3>
            
            <div className="mb-4 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">⚠️ Important Note about Web Map Export</h4>
                <p className="text-sm text-amber-700 mb-2">
                  ArcGIS Online's "New item" interface may not properly recognize Web Map JSON files. 
                </p>
                <p className="text-sm text-amber-700 font-semibold">
                  For best results, use the "Export GeoJSON" button instead, which creates a simple geographic file that ArcGIS Online can easily import.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Alternative methods to use Web Map JSON:
                </p>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Use ArcGIS Assistant (ago-assistant.esri.com) to upload</li>
                  <li>Import through ArcGIS Pro desktop application</li>
                  <li>Create a new Web Map manually and add layers by URL</li>
                </ol>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Map Title <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Note: ArcGIS doesn't allow colons)</span>
                </label>
                <input
                  type="text"
                  value={mapTitle}
                  onChange={(e) => setMapTitle(e.target.value)}
                  placeholder="Enter a title for your map"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={mapDescription}
                  onChange={(e) => setMapDescription(e.target.value)}
                  placeholder="Describe what this map contains..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (for ArcGIS Online)
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {mapTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600"
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
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-sm font-medium text-gray-700 mb-2">This export includes:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ All {layers.length} selected layers as operational layers</li>
                  <li>✓ Current map extent and spatial reference</li>
                  <li>✓ Layer visibility and popup configuration</li>
                  <li>✓ Metadata in ArcGIS format</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExport}
                disabled={!mapTitle.trim() || !mapDescription.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  !mapTitle.trim() || !mapDescription.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Download Web Map JSON
              </button>
              <button
                onClick={() => {
                  setShowDialog(false)
                  setMapTitle('')
                  setMapDescription('')
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