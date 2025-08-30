'use client'

import { femaLayers } from '@/lib/femaLayers'

export default function FEMATab() {
  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">🚧 Work in Progress</h3>
        <p className="text-sm text-yellow-700 mb-2">
          The FEMA RAPT integration is under development. FEMA RAPT has a complex interface with multiple splash screens that requires automation to navigate.
        </p>
        <p className="text-sm text-yellow-700">
          For now, here are direct URLs to commonly used FEMA layers that you can add to your ArcGIS maps:
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Popular FEMA Layers:</h3>
        
        {femaLayers.slice(0, 8).map((layer) => (
          <div key={layer.id} className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{layer.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{layer.description}</p>
                <p className="text-xs text-gray-500 mt-1">Source: {layer.agency}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(layer.serviceUrl)
                  alert(`✅ URL Copied!\n\n${layer.name}\n\nTO ADD TO ARCGIS:\n1. In your ArcGIS map, click Add\n2. Select "Add layer from URL"\n3. Paste this URL\n4. Click "Add to map"`)
                }}
                className="ml-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                📋 Copy URL
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> For the full FEMA RAPT experience with analysis tools, visit:{' '}
            <a 
              href="https://experience.arcgis.com/experience/0a317e8998534c30a9b2d3861c814d42/" 
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              FEMA RAPT Tool
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}