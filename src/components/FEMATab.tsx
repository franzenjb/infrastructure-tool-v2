'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { FEMA_RAPT_LAYERS } from '../../lib/femaRaptLayers'

interface FEMATabProps {
  selectedLayerIds?: Set<string>
  onAddLayer?: (layer: any) => void
  onRemoveLayer?: (layerId: string) => void
}

export default function FEMATab({ selectedLayerIds = new Set(), onAddLayer, onRemoveLayer }: FEMATabProps) {
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set())
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showWorkingOnly, setShowWorkingOnly] = useState(true)
  
  // Status helpers - matching HIFLD style
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'working': return 'text-green-600'
      case 'slow': return 'text-yellow-600'
      case 'broken': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'working': return '✓'
      case 'slow': return '⚠'
      case 'broken': return '✗'
      default: return '?'
    }
  }
  
  // Get unique categories from layers
  const categories = useMemo(() => {
    const cats = new Set(FEMA_RAPT_LAYERS.map(l => l.category))
    return ['All', ...Array.from(cats).sort()]
  }, [])
  
  // Filter layers based on category and search
  // Count availability status
  const availabilityStats = useMemo(() => {
    const stats = { working: 0, slow: 0, broken: 0 }
    FEMA_RAPT_LAYERS.forEach(layer => {
      if (layer.availability) {
        stats[layer.availability]++
      } else {
        stats.broken++ // Default broken if not set
      }
    })
    return stats
  }, [])
  
  const filteredLayers = useMemo(() => {
    let filtered = FEMA_RAPT_LAYERS
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(l => l.category === selectedCategory)
    }
    
    if (showWorkingOnly) {
      filtered = filtered.filter(l => l.availability === 'working')
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.category.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [selectedCategory, searchQuery, showWorkingOnly])
  
  // Helper function to get status indicator
  const getStatusIndicator = (availability: string) => {
    switch (availability) {
      case 'working':
        return { emoji: '🟢', title: 'Working - Layer responds quickly with valid data' }
      case 'slow':
        return { emoji: '🟡', title: 'Slow - Layer responds but may be slow or have large datasets' }
      case 'broken':
      default:
        return { emoji: '🔴', title: 'Broken - Layer is not responding or has errors' }
    }
  }

  const handleToggle = (layerId: string) => {
    const newSelected = new Set(selectedLayers)
    if (newSelected.has(layerId)) {
      newSelected.delete(layerId)
    } else {
      newSelected.add(layerId)
    }
    setSelectedLayers(newSelected)
  }

  const copyUrl = (layer: any) => {
    navigator.clipboard.writeText(layer.serviceUrl)
    setCopiedUrl(layer.id)
    setTimeout(() => setCopiedUrl(null), 2000)
    alert(`✅ URL Copied!\n\n${layer.name}\n\nAdd to ArcGIS:\n1. Click "Add" → "Add layer from URL"\n2. Paste the URL\n3. Select "${layer.serviceType}"\n4. Click "Add to map"`)
  }

  const exportSelected = () => {
    const selected = FEMA_RAPT_LAYERS.filter(l => selectedLayers.has(l.id))
    
    if (selected.length === 0) {
      alert('Please select at least one layer first')
      return
    }

    const csv = [
      'name,description,serviceUrl,serviceType',
      ...selected.map(l => `"${l.name}","${l.description}","${l.serviceUrl}","${l.serviceType}"`)
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fema-layers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Removed stats from here, will be in main banner */}
      
      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200 bg-white space-y-3">
        <input
          type="text"
          placeholder="Search layers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Category Filter */}
        <div className="space-y-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} {cat !== 'All' && `(${FEMA_RAPT_LAYERS.filter(l => l.category === cat).length})`}
              </option>
            ))}
          </select>
          
          {/* Working Only Filter - matching HIFLD style */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="working-only-fema"
              checked={showWorkingOnly}
              onChange={(e) => setShowWorkingOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="working-only-fema" className="ml-2 text-sm text-gray-700">
              Show working layers only
            </label>
          </div>
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No layers found matching your search.
          </div>
        ) : (
        <div className="space-y-2">
          {filteredLayers.map(layer => {
            const isSelected = selectedLayers.has(layer.id)
            const isOnMap = selectedLayerIds.has(layer.id)
            
            return (
              <div
                key={layer.id}
                className={clsx(
                  "p-3 rounded-lg border transition-all",
                  isOnMap
                    ? "border-green-400 bg-green-50"
                    : isSelected 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                {/* Layer name and status at top */}
                <div className="flex items-start gap-2 mb-2">
                  <span className={getStatusColor(layer.availability || 'broken')}>
                    {getStatusIcon(layer.availability || 'broken')}
                  </span>
                  <h4 className="font-medium text-gray-900 flex-1">
                    {layer.name}
                  </h4>
                </div>
                
                {/* Description */}
                <div className="text-xs text-gray-500 mb-2">
                  {layer.description}
                </div>
                
                {/* Metadata */}
                <div className="text-xs text-gray-400 mb-3">
                  {layer.category} • {layer.agency || 'FEMA'}
                </div>
                
                {/* Buttons at bottom */}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => copyUrl(layer)}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    {copiedUrl === layer.id ? 'Copied' : 'Copy URL'}
                  </button>
                  
                  {onAddLayer && onRemoveLayer ? (
                    <button
                      onClick={() => {
                        const isOnMap = selectedLayerIds.has(layer.id)
                        if (isOnMap) {
                          onRemoveLayer(layer.id)
                        } else {
                          // Convert FEMA layer to format expected by MapView
                          onAddLayer({
                            id: layer.id,
                            name: layer.name,
                            category: layer.category,
                            serviceUrl: layer.serviceUrl,
                            serviceType: layer.serviceType,
                            testStatus: 'working',
                            status: layer.status,
                            agency: 'FEMA',
                            requiresDUA: false,
                            requiresGII: false,
                            lastTested: null
                          })
                        }
                      }}
                      className={clsx(
                        "px-3 py-1 rounded text-sm font-medium transition-colors",
                        selectedLayerIds.has(layer.id)
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      )}
                    >
                      {selectedLayerIds.has(layer.id) ? 'Remove from Map' : '+ Add to Map'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(layer.id)}
                      className={clsx(
                        "px-3 py-1 rounded text-sm font-medium transition-colors",
                        isSelected 
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      )}
                    >
                      {isSelected ? 'Remove' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        )}
      </div>

      {/* Category Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-medium text-gray-700">
            Layer Categories ({categories.length - 1})
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {categories.filter(c => c !== 'All').map(cat => (
              <div key={cat} className="text-xs">
                <span className="font-medium">{cat}:</span> {FEMA_RAPT_LAYERS.filter(l => l.category === cat).length} layers
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}