#!/usr/bin/env python3
"""
FEMA Layer Discovery Script
This script tests all FEMA service endpoints to discover correct layer indices and data types.
"""

import requests
import json
import time
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Any

class FEMALayerTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'FEMA Layer Tester/1.0'
        })
        self.results = {}
        
    def test_service(self, service_url: str, service_name: str) -> Dict[str, Any]:
        """Test a single service endpoint to discover its layers."""
        print(f"\n{'='*60}")
        print(f"Testing: {service_name}")
        print(f"URL: {service_url}")
        print(f"{'='*60}")
        
        result = {
            'service_name': service_name,
            'base_url': service_url,
            'layers': [],
            'error': None,
            'response_time': 0
        }
        
        try:
            start_time = time.time()
            
            # Test the base service info
            info_url = service_url + "?f=json"
            response = self.session.get(info_url, timeout=30)
            response.raise_for_status()
            
            result['response_time'] = time.time() - start_time
            service_info = response.json()
            
            print(f"Service Type: {service_info.get('serviceDescription', 'Unknown')}")
            print(f"Copyright: {service_info.get('copyrightText', 'None')}")
            
            # Check if this service has layers
            if 'layers' in service_info:
                layers = service_info['layers']
                print(f"Found {len(layers)} layers:")
                
                for layer in layers:
                    layer_id = layer.get('id')
                    layer_name = layer.get('name', 'Unknown')
                    layer_type = layer.get('type', 'Unknown')
                    
                    print(f"  Layer {layer_id}: {layer_name} (Type: {layer_type})")
                    
                    # Test this specific layer
                    layer_result = self.test_layer(service_url, layer_id, layer_name)
                    result['layers'].append(layer_result)
                    
            elif 'tables' in service_info:
                # Some services might have tables instead of layers
                tables = service_info['tables']
                print(f"Found {len(tables)} tables:")
                for table in tables:
                    table_id = table.get('id')
                    table_name = table.get('name', 'Unknown')
                    print(f"  Table {table_id}: {table_name}")
                    
            else:
                # Single layer service - test layer 0
                print("Single layer service - testing layer 0")
                layer_result = self.test_layer(service_url, 0, service_name)
                result['layers'].append(layer_result)
                
        except Exception as e:
            result['error'] = str(e)
            print(f"ERROR: {e}")
            
        return result
    
    def test_layer(self, service_url: str, layer_id: int, layer_name: str) -> Dict[str, Any]:
        """Test a specific layer to see what data it contains."""
        layer_result = {
            'id': layer_id,
            'name': layer_name,
            'feature_count': 0,
            'sample_features': [],
            'field_names': [],
            'geometry_type': None,
            'error': None
        }
        
        try:
            # Build layer URL
            layer_url = f"{service_url}/{layer_id}"
            
            # Get layer info
            info_url = f"{layer_url}?f=json"
            response = self.session.get(info_url, timeout=30)
            response.raise_for_status()
            layer_info = response.json()
            
            # Get field information
            if 'fields' in layer_info:
                layer_result['field_names'] = [field.get('name') for field in layer_info['fields']]
                
            # Get geometry type
            layer_result['geometry_type'] = layer_info.get('geometryType', 'Unknown')
            
            print(f"    Fields: {', '.join(layer_result['field_names'][:10])}{'...' if len(layer_result['field_names']) > 10 else ''}")
            print(f"    Geometry: {layer_result['geometry_type']}")
            
            # Try to get a few sample features
            query_url = f"{layer_url}/query"
            params = {
                'where': '1=1',
                'outFields': '*',
                'returnGeometry': 'false',
                'resultRecordCount': 3,
                'f': 'json'
            }
            
            response = self.session.get(query_url, params=params, timeout=30)
            response.raise_for_status()
            query_result = response.json()
            
            if 'features' in query_result:
                features = query_result['features']
                layer_result['feature_count'] = len(features)
                
                # Extract sample data
                for feature in features[:3]:
                    attributes = feature.get('attributes', {})
                    # Get a few key attributes for identification
                    sample_data = {}
                    for key, value in list(attributes.items())[:5]:  # First 5 attributes
                        sample_data[key] = value
                    layer_result['sample_features'].append(sample_data)
                
                print(f"    Sample features: {layer_result['feature_count']}")
                for i, sample in enumerate(layer_result['sample_features']):
                    print(f"      Feature {i+1}: {dict(list(sample.items())[:3])}")
                    
        except Exception as e:
            layer_result['error'] = str(e)
            print(f"    ERROR testing layer {layer_id}: {e}")
            
        return layer_result
    
    def run_tests(self):
        """Run tests on all problematic services."""
        # Services to test based on the problematic layers mentioned
        services_to_test = [
            {
                'name': 'Medical Emergency Response (Fire/EMS/Law)',
                'url': 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Structures_Medical_Emergency_Response_v1/FeatureServer'
            },
            {
                'name': 'USA Schools',
                'url': 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Schools/FeatureServer'
            },
            {
                'name': 'USA Prison Boundaries',
                'url': 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Prison_Boundaries/FeatureServer'
            },
            {
                'name': 'USA Mobile Home Parks',
                'url': 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Mobile_Home_Parks/FeatureServer'
            },
            {
                'name': 'USA Healthcare Facilities',
                'url': 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Healthcare_Facilities/FeatureServer'
            }
        ]
        
        # Test each service
        for service in services_to_test:
            result = self.test_service(service['url'], service['name'])
            self.results[service['name']] = result
            time.sleep(1)  # Be polite to the servers
            
        return self.results
    
    def generate_report(self) -> str:
        """Generate a detailed report of findings."""
        report = []
        report.append("FEMA LAYER DISCOVERY REPORT")
        report.append("="*50)
        report.append("")
        
        for service_name, result in self.results.items():
            report.append(f"Service: {service_name}")
            report.append(f"URL: {result['base_url']}")
            
            if result['error']:
                report.append(f"ERROR: {result['error']}")
                report.append("")
                continue
                
            report.append(f"Response Time: {result['response_time']:.2f}s")
            report.append(f"Layers Found: {len(result['layers'])}")
            report.append("")
            
            for layer in result['layers']:
                report.append(f"  Layer {layer['id']}: {layer['name']}")
                report.append(f"    Geometry: {layer['geometry_type']}")
                report.append(f"    Fields: {len(layer['field_names'])} fields")
                if layer['field_names']:
                    report.append(f"    Key Fields: {', '.join(layer['field_names'][:5])}")
                    
                if layer['sample_features']:
                    report.append(f"    Sample Data:")
                    for i, sample in enumerate(layer['sample_features'][:2]):
                        report.append(f"      Record {i+1}: {sample}")
                        
                if layer['error']:
                    report.append(f"    ERROR: {layer['error']}")
                    
                report.append("")
                
            report.append("-" * 30)
            report.append("")
            
        return "\n".join(report)
    
    def generate_typescript_fixes(self) -> str:
        """Generate TypeScript code fixes for femaRaptLayers.ts."""
        fixes = []
        fixes.append("// CORRECTED FEMA LAYER CONFIGURATIONS")
        fixes.append("// Based on actual service endpoint testing")
        fixes.append("")
        
        # Analyze the results and generate fixes
        for service_name, result in self.results.items():
            if result['error']:
                fixes.append(f"// ERROR with {service_name}: {result['error']}")
                continue
                
            fixes.append(f"// {service_name}")
            fixes.append(f"// Base URL: {result['base_url']}")
            
            for layer in result['layers']:
                if not layer['error'] and layer['sample_features']:
                    # Determine what type of data this layer contains based on field names and sample data
                    layer_type = self.identify_layer_type(layer)
                    fixes.append(f"// Layer {layer['id']}: {layer['name']} - {layer_type}")
                    fixes.append(f"// Recommended URL: {result['base_url']}/{layer['id']}")
                    
            fixes.append("")
            
        return "\n".join(fixes)
    
    def identify_layer_type(self, layer: Dict[str, Any]) -> str:
        """Try to identify what type of facilities/data this layer contains."""
        field_names = [name.lower() for name in layer['field_names']]
        sample_data = layer['sample_features']
        
        # Look for keywords in field names and sample data
        if any('fire' in field for field in field_names):
            return "Fire Stations"
        elif any('hospital' in field for field in field_names):
            return "Hospitals"
        elif any('police' in field or 'law' in field for field in field_names):
            return "Law Enforcement"
        elif any('school' in field for field in field_names):
            return "Schools"
        elif any('prison' in field or 'correctional' in field for field in field_names):
            return "Prison Facilities"
        elif any('mobile' in field or 'trailer' in field for field in field_names):
            return "Mobile Home Parks"
        elif any('health' in field or 'medical' in field for field in field_names):
            return "Healthcare Facilities"
            
        # Check sample data values
        if sample_data:
            sample_text = str(sample_data).lower()
            if 'fire' in sample_text:
                return "Fire Stations"
            elif 'hospital' in sample_text:
                return "Hospitals"
            elif 'police' in sample_text or 'sheriff' in sample_text:
                return "Law Enforcement"
            elif 'school' in sample_text:
                return "Schools"
                
        return "Unknown Facility Type"

