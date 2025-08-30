# Export Guide: Web Map vs GeoJSON

## Quick Summary

- **Web Map JSON**: Creates a map configuration file that tells ArcGIS which layers to load from online services
- **GeoJSON**: Creates a file containing actual geographic features (points, lines, polygons) with data

## Web Map JSON (Blue Button - "Export Web Map")

### What it is:
- A configuration file that references online map services
- Does NOT contain actual geographic data
- Contains URLs pointing to where the data lives online
- Similar to a "playlist" that points to songs rather than containing the songs

### When to use:
- When you want to create an interactive web map in ArcGIS Online
- When layers should stay connected to their live data sources
- When you want others to see real-time updates from the source

### What happens in ArcGIS:
1. Upload as "Web Map" type
2. ArcGIS reads the configuration
3. ArcGIS connects to each layer's online service
4. Creates an interactive map that pulls live data

### Limitations:
- Requires internet connection to view data
- Only works if the referenced services are accessible
- No data is stored locally

## GeoJSON (Green Button - "Export GeoJSON")

### What it is:
- A data file containing actual geographic features
- Currently creates a bounding box (rectangle) showing the map extent
- Includes metadata about which layers were selected
- Does NOT fetch all features from layers (too slow/unreliable)

### When to use:
- When you need a simple geographic reference
- When you want to mark an area of interest
- When you need a file that works offline

### What happens in ArcGIS:
1. Upload as "GeoJSON" type
2. ArcGIS reads the geographic features
3. Creates a feature layer with the data
4. Shows a rectangle marking your area of interest

### Limitations:
- Currently only exports map extent, not actual layer features
- Static snapshot - doesn't update when source data changes
- Limited to simple geometries

## Key Differences

| Aspect | Web Map JSON | GeoJSON |
|--------|--------------|---------|
| Contains | Layer references/URLs | Actual geometry data |
| File size | Small (KB) | Variable |
| Requires internet | Yes (to see data) | No |
| Updates | Live from sources | Static snapshot |
| Use case | Interactive web maps | Data analysis/offline |

## Common Confusion Points

1. **Both are JSON files** - The file extension looks the same, but the content structure is completely different

2. **Neither auto-populates metadata** - You must manually enter title, summary, and tags in ArcGIS

3. **"Web Map" is not a map image** - It's instructions for building a map

4. **GeoJSON doesn't include all features** - Due to performance, we only export the extent rectangle