'use client'

import { useState } from 'react'
import { Layer } from '@/lib/search'

interface AddLayersToArcGISButtonProps {
  layers: Layer[]
  className?: string
}

export default function AddLayersToArcGISButton({ layers, className = '' }: AddLayersToArcGISButtonProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  const handleShowInstructions = () => {
    if (layers.length === 0) {
      alert('Please select at least one layer first')
      return
    }
    setShowInstructions(true)
  }

  return (
    <>
      <button
        onClick={handleShowInstructions}
        className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ${className}`}
      >
        📍 Add These Layers to ArcGIS Map
      </button>

      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">How to Add HIFLD Layers to ArcGIS Online Map</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Method 1: Direct Add (Recommended)</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to ArcGIS Online and sign in</li>
                  <li>Click <strong>"Map"</strong> to open Map Viewer</li>
                  <li>Click <strong>"Add"</strong> → <strong>"Add Layer from Web"</strong></li>
                  <li>For <strong>"What type of data are you referencing?"</strong> select <strong>"An ArcGIS Server Web Service"</strong></li>
                  <li>Copy one of the URLs below and paste it</li>
                  <li>Click <strong>"Add Layer"</strong></li>
                  <li>Repeat for each layer you want</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Your Selected Layer URLs:</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {layers.map((layer, index) => (
                    <div key={index} className="border border-gray-200 p-3 rounded bg-white">
                      <p className="font-medium text-sm">{layer.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <input 
                          type="text" 
                          value={layer.serviceUrl || ''} 
                          readOnly 
                          className="flex-1 text-xs p-1 border rounded bg-gray-50"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(layer.serviceUrl || '')
                            alert('URL copied to clipboard!')
                          }}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Method 2: Create Web Map First</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>In ArcGIS Online, go to <strong>Content</strong></li>
                  <li>Click <strong>"Create"</strong> → <strong>"Map"</strong></li>
                  <li>Give your map a title (no colons!)</li>
                  <li>Once in the map editor, use Method 1 above to add layers</li>
                  <li>Save your map when done</li>
                </ol>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> These are live service layers that will show actual data (points, lines, polygons) from HIFLD. 
                  Some layers may require authentication or have CORS restrictions.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  // Create a text file with all URLs for reference
                  const urlList = layers.map(l => `${l.name}\n${l.serviceUrl}\n`).join('\n')
                  const blob = new Blob([urlList], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.download = `HIFLD_Layer_URLs_${new Date().toISOString().split('T')[0]}.txt`
                  a.href = url
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Download URL List
              </button>
              <button
                onClick={() => setShowInstructions(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}