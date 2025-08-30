'use client'

import { useState } from 'react'
import { Layer } from '@/lib/search'

interface SimpleExportButtonProps {
  layers: Layer[]
  className?: string
}

export default function SimpleExportButton({ layers, className = '' }: SimpleExportButtonProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  const handleExport = () => {
    if (layers.length === 0) {
      alert('No layers selected to export')
      return
    }

    // Create a simple text list of layer URLs
    const layerList = layers.map((layer, index) => 
      `Layer ${index + 1}: ${layer.name}\nURL: ${layer.serviceUrl}\nAgency: ${layer.agency}\n`
    ).join('\n')

    const content = `HIFLD Infrastructure Layers Export
Generated: ${new Date().toLocaleString()}
Total Layers: ${layers.length}

INSTRUCTIONS FOR ARCGIS ONLINE:
1. Go to ArcGIS Online and sign in
2. Click "Map" to create a new map
3. Click "Add" → "Add Layer from Web"
4. Copy and paste each URL below one at a time
5. Click "Add Layer" for each one

LAYER URLS:
${layerList}

NOTE: Some layers may require authentication or may not be accessible due to CORS restrictions.
`

    // Create and download text file
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = `HIFLD_Layer_URLs_${new Date().toISOString().split('T')[0]}.txt`
    a.href = url
    a.click()
    URL.revokeObjectURL(url)

    setShowInstructions(true)
  }

  return (
    <>
      <button
        onClick={handleExport}
        className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 ${className}`}
        title="Export layer URLs as simple text file"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Layer URLs
      </button>

      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold mb-4">How to Use Your Layer Export</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Simple Method That Works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open the text file you just downloaded</li>
                  <li>Go to ArcGIS Online and create a new map</li>
                  <li>Click "Add" → "Add Layer from Web"</li>
                  <li>Copy one URL from the text file</li>
                  <li>Paste it into ArcGIS and click "Add Layer"</li>
                  <li>Repeat for each layer you want</li>
                </ol>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why this works:</strong> ArcGIS Online can directly connect to map service URLs. 
                  This avoids all the complex file format issues and just gives you the URLs to add manually.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}