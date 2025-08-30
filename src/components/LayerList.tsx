'use client'

import { EnhancedLayer } from '@/app/page'
import clsx from 'clsx'

interface LayerListProps {
  layers: EnhancedLayer[]
  selectedLayers: EnhancedLayer[]
  onAddLayer: (layer: EnhancedLayer) => void
  onRemoveLayer: (layerId: number) => void
  isLoading: boolean
}

export default function LayerList({ 
  layers, 
  selectedLayers, 
  onAddLayer, 
  onRemoveLayer,
  isLoading 
}: LayerListProps) {
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading layers...</p>
      </div>
    )
  }

  if (layers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No layers found. Try adjusting your filters.
      </div>
    )
  }

  // Group layers by category
  const groupedLayers = layers.reduce((acc, layer) => {
    if (!acc[layer.category]) {
      acc[layer.category] = []
    }
    acc[layer.category].push(layer)
    return acc
  }, {} as Record<string, EnhancedLayer[]>)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return '✅'
      case 'failed':
      case 'timeout':
      case 'unreachable':
        return '❌'
      case 'restricted':
      case 'auth_required':
        return '🔒'
      case 'no_url':
        return '❓'
      default:
        return '⏳'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'text-green-600'
      case 'failed':
      case 'timeout':
      case 'unreachable':
        return 'text-red-600'
      case 'restricted':
      case 'auth_required':
        return 'text-yellow-600'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="divide-y divide-gray-200">
      {Object.entries(groupedLayers).sort().map(([category, categoryLayers]) => (
        <div key={category} className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
            {category}
            <span className="text-sm font-normal text-gray-500">
              {categoryLayers.length} layers
            </span>
          </h3>
          <div className="space-y-2">
            {categoryLayers.map(layer => {
              const isSelected = selectedLayers.some(l => l.id === layer.id)
              const isWorkable = layer.testStatus === 'working' && layer.serviceUrl
              
              return (
                <div
                  key={layer.id}
                  className={clsx(
                    "p-3 rounded-lg border transition-all",
                    isSelected 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300 bg-white",
                    !isWorkable && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getStatusColor(layer.testStatus)}>
                          {getStatusIcon(layer.testStatus)}
                        </span>
                        <h4 className="font-medium text-gray-900 truncate">
                          {layer.name}
                        </h4>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        {layer.agency && (
                          <div>Agency: {layer.agency}</div>
                        )}
                        {layer.testError && (
                          <div className="text-red-600">
                            {layer.testError}
                          </div>
                        )}
                        {(layer.requiresDUA || layer.requiresGII) && (
                          <div className="text-yellow-600">
                            {layer.requiresDUA && 'DUA Required'}
                            {layer.requiresDUA && layer.requiresGII && ', '}
                            {layer.requiresGII && 'GII Access Required'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      {layer.serviceUrl && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(layer.serviceUrl || '')
                            alert(`✅ URL Copied to Clipboard!\n\n${layer.name}\n\nTO ADD TO YOUR ARCGIS MAP:\n\n1. Go to ArcGIS Online and open your map\n2. Click the "Add" button\n3. Select "Add layer from URL"\n4. Paste the URL you just copied\n5. For layer type, select "ArcGIS Server web service"\n6. Click "Add to map"\n\nThe layer will appear on your map!\n\nNOTE: Some layers may require authentication.`)
                          }}
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 flex items-center gap-1"
                          title="Copy layer URL for ArcGIS"
                        >
                          📋 Copy URL
                        </button>
                      )}
                      
                      {isWorkable && (
                        <button
                          onClick={() => isSelected ? onRemoveLayer(layer.id) : onAddLayer(layer)}
                          className={clsx(
                            "px-3 py-1 rounded text-sm font-medium transition-colors",
                            isSelected 
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          )}
                        >
                          {isSelected ? 'Remove' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}