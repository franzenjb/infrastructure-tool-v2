'use client'

import { Layer } from '@/lib/search'

interface CreateFeatureLayerButtonProps {
  layers: Layer[]
  className?: string
}

export default function CreateFeatureLayerButton({ layers, className = '' }: CreateFeatureLayerButtonProps) {

  const handleExport = () => {
    if (layers.length === 0) {
      alert('Please select at least one layer first')
      return
    }

    // Create the SIMPLEST possible GeoJSON - just one point
    const geojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-98.5795, 39.8283]  // Center of USA
          },
          "properties": {
            "name": "HIFLD Layers Location",
            "layer_count": layers.length,
            "first_layer": layers[0].name
          }
        }
      ]
    }

    // Download the file
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = 'simple_point.geojson'
    a.href = url
    a.click()
    URL.revokeObjectURL(url)

    alert(`SUCCESS! File downloaded: simple_point.geojson

TO CREATE A FEATURE LAYER IN ARCGIS:
1. Go to ArcGIS Online
2. Click "Content" 
3. Click "New item"
4. Click "Your device"
5. Select the file: simple_point.geojson
6. It should auto-detect as GeoJSON
7. Click Next/Save

This creates a simple point feature layer.`)
  }

  return (
    <button
      onClick={handleExport}
      className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ${className}`}
    >
      Create Simple Feature Layer
    </button>
  )
}