'use client'

import { useState } from 'react'
import { Layer } from '@/lib/search'

interface FetchActualDataButtonProps {
  layers: Layer[]
  className?: string
}

export default function FetchActualDataButton({ layers, className = '' }: FetchActualDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleFetchData = async () => {
    if (layers.length === 0) {
      alert('Please select at least one layer first')
      return
    }

    if (layers.length > 1) {
      alert('Please select only ONE layer to fetch its actual data. Remove other layers first.')
      return
    }

    const layer = layers[0]
    setIsLoading(true)
    setStatus('Fetching actual features from service...')

    try {
      // Build query URL to get ALL features as GeoJSON
      const queryUrl = `${layer.serviceUrl}/query?` + new URLSearchParams({
        where: '1=1',  // Get all features
        outFields: '*', // Get all fields
        f: 'geojson',  // Get as GeoJSON
        outSR: '4326', // WGS84 coordinates
        returnGeometry: 'true',
        geometryPrecision: '6'
      })

      setStatus('Downloading features...')
      const response = await fetch(queryUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const geojson = await response.json()
      
      if (!geojson.features || geojson.features.length === 0) {
        throw new Error('No features returned from service')
      }

      setStatus(`Downloaded ${geojson.features.length} features!`)

      // Add metadata to the GeoJSON
      geojson.metadata = {
        sourceLayer: layer.name,
        sourceAgency: layer.agency,
        sourceUrl: layer.serviceUrl,
        exportDate: new Date().toISOString()
      }

      // Download the ACTUAL DATA as GeoJSON
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = `${layer.name.replace(/[^a-z0-9]/gi, '_')}_ACTUAL_DATA.geojson`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      alert(`SUCCESS! Downloaded ${geojson.features.length} actual features!

File: ${a.download}

This GeoJSON contains the ACTUAL polygons/points/lines from the service.
Upload this to ArcGIS Online as GeoJSON and you'll have the real data!`)

    } catch (error) {
      console.error('Failed to fetch data:', error)
      alert(`Failed to fetch data: ${error.message}\n\nThis layer may:\n- Require authentication\n- Have CORS restrictions\n- Be too large to download all at once`)
    } finally {
      setIsLoading(false)
      setStatus('')
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleFetchData}
        disabled={isLoading}
        className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 ${className}`}
      >
        {isLoading ? '⏳ Fetching...' : '🔽 Download Actual Layer Data'}
      </button>
      {status && (
        <p className="text-sm text-gray-600 text-center">{status}</p>
      )}
    </div>
  )
}