def main():
    """Main execution function."""
    print("FEMA Layer Discovery Tool")
    print("Testing service endpoints to discover correct layer configurations...")
    print()
    
    tester = FEMALayerTester()
    results = tester.run_tests()
    
    # Generate and save report
    report = tester.generate_report()
    with open('/Users/jefffranzen/fema-ai-interface/infrastructure-tool-v2/fema_layer_report.txt', 'w') as f:
        f.write(report)
    
    # Generate TypeScript fixes
    fixes = tester.generate_typescript_fixes()
    with open('/Users/jefffranzen/fema-ai-interface/infrastructure-tool-v2/fema_layer_fixes.ts', 'w') as f:
        f.write(fixes)
    
    print("\n" + "="*60)
    print("TESTING COMPLETE!")
    print("="*60)
    print(f"Report saved to: fema_layer_report.txt")
    print(f"TypeScript fixes saved to: fema_layer_fixes.ts")
    print("\nSUMMARY:")
    
    for service_name, result in results.items():
        if result['error']:
            print(f"❌ {service_name}: ERROR - {result['error']}")
        else:
            print(f"✅ {service_name}: {len(result['layers'])} layers found")
            for layer in result['layers']:
                if not layer['error'] and layer['sample_features']:
                    layer_type = tester.identify_layer_type(layer)
                    print(f"   - Layer {layer['id']}: {layer_type}")

if __name__ == "__main__":
    main()