# API Documentation

## Overview

The Asteroid Impact Simulator provides a RESTful API for simulating asteroid impact scenarios and testing mitigation strategies using real NASA data.

## Base URL

```
http://localhost:5000/api
```

## Authentication

No authentication required for public endpoints.

## Endpoints

### Get Asteroids
**GET** `/api/asteroids`

Fetch a list of near-Earth asteroids from NASA's database.

#### Query Parameters
- `limit` (integer, optional): Number of asteroids to return (default: 20, max: 100)
- `hazardous` (boolean, optional): Filter for potentially hazardous asteroids only
- `min_diameter` (float, optional): Minimum diameter in kilometers

#### Response
```json
{
  "asteroids": [
    {
      "id": "2000433",
      "name": "433 Eros",
      "diameter": 16.84,
      "is_potentially_hazardous": false,
      "close_approach_date": "2025-01-15"
    }
  ],
  "total": 1
}
```

#### Example Request
```bash
curl "http://localhost:5000/api/asteroids?limit=10&hazardous=true"
```

### Get Asteroid Details
**GET** `/api/asteroid/{asteroid_id}`

Fetch detailed information about a specific asteroid.

#### Path Parameters
- `asteroid_id` (string): NASA asteroid ID

#### Response
```json
{
  "id": "2000433",
  "name": "433 Eros",
  "orbital_elements": {
    "semi_major_axis": 1.458,
    "eccentricity": 0.222,
    "inclination": 10.829,
    "perihelion_distance": 1.133,
    "aphelion_distance": 1.783,
    "orbital_period": 643.219
  },
  "physical_properties": {
    "diameter_min": 16.84,
    "diameter_max": 16.84,
    "diameter_avg": 16.84
  },
  "is_potentially_hazardous": false
}
```

#### Example Request
```bash
curl "http://localhost:5000/api/asteroid/2000433"
```

### Simulate Impact
**POST** `/api/simulate/impact`

Simulate an asteroid impact scenario with physics calculations.

#### Request Body
```json
{
  "asteroid_id": "2000433",
  "impact_point": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "impact_angle": 45
}
```

#### Response
```json
{
  "impact_energy": 1.234e18,
  "tnt_equivalent": 295.2,
  "crater_diameter": 12.5,
  "devastation_radius": 45.8,
  "seismic_magnitude": 8.2,
  "tsunami_risk": {
    "high_risk": true,
    "wave_height": 25.3,
    "affected_coastlines": ["North America", "Europe"],
    "travel_time": {
      "North America": 2.5,
      "Europe": 4.2
    }
  },
  "impact_point": {
    "lat": 40.7128,
    "lon": -74.0060
  }
}
```

#### Example Request
```bash
curl -X POST "http://localhost:5000/api/simulate/impact" \
  -H "Content-Type: application/json" \
  -d '{
    "asteroid_id": "2000433",
    "impact_point": {"lat": 40.7128, "lon": -74.0060},
    "impact_angle": 45
  }'
```

### Simulate Mitigation
**POST** `/api/simulate/mitigation`

Simulate asteroid deflection using various mitigation strategies.

#### Request Body
```json
{
  "asteroid_data": {
    "id": "2000433",
    "name": "433 Eros",
    "diameter": 16.84,
    "velocity": 15.2,
    "density": 3000
  },
  "mitigation_strategy": "kinetic_impactor",
  "strategy_parameters": {
    "deflection_time": 365,
    "impactor_mass": 1000
  }
}
```

#### Response
```json
{
  "success": true,
  "miss_distance": 15000.5,
  "deflection_angle": 2.3,
  "new_trajectory": {
    "semi_major_axis": 1.460,
    "eccentricity": 0.225,
    "inclination": 10.829
  },
  "mission_requirements": {
    "impactor_mass": 1000,
    "impactor_velocity": 12.0,
    "launch_window": 335,
    "mission_duration": 365,
    "delta_v_required": 0.15
  }
}
```

#### Example Request
```bash
curl -X POST "http://localhost:5000/api/simulate/mitigation" \
  -H "Content-Type: application/json" \
  -d '{
    "asteroid_data": {
      "id": "2000433",
      "name": "433 Eros",
      "diameter": 16.84,
      "velocity": 15.2,
      "density": 3000
    },
    "mitigation_strategy": "kinetic_impactor",
    "strategy_parameters": {
      "deflection_time": 365,
      "impactor_mass": 1000
    }
  }'
```

### Get Preset Scenario
**GET** `/api/scenario/preset/{scenario_name}`

Fetch preset impact scenarios for testing and demonstration.

#### Path Parameters
- `scenario_name` (string): Scenario name (e.g., "impactor-2025")

#### Response
```json
{
  "name": "Impactor-2025",
  "description": "Hypothetical near-Earth asteroid threat",
  "diameter": 100,
  "velocity": 15,
  "density": 3000,
  "orbital_elements": {
    "semi_major_axis": 1.2,
    "eccentricity": 0.3,
    "inclination": 15
  },
  "threat_level": "high",
  "time_to_impact": 365
}
```

#### Example Request
```bash
curl "http://localhost:5000/api/scenario/preset/impactor-2025"
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid asteroid data"
}
```

### 404 Not Found
```json
{
  "error": "Asteroid not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- No rate limiting currently implemented
- NASA API has its own rate limits (1000 requests per hour)

## Data Sources

- **NASA NEO API**: Real-time asteroid orbital data
- **USGS**: Earthquake and elevation data for impact modeling
- **Scientific Literature**: Physics calculations and scaling laws

## Response Times

- Asteroid list: ~200ms
- Asteroid details: ~300ms
- Impact simulation: ~500ms
- Mitigation simulation: ~800ms

## Examples

### Complete Impact Simulation Workflow

1. **Get asteroid list**
```bash
curl "http://localhost:5000/api/asteroids?limit=5"
```

2. **Get specific asteroid details**
```bash
curl "http://localhost:5000/api/asteroid/2000433"
```

3. **Simulate impact**
```bash
curl -X POST "http://localhost:5000/api/simulate/impact" \
  -H "Content-Type: application/json" \
  -d '{
    "asteroid_id": "2000433",
    "impact_point": {"lat": 0, "lon": 0},
    "impact_angle": 45
  }'
```

4. **Test deflection strategy**
```bash
curl -X POST "http://localhost:5000/api/simulate/mitigation" \
  -H "Content-Type: application/json" \
  -d '{
    "asteroid_data": {...},
    "mitigation_strategy": "kinetic_impactor",
    "strategy_parameters": {
      "deflection_time": 365,
      "impactor_mass": 1000
    }
  }'
```

## SDK Examples

### Python
```python
import requests

# Get asteroid list
response = requests.get('http://localhost:5000/api/asteroids?limit=10')
asteroids = response.json()

# Simulate impact
impact_data = {
    'asteroid_id': '2000433',
    'impact_point': {'lat': 40.7128, 'lon': -74.0060},
    'impact_angle': 45
}
response = requests.post('http://localhost:5000/api/simulate/impact', json=impact_data)
result = response.json()
```

### JavaScript
```javascript
// Get asteroid list
fetch('/api/asteroids?limit=10')
  .then(response => response.json())
  .then(data => console.log(data.asteroids));

// Simulate impact
fetch('/api/simulate/impact', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    asteroid_id: '2000433',
    impact_point: {lat: 40.7128, lon: -74.0060},
    impact_angle: 45
  })
})
.then(response => response.json())
.then(result => console.log(result));
```
