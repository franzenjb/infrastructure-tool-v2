// FEMA RAPT Common Layers
export const femaLayers = [
  {
    id: 'fema_mobile_home_parks',
    name: 'Mobile Home Parks',
    category: 'Housing',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/USA_Mobile_Home_Parks_v1/FeatureServer/0',
    agency: 'FEMA / Lightbox',
    description: 'Mobile and manufactured home communities across the United States',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_flood_hazard',
    name: 'FEMA Flood Hazard Areas',
    category: 'Hazards',
    serviceUrl: 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28',
    agency: 'FEMA',
    description: 'National Flood Hazard Layer - flood zones and base flood elevations',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_hospitals',
    name: 'Hospitals (FEMA)',
    category: 'Healthcare',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Hospitals_v1/FeatureServer/0',
    agency: 'FEMA / HIFLD',
    description: 'Hospital locations with bed count and emergency services info',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_fire_stations',
    name: 'Fire Stations (FEMA)',
    category: 'Emergency Services',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Fire_Stations_v1/FeatureServer/0',
    agency: 'FEMA / HIFLD',
    description: 'Fire station locations across the United States',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_nursing_homes',
    name: 'Nursing Homes',
    category: 'Healthcare',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Nursing_Homes_v1/FeatureServer/0',
    agency: 'FEMA / HIFLD',
    description: 'Licensed nursing home facilities',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_public_schools',
    name: 'Public Schools (FEMA)',
    category: 'Education',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Public_Schools_v1/FeatureServer/0',
    agency: 'FEMA / NCES',
    description: 'Public elementary and secondary schools',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_power_plants',
    name: 'Power Plants (FEMA)',
    category: 'Energy',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Power_Plants_v1/FeatureServer/0',
    agency: 'FEMA / EIA',
    description: 'Electric power generation facilities',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_airports',
    name: 'Airports (FEMA)',
    category: 'Transportation',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Airports_v1/FeatureServer/0',
    agency: 'FEMA / FAA',
    description: 'Public and private airports',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_emergency_shelters',
    name: 'National Shelter System Facilities',
    category: 'Emergency Services',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/NSS_Facilities_v1/FeatureServer/0',
    agency: 'FEMA / Red Cross',
    description: 'Emergency shelter locations from National Shelter System',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_pharmacies',
    name: 'Pharmacies',
    category: 'Healthcare',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Pharmacies_v1/FeatureServer/0',
    agency: 'FEMA / HIFLD',
    description: 'Retail pharmacy locations',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_urgent_care',
    name: 'Urgent Care Facilities',
    category: 'Healthcare',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Urgent_Care_Facilities_v1/FeatureServer/0',
    agency: 'FEMA / HIFLD',
    description: 'Walk-in urgent care clinic locations',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_dialysis',
    name: 'Dialysis Centers',
    category: 'Healthcare',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Dialysis_Centers_v1/FeatureServer/0',
    agency: 'FEMA / CMS',
    description: 'Medicare-certified dialysis facilities',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_assisted_living',
    name: 'Assisted Living Facilities',
    category: 'Healthcare',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Assisted_Living_Facilities_v1/FeatureServer/0',
    agency: 'FEMA / HIFLD',
    description: 'Assisted living and residential care facilities',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_disaster_declarations',
    name: 'Disaster Declarations',
    category: 'Hazards',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/Disaster_Declarations_Summary_v2/FeatureServer/0',
    agency: 'FEMA',
    description: 'Historical presidential disaster declarations by county',
    status: 'Public',
    testStatus: 'working'
  },
  {
    id: 'fema_social_vulnerability',
    name: 'Social Vulnerability Index',
    category: 'Demographics',
    serviceUrl: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/CDC_SVI_2020_US_v1/FeatureServer/0',
    agency: 'CDC / ATSDR',
    description: 'CDC Social Vulnerability Index by census tract',
    status: 'Public',
    testStatus: 'working'
  }
]

export const femaCategories = [
  'All',
  'Emergency Services',
  'Healthcare',
  'Education',
  'Energy',
  'Transportation',
  'Housing',
  'Hazards',
  'Demographics'
]