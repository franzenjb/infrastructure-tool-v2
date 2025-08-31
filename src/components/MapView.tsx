'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Layer } from '@/lib/search'
import DOMPurify from 'dompurify'

interface MapViewProps {
  layers: Layer[]
}

export interface MapViewRef {
  getView: () => any
}

const MapView = forwardRef<MapViewRef, MapViewProps>(function MapView({ layers }, ref) {
  const mapDiv = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const viewInstance = useRef<any>(null)
  const layerRefs = useRef<Map<string, any>>(new Map())

  // Expose the view instance through ref
  useImperativeHandle(ref, () => ({
    getView: () => viewInstance.current
  }))

  // Create intelligent popup template based on layer type
  const createPopupTemplate = (layer: Layer) => {
    return {
      title: "{expression/formatted-title}",
      content: (feature: any) => {
        const attributes = feature.graphic.attributes
        
        // Helper function to find field case-insensitively
        const findField = (fieldNames: string[]): string | null => {
          const attrs = Object.keys(attributes)
          for (const fieldName of fieldNames) {
            const found = attrs.find(attr => 
              attr.toLowerCase() === fieldName.toLowerCase()
            )
            if (found && attributes[found] && attributes[found].toString().trim()) {
              return found
            }
          }
          return null
        }

        // Helper to get field value safely with XSS protection
        const getFieldValue = (fieldNames: string[]): string => {
          const field = findField(fieldNames)
          if (!field || !attributes[field]) return ''
          // Sanitize the value to prevent XSS
          return DOMPurify.sanitize(attributes[field].toString(), { ALLOWED_TAGS: [] })
        }

        // Detect layer type based on name
        const layerNameLower = layer.name.toLowerCase()
        let content = '<div style="padding: 10px; max-width: 400px;">'

        // Fire Perimeters - Show fire-specific information
        if (layerNameLower.includes('fire') && layerNameLower.includes('perimeter')) {
          const fireName = getFieldValue(['FIRE_NAME', 'INCIDENT_NAME', 'INCIDENTNAME', 'NAME'])
          const acres = getFieldValue(['ACRES', 'GISACRES', 'AREA_', 'TOTALACRES'])
          const fireYear = getFieldValue(['FIRE_YEAR', 'YEAR', 'FIREYEAR'])
          const startDate = getFieldValue(['STARTDATE', 'START_DATE', 'IGNITION_DATE', 'DISCOVERED'])
          const containment = getFieldValue(['PERCENTCONTAINED', 'PERCENT_CONTAINED', 'CONTAINMENT'])
          const cause = getFieldValue(['CAUSE', 'FIRECAUSE', 'FIRE_CAUSE'])
          const state = getFieldValue(['STATE', 'STATE_NAME'])
          const agency = getFieldValue(['AGENCY', 'UNIT', 'PROTECTING_AGENCY'])

          if (fireName) {
            content += `<h3 style="margin: 0 0 10px 0; color: #d73502;">${fireName}</h3>`
          } else {
            content += `<h3 style="margin: 0 0 10px 0; color: #d73502;">Fire Perimeter</h3>`
          }

          content += '<table style="width: 100%; font-size: 14px;">'
          if (acres) content += `<tr><td style="padding: 4px; font-weight: bold;">Acres:</td><td>${parseFloat(acres).toLocaleString()} acres</td></tr>`
          if (fireYear) content += `<tr><td style="padding: 4px; font-weight: bold;">Year:</td><td>${fireYear}</td></tr>`
          if (startDate) content += `<tr><td style="padding: 4px; font-weight: bold;">Start Date:</td><td>${startDate}</td></tr>`
          if (containment) content += `<tr><td style="padding: 4px; font-weight: bold;">Containment:</td><td>${containment}%</td></tr>`
          if (cause) content += `<tr><td style="padding: 4px; font-weight: bold;">Cause:</td><td>${cause}</td></tr>`
          if (state) content += `<tr><td style="padding: 4px; font-weight: bold;">State:</td><td>${state}</td></tr>`
          if (agency) content += `<tr><td style="padding: 4px; font-weight: bold;">Agency:</td><td>${agency}</td></tr>`
          content += '</table>'
        }
        
        // Hospitals
        else if (layerNameLower.includes('hospital')) {
          const name = getFieldValue(['NAME', 'FACILITY_NAME', 'HOSPITAL_NAME', 'FACILITYNAME'])
          const address = getFieldValue(['ADDRESS', 'STREET', 'STREET_ADDRESS'])
          const city = getFieldValue(['CITY', 'CITY_NAME'])
          const state = getFieldValue(['STATE', 'STATE_NAME'])
          const zip = getFieldValue(['ZIP', 'ZIPCODE', 'ZIP_CODE'])
          const beds = getFieldValue(['BEDS', 'TOTAL_BEDS', 'NUM_BEDS', 'BED_COUNT'])
          const phone = getFieldValue(['PHONE', 'TELEPHONE', 'CONTACT_PHONE'])
          const type = getFieldValue(['TYPE', 'FACILITY_TYPE', 'HOSPITAL_TYPE'])
          const owner = getFieldValue(['OWNER', 'OWNERSHIP', 'OWNER_TYPE'])

          content += `<h3 style="margin: 0 0 10px 0; color: #0066cc;">${name || 'Hospital'}</h3>`
          
          if (address || city || state || zip) {
            content += '<div style="margin-bottom: 10px;">'
            if (address) content += `${address}<br>`
            if (city || state || zip) content += `${city || ''}${city && state ? ', ' : ''}${state || ''} ${zip || ''}`
            content += '</div>'
          }

          content += '<table style="width: 100%; font-size: 14px;">'
          if (beds) content += `<tr><td style="padding: 4px; font-weight: bold;">Beds:</td><td>${beds}</td></tr>`
          if (phone) content += `<tr><td style="padding: 4px; font-weight: bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>`
          if (type) content += `<tr><td style="padding: 4px; font-weight: bold;">Type:</td><td>${type}</td></tr>`
          if (owner) content += `<tr><td style="padding: 4px; font-weight: bold;">Ownership:</td><td>${owner}</td></tr>`
          content += '</table>'
        }
        
        // Schools
        else if (layerNameLower.includes('school')) {
          const name = getFieldValue(['NAME', 'SCHOOL_NAME', 'FACILITY_NAME', 'SCHOOLNAME'])
          const address = getFieldValue(['ADDRESS', 'STREET', 'STREET_ADDRESS'])
          const city = getFieldValue(['CITY', 'CITY_NAME'])
          const state = getFieldValue(['STATE', 'STATE_NAME'])
          const type = getFieldValue(['TYPE', 'SCHOOL_TYPE', 'LEVEL'])
          const district = getFieldValue(['DISTRICT', 'SCHOOL_DISTRICT', 'DISTRICT_NAME'])
          const enrollment = getFieldValue(['ENROLLMENT', 'STUDENTS', 'STUDENT_COUNT'])
          const grades = getFieldValue(['GRADES', 'GRADE_SPAN', 'GRADE_RANGE'])

          content += `<h3 style="margin: 0 0 10px 0; color: #0066cc;">${name || 'School'}</h3>`
          
          if (address || city || state) {
            content += '<div style="margin-bottom: 10px;">'
            if (address) content += `${address}<br>`
            if (city || state) content += `${city || ''}${city && state ? ', ' : ''}${state || ''}`
            content += '</div>'
          }

          content += '<table style="width: 100%; font-size: 14px;">'
          if (type) content += `<tr><td style="padding: 4px; font-weight: bold;">Type:</td><td>${type}</td></tr>`
          if (grades) content += `<tr><td style="padding: 4px; font-weight: bold;">Grades:</td><td>${grades}</td></tr>`
          if (enrollment) content += `<tr><td style="padding: 4px; font-weight: bold;">Enrollment:</td><td>${enrollment}</td></tr>`
          if (district) content += `<tr><td style="padding: 4px; font-weight: bold;">District:</td><td>${district}</td></tr>`
          content += '</table>'
        }
        
        // Fire Stations
        else if (layerNameLower.includes('fire') && layerNameLower.includes('station')) {
          const name = getFieldValue(['NAME', 'STATION_NAME', 'FACILITY_NAME', 'FIRE_STATION_NAME'])
          const address = getFieldValue(['ADDRESS', 'STREET', 'STREET_ADDRESS'])
          const city = getFieldValue(['CITY', 'CITY_NAME'])
          const state = getFieldValue(['STATE', 'STATE_NAME'])
          const dept = getFieldValue(['DEPARTMENT', 'FIRE_DEPT', 'DEPT_NAME', 'FIRE_DEPARTMENT'])
          const phone = getFieldValue(['PHONE', 'TELEPHONE', 'CONTACT_PHONE'])
          const type = getFieldValue(['TYPE', 'STATION_TYPE', 'FACILITY_TYPE'])

          content += `<h3 style="margin: 0 0 10px 0; color: #cc0000;">${name || 'Fire Station'}</h3>`
          
          if (address || city || state) {
            content += '<div style="margin-bottom: 10px;">'
            if (address) content += `${address}<br>`
            if (city || state) content += `${city || ''}${city && state ? ', ' : ''}${state || ''}`
            content += '</div>'
          }

          content += '<table style="width: 100%; font-size: 14px;">'
          if (dept) content += `<tr><td style="padding: 4px; font-weight: bold;">Department:</td><td>${dept}</td></tr>`
          if (phone) content += `<tr><td style="padding: 4px; font-weight: bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>`
          if (type) content += `<tr><td style="padding: 4px; font-weight: bold;">Type:</td><td>${type}</td></tr>`
          content += '</table>'
        }
        
        // Police Stations
        else if (layerNameLower.includes('police') || layerNameLower.includes('law enforcement')) {
          const name = getFieldValue(['NAME', 'STATION_NAME', 'FACILITY_NAME'])
          const address = getFieldValue(['ADDRESS', 'STREET', 'STREET_ADDRESS'])
          const city = getFieldValue(['CITY', 'CITY_NAME'])
          const state = getFieldValue(['STATE', 'STATE_NAME'])
          const agency = getFieldValue(['AGENCY', 'DEPARTMENT', 'AGENCY_NAME'])
          const phone = getFieldValue(['PHONE', 'TELEPHONE', 'CONTACT_PHONE'])

          content += `<h3 style="margin: 0 0 10px 0; color: #003366;">${name || 'Police Station'}</h3>`
          
          if (address || city || state) {
            content += '<div style="margin-bottom: 10px;">'
            if (address) content += `${address}<br>`
            if (city || state) content += `${city || ''}${city && state ? ', ' : ''}${state || ''}`
            content += '</div>'
          }

          content += '<table style="width: 100%; font-size: 14px;">'
          if (agency) content += `<tr><td style="padding: 4px; font-weight: bold;">Agency:</td><td>${agency}</td></tr>`
          if (phone) content += `<tr><td style="padding: 4px; font-weight: bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>`
          content += '</table>'
        }
        
        // Default for other layers - show the most relevant fields available
        else {
          // Try to find a name field
          const name = getFieldValue(['NAME', 'FACILITY_NAME', 'SITE_NAME', 'FACILITYNAME', 'LOCATION_NAME'])
          const type = getFieldValue(['TYPE', 'FACILITY_TYPE', 'FEATURE_TYPE', 'CLASS'])
          const address = getFieldValue(['ADDRESS', 'STREET', 'STREET_ADDRESS'])
          const city = getFieldValue(['CITY', 'CITY_NAME'])
          const state = getFieldValue(['STATE', 'STATE_NAME'])
          const status = getFieldValue(['STATUS', 'OPERATIONAL_STATUS'])
          const owner = getFieldValue(['OWNER', 'OWNERSHIP', 'OPERATOR'])
          const capacity = getFieldValue(['CAPACITY', 'SIZE', 'VOLUME'])
          
          content += `<h3 style="margin: 0 0 10px 0; color: #333;">${name || layer.name}</h3>`
          
          // Build a table with available fields
          const fields: Array<[string, string]> = []
          if (type) fields.push(['Type', type])
          if (address) fields.push(['Address', address])
          if (city || state) fields.push(['Location', `${city || ''}${city && state ? ', ' : ''}${state || ''}`])
          if (status) fields.push(['Status', status])
          if (owner) fields.push(['Owner/Operator', owner])
          if (capacity) fields.push(['Capacity', capacity])
          
          if (fields.length > 0) {
            content += '<table style="width: 100%; font-size: 14px;">'
            fields.forEach(([label, value]) => {
              content += `<tr><td style="padding: 4px; font-weight: bold;">${label}:</td><td>${value}</td></tr>`
            })
            content += '</table>'
          } else {
            // If no meaningful fields found, show what we have
            const nonSystemFields = Object.keys(attributes).filter(key => 
              !key.toLowerCase().includes('objectid') &&
              !key.toLowerCase().includes('globalid') &&
              !key.toLowerCase().includes('shape') &&
              !key.toLowerCase().includes('esri') &&
              attributes[key] && 
              attributes[key].toString().trim()
            ).slice(0, 5) // Show first 5 non-empty fields
            
            if (nonSystemFields.length > 0) {
              content += '<table style="width: 100%; font-size: 14px;">'
              nonSystemFields.forEach(field => {
                content += `<tr><td style="padding: 4px; font-weight: bold;">${field}:</td><td>${attributes[field]}</td></tr>`
              })
              content += '</table>'
            } else {
              content += '<p style="color: #666; font-style: italic;">Limited information available for this feature.</p>'
            }
          }
        }

        // Add data source
        content += `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          Source: ${layer.agency || 'Unknown'}
        </div>`
        
        content += '</div>'
        // Sanitize the entire content before returning
        return DOMPurify.sanitize(content, {
          ALLOWED_TAGS: ['div', 'h3', 'h4', 'p', 'table', 'tr', 'td', 'span', 'br', 'a'],
          ALLOWED_ATTR: ['style', 'href', 'class', 'tel']
        })
      },
      expressionInfos: [{
        name: "formatted-title",
        expression: `
          var name_fields = ['NAME', 'FIRE_NAME', 'INCIDENT_NAME', 'FACILITY_NAME', 'SITE_NAME', 'STATION_NAME', 'SCHOOL_NAME'];
          var result = '${layer.name}';
          
          for (var i = 0; i < Count(name_fields); i++) {
            if (HasKey($feature, name_fields[i]) && !IsEmpty($feature[name_fields[i]])) {
              result = $feature[name_fields[i]];
              break;
            }
          }
          
          return result;
        `
      }]
    }
  }

  useEffect(() => {
    // Add CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://js.arcgis.com/4.28/esri/themes/light/main.css'
    document.head.appendChild(link)

    // Load and initialize map
    const loadMap = async () => {
      const [Map, MapView] = await Promise.all([
        import('@arcgis/core/Map'),
        import('@arcgis/core/views/MapView')
      ])

      if (!mapDiv.current || mapInstance.current) return

      // Create map
      const map = new Map.default({
        basemap: 'streets-navigation-vector'
      })
      mapInstance.current = map

      // Create view
      const view = new MapView.default({
        container: mapDiv.current,
        map: map,
        center: [-98.5795, 39.8283], // Center of USA
        zoom: 4,
        popup: {
          dockEnabled: true,
          dockOptions: {
            position: 'bottom-right',
            breakpoint: false
          }
        }
      })
      viewInstance.current = view

      // Add widgets after view is ready
      view.when(async () => {
        const [Home, Search, Legend, BasemapGallery, Expand] = await Promise.all([
          import('@arcgis/core/widgets/Home'),
          import('@arcgis/core/widgets/Search'),
          import('@arcgis/core/widgets/Legend'),
          import('@arcgis/core/widgets/BasemapGallery'),
          import('@arcgis/core/widgets/Expand')
        ])

        // Add Home widget
        const homeWidget = new Home.default({ view })
        view.ui.add(homeWidget, 'top-left')

        // Add Search widget
        const searchWidget = new Search.default({ view })
        view.ui.add(searchWidget, 'top-right')

        // Add BasemapGallery widget
        const basemapGallery = new BasemapGallery.default({ view })
        const basemapExpand = new Expand.default({
          view: view,
          content: basemapGallery,
          expandIcon: 'basemap',
          expandTooltip: 'Change Basemap'
        })
        view.ui.add(basemapExpand, 'top-left')
        
        // Add Legend widget with proper configuration
        const legend = new Legend.default({ 
          view: view,
          layerInfos: [] // Start empty, will populate as layers load
        })
        
        const legendExpand = new Expand.default({
          view: view,
          content: legend,
          expandIcon: 'legend',
          expandTooltip: 'Layer Legend',
          expanded: false,
          mode: 'floating',
          group: 'bottom-right'
        })
        view.ui.add(legendExpand, 'bottom-right')
        
        // Store legend reference for later updates
        ;(window as any).__arcgisLegend = legend
      })
    }

    loadMap()

    return () => {
      if (viewInstance.current) {
        viewInstance.current.destroy()
        viewInstance.current = null
      }
      if (mapInstance.current) {
        mapInstance.current.destroy()
        mapInstance.current = null
      }
    }
  }, [])

  // Update layers when prop changes
  // Create choropleth renderer for demographic layers
  const createChoroplethRenderer = async (featureLayer: any) => {
    const [smartMapping, Color, SimpleFillSymbol] = await Promise.all([
      import('@arcgis/core/smartMapping/renderers/color'),
      import('@arcgis/core/Color'),
      import('@arcgis/core/symbols/SimpleFillSymbol')
    ])

    // Wait for layer to load to get field information
    await featureLayer.load()
    
    const layerName = featureLayer.title.toLowerCase()
    
    // Try to find the right numeric field for the demographic data
    const fields = featureLayer.fields || []
    let targetField = null
    
    // Look for likely field names based on layer name
    const fieldPatterns = {
      'population total': ['P0010001', 'Total_Population', 'TOTPOP', 'POP', 'B01001_001E', 'Total_Pop', 'POPULATION'],
      'population (total)': ['P0010001', 'Total_Population', 'TOTPOP', 'POP', 'B01001_001E'],
      'housing units': ['H0010001', 'Total_Housing_Units', 'TOTHU', 'HU', 'B25001_001E', 'Housing_Units', 'HOUSING'],
      'households': ['H0010001', 'Total_Households', 'TOTHH', 'HH', 'B11001_001E', 'Households', 'HOUSEHOLD'],
      'population density': ['Population_Density', 'POPDENS', 'Density', 'POP_DENS'],
      'median income': ['Median_Income', 'MEDHINC', 'B19013_001E', 'MED_INC', 'INCOME'],
      'poverty': ['Poverty_Rate', 'POVERTY', 'POV_RATE', 'B17001_001E'],
      '65 years': ['P0010001', 'Age_65_Plus', 'AGE65UP', 'OVER_65', 'B01001_025E'],
      'under 5': ['P0010001', 'Age_Under_5', 'AGE5DOWN', 'UNDER_5', 'B01001_003E'],
      'black': ['P0010004', 'Black_Population'],
      'hispanic': ['P0010002', 'Hispanic_Population'],
      'asian': ['P0010006', 'Asian_Population']
    }
    
    // Find matching pattern
    for (const [pattern, fieldNames] of Object.entries(fieldPatterns)) {
      if (layerName.includes(pattern)) {
        for (const fieldName of fieldNames) {
          const field = fields.find((f: any) => 
            f.name.toUpperCase() === fieldName.toUpperCase() && 
            (f.type === 'double' || f.type === 'integer' || f.type === 'single')
          )
          if (field) {
            targetField = field.name
            break
          }
        }
        if (targetField) break
      }
    }
    
    // If no specific field found, look for any numeric field with relevant keywords
    if (!targetField) {
      const numericFields = fields.filter((f: any) => 
        (f.type === 'double' || f.type === 'integer' || f.type === 'single') &&
        !f.name.toLowerCase().includes('objectid') &&
        !f.name.toLowerCase().includes('shape')
      )
      
      // Try to find a field with a relevant name
      for (const field of numericFields) {
        const fname = field.name.toLowerCase()
        if (fname.includes('total') || fname.includes('pop') || 
            fname.includes('hh') || fname.includes('hu') ||
            fname.includes('income') || fname.includes('density')) {
          targetField = field.name
          break
        }
      }
      
      // Last resort: use first numeric field
      if (!targetField && numericFields.length > 0) {
        targetField = numericFields[0].name
      }
    }
    
    if (!targetField) {
      console.log('No numeric field found for choropleth in', featureLayer.title)
      return null
    }

    // Define color schemes
    const colorSchemes = {
      population: {
        colors: [
          new Color.default([255, 255, 204, 0.8]), // Light yellow
          new Color.default([255, 237, 160, 0.8]), 
          new Color.default([254, 178, 76, 0.8]),  // Orange
          new Color.default([253, 141, 60, 0.8]),  
          new Color.default([240, 59, 32, 0.8]),   // Red
          new Color.default([189, 0, 38, 0.8])     // Dark red
        ]
      },
      income: {
        colors: [
          new Color.default([237, 248, 251, 0.8]), // Light blue
          new Color.default([178, 226, 226, 0.8]),
          new Color.default([102, 194, 164, 0.8]), // Teal
          new Color.default([44, 162, 95, 0.8]),   // Green
          new Color.default([0, 109, 44, 0.8])     // Dark green
        ]
      },
      density: {
        colors: [
          new Color.default([247, 252, 253, 0.8]), // Very light blue
          new Color.default([191, 211, 230, 0.8]),
          new Color.default([158, 188, 218, 0.8]),
          new Color.default([140, 150, 198, 0.8]), // Purple
          new Color.default([136, 65, 157, 0.8])   // Dark purple
        ]
      }
    }

    // Choose color scheme
    let colorScheme = colorSchemes.population
    if (layerName.includes('income')) colorScheme = colorSchemes.income
    else if (layerName.includes('density')) colorScheme = colorSchemes.density

    try {
      // Use smart mapping to create a color renderer
      const colorParams = {
        layer: featureLayer,
        field: targetField,
        view: viewInstance.current,
        colorScheme: colorScheme,
        outlineOptimizationEnabled: true,
        defaultSymbolEnabled: false
      }
      
      const response = await smartMapping.createColorRenderer(colorParams)
      console.log(`Applied choropleth to ${featureLayer.title} using field ${targetField}`)
      return response.renderer
    } catch (error) {
      console.error('Error creating color renderer:', error)
      return null
    }
  }

  useEffect(() => {
    const updateLayers = async () => {
      if (!mapInstance.current || !viewInstance.current) return

      const [FeatureLayer] = await Promise.all([
        import('@arcgis/core/layers/FeatureLayer')
      ])

      // Remove layers that are no longer selected
      const currentLayerUrls = new Set(layers.map(l => l.serviceUrl))
      layerRefs.current.forEach((layerInstance, url) => {
        if (!currentLayerUrls.has(url)) {
          mapInstance.current.remove(layerInstance)
          layerRefs.current.delete(url)
        }
      })

      // Add new layers
      for (const layer of layers) {
        if (layer.serviceUrl && !layerRefs.current.has(layer.serviceUrl)) {
          try {
            // Check if this is a demographic layer that needs choropleth rendering
            const isDemographicLayer = (
              layer.name.toLowerCase().includes('population') ||
              layer.name.toLowerCase().includes('housing') ||
              layer.name.toLowerCase().includes('household') ||
              layer.name.toLowerCase().includes('income') ||
              layer.name.toLowerCase().includes('poverty') ||
              layer.name.toLowerCase().includes('density') ||
              layer.name.toLowerCase().includes('65 years') ||
              layer.name.toLowerCase().includes('under 5') ||
              layer.name.toLowerCase().includes('black') ||
              layer.name.toLowerCase().includes('hispanic') ||
              layer.name.toLowerCase().includes('asian') ||
              layer.name.toLowerCase().includes('disability') ||
              layer.name.toLowerCase().includes('unemployment')
            ) && (
              layer.name.toLowerCase().includes('county') ||
              layer.name.toLowerCase().includes('tract') ||
              layer.name.toLowerCase().includes('total') ||
              layer.name.toLowerCase().includes('median') ||
              layer.name.toLowerCase().includes('density')
            )

            const featureLayerConfig: any = {
              url: layer.serviceUrl,
              title: layer.name,
              outFields: ["*"],
              popupEnabled: true,
              popupTemplate: createPopupTemplate(layer),
              // Ensure the renderer is loaded
              refreshInterval: 0.1 // This forces immediate rendering
            }

            const featureLayer = new FeatureLayer.default(featureLayerConfig)
            
            // Apply choropleth renderer for demographic layers after creation
            if (isDemographicLayer) {
              featureLayer.when(async () => {
                try {
                  const renderer = await createChoroplethRenderer(featureLayer)
                  if (renderer) {
                    featureLayer.renderer = renderer
                  }
                } catch (error) {
                  console.log('Using default renderer for', layer.name)
                }
              })
            }

            // Add layer to map immediately
            mapInstance.current.add(featureLayer)
            layerRefs.current.set(layer.serviceUrl, featureLayer)
            
            // Wait for layer to load then update legend
            featureLayer.when(() => {
              // Force legend to recognize the new layer
              if ((window as any).__arcgisLegend && viewInstance.current) {
                const legend = (window as any).__arcgisLegend
                // Update legend's layerInfos to include all operational layers
                const layerInfos = viewInstance.current.map.layers.items
                  .filter((layer: any) => layer.type === 'feature')
                  .map((layer: any) => ({ 
                    layer: layer,
                    title: layer.title
                  }))
                legend.layerInfos = layerInfos
              }
            }).catch((error: any) => {
              console.error(`Failed to load layer ${layer.name}:`, error)
            })

            // Don't auto-zoom - let user control the view
            // Some layers have global extents that zoom out too far
          } catch (error) {
            console.error(`Failed to add layer ${layer.name}:`, error)
          }
        }
      }
    }

    updateLayers()
  }, [layers, createPopupTemplate])

  return (
    <div className="relative h-full">
      <div ref={mapDiv} className="h-full w-full" />
      {layers.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-gray-500">Search and select layers to display on the map</p>
        </div>
      )}
    </div>
  )
})

export default MapView