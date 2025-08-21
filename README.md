# Infrastructure Search Tool v2

An improved HIFLD infrastructure search and visualization tool with layer testing, categorization, and working status indicators.

## Features

- **Layer Testing**: Automatically tests each service endpoint to verify availability
- **Smart Categorization**: Layers organized by type (Emergency Services, Healthcare, Energy, etc.)
- **Status Indicators**: Visual indicators showing which layers are working, failed, or restricted
- **Advanced Filtering**: Filter by category, search by name/agency, show only working layers
- **Interactive Map**: Visualize working layers on an ArcGIS-powered map
- **Export Functionality**: Export map configurations for use in ArcGIS Online

## Live Demo

Visit: https://franzenjb.github.io/infrastructure-tool-v2/

## Layer Status Legend

- ✅ **Working**: Layer service is accessible and functioning
- ❌ **Failed**: Layer service returned an error or is unavailable
- 🔒 **Restricted**: Layer requires authentication (DUA/GII access)
- ❓ **No URL**: No service URL provided for this layer
- ⏳ **Untested**: Layer hasn't been tested yet

## Technology Stack

- Next.js 14 with TypeScript
- ArcGIS Maps SDK for JavaScript
- Tailwind CSS for styling
- GitHub Pages for hosting
- Automated layer testing with Node.js

## Local Development

```bash
# Install dependencies
npm install

# Process layer data from CSV
npm run process-data

# Test layer availability (tests first 100 layers)
npm run test-layers

# Run development server
npm run dev

# Build for production
npm run build
```

## Layer Categories

The tool automatically categorizes ~300 infrastructure layers into:
- Emergency Services (Fire, EMS, Police, EOCs)
- Healthcare (Hospitals, Medical Facilities, Nursing Homes)
- Education (Schools, Colleges, Universities)
- Energy (Power Plants, Transmission, Pipelines, Refineries)
- Transportation (Airports, Ports, Rail, Roads)
- Communications (Cell Towers, Broadcast, Antennas)
- Government (Federal, State, Military, Coast Guard)
- Critical Facilities (Prisons, Child Care, Mobile Homes)
- Maritime (Navigation, Marine, Waterways)
- Utilities (Water, Sewer, Waste)
- Boundaries (Borders, Districts, Regions)

## Data Sources

- HIFLD Open Infrastructure data
- ~300 infrastructure layers across multiple categories
- Real-time testing of ArcGIS REST service endpoints
- Automatic detection of authentication requirements

## Statistics

Based on automated testing:
- Total Layers: 305
- Working: 46+ (publicly accessible)
- Restricted: 51 (require GII/DUA access)
- Various categories with different availability rates

## Deployment

The application automatically deploys to GitHub Pages when pushing to the main branch via GitHub Actions.

## Environment Variables

Create `.env.local` for local development:
```
NEXT_PUBLIC_ARCGIS_API_KEY=your_api_key_here
```

## Contact

Questions or comments: jeff.franzen2@redcross.org