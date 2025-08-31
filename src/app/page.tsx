'use client'

import { useState, useEffect, useRef } from 'react'
import SearchBar from '@/components/SearchBar'
import LayerList from '@/components/LayerList'
import MapView, { type MapViewRef } from '@/components/MapView'
import StatusIndicator from '@/components/StatusIndicator'
import FEMATab from '@/components/FEMATab'

export interface EnhancedLayer {
  id: number | string  // Allow both number (HIFLD) and string (FEMA) IDs
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
  const [activeTab, setActiveTab] = useState<'hifld' | 'fema'>('hifld')
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

  const handleRemoveLayer = (layerId: number | string) => {
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
              <h1 className="text-3xl font-bold">Infrastructure Search Tool v2 - BETA</h1>
              <p className="text-blue-200 mt-1">
                Search, test, and visualize HIFLD infrastructure layers
              </p>
              <p className="text-yellow-300 text-sm mt-1 font-medium">
                ⚠️ This is a beta tool for testing purposes - all layers should be verified
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Show stats based on active tab */}
              {activeTab === 'hifld' && stats && (
                <div className="text-right">
                  <div className="text-sm text-blue-200">
                    {stats.total} Total HIFLD Layers
                  </div>
                  <div className="flex gap-4 mt-1">
                    <StatusIndicator status="working" count={stats.working} />
                    <StatusIndicator status="failed" count={stats.failed} />
                    <StatusIndicator status="restricted" count={stats.restricted} />
                  </div>
                </div>
              )}
              {activeTab === 'fema' && (
                <div className="text-right">
                  <div className="text-sm text-blue-200">
                    121 Total FEMA Layers
                  </div>
                  <div className="flex gap-4 mt-1">
                    <StatusIndicator status="working" count={62} />
                    <StatusIndicator status="failed" count={59} />
                    <StatusIndicator status="restricted" count={0} />
                  </div>
                </div>
              )}
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Navigation - Clean and simple */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('hifld')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'hifld'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              HIFLD Layers
            </button>
            <button
              onClick={() => setActiveTab('fema')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'fema'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              FEMA RAPT
            </button>
          </div>

          {activeTab === 'hifld' ? (
            <>
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
            </>
          ) : (
            <FEMATab 
              selectedLayerIds={new Set(selectedLayers.map(l => String(l.id)))}
              onAddLayer={handleAddLayer}
              onRemoveLayer={handleRemoveLayer}
            />
          )}

          {/* Selected Layers Summary - For both HIFLD and FEMA tabs */}
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
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  How to Add Layers to ArcGIS:
                </h3>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li><span className="text-blue-600 font-medium">1. Preview here:</span> Click "Add" to see on map</li>
                  <li><span className="text-blue-600 font-medium">2. Copy URL:</span> Click "Copy URL" button</li>
                  <li><span className="text-blue-600 font-medium">3. In ArcGIS:</span> Add → Add layer from URL</li>
                  <li><span className="text-blue-600 font-medium">4. Paste & Add:</span> Paste URL and click "Add to map"</li>
                </ol>
                <p className="text-xs text-gray-500 mt-3 italic">
                  Each layer URL can be added to any ArcGIS map!
                </p>
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
          
          {/* Beta Disclaimer Banner */}
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-100 border-t-2 border-yellow-400 px-4 py-2">
            <p className="text-center text-sm text-yellow-800 font-medium">
              ⚠️ BETA VERSION - This is a testing tool. All layer data should be independently verified before use in production.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}