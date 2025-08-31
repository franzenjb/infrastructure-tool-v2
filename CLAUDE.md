# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔗 CRITICAL REQUIREMENT: ALWAYS PROVIDE LOCALHOST LINK

**AFTER RUNNING `npm run dev`, ALWAYS PROVIDE THIS LINK TO THE USER:**
### http://localhost:3000

This is a standard 100% requirement for ALL projects. Never omit the localhost link.

## 🚀 DEPLOYMENT PROCESS - STANDARD FOR ALL PROJECTS

### GitHub Pages Deployment
When deploying to GitHub Pages, ALWAYS provide these links to the user:

1. **Live Site URL**: https://franzenjb.github.io/infrastructure-tool-v2/
2. **Deployment Status**: https://github.com/franzenjb/infrastructure-tool-v2/actions
3. **Expected Time**: 2-5 minutes for deployment to complete

### Deployment Steps
```bash
# 1. Build the project
npm run build

# 2. Commit all changes
git add -A
git commit -m "Descriptive commit message"

# 3. Push to GitHub (triggers automatic deployment)
git push origin main

# 4. ALWAYS inform the user:
#    - Deployment is in progress
#    - Provide the actions link to check status
#    - Mention the 2-5 minute wait time
```

### Checking Deployment Status
```bash
# Check latest deployment status via GitHub CLI
gh api repos/franzenjb/infrastructure-tool-v2/actions/runs --jq '.workflow_runs[0] | {status: .status, conclusion: .conclusion, created_at: .created_at, html_url: .html_url}'
```

## Commands

```bash
# Install dependencies
npm install

# Process CSV data into categorized JSON (required before first run)
npm run process-data

# Test all layer endpoints for availability (updates layer-test-results.json)
npm run test-layers

# Start development server
npm run dev
# THEN ALWAYS PROVIDE: http://localhost:3000

# Build for production
npm run build

# Run linter
npm run lint

# Test FEMA layers (Python script for debugging)
python fema_layer_tester.py
```

## Data Architecture

### Dual Data Source System
The application integrates two distinct data sources:

1. **HIFLD Layers** (305 layers)
   - Source: `public/HIFLD_Open_Crosswalk_Geoplatform.csv`
   - Processing: `scripts/process-data.js` → `public/processed-layers.json`
   - Testing: `scripts/test-layers.js` → `public/layer-test-results.json`
   - Working: 254 layers (83%)

2. **FEMA RAPT Layers** (121 layers)
   - Source: `lib/femaRaptLayers.ts` (hardcoded from FEMA RAPT tool analysis)
   - No processing needed - direct TypeScript import
   - Working: 62 layers (51%)
   - Categories: Infrastructure, Healthcare, Education, Hazards, Demographics

### Data Processing Pipeline (HIFLD only)

#### Stage 1: CSV Processing (`scripts/process-data.js`)
1. Reads `public/HIFLD_Open_Crosswalk_Geoplatform.csv`
2. Categorizes layers based on keywords in layer names
3. Outputs `public/processed-layers.json` with structure:
   - `layers`: Array of all layers with categories
   - `categorized`: Layers grouped by category
   - `stats`: Summary statistics

#### Stage 2: Layer Testing (`scripts/test-layers.js`)
1. Reads `processed-layers.json`
2. Tests each layer's service endpoint with lenient validation
3. Outputs `public/layer-test-results.json` with test statuses

#### Stage 3: Runtime Loading
The React app (`src/app/page.tsx`) loads:
- HIFLD data from JSON files
- FEMA data from TypeScript import

## Component Architecture

### State Management Flow
All state lives in `src/app/page.tsx` and flows down through props:

```
page.tsx (orchestrator)
├── State: allLayers, filteredLayers, selectedLayers, activeTab
├── Data loading: 
│   ├── HIFLD: loadLayerData() → fetch JSON files
│   └── FEMA: Direct import from femaRaptLayers.ts
└── Components:
    ├── Tab Switcher (HIFLD | FEMA RAPT)
    ├── HIFLD Tab:
    │   ├── SearchBar → updates searchQuery
    │   ├── Category dropdown → filters by category
    │   └── LayerList → displays HIFLD layers
    ├── FEMATab:
    │   ├── Search → filters FEMA layers
    │   ├── Category dropdown → filters by category
    │   └── Layer cards → displays FEMA layers
    └── MapView → renders selected layers from both sources
```

### Layer ID Compatibility
The `EnhancedLayer` interface supports both:
- `id: number` for HIFLD layers
- `id: string` for FEMA layers

This allows both layer types to coexist in `selectedLayers` state.

## Key Files

### Core Application
- `src/app/page.tsx` - Main orchestrator, manages both HIFLD and FEMA layers
- `src/components/FEMATab.tsx` - FEMA RAPT layer interface
- `src/components/LayerList.tsx` - HIFLD layer interface
- `src/components/MapView.tsx` - ArcGIS map integration for both layer types

### Data Files
- `public/HIFLD_Open_Crosswalk_Geoplatform.csv` - HIFLD source data (DO NOT MODIFY)
- `lib/femaRaptLayers.ts` - FEMA RAPT layer definitions (121 layers)
- `public/processed-layers.json` - Generated HIFLD data
- `public/layer-test-results.json` - HIFLD test results

### Scripts
- `scripts/process-data.js` - HIFLD CSV processor
- `scripts/test-layers.js` - HIFLD endpoint tester
- `fema_layer_tester.py` - FEMA layer debugging tool

## FEMA Layer Categories

The FEMA RAPT integration includes:
- **Infrastructure**: Fire stations, law enforcement, utilities
- **Healthcare**: Hospitals, urgent care, pharmacies, nursing homes
- **Education**: Schools, colleges, technical schools
- **Demographics**: County/tract population, income, vulnerability metrics
- **Hazards**: Wildfire, flood, earthquake, weather
- **Weather**: Real-time radar, watches/warnings

## Known Issues and Constraints

### Technical Limitations
1. **Static Export**: GitHub Pages requires static export - no API routes
2. **CORS**: Some layers fail client-side despite passing server tests
3. **Large Data**: All layers loaded into memory on app start
4. **Choropleth Rendering**: Demographic layers show solid colors in local viewer (work correctly in ArcGIS Online)

### ArcGIS Constraints
- Titles cannot contain colons (use dashes instead)
- GeoJSON exports only map extent, not all features
- Some layers require zoom levels to display

## Deployment Configuration

`next.config.js` uses environment-based configuration:
```javascript
output: 'export',
basePath: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2' : '',
assetPrefix: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2/' : ''
```

## Testing and Validation

### Current Statistics
- **HIFLD**: 305 total, 254 working (83%), 51 restricted (17%)
- **FEMA**: 121 total, 62 working (51%), 59 broken (49%)
- **Combined**: 426 layers, 316 working (74%)

### Layer Testing Strategy
- Lenient validation: Accept ANY 200 HTTP response
- Multiple URL format attempts
- 10-second timeout per request
- Categorize failures: restricted, timeout, unreachable

## Default UI Settings

- **"Working layers only" checkbox**: Checked by default
- **Tab selection**: HIFLD tab active by default
- **Map view**: Defaults to USA bounds
- **Selected layers panel**: Shows on both HIFLD and FEMA tabs