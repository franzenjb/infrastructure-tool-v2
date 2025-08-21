import axios from 'axios'

export interface TestResult {
  url: string
  status: 'working' | 'failed' | 'cors' | 'timeout'
  responseTime?: number
  error?: string
  metadata?: any
}

export async function testLayerService(serviceUrl: string): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Test if service responds to a basic query
    const testUrl = serviceUrl.includes('?') 
      ? `${serviceUrl}&f=json` 
      : `${serviceUrl}?f=json`
    
    const response = await axios.get(testUrl, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    const responseTime = Date.now() - startTime
    
    // Check if we got valid JSON response
    if (response.data && (response.data.type || response.data.layers || response.data.geometryType)) {
      return {
        url: serviceUrl,
        status: 'working',
        responseTime,
        metadata: {
          type: response.data.type,
          geometryType: response.data.geometryType,
          name: response.data.name
        }
      }
    }
    
    return {
      url: serviceUrl,
      status: 'failed',
      error: 'Invalid service response'
    }
    
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return {
        url: serviceUrl,
        status: 'timeout',
        error: 'Service timeout'
      }
    }
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      return {
        url: serviceUrl,
        status: 'failed',
        error: 'Authentication required'
      }
    }
    
    // Check for CORS errors (these will be caught on client-side)
    if (error.message?.includes('Network Error') || !error.response) {
      return {
        url: serviceUrl,
        status: 'cors',
        error: 'CORS or network error'
      }
    }
    
    return {
      url: serviceUrl,
      status: 'failed',
      error: error.message || 'Unknown error'
    }
  }
}

// Batch test multiple layers
export async function testMultipleLayers(
  layers: Array<{ name: string; serviceUrl: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, TestResult>> {
  const results = new Map<string, TestResult>()
  
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    
    if (onProgress) {
      onProgress(i + 1, layers.length)
    }
    
    const result = await testLayerService(layer.serviceUrl)
    results.set(layer.name, result)
    
    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}