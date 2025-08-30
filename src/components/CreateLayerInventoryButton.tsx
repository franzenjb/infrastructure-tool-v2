'use client'

import { Layer } from '@/lib/search'

interface CreateLayerInventoryButtonProps {
  layers: Layer[]
  className?: string
}

export default function CreateLayerInventoryButton({ layers, className = '' }: CreateLayerInventoryButtonProps) {

  const handleExport = () => {
    if (layers.length === 0) {
      alert('Please select at least one layer first')
      return
    }

    // Create CSV header
    let csv = 'Layer_Name,Agency,Service_URL,Category,Status,Latitude,Longitude\n'
    
    // Add each layer as a row with slightly different positions to avoid overlap
    layers.forEach((layer, index) => {
      // Create a grid of points around USA center to avoid overlap
      const baseLatitude = 39.8283
      const baseLongitude = -98.5795
      const offset = 0.5
      const row = Math.floor(index / 5)
      const col = index % 5
      
      const lat = baseLatitude + (row * offset) - 2
      const lon = baseLongitude + (col * offset) - 2
      
      // Escape values for CSV
      const escapeCsv = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }
      
      csv += `${escapeCsv(layer.name)},${escapeCsv(layer.agency)},${escapeCsv(layer.serviceUrl || 'No URL')},${escapeCsv(layer.status)},Working,${lat},${lon}\n`
    })

    // Download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = `HIFLD_Layer_Inventory.csv`
    a.href = url
    a.click()
    URL.revokeObjectURL(url)

    alert(`SUCCESS! CSV file downloaded: HIFLD_Layer_Inventory.csv

TO CREATE LAYER INVENTORY IN ARCGIS:
1. Go to ArcGIS Online → Content
2. Click "New item" → "Your device"
3. Select: HIFLD_Layer_Inventory.csv
4. It will recognize it as CSV with locations
5. Check "Publish as hosted feature layer"
6. Add title, tags, and save

This creates a map showing all your selected layers as points.
Click each point to see the layer name and service URL.`)
  }

  return (
    <button
      onClick={handleExport}
      className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors ${className}`}
    >
      📊 Create Layer Inventory (CSV)
    </button>
  )
}