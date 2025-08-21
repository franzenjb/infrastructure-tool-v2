const fs = require('fs')
const path = require('path')
const axios = require('axios')

// Load processed layers
const dataPath = path.join(__dirname, '..', 'public', 'processed-layers.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

async function testLayer(layer) {
  if (!layer.serviceUrl) {
    return {
      ...layer,
      testStatus: 'no_url',
      testError: 'No service URL provided'
    }
  }
  
  // Skip restricted layers
  if (layer.requiresDUA || layer.requiresGII) {
    return {
      ...layer,
      testStatus: 'restricted',
      testError: 'Requires authentication'
    }
  }
  
  try {
    const testUrl = layer.serviceUrl.includes('?') 
      ? `${layer.serviceUrl}&f=json` 
      : `${layer.serviceUrl}?f=json`
    
    console.log(`Testing ${layer.name}...`)
    
    const response = await axios.get(testUrl, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; InfrastructureToolTester/1.0)'
      },
      validateStatus: function (status) {
        return status < 500 // Accept any status less than 500
      }
    })
    
    if (response.status === 200 && response.data) {
      // Check if it's a valid ArcGIS response
      if (response.data.type || response.data.layers || response.data.geometryType || response.data.fields) {
        return {
          ...layer,
          testStatus: 'working',
          testMetadata: {
            type: response.data.type || response.data.geometryType,
            name: response.data.name,
            layerCount: response.data.layers?.length
          },
          lastTested: new Date().toISOString()
        }
      }
    }
    
    return {
      ...layer,
      testStatus: 'failed',
      testError: `Invalid response: status ${response.status}`,
      lastTested: new Date().toISOString()
    }
    
  } catch (error) {
    let errorType = 'failed'
    let errorMessage = error.message
    
    if (error.code === 'ECONNABORTED') {
      errorType = 'timeout'
      errorMessage = 'Request timeout'
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorType = 'unreachable'
      errorMessage = 'Service unreachable'
    } else if (error.response?.status === 403 || error.response?.status === 401) {
      errorType = 'auth_required'
      errorMessage = 'Authentication required'
    }
    
    return {
      ...layer,
      testStatus: errorType,
      testError: errorMessage,
      lastTested: new Date().toISOString()
    }
  }
}

async function testAllLayers() {
  const results = []
  const batchSize = 5 // Test 5 layers at a time
  
  // Test only a subset first for demo
  const layersToTest = data.layers.slice(0, 100) // Test first 100 layers
  
  console.log(`Testing ${layersToTest.length} layers...`)
  
  for (let i = 0; i < layersToTest.length; i += batchSize) {
    const batch = layersToTest.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(testLayer))
    results.push(...batchResults)
    
    console.log(`Progress: ${Math.min(i + batchSize, layersToTest.length)}/${layersToTest.length}`)
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Categorize results
  const categorized = {}
  const stats = {
    total: results.length,
    working: results.filter(l => l.testStatus === 'working').length,
    failed: results.filter(l => l.testStatus === 'failed').length,
    restricted: results.filter(l => l.testStatus === 'restricted').length,
    no_url: results.filter(l => l.testStatus === 'no_url').length,
    timeout: results.filter(l => l.testStatus === 'timeout').length,
    unreachable: results.filter(l => l.testStatus === 'unreachable').length,
    auth_required: results.filter(l => l.testStatus === 'auth_required').length
  }
  
  // Group by category
  for (const layer of results) {
    if (!categorized[layer.category]) {
      categorized[layer.category] = []
    }
    categorized[layer.category].push(layer)
  }
  
  // Write test results
  const outputPath = path.join(__dirname, '..', 'public', 'layer-test-results.json')
  fs.writeFileSync(outputPath, JSON.stringify({
    results: results,
    categorized: categorized,
    stats: stats,
    testDate: new Date().toISOString()
  }, null, 2))
  
  console.log('\nTest Results:')
  console.log('-------------')
  console.log(`✅ Working: ${stats.working}`)
  console.log(`❌ Failed: ${stats.failed}`)
  console.log(`🔒 Restricted: ${stats.restricted}`)
  console.log(`⏱️ Timeout: ${stats.timeout}`)
  console.log(`🚫 Unreachable: ${stats.unreachable}`)
  console.log(`🔑 Auth Required: ${stats.auth_required}`)
  console.log(`❓ No URL: ${stats.no_url}`)
  console.log('\nResults saved to:', outputPath)
}

// Run tests
testAllLayers().catch(console.error)