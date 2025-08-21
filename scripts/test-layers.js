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
    // Try multiple URL formats
    const urls = [
      layer.serviceUrl,
      layer.serviceUrl.includes('?') ? `${layer.serviceUrl}&f=json` : `${layer.serviceUrl}?f=json`,
      layer.serviceUrl.includes('?') ? `${layer.serviceUrl}&f=pjson` : `${layer.serviceUrl}?f=pjson`
    ]
    
    console.log(`Testing ${layer.name}...`)
    
    for (const testUrl of urls) {
      try {
        const response = await axios.get(testUrl, {
          timeout: 10000, // Increased timeout to 10 seconds
          headers: {
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          validateStatus: function (status) {
            return true // Accept any status to check it
          }
        })
        
        // Much more lenient - if we get ANY successful response, mark as working
        if (response.status === 200 || response.status === 201) {
          return {
            ...layer,
            testStatus: 'working',
            testMetadata: {
              responseType: typeof response.data,
              hasData: !!response.data,
              url: testUrl
            },
            lastTested: new Date().toISOString()
          }
        }
        
        // Also accept redirects and other 2xx/3xx codes
        if (response.status >= 200 && response.status < 400) {
          return {
            ...layer,
            testStatus: 'working',
            testNote: `HTTP ${response.status}`,
            lastTested: new Date().toISOString()
          }
        }
        
        // If 403/401, it's restricted
        if (response.status === 403 || response.status === 401) {
          return {
            ...layer,
            testStatus: 'restricted',
            testError: 'Authentication required',
            lastTested: new Date().toISOString()
          }
        }
        
      } catch (innerError) {
        // Try next URL format
        continue
      }
    }
    
    // If none of the URLs worked, mark as failed
    return {
      ...layer,
      testStatus: 'failed',
      testError: 'Could not connect to service',
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
  
  // Test ALL layers this time, not just first 100
  const layersToTest = data.layers
  
  console.log(`Testing ${layersToTest.length} layers...`)
  console.log('This will be more lenient - accepting any 200 response as working')
  
  for (let i = 0; i < layersToTest.length; i += batchSize) {
    const batch = layersToTest.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(testLayer))
    results.push(...batchResults)
    
    console.log(`Progress: ${Math.min(i + batchSize, layersToTest.length)}/${layersToTest.length}`)
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 200))
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