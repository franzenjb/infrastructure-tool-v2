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

# Deploy to GitHub Pages (happens automatically via GitHub Actions on push to main)
git push origin main
```

## Data Processing Pipeline Architecture

The application uses a three-stage data processing pipeline that must be understood to make architectural changes:

### Stage 1: CSV Processing (`scripts/process-data.js`)
1. Reads `public/HIFLD_Open_Crosswalk_Geoplatform.csv` (305 infrastructure layers)
2. Categorizes layers based on keywords in layer names
3. Outputs `public/processed-layers.json` with structure:
   - `layers`: Array of all layers with categories
   - `categorized`: Layers grouped by category
   - `stats`: Summary statistics

### Stage 2: Layer Testing (`scripts/test-layers.js`)
1. Reads `processed-layers.json`
2. Tests each layer's service endpoint with lenient validation:
   - Accepts ANY 200 response as working
   - Tries multiple URL formats (plain, ?f=json, ?f=pjson)
   - 10-second timeout per request
3. Outputs `public/layer-test-results.json` with:
   - `results`: All layers with test status
   - `stats`: Working/failed/restricted counts
   - Test statuses: 'working', 'failed', 'restricted', 'no_url', 'timeout', 'unreachable'

### Stage 3: Runtime Loading
The React app (`src/app/page.tsx`) loads data in priority order:
1. First tries `/layer-test-results.json` (has test results)
2. Falls back to `/processed-layers.json` (no test results)
3. All filtering/searching happens client-side on loaded data

## Component Architecture

### State Management Flow
All state lives in `src/app/page.tsx` and flows down through props:

```
page.tsx (orchestrator)
├── State: allLayers, filteredLayers, selectedLayers, filters
├── Data loading: loadLayerData() → fetch JSON files
└── Components:
    ├── SearchBar → updates searchQuery state
    ├── Category dropdown → updates selectedCategory state  
    ├── LayerList → displays filteredLayers, calls onAddLayer
    ├── MapView → renders selectedLayers on ArcGIS map
    ├── ExportMapButton → exports Web Map JSON config
    └── ExportGeoJSONButton → exports GeoJSON extent
```

### Layer Selection Flow
1. User interacts with LayerList component
2. LayerList calls `onAddLayer(layer)` callback
3. page.tsx adds to `selectedLayers` state
4. MapView re-renders with new layers
5. Only layers with `testStatus === 'working'` are sent to MapView

## Export Functionality

The app provides two export formats for ArcGIS Online:

### Web Map JSON (Blue Button)
- Creates a configuration file with layer references/URLs
- Does NOT contain actual geographic data
- Tells ArcGIS which online services to connect to
- Use when: Creating interactive maps with live data connections

### GeoJSON (Green Button)
- Creates a file with actual geographic features
- Currently exports map extent as a polygon
- Converts Web Mercator coordinates to WGS84
- Use when: Need a simple geographic reference or area marker

## Key Architectural Decisions

### Why Node.js Scripts Instead of API Routes
- GitHub Pages deployment requires static export (`output: 'export'`)
- Static export disables Next.js API routes and middleware
- Data processing happens at build time, not runtime
- Results are served as static JSON files

### Layer Testing Strategy
The test script (`scripts/test-layers.js`) is intentionally lenient:
- Previous strict validation rejected many working layers
- Now accepts ANY 200 HTTP response
- Tests all 305 layers (not just first 100)
- Results: 254 working, 51 restricted, 0 failed

### Deployment Configuration
`next.config.js` uses environment-based configuration:
```javascript
output: 'export',
basePath: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2' : '',
assetPrefix: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2/' : '',
```

## Critical Files and Their Roles

- `public/HIFLD_Open_Crosswalk_Geoplatform.csv` - Source data, DO NOT MODIFY
- `public/processed-layers.json` - Generated by process-data.js
- `public/layer-test-results.json` - Generated by test-layers.js  
- `lib/layerCategories.ts` - Category definitions and categorization logic
- `src/app/page.tsx` - Main orchestrator, all state management
- `src/components/LayerList.tsx` - Renders categorized layers with status indicators
- `src/components/MapView.tsx` - ArcGIS map integration, dynamic imports for performance
- `src/components/ExportMapButton.tsx` - Web Map JSON export
- `src/components/ExportGeoJSONButton.tsx` - GeoJSON export

## Testing Results (Current)

After running `npm run test-layers`:
- Total Layers: 305
- ✅ Working: 254 (83%)
- 🔒 Restricted: 51 (17%)
- ❌ Failed: 0

## Known Constraints

1. **No middleware with static export** - Password protection disabled for GitHub Pages
2. **CORS limitations** - Some layers fail client-side despite passing server tests
3. **Large initial load** - All 305 layers loaded into memory on app start
4. **No server-side filtering** - All search/filter operations are client-side
5. **ArcGIS title restrictions** - Titles cannot contain colons
6. **GeoJSON limitations** - Exports only map extent, not all layer features

## ArcGIS Online Import Guidelines

### For Web Map JSON:
1. Select file type: "Web Map" (NOT GeoJSON)
2. Manually enter title (no colons), summary, and tags
3. Creates interactive map with live data connections

### For GeoJSON:
1. Select file type: "GeoJSON" (NOT Web Map)  
2. Manually enter title (no colons), summary, and tags
3. Creates feature layer with extent polygon

## Default Settings

- **"Working layers only" checkbox**: Checked by default (shows only verified working layers)
- **Auto-generated titles**: Use dashes instead of colons for ArcGIS compatibility
- **Map view**: Defaults to USA bounds if no extent available