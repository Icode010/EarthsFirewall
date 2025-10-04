# Data Directory

This directory contains sample datasets and data sources for the Asteroid Impact Simulator.

## Data Sources

### NASA NEO API Data
- **Source**: NASA Near-Earth Object Web Service API
- **API Key**: `uBrhRPrA8pXYDoMc0TOzdyFRkMmcyvGA1ZmMVqKM`
- **Endpoint**: https://api.nasa.gov/neo/rest/v1
- **Description**: Real-time asteroid orbital data, physical properties, and close approach information

### USGS Data
- **Earthquake Data**: https://earthquake.usgs.gov/earthquakes/search/
- **Elevation Data**: https://www.usgs.gov/programs/national-geospatial-program/national-map
- **Description**: Seismic and topographic data for impact modeling

### Sample Datasets
- `sample_asteroids.json` - Sample asteroid data for offline testing
- `usgs_elevation_data.json` - Sample USGS elevation data
- `impact_scenarios.json` - Preset impact scenarios

## Data Usage

### Real-time Data
The application fetches live data from NASA and USGS APIs during runtime.

### Offline Data
Sample datasets are provided for testing and demonstration purposes when APIs are unavailable.

## Data Processing

All data is processed through the backend API endpoints:
- `/api/asteroids` - Fetch asteroid list
- `/api/asteroid/<id>` - Get specific asteroid details
- `/api/simulate/impact` - Run impact simulation
- `/api/simulate/mitigation` - Test deflection strategies

## Data Validation

All input data is validated for:
- Physical realism (size, velocity, density ranges)
- Orbital mechanics (eccentricity, inclination limits)
- Impact parameters (angle, location validity)

## Privacy and Security

- API keys are stored in environment variables
- No personal data is collected or stored
- All data processing is done locally
- No data is transmitted to third parties
