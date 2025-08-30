'use client'

import { useState, useEffect, useRef } from 'react'
import SearchBar from '@/components/SearchBar'
import LayerList from '@/components/LayerList'
import MapView, { type MapViewRef } from '@/components/MapView'
import StatusIndicator from '@/components/StatusIndicator'

export interface EnhancedLayer {
  id: number
  name: string
  category: string
  serviceUrl: string | null
  status: string
  agency: string
  requiresDUA: boolean
  requiresGII: boolean
  testStatus: string
  testError?: string
  lastTested: string | null
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [allLayers, setAllLayers] = useState<EnhancedLayer[]>([])
  const [filteredLayers, setFilteredLayers] = useState<EnhancedLayer[]>([])
  const [selectedLayers, setSelectedLayers] = useState<EnhancedLayer[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showWorkingOnly, setShowWorkingOnly] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const mapViewRef = useRef<MapViewRef>(null)

  // Load layer data on mount
  useEffect(() => {
    loadLayerData()
  }, [])

  // Filter layers when search or filters change
  useEffect(() => {
    filterLayers()
  }, [searchQuery, selectedCategory, showWorkingOnly, allLayers])

  const loadLayerData = async () => {
    try {
      // Detect if we're on GitHub Pages by checking the URL
      const isGitHubPages = window.location.hostname.includes('github.io')
      const basePath = isGitHubPages ? '/infrastructure-tool-v2' : ''
      
      // Try to load test results first, fallback to processed data
      const response = await fetch(`${basePath}/layer-test-results.json`).catch(() => 
        fetch(`${basePath}/processed-layers.json`)
      )
      
      if (response.ok) {
        const data = await response.json()
        const layers = data.results || data.layers || []
        setAllLayers(layers)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load layer data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterLayers = () => {
    let filtered = [...allLayers]
    
    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(l => l.category === selectedCategory)
    }
    
    // Working status filter
    if (showWorkingOnly) {
      filtered = filtered.filter(l => l.testStatus === 'working')
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(query) ||
        l.agency?.toLowerCase().includes(query) ||
        l.category.toLowerCase().includes(query)
      )
    }
    
    setFilteredLayers(filtered)
  }

  const handleAddLayer = (layer: EnhancedLayer) => {
    if (!selectedLayers.find(l => l.id === layer.id)) {
      setSelectedLayers([...selectedLayers, layer])
    }
  }

  const handleRemoveLayer = (layerId: number) => {
    setSelectedLayers(selectedLayers.filter(l => l.id !== layerId))
  }

  const handleClearAll = () => {
    setSelectedLayers([])
  }

  const categories = ['All', ...new Set(allLayers.map(l => l.category)).values()].sort()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Infrastructure Search Tool v2</h1>
              <p className="text-blue-200 mt-1">
                Search, test, and visualize HIFLD infrastructure layers
              </p>
            </div>
            {stats && (
              <div className="text-right">
                <div className="text-sm text-blue-200">
                  {stats.total} Total Layers
                </div>
                <div className="flex gap-4 mt-1">
                  <StatusIndicator status="working" count={stats.working} />
                  <StatusIndicator status="failed" count={stats.failed} />
                  <StatusIndicator status="restricted" count={stats.restricted} />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search layers, agencies, categories..."
            />
            
            {/* Category Filter */}
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Working Only Filter */}
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="working-only"
                checked={showWorkingOnly}
                onChange={(e) => setShowWorkingOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="working-only" className="ml-2 text-sm text-gray-700">
                Show working layers only
              </label>
            </div>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto">
            <LayerList 
              layers={filteredLayers}
              selectedLayers={selectedLayers}
              onAddLayer={handleAddLayer}
              onRemoveLayer={handleRemoveLayer}
              isLoading={isLoading}
            />
          </div>

          {/* Selected Layers Summary */}
          {selectedLayers.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">
                  Selected Layers ({selectedLayers.length})
                </h3>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto mb-3">
                {selectedLayers.map(layer => (
                  <div key={layer.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-gray-600">{layer.name}</span>
                    <button
                      onClick={() => handleRemoveLayer(layer.id)}
                      className="text-red-500 hover:text-red-600 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold mb-1">How to use these layers:</p>
                <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                  <li>Click "Copy URL" on any layer</li>
                  <li>In ArcGIS Online, open your map</li>
                  <li>Click Add → Add Layer from Web</li>
                  <li>Paste the URL and click Add Layer</li>
                </ol>
              </div>
            </div>
          )}
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <MapView 
            ref={mapViewRef} 
            layers={selectedLayers.filter(l => l.testStatus === 'working').map(l => ({
              name: l.name,
              serviceUrl: l.serviceUrl || '',
              agency: l.agency,
              status: l.status
            }))} 
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Refresh Data
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}